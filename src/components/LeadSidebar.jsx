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
  { key: 'name',      label: 'Owner / Name' },
  { key: 'llcowner',  label: 'LLC Owner' },
  { key: 'relative',  label: 'Possible Relative' },
  { key: 'address',   label: 'Address' },
  { key: 'city',      label: 'City' },
  { key: 'state',     label: 'State' },
  { key: 'zip',       label: 'ZIP' },
  { key: 'email',     label: 'Email' },
  { key: 'price',     label: 'Est. Value' },
  { key: 'equity',    label: 'Est. Equity' },
  { key: 'sqft',      label: 'Sq Ft' },
  { key: 'beds',      label: 'Beds' },
  { key: 'baths',     label: 'Baths' },
  { key: 'distress',  label: 'Distress Score' },
  { key: 'mls',       label: 'MLS #' },
];

export default function LeadSidebar({ lead, onClose, onUpdate, onViewInSheets }) {
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
        {/* Drag handle — tappable on mobile to close */}
        <div className={styles.handleBar} onClick={onClose} role="button" aria-label="Close">
          <div className={styles.handle} />
          <span className={styles.handleClose}>✕ Close</span>
        </div>

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

          {/* Phone numbers — multi-phone (wireless/landline) or single */}
          {(lead.phones?.length > 0 || lead.phone || lead.email) && (
            <div className={styles.phonesBlock}>
              {lead.phones?.length > 0 ? (
                <div className={styles.phoneList}>
                  {lead.phones.map(({ label, number }) => (
                    <a key={label} href={`tel:${number.replace(/\D/g, '')}`}
                      className={styles.phoneRow}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className={styles.phoneIcon}>
                        <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      <span className={styles.phoneLabel}>{label}</span>
                      <span className={styles.phoneNum}>{number}</span>
                      <span className={styles.callTag}>Call</span>
                    </a>
                  ))}
                </div>
              ) : lead.phone ? (
                <a href={`tel:${lead.phone}`} className={styles.actionBtn}
                  style={{ background:'rgba(59,183,126,0.12)', borderColor:'rgba(59,183,126,0.3)', color:'#3fb950' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Call {lead.phone}
                </a>
              ) : null}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className={styles.actionBtn}
                  style={{ background:'rgba(88,166,255,0.1)', borderColor:'rgba(88,166,255,0.25)', color:'#58a6ff' }}>
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

          {/* ── Public Records (Lane County) ──────────────────────── */}
          {lead.publicRecord && (
            <div className={styles.publicRecordSection}>
              <p className={styles.sectionLabel}>
                📋 Lane County Public Records
              </p>

              <div className={styles.fieldGrid}>
                {[
                  { label: 'Market Value',    val: lead.publicRecord.marketValue },
                  { label: 'Assessed Value',  val: lead.publicRecord.assessedValue },
                  { label: 'Taxable Value',   val: lead.publicRecord.taxableValue },
                  { label: 'Land Value',      val: lead.publicRecord.landValue },
                  { label: 'Improvement',     val: lead.publicRecord.improvementValue },
                  { label: 'Exemption',       val: lead.publicRecord.exemptionAmount
                      ? `${lead.publicRecord.exemptionAmount} (${lead.publicRecord.exemptionType || ''})`
                      : null },
                  { label: 'Assess Gap',      val: lead.publicRecord.assessedVsMarketGap
                      ? `${lead.publicRecord.assessedVsMarketGap} below market` : null },
                  { label: 'Year Built',      val: lead.publicRecord.yearBuilt },
                  { label: 'Bldg Type',       val: lead.publicRecord.buildingType },
                  { label: 'Lot Size',        val: lead.publicRecord.acreage },
                  { label: 'Property Class',  val: lead.publicRecord.propertyClass },
                  { label: 'Status',          val: lead.publicRecord.statusClass },
                  { label: 'Neighborhood',    val: lead.publicRecord.neighborhood },
                  { label: 'Tax Account',     val: lead.publicRecord.taxAccount },
                  { label: 'Map/Taxlot',      val: lead.publicRecord.mapTaxlot },
                ].filter(f => f.val).map(f => (
                  <div key={f.label} className={styles.field}>
                    <span className={styles.fieldLabel}>{f.label}</span>
                    <span className={styles.fieldValue}>{f.val}</span>
                  </div>
                ))}
              </div>

              {/* ── One-tap County Tax Records button ─────────────── */}
              {(lead.publicRecord.countyTaxReportLink || lead.publicRecord.taxPayLink) && (
                <a
                  href={lead.publicRecord.countyTaxReportLink || lead.publicRecord.taxPayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.countyTaxBtn}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className={styles.countyTaxBtnText}>
                    <span className={styles.countyTaxBtnMain}>View County Tax Records</span>
                    <span className={styles.countyTaxBtnSub}>Assessed value, tax history &amp; payment status</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}

              {/* Secondary links */}
              <div className={styles.taxLinks}>
                {lead.publicRecord.taxPayLink && (
                  <a href={lead.publicRecord.taxPayLink} target="_blank" rel="noopener noreferrer"
                    className={styles.taxLinkBtn}>
                    🏛 Balance Due
                  </a>
                )}
                {lead.publicRecord.rlidLink && (
                  <a href={lead.publicRecord.rlidLink} target="_blank" rel="noopener noreferrer"
                    className={styles.rlidLinkBtn}>
                    📄 RLID
                  </a>
                )}
              </div>
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

          {/* View in Sheets + Back buttons */}
          <div className={styles.bottomBtns}>
            <button className={styles.sheetsBtn} onClick={onViewInSheets}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              View in Sheets
            </button>
            <button className={styles.backBtn} onClick={onClose}>
              ← Back to Map
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
