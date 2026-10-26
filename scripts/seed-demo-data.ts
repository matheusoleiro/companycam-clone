import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...\n');

    // 1. Create demo user account
    console.log('Creating demo user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'contractor@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log('✓ Demo user already exists');
      } else {
        throw authError;
      }
    } else {
      console.log(`✓ Demo user created: ${authData.user?.email}`);
    }

    // Get the user ID (need to fetch if already exists)
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserById(
      authData?.user?.id || ''
    );

    let userId = authData?.user?.id;
    if (!userId) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === 'contractor@example.com');
      userId = user?.id;
    }

    if (!userId) {
      throw new Error('Could not find or create user');
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

    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }
    console.log('✓ User profile created/updated');

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
      throw projectError;
    }
    console.log(`✓ Demo project created: ${project.name}`);

    console.log('\n✅ Demo data seeded successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`Email: contractor@example.com`);
    console.log(`Password: password123`);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
