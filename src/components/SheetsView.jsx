import { useState, useMemo } from 'react';
import { exportLeadsCsv } from '../utils/exportLeads';
import { complianceLabel } from '../utils/leadCompliance';
import { sellerStageLabel } from '../utils/sellerPortal';
import styles from './SheetsView.module.css';

const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#3fb950',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

const SORT_OPTIONS = [
  { value: 'distress_desc', label: '🔥 Distress (high→low)' },
  { value: 'callcount_asc', label: '📞 Least called first' },
  { value: 'value_desc',    label: '💰 Value (high→low)' },
  { value: 'name_asc',      label: '🔤 Name (A→Z)' },
  { value: 'status_asc',    label: '📋 Status' },
];

function parseNum(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[$,]/g, '')) || 0;
}

function phoneCount(lead) {
  if (lead.phones?.length) return lead.phones.length;
  if (lead.phone) return 1;
  return 0;
}

export default function SheetsView({ leads, selectedId, isTeamMode, onDialLead, onSelectLead, onViewOnMap, onUpdateLead }) {
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('distress_desc');
  const [showSort, setShowSort] = useState(false);

  const sorted = useMemo(() => {
    let list = [...leads];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        (l.name    || '').toLowerCase().includes(q) ||
        (l.address || '').toLowerCase().includes(q) ||
        (l.city    || '').toLowerCase().includes(q) ||
        (l.phone   || '').includes(q),
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'distress_desc': return parseNum(b.distress)   - parseNum(a.distress);
        case 'callcount_asc': return (a.callCount ?? 0)     - (b.callCount ?? 0);
        case 'value_desc':    return parseNum(b.price)      - parseNum(a.price);
        case 'name_asc':      return (a.name || '').localeCompare(b.name || '');
        case 'status_asc':    return (a.status || '').localeCompare(b.status || '');
        default: return 0;
      }
    });

    return list;
  }, [leads, search, sort]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  return (
    <div className={styles.wrap}>
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.search}
            placeholder="Search name, address, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <button
          type="button"
          className={styles.exportBtn}
          onClick={() => exportLeadsCsv(sorted, `macrorei-leads-${new Date().toISOString().slice(0, 10)}.csv`)}
          title="Export filtered list to CSV"
        >
          Export CSV
        </button>

        <div className={styles.sortWrap}>
          <button className={styles.sortBtn} onClick={() => setShowSort((v) => !v)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.sortLabel}>{activeSortLabel.replace(/^.{1,3}\s/, '')}</span>
          </button>

          {showSort && (
            <div className={styles.sortDrop}>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`${styles.sortOpt} ${sort === o.value ? styles.sortOptActive : ''}`}
                  onClick={() => { setSort(o.value); setShowSort(false); }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Count ─────────────────────────────────────────────────── */}
      <div className={styles.countBar}>
        <span className={styles.countText}>
          {sorted.length} of {leads.length} properties
        </span>
        {search && <span className={styles.countFilter}>filtered</span>}
      </div>

      {/* ── List ──────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className={styles.empty}>
          <p>No properties match your search.</p>
          <button className={styles.clearBtn} onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : (
        <div className={styles.list}>
          {sorted.map((lead) => {
            const isSelected = lead.id === selectedId;
            const phones     = phoneCount(lead);
            const statusColor = STATUS_COLORS[lead.status] ?? '#58a6ff';

            return (
              <div
                key={lead.id}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
              >
                {/* Left: status + name + address */}
                <div
                  className={styles.rowMain}
                  onClick={() => onSelectLead?.(lead.id)}
                >
                  <div className={styles.rowTop}>
                    <span
                      className={styles.statusDot}
                      style={{ background: statusColor }}
                      title={lead.status}
                    />
                    <span className={styles.rowName}>
                      {lead.name || `Lead ${lead.id + 1}`}
                    </span>
                    {(lead.callCount ?? 0) > 0 && (
                      <span className={styles.callBadge}>📞{lead.callCount}</span>
                    )}
                    {(lead.smsCount ?? 0) > 0 && (
                      <span className={styles.smsBadge}>💬{lead.smsCount}</span>
                    )}
                    {complianceLabel(lead).map((tag) => (
                      <span key={tag} className={styles.dncBadge}>{tag}</span>
                    ))}
                    {lead.sellerDeal?.enabled && (
                      <span className={styles.portalBadge} title="Seller portal active">
                        🏠 {sellerStageLabel(lead.sellerDeal.stage)}
                      </span>
                    )}
                  </div>

                  <div className={styles.rowAddr}>
                    {[lead.address, lead.city].filter(Boolean).join(', ')}
                  </div>

                  <div className={styles.rowMeta}>
                  {lead.price    && <span className={styles.metaChip}>{lead.price}</span>}
                  {lead.equity   && <span className={styles.metaChip}>Eq: {lead.equity}</span>}
                  {lead.distress && <span className={`${styles.metaChip} ${styles.distressChip}`}>Score: {lead.distress}</span>}
                  {phones > 0    && <span className={styles.metaChip}>{phones} phone{phones > 1 ? 's' : ''}</span>}
                  {(lead.photos?.length ?? 0) > 0 && (
                    <span className={`${styles.metaChip} ${styles.photosChip}`}>
                      📎 {lead.photos.length} file{lead.photos.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {isTeamMode && lead.lastEditedBy && (
                    <span className={styles.metaChip} title="Last edited by">
                      ✎ {lead.lastEditedBy.split('@')[0]}
                    </span>
                  )}
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className={styles.rowActions}>
                  {phones > 0 && (
                    <button
                      className={styles.dialBtn}
                      onClick={() => onDialLead(lead.id)}
                      title="Open in Dialer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      Dial
                    </button>
                  )}
                  <button
                    className={styles.mapBtn}
                    onClick={() => onViewOnMap(lead.id)}
                    title="View on Map"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
