-- Migration to create a function that returns random learning centres

CREATE OR REPLACE FUNCTION get_random_learning_centres(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
    id UUID,
    centre_name VARCHAR(255),
    area VARCHAR(255),
    city VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lc.id,
        lc.centre_name,
        lc.area,
        lc.city,
        lc.district,
        lc.state
    FROM learning_centres lc
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment to document the function
COMMENT ON FUNCTION get_random_learning_centres IS 'Returns a random selection of learning centres, default 6';
