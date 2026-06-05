import { buildLeadFieldRows, buildListPreviewRows } from '../utils/leadInfoFields';
import styles from './LeadInfoModal.module.css';

export default function LeadInfoModal({ open, onClose, lead, listMeta, title }) {
  if (!open) return null;

  const isList = !lead && listMeta;
  const fieldRows = lead ? buildLeadFieldRows(lead) : [];
  const preview = isList ? buildListPreviewRows(listMeta) : null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h2 className={styles.title}>
            {title || (lead?.name || lead?.address || listMeta?.name || 'Lead info')}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.body}>
          {lead && (
            <>
              {lead._addressForGeocode && (
                <p className={styles.sub}>{lead._addressForGeocode}</p>
              )}
              <div className={styles.grid}>
                {fieldRows.map(({ key, label, val }) => (
                  <div key={key} className={styles.row}>
                    <span className={styles.label}>{label}</span>
                    <span className={styles.val}>{val}</span>
                  </div>
                ))}
              </div>
              {lead.phones?.length > 0 && (
                <div className={styles.phones}>
                  <div className={styles.sectionTitle}>Phone numbers</div>
                  {lead.phones.map((p) => (
                    <div key={p.number} className={styles.row}>
                      <span className={styles.label}>{p.label}</span>
                      <span className={styles.val}>{p.number}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {isList && preview && (
            <>
              <p className={styles.sub}>
                {listMeta.fileName} · {listMeta.leadCount ?? 0} rows
              </p>
              {preview.headers.length > 0 && (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {preview.headers.map((h) => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 25).map((row, i) => (
                        <tr key={i}>
                          {preview.headers.map((h) => (
                            <td key={h}>{String(row[h] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {(listMeta.leadCount ?? 0) > 25 && (
                <p className={styles.hint}>Showing first 25 of {listMeta.leadCount} rows.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
