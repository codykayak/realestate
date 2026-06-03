import { SITE_URL } from '../constants/brand';

export const SELLER_STAGES = [
  { id: 'offer', label: 'Offer', description: 'We have presented a cash offer on your property.' },
  { id: 'under_contract', label: 'Under contract', description: 'Purchase agreement is signed and title is opening.' },
  { id: 'closing', label: 'Closing', description: 'Final walkthrough and signing — funds heading to you soon.' },
  { id: 'closed', label: 'Closed', description: 'Sale complete. Thank you for working with MacroREI.' },
];

export function sellerStageLabel(stageId) {
  return SELLER_STAGES.find((s) => s.id === stageId)?.label ?? 'Offer';
}

export function sellerStageDescription(stageId) {
  return SELLER_STAGES.find((s) => s.id === stageId)?.description ?? '';
}

export function createSellerToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function sellerPortalUrl(token) {
  return `${SITE_URL}/seller/${token}`;
}

export function defaultSellerDeal(overrides = {}) {
  const token = overrides.token ?? createSellerToken();
  const stage = overrides.stage ?? 'offer';
  return {
    token,
    enabled: overrides.enabled ?? true,
    stage,
    offerAmount: overrides.offerAmount ?? '',
    closingDate: overrides.closingDate ?? '',
    timeline: overrides.timeline ?? [{ stage, at: new Date().toISOString(), note: 'Portal created' }],
    updatedAt: new Date().toISOString(),
  };
}

export function applySellerStageChange(deal, nextStage, note = '') {
  const prev = deal?.stage ?? 'offer';
  if (prev === nextStage) return deal;
  const timeline = [...(deal?.timeline ?? []), {
    stage: nextStage,
    at: new Date().toISOString(),
    note: note || `Moved to ${sellerStageLabel(nextStage)}`,
  }];
  return {
    ...deal,
    stage: nextStage,
    timeline,
    updatedAt: new Date().toISOString(),
  };
}

export function buildSellerPortalDoc({ token, lead, ownerUid, orgId }) {
  const deal = lead.sellerDeal ?? {};
  return {
    token,
    ownerUid,
    orgId: orgId ?? null,
    leadId: lead.id,
    propertyLabel: lead.address || lead._addressForGeocode || lead.city || 'Your property',
    city: lead.city ?? '',
    stage: deal.stage ?? 'offer',
    offerAmount: deal.offerAmount ?? '',
    closingDate: deal.closingDate ?? '',
    timeline: deal.timeline ?? [],
    updatedAt: deal.updatedAt ?? new Date().toISOString(),
  };
}
