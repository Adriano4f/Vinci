"use strict";
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
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-links");
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }
    // --- 2. Highlight the link of the page we are on --------------------------
    // Compares the file name in the URL (e.g. "contact.html") with each link.
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((link) => {
        var _a;
        const linkFile = (_a = link.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.split("/").pop();
        if (linkFile === currentFile) {
            link.classList.add("active");
        }
    });
    // --- 3. Footer year -------------------------------------------------------
    // Any element with data-year gets the current year, so the footer never
    // needs to be edited by hand.
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });
})();
//# sourceMappingURL=common.js.map