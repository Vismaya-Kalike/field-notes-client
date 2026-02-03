-- Migration to add type field to partner_organisations table

-- Add type field to partner_organisations table
ALTER TABLE partner_organisations ADD COLUMN type TEXT;

-- Add comment to document the type column
COMMENT ON COLUMN partner_organisations.type IS 'Type/category of the partner organisation (e.g., Community Partner, Resource Partner)';
