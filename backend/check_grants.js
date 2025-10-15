import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkGrants() {
  try {
    // Check grant sources
    const { data: sources, error: sourcesError } = await supabase
      .from('grant_sources')
      .select('*');

    if (sourcesError) throw sourcesError;
    console.log('Grant sources:', sources.length);

    // Check grants
    const { data: grants, error: grantsError } = await supabase
      .from('grants')
      .select('*');

    if (grantsError) throw grantsError;
    console.log('Grants:', grants.length);

    if (grants.length > 0) {
      console.log('Sample grant:', grants[0]);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

async function addGrant() {
  try {
    // Use service role client for insert
    const serviceSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { data, error } = await serviceSupabase
      .from('grants')
      .insert({
        source_id: 'test',
        source_url: 'https://www.example.com',
        title: 'Test Grant for Real Time Demo',
        url: 'https://www.example.com/grant1',
        description: 'This is a test grant to demonstrate real time updates',
        type: 'grants',
        tags: ['test', 'demo']
      });

    if (error) throw error;
    console.log('Added grant:', data);
    return data;
  } catch (error) {
    console.error('Error adding grant:', error);
  }
}

async function triggerProcessing() {
  try {
    const response = await fetch('https://hhukduxejzpfvakyjzkw.supabase.co/functions/v1/process-all-sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    });

    const result = await response.json();
    console.log('Processing result:', result);
  } catch (error) {
    console.error('Error triggering processing:', error);
  }
}

async function main() {
  await checkGrants();

  if (process.argv[2] === 'add') {
    await addGrant();
    await checkGrants();
  }
}

main();