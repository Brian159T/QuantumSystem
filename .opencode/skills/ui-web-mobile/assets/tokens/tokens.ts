/**
 * Design tokens compartidos para Web (React) y Mobile (React Native).
 *
 * Tres temas definidos como tokens SEMANTICOS (no valores sueltos):
 *   A) lightBlueCommerce  -> web, renta/venta de autos (azul oscuro + azul claro)
 *   B) darkNeonGlass     -> web, e-commerce premium (cian + metalico oscuro)
 *   C) darkGreenMobile   -> movil, gestion de vehiculo (verde oscuro)
 *
 * Reglas de uso:
 *   - Un componente NUNCA escribe un valor crudo. Siempre `theme.colors.*`, etc.
 *   - Para web tambien existen las variables CSS equivalentes en `theme.css`
 *     (mismos nombres en kebab-case, ej. `colors.primary` -> `--color-primary`).
 *   - Copia este archivo a `src/theme/tokens.ts` y ajustalo al proyecto; no lo
 *     importes desde la skill en produccion.
 */

/* ------------------------------------------------------------------ */
/* Tipos derivados (evitan que un token nuevo rompa a un componente)  */
/* ------------------------------------------------------------------ */

export type ThemeName = 'lightBlueCommerce' | 'darkNeonGlass' | 'darkGreenMobile'

export type Colors = {
  /** Fondo de pagina */
  bg: string
  /** Superficie base: tarjetas, paneles */
  surface: string
  /** Superficie secundaria: campos, filas, hovers */
  surfaceAlt: string
  /** Bordes hairline */
  border: string
  /** Texto principal */
  text: string
  /** Texto secundario, captions, metadatos */
  textMuted: string
  /** Color de marca / accion primaria */
  primary: string
  /** Texto/iconos sobre `primary` */
  primaryContrast: string
  /** Acento secundario: palabra destacada, iconos vivos, detalles de UI */
  accent: string
  success: string
  warning: string
  danger: string
  /* ---- Tokens opcionales: solo los define el tema que los necesita ---- */
  /** Eje azul oscuro (Tema A): barras, footers, paneles, banners */
  navy?: string
  /** Paso mas profundo del eje `navy` (Tema A) */
  navyDeep?: string
  /** Eje azul claro (Tema A): es el mismo valor que `accent`, expuesto como paso de escala */
  sky?: string
  /** Estado hover/pressed de `primary` (temas web) */
  primaryHover?: string
  /** Fondo tenue del acento, para hovers y estados seleccionados (temas web) */
  accentSoft?: string
  /** Degradado metalico plateado (Tema B) */
  metallic?: string
  /** Tinta oscura legible sobre `metallic` (Tema B) */
  metallicInk?: string
}

export type TypographyToken = {
  fontFamily: string
  fontSize: number
  fontWeight: '400' | '500' | '600' | '700' | '800'
  lineHeight: number
  letterSpacing: number
}

export type Typography = {
  /** Hero / display */
  display: TypographyToken
  /** Titulo de pagina */
  title: TypographyToken
  /** Titulo de seccion */
  heading: TypographyToken
  /** Subtitulo de tarjeta */
  subheading: TypographyToken
  /** Cuerpo */
  body: TypographyToken
  /** Cuerpo secundario */
  bodySm: TypographyToken
  /** Eyebrow: texto pequeno en mayusculas */
  eyebrow: TypographyToken
  /** Caption / metadatos */
  caption: TypographyToken
  /** Texto en mayusculas de boton */
  button: TypographyToken
  /** Cifra grande (metricas) */
  metric: TypographyToken
}

export type Spacing = {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
  section: number
}

export type Radii = {
  sm: number
  md: number
  lg: number
  xl: number
  pill: number
}

export type Elevation = {
  none: object
  sm: object
  md: object
  lg: object
}

export type Motion = {
  fast: number
  base: number
  slow: number
  ease: string
  easeOut: string
  spring: { damping: number; stiffness: number; mass: number }
}

