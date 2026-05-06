import { useRef } from 'react';
import styles from './LeadSidebar.module.css';

const STATUS_OPTIONS = ['New', 'Contacted', 'Negotiating', 'Under Contract', 'Dead', 'Closed'];

const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#3fb950',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

const PRIORITY_FIELDS = [
  { key: 'name',    label: 'Name / Owner' },
  { key: 'address', label: 'Address' },
  { key: 'city',    label: 'City' },
  { key: 'state',   label: 'State' },
  { key: 'zip',     label: 'ZIP' },
  { key: 'phone',   label: 'Phone' },
  { key: 'email',   label: 'Email' },
  { key: 'price',   label: 'Price / ARV' },
  { key: 'equity',  label: 'Equity' },
  { key: 'mls',     label: 'MLS #' },
];

export default function LeadSidebar({ lead, onClose, onUpdate }) {
  const sheetRef = useRef(null);

  if (!lead) return null;

  const color = STATUS_COLORS[lead.status] ?? '#58a6ff';

  // Collect extra raw fields not already shown in PRIORITY_FIELDS
  const priorityKeys = new Set([...PRIORITY_FIELDS.map((f) => f.key), 'notes', 'status']);
  const extraFields = Object.entries(lead._raw ?? {}).filter(
    ([key, val]) =>
      !priorityKeys.has(key.toLowerCase()) &&
      val != null &&
      String(val).trim().length > 0,
  );

  // All data in one flat list: priority first, then extras
  const allFields = [
    ...PRIORITY_FIELDS
      .map(({ key, label }) => ({ key, label, val: lead[key] }))
      .filter(({ val }) => val),
    ...extraFields.map(([key, val]) => ({ key, label: key, val: String(val) })),
  ];

  return (
    <>
      {/* Backdrop (mobile) */}
      <div className={styles.backdrop} onClick={onClose} />

      <aside className={styles.sheet} ref={sheetRef}>
        {/* Drag handle (mobile visual cue) */}
        <div className={styles.handle} />

        {/* Header row */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.badge} style={{ background: color }}>
              {lead.status}
            </span>
            <h2 className={styles.name}>
              {lead.name || lead.address || lead._addressForGeocode || `Lead ${lead.id + 1}`}
            </h2>
            {lead._addressForGeocode && (
              <p className={styles.addrLine}>{lead._addressForGeocode}</p>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* No geocode warning */}
        {!lead.geocoded && (
          <div className={styles.noGeo}>
            ⚠ Address not mapped — no pin on map
            {lead._addressForGeocode && (
              <span className={styles.noGeoAddr}> ({lead._addressForGeocode})</span>
            )}
          </div>
        )}

        <div className={styles.body}>
          {/* Status */}
          <div className={styles.statusRow}>
            <span className={styles.sectionLabel}>Status</span>
            <select
              className={styles.statusSelect}
              value={lead.status}
              onChange={(e) => onUpdate(lead.id, { status: e.target.value })}
              style={{ borderColor: color, color }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Quick action buttons for phone / email */}
          {(lead.phone || lead.email) && (
            <div className={styles.actions}>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className={styles.actionBtn} style={{ background: 'rgba(59,183,126,0.12)', borderColor: 'rgba(59,183,126,0.3)', color: '#3fb950' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Call
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className={styles.actionBtn} style={{ background: 'rgba(88,166,255,0.1)', borderColor: 'rgba(88,166,255,0.25)', color: '#58a6ff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Email
                </a>
              )}
            </div>
          )}

          {/* All data fields */}
          {allFields.length > 0 && (
            <div className={styles.fieldGrid}>
              {allFields.map(({ key, label, val }) => (
                <div key={key} className={styles.field}>
                  <span className={styles.fieldLabel}>{label}</span>
                  <span className={styles.fieldValue}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className={styles.notesSection}>
            <label className={styles.sectionLabel} htmlFor={`notes-${lead.id}`}>Notes</label>
            <textarea
              id={`notes-${lead.id}`}
              className={styles.notes}
              value={lead.notes}
              onChange={(e) => onUpdate(lead.id, { notes: e.target.value })}
              placeholder="Add notes about this lead…"
              rows={4}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
