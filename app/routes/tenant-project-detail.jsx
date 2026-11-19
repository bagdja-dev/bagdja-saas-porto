import { useLoaderData, useLocation } from 'react-router';
import TenantProjectDetail from '../../src/pages/TenantProjectDetail';
import { getTenantSlugFromRequest, loadProjectDetail } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return loadProjectDetail(slug, params.projectSlug);
}

export function meta({ data }) {
  return tenantMeta(data, `/project/${data.project.slug}`);
}

export default function TenantProjectDetailRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return <TenantProjectDetail key={location.pathname} initialData={data} />;
}
