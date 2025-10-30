
import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
from torchvision import datasets

# === CẤU HÌNH THƯ MỤC ===
PLOTS_DIR = "plots"
REPORTS_DIR = "reports"
os.makedirs(PLOTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
sns.set_style("whitegrid")

# === TẢI SỐ LƯỢNG MẪU MỖI LỚP ===
def load_dataset_counts(train_dir: str, valid_dir: str):
    """Đọc dataset → trả về danh sách lớp và số mẫu."""
    train_ds = datasets.ImageFolder(train_dir)
    valid_ds = datasets.ImageFolder(valid_dir)
    
    if train_ds.classes != valid_ds.classes:
        raise ValueError("Lớp train và valid không khớp!")
    
    classes = train_ds.classes
    train_counts = Counter(train_ds.targets)
    valid_counts = Counter(valid_ds.targets)
    
    return classes, train_counts, valid_counts, train_ds, valid_ds

# === TẠO DATAFRAME CHI TIẾT ===
def create_eda_dataframe(classes, train_counts, valid_counts):
    """Tạo bảng thống kê: cây, lớp, train, valid, tổng."""
    data = []
    for i, cls in enumerate(classes):
        plant = cls.split("___")[0].replace("_", " ")
        train = train_counts.get(i, 0)
        valid = valid_counts.get(i, 0)
        total = train + valid
        data.append({
            "Loại cây": plant,
            "Lớp": cls,
            "Train": train,
            "Valid": valid,
            "Tổng": total
        })
    
    df = pd.DataFrame(data).sort_values("Tổng", ascending=False).reset_index(drop=True)
    df.to_csv(f"{REPORTS_DIR}/plantDS.csv", index=False, encoding="utf-8")
    return df

# === HÀM LƯU BIỂU ĐỒ ===
def save_plot(fig, path: str):
    """Lưu biểu đồ với chất lượng cao."""
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)

# === BIỂU ĐỒ 1: PHÂN BỐ THEO LỚP ===
def plot_class_distribution(df):
    """Biểu đồ cột: số ảnh mỗi lớp."""
    fig, ax = plt.subplots(figsize=(14, 6))
    sns.barplot(data=df, x="Lớp", y="Tổng", hue="Lớp", ax=ax, palette="viridis", legend=False)
    ax.set_title("Phân bố số ảnh mỗi lớp (Train + Valid)", pad=20)
    ax.tick_params(axis='x', rotation=90, labelsize=8)
    ax.set_ylabel("Số ảnh")
    save_plot(fig, f"{PLOTS_DIR}/eda_class_distribution.png")

# === BIỂU ĐỒ 2: TRAIN VS VALID ===
def plot_train_valid_split(df):
    """Biểu đồ nhóm: so sánh train/valid."""
    df_melt = df.melt(id_vars="Lớp", value_vars=["Train", "Valid"], var_name="Split", value_name="Số ảnh")
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.barplot(data=df_melt, x="Lớp", y="Số ảnh", hue="Split", ax=ax, palette="Set2")
    ax.set_title("Train vs Valid theo lớp")
    ax.set_xticklabels([])
    ax.legend(title="Split")
    save_plot(fig, f"{PLOTS_DIR}/eda_train_valid_split.png")

# === BIỂU ĐỒ 3 & 4: TOP 10 NHIỀU / ÍT ===
def plot_top_bottom_classes(df):
    """Vẽ 2 biểu đồ: top 10 nhiều & ít ảnh."""
    # Top 10 nhiều
    top10 = df.head(10)
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.barplot(data=top10, x="Lớp", y="Tổng", hue="Lớp", ax=ax, palette="Greens_d", legend=False)
    ax.set_title("Top 10 lớp có nhiều ảnh nhất")
    ax.tick_params(axis='x', rotation=45, ha='right')
    save_plot(fig, f"{PLOTS_DIR}/eda_top10_classes.png")

    # Top 10 ít
    bottom10 = df.tail(10)
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.barplot(data=bottom10, x="Lớp", y="Tổng", hue="Lớp", ax=ax, palette="Reds_d", legend=False)
    ax.set_title("Top 10 lớp có ít ảnh nhất")
    ax.tick_params(axis='x', rotation=45, ha='right')
    save_plot(fig, f"{PLOTS_DIR}/eda_bottom10_classes.png")

