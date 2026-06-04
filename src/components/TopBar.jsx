import styles from './TopBar.module.css';

export default function TopBar({
  leadCount, geocodedCount,
  zoningVisible, onToggleZoning, zoningLoading,
  onReset, onResumeGeocoding, bgGeocoding,
  teamLabel, onOpenTeam,
}) {
  const unmapped = leadCount - geocodedCount;

  return (
    <div className={styles.bar}>
      {/* Brand */}
      <div className={styles.brand}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="10" r="3" stroke="#58a6ff" strokeWidth="2"/>
        </svg>
        <span className={styles.title}>{teamLabel ? teamLabel : 'Leads'}</span>
      </div>

      {/* Lead stats */}
      <div className={styles.stats}>
        <span className={styles.mapped}>
          <span className={styles.mappedNum}>{geocodedCount}</span>
          <span className={styles.mappedLabel}> pinned</span>
        </span>
        {unmapped > 0 && (
          bgGeocoding ? (
            <span className={styles.geocodingBadge}>
              <span className={styles.miniSpinner} />
              mapping…
            </span>
          ) : (
            <button
              className={styles.unmappedBtn}
              onClick={onResumeGeocoding}
              title="Tap to finish mapping remaining addresses"
            >
              {unmapped} missing
            </button>
          )
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {onOpenTeam && (
          <button
            type="button"
            className={styles.teamBtn}
            onClick={onOpenTeam}
            title="Shared team lead pool"
            aria-label="Team lead pool"
          >
            <span className={styles.teamIcon}>👥</span>
            <span className={styles.resetLabel}>Team</span>
          </button>
        )}
        {/* Layers button — opens LayerToggle panel */}
        <button
          className={`${styles.layersBtn} ${zoningVisible ? styles.layersBtnOn : ''}`}
          onClick={onToggleZoning}
          title="Manage zoning layers"
          disabled={zoningLoading}
        >
          {zoningLoading ? (
            <span className={styles.zoneSpinner} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <polyline points="2 17 12 22 22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="2 12 12 17 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className={styles.zoneLabel}>Layers</span>
        </button>

        {/* New CSV */}
        <button className={styles.resetBtn} onClick={onReset} aria-label="Upload new CSV">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className={styles.resetLabel}>New CSV</span>
        </button>
      </div>
    </div>
  );
}
