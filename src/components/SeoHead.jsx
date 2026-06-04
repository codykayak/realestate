import { useEffect } from 'react';
import { IMG, SITE_URL } from '../constants/images';

export default function SeoHead({
  title,
  description,
  path = '/',
  keywords = '',
  jsonLd = null,
  robots = 'index, follow, max-snippet:-1, max-image-preview:large',
  ogType = 'website',
}) {
  const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = `${SITE_URL}${IMG.hero}`;

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
    setMeta('og:image', ogImage, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', 'MacroREI — Macro Real Estate Investing', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
    const old = document.getElementById('page-jsonld');
    if (old) old.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonical, ogImage, jsonLd, robots, ogType]);

  return null;
}
