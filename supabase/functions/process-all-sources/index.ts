import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
              'X-Webhook-Secret': Deno.env.get('WEBHOOK_SECRET')!,
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

    return new Response(JSON.stringify({ success: true, processed: sources.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing all sources:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});