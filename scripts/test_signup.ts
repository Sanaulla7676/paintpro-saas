import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'painter@paintpro.in',
    password: 'PaintPro2026!',
    options: {
      data: {
        full_name: 'Lead Painter'
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
  } else {
    console.log('Signup success:', data.user?.email, data.session ? 'session present' : 'no session (confirm email)');
  }
}

testSignup();
