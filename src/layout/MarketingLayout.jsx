import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import CashOfferPromo from '../components/CashOfferPromo';
import { IMG, PHONE_DISPLAY, PHONE_TEL } from '../constants/images';
import styles from '../pages/LandingPage.module.css';

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const hash = (id) => (isHome ? id : `/${id}`);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo} onClick={() => setMenuOpen(false)}>
          <img src={IMG.logo} alt="NW Investor" className={styles.logoImg} />
        </Link>
        <div className={styles.navLinks}>
          <a href={hash('#how-it-works')} className={styles.navLink}>How It Works</a>
          <a href={hash('#areas')} className={styles.navLink}>Areas</a>
          <a href={hash('#faq')} className={styles.navLink}>FAQ</a>
          <Link to="/testimonials" className={styles.navLink}>Reviews</Link>
          <Link to="/probate-inherited-house-guide" className={styles.navLink}>Probate</Link>
          <Link to="/selling-vs-cash-offer" className={styles.navLink}>Cash vs Listing</Link>
        </div>
        <div className={styles.navActions}>
          <a href={`tel:${PHONE_TEL}`} className={styles.callBtnNav}>{PHONE_DISPLAY}</a>
          <Link to="/cash-offer-calculator" className={styles.offerBtnNav}>Cash Calculator</Link>
          <a href={hash('#offer')} className={styles.offerBtnNav}>Get Cash Offer</a>
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
          <a href={hash('#how-it-works')} onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href={hash('#areas')} onClick={() => setMenuOpen(false)}>Areas We Buy</a>
          <a href={hash('#faq')} onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/cash-offer-calculator" onClick={() => setMenuOpen(false)}>Cash Calculator</Link>
          <Link to="/testimonials" onClick={() => setMenuOpen(false)}>Reviews</Link>
          <Link to="/probate-inherited-house-guide" onClick={() => setMenuOpen(false)}>Probate Guide</Link>
          <a href={hash('#offer')} className={styles.mobileOfferBtn} onClick={() => setMenuOpen(false)}>Get Cash Offer</a>
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
              <img src={IMG.logo} alt="NW Investor" className={styles.footerLogo} />
              <p className={styles.footerTagline}>Oregon&apos;s trusted cash home buyer.</p>
            </div>
            <div className={styles.footerCol}>
              <h4>Sellers</h4>
              <Link to="/cash-offer-calculator">Cash Calculator</Link>
              <Link to="/selling-vs-cash-offer">Cash vs Listing</Link>
              <Link to="/probate-inherited-house-guide">Probate Guide</Link>
              <Link to="/testimonials">Testimonials</Link>
              <a href={hash('#offer')}>Get Cash Offer</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Cities</h4>
              <Link to="/we-buy-houses/eugene-or">Eugene</Link>
              <Link to="/we-buy-houses/springfield-or">Springfield</Link>
              <Link to="/we-buy-houses/corvallis-or">Corvallis</Link>
              <Link to="/we-buy-houses/bend-or">Bend</Link>
              <Link to="/we-buy-houses/lebanon-or">Lebanon</Link>
              <Link to="/we-buy-houses/roseburg-or">Roseburg</Link>
              <Link to="/we-buy-houses/florence-or">Florence</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              <a href="mailto:info@nwinvestor.com">info@nwinvestor.com</a>
              <Link to="/app">Map CMS</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} NW Investor Real Estate · Eugene, Oregon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
