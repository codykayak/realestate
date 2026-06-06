import { useEffect } from 'react';

const SITE_URL = 'https://www.macrorei.com';

/**
 * Per-route SEO for the property-management gateway (ManyDoors AI).
 * Updates document title, meta tags, canonical, and optional JSON-LD.
 */
export default function PmSeoHead({
  title,
  description,
  path = '/property-management',
  keywords = '',
  ogImage = '/pm-pitch/manydoors-ai-software-property-management.png',
  jsonLd = null,
  robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
}) {
  const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  useEffect(() => {
    document.title = title;
    const setMeta = (name, content, prop = false) => {
      if (content == null || content === '') return;
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (prop) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('robots', robots);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonical, true);
    setMeta('og:image', imageUrl, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', 'ManyDoors AI', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;

    const old = document.getElementById('pm-page-jsonld');
    if (old) old.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'pm-page-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonical, imageUrl, jsonLd, robots]);

  return null;
}
