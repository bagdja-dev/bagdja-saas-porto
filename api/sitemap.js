/* global process */
import { createClient } from '@supabase/supabase-js';

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).send('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const baseDomain = (process.env.VITE_TENANT_BASE_DOMAIN || 'porto.bagdja.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

  const [portfoliosResult, projectsResult, postsResult] = await Promise.all([
    supabase.from('portfolios').select('slug,user_id,updated_at').eq('is_active', true),
    supabase.from('projects').select('slug,updated_at,created_at,user_id').eq('published', true),
    supabase.from('blog_posts').select('slug,updated_at,created_at,user_id').eq('published', true),
  ]);

  const queryError = portfoliosResult.error || projectsResult.error || postsResult.error;
  if (queryError) {
    console.error('Sitemap query failed:', queryError);
    return res.status(500).send('Unable to generate sitemap');
  }

  const portfolios = portfoliosResult.data || [];
  const ownerToSlug = new Map(portfolios.map((portfolio) => [portfolio.user_id, portfolio.slug]));
  const urls = [];

  const addUrl = (url, updatedAt, priority = '0.7', changefreq = 'weekly') => {
    urls.push({ url, updatedAt, priority, changefreq });
  };

  for (const portfolio of portfolios) {
    const origin = `https://${portfolio.slug}.${baseDomain}`;
    addUrl(origin + '/', portfolio.updated_at, '0.9', 'weekly');
    addUrl(origin + '/projects', portfolio.updated_at, '0.8', 'weekly');
    addUrl(origin + '/blog', portfolio.updated_at, '0.8', 'weekly');
    addUrl(origin + '/about', portfolio.updated_at, '0.7', 'monthly');
    addUrl(origin + '/contact', portfolio.updated_at, '0.6', 'monthly');
  }

  for (const project of projectsResult.data || []) {
    const slug = ownerToSlug.get(project.user_id);
    if (slug && project.slug) {
      addUrl(`https://${slug}.${baseDomain}/project/${project.slug}`, project.updated_at || project.created_at, '0.8', 'monthly');
    }
  }

  for (const post of postsResult.data || []) {
    const slug = ownerToSlug.get(post.user_id);
    if (slug && post.slug) {
      addUrl(`https://${slug}.${baseDomain}/blog/${post.slug}`, post.updated_at || post.created_at, '0.8', 'monthly');
    }
  }

  const uniqueUrls = [...new Map(urls.map((item) => [item.url, item])).values()];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((item) => `  <url>
    <loc>${escapeXml(item.url)}</loc>
    ${item.updatedAt ? `<lastmod>${escapeXml(new Date(item.updatedAt).toISOString())}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
