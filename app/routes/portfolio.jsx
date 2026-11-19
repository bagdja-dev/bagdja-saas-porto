import { useLoaderData, useLocation } from 'react-router';
import PublicPortfolio from '../../src/pages/PublicPortfolio';
import { loadPortfolioPage } from '../utils/tenant-data.server';
import { tenantMeta } from '../utils/seo';

export async function loader({ params }) {
  return loadPortfolioPage(params.slug);
}

export function meta({ data }) {
  return tenantMeta(data);
}

export default function PortfolioRoute() {
  const data = useLoaderData();
  const location = useLocation();
  return <PublicPortfolio key={location.pathname} initialData={data} />;
}
