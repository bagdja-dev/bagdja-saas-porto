-- Function to get COMPLETE portfolio data (Portfolio + Projects + Blogs) using an API Key
CREATE OR REPLACE FUNCTION public.get_complete_data_by_api_key(p_api_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- 1. Validate API Key
  SELECT ak.user_id INTO v_user_id
  FROM public.api_keys ak
  WHERE ak.key_value = p_api_key
    AND ak.is_active = true;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid or inactive API Key');
  END IF;

  -- 2. Build the complete response
  SELECT jsonb_build_object(
    'portfolio', (
      SELECT to_jsonb(p) 
      FROM public.portfolios p 
      WHERE p.user_id = v_user_id
    ),
    'projects', (
      SELECT jsonb_agg(to_jsonb(pr))
      FROM (
        SELECT * FROM public.projects 
        WHERE user_id = v_user_id AND published = true
        ORDER BY "order" ASC
      ) pr
    ),
    'blogs', (
      SELECT jsonb_agg(to_jsonb(b))
      FROM (
        SELECT * FROM public.blog_posts 
        WHERE user_id = v_user_id AND published = true
        ORDER BY created_at DESC
      ) b
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_complete_data_by_api_key(TEXT) TO anon, authenticated;
