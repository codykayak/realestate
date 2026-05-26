import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { SITE_URL } from '../constants/images';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function SellingVsCash() {
  return (
    <>
      <SeoHead title="Selling vs Cash Offer | NW Investor Oregon" description="Compare listing on the MLS vs selling for cash in Oregon." path="/selling-vs-cash-offer" jsonLd={{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Selling vs Cash Offer', url: `${SITE_URL}/selling-vs-cash-offer` }} />
      <div className={`${styles.container} ${extra.innerPage} ${extra.prose}`}>
        <p className={extra.breadcrumb}><Link to="/">Home</Link> / Selling vs Cash</p>
        <h1 className={styles.sectionTitle}>Listing on the MLS vs Selling for Cash</h1>
        <h2>MLS — advantages</h2>
        <ul><li>Highest potential price for move-in-ready homes in competitive pockets</li><li>Wide MLS exposure</li><li>Works if you have time for showings and inspections</li></ul>
        <h2>MLS — disadvantages</h2>
        <ul><li>~6% commissions plus closing costs and repairs</li><li>45–120+ days common; financing can fall through</li><li>Hard for probate, tenants, or major deferred maintenance</li></ul>
        <h2>Cash to NW Investor — advantages</h2>
        <ul><li>14–45 day closings often possible</li><li>As-is, no showings</li><li>We coordinate heirship/title paperwork</li></ul>
        <h2>Cash — disadvantages</h2>
        <ul><li>Gross price below retail — you trade max price for speed and certainty</li><li>Best for urgent or distressed situations, not pristine spring listings</li></ul>
        <div className={extra.card}>
          <table style={{ width: '100%', fontSize: 15, borderCollapse: 'collapse' }}>
            <tbody>
              {[['Timeline', '60–120 days', '14–45 days'], ['Repairs', 'Usually required', 'As-is'], ['Commission', '~5–6%', '$0'], ['Showings', 'Many', 'None']].map(([a, b, c]) => (
                <tr key={a} style={{ borderBottom: '1px solid var(--nw-border)' }}>
                  <td style={{ padding: 10, color: 'var(--nw-text)' }}>{a}</td><td style={{ padding: 10 }}>{b}</td><td style={{ padding: 10 }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link to="/cash-offer-calculator" className={styles.offerBtnMid}>Try Cash Calculator →</Link>
      </div>
    </>
  );
}
