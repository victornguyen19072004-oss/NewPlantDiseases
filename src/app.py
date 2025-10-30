# api/app.py – ĐÃ SỬA LỖI ĐƯỜNG DẪN TUYỆT ĐỐI

import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torchvision.transforms as transforms
import numpy as np
import io
import base64

# --- THIẾT LẬP ĐƯỜNG DẪN DỰ ÁN VÀ THƯ MỤC DATA ---
# 1. Xác định thư mục gốc của dự án (thư mục cha của 'api/')
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
sys.path.append(BASE_DIR)

# 2. Định nghĩa các đường dẫn tương đối
VALID_DATA_PATH_FALLBACK = os.path.join(
    BASE_DIR, 
    "data", 
    "New Plant Diseases Dataset(Augmented)", 
    "New Plant Diseases Dataset(Augmented)", 
    "valid"
)
MODELS_DIR = os.path.join(BASE_DIR, "models")

# 3. Lấy valid_dir từ biến môi trường (set bởi run.py) hoặc dùng fallback
valid_dir = os.getenv("VALID_DIR")
if not valid_dir or not os.path.exists(valid_dir):
    valid_dir = VALID_DATA_PATH_FALLBACK
    # Kiểm tra lần cuối
    if not os.path.exists(valid_dir):
        raise FileNotFoundError(f"Không tìm thấy thư mục 'valid'! Đã thử {VALID_DATA_PATH_FALLBACK} và VALID_DIR env.")


# Import từ dự án (đã thêm BASE_DIR vào sys.path)
from src.model_training import define_resnet18, define_mobilenetv2
# HÀM load_model_and_weights ĐÃ ĐƯỢC CẬP NHẬT Ở evaluation.py
from src.evaluation import load_model_and_weights 
from src.preprocessing import load_single_dataset 

from pytorch_grad_cam import GradCAMPlusPlus
from pytorch_grad_cam.utils.image import show_cam_on_image

app = Flask(__name__)
CORS(app)

# === LOAD MODELS ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load class names
dataset = load_single_dataset(valid_dir)
class_names = dataset.classes
print(f"Loaded {len(class_names)} classes")

# Load models (TRUYỀN models_dir ĐỂ ĐẢM BẢO TÌM ĐƯỢC FILE .pth)
resnet = load_model_and_weights("ResNet18", 38, device, models_dir=MODELS_DIR)
mobilenet = load_model_and_weights("MobileNetV2", 38, device, models_dir=MODELS_DIR)
if resnet is None or mobilenet is None:
    raise RuntimeError("Không thể tải mô hình. Vui lòng chạy evaluation.py trước!")


# Transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# === PREDICT FUNCTION (GIỮ NGUYÊN LOGIC) ===
def predict_and_gradcam(model, img_pil, target_layer):
    img_tensor = transform(img_pil).unsqueeze(0).to(device)
    
    with torch.no_grad():
        output = model(img_tensor)
        prob = torch.softmax(output, dim=1)
        confidence, pred_idx = torch.max(prob, dim=1)
        disease = class_names[pred_idx.item()]
        confidence = confidence.item() * 100

    # GradCAM
    cam = GradCAMPlusPlus(model=model, target_layers=[target_layer])
    grayscale_cam = cam(input_tensor=img_tensor)[0]
    
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_np = img_tensor[0].cpu().numpy().transpose(1, 2, 0)
    img_np = std * img_np + mean
    img_np = np.clip(img_np, 0, 1)
    
    overlay = show_cam_on_image(img_np, grayscale_cam, use_rgb=True)
    overlay_pil = Image.fromarray((overlay * 255).astype(np.uint8))
    
    buffered = io.BytesIO()
    overlay_pil.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return disease, round(confidence, 2), f"data:image/png;base64,{img_str}"

# === API ===
@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files['image']
    img_pil = Image.open(file.stream).convert("RGB")
    
    model_name = request.form.get("model", "ResNet18")
    if model_name == "MobileNetV2":
        model = mobilenet
        layer = model.features[-1]
        acc = 99.86
    else:
        model = resnet
        layer = model.layer4[-1]
        acc = 99.91

    disease, confidence, gradcam_b64 = predict_and_gradcam(model, img_pil, layer)

    return jsonify({
        "disease": disease,
        "confidence": confidence,
        "gradcam": gradcam_b64,
        "model": model_name,
        "accuracy": acc
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)