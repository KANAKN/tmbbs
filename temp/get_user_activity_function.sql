CREATE OR REPLACE FUNCTION get_user_activity(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_questions JSON;
    user_answers JSON;
    user_voted_answers JSON;
BEGIN
    -- 1. ユーザーが投稿した質問を取得 (論理削除されていないもの)
    SELECT json_agg(q) INTO user_questions
    FROM (
        SELECT id, title, created_at
        FROM public."Question"
        WHERE user_id = p_user_id AND deleted_at IS NULL
        ORDER BY created_at DESC
    ) q;

    -- 2. ユーザーが投稿した回答を取得 (回答・質問ともに論理削除されていないもの)
    SELECT json_agg(a) INTO user_answers
    FROM (
        SELECT ans.id, ans.content, ans.created_at,
               json_build_object('id', q.id, 'title', q.title) AS "Question"
        FROM public."Answer" AS ans
        JOIN public."Question" AS q ON ans.question_id = q.id
        WHERE ans.user_id = p_user_id
          AND ans.deleted_at IS NULL
          AND q.deleted_at IS NULL
        ORDER BY ans.created_at DESC
    ) a;

    -- 3. ユーザーがいいねした回答を取得 (回答・質問ともに論理削除されていないもの)
    SELECT json_agg(va) INTO user_voted_answers
    FROM (
        SELECT ans.id, ans.content, ans.created_at,
               json_build_object('id', q.id, 'title', q.title) AS "Question"
        FROM public."Vote" AS v
        JOIN public."Answer" AS ans ON v.answer_id = ans.id
        JOIN public."Question" AS q ON ans.question_id = q.id
        WHERE v.user_id = p_user_id
          AND ans.deleted_at IS NULL
          AND q.deleted_at IS NULL
        ORDER BY v.created_at DESC
    ) va;

    -- 4. 全てのデータを一つのJSONオブジェクトとして返す
    RETURN json_build_object(
        'questions', COALESCE(user_questions, '[]'::json),
        'answers', COALESCE(user_answers, '[]'::json),
        'votedAnswers', COALESCE(user_voted_answers, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- この関数を実行できる権限を付与
GRANT EXECUTE ON FUNCTION public.get_user_activity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity(UUID) TO service_role; -- サーバーサイドからも呼べるように
