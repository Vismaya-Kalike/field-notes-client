BEGIN;

ALTER TABLE field_notes
  ADD COLUMN is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN ai_commentary text;

COMMIT;
