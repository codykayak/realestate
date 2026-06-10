/**
 * Local SEO — NAP (name, address, phone) and schema helpers.
 * HQ is Eugene, OR; service areas are data-driven for programmatic /locations pages.
 */

/** Primary markets — add slugs here and a matching entry in locationsData.js to scale. */
export const SERVICE_MARKET_SLUGS = [
  'portland-or',
  'eugene-or',
  'salem-or',
  'corvallis-or',
  'bend-or',
];

export const LOCAL_BUSINESS = {
  addressLocality: 'Eugene',
  addressRegion: 'OR',
  addressCountry: 'US',
  /** Display string — matches Google Business Profile & citations exactly. */
  addressDisplay: 'Eugene, OR',
  geo: {
    latitude: 44.0521,
    longitude: -123.0868,
  },
  /** Rough service radius in miles from Eugene HQ (digital + on-site sales). */
  serviceRadiusMiles: 120,
};

/** Canonical site origin for PM gateway SEO (override when manydoorsai.com is live). */
export function getPmCanonicalBase(config) {
  const explicit = import.meta.env?.VITE_PM_SITE_URL;
  if (explicit) return String(explicit).replace(/\/$/, '');
  return 'https://www.macrorei.com';
}

export function getPmSiteUrl(config, path = '') {
  const base = getPmCanonicalBase(config);
  if (!path) return base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function areaServedCities(cityNames) {
  return cityNames.map((name) => ({
    '@type': 'City',
    name,
    containedInPlace: { '@type': 'State', name: 'Oregon', addressCountry: 'US' },
  }));
}

/** Organization + LocalBusiness provider block for gateway and location pages. */
export function localBusinessJsonLd(config, basePath = '/property-management') {
  const url = getPmSiteUrl(config, basePath);
  const phone = config.supportPhone || '541-321-2630';
  const email = config.supportEmail || 'hello@manydoorsai.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#localbusiness`,
    name: config.companyName || config.productName,
    description: config.productTagline,
    url,
    email,
    telephone: phone,
    image: getPmSiteUrl(config, config.logoWordmark || config.logo || '/manydoors-logo.svg'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: LOCAL_BUSINESS.addressLocality,
      addressRegion: LOCAL_BUSINESS.addressRegion,
      addressCountry: LOCAL_BUSINESS.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: LOCAL_BUSINESS.geo.latitude,
      longitude: LOCAL_BUSINESS.geo.longitude,
    },
    areaServed: areaServedCities(['Portland', 'Eugene', 'Salem', 'Corvallis', 'Bend']),
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: LOCAL_BUSINESS.geo.latitude,
        longitude: LOCAL_BUSINESS.geo.longitude,
      },
      geoRadius: `${LOCAL_BUSINESS.serviceRadiusMiles * 1609.34}`,
    },
    priceRange: '$$',
    knowsAbout: [
      'Multifamily property management software',
      'AI resident communication',
      'Automated leasing',
      'Maintenance triage',
      'NOI reporting',
    ],
  };
}

/** Per-city landing page — WebPage + Service scoped to one metro. */
export function locationPageJsonLd(config, location, basePath) {
  const path = `${basePath}/locations/${location.slug}`;
  const pageUrl = getPmSiteUrl(config, path);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: location.pageTitle,
      description: location.metaDescription,
      url: pageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: config.productName,
        url: getPmSiteUrl(config, basePath),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${config.productName} — ${location.name} multifamily operators`,
      description: location.metaDescription,
      url: pageUrl,
      provider: {
        '@id': `${getPmSiteUrl(config, basePath)}#localbusiness`,
      },
      areaServed: {
        '@type': 'City',
        name: location.name,
        containedInPlace: { '@type': 'State', name: 'Oregon', addressCountry: 'US' },
      },
      serviceType: 'Property management software',
    },
    localBusinessJsonLd(config, basePath),
  ];
}
