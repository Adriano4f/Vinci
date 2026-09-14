"use strict";
/* tutorias-pages.ts — behavior shared by the two tutor subpages of the
 * NEXUM ACADEMY demo:
 *   - examples/tutorias-tutores.html  (directory, filter by subject)
 *   - examples/tutorias-tutor.html    (single profile + booking, ?t=<slug>)
 *
 * Both read the static catalog declared in src/tutors-data.ts. That file is
 * loaded by an earlier <script>, and because tsconfig sets `module: "none"`
 * every compiled file shares one global scope, so `NEXUM_TUTORS` and the
 * `NxTutor` type resolve here with no import statement.
 *
 * The whole file is wrapped in an IIFE (immediately invoked function
 * expression): every `const` inside is function-scoped, so nothing leaks
 * into the global object and no name can collide with tutorias.js.
 */
(() => {
    var _a, _b, _c;
    // document.querySelector returns Element | null. The generic parameter
    // <T extends Element> narrows the static type of the result; it performs
    // no runtime check, it only tells the checker what to expect.
    const $ = (sel) => document.querySelector(sel);
    // --- 1. Shared chrome: theme, mobile menu, year, reveal ------------------------
    // localStorage may throw (private mode, blocked storage), so every access
    // is wrapped: a failure degrades to "no persisted preference" instead of
    // aborting the script.
    const readTheme = () => {
        try {
            return localStorage.getItem("nexum-theme");
        }
        catch (_a) {
            return null;
        }
    };
    const writeTheme = (v) => {
        try {
            localStorage.setItem("nexum-theme", v);
        }
        catch ( /* storage blocked */_a) { /* storage blocked */ }
    };
    const themeBtn = $("#nx-theme");
    const applyTheme = (t) => {
        // setAttribute on <html> drives the [data-theme="dark"] CSS rules.
        document.documentElement.setAttribute("data-theme", t);
        if (themeBtn)
            themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
    };
    applyTheme((_a = readTheme()) !== null && _a !== void 0 ? _a : "light");
    themeBtn === null || themeBtn === void 0 ? void 0 : themeBtn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        writeTheme(next);
    });
    const toggle = $("#nx-toggle");
    const links = $("#nx-links");
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener("click", () => {
        var _a;
        // classList.toggle returns the resulting presence of the class, which is
        // exactly the boolean aria-expanded must mirror.
        const open = (_a = links === null || links === void 0 ? void 0 : links.classList.toggle("open")) !== null && _a !== void 0 ? _a : false;
        toggle.setAttribute("aria-expanded", String(open));
    });
    links === null || links === void 0 ? void 0 : links.addEventListener("click", (e) => {
        // Event delegation: one listener on the container inspects the actual
        // target. closest("a") walks up from the clicked node to the nearest
        // ancestor matching the selector (or the node itself), or null.
        if (e.target.closest("a")) {
            links.classList.remove("open");
            toggle === null || toggle === void 0 ? void 0 : toggle.setAttribute("aria-expanded", "false");
        }
    });
    const yearEl = $("#nx-year");
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
    // IntersectionObserver fires its callback when an observed element crosses
    // a visibility threshold relative to the viewport. threshold 0.12 means
    // "at least 12% of the box is visible".
    const reveal = () => {
        const items = document.querySelectorAll(".nx-reveal:not(.visible)");
        if (!("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("visible"));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("visible");
                    io.unobserve(en.target); // one-shot animation
                }
            });
        }, { threshold: 0.12 });
        items.forEach((el) => io.observe(el));
    };
    // Escape any text that is interpolated into innerHTML. Tutor data is ours,
    // but the URL parameter is not, and building markup from unescaped input
    // is how HTML injection happens.
    const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
    const card = (t) => `
    <div class="nx-card nx-tutor nx-reveal" data-subjects="${esc(t.subjects.join("|"))}">
      <img src="${t.img}" alt="Foto de ${esc(t.name)}" />
      <h3>${esc(t.name)}</h3>
      <div class="spec">${esc(t.spec)}</div>
      <div class="meta">${t.years} años de experiencia · ${esc(t.level)}<br/>
        <span class="nx-stars">${stars(t.rating)}</span> ${t.rating} · ${t.students} estudiantes</div>
      <p class="nx-tutor-bio">${esc(t.bio)}</p>
      <div class="nx-tutor-actions">
        <a class="nx-btn nx-btn-ghost nx-btn-sm" href="tutorias-tutor.html?t=${encodeURIComponent(t.slug)}">Ver perfil</a>
        <a class="nx-btn nx-btn-primary nx-btn-sm" href="tutorias-tutor.html?t=${encodeURIComponent(t.slug)}#reservar">Reservar</a>
      </div>
    </div>`;
    // --- 2. Directory page ----------------------------------------------------------
    const dirGrid = $("#nx-dir-grid");
    if (dirGrid) {
        // A Set holds unique values; flatMap maps each tutor to its subject array
        // and flattens one level. Array.from turns the Set back into an array so
        // it can be sorted and mapped.
        const subjects = Array.from(new Set(NEXUM_TUTORS.flatMap((t) => t.subjects))).sort();
        const filterBar = $("#nx-dir-filter");
        if (filterBar) {
            filterBar.innerHTML =
                '<button class="nx-chip active" data-f="">Todas</button>' +
                    subjects.map((s) => `<button class="nx-chip" data-f="${esc(s)}">${esc(s)}</button>`).join("");
        }
        const render = (filter) => {
            const list = filter
                ? NEXUM_TUTORS.filter((t) => t.subjects.includes(filter))
                : NEXUM_TUTORS;
            dirGrid.innerHTML = list.map(card).join("");
            const count = $("#nx-dir-count");
            if (count) {
                count.textContent = `${list.length} ${list.length === 1 ? "tutor" : "tutores"}` +
                    (filter ? ` de ${filter}` : " disponibles");
            }
            reveal(); // newly created cards must be observed too
        };
        render("");
        filterBar === null || filterBar === void 0 ? void 0 : filterBar.addEventListener("click", (e) => {
            var _a;
            const btn = e.target.closest("button");
            if (!btn)
                return;
            filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            // dataset exposes data-* attributes; data-f becomes dataset.f, a string
            // or undefined, so `?? ""` supplies the "all tutors" case.
            render((_a = btn.dataset.f) !== null && _a !== void 0 ? _a : "");
        });
    }
    // --- 3. Profile page ------------------------------------------------------------
    const profile = $("#nx-profile");
    if (profile) {
        // URLSearchParams parses the query string; .get returns the decoded value
        // or null when the key is absent.
        const slug = (_b = new URLSearchParams(window.location.search).get("t")) !== null && _b !== void 0 ? _b : "";
        const tutor = NEXUM_TUTORS.find((t) => t.slug === slug);
        if (!tutor) {
            profile.innerHTML = `
        <div class="nx-card" style="text-align:center">
          <h2>Tutor no encontrado</h2>
          <p>Ese perfil no existe o el enlace está incompleto.</p>
          <a class="nx-btn nx-btn-primary" href="tutorias-tutores.html">Ver todos los tutores</a>
        </div>`;
            const bookSection = $("#reservar");
            if (bookSection)
                bookSection.hidden = true;
        }
        else {
            document.title = `${tutor.name} | NEXUM ACADEMY`;
            profile.innerHTML = `
        <div class="nx-profile-head">
          <img src="${tutor.img}" alt="Foto de ${esc(tutor.name)}" />
          <div>
            <span class="nx-kicker">${esc(tutor.spec)}</span>
            <h1>${esc(tutor.name)}</h1>
            <div class="nx-profile-meta">
              <span><span class="nx-stars">${stars(tutor.rating)}</span> ${tutor.rating}</span>
              <span>${tutor.students} estudiantes atendidos</span>
              <span>${tutor.years} años de experiencia</span>
            </div>
            <p class="lead">${esc(tutor.bioLong)}</p>
            <div class="nx-hero-actions">
              <a class="nx-btn nx-btn-primary" href="#reservar">Reservar con ${esc(tutor.name.split(" ")[0])}</a>
              <a class="nx-btn nx-btn-ghost" href="tutorias-tutores.html">Ver otros tutores</a>
            </div>
          </div>
        </div>
        <div class="nx-grid nx-grid-3 nx-profile-facts">
          <div class="nx-card nx-reveal">
            <h3>Materias</h3>
            <ul class="nx-tags">${tutor.subjects.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          </div>
          <div class="nx-card nx-reveal">
            <h3>Nivel que atiende</h3>
            <p>${esc(tutor.level)}</p>
          </div>
          <div class="nx-card nx-reveal">
            <h3>Disponibilidad</h3>
            <p>${esc(tutor.hours)}</p>
          </div>
        </div>`;
            // --- 4. Booking with the tutor already fixed --------------------------------
            const nameSlot = $("#bp-tutor-name");
            if (nameSlot)
                nameSlot.textContent = tutor.name;
            const subjSel = $("#bp-subject");
            if (subjSel) {
                // Only the subjects this tutor teaches: the whole point of booking
                // from the profile is not re-asking what the page already knows.
                subjSel.innerHTML = tutor.subjects.map((s) => `<option>${esc(s)}</option>`).join("");
            }
            const PRICE_PER_MIN = 500 / 60;
            const PLAN_PRICE = { basico: 1800, intensivo: 3200, examen: 4500 };
            const PLAN_NAME = {
                individual: "Sesión individual",
                basico: "Plan Básico · 4 tutorías",
                intensivo: "Plan Intensivo · 8 tutorías",
                examen: "Preparación de examen · 10 tutorías",
            };
            const val = (id) => { var _a, _b; return (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ""; };
            const price = () => {
                const plan = val("bp-plan");
                // `in` tests own and inherited property keys of the object, so it
                // distinguishes a package (flat price) from the single session.
                if (plan in PLAN_PRICE)
                    return PLAN_PRICE[plan];
                const dur = Number(val("bp-duration"));
                if (!dur)
                    return null;
                let p = dur * PRICE_PER_MIN;
                if (val("bp-mode") === "Presencial")
                    p *= 1.1;
                return Math.round(p / 10) * 10;
            };
            const sync = () => {
                var _a;
                const set = (id, v) => {
                    const el = document.getElementById(id);
                    if (el)
                        el.textContent = v || "—";
                };
                set("bps-tutor", tutor.name);
                set("bps-plan", (_a = PLAN_NAME[val("bp-plan")]) !== null && _a !== void 0 ? _a : "");
                set("bps-subject", val("bp-subject"));
                set("bps-mode", val("bp-mode"));
                const d = val("bp-duration");
                set("bps-duration", d ? `${d} minutos` : "");
                set("bps-date", val("bp-date"));
                set("bps-time", val("bp-time"));
                const p = price();
                set("bps-price", p ? `RD$${p.toLocaleString("es-DO")}` : "");
            };
            const form = $("#nx-bp-form");
            form === null || form === void 0 ? void 0 : form.addEventListener("input", sync);
            form === null || form === void 0 ? void 0 : form.addEventListener("change", sync);
            // Preselect the plan when arriving from a pricing card
            // (tutorias-tutor.html?t=slug&plan=basico).
            const planParam = new URLSearchParams(window.location.search).get("plan");
            const planSel = $("#bp-plan");
            if (planSel && planParam && (planParam === "individual" || planParam in PLAN_PRICE)) {
                planSel.value = planParam;
            }
            // Minimum date = tomorrow, computed from LOCAL components. Using
            // toISOString() would shift to UTC and, in UTC−4 evenings, skip a day.
            const dateInput = document.getElementById("bp-date");
            let minDate = "";
            if (dateInput) {
                const t = new Date();
                t.setDate(t.getDate() + 1);
                const pad = (n) => String(n).padStart(2, "0");
                minDate = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
                dateInput.min = minDate;
            }
            sync();
            const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            const PHONE_RE = /^[+()0-9][0-9()\-\s]{6,}$/;
            const err = (id, msg) => {
                const slot = document.querySelector(`[data-err="${id}"]`);
                const field = document.getElementById(id);
                if (slot)
                    slot.textContent = msg;
                if (field)
                    field.classList.toggle("invalid", msg !== "");
            };
            form === null || form === void 0 ? void 0 : form.addEventListener("input", (e) => {
                const id = e.target.id;
                if (id)
                    err(id, "");
            });
            form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
                var _a;
                e.preventDefault(); // no navigation: this demo has no server
                let ok = true;
                const req = (id, msg) => {
                    if (!val(id)) {
                        err(id, msg);
                        ok = false;
                    }
                };
                req("bp-plan", "Elige un plan.");
                req("bp-mode", "Elige la modalidad.");
                req("bp-duration", "Elige la duración.");
                req("bp-date", "Elige una fecha.");
                // ISO-8601 date strings sort lexicographically in chronological
                // order, so a plain < comparison is a valid date comparison here.
                if (val("bp-date") && minDate && val("bp-date") < minDate) {
                    err("bp-date", "Elige una fecha futura.");
                    ok = false;
                }
                req("bp-time", "Elige una hora.");
                if (val("bp-name").length < 2) {
                    err("bp-name", "Escribe tu nombre.");
                    ok = false;
                }
                if (val("bp-last").length < 2) {
                    err("bp-last", "Escribe tu apellido.");
                    ok = false;
                }
                if (!EMAIL_RE.test(val("bp-email"))) {
                    err("bp-email", "Ese correo no parece correcto.");
                    ok = false;
                }
                if (val("bp-phone") && !PHONE_RE.test(val("bp-phone"))) {
                    err("bp-phone", "Ese número no parece correcto.");
                    ok = false;
                }
                req("bp-level", "Elige tu nivel académico.");
                req("bp-topic", "Cuéntanos qué tema necesitas.");
                if (!ok)
                    return;
                form.hidden = true;
                (_a = document.querySelector(".nx-summary")) === null || _a === void 0 ? void 0 : _a.setAttribute("hidden", "");
                const okCard = $("#bp-success");
                const detail = $("#bp-success-detail");
                if (detail) {
                    const p = price();
                    detail.textContent =
                        `${val("bp-subject")} con ${tutor.name} · ${val("bp-date")} a las ${val("bp-time")}` +
                            (p ? ` · RD$${p.toLocaleString("es-DO")}` : "");
                }
                if (okCard) {
                    okCard.hidden = false;
                    okCard.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
            (_c = $("#bp-again")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
                var _a;
                form === null || form === void 0 ? void 0 : form.reset();
                sync();
                if (form)
                    form.hidden = false;
                (_a = document.querySelector(".nx-summary")) === null || _a === void 0 ? void 0 : _a.removeAttribute("hidden");
                const okCard = $("#bp-success");
                if (okCard)
                    okCard.hidden = true;
            });
        }
    }
    reveal();
})();
//# sourceMappingURL=tutorias-pages.js.map