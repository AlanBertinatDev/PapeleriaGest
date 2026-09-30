# Handoff: Rediseño de la página de inicio de crea+ (Bertinat Papelería)

## Resumen
Rediseño de la home pública (visitantes no registrados) de crea+. Objetivos:
- Que en 3 segundos se entienda qué es, dónde queda y qué hacer (titular + CTAs en el hero).
- Mantener un **carrusel** (pedido del cliente), pero solo de fotos: el texto y los botones quedan fijos.
- Usar los colores del logo de forma sistemática.
- Mejorar contraste, jerarquía y el modal de login/registro.
- Productos / catálogo / menú completo son **solo para usuarios registrados**. La home pública no los muestra.

## Sobre los archivos de diseño
`Inicio crea+ rediseño.dc.html` es una **referencia de diseño hecha en HTML**, no código para copiar tal cual. La tarea es **recrear este diseño en el código existente del sitio** (su framework, componentes, estilos y rutas), respetando los patrones del proyecto. Reutilizá la lógica existente de auth, carrusel y rutas; cambiá la presentación.

## Fidelidad
**Alta fidelidad.** Colores, tipografías, tamaños, radios y copy son finales. Recrealo pixel-perfect con las herramientas del proyecto.

---

## Cambios respecto del sitio actual (checklist)
1. **Header:** logo a la izquierda. Nav pública solo con "Contacto" (ancla a `#visitanos`). Botones "Ingresar" (ghost) y "Registrarme" (relleno teal oscuro `#2F6F66`, reemplaza el teal claro con poco contraste). Header sticky con fondo blanco 92% + blur 8px.
2. **Hero:** se reemplaza el carrusel a lo ancho y sin texto por un layout de 2 columnas: texto fijo a la izquierda y carrusel de fotos a la derecha.
3. **Tarjetas de servicios:** con fondo de color (uno por servicio, tomado del logo), ícono más grande y **toda la tarjeta clickeable** con un link de acción.
4. **Se elimina** el bloque "Más de 34 años en Paysandú" / "Nuestra historia" del cuerpo. El dato de 34 años queda en el hero (pill + badge).
5. **Nueva sección "Visitanos"** (`#visitanos`): dirección, horario, teléfonos como botones de WhatsApp, Instagram y mapa.
6. **Footer** oscuro en 4 columnas en lugar de una sola línea.
7. **Modal de login/registro** rediseñado (ver abajo).
8. **Tipografía:** solo 2 familias. Se eliminan la serif de los títulos y la cursiva del tagline.

---

## Design tokens

### Colores
| Uso | Hex |
|---|---|
| Fondo página | `#F7F4EF` |
| Texto principal (ink) | `#2A2622` |
| Texto secundario | `#5A534B` |
| Texto de cuerpo en tarjetas | `#4A443D` |
| Borde hairline (header) | `#ECE6DC` |
| Borde inputs / controles | `#CFC6B8` |
| Superficie neutra (tabs, botón cerrar, hover ghost) | `#F1ECE4` |
| **Primario (botones, links)** | `#2F6F66` |
| Primario hover | `#245A52` |
| Link hover | `#1F4F48` |
| Footer fondo | `#2A2622` · texto `#D9D2C7` · títulos `#FFFFFF` · legal `#A69E92` · divisor `#443E37` |

Logo (una letra por color): c `#EE8F95` · r `#EDB84A` · e `#6FB3A8` · a `#A996D2` · + `#8DB072`

Colores por servicio (fondo de tarjeta / color del ícono / color del link):
- Papelería (rosa): `#FCE8E9` / `#C4545C` / `#A2383F`
- Imprenta (amarillo): `#FBEFD2` / `#A77A12` / `#7D5A08`
- Pedidos online (lila): `#EEE9F7` / `#6B55A8` / `#553F92`
- Sección Visitanos (verde agua): `#E4F1EE`
- Pill del hero: fondo `#FBEFD2`, texto `#6E5A2A`, punto `#EDB84A`
- Badge "34": número en `#8DB072`

### Tipografía (Google Fonts)
- **Fredoka** 500/600/700: logo, títulos y números destacados. Redondeada, combina con el logo.
- **Figtree** 400/500/600/700: todo lo demás.

| Elemento | Fuente | Tamaño | Peso | Otros |
|---|---|---|---|---|
| Logo header | Fredoka | 34px | 700 | letter-spacing -0.01em |
| H1 hero | Fredoka | clamp(44px, 6vw, 72px) | 600 | line-height 1.02, ls -0.02em, text-wrap balance |
| H2 sección | Fredoka | 32–36px | 600 | ls -0.01em |
| H3 tarjeta | Fredoka | 24px | 600 | |
| Título modal | Fredoka | 24px | 600 | |
| Subtítulo hero | Figtree | 19px | 400 | line-height 1.55, max-width 34ch, color `#5A534B` |
| Texto tarjeta | Figtree | 16px | 400 | line-height 1.5 |
| Nav | Figtree | 15px | 500 | |
| Botones | Figtree | 15–16px | 600 (700 en submit y links de tarjeta) | |
| Pill / meta | Figtree | 14px | 600 | |
| Footer | Figtree | 14px (legal 13px) | 400 / 700 títulos | |

