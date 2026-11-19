import { useEffect, useState } from 'react';

export function meta() {
  return [
    { title: 'Admin | BagdjaPorto' },
    { name: 'robots', content: 'noindex,nofollow' },
  ];
}

export default function AdminRoute() {
  const [AdminApp, setAdminApp] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    import('../../src/AdminApp')
      .then((module) => setAdminApp(() => module.default))
      .catch((error) => {
        console.error('Failed to load the admin application:', error);
        setLoadError(error);
      });
  }, []);

  if (loadError) {
    return <main className="p-8">The admin application could not be loaded.</main>;
  }
  if (!AdminApp) {
    return <main className="p-8" aria-live="polite">Loading admin application…</main>;
  }
  return <AdminApp />;
}
