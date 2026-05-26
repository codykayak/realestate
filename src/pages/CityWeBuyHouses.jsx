import { Link, useParams, Navigate } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ResponsiveImage from '../components/ResponsiveImage';
import { CITY_IMAGES, IMG, PHONE_TEL, PHONE_DISPLAY, SITE_URL } from '../constants/images';
import OfferLink from '../components/OfferLink';
import { getCityBySlug } from '../data/cities';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function CityWeBuyHouses() {
  const { citySlug } = useParams();
  const city = getCityBySlug(citySlug);
  if (!city) return <Navigate to="/" replace />;

  const heroImg = CITY_IMAGES[city.name] || IMG.cityMap;

  return (
    <>
      <SeoHead
        title={`We Buy Houses in ${city.name}, OR | NW Investor`}
        description={city.metaDescription}
        path={`/we-buy-houses/${city.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: `We Buy Houses in ${city.name}, Oregon`,
          url: `${SITE_URL}/we-buy-houses/${city.slug}`,
        }}
      />
      <section className={extra.pageHero}>
        <ResponsiveImage candidates={[heroImg, IMG.cityMap, IMG.hero]} alt={city.heroAlt} className={extra.pageHeroImg} />
        <div className={extra.pageHeroOverlay} />
        <div className={`${styles.container} ${extra.pageHeroContent}`}>
          <p className={extra.breadcrumb}><Link to="/">Home</Link> / {city.name}</p>
          <span className={styles.sectionLabel}>{city.county}</span>
          <h1 className={styles.sectionTitle}>We Buy Houses in {city.name}, Oregon</h1>
          <p className={styles.sectionSub}>Fast, fair, as-is cash purchases. No repairs or commissions.</p>
          <div className={extra.ctaRow}>
            <OfferLink className={styles.offerBtnMid}>Get My Cash Offer →</OfferLink>
            <Link to="/cash-offer-calculator" className={styles.callBtnMid}>Cash Calculator →</Link>
            <a href={`tel:${PHONE_TEL}`} className={styles.callBtnMid}>{PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>
      <div className={`${styles.container} ${extra.innerPage} ${extra.prose}`}>
        <h2>Local market reality for sellers who need out</h2>
        <p>{city.marketContext}</p>
        <h3>Common situations in {city.name}</h3>
        <ul>{city.sellerPainPoints.map((p) => <li key={p}>{p}</li>)}</ul>
        <h3>Why a cash sale can make sense</h3>
        <p>{city.whyCash}</p>
        <p>ZIP areas: {city.zipSamples.join(', ')}.</p>
        <OfferLink className={styles.offerBtnMid}>Get My Cash Offer in {city.name} →</OfferLink>
      </div>
    </>
  );
}
