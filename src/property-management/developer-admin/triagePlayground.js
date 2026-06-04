/**
 * Triage playground — runs maintenanceTriage with optional dev rule overrides
 * stored in localStorage (developer-admin only; does not affect production pages
 * until wired into feature config).
 */

import { triageRequest } from '../lib/maintenanceTriage';

const OVERRIDE_KEY = 'pm:dev:maintenanceOverrides';

export function loadMaintenanceOverrides() {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMaintenanceOverrides(obj) {
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(obj));
}

export function clearMaintenanceOverrides() {
  localStorage.removeItem(OVERRIDE_KEY);
}

/** Apply dev overrides on top of triage (emergency keywords extension). */
export function triageWithOverrides(text, featureConfig = {}) {
  const overrides = loadMaintenanceOverrides();
  const base = triageRequest(text, featureConfig);

  if (!overrides?.extraEmergencyKeywords?.length) {
    return { ...base, devNote: null };
  }

  const extra = overrides.extraEmergencyKeywords.join('|');
  const extraRe = new RegExp(`\\b(${extra})\\b`, 'i');
  if (extraRe.test(text) && !base.isEmergency) {
    return {
      ...base,
      isEmergency: true,
      priority: 'emergency',
      recommendedStatus: overrides.forceDispatchedOnExtra ? 'dispatched' : 'dispatched',
      routing: overrides.dispatchMessage || 'Dev override: escalated via custom emergency keywords.',
      devNote: 'Matched developer override emergency keywords.',
    };
  }

  return { ...base, devNote: null };
}

export const DEFAULT_OVERRIDE_TEMPLATE = {
  extraEmergencyKeywords: ['elevator stuck', 'elevator'],
  forceDispatchedOnExtra: true,
  dispatchMessage: 'Custom rule: elevator issues → on-call + building engineer.',
};