### Radios y sombras
- Botones y pills: `999px`
- Tarjetas de servicio: `22px`. Foto del hero: `28px`. Bloque Visitanos: `28px` (mapa interno `20px`). Modal: `24px`
- Inputs: `12px`. Tile de ícono: `14px` (52×52, fondo blanco)
- Badge flotante: `18px`, sombra `0 8px 24px rgba(42,38,34,0.10)`
- Modal: sombra `0 24px 60px rgba(42,38,34,0.25)`, overlay `rgba(42,38,34,0.45)`
- Tab activo: sombra `0 1px 3px rgba(42,38,34,0.12)`

### Layout
- Contenedor: `max-width: 1200px`, padding horizontal 24px.
- Grids responsivos: `repeat(auto-fit, minmax(min(100%, Xpx), 1fr))`. Hero X=460, servicios X=300, Visitanos X=380, footer X=200. Se apilan solos en mobile.

---

## Secciones

### 1. Header (sticky)
- Fila: logo · nav (flex:1) · botones. Padding 14px 24px, gap 32px.
- Nav: "Contacto" → `#visitanos`.
- "Ingresar": ghost, padding 10px 16px, hover fondo `#F1ECE4`. Abre el modal en la pestaña Ingresar.
- "Registrarme": fondo `#2F6F66`, texto blanco, padding 10px 20px. Abre el modal en la pestaña Registrarme.

### 2. Hero
Padding 56px 24px 40px. Grid de 2 columnas, gap 48px, alineado al centro.

**Izquierda** (flex column, gap 24px):
- Pill: "Papelería en Paysandú desde hace más de 34 años" (con punto amarillo de 6px).
- H1: "Todo para crear **y más.**" ("y más." en `#2F6F66`).
- Subtítulo: "Útiles escolares, de oficina y de regalo, e impresiones listas para retirar. Hacé tu pedido online y pasá a buscarlo."
- CTAs (gap 12px):
  - Primario "Crear cuenta gratis →": fondo `#2F6F66`, padding 14px 24px. **Abre el modal de registro.**
  - Secundario "Enviar a imprimir": borde 1.5px `#2A2622`, hover fondo ink + texto blanco.
- Meta (14px, `#5A534B`): ícono map-pin + "18 de Julio 684, frente al Liceo N°1" · link "Escribinos por WhatsApp" (ícono message-circle, `#2F6F66`, 600).

**Derecha: carrusel**
- Marco con `aspect-ratio: 5/4`, radio 28px.
- Detrás, una capa del mismo tamaño rotada `2deg` cuyo color cambia según la foto activa: foto 1 `#F6D9DA`, foto 2 `#FBEFD2`, foto 3 `#EEE9F7` (transición de background 0.6s).
- 3 fotos apiladas (absolute, inset 0) con **fade**: opacidad 0↔1, `transition: opacity .6s ease`. Contenido sugerido: 1) el local, 2) útiles / temporada escolar, 3) imprenta / trabajos. **Usar fotos reales, no stock.**
- Badge flotante abajo a la izquierda (left −16px, bottom 24px): "34" (Fredoka 36px 700 verde) + "años en / Paysandú" (13px 600).
- Controles **debajo** de la foto, alineados a la derecha, gap 12px:
  - Puntos: 8px de alto; el activo mide 24px de ancho en `#2A2622`, los inactivos 8px en `#CFC6B8`. Transición de width y background 0.2s. Se pueden clickear.
  - Flechas anterior/siguiente: círculos de 40px, borde 1.5px `#CFC6B8`, fondo blanco, hover borde ink. Íconos chevron-left/right.
- Autoplay cada **5s**, en loop. Cualquier interacción manual reinicia el timer. Respetar `prefers-reduced-motion` (sin autoplay, cambio sin fade).

### 3. Servicios (`#servicios`)
Padding 40px 24px 72px. H2 "¿Qué necesitás hoy?" (margin-bottom 24px). Grid de 3 columnas, gap 20px.

Cada tarjeta es un `<a>` completo: padding 28px, radio 22px, flex column, gap 14px. Hover `translateY(-3px)` en 0.15s. Estructura: tile de ícono → H3 → texto → link de acción (margin-top auto, 15px 700, con flecha).

| Tarjeta | Ícono (Lucide) | Texto | Link |
|---|---|---|---|
| Papelería y librería | book | Útiles escolares, de oficina y de regalo, con stock renovado todo el año. | Ingresá para ver el catálogo → (abre login / va al catálogo si hay sesión) |
| Imprenta | printer | Impresiones en blanco y negro o color, simples o a doble faz, listas para retirar. | Enviar archivo → |
| Pedidos online | shopping-cart | Creá tu cuenta para armar pedidos, hacer seguimiento y recibir tus ofertas favoritas. | Crear cuenta → (abre registro) |

