import { createClient } from '@supabase/supabase-js';

let supabase;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Public Supabase configuration is missing for server rendering.');
  }

  supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

function notFound() {
  throw new Response('Not Found', { status: 404 });
}

function throwIfError(error) {
  if (!error) return;
  if (error.code === 'PGRST116') notFound();
  throw new Response('Unable to load public tenant content.', { status: 500 });
}

export function getTenantSlugFromRequest(request) {
  const hostname = new URL(request.url).hostname.toLowerCase().replace(/\.$/, '');
  if (
    hostname === 'localhost' ||
    hostname.includes('.vercel.app') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return null;
  }

  const baseDomain = (
    process.env.VITE_TENANT_BASE_DOMAIN ||
    import.meta.env.VITE_TENANT_BASE_DOMAIN ||
    'porto.bagdja.com'
  )
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  if (hostname === baseDomain || !hostname.endsWith(`.${baseDomain}`)) return null;

  const slug = hostname.slice(0, -(baseDomain.length + 1));
  if (!slug || slug.includes('.') || ['admin', 'api', 'cdn', 'assets', 'porto', 'www'].includes(slug)) {
    return null;
  }
  return slug;
}

async function getPortfolio(slug) {
  if (!slug) notFound();

  const { data, error } = await getSupabase()
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  throwIfError(error);
  return data;
}

async function getLandingPage(portfolio) {
  const { data, error } = await getSupabase()
    .from('landing_pages')
    .select('*')
    .eq('user_id', portfolio.user_id)
    .eq('is_active', true)
    .single();
  if (error?.code === 'PGRST116') return null;
  throwIfError(error);
  return data;
}

async function getLandingPageContent(portfolio) {
  const landingPage = await getLandingPage(portfolio);
  const components = landingPage?.content || [];
  const projectIds = [...new Set(
    components
      .filter((component) => component.type === 'portfolio')
      .flatMap((component) => component.data?.selectedProjectIds || []),
  )];
  const postIds = [...new Set(
    components
      .filter((component) => component.type === 'blog')
      .flatMap((component) => component.data?.selectedPostIds || []),
  )];
  const client = getSupabase();

  const [projectResult, postResult] = await Promise.all([
    projectIds.length
      ? client.from('projects').select('*').in('id', projectIds).eq('user_id', portfolio.user_id).eq('published', true)
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? client.from('blog_posts').select('*').in('id', postIds).eq('user_id', portfolio.user_id).eq('published', true)
      : Promise.resolve({ data: [], error: null }),
  ]);
  throwIfError(projectResult.error);
  throwIfError(postResult.error);

  return {
    landingPage,
    landingProjects: Object.fromEntries((projectResult.data || []).map((project) => [project.id, project])),
    landingPosts: Object.fromEntries((postResult.data || []).map((post) => [post.id, post])),
  };
}

export async function loadActiveLandingPage() {
  const { data: landingPage, error } = await getSupabase()
    .from('landing_pages')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();
  if (error?.code === 'PGRST116') {
    return { landingPage: null, projects: {}, posts: {} };
  }
  throwIfError(error);

  const projectIds = [...new Set((landingPage.content || [])
    .filter((component) => component.type === 'portfolio')
    .flatMap((component) => component.data?.selectedProjectIds || []))];
  const postIds = [...new Set((landingPage.content || [])
    .filter((component) => component.type === 'blog')
    .flatMap((component) => component.data?.selectedPostIds || []))];
  const [projectResult, postResult] = await Promise.all([
    projectIds.length
      ? getSupabase()
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .eq('user_id', landingPage.user_id)
        .eq('published', true)
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? getSupabase()
        .from('blog_posts')
        .select('*')
        .in('id', postIds)
        .eq('user_id', landingPage.user_id)
        .eq('published', true)
      : Promise.resolve({ data: [], error: null }),
  ]);
  throwIfError(projectResult.error);
  throwIfError(postResult.error);

  return {
    landingPage,
    projects: Object.fromEntries((projectResult.data || []).map((project) => [project.id, project])),
    posts: Object.fromEntries((postResult.data || []).map((post) => [post.id, post])),
  };
}

async function getPublishedRows(table, portfolio) {
  const { data, error } = await getSupabase()
    .from(table)
    .select('*')
    .eq('user_id', portfolio.user_id)
    .eq('published', true)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data || [];
}

export async function loadPortfolioPage(slug) {
  const portfolio = await getPortfolio(slug);
  const [projectRows, landingData] = await Promise.all([
    getSupabase()
      .from('projects')
      .select('*')
      .eq('user_id', portfolio.user_id)
      .eq('published', true)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false }),
    getLandingPageContent(portfolio),
  ]);
  throwIfError(projectRows.error);

  return {
    kind: 'tenant',
    slug,
    portfolio,
    projects: projectRows.data || [],
    ...landingData,
    hasLandingPage: Boolean(landingData.landingPage),
  };
}

export async function loadTenantProjects(slug) {
  const data = await loadPortfolioPage(slug);
  return data;
}

export async function loadTenantBlog(slug) {
  const portfolio = await getPortfolio(slug);
  const [posts, landingPage] = await Promise.all([
    getPublishedRows('blog_posts', portfolio),
    getLandingPage(portfolio),
  ]);
  return {
    kind: 'tenant-blog',
    slug,
    portfolio,
    posts,
    landingPage,
    hasLandingPage: Boolean(landingPage),
  };
}

export async function loadProjectDetail(slug, projectSlug) {
  const portfolio = await getPortfolio(slug);
  const { data: project, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('user_id', portfolio.user_id)
    .eq('slug', projectSlug)
    .eq('published', true)
    .single();
  throwIfError(error);
  const landingPage = await getLandingPage(portfolio);
  return {
    kind: 'tenant-project',
    slug,
    portfolio,
    project,
    landingPage,
    hasLandingPage: Boolean(landingPage),
  };
}

export async function loadBlogDetail(slug, postSlug) {
  const portfolio = await getPortfolio(slug);
  const { data: post, error } = await getSupabase()
    .from('blog_posts')
    .select('*')
    .eq('user_id', portfolio.user_id)
    .eq('slug', postSlug)
    .eq('published', true)
    .single();
  throwIfError(error);
  const landingPage = await getLandingPage(portfolio);
  return {
    kind: 'tenant-post',
    slug,
    portfolio,
    post,
    landingPage,
    hasLandingPage: Boolean(landingPage),
  };
}

export async function loadTenantProfile(slug, path) {
  const portfolio = await getPortfolio(slug);
  const landingPage = await getLandingPage(portfolio);
  return {
    kind: path === 'about' ? 'tenant-about' : 'tenant-contact',
    slug,
    portfolio,
    landingPage,
    hasLandingPage: Boolean(landingPage),
  };
}
