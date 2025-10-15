import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseGrants, normalizeGrant, computeContentHash } from "../_shared/parser.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let source_id: string | undefined;

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-webhook-secret');

    if (!webhookSecret || providedSecret !== webhookSecret) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Parse request body
    const body = await req.json();
    source_id = body.source_id;
    if (!source_id) {
      return new Response('Missing source_id', { status: 400, headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to processing
    await supabase
      .from('grant_sources')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', source_id);

    // Fetch source details
    const { data: source, error: sourceError } = await supabase
      .from('grant_sources')
      .select('*')
      .eq('id', source_id)
      .single();

    if (sourceError || !source) {
      throw new Error('Source not found');
    }

    // Fetch HTML with retry logic
    let html: string | undefined;
    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GrantAggregator/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        html = await response.text();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
      }
    }

    if (!html) {
      throw new Error('Failed to fetch HTML content');
    }

    // Parse grants
    const parsedGrants = parseGrants(html, source);

    // Process and upsert grants
    for (const grant of parsedGrants) {
      const normalized = normalizeGrant(grant, source);
      const contentHash = await computeContentHash(normalized.title, normalized.url, normalized.deadline, source.url);

      await supabase
        .from('grants')
        .upsert({
          source_id: source.id,
          source_url: source.url,
          ...normalized,
          content_hash: contentHash,
          raw_html: html,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'content_hash'
        });
    }

    // Update source status to success
    await supabase
      .from('grant_sources')
      .update({
        status: 'success',
        last_fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', source_id);

    return new Response(JSON.stringify({ success: true, grants_count: parsedGrants.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing grant source:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update source status to error if we have source_id
    if (source_id) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabase
          .from('grant_sources')
          .update({
            status: 'error',
            last_error_message: errorMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', source_id);
      } catch (updateError) {
        console.error('Error updating source status:', updateError);
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});