const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testGrantSources() {
  const { data, error } = await supabase
    .from('grant_sources')
    .select('*');

  if (error) {
    console.error('Error fetching grant_sources:', error);
  } else {
    console.log('Rows in grant_sources:', data.length);
    console.log(data);
  }
}

testGrantSources();
