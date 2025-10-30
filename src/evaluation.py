# src/evaluation.py
import torch
import torch.nn as nn
import numpy as np
import os
import sys
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from torch.utils.data import DataLoader
import pandas as pd
import json
import logging
import time
from datetime import datetime
import subprocess
from pathlib import Path

from src.preprocessing import get_device, load_single_dataset
from src.model_training import define_resnet18, define_mobilenetv2, define_cnn
from torchvision.models import efficientnet_b0

try:
    from pytorch_grad_cam import GradCAMPlusPlus
    from pytorch_grad_cam.utils.image import show_cam_on_image
    GRADCAM_AVAILABLE = True
except:
    GRADCAM_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Thiết lập đường dẫn tương đối cho phần web
PROJECT_ROOT = Path(__file__).parent.parent
PLOTS_DIR = PROJECT_ROOT / "plots"
REPORT_DIR = PROJECT_ROOT / "reports"
MODELS_DIR = PROJECT_ROOT / "models"

os.makedirs(PLOTS_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# Tải mô hình sau huấn luyện
def load_model_and_weights(name: str, num_classes: int, device):
    path = MODELS_DIR / f"best_{name}.pth"
    if not path.exists():
        logging.error(f"KHÔNG TÌM THẤY: {path}")
        return None

    if name == "ResNet18":
        model = define_resnet18(num_classes, use_pretrained=False)
    elif name == "MobileNetV2":
        model = define_mobilenetv2(num_classes, use_pretrained=False)
    elif name == "EfficientNetB0":
        model = efficientnet_b0(num_classes=num_classes)
    elif name == "CNN":
        model = define_cnn(num_classes)
    else:
        raise ValueError(f"Unsupported model: {name}")

    model.load_state_dict(torch.load(path, map_location=device))
    logging.info(f"ĐÃ TẢI: {path.name}")
    return model.to(device).eval()

# Phần dự đoán
@torch.no_grad()
def get_predictions(model, loader, device):
    y_true, y_pred = [], []
    for x, y in loader:
        x = x.to(device)
        out = model(x)
        _, p = torch.max(out, 1)
        y_true.extend(y.cpu().numpy())
        y_pred.extend(p.cpu().numpy())
    return np.array(y_true), np.array(y_pred)

@torch.no_grad()
def measure_inference_time(model, loader, device, n=10):
    model.eval()
    times = []
    for i, (x, _) in enumerate(loader):
        if i >= n: break
        x = x.to(device)
        if device.type == "cuda": torch.cuda.synchronize()
        s = time.time()
        _ = model(x)
        if device.type == "cuda": torch.cuda.synchronize()
        times.append(time.time() - s)
    return np.mean(times) * 1000 if times else 0

# Lưu trữ các biểu đồ
# Biểu đồ ma trận nhầm lẫn
def plot_confusion_matrix(y_true, y_pred, classes, name):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(16, 14))
    sns.heatmap(cm, annot=False, fmt='d', cmap='Blues',
                xticklabels=classes, yticklabels=classes, cbar=True)
    plt.title(f"Confusion Matrix – {name}")
    plt.xticks(rotation=90, fontsize=8); plt.yticks(fontsize=8)
    plt.tight_layout()
    path = PLOTS_DIR / f"{name}_cm.png"
    plt.savefig(path, dpi=150, bbox_inches='tight'); plt.close()
    logging.info(f"Saved CM: {path.name}")
    np.save(REPORT_DIR / f"confusion_matrix_{name}.npy", cm)
    return cm


def get_target_layer(model, name: str):
    if "resnet" in name.lower(): return model.layer4[-1]
    elif "mobilenet" in name.lower(): return model.features[-1]
    elif "efficientnet" in name.lower(): return model.features[-1]
    elif "cnn" in name.lower():
        for layer in reversed(model):
            if isinstance(layer, nn.Conv2d): return layer
        return None
    return None

def save_gradcam(model, loader, device, name):
    if not GRADCAM_AVAILABLE: return
    model.eval()
    img, _ = next(iter(loader))
    img = img[:1].to(device)
    target_layer = get_target_layer(model, name)
    if not target_layer: return
    try:
        cam = GradCAMPlusPlus(model=model, target_layers=[target_layer])
        cam_map = cam(input_tensor=img)[0]
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        img_np = img[0].cpu().numpy().transpose(1, 2, 0)
        img_np = std * img_np + mean
        img_np = np.clip(img_np, 0, 1)
        overlay = show_cam_on_image(img_np, cam_map, use_rgb=True)
        path = PLOTS_DIR / f"{name}_gradcam.png"
        plt.imsave(path, overlay)
        logging.info(f"GradCAM: {path.name}")
    except Exception as e:
        logging.error(f"Lỗi GradCAM: {e}")

def plot_f1_per_class(report_dict, class_names, name):
    f1_scores = [report_dict[c]['f1-score'] for c in class_names if c in report_dict]
    plt.figure(figsize=(14, 6))
    bars = plt.bar(range(len(f1_scores)), f1_scores, color='skyblue', edgecolor='navy', alpha=0.8)
    plt.title(f"F1-Score Per Class – {name}")
    plt.ylim(0.9, 1.0); plt.xticks([])
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    min_idx = np.argmin(f1_scores)
    bars[min_idx].set_color('red')
    plt.text(min_idx, f1_scores[min_idx] + 0.001, class_names[min_idx],
             ha='center', va='bottom', fontsize=8, color='red', fontweight='bold')
    path = PLOTS_DIR / f"{name}_f1_per_class.png"
    plt.tight_layout(); plt.savefig(path, dpi=150, bbox_inches='tight'); plt.close()

