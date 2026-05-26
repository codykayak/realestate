import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HOME_OFFER_ID, scrollToOfferForm } from '../constants/routes';

/** Scroll to the home offer form when URL is /#offer (SPA navigation does not do this automatically). */
export function useScrollToOffer() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || hash !== `#${HOME_OFFER_ID}`) return;

    const t = window.setTimeout(() => scrollToOfferForm(), 120);
    return () => window.clearTimeout(t);
  }, [pathname, hash, key]);
}
