import styles from './TopBar.module.css';

export default function TopBar({ leadCount, geocodedCount, onReset }) {
  return (
    <div className={styles.bar}>
      <div className={styles.brand}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="#58a6ff" strokeWidth="2"/>
        </svg>
        <span className={styles.title}>Motivated Seller Map</span>
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}>
          <span className={styles.statNum}>{geocodedCount}</span>
          <span className={styles.statLabel}>/{leadCount} mapped</span>
        </span>
        {leadCount > geocodedCount && (
          <span className={styles.unmapped}>
            {leadCount - geocodedCount} not geocoded
          </span>
        )}
      </div>

      <button className={styles.resetBtn} onClick={onReset} title="Upload a new CSV">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        New CSV
      </button>
    </div>
  );
}
