// Debug script to check database content
require('dotenv').config({ path: '../frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugDB() {
  try {
    console.log('Checking database content...');

    // Check total count
    const { count, error: countError } = await supabase
      .from('active_euro_access_grants')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return;
    }

    console.log(`Total grants in database: ${count}`);

    // Check specific ID 3
    const { data: grant3, error: grantError } = await supabase
      .from('active_euro_access_grants')
      .select('*')
      .eq('id', 3)
      .single();

    if (grantError) {
      console.error('Error fetching grant 3:', grantError);
    } else if (grant3) {
      console.log('Grant 3 data:');
      console.log(JSON.stringify(grant3, null, 2));
    } else {
      console.log('No data found for grant 3');
    }

    // Check first few grants
    const { data: firstGrants, error: firstError } = await supabase
      .from('active_euro_access_grants')
      .select('id, title, deadline, url')
      .limit(5);

    if (firstError) {
      console.error('Error fetching first grants:', firstError);
    } else {
      console.log('First 5 grants:');
      console.log(JSON.stringify(firstGrants, null, 2));
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugDB();