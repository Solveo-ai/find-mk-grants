-- Update the active_euro_access_grants view to include budget fields
-- The view was created before the budget fields were added, so it doesn't include them
DROP VIEW IF EXISTS active_euro_access_grants;

CREATE OR REPLACE VIEW active_euro_access_grants AS
SELECT
    id,
    source_id,
    source_url,
    title,
    title_mk,
    description,
    description_mk,
    deadline,
    days_left,
    url,
    type,
    tags,
    content_hash,
    raw_html,
    created_at,
    updated_at,
    funding_program,
    call_number,
    call_objectives,
    regions_countries_for_funding,
    eligible_entities,
    mandatory_partnership,
    project_partnership,
    topics,
    un_sdgs,
    additional_information,
    contact,
    amount,
    currency,
    status,
    featured,
    priority,
    -- Include budget fields that were added later
    funding_rate,
    estimated_eu_contribution_per_project,
    project_duration,
    relevance_for_eu_macro_region,
    other_eligibility_criteria,
    call_documents,
    -- Include calculated days left
    CASE
        WHEN deadline IS NOT NULL THEN
            EXTRACT(EPOCH FROM (deadline - NOW())) / 86400
        ELSE NULL
    END as calculated_days_left
FROM euro_access_grants
WHERE status = 'active'
  AND (deadline IS NULL OR deadline > NOW());