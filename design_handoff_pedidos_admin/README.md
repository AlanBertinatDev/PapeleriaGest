# Handoff: Pedidos (admin) — jerarquía de estados y buscador con filtros

## Overview
Rediseño de la pantalla "Pedidos" del panel de administración de Bertinat Papelería. Referenciado como `17a` en `Productos - Rediseño.dc.html`. Mismo sistema visual que el resto del panel admin.

## Sobre los archivos de este bundle
Los archivos HTML de este paquete son **referencias de diseño**, no código de producción para copiar tal cual. Son prototipos estáticos que muestran el look final y el comportamiento esperado. La tarea es **recrear este diseño en el entorno de código real de la app** (el framework/stack que ya use el proyecto — React, Vue, etc.), usando sus componentes y patrones existentes, no incrustar este HTML directamente.

## Fidelidad
**Alta fidelidad (hifi)**: colores, tipografía, espaciado e interacciones están definidos exactamente. El desarrollador debe recrear la UI con precisión, usando las librerías/componentes ya existentes en el código base.

## Problema que resuelve
La versión anterior tenía varios problemas de jerarquía y usabilidad:
1. El badge de estado del pedido y el badge de estado de un ítem individual (ej. "Examen (Impresión) x1 ENTREGADO") usaban el mismo estilo visual (pill verde claro) y competían por atención.
2. La franja de color a la izquierda de la tarjeta no tenía relación visual clara con el badge de estado.
3. El buscador "Buscar por cliente..." no tenía ícono ni acompañamiento (ej. filtro de fecha), quedando aislado.
4. Las tarjetas se estiraban a lo ancho de la pantalla en vez de tener un ancho fijo legible.
5. El botón "Descargar" no tenía ícono.
6. Los contadores en las tabs inactivas (Pendientes 0, En revisión 0, etc.) tenían bajo contraste.

## Qué cambia
1. **Badge de estado del pedido**: pill lleno de color (ej. `oklch(0.55 0.13 155)` fondo, texto blanco), en mayúsculas, esquina superior derecha de la tarjeta.
2. **Tag de estado de ítem individual** (cuando un ítem específico como una impresión tiene su propio estado): tag chico en **outline** (borde de color, texto de color, fondo transparente), minúsculas — visualmente subordinado al badge del pedido.
3. **Franja lateral** reducida de un grosor genérico a 4px, y coloreada con el **mismo tono** que el badge de estado del pedido (verde si entregado, ámbar si pendiente, rojo si en revisión/cancelado) — así queda claro que es el mismo dato repetido para escaneo rápido en la lista.
4. **Buscador con ícono de lupa** + **filtro de fecha** al lado, misma fila, incluido aunque no esté funcional en el mock (para que el dev sepa que va ahí).
5. **Grid de tarjetas a ancho fijo** (`repeat(auto-fill, 360px)`) en vez de flex que se estira — las tarjetas no crecen con el ancho de pantalla, se agregan más columnas.
6. **Botón "Descargar"** con ícono de descarga (outline), antes del label.
7. **Contadores de tabs inactivas**: fondo gris (`oklch(0.88 0.006 75)`) con texto oscuro (`oklch(0.35 0.01 75)`) en vez de gris sobre gris — el tab activo mantiene el contador en azul de acento sobre blanco.

## Datos que necesita el agente/dev
- El color de la franja lateral y del badge de pedido deben derivar de un único campo de estado (`pendiente | en_revision | entregado | cancelado`) — no son dos valores independientes a mantener sincronizados manualmente.
- El tag de ítem individual solo aparece si ese ítem específico tiene un estado distinto al del pedido general (ej. una impresión ya retirada dentro de un pedido más grande aún pendiente).
- El filtro de fecha es un selector (rango o "cualquier fecha") — no implementado funcionalmente en el mock, solo maquetado.

## Tokens usados (ver también README de `design_handoff_productos_papeleria` para la paleta completa del admin)
- Acento primario / sidebar activo: `oklch(0.3 0.02 230)` texto, `oklch(0.94 0.03 230)` fondo.
- Estado "Entregado" (verde): `oklch(0.55 0.13 155)` badge lleno / `oklch(0.62 0.13 155)` franja / `oklch(0.45 0.13 155)` texto outline del tag de ítem.
- Gris neutro (contador de tab inactivo): `oklch(0.88 0.006 75)` fondo / `oklch(0.35 0.01 75)` texto.
- Tipografía: Poppins 700 24px (título de página) y 700 16px (nombre de pedido) y 700 19px (total); Inter 600/500/400 en 10.5–13.5px para el resto.
- Radios: 14px (tarjetas), 8-10px (botones/inputs), 20px (pills/badges/tags).
- Grid de tarjetas: `repeat(auto-fill, 360px)`, gap 18px.

## Files
- `Pedidos - 17a.html` — mockup estático standalone de esta pantalla.
- Ver `Productos - Rediseño.dc.html`, sección `id="17a"`, para el mockup vivo dentro del archivo de exploración completo.
