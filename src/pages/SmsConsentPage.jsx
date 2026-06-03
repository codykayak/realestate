import { Link } from 'react-router-dom';
import LegalDocLayout from '../components/LegalDocLayout';
import { BRAND_SHORT, CONTACT_EMAIL, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from '../constants/brand';
import styles from './LegalDocPage.module.css';

const OPT_IN_LANGUAGE = `By providing my mobile phone number and checking the consent box (or by otherwise agreeing in writing or verbally to receive text messages), I agree to receive automated and non-automated SMS/text messages from Macro Real Estate Investing (MacroREI) at the number provided. Message types may include property inquiries, appointment reminders, follow-up regarding a cash offer, and related real estate communications. Message frequency varies. Message and data rates may apply. I am not required to consent to receive texts as a condition of purchasing any property or services. I may revoke consent at any time by replying STOP. For help, reply HELP or contact us at ${PHONE_DISPLAY} or ${CONTACT_EMAIL}.`;

export default function SmsConsentPage() {
  return (
    <LegalDocLayout>
      <header className={styles.header}>
        <span className={styles.badge}>Twilio / TCPA disclosure</span>
        <h1 className={styles.title}>SMS Marketing Consent &amp; Proof of Consent</h1>
        <p className={styles.subtitle}>
          Public disclosure page for {BRAND_SHORT} text messaging program. Use this URL when registering
          campaigns with Twilio or carriers (10DLC).
        </p>
        <p className={styles.urlLine}>
          Public URL: <strong>{SITE_URL}/contracts/sms-consent</strong>
        </p>
      </header>

      <section className={styles.card}>
        <h2>Program information</h2>
        <dl className={styles.dl}>
          <dt>Business name</dt>
          <dd>Macro Real Estate Investing (MacroREI)</dd>
          <dt>Program name</dt>
          <dd>MacroREI Seller &amp; Lead SMS</dd>
          <dt>Contact</dt>
          <dd>
            <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
            {' · '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </dd>
          <dt>Website</dt>
          <dd><a href={SITE_URL}>{SITE_URL}</a></dd>
        </dl>
      </section>

      <section className={styles.card}>
        <h2>Required opt-in language (sample)</h2>
        <p className={styles.note}>
          Use this exact language (or substantially similar) wherever you collect SMS consent—web forms,
          paper forms, or documented verbal consent.
        </p>
        <blockquote className={styles.quote}>{OPT_IN_LANGUAGE}</blockquote>
      </section>

      <section className={styles.card}>
        <h2>How we obtain consent</h2>
        <ul className={styles.list}>
          <li>
            <strong>Written / web form:</strong> Seller or lead checks an unchecked consent box on our
            website or signs a paper form that includes the language above.
          </li>
          <li>
            <strong>Verbal:</strong> After the person agrees on a recorded or logged call, we document
            date, phone number, and that the opt-in language was read and accepted.
          </li>
          <li>
            <strong>Inbound text:</strong> Person texts our Twilio number first (e.g., in response to
            marketing); we confirm opt-in before marketing messages beyond the immediate reply.
          </li>
          <li>
            <strong>Dialer / CRM:</strong> Our team only sends manual templated texts to numbers from
            our lead list after a business relationship or express request to be contacted by text.
          </li>
        </ul>
        <p className={styles.note}>
          We do <strong>not</strong> purchase phone lists for unsolicited SMS. We do <strong>not</strong>
          send marketing texts without prior express consent.
        </p>
      </section>

      <section className={styles.card}>
        <h2>Opt-out &amp; help</h2>
        <ul className={styles.list}>
          <li>Reply <strong>STOP</strong> to any message to unsubscribe from future texts.</li>
          <li>Reply <strong>HELP</strong> for assistance.</li>
          <li>Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call {PHONE_DISPLAY}.</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Printable consent form</h2>
        <p className={styles.note}>
          Print this section for in-person or mail signings. Keep a copy for your records as proof of consent.
        </p>
        <div className={styles.printBox} id="printable-consent">
          <p><strong>Macro Real Estate Investing — SMS Consent Form</strong></p>
          <p className={styles.formLine}>Name: _________________________________________________</p>
          <p className={styles.formLine}>Mobile phone: __________________________________________</p>
          <p className={styles.formLine}>Property / subject (optional): ___________________________</p>
          <p className={styles.formFine}>{OPT_IN_LANGUAGE}</p>
          <p className={styles.formLine}>☐ I agree to receive text messages as described above.</p>
          <p className={styles.formLine}>Signature: _________________________ Date: ______________</p>
        </div>
        <button type="button" className={styles.printBtn} onClick={() => window.print()}>
          Print consent form
        </button>
      </section>

      <section className={styles.card}>
        <h2>Related documents</h2>
        <p>
          <Link to="/contracts">← Back to Contracts &amp; Forms</Link>
          {' · '}
          <a href="/contracts/sms-marketing-consent.html" target="_blank" rel="noopener noreferrer">
            Static HTML copy (for carriers)
          </a>
        </p>
      </section>
    </LegalDocLayout>
  );
}
