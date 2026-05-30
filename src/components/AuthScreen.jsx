import { useState } from 'react';
import { isFirebaseConfigured } from '../firebase';
import styles from './AuthScreen.module.css';

const LOGO = '/Template/Macro REI Macro Real Estate Logo.png';

export default function AuthScreen({ onSignInGoogle, onSignInEmail, onSignUp, onResetPassword, error, setError }) {
  const [tab, setTab]         = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Sign-in fields
  const [siEmail, setSiEmail]       = useState('');
  const [siPassword, setSiPassword] = useState('');

  // Sign-up fields
  const [suName, setSuName]         = useState('');
  const [suEmail, setSuEmail]       = useState('');
  const [suPhone, setSuPhone]       = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm]   = useState('');

  function clearError() { setError?.(null); }

  async function handleSignIn(e) {
    e.preventDefault();
    clearError();
    setLoading(true);
    await onSignInEmail({ email: siEmail, password: siPassword });
    setLoading(false);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    clearError();
    if (suPassword !== suConfirm) {
      setError?.('Passwords do not match.');
      return;
    }
    if (suPassword.length < 6) {
      setError?.('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    await onSignUp({ name: suName, email: suEmail, password: suPassword, phone: suPhone });
    setLoading(false);
  }

  async function handleGoogle() {
    clearError();
    setLoading(true);
    await onSignInGoogle();
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    clearError();
    setLoading(true);
    const ok = await onResetPassword(siEmail);
    setLoading(false);
    if (ok) setResetSent(true);
  }

  if (!isFirebaseConfigured) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <img src={LOGO} alt="MacroREI" className={styles.logo} />
          <div className={styles.setupBox}>
            <p className={styles.setupTitle}>⚙️ Firebase Setup Required</p>
            <p className={styles.setupText}>
              Add <code>VITE_FIREBASE_*</code> environment variables to enable authentication.
              See <code>.env.example</code> for the required keys.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>

        {/* Logo */}
        <img src={LOGO} alt="MacroREI" className={styles.logo} />

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'signin' ? styles.tabActive : ''}`}
            onClick={() => { setTab('signin'); clearError(); setShowReset(false); setResetSent(false); }}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => { setTab('signup'); clearError(); setShowReset(false); }}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* ── SIGN IN ─────────────────────────────────────────────── */}
        {tab === 'signin' && !showReset && (
          <>
            <form className={styles.form} onSubmit={handleSignIn}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email" required autoComplete="email"
                  placeholder="you@example.com"
                  value={siEmail}
                  onChange={e => { setSiEmail(e.target.value); clearError(); }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={siPassword}
                  onChange={e => { setSiPassword(e.target.value); clearError(); }}
                />
              </div>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Sign In →'}
              </button>
            </form>

            <button className={styles.forgotLink} onClick={() => { setShowReset(true); clearError(); }}>
              Forgot password?
            </button>

            <div className={styles.divider}><span>or</span></div>

            <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p className={styles.switchHint}>
              No account?{' '}
              <button className={styles.switchLink} onClick={() => { setTab('signup'); clearError(); }}>
                Create one free →
              </button>
            </p>
          </>
        )}

        {/* ── PASSWORD RESET ──────────────────────────────────────── */}
        {tab === 'signin' && showReset && (
          <>
            {resetSent ? (
              <div className={styles.successBox}>
                ✅ Reset email sent! Check your inbox and follow the link.
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleReset}>
                <p className={styles.resetInfo}>
                  Enter your email and we'll send a password reset link.
                </p>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email" required
                    placeholder="you@example.com"
                    value={siEmail}
                    onChange={e => setSiEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  {loading ? <span className={styles.spinner} /> : 'Send Reset Email'}
                </button>
              </form>
            )}
            <button className={styles.forgotLink} onClick={() => { setShowReset(false); clearError(); }}>
              ← Back to sign in
            </button>
          </>
        )}

        {/* ── SIGN UP ─────────────────────────────────────────────── */}
        {tab === 'signup' && (
          <>
            <form className={styles.form} onSubmit={handleSignUp}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name *</label>
                <input
                  className={styles.input}
                  type="text" required autoComplete="name"
                  placeholder="Jane Smith"
                  value={suName}
                  onChange={e => { setSuName(e.target.value); clearError(); }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email *</label>
                <input
                  className={styles.input}
                  type="email" required autoComplete="email"
                  placeholder="you@example.com"
                  value={suEmail}
                  onChange={e => { setSuEmail(e.target.value); clearError(); }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone (optional)</label>
                <input
                  className={styles.input}
                  type="tel" autoComplete="tel"
                  placeholder="(541) 555-1234"
                  value={suPhone}
                  onChange={e => setSuPhone(e.target.value)}
                />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Password *</label>
                  <input
                    className={styles.input}
                    type="password" required autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={suPassword}
                    onChange={e => { setSuPassword(e.target.value); clearError(); }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirm Password *</label>
                  <input
                    className={styles.input}
                    type="password" required
                    placeholder="Repeat password"
                    value={suConfirm}
                    onChange={e => { setSuConfirm(e.target.value); clearError(); }}
                  />
                </div>
              </div>
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Create Account & Get Started →'}
              </button>
            </form>

            <div className={styles.divider}><span>or</span></div>

            <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
              <GoogleIcon />
              Sign up with Google
            </button>

            <p className={styles.switchHint}>
              Already have an account?{' '}
              <button className={styles.switchLink} onClick={() => { setTab('signin'); clearError(); }}>
                Sign in →
              </button>
            </p>

            <p className={styles.terms}>
              By creating an account you agree to use this platform responsibly.
              Your data is private and only visible to you.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.1 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.8 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.2 5.2C40 36.2 44 30.6 44 24c0-1.2-.1-2.5-.4-3.5z"/>
    </svg>
  );
}
