import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createAdmin() {
  const email = 'wallcareexperts@gmail.com';
  const password = '12345678';

  console.log(`Creating/updating user: ${email}...`);

  // Try to create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Master Painter',
      company_name: 'PaintPro Services'
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists, updating password...');
      // List users to find ID
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true
        });
        console.log('Password updated successfully!');
      }
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('Admin user created successfully with ID:', data.user.id);
  }
}

createAdmin();
