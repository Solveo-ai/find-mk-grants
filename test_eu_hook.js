// Quick test to check if the Euro-Access hook is working
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Euro-Access hook...');
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables not set!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  try {
    console.log('Testing query to active_euro_access_grants...');
    const { data, error } = await supabase
      .from('active_euro_access_grants')
      .select('id, title, title_mk')
      .limit(3);

    if (error) {
      console.error('Query error:', error);
      return;
    }

    console.log('Query successful!');
    console.log('Sample data:', data);
    console.log('Number of records:', data.length);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testQuery();