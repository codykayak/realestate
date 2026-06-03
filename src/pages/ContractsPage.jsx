import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ContractsPage.module.css';

/** @typedef {'document' | 'page'} ContractLinkType */

const LOGO = '/Template/Macro REI Macro Real Estate Logo.png';

const CONTRACTS = [
  {
    id: 'purchase-agreement',
    title: 'Oregon Cash Purchase & Sale Agreement',
    description: 'Standard one-page cash purchase contract for motivated sellers. Includes "and/or assigns" language, as-is sale, transfer rights, and heirship/probate provisions.',
    features: [
      'and/or assigns — transfer rights built in',
      'As-Is, Where-Is sale — no repair contingencies',
      'Earnest money, closing date, title provisions',
      'Heirship & probate coordination language',
      'Default protections for both parties',
      'Oregon law, ORS 84 electronic signature compliant',
      'Signature block for multiple heirs / sellers',
    ],
    htmlPath: '/contracts/oregon-wholesale-purchase-agreement.html',
    pdfPath:  '/contracts/oregon-wholesale-purchase-agreement.pdf',
    badge: 'Most Used',
    badgeColor: '#3fb950',
    linkType: 'document',
  },
  {
    id: 'sms-consent',
    title: 'SMS Marketing Consent (Proof of Consent)',
    description:
      'Public TCPA / Twilio disclosure page with required opt-in language, opt-out instructions, and a printable consent form for carriers and 10DLC registration.',
    features: [
      'Required opt-in disclosure language',
      'STOP / HELP instructions',
      'Documents how consent is collected',
      'Printable written consent form',
      'Public URL for Twilio campaign registration',
    ],
    linkType: 'page',
    pagePath: '/contracts/sms-consent',
    badge: 'Twilio / TCPA',
    badgeColor: '#58a6ff',
  },
  {
    id: 'affidavit-heirship',
    title: 'Oregon Affidavit of Heirship',
    description:
      'Fill-in template to identify heirs and inherited property for title and estate transfers. Use with your attorney or title company.',
    features: [
      'Decedent and property identification',
      'Heir table with relationships and interests',
      'Statement under penalty of perjury',
      'Oregon notary acknowledgment block',
      'Separate page with fill-in browser form',
    ],
    linkType: 'page',
    pagePath: '/contracts/affidavit-of-heirship',
    htmlPath: '/contracts/oregon-affidavit-of-heirship.html',
    badge: 'Heirship',
    badgeColor: '#a371f7',
  },
];

export default function ContractsPage() {
  const [previewId, setPreviewId] = useState(null);

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>
          <img src={LOGO} alt="MacroREI" className={styles.logo} />
        </Link>
        <Link to="/" className={styles.navBack}>← Back to MacroREI.com</Link>
      </nav>

      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>📄 Legal Documents</span>
          <h1 className={styles.title}>Contracts &amp; Forms</h1>
          <p className={styles.subtitle}>
            MacroREI's standard real estate purchase contracts for Oregon.
            Download as PDF or open to fill in your browser.
          </p>
          <div className={styles.disclaimer}>
            ⚠️ These forms are provided for informational purposes. Always consult a licensed Oregon real estate
            attorney before using in a transaction.
          </div>
        </div>

        {/* Contract cards */}
        <div className={styles.cards}>
          {CONTRACTS.map(c => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardBadge} style={{ background: c.badgeColor }}>
                    {c.badge}
                  </span>
                  <h2 className={styles.cardTitle}>{c.title}</h2>
                  <p className={styles.cardDesc}>{c.description}</p>
                </div>

                <div className={styles.cardActions}>
                  {c.linkType === 'page' ? (
                    <>
                      <Link to={c.pagePath} className={styles.downloadBtn}>
                        Open page →
                      </Link>
                      {c.htmlPath && (
                        <a
                          href={c.htmlPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.openBtn}
                        >
                          Fill in browser
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {c.pdfPath && (
                        <a href={c.pdfPath} download className={styles.downloadBtn}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          Download PDF
                        </a>
                      )}
                      {c.htmlPath && (
                        <a
                          href={c.htmlPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.openBtn}
                        >
                          Fill in Browser
                        </a>
                      )}
                      {c.pdfPath && (
                        <button
                          type="button"
                          className={styles.previewBtn}
                          onClick={() => setPreviewId(previewId === c.id ? null : c.id)}
                        >
                          {previewId === c.id ? '▲ Hide Preview' : '▼ Preview Contract'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Feature list */}
              <ul className={styles.features}>
                {c.features.map(f => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.featureCheck}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* PDF preview via iframe */}
              {previewId === c.id && c.pdfPath && (
                <div className={styles.previewWrap}>
                  <div className={styles.previewBar}>
                    <span>Preview — <a href={c.pdfPath} download className={styles.previewDownloadLink}>Download full PDF →</a></span>
                    <button className={styles.previewClose} onClick={() => setPreviewId(null)}>✕ Close</button>
                  </div>
                  <iframe
                    src={c.pdfPath + '#toolbar=0'}
                    className={styles.pdfFrame}
                    title={c.title}
                  />
                  <div className={styles.previewFallback}>
                    Can't see the preview?{' '}
                    <a href={c.pdfPath} download>Download the PDF</a>{' '}
                    or{' '}
                    <a href={c.htmlPath} target="_blank" rel="noopener noreferrer">open in browser</a>.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className={styles.comingSoon}>
          <h3 className={styles.comingSoonTitle}>More Forms Coming Soon</h3>
          <div className={styles.comingSoonGrid}>
            {[
              { icon: '📝', title: 'Contract Transfer Agreement', desc: 'Transfer your purchase agreement to an end buyer with a transfer fee.' },
              { icon: '🤝', title: 'End Buyer Agreement', desc: 'Agreement between MacroREI and a cash end buyer at closing.' },
              { icon: '📋', title: 'Authorization to Release Info', desc: 'Allows third parties to communicate directly with lenders or title.' },
              { icon: '🏛', title: 'Heirship Affidavit Template', desc: 'Now available — see Oregon Affidavit of Heirship above.', done: true },
            ].map(item => (
              <div key={item.title} className={styles.comingSoonCard}>
                <span className={styles.comingSoonIcon}>{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} MacroREI — Macro Real Estate Investing · Eugene, Oregon</p>
        <p>
          These templates are for informational use only.
          Consult a licensed Oregon real estate attorney before use.
        </p>
      </footer>
    </div>
  );
}
