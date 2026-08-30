-- Support group giving ("adopt a center with your friends") and center-count tiers.
--
-- group_members holds the optional friends a donor names when splitting a center.
-- It is a short, bounded list always read alongside its donation and never queried
-- by, so it lives inline as JSONB rather than in a child table.
--
-- center_count records how many learning centres a recurring donation sponsors,
-- mirroring the quantity billed on the Stripe subscription.

ALTER TABLE donations ADD COLUMN group_members JSONB;
ALTER TABLE donations ADD COLUMN center_count INTEGER;

ALTER TABLE donations ADD CONSTRAINT valid_center_count CHECK (
  center_count IS NULL OR center_count > 0
);

COMMENT ON COLUMN donations.group_members IS
  'Optional [{name, email}] list of friends splitting a centre with the donor';
COMMENT ON COLUMN donations.center_count IS
  'Learning centres sponsored by this donation; matches Stripe subscription quantity';
