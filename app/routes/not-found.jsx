import { Link } from 'react-router';
import Layout from '../../src/components/Layout';

export function meta() {
  return [{ title: 'Page Not Found | BagdjaPorto' }];
}

export default function NotFoundRoute() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </Layout>
  );
}
