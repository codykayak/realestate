import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useParallax } from '../hooks/useParallax';
import styles from './LandingPage.module.css';

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
  { q: 'Do I have to go through full probate to sell?', a: 'Not always. In some cases we can buy using a Small Estate Affidavit or Heirship Affidavit. We\'ll help you understand your options.' },
  { q: 'What if there are multiple heirs?',             a: 'We regularly work with families. All heirs must agree to sell, but we help coordinate the process.' },
  { q: 'Who pays for repairs or back taxes?',           a: 'We buy the house as-is. We can often cover or work around back taxes as part of the offer.' },
  { q: 'How long does the whole process take?',         a: 'It depends on the probate status, but many of our inherited property deals close in 14–45 days.' },
];

const AREAS = [
  { county: 'Lane County',      cities: 'Eugene · Springfield · Florence · Cottage Grove', icon: '🌲' },
  { county: 'Benton County',    cities: 'Corvallis · Philomath · Monroe',                  icon: '🎓' },
  { county: 'Douglas County',   cities: 'Roseburg · Sutherlin · Myrtle Creek',             icon: '⛰️' },
  { county: 'Deschutes County', cities: 'Bend · Redmond · Sisters · La Pine',              icon: '🏔️' },
  { county: 'Linn County',      cities: 'Albany · Lebanon · Sweet Home',                   icon: '🌾' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  useScrollReveal();                    // wire up Intersection Observer
  const heroParallax  = useParallax(0.18);
  const trustParallax = useParallax(0.12);

  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertForm,  setAlertForm]  = useState({ name: '', email: '', phone: '', area: '' });
  const [alertSent,  setAlertSent]  = useState(false);
  const [invForm,    setInvForm]    = useState({ name: '', email: '', phone: '', message: '' });
  const [invSent,    setInvSent]    = useState(false);
  const [offerForm,  setOfferForm]  = useState({ name: '', phone: '', address: '' });
  const [offerSent,  setOfferSent]  = useState(false);

  const handleAlert = (e) => { e.preventDefault(); setAlertSent(true); };
  const handleInv   = (e) => { e.preventDefault(); setInvSent(true); };
  const handleOffer = (e) => { e.preventDefault(); setOfferSent(true); };

  return (
    <div className={styles.page}>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <a href="/" className={styles.navLogo}>
          <img src={IMG.logo} alt="NW Investor" className={styles.logoImg} />
        </a>
        <div className={styles.navLinks}>
          {['#how-it-works','#areas','#faq','#investors','#alerts'].map((href, i) => (
            <a key={href} href={href} className={styles.navLink}>
              {['How It Works','Areas','FAQ','Investors','Get Alerts'][i]}
            </a>
          ))}
        </div>
        <div className={styles.navActions}>
          <a href="#offer" className={styles.offerBtnNav}>Get Cash Offer</a>
          <button className={styles.loginBtn} onClick={() => navigate('/app')}>Map CMS →</button>
        </div>
        <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {[['#how-it-works','How It Works'],['#areas','Areas We Buy'],['#faq','FAQ'],['#investors','Investors'],['#alerts','Get Alerts']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a href="#offer"   className={styles.mobileOfferBtn} onClick={() => setMenuOpen(false)}>Get Cash Offer</a>
          <button className={styles.mobileLoginBtn} onClick={() => { setMenuOpen(false); navigate('/app'); }}>Sign In to Map →</button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <video ref={heroParallax} className={styles.heroBgVideo}
          src={IMG.video} autoPlay muted loop playsInline poster={IMG.hero} />
        <div className={styles.heroOverlay} />

        {/* Floating decorative orbs */}
        <div className={styles.orb1} />
        <div className={styles.orb2} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge} data-reveal="up">
            ● Oregon's Trusted Cash Buyer
          </div>
          <h1 className={styles.heroTitle} data-reveal="up" data-delay="100">
            We Buy Houses<br />
            <span className={styles.heroAccent}>Fast. Fair. As-Is.</span>
          </h1>
          <p className={styles.heroSub} data-reveal="up" data-delay="200">
            Inherited a property? Need to sell quickly? No repairs. No commissions. No hassle.
            Close in as little as <strong>14 days.</strong>
          </p>
          <div className={styles.heroCtas} data-reveal="up" data-delay="300">
            <a href="#offer" className={styles.heroPrimary}>
              Get My Cash Offer
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#how-it-works" className={styles.heroSecondary}>See How It Works</a>
          </div>
          <div className={styles.heroStats} data-reveal="up" data-delay="400">
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
          <div className={styles.sectionLabel} data-reveal="up">Simple Process</div>
          <h2 className={styles.sectionTitle} data-reveal="up" data-delay="80">How We Buy Your House</h2>
          <p className={styles.sectionSub} data-reveal="up" data-delay="140">Three steps from contact to cash in hand.</p>

          <div className={styles.stepsGrid}>
            {[
              { num:'01', icon:'📞', title:'Tell Us About the House',  body:'Call us or fill out the form. Tell us the address and situation — probate, inherited, behind on taxes, or just need to sell fast.', delay:0 },
              { num:'02', icon:'💰', title:'Receive a Cash Offer',      body:'We present a fair, no-obligation cash offer — usually within 24–48 hours. No agents, no lowball games, no pressure.', delay:120 },
              { num:'03', icon:'🏦', title:'Close & Get Paid',          body:'Our title company handles heirship paperwork, probate coordination, and legal transfer. Cash in your account on closing day.', delay:240 },
            ].map(s => (
              <div key={s.num} className={styles.stepCard} data-reveal="up" data-delay={s.delay}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / SELLER PHOTO ─────────────────────────────────────────── */}
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            {/* Full-bleed image with glow */}
            <div className={styles.trustImageWrap} data-reveal="left">
              <img ref={trustParallax} src={IMG.seller}
                alt="Happy seller with Northwest Investor Real Estate after cash sale in Eugene Oregon"
                className={styles.trustImage} />
              <div className={styles.trustImageGlow} />
              <div className={styles.trustBadge}>
                <span className={styles.trustBadgeNum}>500+</span>
                <span className={styles.trustBadgeLabel}>Families Helped in Oregon</span>
              </div>
              {/* Second photo inset */}
              <img src={IMG.sellerAlt} alt="Off-market property sale Eugene Springfield"
                className={styles.trustImageInset} />
            </div>

            <div className={styles.trustContent} data-reveal="right">
              <div className={styles.sectionLabel}>Why NW Investor</div>
              <h2 className={styles.sectionTitle}>We Specialize in<br />Inherited Properties</h2>
              <p className={styles.trustBody}>
                Dealing with an inherited property is emotionally and legally complex.
                We work with families navigating probate, heirship affidavits, and multiple heirs every day.
              </p>
              <ul className={styles.trustList}>
                {['Buy as-is — no repairs or clean-out required','Work with Small Estate & Heirship Affidavits','Coordinate with your title company or ours','Back taxes paid or worked into offer','Multiple heirs? We help coordinate the process','Close in 14–45 days depending on probate status'].map(item => (
                  <li key={item} className={styles.trustItem}>
                    <span className={styles.checkmark}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── AREAS — map as full-section background ────────────────────────── */}
      <section id="areas" className={styles.areasSection}
        style={{ '--areas-bg': `url('${IMG.cityMap}')` }}>
        <div className={styles.areasBgOverlay} />
        <div className={styles.container} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.sectionLabel} data-reveal="up">Service Area</div>
          <h2 className={`${styles.sectionTitle} ${styles.lightText}`} data-reveal="up" data-delay="80">
            We Buy Across Western Oregon
          </h2>
          <p className={`${styles.sectionSub} ${styles.lightMuted}`} data-reveal="up" data-delay="140">
            From the Willamette Valley to the Oregon Coast and Central Oregon.
          </p>

          <div className={styles.areasCardGrid}>
            {AREAS.map((a, i) => (
              <div key={a.county} className={styles.areaCard} data-reveal="up" data-delay={i * 80}>
                <div className={styles.areaPin}>{a.icon}</div>
                <div>
                  <strong className={styles.areaCounty}>{a.county}</strong>
                  <p className={styles.areaCities}>{a.cities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.faqLayout}>
            <div className={styles.faqLeft}>
              <div className={styles.sectionLabel} data-reveal="up">Common Questions</div>
              <h2 className={styles.sectionTitle} data-reveal="up" data-delay="80">Inherited Property FAQ</h2>
              <p className={styles.sectionSub} data-reveal="up" data-delay="140">
                Answers to the questions we hear most often about inherited and probate properties in Oregon.
              </p>

              {/* Affidavit image — integrated, large */}
              <div className={styles.affidavitWrap} data-reveal="up" data-delay="200">
                <img src={IMG.affidavit} alt="Oregon Affidavit of Heirship document for property transfer"
                  className={styles.affidavitImgLarge} />
                <div className={styles.affidavitCaption}>
                  <strong>Oregon Heirship Affidavit</strong>
                  <p>In many cases a full probate isn't required. Oregon law allows property transfers using a Small Estate or Heirship Affidavit. We'll help determine the fastest path for your situation.</p>
                </div>
              </div>
            </div>

            <div className={styles.faqRight}>
              <div className={styles.faqList}>
                {FAQS.map((faq, i) => (
                  <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}
                    data-reveal="right" data-delay={i * 80}>
                    <button className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{faq.q}</span>
                      <span className={styles.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                    </button>
                    {openFaq === i && <p className={styles.faqA}>{faq.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFER CTA ────────────────────────────────────────────────────── */}
      <section id="offer" className={styles.offerSection}>
        <div className={styles.container}>
          <div className={styles.offerCard} data-reveal="up">
            <div className={styles.offerGlow} />
            <h2 className={styles.offerTitle}>Ready to Move Forward?</h2>
            <p className={styles.offerSub}>
              If you've inherited a property in Eugene, Springfield, Corvallis, Roseburg, Bend, Florence,
              or anywhere in Lane, Benton, Douglas, or Deschutes County — we can help.
            </p>
            {offerSent ? (
              <div className={styles.sentBox}>✅ We received your request! We'll call or email within 24 hours.</div>
            ) : (
              <form className={styles.offerForm} onSubmit={handleOffer}>
                <input className={styles.offerInput} placeholder="Your name *" required
                  value={offerForm.name} onChange={e => setOfferForm({...offerForm, name: e.target.value})} />
                <input className={styles.offerInput} placeholder="Phone number *" type="tel" required
                  value={offerForm.phone} onChange={e => setOfferForm({...offerForm, phone: e.target.value})} />
                <input className={styles.offerInput} placeholder="Property address *" required
                  value={offerForm.address} onChange={e => setOfferForm({...offerForm, address: e.target.value})} />
                <button type="submit" className={styles.offerSubmit}>Get My No-Obligation Cash Offer →</button>
              </form>
            )}
            <p className={styles.offerNote}>No spam. No pressure. We respond within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* ── INVESTOR PORTAL ──────────────────────────────────────────────── */}
      <section id="investors" className={styles.investorSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel} data-reveal="up">Investor Portal</div>
          <h2 className={styles.sectionTitle} data-reveal="up" data-delay="80">Partner With NW Investor</h2>
          <p className={styles.sectionSub} data-reveal="up" data-delay="140">
            Access off-market deals, zoning data, and our proprietary map CMS — built for serious investors in the Pacific Northwest.
          </p>

          <div className={styles.investorCards}>
            {/* Join network card */}
            <div className={styles.investorCard} data-reveal="left">
              <div className={styles.investorCardImgWrap}>
                <img src={IMG.mapInv} alt="NW Investor property intelligence platform"
                  className={styles.investorCardImg} />
                <div className={styles.investorCardImgGlow} />
              </div>
              <div className={styles.investorCardBody}>
                <h3 className={styles.investorCardTitle}>Become an Investor Partner</h3>
                <p className={styles.investorCardText}>
                  Join our private investor network. Get early access to motivated seller leads,
                  deal analysis, and joint venture opportunities across Lane, Benton, Linn, and Douglas counties.
                </p>
                <a href="#investor-signup" className={styles.investorPrimaryBtn}>Join the Investor Network →</a>
              </div>
            </div>

            {/* Map CMS card — large background image */}
            <div className={styles.investorMapCard} data-reveal="right">
              <img src={IMG.mapApp} alt="NW Investor map CMS zoning data Oregon"
                className={styles.investorMapCardImg} />
              <div className={styles.investorMapCardOverlay} />
              <div className={styles.investorMapCardBody}>
                <div className={styles.mapCardBadge}>🗺 Live Zoning Data</div>
                <h3 className={styles.investorCardTitle}>Try Our Map CMS</h3>
                <p className={styles.investorCardText}>
                  Custom-built investor map overlaying zoning data, motivated seller pins, and property intelligence
                  across Lane, Benton, Linn, and Deschutes counties.
                </p>
                <button className={styles.investorMapBtn} onClick={() => navigate('/app')}>
                  Launch the Map CMS →
                </button>
              </div>
            </div>
          </div>

          {/* Investor signup form */}
          <div id="investor-signup" className={styles.investorSignupBox} data-reveal="up">
            <h3 className={styles.investorSignupTitle}>Investor Application</h3>
            <p className={styles.investorSignupSub}>Tell us about yourself and we'll be in touch within 1 business day.</p>
            {invSent ? (
              <div className={styles.sentBox}>✅ Application received! We'll contact you within 1 business day.</div>
            ) : (
              <form className={styles.invForm} onSubmit={handleInv}>
                <div className={styles.formRow}>
                  <input className={styles.formInput} placeholder="Full name *" required
                    value={invForm.name} onChange={e => setInvForm({...invForm, name: e.target.value})} />
                  <input className={styles.formInput} placeholder="Email address *" type="email" required
                    value={invForm.email} onChange={e => setInvForm({...invForm, email: e.target.value})} />
                </div>
                <div className={styles.formRow}>
                  <input className={styles.formInput} placeholder="Phone number *" type="tel" required
                    value={invForm.phone} onChange={e => setInvForm({...invForm, phone: e.target.value})} />
                  <input className={styles.formInput} placeholder="Markets of interest (e.g. Eugene, Bend)"
                    value={invForm.message} onChange={e => setInvForm({...invForm, message: e.target.value})} />
                </div>
                <button type="submit" className={styles.invSubmitBtn}>Submit Investor Application</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── ALERT SIGNUP ─────────────────────────────────────────────────── */}
      <section id="alerts" className={styles.alertSection}>
        <div className={styles.container}>
          <div className={styles.alertBox} data-reveal="up">
            <div className={styles.alertIcon}>🔔</div>
            <div className={styles.alertContent}>
              <h3 className={styles.alertTitle}>Get New Property Alerts</h3>
              <p className={styles.alertSub}>Be first to hear about motivated sellers and off-market deals in your target area.</p>
              {alertSent ? (
                <div className={styles.sentBox}>✅ You're on the list! We'll send alerts as new properties come in.</div>
              ) : (
                <form className={styles.alertForm} onSubmit={handleAlert}>
                  <input className={styles.alertInput} placeholder="Your name"
                    value={alertForm.name} onChange={e => setAlertForm({...alertForm, name: e.target.value})} />
                  <input className={styles.alertInput} placeholder="Email address *" type="email" required
                    value={alertForm.email} onChange={e => setAlertForm({...alertForm, email: e.target.value})} />
                  <input className={styles.alertInput} placeholder="Phone (optional)" type="tel"
                    value={alertForm.phone} onChange={e => setAlertForm({...alertForm, phone: e.target.value})} />
                  <select className={styles.alertInput} value={alertForm.area}
                    onChange={e => setAlertForm({...alertForm, area: e.target.value})}>
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
              <img src={IMG.logo} alt="NW Investor Real Estate" className={styles.footerLogo} />
              <p className={styles.footerTagline}>Oregon's trusted cash home buyer. Fast, fair, and transparent.</p>
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
