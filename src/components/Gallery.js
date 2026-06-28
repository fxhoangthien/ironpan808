import { GALLERY_IMAGES, IMAGES } from "../data/images.js";

export function renderGalleryCarousel(images = IMAGES.homeCarousel) {
  const slides = images
    .map(
      (src, i) =>
        `<div class="gallery-carousel__slide" role="group" aria-label="${i + 1} of ${images.length}">
  <img src="${src}" alt="" loading="${i === 0 ? "eager" : "lazy"}">
</div>`,
    )
    .join("");

  const dots = images
    .map(
      (_, i) =>
        `<button type="button" class="gallery-carousel__dot${i === 0 ? " is-active" : ""}" aria-label="Go to slide ${i + 1}" data-slide="${i}"></button>`,
    )
    .join("");

  return `<section class="section">
  <div class="container">
    <h2>Galleries</h2>
    <p class="section__subtitle">Our Space</p>
    <div class="gallery-carousel" data-carousel>
      <div class="gallery-carousel__track">${slides}</div>
      <div class="gallery-carousel__dots">${dots}</div>
    </div>
  </div>
</section>`;
}

export function renderGalleryGrid(images = GALLERY_IMAGES) {
  const items = images
    .map(
      (src, i) =>
        `<button type="button" class="gallery-grid__item" data-lightbox="${src}" aria-label="View gallery image ${i + 1}">
  <img src="${src}" alt="" loading="lazy">
</button>`,
    )
    .join("");

  return `<section class="section section--cream">
  <div class="container">
    <div class="gallery-grid">${items}</div>
  </div>
  <div class="lightbox" id="lightbox" aria-hidden="true">
    <button type="button" class="lightbox__close" aria-label="Close">&times;</button>
    <img src="" alt="">
  </div>
</section>`;
}

export function renderGalleryPage() {
  return `<section class="section">
  <div class="container">
    <h1 class="sr-only">Gallery</h1>
  </div>
</section>${renderGalleryGrid()}`;
}
