-- Function to get portfolio data using a custom API Key
-- This allows third-party integrations to fetch portfolio data securely
CREATE OR REPLACE FUNCTION public.get_portfolio_by_api_key(p_api_key TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  slug TEXT,
  name TEXT,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  custom_domain TEXT,
  theme_color TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  skills JSONB,
  languages JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with service_role permissions to bypass normal RLS
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Validate the API Key and get the associated user_id
  SELECT ak.user_id INTO v_user_id
  FROM public.api_keys ak
  WHERE ak.key_value = p_api_key
    AND ak.is_active = true;

  -- 2. If no valid key is found, return nothing
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Return the portfolio for that user
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.slug, p.name, p.tagline, p.bio, p.avatar_url, 
    p.email, p.phone, p.location, p.website, p.github_url, 
    p.linkedin_url, p.twitter_url, p.instagram_url, p.custom_domain, 
    p.theme_color, p.is_active, p.created_at, p.updated_at,
    p.skills::jsonb, p.languages::jsonb
  FROM public.portfolios p
  WHERE p.user_id = v_user_id;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_portfolio_by_api_key(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.get_portfolio_by_api_key(TEXT) IS 'Fetch portfolio data using a custom API Key';
