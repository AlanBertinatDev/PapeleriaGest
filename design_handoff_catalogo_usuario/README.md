# Handoff: Catálogo de usuario (opción 9a) — Bertinat Papelería

## Overview
Rediseño de la pantalla de Catálogo que ve el usuario logueado (rol estándar). Reemplaza la tabla actual (código / producto / precio / stock / cantidad) por un **catálogo unificado en tarjetas**, donde el cliente arma un solo pedido combinando **productos, ofertas y servicios** — hoy estas tres cosas viven en pantallas separadas y el usuario tiene que ir por su cuenta a cada sección.

## About the Design File
`Catálogo - Usuario.html` es un mockup estático — referencia visual, no código de producción para copiar tal cual. Recrear en el proyecto real, conectado a los datos reales (catálogo de productos, ofertas activas, servicios).

## Fidelidad
**Alta fidelidad**: colores, tipografía, tamaños, radios y espaciados deben recrearse con precisión. Contenido de ejemplo (nombres, precios) es de prueba — reemplazar por datos reales.

## Cambios funcionales clave (no solo visuales)

### 1. Catálogo unificado
- Un solo grid de tarjetas mezcla **productos**, **ofertas** (packs/descuentos) y **servicios** (talleres, impresión). Cada tarjeta lleva un tag de tipo cuando no es un producto simple: "Oferta · Pack", "Servicio".
- Filtro por tipo arriba del grid: **Todo / Productos / Ofertas / Servicios** (pills, "Todo" activo por defecto).
- El usuario arma **un solo pedido** que puede incluir cualquier combinación de los tres tipos — no son flujos de compra separados.

### 2. Sin número de stock visible
- **Se saca el número de stock** que hoy se muestra en la tabla (columna "Stock: 57"). El cliente no necesita saber la cantidad exacta.
- Si el producto **tiene stock disponible**: la tarjeta se ve normal, con el selector de cantidad (stepper −/+) habilitado.
- Si el producto **no tiene stock**:
  - La tarjeta se atenúa (opacity ~0.72, imagen placeholder sin tinte de categoría, en gris).
  - Badge **"Sin stock"** en rosa/rojo suave (`oklch(0.93 0.06 20)` fondo, `oklch(0.5 0.16 20)` texto) sobre la imagen.
  - El precio se muestra igual pero en gris, y el stepper se reemplaza por un botón deshabilitado **"Agotado"** (fondo gris, sin acción).
- Los servicios y ofertas no tienen estado "sin stock" salvo que el negocio lo necesite a futuro (a definir).

### 3. Resumen de pedido lateral ("Tu pedido")
- Panel fijo a la derecha (280px, sticky), acumula todo lo agregado sin importar el tipo.
- Cada línea: nombre + tag de tipo si no es producto simple ("Oferta", "Servicio") + cantidad × precio unitario + subtotal.
- Total estimado abajo (Poppins 700, 20px) + botón **"Crear pedido"** (relleno, azul oscuro) que envía el pedido combinado.
- Si no hay nada agregado, mostrar estado vacío simple ("Todavía no agregaste productos.") — no se ve en este mockup pero debe existir (ver referencia en la exploración anterior, sección `8a`).

## Estructura de la tarjeta de producto
- Imagen 130px alto, borde superior 5px con el color pastel de la categoría (mismo sistema del panel admin).
- Nombre (Inter 600, 14.5px).
- Precio (Poppins 700, 18px) a la izquierda del selector de cantidad.
- Selector de cantidad: stepper −/+ dentro de un contenedor con borde, botón "+" en azul oscuro relleno.
- Para ofertas con descuento: precio original tachado + precio promocional, mismo layout que el resto.

## Design Tokens (mismo sistema del proyecto)
- Fondo de página: `oklch(0.985 0.003 75)`; superficie/cards: `#ffffff`; borde sutil: `oklch(0.92 0.006 75)`.
- Texto principal: `oklch(0.2 0.01 75)`; texto secundario: `oklch(0.5–0.55 0.01 75)`.
- Acento primario (botones, nav activo): `oklch(0.3 0.02 230)`.
- Acentos pastel por categoría/tipo: rosa hue 20 (Lápices/agotado), durazno hue 70 (Papelería/Oficina), menta hue 155 (Servicios), celeste hue 230 (categoría alternativa/nav activo).
- "Sin stock": fondo `oklch(0.93 0.06 20)`, texto `oklch(0.5 0.16 20)` — mismo hue rosa que categoría Lápices pero con más chroma para que se lea como alerta, no confundir con el tag de categoría normal.
- Tipografía: Poppins 600–700 (precios/títulos), Inter 400–700 (UI/cuerpo). Escala: 24px (título página), 18px (precio en card), 14.5px (nombre producto), 13.5–14px (UI/resumen), 12.5–13px (secundario), 10.5px (tags/badges).
- Radios: 8–9px (botones/steppers), 14px (cards), 20px (pills de filtro/tags).

## Sidebar
Igual a la ya usada en el resto de vistas de usuario: 236px, logo + nombre, grupo "Comprar" (Catálogo activo en celeste pastel) + grupo "Imprimir", footer con usuario + botón Salir.

## Interacciones
- Mockup estático. Al implementar:
  - Stepper +/− actualiza cantidad y recalcula el resumen en tiempo real.
  - Botón "Agotado" no dispara ninguna acción (disabled).
  - Filtros de tipo (Todo/Productos/Ofertas/Servicios) filtran el grid, no cambian de pantalla.
  - "Crear pedido" solo debe habilitarse si hay al menos un ítem con cantidad > 0.

## Files
- `Catálogo - Usuario.html` — mockup completo de la pantalla aprobada (referenciada como `9a` en el archivo de exploración `Productos - Rediseño.dc.html`).
