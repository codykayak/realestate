import { Link, useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import SeoHead from '../components/SeoHead';
import ResponsiveImage from '../components/ResponsiveImage';
import { BRAND_NAME } from '../constants/brand';
import { IMG, PHONE_TEL, PHONE_DISPLAY, SITE_URL } from '../constants/images';
import OfferLink from '../components/OfferLink';
import { getSituationBySlug } from '../data/sellerSituations';
import { setAttributionContext } from '../utils/attribution';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function SellerSituationPage() {
  const { situationSlug } = useParams();
  const situation = getSituationBySlug(situationSlug);
  if (!situation) return <Navigate to="/" replace />;

  useEffect(() => {
    setAttributionContext({ situationSlug: situation.slug });
  }, [situation.slug]);

  return (
    <>
      <SeoHead
        title={`${situation.title} | ${BRAND_NAME}`}
        description={situation.metaDescription}
        path={`/sell/${situation.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: situation.title,
          url: `${SITE_URL}/sell/${situation.slug}`,
          areaServed: 'Oregon',
        }}
      />
      <section className={extra.pageHero}>
        <ResponsiveImage candidates={[IMG.hero, IMG.cityMap]} alt={situation.heroAlt} className={extra.pageHeroImg} />
        <div className={extra.pageHeroOverlay} />
        <div className={`${styles.container} ${extra.pageHeroContent}`}>
          <p className={extra.breadcrumb}><Link to="/">Home</Link> / Sell / {situation.headline}</p>
          <span className={styles.sectionLabel}>Oregon cash buyers</span>
          <h1 className={styles.sectionTitle}>{situation.headline}</h1>
          <p className={styles.sectionSub}>{situation.intro}</p>
          <div className={extra.ctaRow}>
            <OfferLink className={styles.offerBtnMid}>Get My Cash Offer →</OfferLink>
            <Link to="/cash-offer-calculator" className={styles.callBtnMid}>Cash Calculator →</Link>
            <a href={`tel:${PHONE_TEL}`} className={styles.callBtnMid}>{PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>
      <div className={`${styles.container} ${extra.innerPage} ${extra.prose}`}>
        <h2>Common situations we help with</h2>
        <ul>{situation.painPoints.map((p) => <li key={p}>{p}</li>)}</ul>
        <h3>Why sell for cash</h3>
        <p>{situation.whyCash}</p>
        <p>
          We buy across Eugene, Springfield, Salem, Bend, Corvallis, Portland metro, and rural Oregon.
        </p>
        <OfferLink className={styles.offerBtnMid}>Get My Cash Offer →</OfferLink>
      </div>
    </>
  );
}
