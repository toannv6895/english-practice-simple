# Environment Setup Guide

## 🔒 Security Notice

**IMPORTANT**: Never commit environment files containing sensitive information to version control. The following files are automatically ignored:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env.staging`

## 📋 Required Environment Variables

### For Supabase Integration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the following values:
   - **Project URL**: Found in the "Project URL" field
   - **Anon Key**: Found in the "anon public" field

## 🛡️ Security Best Practices

### 1. Never Commit Sensitive Files
```bash
# ✅ Good - These files are ignored
.env.local
.env.production
secrets.json

# ❌ Bad - Never commit these
git add .env.local
git commit -m "Add API keys"  # NEVER DO THIS
```

### 2. Use Environment-Specific Files
```bash
# Development
.env.local          # Local development (ignored by git)

# Production
.env.production     # Production environment (ignored by git)

# Testing
.env.test          # Test environment (ignored by git)
```

### 3. Validate Environment Variables

Add this check to your application startup:

```typescript
// src/lib/supabase.ts
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}
```

## 🔧 Setup Instructions

### Step 1: Create Environment File
```bash
# Create .env.local file
touch .env.local
```

### Step 2: Add Your Variables
```bash
# Edit .env.local
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

## 🚨 Troubleshooting

### Environment Variables Not Loading
1. Make sure the file is named exactly `.env.local`
2. Restart the development server
3. Check that variables start with `REACT_APP_`

### Supabase Connection Errors
1. Verify your Supabase URL and anon key
2. Check that your Supabase project is active
3. Ensure RLS policies are configured correctly

### File Upload Issues
1. Verify Supabase Storage bucket exists
2. Check storage policies are set correctly
3. Ensure file size limits are appropriate

## 📝 Example .env.local

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Development overrides
REACT_APP_DEBUG=true
REACT_APP_API_TIMEOUT=30000
```

## 🔍 Verification

To verify your environment is set up correctly:

1. Check that the app loads without errors
2. Try to register/login a user
3. Test creating a playlist
4. Test uploading an audio file

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are loaded
3. Check Supabase dashboard for project status
4. Review the Supabase setup guide in `SUPABASE_SETUP.md`

## 🔄 Environment Management

### For Different Environments

```bash
# Development
cp .env.local .env.development

# Production
cp .env.local .env.production

# Testing
cp .env.local .env.test
```

### For Team Development

1. Create `.env.example` with placeholder values
2. Share the example file with your team
3. Each developer creates their own `.env.local`

```bash
# .env.example
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Remember: **Never commit real API keys or secrets to version control!**
