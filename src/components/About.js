import { IMAGES } from "../data/images.js";

const iconSkillet = `<svg viewBox="0 0 512 512" aria-hidden="true"><circle cx="256" cy="256" r="255" fill="#fc9"/><path d="M342.6 176.2c-5.9 28.6-28.2 43.5-40.8 28-16.8-20.6 4.2-39.8 3-66.5-.9-19.4-10.7-34.3-25.5-47.1 7.7 30.2-61.6 31.4-61.6 83 0 0-11.1-18.1-24.9-46.1-44.1 38.7-55.4 96.8-11.5 150.4 37.3 45.4 78.8 43.9 122.6-2.1 29.4-30.8 36.8-75.3 24.9-132z" fill="#db0000"/></svg>`;

const iconVeggies = `<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="#6DCC00" d="M257 197c-.5 7.7-2.7 15.2-6.5 22-4.6 8.3-11.6 15.4-20.5 20.2-23.1 7.3-48.9-2.6-60.9-24.7-5-25.6-2.7-69.1-1.1-90.5.4-6 6.9-9.5 12.2-6.6 20.7 11.5 64.4 37 80.3 56 1.6 2 3 3.9 4 5.7 1.7 3.2 3.6 12.9 3 22.3z"/><path fill="#FEC007" d="M345 345H45c0-11.3 2-22.3 5.6-32.7 17.8-50.5 75.7-87.6 144.5-87.6s126.7 37 144.5 87.6c2 10.4 3.3 21.4 3.3 32.7z"/></svg>`;

const iconCoffee = `<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="#f5e6d3" d="M136 208v166H376V208H136z"/><path fill="#49190c" d="M112 386h264v101H112z"/><path fill="#290d07" d="M135 86H377v233H135z"/></svg>`;

export function renderHomeFeatures() {
  const features = [
    {
      icon: iconSkillet,
      title: "SIZZLING SKILLETS MADE WITH CARE",
      text: "Every sizzling skillet is prepared with tradition, care, and the little details that make every meal memorable.",
    },
    {
      icon: iconVeggies,
      title: "FRESH INGREDIENTS EVERY DAY",
      text: "From crisp vegetables to warm artisan bread, we carefully prepare every ingredient for freshness and flavor",
    },
    {
      icon: iconCoffee,
      title: "COMFORTING FLAVORS & WARM HOSPITALITY",
      text: "More than great food, we create a welcoming experience where every guest feels like family.",
    },
  ];

  const cards = features
    .map(
      (f) => `<article class="feature-card">
  <div class="feature-card__icon">${f.icon}</div>
  <h3>${f.title}</h3>
  <p>${f.text}</p>
</article>`,
    )
    .join("");

  return `<section class="section section--cream">
  <div class="container">
    <div class="features">${cards}</div>
  </div>
</section>`;
}

export function renderAboutStory() {
  return `<section class="section">
  <div class="container about-split">
    <div>
      <h1>WELCOME TO IRON PAN!</h1>
      <p class="about-split__text">IRON PAN was created from a simple belief — some of the best memories begin around a hot pan and a warm loaf of bread. Inspired by the comforting flavors many of us grew up with in Vietnam and blended with the relaxed island spirit of Honolulu, we wanted to create a place that feels both familiar and exciting. Every sizzling skillet that leaves our kitchen carries more than ingredients; it carries tradition, care, and the little details that make a meal special. From freshly prepared vegetables and handcrafted flavors to the sound and aroma of food arriving at your table, we want every visit to feel personal — like sharing a meal with people who genuinely care. Whether you stop by for a quick lunch, a morning coffee, or a slow weekend gathering with family and friends, IRON PAN is our way of bringing people together through comforting food and warm hospitality. Visit us at 2334 South King St Ste 101, Honolulu, HI, and become part of our story.</p>
    </div>
    <div>
      <img src="${IMAGES.heroAbout}" alt="" loading="lazy" style="border-radius:16px;box-shadow:var(--shadow-md)">
    </div>
  </div>
</section>`;
}

export function renderAboutExperience() {
  const steps = [
    {
      num: "1",
      title: "Sizzle",
      text: "Sizzling Signature Pans Hot skillets filled with comforting flavors and served with warm artisan Banh Mi.",
    },
    {
      num: "2",
      title: "Gather",
      text: "Crafted Vietnamese Banh Mi Fresh ingredients, house-made pickles, and flavors worth coming back for.",
    },
    {
      num: "3",
      title: "Enjoy",
      text: "Bold Coffee & Refreshing Drinks Traditional Vietnamese coffee with a modern island twist.",
    },
  ];

  const cards = steps
    .map(
      (s) => `<article class="experience-card">
  <div class="experience-card__number">${s.num}</div>
  <h2>${s.title}</h2>
  <p>${s.text}</p>
</article>`,
    )
    .join("");

  return `<section class="section section--cream">
  <div class="container">
    <h2>THE IRON PAN EXPERIENCE</h2>
    <div class="experience-grid">${cards}</div>
  </div>
</section>`;
}

export function renderHomeAbout() {
  const values = [
    {
      title: "CRAFTED SKILLETS & FRESH FLAVORS",
      text: "Our menu brings together sizzling iron skillets, warm artisan bread, and carefully prepared ingredients inspired by the comforting flavors of Vietnam. Every dish is made fresh to order and served with care",
    },
    {
      title: "A WELCOMING NEIGHBORHOOD EXPERIENCE",
      text: "Stepping into IRON PAN means stepping into a warm and inviting space where friends and family can gather, relax, and enjoy comforting food together. We want every visit to feel familiar, personal, and memorable.",
    },
  ];

  const items = values
    .map(
      (v) => `<article class="about-value">
  <h3>${v.title}</h3>
  <p>${v.text}</p>
</article>`,
    )
    .join("");

  return `<section class="section">
  <div class="container">
    <div class="about-split">
      <div>
        <h2>THE HEART BEHIND EVERY IRON PAN</h2>
        <p class="about-split__text">We believe great food begins with authentic ingredients, meaningful connections, and the comfort of sharing a meal together. Our kitchen combines tradition, care, and warm hospitality to turn everyday dining into something memorable</p>
      </div>
      <div class="about-values">${items}</div>
    </div>
  </div>
</section>`;
}
