import styles from './LeadSidebar.module.css';

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Negotiating',
  'Under Contract',
  'Dead',
  'Closed',
];

const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#27ae60',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

// Fields we display with nice labels at the top of the panel
const PRIORITY_FIELDS = [
  { key: 'name',   label: 'Owner / Name' },
  { key: 'address', label: 'Address' },
  { key: 'city',   label: 'City' },
  { key: 'state',  label: 'State' },
  { key: 'zip',    label: 'ZIP' },
  { key: 'phone',  label: 'Phone' },
  { key: 'email',  label: 'Email' },
  { key: 'price',  label: 'Price / ARV' },
  { key: 'equity', label: 'Equity' },
  { key: 'mls',    label: 'MLS #' },
];

export default function LeadSidebar({ lead, onClose, onUpdate }) {
  if (!lead) return null;

  function handleNotes(e) {
    onUpdate(lead.id, { notes: e.target.value });
  }

  function handleStatus(e) {
    onUpdate(lead.id, { status: e.target.value });
  }

  // Collect extra raw fields not covered by PRIORITY_FIELDS
  const priorityKeys = new Set(PRIORITY_FIELDS.map((f) => f.key));
  const extraFields = Object.entries(lead._raw ?? {}).filter(
    ([key]) =>
      !priorityKeys.has(key) &&
      !['notes', 'status'].includes(key.toLowerCase()) &&
      lead._raw[key]?.toString().trim(),
  );

  const color = STATUS_COLORS[lead.status] ?? '#58a6ff';

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.badge} style={{ background: color }}>
            {lead.status}
          </span>
          <h2 className={styles.name}>
            {lead.name || lead.address || `Lead ${lead.id + 1}`}
          </h2>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Not geocoded warning */}
      {!lead.geocoded && (
        <div className={styles.noGeo}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f5a623" strokeWidth="1.5"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#f5a623"/>
          </svg>
          Address could not be mapped — no pin shown
        </div>
      )}

      <div className={styles.body}>
        {/* Status selector */}
        <div className={styles.section}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.statusSelect}
            value={lead.status}
            onChange={handleStatus}
            style={{ borderColor: color }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Priority fields */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Lead Details</p>
          <div className={styles.fieldList}>
            {PRIORITY_FIELDS.map(({ key, label }) => {
              const val = lead[key];
              if (!val) return null;
              return (
                <div key={key} className={styles.field}>
                  <span className={styles.fieldLabel}>{label}</span>
                  <span className={styles.fieldValue}>
                    {key === 'phone' ? (
                      <a href={`tel:${val}`} className={styles.link}>{val}</a>
                    ) : key === 'email' ? (
                      <a href={`mailto:${val}`} className={styles.link}>{val}</a>
                    ) : (
                      val
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extra CSV fields */}
        {extraFields.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Additional Fields</p>
            <div className={styles.fieldList}>
              {extraFields.map(([key, val]) => (
                <div key={key} className={styles.field}>
                  <span className={styles.fieldLabel}>{key}</span>
                  <span className={styles.fieldValue}>{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className={styles.section}>
          <label className={styles.label} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            className={styles.notes}
            value={lead.notes}
            onChange={handleNotes}
            placeholder="Add notes about this lead…"
            rows={5}
          />
        </div>

        {/* Geocode info */}
        {lead.geocoded && (
          <div className={styles.geoInfo}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#58a6ff" strokeWidth="1.5"/>
              <circle cx="12" cy="10" r="3" stroke="#58a6ff" strokeWidth="1.5"/>
            </svg>
            {lead.geocoded.lat.toFixed(5)}, {lead.geocoded.lng.toFixed(5)}
          </div>
        )}
      </div>
    </aside>
  );
}
