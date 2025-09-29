-- まず、テーブルでRLSを有効化します (まだ有効でない場合)
ALTER TABLE public."Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Answer" ENABLE ROW LEVEL SECURITY;

-- 古いポリシーが存在する場合は削除 (エラーが出ても無視してOK)
DROP POLICY IF EXISTS "Public questions are viewable by everyone." ON public."Question";
DROP POLICY IF EXISTS "Users can insert their own questions." ON public."Question";
DROP POLICY IF EXISTS "Users can update their own questions." ON public."Question";
DROP POLICY IF EXISTS "Users can delete their own questions." ON public."Question";
DROP POLICY IF EXISTS "Public answers are viewable by everyone." ON public."Answer";
DROP POLICY IF EXISTS "Users can insert their own answers." ON public."Answer";
DROP POLICY IF EXISTS "Users can update their own answers." ON public."Answer";
DROP POLICY IF EXISTS "Users can delete their own answers." ON public."Answer";


-- === Questionテーブルの新しいポリシー ===

-- 1. SELECT (閲覧) ポリシー: `deleted_at`がNULLのデータのみ閲覧を許可
CREATE POLICY "Public questions are viewable by everyone."
ON public."Question" FOR SELECT
USING ( deleted_at IS NULL );

-- 2. INSERT (作成) ポリシー: 認証済みユーザーは作成を許可
CREATE POLICY "Users can insert their own questions."
ON public."Question" FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. UPDATE (更新) ポリシー: 自分の投稿（まだ削除されていない）のみ更新を許可
CREATE POLICY "Users can update their own questions."
ON public."Question" FOR UPDATE
TO authenticated
USING ( auth.uid() = user_id AND deleted_at IS NULL )
WITH CHECK ( auth.uid() = user_id );

-- 4. DELETE (物理削除) ポリシー: 原則として物理削除は許可しない (安全のため)
-- もし物理削除が必要な場合は、`to authenticated` の部分を `to service_role` などに変更します。
CREATE POLICY "Users cannot delete questions directly."
ON public."Question" FOR DELETE
USING ( false );


-- === Answerテーブルの新しいポリシー ===

-- 1. SELECT (閲覧) ポリシー: `deleted_at`がNULLのデータのみ閲覧を許可
CREATE POLICY "Public answers are viewable by everyone."
ON public."Answer" FOR SELECT
USING ( deleted_at IS NULL );

-- 2. INSERT (作成) ポリシー: 認証済みユーザーは作成を許可
CREATE POLICY "Users can insert their own answers."
ON public."Answer" FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. UPDATE (更新) ポリシー: 自分の投稿（まだ削除されていない）のみ更新を許可
CREATE POLICY "Users can update their own answers."
ON public."Answer" FOR UPDATE
TO authenticated
USING ( auth.uid() = user_id AND deleted_at IS NULL )
WITH CHECK ( auth.uid() = user_id );

-- 4. DELETE (物理削除) ポリシー: 原則として物理削除は許可しない
CREATE POLICY "Users cannot delete answers directly."
ON public."Answer" FOR DELETE
USING ( false );
