BEGIN;

ALTER TABLE learning_centres
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    ADD COLUMN status_description TEXT;

-- Recreate districts_summary to only count active centres
DROP VIEW IF EXISTS districts_summary;

CREATE VIEW districts_summary AS
SELECT
    district,
    state,
    COUNT(*) AS learning_centres_count
FROM learning_centres
WHERE status = 'active'
GROUP BY district, state
ORDER BY state, district;

-- Recreate views that use lc.* so they pick up the new columns
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
                'alias', f.alias,
                'active', lcf.active
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
    ) AS volunteers
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
LEFT JOIN learning_centre_volunteers lcv ON lc.id = lcv.learning_centre_id
LEFT JOIN volunteers v ON lcv.volunteer_id = v.id
GROUP BY lc.id;

DROP VIEW IF EXISTS learning_centres_by_district;

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
    lc.status,
    lc.status_description,
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
                'alias', f.alias,
                'active', lcf.active
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

-- Exclude inactive centres from random functions
DROP FUNCTION IF EXISTS get_random_learning_centres(INTEGER);

CREATE FUNCTION get_random_learning_centres(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
    id UUID,
    centre_name VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lc.id,
        lc.centre_name,
        lc.area,
        lc.city,
        lc.district,
        lc.state
    FROM learning_centres lc
    WHERE lc.status = 'active'
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_random_field_images(INTEGER, INTEGER, TEXT);

CREATE FUNCTION get_random_field_images(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0,
    seed TEXT DEFAULT '0'
)
RETURNS TABLE (
    id UUID,
    photo_url TEXT,
    caption TEXT,
    learning_centre_id UUID,
    state VARCHAR,
    district VARCHAR,
    sent_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fi.id,
        fi.photo_url,
        fi.caption,
        fi.learning_centre_id,
        lc.state,
        lc.district,
        fi.sent_at
    FROM field_images fi
    JOIN learning_centres lc ON fi.learning_centre_id = lc.id
    WHERE lc.status = 'active'
    ORDER BY md5(fi.id::text || seed)
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
