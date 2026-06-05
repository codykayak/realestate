import { useState, useMemo } from 'react';
import { FIELD_ALIASES } from '../utils/parseCSV';
import styles from './ColumnMapStep.module.css';

const CANONICAL_LABELS = {
  address: 'Address (map pin)',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  name: 'Contact / owner name',
  phone: 'Primary phone',
  email: 'Email',
  price: 'Value / price',
  equity: 'Equity',
  sqft: 'Sq Ft',
  beds: 'Beds',
  baths: 'Baths',
  mls: 'MLS #',
  status: 'Status',
  notes: 'Notes',
  distress: 'Distress / priority',
  llcowner: 'Company / LLC',
  relative: 'Associated contact',
};

export default function ColumnMapStep({
  fileName,
  headers,
  autoFieldMap,
  previewRows,
  onBack,
  onConfirm,
  busy,
}) {
  const [selected, setSelected] = useState(() => new Set(headers));

  const mappedSummary = useMemo(() => {
    const out = [];
    for (const [canon, col] of Object.entries(autoFieldMap)) {
      if (canon.startsWith('_raw_')) continue;
      if (selected.has(col)) out.push({ canon, col });
    }
    return out;
  }, [autoFieldMap, selected]);

  function toggle(h) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(h)) next.delete(h);
      else next.add(h);
      return next;
    });
  }

  function selectAll(on) {
    setSelected(on ? new Set(headers) : new Set());
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Choose columns to import</h2>
      <p className={styles.sub}>
        <strong>{fileName}</strong> · {previewRows?.length ?? 0}+ rows · check columns for Dialer, Sheets, and Map
      </p>

      <div className={styles.toolbar}>
        <button type="button" className={styles.linkBtn} onClick={() => selectAll(true)}>Select all</button>
        <button type="button" className={styles.linkBtn} onClick={() => selectAll(false)}>Clear</button>
      </div>

      <div className={styles.cols}>
        {headers.map((h) => {
          const canon = Object.entries(autoFieldMap).find(([, col]) => col === h)?.[0];
          const label = canon && !canon.startsWith('_raw_') ? CANONICAL_LABELS[canon] : null;
          return (
            <label key={h} className={styles.colRow}>
              <input
                type="checkbox"
                checked={selected.has(h)}
                onChange={() => toggle(h)}
              />
              <span className={styles.colName}>{h}</span>
              {label && <span className={styles.colTag}>→ {label}</span>}
            </label>
          );
        })}
      </div>

      {mappedSummary.length > 0 && (
        <div className={styles.mapped}>
          <div className={styles.mappedTitle}>Auto-mapped for calling & map</div>
          {mappedSummary.map(({ canon, col }) => (
            <span key={canon} className={styles.chip}>{CANONICAL_LABELS[canon] || canon}: {col}</span>
          ))}
        </div>
      )}

      <p className={styles.hint}>
        Unmapped columns still import as custom fields visible in Info. Works for homeowners, attorneys, property managers, or any list.
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack} disabled={busy}>Back</button>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={busy || selected.size === 0}
          onClick={() => onConfirm([...selected])}
        >
          {busy ? 'Importing…' : `Import ${selected.size} column${selected.size === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}
