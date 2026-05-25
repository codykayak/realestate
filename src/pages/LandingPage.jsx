import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

// ── Image paths (relative to /public) ────────────────────────────────────────
const IMG = {
  hero:      '/Template/nwinvestor hero background invester properties oregon.png',
  logo:      '/Template/nwinvestor logo.png',
  seller:    '/Template/happy house seller for cash eugene springfield.png',
  sellerAlt: '/Template/happy seller hose chash eugene spring field off market.png',
  mapApp:    '/Template/nwinvestor map application.png',
  mapInv:    '/Template/investor map application nw investor.png',
  cityMap:   '/Template/we buy house Eugene springfield corvallis Bend Rosburg florance oregon.png',
  affidavit: '/Template/affidavit of heirship oregon .png',
  video:     '/Template/nwinvestor real estate properties oregon.mp4',
};

const FAQS = [
  {
    q: 'Do I have to go through full probate to sell?',
    a: 'Not always. In some cases we can buy using a Small Estate Affidavit or Heirship Affidavit. We\'ll help you understand your options.',
  },
  {
    q: 'What if there are multiple heirs?',
    a: 'We regularly work with families. All heirs must agree to sell, but we help coordinate the process.',
  },
  {
    q: 'Who pays for repairs or back taxes?',
    a: 'We buy the house as-is. We can often cover or work around back taxes as part of the offer.',
  },
  {
    q: 'How long does the whole process take?',
    a: 'It depends on the probate status, but many of our inherited property deals close in 14–45 days.',
  },
];

