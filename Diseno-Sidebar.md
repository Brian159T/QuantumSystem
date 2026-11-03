# Sidebar — Guía de diseño

## Objetivo y referencias

Diseñar una barra lateral inspirada en la captura de «Knowledge»: logo compacto en la parte superior, navegación vertical ligera, iconos oscuros y selección con forma de píldora. Adaptarla a los fondos y la sobriedad del documento «Apple — Style Reference» adjunto.

Esta guía se limita al sidebar y a su integración visual con la página. Los valores son propuestas de implementación, no mediciones exactas ni colores extraídos de la imagen. No implica utilizar la marca o el logo de Apple.

## Dirección visual

La barra debe sentirse como parte del lienzo: clara, silenciosa, sin sombras fuertes ni un panel oscuro que domine la pantalla. Conservar de la captura la composición y el ritmo; del documento adjunto, los fondos Frost e Ice, la tipografía limpia, las líneas finas y el azul de interacción.

La referencia del documento descarta sidebars en su composición general; aquí se adapta únicamente su lenguaje visual porque la barra lateral es el componente solicitado.

## Paleta compatible

| Uso | Valor | Criterio |
| --- | --- | --- |
| Fondo de la página | `#F5F5F7` | Frost del documento adjunto |
| Fondo principal del sidebar | `#F4F8FB` | Ice: tono frío muy suave |
| Fondo alternativo del sidebar | `#F5F5F7` | Para una integración completamente neutra |
| Logo y texto principal | `#1D1D1F` | Carbon |
| Texto secundario | `#707070` | Ayuda, secciones o información complementaria |
| Separador derecho | `#D2D2D7` | Línea de 1 px |
| Ítem activo | `#FFFFFF` | Píldora blanca, como en la captura |
| Texto e icono activos | `#1D1D1F` | Mantiene la selección sobria |
| Hover | `#EAF0F5` | Variación propuesta sobre Ice |
| Foco de teclado | `#0071E3` | Azul funcional del documento |
| Acción principal, si existe | `#0071E3` | Uso puntual, no en todos los elementos |

El celeste más visible de la captura se suaviza para convivir con el fondo Frost. No trasladar el violeta de las gráficas o los banners al sidebar: pertenece al contenido de la referencia, no a su navegación.

## Estructura y proporciones

| Elemento | Especificación propuesta |
| --- | --- |
| Ancho expandido | 240 px |
| Alto | Alto disponible de la ventana |
| Padding lateral | 20 px |
| Padding superior | 24 px |
| Logo | Símbolo de 24 px y nombre de marca |
| Separación logo–navegación | 40 px |
| Altura mínima de ítem | 44 px |
| Espacio entre ítems | 6 px |
| Padding interno del ítem | 12 px horizontal, 10 px vertical |
| Icono | 18 × 18 px; caja fija de 20 px |
| Separación icono–texto | 10 px |
| Radio de selección | 999 px |
| Borde derecho | 1 px sólido `#D2D2D7` |
| Sombra | Ninguna |

Mantener la marca y todos los ítems alineados sobre la misma columna. Evitar contenedores adicionales, tarjetas y separadores entre cada opción. Si el menú supera el alto disponible, permitir desplazamiento vertical dentro de la barra.

## Logo e identidad

### Composición

Usar un símbolo geométrico compacto a la izquierda y el nombre real del producto a la derecha. En la captura se observa una marca orgánica formada por pequeños lóbulos redondeados, en un único color oscuro. Recuperar esa sencillez sin asumir que el nombre «Knowledge» corresponde al proyecto del usuario.

- Símbolo: 24 × 24 px, sin fondo, contenedor, sombra ni degradado.
- Nombre: 19 px, peso 500–600, color Carbon y tracking de `-0.02em`.
- Espacio símbolo–nombre: 8 px.
- Área libre mínima alrededor del conjunto: 12 px.
- Utilizar SVG con `currentColor` para una representación nítida.
- Si el proyecto ya tiene logo, utilizar ese archivo y ajustar su tamaño; no sustituirlo automáticamente.
- No utilizar el logo de Apple ni inventar una nueva identidad comercial.

