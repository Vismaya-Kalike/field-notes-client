-- Migration to create activities table for storing games and activities from Book of Wonder
-- This table supports filtering by constraint dimensions for self-directed learning spaces

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core activity details
    name VARCHAR(255) NOT NULL UNIQUE,
    materials_required TEXT,
    objective TEXT,
    how_to_play TEXT,
    outcome TEXT,

    -- Constraint dimensions for filtering (binary 0/1)
    -- 0 = No/Low, 1 = Yes/High

    -- Facilitator Constraint: Does the activity need a facilitator?
    -- 0 = No facilitator needed, children can do independently
    -- 1 = Requires facilitation/guidance
    facilitator_constraint INTEGER NOT NULL CHECK (facilitator_constraint >= 0 AND facilitator_constraint <= 1),

    -- Space Constraint: Does the activity need significant space?
    -- 0 = Can be done at a desk/table or small area
    -- 1 = Requires large space (outdoor/playground)
    space_constraint INTEGER NOT NULL CHECK (space_constraint >= 0 AND space_constraint <= 1),

    -- Repeat Constraint: Is the activity highly repeatable?
    -- 0 = One-time or limited replay value
    -- 1 = Highly repeatable, children enjoy doing it many times
    repeat_constraint INTEGER NOT NULL CHECK (repeat_constraint >= 0 AND repeat_constraint <= 1),

    -- Material Constraint: Does the activity require materials?
    -- 0 = No materials or only basic/common items
    -- 1 = Requires specific materials
    material_constraint INTEGER NOT NULL CHECK (material_constraint >= 0 AND material_constraint <= 1),

    -- Knowledge Constraint: Does the activity require prior knowledge?
    -- 0 = No prior knowledge required
    -- 1 = Requires prior knowledge or skills
    knowledge_constraint INTEGER NOT NULL CHECK (knowledge_constraint >= 0 AND knowledge_constraint <= 1),

    -- Exposure to New Topics: Does the activity expose children to new concepts?
    -- 0 = Primarily reinforces existing skills
    -- 1 = Exposes to new topics and ideas
    exposure_to_new_topics INTEGER NOT NULL CHECK (exposure_to_new_topics >= 0 AND exposure_to_new_topics <= 1),

    -- Activity categorization
    category VARCHAR(100),
    tags TEXT[],

    -- Metadata
    created_by UUID REFERENCES facilitators(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE activities IS 'Games and activities from Book of Wonder for joyful learning in self-directed spaces';
COMMENT ON COLUMN activities.facilitator_constraint IS '0=independent, 1=needs facilitation';
COMMENT ON COLUMN activities.space_constraint IS '0=small space, 1=large space needed';
COMMENT ON COLUMN activities.repeat_constraint IS '0=limited replay, 1=highly repeatable';
COMMENT ON COLUMN activities.material_constraint IS '0=no/basic materials, 1=specific materials needed';
COMMENT ON COLUMN activities.knowledge_constraint IS '0=no prior knowledge, 1=prior knowledge needed';
COMMENT ON COLUMN activities.exposure_to_new_topics IS '0=reinforces existing, 1=exposes new concepts';
COMMENT ON COLUMN activities.created_by IS 'Optional reference to facilitator who created/added the activity';

-- Create indexes for filtering by constraints
CREATE INDEX idx_activities_facilitator_constraint ON activities(facilitator_constraint);
CREATE INDEX idx_activities_space_constraint ON activities(space_constraint);
CREATE INDEX idx_activities_repeat_constraint ON activities(repeat_constraint);
CREATE INDEX idx_activities_material_constraint ON activities(material_constraint);
CREATE INDEX idx_activities_knowledge_constraint ON activities(knowledge_constraint);
CREATE INDEX idx_activities_exposure_to_new_topics ON activities(exposure_to_new_topics);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_tags ON activities USING GIN (tags);
CREATE INDEX idx_activities_created_by ON activities(created_by);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access on activities" ON activities FOR SELECT USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
