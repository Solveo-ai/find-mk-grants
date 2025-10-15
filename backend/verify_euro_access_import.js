// Script to verify Euro-Access data import
require('dotenv').config({ path: '../frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImport() {
  console.log('Verifying Euro-Access data import...');

  // Check sources
  const { data: sources, error: sourcesError } = await supabase
    .from('euro_access_sources')
    .select('*');

  if (sourcesError) {
    console.error('Error fetching sources:', sourcesError);
  } else {
    console.log(`Found ${sources.length} sources:`);
    sources.forEach(source => {
      console.log(`- ${source.name} (${source.id})`);
    });
  }

  // Check grants count
  const { count, error: countError } = await supabase
    .from('euro_access_grants')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting grants:', countError);
  } else {
    console.log(`Found ${count} grants in euro_access_grants table`);
  }

  // Check a few sample grants
  const { data: grants, error: grantsError } = await supabase
    .from('euro_access_grants')
    .select('id, title, title_mk, deadline, days_left')
    .limit(5);

  if (grantsError) {
    console.error('Error fetching grants:', grantsError);
  } else {
    console.log('\nSample grants:');
    grants.forEach(grant => {
      console.log(`- ID: ${grant.id}, Title: ${grant.title?.substring(0, 50)}..., Days left: ${grant.days_left}`);
    });
  }

  // Check active grants view
  const { data: activeGrants, error: activeError } = await supabase
    .from('active_euro_access_grants')
    .select('id, title, days_left')
    .limit(5);

  if (activeError) {
    console.error('Error fetching active grants:', activeError);
  } else {
    console.log(`\nActive grants view has ${activeGrants.length} records`);
  }
}

verifyImport().catch(console.error);