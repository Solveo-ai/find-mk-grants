-- Create separate tables for Euro-Access EU funding data
-- These tables are separate from the existing grants/grant_sources tables

-- Euro-Access sources table
CREATE TABLE IF NOT EXISTS euro_access_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, success, error
    last_fetched_at TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Euro-Access grants table (separate from main grants table)
CREATE TABLE IF NOT EXISTS euro_access_grants (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES euro_access_sources(id),
    source_url TEXT NOT NULL,
    title TEXT,
    title_mk TEXT, -- Macedonian translation of title
    description TEXT,
    description_mk TEXT, -- Macedonian translation of description
    deadline TIMESTAMPTZ,
    days_left INTEGER,
    url TEXT,
    type TEXT DEFAULT 'grants',
    tags TEXT[], -- Array of tags
    content_hash TEXT UNIQUE NOT NULL, -- For duplicate prevention
    raw_html TEXT, -- Original HTML content
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Euro-Access specific fields
    funding_program TEXT,
    call_number TEXT,
    call_objectives TEXT,
    regions_countries_for_funding TEXT,
    eligible_entities TEXT,
    mandatory_partnership TEXT,
    project_partnership TEXT,
    topics TEXT,
    un_sdgs TEXT, -- UN Sustainable Development Goals
    additional_information TEXT,
    contact TEXT,

    -- Additional fields
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'active', -- active, expired, etc.
    featured BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0 -- For ordering
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_euro_access_sources_status ON euro_access_sources(status);
CREATE INDEX IF NOT EXISTS idx_euro_access_sources_active ON euro_access_sources(active);
CREATE INDEX IF NOT EXISTS idx_euro_access_sources_last_fetched ON euro_access_sources(last_fetched_at);

CREATE INDEX IF NOT EXISTS idx_euro_access_grants_source_id ON euro_access_grants(source_id);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_type ON euro_access_grants(type);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_deadline ON euro_access_grants(deadline);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_days_left ON euro_access_grants(days_left);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_tags ON euro_access_grants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_content_hash ON euro_access_grants(content_hash);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_featured ON euro_access_grants(featured);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_status ON euro_access_grants(status);

-- Create functions to update timestamps
CREATE OR REPLACE FUNCTION update_euro_access_sources_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_euro_access_grants_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_euro_access_sources_updated_at ON euro_access_sources;
DROP TRIGGER IF EXISTS update_euro_access_grants_updated_at ON euro_access_grants;

CREATE TRIGGER update_euro_access_sources_updated_at
    BEFORE UPDATE ON euro_access_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_euro_access_sources_updated_at_column();

CREATE TRIGGER update_euro_access_grants_updated_at
    BEFORE UPDATE ON euro_access_grants
    FOR EACH ROW
    EXECUTE FUNCTION update_euro_access_grants_updated_at_column();

-- Create a view for active Euro-Access grants with days_left calculated
CREATE OR REPLACE VIEW active_euro_access_grants AS
SELECT
    *,
    CASE
        WHEN deadline IS NOT NULL THEN
            EXTRACT(EPOCH FROM (deadline - NOW())) / 86400
        ELSE NULL
    END as calculated_days_left
FROM euro_access_grants
WHERE status = 'active'
  AND (deadline IS NULL OR deadline > NOW());

-- Insert the Euro-Access source
INSERT INTO euro_access_sources (id, name, description, url, status)
VALUES (
    'euro-access',
    'Euro-Access',
    'Европски онлајн портал кој собира можности за финансирање од ЕУ програми',
    'https://www.euro-access.eu/en/calls?keyword=&submit=&sent=search',
    'pending'
) ON CONFLICT (id) DO NOTHING;