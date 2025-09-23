const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[REDACTED]' : 'undefined');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined in environment variables');
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not defined in environment variables');
}

// Validate URL format
const urlPattern = /^https?:\/\/.+\.supabase\.co$/;
if (!urlPattern.test(process.env.SUPABASE_URL)) {
  throw new Error(`Invalid SUPABASE_URL format: ${process.env.SUPABASE_URL}. Expected format: https://your-project.supabase.co`);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function aggregateOpportunities() {
  try {
    // Get all sources
    const { data: sources, error } = await supabase
      .from('sources')
      .select('*');

    if (error) throw error;

    for (const source of sources) {
      // Assume source.website is the API or RSS URL
      try {
        const response = await axios.get(source.website);
        const opportunities = parseOpportunities(response.data, source);

        for (const opp of opportunities) {
          await supabase
            .from('opportunities')
            .upsert(opp, { onConflict: 'title,source' });
        }
      } catch (err) {
        console.error(`Error fetching from ${source.website}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Aggregation error:', error);
  }
}

function parseOpportunities(data, source) {
  // Placeholder parsing logic - needs to be customized per source
  // Assume data is JSON array of opportunities
  if (Array.isArray(data)) {
    return data.map(item => ({
      title: item.title,
      description: item.description,
      budget: item.budget,
      deadline: item.deadline,
      type: item.type,
      source: source.name,
      status: item.status || 'open',
      sector: item.sector,
      source_url: item.url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
  return [];
}

aggregateOpportunities();