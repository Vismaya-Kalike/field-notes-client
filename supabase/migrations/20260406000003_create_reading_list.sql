BEGIN;

CREATE TABLE reading_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('book', 'article', 'paper')),
    description TEXT NOT NULL,
    apa_citation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reading_list_type ON reading_list (type);

COMMIT;
