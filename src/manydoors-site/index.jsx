import { Routes, Route, Navigate } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import Home from './pages/Home';
import Features from './pages/Features';
import Platform from './pages/Platform';
import Support from './pages/Support';
import './manydoors.css';

export default function ManyDoorsSite() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<Features />} />
        <Route path="platform" element={<Platform />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
