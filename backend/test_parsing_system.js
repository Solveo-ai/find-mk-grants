const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testProcessGrantSource() {
  try {
    console.log('Testing one grant source processing...');
    
    // Get one grant source to test
    const { data: sources, error } = await supabase
      .from('grant_sources')
      .select('*')
      .eq('name', 'Bid Detail Македонија')
      .single();

    if (error) {
      console.error('Error fetching source:', error);
      return;
    }

    if (!sources) {
      console.log('No matching source found');
      return;
    }

    console.log('Found source:', sources.name, sources.url);

    // Test the process-grant-source function
    const webhookSecret = process.env.WEBHOOK_SECRET || 'test-secret';
    
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/process-grant-source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({ source_id: sources.id }),
    });

    const result = await response.text();
    console.log('Function response status:', response.status);
    console.log('Function response:', result);

    if (response.ok) {
      console.log('✅ Successfully processed source');
      
      // Check if grants were created
      const { data: grants, error: grantsError } = await supabase
        .from('grants')
        .select('*')
        .eq('source_id', sources.id);

      if (grantsError) {
        console.error('Error fetching grants:', grantsError);
      } else {
        console.log(`📊 Found ${grants.length} grants for this source`);
        if (grants.length > 0) {
          console.log('Sample grant:', grants[0]);
        }
      }
    } else {
      console.log('❌ Failed to process source');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testProcessGrantSource().catch(console.error);