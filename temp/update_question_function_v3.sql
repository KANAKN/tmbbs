-- STEP 1: 質問、カテゴリ、タグをまとめて更新する関数を作成します
-- (idカラムの型がUUIDであることを前提に修正)
CREATE OR REPLACE FUNCTION update_question_with_tags(
    p_question_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_category_id UUID,
    p_tag_names TEXT[]
)
RETURNS VOID AS $$
DECLARE
    tag_name TEXT;
    v_tag_id UUID; -- 変数の型をUUIDに変更
BEGIN
    -- 1. Questionテーブルの基本情報を更新
    UPDATE public."Question"
    SET
        title = p_title,
        description = p_description,
        category_id = p_category_id
    WHERE id = p_question_id;

    -- 2. 既存のタグ関連を一旦削除
    DELETE FROM public."QuestionTag"
    WHERE question_id = p_question_id;

    -- 3. 新しいタグを処理
    IF array_length(p_tag_names, 1) > 0 THEN
        FOREACH tag_name IN ARRAY p_tag_names
        LOOP
            -- タグが存在するか確認し、なければ新規作成(UPSERT)
            -- idは自動生成(gen_random_uuid())される前提
            INSERT INTO public."Tag" (name)
            VALUES (TRIM(tag_name))
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id INTO v_tag_id;

            -- QuestionTagテーブルに新しい関連を挿入
            -- こちらのidも自動生成される前提
            INSERT INTO public."QuestionTag" (question_id, tag_id)
            VALUES (p_question_id, v_tag_id);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: この関数を実行できる権限を付与します
GRANT EXECUTE ON FUNCTION public.update_question_with_tags(UUID, TEXT, TEXT, UUID, TEXT[]) TO authenticated;
