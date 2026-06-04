import { StrictMode, lazy, Suspense, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import MarketingLayout from './layout/MarketingLayout';
import CashOfferCalculator from './pages/CashOfferCalculator';
import CityWeBuyHouses from './pages/CityWeBuyHouses';
import SellingVsCash from './pages/SellingVsCash';
import ProbateGuide from './pages/ProbateGuide';
import Testimonials from './pages/Testimonials';
import ReferralPage from './pages/ReferralPage';
import ContractsPage from './pages/ContractsPage';
import SmsConsentPage from './pages/SmsConsentPage';
import AffidavitHeirshipPage from './pages/AffidavitHeirshipPage';
import SellerPortalPage from './pages/SellerPortalPage';
import SellerDealTrackerPage from './pages/SellerDealTrackerPage';
import './index.css';

const App = lazy(() => import('./App'));
// Self-contained Property Management module (HiveOps). The host only references
// this one lazy entry point; the module imports nothing from the host site, so
// it can be migrated to another site or its own repo with a config change.
const PropertyManagement = lazy(() => import('./property-management/index.jsx'));

function MapLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070d14', color: '#8b949e' }}>
      Loading Map CMS…
    </div>
  );
}

function PmLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f14', color: '#8b97a7' }}>
      Loading Property Management…
    </div>
  );
}

/** If the PM bundle fails to load, show the error instead of an empty dark screen. */
class PmLoadErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', padding: 24, background: '#0b0f14', color: '#e6edf3', fontFamily: 'system-ui' }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Property Management failed to load</h1>
          <p style={{ color: '#8b97a7', marginBottom: 16 }}>
            Try a hard refresh (Ctrl+Shift+R). If this persists after deploy, contact support.
          </p>
          <pre style={{ background: '#161c25', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 13, color: '#f85149' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Home: original full page (nav/footer/hero unchanged) */}
        <Route path="/" element={<LandingPage />} />

        {/* SEO pages: shared layout + calculator promo band */}
        <Route element={<MarketingLayout />}>
          <Route path="cash-offer-calculator" element={<CashOfferCalculator />} />
          <Route path="we-buy-houses/:citySlug" element={<CityWeBuyHouses />} />
          <Route path="selling-vs-cash-offer" element={<SellingVsCash />} />
          <Route path="probate-inherited-house-guide" element={<ProbateGuide />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="seller-deal-tracker" element={<SellerDealTrackerPage />} />
        </Route>

        <Route path="seller/:token" element={<SellerPortalPage />} />

        <Route path="referral"  element={<ReferralPage />} />
        <Route path="referral-program" element={<ReferralPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="contracts/sms-consent" element={<SmsConsentPage />} />
        <Route path="contracts/affidavit-of-heirship" element={<AffidavitHeirshipPage />} />
        <Route path="legal" element={<ContractsPage />} />
        <Route path="legal/sms-consent" element={<SmsConsentPage />} />
        <Route path="legal/affidavit-of-heirship" element={<AffidavitHeirshipPage />} />

        <Route path="/app/*" element={<Suspense fallback={<MapLoading />}><App /></Suspense>} />
        <Route
          path="/property-management/*"
          element={(
            <PmLoadErrorBoundary>
              <Suspense fallback={<PmLoading />}>
                <PropertyManagement />
              </Suspense>
            </PmLoadErrorBoundary>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
