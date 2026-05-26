import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ResponsiveImage from '../components/ResponsiveImage';
import { IMG, SITE_URL } from '../constants/images';
import { HOME_OFFER_HREF } from '../constants/routes';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

const STEPS = [
  ['Confirm authority to sell', 'Locate will, death certificate, deed. Determine probate vs small-estate or heirship affidavit.'],
  ['Estate administration', 'Open probate if required, or use affidavit procedures in your county.'],
  ['Secure the property', 'Locks, utilities, insurance — vacant homes need quick attention.'],
  ['Inventory debts', 'Mortgages, taxes, HOA — often resolved at closing.'],
  ['Align heirs', 'All parties must agree; we help coordinate signatures.'],
  ['Choose sale method', 'Retail if show-ready; cash if urgent or as-is.'],
  ['Title & closing', 'Oregon title company clears liens and records deed.'],
  ['Distribute proceeds', 'Per will or intestate rules; keep records for court if needed.'],
];

export default function ProbateGuide() {
  return (
    <>
      <SeoHead title="Probate & Inherited House Guide Oregon | NW Investor" description="Sell inherited property in Oregon. We coordinate paperwork with title." path="/probate-inherited-house-guide" jsonLd={{ '@context': 'https://schema.org', '@type': 'HowTo', name: 'Sell Inherited House Oregon', url: `${SITE_URL}/probate-inherited-house-guide` }} />
      <div className={`${styles.container} ${extra.innerPage}`}>
        <p className={extra.breadcrumb}><Link to="/">Home</Link> / Probate Guide</p>
        <h1 className={styles.sectionTitle}>Probate & Inherited House Guide</h1>
        <p className={styles.sectionSub}><strong>We can take care of the paperwork coordination</strong> with your title company or ours.</p>
        <ResponsiveImage candidates={[IMG.affidavit, IMG.seller]} alt="Oregon heirship affidavit" style={{ borderRadius: 16, marginBottom: 32 }} />
        <div className={extra.prose}>
          {STEPS.map(([title, body], i) => (
            <div key={title} className={extra.card}>
              <span className={styles.sectionLabel}>Step {i + 1}</span>
              <h2 style={{ marginTop: 8, fontSize: 22 }}>{title}</h2>
              <p style={{ margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
        <a href={HOME_OFFER_HREF} className={styles.offerBtnMid}>Tell Us About the Property →</a>
      </div>
    </>
  );
}
