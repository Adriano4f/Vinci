/*
 * event.ts — interactions for the "Nexus Summit" event demo
 * (examples/event.html). Compiled to js/event.js.
 *
 * What it does:
 *   - agenda filters (Todos / Conferencias / Talleres / Networking)
 *   - countdown display (fixed values — fictional demo)
 *   - participants row with scroll arrows
 *   - FAQ accordion
 *   - sticky header state, mobile nav, scroll-spy, reveal on scroll
 *
 * TYPE NOTES (what the spec actually says):
 *   - `interface ScheduleItem` — structural type, erased at compile. The
 *     `type:` field uses a UNION OF STRING LITERALS: only those four exact
 *     strings type-check — the checker rejects any other literal.
 *   - `Array.from(nodeList)` — converts a NodeList into a real Array so
 *     Array methods like .map/.filter are available on it.
 *   - `Record<string, HTMLElement | null>` — object type: keys are strings,
 *     each value is an element or null.
 *   - `a.getAttribute("href")?.slice(1)` — optional chaining around a
 *     possibly-null attribute; `?? ""` supplies the fallback.
 *   - `new Set(iterable)` — deduplicated unordered collection; `.has(x)`
 *     is the membership test.
 */

// Fixed countdown values for this fictional demo event.
// A plain object literal: keys map to string values.
const COUNTDOWN = { days: "676", hours: "07", minutes: "06", seconds: "07" };

// Structural type for an agenda row. `type` is a union of string literals —
// TS rejects any value not in the list at compile time.
interface ScheduleItem {
  time: string;
  title: string;
  where: string;
  type: "conferencia" | "taller" | "networking" | "general";
}

// `ScheduleItem[]` = array whose elements must match that shape.
const SCHEDULE: ScheduleItem[] = [
  { time: "09:00", title: "Registro y bienvenida", where: "Salón Principal · Apertura", type: "general" },
  { time: "10:00", title: "Inteligencia Artificial en la vida real", where: "Juan Pérez · Conferencia", type: "conferencia" },
  { time: "11:30", title: "Desarrollo de aplicaciones web", where: "María Gómez · Taller", type: "taller" },
  { time: "13:00", title: "Receso", where: "Área de alimentos", type: "general" },
  { time: "14:00", title: "Ciberseguridad: un mundo más seguro", where: "Carlos Ramírez · Conferencia", type: "conferencia" },
  { time: "16:00", title: "Panel: El futuro del trabajo", where: "Moderadora: Laura Torres · Panel", type: "networking" },
];

// Inline object type: `{ q: string; a: string }[]` — array of objects with
// a question string and answer string. No named interface needed for data
// this small.
const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuándo y dónde será el evento?",
    a: "Del 17 al 19 de julio de 2028 en el Instituto Politécnico Loyola, San Cristóbal, RD. Puertas abiertas de 8:00 a.m. a 6:00 p.m. cada día.",
  },
  {
    q: "¿La entrada tiene algún costo?",
    a: "Sí. La entrada general cuesta RD$2,500 y la experiencia VIP RD$4,500. Ambas incluyen acceso a todas las conferencias.",
  },
  {
    q: "¿Necesito registrarme?",
    a: "Sí, el cupo es limitado. Regístrate con el botón «Reservar mi lugar» y recibirás tu confirmación por correo o WhatsApp.",
  },
  {
    q: "¿Qué incluye la entrada?",
    a: "Acceso al evento, todas las conferencias, talleres y la zona de networking. La VIP suma zona exclusiva y meet & greet con los ponentes.",
  },
  {
    q: "¿Puedo cancelar mi registro?",
    a: "Sí. Escríbenos por WhatsApp o correo hasta una semana antes del evento y gestionamos la cancelación o el cambio de nombre.",
  },
];

