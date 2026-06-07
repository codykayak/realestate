import { usePm } from '../../context/PmContext';
import styles from '../../pm.module.css';
import pitch from '../../developer-admin/pitch.module.css';

const HERO_IMG = '/pm-pitch/pm-pitch-hero-community.png';

/**
 * Enterprise & mid-market pitch block — shared by Developer Admin pitch deck
 * and the public gateway homepage.
 */
export default function EnterprisePitchSection({ imageSrc = HERO_IMG }) {
  const { config } = usePm();

  return (
    <>
      <section className={pitch.hero}>
        <div className={pitch.heroCopy}>
          <p className={pitch.eyebrow}>Enterprise & mid-market multifamily</p>
          <h2 className={pitch.heroTitle}>
            {config.productName}: the AI operations layer on top of the PMS you already have
          </h2>
          <p className={pitch.heroLead}>
            Yardi, RealPage, AppFolio, and Entrata own the <strong>system of record</strong>.
            They store ledgers and leases — they do not answer texts at 9 PM, pre-screen applicants in five minutes,
            or deflect a garbage-disposal truck roll. {config.productName} is the <strong>system of action</strong>:
            24/7 resident communication, automated leasing, and AI maintenance triage — white-label ready for your portfolio.
          </p>
          <p className={pitch.tagline}>&ldquo;The AI staff that works on top of the system you already have.&rdquo;</p>
          <div className={pitch.heroCtas}>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>Build-and-pitch ready</span>
            <span className={`${styles.badge} ${styles.badgeBlue}`}>2,000–20,000 unit sweet spot</span>
            <span className={`${styles.badge} ${styles.badgeGray}`}>PMS-agnostic</span>
          </div>
        </div>
        <div className={pitch.heroVisual}>
          <img src={imageSrc} alt="Multifamily community — illustrative" className={pitch.heroImg} />
        </div>
      </section>

      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>The midsize squeeze</h2>
        <p className={pitch.prose}>
          Operators with roughly <strong>2,000–20,000 units</strong> and <strong>50–300 employees</strong> sit in the hardest
          position in multifamily: too large for phones and spreadsheets, too small for the centralized call centers and
          analytics armies that public REITs run. They already pay for a PMS — but the PMS is not staffed to handle the
          volume of repetitive, text-based work that hits leasing and maintenance every day.
        </p>
        <div className={`${styles.grid} ${styles.cols3}`}>
          <div className={styles.card}>
            <div className={styles.metricLabel}>Labor pressure</div>
            <p className={pitch.cardBody}>
              Leasing and maintenance teams are understaffed; growth absorbs headcount instead of margin.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.metricLabel}>Vacancy is expensive</div>
            <p className={pitch.cardBody}>
              Each vacant day ≈ lost rent. Slow speed-to-lead and manual screening extend downtime.
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.metricLabel}>Risk is rising</div>
            <p className={pitch.cardBody}>
              Application fraud and document tampering drive evictions ($3k–$10k+ per case) and unit damage.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
