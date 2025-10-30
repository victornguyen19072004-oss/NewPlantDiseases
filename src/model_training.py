# src/model_training.py: Module huấn luyện mô hình, bao gồm define CNN, loss, optimizer, và training loop với early stopping.

import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
from torchvision import models
import logging
import os 
from typing import Dict, Any, Tuple, List 

logging.basicConfig(level=logging.INFO)

# 1. HÀM ĐỊNH NGHĨA CÁC MÔ HÌNH 

def define_cnn(num_classes: int = 38) -> nn.Module:
    """Hàm định nghĩa mô hình CNN thuần đã tối ưu"""
    model = nn.Sequential(
        # Tạo lớp tích chập thứ 1: 3 kênh màu RGB, 32 ánh xạ đặc trưng, giữ kích thước hình ảnh
        nn.Conv2d(3, 32, kernel_size=3, padding=1), 
        # Chuẩn hóa activation dùng cho huấn luyện được ổn định
        nn.BatchNorm2d(32), 
        # RELU phi tuyến
        nn.ReLU(), 
        # Giảm chiều không gian từ 224 -> 112
        nn.MaxPool2d(2, 2),
        
        # Tạo lớp tích chập thứ 2: Tăng ánh xạ đặc trưng từ 32 -> 64
        nn.Conv2d(32, 64, kernel_size=3, padding=1), 
        # Chuẩn hóa activation dùng cho huấn luyện được ổn định
        nn.BatchNorm2d(64), 
        # Phi tuyến tính
        nn.ReLU(), 
        # Giảm chiều không gian từ 112 -> 56
        nn.MaxPool2d(2, 2),
        
        # Tạo lớp tích chập thứ 3: Tăng ánh xạ đặc trưng từ 64 -> 128
        nn.Conv2d(64, 128, kernel_size=3, padding=1), 
        nn.BatchNorm2d(128), 
        nn.ReLU(), 
        # Giảm chiều không gian từ 56 -> 28
        nn.MaxPool2d(2, 2),
        
        # Tạo lớp tích chập thứ 4: Tăng ánh xạ đặc trưng từ 128 -> 256
        nn.Conv2d(128, 256, kernel_size=3, padding=1), 
        nn.BatchNorm2d(256), 
        nn.ReLU(), 
        # Giảm chiều không gian từ 28 -> 14
        nn.MaxPool2d(2, 2),
        
        # Giảm tham số, kháng over-fitting, thay theescho phần fully-connected
        nn.AdaptiveAvgPool2d(1), 
        nn.Flatten(),
        
        # Loại bỏ ngẫu nhiên 50% nơ-ron để kháng over-fitting
        nn.Dropout(0.5),
        nn.Linear(256, num_classes)
    )
    logging.info("Đã định nghĩa mô hình CNN thuần đã tối ưu")
    return model

def define_resnet18(num_classes: int = 38, use_pretrained: bool = True) -> nn.Module:
    """Hàm định nghĩa mô hình ResNet18 pre-trained."""
    # Tải trọng số ImageNet
    weights = models.ResNet18_Weights.IMAGENET1K_V1 if use_pretrained else None
    # Tải kiến trúc của ResNet18
    model = models.resnet18(weights=weights)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    logging.info("Đã define mô hình ResNet18.")
    return model

def define_mobilenetv2(num_classes=38, use_pretrained=True):
    """Hàm định nghĩa mô hình MobileNetV2 pre-trained."""
    if use_pretrained:
        weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
        model = models.mobilenet_v2(weights=weights)
    else:
        model = models.mobilenet_v2(weights=None)

    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, num_classes)
    logging.info("Đã define mô hình MobileNetV2.")
    return model

def define_efficientnetb0(num_classes: int = 38, use_pretrained: bool = True) -> nn.Module:
    """Hàm định nghĩa mô hình EfficientNet-B0 pre-trained."""
    if use_pretrained:
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
        model = models.efficientnet_b0(weights=weights)
    else:
        model = models.efficientnet_b0(weights=None)

    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, num_classes)
    logging.info("Đã define mô hình EfficientNet-B0.")
    return model

# 2. HÀM HUẤN LUYỆN CÁC MÔ HÌNH

