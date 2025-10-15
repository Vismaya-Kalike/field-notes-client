-- Migration to add volunteers to learning centres, logo_url to partner organisations, and district-partner mapping
-- This migration adds new fields and creates a mapping table for better data organization

-- Create volunteers table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to document the volunteers table
COMMENT ON TABLE volunteers IS 'Table storing volunteer information';

-- Create learning_centre_volunteers junction table
CREATE TABLE learning_centre_volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_centre_id, volunteer_id)
);

-- Add comment to document the junction table
COMMENT ON TABLE learning_centre_volunteers IS 'Junction table linking learning centres to volunteers';

-- Add logo_url field to partner_organisations table
ALTER TABLE partner_organisations ADD COLUMN logo_url TEXT;

-- Add comment to document the logo_url column
COMMENT ON COLUMN partner_organisations.logo_url IS 'URL to the logo image for the partner organisation';

-- Create district_partner_organisations mapping table
-- This allows mapping multiple partner organisations to a district
CREATE TABLE district_partner_organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    partner_organisation_id UUID NOT NULL REFERENCES partner_organisations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(district, state, partner_organisation_id)
);

-- Add comment to document the table
COMMENT ON TABLE district_partner_organisations IS 'Mapping table linking districts to partner organisations';

-- Create index for better performance on district lookups
CREATE INDEX idx_district_partner_organisations_district_state ON district_partner_organisations(district, state);
CREATE INDEX idx_district_partner_organisations_partner_organisation_id ON district_partner_organisations(partner_organisation_id);

-- Enable Row Level Security (RLS) for the new tables
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_centre_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_partner_organisations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON learning_centre_volunteers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON district_partner_organisations FOR SELECT USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_volunteers_updated_at 
    BEFORE UPDATE ON volunteers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_district_partner_organisations_updated_at 
    BEFORE UPDATE ON district_partner_organisations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for volunteers tables
CREATE INDEX idx_learning_centre_volunteers_learning_centre_id ON learning_centre_volunteers(learning_centre_id);
CREATE INDEX idx_learning_centre_volunteers_volunteer_id ON learning_centre_volunteers(volunteer_id);

-- Create index on logo_url for better query performance
CREATE INDEX idx_partner_organisations_logo_url ON partner_organisations(logo_url);

-- Update the learning_centres_with_details view to include volunteers and logo_url
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
    ) as facilitators,
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
    ) as partner_organisations,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', v.id,
                'name', v.name
            )
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'::json
    ) as volunteers
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
LEFT JOIN learning_centre_volunteers lcv ON lc.id = lcv.learning_centre_id
LEFT JOIN volunteers v ON lcv.volunteer_id = v.id
GROUP BY lc.id;

-- Create a new view for districts with their partner organisations
CREATE VIEW districts_with_partner_organisations AS
SELECT 
    dpo.district,
    dpo.state,
    JSON_AGG(
        JSONB_BUILD_OBJECT(
            'id', po.id,
            'name', po.name,
            'url', po.url,
            'contact', po.contact,
            'logo_url', po.logo_url
        )
    ) as partner_organisations
FROM district_partner_organisations dpo
JOIN partner_organisations po ON dpo.partner_organisation_id = po.id
GROUP BY dpo.district, dpo.state
ORDER BY dpo.state, dpo.district;
