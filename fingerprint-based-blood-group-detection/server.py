import os
import sys
import io
import base64
import glob
import logging
import warnings
import subprocess
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.imagenet_utils import preprocess_input
except ImportError:
    from tf_keras.models import load_model
    from tf_keras.applications.imagenet_utils import preprocess_input

# Setup Flask
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Constants & Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'test', 'model_blood_group_detection_resnet.h5')
DATASET_DIR = os.path.join(BASE_DIR, 'dataset', 'dataset_blood_group')

LABELS = {0: 'A+', 1: 'A-', 2: 'AB+', 3: 'AB-', 4: 'B+', 5: 'B-', 6: 'O+', 7: 'O-'}

# Global Model Reference
model = None

def get_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        print(f"[Backend] Loading ML model from {MODEL_PATH} ...")
        model = load_model(MODEL_PATH)
        print("[Backend] Model loaded successfully!")
    return model

def process_and_predict(pil_img: Image.Image):
    loaded_model = get_model()
    # Convert image to RGB and resize to (256, 256)
    rgb_img = pil_img.convert('RGB').resize((256, 256))
    x = np.array(rgb_img, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    preds = loaded_model.predict(x, verbose=0)[0]
    pred_idx = int(np.argmax(preds))
    pred_label = LABELS[pred_idx]
    confidence = float(preds[pred_idx] * 100)

    probabilities = {LABELS[i]: float(round(preds[i] * 100, 2)) for i in range(len(LABELS))}
    return pred_label, round(confidence, 2), probabilities

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "service": "BE+ Fingerprint Blood Group AI Engine",
        "model": "ResNet34 Blood Group Classifier",
        "supported_groups": list(LABELS.values()),
        "dataset_dir": DATASET_DIR
    })

@app.route('/api/pick-image', methods=['GET', 'POST'])
def pick_image_dialog():
    """Opens native Windows file picker directly at dataset_blood_group directory."""
    try:
        picker_script = os.path.join(BASE_DIR, 'picker.py')
        python_exe = sys.executable

        # Run standalone GUI picker process
        res = subprocess.run(
            [python_exe, picker_script, DATASET_DIR],
            capture_output=True,
            text=True,
            timeout=120
        )

        output = res.stdout.strip()
        if not output or output == "CANCELLED" or not os.path.exists(output):
            return jsonify({
                "success": False,
                "cancelled": True
            })

        file_path = output
        with open(file_path, "rb") as f:
            img_bytes = f.read()
            b64 = base64.b64encode(img_bytes).decode('utf-8')

        ext = os.path.splitext(file_path)[1].lower().replace('.', '')
        mime = "image/bmp" if ext == "bmp" else f"image/{ext}"
        data_url = f"data:{mime};base64,{b64}"

        return jsonify({
            "success": True,
            "cancelled": False,
            "filePath": file_path,
            "fileName": os.path.basename(file_path),
            "dataUrl": data_url
        })
    except Exception as e:
        print(f"[Error in file picker subprocess] {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/predict', methods=['POST'])
@app.route('/predict', methods=['POST'])
def predict_endpoint():
    try:
        pil_image = None
        filename = "fingerprint_upload"

        # Check if multipart form-data image file was sent
        if 'image' in request.files or 'file' in request.files:
            file = request.files.get('image') or request.files.get('file')
            if file and file.filename:
                filename = file.filename
                image_bytes = file.read()
                pil_image = Image.open(io.BytesIO(image_bytes))

        # Check if JSON payload with base64 image data URL was sent
        elif request.is_json:
            data = request.get_json()
            image_data = data.get('image') or data.get('imageDataUrl') or data.get('file')
            if image_data:
                filename = data.get('fileName', 'uploaded_fingerprint.png')
                if ',' in image_data:
                    image_data = image_data.split(',', 1)[1]
                image_bytes = base64.b64decode(image_data)
                pil_image = Image.open(io.BytesIO(image_bytes))

        if pil_image is None:
            return jsonify({
                "success": False,
                "error": "No valid image provided. Send a multipart file or base64 data URL."
            }), 400

        # Run prediction with the ResNet model
        predicted_group, confidence_score, probabilities = process_and_predict(pil_image)

        print(f"[Prediction] File: {filename} -> Predicted: {predicted_group} ({confidence_score}%)")

        return jsonify({
            "success": True,
            "fileName": filename,
            "predictedGroup": predicted_group,
            "confidenceScore": confidence_score,
            "probabilities": probabilities
        })

    except Exception as e:
        print(f"[Error] Prediction failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/samples', methods=['GET'])
def list_samples():
    """Lists available dataset blood groups and sample image paths."""
    samples = {}
    if os.path.exists(DATASET_DIR):
        for bg in sorted(os.listdir(DATASET_DIR)):
            bg_folder = os.path.join(DATASET_DIR, bg)
            if os.path.isdir(bg_folder):
                files = [os.path.basename(f) for f in glob.glob(os.path.join(bg_folder, '*.BMP'))[:12]]
                samples[bg] = files
    return jsonify({
        "success": True,
        "dataset_path": DATASET_DIR,
        "samples": samples
    })

@app.route('/api/sample-image/<blood_group>/<filename>', methods=['GET'])
def get_sample_image(blood_group, filename):
    safe_bg = os.path.basename(blood_group)
    safe_fn = os.path.basename(filename)
    file_path = os.path.join(DATASET_DIR, safe_bg, safe_fn)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/bmp')
    return jsonify({"error": "Sample image not found"}), 404

if __name__ == '__main__':
    get_model()
    print("\n" + "="*60)
    print("  [BE+] ML MODEL BACKEND API SERVER RUNNING ON PORT 5000")
    print("  Endpoints:")
    print("    - GET  http://localhost:5000/health")
    print("    - GET  http://localhost:5000/api/pick-image (Opens Dataset Dialog)")
    print("    - POST http://localhost:5000/api/predict")
    print("    - GET  http://localhost:5000/api/samples")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=False)
