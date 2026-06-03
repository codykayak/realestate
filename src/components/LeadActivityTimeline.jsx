import { useEffect, useState } from 'react';
import styles from './LeadActivityTimeline.module.css';

function formatWhen(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function iconFor(item) {
  if (item.kind === 'sms') return '💬';
  if (item.kind === 'call') return '📞';
  if (item.kind === 'appointment') return '📅';
  return '📝';
}

export default function LeadActivityTimeline({ leadId, fetchActivity, leadNotes }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (leadId == null || !fetchActivity) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchActivity(leadId)
      .then((list) => { if (!cancelled) setItems(list); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [leadId, fetchActivity]);

  const hasNote = leadNotes?.trim();

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Activity</p>
      {loading && <p className={styles.muted}>Loading…</p>}
      {!loading && items.length === 0 && !hasNote && (
        <p className={styles.muted}>No calls or texts logged yet.</p>
      )}
      <ul className={styles.list}>
        {hasNote && (
          <li className={styles.item}>
            <span className={styles.icon}>📝</span>
            <div className={styles.body}>
              <span className={styles.title}>Current notes</span>
              <p className={styles.detail}>{leadNotes}</p>
            </div>
          </li>
        )}
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.icon}>{iconFor(item)}</span>
            <div className={styles.body}>
              <span className={styles.title}>{item.title}</span>
              {item.detail && <p className={styles.detail}>{item.detail}</p>}
              <span className={styles.meta}>
                {formatWhen(item.at)}
                {item.by ? ` · ${item.by}` : ''}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
