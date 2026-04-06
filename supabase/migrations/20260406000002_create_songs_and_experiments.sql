BEGIN;

CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    lyrics TEXT NOT NULL,
    author VARCHAR(255),
    pedagogical_purpose TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_songs_song_number ON songs (song_number);

CREATE TABLE science_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    materials TEXT NOT NULL,
    steps TEXT NOT NULL,
    result TEXT NOT NULL,
    learning_outcome TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_science_experiments_experiment_number ON science_experiments (experiment_number);
CREATE INDEX idx_science_experiments_category ON science_experiments (category);

COMMIT;
