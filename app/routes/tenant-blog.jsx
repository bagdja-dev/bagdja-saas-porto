import { useLoaderData, useLocation } from 'react-router';
import TenantBlog from '../../src/pages/TenantBlog';
import { getTenantSlugFromRequest, loadTenantBlog } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return loadTenantBlog(slug);
}

export function meta({ data }) {
  return tenantMeta(data, '/blog');
}

export default function TenantBlogRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return <TenantBlog key={location.pathname} initialData={data} />;
}
