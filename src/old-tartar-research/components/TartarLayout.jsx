import { Link, useLocation } from 'react-router-dom';
import styles from '../tartar.module.css';

const BASE = '/apps/old-tartar-research';

const NAV = [
  { to: `${BASE}/apps`, label: 'Apps' },
  { to: BASE, label: 'Dashboard', end: true },
  { to: `${BASE}/sources`, label: 'Sources' },
  { to: `${BASE}/mentions`, label: 'Mentions' },
  { to: `${BASE}/anomalies`, label: 'Anomalies' },
  { to: `${BASE}/search-terms`, label: 'Search terms' },
  { to: `${BASE}/build`, label: 'My build' },
  { to: `${BASE}/settings`, label: 'Settings' },
];

export default function TartarLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className={styles.tartar}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>Old Tartar Research</div>
          {NAV.map(({ to, label, end }) => {
            const active = end ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`${styles.navLink} ${active ? styles.navActive : ''}`}>
                {label}
              </Link>
            );
          })}
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
