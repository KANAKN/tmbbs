-- STEP 1: Drop the existing function with the incorrect return type.
DROP FUNCTION IF EXISTS public.get_top_tags();

-- STEP 2: Recreate the function with the correct UUID return type.
CREATE OR REPLACE FUNCTION get_top_tags()
RETURNS TABLE (
    id UUID, -- CORRECTED to UUID
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
    JOIN
        public."Question" AS Q ON QT.question_id = Q.id
    WHERE
        Q.deleted_at IS NULL
    GROUP BY
        T.id, T.name
    ORDER BY
        question_count DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Grant permissions to the new function.
GRANT EXECUTE ON FUNCTION public.get_top_tags() TO anon;
GRANT EXECUTE ON FUNCTION public.get_top_tags() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_tags() TO service_role;
