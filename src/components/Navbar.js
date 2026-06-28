import { NAV_LINKS, SITE } from "../data/site.js";
import { LOGO } from "../data/images.js";

const iconMenu = `<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/></svg>`;

export function renderNavbar(activeSlug = "home") {
  const links = NAV_LINKS.map(
    (link) =>
      `<a href="${link.href}" class="site-nav__link${link.slug === activeSlug ? " is-active" : ""}">${link.label}</a>`,
  ).join("");

  return `<header class="site-header" id="site-header">
  <div class="container site-header__inner">
    <a href="index.html" class="site-header__logo">
      <img src="${LOGO}" alt="${SITE.tagline}" width="180" height="77" fetchpriority="high">
    </a>
    <button class="site-header__toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
      ${iconMenu}
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main navigation">${links}</nav>
    <div class="site-header__actions">
      <a href="${SITE.orderHref}" class="btn btn--primary site-header__order">Order Now</a>
    </div>
  </div>
</header>`;
}
