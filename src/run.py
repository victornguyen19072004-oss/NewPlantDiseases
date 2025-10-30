# src/run.py – HOÀN HẢO: TỰ CÀI + TỰ FIX ĐƯỜNG DẪN + REACT 18 + NPM FIX

import subprocess
import sys
import os
import time
import shutil
import json

# === ĐƯỜNG DẪN CẤU HÌNH CHUNG ===
# Tự động xác định thư mục gốc của dự án
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB_DIR = os.path.join(BASE_DIR, "web")
MODELS_DIR = os.path.join(BASE_DIR, "models")
SRC_DIR = os.path.join(BASE_DIR, "src")
REPORT_DIR = os.path.join(BASE_DIR, "reports")

# === 1. CÀI ĐẶT PYTHON (Giữ nguyên logic) ===

def install_python_packages():
    """Cài đặt các gói Python từ requirements.txt."""
    print("Cài các gói Python: torch, flask, seaborn, grad-cam...")
    try:
        # Cài từ requirements.txt
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                       check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        # Cài pytorch-grad-cam từ GitHub
        print("Cài pytorch-grad-cam từ GitHub...")
        subprocess.run([sys.executable, "-m", "pip", "install", "git+https://github.com/jacobgil/pytorch-grad-cam.git"], 
                       check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    except Exception as e:
        print(f"Lỗi khi cài đặt gói Python: {e}")
        sys.exit(1)
    print("Đã cài đặt gói Python thành công.")

# === 2. CÀI ĐẶT WEB (FIX LỖI NPM) ===

# Biến toàn cục để lưu đường dẫn đầy đủ của NPM
NPM_PATH = None

def check_npm():
    """Kiểm tra và lưu đường dẫn đầy đủ của npm để khắc phục WinError 2."""
    global NPM_PATH
    # Sử dụng shutil.which để tìm đường dẫn tuyệt đối của npm
    npm_exec_path = shutil.which("npm")
    
    if npm_exec_path is None:
        print("Lỗi npm → cần cài Node.js!")
        print("Vui lòng cài đặt Node.js từ https://nodejs.org")
        return False
    
    NPM_PATH = npm_exec_path # LƯU ĐƯỜNG DẪN ĐẦY ĐỦ
    print(f"Đã tìm thấy NPM tại: {NPM_PATH}")
    return True

def fix_package_json():
    """Cập nhật package.json để dùng React 18 (nếu cần)."""
    package_path = os.path.join(WEB_DIR, "package.json")
    if not os.path.exists(package_path):
        print(f"Lỗi: Không tìm thấy {package_path}. Bỏ qua chỉnh sửa web.")
        return
    
    print("Cập nhật package.json → dùng React 18...")
    with open(package_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Logic chỉnh sửa dependency giữ nguyên (để đảm bảo tương thích Next.js)
    if "dependencies" in data and "react" in data["dependencies"] and not data["dependencies"]["react"].startswith("^18"):
        data["dependencies"]["react"] = "^18.2.0"
    if "devDependencies" in data and "eslint-config-next" in data["devDependencies"] and not data["devDependencies"]["eslint-config-next"].startswith("14"):
        data["devDependencies"]["eslint-config-next"] = "14.2.5"

    with open(package_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
            
def install_web_deps():
    """Cài đặt các gói Node/NPM cho thư mục web."""
    if not os.path.exists(WEB_DIR) or not check_npm():
        return
        
    print("Cài Web dependencies (dùng --legacy-peer-deps)...")
    original_cwd = os.getcwd()
    os.chdir(WEB_DIR)
    
    try:
        # SỬ DỤNG NPM_PATH để gọi lệnh npm
        subprocess.run([NPM_PATH, "install", "--legacy-peer-deps"], check=True, 
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Đã cài đặt Web dependencies thành công.")
    except subprocess.CalledProcessError as e:
        print(f"Lỗi khi cài đặt gói NPM: {e.stderr}")
        print("Vui lòng kiểm tra lại cấu hình Node/NPM.")
        sys.exit(1)
    finally:
        os.chdir(original_cwd)

# === 3. TÌM DATASET ===

def find_dataset_path():
    """Tìm đường dẫn thư mục valid của dataset (dùng đường dẫn tương đối)."""
    valid_path_1 = os.path.join(
        BASE_DIR, 
        "data", 
        "New Plant Diseases Dataset(Augmented)", 
        "New Plant Diseases Dataset(Augmented)", 
        "valid"
    )
    
    if os.path.exists(valid_path_1) and os.path.isdir(valid_path_1):
        return valid_path_1
    
    print("CẢNH BÁO: Không tìm thấy thư mục dataset mặc định.")
    return None

# === 4. CHẠY CÁC TIẾN TRÌNH ===

def run_api(valid_dir):
    """Khởi động API Flask."""
    print("Khởi động API tại http://localhost:5000")
    # Đặt biến môi trường VALID_DIR để API và Evaluation có thể tìm thấy dataset
    env = os.environ.copy()
    env["VALID_DIR"] = valid_dir
    # Sử dụng python -m api.app để chạy module (API)
    return subprocess.Popen([sys.executable, "-m", "api.app"], env=env)

def run_web():
    """Khởi động Web Next.js (Sử dụng NPM_PATH đã tìm thấy)."""
    if not check_npm():
        return None
    
    if NPM_PATH is None: 
        return None

    print("Khởi động Web tại http://localhost:3000")
    original_cwd = os.getcwd()
    os.chdir(WEB_DIR)
    
    # SỬ DỤNG NPM_PATH ĐÃ ĐƯỢC XÁC ĐỊNH
    try:
        web_proc = subprocess.Popen([NPM_PATH, "run", "dev"])
    except Exception as e:
        print(f"LỖI KHỞI ĐỘNG WEB: {e}")
        web_proc = None
    
    os.chdir(original_cwd)
    return web_proc

# === MAIN LOGIC ===

def main():
    print("SẢN PHẨM NHẬN DIỆN BỆNH TRÊN LÁ CÂY THỰC VẬT")
    print("="*70)

    # Đảm bảo chạy từ thư mục gốc và có thể import các module src/api
    os.chdir(BASE_DIR) 
    if BASE_DIR not in sys.path:
        sys.path.append(BASE_DIR)

    # 1. Cài đặt Python
    # install_python_packages()
    
    # 2. Cài đặt Web (kiểm tra npm và cài gói web)
    # fix_package_json()
    # install_web_deps()
    
    # 3. Tìm đường dẫn dataset
    valid_dir = find_dataset_path()
    if valid_dir is None:
        print("Lỗi: Đường dẫn không khớp, hãy kiểm tra đường dẫn lưu trữ dataset.")
        sys.exit(1)
        
    print(f"Đã tìm thấy dataset: {valid_dir}")

    # 4. Khởi động API và Web song song
    api_proc = run_api(valid_dir)
    web_proc = run_web() # Lần này chắc chắn sẽ thành công nếu npm được cài đúng

    print("\n" + "="*70)
    print("HOÀN TẤT!")
    print(f"   API: http://localhost:5000")
    if web_proc:
        print(f"   WEB: http://localhost:3000")
    else:
        print("   WEB: Bỏ qua do lỗi NPM/Node.js.")
        
    print("   Nhấn Ctrl+C để dừng.")
    print("="*70)

    try:
        # Chờ cả hai tiến trình kết thúc (hoặc người dùng nhấn Ctrl+C)
        if api_proc: api_proc.wait()
        if web_proc: web_proc.wait()
    except KeyboardInterrupt:
        print("\nĐang tắt các tiến trình...")
    finally:
        # Tắt các tiến trình con
        if api_proc and api_proc.poll() is None:
            api_proc.terminate()
            api_proc.wait()
        if web_proc and web_proc.poll() is None:
            web_proc.terminate()
            web_proc.wait()
        print("Đã dừng chương trình.")

if __name__ == "__main__":
    main()