import os
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

# Thiết lập thiết bị để thực thi ( có thể CPU hoặc GPU)
def get_device():
    """Trả về GPU nếu có, còn nếu không thì dùng CPU."""
    return torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Biến đổi dữ liệu của tập train & bổ sung thêm bước tăng cường dữ liệu thực tế
def get_transforms(is_train: bool = True):
    # Tạo pipeline biến đổi ảnh cho tập train và tập valid.
    if is_train:
        return transforms.Compose([
            # Thay đổi độ sáng và độ tương phản của hình ảnh
            transforms.ColorJitter(brightness=0.2, contrast=0.2),
            # Xoay mỗi ảnh ngẫu nhiên 30 độ
            transforms.RandomRotation(30),
            # Cắt xén và làm nghiêng ảnh
            transforms.RandomAffine(degrees=0, shear=20),
            # Làm mờ nhẹ cho hình ảnh
            transforms.Resize((224, 224)),
            # Chuyển PIL -> Tensor [0, 1]
            transforms.ToTensor(),
            
            transforms.RandomApply([transforms.GaussianBlur(kernel_size=3)], p=0.3),
            
            transforms.RandomErasing(p=0.5, scale=(0.02, 0.33), value='random'),
            # Chuẩn hóa giúp hội tụ nhanh hơn
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

# Tải 2 tập là tập train đã được tăng cường dữ liệu & tập valid không tăng cường dữ liệu
def load_datasets(train_dir: str, valid_dir: str):
    """Tải dữ liệu cho tập train đã được biến đổi và tăng cường
       Tải dữ liệu cho tập valid nhưng chỉ biến đổi không tăng cường
    """
    train_ds = datasets.ImageFolder(train_dir, transform=get_transforms(True))
    valid_ds = datasets.ImageFolder(valid_dir, transform=get_transforms(False))
    return train_ds, valid_ds

# Tải 1 tập dữ liệu là tập test ( nếu dùng được )
def load_single_dataset(dir_path: str):
    
    if not dir_path:
        return None
    dataset = datasets.ImageFolder(dir_path, transform=get_transforms(False))
    return dataset

# # Đóng gói các bộ dữ liệu vào DataLoader để huấn luyện mô hình theo batch
def get_dataloaders(train_ds, valid_ds, batch_size: int = 32):
    # Có sử dụng num_workers để huấn luyện song song nếu có GPU
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4)
    valid_loader = DataLoader(valid_ds, batch_size=batch_size, shuffle=False, num_workers=4)
    return train_loader, valid_loader

# Tính trọng số của lớp
def compute_class_weights(train_ds):
    """Tính trọng số lớp để xử lý imbalance.
       Tính trọng số lớp theo công thức 'balanced'
       Dùng trong CrosEntropyLoss
       Theo cơ chế: Lớp nào ít mẫu thì trọng số cao -> Mô hình sẽ quan tâm nhiều hơn
    """
    labels = [label for _, label in train_ds]
    weights = compute_class_weight('balanced', classes=np.unique(labels), y=labels)
    return torch.tensor(weights, dtype=torch.float)

# Khử chuẩn hoá để hiển thị hình ảnh
def inverse_transform(image):
    """Chuyển tensor → PIL để hiển thị"""
    return transforms.Compose([
        transforms.Normalize(mean=[-0.485/0.229, -0.456/0.224, -0.406/0.225],
                             std=[1/0.229, 1/0.224, 1/0.225]),
        transforms.ToPILImage()
    ])(image)

# Thực thi
if __name__ == "__main__":
    ds_dir = r"E:\New_Plant_Diseases_Project\data\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)"
    train_dir = os.path.join(ds_dir, 'train')
    valid_dir = os.path.join(ds_dir, 'valid')
    
    train_ds, valid_ds = load_datasets(train_dir, valid_dir)
    train_loader, valid_loader = get_dataloaders(train_ds, valid_ds)
    weights = compute_class_weights(train_ds)