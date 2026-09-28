# Patrones web (React + CSS Modules)

Recetas completas. Cada una está lista para copiar: componente + estilos + datos de ejemplo ficticios.

> **Datos de ejemplo:** todos los nombres, precios y marcas son inventados. No uses logos, nombres de marca reales ni imágenes de referencias de diseño: se ven igual con nombres neutros y fotos de placeholder.

## Bloques base (usar en cualquier proyecto)

### Button

```tsx
// components/Button.tsx
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import styles from './Button.module.css'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        styles.root,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className={styles.spinner} aria-hidden="true" /> : iconLeft}
      <span>{children}</span>
    </button>
  )
}
```

```css
/* components/Button.module.css */
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-weight: 700;
  letter-spacing: var(--tracking-button);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease),
    transform var(--motion-fast) var(--motion-ease),
    box-shadow var(--motion-fast) var(--motion-ease);
}

.root:disabled { opacity: 0.5; cursor: not-allowed; }
.root:not(:disabled):active { transform: scale(0.97); }

.primary {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}
.primary:not(:disabled):hover { background: var(--color-primary-hover); }

.outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.outline:not(:disabled):hover { background: var(--color-accent-soft); }

.ghost { background: transparent; color: var(--color-text); }
.ghost:not(:disabled):hover { background: var(--color-surface-alt); }

.sm { padding: var(--space-sm) var(--space-lg); font-size: 12px; min-height: 36px; }
.md { padding: var(--space-md) var(--space-xl); font-size: var(--font-size-button); min-height: 44px; }
.lg { padding: var(--space-lg) var(--space-xxl); font-size: 15px; min-height: 52px; }

.fullWidth { width: 100%; }

.spinner { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .root { transition: none; }
  .spinner { animation-duration: 1.6s; }
}

/* Los estilos de hover solo tienen sentido con puntero fino */
@media (hover: hover) {
  .primary:not(:disabled):hover { background: var(--color-primary-hover); }
}
```

### Card, Badge, Chip, SectionHeader

```tsx
// components/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = HTMLAttributes<HTMLElement> & {
  elevated?: boolean
  metallic?: boolean
  children: ReactNode
}

export function Card({ elevated = true, metallic = false, className, children, ...rest }: CardProps) {
  return (
    <section
      className={[styles.root, elevated ? styles.elevated : null, metallic ? styles.metallic : null, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </section>
  )
}
```

```css
.root {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.elevated { box-shadow: var(--shadow-sm); }
.hoverable { transition: transform var(--motion-base) var(--motion-ease), box-shadow var(--motion-base) var(--motion-ease); }

/* Tarjeta metálica: solo Tema B. El texto pasa a tinta oscura. */
.metallic {
  background: var(--effect-metallic);
  border-color: transparent;
  color: var(--color-metallic-ink);
  box-shadow: var(--shadow-md);
}
```

```tsx
// components/Badge.tsx
import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

type BadgeProps = { tone?: Tone; children: ReactNode }

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={[styles.root, styles[tone]].join(' ')}>{children}</span>
}
```

```tsx
// components/SectionHeader.tsx
import type { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

type SectionHeaderProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  action?: ReactNode
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <header className={styles.root}>
      <div>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </header>
  )
}
```

```css
/* components/SectionHeader.module.css */
.root {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* Eyebrow: azul claro SOLO sobre navy. Sobre fondo claro, usaria --color-primary. */
.eyebrow {
  font-size: var(--font-size-eyebrow);
  font-weight: 700;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 0 0 var(--space-sm);
}

[data-theme='lightBlueCommerce'] .eyebrow { color: var(--color-primary); }

.title {
  font-size: var(--font-size-heading);
  font-weight: 700;
  line-height: var(--line-height-heading);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}
.description { color: var(--color-text-muted); margin: var(--space-sm) 0 0; }
.action { flex-shrink: 0; }

@media (max-width: 640px) {
  .root { flex-direction: column; align-items: flex-start; }
}
```

---

## Tema A — `lightBlueCommerce`

### 1. Hero con overlay + panel de búsqueda

