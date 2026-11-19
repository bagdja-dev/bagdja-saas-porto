import { useLoaderData, useLocation } from 'react-router';
import PublicPortfolio from '../../src/pages/PublicPortfolio';
import { getTenantSlugFromRequest, loadTenantProjects } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return loadTenantProjects(slug);
}

export function meta({ data }) {
  return tenantMeta(data, '/projects');
}

export default function TenantProjectsRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return <PublicPortfolio key={location.pathname} initialData={data} />;
}
