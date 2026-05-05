import styles from './GeocodingProgress.module.css';

export default function GeocodingProgress({ done, total, successes, onSkip }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const eta = done > 0 ? Math.round(((total - done) * 1.1)) : null;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#58a6ff" strokeWidth="1.5"/>
            <path d="M12 6v6l4 2" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className={styles.title}>Geocoding addresses…</h2>
        <p className={styles.sub}>
          {done} of {total} processed
          {successes != null && done > 0 && (
            <span className={styles.successCount}> — {successes} mapped ✓</span>
          )}
        </p>

        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.pct}>{pct}%{eta != null ? ` — ~${eta}s remaining` : ''}</p>

        <p className={styles.note}>
          Using OpenStreetMap Nominatim (1 req/sec).<br/>
          Open DevTools → Console to see per-address results.
        </p>
        <button className={styles.skipBtn} onClick={onSkip}>
          Skip remaining — show what we have
        </button>
      </div>
    </div>
  );
}