```tsx
// features/hero/Hero.tsx
import { MapPin, Calendar, Clock, Search } from 'lucide-react'
import { Button } from '@/components/Button'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.root}>
      <img
        src="/images/hero-vehiculo.jpg"
        alt="Vehículo eléctrico Aurora GT estacionado frente a una costa al atardecer"
        className={styles.image}
        fetchPriority="high"
        decoding="async"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <p className={styles.eyebrow}>Alquiler de vehículos eléctricos</p>
        <h1 className={styles.title}>
          Conduce el <span className={styles.titleAccent}>siguiente</span> nivel
        </h1>
        <p className={styles.lead}>
          Reserva en menos de dos minutos. Sin sorpresas y sin costes ocultos.
        </p>

        {/* Panel de busqueda: contenedor navy con campos blancos en fila */}
        <form className={styles.searchPanel} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.field}>
            <MapPin size={18} aria-hidden="true" />
            <span className={styles.fieldLabel}>Ubicación</span>
            <input
              type="text"
              name="ubicacion"
              placeholder="Ciudad o aeropuerto"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <Calendar size={18} aria-hidden="true" />
            <span className={styles.fieldLabel}>Fecha</span>
            <input type="date" name="fecha" className={styles.input} />
          </label>

          <label className={styles.field}>
            <Clock size={18} aria-hidden="true" />
            <span className={styles.fieldLabel}>Hora</span>
            <input type="time" name="hora" className={styles.input} />
          </label>

          <Button type="submit" size="lg" iconLeft={<Search size={18} aria-hidden="true" />}>
            Buscar
          </Button>
        </form>
      </div>
    </section>
  )
}
```

```css
/* features/hero/Hero.module.css */
.root {
  position: relative;
  isolation: isolate;         /* contexto de apilamiento propio */
  min-height: min(78vh, 720px);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--color-navy);
}

.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: -2;
  display: block;
}

/* Overlay azul oscuro desde la izquierda para legibilidad del texto */
.overlay {
  position: absolute;
  inset: 0;
  background: var(--effect-hero-overlay);
  z-index: -1;
}

.content {
  width: min(1240px, 100% - var(--space-xl) * 2);
  margin-inline: auto;
  padding-block: var(--space-section);
  color: #fff;
}

.eyebrow {
  font-size: var(--font-size-eyebrow);
  font-weight: 700;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-accent);   /* azul claro sobre navy: 6.8:1, pasa AA */
  margin: 0 0 var(--space-md);
}

.title {
  font-size: clamp(2.5rem, 1.6rem + 4vw, var(--font-size-display));
  font-weight: 800;
  line-height: var(--line-height-display);
  letter-spacing: var(--tracking-tight);
  margin: 0 0 var(--space-lg);
  max-width: 16ch;
}

/* Palabra resaltada en azul claro */
.titleAccent { color: var(--color-accent); }

.lead {
  font-size: clamp(1rem, 0.95rem + 0.3vw, 1.15rem);
  color: rgba(255, 255, 255, 0.85);
  max-width: 46ch;
  margin: 0 0 var(--space-xl);
}

/* ---- Panel de busqueda: navy, radios generosos, campos blancos ---- */
.searchPanel {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-sm);
  background: var(--color-navy-deep);
  border-radius: var(--radius-xl);
  padding: var(--space-md);
  box-shadow: var(--shadow-lg);
  max-width: 860px;
}

.field {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: #fff;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  min-height: 52px;
}

.fieldLabel {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--color-text);
  padding: 0;
}
.input:focus { outline: none; }
/* El foco se comunica con el borde del contenedor, no con el input desnudo */
.field:focus-within {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

/* Tablet: campos en fila */
@media (min-width: 768px) {
  .searchPanel { grid-template-columns: repeat(3, 1fr) auto; align-items: center; }
}

/* Desktop: boton a lo ancho del panel, debajo de los campos */
@media (min-width: 1024px) {
  .searchPanel { grid-template-columns: 1fr 0.8fr 0.7fr; }
  .searchPanel > button { grid-column: 1 / -1; }
}
```

### 2. ProductCard del Tema A

