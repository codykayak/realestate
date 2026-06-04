import { useState } from 'react';
import {
  SELLER_STAGES,
  defaultSellerDeal,
  applySellerStageChange,
  sellerPortalUrl,
} from '../utils/sellerPortal';
import styles from './SellerDealPanel.module.css';

export default function SellerDealPanel({ lead, onUpdate, onSyncPortal }) {
  const [copied, setCopied] = useState(false);
  if (!lead) return null;

  const deal = lead.sellerDeal ?? null;
  const enabled = deal?.enabled;

  function ensureDeal() {
    const next = defaultSellerDeal(deal ?? {});
    onUpdate(lead.id, { sellerDeal: next });
    onSyncPortal?.({ ...lead, sellerDeal: next });
    return next;
  }

  function patchDeal(patch) {
    const base = deal ?? defaultSellerDeal();
    const next = { ...base, ...patch, updatedAt: new Date().toISOString() };
    onUpdate(lead.id, { sellerDeal: next });
    onSyncPortal?.({ ...lead, sellerDeal: next });
  }

  function setStage(stageId) {
    const base = deal ?? defaultSellerDeal();
    const next = applySellerStageChange(base, stageId);
    onUpdate(lead.id, { sellerDeal: next });
    onSyncPortal?.({ ...lead, sellerDeal: next });
  }

  function copyLink() {
    const token = deal?.token ?? ensureDeal().token;
    navigator.clipboard?.writeText(sellerPortalUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className={styles.wrap} aria-label="Seller portal">
      <h3 className={styles.heading}>Seller portal</h3>
      <p className={styles.hint}>
        Share a private link so the seller can see offer → under contract → closing progress.
      </p>

      {!enabled ? (
        <button type="button" className={styles.enableBtn} onClick={ensureDeal}>
          Enable seller portal link
        </button>
      ) : (
        <>
          <div className={styles.stages}>
            {SELLER_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.stageBtn} ${deal.stage === s.id ? styles.stageActive : ''}`}
                onClick={() => setStage(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className={styles.label}>
            Offer amount
            <input
              className={styles.input}
              value={deal.offerAmount ?? ''}
              onChange={(e) => patchDeal({ offerAmount: e.target.value })}
              placeholder="$185,000"
            />
          </label>
          <label className={styles.label}>
            Target closing date
            <input
              className={styles.input}
              type="date"
              value={deal.closingDate?.slice(0, 10) ?? ''}
              onChange={(e) => patchDeal({ closingDate: e.target.value })}
            />
          </label>

          <button type="button" className={styles.linkBtn} onClick={copyLink}>
            {copied ? 'Link copied!' : 'Copy seller portal link'}
          </button>
        </>
      )}
    </section>
  );
}
