import { useLoaderData, useLocation } from 'react-router';
import Contact from '../../src/pages/Contact';
import TenantContact from '../../src/pages/TenantContact';
import Layout from '../../src/components/Layout';
import { getTenantSlugFromRequest, loadTenantProfile } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return slug ? loadTenantProfile(slug, 'contact') : { kind: 'static' };
}

export function meta({ data }) {
  return data?.kind === 'static' ? [{ title: 'Contact BagdjaPorto' }] : tenantMeta(data, '/contact');
}

export default function TenantContactRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return data.kind === 'static'
    ? <Layout><Contact /></Layout>
    : <TenantContact key={location.pathname} initialData={data} />;
}
