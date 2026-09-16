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
     8. FORMULARIO DE COTIZACIÓN → WHATSAPP
        Valida los campos obligatorios y arma un mensaje prellenado que se
        abre en https://wa.me/51993546564 (sin backend).
  ------------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = "51993546564"; // Perú (+51) 993 546 564
  const form = document.getElementById("quoteForm");
  const errorBox = document.getElementById("quoteError");

  // Alternativa por correo (descomentar si se prefiere abrir el cliente de email):
  // const EMAIL_DESTINO = "a.mendoza@tbracar.com";

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Limpia estados de error previos
      form.querySelectorAll(".field--invalid").forEach((f) => f.classList.remove("field--invalid"));
      if (errorBox) { errorBox.hidden = true; errorBox.textContent = ""; }

      const data = new FormData(form);
      const get = (k) => (data.get(k) || "").toString().trim();

      const name = get("name");
      const phone = get("phone");
      const email = get("email");
      const service = get("service");
      const pax = get("pax");
      const date = get("date");
      const origin = get("origin");
      const dest = get("dest");
      const message = get("message");

      // --- Validación ---
      const invalid = [];
      if (!name)    invalid.push("name");
      if (!phone)   invalid.push("phone");
      if (!service) invalid.push("service");
      // Si se ingresó correo, validar formato básico
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid.push("email");

      if (invalid.length) {
        invalid.forEach((n) => {
          const input = form.querySelector(`[name="${n}"]`);
          if (input) input.closest(".field").classList.add("field--invalid");
        });
        if (errorBox) {
          errorBox.textContent = "Por favor completa los campos obligatorios (Nombres, Número y Tipo de servicio) y revisa el correo.";
          errorBox.hidden = false;
        }
        // Enfoca el primer campo con error
        const first = form.querySelector(`[name="${invalid[0]}"]`);
        if (first) first.focus();
        return;
      }

      // --- Armado del mensaje de WhatsApp ---
      const lines = [
        "*Solicitud de cotización — BRACAR*",
        "",
        `👤 *Nombres:* ${name}`,
        `📞 *Número:* ${phone}`,
      ];
      if (email)  lines.push(`✉️ *Correo:* ${email}`);
      lines.push(`🚌 *Servicio:* ${service}`);
      if (pax)    lines.push(`👥 *Pasajeros:* ${pax}`);
      if (date)   lines.push(`📅 *Fecha:* ${date}`);
      if (origin) lines.push(`📍 *Origen:* ${origin}`);
      if (dest)   lines.push(`🏁 *Destino:* ${dest}`);
      if (message) { lines.push("", `📝 *Mensaje:* ${message}`); }

      const text = encodeURIComponent(lines.join("\n"));
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

      // Abre WhatsApp en una pestaña nueva
      window.open(url, "_blank", "noopener");

      /* --- ALTERNATIVA POR CORREO (mailto) — descomentar para usarla ---
      const subject = encodeURIComponent("Solicitud de cotización — " + name);
      const body = encodeURIComponent(lines.join("\n"));
      window.location.href = `mailto:${EMAIL_DESTINO}?subject=${subject}&body=${body}`;
      */
    });
  }

})();
