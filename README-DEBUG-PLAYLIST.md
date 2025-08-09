# Playlist Creation Debug Guide

## 🚨 Vấn đề: Playlist không lưu vào public playlists table

## 📋 Các bước debug chi tiết

### 1. Kiểm tra schema thực tế của database

**Chạy trong Supabase SQL Editor:**
```sql
-- Kiểm tra cấu trúc bảng playlists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'playlists'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kiểm tra dữ liệu hiện tại
SELECT * FROM playlists LIMIT 5;

-- Kiểm tra RLS policies
SELECT * FROM pg_policies WHERE tablename = 'playlists';
```

### 2. Test kết nối và insert trực tiếp

**Chạy trong thư mục scripts:**
```bash
cd scripts
npm install
npm run check-schema
```

### 3. Debug từ frontend

**Mở browser console và chạy:**
```javascript
// Copy nội dung từ scripts/test-frontend-playlist.js
```

### 4. Các lỗi thường gặp và cách fix

#### Lỗi 42501 (Permission denied)
- **Nguyên nhân**: RLS policies chặn insert
- **Fix**: Kiểm tra policies trong Supabase dashboard

#### Lỗi 42703 (Column not found)
- **Nguyên nhân**: Schema không khớp
- **Fix**: Chạy lại init script hoặc sửa mapping

#### Lỗi 23505 (Duplicate key)
- **Nguyên nhân**: Trùng lặp dữ liệu
- **Fix**: Kiểm tra unique constraints

### 5. Schema đúng cho playlists

```sql
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'protected', 'private')),
    cover_image TEXT,
    audio_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Test insert đúng cách

```sql
-- Test insert với user thực
INSERT INTO public.playlists (owner_id, name, description, visibility, audio_count) 
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test Playlist',
    'Test description',
    'public',
    0
);
```

### 7. Kiểm tra logs trong frontend

Thêm logging trong `usePlaylistStore.ts`:
```typescript
console.log('Creating playlist with data:', insertData);
console.log('Insert result:', { data, error });
```

## 🔧 Các file debug đã tạo

1. `scripts/check-actual-schema.js` - Kiểm tra schema thực tế
2. `scripts/test-playlist-creation.js` - Test insert trực tiếp
3. `scripts/test-frontend-playlist.js` - Test từ frontend
4. `scripts/debug-playlist-schema.sql` - SQL queries debug
5. `scripts/package.json` - Dependencies cho scripts

## 📞 Hướng dẫn sử dụng

1. **Chạy kiểm tra schema:**
   ```bash
   cd scripts
   npm install
   npm run check-schema
   ```

2. **Test trong browser:**
   - Mở app, login
   - Mở browser console
   - Paste code từ `test-frontend-playlist.js`

3. **Kiểm tra Supabase dashboard:**
   - Vào SQL Editor
   - Chạy queries trong `debug-playlist-schema.sql`