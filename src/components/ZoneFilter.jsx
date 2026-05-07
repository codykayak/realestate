import { useState, useMemo, useEffect } from 'react';
import { ZONE_COLORS, ZONE_DESCRIPTIONS, DEFAULT_ZONE_COLOR } from '../constants/zoning';
import styles from './ZoneFilter.module.css';

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
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  // Local pending selection — only pushed to map on Apply
  const [pending, setPending] = useState(() => new Set(available.map((a) => a.code)));

  // Keep pending in sync when available zones change (new CSV)
  useEffect(() => {
    setPending(new Set(available.map((a) => a.code)));
  }, [available]);

  // Derived
  const allCodes    = new Set(available.map((a) => a.code));
  const totalMapped = leads.filter((l) => l.geocoded).length;
  const isFiltered  = zoneFilter !== null && zoneFilter.size < available.length;
  const activeCount = zoneFilter
    ? leads.filter((l) => l.geocoded && zoneFilter.has(l.zoneCode || '?')).length
    : totalMapped;

  // Pending differs from currently applied filter?
  const pendingAllSelected = pending.size === available.length;
  const appliedSet = zoneFilter ?? allCodes;
  const hasPendingChanges =
    pending.size !== appliedSet.size ||
    [...pending].some((c) => !appliedSet.has(c));

  function togglePending(code) {
    setPending((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function selectAllPending()  { setPending(new Set(available.map((a) => a.code))); }
  function clearAllPending()   { setPending(new Set()); }

  function applyFilter() {
    onChange(pendingAllSelected ? null : new Set(pending));
    setOpen(false);
  }

  function cancelFilter() {
    // Reset pending back to the currently applied filter
    setPending(zoneFilter ? new Set(zoneFilter) : new Set(available.map((a) => a.code)));
    setOpen(false);
  }

  if (available.length === 0) return null;

  return (
    <div className={styles.wrap}>
      {/* Trigger button */}
      <button
        className={`${styles.toggle} ${isFiltered ? styles.active : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
            stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        </svg>
        {isFiltered ? `Filtered · ${activeCount} shown` : `Filter zones (${totalMapped})`}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Filter by Zone</span>
            <div className={styles.headBtns}>
              <button className={styles.headBtn} onClick={selectAllPending}>All</button>
              <button className={styles.headBtn} onClick={clearAllPending}>None</button>
            </div>
          </div>

          {/* Zone list */}
          <div className={styles.list}>
            {available.map(({ code, count, label, color }) => (
              <label key={code} className={styles.row}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={pending.has(code)}
                  onChange={() => togglePending(code)}
                />
                <span className={styles.swatch} style={{ background: color }} />
                <span className={styles.rowLabel}>{label}</span>
                <span className={styles.rowCode}>{code === '?' ? '' : code}</span>
                <span className={styles.rowCount}>{count}</span>
              </label>
            ))}
          </div>

          {/* Footer: Apply / Cancel */}
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={cancelFilter}>
              Cancel
            </button>
            <button
              className={`${styles.applyBtn} ${hasPendingChanges ? styles.applyPulse : ''}`}
              onClick={applyFilter}
              disabled={pending.size === 0}
            >
              {pending.size === 0
                ? 'Select at least one'
                : hasPendingChanges
                  ? `Apply · ${pending.size === available.length ? 'All' : pending.size + ' zones'}`
                  : 'Applied ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
