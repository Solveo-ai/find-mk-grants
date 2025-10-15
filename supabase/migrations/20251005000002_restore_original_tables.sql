-- Restore the original grants and grant_sources tables that the website depends on

-- Grant Sources table
CREATE TABLE IF NOT EXISTS grant_sources (
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
CREATE TABLE IF NOT EXISTS grants (
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

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_grant_sources_url ON grant_sources(url);
CREATE INDEX IF NOT EXISTS idx_grants_source_id ON grants(source_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_grants_content_hash ON grants(content_hash);

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