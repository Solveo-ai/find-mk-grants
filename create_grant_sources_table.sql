-- Create the grant_sources table for storing funding source information
-- This table tracks different websites/sources that provide funding opportunities

CREATE TABLE IF NOT EXISTS grant_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, success, error
    last_fetched_at TIMESTAMPTZ,
    last_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    parser_hint JSONB, -- Additional configuration for parsing
    active BOOLEAN DEFAULT true -- Whether this source is actively scraped
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grant_sources_status ON grant_sources(status);
CREATE INDEX IF NOT EXISTS idx_grant_sources_active ON grant_sources(active);
CREATE INDEX IF NOT EXISTS idx_grant_sources_last_fetched ON grant_sources(last_fetched_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_grant_sources_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_grant_sources_updated_at
    BEFORE UPDATE ON grant_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_grant_sources_updated_at_column();

-- Insert the Euro-Access source (if not exists)
INSERT INTO grant_sources (id, name, description, url, status)
VALUES (
    'euro-access',
    'Euro-Access',
    'Европски онлајн портал кој собира можности за финансирање од ЕУ програми',
    'https://www.euro-access.eu/en/calls?keyword=&submit=&sent=search',
    'pending'
) ON CONFLICT (id) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON grant_sources TO your_app_role;