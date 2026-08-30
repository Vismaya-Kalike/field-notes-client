-- Distinguish a donor who chose to stop from a payment that failed.
--
-- Cancellation webhooks previously wrote payment_status = 'failed', which made a donor
-- who gave for years and then stopped indistinguishable from a declined card, and
-- overwrote the record of a payment that had genuinely succeeded.

ALTER TABLE donations DROP CONSTRAINT donations_payment_status_check;

ALTER TABLE donations ADD CONSTRAINT donations_payment_status_check CHECK (
  payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')
);

ALTER TABLE donations ADD COLUMN cancelled_at TIMESTAMPTZ;

COMMENT ON COLUMN donations.cancelled_at IS
  'When the donor stopped this recurring donation; null while active or for one-time gifts';
