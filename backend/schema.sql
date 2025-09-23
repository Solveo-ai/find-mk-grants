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