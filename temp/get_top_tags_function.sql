CREATE OR REPLACE FUNCTION get_top_tags()
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    question_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        T.id,
        T.name,
        COUNT(QT.question_id) AS question_count
    FROM
        public."Tag" AS T
    JOIN
        public."QuestionTag" AS QT ON T.id = QT.tag_id
    GROUP BY
        T.id, T.name
    ORDER BY
        question_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- This function can be called by anyone
GRANT EXECUTE ON FUNCTION public.get_top_tags() TO anon;
GRANT EXECUTE ON FUNCTION public.get_top_tags() TO authenticated;
