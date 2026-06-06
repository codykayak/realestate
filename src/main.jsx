import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const ManyDoorsSite = lazy(() => import('./manydoors-site/index.jsx'));

function SiteLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07080c', color: '#8b97a7' }}>
      Loading…
    </div>
  );
}

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/macrorei" element={<LandingPage />} />

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
        <Route path="/property-management/*" element={<Suspense fallback={<PmLoading />}><PropertyManagement /></Suspense>} />

        <Route path="/*" element={<Suspense fallback={<SiteLoading />}><ManyDoorsSite /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
