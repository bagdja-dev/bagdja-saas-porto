const ensureMetaTag = (selector, attribute) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const [attributeName, attributeValue] = attribute;
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  return element;
};

export const stripHtml = (value = '') =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

export const truncateSeoText = (value = '', maxLength = 160) => {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export const setSeoMeta = ({
  title,
  description,
  url,
  image,
  type = 'website',
  siteName = 'BagdjaPorto',
  noIndex = false,
  jsonLd,
}) => {
  if (typeof document === 'undefined') return;

  document.title = title;

  const setNameMeta = (name, content) => {
    if (!content) return;
    const meta = ensureMetaTag(`meta[name="${name}"]`, ['name', name]);
    meta.setAttribute('content', content);
  };

  const setPropertyMeta = (property, content) => {
    if (!content) return;
    const meta = ensureMetaTag(`meta[property="${property}"]`, ['property', property]);
    meta.setAttribute('content', content);
  };

  setNameMeta('description', truncateSeoText(description));
  setNameMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setPropertyMeta('og:title', title);
  setPropertyMeta('og:description', truncateSeoText(description));
  setPropertyMeta('og:type', type);
  setPropertyMeta('og:site_name', siteName);
  setPropertyMeta('og:url', url);
  setPropertyMeta('og:image', image);
  setNameMeta('twitter:card', image ? 'summary_large_image' : 'summary');
  setNameMeta('twitter:title', title);
  setNameMeta('twitter:description', truncateSeoText(description));
  setNameMeta('twitter:image', image);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  if (url) canonical.setAttribute('href', url);

  let jsonLdElement = document.head.querySelector('script[data-bagdja-seo]');
  if (!jsonLdElement) {
    jsonLdElement = document.createElement('script');
    jsonLdElement.setAttribute('type', 'application/ld+json');
    jsonLdElement.setAttribute('data-bagdja-seo', 'true');
    document.head.appendChild(jsonLdElement);
  }
  jsonLdElement.textContent = jsonLd ? JSON.stringify(jsonLd) : '';
};

export const resetSeoMeta = () => {
  if (typeof document === 'undefined') return;
  setSeoMeta({
    title: 'BagdjaPorto',
    description: 'Create a modern professional portfolio with BagdjaPorto.',
    url: window.location.origin,
  });
};

export const getCanonicalUrl = (tenantSlug, path = '') => {
  const baseDomain = (import.meta.env.VITE_TENANT_BASE_DOMAIN || 'porto.bagdja.com')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const cleanPath = path ? `/${String(path).replace(/^\/+/, '')}` : '';
  return `https://${tenantSlug}.${baseDomain}${cleanPath}`;
};
