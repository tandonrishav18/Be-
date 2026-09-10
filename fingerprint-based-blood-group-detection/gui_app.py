import os
import sys
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageTk
import numpy as np

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.applications.imagenet_utils import preprocess_input
except ImportError:
    from tf_keras.models import load_model
    from tf_keras.applications.imagenet_utils import preprocess_input

LABELS = {0: 'A+', 1: 'A-', 2: 'AB+', 3: 'AB-', 4: 'B+', 5: 'B-', 6: 'O+', 7: 'O-'}
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'test', 'model_blood_group_detection_resnet.h5')

class BloodGroupApp:
    def __init__(self, root):
        self.root = root
        self.root.title("🩸 Fingerprint Blood Group Detector")
        self.root.geometry("750x620")
        self.root.resizable(False, False)
        self.root.configure(bg="#f4f6f9")

        self.model = None
        self.img_tk = None

        self.setup_ui()
        self.load_model_async()

    def setup_ui(self):
        # Header
        header = tk.Frame(self.root, bg="#c1121f", height=70)
        header.pack(fill=tk.X)

        title_lbl = tk.Label(
            header,
            text="🩸 Fingerprint Blood Group Detection",
            font=("Segoe UI", 18, "bold"),
            fg="white",
            bg="#c1121f"
        )
        title_lbl.pack(pady=15)

        # Main Container
        main_frame = tk.Frame(self.root, bg="#f4f6f9")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=25, pady=15)

        # Left Column: Image Selector & Preview
        left_col = tk.Frame(main_frame, bg="white", bd=1, relief=tk.SOLID, width=320, height=480)
        left_col.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        left_col.pack_propagate(False)

        btn_select = tk.Button(
            left_col,
            text="📁 Select Fingerprint Image...",
            font=("Segoe UI", 11, "bold"),
            bg="#1d3557",
            fg="white",
            activebackground="#457b9d",
            activeforeground="white",
            cursor="hand2",
            padx=10,
            pady=8,
            command=self.select_image
        )
        btn_select.pack(pady=15)

        # Image preview box
        self.canvas = tk.Canvas(left_col, width=256, height=256, bg="#e9ecef", highlightthickness=1, highlightbackground="#ced4da")
        self.canvas.pack(pady=5)
        self.canvas_text = self.canvas.create_text(128, 128, text="No Image Selected", font=("Segoe UI", 11), fill="#6c757d")

        self.lbl_path = tk.Label(left_col, text="Ready to load image", font=("Segoe UI", 9), fg="#6c757d", bg="white", wraplength=280)
        self.lbl_path.pack(pady=10)

        # Right Column: Predictions & Probabilities
        right_col = tk.Frame(main_frame, bg="white", bd=1, relief=tk.SOLID, width=360, height=480)
        right_col.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(10, 0))
        right_col.pack_propagate(False)

        res_title = tk.Label(right_col, text="Prediction Result", font=("Segoe UI", 13, "bold"), bg="white", fg="#1d3557")
        res_title.pack(pady=(15, 5))

        # Result card
        self.card = tk.Frame(right_col, bg="#f8f9fa", bd=1, relief=tk.GROOVE)
        self.card.pack(fill=tk.X, padx=20, pady=5)

        self.lbl_group_title = tk.Label(self.card, text="BLOOD GROUP", font=("Segoe UI", 9, "bold"), fg="#6c757d", bg="#f8f9fa")
        self.lbl_group_title.pack(pady=(10, 0))

        self.lbl_result = tk.Label(self.card, text="--", font=("Segoe UI", 36, "bold"), fg="#c1121f", bg="#f8f9fa")
        self.lbl_result.pack(pady=0)

        self.lbl_conf = tk.Label(self.card, text="Confidence: --%", font=("Segoe UI", 11, "bold"), fg="#2b2d42", bg="#f8f9fa")
        self.lbl_conf.pack(pady=(0, 10))

        # Distribution Table
        dist_lbl = tk.Label(right_col, text="Probabilities Breakdown:", font=("Segoe UI", 10, "bold"), bg="white", fg="#495057")
        dist_lbl.pack(anchor="w", padx=20, pady=(15, 5))

        self.table_frame = tk.Frame(right_col, bg="white")
        self.table_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 15))

        self.prob_labels = {}
        self.prob_bars = {}

        for i, bg in enumerate(['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-']):
            row = tk.Frame(self.table_frame, bg="white")
            row.pack(fill=tk.X, pady=2)

            name_lbl = tk.Label(row, text=f"{bg:<4}", font=("Consolas", 10, "bold"), bg="white", width=4, anchor="w")
            name_lbl.pack(side=tk.LEFT)

            bar = ttk.Progressbar(row, orient=tk.HORIZONTAL, length=180, mode='determinate')
            bar.pack(side=tk.LEFT, padx=8)
            self.prob_bars[bg] = bar

            val_lbl = tk.Label(row, text="0.00%", font=("Consolas", 9), bg="white", width=7, anchor="e")
            val_lbl.pack(side=tk.LEFT)
            self.prob_labels[bg] = val_lbl

    def load_model_async(self):
        if not os.path.exists(MODEL_PATH):
            messagebox.showerror("Error", f"Model file not found:\n{MODEL_PATH}")
            return
        try:
            self.model = load_model(MODEL_PATH)
        except Exception as e:
            messagebox.showerror("Model Load Error", str(e))

    def select_image(self):
        if self.model is None:
            messagebox.showwarning("Please Wait", "Model is still loading...")
            return

        file_path = filedialog.askopenfilename(
            title="Select Fingerprint Image",
            filetypes=[
                ("Image Files", "*.BMP;*.bmp;*.png;*.PNG;*.jpg;*.JPG;*.jpeg;*.JPEG"),
                ("All Files", "*.*")
            ],
            initialdir=os.path.join(os.path.dirname(__file__), 'dataset', 'dataset_blood_group')
        )

        if not file_path:
            return

        self.lbl_path.config(text=os.path.basename(file_path))

        # Display preview
        try:
            img = Image.open(file_path).convert('RGB')
            img_display = img.resize((256, 256))
            self.img_tk = ImageTk.PhotoImage(img_display)
            self.canvas.delete("all")
            self.canvas.create_image(128, 128, image=self.img_tk)

            # Predict
            self.predict(img)
        except Exception as e:
            messagebox.showerror("Prediction Error", f"Failed to process image:\n{e}")

    def predict(self, pil_img):
        img_resized = pil_img.resize((256, 256))
        x = np.array(img_resized, dtype=np.float32)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        preds = self.model.predict(x, verbose=0)[0]
        pred_idx = int(np.argmax(preds))
        pred_label = LABELS[pred_idx]
        conf = float(preds[pred_idx] * 100)

        self.lbl_result.config(text=pred_label)
        self.lbl_conf.config(text=f"Confidence: {conf:.2f}%")

        for idx, bg in LABELS.items():
            prob = float(preds[idx] * 100)
            self.prob_bars[bg]['value'] = prob
            self.prob_labels[bg].config(text=f"{prob:5.2f}%")


def main():
    root = tk.Tk()
    app = BloodGroupApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
