-- Migration: Create lightweight view for learning centres by district
-- Optimizes queries that only need basic info + facilitators + partner orgs
BEGIN;

CREATE VIEW learning_centres_by_district AS
SELECT
    lc.id,
    lc.centre_name,
    lc.area,
    lc.city,
    lc.district,
    lc.state,
    lc.country,
    lc.start_date,
    lc.end_date,
    lc.created_at,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', f.id,
                'name', f.name,
                'contact_number', f.contact_number,
                'email', f.email,
                'start_date', f.start_date,
                'end_date', f.end_date,
                'alias', f.alias
            )
        ) FILTER (WHERE f.id IS NOT NULL),
        '[]'::json
    ) AS facilitators,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', po.id,
                'name', po.name,
                'url', po.url,
                'contact', po.contact,
                'logo_url', po.logo_url
            )
        ) FILTER (WHERE po.id IS NOT NULL),
        '[]'::json
    ) AS partner_organisations
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
GROUP BY lc.id;

COMMIT;
