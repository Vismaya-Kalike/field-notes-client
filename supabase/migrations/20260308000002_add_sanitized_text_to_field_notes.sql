BEGIN;

ALTER TABLE field_notes
  ADD COLUMN sanitized_text text;

COMMIT;
