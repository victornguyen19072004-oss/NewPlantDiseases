Hướng dẫn cách triển khai dự án New_Plant_Diseases_Project

Yêu cầu hệ thống:
   - Đã cài đặt python & nodejs

1. Sau khi tải file nén: New_Plant_Diseases_Project.rar thì giải nén ra một ổ đĩa
2. Để sản phẩm có thể chạy cần giải nén các thư mục: models, data, features, plots, reports theo đúng cấu trúc của dự án nghen
   - Đường dẫn file nén data: https://drive.google.com/file/d/1ToLVjdanVOSparAgljyL6w2QLrN8dKW_/view?usp=sharing
   - Đường dẫn file nén models: https://drive.google.com/file/d/1jrdp6Tf0UnZ99uq3RCH87m1_xHnHqEH-/view?usp=sharing
   - Đường dẫn file nén features: https://drive.google.com/file/d/1oqqVdHuS4CJ9SKjC5A3sb6MuZxIHdYKe/view?usp=sharing
   - Đường dẫn file nén plots: https://drive.google.com/file/d/1DKvP2TAziAQGjT_WoEK1eQ1I5u2kW6OA/view?usp=sharing
   - Đường dẫn file nén reports: https://drive.google.com/file/d/1FKKZqVFSL559F-CT-EqNtd5wZuR5P2wl/view?usp=sharing

3. Thiết lập môi trường ảo
      - Thiết lập môi trường ảo: python -m venv venv
      - Kích hoạt môi trường ảo: venv\Scripts\activate

4. Cài đặt các gói front-end:
   - Di chuyển vào thư mục web: cd web
   - Cài thư viện Node.js: npm install --legacy-peer-deps
   - Để chạy web local: npm run dev ( nhưng mà trước đó hãy chạy phần api trước)

5. Cài đặt các gói back-end:
   5.1. Chạy toàn bộ dự án: python -m src.run ( bao gồm tải các gói phụ thuộc )
      - Phần này bao gồm kiểm tra và cài đặt các gói phụ thuộc
      - Khởi động dự án


8. Sau khi chạy xong file run.py thì hãy truy cập vào đường dẫn: http://localhost:3000
Các phần không cần tải lên github để tránh xung đột các package

   
