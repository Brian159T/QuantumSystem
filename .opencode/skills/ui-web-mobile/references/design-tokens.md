# Design Tokens

Referencia de los tres temas. Los valores viven en `assets/tokens/tokens.ts` (tipado) y `assets/tokens/theme.css` (CSS). Este documento explica **por qué** y **cuándo usar cada token**, no repite la lista completa de valores.

## Regla de oro

**Un componente nunca escribe un valor crudo.** Si escribes `#2563EB` o `16px` en un componente, algo falta: o el token no existe (créalo) o estás usando el equivocado (búscalo).

```tsx
// MAL
<div style={{ background: '#2563EB', padding: 16 }}>Reservar</div>

// BIEN
<div style={{ background: theme.colors.primary, padding: theme.spacing.lg }}>
  Reservar
</div>
```

## Anatomía de un token semántico

Un token **semántico** describe el *rol* (qué hace), no el *aspecto* (cómo se ve). Eso permite cambiar el tema sin tocar componentes.

```
--color-primary          rol: "color de acción"     -> se cambia el valor, no el componente
--color-blue-500         aspecto: "azul 500"         -> el componente se acopla al color exacto
```

Por eso los tokens son `primary` / `surface` / `textMuted` y **nunca** `blue` / `gray500` / `textGray`.

### Escala obligatoria de colores

Todo tema debe exponer estos 12. Si falta uno, el componente que lo necesita acaba hardcodeando.

| Token | Rol | Uso típico |
|---|---|---|
| `bg` | Fondo de página | `<body>`, `SafeAreaView` |
| `surface` | Superficie base | tarjetas, paneles, headers |
| `surfaceAlt` | Superficie secundaria | campos, filas, hovers, skeletons |
| `border` | Línea hairline | separadores, contorno de input |
| `text` | Texto principal | títulos, párrafos |
| `textMuted` | Texto secundario | captions, metadatos, placeholders |
| `primary` | Acción principal | CTA, enlaces, precio, icono activo |
| `primaryContrast` | Contenido sobre `primary` | texto e iconos dentro del botón |
| `accent` | Acento decorativo | palabra resaltada, badge, progreso |
| `success` | Positivo | estado "All Good", confirmaciones |
| `warning` | Advertencia | combustible bajo, servicio próximo |
| `danger` | Error/destructivo | eliminar, error de validación |

Los temas añaden los suyos: Tema A expone `navy` + `sky`, Tema B `metallic` + `metallicInk`, Tema C `actionAccents.{fuel,service,expense,health}`.

---

## Tema A — `lightBlueCommerce` (web)

Renta/venta de autos. Azul oscuro para el "chrome" (lo que envuelve) y azul claro para la acción (lo que el usuario toca).

### Lógica de color

| Familia | Color | Dónde |
|---|---|---|
| Navy | `#0B1F3A` / `#0A1A33` | Barra superior, footer, panel de búsqueda, banners |
| Primary | `#2563EB` | CTA, precio, enlaces, iconos |
| Accent | `#60A5FA` | Palabra resaltada del hero, "eyebrow labels" |
| Accent soft | `#DBEAFE` | Fondo de chip, área de selección |
| Neutros | `#0F172A` / `#64748B` | Texto y texto secundario |

**Convención:** *lo azul oscuro es estructura, lo azul claro es acción.* Si un elemento invita a la interacción, va en `primary`. Si es contenedor o cromo, va en `navy`.

### Radios y sombras

Radios 6-18px (`--radius-md` = 10 es el valor por defecto de tarjetas). Sombras suaves **con tinte azul** (`rgba(11,31,58,...)`), nunca gris neutro: sobre fondo blanco, una sombra gris se ve sucia; con tinte navy parece parte de la paleta.

### Tipografía

Sans geométrica: `Inter` o `Poppins`. Botones en mayúsculas con `letter-spacing: 0.08em` y peso 700. Esto es lo que da el tono "premium sin esfuerzo" del tema.

---

## Tema B — `darkNeonGlass` (web)

E-commerce premium. Cian como único acento sobre superficie casi negra con borde hairline.

### Regla del borde hairline

Sobre fondo oscuro, un borde **gris opaco se lee como línea de error**. Usa blanco a baja opacidad: `--color-border: rgba(255, 255, 255, 0.08)`. Ese es el trick que separa "premium" de "prototype".

### Glow (receta)

El glow **no** es un `box-shadow` normal. Necesita tres capas o se ve plano:

```css
box-shadow:
  0 0 0 1px rgba(34, 211, 238, 0.4),   /* anillo: separa del fondo */
  0 0 18px rgba(34, 211, 238, 0.28),  /* halo medio */
  0 0 48px rgba(34, 211, 238, 0.12);  /* halo difuso exterior */
```

En `tokens.ts` ya está como `effects.glow`. En CSS se resuelve con `--shadow-md`.

**Importante:** en Tema B las sombras de `elevation` tienen `offset 0 0` a propósito, porque el glow es radial. En los Temas A y C el offset es vertical, porque son sombras difusas. Es la diferencia entre "resplandor" y "altura".

