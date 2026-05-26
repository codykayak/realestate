import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ResponsiveImage from '../components/ResponsiveImage';
import { IMG, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from '../constants/images';
import { HOME_OFFER_HREF } from '../constants/routes';
import { estimateFromInputs, formatMoney } from '../utils/estimateValue';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function CashOfferCalculator() {
  const [form, setForm] = useState({
    address: '',
    city: '',
    zip: '',
    beds: '',
    baths: '',
    sqft: '',
    condition: 'average',
    yearBuilt: '',
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
        description="Free Oregon cash home offer calculator. Enter any address or city for estimated market value and cash offer ranges."
        path="/cash-offer-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'NW Investor Instant Cash Offer Calculator',
          url: `${SITE_URL}/cash-offer-calculator`,
        }}
      />
      <div className={`${styles.container} ${extra.innerPage}`}>
        <p className={extra.breadcrumb}>
          <Link to="/">Home</Link> / Cash Offer Calculator
        </p>
        <span className={styles.sectionLabel}>Instant Cash Offer Calculator</span>
        <h1 className={styles.sectionTitle}>Estimate Your Cash Offer Range</h1>

        <div className={extra.calcPageIntro}>
          <ResponsiveImage
            candidates={[IMG.calculator, IMG.seller]}
            alt="Cash offer calculator for Oregon homeowners"
            className={extra.calcPageImg}
          />
          <div className={extra.calcPageIntroText}>
            <p className={styles.sectionSub} style={{ maxWidth: 'none', margin: 0 }}>
              Enter your property address, city, ZIP, and basics. We use typical Oregon market
              data and investor economics to show a realistic range — then you can submit the form
              on our home page for a formal offer.
            </p>
            <ul className={extra.calcBullets}>
              <li>Any Oregon city or street address — not limited to a preset list</li>
              <li>Adjust beds, baths, square footage, and condition</li>
              <li>Not an appraisal; speak with us for an accurate cash number</li>
            </ul>
          </div>
        </div>

        <form className={extra.formCard} onSubmit={onSubmit}>
          <div className={extra.formGrid}>
            <div className={extra.formFull}>
              <label className={extra.formLabel} htmlFor="calc-address">
                Property address
              </label>
              <input
                id="calc-address"
                className={extra.formInput}
                name="address"
                placeholder="123 Main St (optional if city + ZIP provided)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-city">
                City
              </label>
              <input
                id="calc-city"
                className={extra.formInput}
                name="city"
                placeholder="e.g. Eugene, Bend, Florence"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-zip">
                ZIP code
              </label>
              <input
                id="calc-zip"
                className={extra.formInput}
                name="zip"
                placeholder="97401"
                pattern="[0-9]{5}"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-beds">
                Bedrooms
              </label>
              <input
                id="calc-beds"
                className={extra.formInput}
                type="number"
                min="0"
                value={form.beds}
                onChange={(e) => setForm({ ...form, beds: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-baths">
                Bathrooms
              </label>
              <input
                id="calc-baths"
                className={extra.formInput}
                type="number"
                min="0"
                step="0.5"
                value={form.baths}
                onChange={(e) => setForm({ ...form, baths: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-sqft">
                Approx. sq ft
              </label>
              <input
                id="calc-sqft"
                className={extra.formInput}
                type="number"
                min="0"
                value={form.sqft}
                onChange={(e) => setForm({ ...form, sqft: e.target.value })}
              />
            </div>
            <div>
              <label className={extra.formLabel} htmlFor="calc-year">
                Year built
              </label>
              <input
                id="calc-year"
                className={extra.formInput}
                type="number"
                value={form.yearBuilt}
                onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })}
              />
            </div>
            <div className={extra.formFull}>
              <label className={extra.formLabel} htmlFor="calc-condition">
                Property condition
              </label>
              <select
                id="calc-condition"
                className={extra.formSelect}
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              >
                <option value="excellent">Excellent / recently updated</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="fair">Fair — needs some work</option>
                <option value="poor">Poor — major repairs needed</option>
                <option value="needs-work">Needs significant work</option>
              </select>
            </div>
          </div>
          <button type="submit" className={styles.offerBtnMid} style={{ marginTop: 20 }}>
            Calculate My Estimate →
          </button>
        </form>

        {result && (
          <>
            <div className={extra.resultGrid}>
              <div className={extra.resultBox}>
                <div className={extra.resultLabel}>Estimated market value (range)</div>
                <div className={extra.resultValue}>
                  {formatMoney(result.marketLow)} – {formatMoney(result.marketHigh)}
                </div>
              </div>
              <div className={extra.resultBox}>
                <div className={extra.resultLabel}>Estimated cash offer (range)</div>
                <div className={extra.resultValue}>
                  {formatMoney(result.cashLow)} – {formatMoney(result.cashHigh)}
                </div>
              </div>
            </div>
            <div className={extra.card} style={{ textAlign: 'center', marginTop: 24 }}>
              <h2 style={{ marginTop: 0 }}>
                Get Your Accurate Cash Offer – Speak to a Local Investor
              </h2>
              <div className={extra.ctaRow} style={{ justifyContent: 'center' }}>
                <a href={`tel:${PHONE_TEL}`} className={styles.offerBtnMid}>
                  Call {PHONE_DISPLAY}
                </a>
                <a href={HOME_OFFER_HREF} className={styles.investorPrimaryBtn}>
                  Get My No-Obligation Cash Offer →
                </a>
              </div>
              <p className={extra.disclaimer}>
                This is an estimate based on existing data — not a final comp or binding offer.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
