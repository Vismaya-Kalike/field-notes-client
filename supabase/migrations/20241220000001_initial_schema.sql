-- Initial schema migration for teacher reports app
-- This migration creates all tables, views, and relationships in one go

-- Enable necessary extensions for Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create facilitators table
CREATE TABLE facilitators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    start_date DATE,
    end_date DATE,
    alias TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to document the alias column
COMMENT ON COLUMN facilitators.alias IS 'Array of alternative names or aliases for the facilitator';

-- Create partner_organisations table
CREATE TABLE partner_organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT,
    contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_centres table
CREATE TABLE learning_centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL DEFAULT 'India',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_centre_facilitators junction table
CREATE TABLE learning_centre_facilitators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    facilitator_id UUID NOT NULL REFERENCES facilitators(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_centre_id, facilitator_id)
);

-- Create learning_centre_partner_organisations junction table
CREATE TABLE learning_centre_partner_organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    partner_organisation_id UUID NOT NULL REFERENCES partner_organisations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(learning_centre_id, partner_organisation_id)
);

-- Create generated_reports table
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facilitator_id UUID NOT NULL REFERENCES facilitators(id) ON DELETE CASCADE,
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    images_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    has_llm_analysis BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facilitator_id, learning_centre_id, month, year)
);

-- Create indexes for better performance
CREATE INDEX idx_learning_centres_state_district ON learning_centres(state, district);
CREATE INDEX idx_learning_centres_city ON learning_centres(city);
CREATE INDEX idx_generated_reports_learning_centre_id ON generated_reports(learning_centre_id);
CREATE INDEX idx_generated_reports_facilitator_id ON generated_reports(facilitator_id);
CREATE INDEX idx_generated_reports_year_month ON generated_reports(year DESC, month DESC);

-- Create an index on the alias column for better query performance
CREATE INDEX idx_facilitators_alias ON facilitators USING GIN (alias);

-- Create view for districts summary
CREATE VIEW districts_summary AS
SELECT 
    district,
    state,
    COUNT(*) as learning_centres_count
FROM learning_centres
GROUP BY district, state
ORDER BY state, district;

-- Create view for learning centres with details (includes alias field)
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
                'contact', po.contact
            )
        ) FILTER (WHERE po.id IS NOT NULL),
        '[]'::json
    ) as partner_organisations
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
GROUP BY lc.id;

-- Create view for generated reports summary
CREATE VIEW generated_reports_summary AS
SELECT 
    gr.*,
    f.name as facilitator_name,
    lc.centre_name as learning_centre_name,
    TO_CHAR(DATE_TRUNC('month', MAKE_DATE(gr.year, gr.month, 1)), 'Mon YYYY') as month_year_display
FROM generated_reports gr
JOIN facilitators f ON gr.facilitator_id = f.id
JOIN learning_centres lc ON gr.learning_centre_id = lc.id;

-- Enable Row Level Security (RLS)
ALTER TABLE facilitators ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_centre_facilitators ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_centre_partner_organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON facilitators FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON partner_organisations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON learning_centres FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON learning_centre_facilitators FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON learning_centre_partner_organisations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON generated_reports FOR SELECT USING (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_facilitators_updated_at BEFORE UPDATE ON facilitators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_organisations_updated_at BEFORE UPDATE ON partner_organisations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_centres_updated_at BEFORE UPDATE ON learning_centres FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_reports_updated_at BEFORE UPDATE ON generated_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();