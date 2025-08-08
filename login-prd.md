Product Requirements Document (PRD)
Feature: Supabase Authentication & User Data Storage for English Practice App

1. Mục tiêu tính năng
Bổ sung cơ chế đăng ký, đăng nhập, quản lý tài khoản người dùng, và lưu trữ playlist/audio cá nhân dựa trên tài khoản bằng Supabase.
Mục tiêu:

Cho phép người dùng tạo tài khoản hoặc đăng nhập bằng email/password.

Lưu trữ playlist, audio, và metadata tương ứng với từng user.

Đồng bộ dữ liệu giữa các thiết bị.

Chuẩn bị nền tảng để triển khai thêm social login trong tương lai.

2. Phạm vi
Bao gồm:

Tích hợp Supabase Auth (email/password) vào ứng dụng React hiện tại.

Tạo schema database trên Supabase để quản lý:

users (tài khoản)

playlists

audios

API tương tác (CRUD) giữa client và Supabase.

Giao diện đăng nhập/đăng ký.

Cập nhật store usePlaylistStore để fetch dữ liệu từ Supabase.

Upload file audio lên Supabase Storage thay vì chỉ giữ local.

Không bao gồm (giai đoạn này):

Social login (Google, Facebook…).

Cơ chế chia sẻ playlist giữa user.

Role-based access control nâng cao.

Quản lý quota dung lượng người dùng.

3. Yêu cầu chức năng
3.1 Authentication
ID	Mô tả	Ưu tiên
AUTH-1	Người dùng có thể đăng ký bằng email và password	Cao
AUTH-2	Người dùng có thể đăng nhập và đăng xuất	Cao
AUTH-3	Kiểm tra phiên đăng nhập khi reload trang	Cao
AUTH-4	Quản lý lỗi đăng nhập (sai mật khẩu, email đã tồn tại)	Cao
AUTH-5	Cập nhật thông tin người dùng cơ bản (tên hiển thị)	Trung

3.2 Playlist Management (per-user)
ID	Mô tả	Ưu tiên
PL-1	Lưu playlist vào Supabase Postgres kèm owner_id	Cao
PL-2	Chỉ fetch playlist thuộc current_user	Cao
PL-3	CRUD playlist (create/update/delete)	Cao
PL-4	Tự động cập nhật updated_at khi chỉnh sửa	Trung

3.3 Audio Management (per-user)
ID	Mô tả	Ưu tiên
AU-1	Upload audio file vào Supabase Storage (bucket riêng)	Cao
AU-2	Lưu metadata (tên file, url, duration, playlist_id, owner_id) vào DB	Cao
AU-3	Fetch audio theo playlist và user	Cao
AU-4	Xóa audio sẽ xóa cả file trong Storage	Cao

4. Yêu cầu phi chức năng (Non-Functional Requirements)
Bảo mật:

Mỗi user chỉ truy cập được dữ liệu của mình (RLS - Row Level Security).

Mật khẩu được Supabase hash an toàn.

Hiệu năng:

Fetch playlist và audio phải dưới 200ms cho 50 record đầu.

Khả năng mở rộng:

Dễ mở rộng thêm social login.

Có thể áp dụng phân trang khi số lượng audio lớn.

Trải nghiệm người dùng:

Thông báo lỗi rõ ràng.

Loading indicator khi đang fetch/upload.

5. Thiết kế kiến trúc & CSDL
5.1 Supabase Tables
users (Supabase Auth có sẵn)

Column	Type	Description
id	uuid	Khóa chính
email	text	Email user
created_at	timestamp	Ngày tạo
display_name	text	Tên hiển thị (optional)

playlists

Column	Type	Description
id	uuid	PK
owner_id	uuid	FK → users.id
name	text	Tên playlist
description	text	Mô tả
visibility	text	'private', 'public'
cover_image	text	URL ảnh bìa
created_at	timestamp	Ngày tạo
updated_at	timestamp	Ngày cập nhật

audios

Column	Type	Description
id	uuid	PK
owner_id	uuid	FK → users.id
playlist_id	uuid	FK → playlists.id
name	text	Tên file
url	text	Đường dẫn file trên Supabase Storage
duration	int	Thời lượng giây
created_at	timestamp	Ngày tạo
updated_at	timestamp	Ngày cập nhật

5.2 Supabase Storage
Bucket: audios

Cấu trúc file:

swift
Copy
Edit
audios/{user_id}/{playlist_id}/{file_name}
5.3 Row Level Security (RLS) Policy
playlists:

sql
Copy
Edit
CREATE POLICY "Users can view own playlists"
ON playlists FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own playlists"
ON playlists FOR INSERT
WITH CHECK (owner_id = auth.uid());
audios: tương tự, kiểm tra owner_id.

6. Luồng người dùng (User Flow)
Đăng nhập/Đăng ký

Mở app → nếu chưa đăng nhập → redirect đến LoginPage.

Người dùng nhập email + password → Supabase Auth → lưu session vào local storage.

Quản lý playlist

User tạo playlist mới → gửi request Supabase → trả về playlist ID → cập nhật store usePlaylistStore.

Upload audio

Chọn file → upload lên Supabase Storage → nhận URL → lưu metadata vào table audios.

Truy cập dữ liệu

Mỗi khi vào PlaylistPage → fetch playlist và audio thuộc user hiện tại.

7. UI/UX Requirements
LoginPage:

Form email/password

Nút “Đăng ký” chuyển sang register form

RegisterPage:

Form email/password + display name

Thông báo lỗi rõ ràng

PlaylistPage:

Danh sách playlist của user

Nút tạo mới playlist

UploadAudioPage:

Chọn playlist → upload file → hiển thị tiến trình upload

Global:

Avatar + menu dropdown (Profile, Logout)

Hiển thị tên user khi đăng nhập

8. API Interaction (Supabase JS SDK)
Auth:

ts
Copy
Edit
const { user, error } = await supabase.auth.signUp({ email, password });
const { user, error } = await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
Fetch playlist:

ts
Copy
Edit
const { data, error } = await supabase.from('playlists').select('*').eq('owner_id', user.id);
Upload audio:

ts
Copy
Edit
const { data, error } = await supabase.storage.from('audios').upload(path, file);
9. Test Cases (chính)
ID	Kịch bản	Kết quả mong đợi
TC-1	Đăng ký với email mới	Tạo user thành công
TC-2	Đăng ký với email đã tồn tại	Báo lỗi “Email already registered”
TC-3	Đăng nhập với email/pass đúng	Redirect về HomePage
TC-4	Đăng nhập với sai pass	Báo lỗi “Invalid credentials”
TC-5	Tạo playlist mới	Playlist xuất hiện trong danh sách
TC-6	Upload audio thành công	Audio xuất hiện trong playlist
TC-7	User A không thấy playlist của User B	Không có record trả về