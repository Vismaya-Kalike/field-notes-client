-- Create donations table for tracking all donation transactions
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Donor information
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  donor_address TEXT,
  pan_number TEXT,

  -- Donation details
  country TEXT NOT NULL CHECK (country IN ('india', 'us')),
  organization TEXT NOT NULL,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('recurring', 'onetime')),
  recurring_tier TEXT,

  -- Amount information
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),

  -- Payment details
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('card', 'upi', 'bank_transfer', 'cheque', 'employee_matching')
  ),
  payment_gateway TEXT,
  payment_gateway_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'completed', 'failed')
  ),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint: recurring donations must have a tier
  CONSTRAINT valid_recurring_tier CHECK (
    (donation_type = 'onetime') OR
    (donation_type = 'recurring' AND recurring_tier IS NOT NULL)
  )
);

-- Create indexes for common queries
CREATE INDEX idx_donations_email ON donations(donor_email);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_created ON donations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for anonymous donations)
CREATE POLICY "Allow public inserts" ON donations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own donations via email
CREATE POLICY "Users can view own donations" ON donations
  FOR SELECT
  USING (donor_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Comment on table
COMMENT ON TABLE donations IS 'Stores donation transactions for Heera Foundation (India) and Spring Foundation (US)';
