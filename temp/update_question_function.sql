-- 必要な権限を付与 (初回のみ)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public."Question" TO service_role;
GRANT ALL ON TABLE public."Tag" TO service_role;
GRANT ALL ON TABLE public."QuestionTag" TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public."Tag_id_seq" TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public."QuestionTag_id_seq" TO service_role;


-- 質問、カテゴリ、タグをまとめて更新する関数
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
    v_tag_id INT;
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
    FOREACH tag_name IN ARRAY p_tag_names
    LOOP
        -- タグが存在するか確認し、なければ新規作成(UPSERT)
        INSERT INTO public."Tag" (name)
        VALUES (TRIM(tag_name))
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_tag_id;

        -- QuestionTagテーブルに新しい関連を挿入
        INSERT INTO public."QuestionTag" (question_id, tag_id)
        VALUES (p_question_id, v_tag_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- この関数を実行できる権限を付与
GRANT EXECUTE ON FUNCTION public.update_question_with_tags(UUID, TEXT, TEXT, UUID, TEXT[]) TO authenticated;
