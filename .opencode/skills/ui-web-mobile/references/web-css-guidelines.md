# CSS para React Web

## Paso 0 (obligatorio): detectar el enfoque existente

**Antes de escribir una línea de CSS, inspecciona cómo estiliza el proyecto.** Añadir un segundo sistema de estilos es la causa más común de CSS muerto e inconsistencias.

| Señal en `package.json` | Enfoque | Qué hacer |
|---|---|---|
| `tailwindcss` | Tailwind | Úsalo. Tokens en `tailwind.config` o como `theme()` |
| `styled-components`, `@emotion/*` | CSS-in-JS | Úsalo. Define tokens en un `ThemeProvider` |
| `*.module.css` | CSS Modules | Úsalo. Añade tokens como variables CSS en `:root` |
| `vanilla-extract` | Zero-runtime CSS | Úsalo. Tokens en `theme.css.ts` con `createThemeContract` |
| Ninguno | — | **CSS Modules + variables CSS** (default de esta skill) |

```bash
# Chequeo rápido
cat package.json | grep -iE "tailwind|styled-components|emotion|vanilla-extract|sass|less"
ls src/**/*.module.css 2>/dev/null
```

**Si ya existe un sistema, respétalo.** No introduzcas CSS Modules en un proyecto de Tailwind, ni al revés. Si el sistema existente está roto o incompleto, dilo y propón migrarlo, no lo ignores en silencio.

---

## Custom properties como única fuente

```css
/* MAL */
.card { background: #ffffff; padding: 16px; border-radius: 14px; }
.btn  { background: #2563eb; color: #fff; padding: 12px 20px; }

/* BIEN */
.card { background: var(--color-surface); padding: var(--space-lg); border-radius: var(--radius-lg); }
.btn  { background: var(--color-primary); color: var(--color-primary-contrast); padding: var(--space-md) var(--space-xl); }
```

Cuatro colores crudos en dos clases ya son cuatro places que hay que editar si el tema cambia.

**Preferencia por variables CSS sobre el objeto `theme` de JS** cuando el estilo vive en CSS: permiten que el tema cambie sin re-render, y evitan el flash de primer render.

---

## Theming

El tema se declara como atributo en `<html>`, no como clase: los atributos son más especificidad-neutral y más fáciles de consultar desde CSS y desde JS.

```html
<html data-theme="darkNeonGlass">
```

```css
/* El orden importa:gana el primer selector que coincide. */
[data-theme='darkNeonGlass'] { --color-primary: #22d3ee; }
:root                              { --color-primary: #2563eb; }   /* default */
```

### Dark mode por preferencia del sistema

Cuando el proyecto tenga un tema claro y otro oscuro, usa `light-dark()` o variables duales. Nunca lo hagas con dos `<style>` condicionales en JS: produce flash en la carga.

```css
:root {
  color-scheme: light dark;
  --color-bg: light-dark(#ffffff, #121212);
  --color-text: light-dark(#0f172a, #f5f5f5);
}
```

Si el usuario elige el tema a mano (no solo por sistema), entonces sí: `data-theme` + `localStorage`, aplicado **antes** del paint con un script inline en `<head>`.

---

## Mobile-first

El estilo base es móvil. Cada breakpoint **añade**, nunca quita.

```css
/* Base: 1 columna */
.grid { display: grid; grid-template-columns: 1fr; gap: var(--space-lg); }

/* md: 2 columnas */
@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }

/* lg: 4 columnas */
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }
```

**`min-width` siempre, `max-width` casi nunca.** Un `max-width: 767px` significa "todo menos móvil", que obliga a pensar en 4 excepciones. Mobile-first significa pensar en 1 caso y extender.

### Grid fluido sin breakpoints

Cuando la repetición de columnas sea el único objetivo, `auto-fill` evita todos los media queries:

```css
/* Se adapta solo entre 1 y 4 columnas segun el ancho */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-lg);
}
```

Úsalo para grids de tarjetas. Reserva los breakpoints explícitos para cambios de layout reales (de 1 columna a sidebar + contenido).

---

## Layout

### `gap`, no márgenes

```css
/* MAL: el ultimo hijo tiene margen huérfano */
.card > * { margin-bottom: var(--space-lg); }

/* BIEN */
.card { display: flex; flex-direction: column; gap: var(--space-lg); }
```

`gap` no deja espacio residual y no necesita `:last-child`.

### Propiedades lógicas

Hacen que el CSS funcione igual en LTR y RTL, gratis.

