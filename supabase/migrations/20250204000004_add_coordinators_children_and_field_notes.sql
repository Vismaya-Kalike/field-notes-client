-- Migration to introduce coordinators, children, and refactor field note storage

-- Rename generated report content tables to field_* tables
ALTER TABLE IF EXISTS generated_report_messages RENAME TO field_notes;
ALTER TABLE IF EXISTS generated_report_images RENAME TO field_images;

-- Drop legacy indexes tied to the old table names
DROP INDEX IF EXISTS idx_generated_report_messages_generated_report_id;
DROP INDEX IF EXISTS idx_generated_report_images_generated_report_id;

-- Remove the enforced foreign key link to generated_reports
ALTER TABLE field_notes DROP CONSTRAINT IF EXISTS generated_report_messages_generated_report_id_fkey;
ALTER TABLE field_images DROP CONSTRAINT IF EXISTS generated_report_images_generated_report_id_fkey;

-- Allow the generated_report_id columns to be optional for future flexibility
ALTER TABLE field_notes ALTER COLUMN generated_report_id DROP NOT NULL;
ALTER TABLE field_images ALTER COLUMN generated_report_id DROP NOT NULL;

-- Enrich field notes and images with direct learning centre / facilitator context
ALTER TABLE field_notes
    ADD COLUMN IF NOT EXISTS learning_centre_id UUID,
    ADD COLUMN IF NOT EXISTS facilitator_id UUID;

ALTER TABLE field_images
    ADD COLUMN IF NOT EXISTS learning_centre_id UUID,
    ADD COLUMN IF NOT EXISTS facilitator_id UUID;

-- Backfill the new columns using data from generated_reports
UPDATE field_notes fn
SET learning_centre_id = gr.learning_centre_id,
    facilitator_id = gr.facilitator_id
FROM generated_reports gr
WHERE fn.generated_report_id = gr.id
  AND (fn.learning_centre_id IS NULL OR fn.facilitator_id IS NULL);

UPDATE field_images fi
SET learning_centre_id = gr.learning_centre_id,
    facilitator_id = gr.facilitator_id
FROM generated_reports gr
WHERE fi.generated_report_id = gr.id
  AND (fi.learning_centre_id IS NULL OR fi.facilitator_id IS NULL);

-- Enforce learning centre presence now that data is populated
ALTER TABLE field_notes ALTER COLUMN learning_centre_id SET NOT NULL;
ALTER TABLE field_images ALTER COLUMN learning_centre_id SET NOT NULL;

-- Add foreign keys for the new contextual columns
ALTER TABLE field_notes
    ADD CONSTRAINT field_notes_learning_centre_id_fkey FOREIGN KEY (learning_centre_id) REFERENCES learning_centres(id) ON DELETE CASCADE,
    ADD CONSTRAINT field_notes_facilitator_id_fkey FOREIGN KEY (facilitator_id) REFERENCES facilitators(id) ON DELETE SET NULL;

ALTER TABLE field_images
    ADD CONSTRAINT field_images_learning_centre_id_fkey FOREIGN KEY (learning_centre_id) REFERENCES learning_centres(id) ON DELETE CASCADE,
    ADD CONSTRAINT field_images_facilitator_id_fkey FOREIGN KEY (facilitator_id) REFERENCES facilitators(id) ON DELETE SET NULL;

-- Recreate helpful indexes for the refactored tables
CREATE INDEX IF NOT EXISTS idx_field_notes_learning_centre_id ON field_notes(learning_centre_id);
CREATE INDEX IF NOT EXISTS idx_field_notes_facilitator_id ON field_notes(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_field_notes_generated_report_id ON field_notes(generated_report_id);
CREATE INDEX IF NOT EXISTS idx_field_images_learning_centre_id ON field_images(learning_centre_id);
CREATE INDEX IF NOT EXISTS idx_field_images_facilitator_id ON field_images(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_field_images_generated_report_id ON field_images(generated_report_id);

-- Refresh Row Level Security policies for the renamed tables
DROP POLICY IF EXISTS "Enable read access for all users" ON field_notes;
DROP POLICY IF EXISTS "Enable read access for all users" ON field_images;

CREATE POLICY "Public read access on field_notes" ON field_notes FOR SELECT USING (true);
CREATE POLICY "Public read access on field_images" ON field_images FOR SELECT USING (true);

-- Coordinators master table
CREATE TABLE coordinators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on coordinators" ON coordinators FOR SELECT USING (true);

CREATE TRIGGER update_coordinators_updated_at
    BEFORE UPDATE ON coordinators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Coordinator field notes table
CREATE TABLE coordinator_field_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coordinator_id UUID NOT NULL REFERENCES coordinators(id) ON DELETE CASCADE,
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    noted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE coordinator_field_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on coordinator_field_notes" ON coordinator_field_notes FOR SELECT USING (true);

CREATE INDEX idx_coordinator_field_notes_coordinator_id ON coordinator_field_notes(coordinator_id);
CREATE INDEX idx_coordinator_field_notes_learning_centre_id ON coordinator_field_notes(learning_centre_id);

-- Children table scoped to learning centres
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_centre_id UUID NOT NULL REFERENCES learning_centres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    alias TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on children" ON children FOR SELECT USING (true);

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_children_learning_centre_id ON children(learning_centre_id);

-- Join table mapping children to facilitator field notes or coordinator field notes
CREATE TABLE child_field_note_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    field_note_id UUID REFERENCES field_notes(id) ON DELETE CASCADE,
    coordinator_field_note_id UUID REFERENCES coordinator_field_notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        ((field_note_id IS NOT NULL)::int + (coordinator_field_note_id IS NOT NULL)::int) = 1
    )
);

ALTER TABLE child_field_note_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access on child_field_note_links" ON child_field_note_links FOR SELECT USING (true);

CREATE INDEX idx_child_field_note_links_child_id ON child_field_note_links(child_id);
CREATE INDEX idx_child_field_note_links_field_note_id ON child_field_note_links(field_note_id);
CREATE INDEX idx_child_field_note_links_coordinator_field_note_id ON child_field_note_links(coordinator_field_note_id);

-- Update learning_centres_with_details view to surface children as part of the payload
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
    ) as volunteers,
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', ch.id,
                'name', ch.name,
                'alias', ch.alias
            )
        ) FILTER (WHERE ch.id IS NOT NULL),
        '[]'::json
    ) as children
FROM learning_centres lc
LEFT JOIN learning_centre_facilitators lcf ON lc.id = lcf.learning_centre_id
LEFT JOIN facilitators f ON lcf.facilitator_id = f.id
LEFT JOIN learning_centre_partner_organisations lcpo ON lc.id = lcpo.learning_centre_id
LEFT JOIN partner_organisations po ON lcpo.partner_organisation_id = po.id
LEFT JOIN learning_centre_volunteers lcv ON lc.id = lcv.learning_centre_id
LEFT JOIN volunteers v ON lcv.volunteer_id = v.id
LEFT JOIN children ch ON lc.id = ch.learning_centre_id
GROUP BY lc.id;

