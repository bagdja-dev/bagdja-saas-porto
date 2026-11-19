import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.jsx'),
  route('admin/*', 'routes/admin.jsx'),
  route('landing', 'routes/landing.jsx'),
  route('projects', 'routes/tenant-projects.jsx'),
  route('project/:projectSlug', 'routes/tenant-project-detail.jsx'),
  route('blog', 'routes/tenant-blog.jsx'),
  route('blog/:postSlug', 'routes/tenant-blog-detail.jsx'),
  route('about', 'routes/tenant-about.jsx'),
  route('contact', 'routes/tenant-contact.jsx'),
  route(':slug', 'routes/portfolio.jsx'),
  route(':slug/projects', 'routes/tenant-projects.jsx', { id: 'tenant-projects-by-slug' }),
  route(':slug/project/:projectSlug', 'routes/tenant-project-detail.jsx', { id: 'tenant-project-detail-by-slug' }),
  route(':slug/blog', 'routes/tenant-blog.jsx', { id: 'tenant-blog-by-slug' }),
  route(':slug/blog/:postSlug', 'routes/tenant-blog-detail.jsx', { id: 'tenant-blog-detail-by-slug' }),
  route(':slug/about', 'routes/tenant-about.jsx', { id: 'tenant-about-by-slug' }),
  route(':slug/contact', 'routes/tenant-contact.jsx', { id: 'tenant-contact-by-slug' }),
  route('*', 'routes/not-found.jsx'),
];
