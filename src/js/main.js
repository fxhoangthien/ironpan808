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

function initCallModal() {
  const modal = document.getElementById("call-modal");
  if (!modal) return;

  const feedback = modal.querySelector("[data-copy-feedback]");
  let feedbackTimer;

  const open = () => {
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  };

  const close = () => {
    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
    }
    if (feedback) {
      feedback.hidden = true;
      clearTimeout(feedbackTimer);
    }
  };

  document.querySelectorAll("[data-open-call-modal]").forEach((trigger) => {
    trigger.addEventListener("click", open);
  });

  modal.querySelectorAll("[data-close-call-modal]").forEach((btn) => {
    btn.addEventListener("click", close);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });

  modal.querySelectorAll("[data-copy-phone]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const phone = btn.dataset.phone || "";
      try {
        await navigator.clipboard.writeText(phone);
        if (feedback) {
          feedback.hidden = false;
          clearTimeout(feedbackTimer);
          feedbackTimer = setTimeout(() => {
            feedback.hidden = true;
          }, 2000);
        }
      } catch {
        window.prompt("Copy this number:", phone);
      }
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
initCallModal();
initCarousel();
initLightbox();
