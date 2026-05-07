import { useState } from 'react';
import { ZONE_GROUPS, ZONE_COLORS, ZONE_DESCRIPTIONS } from '../constants/zoning';
import styles from './ZoneLegend.module.css';

export default function ZoneLegend({ visible }) {
  const [open, setOpen] = useState(false);

  if (!visible) return null;

  return (
    <div className={styles.wrap}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide legend' : 'Show legend'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.9"/>
          <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.4"/>
          <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.25"/>
        </svg>
        Zones
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.panel}>
          {ZONE_GROUPS.map((group) => (
            <div key={group.label} className={styles.group}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.codes.map((code) => (
                <div key={code} className={styles.row}>
                  <span
                    className={styles.swatch}
                    style={{ background: ZONE_COLORS[code] ?? '#444' }}
                  />
                  <span className={styles.code}>{code}</span>
                  <span className={styles.desc}>{ZONE_DESCRIPTIONS[code]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
