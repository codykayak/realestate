import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HOME_OFFER_ID } from '../constants/routes';

/** Scroll to the home offer form when URL is /#offer (SPA navigation does not do this automatically). */
export function useScrollToOffer() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || hash !== `#${HOME_OFFER_ID}`) return;

    const scrollToForm = () => {
      document.getElementById(HOME_OFFER_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const t = window.setTimeout(scrollToForm, 80);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);
}
