import { useLoaderData, useLocation } from 'react-router';
import Home from '../../src/pages/Home';
import PublicPortfolio from '../../src/pages/PublicPortfolio';
import Layout from '../../src/components/Layout';
import { getTenantSlugFromRequest, loadPortfolioPage } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ request }) {
  const slug = getTenantSlugFromRequest(request);
  return slug ? loadPortfolioPage(slug) : { kind: 'home' };
}

export function meta({ data }) {
  return data?.kind === 'tenant'
    ? tenantMeta(data)
    : [
      { title: 'BagdjaPorto — Professional Portfolios' },
      { name: 'description', content: 'Create a modern professional portfolio and share your work with the world.' },
    ];
}

export default function HomeRoute() {
  const data = useLoaderData();
  const location = useLocation();

  if (data.kind === 'tenant') {
    return <PublicPortfolio key={location.pathname} initialData={data} />;
  }
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
