-- 外部キー制約にカスケード削除(ON DELETE CASCADE)を追加し、
-- 質問を削除した際に関連する回答、タグ、投票が自動的に削除されるように設定します。

-- 1. Answerテーブルの外部キー制約を再設定
-- 既存の制約を一度削除
ALTER TABLE public."Answer" DROP CONSTRAINT "Answer_question_id_fkey";
-- ON DELETE CASCADEを付けて制約を再追加
ALTER TABLE public."Answer" ADD CONSTRAINT "Answer_question_id_fkey"
  FOREIGN KEY (question_id) REFERENCES public."Question"(id) ON DELETE CASCADE;

-- 2. QuestionTagテーブルの外部キー制約を再設定
-- (注意: 制約名は環境によって異なる可能性があります。もしエラーが出たらSupabaseの管理画面で確認してください)
-- 既存の制約を一度削除
ALTER TABLE public."QuestionTag" DROP CONSTRAINT "QuestionTag_question_id_fkey";
-- ON DELETE CASCADEを付けて制約を再追加
ALTER TABLE public."QuestionTag" ADD CONSTRAINT "QuestionTag_question_id_fkey"
  FOREIGN KEY (question_id) REFERENCES public."Question"(id) ON DELETE CASCADE;

-- 3. Voteテーブルの外部キー制約を再設定 (回答が消えたら投票も消えるように)
-- (注意: 制約名は環境によって異なる可能性があります)
-- 既存の制約を一度削除
ALTER TABLE public."Vote" DROP CONSTRAINT "Vote_answer_id_fkey";
-- ON DELETE CASCADEを付けて制約を再追加
ALTER TABLE public."Vote" ADD CONSTRAINT "Vote_answer_id_fkey"
  FOREIGN KEY (answer_id) REFERENCES public."Answer"(id) ON DELETE CASCADE;
