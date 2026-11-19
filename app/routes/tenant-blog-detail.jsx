import { useLoaderData, useLocation } from 'react-router';
import TenantBlogDetail from '../../src/pages/TenantBlogDetail';
import { getTenantSlugFromRequest, loadBlogDetail } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return loadBlogDetail(slug, params.postSlug);
}

export function meta({ data }) {
  return tenantMeta(data, `/blog/${data.post.slug}`);
}

export default function TenantBlogDetailRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return <TenantBlogDetail key={location.pathname} initialData={data} />;
}
