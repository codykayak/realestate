import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset scroll when changing pages (e.g. city cards were leaving users at the bottom). */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
