import styles from './BgGeocodingBanner.module.css';

/**
 * Non-blocking background geocoding progress banner.
 * Floats at the bottom of the content area, doesn't block the map or tabs.
 */
export default function BgGeocodingBanner({ done, total, onCancel }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <span className={styles.spinner} />
        <div className={styles.text}>
          <span className={styles.title}>Mapping addresses in background</span>
          <span className={styles.sub}>{done} of {total} done ({pct}%)</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <button className={styles.cancelBtn} onClick={onCancel} title="Stop geocoding">
          Stop
        </button>
      </div>
    </div>
  );
}
