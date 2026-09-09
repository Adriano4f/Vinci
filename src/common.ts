/*
 * common.ts — shared behavior used on every page.
 * Compiled to js/common.js and loaded by all HTML pages.
 *
 * Responsibilities:
 *   1. Mobile navigation toggle (hamburger menu).
 *   2. Marks the current page's link in the navbar.
 *   3. Fills the footer year automatically.
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

  // --- 2. Highlight the link of the page we are on --------------------------
  // Compares the file name in the URL (e.g. "contact.html") with each link.
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll<HTMLAnchorElement>(".nav-links a").forEach((link) => {
    const linkFile = link.getAttribute("href")?.split("/").pop();
    if (linkFile === currentFile) {
      link.classList.add("active");
    }
  });

  // --- 3. Footer year -------------------------------------------------------
  // Any element with data-year gets the current year, so the footer never
  // needs to be edited by hand.
  document.querySelectorAll<HTMLElement>("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
