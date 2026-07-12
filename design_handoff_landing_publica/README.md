# Handoff: Landing pública — ajustes de fondo, carrusel y tarjetas de servicio

## Overview
Retoques sobre la landing pública ya existente (header con logo + pills "Ingresar"/"Registrarme", carrusel de foto de oferta, 3 tarjetas de servicio, footer oscuro). Referenciado como `16a` en `Productos - Rediseño.dc.html`. No cambia la estructura de secciones — ajusta fondo, altura del carrusel, e iconografía de las tarjetas.

## Qué cambia y por qué

### 1. Fondo de página
- Antes: blanco puro de punta a punta → todo se veía plano, sin jerarquía entre secciones.
- Ahora: fondo general `oklch(0.965 0.004 75)` (gris cálido muy sutil, casi imperceptible), con el header y las tarjetas de servicio en blanco puro (`#fff`) por encima. El contraste blanco-sobre-gris da profundidad sin salir de la paleta neutra del sitio.

### 2. Carrusel de oferta
- Se bajó la altura (antes ocupaba una porción muy grande de la pantalla, competía con el resto del contenido).
- El carrusel muestra **una foto de oferta que sube el admin desde el panel** (no es contenido fijo de la landing). Se agregó texto guía con la medida recomendada — **1600 × 500px, formato banner ancho** — directo en el placeholder, para que al cargar la imagen real no quede recortada ni estirada.
- Se agregaron puntos de paginación abajo (para cuando haya más de una oferta activa).

### 3. Tarjetas de servicio (Papelería y librería / Imprenta / Pedidos online)
- Se reemplazaron los emoji (📚 🖨️ 🛒) por **iconos lineales SVG** en un chip de color pastel (mismo hue por tarjeta: rosa/celeste/menta, coherente con la paleta del logo). Los iconos son placeholder de línea simple — reemplazar por el set de iconos final que se use en el resto del sitio, manteniendo el mismo grosor de trazo (2px) y tamaño (18px dentro de chip 38×38px).
- Mismo peso visual entre las tres — ninguna se destaca sobre las otras (alternativa con foco en "Pedidos online" quedó en la opción `16b`, no incluida en este handoff).

### 4. Franja de contacto en el footer
- Se agregaron los datos de contacto (teléfonos, Instagram, dirección) al footer oscuro, en la misma línea que el copyright — antes ese espacio quedaba vacío después de las tarjetas, dando sensación de página incompleta.

## Datos que necesita el agente/dev
- El carrusel necesita alimentarse de las ofertas activas cargadas en el panel de administración (ver sección Ofertas). Si hay más de una oferta con imagen, rotar automáticamente o permitir swipe; los puntos de paginación reflejan la cantidad real.
- Validar/recomendar la medida 1600×500px en el flujo de carga de imagen del panel de Ofertas (mensaje de ayuda o crop guiado), para que el admin suba la imagen ya en el aspecto correcto.
- El resto del contenido (textos de las 3 tarjetas, datos de contacto) es el mismo que ya existe hoy — no cambia.

## Tokens usados
- Fondo de página: `oklch(0.965 0.004 75)`.
- Superficie / cards: `#ffffff`.
- Borde sutil: `oklch(0.92 0.006 75)`.
- Footer oscuro / texto principal: `oklch(0.2 0.01 75)`.
- Acento primario (botón "Registrarme"): mismo `oklch(0.2 0.01 75)` (o `oklch(0.3 0.02 230)` si se prefiere el azul usado en el resto del sistema — confirmar cuál es el real en producción).
- Chips de icono por categoría: rosa `oklch(0.94 0.03 20)`, celeste `oklch(0.93 0.03 230)`, menta `oklch(0.93 0.04 155)` — trazo de icono en la versión más saturada/oscura del mismo hue.
- Tipografía: Poppins 700/600 (marca/títulos), Inter 400–700 (resto).
- Radios: 14px (tarjetas), 16px (carrusel), 24px (pills de botón), 10px (chip de icono).

## Files
- `Landing Pública - 16a.html` — mockup estático standalone de esta pantalla.
- Ver `Productos - Rediseño.dc.html`, sección `id="16a"`, para el mockup vivo (incluye también la alternativa `16b`, no elegida en este handoff).
