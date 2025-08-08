# Email Template Setup Guide

## Custom Email Confirmation Template

Để custom email confirmation template trong Supabase, bạn cần thực hiện các bước sau:

### 1. Truy cập Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Vào **Authentication** > **Email Templates**

### 2. Custom Email Confirmation Template

Trong phần **Confirm signup**, bạn có thể custom template như sau:

#### HTML Template:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận tài khoản - English Practice</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0d9488;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #0d9488;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #0f766e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎓 English Practice</div>
            <div class="title">Xác nhận tài khoản của bạn</div>
        </div>
        
        <div class="content">
            <p>Xin chào <strong>{{ .Email }}</strong>,</p>
            
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>English Practice</strong>! Để bắt đầu sử dụng ứng dụng và cải thiện kỹ năng tiếng Anh của mình, vui lòng xác nhận email của bạn.</p>
            
            <div class="highlight">
                <strong>🎯 Với English Practice, bạn có thể:</strong>
                <ul>
                    <li>🎧 Luyện nghe với các bài audio đa dạng</li>
                    <li>✍️ Thực hành dictation để cải thiện kỹ năng viết</li>
                    <li>🗣️ Shadowing để phát âm chuẩn hơn</li>
                    <li>📚 Tạo và quản lý playlist học tập cá nhân</li>
                </ul>
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">
                ✅ Xác nhận tài khoản
            </a>
        </div>
        
        <div class="content">
            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Link xác nhận có hiệu lực trong 24 giờ</li>
                <li>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này</li>
                <li>Nếu gặp vấn đề, hãy liên hệ support@englishpractice.com</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>© 2024 English Practice. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>
```

#### Text Template:
```
🎓 English Practice - Xác nhận tài khoản

Xin chào {{ .Email }},

Cảm ơn bạn đã đăng ký tài khoản tại English Practice!

Để bắt đầu sử dụng ứng dụng và cải thiện kỹ năng tiếng Anh của mình, vui lòng xác nhận email của bạn bằng cách truy cập link sau:

{{ .ConfirmationURL }}

🎯 Với English Practice, bạn có thể:
- 🎧 Luyện nghe với các bài audio đa dạng
- ✍️ Thực hành dictation để cải thiện kỹ năng viết  
- 🗣️ Shadowing để phát âm chuẩn hơn
- 📚 Tạo và quản lý playlist học tập cá nhân

Lưu ý:
- Link xác nhận có hiệu lực trong 24 giờ
- Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này
- Nếu gặp vấn đề, hãy liên hệ support@englishpractice.com

© 2024 English Practice. Tất cả quyền được bảo lưu.
```

### 3. Cấu hình Social Login

#### Google OAuth Setup:

1. **Tạo Google OAuth Credentials:**
   - Truy cập [Google Cloud Console](https://console.cloud.google.com/)
   - Tạo project mới hoặc chọn project hiện có
   - Vào **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client IDs**
   - Chọn **Web application**
   - Thêm Authorized redirect URIs:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```

2. **Cấu hình trong Supabase:**
   - Vào **Authentication** > **Providers**
   - Bật **Google**
   - Nhập **Client ID** và **Client Secret** từ Google
   - Thêm redirect URL: `http://localhost:3000/auth/callback` (development)

#### GitHub OAuth Setup:

1. **Tạo GitHub OAuth App:**
   - Truy cập [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Điền thông tin:
     - Application name: English Practice
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`

2. **Cấu hình trong Supabase:**
   - Vào **Authentication** > **Providers**
   - Bật **GitHub**
   - Nhập **Client ID** và **Client Secret** từ GitHub

#### Facebook OAuth Setup:

1. **Tạo Facebook App:**
   - Truy cập [Facebook Developers](https://developers.facebook.com/)
   - Tạo app mới
   - Thêm Facebook Login product
   - Cấu hình OAuth redirect URIs

2. **Cấu hình trong Supabase:**
   - Vào **Authentication** > **Providers**
   - Bật **Facebook**
   - Nhập **Client ID** và **Client Secret** từ Facebook

### 4. Cấu hình Redirect URLs

Trong Supabase Dashboard > **Authentication** > **URL Configuration**:

```
Site URL: http://localhost:3000
Redirect URLs: 
- http://localhost:3000/auth/callback
- http://localhost:3000
```

### 5. Testing

1. **Test Email Template:**
   - Đăng ký tài khoản mới
   - Kiểm tra email xác nhận
   - Click link xác nhận

2. **Test Social Login:**
   - Thử đăng nhập với Google/GitHub/Facebook
   - Kiểm tra redirect flow
   - Verify user data được lưu đúng

### 6. Production Deployment

Khi deploy lên production:

1. **Cập nhật Redirect URLs:**
   ```
   Site URL: https://yourdomain.com
   Redirect URLs:
   - https://yourdomain.com/auth/callback
   - https://yourdomain.com
   ```

2. **Cập nhật Google OAuth:**
   - Thêm production redirect URI vào Google Cloud Console

3. **Cập nhật GitHub OAuth:**
   - Cập nhật Authorization callback URL trong GitHub app settings

4. **Cập nhật Facebook App:**
   - Cập nhật OAuth redirect URIs trong Facebook app settings

### 7. Security Best Practices

1. **Environment Variables:**
   - Không commit sensitive data vào code
   - Sử dụng environment variables cho production

2. **Email Security:**
   - Sử dụng SPF, DKIM, DMARC records
   - Monitor email delivery rates

3. **OAuth Security:**
   - Sử dụng HTTPS cho production
   - Validate OAuth tokens
   - Implement proper session management

### 8. Troubleshooting

**Common Issues:**

1. **Email không gửi được:**
   - Kiểm tra SMTP settings trong Supabase
   - Verify email template syntax
   - Check spam folder

2. **Social login không hoạt động:**
   - Verify OAuth credentials
   - Check redirect URLs
   - Review browser console errors

3. **Callback errors:**
   - Verify callback route exists
   - Check URL configuration
   - Review network requests

**Debug Tips:**
- Enable debug mode: `REACT_APP_DEBUG=true`
- Check browser console for errors
- Review Supabase logs
- Test with different browsers