def train_model(
    model: nn.Module, model_name: str, train_loader: Any, valid_loader: Any, 
    class_weights: torch.Tensor, device: torch.device, 
    epochs: int = 50, lr: float = 0.01, patience: int = 5
) -> Tuple[List[float], List[float], List[float], List[float]]:
    """Hàm huấn luyện mô hình"""
    model_path = f'models/best_{model_name}.pth'
    os.makedirs(os.path.dirname(model_path) or '.', exist_ok=True) 
    
    
    # Hàm mất mát: Sử dụng CrosEntropy + xử lý mất cân đối dữ liệu
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    
    # Sử dụng Adam để tính toán tốc độ học ( learning-rate ) cho mỗi tham số
    # Sử dụng L2 regularization để kháng over-fitting
    optimizer = optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-4) # Dùng LR thấp cho Transfer Learning
    
    # Giảm tốc độ học xuống nếu như chỉ số mất mát của tập valid không tăng
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=3, factor=0.5)
    
    train_losses, valid_losses, train_accs, valid_accs = [], [], [], []
    best_valid_loss = float('inf')
    patience_counter = 0
    model.to(device)
    
    # Bắt đầu huấn luyện mô hình theo kích thước epochs
    for epoch in range(epochs):
        
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        for images, labels in train_loader:
            # Chuyển dữ liệu sang GPU
            images, labels = images.to(device), labels.to(device)
            
            # Xóa Gradient cũ nếu có
            optimizer.zero_grad()
            outputs = model(images)
            
            # Tính hàm mất mát 
            loss = criterion(outputs, labels)
            # Tính gradient
            loss.backward()
            # Cập nhật các trọng số
            optimizer.step()
            # Ghi nhận các thống kê
            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        # Tính toán trung bình của mỗi epochs
        train_loss = running_loss / len(train_loader)
        train_acc = 100 * correct / total
        train_losses.append(train_loss)
        train_accs.append(train_acc)
        
        # --- Phần đánh giá  ---
        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        with torch.no_grad():
            for images, labels in valid_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
                
        val_loss = val_loss / len(valid_loader)
        val_acc = 100 * val_correct / val_total
        valid_losses.append(val_loss)
        valid_accs.append(val_acc)
        
        current_lr = optimizer.param_groups[0]['lr']
        logging.info(f"Epoch {epoch+1}/{epochs}: Train Loss {train_loss:.4f}, Acc {train_acc:.2f}% | Valid Loss {val_loss:.4f}, Acc {val_acc:.2f}% | LR: {current_lr:.6f}")
        
        # Cập nhật tham số tốc độ học (learning-rate)
        scheduler.step(val_loss)
        
        # --- EARLY STOPPING & SAVING ---
        if val_loss < best_valid_loss:
            best_valid_loss = val_loss
            patience_counter = 0
            torch.save(model.state_dict(), model_path)
            logging.info(f"Đã lưu mô hình tốt nhất cho {model_name} tại {model_path}")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                logging.info(f"Early stopping triggered for {model_name} (Best Loss: {best_valid_loss:.4f})")
                break
    
    return train_losses, valid_losses, train_accs, valid_accs

# 3. HÀM TRỰC QUAN HÓA (VISUALIZATION FUNCTION)

def plot_learning_curves(
    train_losses: List[float], valid_losses: List[float], 
    train_accs: List[float], valid_accs: List[float], 
    model_name: str, save_dir: str = 'plots'
):
    """Hàm vẽ learning curves (Loss và Accuracy)."""
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, f'{model_name}_learning_curves.png')
    
    epochs = range(1, len(train_losses) + 1)
    
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs, train_losses, label='Train Loss')
    plt.plot(epochs, valid_losses, label='Valid Loss')
    plt.title(f'{model_name} Loss Curve')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs, train_accs, label='Train Acc')
    plt.plot(epochs, valid_accs, label='Valid Acc')
    plt.title(f'{model_name} Accuracy Curve')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    logging.info(f"Đã lưu learning curves cho {model_name} tại {save_path}")

# 4. HÀM TỔNG HỢP VÀ SO SÁNH (CHỈ CHẠY MÔ HÌNH PRE-TRAINED)

