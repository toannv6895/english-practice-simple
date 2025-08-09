# Hướng dẫn setup environment variables cho scripts debug

## 🚨 Lỗi: Missing Supabase environment variables

## ✅ Cách fix

### 1. Kiểm tra file .env.local
Đảm bảo bạn có file `.env.local` trong thư mục root (`d:/Projects/english-practice-simple`) với nội dung:

```bash
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Chạy scripts với environment đúng

**Từ thư mục root project:**
```bash
# Chạy check schema
node scripts/check-actual-schema.js

# Chạy test playlist creation
node scripts/test-playlist-creation.js
```

**Hoặc từ thư mục scripts:**
```bash
cd scripts
node check-actual-schema.js
```

### 3. Kiểm tra environment variables

**Tạo file test nhanh:**
```bash
# Tạo test-env.js
node -e "
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
"
```

### 4. Nếu vẫn lỗi

**Kiểm tra file .env.local:**
```bash
# Xem nội dung file
cat .env.local

# Hoặc trên Windows
type .env.local
```

**Kiểm tra đường dẫn:**
```bash
# Xem current directory
pwd

# Kiểm tra file tồn tại
ls -la .env.local
```

### 5. Alternative: Copy env từ file khác

Nếu bạn có file `.env` hoặc `.env.example`, copy sang `.env.local`:

```bash
# Copy từ .env
cp .env .env.local

# Hoặc từ .env.example
cp env.example .env.local
```

### 6. Test nhanh với hardcoded values (chỉ cho test)

**Chỉnh sửa tạm thời trong scripts:**
```javascript
// Thay thế phần env với:
const supabaseUrl = 'your_actual_url_here';
const supabaseAnonKey = 'your_actual_key_here';
```

## 🔍 Debug tips

1. **Kiểm tra file tồn tại:**
   ```bash
   ls -la *.env*
   ```

2. **Kiểm tra nội dung:**
   ```bash
   head -n 5 .env.local
   ```

3. **Test dotenv:**
   ```javascript
   const result = require('dotenv').config({ path: '.env.local' });
   console.log(result.error);
   console.log(result.parsed);