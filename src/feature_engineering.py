# feature_engineering.py
# Mục đích: Trích xuất Vector Đặc trưng (Feature Vectors) từ các mô hình CNN (Backbones)
#          và lưu ra file .npy để dùng cho các mô hình Machine Learning truyền thống.

# Backbone: Là các lớp tích chập của các mô hình nhưng đã được loại bỏ lớp phân loại cuối cùng
import torch
import torch.nn as nn
import logging
from typing import Tuple, Any
import os
import numpy as np

try:
    # Giả định src.preprocessing và src.model_training nằm trong thư mục src
    from src.preprocessing import get_device, load_datasets, get_dataloaders
    from src.model_training import define_resnet18, define_mobilenetv2, define_cnn 
    from torchvision.models import efficientnet_b0
except ImportError as e:
    logging.error(f"Lỗi: Không thể import từ preprocessing hoặc model_training: {e}")
    raise

logging.basicConfig(level=logging.INFO)


# tải các mô hình và dùng mô hình để trích xuất đặc trưng
def get_feature_extractor_backbone(model_name: str, num_classes: int = 38) -> nn.Module:
    """
    Tải mô hình (hoặc pre-trained) và cắt bỏ lớp phân loại cuối cùng (Classifier) 
    để chỉ giữ lại bộ trích xuất đặc trưng (Backbone).
    """
    # ... (Các logic tách Backbone giữ nguyên) ...
    if model_name == 'ResNet18':
        model = define_resnet18(num_classes, use_pretrained=False)
        backbone = nn.Sequential(*list(model.children())[:-1], nn.Flatten())
        logging.info("Trích xuất đặc trưng ResNet18 thành công.")
        return backbone
        
    elif model_name == 'MobileNetV2':
        model = define_mobilenetv2(num_classes, use_pretrained=False)
        # MobileNetV2 features là backbone, AdaptiveAvgPool2d(1) + Flatten chuyển thành vector
        return nn.Sequential(model.features, nn.AdaptiveAvgPool2d(1), nn.Flatten())
        
    elif model_name == 'EfficientNet-B0':
        model = efficientnet_b0(weights=None)
        # EfficientNet-B0 có 3 lớp cuối cùng là avgpool, classifier
        backbone = nn.Sequential(*list(model.children())[:-1], nn.AdaptiveAvgPool2d(1), nn.Flatten())
        logging.info("Tách EfficientNet-B0 Backbone thành công.")
        return backbone
    
    elif model_name == 'CNN':
        # Đối với mô hình tự định nghĩa, chúng ta cần cắt bỏ lớp phân loại cuối cùng
        model = define_cnn(num_classes)
        # Cắt bỏ lớp Linear (index -1) và lớp Dropout (index -2)
        backbone = nn.Sequential(*list(model.children())[:-2])
        logging.info("Tách CNN Backbone thành công.")
        return backbone
        
    else:
        raise ValueError(f"Mô hình {model_name} không được hỗ trợ để trích xuất đặc trưng.")
    

# Sử dụng mô hình trích xuất đặc trưng
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


# lưu vector đặ trưng và nhãn thành file .npy
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
    # Lấy đường dẫn tuyệt đối 
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))  
    DS_ROOT_PATH = os.path.join(CURRENT_DIR, '..', 'data', 'New Plant Diseases Dataset(Augmented)', 'New Plant Diseases Dataset(Augmented)')
    
    train_dir = os.path.join(DS_ROOT_PATH, 'train')
    valid_dir = os.path.join(DS_ROOT_PATH, 'valid')
    # ==========================================
    
    device = get_device()
    try:
        train_ds, valid_ds = load_datasets(train_dir, valid_dir)
        train_loader, valid_loader = get_dataloaders(train_ds, valid_ds, batch_size=64)
    except Exception as e:
        # Lỗi tải dữ liệu giờ sẽ chỉ xảy ra nếu thư mục data/ không đúng vị trí tương đối
        logging.error(f"Lỗi khi tải dữ liệu. Hãy kiểm tra đường dẫn tương đối: {train_dir}. Lỗi: {e}")
        raise

    num_classes = len(train_ds.classes)
    logging.info(f"Số lớp: {num_classes}")
    
    # Thêm mô hình CNN vào danh sách trích xuất
    models_to_extract = ['ResNet18', 'MobileNetV2', 'EfficientNet-B0', 'CNN'] 
    
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