```css
/* MAL */ margin-left: 16px;  padding-right: 24px;
/* BIEN */ margin-inline-start: 16px;  padding-inline-end: 24px;
```

Usa `padding-block` para arriba/abajo, `padding-inline` para izquierda/derecha.

### Tipografía y espaciado fluidos con `clamp()`

```css
/* Escala fluida entre 320px y 1280px de viewport */
.title {
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
  line-height: 1.1;
}

.section { padding-block: clamp(var(--space-xl), 5vw, var(--space-section)); }
```

`clamp(min, preferido, max)`. El valor del medio con `vw` hace la interpolación. Útil para evitar 6 media queries adjusting tipografía.

### Imágenes sin CLS

```css
.thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;   /* elimina el hueco de inline */
}
```

`aspect-ratio` reserva el espacio antes de que cargue la imagen: es la forma moderna de evitar el layout shift, mejor que `width`/`height` en el HTML cuando el ancho es fluido.

```html
<img src="..." alt="Modelo Nebula GT" width="640" height="480" loading="lazy" decoding="async" />
```

### Container queries

Cuando un componente debe adaptarse a **su contenedor** y no al viewport (una tarjeta en un sidebar estrecho vs. en un grid ancho):

```css
.cardHost { container-type: inline-size; }

@container (min-width: 420px) {
  .card { grid-template-columns: 180px 1fr; }
}
```

El orden correcto en el archivo: declara `container-type` en el **padre**, y las reglas `@container` van **después** de las del bloque principal.

---

## Especificidad y nomenclatura

**Prohibido:** `!important`, selectores por id (`#app .card`), anidamiento de más de 2 niveles.

```css
/* MAL: especificidad (0,1,0,0) + !important */
#app > div.card > header > h2 { color: #2563eb !important; }

/* BIEN: clase simple, especificidad (0,1,0) */
.cardTitle { color: var(--color-primary); }
```

**BEM para CSS plano**, y una clase por elemento para CSS Modules:

```css
/* BEM */
.productCard { }
.productCard__title { }
.productCard__price { }
.productCard--featured { }

/* CSS Modules */
.root { }        /* para el elemento raíz del componente */
.title { }
.image { }
```

En CSS Modules **no** anides selectores salvo que hagas falta:

```css
/* MAL */
.root:hover .title { color: var(--color-primary); }

/* BIEN */
.titleHover { }

/* MAL */
.root .price .amount { }

/* BIEN */
.amount { }
```

Cada clase es un archivo independiente con `hash`, así que el anidamiento no aporta nada y sí complica el mantenimiento.

---

## Accesibilidad

### Contraste (WCAG AA)

Mínimo **4.5:1** en texto normal, **3:1** en texto grande (≥18.66px bold o ≥24px). Verifica los dos casos que fallan en esta skill:

| Combinación | Ratio | Veredicto |
|---|---|---|
| `--color-accent` #60A5FA sobre `--color-bg` #FFFFFF | **2.5:1** | **Falla** para texto. Usar solo decorativo o sobre navy |
| `--color-accent` #60A5FA sobre `--color-navy` #0B1F3A | **6.8:1** | Pasa |
| `--color-primary` #2563EB sobre blanco | **5.2:1** | Pasa |
| `--color-primary` #22D3EE sobre `--color-bg` #121212 | **11:1** | Pasa |
| `--color-primary` #22D3EE sobre blanco | **1.9:1** | **Falla completamente** |
| `--color-text-muted` #64748B sobre blanco | **4.8:1** | Pasa |

**El error clásico:** poner el azul claro (`accent`) de eyebrow sobre fondo blanco. Se ve bien, no se lee. El eyebrow va sobre navy, o se usa `primary` sobre blanco.

Herramienta: cualquier devtools de contraste, o `npx @axe-core/cli`.

### Foco visible

Nunca elimines el outline sin sustituirlo:

```css
/* MAL */
:focus { outline: none; }

/* BIEN: solo para teclado, nunca para mouse */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Tamaño táctil

Mínimo **44×44px** en cualquier control interactivo. Un botón con `padding: 8px 12px` y `font-size: 13px` mide ~29px de alto: insuficiente.

```css
.iconButton { width: 44px; height: 44px; display: grid; place-items: center; }
```

El área táctil puede ser mayor que el visual: usa `padding` invisible o un pseudo-elemento.

### HTML semántico y ARIA

```html
<!-- MAL: div con onClick -->
<div onClick={goTo}>Reservar</div>

