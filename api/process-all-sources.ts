import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req: any, res: any) {
  // Vercel Functions use Node.js runtime by default
  // Set headers for CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all sources that are not currently processing
    const { data: sources, error } = await supabase
      .from('grant_sources')
      .select('id')
      .neq('status', 'processing');

    if (error) throw error;

    // Process sources with concurrency limit
    const concurrency = 3;
    for (let i = 0; i < sources.length; i += concurrency) {
      const batch = sources.slice(i, i + concurrency);
      await Promise.all(batch.map(async (source) => {
        try {
          // Call the process-grant-source function
          const response = await fetch(`${supabaseUrl}/functions/v1/process-grant-source`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'X-Webhook-Secret': process.env.WEBHOOK_SECRET!,
            },
            body: JSON.stringify({ source_id: source.id }),
          });

          if (!response.ok) {
            console.error(`Failed to process source ${source.id}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Error processing source ${source.id}:`, error);
        }
      }));

      // Small delay between batches
      if (i + concurrency < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.status(200).json({ success: true, processed: sources.length });

  } catch (error) {
    console.error('Error processing all sources:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.status(500).json({ error: errorMessage });
  }
}