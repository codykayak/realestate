/**
 * White-label application config for the Property Management module.
 * Defaults to ManyDoors AI branding. Override per deployment via VITE_PM_* env vars.
 */

const env = import.meta.env ?? {};

export const PM_BASE_PATH = env.VITE_PM_BASE_PATH || '/property-management';

export const APP_CONFIG = {
  productName: env.VITE_PM_PRODUCT_NAME || 'ManyDoors AI',
  productTagline:
    env.VITE_PM_PRODUCT_TAGLINE ||
    'AI-powered property operations — maintenance triage, leasing, and resident communications',
  logo: env.VITE_PM_LOGO || '',
  heroImage: env.VITE_PM_HERO_IMAGE || '/Template/manydoors-ai-hero.png',
  companyName: env.VITE_PM_COMPANY_NAME || 'ManyDoors AI',
  futureSite: env.VITE_PM_FUTURE_SITE || 'manydoorsai.com',
  accent: env.VITE_PM_ACCENT || '#1a9e96',
  accentSoft: env.VITE_PM_ACCENT_SOFT || 'rgba(26, 158, 150, 0.14)',
  basePath: PM_BASE_PATH,
  defaultTenantId: env.VITE_PM_DEFAULT_TENANT || 'demo',
  supportEmail: env.VITE_PM_SUPPORT_EMAIL || 'hello@manydoorsai.com',
};

export default APP_CONFIG;
