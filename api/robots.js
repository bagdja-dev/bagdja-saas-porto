/* global process */
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const baseDomain = (process.env.VITE_TENANT_BASE_DOMAIN || 'porto.bagdja.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const robots = `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/

Sitemap: https://${baseDomain}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(robots);
}
