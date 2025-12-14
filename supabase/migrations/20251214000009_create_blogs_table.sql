-- Migration to create blogs table for ViKa blog posts

-- Create blogs table
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Blog post details
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,

    -- Author information
    author_name VARCHAR(255),
    author_id UUID REFERENCES facilitators(id) ON DELETE SET NULL,

    -- Publishing status
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Categorization
    tags TEXT[],

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE blogs IS 'Blog posts for ViKa stories, updates, and reflections';
COMMENT ON COLUMN blogs.slug IS 'URL-friendly identifier for the blog post';
COMMENT ON COLUMN blogs.excerpt IS 'Short summary shown in blog listings';
COMMENT ON COLUMN blogs.is_published IS 'Whether the post is visible to the public';
COMMENT ON COLUMN blogs.author_id IS 'Optional reference to facilitator who authored the post';

-- Create indexes for common queries
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_is_published ON blogs(is_published);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_tags ON blogs USING GIN (tags);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only published posts)
CREATE POLICY "Public read access on published blogs" ON blogs
    FOR SELECT USING (is_published = true);

-- Create trigger for updated_at
CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