def plot_precision_recall_scatter(report_dict, class_names, name):
    precisions = [report_dict[c]['precision'] for c in class_names if c in report_dict]
    recalls = [report_dict[c]['recall'] for c in class_names if c in report_dict]
    plt.figure(figsize=(8, 8))
    plt.scatter(recalls, precisions, c='teal', alpha=0.6, edgecolors='black', s=60)
    plt.title(f"Precision vs Recall – {name}")
    plt.xlim(0.8, 1.01); plt.ylim(0.8, 1.01)
    plt.plot([0.8, 1], [0.8, 1], 'r--', label="Perfect")
    plt.grid(True, linestyle='--', alpha=0.5); plt.legend()
    path = PLOTS_DIR / f"{name}_precision_recall.png"
    plt.tight_layout(); plt.savefig(path, dpi=150, bbox_inches='tight'); plt.close()

def plot_top10_classes(report_dict, class_names, name):
    f1_scores = {c: report_dict[c]['f1-score'] for c in class_names if c in report_dict}
    sorted_f1 = sorted(f1_scores.items(), key=lambda x: x[1], reverse=True)
    easy = sorted_f1[:10]; hard = sorted_f1[-10:][::-1]
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1); plt.barh([x[0] for x in easy], [x[1] for x in easy], color='lightgreen')
    plt.title("Top 10 Easy"); plt.xlim(0.98, 1); plt.xlabel("F1")
    plt.subplot(1, 2, 2); plt.barh([x[0] for x in hard], [x[1] for x in hard], color='salmon')
    plt.title("Top 10 Hard"); plt.xlim(0.9, 1); plt.xlabel("F1")
    plt.tight_layout()
    path = PLOTS_DIR / f"{name}_top10_classes.png"
    plt.savefig(path, dpi=150, bbox_inches='tight'); plt.close()

# === SO SÁNH MÔ HÌNH ===
def save_comparison_table(results):
    df = pd.DataFrame(results).round(4)
    df.to_csv(REPORT_DIR / "model_comparison.csv", index=False)
    df.to_html(REPORT_DIR / "model_comparison.html", index=False)
    best = df.loc[df['Accuracy'].idxmax()]
    logging.info(f"BEST MODEL: {best['Model']} (Acc: {best['Accuracy']:.4f})")
    return best['Model']

# === GỌI UPDATE WEB ===
def trigger_web_update():
    script_path = PROJECT_ROOT / "src" / "update_web_data.py"
    if script_path.exists():
        try:
            logging.info("Đang cập nhật dữ liệu cho Next.js...")
            result = subprocess.run(
                [sys.executable, str(script_path)],
                capture_output=True, text=True, check=True
            )
            logging.info("Cập nhật web thành công!")
            if result.stdout:
                print(result.stdout)
        except subprocess.CalledProcessError as e:
            logging.error(f"Lỗi cập nhật web: {e}")
            if e.stderr:
                print(e.stderr)
    else:
        logging.warning(f"Không tìm thấy: {script_path}")

# === MAIN ===
if __name__ == "__main__":
    # === TẢI DỮ LIỆU VALID ===
    valid_dir = os.getenv("VALID_DIR")
    if not valid_dir or not os.path.exists(valid_dir):
        valid_dir = PROJECT_ROOT / "data" / "New Plant Diseases Dataset(Augmented)" / "New Plant Diseases Dataset(Augmented)" / "valid"
    
    if not os.path.exists(valid_dir):
        logging.error(f"KHÔNG TÌM THẤY VALID DIR: {valid_dir}")
        sys.exit(1)

    device = get_device()
    ds = load_single_dataset(str(valid_dir))
    loader = DataLoader(ds, batch_size=32, shuffle=False, num_workers=4, pin_memory=True)
    class_names = ds.classes

    # === TÌM MÔ HÌNH ===
    available = [m for m in ["ResNet18", "MobileNetV2", "EfficientNetB0", "CNN"]
                 if (MODELS_DIR / f"best_{m}.pth").exists()]

    if not available:
        logging.error("Không tìm thấy mô hình .pth nào!")
        sys.exit(1)

    logging.info(f"Đánh giá {len(available)} mô hình: {available}")

    results = []
    for name in available:
        logging.info(f"\n{'='*50} {name} {'='*50}")
        model = load_model_and_weights(name, 38, device)
        if not model: continue

        t = measure_inference_time(model, loader, device)
        y_true, y_pred = get_predictions(model, loader, device)
        acc = accuracy_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred, average='weighted')

        # === LƯU REPORT CHI TIẾT ===
        report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True, digits=4)
        with open(REPORT_DIR / f"classification_report_{name}.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # === BIỂU ĐỒ ===
        plot_confusion_matrix(y_true, y_pred, class_names, name)
        save_gradcam(model, loader, device, name)
        plot_f1_per_class(report, class_names, name)
        plot_precision_recall_scatter(report, class_names, name)
        plot_top10_classes(report, class_names, name)

        size_mb = round((MODELS_DIR / f"best_{name}.pth").stat().st_size / (1024*1024), 2)
        results.append({
            "Model": name,
            "Accuracy": acc,
            "F1-Score": f1,
            "Time (ms/batch)": round(t, 2),
            "Size (MB)": size_mb
        })

    # === LƯU TỔNG HỢP ===
    best_model = save_comparison_table(results)
    with open(REPORT_DIR / "evaluation_report.json", "w", encoding="utf-8") as f:
        json.dump({
            "best_model": best_model,
            "results": results,
            "updated_at": datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)

    # === TỰ ĐỘNG CẬP NHẬT WEB ===
    trigger_web_update()

    logging.info(f"HOÀN TẤT! Dashboard: http://localhost:3000")