export type ZIndex = {
  base: number
  content: number
  sticky: number
  overlay: number
  modal: number
  toast: number
}

export type Breakpoint = {
  sm: number
  md: number
  lg: number
  xl: number
}

export type Theme = {
  name: ThemeName
  /** 'web' | 'native' — indica en que plataforma se diseño el tema */
  platform: 'web' | 'native'
  colors: Colors
  typography: Typography
  spacing: Spacing
  radii: Radii
  elevation: Elevation
  motion: Motion
  zIndex: ZIndex
  breakpoints: Breakpoint
  /** Tokens especificos del tema, no presentes en todos */
  effects?: {
    /** Sombra de glow (tema B) */
    glow?: string
    /** Gradiente plateado para texto/tarjetas (tema B) */
    metallicGradient?: string
    /** Gradiente de overlay de hero (tema A) */
    heroOverlay?: string
    /** Fondo traslucido (glassmorphism) */
    glass?: string
    /** Colores secundarios para iconos de acciones (tema C) */
    actionAccents?: {
      fuel: string
      service: string
      expense: string
      health: string
    }
  }
}

/* ------------------------------------------------------------------ */
/* Escala compartida por los tres temas                               */
/* ------------------------------------------------------------------ */

const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  section: 72,
}

const breakpoints: Breakpoint = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
}

const motion: Motion = {
  fast: 150,
  base: 220,
  slow: 400,
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  spring: { damping: 18, stiffness: 180, mass: 0.8 },
}

const zIndex: ZIndex = {
  base: 0,
  content: 1,
  sticky: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
}

/* ------------------------------------------------------------------ */
/* TEMA A — lightBlueCommerce (web)                                    */
/* ------------------------------------------------------------------ */

const lightBlueCommerce = {
  name: 'lightBlueCommerce',
  platform: 'web',

  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F8FC',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',

    // Azul oscuro: barras superiores, footer, panel de busqueda, banners
    navy: '#0B1F3A',
    navyDeep: '#0A1A33',

    // Azul principal / claro: CTA, precios, enlaces, iconos
    primary: '#2563EB',
    primaryHover: '#1D4ED8',

    // Paso de escala azul claro. `accent` es su alias semantico:
    // el texto destacado, los iconos y los estados activos usan esta escala.
    sky: '#60A5FA',
    accent: '#60A5FA',
    accentSoft: '#DBEAFE',

    primaryContrast: '#FFFFFF',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
  },

  typography: {
    display: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 56,
      fontWeight: '800',
      lineHeight: 1.05,
      letterSpacing: -0.02,
    },
    title: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 1.15,
      letterSpacing: -0.015,
    },
    heading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.01,
    },
    subheading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    body: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    bodySm: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.55,
      letterSpacing: 0,
    },
    eyebrow: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.14,
    },
    caption: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.01,
    },
    button: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.08,
    },
    metric: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 1.1,
      letterSpacing: -0.02,
    },
  },

  spacing,
  radii: { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 },
  elevation: {
    none: {},
    // Sombras suaves con tinte azul
    sm: {
      shadowColor: '#0B1F3A',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: '#0B1F3A',
      shadowOpacity: 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
    lg: {
      shadowColor: '#0B1F3A',
      shadowOpacity: 0.16,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 16 },
      elevation: 12,
    },
  },
  motion,
  zIndex,
  breakpoints,

  effects: {
    // Overlay del hero: azul oscuro desde la izquierda para legibilidad
    heroOverlay:
      'linear-gradient(90deg, rgba(10, 26, 51, 0.94) 0%, rgba(10, 26, 51, 0.72) 45%, rgba(10, 26, 51, 0.15) 100%)',
  },
} as const satisfies Theme

/* ------------------------------------------------------------------ */
/* TEMA B — darkNeonGlass (web)                                        */
/* ------------------------------------------------------------------ */

