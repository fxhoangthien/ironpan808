import { SITE } from "../data/site.js";

export function renderContactSection() {
  return `<section class="section section--cream">
  <div class="container contact-grid">
    <div class="contact-card">
      <h1 class="sr-only">Contact Us</h1>
      <h3>Contact</h3>
      <ul>
        <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
        <li>${SITE.address}</li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      </ul>
      <h3>Business Hours</h3>
      <ul>
        ${SITE.hours.map((h) => `<li>${h}</li>`).join("")}
      </ul>
      <h2>Social</h2>
      <div class="contact-social">
        <a href="${SITE.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="${SITE.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="${SITE.social.yelp}" target="_blank" rel="noopener noreferrer">Yelp</a>
      </div>
    </div>
    <div class="contact-map">
      <iframe src="${SITE.mapsEmbed}" title="IRON PAN map" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>`;
}
