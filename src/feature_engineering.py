# BackBone là phần xử lý các dữ liệu hình ảnh đầu vào chuyển thành các số liệu cho mô hình
# Khi dùng BackBone xử lý và chuyển đổi hình ảnh thành các đặc trưng có ý nghĩa như: Cạnh, kết cấu, hình dạng,...

import torch
import torch.nn as nn
import logging
from typing import Tuple, Any
import os
import numpy as np

# Cần import các hàm định nghĩa mô hình từ model_training.py
try:
    from src.preprocessing import get_device, load_datasets, get_dataloaders
    from src.model_training import define_resnet18, define_mobilenetv2
    from torchvision.models import efficientnet_b0
except ImportError as e:
    logging.error(f"Lỗi: Không thể import từ preprocessing hoặc model_training: {e}")
    raise

logging.basicConfig(level=logging.INFO)


# 1. HÀM TẢI VÀ TÁCH BACKBONE TỪ CÁC MÔ HÌNH

def get_feature_extractor_backbone(model_name: str, num_classes: int = 38) -> nn.Module:
    """
    Tải mô hình (hoặc pre-trained) và cắt bỏ lớp phân loại cuối cùng (Classifier) 
    để chỉ giữ lại bộ trích xuất đặc trưng (Backbone).
    """
    if model_name == 'ResNet18':
        model = define_resnet18(num_classes, use_pretrained=False)
        backbone = nn.Sequential(*list(model.children())[:-1], nn.Flatten())
        logging.info("Tách ResNet18 Backbone thành công.")
        return backbone
        
    elif model_name == 'MobileNetV2':
        model = define_mobilenetv2(num_classes, use_pretrained=False)
        return nn.Sequential(model.features, nn.AdaptiveAvgPool2d(1), nn.Flatten())
        
    elif model_name == 'EfficientNet-B0':
        model = efficientnet_b0(weights=None)
        backbone = nn.Sequential(*list(model.children())[:-1], nn.AdaptiveAvgPool2d(1), nn.Flatten())
        logging.info("Tách EfficientNet-B0 Backbone thành công.")
        return backbone
        
    else:
        raise ValueError(f"Mô hình {model_name} không được hỗ trợ để trích xuất đặc trưng.")

# 2. HÀM THỰC HIỆN TRÍCH XUẤT ĐẶC TRƯNG


def extract_features(model: nn.Module, dataloader: Any, device: torch.device) -> Tuple[torch.Tensor, torch.Tensor]:
    """Hàm chạy qua DataLoader để trích xuất vector đặc trưng và nhãn tương ứng."""
    model.eval()
    model.to(device)
    features = []
    labels = []
    logging.info("Bắt đầu trích xuất đặc trưng...")
    
    with torch.no_grad():
        for images, lbls in dataloader:
            images = images.to(device)
            feature_vector = model(images)
            features.append(feature_vector.cpu())
            labels.append(lbls)
            
    features = torch.cat(features, dim=0)
    labels = torch.cat(labels, dim=0)
    logging.info(f"Đã trích xuất xong. Feature vector shape: {features.shape}")
    return features, labels


# 3. HÀM LƯU ĐẶC TRƯNG RA FILE

def save_features(features: torch.Tensor, labels: torch.Tensor, model_name: str, save_dir: str = 'features'):
    """Lưu vector đặc trưng và nhãn ra file numpy để dùng cho mô hình ML."""
    os.makedirs(save_dir, exist_ok=True)
    feature_path = os.path.join(save_dir, f'features_{model_name}.npy')
    label_path = os.path.join(save_dir, f'labels_{model_name}.npy')
    
    np.save(feature_path, features.numpy())
    np.save(label_path, labels.numpy())
    logging.info(f"Đã lưu đặc trưng tại {feature_path} và nhãn tại {label_path}")


# 4. KHỐI CHẠY CHÍNH


if __name__ == "__main__":
    # Chuẩn bị dữ liệu
    ds_dir = r"E:\New_Plant_Diseases_Project\data\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)"
    train_dir = os.path.join(ds_dir, 'train')
    valid_dir = os.path.join(ds_dir, 'valid')
    
    device = get_device()
    try:
        train_ds, valid_ds = load_datasets(train_dir, valid_dir)
        train_loader, valid_loader = get_dataloaders(train_ds, valid_ds, batch_size=64)
    except Exception as e:
        logging.error(f"Lỗi khi tải dữ liệu: {e}")
        raise

    num_classes = len(train_ds.classes)
    logging.info(f"Số lớp: {num_classes}")
    
    # Lựa chọn các mô hình trích xuất
    models_to_extract = ['ResNet18', 'MobileNetV2', 'EfficientNet-B0']
    
    for model_name in models_to_extract:
        logging.info(f"\n--- Trích xuất đặc trưng từ {model_name} ---")
        
        try:
            feature_extractor = get_feature_extractor_backbone(model_name, num_classes)
            for dataset_name, dataloader in [('train', train_loader), ('valid', valid_loader)]:
                logging.info(f"--- Trích xuất từ {dataset_name} ---")
                features, labels = extract_features(feature_extractor, dataloader, device)
                save_features(features, labels, f'{model_name}_{dataset_name}')
                logging.info(f"Hoàn thành trích xuất đặc trưng cho {model_name} trên {dataset_name}. Kích thước feature vector: {features.shape[1]}")
        except Exception as e:
            logging.error(f"Lỗi khi trích xuất từ {model_name}: {e}")
            continue