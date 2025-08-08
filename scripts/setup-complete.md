# Complete Supabase Setup Guide

## 🚀 Step-by-Step Setup Process

### Step 1: Supabase Project Setup

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: "English Practice App"
   - Enter database password (save this!)
   - Choose region closest to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll receive email when ready

### Step 2: Get Project Credentials

1. **Go to Project Settings**
   - In your project dashboard
   - Click "Settings" in sidebar
   - Click "API" tab

2. **Copy Credentials**
   - **Project URL**: Copy the URL (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon Key**: Copy the "anon public" key

3. **Update Environment File**
   ```bash
   # Edit .env.local
   REACT_APP_SUPABASE_URL=your_project_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 3: Database Setup

1. **Open SQL Editor**
   - In Supabase dashboard
   - Click "SQL Editor" in sidebar

2. **Run Database Script**
   - Copy content from `scripts/setup-database.sql`
   - Paste into SQL Editor
   - Click "Run" button

3. **Verify Tables Created**
   - Go to "Table Editor"
   - You should see `playlists` and `audios` tables

### Step 4: Storage Setup

1. **Create Storage Bucket**
   - Go to "Storage" in sidebar
   - Click "Create a new bucket"
   - Name: `audios`
   - Set to "Private"
   - Click "Create bucket"

2. **Run Storage Policies**
   - Go back to SQL Editor
   - Copy content from `scripts/setup-storage.sql`
   - Paste and run

### Step 5: Test Connection

1. **Run Test Script**
   ```bash
   node scripts/test-connection.js
   ```

2. **Check Results**
   - Should see "✅ All tests passed"
   - If errors, follow troubleshooting steps

### Step 6: Authentication Setup

1. **Configure Auth Settings**
   - Go to "Authentication" > "Settings"
   - Set site URL to `http://localhost:3000`
   - Add redirect URLs:
     - `http://localhost:3000`
     - `http://localhost:3000/login`
     - `http://localhost:3000/register`

2. **Test Authentication**
   - Start your app: `npm start`
   - Try to register a new user
   - Check if login works

### Step 7: Test Application

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Test Features**
   - ✅ User registration
   - ✅ User login
   - ✅ Create playlist
   - ✅ Upload audio file
   - ✅ Play audio

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check if file exists
ls -la .env.local

# Restart development server
npm start
```

#### 2. Database Connection Failed
- Verify SQL script was run completely
- Check if tables exist in Table Editor
- Ensure RLS policies are enabled

#### 3. Storage Upload Failed
- Verify "audios" bucket exists
- Check storage policies are applied
- Ensure file size is under 10MB

#### 4. Authentication Errors
- Check redirect URLs in Auth settings
- Verify email confirmation is disabled (for testing)
- Check browser console for errors

### Debug Commands

```bash
# Test connection
node scripts/test-connection.js

# Check environment variables
echo $REACT_APP_SUPABASE_URL

# Clear cache and restart
rm -rf node_modules/.cache
npm start
```

## 📋 Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database tables created
- [ ] RLS policies applied
- [ ] Storage bucket created
- [ ] Storage policies applied
- [ ] Authentication configured
- [ ] App starts without errors
- [ ] User can register/login
- [ ] User can create playlist
- [ ] User can upload audio
- [ ] Audio playback works

## 🎯 Next Steps

After setup is complete:

1. **Customize the App**
   - Update branding and colors
   - Add more features
   - Customize UI components

2. **Deploy to Production**
   - Set up production environment
   - Configure production Supabase project
   - Deploy to hosting platform

3. **Monitor and Maintain**
   - Set up monitoring
   - Regular backups
   - Performance optimization

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify all setup steps were completed
3. Test with the provided test script
4. Check Supabase dashboard for project status
5. Review the troubleshooting section above

## 📞 Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
