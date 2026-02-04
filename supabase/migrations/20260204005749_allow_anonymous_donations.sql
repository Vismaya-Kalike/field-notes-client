-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Allow public inserts" ON donations;

-- Create a new policy that allows anyone (including anonymous users) to insert
CREATE POLICY "Allow anonymous inserts" ON donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also allow anonymous users to view all donations (optional - adjust based on your privacy requirements)
-- If you want donations to be private, keep the existing SELECT policy
DROP POLICY IF EXISTS "Users can view own donations" ON donations;

CREATE POLICY "Allow public to view donations" ON donations
  FOR SELECT
  TO anon, authenticated
  USING (true);
