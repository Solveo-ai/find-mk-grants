const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testParser() {
  console.log('Testing parser functionality...');
  
  // Test a few sources to see if they work
  const testSources = [
    'https://www.biddetail.com/macedonia-tenders',
    'https://webalkans.eu/en/opportunities/',
    'https://ceedhub.mk'
  ];

  for (const url of testSources) {
    try {
      console.log(`\n--- Testing ${url} ---`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GrantAggregator/1.0)',
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Successfully fetched ${url} (${html.length} chars)`);
        
        // Check if content looks valid
        if (html.includes('<html') || html.includes('<!DOCTYPE')) {
          console.log('✅ Valid HTML content detected');
        } else {
          console.log('⚠️ Possible SPA or unusual content structure');
        }
      } else {
        console.log(`❌ Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error fetching ${url}: ${error.message}`);
    }
  }
}

testParser().catch(console.error);