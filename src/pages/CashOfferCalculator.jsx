import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ResponsiveImage from '../components/ResponsiveImage';
import { IMG, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from '../constants/images';
import { cities } from '../data/cities';
import { estimateFromInputs, formatMoney } from '../utils/estimateValue';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function CashOfferCalculator() {
  const [form, setForm] = useState({
    address: '', city: '', zip: '', beds: '', baths: '', sqft: '', condition: 'average', yearBuilt: '',
  });
  const [result, setResult] = useState(null);

  const onSubmit = (e) => {
    e.preventDefault();
    setResult(estimateFromInputs(form));
  };

  return (
    <>
      <SeoHead
        title="Instant Cash Offer Calculator | NW Investor Oregon"
        description="Free Oregon cash home offer calculator. Estimated market value and cash offer ranges for Eugene, Springfield, Bend, Corvallis and more."
        path="/cash-offer-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'NW Investor Instant Cash Offer Calculator',
          url: `${SITE_URL}/cash-offer-calculator`,
        }}
      />
      <div className={`${styles.container} ${extra.innerPage}`}>
        <p className={extra.breadcrumb}><Link to="/">Home</Link> / Cash Offer Calculator</p>
        <span className={styles.sectionLabel}>Instant Cash Offer Calculator</span>
        <h1 className={styles.sectionTitle}>Estimate Your Cash Offer Range</h1>
        <p className={styles.sectionSub}>
          Enter your address or city, ZIP, and property basics. See estimated market value and cash offer ranges, then speak with a local investor for an accurate offer.
        </p>

        <div className={extra.grid2} style={{ marginTop: 24 }}>
          <ResponsiveImage candidates={[IMG.calculator, IMG.seller]} alt="Cash offer calculator" className={extra.calcPromoImg} />
        </div>

        <form className={extra.formCard} onSubmit={onSubmit}>
          <div className={extra.formGrid}>
            <div className={extra.formFull}>
              <label className={extra.formLabel}>Street address (optional)</label>
              <input className={extra.formInput} name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className={extra.formLabel}>City *</label>
              <select className={extra.formSelect} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                <option value="">Select</option>
                {cities.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={extra.formLabel}>ZIP *</label>
              <input className={extra.formInput} required pattern="[0-9]{5}" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
            </div>
            <div>
              <label className={extra.formLabel}>Bedrooms</label>
              <input className={extra.formInput} type="number" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
            </div>
            <div>
              <label className={extra.formLabel}>Bathrooms</label>
              <input className={extra.formInput} type="number" step="0.5" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
            </div>
            <div>
              <label className={extra.formLabel}>Sq ft</label>
              <input className={extra.formInput} type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
            </div>
            <div>
              <label className={extra.formLabel}>Year built</label>
              <input className={extra.formInput} type="number" value={form.yearBuilt} onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })} />
            </div>
            <div className={extra.formFull}>
              <label className={extra.formLabel}>Condition</label>
              <select className={extra.formSelect} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="needs-work">Needs significant work</option>
              </select>
            </div>
          </div>
          <button type="submit" className={styles.offerBtnMid} style={{ marginTop: 20 }}>Calculate My Estimate →</button>
        </form>

        {result && (
          <>
            <div className={extra.resultGrid}>
              <div className={extra.resultBox}>
                <div className={extra.resultLabel}>Estimated market value</div>
                <div className={extra.resultValue}>{formatMoney(result.marketLow)} – {formatMoney(result.marketHigh)}</div>
              </div>
              <div className={extra.resultBox}>
                <div className={extra.resultLabel}>Estimated cash offer</div>
                <div className={extra.resultValue}>{formatMoney(result.cashLow)} – {formatMoney(result.cashHigh)}</div>
              </div>
            </div>
            <div className={extra.card} style={{ textAlign: 'center', marginTop: 24 }}>
              <h2 style={{ marginTop: 0 }}>Get Your Accurate Cash Offer – Speak to a Local Investor</h2>
              <div className={extra.ctaRow} style={{ justifyContent: 'center' }}>
                <a href={`tel:${PHONE_TEL}`} className={styles.offerBtnMid}>Call {PHONE_DISPLAY}</a>
                <Link to="/#offer" className={styles.investorPrimaryBtn}>Request Formal Offer →</Link>
              </div>
              <p className={extra.disclaimer}>This is an estimate based on existing data — not a final comp or binding offer.</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
