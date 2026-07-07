# Handoff: Home pública — Bertinat Papelería (opción 7a)

## Overview
Nueva home pública (no admin) para clientes: la ven todos al entrar a la web, estén logueados o no. Objetivo: mostrar ofertas vigentes y dar un preview de lo que ofrece la papelería, **sin carrito ni compra real** — la compra real sigue existiendo solo para el usuario logueado (flujo actual del proyecto). Esta pantalla es puramente de entrada/vidriera.

**No es un e-commerce tipo marketplace**: el público es mayormente clientes habituales del local físico (frente al Liceo N°1), no compradores nuevos que descubren la marca. Por eso la home es deliberadamente simple — sin menú de navegación por secciones ni grilla de categorías — solo lo esencial: identidad + ofertas + acceso a cuenta.

## About the Design File
`Home Pública.html` es un mockup estático en HTML — referencia visual, no código de producción para copiar tal cual. Recrear este look & feel en el proyecto real (React o el framework que ya se use), conectando con los datos reales de ofertas.

## Fidelidad
**Alta fidelidad**: colores, tipografía, tamaños, radios y espaciados definidos abajo deben recrearse con precisión. Contenido de ofertas de ejemplo (nombres, precios, %) es de prueba — reemplazar por las ofertas reales cargadas en el panel de administración (sección Ofertas).

## Estructura de la pantalla (de arriba a abajo)

### 1. Header
- Logo (badge circular gradiente cónico, mismo asset que el resto del sistema) + nombre "Bertinat Papelería".
- **Sin menú de navegación.** Solo dos acciones a la derecha: "Ingresar" (outline) y "Registrarme" (relleno, azul oscuro).
- Ambos botones llevan directo al flujo de login/registro existente — no hay ningún estado intermedio de "carrito preview".

### 2. Hero
- Fondo con gradiente pastel suave (mismo set de hues del logo: rosa/durazno/celeste), sin banner de imagen grande.
- Título: nombre de la marca (Poppins 700, 38px).
- Subcopy corto (Inter 400, 15.5px): invita a mirar ofertas/catálogo antes de ir al local.
- Un solo CTA: **"Ver catálogo"** (azul oscuro, relleno) — no hay CTA de "crear cuenta" acá, ya está en el header.
- Imagen placeholder a la derecha (260×260, rayado tenue) — reemplazar por foto real del local o de producto destacado.

### 3. Ofertas destacadas (carrusel)
- Fila horizontal scrolleable de tarjetas (250px de ancho c/u), 1 tarjeta por oferta activa.
- Cada tarjeta: imagen 140px alto (tinte pastel según categoría/tipo de oferta) con badge de descuento o tipo arriba a la izquierda (ej. "-25%", "Servicio"), tag de categoría chico, nombre de la oferta, y precio (tachado + promocional en Poppins bold), o texto libre si es tipo "Servicio" (sin precio de descuento).
- **Este carrusel debe alimentarse de las ofertas reales** ya cargadas en el panel (Vacaciones de invierno, Combo prueba, etc. — ver sección Ofertas del handoff de administración). Si no hay ofertas activas, el carrusel debería ocultarse o mostrar un estado vacío simple (a definir con el equipo).
- Debajo del carrusel: texto chico centrado "Iniciá sesión para ver el catálogo completo." — deja claro que el catálogo completo (no solo ofertas) está detrás del login.
- No hay botón de "agregar al carrito" en ningún lado — el click en una oferta o en "Ver todas" también debería llevar a login si el usuario no está autenticado.

### 4. Footer
- Fondo oscuro (mismo tono que texto principal del sistema, `oklch(0.2 0.01 75)`), contraste con el resto de la página clara.
- Logo + nombre + tagline a la izquierda.
- Datos de contacto a la derecha: WhatsApp (x2), Instagram, dirección — mismos datos que ya existen hoy en el sitio.

## Decisiones descartadas (para que no se reintroduzcan sin querer)
- ❌ Menú superior con "Catálogo / Ofertas / Imprenta / Cursos" — se sacó a pedido, la home no necesita navegación de descubrimiento.
- ❌ Sección "Explorá por categoría" (grid de tiles por categoría) — se sacó, redundante con el objetivo de la pantalla.
- ❌ Sección "Lo más pedido" (grid de productos individuales con botón "Ver producto") — se sacó; el catálogo completo solo se ve logueado, no antes.
- ❌ Segundo botón "Crear cuenta" duplicado dentro del hero — alcanza con "Ingresar / Registrarme" del header.

## Design Tokens (mismo sistema que el panel de administración)

### Colores
- Fondo de página / footer contraste: `oklch(0.2 0.01 75)` ≈ `#242220` (footer)
- Superficie / cards: `#ffffff`
- Borde sutil: `oklch(0.92 0.006 75)` ≈ `#e6e5e2`
- Texto principal: `oklch(0.2 0.01 75)` ≈ `#242220`
- Texto secundario: `oklch(0.5 0.01 75)` / `oklch(0.4 0.01 75)`
- Acento primario (botones): `oklch(0.3 0.02 230)` ≈ `#1f3a54` (azul oscuro)

### Acentos pastel por categoría/tipo de oferta (mismo chroma/lightness, hue distinto)
| Uso | Hue | Fondo tinte |
|---|---|---|
| Rosa (Escolar/Lápices) | 20 | `oklch(0.94 0.05 20)` |
| Durazno (Oficina) | 70 | `oklch(0.94 0.05 70)` |
| Menta (Servicios) | 155 | `oklch(0.93 0.05 155)` |
| Celeste (categoría alternativa) | 230 | `oklch(0.93 0.05 230)` |

### Tipografía
- Encabezados / precios: Poppins 600–700.
- Cuerpo / UI: Inter 400–700.
- Escala: 38px (título hero), 20px (títulos de sección), 19px (precio promo en card), 15.5px (subcopy hero), 14.5px (nombre de oferta), 13.5px (botones/nav), 12.5px (texto secundario/footer), 10.5px (tags/badges uppercase).

### Espaciado y forma
- Radios: 10px (botones), 16px (cards de oferta), 24px (imagen placeholder hero).
- Sombras: sutiles, `0 2px 10px rgba(0,0,0,.05)` en cards de oferta.
- Padding de secciones: 40px horizontal, 32–44px vertical.
- Placeholder de imagen: tinte pastel + patrón rayado diagonal sutil (`repeating-linear-gradient`), reemplazar por foto real.

## Interacciones
- El mockup es estático. Al implementar:
  - "Ingresar" / "Registrarme" → flujo de auth existente.
  - "Ver catálogo" → si no está logueado, redirige a login/registro (no muestra catálogo).
  - Click en una tarjeta de oferta / "Ver todas" → mismo comportamiento: sin sesión, pide login.
  - Con sesión iniciada, esta misma home puede mostrarse igual (ofertas) o redirigir directo al catálogo/dashboard real — a definir con el equipo si aún no está resuelto.

## Files
- `Home Pública.html` — mockup completo de la pantalla aprobada (referenciada como `7a` en el archivo de exploración `Productos - Rediseño.dc.html`).