<!-- BIEN -->
<button type="button" onClick={goTo}>Reservar</button>
```

Un `<button>` gratis te da: navegación por teclado, foco, rol, estado disabled, y click en la barra espaciadora.

```html
<nav aria-label="Principal">
  <button aria-pressed={isFavorite} aria-label="Añadir a favoritos">
    <HeartIcon aria-hidden="true" />
  </button>
  <input id="email" type="email" aria-describedby="emailError" />
  <p id="emailError" role="alert">Introduce un email válido</p>
  <img src="..." alt="Sedán eléctrico en un garaje" />   <!-- descriptiva -->
  <img src="..." alt="" aria-hidden="true" />             <!-- decorativa -->
</nav>
```

`alt=""` en decorativas, texto real en informativas. Un `alt` de 200 caracteres no es un `alt`.

---

## Rendimiento

Anima **solo `transform` y `opacity`**. Cualquier otra propiedad dispara layout o paint:

```css
/* MAL: anima width -> reflow en cada frame */
.card { transition: width 0.3s, background-color 0.3s; }

/* BIEN: compositor, 60fps */
.card { transition: transform var(--motion-base), box-shadow var(--motion-base); }
.card:hover { transform: translateY(-2px); }
```

```css
/* MAL */
.card:hover { margin-top: -2px; }

/* BIEN */
.card:hover { transform: translateY(-2px); }
```

- `will-change` con **moderación**: solo durante la animación, y no en más de unos pocos elementos. Aplicado en exceso crea capas de composición y consume memoria.
- `backdrop-filter` es caro. Usa `@supports` con fallback sólido (ver `.glass` en `theme.css`).
- `content-visibility: auto` + `contain-intrinsic-size` para listas largas fuera de pantalla.

---

## Estados completos

Todo componente interactivo implementa los siete. Los que más se olvidan son `loading` y `error`.

```tsx
<button
  className={cx(styles.button, styles[variant], styles[size])}
  disabled={isDisabled || isLoading}
  aria-busy={isLoading}
  onClick={onPress}
>
  {isLoading ? <Spinner aria-hidden="true" /> : null}
  {label}
</button>
```

| Estado | Tratamiento |
|---|---|
| `default` | Base |
| `hover` | Solo en punteros finos (`@media (hover: hover)`) |
| `focus-visible` | Outline con token |
| `active` | `transform: scale(0.97)` o `translateY(1px)` |
| `disabled` | Opacidad reducida, `cursor: not-allowed`, **sin** pointer events que oculten el tooltip |
| `loading` | Spinner + `aria-busy`, bloquea interacción |
| `error` | Borde `danger` + mensaje con `role="alert"` |

En móvil, `hover` no existe: usa `@media (hover: hover)` para no dejar estados "pegados" tras un tap.

---

## Patrones visuales concretos

### Glow (Tema B)

```css
.glow { box-shadow: var(--shadow-md); }        /* 3 capas, ver design-tokens.md */
.glowRing { box-shadow: var(--effect-glow-ring); }
```

### Glassmorphism

```css
.glass {
  background: color-mix(in srgb, var(--color-surface-alt) 82%, transparent);
  border: 1px solid var(--color-border);
}
@supports (backdrop-filter: blur(12px)) {
  .glass { background: var(--effect-glass); backdrop-filter: blur(12px) saturate(140%); }
}
```

El `@supports` con fallback es obligatorio: sin él, en navegadores sin soporte, el panel queda transparente e ilegible.

### Degradado de texto

```css
.gradientTitle {
  background: var(--effect-metallic);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

`color: transparent` es obligatorio. Además, el texto degradado no se selecciona bien en algunos navegadores; si importa la legibilidad, usa un color sólido.

### Overlay de hero (Tema A)

```css
.hero { position: relative; isolation: isolate; }
.heroImage { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
.heroOverlay { position: absolute; inset: 0; background: var(--effect-hero-overlay); z-index: -1; }
```

`isolation: isolate` crea un contexto de apilamiento: los `z-index: -2` no se escapan detrás del body.

### Botón pill

```css
.pill { border-radius: var(--radius-pill); padding-inline: var(--space-xl); }
```

Para pill con borde cian y glow, combina `border-radius: pill` + `box-shadow: effect-glow-ring`.

### Skeleton

```css
.skeleton {
  background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 37%, var(--color-surface-alt) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: var(--radius-md);
}
@keyframes shimmer { from { background-position: 100% 50% } to { background-position: 0 50% } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
```

Un skeleton debe imitar la silueta del contenido real, no ser un rectángulo genérico. Especifica `aspect-ratio` para no saltar el layout al cargar.
