import { Link } from 'react-router-dom';
import ResponsiveImage from './ResponsiveImage';
import { IMG } from '../constants/images';
import { HOME_OFFER_HREF } from '../constants/routes';
import styles from '../pages/LandingPage.module.css';
import extra from '../pages/marketing-pages.module.css';

export default function CashOfferPromo() {
  return (
    <section className={extra.calcPromo} aria-labelledby="calc-promo-title">
      <div className={styles.container}>
        <div className={extra.calcPromoGrid}>
          <ResponsiveImage
            candidates={[IMG.calculator, IMG.seller]}
            alt="Instant cash offer calculator Oregon"
            className={extra.calcPromoImg}
          />
          <div>
            <span className={styles.sectionLabel}>Free estimate</span>
            <h2 id="calc-promo-title" className={extra.calcPromoTitle}>
              How much could you get for your house in cash?
            </h2>
            <p className={styles.sectionSub}>
              Estimated market value and cash offer ranges from your address and property details.
            </p>
            <div className={extra.ctaRow}>
              <Link to="/cash-offer-calculator" className={styles.offerBtnMid}>
                Open Cash Offer Calculator →
              </Link>
              <a href={HOME_OFFER_HREF} className={styles.investorPrimaryBtn}>Speak to an investor</a>
            </div>
            <p className={extra.disclaimer}>
              Estimates use available data — not a final appraisal or binding offer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
