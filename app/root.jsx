import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import stylesheet from '../src/index.css?url';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { AlertProvider } from '../src/context/AlertContext';
import { TenantProvider } from '../src/context/TenantContext';

export const links = () => [{ rel: 'stylesheet', href: stylesheet }];

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const title = status === 404 ? 'Page Not Found | BagdjaPorto' : 'Something Went Wrong | BagdjaPorto';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold">{status}</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {status === 404 ? 'The page you are looking for does not exist.' : 'Please try again later.'}
          </p>
          <a href="/" className="btn-primary">Go Home</a>
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <TenantProvider>
            <Outlet />
          </TenantProvider>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
