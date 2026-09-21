# Transportes Global BRACAR S.A.C. — Landing page

Landing page profesional, responsive y en español para **Transportes Global
BRACAR S.A.C.**, empresa peruana de transporte de personas. Construida con
**HTML5, CSS3 y JavaScript vanilla** (sin frameworks ni dependencias de build),
lista para publicar en cualquier hosting estático.

Concepto de diseño: **"movimiento, ruta y confianza"** — hero en modo oscuro con
un vehículo que recorre el **mapa del Perú** por una ruta nacional y se
**transforma cada 2.5 s** (Auto → Mini Van → Van → Coaster → Minibús → Bus,
con el logo BRACAR y pasajeros saludando),
motivo gráfico de "ruta" que se dibuja al hacer scroll,
retícula editorial asimétrica, números grandes como elemento gráfico y bloques de
color alternados para dar ritmo.

---

## 📁 Estructura del proyecto

```
bracar/
├── index.html            # Estructura y contenido (una sola página con anclas)
├── css/
│   └── styles.css        # Sistema de diseño + estilos (comentado al inicio)
├── js/
│   └── script.js         # Interacciones: menú, contadores, reveal, WhatsApp…
├── assets/
│   └── img/
│       ├── favicon.svg   # Favicon placeholder (reemplazar)
│       ├── flota/        # Ilustraciones SVG genéricas de las unidades
│       └── clientes/     # Logos de clientes (integrados; faltan 3)
└── README.md
```

---

## 🚀 Cómo previsualizar en local

No requiere compilación. Opciones:

- **Doble clic** en `index.html` para abrirlo en el navegador, **o**
- Servirlo con un servidor estático (recomendado para que carguen bien las rutas):

```bash
# Con Python 3
python3 -m http.server 8000
# luego abre http://localhost:8000

# o con Node
npx serve .
```

---

## 🌐 Cómo publicar (hosting estático)

Sube el contenido de la carpeta tal cual a cualquiera de estos servicios:

- **Netlify / Vercel / Cloudflare Pages:** arrastra la carpeta o conéctala a tu
  repositorio. No hay comando de build (es HTML estático).
- **GitHub Pages:** sube los archivos a un repo y activa Pages sobre la rama
  principal (carpeta raíz `/`).
- **Hosting tradicional (cPanel/FTP):** copia los archivos a `public_html/`.

---

## 🔧 Reemplazo de PLACEHOLDERS

Busca los comentarios `PLACEHOLDER` dentro de los archivos. Puntos clave:

### 1. Logo de la marca
- En `index.html`, el logo es texto (`.brand__mark` → "BRACAR"). Aparece en la
  **navbar** y en el **footer**.
- Reemplázalo por el logo real, por ejemplo:
  ```html
  <img src="assets/img/logo.svg" alt="Transportes Global BRACAR" class="brand__logo" />
  ```
- La **animación del hero** (mapa del Perú con un vehículo recorriendo la ruta)
  está marcada en `index.html` con el comentario "VISUAL ANIMADO". Para
  ajustarla:
  - **Ruta:** edita el atributo `d` de `#heroRoute` (y de `.perumap__route-base`)
    dentro del `<svg class="perumap">`.
  - **Velocidad y cambio de vehículo:** variables `LAP_MS` (una vuelta) y
    `SWAP_MS` (cada cuánto cambia de tipo) en la sección 9 de `js/script.js`.
  - **Silueta del Perú:** es un `<g class="perumap__land">` (silueta de mapsicon,
    licencia MIT); su color sale del degradado `#mapLand` del propio SVG.

### 2. Fotos de la flota
- Por ahora cada unidad usa una **ilustración genérica en SVG** (colores de la
  marca) ubicada en `assets/img/flota/`: `auto.svg`, `minivan.svg`, `van.svg`,
  `coaster.svg`, `minibus.svg`, `bus.svg`.
- Para usar **fotos reales**, reemplaza el `src` de cada `<img>` en la sección
  Flota de `index.html` (por ejemplo `assets/img/flota/bus.jpg`) y sube la foto.
- Tamaño sugerido: **480×320 px** (relación 3:2).