// IIFE — wraps all top-level names so they stay private to this file.
(() => {
  // This script is shared by all pages but only runs on the event demo:
  // early return when the marker attribute isn't present.
  if (!document.querySelector("[data-event-page]")) return;

  // --- Agenda timeline ----------------------------------------------------

  const agenda = document.querySelector<HTMLElement>("[data-agenda]");
  if (agenda) {
    // .map builds one HTML string per item; .join("") concatenates them.
    // Assigning innerHTML parses the string into real DOM nodes — the whole
    // list is replaced in a single DOM operation.
    agenda.innerHTML = SCHEDULE.map(
      (item) => `
      <li class="agenda-item reveal" data-type="${item.type}">
        <span class="agenda-time">${item.time}</span>
        <span class="agenda-dot" aria-hidden="true"></span>
        <div class="agenda-body">
          <h3>${item.title}</h3>
          <p>${item.where}</p>
        </div>
      </li>`
    ).join("");
  }

  // Array.from() materializes the NodeList into an Array so the filter
  // buttons can be re-iterated inside each click handler (NodeList.forEach
  // exists, but Array.from is the general conversion tool).
  const agendaFilters = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-agenda-filter]")
  );
  agendaFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      agendaFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.agendaFilter ?? "todos";
      // Show only items whose data-type matches; hidden=true ↔ display:none.
      document
        .querySelectorAll<HTMLElement>(".agenda-item")
        .forEach((item) => {
          const type = item.dataset.type ?? "";
          item.hidden = filter !== "todos" && type !== filter;
        });
    });
  });

  // --- Countdown -----------------------------------------------------------

  // `units` is a lookup table: key → element or null. Filled by forEach.
  const units: Record<string, HTMLElement | null> = {};
  ["days", "hours", "minutes", "seconds"].forEach((u) => {
    units[u] = document.querySelector<HTMLElement>(`[data-count="${u}"]`);
  });
  if (units.days) units.days.textContent = COUNTDOWN.days;
  if (units.hours) units.hours.textContent = COUNTDOWN.hours;
  if (units.minutes) units.minutes.textContent = COUNTDOWN.minutes;
  if (units.seconds) units.seconds.textContent = COUNTDOWN.seconds;

  // --- Participants arrows --------------------------------------------------

  const track = document.querySelector<HTMLElement>("[data-people-track]");
  document.querySelectorAll<HTMLButtonElement>("[data-people-nav]").forEach(
    (btn) => {
      btn.addEventListener("click", () => {
        if (!track) return;
        // `dir` is 1 or -1 depending on which arrow was clicked.
        const dir = btn.dataset.peopleNav === "next" ? 1 : -1;
        // scrollBy scrolls the element by a relative amount; left = pixels,
        // clientWidth = the track's visible width; behavior animates it.
        track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: "smooth" });
      });
    }
  );

  // --- FAQ accordion ----------------------------------------------------------

  const faqList = document.querySelector<HTMLElement>("[data-faq]");
  if (faqList) {
    // Same map+join render; aria-controls links each button to its answer's id.
    faqList.innerHTML = FAQS.map(
      (f, i) => `
      <div class="faq-item reveal">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${f.q}</span><span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
      </div>`
    ).join("");

    // One listener on the list (event delegation): clicks bubble up from
    // the button; closest() walks from the clicked element to the nearest
    // matching ancestor — returns null when the click was on empty space.
    faqList.addEventListener("click", (event) => {
      const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(".faq-q");
      if (!btn) return;
      const item = btn.closest<HTMLElement>(".faq-item");
      // `item?.` yields undefined on null; `?? false` makes it boolean.
      const open = item?.classList.toggle("open") ?? false;
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // --- Header + mobile nav -------------------------------------------------

  const header = document.querySelector<HTMLElement>(".ev-header");
  // `: void` — declared no return value.
  const onScroll = (): void => {
    // window.scrollY = current vertical scroll offset in px.
    // header?. toggles "scrolled" only when the header element exists.
    header?.classList.toggle("scrolled", window.scrollY > 40);
  };
  // passive:true promises the handler won't call preventDefault, letting the
  // browser scroll without waiting.
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector<HTMLButtonElement>(".ev-nav-toggle");
  const links = document.querySelector<HTMLElement>(".ev-nav-links");
  toggle?.addEventListener("click", () => {
    const open = links?.classList.toggle("open") ?? false;
    toggle.setAttribute("aria-expanded", String(open));
  });
  links?.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).tagName === "A") {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  // Active link underline on scroll (scroll-spy): marks the last section
  // whose top has passed the reading line (40% down the viewport).
  // Sections without a nav entry (countdown, galeria, CTA) keep the
  // nearest previous nav item highlighted; Entradas highlights the
  // "Registrarme" button instead of a text link.
  const navAnchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".ev-nav-links a[href^='#']")
  );
  // `a.getAttribute("href")` → "#agenda" etc.; `?.slice(1)` drops the "#".
  // The Set gives O(1) membership tests for which sections have nav links.
  const navIds = new Set(
    navAnchors.map((a) => a.getAttribute("href")?.slice(1) ?? "")
  );
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("section[id]")
  ).filter((s) => navIds.has(s.id));
  const updateSpy = (): void => {
    // Reading line = 40% down the viewport from the top.
    const line = window.scrollY + window.innerHeight * 0.4;
    let current = sections[0]?.id ?? "";
    sections.forEach((s) => {
      // offsetTop = the element's distance from the top of the page.
      if (s.offsetTop <= line) current = s.id;
    });
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1]?.id ?? current;
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  };
  window.addEventListener("scroll", updateSpy, { passive: true });
  updateSpy();

  // --- Scroll reveal ---------------------------------------------------------

  // IntersectionObserver: the browser calls this callback asynchronously
  // whenever any observed element crosses 12% visibility. Each element
  // gets "in" once and is then unwatched.
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document
    .querySelectorAll<HTMLElement>(".reveal")
    .forEach((el) => revealObserver.observe(el));
})();
