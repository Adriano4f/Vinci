/* ByteShop demo · shared script for all techstore pages.
   Page behavior is selected via <body data-page="home|products|product|why|order">. */
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
    extras: string[];
  }

  const PRODUCTS: Product[] = [
    {
      slug: "cable-usb-c",
      name: "Cable USB-C trenzado",
      desc: "1.5 m, sobrevive a cualquier mochila.",
      price: 6,
      cat: "Cables",
      img: "img/byteshop-cable.jpg",
      tag: "BYTE VERIFIED",
      extras: ["1.5 m", "Trenzado", "Pensado para el uso diario"],
    },
    {
      slug: "soporte-telefono",
      name: "Soporte para teléfono",
      desc: "Se pliega plano y sostiene cualquier teléfono en dos ángulos.",
      price: 8,
      cat: "Soportes",
      img: "img/byteshop-soporte.jpg",
      extras: ["Plegable", "Dos ángulos", "Pensado para el uso diario"],
    },
    {
      slug: "kit-organizador",
      name: "Kit organizador de cables",
      desc: "Correas de velcro + estuche. Tu escritorio te lo agradecerá.",
      price: 5,
      cat: "Organización",
      img: "img/byteshop-organizador.jpg",
      extras: ["Correas de velcro", "Estuche incluido", "Pensado para el uso diario"],
    },
    {
      slug: "set-limpieza",
      name: "Set de limpieza de pantallas",
      desc: "Spray + paño de microfibra, seguro para laptops.",
      price: 4,
      cat: "Limpieza",
      img: "img/byteshop-limpieza.jpg",
      extras: ["Spray + microfibra", "Seguro para laptops", "Pensado para el uso diario"],
    },
    {
      slug: "pack-stickers",
      name: "Pack de stickers",
      desc: "10 stickers de vinil para laptop, diseñados por nosotros.",
      price: 3,
      cat: "Personalización",
      img: "img/byteshop-stickers.jpg",
      extras: ["10 stickers", "Vinil resistente", "Diseños propios"],
    },
    {
      slug: "caja-misteriosa",
      name: "Caja misteriosa de gadgets",
      desc: "Una mezcla sorpresa que vale más que su precio.",
      price: 10,
      cat: "Sorpresa",
      img: "img/byteshop-caja.jpg",
      tag: "MYSTERY",
      extras: ["Contenido sorpresa", "Vale más que su precio", "Edición de la feria"],
    },
  ];

  const product = (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug);

  const money = (n: number): string => `$${n}`;

  /* ---------- cart state ---------- */
  const CART_KEY = "byteshop-cart";
  const FAV_KEY = "byteshop-favs";

  /* Storage access can throw (blocked storage, quota). Keep an in-memory
     copy so cart/fav actions still work for the rest of the session. */
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
  const saveCart = (cart: Record<string, number>): void => {
    setItem(CART_KEY, JSON.stringify(cart));
  };

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
      .reduce((total, [, qty]) => total + qty, 0);

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

  /* ---------- cart drawer (injected on every page) ---------- */
  const buildCart = (): void => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="ts-cart-overlay" data-cart-close></div>
      <aside class="ts-cart" aria-label="Carrito de compras">
        <header class="ts-cart-head">
          <h3>Tu carrito</h3>
          <button class="ts-icon-btn" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>
        </header>
        <ul class="ts-cart-list" data-cart-list></ul>
        <footer class="ts-cart-foot" data-cart-foot>
          <div class="ts-cart-total"><span>Total</span><strong data-cart-total>$0</strong></div>
          <a class="ts-btn ts-btn-primary ts-btn-block" href="techstore-pedir.html">Realizar pedido</a>
          <p class="ts-cart-note">Pagas al recoger.</p>
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
    const cart = getCart();
    const entries = Object.entries(cart).filter(([slug]) => product(slug));
    if (entries.length === 0) {
      list.innerHTML = `<li class="ts-cart-empty">Tu carrito está vacío.<br /><span>Agrega algo desde <a href="techstore-productos.html">productos</a>.</span></li>`;
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
        return `<li class="ts-cart-item">
          <img src="${p.img}" alt="${p.name}" />
          <div class="ts-cart-info">
            <strong>${p.name}</strong>
            <span class="ts-cart-price">${money(p.price)} · subtotal ${money(line)}</span>
            <div class="ts-qty">
              <button type="button" data-qty="-1" data-slug="${slug}" aria-label="Quitar uno">−</button>
              <span>${qty}</span>
              <button type="button" data-qty="1" data-slug="${slug}" aria-label="Agregar uno">+</button>
              <button type="button" class="ts-remove" data-remove="${slug}" aria-label="Quitar del carrito">Quitar</button>
            </div>
          </div>
        </li>`;
      })
      .join("");
    totalEl.textContent = money(total);
    list.querySelectorAll<HTMLButtonElement>("[data-qty]").forEach((b) =>
      b.addEventListener("click", () => {
        const cart2 = getCart();
        const slug = b.dataset.slug as string;
        cart2[slug] = (cart2[slug] ?? 0) + Number(b.dataset.qty);
        if (cart2[slug] <= 0) delete cart2[slug];
        saveCart(cart2);
        renderCart();
        updateBadge();
      })
    );
    list.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach((b) =>
      b.addEventListener("click", () => {
        const cart2 = getCart();
        delete cart2[b.dataset.remove as string];
        saveCart(cart2);
        renderCart();
        updateBadge();
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
    updateBadge();
    bumpBadge();
    toast(`Agregado: ${(product(slug) as Product).name}`);
  };

  const toast = (msg: string): void => {
    const t = document.createElement("div");
    t.className = "ts-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    window.setTimeout(() => {
      t.classList.remove("show");
      window.setTimeout(() => t.remove(), 350);
    }, 2200);
  };

  /* ---------- product card markup ---------- */
  const card = (p: Product): string => {
    const fav = getFavs().includes(p.slug) ? " is-fav" : "";
    return `<article class="ts-card reveal">
      <a class="ts-card-img" href="techstore-producto.html?p=${p.slug}">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="ts-tag">${p.tag}</span>` : ""}
      </a>
      <button class="ts-fav${fav}" type="button" data-fav="${p.slug}" aria-label="Marcar como favorito">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <span class="ts-card-cat">${p.cat}</span>
      <h3 class="ts-card-name"><a href="techstore-producto.html?p=${p.slug}">${p.name}</a></h3>
      <p class="ts-card-desc">${p.desc}</p>
      <div class="ts-card-row">
        <span class="ts-card-price">${money(p.price)}</span>
        <button class="ts-btn ts-btn-ghost" type="button" data-add="${p.slug}">Agregar al carrito</button>
      </div>
    </article>`;
  };

  const bindCards = (root: ParentNode): void => {
    root.querySelectorAll<HTMLButtonElement>("[data-add]").forEach((b) => {
      if (b.dataset.bound) return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => addToCart(b.dataset.add as string));
    });
    root.querySelectorAll<HTMLButtonElement>("[data-fav]").forEach((b) =>
      b.addEventListener("click", () => {
        const slug = b.dataset.fav as string;
        const favs = getFavs();
        const i = favs.indexOf(slug);
        if (i >= 0) favs.splice(i, 1);
        else favs.push(slug);
        saveFavs(favs);
        b.classList.toggle("is-fav", i < 0);
      })
    );
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
    const toggle = document.querySelector<HTMLButtonElement>(".ts-burger");
    const links = document.querySelector<HTMLElement>(".ts-nav-links");
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
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        sessionStorage.setItem("byteshop-focus-search", "1");
      });
    }

    // Scroll-spy: mark the nav link of the section being read.
    const navAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".ts-nav-links a[href^='#']")
    );
    if (navAnchors.length > 0) {
      const navIds = new Set(navAnchors.map((a) => a.getAttribute("href")?.slice(1) ?? ""));
      const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]")).filter((s) =>
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
    const grid = document.querySelector<HTMLElement>("[data-grid]");
    if (grid) {
      grid.innerHTML = PRODUCTS.map(card).join("");
      bindCards(grid);
    }
    document.querySelectorAll<HTMLElement>("[data-add]").forEach((b) => {
      if ((b as HTMLElement).dataset.bound) return;
      (b as HTMLElement).dataset.bound = "1";
      b.addEventListener("click", () => addToCart(b.dataset.add as string));
    });
  };

  /* ---------- page: products ---------- */
  const initProducts = (): void => {
    const grid = document.querySelector<HTMLElement>("[data-grid]");
    const search = document.querySelector<HTMLInputElement>("[data-search-input]");
    const sort = document.querySelector<HTMLSelectElement>("[data-sort]");
    const chips = document.querySelectorAll<HTMLButtonElement>("[data-price]");
    const count = document.querySelector<HTMLElement>("[data-count]");
    if (!grid) return;

    let priceBand = "all";
    const apply = (): void => {
      const q = (search?.value ?? "").trim().toLowerCase();
      let list = PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
      );
      if (priceBand === "low") list = list.filter((p) => p.price <= 5);
      if (priceBand === "mid") list = list.filter((p) => p.price > 5 && p.price <= 8);
      if (priceBand === "high") list = list.filter((p) => p.price > 8);
      const s = sort?.value ?? "featured";
      if (s === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
      if (s === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
      if (s === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      grid.innerHTML = list.length
        ? list.map(card).join("")
        : `<p class="ts-empty">Sin resultados para esa búsqueda.</p>`;
      if (count) count.textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
      bindCards(grid);
    };

    search?.addEventListener("input", apply);
    sort?.addEventListener("change", apply);
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        chips.forEach((x) => x.classList.remove("active"));
        c.classList.add("active");
        priceBand = c.dataset.price ?? "all";
        apply();
      })
    );

    apply();
    if (sessionStorage.getItem("byteshop-focus-search") === "1" && search) {
      sessionStorage.removeItem("byteshop-focus-search");
      search.focus();
      search.scrollIntoView({ block: "center" });
    }
  };

  /* ---------- page: product detail ---------- */
  const initProduct = (): void => {
    const slug = new URLSearchParams(location.search).get("p") ?? "";
    const p = product(slug);
    const root = document.querySelector<HTMLElement>("[data-product]");
    if (!root) return;
    if (!p) {
      document.title = "Producto no encontrado · ByteShop";
      root.innerHTML = `<div class="ts-pd-info" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <h1>Producto no encontrado</h1>
        <p class="ts-pd-desc">Ese producto no existe o ya no está disponible.</p>
        <a class="ts-btn ts-btn-primary" href="techstore-productos.html">Ver catálogo</a>
      </div>`;
      return;
    }
    document.title = `${p.name} · ByteShop`;
    root.innerHTML = `
      <div class="ts-pd-img reveal visible">
        <img src="${p.img}" alt="${p.name}" />
        ${p.tag ? `<span class="ts-tag">${p.tag}</span>` : ""}
      </div>
      <div class="ts-pd-info">
        <span class="ts-card-cat">${p.cat}</span>
        <h1>${p.name}</h1>
        <p class="ts-pd-desc">${p.desc}</p>
        <ul class="ts-pd-extras">${p.extras.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="ts-pd-buy">
          <span class="ts-pd-price">${money(p.price)}</span>
          <div class="ts-qty ts-qty-lg">
            <button type="button" data-pq="-1" aria-label="Menos">−</button>
            <span data-pq-val>1</span>
            <button type="button" data-pq="1" aria-label="Más">+</button>
          </div>
          <button class="ts-btn ts-btn-primary" type="button" data-pd-add>Agregar al carrito</button>
        </div>
        <p class="ts-pd-note">Pagas al recoger · Garantía de reemplazo el primer mes.</p>
      </div>`;
    let qty = 1;
    const val = root.querySelector<HTMLElement>("[data-pq-val]");
    root.querySelectorAll<HTMLButtonElement>("[data-pq]").forEach((b) =>
      b.addEventListener("click", () => {
        qty = Math.max(1, qty + Number(b.dataset.pq));
        if (val) val.textContent = String(qty);
      })
    );
    root.querySelector<HTMLButtonElement>("[data-pd-add]")?.addEventListener("click", () =>
      addToCart(p.slug, qty)
    );
  };

  /* ---------- page: order ---------- */
  const initOrder = (): void => {
    const sel = document.querySelector<HTMLSelectElement>("[data-product-select]");
    if (sel) {
      sel.innerHTML = `<option value="">Elige un producto</option>` +
        PRODUCTS.map((p) => `<option value="${p.slug}">${p.name} · ${money(p.price)}</option>`).join("") +
        `<option value="otro">Otro / varios</option>`;
    }
    const form = document.querySelector<HTMLFormElement>("[data-order-form]");
    const done = document.querySelector<HTMLElement>("[data-order-done]");
    if (!form) return;

    // If the cart has items, carry them into the order: mark "Otro / varios"
    // and prefill the message with the cart lines and total.
    const cartBlock = (): string => {
      const entries = Object.entries(getCart()).filter(([slug]) => product(slug));
      if (entries.length === 0) return "";
      const lines = entries.map(([slug, qty]) => {
        const p = product(slug) as Product;
        return `${qty} x ${p.name} (${money(p.price)} c/u, subtotal ${money(p.price * qty)})`;
      });
      const total = entries.reduce((acc, [slug, qty]) => acc + (product(slug) as Product).price * qty, 0);
      return `Mi carrito:\n${lines.join("\n")}\nTotal: ${money(total)}`;
    };
    const msg = form.querySelector<HTMLTextAreaElement>("#mensaje");
    const generated = cartBlock();
    if (generated) {
      if (sel) sel.value = "otro";
      if (msg) msg.value = generated;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const nombre = (form.querySelector<HTMLInputElement>("#nombre")?.value ?? "").trim();
      const prodSel = form.querySelector<HTMLSelectElement>("[data-product-select]");
      const prodLabel = prodSel?.selectedOptions[0]?.textContent ?? "";
      const cantidad = form.querySelector<HTMLInputElement>("#cantidad")?.value ?? "1";
      const metodo = form.querySelector<HTMLSelectElement>("#contacto-met")?.value ?? "";
      // Rebuild the cart block from live state so drawer edits aren't stale;
      // anything the customer typed beyond the generated block is preserved.
      const rawMsg = (msg?.value ?? "").trim();
      const extra = generated && rawMsg.startsWith(generated)
        ? rawMsg.slice(generated.length).trim()
        : rawMsg === generated
          ? ""
          : rawMsg;
      const fresh = cartBlock();
      // If the customer emptied the prefilled cart and left no notes, the
      // "Otro / varios" selection describes nothing: force a concrete choice.
      if (generated && !fresh && !extra && sel && sel.value === "otro") {
        sel.value = "";
        form.reportValidity();
        return;
      }
      const mensaje = [fresh, extra].filter(Boolean).join("\n\n");
      const resumen =
        `Nombre: ${nombre} · Producto: ${prodLabel} · Cantidad: ${cantidad} · Contacto: ${metodo}` +
        (mensaje ? `\n${mensaje}` : "");
      // Demo site: the order is only simulated, nothing is sent anywhere.
      const note = done?.querySelector<HTMLElement>("[data-order-note]");
      if (note) note.textContent = resumen;
      saveCart({});
      updateBadge();
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
  if (page === "products") initProducts();
  if (page === "product") initProduct();
  if (page === "order") initOrder();
})();
