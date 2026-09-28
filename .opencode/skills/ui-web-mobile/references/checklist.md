# Checklist de revisión

Pásala **antes** de dar por terminado cualquier trabajo de UI. Está ordenada por lo que más se rompe: primero tokens, luego accesibilidad, después responsive, y al final rendimiento y detalles.

## 1. Tokens

- [ ] Cero valores crudos en componentes: ni colores (`#...`, `rgb(...)`), ni tamaños, ni radios, ni sombras escritas a mano.
- [ ] Todos los valores salen de `theme.*` (web y móvil) o de `var(--token)` (CSS).
- [ ] Las excepciones documentadas están justificadas: gradientes compuestos, `0`, `1px`, `100%`, `transparent`.
- [ ] `getTheme()` / `useTheme()` se resuelve **una vez** en el provider, no en cada componente.
- [ ] El tema de la plataforma correcta: web usa A o B, móvil usa C.
- [ ] Los estados de color (`success`, `warning`, `danger`) se usan por significado, no por decoración.
- [ ] El color de marca queda reservado para el elemento activo, no para pintar cada icono.
- [ ] Dentro de una superficie metálica el texto usa tinta oscura, no los tokens de texto del tema.

## 2. Accesibilidad

- [ ] Contraste AA: 4.5:1 en texto normal, 3:1 en texto grande (≥ 24px o ≥ 19px bold) y en iconos/bordes que llevan información.
- [ ] Foco visible en **todos** los elementos interactivos, con contraste suficiente. Nunca `outline: none` sin sustituto.
- [ ] Todo control sin texto visible tiene nombre accesible: `aria-label` (web) o `accessibilityLabel` (móvil).
- [ ] El nombre accesible describe la **acción**, no el objeto ("Reservar", no "Botón").
- [ ] `aria-pressed` / `aria-expanded` / `aria-current` (web) y `accessibilityState={{ selected, disabled, busy, checked }}` (móvil) reflejan el estado real.
- [ ] Los iconos decorativos están ocultos a lectores de pantalla (`aria-hidden`, `accessibilityElementsHidden`).
- [ ] Los headings van en orden sin saltarse niveles (`h1` → `h2` → `h3`).
- [ ] Toda imagen informative tiene `alt`; las decorativas, `alt=""`.
- [ ] El texto de un gradiente mantiene contraste; si no, se usa color sólido.
- [ ] `allowFontScaling` no está en `false`; si se limita, el máximo es razonable (1.3–1.5).
- [ ] Áreas táctiles ≥ 44px (con `hitSlop` sin solapar vecinos).
- [ ] Los estados de carga y error son anunciables (`aria-busy`, `role="status"`, `accessibilityRole="progressbar"` con `accessibilityValue`).

## 3. Estados

- [ ] Carga: skeleton con la silueta real, o spinner. Nunca una pantalla vacía sin explicación.
- [ ] Vacío: título, explicación de por qué y acción para resolverlo.
- [ ] Error: mensaje legible + acción de reintento. "No pudimos cargar" ≠ "no hay datos".
- [ ] Hover, focus, active, disabled, visited, selected: todos definidos.
- [ ] Disabled con `opacity` suficiente para seguir leyéndose (≈ 0.5) y no solo con el color.
- [ ] Los estados de hover solo dentro de `@media (hover: hover)`.
- [ ] El layout no salta (CLS) al cambiar de estado: reserva el espacio del contenido.

## 4. Layout y responsive

- [ ] Mobile-first: las reglas base son para móvil y `min-width` va subiendo.
- [ ] Se usa `clamp()` para tipografía fluida con límites inferiores y superiores.
- [ ] Grids con `repeat(auto-fit/auto-fill, minmax(...))` en lugar de media queries por columna.
- [ ] Probado a 320px, 375px, 768px, 1024px y 1440px.
- [ ] Sin scroll horizontal en ningún ancho.
- [ ] Contenidos largos no rompen: `min-width: 0` en elementos flex, `overflow-wrap`, `truncate` con elipsis donde toque.
- [ ] `prefers-reduced-motion` respetado en CSS y `AccessibilityInfo.isReduceMotionEnabled()` en móvil.
- [ ] Nada depende solo del color: hay texto, icono o forma que lo acompaña.
- [ ] Imágenes con `width`/`height` o `aspect-ratio` para no desplazar el layout.

