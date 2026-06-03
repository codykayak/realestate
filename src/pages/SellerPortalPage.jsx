import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import SeoHead from '../components/SeoHead';
import { SELLER_STAGES, sellerStageLabel } from '../utils/sellerPortal';
import { BRAND_NAME, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from '../constants/brand';
import styles from './SellerPortalPage.module.css';

export default function SellerPortalPage() {
  const { token } = useParams();
  const [deal, setDeal] = useState(undefined);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!token || !isFirebaseConfigured) {
      setDeal(null);
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'sellerPortals', token),
      (snap) => {
        if (snap.exists()) setDeal({ id: snap.id, ...snap.data() });
        else setDeal(null);
      },
      () => setErr('Could not load your deal status.'),
    );
    return unsub;
  }, [token]);

  const loading = deal === undefined;
  const stageIndex = SELLER_STAGES.findIndex((s) => s.id === deal?.stage);

  return (
    <>
      <SeoHead
        title="Your home sale status | MacroREI"
        description="Private seller portal to track your cash offer, contract, and closing timeline with Macro Real Estate Investing in Oregon."
        path={`/seller/${token}`}
        robots="noindex, nofollow"
      />
      <div className={styles.page}>
        <header className={styles.header}>
          <Link to="/" className={styles.brand}>{BRAND_NAME}</Link>
          <a href={`tel:${PHONE_TEL}`} className={styles.phone}>{PHONE_DISPLAY}</a>
        </header>

        <main className={styles.main}>
          {loading && <p className={styles.muted}>Loading your deal status…</p>}
          {!loading && (err || !deal) && (
            <div className={styles.card}>
              <h1>Link not found</h1>
              <p>This portal link may have expired or was entered incorrectly. Contact your acquisitions rep for an updated link.</p>
              <a href={`tel:${PHONE_TEL}`} className={styles.cta}>Call {PHONE_DISPLAY}</a>
            </div>
          )}

          {!loading && deal && (
            <>
              <h1 className={styles.title}>Your sale progress</h1>
              <p className={styles.property}>{deal.propertyLabel}</p>
              {deal.city && <p className={styles.city}>{deal.city}, Oregon</p>}

              <ol className={styles.timeline}>
                {SELLER_STAGES.map((s, i) => {
                  const done = stageIndex > i;
                  const current = deal.stage === s.id;
                  return (
                    <li
                      key={s.id}
                      className={`${styles.step} ${done ? styles.stepDone : ''} ${current ? styles.stepCurrent : ''}`}
                    >
                      <span className={styles.stepDot}>{done ? '✓' : i + 1}</span>
                      <div>
                        <strong>{s.label}</strong>
                        {current && <p>{s.description}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className={styles.details}>
                {deal.offerAmount && (
                  <p><span className={styles.label}>Offer</span> {deal.offerAmount}</p>
                )}
                {deal.closingDate && (
                  <p><span className={styles.label}>Target closing</span> {formatDate(deal.closingDate)}</p>
                )}
                <p className={styles.statusLine}>
                  Current stage: <strong>{sellerStageLabel(deal.stage)}</strong>
                </p>
              </div>

              <p className={styles.help}>
                Questions? Call <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a> or visit{' '}
                <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>.
              </p>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