const darkNeonGlass = {
  name: 'darkNeonGlass',
  platform: 'web',

  colors: {
    bg: '#121212',
    surface: '#1A1A1A',
    surfaceAlt: '#1F2124',
    // Borde hairline sutil sobre fondo oscuro
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#F5F5F5',
    textMuted: '#9CA3AF',

    // Cian / turquesa
    primary: '#22D3EE',
    primaryHover: '#00E5FF',
    accent: '#00E5FF',
    accentSoft: 'rgba(34, 211, 238, 0.12)',

    primaryContrast: '#0A0A0A',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',

    // Degradado metalico plateado
    metallic: 'linear-gradient(135deg, #F5F7FA 0%, #C8CDD4 50%, #9AA1AB 100%)',
    metallicInk: '#111418',
  },

  typography: {
    display: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 60,
      fontWeight: '800',
      lineHeight: 1.02,
      letterSpacing: -0.03,
    },
    title: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.1,
      letterSpacing: -0.02,
    },
    heading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 26,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.01,
    },
    subheading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    body: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    bodySm: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.55,
      letterSpacing: 0,
    },
    eyebrow: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.16,
    },
    caption: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.02,
    },
    button: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.08,
    },
    metric: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 30,
      fontWeight: '800',
      lineHeight: 1.05,
      letterSpacing: -0.02,
    },
  },

  spacing,
  radii: { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 },
  elevation: {
    none: {},
    sm: {
      shadowColor: '#22D3EE',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
    },
    md: {
      // Glow multicapa
      shadowColor: '#22D3EE',
      shadowOpacity: 0.28,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 0 },
      elevation: 8,
    },
    lg: {
      shadowColor: '#22D3EE',
      shadowOpacity: 0.4,
      shadowRadius: 40,
      shadowOffset: { width: 0, height: 0 },
      elevation: 16,
    },
  },
  motion,
  zIndex,
  breakpoints,

  effects: {
    // Glow: dos capas (spread amplio + nucleo intenso)
    glow: '0 0 0 1px rgba(34, 211, 238, 0.4), 0 0 18px rgba(34, 211, 238, 0.28), 0 0 48px rgba(34, 211, 238, 0.12)',
    metallicGradient: 'linear-gradient(135deg, #F5F7FA 0%, #C8CDD4 45%, #9AA1AB 100%)',
    glass: 'rgba(31, 33, 36, 0.72)',
  },
} as const satisfies Theme

/* ------------------------------------------------------------------ */
/* TEMA C — darkGreenMobile (React Native)                             */
/* ------------------------------------------------------------------ */

const darkGreenMobile = {
  name: 'darkGreenMobile',
  platform: 'native',

  colors: {
    bg: '#0B1410',
    surface: '#16231C',
    surfaceAlt: '#1D2E25',
    // Borde sutil sobre superficie translucida
    border: 'rgba(34, 197, 94, 0.14)',
    text: '#ECFDF3',
    textMuted: '#8FA99A',

    // Verde de estado activo / progreso / badges
    primary: '#22C55E',
    primaryHover: '#16A34A',
    accent: '#22C55E',
    accentSoft: 'rgba(34, 197, 94, 0.14)',

    primaryContrast: '#04140A',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },

  typography: {
    display: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 1.1,
      letterSpacing: -0.02,
    },
    title: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 1.15,
      letterSpacing: -0.015,
    },
    heading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 1.2,
      letterSpacing: -0.01,
    },
    subheading: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    body: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 1.55,
      letterSpacing: 0,
    },
    bodySm: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    eyebrow: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 11,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.12,
    },
    caption: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.01,
    },
    button: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 1,
      letterSpacing: 0.04,
    },
    metric: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 1.1,
      letterSpacing: -0.02,
    },
  },

  spacing,
  // Radios grandes, tipicos de app movil
  radii: { sm: 10, md: 16, lg: 20, xl: 24, pill: 999 },
  elevation: {
    none: {},
    sm: {
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    md: {
      shadowColor: '#000000',
      shadowOpacity: 0.4,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    lg: {
      shadowColor: '#22C55E',
      // Sombra verde sutil que refuerza el tema
      shadowOpacity: 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 10 },
      elevation: 16,
    },
  },
  motion,
  zIndex,
  breakpoints,

  effects: {
    glass: 'rgba(22, 35, 28, 0.85)',
    // Colores secundarios de los iconos de acciones rapidas
    actionAccents: {
      fuel: '#F59E0B',
      service: '#3B82F6',
      expense: '#A855F7',
      health: '#22C55E',
    },
  },
} as const satisfies Theme