## 5. CSS (web)

- [ ] CSS Modules o estilos en scope; nada de selectores globales salvo tokens y reset.
- [ ] Sin `!important` (el único permitido es el reset global de `prefers-reduced-motion` en `theme.css`).
- [ ] Sin `id` como selector de estilo.
- [ ] Orden de propiedades: estructura → caja → tipografía → color → decoraciones → animaciones.
- [ ] Transiciones solo en `transform` y `opacity`; nunca en `width`, `height`, `top` ni `left`.
- [ ] `backdrop-filter` dentro de `@supports` y con fondo sólido de respaldo.
- [ ] `position: sticky` con contenedor sin `overflow: hidden` en los ancestros.
- [ ] Números sin unidades en propiedades que las admiten (`flex: 1`, `line-height: 1.5`) y con unidad en el resto.
- [ ] `z-index` desde `var(--z-*)`, no números sueltos.

## 6. React Native (móvil)

- [ ] Estilos en `StyleSheet.create`, sin objetos inline salvo los que dependen del tema.
- [ ] Sin unidades CSS (`'16px'`), sin selectores, sin cascada.
- [ ] Sombra con el helper (iOS + Android); `elevation` solo con `backgroundColor`.
- [ ] Overlays decorativos con `pointerEvents="none"`.
- [ ] Gradientes con `expo-linear-gradient` o el estándar del proyecto, nunca a mano.
- [ ] `react-native-safe-area-context` con `insets.bottom` añadido en la tab bar y el pie.
- [ ] `KeyboardAvoidingView` en pantallas con inputs; `keyboardShouldPersistTaps="handled"`.
- [ ] Listas con `keyExtractor`; `memo` en el item; `getItemLayout` solo con altura fija.
- [ ] Placeholder en imágenes (blurhash o color de superficie con la misma proporción).
- [ ] Probado en iOS **y** Android, e idealmente en un iPhone SE.
- [ ] Las animaciones usan `useNativeDriver: true` o Reanimated.

## 7. Rendimiento

- [ ] Sin `re-renders` provocados por objetos, arrays o funciones recreados en cada render.
- [ ] Componentes pesados envueltos en `memo` con props primitivas o estables.
- [ ] `useMemo`/`useCallback` solo donde el cálculo o la lista lo exigen, no por costumbre.
- [ ] Imágenes optimizadas: `loading="lazy"`, `decoding="async"`, `sizes` en web; caché en móvil.
- [ ] Fuentes con `font-display: swap` y peso realmente usado (no 7 pesos si solo usas 2).
- [ ] La animación no bloquea el hilo: `transform`/`opacity` y thread de UI.
- [ ] Nada de `console.log` de objetos grandes ni de datos personales.

## 8. Contenido y datos

- [ ] Nombres, precios e imágenes de ejemplo **inventados**, sin marcas ni logos reales.
- [ ] Sin emojis como iconografía.
- [ ] Textos de ejemplo que no affirmen datos reales (baterías, autonomia, precios).
- [ ] Errores escritos para la persona que los lee, sin jerga ni códigos.
- [ ] Fechas y unidades formateadas con `Intl` / `toLocaleString`, no a mano.

## 9. Consistencia

- [ ] Nombres de archivo y funciones en el idioma del proyecto (en este repo, español).
- [ ] Comentarios solo donde explican el porqué, nunca el qué.
- [ ] Tipos exportados desde un único sitio; nada de `any` en las props públicas.
- [ ] Ejemplos y documentación del proyecto actualizados junto con el código.
- [ ] Sin código muerto ni imports sin usar (el linter del proyecto lo avisa).