### 2b. Ubicación (Google Maps)
- La sección "Ubicación" incrusta Google Maps en modo *embed* (sin API key).
- Para cambiar el punto, edita el parámetro `q=` del `<iframe>` y del enlace
  **"Cómo llegar"** en `index.html` (sección `#ubicacion`) con la dirección o
  las coordenadas correctas.

### 3. Logos de clientes
- Ya integrados: 17 logos en `assets/img/clientes/`, a tamaño estandarizado y
  con sus **colores originales**. **Faltan 3** por subir: **Imesac, Pecord
  Corporation y CAFAE** (se omiten hasta tener su logo). Para añadirlos, sube el
  archivo a `assets/img/clientes/` y agrega en AMBAS listas del marquee:
  `<li class="logo"><img src="assets/img/clientes/archivo.png" alt="Nombre"></li>`.
- **Importante:** el carrusel duplica la lista (hay un segundo `<ul>` con
  `aria-hidden="true"`) para el loop infinito. Actualiza **ambas** listas.

### 4. Testimonios
- Textos de **muestra** redactados a partir de los clientes más destacados
  (Grundfos Perú, Interbank, EsSalud). **Antes de publicarlos como oficiales,
  valida y obtén la aprobación de cada empresa** e, idealmente, firma con el
  nombre y cargo reales de la persona. Reemplaza la cita (`<blockquote>`) y el
  `<figcaption>` de cada tarjeta.

### 4b. Logo oficial BRACAR
- Tu logo está en `assets/img/logo-bracar.jpg`. Aún no está incrustado en la
  navbar/footer (siguen con la reconstrucción en texto); podemos reemplazarlo
  cuando quieras por `<img src="assets/img/logo-bracar.jpg" alt="…">`.

### 5. Redes sociales
- Enlaces de **Facebook** e **Instagram** con `href="#"` en la sección de
  contacto y en el footer. Sustituye por las URLs reales.

### 6. Imagen para redes (Open Graph) y favicon
- `og:image` apunta a `assets/img/og-cover.jpg` (1200×630 px recomendado).
- `favicon.svg` es un placeholder; reemplázalo por el ícono definitivo.

### 7. Google Analytics (opcional)
- Pega tu etiqueta antes de `</head>` en `index.html`:
  ```html
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
  ```

---

## 📞 Datos de contacto configurados

| Dato | Valor |
|------|-------|
| WhatsApp / Teléfono | +51 993 546 564 (`https://wa.me/51993546564`) |
| Correo | a.mendoza@tbracar.com |
| Dirección | Sector 3, Grupo 22, Mz. H, Lote 15, Villa El Salvador, Lima |
| Atención | 24 horas |
| RUC | 20611475226 |

El **formulario de cotización** valida los campos, arma un mensaje y lo abre en
WhatsApp (sin backend). Para cambiar el número, edita `WHATSAPP_NUMBER` en
`js/script.js`. Hay una **alternativa por `mailto:`** comentada en el mismo
archivo (variable `EMAIL_DESTINO`).

---

## ♿ Accesibilidad y rendimiento

- Semántica HTML5, atributos `alt`, contraste cuidado y foco visible.
- Respeta `prefers-reduced-motion`: si está activo, el bus queda estático y se
  detienen las animaciones continuas.
- Animaciones solo con `transform`/`opacity` (aceleradas por GPU) y efectos de
  scroll con `requestAnimationFrame` para evitar reflow.
- Imágenes con `loading="lazy"`.

---

## 🎨 Sistema de diseño

Todos los tokens (paleta, tipografía, espaciado, radios) están definidos como
**variables CSS** al inicio de `css/styles.css`, en la sección
`0. SISTEMA DE DISEÑO`. Cambiar un valor ahí se propaga a toda la web.

- **Colores:** azul marino `#16345F` (base), ámbar `#F5A623` (acento), azul
  eléctrico `#2E7BE4`.
- **Tipografías:** Anton (números/titulares mega), Archivo (headings), Inter
  (cuerpo) — cargadas desde Google Fonts.

---

© Transportes Global BRACAR S.A.C. — RUC 20611475226
