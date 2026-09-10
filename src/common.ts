/*
 * common.ts — shared behavior used on every page.
 * Compiled to js/common.js and loaded by all HTML pages.
 *
 * Responsibilities:
 *   1. Mobile navigation toggle (hamburger menu).
 *   2. "Otros servicios" dropdown (tap-to-expand on mobile).
 *   3. Marks the current page's link in the navbar (data-route attributes).
 *   4. Fills the footer year automatically.
 *   5. Reveal-on-scroll animation for elements with .reveal.
 */

(() => {
  // --- 1. Mobile menu -------------------------------------------------------
  const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
  const menu = document.querySelector<HTMLElement>(".nav-links");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // --- 2. "Otros servicios" dropdown -----------------------------------------
  // Desktop opens it on hover/focus (pure CSS). On mobile there is no hover,
  // so the first tap expands the submenu instead of following the link.
  const dropToggle = document.querySelector<HTMLAnchorElement>(".nav-drop");
  const dropParent = dropToggle?.closest<HTMLElement>(".has-dropdown");
  const mobileQuery = window.matchMedia("(max-width: 640px)");

  if (dropToggle && dropParent) {
    dropToggle.addEventListener("click", (event) => {
      if (mobileQuery.matches) {
        event.preventDefault();
        const isOpen = dropParent.classList.toggle("open");
        dropToggle.setAttribute("aria-expanded", String(isOpen));
      }
    });
  }

  // --- 3. Highlight the link of the page we are on ---------------------------
  // Each top-level nav link carries data-route; the current route is derived
  // from the path so nested service pages still mark "Otros servicios".
  const segments = window.location.pathname.split("/").filter(Boolean);
  let route = "inicio";
  if (segments[0] === "servicios") route = "servicios";
  else if (segments[0] === "templates.html") route = "plantillas";
  else if (segments[0] === "contact.html") route = "contacto";

  document.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((link) => {
    if (link.dataset.route === route) link.classList.add("active");
  });

  // --- 4. Footer year --------------------------------------------------------
  document.querySelectorAll<HTMLElement>("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // --- 5. Reveal on scroll ----------------------------------------------------
  const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
  if (revealEls.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }
})();
