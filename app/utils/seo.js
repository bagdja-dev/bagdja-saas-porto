export function tenantMeta(data, path = '') {
  if (!data?.portfolio) return [];

  const { portfolio } = data;
  const baseDomain = (import.meta.env.VITE_TENANT_BASE_DOMAIN || 'porto.bagdja.com')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const canonical = `https://${data.slug}.${baseDomain}${path}`;
  let title = `${portfolio.name} — ${portfolio.title || 'Portfolio'} | BagdjaPorto`;
  let description = portfolio.tagline || portfolio.bio || `${portfolio.name} professional portfolio`;
  let image = portfolio.avatar_url || portfolio.cover_image;

  if (data.kind === 'tenant-project') {
    title = `${data.project.title} — ${portfolio.name} | BagdjaPorto`;
    description = data.project.excerpt || data.project.description || description;
    image = data.project.featured_media || image;
  } else if (data.kind === 'tenant-post') {
    title = `${data.post.title} — ${portfolio.name} | BagdjaPorto`;
    description = data.post.excerpt || data.post.content || description;
    image = data.post.cover_image || image;
  } else if (data.kind === 'tenant-blog') {
    title = `${portfolio.name} — Blog | BagdjaPorto`;
  } else if (data.kind === 'tenant-about') {
    title = `About ${portfolio.name} — ${portfolio.title || 'Professional Portfolio'} | BagdjaPorto`;
  } else if (data.kind === 'tenant-contact') {
    title = `Contact ${portfolio.name} | BagdjaPorto`;
  }

  const descriptionText = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const imageCard = Boolean(image);
  const ogType = data.kind === 'tenant-project' || data.kind === 'tenant-post' ? 'article' : 'profile';
  let structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: portfolio.name,
    url: canonical,
    description: descriptionText,
    primaryImageOfPage: image,
    about: {
      '@type': 'Person',
      name: portfolio.name,
      jobTitle: portfolio.title,
      description: portfolio.bio,
      image: portfolio.avatar_url,
    },
  };
  if (data.kind === 'tenant-project') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: data.project.title,
      headline: data.project.title,
      description: descriptionText,
      url: canonical,
      image,
      author: { '@type': 'Person', name: portfolio.name },
      dateCreated: data.project.created_at,
      dateModified: data.project.updated_at,
    };
  } else if (data.kind === 'tenant-post') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.post.title,
      description: descriptionText,
      image,
      url: canonical,
      author: { '@type': 'Person', name: portfolio.name },
      datePublished: data.post.created_at,
      dateModified: data.post.updated_at,
    };
  } else if (data.kind === 'tenant-blog') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${portfolio.name} — Blog`,
      url: canonical,
      author: { '@type': 'Person', name: portfolio.name },
    };
  } else if (data.kind === 'tenant-about') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${portfolio.name}`,
      url: canonical,
      description: descriptionText,
      mainEntity: { '@type': 'Person', name: portfolio.name, jobTitle: portfolio.title },
    };
  } else if (data.kind === 'tenant-contact') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contact ${portfolio.name}`,
      url: canonical,
    };
  }

  return [
    { title },
    { name: 'description', content: descriptionText },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:title', content: title },
    { property: 'og:description', content: descriptionText },
    { property: 'og:url', content: canonical },
    { property: 'og:type', content: ogType },
    { property: 'og:site_name', content: 'BagdjaPorto' },
    ...(image ? [{ property: 'og:image', content: image }] : []),
    { name: 'twitter:card', content: imageCard ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: descriptionText },
    ...(image ? [{ name: 'twitter:image', content: image }] : []),
    { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' },
    ...(portfolio.favicon_url ? [{ tagName: 'link', rel: 'icon', href: portfolio.favicon_url }] : []),
    { 'script:ld+json': structuredData },
  ];
}
