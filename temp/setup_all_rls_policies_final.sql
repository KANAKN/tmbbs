-- STEP 1: Enable RLS on all relevant tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Answer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vote" ENABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all old policies to ensure a clean slate
-- (Errors here can be ignored if a policy doesn't exist)
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

-- STEP 3: Create new, correct policies

-- === User Table Policies ===
CREATE POLICY "Allow public read access to users" ON public."User"
FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public."User"
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- === Question Table Policies ===
CREATE POLICY "Public questions are viewable by everyone." ON public."Question"
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own questions." ON public."Question"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions." ON public."Question"
FOR UPDATE TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users cannot delete questions directly." ON public."Question"
FOR DELETE USING (false);

-- === Answer Table Policies ===
CREATE POLICY "Public answers are viewable by everyone." ON public."Answer"
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own answers." ON public."Answer"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers." ON public."Answer"
FOR UPDATE TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users cannot delete answers directly." ON public."Answer"
FOR DELETE USING (false);

-- === Vote Table Policies (THE MISSING PIECE) ===
CREATE POLICY "Allow public read access to votes" ON public."Vote"
FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own votes" ON public."Vote"
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own votes" ON public."Vote"
FOR DELETE TO authenticated USING (auth.uid() = user_id);