### Degradado de texto

```css
.title {
  background: var(--effect-metallic);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;   /* obligatorio: sin esto, el texto es invisible */
}
```

`color: transparent` es el paso que se olvida. Sin él se ve un rectángulo de texto invisible.

### Contraste — punto crítico

Cian `#22D3EE` sobre `#121212` da **~11:1**, muy por encima de AA. Pero cian sobre **blanco** da **~1.9:1**, inaceptable. En Tema B, `primary` **nunca** se usa como texto sobre superficie clara. Usa `--color-primary-contrast` (casi negro) como relleno, o invierte la relación.

### Tarjeta metálica

Degradado plateado + texto oscuro encima:

```css
.productCard--metallic {
  background: var(--effect-metallic);
  color: var(--color-metallic-ink);
}
```

Consecuencia: dentro de una tarjeta metálica **todos** los tokens de texto del tema dejan de servir. Usa `metallic-ink` y, para los acentos, el acento del tema sobre el plateado (contraste suficiente con `#00E5FF`).

---

## Tema C — `darkGreenMobile` (React Native)

App de gestión de vehículo. Verde oscuro, un solo acento, radios grandes.

### Lógica de color

| Familia | Color | Dónde |
|---|---|---|
| Fondo | `#0B1410` | Pantalla completa |
| Superficie | `#16231C` | Tarjetas, campos |
| Acento | `#22C55E` | Estado activo, progreso, badges, palabra del título |

El verde **solo** significa "activo/salud". Por eso los iconos de acciones usan colores secundarios distintos (`actionAccents`): naranja combustible, azul servicio, morado gastos, verde salud. Si todo fuera verde, el usuario no distinguiría las acciones.

### Radios grandes

16-24px (`--radius-md` = 16, `--radius-lg` = 20). Es una convención de app móvil, no de web: sensación de "caja" y separación visual clara en pantallas pequeñas.

### Contraste

`textMuted: #8FA99A` sobre `bg: #0B1410` da **~7.4:1**, bien por encima de AA. Verde `#22C55E` sobre el fondo da **~8.9:1**. El acento es seguro como texto; no hace falta version oscura para texto.

### Sin unidades CSS

En RN los números son puntos, no unidades: `padding: 16`, no `'16px'`. Los tokens de `spacing` son `number`, no string, precisamente para poder compartirlos con RN sin conversión.

---

## Espaciado (escala de 4px)

Compartida por los tres temas. No inventes valores fuera de la escala.

| Token | Valor | Uso |
|---|---|---|
| `xs` | 4 | Separación dentro de un chip |
| `sm` | 8 | Gap entre icono y etiqueta |
| `md` | 12 | Padding interno pequeño |
| `lg` | 16 | Padding de tarjeta, grid gap |
| `xl` | 24 | Padding de sección |
| `xxl` | 40 | Separación entre bloques mayores |
| `section` | 72 | Padding vertical de sección completa |

Un valor que **no** está en la escala (17, 23, 30) indica que algo no cuadra: o se round-ea al token más cercano, o falta un token de la escala.

## Movimiento

| Token | Valor | Uso |
|---|---|---|
| `fast` | 150ms | Hover, feedback de tap |
| `base` | 220ms | Transiciones de estado, dropdowns |
| `slow` | 400ms | Paneles, modales, cambios grandes |
| `ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Entrada/salida |
| `easeOut` | `cubic-bezier(0, 0, 0.2, 1)` | Solo salida |

Regla de duración: **0 < duración < distancia recorrida / velocidad perceptible**. Por eso los hovers son rápidos y los modales no. Y todo se anula bajo `prefers-reduced-motion`.

## Z-index

Cinco niveles y ni uno más. Si necesitas un sexto, probablemente estás resolviendo con apilado un problema de layout.

| Token | Valor | Uso |
|---|---|---|
| `base` | 0 | Flujo normal |
| `content` | 1 | Contenido elevated dentro de una tarjeta |
| `sticky` | 100 | Headers sticky, tab bars |
| `overlay` | 200 | Modales, dropdowns, glass headers |
| `modal` | 300 | Modales sobre overlay |
| `toast` | 400 | Notificaciones, siempre encima de todo |

## Breakpoints

`sm: 480`, `md: 768`, `lg: 1024`, `xl: 1280`. Mobile-first: el estilo base es móvil, y cada breakpoint **añade**.

```css
/* Base: movil */
.grid { grid-template-columns: 1fr; }

/* md: tablet */
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }
```

## Cómo añadir un token nuevo

1. Añádelo a **los tres temas** en `tokens.ts` (o a los que apliquen) y a `theme.css`.
2. Verifica que el tipo derivado no rompa componentes: `as const satisfies Theme` obliga a actualizar los tres.
3. Si es un token de un solo tema, decláralo como opcional (`glow?: string`).
4. Si no lo puedes nombrar como rol semántico, probablemente no es un token: es un valor de un componente.
