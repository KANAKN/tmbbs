-- Userテーブルにプロフィール画像のURLを保存するカラムを追加します。
ALTER TABLE public."User" ADD COLUMN avatar_url TEXT;

-- 【テスト方法】
-- SQL実行後、SupabaseのTable EditorでUserテーブルを開き、
-- テストしたいユーザーの`avatar_url`カラムに、
-- 何か画像URL（例: https://placekitten.com/200/200）を手動で貼り付けてみてください。
-- これで、次のステップで画像が表示されるか確認できます。