### Símbolo provisional en SVG

El siguiente símbolo de tres círculos es una aproximación geométrica para prototipos, no el archivo original de la captura. Reemplazarlo por el logo definitivo al integrar la marca.

```html
<svg width="24" height="24" viewBox="0 0 24 24"
     fill="currentColor" aria-hidden="true" focusable="false">
  <circle cx="7" cy="11" r="4.5" />
  <circle cx="15.5" cy="6.5" r="4.5" />
  <circle cx="15" cy="16" r="4.5" />
</svg>
```

Cuando el conjunto enlace al inicio, su nombre accesible debe ser «[Nombre del producto] — Inicio». El símbolo es decorativo si el nombre ya aparece como texto.

## Tipografía e iconos

Usar la misma familia que el resto del producto. Preferir Inter si está disponible; en caso contrario, la pila de fuentes del sistema. SF Pro puede utilizarse cuando ya esté disponible en el entorno, sin convertirla en una dependencia obligatoria.

| Rol | Tamaño | Peso | Interlineado |
| --- | --- | --- | --- |
| Marca | 19 px | 600 | 24 px |
| Navegación | 14 px | 400 | 20 px |
| Navegación activa | 14 px | 500 | 20 px |
| Título de grupo opcional | 12 px | 500 | 16 px |
| Información auxiliar | 12 px | 400 | 16 px |

Los iconos de la captura son compactos y mayormente sólidos. Elegir una sola familia con ese estilo; si el producto utiliza iconos de línea, mantenerla con trazo consistente de aproximadamente 1.75 px. No mezclar estilos, emojis e iconos multicolor. Reservar un chevron pequeño al extremo derecho para opciones que abran submenús.

## Estados de navegación

| Estado | Apariencia y comportamiento |
| --- | --- |
| Reposo | Fondo transparente; texto e icono Carbon |
| Hover | Fondo `#EAF0F5`, sin desplazamiento ni cambio de escala |
| Activo | Píldora blanca; texto de peso 500; `aria-current="page"` en el enlace |
| Foco | Contorno azul de 2 px y separación de 2 px; visible también en el activo |
| Submenú abierto | Chevron girado; botón con `aria-expanded="true"` |
| Deshabilitado | Evitarlo si no aporta contexto; si existe, comunicar el estado y bloquear la acción |

La selección activa debe permanecer visible durante hover y foco. No añadir al mismo tiempo píldora, franja azul lateral, sombra y relleno azul. En esta propuesta la píldora blanca es el indicador principal.

Las rutas se representan mediante enlaces. Los controles que expanden submenús son botones. La estructura usa `aside` y `nav` con una etiqueta accesible. Los nombres deben conservarse completos; si no caben, permitir dos líneas y mantener 44 px como altura mínima.

## Integración con el contenido

- El contenido principal conserva el fondo `#F5F5F7`.
- Separar el contenido del borde del sidebar con 32–40 px en escritorio.
- Utilizar superficies blancas o Ice para tarjetas existentes, con bordes discretos.
- Reservar el azul saturado para acciones relevantes y foco.
- No aplicar el degradado celeste–lavanda a toda la aplicación por defecto: la compatibilidad principal se basa en la paleta del Markdown adjunto.
- Si la aplicación ya tiene rutas y permisos, conservarlos y aplicar solo los cambios visuales.

Los rótulos «Home», «All courses» o «Statistics» pertenecen al ejemplo educativo. Sustituirlos por la navegación real del producto sin modificar su lógica.

## Adaptación a pantallas pequeñas

