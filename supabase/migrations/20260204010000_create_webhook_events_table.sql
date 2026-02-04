-- Create webhook_events table for idempotent webhook processing
CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Store event data for debugging
  event_data JSONB,

  -- Index for cleanup queries
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for cleanup operations
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No public access to webhook events (server-side only)
CREATE POLICY "No public access" ON webhook_events
  FOR ALL
  USING (false);

COMMENT ON TABLE webhook_events IS 'Tracks processed Stripe webhook events to ensure idempotent processing';
