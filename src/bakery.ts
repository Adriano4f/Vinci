/* La Miga Dorada demo · shared script for all bakery pages.
   Page behavior is selected via <body data-page="home|menu|nosotros|visitanos|pedido">. */
(() => {
  "use strict";

  interface Product {
    slug: string;
    name: string;
    desc: string;
    price: number;
    cat: string;
    img: string;
    tag?: string;
    out?: boolean;
  }

  const PRODUCTS: Product[] = [
    {
      slug: "masa-madre",
      name: "Pan de masa madre",
      desc: "Fermentado lentamente durante 48 horas.",
      price: 4.0,
      cat: "Panes",
      img: "img/lmd-masamadre.jpg",
    },
    {
      slug: "baguette",
      name: "Baguette rústica",
      desc: "Corteza crujiente y miga ligera.",
      price: 2.0,
      cat: "Panes",
      img: "img/lmd-panes.jpg",
    },
    {
      slug: "integral-semillas",
      name: "Pan integral de semillas",
      desc: "Avena, linaza y girasol tostado.",
      price: 3.5,
      cat: "Panes",
      img: "img/lmd-panes.jpg",
    },
    {
      slug: "croissant",
      name: "Croissant de mantequilla",
      desc: "Hojaldrado, dorado y crujiente.",
      price: 1.5,
      cat: "Bollería",
      img: "img/lmd-croissant.jpg",
      tag: "Más vendido",
    },
    {
      slug: "espiral-canela",
      name: "Espiral de canela",
      desc: "Canela cálida, centro suave y glaseado.",
      price: 2.0,
      cat: "Bollería",
      img: "img/lmd-canela.jpg",
      tag: "Favorito",
    },
    {
      slug: "pain-chocolat",
      name: "Pain au chocolat",
      desc: "Hojaldre con centro de chocolate.",
      price: 2.2,
      cat: "Bollería",
      img: "img/lmd-panchoco.jpg",
      out: true,
    },
    {
      slug: "brownie",
      name: "Brownie de chocolate",
      desc: "Denso, húmedo y con borde crujiente.",
      price: 2.5,
      cat: "Dulces",
      img: "img/lmd-dulces.jpg",
    },
    {
      slug: "galletas-avena",
      name: "Galletas de avena",
      desc: "De las que se comen de a dos.",
      price: 1.2,
      cat: "Dulces",
      img: "img/lmd-dulces.jpg",
    },
    {
      slug: "pan-chocolate",
      name: "Pan de chocolate",
      desc: "Masa suave, chocolate y una corteza ligeramente dorada.",
      price: 2.5,
      cat: "Especiales",
      img: "img/lmd-panchoco.jpg",
      tag: "Nuevo",
    },
    {
      slug: "concha-vainilla",
      name: "Concha de vainilla",
      desc: "Cubierta dulce sobre miga tierna.",
      price: 1.8,
      cat: "Especiales",
      img: "img/lmd-dulces.jpg",
    },
  ];

  const product = (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug);
  const money = (n: number): string => `$${n.toFixed(2)}`;

  /* Called whenever the cart changes; the pedido page hooks in its summary. */
  let orderRefresh: (() => void) | undefined;
  const cartChanged = (): void => {
    updateBadge();
    orderRefresh?.();
  };

  /* ---------- storage (resilient) ---------- */
  const CART_KEY = "lmd-cart";
  const FAV_KEY = "lmd-favs";

  const memStore: Record<string, string> = {};
  const getItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key) ?? memStore[key] ?? null;
    } catch {
      return memStore[key] ?? null;
    }
  };
  const setItem = (key: string, value: string): void => {
    memStore[key] = value;
    try {
      localStorage.setItem(key, value);
    } catch {
      /* in-memory copy already updated */
    }
  };

  const readMap = (key: string): Record<string, number> => {
    try {
      const raw = getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed === "object" && parsed ? (parsed as Record<string, number>) : {};
    } catch {
      return {};
    }
  };

  const getCart = (): Record<string, number> => readMap(CART_KEY);
  const saveCart = (cart: Record<string, number>): void => setItem(CART_KEY, JSON.stringify(cart));

  const getFavs = (): string[] => {
    try {
      return JSON.parse(getItem(FAV_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  };
  const saveFavs = (favs: string[]): void => setItem(FAV_KEY, JSON.stringify(favs));

  const cartCount = (): number =>
    Object.entries(getCart())
      .filter(([slug]) => product(slug))
      .reduce((t, [, q]) => t + q, 0);

  const updateBadge = (): void => {
    document.querySelectorAll<HTMLElement>("[data-cart-count]").forEach((el) => {
      const n = cartCount();
      el.textContent = String(n);
      el.classList.toggle("is-empty", n === 0);
    });
  };
  const bumpBadge = (): void => {
    const badge = document.querySelector<HTMLElement>("[data-cart-count]");
    if (!badge) return;
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  };

  /* ---------- cart drawer ---------- */
  const buildCart = (): void => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="lmd-cart-overlay" data-cart-close></div>
      <aside class="lmd-cart" aria-label="Carrito">
        <header class="lmd-cart-head">
          <h3>Tu pedido</h3>
          <button class="lmd-icon-btn" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>
        </header>
        <ul class="lmd-cart-list" data-cart-list></ul>
        <footer class="lmd-cart-foot" data-cart-foot>
          <div class="lmd-cart-total"><span>Total</span><strong data-cart-total>$0.00</strong></div>
          <a class="lmd-btn lmd-btn-primary lmd-btn-block" href="bakery-pedido.html">Finalizar pedido</a>
          <p class="lmd-cart-note">Recoges en el puesto #4.</p>
        </footer>
      </aside>`;
    document.body.appendChild(wrap);
    wrap.querySelectorAll<HTMLElement>("[data-cart-close]").forEach((el) =>
      el.addEventListener("click", closeCart)
    );
  };

  const renderCart = (): void => {
    const list = document.querySelector<HTMLElement>("[data-cart-list]");
    const totalEl = document.querySelector<HTMLElement>("[data-cart-total]");
    const foot = document.querySelector<HTMLElement>("[data-cart-foot]");
    if (!list || !totalEl || !foot) return;
    const entries = Object.entries(getCart()).filter(([slug]) => product(slug));
    if (entries.length === 0) {
      list.innerHTML = `<li class="lmd-cart-empty">Tu pedido está vacío.<br /><span>Agrega algo desde <a href="bakery-menu.html">el menú</a>.</span></li>`;
      foot.classList.add("hidden");
      updateBadge();
      return;
    }
    foot.classList.remove("hidden");
    let total = 0;
    list.innerHTML = entries
      .map(([slug, qty]) => {
        const p = product(slug) as Product;
        const line = p.price * qty;
        total += line;
        return `<li class="lmd-cart-item">
          <img src="${p.img}" alt="${p.name}" />
          <div class="lmd-cart-info">
            <strong>${p.name}</strong>
            <span class="lmd-cart-price">${money(p.price)} · subtotal ${money(line)}</span>
            <div class="lmd-qty">
              <button type="button" data-qty="-1" data-slug="${slug}" aria-label="Quitar uno">−</button>
              <span>${qty}</span>
              <button type="button" data-qty="1" data-slug="${slug}" aria-label="Agregar uno">+</button>
              <button type="button" class="lmd-remove" data-remove="${slug}">Quitar</button>
            </div>
          </div>
        </li>`;
      })
      .join("");
    totalEl.textContent = money(total);
    list.querySelectorAll<HTMLButtonElement>("[data-qty]").forEach((b) =>
      b.addEventListener("click", () => {
        const cart = getCart();
        const slug = b.dataset.slug as string;
        cart[slug] = (cart[slug] ?? 0) + Number(b.dataset.qty);
        if (cart[slug] <= 0) delete cart[slug];
        saveCart(cart);
        renderCart();
        orderRefresh?.();
      })
    );
    list.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => {
        const cart = getCart();
        delete cart[b.dataset.remove as string];
        saveCart(cart);
        renderCart();
        orderRefresh?.();
      })
    );
    updateBadge();
  };

  const openCart = (): void => {
    renderCart();
    document.body.classList.add("cart-open");
  };
  const closeCart = (): void => document.body.classList.remove("cart-open");

  const addToCart = (slug: string, qty = 1): void => {
    const cart = getCart();
    cart[slug] = (cart[slug] ?? 0) + qty;
    saveCart(cart);
    cartChanged();
    bumpBadge();
    toast(`Agregado: ${(product(slug) as Product).name}`);
  };

  const toast = (msg: string): void => {
    const t = document.createElement("div");
    t.className = "lmd-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    window.setTimeout(() => {
      t.classList.remove("show");
      window.setTimeout(() => t.remove(), 350);
    }, 2200);
  };

  /* ---------- product card ---------- */
  const card = (p: Product): string => {
    const fav = getFavs().includes(p.slug) ? " is-fav" : "";
    return `<article class="lmd-card reveal">
      <div class="lmd-card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="lmd-tag">${p.tag}</span>` : ""}
        ${p.out ? `<span class="lmd-tag lmd-tag-out">Agotado</span>` : ""}
      </div>
      <button class="lmd-fav${fav}" type="button" data-fav="${p.slug}" aria-label="Marcar como favorito">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <h3 class="lmd-card-name">${p.name}</h3>
      <p class="lmd-card-desc">${p.desc}</p>
      <div class="lmd-card-row">
        <span class="lmd-card-price">${money(p.price)}</span>
        ${p.out
          ? `<button class="lmd-btn lmd-btn-ghost" type="button" disabled>Agotado</button>`
          : `<button class="lmd-btn lmd-btn-ghost" type="button" data-add="${p.slug}">Agregar</button>`}
      </div>
    </article>`;
  };

  const bindCards = (root: ParentNode): void => {
    root.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => addToCart(b.dataset.add as string));
    });
    root.querySelectorAll<HTMLButtonElement>("[data-fav]").forEach((b) => {
      if (b.dataset.favBound) return;
      b.dataset.favBound = "1";
      b.addEventListener("click", () => {
        const slug = b.dataset.fav as string;
        const favs = getFavs();
        const i = favs.indexOf(slug);
        if (i >= 0) favs.splice(i, 1);
        else favs.push(slug);
        saveFavs(favs);
        b.classList.toggle("is-fav", i < 0);
      });
    });
    observeReveals(root);
  };

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  const observeReveals = (root: ParentNode): void => {
    root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => revealObserver.observe(el));
  };

  /* ---------- navbar ---------- */
  const initNav = (): void => {
    document.querySelectorAll<HTMLElement>("[data-cart-open]").forEach((b) =>
      b.addEventListener("click", openCart)
    );
    const nav = document.querySelector<HTMLElement>(".lmd-nav");
    const shrink = (): void => {
      nav?.classList.toggle("scrolled", window.scrollY > 30);
    };
    window.addEventListener("scroll", shrink, { passive: true });
    shrink();

    const toggle = document.querySelector<HTMLButtonElement>(".lmd-burger");
    const links = document.querySelector<HTMLElement>(".lmd-nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      links.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).closest("a")) {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    const searchBtn = document.querySelector<HTMLAnchorElement>("[data-search]");
    searchBtn?.addEventListener("click", () => {
      sessionStorage.setItem("lmd-focus-search", "1");
    });

    // Scroll-spy: mark the nav link of the section being read.
    const navAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".lmd-nav-links a[href^='#']")
    );
    if (navAnchors.length > 0) {
      const navIds = new Set(navAnchors.map((a) => a.getAttribute("href")?.slice(1) ?? ""));
      const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id], header[id]")).filter((s) =>
        navIds.has(s.id)
      );
      const updateSpy = (): void => {
        const line = window.scrollY + window.innerHeight * 0.4;
        let current = sections[0]?.id ?? "";
        sections.forEach((s) => {
          if (s.offsetTop <= line) current = s.id;
        });
        const atBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom) current = sections[sections.length - 1]?.id ?? current;
        navAnchors.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
        });
      };
      window.addEventListener("scroll", updateSpy, { passive: true });
      updateSpy();
    }
  };

  /* ---------- page: home ---------- */
  const initHome = (): void => {
    const grid = document.querySelector<HTMLElement>("[data-today-grid]");
    if (grid) {
      const today = ["croissant", "espiral-canela", "masa-madre", "pan-chocolate"];
      grid.innerHTML = today.map((s) => card(product(s) as Product)).join("");
      bindCards(grid);
    }
    document.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => addToCart(b.dataset.add as string));
    });
  };

  /* ---------- page: menu ---------- */
  const initMenu = (): void => {
    const grid = document.querySelector<HTMLElement>("[data-menu-grid]");
    const search = document.querySelector<HTMLInputElement>("[data-search-input]");
    const chips = document.querySelectorAll<HTMLButtonElement>("[data-cat]");
    if (!grid) return;

    let cat = "all";
    const apply = (): void => {
      const q = (search?.value ?? "").trim().toLowerCase();
      let list = PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      );
      if (cat !== "all") list = list.filter((p) => p.cat === cat);
      grid.innerHTML = list.length
        ? list.map(card).join("")
        : `<p class="lmd-empty">Sin resultados para esa búsqueda.</p>`;
      bindCards(grid);
    };

    search?.addEventListener("input", apply);
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("active"));
        c.classList.add("active");
        cat = c.dataset.cat ?? "all";
        apply();
      })
    );
    apply();
    if (sessionStorage.getItem("lmd-focus-search") === "1" && search) {
      sessionStorage.removeItem("lmd-focus-search");
      search.focus();
      search.scrollIntoView({ block: "center" });
    }
  };

  /* ---------- page: pedido ---------- */
  const initPedido = (): void => {
    const wrap = document.querySelector<HTMLElement>("[data-order-summary]");
    const form = document.querySelector<HTMLFormElement>("[data-order-form]");
    const done = document.querySelector<HTMLElement>("[data-order-done]");
    if (!wrap) return;

    const renderSummary = (): void => {
      const entries = Object.entries(getCart()).filter(([slug]) => product(slug));
      const submit = form?.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submit) submit.disabled = entries.length === 0;
      if (entries.length === 0) {
        wrap.innerHTML = `<p class="lmd-empty">Tu pedido está vacío. Agrega algo desde <a href="bakery-menu.html">el menú</a>.</p>`;
        return;
      }
      let total = 0;
      const rows = entries
        .map(([slug, qty]) => {
          const p = product(slug) as Product;
          const line = p.price * qty;
          total += line;
          return `<li class="lmd-order-line">
            <img src="${p.img}" alt="${p.name}" />
            <div>
              <strong>${p.name}</strong>
              <span>${qty} x ${money(p.price)}</span>
            </div>
            <div class="lmd-qty">
              <button type="button" data-oq="-1" data-slug="${slug}">−</button>
              <span>${qty}</span>
              <button type="button" data-oq="1" data-slug="${slug}">+</button>
            </div>
            <b>${money(line)}</b>
          </li>`;
        })
        .join("");
      wrap.innerHTML = `<ul class="lmd-order-list">${rows}</ul>
        <div class="lmd-order-total"><span>Subtotal</span><strong>${money(total)}</strong></div>
        <div class="lmd-order-total"><span>Total</span><strong>${money(total)}</strong></div>`;
      wrap.querySelectorAll<HTMLButtonElement>("[data-oq]").forEach((b) =>
        b.addEventListener("click", () => {
          const cart = getCart();
          const slug = b.dataset.slug as string;
          cart[slug] = (cart[slug] ?? 0) + Number(b.dataset.oq);
          if (cart[slug] <= 0) delete cart[slug];
          saveCart(cart);
          renderSummary();
          updateBadge();
        })
      );
    };
    orderRefresh = renderSummary;
    renderSummary();

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      // Re-read the cart: it may have been emptied from the drawer meanwhile.
      if (Object.keys(getCart()).filter((slug) => product(slug)).length === 0) {
        renderSummary();
        return;
      }
      // Demo site: the order is only simulated, nothing is sent anywhere.
      saveCart({});
      updateBadge();
      wrap.classList.add("hidden");
      form.classList.add("hidden");
      done?.classList.remove("hidden");
      done?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  /* ---------- boot ---------- */
  buildCart();
  initNav();
  updateBadge();
  observeReveals(document);
  const page = document.body.dataset.page ?? "home";
  if (page === "home") initHome();
  if (page === "menu") initMenu();
  if (page === "pedido") initPedido();
})();
