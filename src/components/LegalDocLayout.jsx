import { Link } from 'react-router-dom';
import styles from './LegalDocLayout.module.css';

const LOGO = '/Template/Macro REI Macro Real Estate Logo.png';

export default function LegalDocLayout({ children, backTo = '/contracts', backLabel = '← Contracts & Forms' }) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>
          <img src={LOGO} alt="MacroREI" className={styles.logo} />
        </Link>
        <Link to={backTo} className={styles.navBack}>{backLabel}</Link>
      </nav>
      <div className={styles.container}>{children}</div>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} MacroREI — Macro Real Estate Investing · Eugene, Oregon</p>
        <p>
          Templates and disclosures are for informational use. Consult a licensed Oregon attorney before use.
        </p>
      </footer>
    </div>
  );
}
