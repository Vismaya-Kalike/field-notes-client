-- Migration: remove child names from public learning centre view
BEGIN;

DROP VIEW IF EXISTS learning_centres_with_details;

CREATE VIEW learning_centres_with_details AS
SELECT 
    lc.*,
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
    ) AS partner_organisations,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', v.id,
                'name', v.name
            )
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'::json
    ) AS volunteers,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', ch.id,
                'alias', ch.alias
            )
        ) FILTER (WHERE ch.id IS NOT NULL),
        '[]'::json
    ) AS children
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
LEFT JOIN learning_centre_volunteers lcv ON lc.id = lcv.learning_centre_id
LEFT JOIN volunteers v ON lcv.volunteer_id = v.id
LEFT JOIN children ch ON lc.id = ch.learning_centre_id
GROUP BY lc.id;

COMMIT;
