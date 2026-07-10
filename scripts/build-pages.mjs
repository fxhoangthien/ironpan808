import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderNavbar } from "../src/components/Navbar.js";
import { renderFooter } from "../src/components/Footer.js";
import { renderCallModal } from "../src/components/CallModal.js";
import { renderWelcomePopup } from "../src/components/WelcomePopup.js";
import { renderHero, renderPageHero } from "../src/components/Hero.js";
import { renderHomeMenuPreview, renderMenuSection } from "../src/components/MenuSection.js";
import { renderGalleryCarousel, renderGalleryGrid } from "../src/components/Gallery.js";
import {
  renderHomeFeatures,
  renderAboutStory,
  renderAboutExperience,
  renderHomeAbout,
} from "../src/components/About.js";
import { renderContactSection } from "../src/components/Contact.js";
import { PAGE_META, SITE } from "../src/data/site.js";
import { FAVICON, IMAGES, LOGO } from "../src/data/images.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = join(root, "src", "pages");
mkdirSync(pagesDir, { recursive: true });

function renderQrPage() {
  return `<main class="qr-page">
  <img class="qr-page__logo" src="${LOGO}" alt="${SITE.tagline}" width="280" height="119">
  <h1>CHECK IN HERE!</h1>
  <p>Your feedback is highly appreciated and responses help us to serve you better.</p>
  <div class="qr-page__actions">
    <a href="menu.html" class="btn btn--primary">View Menu</a>
    <a href="contact-us.html" class="btn btn--outline">Feedback</a>
  </div>
  <div class="qr-page__links">
    <a href="${SITE.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook-f</a>
    <a href="${SITE.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
    <a href="${SITE.social.yelp}" target="_blank" rel="noopener noreferrer">Yelp</a>
    <a href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">Map-marked-alt</a>
  </div>
  <p>Leave Us a Review in One-Click!</p>
  <div class="qr-page__links">
    <a href="${SITE.mapsUrl}" target="_blank" rel="noopener noreferrer">Google Map</a>
    <a href="${SITE.social.yelp}" target="_blank" rel="noopener noreferrer">Yelp</a>
  </div>
  <p>Had a bad experience?</p>
  <a href="contact-us.html" class="btn btn--outline">Contact Us Directly</a>
  <p>We are sorry to hear you had a sad experience, but we really appreciate you bringing this issue to our attention</p>
  <div class="qr-page__contact">
    <h2>CONTACT</h2>
    <p><a href="${SITE.phoneHref}">${SITE.phone}</a><br>${SITE.address}</p>
    <p>FEEDBACK FORM</p>
    <p>Copyright © 2026 IRON PAN<br>- By<br>Mac Marketing</p>
  </div>
</main>`;
}

function pageShell({ title, description, slug, body, scripts = "../js/main.js" }) {
  const canonical = slug === "home" ? "https://ironpan808.com/" : `https://ironpan808.com/${slug}`;

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${LOGO.replace("../assets/", "https://ironpan808.com/wp-content/uploads/2026/05/")}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${FAVICON}" sizes="32x32">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles/main.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "IRON PAN",
    "description": "${description.replace(/"/g, '\\"')}",
    "url": "https://ironpan808.com",
    "telephone": "${SITE.phone}",
    "email": "${SITE.email}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2334 S King St #101",
      "addressLocality": "Honolulu",
      "addressRegion": "HI",
      "postalCode": "96826"
    },
    "servesCuisine": "Vietnamese"
  }
  </script>
</head>
<body data-page="${slug}">
  ${renderNavbar(slug === "home" ? "home" : slug)}
  ${body}
  ${slug === "qr-code" ? "" : renderFooter()}
  ${renderCallModal()}
  ${renderWelcomePopup()}
  <script type="module" src="${scripts}"></script>
</body>
</html>`;
}

const pages = [
  {
    file: "index.html",
    slug: "home",
    meta: PAGE_META.home,
    body: `${renderHero()}${renderHomeFeatures()}${renderHomeMenuPreview()}${renderHomeAbout()}${renderGalleryCarousel()}`,
  },
  {
    file: "about-us.html",
    slug: "about-us",
    meta: PAGE_META["about-us"],
    body: `${renderPageHero("About us", IMAGES.heroAbout)}${renderAboutStory()}${renderAboutExperience()}`,
  },
  {
    file: "menu.html",
    slug: "menu",
    meta: PAGE_META.menu,
    body: `${renderPageHero("Menu", IMAGES.heroMenu)}${renderMenuSection()}`,
  },
  {
    file: "gallery.html",
    slug: "gallery",
    meta: PAGE_META.gallery,
    body: `${renderPageHero("Gallery", IMAGES.heroGallery)}${renderGalleryGrid()}`,
    scripts: "../js/main.js",
  },
  {
    file: "contact-us.html",
    slug: "contact-us",
    meta: PAGE_META["contact-us"],
    body: `${renderPageHero("Contact Us", IMAGES.heroContact)}${renderContactSection()}`,
  },
  {
    file: "qr-code.html",
    slug: "qr-code",
    meta: PAGE_META["qr-code"],
    body: renderQrPage(),
  },
];

for (const page of pages) {
  const html = pageShell({
    title: page.meta.title,
    description: page.meta.description,
    slug: page.slug,
    body: page.body,
    scripts: page.scripts,
  });
  writeFileSync(join(pagesDir, page.file), html, "utf-8");
  console.log(`Generated ${page.file}`);
}

console.log(`Done — ${pages.length} pages written to src/pages/`);
