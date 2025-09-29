-- STEP 1: Drop all old policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to users" ON public."User";
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public."User";
DROP POLICY IF EXISTS "Public questions are viewable by everyone." ON public."Question";
DROP POLICY IF EXISTS "Users can insert their own questions." ON public."Question";
DROP POLICY IF EXISTS "Users can update their own questions." ON public."Question";
DROP POLICY IF EXISTS "Users cannot delete questions directly." ON public."Question";
DROP POLICY IF EXISTS "Public answers are viewable by everyone." ON public."Answer";
DROP POLICY IF EXISTS "Users can insert their own answers." ON public."Answer";
DROP POLICY IF EXISTS "Users can update their own answers." ON public."Answer";
DROP POLICY IF EXISTS "Users cannot delete answers directly." ON public."Answer";
DROP POLICY IF EXISTS "Allow public read access to votes" ON public."Vote";
DROP POLICY IF EXISTS "Allow users to insert their own votes" ON public."Vote";
DROP POLICY IF EXISTS "Allow users to delete their own votes" ON public."Vote";

-- STEP 2: Create new, simplified, and correct policies

-- === User Table Policies ===
-- Anyone can view user profiles.
CREATE POLICY "Allow public read access to users" ON public."User"
FOR SELECT USING (true);
-- Users can update their own profile.
CREATE POLICY "Allow users to update their own profile" ON public."User"
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- === Question Table Policies ===
-- Anyone can view non-deleted questions.
CREATE POLICY "Public questions are viewable by everyone." ON public."Question"
FOR SELECT USING (deleted_at IS NULL);
-- Authenticated users can create questions.
CREATE POLICY "Users can insert their own questions." ON public."Question"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can update their own non-deleted questions.
CREATE POLICY "Users can update their own questions." ON public."Question"
FOR UPDATE TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

-- === Answer Table Policies ===
-- Anyone can view non-deleted answers.
CREATE POLICY "Public answers are viewable by everyone." ON public."Answer"
FOR SELECT USING (deleted_at IS NULL);
-- Authenticated users can create answers.
CREATE POLICY "Users can insert their own answers." ON public."Answer"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can update their own non-deleted answers.
CREATE POLICY "Users can update their own answers." ON public."Answer"
FOR UPDATE TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

-- === Vote Table Policies ===
-- Anyone can view votes.
CREATE POLICY "Allow public read access to votes" ON public."Vote"
FOR SELECT USING (true);
-- Authenticated users can create votes.
CREATE POLICY "Allow users to insert their own votes" ON public."Vote"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Users can delete their own votes.
CREATE POLICY "Allow users to delete their own votes" ON public."Vote"
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTE: The `get_user_activity` function runs with the permissions of the user who DEFINED it (`SECURITY DEFINER`).
-- The definer is the `postgres` role, which bypasses RLS by default.
-- Therefore, the issue was not the function's permissions, but the RLS policies applied when the client *calls* the function
-- and when the browser renders data that triggers *other* RLS-protected queries.
-- This simplified ruleset ensures all necessary SELECTs are allowed for everyone, which is appropriate for a public Q&A site.