- Desde 1024 px: sidebar expandido de 240 px.
- Entre 768 y 1023 px: se puede mostrar una barra de 72 px con el símbolo y los iconos. Conservar nombres accesibles y etiquetas visibles al enfocar o pasar el cursor.
- Por debajo de 768 px: ocultar la barra fija y abrir un panel lateral mediante un botón de menú de al menos 44 × 44 px.
- El panel móvil tendrá un ancho máximo de 280 px, limitado por `calc(100vw - 32px)`; fondo sólido Ice y una capa exterior oscura suave.
- Al abrirlo, mover el foco al panel; permitir cierre con Escape, botón de cerrar y clic en la capa exterior. Retener el foco dentro mientras sea modal y devolverlo al botón de apertura al cerrar.
- Evitar desbordamiento horizontal a 320 px de ancho y con zoom del 200 %.

## Base CSS

Las clases siguientes describen el aspecto del componente; el enrutamiento y la gestión del foco se implementan en la aplicación.

```css
:root {
  --canvas: #f5f5f7;
  --sidebar-bg: #f4f8fb;
  --sidebar-ink: #1d1d1f;
  --sidebar-muted: #707070;
  --sidebar-border: #d2d2d7;
  --sidebar-hover: #eaf0f5;
  --sidebar-active: #fff;
  --focus: #0071e3;
  --sidebar-width: 240px;
  --font-ui: Inter, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
}

.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100dvh;
  background: var(--canvas);
  font-family: var(--font-ui);
}

.sidebar {
  box-sizing: border-box;
  position: sticky;
  top: 0;
  height: 100dvh;
  min-width: 0;
  padding: 24px 20px;
  overflow-y: auto;
  background: var(--sidebar-bg);
  color: var(--sidebar-ink);
  border-right: 1px solid var(--sidebar-border);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin-bottom: 40px;
  color: inherit;
  text-decoration: none;
  font-size: 19px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.02em;
}

.sidebar__brand svg { flex: 0 0 24px; }
.sidebar__list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }

.sidebar__item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sidebar-ink);
  text-decoration: none;
  text-align: left;
  font: 400 14px/20px var(--font-ui);
  cursor: pointer;
  transition: background-color 160ms ease;
}

.sidebar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}

.sidebar__icon svg { width: 18px; height: 18px; }
.sidebar__chevron { margin-left: auto; flex-shrink: 0; }
.sidebar__item:hover { background: var(--sidebar-hover); }
.sidebar__item[aria-current="page"] {
  background: var(--sidebar-active);
  font-weight: 500;
}

.sidebar__item:focus-visible,
.sidebar__brand:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar__item { transition: none; }
}
```

Las variantes colapsada y móvil requieren sus propios estilos y controles según las reglas anteriores. No ocultar el texto sin proporcionar un nombre accesible.

## Prompt de implementación

> Rediseña únicamente el sidebar y su cabecera de marca siguiendo esta guía. Toma de la captura su composición ligera, el símbolo compacto, la navegación vertical con iconos oscuros y la selección en píldora blanca. Adapta la paleta al documento Apple adjunto: página #F5F5F7, sidebar #F4F8FB, texto #1D1D1F, borde #D2D2D7 y foco #0071E3. Usa 240 px de ancho, 20 px de padding lateral, ítems de al menos 44 px e iconos de 18 px. Conserva la marca real, rutas, permisos y funcionalidades existentes. Si no hay logo definitivo, usa el SVG provisional indicado sin adoptar el nombre Knowledge ni el logo de Apple. Mantén el contenido principal y sus funcionalidades. Implementa navegación accesible, estados activo/hover/foco y panel móvil con gestión del foco. Evita sombras fuertes, degradados intensos, iconos multicolor y adornos adicionales.

## Verificación visual y funcional

- El sidebar combina con el fondo Frost sin convertirse en un bloque de color dominante.
- Marca e iconos conservan nitidez y proporciones uniformes.
- El ítem activo se identifica por la píldora blanca y el peso de su texto.
- La navegación completa funciona con teclado y el foco siempre es visible.
- Los nombres reales y las rutas existentes se mantienen.
- El panel móvil abre y cierra correctamente; no hay desbordamientos.
- Comprobar contraste de texto y controles sobre los colores finales utilizados.
