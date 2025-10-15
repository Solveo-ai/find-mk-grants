-- Add additional fields to euro_access_grants table
ALTER TABLE euro_access_grants
ADD COLUMN IF NOT EXISTS funding_rate TEXT,
ADD COLUMN IF NOT EXISTS estimated_eu_contribution_per_project TEXT,
ADD COLUMN IF NOT EXISTS project_duration TEXT,
ADD COLUMN IF NOT EXISTS relevance_for_eu_macro_region TEXT,
ADD COLUMN IF NOT EXISTS other_eligibility_criteria TEXT,
ADD COLUMN IF NOT EXISTS call_documents TEXT;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_funding_rate ON euro_access_grants(funding_rate);
CREATE INDEX IF NOT EXISTS idx_euro_access_grants_project_duration ON euro_access_grants(project_duration);