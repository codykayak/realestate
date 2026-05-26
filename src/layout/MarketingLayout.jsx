import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import CashOfferPromo from '../components/CashOfferPromo';
import { BRAND_NAME, CONTACT_EMAIL } from '../constants/brand';
import { IMG, PHONE_DISPLAY, PHONE_TEL } from '../constants/images';
import OfferLink from '../components/OfferLink';
import styles from '../pages/LandingPage.module.css';

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  /** In-page anchors on home; from other routes use /#section so the home page loads first */
  const homeHash = (id) => (isHome ? id : `/${id}`);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo} onClick={() => setMenuOpen(false)}>
          <img src={IMG.logo} alt={BRAND_NAME} className={styles.logoImg} />
        </Link>
        <div className={styles.navLinks}>
          <a href={homeHash('#how-it-works')} className={styles.navLink}>How It Works</a>
          <a href={homeHash('#areas')} className={styles.navLink}>Areas</a>
          <a href={homeHash('#faq')} className={styles.navLink}>FAQ</a>
          <Link to="/testimonials" className={styles.navLink}>Reviews</Link>
          <Link to="/probate-inherited-house-guide" className={styles.navLink}>Probate</Link>
          <Link to="/selling-vs-cash-offer" className={styles.navLink}>Cash vs Listing</Link>
        </div>
        <div className={styles.navActions}>
          <a href={`tel:${PHONE_TEL}`} className={styles.callBtnNav}>{PHONE_DISPLAY}</a>
          <Link to="/cash-offer-calculator" className={styles.offerBtnNav}>Cash Calculator</Link>
          <OfferLink className={styles.offerBtnNav}>Get Cash Offer</OfferLink>
          <button type="button" className={styles.loginBtn} onClick={() => navigate('/app')}>
            Map CMS →
          </button>
          <button type="button" className={styles.hamburger} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <a href={homeHash('#how-it-works')} onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href={homeHash('#areas')} onClick={() => setMenuOpen(false)}>Areas We Buy</a>
          <a href={homeHash('#faq')} onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/cash-offer-calculator" onClick={() => setMenuOpen(false)}>Cash Calculator</Link>
          <Link to="/testimonials" onClick={() => setMenuOpen(false)}>Reviews</Link>
          <Link to="/probate-inherited-house-guide" onClick={() => setMenuOpen(false)}>Probate Guide</Link>
          <OfferLink className={styles.mobileOfferBtn} onClick={() => setMenuOpen(false)}>Get Cash Offer</OfferLink>
          <button type="button" className={styles.mobileLoginBtn} onClick={() => { setMenuOpen(false); navigate('/app'); }}>
            Map CMS →
          </button>
        </div>
      )}

      <main style={{ paddingTop: 68 }}>
        <Outlet />
        <CashOfferPromo />
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <img src={IMG.logo} alt={BRAND_NAME} className={styles.footerLogo} />
              <p className={styles.footerTagline}>Oregon&apos;s trusted cash home buyer.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Sellers</h4>
              <Link to="/cash-offer-calculator">Cash Calculator</Link>
              <Link to="/selling-vs-cash-offer">Cash vs Listing</Link>
              <Link to="/probate-inherited-house-guide">Probate Guide</Link>
              <Link to="/testimonials">Testimonials</Link>
              <OfferLink>Get Cash Offer</OfferLink>
            </div>
            <div className={styles.footerCol}>
              <h4>Cities</h4>
              <Link to="/we-buy-houses/eugene-or" onClick={() => window.scrollTo(0, 0)}>Eugene</Link>
              <Link to="/we-buy-houses/springfield-or" onClick={() => window.scrollTo(0, 0)}>Springfield</Link>
              <Link to="/we-buy-houses/corvallis-or" onClick={() => window.scrollTo(0, 0)}>Corvallis</Link>
              <Link to="/we-buy-houses/bend-or" onClick={() => window.scrollTo(0, 0)}>Bend</Link>
              <Link to="/we-buy-houses/lebanon-or" onClick={() => window.scrollTo(0, 0)}>Lebanon</Link>
              <Link to="/we-buy-houses/roseburg-or" onClick={() => window.scrollTo(0, 0)}>Roseburg</Link>
              <Link to="/we-buy-houses/florence-or" onClick={() => window.scrollTo(0, 0)}>Florence</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              <Link to="/app">Map CMS</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} {BRAND_NAME} · Eugene, Oregon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