```tsx
// features/catalog/ProductCard.tsx
import { Users, Cog, Briefcase, Heart } from 'lucide-react'
import { useState } from 'react'
import styles from './ProductCard.module.css'

export type Vehicle = {
  id: string
  name: string
  category: string
  imageUrl: string
  seats: number
  transmission: 'Automático' | 'Manual'
  bags: number
  pricePerDay: number
}

type ProductCardProps = { vehicle: Vehicle }

export function ProductCard({ vehicle }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false)

  return (
    <article className={styles.root}>
      <div className={styles.media}>
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.name}, ${vehicle.category}`}
          className={styles.image}
          width={640}
          height={480}
          loading="lazy"
          decoding="async"
        />
        <button
          type="button"
          className={styles.favorite}
          onClick={() => setFavorite((v) => !v)}
          aria-pressed={favorite}
          aria-label={favorite ? `Quitar ${vehicle.name} de favoritos` : `Añadir ${vehicle.name} a favoritos`}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body}>
        <p className={styles.category}>{vehicle.category}</p>
        <h3 className={styles.name}>{vehicle.name}</h3>

        <ul className={styles.meta}>
          <li><Users size={16} aria-hidden="true" />{vehicle.seats} asientos</li>
          <li><Cog size={16} aria-hidden="true" />{vehicle.transmission}</li>
          <li><Briefcase size={16} aria-hidden="true" />{vehicle.bags} maletas</li>
        </ul>

        <div className={styles.footer}>
          <p className={styles.price}>
            {vehicle.pricePerDay} <span className={styles.priceUnit}>/ día</span>
          </p>
          <button type="button" className={styles.book}>Reservar</button>
        </div>
      </div>
    </article>
  )
}
```

```css
/* features/catalog/ProductCard.module.css */
.root {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--motion-base) var(--motion-ease), box-shadow var(--motion-base) var(--motion-ease);
}
@media (hover: hover) {
  .root:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
}

.media { position: relative; }
.image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

/* Corazon: 44x44 de area tactil, 36x36 visual */
.favorite {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-primary);
  cursor: pointer;
}
.favorite::after { content: ''; position: absolute; inset: -4px; }  /* area tactil ampliada */
.favorite:hover { background: #fff; }

.body { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg); flex: 1; }

.category {
  margin: 0;
  font-size: var(--font-size-eyebrow);
  font-weight: 700;
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.name { margin: 0; font-size: var(--font-size-subheading); font-weight: 700; }

.meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}
.meta li { display: flex; align-items: center; gap: var(--space-xs); }
.meta svg { color: var(--color-accent); flex-shrink: 0; }

.footer {
  margin-top: auto;                    /* empuja el pie al fondo, alinea tarjetas */
  padding-top: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.price {
  margin: 0;
  font-size: var(--font-size-metric);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: var(--tracking-tight);
}
.priceUnit { font-size: var(--font-size-caption); font-weight: 500; color: var(--color-text-muted); }

.book {
  min-height: 44px;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--font-size-button);
  font-weight: 700;
  letter-spacing: var(--tracking-button);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--motion-fast) var(--motion-ease);
}
@media (hover: hover) { .book:hover { background: var(--color-primary); color: var(--color-primary-contrast); } }
.book:active { transform: scale(0.97); }
```

**Grid del catálogo** (sin media queries gracias a `auto-fill`):

```css
/* features/catalog/ProductGrid.module.css */
.root {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-lg);
  width: min(1240px, 100% - var(--space-xl) * 2);
  margin-inline: auto;
}
```

### 3. Franja de features y newsletter

```tsx
// features/home/FeatureStrip.tsx
import { ShieldCheck, Zap, Leaf, Headset } from 'lucide-react'
import styles from './FeatureStrip.module.css'

const FEATURES = [
  { icon: Zap, title: 'Carga ultrarrápida', description: 'De 10 a 80 % en 30 minutos.' },
  { icon: ShieldCheck, title: 'Seguro incluido', description: 'Cobertura completa sin coste extra.' },
  { icon: Leaf, title: 'Cero emisiones', description: 'Contribuye a un aire más limpio.' },
  { icon: Headset, title: 'Soporte 24/7', description: 'Asistencia en carretera siempre.' },
] as const

