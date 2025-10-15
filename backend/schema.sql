-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  budget TEXT,
  deadline DATE,
  type TEXT,
  source TEXT,
  status TEXT CHECK (status IN ('open', 'closed', 'upcoming')),
  sector TEXT,
  eligibility TEXT,
  application_process TEXT,
  contact_info TEXT,
  source_url TEXT,
  total_budget TEXT,
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  website TEXT,
  focus TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant Sources table
CREATE TABLE grant_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  parser_hint JSONB NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','success','error')),
  last_fetched_at TIMESTAMPTZ NULL,
  last_error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grants table
CREATE TABLE grants (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   source_id UUID REFERENCES grant_sources(id) ON DELETE CASCADE NOT NULL,
   source_url TEXT NOT NULL,
   title TEXT NOT NULL,
   url TEXT NOT NULL,
   description TEXT,
   deadline TIMESTAMPTZ,
   amount NUMERIC,
   currency TEXT,
   type TEXT NOT NULL DEFAULT 'grants' CHECK (type IN ('grants', 'tenders', 'private-funding', 'loans')),
   tags TEXT[] DEFAULT '{}',
   content_hash TEXT NOT NULL,
   raw_html TEXT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   UNIQUE(content_hash)
);

-- Indexes
CREATE UNIQUE INDEX idx_grant_sources_url ON grant_sources(url);
CREATE INDEX idx_grants_source_id ON grants(source_id);
CREATE UNIQUE INDEX idx_grants_content_hash ON grants(content_hash);

-- Enable RLS
ALTER TABLE grant_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Grants: allow SELECT to anon and authenticated; INSERT/UPDATE/DELETE only to service role
CREATE POLICY "Grants are viewable by everyone" ON grants FOR SELECT USING (true);
CREATE POLICY "Grants are insertable by service role" ON grants FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Grants are updatable by service role" ON grants FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Grants are deletable by service role" ON grants FOR DELETE USING (auth.role() = 'service_role');

-- Grant Sources: allow INSERT to authenticated; UPDATE only to service role; SELECT allowed for everyone
CREATE POLICY "Grant sources are insertable by authenticated users" ON grant_sources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Grant sources are updatable by service role" ON grant_sources FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Grant sources are viewable by everyone" ON grant_sources FOR SELECT USING (true);

-- pg_net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger function to invoke Edge Function on insert
CREATE OR REPLACE FUNCTION invoke_process_grant_source()
RETURNS TRIGGER AS $$
DECLARE
  webhook_secret TEXT := '4df23e4db26b29c4e87a439af1d8c85ef961adf076fccb7208078fa9e94823e8bdf12dd55a1b69f728df378150b6bf74'; -- Replace with actual secret
  project_ref TEXT := 'hhukduxejzpfvakyjzkw'; -- Your Supabase project ref
BEGIN
  -- Call the Edge Function via pg_net
  -- Temporarily disabled to allow inserts until pg_net is enabled
  PERFORM net.http_post(
    url := 'https://' || project_ref || '.supabase.co/functions/v1/process-grant-source',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Webhook-Secret', webhook_secret
    ),
    body := jsonb_build_object('source_id', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on insert into grant_sources
CREATE TRIGGER trigger_process_grant_source
  AFTER INSERT ON grant_sources
  FOR EACH ROW EXECUTE FUNCTION invoke_process_grant_source();

-- EU Fundings table
CREATE TABLE eu_fundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mk TEXT NOT NULL,
  short_description_mk TEXT,
  deadline TIMESTAMPTZ,
  source TEXT DEFAULT 'ЕУ Фондови',
  programme_mk TEXT,
  call_number TEXT,
  opening_date TIMESTAMPTZ,
  deadline_raw TEXT,
  link_to_call TEXT,
  link_to_submission TEXT,
  call_content_short_mk TEXT,
  call_objectives_mk TEXT,
  eligibility_regions_mk TEXT,
  eligibility_entities_mk TEXT,
  partnership_requirements_mk TEXT,
  additional_info_topics_mk TEXT,
  additional_info_unsdgs_mk TEXT,
  additional_info_notes_mk TEXT,
  contact_mk TEXT,
  websites_mk TEXT,
  detail_url TEXT UNIQUE,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper view: days left until deadline
CREATE OR REPLACE VIEW eu_fundings_public AS
SELECT
  f.*,
  CASE
    WHEN f.deadline IS NULL THEN NULL
    ELSE GREATEST(0, (f.deadline::date - CURRENT_DATE))
  END AS days_left
FROM eu_fundings f;

-- Indexes for EU fundings
CREATE INDEX IF NOT EXISTS idx_eu_fundings_deadline ON eu_fundings (deadline);
CREATE INDEX IF NOT EXISTS idx_eu_fundings_scraped_at ON eu_fundings (scraped_at);

-- Enable RLS for EU fundings
ALTER TABLE eu_fundings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for EU fundings
CREATE POLICY "EU fundings are viewable by everyone" ON eu_fundings FOR SELECT USING (true);
CREATE POLICY "EU fundings are insertable by service role" ON eu_fundings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "EU fundings are updatable by service role" ON eu_fundings FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "EU fundings are deletable by service role" ON eu_fundings FOR DELETE USING (auth.role() = 'service_role');