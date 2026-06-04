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

class PmLoadErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[property-management] failed to load:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', padding: 24, background: '#0b0f14', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Property Management failed to load</h1>
          <p style={{ color: '#8b97a7', marginBottom: 16, maxWidth: 560, lineHeight: 1.5 }}>
            Hard refresh (Ctrl+Shift+R). If this persists after deploy, contact support with the error below.
          </p>
          <pre style={{ background: '#161c25', padding: 12, borderRadius: 8, fontSize: 13, color: '#f85149', overflow: 'auto' }}>
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
        <Route path="/" element={<LandingPage />} />

        <Route element={<MarketingLayout />}>
          <Route path="cash-offer-calculator" element={<CashOfferCalculator />} />
          <Route path="we-buy-houses/:citySlug" element={<CityWeBuyHouses />} />
          <Route path="selling-vs-cash-offer" element={<SellingVsCash />} />
          <Route path="probate-inherited-house-guide" element={<ProbateGuide />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="seller-deal-tracker" element={<SellerDealTrackerPage />} />
        </Route>

        <Route path="seller/:token" element={<SellerPortalPage />} />

        <Route path="referral" element={<ReferralPage />} />
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