export function FeatureStrip() {
  return (
    <section className={styles.root} aria-label="Características del servicio">
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <article key={title} className={styles.item}>
          <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </section>
  )
}
```

```css
.root {
  width: min(1240px, 100% - var(--space-xl) * 2);
  margin-inline: auto;
  padding-block: var(--space-section);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-xl);
}
.item { display: flex; flex-direction: column; gap: var(--space-sm); }
.item svg { color: var(--color-primary); }   /* iconos outline en azul */
.item h3 { margin: 0; font-size: var(--font-size-subheading); }
.item p { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-body-sm); }
```

---

## Tema B — `darkNeonGlass`

### 1. Header sticky con glass + badge de carrito

```tsx
// features/layout/GlassHeader.tsx
import { useState } from 'react'
import { Search, User, ShoppingBag, Menu } from 'lucide-react'
import { getTheme, type Theme } from '@/theme/tokens'

const CART_COUNT = 3

type GlassHeaderProps = { theme: Theme }

export function GlassHeader({ theme }: GlassHeaderProps) {
  const [query, setQuery] = useState('')

  return (
    <header className="header" style={{ ['--color-primary' as string]: theme.colors.primary }}>
      <nav aria-label="Principal" className="nav">
        <a href="/" className="brand">NOVA</a>

        <form role="search" className="search" onSubmit={(e) => e.preventDefault()}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos"
            aria-label="Buscar productos"
            className="searchInput"
          />
        </form>

        <div className="actions">
          <button type="button" className="iconButton" aria-label="Abrir cuenta de usuario">
            <User size={20} aria-hidden="true" />
          </button>
          <button type="button" className="iconButton" aria-label={`Carrito, ${CART_COUNT} artículos`}>
            <ShoppingBag size={20} aria-hidden="true" />
            <span className="badge" aria-hidden="true">{CART_COUNT}</span>
          </button>
          <button type="button" className="iconButton navToggle" aria-label="Abrir menú" aria-expanded="false">
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  )
}
```

```css
/* features/layout/GlassHeader.module.css */
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--effect-glass, color-mix(in srgb, var(--color-surface-alt) 82%, transparent));
  border-bottom: 1px solid var(--color-border);
}
@supports (backdrop-filter: blur(14px)) {
  .header { -webkit-backdrop-filter: blur(14px) saturate(150%); backdrop-filter: blur(14px) saturate(150%); }
}

.nav {
  width: min(1320px, 100% - var(--space-xl) * 2);
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  min-height: 72px;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.22em;
  color: var(--color-text);
  text-decoration: none;
  flex-shrink: 0;
}

.search {
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  transition: border-color var(--motion-base) var(--motion-ease), box-shadow var(--motion-base) var(--motion-ease);
}
.search:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary), 0 0 20px rgba(34, 211, 238, 0.3);
}
.searchInput {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--color-text);
  font: inherit;
}
.searchInput:focus { outline: none; }
.searchInput::placeholder { color: var(--color-text-muted); }

.actions { display: flex; align-items: center; gap: var(--space-sm); margin-left: auto; }

.iconButton {
  position: relative;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--motion-fast) var(--motion-ease), box-shadow var(--motion-fast) var(--motion-ease);
}
@media (hover: hover) {
  .iconButton:hover { border-color: var(--color-primary); box-shadow: 0 0 14px rgba(34, 211, 238, 0.35); }
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding-inline: 4px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 11px;
  font-weight: 700;
}

.navToggle { display: none; }

@media (max-width: 768px) {
  .nav { flex-wrap: wrap; gap: var(--space-md); padding-block: var(--space-md); }
  .search { order: 3; flex-basis: 100%; max-width: none; }
  .navToggle { display: grid; }
}
```

### 2. Título con degradado + tarjeta de producto metálica

```tsx
// features/home/MetallicProductCard.tsx
import { Star } from 'lucide-react'
import styles from './MetallicProductCard.module.css'

export type Product = {
  id: string
  name: string
  price: number
  compareAt?: number
  rating: number
  reviews: number
  badge?: string
}

type MetallicProductCardProps = { product: Product }