def run_model_comparison(
    train_loader: Any, valid_loader: Any, class_weights: torch.Tensor, 
    device: torch.device, num_classes: int, epochs: int = 50, patience: int = 5
) -> Dict[str, Dict[str, str]]:
    """
    Hàm tổng hợp, chạy huấn luyện, vẽ biểu đồ và thu thập kết quả so sánh của các mô hình
    ResNet18, MobileNetV2, và EfficientNetB0.
    """
    # Danh sách mô hình cần huấn luyện 
    models_to_train: Dict[str, nn.Module] = {
        'ResNet18': define_resnet18(num_classes, use_pretrained=True),
        'MobileNetV2': define_mobilenetv2(num_classes, use_pretrained=True),
        'EfficientNetB0': define_efficientnetb0(num_classes, use_pretrained=True),
    }

    results = {}
    
    for model_name, model in models_to_train.items():
        logging.info(f"\n--- Bắt đầu huấn luyện mô hình {model_name} ---")
        
        # Huấn luyện mô hình và lấy lịch sử Loss/Acc
        train_losses, valid_losses, train_accs, valid_accs = train_model(
            model, model_name, train_loader, valid_loader, class_weights, device, 
            epochs=epochs, patience=patience
        )
        
        # Vẽ và lưu Learning Curves
        plot_learning_curves(train_losses, valid_losses, train_accs, valid_accs, model_name)
        
        # Thu thập kết quả tốt nhất (cho mục đích báo cáo)
        best_val_acc = max(valid_accs) if valid_accs else 0.0
        best_val_loss = min(valid_losses) if valid_losses else float('inf')

        results[model_name] = {
            'best_val_acc': f"{best_val_acc:.2f}%",
            'best_val_loss': f"{best_val_loss:.4f}",
            'epochs_run': len(train_losses)
        }

    # In ra kết quả tóm tắt cuối cùng
    logging.info("\n=========================================================")
    logging.info("--- KẾT QUẢ TÓM TẮT SO SÁNH CÁC MÔ HÌNH (DÙNG CHO BÁO CÁO) ---")
    for model, res in results.items():
        logging.info(f"| Model: {model.ljust(14)} | Best Val Acc: {res['best_val_acc'].ljust(6)} | Best Val Loss: {res['best_val_loss'].ljust(6)} | Epochs: {res['epochs_run']}")
    logging.info("=========================================================")

    return results

# 5. KHỐI CHẠY CHÍNH 

if __name__ == "__main__":
    try:
        from preprocessing import get_device, load_datasets, get_dataloaders, compute_class_weights
    except ImportError:
        logging.error("Lỗi: Không tìm thấy preprocessing.py")
        exit()
    
    ds_dir = r"E:\New_Plant_Diseases_Project\data\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)"
    train_dir = os.path.join(ds_dir, 'train')
    valid_dir = os.path.join(ds_dir, 'valid')
    
    device = get_device()
    logging.info(f"Thiết bị: {device}")
    
    try:
        train_ds, valid_ds = load_datasets(train_dir, valid_dir)
        train_loader, valid_loader = get_dataloaders(train_ds, valid_ds, batch_size=32)
        class_weights = compute_class_weights(train_ds)
        num_classes = len(train_ds.classes)
    except Exception as e:
        logging.error(f"Lỗi dữ liệu: {e}")
        exit()

    logging.info(f"Số lớp: {num_classes}")

    # CHỈ CHẠY CNN THUẦN
    logging.info("\n--- HUẤN LUYỆN CNN THUẦN ---")
    cnn_model = define_cnn(num_classes=num_classes)
    cnn_model.to(device)

    train_losses, valid_losses, train_accs, valid_accs = train_model(
        model=cnn_model,
        model_name="CNN",
        train_loader=train_loader,
        valid_loader=valid_loader,
        class_weights=class_weights,
        device=device,
        epochs=50,  # Tăng epochs vì CNN học từ đầu
        lr=0.001,
        patience=15
    )

    plot_learning_curves(train_losses, valid_losses, train_accs, valid_accs, "CNN")

    best_acc = max(valid_accs)
    best_loss = min(valid_losses)
    logging.info("\n" + "="*60)
    logging.info("HOÀN TẤT!")
    logging.info(f"Best Valid Acc: {best_acc:.2f}%")
    logging.info(f"Best Valid Loss: {best_loss:.4f}")
    logging.info(f"Model: models/best_CNN.pth")
    logging.info(f"Plot: plots/CNN_learning_curves.png")
    logging.info("="*60)