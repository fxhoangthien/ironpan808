import { IMAGES } from "../data/images.js";

export function renderWelcomePopup() {
  return `<dialog class="welcome-popup" id="welcome-popup" aria-label="IRON PAN announcement">
  <div class="welcome-popup__panel">
    <button type="button" class="welcome-popup__close" data-close-welcome-popup aria-label="Close announcement">
      <span aria-hidden="true">&times;</span>
    </button>
    <img
      class="welcome-popup__image"
      src="${IMAGES.welcomePromo}"
      alt="IRON PAN — We coming soon. A new experience is on the way at 2334 S King St Ste 101, Honolulu."
      width="720"
      height="1280"
      decoding="async"
    >
  </div>
</dialog>`;
}
