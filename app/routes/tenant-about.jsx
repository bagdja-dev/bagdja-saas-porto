import { useLoaderData, useLocation } from 'react-router';
import About from '../../src/pages/About';
import TenantAbout from '../../src/pages/TenantAbout';
import Layout from '../../src/components/Layout';
import { getTenantSlugFromRequest, loadTenantProfile } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params, request }) {
  const slug = params.slug || getTenantSlugFromRequest(request);
  return slug ? loadTenantProfile(slug, 'about') : { kind: 'static' };
}

export function meta({ data }) {
  return data?.kind === 'static' ? [{ title: 'About BagdjaPorto' }] : tenantMeta(data, '/about');
}

export default function TenantAboutRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return data.kind === 'static'
    ? <Layout><About /></Layout>
    : <TenantAbout key={location.pathname} initialData={data} />;
}
