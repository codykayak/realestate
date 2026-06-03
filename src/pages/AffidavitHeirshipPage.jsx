import { Link } from 'react-router-dom';
import LegalDocLayout from '../components/LegalDocLayout';
import styles from './LegalDocPage.module.css';
import contractStyles from './ContractsPage.module.css';

const HTML_PATH = '/contracts/oregon-affidavit-of-heirship.html';

export default function AffidavitHeirshipPage() {
  return (
    <LegalDocLayout>
      <header className={styles.header}>
        <span className={styles.badge}>Oregon probate &amp; heirship</span>
        <h1 className={styles.title}>Affidavit of Heirship</h1>
        <p className={styles.subtitle}>
          Template for identifying heirs and describing inherited Oregon real property. Often used with
          title companies when transferring property after an owner&apos;s death (may be used with small-estate
          procedures depending on county and circumstances).
        </p>
        <div className={styles.disclaimer}>
          ⚠️ This is a general template only—not legal advice. Oregon heirship and probate rules vary by
          county and estate size. Have a licensed Oregon attorney or title company review before recording
          or transferring property.
        </div>
      </header>

      <div className={contractStyles.card}>
        <div className={contractStyles.cardTop}>
          <div className={contractStyles.cardMeta}>
            <span className={contractStyles.cardBadge} style={{ background: '#a371f7' }}>
              Heirship
            </span>
            <h2 className={contractStyles.cardTitle}>Oregon Affidavit of Heirship (Fill-in)</h2>
            <p className={contractStyles.cardDesc}>
              Open in your browser to complete blanks, then print and sign before a notary public
              (if required by your title company or county).
            </p>
          </div>
          <div className={contractStyles.cardActions}>
            <a
              href={HTML_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className={contractStyles.downloadBtn}
            >
              Open &amp; fill in browser
            </a>
            <button
              type="button"
              className={contractStyles.openBtn}
              onClick={() => window.open(HTML_PATH, '_blank')?.print()}
            >
              Print blank form
            </button>
          </div>
        </div>
        <ul className={contractStyles.features}>
          {[
            'Decedent and property identification',
            'Heir names, relationships, and ownership interests',
            'Statement of facts under penalty of perjury',
            'Notary acknowledgment block (Oregon)',
            'MacroREI letterhead — Eugene, Oregon',
          ].map((f) => (
            <li key={f} className={contractStyles.feature}>
              <span className={contractStyles.featureCheck}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <section className={styles.card}>
        <h2>When to use this form</h2>
        <ul className={styles.list}>
          <li>Property owner passed away and title needs to identify legal heirs.</li>
          <li>Title company or attorney requests an heirship affidavit before insuring or closing.</li>
          <li>May complement Oregon small-estate affidavit procedures (ORS Chapter 114)—confirm with counsel.</li>
        </ul>
        <p>
          <Link to="/probate-inherited-house-guide">Read our inherited property guide →</Link>
          {' · '}
          <Link to="/contracts">← All contracts &amp; forms</Link>
        </p>
      </section>
    </LegalDocLayout>
  );
}
