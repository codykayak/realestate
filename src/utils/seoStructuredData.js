import { BRAND_NAME, CONTACT_EMAIL, PHONE_TEL, SITE_URL } from '../constants/brand';

export function organizationJsonLd() {
  return {
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: ['MacroREI', 'Macro REI'],
    url: SITE_URL,
    telephone: PHONE_TEL,
    email: CONTACT_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Eugene',
      addressRegion: 'OR',
      addressCountry: 'US',
    },
    areaServed: { '@type': 'State', name: 'Oregon' },
  };
}
