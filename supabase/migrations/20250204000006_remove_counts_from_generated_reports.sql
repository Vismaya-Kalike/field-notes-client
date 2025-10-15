-- Migration: remove precomputed counts from generated_reports
BEGIN;

DROP VIEW IF EXISTS generated_reports_summary;

ALTER TABLE generated_reports
  DROP COLUMN IF EXISTS images_count,
  DROP COLUMN IF EXISTS messages_count;

CREATE VIEW generated_reports_summary AS
SELECT 
    gr.*,
    f.name AS facilitator_name,
    lc.centre_name AS learning_centre_name,
    TO_CHAR(DATE_TRUNC('month', MAKE_DATE(gr.year, gr.month, 1)), 'Mon YYYY') AS month_year_display
FROM generated_reports gr
JOIN facilitators f ON gr.facilitator_id = f.id
JOIN learning_centres lc ON gr.learning_centre_id = lc.id;

COMMIT;
