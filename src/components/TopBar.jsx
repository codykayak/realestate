import styles from './TopBar.module.css';

export default function TopBar({
  leadCount, geocodedCount,
  zoningVisible, onToggleZoning, zoningLoading,
  onOpenLists, activeListName,
  onResumeGeocoding, bgGeocoding,
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
        <span className={styles.title}>{activeListName || (teamLabel ? teamLabel : 'Leads')}</span>
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

        {onOpenLists && (
          <button className={styles.resetBtn} onClick={onOpenLists} aria-label="My Lists">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className={styles.resetLabel}>My Lists</span>
          </button>
        )}
      </div>
    </div>
  );
}
