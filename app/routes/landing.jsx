import { useLoaderData } from 'react-router';
import LandingPageRenderer from '../../src/components/LandingPageRenderer';
import { loadActiveLandingPage } from '../utils/tenant-data.server';

export async function loader() {
  return loadActiveLandingPage();
}

export function meta({ data }) {
  const hero = data?.landingPage?.content?.find((component) => component.type === 'hero');
  return [
    { title: hero?.data?.title || 'Landing Page | BagdjaPorto' },
    ...(hero?.data?.subtitle ? [{ name: 'description', content: hero.data.subtitle }] : []),
  ];
}

export default function LandingRoute() {
  const data = useLoaderData();
  return <LandingPageRenderer initialData={data} />;
}
