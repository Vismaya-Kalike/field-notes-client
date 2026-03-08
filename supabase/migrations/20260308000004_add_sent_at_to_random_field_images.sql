DROP FUNCTION IF EXISTS get_random_field_images(INTEGER, INTEGER, TEXT);

CREATE FUNCTION get_random_field_images(
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
  seed TEXT DEFAULT '0'
)
RETURNS TABLE (
  id UUID,
  photo_url TEXT,
  caption TEXT,
  learning_centre_id UUID,
  state VARCHAR,
  district VARCHAR,
  sent_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fi.id,
    fi.photo_url,
    fi.caption,
    fi.learning_centre_id,
    lc.state,
    lc.district,
    fi.sent_at
  FROM field_images fi
  JOIN learning_centres lc ON fi.learning_centre_id = lc.id
  ORDER BY md5(fi.id::text || seed)
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;
