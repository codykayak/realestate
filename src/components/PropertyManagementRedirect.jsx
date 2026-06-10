import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MANYDOORS_ORIGIN = 'https://www.manydoorsai.com';

/**
 * Permanent cutover: macrorei.com/property-management/* → manydoorsai.com/*
 */
export default function PropertyManagementRedirect() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const rest = pathname.replace(/^\/property-management\/?/i, '') || '';
    const path = rest ? `/${rest}` : '';
    window.location.replace(`${MANYDOORS_ORIGIN}${path}${search}${hash}`);
  }, [pathname, search, hash]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b0f14',
      color: '#8b97a7',
      fontFamily: 'system-ui, sans-serif',
    }}
    >
      Redirecting to ManyDoors AI…
    </div>
  );
}
