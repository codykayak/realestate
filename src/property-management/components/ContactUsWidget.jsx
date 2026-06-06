import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { submitPmContact } from '../lib/pmSubmitContact';
import cu from './contactUsWidget.module.css';

const PORTFOLIO_OPTIONS = [
  'Under 500 units',
  '500 – 1,500 units',
  '1,500 – 5,000 units',
  '5,000+ units',
];

const TIME_OPTIONS = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Anytime'];

const SALES_PHONE = '541-321-2630';
const SALES_TEL = '+15413212630';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  portfolioSize: '',
  bestTime: '',
  cityState: '',
};

export default function ContactUsWidget({ open, onOpenChange }) {
  const { config } = usePm();
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const close = () => {
    onOpenChange(false);
    setError(null);
    if (sent) {
      setForm(EMPTY);
      setSent(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.phone.trim()) {
      setError('Email and phone are required.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitPmContact(form, config.supportEmail);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send. Try Call now or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cu.root}>
      {open && (
        <div className={cu.panel} role="dialog" aria-label="Contact ManyDoors AI">
          <header className={cu.head}>
            <div>
              <div className={cu.title}>Contact us</div>
              <div className={cu.sub}>Tell us about your portfolio — we will reach out shortly.</div>
            </div>
            <button type="button" className={cu.close} onClick={close} aria-label="Close">
              ×
            </button>
          </header>

          {sent ? (
            <div className={cu.success}>
              <Icon name="check" size={22} />
              <p>Thank you! We received your request and will be in touch soon.</p>
              <button type="button" className={cu.btnSecondary} onClick={close}>
                Close
              </button>
            </div>
          ) : (
            <form className={cu.form} onSubmit={submit}>
              <label className={cu.field}>
                <span>Portfolio size</span>
                <select value={form.portfolioSize} onChange={set('portfolioSize')} required>
                  <option value="">Select range…</option>
                  {PORTFOLIO_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className={cu.field}>
                <span>City or state</span>
                <input
                  type="text"
                  placeholder="e.g. Portland, OR"
                  value={form.cityState}
                  onChange={set('cityState')}
                  required
                />
              </label>

              <div className={cu.row}>
                <label className={cu.field}>
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={set('email')} required />
                </label>
                <label className={cu.field}>
                  <span>Phone</span>
                  <input type="tel" value={form.phone} onChange={set('phone')} required />
                </label>
              </div>

              <label className={cu.field}>
                <span>Best time to call</span>
                <select value={form.bestTime} onChange={set('bestTime')} required>
                  <option value="">Select…</option>
                  {TIME_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className={cu.field}>
                <span>Name (optional)</span>
                <input type="text" value={form.name} onChange={set('name')} />
              </label>

              {error && <p className={cu.error}>{error}</p>}

              <div className={cu.actions}>
                <button type="submit" className={cu.btnPrimary} disabled={sending}>
                  {sending ? 'Sending…' : 'Submit request'}
                </button>
                <a href={`tel:${SALES_TEL}`} className={cu.btnCall}>
                  <Icon name="phone" size={16} />
                  Call now · {SALES_PHONE}
                </a>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        className={cu.pill}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
      >
        Contact us
      </button>
    </div>
  );
}
