/**
 * Old Tartar Research — historical anomaly detection app.
 * Listed under Apps; custom builds visible when signed in.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthScreen from '../components/AuthScreen';
import { TartarProvider, useTartar } from './context/TartarContext';
import TartarLayout from './components/TartarLayout';
import AppsPage from './pages/AppsPage';
import DashboardPage from './pages/DashboardPage';
import SourcesPage from './pages/SourcesPage';
import MentionsPage from './pages/MentionsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import SearchTermsPage from './pages/SearchTermsPage';
import CustomBuildPage from './pages/CustomBuildPage';
import SettingsPage from './pages/SettingsPage';
import styles from './tartar.module.css';
import { isFirebaseConfigured } from '../firebase';

function TartarAuthGate({ children }) {
  const { user, error, setError, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <div className={styles.authWrap}>
        <div className={`${styles.alert} ${styles.alertError}`}>Firebase is not configured.</div>
      </div>
    );
  }

  if (user === undefined) {
    return <div className={styles.authWrap}><p className={styles.pageSub}>Loading…</p></div>;
  }

  if (!user) {
    return (
      <div className={styles.authWrap}>
        <AuthScreen
          onSignInGoogle={signInWithGoogle}
          onSignInEmail={signInWithEmail}
          onSignUp={signUpWithEmail}
          onResetPassword={resetPassword}
          error={error}
          setError={setError}
        />
      </div>
    );
  }

  return children;
}

function TartarRoutes() {
  const { loading, error } = useTartar();

  if (loading) {
    return <p className={styles.pageSub}>Loading research workspace…</p>;
  }

  return (
    <>
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      <Routes>
        <Route path="apps" element={<AppsPage />} />
        <Route index element={<DashboardPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="mentions" element={<MentionsPage />} />
        <Route path="anomalies" element={<AnomaliesPage />} />
        <Route path="search-terms" element={<SearchTermsPage />} />
        <Route path="build" element={<CustomBuildPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </>
  );
}

export default function OldTartarResearch() {
  return (
    <TartarAuthGate>
      <TartarProvider>
        <TartarLayout>
          <TartarRoutes />
        </TartarLayout>
      </TartarProvider>
    </TartarAuthGate>
  );
}
