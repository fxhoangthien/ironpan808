import { HOME_MENU_PREVIEW, FULL_MENU } from "../data/menu.js";
import { IMAGES } from "../data/images.js";

function renderMenuItem(item) {
  const desc = item.description
    ? `<p class="menu-item__description">${item.description}</p>`
    : "";
  return `<article class="menu-item">
  <div class="menu-item__head">
    <span class="menu-item__name">${item.name}</span>
    <span class="menu-item__price">${item.price}</span>
  </div>
  ${desc}
</article>`;
}

function renderCategoryImages(imageKey) {
  if (!imageKey || !IMAGES[imageKey]) return "";
  const imgs = IMAGES[imageKey]
    .map((src) => `<img src="${src}" alt="" loading="lazy" width="180" height="180">`)
    .join("");
  return `<div class="menu-category__images">${imgs}</div>`;
}

export function renderMenuSection(categories = FULL_MENU, options = {}) {
  const { showImages = true, preview = false } = options;

  const html = categories
    .map((cat) => {
      const desc = cat.description
        ? `<p class="menu-category__description">${cat.description}</p>`
        : "";
      const images = showImages ? renderCategoryImages(cat.images) : "";
      const items = cat.items.map(renderMenuItem).join("");

      return `<section class="menu-category" id="${cat.id}">
  <div class="menu-category__head">
    <span class="menu-category__name">${cat.name}</span>
    ${desc}
  </div>
  ${images}
  <div class="menu-category__list">${items}</div>
</section>`;
    })
    .join("");

  const cta = preview
    ? `<div class="menu-preview-cta"><a href="menu.html" class="btn btn--primary">View More</a></div>`
    : "";

  return `<section class="section section--cream">
  <div class="container menu-section">
    ${preview ? "<h2>Our Menu</h2>" : ""}
    ${html}
    ${cta}
  </div>
</section>`;
}

export function renderHomeMenuPreview() {
  return renderMenuSection(
    [
      {
        id: "banh-mi-collection",
        name: HOME_MENU_PREVIEW.name,
        description: HOME_MENU_PREVIEW.description,
        items: HOME_MENU_PREVIEW.items,
      },
    ],
    { showImages: false, preview: true },
  );
}
