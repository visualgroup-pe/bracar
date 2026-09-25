/* ============================================================================
   TRANSPORTES GLOBAL BRACAR S.A.C. — JAVASCRIPT (vanilla)
   ============================================================================
   Funcionalidades:
   1.  Año dinámico en el footer
   2.  Navbar que reacciona al scroll
   3.  Menú hamburguesa responsive
   4.  Contadores animados (barra de confianza)
   5.  Animaciones de aparición (reveal) con IntersectionObserver
   6.  Trazo de "ruta" que se dibuja al hacer scroll
   7.  Parallax sutil del hero (siluetas de ciudad)
   8.  Formulario de cotización → mensaje de WhatsApp prellenado
   ----------------------------------------------------------------------------
   Nota de rendimiento: los efectos de scroll usan requestAnimationFrame y solo
   modifican transform/opacity para no provocar reflow.
   Se respeta prefers-reduced-motion.
   ============================================================================ */

(function () {
  "use strict";

  // Marca que JS está activo: habilita el estado oculto de .reveal en CSS
  // (mejora progresiva: sin JS, el contenido se muestra siempre).
  document.documentElement.classList.add("js");

  // ¿El usuario prefiere menos movimiento?
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     1. AÑO DINÁMICO EN EL FOOTER
  ------------------------------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());


  /* ------------------------------------------------------------------------
     2. NAVBAR QUE REACCIONA AL SCROLL
        Añade .is-scrolled cuando se supera cierto umbral.
  ------------------------------------------------------------------------ */
  const nav = document.querySelector(".nav");
  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScrollNav();


  /* ------------------------------------------------------------------------
     3. MENÚ HAMBURGUESA RESPONSIVE
  ------------------------------------------------------------------------ */
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("navMenu");

  const closeMenu = () => {
    if (!menu || !burger) return;
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
  };

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    // Cierra el menú al pulsar un enlace o al pasar a desktop
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 720) closeMenu(); });

    // Cierra con tecla Escape (accesibilidad)
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }


  /* ------------------------------------------------------------------------
     4. CONTADORES ANIMADOS
        Cada .stat__num tiene data-count (valor final) y opcionalmente
        data-prefix / data-suffix. Se anima al entrar en viewport.
  ------------------------------------------------------------------------ */
  const counters = document.querySelectorAll(".stat__num[data-count]");

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";

    // Si se reduce el movimiento, muestra el valor final directamente.
    if (prefersReduced) {
      el.textContent = prefix + target + suffix;
      return;
    }

    const duration = 1600; // ms
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic para un frenado natural
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString("es-PE") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target); // solo una vez
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => counterObs.observe(c));
  } else {
    counters.forEach(animateCounter); // fallback
  }


  /* ------------------------------------------------------------------------
     5. ANIMACIONES DE APARICIÓN (.reveal)
  ------------------------------------------------------------------------ */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    reveals.forEach((el) => revealObs.observe(el));
  } else {
    // Sin observer o con movimiento reducido: muéstralo todo.
    reveals.forEach((el) => el.classList.add("is-visible"));
  }


  /* ------------------------------------------------------------------------
     6. TRAZO DE "RUTA" QUE SE DIBUJA CON EL SCROLL
        Normalizamos la longitud del path a 1000 (pathLength) y ajustamos
        stroke-dashoffset según el progreso de scroll de la página.
  ------------------------------------------------------------------------ */
  const routePath = document.querySelector(".route__path");
  if (routePath && !prefersReduced) {
    // pathLength normaliza cálculos independientemente del tamaño real.
    routePath.setAttribute("pathLength", "1000");
    routePath.style.strokeDasharray = "1000";
    routePath.style.strokeDashoffset = "1000";
  }


  /* ------------------------------------------------------------------------
     7. EFECTOS DE SCROLL (parallax hero + trazo ruta)
        Agrupados en un único listener con requestAnimationFrame.
  ------------------------------------------------------------------------ */
  const skylineFar = document.querySelector(".skyline--far");
  const skylineNear = document.querySelector(".skyline--near");
  let ticking = false;

  const onScrollFx = () => {
    const y = window.scrollY;

    // 2. Navbar
    onScrollNav();

    // 6. Trazo de ruta según progreso total de scroll
    if (routePath && !prefersReduced) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docH > 0 ? Math.min(y / docH, 1) : 0;
      routePath.style.strokeDashoffset = String(1000 - progress * 1000);
    }

    // 7. Parallax del hero (solo mientras el hero es visible)
    if (!prefersReduced && y < window.innerHeight) {
      if (skylineFar)  skylineFar.style.transform  = `translateX(${-y * 0.04}px)`;
      if (skylineNear) skylineNear.style.transform = `translateX(${-y * 0.09}px)`;
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScrollFx);
      ticking = true;
    }
  }, { passive: true });


  /* ------------------------------------------------------------------------
     8. FORMULARIO DE COTIZACIÓN → WHATSAPP o CORREO
        El usuario elige el método con el selector. Se valida y se arma un
        mensaje prellenado que se abre en WhatsApp (wa.me) o en el cliente de
        correo (mailto), sin backend.
  ------------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = "51993546564";          // Perú (+51) 993 546 564
  const EMAIL_DESTINO = "a.mendoza@tbracar.com";  // destino de la cotización por correo
  const form = document.getElementById("quoteForm");
  const errorBox = document.getElementById("quoteError");

  if (form) {
    const segBtns = form.querySelectorAll(".seg__btn");
    const submitBtn = document.getElementById("quoteSubmit");
    const submitText = document.getElementById("quoteSubmitText");
    const submitIco = submitBtn ? submitBtn.querySelector(".quote__submit-ico") : null;
    const hint = document.getElementById("quoteHint");
    const ICONS = {
      whatsapp: '<path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>',
      email: '<path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 2v.01L12 12l8-5.99V6H4m16 12V8.24l-8 5.99-8-5.99V18z"/>',
    };

    // Aplica el método elegido a la interfaz (etiqueta, icono, color y ayuda)
    const setMethod = (m) => {
      form.dataset.method = m;
      segBtns.forEach((b) => {
        const on = b.dataset.method === m;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      if (submitBtn) {
        submitBtn.classList.toggle("btn--wa", m === "whatsapp");
        submitBtn.classList.toggle("btn--mail", m === "email");
      }
      if (submitText) submitText.textContent = m === "email" ? "Cotizar por correo" : "Cotizar por WhatsApp";
      if (submitIco) submitIco.innerHTML = ICONS[m] || ICONS.whatsapp;
      if (hint) hint.textContent = m === "email"
        ? "Se abrirá tu correo con la solicitud lista para enviar a " + EMAIL_DESTINO + "."
        : "Se abrirá WhatsApp con tu solicitud lista para enviar.";
    };
    segBtns.forEach((b) => b.addEventListener("click", () => setMethod(b.dataset.method)));

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const method = form.dataset.method || "whatsapp";

      form.querySelectorAll(".field--invalid").forEach((f) => f.classList.remove("field--invalid"));
      if (errorBox) { errorBox.hidden = true; errorBox.textContent = ""; }

      const data = new FormData(form);
      const get = (k) => (data.get(k) || "").toString().trim();
      const name = get("name"), phone = get("phone"), email = get("email"), service = get("service");
      const pax = get("pax"), date = get("date"), origin = get("origin"), dest = get("dest"), message = get("message");

      // --- Validación (según el método elegido) ---
      const invalid = [];
      if (!name) invalid.push("name");
      if (!service) invalid.push("service");
      if (method === "email") {
        if (!email || !emailRe.test(email)) invalid.push("email");
      } else {
        if (!phone) invalid.push("phone");
        if (email && !emailRe.test(email)) invalid.push("email");
      }

      if (invalid.length) {
        invalid.forEach((n) => {
          const input = form.querySelector(`[name="${n}"]`);
          if (input) input.closest(".field").classList.add("field--invalid");
        });
        if (errorBox) {
          errorBox.textContent = method === "email"
            ? "Completa los campos obligatorios: Nombres, Correo y Tipo de servicio."
            : "Completa los campos obligatorios: Nombres, Número y Tipo de servicio.";
          errorBox.hidden = false;
        }
        const first = form.querySelector(`[name="${invalid[0]}"]`);
        if (first) first.focus();
        return;
      }

      // --- Datos de la solicitud ---
      const rows = [
        ["Nombres", name], ["Número", phone], ["Correo", email], ["Servicio", service],
        ["Pasajeros", pax], ["Fecha", date], ["Origen", origin], ["Destino", dest], ["Mensaje", message],
      ].filter((r) => r[1]);

      if (method === "email") {
        // --- Correo (mailto) ---
        const subject = "Solicitud de cotización — " + name;
        const body = "Solicitud de cotización — Transportes BRACAR\n\n" +
          rows.map((r) => r[0] + ": " + r[1]).join("\n");
        window.location.href = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        // --- WhatsApp ---
        const ico = { "Nombres": "👤", "Número": "📞", "Correo": "✉️", "Servicio": "🚌", "Pasajeros": "👥", "Fecha": "📅", "Origen": "📍", "Destino": "🏁", "Mensaje": "📝" };
        const lines = ["*Solicitud de cotización — BRACAR*", ""]
          .concat(rows.map((r) => `${ico[r[0]] || "•"} *${r[0]}:* ${r[1]}`));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
      }
    });
  }


  /* ------------------------------------------------------------------------
     9. RECORRIDO POR EL MAPA DEL PERÚ (hero)
        Un vehículo recorre la ruta nacional (norte → sur) en bucle y se
        "transforma" cada 5 s en el siguiente tipo: Auto → Mini Van → Van →
        Coaster → Minibús → Bus. Las ruedas giran por CSS.
        - Movimiento con requestAnimationFrame usando getPointAtLength (solo
          escribe transform: sin reflow).
        - prefers-reduced-motion: deja el bus estático sobre Lima, sin bucle.
  ------------------------------------------------------------------------ */
  const route = document.getElementById("heroRoute");
  const trip = document.getElementById("tripVehicle");

  if (route && trip) {
    const vehicles = Array.prototype.slice.call(trip.querySelectorAll(".veh"));
    const label = document.getElementById("vehLabel");
    const LAP_MS = 30000;   // una vuelta completa al Perú
    const SWAP_MS = 2500;   // cambio de vehículo cada 2.5 s

    const showVehicle = (i) => {
      vehicles.forEach((v, k) => v.classList.toggle("is-on", k === i));
      if (label && vehicles[i]) label.textContent = vehicles[i].dataset.name;
    };

    let total = 0;
    try { total = route.getTotalLength(); } catch (e) { total = 0; }

    const placeAt = (frac) => {
      const pt = route.getPointAtLength(frac * total);
      // -6 en Y: apoya las ruedas sobre la línea de la ruta
      trip.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${(pt.y - 6).toFixed(1)})`);
    };

    if (prefersReduced || !total) {
      // Estático: bus (último) cerca de Lima
      showVehicle(vehicles.length - 1);
      if (total) placeAt(0.46);
    } else {
      let curType = -1;
      const start = performance.now();
      const step = (now) => {
        const t = now - start;
        placeAt((t % LAP_MS) / LAP_MS);
        const idx = Math.floor(t / SWAP_MS) % vehicles.length;
        if (idx !== curType) { curType = idx; showVehicle(idx); }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }


  /* ------------------------------------------------------------------------
     10. WIDGET DE WHATSAPP (popup del asesor BRACAR)
        Al hacer clic en el botón flotante se abre/cierra un popup de
        bienvenida. El botón verde del popup abre WhatsApp.
  ------------------------------------------------------------------------ */
  const waWidget = document.getElementById("waWidget");
  const waToggle = document.getElementById("waToggle");
  const waClose = document.getElementById("waClose");
  const waPop = document.getElementById("waPop");

  if (waWidget && waToggle && waPop) {
    const openWa = () => {
      waWidget.classList.add("is-open");
      waPop.hidden = false;
      waToggle.setAttribute("aria-expanded", "true");
      waToggle.setAttribute("aria-label", "Cerrar chat con el asesor");
    };
    const closeWa = () => {
      waWidget.classList.remove("is-open");
      waPop.hidden = true;
      waToggle.setAttribute("aria-expanded", "false");
      waToggle.setAttribute("aria-label", "Chatea con un asesor de BRACAR");
    };

    waToggle.addEventListener("click", () => {
      waWidget.classList.contains("is-open") ? closeWa() : openWa();
    });
    if (waClose) waClose.addEventListener("click", closeWa);

    // Cierra con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && waWidget.classList.contains("is-open")) closeWa();
    });
    // Cierra al hacer clic fuera del widget
    document.addEventListener("click", (e) => {
      if (waWidget.classList.contains("is-open") && !waWidget.contains(e.target)) closeWa();
    });
  }


  /* ------------------------------------------------------------------------
     11. CARRUSEL AUTOMÁTICO DE FOTOS (sección Flota)
        Cada tarjeta con [data-carousel] rota sus fotos con crossfade.
        Genera puntos indicadores, pausa al pasar el mouse y respeta
        prefers-reduced-motion (no rota, muestra la primera foto).
  ------------------------------------------------------------------------ */
  const carousels = document.querySelectorAll("[data-carousel]");
  carousels.forEach((car, ci) => {
    const slides = Array.prototype.slice.call(car.querySelectorAll(".carousel__slide"));
    if (slides.length < 2) return;

    // Puntos indicadores
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "carousel__dots";
    slides.forEach((s, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      d.setAttribute("aria-label", "Ver foto " + (i + 1));
      d.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(d);
    });
    car.appendChild(dotsWrap);
    const dots = Array.prototype.slice.call(dotsWrap.children);

    let idx = 0, timer = null;
    const INTERVAL = 4000;
    const go = (n, manual) => {
      slides[idx].classList.remove("is-active");
      dots[idx].classList.remove("is-active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      dots[idx].classList.add("is-active");
      if (manual) restart();
    };
    const next = () => go(idx + 1);
    const start = () => { if (!prefersReduced && !timer) timer = setInterval(next, INTERVAL); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const restart = () => { stop(); start(); };

    car.addEventListener("mouseenter", stop);   // pausa al pasar el mouse
    car.addEventListener("mouseleave", start);

    // Desfase inicial: evita que todas cambien a la vez
    if (!prefersReduced) setTimeout(start, ci * 900);
  });

})();
