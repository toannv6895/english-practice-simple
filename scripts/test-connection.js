// Test Supabase Connection
// Run this script to verify your setup

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('playlists').select('count').limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('   Make sure you have run the database setup script');
      return false;
    }
    
    console.log('✅ Database connection successful');

    // Test 2: Check if tables exist
    console.log('\n2. Checking database schema...');
    
    const { data: playlists, error: playlistsError } = await supabase
      .from('playlists')
      .select('*')
      .limit(1);
    
    if (playlistsError) {
      console.log('❌ Playlists table not found:', playlistsError.message);
      return false;
    }
    
    const { data: audios, error: audiosError } = await supabase
      .from('audios')
      .select('*')
      .limit(1);
    
    if (audiosError) {
      console.log('❌ Audios table not found:', audiosError.message);
      return false;
    }
    
    console.log('✅ Database schema is correct');

    // Test 3: Check storage bucket
    console.log('\n3. Checking storage bucket...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage access failed:', bucketsError.message);
      return false;
    }
    
    const audiosBucket = buckets.find(bucket => bucket.name === 'audios');
    
    if (!audiosBucket) {
      console.log('❌ Audios bucket not found');
      console.log('   Please create the "audios" bucket in Supabase Dashboard');
      return false;
    }
    
    console.log('✅ Storage bucket exists');

    // Test 4: Test authentication
    console.log('\n4. Testing authentication...');
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Authentication test failed:', authError.message);
      return false;
    }
    
    console.log('✅ Authentication is working');
    
    console.log('\n🎉 All tests passed! Your Supabase setup is ready.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function createTestUser() {
  console.log('\n🔧 Creating test user...');
  
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';
  
  try {
    // Sign up test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log('❌ User creation failed:', error.message);
      return false;
    }
    
    console.log('✅ Test user created successfully');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    
    return true;
  } catch (error) {
    console.error('❌ User creation failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Setup Test\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');
  
  const connectionTest = await testConnection();
  
  if (connectionTest) {
    console.log('\n📝 Next steps:');
    console.log('1. Run the database setup script in Supabase SQL Editor');
    console.log('2. Create the "audios" storage bucket');
    console.log('3. Run the storage setup script');
    console.log('4. Test the application');
  } else {
    console.log('\n❌ Setup incomplete. Please check the errors above.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, createTestUser };