export function MetallicProductCard({ product }: MetallicProductCardProps) {
  return (
    <article className={styles.root}>
      {product.badge ? <span className={styles.badge}>{product.badge}</span> : null}

      <h3 className={styles.name}>{product.name}</h3>

      <div className={styles.rating} aria-label={`${product.rating} de 5, ${product.reviews} reseñas`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < Math.round(product.rating) ? '#FBBF24' : 'transparent'}
            stroke="#FBBF24"
            aria-hidden="true"
          />
        ))}
        <span className={styles.reviewCount}>({product.reviews})</span>
      </div>

      <p className={styles.price}>
        {product.price.toFixed(2)} €
        {product.compareAt ? <s className={styles.compareAt}>{product.compareAt.toFixed(2)} €</s> : null}
      </p>

      <button type="button" className={styles.cta}>Añadir al carrito</button>
    </article>
  )
}
```

```css
/* features/home/MetallicProductCard.module.css */
.root {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-radius: var(--radius-xl);

  /* Degradado metalico plateado */
  background: var(--effect-metallic);

  /* Todo el texto pasa a tinta oscura: dentro de la tarjeta metalica
     los tokens de texto del tema dejan de servir. */
  color: var(--color-metallic-ink);

  transition: transform var(--motion-base) var(--motion-ease), box-shadow var(--motion-base) var(--motion-ease);
}
@media (hover: hover) {
  .root:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
}

.badge {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.name { margin: 0; font-size: var(--font-size-subheading); font-weight: 700; }

.rating { display: flex; align-items: center; gap: 2px; }
.reviewCount { margin-left: var(--space-xs); font-size: var(--font-size-caption); opacity: 0.7; }

.price { margin: var(--space-sm) 0 0; font-size: var(--font-size-metric); font-weight: 800; }
.compareAt { margin-left: var(--space-sm); font-size: var(--font-size-body-sm); font-weight: 400; opacity: 0.55; }

.cta {
  margin-top: auto;
  min-height: 44px;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-metallic-ink);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--motion-fast) var(--motion-ease), box-shadow var(--motion-fast) var(--motion-ease);
}
/* Cian sobre plateado: contraste suficiente, y el glow separa del fondo */
@media (hover: hover) {
  .cta:hover { background: var(--color-primary); color: var(--color-primary-contrast); box-shadow: 0 0 18px rgba(34, 211, 238, 0.5); }
}
```

```css
/* Titular con degradado de texto */
.heroTitle {
  font-size: clamp(2.6rem, 1.5rem + 5vw, var(--font-size-display));
  font-weight: 800;
  line-height: var(--line-height-display);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}
.heroTitleAccent {
  background: var(--effect-metallic);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;                     /* obligatorio */
}
.heroTitleCyan { color: var(--color-primary); }
```

### 3. Cuadrícula de categorías con glow al hover

```css
/* features/home/CategoryGrid.module.css */
.root {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-lg);
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl) var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text);
  text-decoration: none;
  text-align: center;
  transition: border-color var(--motion-base) var(--motion-ease), box-shadow var(--motion-base) var(--motion-ease), transform var(--motion-base) var(--motion-ease);
}
@media (hover: hover) {
  .item:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);   /* glow multicapa */
    transform: translateY(-3px);
  }
}
.item svg { color: var(--color-primary); }
.itemLabel { font-weight: 600; }
```

### 4. Estado vacío y skeleton

```tsx
// components/EmptyState.tsx
import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
```

```tsx
// components/ProductGridSkeleton.tsx
import styles from './ProductGridSkeleton.module.css'

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.skeletonMedia} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
          <div className={styles.skeletonLine} style={{ width: '75%' }} />
          <div className={styles.skeletonLine} style={{ width: '55%' }} />
        </div>
      ))}
    </div>
  )
}
```

```css
/* components/ProductGridSkeleton.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-lg);
}
.card { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }

.skeletonMedia, .skeletonLine {
  background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 37%, var(--color-surface-alt) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: var(--radius-md);
}
.skeletonMedia { aspect-ratio: 4 / 3; border-radius: var(--radius-lg); margin-bottom: var(--space-sm); }
.skeletonLine { height: 12px; }

@keyframes shimmer { from { background-position: 100% 50%; } to { background-position: 0 50%; } }
@media (prefers-reduced-motion: reduce) { .skeletonMedia, .skeletonLine { animation: none; } }
```

El skeleton **debe imitar la silueta real** (media con `aspect-ratio`, líneas de texto de ancho distinto) o produce un salto de layout al cargar.
