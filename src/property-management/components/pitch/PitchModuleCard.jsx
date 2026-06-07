import { Link } from 'react-router-dom';
import Icon from '../Icon';
import styles from '../../pm.module.css';
import pitch from '../../developer-admin/pitch.module.css';

/**
 * Rich module card from the pitch deck — used on gateway and developer admin.
 */
export default function PitchModuleCard({ mod, to }) {
  const inner = (
    <>
      <div className={pitch.moduleHead}>
        <span className={pitch.moduleIcon}><Icon name={mod.icon} size={22} /></span>
        <div>
          <div className={styles.cardTitle}>{mod.title}</div>
          {mod.tagline && <div className={styles.hint}>{mod.tagline}</div>}
        </div>
        <div className={pitch.moduleStat}>
          <div className={pitch.statBig}>{mod.stat}</div>
          <div className={pitch.statSmall}>{mod.statLabel}</div>
        </div>
      </div>
      <ul className={pitch.bulletList}>
        {mod.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${styles.card} ${pitch.moduleCard} ${pitch.moduleCardLink}`}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${styles.card} ${pitch.moduleCard}`}>
      {inner}
    </div>
  );
}
