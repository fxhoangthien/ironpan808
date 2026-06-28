function initMobileNav() {
  const toggle = document.querySelector(".site-header__toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector(".gallery-carousel__track");
  const dots = carousel.querySelectorAll(".gallery-carousel__dot");
  const slides = carousel.querySelectorAll(".gallery-carousel__slide");
  if (!track || !slides.length) return;

  let index = 0;
  let timer;

  const slidesPerView = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const goTo = (next) => {
    const perView = slidesPerView();
    const maxIndex = Math.max(0, slides.length - perView);
    index = next > maxIndex ? 0 : next < 0 ? maxIndex : next;
    const offset = (100 / perView) * index;
    track.style.transform = `translateX(-${offset}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  const startAutoplay = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 5000);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.slide));
      startAutoplay();
    });
  });

  window.addEventListener("resize", () => goTo(index));
  goTo(0);
  startAutoplay();
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const img = lightbox.querySelector("img");
  const close = lightbox.querySelector(".lightbox__close");

  document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      img.src = trigger.dataset.lightbox;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  const hide = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    img.src = "";
  };

  close?.addEventListener("click", hide);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) hide();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
}

initMobileNav();
initCarousel();
initLightbox();
