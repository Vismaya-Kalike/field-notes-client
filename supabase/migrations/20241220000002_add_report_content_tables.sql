-- Migration to add content tables for generated reports
-- This migration adds tables for storing images, messages, and LLM analysis for generated reports

-- Create generated_report_images table
CREATE TABLE generated_report_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_report_id UUID NOT NULL REFERENCES generated_reports(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_report_messages table
CREATE TABLE generated_report_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_report_id UUID NOT NULL REFERENCES generated_reports(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_report_llm_analysis table
CREATE TABLE generated_report_llm_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_report_id UUID NOT NULL REFERENCES generated_reports(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_generated_report_images_generated_report_id ON generated_report_images(generated_report_id);
CREATE INDEX idx_generated_report_messages_generated_report_id ON generated_report_messages(generated_report_id);
CREATE INDEX idx_generated_report_llm_analysis_generated_report_id ON generated_report_llm_analysis(generated_report_id);

-- Enable Row Level Security (RLS)
ALTER TABLE generated_report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_report_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_report_llm_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON generated_report_images FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON generated_report_messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON generated_report_llm_analysis FOR SELECT USING (true);