# === BIỂU ĐỒ 5: SỐ LỚP BỆNH MỖI CÂY ===
def plot_plant_distribution(df):
    """Biểu đồ cột: số lớp bệnh mỗi loại cây."""
    plant_counts = df["Loại cây"].value_counts().reset_index()
    plant_counts.columns = ["Loại cây", "Số lớp bệnh"]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(data=plant_counts, x="Loại cây", y="Số lớp bệnh", hue="Loại cây", ax=ax, palette="muted", legend=False)
    ax.set_title("Số lớp bệnh (bao gồm healthy) mỗi loại cây")
    ax.tick_params(axis='x', rotation=45)
    ax.set_ylabel("Số lớp")
    save_plot(fig, f"{PLOTS_DIR}/eda_plant_distribution.png")

# === KIỂM TRA IMBALANCE ===
def compute_imbalance_info(train_counts, classes):
    """Tính tỷ lệ mất cân bằng."""
    counts = [train_counts.get(i, 0) for i in range(len(classes))]
    max_idx = counts.index(max(counts))
    min_idx = counts.index(min(c for c in counts if c > 0))
    
    return {
        "max_class": classes[max_idx],
        "max_count": counts[max_idx],
        "min_class": classes[min_idx],
        "min_count": counts[min_idx],
        "imbalance_ratio": round(counts[max_idx] / counts[min_idx], 2)
    }

# === CHẠY TOÀN BỘ EDA ===
def run_eda(train_dir: str, valid_dir: str):
    """Chạy toàn bộ pipeline EDA."""
    # 1. Tải dữ liệu
    classes, train_counts, valid_counts, train_ds, valid_ds = load_dataset_counts(train_dir, valid_dir)
    
    # 2. Tạo DataFrame
    df = create_eda_dataframe(classes, train_counts, valid_counts)
    
    # 3. Vẽ 5 biểu đồ bao gồm: 
       # 3.1. Phân bổ dữ liệu theo lớp
       # 3.2. Phân bổ dữ liệu theo tập train và valid
       # 3.3 & 3.4. Top 10 lớp có dữ liệu nhiều nhất & top 10 lớp có dữ liệu ít nhất
       # 3.5. Số lớp bệnh ở mỗi cây
    plot_class_distribution(df)
    plot_train_valid_split(df)
    plot_top_bottom_classes(df)
    plot_plant_distribution(df)
    
    # 4. kiểm tra mất cân đối dữ liệu giữa các lớp
    imbalance_info = compute_imbalance_info(train_counts, classes)
    
    # 5. Tạo các dòng json tóm tắt
    summary = {
        "total_samples": len(train_ds) + len(valid_ds),
        "num_classes": len(classes),
        "train_samples": len(train_ds),
        "valid_samples": len(valid_ds),
        "num_plants": len(set(cls.split("___")[0].replace("_", " ") for cls in classes)),
        **imbalance_info
    }
    
    with open(f"{REPORTS_DIR}/eda_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    return df, summary

# Chạy đoạn mã trực tiếp bằng hàm main
if __name__ == "__main__":
    ds_dir = r"E:\New_Plant_Diseases_Project\data\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)"
    train_dir = os.path.join(ds_dir, "train")
    valid_dir = os.path.join(ds_dir, "valid")
    run_eda(train_dir, valid_dir)
    # Khám phá và phân tích bộ dữ liệu + có file JSON tóm tắ
    # Sau khi thực thi: Các biểu đồ được lưu trữ trong plots, file json tổng quan eda, file dataframe về bộ dữ liệu 