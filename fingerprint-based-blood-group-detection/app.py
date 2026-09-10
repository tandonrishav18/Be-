import os
import glob
import numpy as np
from PIL import Image
import streamlit as st

# Configure page
st.set_page_config(
    page_title="Fingerprint Blood Group Detection",
    page_icon="🩸",
    layout="wide"
)

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.imagenet_utils import preprocess_input
except ImportError:
    from tf_keras.models import load_model
    from tf_keras.applications.imagenet_utils import preprocess_input

# Labels dictionary
LABELS = {0: 'A+', 1: 'A-', 2: 'AB+', 3: 'AB-', 4: 'B+', 5: 'B-', 6: 'O+', 7: 'O-'}

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'test', 'model_blood_group_detection_resnet.h5')
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset', 'dataset_blood_group')

@st.cache_resource
def get_model():
    if not os.path.exists(MODEL_PATH):
        st.error(f"Model file not found at: {MODEL_PATH}")
        return None
    return load_model(MODEL_PATH)

def preprocess_and_predict(img: Image.Image, model):
    # Convert to RGB and resize
    img_rgb = img.convert('RGB').resize((256, 256))
    x = np.array(img_rgb, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    
    preds = model.predict(x, verbose=0)[0]
    pred_idx = int(np.argmax(preds))
    pred_label = LABELS[pred_idx]
    confidence = float(preds[pred_idx] * 100)
    
    probs_dict = {LABELS[i]: float(preds[i] * 100) for i in range(len(LABELS))}
    return pred_label, confidence, probs_dict

# Custom CSS styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #e63946;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.1rem;
        color: #555;
        margin-bottom: 1.5rem;
    }
    .prediction-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 2px solid #e63946;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-top: 10px;
    }
    .blood-group-badge {
        font-size: 3.5rem;
        font-weight: 800;
        color: #e63946;
        margin: 10px 0;
    }
    .confidence-text {
        font-size: 1.3rem;
        font-weight: 600;
        color: #1d3557;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">🩸 Fingerprint-Based Blood Group Detection</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Upload or select a fingerprint image to classify the blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) using ResNet deep learning model.</div>', unsafe_allow_html=True)

# Load model
with st.spinner("Loading deep learning model..."):
    model = get_model()

if model is None:
    st.stop()

col_left, col_right = st.columns([1, 1], gap="large")

with col_left:
    st.subheader("1. Select / Upload Image")
    
    input_method = st.radio(
        "Choose Input Method:",
        ["📤 Upload an Image", "📁 Pick from Sample Dataset"],
        horizontal=True
    )
    
    selected_image = None
    image_name = ""
    
    if input_method == "📤 Upload an Image":
        uploaded_file = st.file_uploader(
            "Upload Fingerprint Image (.BMP, .PNG, .JPG, .JPEG)",
            type=["bmp", "png", "jpg", "jpeg"]
        )
        if uploaded_file is not None:
            selected_image = Image.open(uploaded_file)
            image_name = uploaded_file.name
    else:
        # Collect sample images from dataset
        sample_options = {}
        if os.path.exists(DATASET_DIR):
            for bg in sorted(os.listdir(DATASET_DIR)):
                bg_path = os.path.join(DATASET_DIR, bg)
                if os.path.isdir(bg_path):
                    files = glob.glob(os.path.join(bg_path, "*.BMP"))
                    if files:
                        sample_options[f"Blood Group {bg} Sample ({os.path.basename(files[0])})"] = files[0]
        
        # Also add test folder sample
        test_sample = os.path.join(os.path.dirname(__file__), 'test', 'O- blood group.BMP')
        if os.path.exists(test_sample):
            sample_options["Test Folder (O- blood group.BMP)"] = test_sample
            
        choice = st.selectbox("Select a Sample Fingerprint:", list(sample_options.keys()))
        if choice:
            sample_path = sample_options[choice]
            selected_image = Image.open(sample_path)
            image_name = os.path.basename(sample_path)

    if selected_image is not None:
        st.image(selected_image, caption=f"Selected Image: {image_name}", width=280)

with col_right:
    st.subheader("2. Blood Group Prediction")
    
    if selected_image is not None:
        with st.spinner("Analyzing fingerprint features..."):
            pred_label, confidence, probs_dict = preprocess_and_predict(selected_image, model)
        
        st.markdown(f"""
        <div class="prediction-card">
            <div style="font-size: 1.1rem; color: #495057; font-weight: 500;">PREDICTED BLOOD GROUP</div>
            <div class="blood-group-badge">{pred_label}</div>
            <div class="confidence-text">Confidence: {confidence:.2f}%</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.write("")
        st.subheader("3. Probability Distribution")
        
        # Sort probabilities
        sorted_probs = dict(sorted(probs_dict.items(), key=lambda x: x[1], reverse=True))
        
        # Display progress bars
        for bg, prob in sorted_probs.items():
            cols = st.columns([1, 6, 2])
            with cols[0]:
                st.markdown(f"**{bg}**")
            with cols[1]:
                st.progress(float(prob / 100.0))
            with cols[2]:
                st.markdown(f"`{prob:5.2f}%`")
    else:
        st.info("👈 Please upload or select a fingerprint image on the left to see the blood group prediction.")

st.markdown("---")
st.caption("Fingerprint-Based Blood Group Detection System | Model: ResNet34 Architecture (Input Size: 256x256)")
