-- Donors: sponsors who support learning centres. Modeled like partner_organisations
-- (a donors table + a many-to-many join), exposed on the learning_centres_by_district view.

CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email TEXT,
    phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_centre_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_centre_id, donor_id)
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_centre_donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON donors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON learning_centre_donors FOR SELECT USING (true);

-- Seed donors from the "Centers Supported" sheet, split into individuals with
-- emails matched from the "Mailing List" sheet (blank where not found).
INSERT INTO donors (name, email)
SELECT v.name, NULLIF(v.email, '')
FROM (VALUES
    ('Meena Talasila',    'meena.talasila@gmail.com'),
    ('Yamini Talasila',   'yamini.choudary4@gmail.com'),
    ('Amrita Mittal',     'mittal.amrita@gmail.com'),
    ('Mudit Tulsianey',   'mudit.tulsianey@outlook.com'),
    ('Rohan Sacheti',     'rohan.sacheti@gmail.com'),
    ('Saravanan',         'msar@hotmail.com'),
    ('Nikhil Karajgikar', 'nikhilkarajgikar@gmail.com'),
    ('Soumili Kole',      ''),
    ('Sobhana Atluri',    'sobhanaa@stanford.edu'),
    ('Evolve Back',       '')
) AS v(name, email)
WHERE NOT EXISTS (SELECT 1 FROM donors d WHERE d.name = v.name);

-- Map donors to their centres (Evolve Back supports two; pairs both link to one centre)
INSERT INTO learning_centre_donors (learning_centre_id, donor_id)
SELECT lc.id, d.id
FROM (VALUES
    ('Kutakanakeri',      'Meena Talasila'),
    ('Kutakanakeri',      'Yamini Talasila'),
    ('Fakir Colony',      'Amrita Mittal'),
    ('Jhenda Gully',      'Mudit Tulsianey'),
    ('Jhenda Gully',      'Rohan Sacheti'),
    ('T R Nagar',         'Saravanan'),
    ('Yarab Nagar',       'Nikhil Karajgikar'),
    ('Yarab Nagar',       'Soumili Kole'),
    ('Halemalappanagudi', 'Sobhana Atluri'),
    ('Kamalapura',        'Evolve Back'),
    ('Kerethanda',        'Evolve Back')
) AS m(centre, donor)
JOIN learning_centres lc ON lc.centre_name = m.centre
JOIN donors d ON d.name = m.donor
ON CONFLICT (learning_centre_id, donor_id) DO NOTHING;

-- Expose donors on the district view (appended after partner_organisations)
CREATE OR REPLACE VIEW learning_centres_by_district AS
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
    ) AS partner_organisations,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', dn.id,
                'name', dn.name,
                'email', dn.email,
                'phone', dn.phone
            )
        ) FILTER (WHERE dn.id IS NOT NULL),
        '[]'::json
    ) AS donors
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
LEFT JOIN learning_centre_donors lcd ON lc.id = lcd.learning_centre_id
LEFT JOIN donors dn ON lcd.donor_id = dn.id
GROUP BY lc.id;