### 4. Visitanos (`#visitanos`)
Padding 72px 24px. Bloque con fondo `#E4F1EE`, radio 28px, padding 20px. Grid de 2 columnas, gap 20px.
- **Izquierda** (padding 28px, gap 24px): H2 "Visitanos" (36px).
  - map-pin: "**18 de Julio 684**" / "Frente al Liceo N°1, Paysandú".
  - clock: "**Horarios**" / *[COMPLETAR con el horario real de atención]*.
  - Botones: "098 254 185" (relleno teal) · "098 846 144" (outline teal 1.5px) · "@bertinatpapeleria" (outline, ícono instagram). Los teléfonos abren WhatsApp: `https://wa.me/598XXXXXXXX` (formato internacional, sin el 0 inicial). Instagram: `https://instagram.com/bertinatpapeleria`.
- **Derecha:** embed de Google Maps, min-height 300px, radio 20px.

### 5. Footer
Fondo `#2A2622`. Grid de 4 columnas, padding 48px 24px 28px, gap 32px.
1. Logo (28px) + "Bertinat Papelería"
2. **Tienda**: Servicios (`#servicios`), Contacto (`#visitanos`)
3. **Contacto**: 098 254 185, 098 846 144, @bertinatpapeleria (con links)
4. **Dirección**: 18 de Julio 684 / Frente al Liceo N°1

Barra legal (borde superior `#443E37`, 13px): "© 2026 crea+ · Bertinat Papelería. Todos los derechos reservados."

### 6. Modal de login / registro
- Overlay fijo `rgba(42,38,34,0.45)`, centrado. Clic afuera o botón X cierra (también cerrar con Escape).
- Caja: max-width 420px, padding 28px, gap 20px, radio 24px.
- Encabezado: título (Ingresar: "Hola de nuevo" / Registro: "Creá tu cuenta") + botón cerrar (círculo de 36px, fondo `#F1ECE4`, ícono X).
- **Tabs** (segmented control): contenedor `#F1ECE4`, padding 4px, radio 999. Tab activo: fondo blanco, texto ink y sombra suave. Inactivo: transparente, `#5A534B`. Fuente **Figtree 15px 600** (ya no la serif). Labels: "Ingresar" / "Registrarme".
- Campos (label arriba, **en minúscula normal, no en mayúsculas**: 14px 600, gap 6px):
  - Solo en registro: "Nombre" (placeholder "Tu nombre").
  - "Email" (placeholder "nombre@correo.com").
  - "Contraseña": en modo Ingresar, a la derecha del label va el link "¿La olvidaste?". Botón de ojo dentro del input (36px, a 6px del borde derecho) para mostrar u ocultar.
- Inputs: 16px, padding 12px 14px, radio 12px, **borde 1.5px `#CFC6B8`** (visible). Focus: borde `#2F6F66` + `box-shadow: 0 0 0 3px rgba(47,111,102,0.18)`.
- Submit a lo ancho: "Ingresar" / "Crear cuenta", fondo `#2F6F66`, padding 14px, 16px 700, radio 999.
- **Se eliminan** el texto "¿No tenés cuenta? Registrate" (las tabs ya cumplen esa función) y el link de contraseña debajo del botón.
- Copy unificado con voseo: "Registrarme" / "Creá tu cuenta" (no mezclar con "Registrate").

---

## Estado / comportamiento
- `modalOpen: boolean`, `tab: 'login' | 'register'`, `showPassword: boolean`, `slide: 0..2`.
- Ingresar → `modalOpen=true, tab='login'`. Registrarme / Crear cuenta gratis / Crear cuenta → `tab='register'`.
- Carrusel: `setInterval` de 5000ms que avanza `slide = (slide+1) % 3`. Anterior, siguiente o un punto hacen `goTo(i)` y reinician el intervalo. Limpiarlo al desmontar.
- Si el usuario **ya tiene sesión**, mantener la home o el menú de usuario registrado que exista hoy. Este diseño es solo para visitantes.

## Assets
- Íconos: **Lucide** (book, printer, shopping-cart, map-pin, clock, message-circle, instagram, arrow-right, chevron-left, chevron-right, x, eye). Stroke 2.
- Fotos: 3 del carrusel + mapa. **Pedir fotos reales al cliente.** En el prototipo son placeholders.
- Logo: seguir usando el logo actual de crea+. En el prototipo se recreó con texto Fredoka solo como referencia.

## Archivos
- `Inicio crea+ rediseño.dc.html`: prototipo interactivo. Abrilo en el navegador como referencia visual. Requiere `image-slot.js` (incluido) solo para los placeholders de fotos. No hace falta portarlo.
