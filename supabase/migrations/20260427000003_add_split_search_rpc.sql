-- Function to get PROJECTS by API Key with search and pagination
CREATE OR REPLACE FUNCTION public.get_projects_by_api_key(
  p_api_key TEXT, 
  p_search TEXT DEFAULT '',
  p_page INTEGER DEFAULT 1,
  p_size INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_count INTEGER;
  v_result JSONB;
  v_offset INTEGER;
BEGIN
  -- 1. Validate API Key
  SELECT ak.user_id INTO v_user_id
  FROM public.api_keys ak
  WHERE ak.key_value = p_api_key
    AND ak.is_active = true;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid or inactive API Key');
  END IF;

  -- 2. Calculate pagination
  v_offset := (p_page - 1) * p_size;

  -- 3. Get total count for metadata
  SELECT count(*) INTO v_total_count
  FROM public.projects 
  WHERE user_id = v_user_id 
    AND published = true
    AND (
      p_search = '' OR 
      title ILIKE '%' || p_search || '%' OR 
      description ILIKE '%' || p_search || '%'
    );

  -- 4. Fetch Projects with Search and Pagination
  SELECT jsonb_build_object(
    'data', COALESCE(jsonb_agg(to_jsonb(pr)), '[]'::jsonb),
    'meta', jsonb_build_object(
      'total', v_total_count,
      'page', p_page,
      'size', p_size,
      'total_pages', ceil(v_total_count::float / p_size)
    )
  )
  FROM (
    SELECT 
      prj.id, prj.title, prj.slug, prj.description, prj.excerpt, 
      prj.tech_stack, prj.image, prj.demo_url, prj.github_url, 
      prj."order", prj.created_at,
      '/' || port.slug || '/project/' || prj.slug as "project_url"
    FROM public.projects prj
    JOIN public.portfolios port ON port.user_id = prj.user_id
    WHERE prj.user_id = v_user_id 
      AND prj.published = true
      AND (
        p_search = '' OR 
        prj.title ILIKE '%' || p_search || '%' OR 
        prj.description ILIKE '%' || p_search || '%'
      )
    ORDER BY prj."order" ASC
    LIMIT p_size
    OFFSET v_offset
  ) pr INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to get BLOGS by API Key with search and pagination
CREATE OR REPLACE FUNCTION public.get_blogs_by_api_key(
  p_api_key TEXT, 
  p_search TEXT DEFAULT '',
  p_page INTEGER DEFAULT 1,
  p_size INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_total_count INTEGER;
  v_result JSONB;
  v_offset INTEGER;
BEGIN
  -- 1. Validate API Key
  SELECT ak.user_id INTO v_user_id
  FROM public.api_keys ak
  WHERE ak.key_value = p_api_key
    AND ak.is_active = true;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid or inactive API Key');
  END IF;

  -- 2. Calculate pagination
  v_offset := (p_page - 1) * p_size;

  -- 3. Get total count for metadata
  SELECT count(*) INTO v_total_count
  FROM public.blog_posts 
  WHERE user_id = v_user_id 
    AND published = true
    AND (
      p_search = '' OR 
      title ILIKE '%' || p_search || '%' OR 
      excerpt ILIKE '%' || p_search || '%' OR
      content ILIKE '%' || p_search || '%'
    );

  -- 4. Fetch Blogs with Search and Pagination
  SELECT jsonb_build_object(
    'data', COALESCE(jsonb_agg(to_jsonb(b)), '[]'::jsonb),
    'meta', jsonb_build_object(
      'total', v_total_count,
      'page', p_page,
      'size', p_size,
      'total_pages', ceil(v_total_count::float / p_size)
    )
  )
  FROM (
    SELECT 
      blg.id, blg.title, blg.slug, blg.excerpt, blg.content, 
      blg.cover_image, blg.created_at, blg.updated_at,
      '/' || port.slug || '/blog/' || blg.slug as "blog_url"
    FROM public.blog_posts blg
    JOIN public.portfolios port ON port.user_id = blg.user_id
    WHERE blg.user_id = v_user_id 
      AND blg.published = true
      AND (
        p_search = '' OR 
        blg.title ILIKE '%' || p_search || '%' OR 
        blg.excerpt ILIKE '%' || p_search || '%' OR
        blg.content ILIKE '%' || p_search || '%'
      )
    ORDER BY blg.created_at DESC
    LIMIT p_size
    OFFSET v_offset
  ) b INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_projects_by_api_key(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_blogs_by_api_key(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;