const AREAS = [
  { county: 'Lane County',     cities: 'Eugene · Springfield · Florence · Cottage Grove · Junction City' },
  { county: 'Benton County',   cities: 'Corvallis · Philomath · Monroe' },
  { county: 'Douglas County',  cities: 'Roseburg · Sutherlin · Myrtle Creek · Canyonville' },
  { county: 'Deschutes County',cities: 'Bend · Redmond · Sisters · La Pine' },
  { county: 'Linn County',     cities: 'Albany · Lebanon · Sweet Home · Brownsville' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ name: '', email: '', phone: '', area: '' });
  const [alertSent, setAlertSent] = useState(false);
  const [invForm, setInvForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [invSent, setInvSent] = useState(false);

  function handleAlertSubmit(e) {
    e.preventDefault();
    // TODO: wire to backend / Firebase
    setAlertSent(true);
  }

  function handleInvSubmit(e) {
    e.preventDefault();
    setInvSent(true);
  }

  return (
    <div className={styles.page}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <a href="/" className={styles.navLogo}>
          <img src={IMG.logo} alt="NW Investor" className={styles.logoImg} />
        </a>

        {/* Desktop nav */}
        <div className={styles.navLinks}>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#areas"        className={styles.navLink}>Areas</a>
          <a href="#faq"          className={styles.navLink}>FAQ</a>
          <a href="#investors"    className={styles.navLink}>Investors</a>
          <a href="#alerts"       className={styles.navLink}>Get Alerts</a>
        </div>

        <div className={styles.navActions}>
          <a href="#offer" className={styles.offerBtn}>Get Cash Offer</a>
          <button className={styles.loginBtn} onClick={() => navigate('/app')}>
            Sign In →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#areas"        onClick={() => setMenuOpen(false)}>Areas We Buy</a>
          <a href="#faq"          onClick={() => setMenuOpen(false)}>FAQ</a>
          <a href="#investors"    onClick={() => setMenuOpen(false)}>Investors</a>
          <a href="#alerts"       onClick={() => setMenuOpen(false)}>Get Alerts</a>
          <a href="#offer"        className={styles.mobileOfferBtn} onClick={() => setMenuOpen(false)}>Get Cash Offer</a>
          <button className={styles.mobileLoginBtn} onClick={() => { setMenuOpen(false); navigate('/app'); }}>
            Sign In to Map →
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero} style={{ backgroundImage: `url('${IMG.hero}')` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Oregon's Trusted Cash Buyer</div>
          <h1 className={styles.heroTitle}>
            We Buy Houses<br />
            <span className={styles.heroAccent}>Fast. Fair. As-Is.</span>
          </h1>
          <p className={styles.heroSub}>
            Inherited a property? Need to sell quickly? No repairs. No commissions. No hassle.
            Close in as little as <strong>14 days.</strong>
          </p>
          <div className={styles.heroCtas}>
            <a href="#offer" className={styles.heroPrimary}>
              Get My Cash Offer
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#how-it-works" className={styles.heroSecondary}>See How It Works</a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>14–45</strong><span>days to close</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>As-Is</strong><span>no repairs needed</span></div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}><strong>$0</strong><span>fees or commissions</span></div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Simple Process</div>
          <h2 className={styles.sectionTitle}>How We Buy Your House</h2>
          <p className={styles.sectionSub}>Three steps from contact to cash in hand.</p>

          <div className={styles.stepsGrid}>
            {[
              {
                num: '01',
                icon: '📞',
                title: 'Tell Us About the House',
                body: 'Call us or fill out the form below. Tell us the address and situation — probate, inherited, behind on taxes, or just need to sell fast.',
              },
              {
                num: '02',
                icon: '💰',
                title: 'Receive a Cash Offer',
                body: 'We present a fair, no-obligation cash offer — usually within 24–48 hours. No agents, no lowball games, no pressure.',
              },
              {
                num: '03',
                icon: '🏦',
                title: 'Close & Get Paid',
                body: 'Once accepted, our title company handles all heirship paperwork, probate coordination (if needed), and legal transfer. You receive cash in your bank account on closing day.',
              },
            ].map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO + TRUST BLOCK ──────────────────────────────────────────── */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            <div className={styles.trustImageWrap}>
              <img src={IMG.seller} alt="Happy seller with Northwest Investor" className={styles.trustImage} />
              <div className={styles.trustBadge}>
                <span className={styles.trustBadgeNum}>500+</span>
                <span className={styles.trustBadgeLabel}>Families Helped in Oregon</span>
              </div>
            </div>
            <div className={styles.trustContent}>
              <div className={styles.sectionLabel}>Why NW Investor</div>
              <h2 className={styles.sectionTitle}>We Specialize in<br />Inherited Properties</h2>
              <p className={styles.trustBody}>
                Dealing with an inherited property is emotionally and legally complex.
                We work with families navigating probate, heirship affidavits, and multiple heirs
                every day. Our team understands Oregon law and can move quickly even in complicated situations.
              </p>
              <ul className={styles.trustList}>
                {[
                  'Buy as-is — no repairs or clean-out required',
                  'Work with Small Estate & Heirship Affidavits',
                  'Coordinate with your title company or ours',
                  'Back taxes paid or worked into offer',
                  'Multiple heirs? We help coordinate the process',
                  'Close in 14–45 days depending on probate status',
                ].map((item) => (
                  <li key={item} className={styles.trustItem}>
                    <span className={styles.checkmark}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── AREAS ────────────────────────────────────────────────────────── */}
      <section id="areas" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Service Area</div>
          <h2 className={styles.sectionTitle}>We Buy Across Western Oregon</h2>
          <p className={styles.sectionSub}>
            From the Willamette Valley to the Oregon Coast and Central Oregon.
          </p>

          <div className={styles.areasLayout}>
            <div className={styles.areasMap}>
              <img src={IMG.cityMap} alt="Oregon areas we serve" className={styles.areaMapImg} />
            </div>
            <div className={styles.areasGrid}>
              {AREAS.map((a) => (
                <div key={a.county} className={styles.areaCard}>
                  <div className={styles.areaPin}>📍</div>
                  <div>
                    <strong className={styles.areaCounty}>{a.county}</strong>
                    <p className={styles.areaCities}>{a.cities}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Common Questions</div>
          <h2 className={styles.sectionTitle}>Inherited Property FAQ</h2>
          <p className={styles.sectionSub}>Answers to the questions we hear most often.</p>

          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                <button className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={styles.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className={styles.faqA}>{faq.a}</p>}
              </div>
            ))}
          </div>

          <div className={styles.faqAffidavit}>
            <img src={IMG.affidavit} alt="Oregon Heirship Affidavit" className={styles.affidavitImg} />
            <div>
              <h3>Oregon Heirship Affidavit</h3>
              <p>In many cases, a full probate isn't required. Oregon law allows property transfers using a Small Estate or Heirship Affidavit when certain conditions are met. We'll help you determine which path is fastest for your situation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFER CTA ────────────────────────────────────────────────────── */}
      <section id="offer" className={styles.offerSection}>
        <div className={styles.container}>
          <div className={styles.offerCard}>
            <div className={styles.offerGlow} />
            <h2 className={styles.offerTitle}>Ready to Move Forward?</h2>
            <p className={styles.offerSub}>
              If you've inherited a property in Eugene, Springfield, Corvallis, Roseburg, Bend, Florence,
              or anywhere in Lane, Benton, Douglas, or Deschutes County — we can help.
            </p>
            <div className={styles.offerForm}>
              <input type="text"  className={styles.offerInput} placeholder="Your name" />
              <input type="tel"   className={styles.offerInput} placeholder="Phone number" />
              <input type="text"  className={styles.offerInput} placeholder="Property address" />
              <button className={styles.offerSubmit}>
                Get My No-Obligation Cash Offer →
              </button>
            </div>
            <p className={styles.offerNote}>No spam. No pressure. We respond within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* ── INVESTOR PORTAL ──────────────────────────────────────────────── */}
      <section id="investors" className={styles.investorSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>Investor Portal</div>
          <h2 className={styles.sectionTitle}>Partner With NW Investor</h2>
          <p className={styles.sectionSub}>
            Access off-market deals, zoning data, and our proprietary map CMS — built for
            serious real estate investors in the Pacific Northwest.
          </p>

          <div className={styles.investorCards}>
            {/* Become an investor */}
            <div className={styles.investorCard}>
              <img src={IMG.mapInv} alt="NW Investor platform" className={styles.investorCardImg} />
              <div className={styles.investorCardBody}>
                <h3 className={styles.investorCardTitle}>Become an Investor Partner</h3>
                <p className={styles.investorCardText}>
                  Join our private investor network. Get early access to motivated seller leads,
                  deal analysis, and joint venture opportunities across Lane, Benton, Linn, and Douglas counties.
                </p>
                <a href="#investor-signup" className={styles.investorPrimaryBtn}>
                  Join the Investor Network →
                </a>
              </div>
            </div>

            {/* Map CMS */}
            <div
              className={styles.investorCard}
              style={{ backgroundImage: `url('${IMG.mapApp}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className={styles.mapCardOverlay} />
              <div className={styles.investorCardBody} style={{ position: 'relative', zIndex: 2 }}>
                <h3 className={styles.investorCardTitle}>🗺 Try Our Map CMS</h3>
                <p className={styles.investorCardText}>
                  Our custom-built investor map overlays zoning data, motivated seller pins, and
                  property intelligence across Lane, Benton, Linn, and Deschutes counties.
                  Built for off-market deal sourcing.
                </p>
                <button className={styles.investorMapBtn} onClick={() => window.scrollTo({ top: 0 }) || (window.location.href = '/app')}>
                  Launch the Map CMS →
                </button>
              </div>
            </div>
          </div>

          {/* Investor sign up form */}
          <div id="investor-signup" className={styles.investorSignupBox}>
            <h3 className={styles.investorSignupTitle}>Investor Application</h3>
            <p className={styles.investorSignupSub}>Tell us about yourself and we'll be in touch with access details.</p>

            {invSent ? (
              <div className={styles.sentBox}>
                ✅ Thanks! We'll contact you within 1 business day.
              </div>
            ) : (
              <form className={styles.invForm} onSubmit={handleInvSubmit}>
                <div className={styles.formRow}>
                  <input
                    className={styles.formInput}
                    placeholder="Full name *"
                    value={invForm.name}
                    onChange={(e) => setInvForm({ ...invForm, name: e.target.value })}
                    required
                  />
                  <input
                    className={styles.formInput}
                    placeholder="Email address *"
                    type="email"
                    value={invForm.email}
                    onChange={(e) => setInvForm({ ...invForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <input
                    className={styles.formInput}
                    placeholder="Phone number *"
                    type="tel"
                    value={invForm.phone}
                    onChange={(e) => setInvForm({ ...invForm, phone: e.target.value })}
                    required
                  />
                  <input
                    className={styles.formInput}
                    placeholder="Markets of interest (e.g. Eugene, Bend)"
                    value={invForm.message}
                    onChange={(e) => setInvForm({ ...invForm, message: e.target.value })}
                  />
                </div>
                <button type="submit" className={styles.invSubmitBtn}>
                  Submit Investor Application
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── ALERT SIGNUP ─────────────────────────────────────────────────── */}
      <section id="alerts" className={styles.alertSection}>
        <div className={styles.container}>
          <div className={styles.alertBox}>
            <div className={styles.alertIcon}>🔔</div>
            <div className={styles.alertContent}>
              <h3 className={styles.alertTitle}>Get New Property Alerts</h3>
              <p className={styles.alertSub}>
                Be the first to hear about motivated sellers, off-market properties, and new deals in your target area.
              </p>
              {alertSent ? (
                <div className={styles.sentBox}>✅ You're on the list! We'll send you alerts as new properties come in.</div>
              ) : (
                <form className={styles.alertForm} onSubmit={handleAlertSubmit}>
                  <input
                    className={styles.alertInput}
                    placeholder="Your name"
                    value={alertForm.name}
                    onChange={(e) => setAlertForm({ ...alertForm, name: e.target.value })}
                    required
                  />
                  <input
                    className={styles.alertInput}
                    placeholder="Email address *"
                    type="email"
                    value={alertForm.email}
                    onChange={(e) => setAlertForm({ ...alertForm, email: e.target.value })}
                    required
                  />
                  <input
                    className={styles.alertInput}
                    placeholder="Phone (optional)"
                    type="tel"
                    value={alertForm.phone}
                    onChange={(e) => setAlertForm({ ...alertForm, phone: e.target.value })}
                  />
                  <select
                    className={styles.alertInput}
                    value={alertForm.area}
                    onChange={(e) => setAlertForm({ ...alertForm, area: e.target.value })}
                  >
                    <option value="">All areas</option>
                    <option>Lane County (Eugene / Springfield)</option>
                    <option>Benton County (Corvallis)</option>
                    <option>Douglas County (Roseburg)</option>
                    <option>Deschutes County (Bend)</option>
                    <option>Linn County (Albany)</option>
                  </select>
                  <button type="submit" className={styles.alertSubmit}>Sign Me Up →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <img src={IMG.logo} alt="NW Investor" className={styles.footerLogo} />
              <p className={styles.footerTagline}>
                Oregon's trusted cash home buyer. Fast, fair, and transparent.
              </p>
            </div>
            <div className={styles.footerCol}>
              <h4>Sellers</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">Inherited Property FAQ</a>
              <a href="#offer">Get a Cash Offer</a>
              <a href="#areas">Areas We Buy</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Investors</h4>
              <a href="#investor-signup">Join the Network</a>
              <a href="/app">Map CMS</a>
              <a href="#alerts">Deal Alerts</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Contact</h4>
              <a href="tel:+15413001400">(541) 300-1400</a>
              <a href="mailto:info@nwinvestor.com">info@nwinvestor.com</a>
              <p>Eugene, Oregon</p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} NW Investor Real Estate · Eugene, Oregon</p>
            <p>We buy houses as-is. No repairs required. Not a licensed real estate brokerage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
