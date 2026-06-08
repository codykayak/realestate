import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureAttribution, setAttributionContext } from '../utils/attribution';

/** Persist UTM / click-id attribution for the browsing session. */
export default function AttributionCapture() {
  const { pathname } = useLocation();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  useEffect(() => {
    const cityMatch = pathname.match(/^\/we-buy-houses\/([^/]+)/);
    if (cityMatch) {
      setAttributionContext({ citySlug: cityMatch[1] });
    }
    const situationMatch = pathname.match(/^\/sell\/([^/]+)/);
    if (situationMatch) {
      setAttributionContext({ situationSlug: situationMatch[1] });
    }
  }, [pathname]);

  return null;
}
