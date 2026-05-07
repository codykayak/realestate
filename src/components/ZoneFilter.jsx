import { useState, useMemo } from 'react';
import { ZONE_COLORS, ZONE_DESCRIPTIONS, DEFAULT_ZONE_COLOR } from '../constants/zoning';
import styles from './ZoneFilter.module.css';

/**
 * Floating zone filter panel.
 * Props:
 *   leads        – full lead array (with zoneCode assigned)
 *   zoneFilter   – Set of selected zone codes, or null (= all)
 *   onChange     – fn(newSet | null)
 */
export default function ZoneFilter({ leads, zoneFilter, onChange }) {
  const [open, setOpen] = useState(false);

  // Collect unique zone codes present in the dataset
  const available = useMemo(() => {
    const counts = {};
    for (const l of leads) {
      if (!l.geocoded) continue;
      const code = l.zoneCode || '?';
      counts[code] = (counts[code] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([code, count]) => ({
        code,
        count,
        label: code === '?' ? 'Unknown zone' : (ZONE_DESCRIPTIONS[code] ?? code),
        color: code === '?' ? '#6e7681' : (ZONE_COLORS[code] ?? DEFAULT_ZONE_COLOR),
      }))
      .sort((a, b) => b.count - a.count); // most common first
  }, [leads]);

  const totalMapped = leads.filter((l) => l.geocoded).length;
  const activeCount = zoneFilter
    ? leads.filter((l) => l.geocoded && (zoneFilter.has(l.zoneCode || '?'))).length
    : totalMapped;
  const isFiltered = zoneFilter !== null && zoneFilter.size < available.length;

  function toggle(code) {
    const current = zoneFilter ?? new Set(available.map((a) => a.code));
    const next = new Set(current);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    // If all are selected, go back to null (= no filter)
    onChange(next.size === available.length ? null : next);
  }

  function selectAll()  { onChange(null); }
  function clearAll()   { onChange(new Set()); }

  function isChecked(code) {
    return zoneFilter === null || zoneFilter.has(code);
  }

  if (available.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.toggle} ${isFiltered ? styles.active : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        </svg>
        Filter{isFiltered ? ` (${activeCount}/${totalMapped})` : ` (${totalMapped})`}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Filter by Zone</span>
            <div className={styles.headBtns}>
              <button className={styles.headBtn} onClick={selectAll}>All</button>
              <button className={styles.headBtn} onClick={clearAll}>None</button>
            </div>
          </div>

          <div className={styles.list}>
            {available.map(({ code, count, label, color }) => (
              <label key={code} className={styles.row}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={isChecked(code)}
                  onChange={() => toggle(code)}
                />
                <span className={styles.swatch} style={{ background: color }} />
                <span className={styles.rowLabel}>{label}</span>
                <span className={styles.rowCode}>{code === '?' ? '' : code}</span>
                <span className={styles.rowCount}>{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
