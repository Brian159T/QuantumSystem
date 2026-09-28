---
name: ui-web-mobile
description: Guías y tokens para crear interfaces profesionales en React/TypeScript (web) y React Native/TypeScript (móvil) con diseño consistente y moderno. Úsala al crear, refactorizar o revisar componentes, pantallas, estilos, tarjetas, botones, formularios, tablas, estados de carga/vacío/error, tema claro/oscuro, glassmorphism o cualquier trabajo de UI en este monorepo (Frontend web con Vite, Backend de API REST, o la app móvil Expo). Aporta tres temas de tokens, guías de CSS y de React Native, patrones con código completo y una checklist de revisión. Úsala también cuando pidan "hacer la interfaz más profesional", "modernizar el diseño" o "que se vea bien en móvil".
---

# UI Web + Mobile

Reglas y recursos para que la UI de este proyecto se vea profesional y consistente.

## Flujo de trabajo

1. **Elige la plataforma** antes de escribir una línea de código. Web (`Frontend/`) y móvil (`Mobile/`) no comparten estilo de código: nada de CSS en React Native, nada de `Platform.select` para decisiones de color.
2. **Elige el tema:**
   - Web de reserva/venta de autos → **Tema A `lightBlueCommerce`** (azul oscuro + azul claro).
   - Web e-commerce premium → **Tema B `darkNeonGlass`** (cian + metálico).
   - Móvil → **Tema C `darkGreenMobile`** (verde oscuro).
3. **Copia los tokens** de `assets/tokens/` al proyecto (`src/theme/tokens.ts` y `src/styles/theme.css`); nunca los importes desde la skill en producción.
4. **Construye la pantalla** siguiendo la guía de la plataforma y copiando un patrón existente del mismo tipo.
5. **Pasa la checklist** (`references/checklist.md`) antes de terminar.

## Reglas que no se negocian

- **Ningún valor crudo en un componente.** Ni colores, ni tamaños, ni radios, ni sombras. Todo sale de `theme.*` o de `var(--token)`. Un componente con `#2563EB` escrito a mano es un bug, aunque hoy coincida con el tema.
- **Accesibilidad por defecto, no como extra.** Foco visible, nombre accesible en todo control, contraste AA, estados de teclado, áreas táctiles ≥ 44px, y respeto a `prefers-reduced-motion`.
- **Estados completos siempre.** Default, hover, focus, active, disabled, y las pantallas de carga, vacío y error. Una pantalla sin estado de error está terminada a medias.
- **Responsive de verdad.** Mobile-first, tipografía con `clamp()`, sin scroll horizontal a 320px.
- **Nada de `!important`** en componentes (el único permitido es el reset global de `prefers-reduced-motion`).
- **Datos de ejemplo inventados** y sin marcas, logos ni afirmaciones sobre datos reales.

## Referencias (carga solo la que necesites)

| Archivo | Cuándo leerlo |
|---|---|
| `references/design-tokens.md` | Al definir o cambiar un tema, un color, la escala tipográfica o el espaciado. |
| `references/web-css-guidelines.md` | En cualquier trabajo de CSS web: layout, glassmorphism, foco, animaciones, rendimiento. |
| `references/react-native-guidelines.md` | En cualquier trabajo de móvil: `StyleSheet`, sombras, `Pressable`, listas, safe area, accesibilidad. |
| `references/web-patterns.md` | Al construir botones, tarjetas, heroes, headers, grids, skeletons o estados vacíos en web. |
| `references/mobile-patterns.md` | Al construir tarjetas, filas de métricas, tab bars o pantallas con estados en móvil. |
| `references/checklist.md` | Al final de cualquier trabajo de UI, y al revisar código existente. |

## Assets

| Archivo | Contenido |
|---|---|
| `assets/tokens/tokens.ts` | Los tres temas en TypeScript, tipados, con `getTheme()` y helpers (`cssShadow`, `toCssVariables`). |
| `assets/tokens/theme.css` | Equivalente en variables CSS, con los temas web, glassmorphism y reset de foco/movimiento. |

## Advertencias

- `tokens.ts` y `theme.css` **deben mantener los mismos valores**. Si cambias uno, cambia el otro: una discrepancia produce un tema que se ve bien en CSS y mal en TS (o al revés).
- Los `radii` son más pequeños en los temas web y más grandes en el móvil: es intencional, no una inconsistencia.
- Las sombras del tema B son *glow* (sin desplazamiento); `cssShadow()` lo detecta y genera las capas correctas.
- `color-mix()` y `backdrop-filter` requieren fallback para navegadores antiguos o sin soporte: siempre detrás hay un color sólido.
- No inventes paletas nuevas ni "mejores" colores: si un color no existe en los tokens, se añade a los tokens de los tres archivos, no se escribe suelto en el componente.
