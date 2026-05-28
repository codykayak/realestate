import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ReferralPage.module.css';

const LOGO = '/Template/Macro REI Macro Real Estate Logo.png';
const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function ReferralPage() {
  const [form, setForm] = useState({
    referrerName: '', referrerPhone: '', referrerEmail: '',
    sellerName: '', sellerPhone: '', propertyAddress: '', notes: '',
    agreed: false, date: new Date().toISOString().slice(0, 10),
  });
  const [submitted, setSubmitted] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.agreed) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>
          <img src={LOGO} alt="MacroREI" className={styles.logo} />
        </Link>
        <Link to="/" className={styles.navBack}>← Back to MacroREI.com</Link>
      </nav>

      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>💰 Finder's Fee Program</span>
          <h1 className={styles.title}>Earn $1,000 for a Referral</h1>
          <p className={styles.subtitle}>
            Know someone who wants to sell their house? If MacroREI purchases it, you get{' '}
            <strong>$1,000 cash at closing</strong> — no license required.
          </p>
          <div className={styles.howRow}>
            {[
              { n: '1', icon: '📣', t: 'Refer a seller', d: 'Tell us about someone who wants to sell — inherited, behind on payments, or just needs out fast.' },
              { n: '2', icon: '🤝', t: 'We handle everything', d: 'MacroREI contacts the seller, makes a fair cash offer, and manages the entire closing process.' },
              { n: '3', icon: '💵', t: 'You get paid', d: 'If we close on the property, you receive $1,000 at the time of closing — guaranteed in writing.' },
            ].map(s => (
              <div key={s.n} className={styles.howCard}>
                <span className={styles.howIcon}>{s.icon}</span>
                <strong className={styles.howTitle}>{s.t}</strong>
                <p className={styles.howDesc}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {submitted ? (
          /* ── Success ─────────────────────────────────────── */
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <h2>Referral Submitted!</h2>
            <p>
              Thank you, <strong>{form.referrerName}</strong>! We've received your referral for{' '}
              <strong>{form.propertyAddress}</strong>. We'll be in touch shortly.
            </p>
            <p className={styles.successSub}>
              If MacroREI closes on this property, you'll receive <strong>$1,000</strong> at closing.
              We'll contact you at {form.referrerPhone || form.referrerEmail}.
            </p>
            <Link to="/" className={styles.successBtn}>← Back to MacroREI.com</Link>
          </div>
        ) : (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Submit Your Referral</h2>
            <p className={styles.formSub}>Fill in what you know — you don't need the seller's info to get started.</p>

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Referrer info */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Your Information</legend>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Your Full Name *</label>
                    <input className={styles.input} name="referrerName" required
                      value={form.referrerName} onChange={handleChange}
                      placeholder="Jane Smith" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Your Phone Number *</label>
                    <input className={styles.input} name="referrerPhone" type="tel" required
                      value={form.referrerPhone} onChange={handleChange}
                      placeholder="(541) 555-1234" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Your Email Address *</label>
                  <input className={styles.input} name="referrerEmail" type="email" required
                    value={form.referrerEmail} onChange={handleChange}
                    placeholder="jane@email.com" />
                </div>
              </fieldset>

              {/* Property info */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Property &amp; Seller Info</legend>
                <div className={styles.field}>
                  <label className={styles.label}>Property Address *</label>
                  <input className={styles.input} name="propertyAddress" required
                    value={form.propertyAddress} onChange={handleChange}
                    placeholder="123 Oak St, Eugene, OR 97401" />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Seller's Name (if known)</label>
                    <input className={styles.input} name="sellerName"
                      value={form.sellerName} onChange={handleChange}
                      placeholder="John Doe" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Seller's Phone (if known)</label>
                    <input className={styles.input} name="sellerPhone" type="tel"
                      value={form.sellerPhone} onChange={handleChange}
                      placeholder="(541) 555-5678" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Anything else we should know?</label>
                  <textarea className={styles.textarea} name="notes" rows={4}
                    value={form.notes} onChange={handleChange}
                    placeholder="Inherited property, behind on mortgage, going through divorce, wants a quick sale, condition of the house, etc." />
                </div>
              </fieldset>

              {/* Agreement section */}
              <div className={styles.agreementBox}>
                <button
                  type="button"
                  className={styles.agreementToggle}
                  onClick={() => setShowAgreement(v => !v)}
                >
                  {showAgreement ? '▲' : '▼'} View Finder's Fee Agreement
                </button>

                {showAgreement && (
                  <div className={styles.agreementText}>
                    <p><strong>MACROREI — REFERRAL &amp; FINDER'S FEE AGREEMENT</strong></p>
                    <p>Effective Date: {TODAY}</p>
                    <p>
                      This Referral and Finder's Fee Agreement (&ldquo;Agreement&rdquo;) is entered into between
                      <strong> Macro Real Estate Investing (MacroREI)</strong>, an Oregon-based real estate
                      investment company (&ldquo;Company&rdquo;), and the individual submitting this referral
                      form (&ldquo;Referrer&rdquo;).
                    </p>

                    <p><strong>1. REFERRAL.</strong> Referrer agrees to provide the Company with information
                    regarding a potential property acquisition, including the property address and, if known,
                    the seller's contact information (&ldquo;Referred Property&rdquo;).</p>

                    <p><strong>2. FINDER'S FEE.</strong> In the event that the Company successfully closes the
                    purchase of the Referred Property as a direct result of this referral, the Company shall
                    pay the Referrer a one-time finder's fee of <strong>One Thousand Dollars ($1,000.00 USD)</strong>
                    at the time of closing on the Referred Property. Payment shall be made via check or
                    electronic transfer to the Referrer's designated account within five (5) business days
                    of closing.</p>

                    <p><strong>3. CONDITIONS.</strong> The finder's fee is contingent upon all of the following:
                    (a) the Referrer submits a completed referral form prior to the Company's first contact
                    with the seller; (b) the Company closes on the purchase of the Referred Property; (c)
                    the referral is unique — the Company has not previously been contacted by the seller or
                    another referrer regarding the same property; (d) the Referrer provides accurate contact
                    information so payment can be delivered.</p>

                    <p><strong>4. NO GUARANTEE.</strong> The Company makes no representation or guarantee that
                    it will make an offer on, negotiate for, or purchase the Referred Property. The Company
                    retains sole discretion over whether to pursue any acquisition.</p>

                    <p><strong>5. NO REAL ESTATE LICENSE REQUIRED.</strong> This referral program is available
                    to any person regardless of whether they hold a real estate license. The finder's fee
                    is compensation for providing a lead, not for performing any licensed real estate activity.</p>

                    <p><strong>6. CONFIDENTIALITY.</strong> Referrer agrees not to disclose the terms of this
                    Agreement or any non-public information shared by the Company to any third party without
                    the Company's prior written consent.</p>

                    <p><strong>7. LIMITATION OF LIABILITY.</strong> The Company's total liability under this
                    Agreement shall not exceed the finder's fee amount of $1,000. In no event shall the
                    Company be liable for any indirect, incidental, or consequential damages.</p>

                    <p><strong>8. GOVERNING LAW.</strong> This Agreement shall be governed by and construed in
                    accordance with the laws of the State of Oregon. Any disputes shall be resolved in Lane
                    County, Oregon.</p>

                    <p><strong>9. ENTIRE AGREEMENT.</strong> This Agreement constitutes the entire agreement
                    between the parties with respect to the finder's fee and supersedes all prior discussions
                    or representations.</p>

                    <p style={{fontSize:'11px', color:'#8b949e', marginTop:'12px'}}>
                      MacroREI · Eugene, Oregon · cody@macrorei.com · (541) 321-2630 · www.macrorei.com
                    </p>
                  </div>
                )}

                <label className={styles.agreeCheck}>
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={form.agreed}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I have read and agree to the Finder's Fee Agreement above. I understand that
                    payment of $1,000 is contingent on MacroREI closing the purchase of this property.
                  </span>
                </label>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Today's Date</label>
                <input className={styles.input} name="date" type="date"
                  value={form.date} onChange={handleChange} />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!form.agreed}
              >
                💰 Submit Referral &amp; Agree to Terms
              </button>

              <p className={styles.submitNote}>
                By submitting you agree to the Finder's Fee Agreement. MacroREI will contact you
                to confirm receipt. Questions? Call <a href="tel:+15413212630">(541) 321-2630</a> or
                email <a href="mailto:cody@macrorei.com">cody@macrorei.com</a>.
              </p>
            </form>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Macro Real Estate Investing (MacroREI) · Eugene, Oregon</p>
        <p>We buy houses as-is. Not a licensed real estate brokerage.</p>
      </footer>
    </div>
  );
}
