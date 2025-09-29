-- Questionテーブルに論理削除用のカラムを追加
ALTER TABLE public."Question" ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Answerテーブルに論理削除用のカラムを追加
ALTER TABLE public."Answer" ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
