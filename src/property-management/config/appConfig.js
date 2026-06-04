/**
 * White-label application config for the Property Management module.
 *
 * Everything that makes this module "MacroREI-branded" vs "Client X-branded"
 * lives here and is driven by environment variables. To migrate the module
 * into another company's site you change env values — never code.
 *
 * The module itself imports ONLY from within `src/property-management/**`.
 * It must never import host-site code, so it stays lift-and-drop portable.
 */

const env = import.meta.env ?? {};

export const PM_BASE_PATH = env.VITE_PM_BASE_PATH || '/property-management';

export const APP_CONFIG = {
  /** Product / white-label brand shown in the module UI. */
  productName: env.VITE_PM_PRODUCT_NAME || 'Macro REI',
  productTagline:
    env.VITE_PM_PRODUCT_TAGLINE ||
    'The AI operations layer for multifamily property management',
  /**
   * Logo path served from /public. Defaults to the MacroREI logo for the
   * build-and-pitch demo; override per tenant via VITE_PM_LOGO for white-label.
   */
  logo: env.VITE_PM_LOGO || '/Template/Macro REI Macro Real Estate Logo.png',
  /** Company name shown next to the logo (white-label). */
  companyName: env.VITE_PM_COMPANY_NAME || 'MacroREI',
  /** Accent color used across the module (white-label). */
  accent: env.VITE_PM_ACCENT || '#f5a623',
  accentSoft: env.VITE_PM_ACCENT_SOFT || 'rgba(245, 166, 35, 0.14)',

  /** Base route the module is mounted under in the host app. */
  basePath: PM_BASE_PATH,

  /**
   * Default tenant for the local/demo experience. In production each operator
   * is its own tenant; this is just the bootstrap tenant for build-and-pitch.
   */
  defaultTenantId: env.VITE_PM_DEFAULT_TENANT || 'demo',

  /** Support contact surfaced in the UI footer. */
  supportEmail: env.VITE_PM_SUPPORT_EMAIL || 'cody@macrorei.com',
};

export default APP_CONFIG;
