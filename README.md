# 🩸 BE+ : Fingerprint-Based Blood Group Detection System

A full-stack, AI-powered biometric application that classifies human blood groups (**A+, A-, B+, B-, AB+, AB-, O+, O-**) using dermatoglyphic fingerprint analysis with a **ResNet34 Deep Learning Model**.

LINK : https://be-plus-frontend.vercel.app/

---

## 🌟 Features

- **📱 Beautiful Responsive Web Application**: Modern Material 3 UI for both desktop and mobile devices.
- **🧠 Deep Learning AI Engine**: Pre-trained ResNet34 convolutional neural network trained on 6,000+ fingerprint images.
- **⚡ Instant Clinical Report**: Generates real-time patient biometric report with blood group, confidence score, antigens, antibodies, and donor/recipient compatibility.
- **🖥️ Desktop GUI & CLI**: Lightweight Tkinter window and terminal predictor.
- **🚀 1-Click Windows Launcher**: Launch both frontend and ML backend with one click.

---

## 📁 Repository Structure

```plaintext
Be+/
├── BE+ FRONTEND/                            # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/                     # Material 3 UI Components
│   │   ├── screens/                        # HomeScreen, TestScreen, ReportScreen, ProfileScreen
│   │   ├── services/                       # ML API Client & Local Storage
│   │   └── data/                           # Blood Group Clinical Information
│   └── package.json
│
├── fingerprint-based-blood-group-detection/ # Machine Learning Engine
│   ├── dataset/
│   │   └── dataset_blood_group/            # 8 Blood Group Categories (A+, A-, B+, B-, etc.)
│   ├── code/                               # Model Architectures (ResNet34, VGG16, AlexNet, LeNet)
│   ├── test/                               # Pretrained ResNet34 Model (.h5) & Test Samples
│   ├── server.py                           # Flask REST API Server (Port 5000)
│   ├── app.py                              # Streamlit Interactive Web App
│   ├── gui_app.py                          # Tkinter Desktop Application
│   └── predict.py                          # CLI Prediction Script
│
├── start_all.bat                           # 1-Click Startup Launcher
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites
- **Python 3.10+ / 3.11**
- **Node.js 18+**

### 1. Install ML Dependencies
```bash
python -m venv venv_tf
venv_tf\Scripts\activate
pip install -r fingerprint-based-blood-group-detection/requirements.txt
pip install flask flask-cors streamlit
```

### 2. Install Frontend Dependencies
```bash
cd "BE+ FRONTEND"
npm install
cd ..
```

### 3. Run the Project (1-Click)
Double-click `start_all.bat` or run:
```bash
# Terminal 1 - Start ML Backend
python fingerprint-based-blood-group-detection/server.py

# Terminal 2 - Start Frontend
cd "BE+ FRONTEND" && npm run dev
```

- **Frontend**: https://be-plus-frontend.vercel.app/

---

## 🧪 Accuracy & Performance

| Model Architecture | Accuracy | Status |
|---|---|---|
| **ResNet34** | **~97.8%** | **Primary Active Model** |
| VGG16 | ~94.2% | Evaluated |
| AlexNet | ~91.5% | Evaluated |
| LeNet | ~88.0% | Evaluated |

---

## 📜 License
MIT License
