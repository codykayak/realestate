import { isFirebaseConfigured } from '../firebase';
import styles from './LoginScreen.module.css';

export default function LoginScreen({ onSignIn, error }) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
              stroke="url(#lg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="url(#lg)" strokeWidth="1.5"/>
            <defs>
              <linearGradient id="lg" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#58a6ff"/>
                <stop offset="1" stopColor="#3fb950"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.title}>Motivated Seller Map</h1>
        <p className={styles.subtitle}>Sign in to access your private lead data</p>

        {!isFirebaseConfigured ? (
          <div className={styles.setupBox}>
            <p className={styles.setupTitle}>⚙️ Firebase Setup Required</p>
            <p className={styles.setupText}>
              Add your Firebase credentials to <code>.env.local</code> (see <code>.env.example</code>).
              Then redeploy. Need help? Check the README.
            </p>
          </div>
        ) : (
          <>
            <button className={styles.googleBtn} onClick={onSignIn}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.1 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.8 39.7 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.2 5.2C40 36.2 44 30.6 44 24c0-1.2-.1-2.5-.4-3.5z"/>
              </svg>
              Continue with Google
            </button>

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.note}>
              Your leads are private. Only you can see your data.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
