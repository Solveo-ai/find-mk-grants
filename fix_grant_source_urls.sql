-- Fix URLs that are missing http/https protocol
UPDATE grant_sources 
SET url = 'https://' || url 
WHERE url NOT LIKE 'http%' AND url NOT LIKE 'mailto:%';

-- Fix specific problematic URLs
UPDATE grant_sources 
SET url = 'https://seelegal.org' 
WHERE url = 'seelegal.org';

UPDATE grant_sources 
SET url = 'https://ebrdgeff.com' 
WHERE url = 'ebrdgeff.com';

UPDATE grant_sources 
SET url = 'https://openvc.app' 
WHERE url = 'openvc.app';

-- Update status to allow reprocessing
UPDATE grant_sources 
SET status = 'pending', last_fetched_at = NULL, last_error_message = NULL 
WHERE status = 'error';