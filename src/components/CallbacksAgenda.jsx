import { useMemo } from 'react';
import styles from './CallbacksAgenda.module.css';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Time TBD';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function countUpcomingCallbacks(leads, withinDays = 7) {
  const now = startOfDay(new Date());
  const end = new Date(now);
  end.setDate(end.getDate() + withinDays);
  end.setHours(23, 59, 59, 999);

  return (leads ?? []).filter((l) => {
    if (!l.appointmentAt) return false;
    const t = new Date(l.appointmentAt);
    return !Number.isNaN(t.getTime()) && t >= now && t <= end;
  }).length;
}

export default function CallbacksAgenda({ open, onClose, leads, onJumpToLead }) {
  const items = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    return (leads ?? [])
      .filter((l) => {
        if (!l.appointmentAt) return false;
        const t = new Date(l.appointmentAt);
        return !Number.isNaN(t.getTime()) && t >= todayStart && t <= weekEnd;
      })
      .sort((a, b) => new Date(a.appointmentAt) - new Date(b.appointmentAt));
  }, [leads]);

  const todayItems = items.filter((l) => {
    const t = new Date(l.appointmentAt);
    return t >= startOfDay(new Date()) && t <= endOfDay(new Date());
  });

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Scheduled callbacks">
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>Scheduled callbacks</h3>
            <p className={styles.sub}>{todayItems.length} today · {items.length} this week</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.body}>
          {items.length === 0 ? (
            <p className={styles.empty}>
              No appointments set this week. Add a date/time on a lead card in the Dialer to schedule a callback.
            </p>
          ) : (
            <ul className={styles.list}>
              {items.map((lead) => {
                const isToday = todayItems.some((t) => t.id === lead.id);
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      className={styles.row}
                      onClick={() => {
                        onJumpToLead?.(lead.id);
                        onClose();
                      }}
                    >
                      <span className={styles.when}>
                        {isToday ? '📅 Today' : '🗓️'} {formatWhen(lead.appointmentAt)}
                      </span>
                      <span className={styles.name}>{lead.name || `Lead ${lead.id + 1}`}</span>
                      <span className={styles.addr}>
                        {[lead.address, lead.city].filter(Boolean).join(', ') || lead.phone || 'No address'}
                      </span>
                      {lead.leadSource && (
                        <span className={styles.source}>{lead.leadSource}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
