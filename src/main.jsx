import { StrictMode, lazy, Suspense } from 'react';
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
import './index.css';

const App = lazy(() => import('./App'));

function MapLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070d14', color: '#8b949e' }}>
      Loading Map CMS…
    </div>
  );
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
        </Route>

        <Route path="/app/*" element={<Suspense fallback={<MapLoading />}><App /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
