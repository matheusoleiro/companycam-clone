require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...\n');

    // 1. Sign up demo user
    console.log('Creating demo user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'contractor@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Demo Contractor',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('✓ Demo user already exists');
      } else {
        throw authError;
      }
    } else if (authData.user) {
      console.log(`✓ Demo user created: ${authData.user.email}`);
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error('Could not create or find user');
    }

    // 2. Create user profile in the users table
    console.log('Creating user profile...');
    const { error: profileError } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email: 'contractor@example.com',
          full_name: 'Demo Contractor',
          subscription_tier: 'core',
          subscription_status: 'active',
          storage_used_bytes: 0,
          storage_limit_bytes: 1099511627776,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.warn('⚠️  Profile creation warning:', profileError.message);
    } else {
      console.log('✓ User profile created');
    }

    // 3. Create a demo project
    console.log('Creating demo project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: 'Roof Replacement - 123 Main St',
        address: '123 Main Street, Springfield, IL 62701',
        latitude: 39.7817,
        longitude: -89.6501,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        photo_count: 0,
        document_count: 0,
        crew_ids: [],
      })
      .select()
      .single();

    if (projectError) {
      console.warn('⚠️  Project creation warning:', projectError.message);
    } else if (project) {
      console.log(`✓ Demo project created: ${project.name}`);
    }

    console.log('\n✅ Demo data seeded!');
    console.log(`\nYou can now login with:`);
    console.log(`Email: contractor@example.com`);
    console.log(`Password: password123`);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error.message);
    process.exit(1);
  }
}

seedDemoData();
