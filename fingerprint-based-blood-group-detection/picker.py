import os
import sys
import tkinter as tk
from tkinter import filedialog

def main():
    root = tk.Tk()
    root.withdraw()
    # Bring to foreground
    root.attributes('-topmost', True)
    root.lift()
    root.focus_force()

    initial_dir = sys.argv[1] if len(sys.argv) > 1 else r"f:\Be+\fingerprint-based-blood-group-detection\dataset\dataset_blood_group"

    file_path = filedialog.askopenfilename(
        parent=root,
        title="Select Fingerprint Image",
        initialdir=initial_dir,
        filetypes=[
            ("Fingerprint Images", "*.BMP;*.bmp;*.png;*.PNG;*.jpg;*.JPG;*.jpeg;*.JPEG"),
            ("All Files", "*.*")
        ]
    )
    root.destroy()

    if file_path and os.path.exists(file_path):
        print(file_path)
    else:
        print("CANCELLED")

if __name__ == '__main__':
    main()