/* ------------------------------------------------------------------ */
/* API publica                                                        */
/* ------------------------------------------------------------------ */

export const themes = {
  lightBlueCommerce,
  darkNeonGlass,
  darkGreenMobile,
} as const

export type ThemeRegistry = typeof themes

export const themeNames = Object.keys(themes) as ThemeName[]

/** Resuelve un tema por nombre. Lanza si no existe (falla temprano, no en render). */
export function getTheme(name: ThemeName): Theme {
  const theme = themes[name]
  if (!theme) {
    throw new Error(
      `Tema desconocido: "${name}". Disponibles: ${themeNames.join(', ')}`,
    )
  }
  return theme
}

/** Tema por defecto por plataforma, util como fallback. */
export const defaultThemeFor = {
  web: 'lightBlueCommerce',
  native: 'darkGreenMobile',
} as const

/* ------------------------------------------------------------------ */
/* Helpers reutilizables                                               */
/* ------------------------------------------------------------------ */

/** Construye un `box-shadow` CSS a partir de un token de elevation (web). */
export function cssShadow(theme: Theme, level: keyof Elevation): string {
  const e = theme.elevation[level] as {
    shadowColor?: string
    shadowOpacity?: number
    shadowRadius?: number
    shadowOffset?: { width: number; height: number }
  }
  if (!e.shadowColor) return 'none'

  const x = e.shadowOffset?.width ?? 0
  const y = e.shadowOffset?.height ?? 0
  const blur = e.shadowRadius ?? 0
  const color = toRgba(e.shadowColor, e.shadowOpacity ?? 0.2)

  // El Tema B usa glow (sin desplazamiento); el resto, sombra difusa con offset.
  if (x === 0 && y === 0) {
    return `0 0 ${blur}px ${color}, 0 0 ${blur * 2.5}px ${toRgba(
      e.shadowColor,
      (e.shadowOpacity ?? 0.2) * 0.45,
    )}`
  }

  return `${x}px ${y}px ${blur}px ${color}`
}

/** Convierte `#RGB`, `#RRGGBB` o `rgba(...)` a `rgba()` con la alpha dada. */
function toRgba(color: string, alpha: number): string {
  if (color.startsWith('rgb')) return color
  const clean = color.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Variables CSS (`--color-primary`, `--space-md`...) desde un tema. Para web. */
export function toCssVariables(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--color-${kebab(key)}`] = value
  }
  for (const [key, value] of Object.entries(theme.spacing)) {
    vars[`--space-${key}`] = `${value}px`
  }
  for (const [key, value] of Object.entries(theme.radii)) {
    vars[`--radius-${key}`] = `${value}px`
  }
  for (const [key, value] of Object.entries(theme.motion)) {
    vars[`--motion-${key}`] =
      typeof value === 'number' ? `${value}ms` : String(value)
  }
  for (const [key, value] of Object.entries(theme.zIndex)) {
    vars[`--z-${key}`] = String(value)
  }
  for (const [key, value] of Object.entries(theme.breakpoints)) {
    vars[`--bp-${key}`] = `${value}px`
  }
  if (theme.effects) {
    for (const [key, value] of Object.entries(theme.effects)) {
      if (typeof value === 'string') {
        vars[`--effect-${kebab(key)}`] = value
      }
    }
  }

  return vars
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export default themes
