"""
Fingerprint-Based Blood Group Detection - CLI Predictor
Usage:
    python predict.py "path/to/fingerprint_image.BMP"
    python predict.py   (will prompt for image path or use default sample)
"""

import os
import sys
import argparse
import warnings

# Suppress TensorFlow verbose logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

import numpy as np

# Try importing keras/tensorflow
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.imagenet_utils import preprocess_input
except ImportError:
    try:
        import tf_keras as keras
        from tf_keras.models import load_model
        from tf_keras.preprocessing import image
        from tf_keras.applications.imagenet_utils import preprocess_input
    except ImportError:
        print("Error: TensorFlow/Keras is required. Run 'pip install tensorflow pillow numpy'")
        sys.exit(1)

# Class index to Blood Group mapping
LABELS = {0: 'A+', 1: 'A-', 2: 'AB+', 3: 'AB-', 4: 'B+', 5: 'B-', 6: 'O+', 7: 'O-'}

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(__file__), 'test', 'model_blood_group_detection_resnet.h5'
)


def load_detection_model(model_path=None):
    if model_path is None:
        model_path = DEFAULT_MODEL_PATH
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    print(f"Loading trained model from: {model_path} ...")
    model = load_model(model_path)
    print("Model loaded successfully!\n")
    return model


def predict_blood_group(img_path, model):
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Image file not found at: {img_path}")

    # Load and preprocess image
    img = image.load_img(img_path, target_size=(256, 256))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    # Predict
    preds = model.predict(x, verbose=0)[0]
    predicted_idx = int(np.argmax(preds))
    predicted_label = LABELS[predicted_idx]
    confidence = float(preds[predicted_idx] * 100)

    # All probabilities
    all_probs = {LABELS[i]: float(preds[i] * 100) for i in range(len(LABELS))}
    return predicted_label, confidence, all_probs


def main():
    parser = argparse.ArgumentParser(description="Predict blood group from a fingerprint image.")
    parser.add_argument("image_path", nargs="?", help="Path to fingerprint image (.BMP, .png, .jpg)")
    parser.add_argument("--model", default=None, help="Path to .h5 model file")
    args = parser.parse_args()

    img_path = args.image_path
    if not img_path:
        default_sample = os.path.join(os.path.dirname(__file__), 'test', 'O- blood group.BMP')
        print("No image path provided.")
        user_input = input(f"Enter image path (or press Enter to test sample: '{default_sample}'): ").strip()
        img_path = user_input if user_input else default_sample

    try:
        model = load_detection_model(args.model)
        label, conf, all_probs = predict_blood_group(img_path, model)

        print("=" * 45)
        print(f"  IMAGE: {os.path.basename(img_path)}")
        print(f"  PREDICTED BLOOD GROUP: {label}")
        print(f"  CONFIDENCE: {conf:.2f}%")
        print("=" * 45)
        print("\nProbability Distribution Across All Blood Groups:")
        print("-" * 45)
        for bg, prob in sorted(all_probs.items(), key=lambda item: item[1], reverse=True):
            bar = "#" * int(prob / 4)
            print(f"  {bg:<4}: {prob:6.2f}%  {bar}")
        print("-" * 45)

    except Exception as e:
        print(f"Error during prediction: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
