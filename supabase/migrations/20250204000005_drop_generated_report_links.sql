-- Migration to remove the legacy generated_report_id linkage from field notes and images

-- Drop indexes that depend on generated_report_id
DROP INDEX IF EXISTS idx_field_notes_generated_report_id;
DROP INDEX IF EXISTS idx_field_images_generated_report_id;

-- Drop any lingering foreign keys referencing generated_report_id (safety checks)
ALTER TABLE field_notes DROP CONSTRAINT IF EXISTS field_notes_generated_report_id_fkey;
ALTER TABLE field_images DROP CONSTRAINT IF EXISTS field_images_generated_report_id_fkey;

-- Remove the columns themselves now that lookups use centre + period
ALTER TABLE field_notes DROP COLUMN IF EXISTS generated_report_id;
ALTER TABLE field_images DROP COLUMN IF EXISTS generated_report_id;
