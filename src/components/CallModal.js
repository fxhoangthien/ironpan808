import { SITE } from "../data/site.js";

export function renderCallModal() {
  return `<dialog class="call-modal" id="call-modal" aria-labelledby="call-modal-title">
  <div class="call-modal__panel">
    <button type="button" class="call-modal__close" data-close-call-modal aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <p class="call-modal__eyebrow">Call to order</p>
    <h2 id="call-modal-title" class="call-modal__title">Ready to order?</h2>
    <p class="call-modal__text">Call IRON PAN and we will take your order over the phone.</p>
    <p class="call-modal__number">${SITE.phone}</p>
    <div class="call-modal__actions">
      <a href="${SITE.phoneHref}" class="btn btn--primary call-modal__call">Call now</a>
      <button type="button" class="btn btn--outline" data-copy-phone data-phone="${SITE.phoneDigits}">
        Copy number
      </button>
    </div>
    <p class="call-modal__hint" data-copy-feedback hidden>Number copied</p>
  </div>
</dialog>`;
}
