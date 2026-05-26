/** Home page anchor for the "Ready to Move Forward?" submission form */
export const HOME_OFFER_HREF = '/#offer';
export const HOME_OFFER_ID = 'offer';

export function scrollToOfferForm(behavior = 'smooth') {
  document.getElementById(HOME_OFFER_ID)?.scrollIntoView({ behavior, block: 'start' });
}

/** Navigate to home offer form (Ready to Move Forward?) from any route */
export function goToOfferForm(navigate) {
  const onHome = window.location.pathname === '/';
  const atOffer = window.location.hash === `#${HOME_OFFER_ID}`;

  if (onHome && atOffer) {
    scrollToOfferForm();
    return;
  }

  navigate({ pathname: '/', hash: HOME_OFFER_ID });
}
