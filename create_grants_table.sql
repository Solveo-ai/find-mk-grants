-- Create the grants table for storing EU funding opportunities
-- This table stores data scraped from Euro-Access and other funding sources

CREATE TABLE IF NOT EXISTS grants (
    id BIGSERIAL PRIMARY KEY,
    source_id TEXT NOT NULL,
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

    -- Additional fields that might be useful
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'active', -- active, expired, etc.
    featured BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0 -- For ordering
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grants_source_id ON grants(source_id);
CREATE INDEX IF NOT EXISTS idx_grants_type ON grants(type);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline);
CREATE INDEX IF NOT EXISTS idx_grants_days_left ON grants(days_left);
CREATE INDEX IF NOT EXISTS idx_grants_tags ON grants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_grants_content_hash ON grants(content_hash);
CREATE INDEX IF NOT EXISTS idx_grants_featured ON grants(featured);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_grants_updated_at
    BEFORE UPDATE ON grants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for active grants with days_left calculated
CREATE OR REPLACE VIEW active_grants AS
SELECT
    *,
    CASE
        WHEN deadline IS NOT NULL THEN
            EXTRACT(EPOCH FROM (deadline - NOW())) / 86400
        ELSE NULL
    END as calculated_days_left
FROM grants
WHERE status = 'active'
  AND (deadline IS NULL OR deadline > NOW());

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON grants TO your_app_role;
-- GRANT USAGE ON SEQUENCE grants_id_seq TO your_app_role;