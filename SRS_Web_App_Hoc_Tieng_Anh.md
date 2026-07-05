# TÀI LIỆU YÊU CẦU PHẦN MỀM (SRS) - WEB APP HỌC TIẾNG ANH

## 1. Tổng quan dự án & Công nghệ (Project Overview & Tech Stack)
* **Mục tiêu:** Phát triển một ứng dụng web (Web App) hỗ trợ học tiếng Anh qua các trò chơi tương tác, hoạt động mượt mà trên cả Máy tính (Desktop) và Điện thoại di động (Mobile).
* **Công nghệ phát triển:**
    * **Frontend:** React (Đảm bảo giao diện Responsive, Single Page Application).
    * **Database:** SQLite (Lưu trữ tệp tin database ngay trong thư mục project để dễ dàng deploy và quản lý).
* **Phong cách thiết kế (Theme color):** Giao diện sử dụng tone màu chủ đạo là **Trắng** và **Xanh lục minh diệp** (Lấy cảm hứng từ bộ nhận diện thương hiệu của hãng taxi Xanh SM).

---

## 2. Quản lý Tài khoản & Đăng nhập (Authentication & Accounts)
### 2.1. Cơ chế Đăng nhập (Login Mechanism)
* **Thông tin đăng nhập:** Gồm `Account` (Tên đăng nhập/Số điện thoại) và `Password`.
* **Quy định Mật khẩu:** Mật khẩu bắt buộc **chỉ gồm đúng 4 chữ số** (Dạng PIN code để người dùng dễ nhớ và thao tác nhanh trên mobile).
* **Duy trì phiên đăng nhập:** * Hệ thống có chức năng tự động lưu trạng thái đăng nhập sau khi tắt trình duyệt.
    * Mã xác thực (Token) **không bao giờ hết hạn**, người dùng sẽ luôn ở trạng thái đăng nhập trừ khi chủ động bấm nút `Logout` (Đăng xuất).

### 2.2. Phân quyền và Tính năng Admin (Admin Dashboard)
Hệ thống chia làm 2 quyền: **User (Người dùng thường)** và **Admin**. Khi tài khoản có quyền Admin đăng nhập, hệ thống sẽ mở thêm một menu/giao diện quản trị với các tính năng sau:
* **Tạo tài khoản mới (Create Account):** Cho phép Admin chủ động tạo tài khoản mới cho người dùng (Nhập Username, Password 4 số, chọn vai trò).
* **Quản lý danh sách tài khoản:** Hiển thị danh sách toàn bộ các tài khoản đang có trong hệ thống dưới dạng bảng hoặc danh sách thẻ.
* **Tìm kiếm tức thì (Search On-change):** Ô tìm kiếm tài khoản hoạt động theo cơ chế `onchange`. Khi Admin gõ bất kỳ ký tự nào, danh sách tài khoản sẽ lập tức lọc (filter) theo thời gian thực mà không cần bấm nút Tìm kiếm.
* **Chỉnh sửa & Kiểm soát tài khoản:** Admin có toàn quyền tác động lên **bất kỳ tài khoản nào** trong hệ thống bao gồm:
    * Sửa thông tin tài khoản.
    * Đổi mật khẩu (Reset password về 4 số mới).
    * Xóa tài khoản khỏi hệ thống.

---

## 3. Giao diện Trang chủ (Home Page)
* **Sau khi Đăng nhập:** Người dùng thường sẽ vào thẳng giao diện danh sách game. Admin sẽ có thêm lối tắt đi đến trang Quản lý tài khoản.
* **Danh sách Game hiển thị:**
    1.  **Game Quiz (Trắc nghiệm):** Chỉ hiển thị Icon placeholder kèm trạng thái "Coming Soon" (Chưa phát triển tính năng bên trong).
    2.  **Game Lật thẻ bài (Flipcard):** Khi bấm vào Icon sẽ chuyển hướng sang màn hình chơi và thiết kế của Game này.

---

## 4. Chi tiết Tính năng: Game Lật Thẻ Bài (Flipcard)
Giao diện bao gồm 2 phân hệ lớn: **Thiết kế nội dung game** và **Danh sách game đã có**.

### 4.1. Thiết kế nội dung game (Game Creator)
* **Các trường nhập liệu:**
    * `Title`: Tiêu đề của bộ game.
    * `Nội dung`: Nhận vào một đoạn văn bản (Text) gồm nhiều nhóm câu phân tách nhau bằng dấu chấm phẩy (`;`). Mỗi nhóm có cấu trúc: `câu tiếng việt|câu tiếng anh`.
    * *Ví dụ:* `Xin chào|Hello;Tạm biệt|Goodbye;Cảm ơn|Thank you`
* **Các nút chức năng:**
    * `Save`: Kiểm tra định dạng chuỗi text (validation), bóc tách dữ liệu để lưu vào DB SQLite và cập nhật danh sách game.
    * `Cancel`: Xóa sạch dữ liệu đang nhập trong các ô input để nhập lại từ đầu.

### 4.2. Danh sách game đã có & Giao diện chơi (Game List & Play)
* **Danh sách game:** Hiển thị toàn bộ các bộ game đã được lưu. Bấm vào một bộ game bất kỳ để bắt đầu chơi.
* **Logic lật thẻ bài (Vòng lặp 3 trạng thái của 1 thẻ):**
    * *Trạng thái ban đầu:* Thẻ bài ở trạng thái úp xuống (Ẩn nội dung).
    * *Bấm lần 1:* Lật thẻ, hiển thị nội dung **Tiếng Việt**.
    * *Bấm lần 2:* Thẻ đổi màu/hiệu ứng, hiển thị nội dung **Tiếng Anh** tương ứng.
    * *Bấm lần 3:* Thẻ úp lại như trạng thái ban đầu.
* **Yêu cầu về Layout & Phân trang:**
    * Giao diện bàn bài phải co giãn (Responsive) chuẩn theo màn hình Mobile và PC.
    * **Bắt buộc:** Số lượng thẻ trên mỗi trang được tính toán vừa vặn để **không xuất hiện thanh cuộn dọc (No vertical scroll)** trên màn hình chơi. Người dùng đổi trang qua thanh phân trang (Pagination).
* **Nút chức năng trên bàn chơi:**
    * Bổ sung nút **"Úp tất cả thẻ bài"**: Khi bấm vào, tất cả các thẻ đang lật (dù ở trạng thái Tiếng Anh hay Tiếng Việt) ở trang hiện tại sẽ lập tức úp xuống trạng thái ban đầu.

---

## 5. Yêu cầu Phi chức năng & Trải nghiệm (Non-functional Requirements)
* **UI/UX:** Giao diện tối giản, thanh lịch với màu xanh lục minh diệp làm điểm nhấn (cho các nút bấm, viền thẻ bài hoạt họa, hoặc thanh menu). Hiệu ứng lật bài (Flip animation) của React cần mượt mà, không bị giật lag trên mobile cấu hình thấp.
* **Bảo mật & Lưu trữ:** Dữ liệu mật khẩu trong SQLite nên được mã hóa (băm) cơ bản, cấu hình Token lưu ở `LocalStorage` hoặc `Cookie` để duy trì trạng thái đăng nhập vĩnh viễn cho đến khi nhấn Logout.
