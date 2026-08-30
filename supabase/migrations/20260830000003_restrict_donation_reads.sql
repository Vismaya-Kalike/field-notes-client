-- Stop exposing donor personal data to anyone holding the publishable key.
--
-- "Allow public to view donations" was USING (true) for the anon role, and the
-- publishable key ships in the browser bundle, so donor names, emails, phone numbers,
-- addresses, PAN numbers and amounts were world-readable.
--
-- No client component reads this table: every query against donations lives in an API
-- route, and those now use the secret key via lib/supabase-admin.ts, which bypasses RLS.
-- Dropping the policy therefore removes the exposure without removing any capability.

DROP POLICY IF EXISTS "Allow public to view donations" ON donations;

-- Inserts stay open to anon: the donate form creates the record before payment, and
-- there is no sign-in. Reads and updates are now server-only.
