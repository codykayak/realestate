import { useNavigate } from 'react-router-dom';
import { HOME_OFFER_HREF, goToOfferForm } from '../constants/routes';

/** Links to the home "Ready to Move Forward?" offer form — same target as the hero CTA */
export default function OfferLink({ className, children, onClick, ...rest }) {
  const navigate = useNavigate();

  return (
    <a
      href={HOME_OFFER_HREF}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        goToOfferForm(navigate);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
