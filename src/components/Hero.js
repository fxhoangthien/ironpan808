import { SITE } from "../data/site.js";
import { IMAGES } from "../data/images.js";

export function renderHero() {
  return `<section class="hero">
  <div class="container">
    <div class="hero__grid">
      <div class="hero__content">
        <span class="hero__eyebrow">Sizzling Skillets &amp; Fresh Artisan Banh Mi</span>
        <h1>Vietnamese Restaurant In Honolulu, HI 96826</h1>
        <p class="hero__text">Some of the best memories begin around a hot pan and a warm loaf of bread. Inspired by the
flavors of Vietnam and the relaxed island spirit of Honolulu, IRON PAN brings together
comforting food, handcrafted flavors, and genuine hospitality in every meal.</p>
        <button type="button" class="btn btn--primary" data-open-call-modal>Order Now</button>
      </div>
      <div class="hero__image">
        <img src="${IMAGES.hero}" alt="" width="1280" height="853" loading="eager">
      </div>
    </div>
    <div class="hero__info">
      <div class="hero__info-block">
        <h3>Adress</h3>
        <p><a href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">${SITE.address}</a></p>
      </div>
      <div class="hero__info-block">
        <h3>Opening Hours</h3>
        <p>${SITE.hours.join("<br>")}</p>
      </div>
      <div class="hero__info-block">
        <h3>Contact</h3>
        <p><a href="${SITE.phoneHref}">${SITE.phone}</a><br><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </div>
    </div>
  </div>
</section>`;
}

export function renderPageHero(title, imageSrc) {
  return `<section class="page-hero">
  <div class="page-hero__bg">
    <img src="${imageSrc}" alt="" loading="eager">
    <div class="page-hero__overlay"></div>
  </div>
  <div class="container page-hero__content">
    <h1>${title}</h1>
    <p class="page-tagline">${SITE.tagline}</p>
  </div>
</section>`;
}
