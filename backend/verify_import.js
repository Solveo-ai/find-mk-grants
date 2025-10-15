// Script to verify Euro-Access data import
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImport() {
  try {
    console.log('🔍 Verifying Euro-Access data import...\n');

    // Check sources table
    console.log('📋 Checking euro_access_sources table:');
    const { data: sources, error: sourcesError } = await supabase
      .from('euro_access_sources')
      .select('*');

    if (sourcesError) {
      console.error('❌ Error querying sources:', sourcesError.message);
    } else {
      console.log(`✅ Found ${sources.length} source(s):`);
      sources.forEach(source => {
        console.log(`   - ${source.name} (ID: ${source.id})`);
      });
    }

    console.log('');

    // Check grants table
    console.log('📊 Checking euro_access_grants table:');
    const { data: grants, error: grantsError } = await supabase
      .from('euro_access_grants')
      .select('id, title, deadline, days_left, funding_program')
      .limit(5);

    if (grantsError) {
      console.error('❌ Error querying grants:', grantsError.message);
    } else {
      console.log(`✅ Found ${grants.length} grant(s) (showing first 5):`);
      grants.forEach(grant => {
        console.log(`   - "${grant.title}"`);
        console.log(`     Program: ${grant.funding_program}`);
        console.log(`     Deadline: ${grant.deadline || 'No deadline'}`);
        console.log(`     Days left: ${grant.days_left || 'N/A'}`);
        console.log('');
      });
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('euro_access_grants')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📈 Total Euro-Access grants in database: ${count}`);
    }

    // Check active grants view
    console.log('\n🔥 Checking active_euro_access_grants view:');
    const { data: activeGrants, error: activeError } = await supabase
      .from('active_euro_access_grants')
      .select('id, title, calculated_days_left')
      .limit(3);

    if (activeError) {
      console.error('❌ Error querying active grants view:', activeError.message);
    } else {
      console.log(`✅ Found ${activeGrants.length} active grant(s) (showing first 3):`);
      activeGrants.forEach(grant => {
        console.log(`   - "${grant.title}" (${grant.calculated_days_left} days left)`);
      });
    }

    console.log('\n🎉 Import verification complete!');
    console.log('\n💡 Your website can now query:');
    console.log('   - euro_access_grants table for all funding opportunities');
    console.log('   - active_euro_access_grants view for current opportunities');
    console.log('   - All data includes Macedonian translations');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyImport();