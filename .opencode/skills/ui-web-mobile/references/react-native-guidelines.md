# React Native — Guías

## Enfoque de estilos: `StyleSheet.create` + tokens

```tsx
// MAL
<View style={{ backgroundColor: '#16231C', padding: 16, borderRadius: 16 }} />

// BIEN
<View style={[styles.card, { backgroundColor: theme.colors.surface }]} />
```

Reglas:

1. **Nada de valores mágicos.** Ni colores, ni números sueltos, ni strings. Todo sale de `theme`.
2. **`StyleSheet.create` en módulo, no objeto inline.** Los objetos inline se recrean en cada render. Excepto los valores que dependen del tema, que sí son dinámicos.
3. **Sin unidades CSS.** `padding: 16`, no `'16px'`. Los tokens de spacing son `number` por eso.
4. **Sin selectores.** No hay cascada ni herencia de estilos: cada `View` define su propio estilo. Compensa con composición (componentes) y `StyleSheet.flatten`.

---

## `useTheme()`: el hook obligatorio

```tsx
// src/theme/useTheme.ts
import { useMemo } from 'react'
import { getTheme, type Theme, type ThemeName } from './tokens'

type ThemeContextValue = { theme: Theme; themeName: ThemeName; setTheme: (n: ThemeName) => void }

export function useTheme(): ThemeContextValue {
  // En la app real, el valor viene de un ThemeContext + useColorScheme.
  return useMemo(
    () => ({
      theme: getTheme('darkGreenMobile'),
      themeName: 'darkGreenMobile',
      setTheme: () => {},
    }),
    [],
  )
}
```

En una app real con soporte de claro/oscuro:

```tsx
import { useColorScheme } from 'react-native'
import { useMemo } from 'react'
import { getTheme, type Theme } from './tokens'

const themesByScheme = {
  dark: getTheme('darkGreenMobile'),
  light: getTheme('darkGreenMobile'),   // define el tema claro aqui
} as const

export function useTheme() {
  const scheme = useColorScheme() ?? 'dark'
  return useMemo(() => ({ theme: themesByScheme[scheme] }), [scheme])
}
```

**No llames a `getTheme()` en cada render de cada componente.** Resuélvelo una vez en el provider y distribúyelo por contexto. Resolver el tema por componente significa 200 lookups por pantalla.

---

## Sombras: helper por nivel

`shadowColor/Offset/Opacity/Radius` es iOS; `elevation` es Android. Ambos se necesitan y se encapsulan:

```ts
// src/theme/shadows.ts
import type { Theme } from './tokens'

type ElevationLevel = 'none' | 'sm' | 'md' | 'lg'

export function shadow(theme: Theme, level: ElevationLevel) {
  const e = theme.elevation[level] as {
    shadowColor?: string
    shadowOpacity?: number
    shadowRadius?: number
    shadowOffset?: { width: number; height: number }
    elevation?: number
  }
  if (!e.shadowColor) return {}

  return {
    shadowColor: e.shadowColor,
    shadowOpacity: e.shadowOpacity ?? 0.2,
    shadowRadius: e.shadowRadius ?? 0,
    shadowOffset: e.shadowOffset ?? { width: 0, height: 0 },
    elevation: e.elevation ?? 0,
  }
}
```

Uso: `style={[styles.card, shadow(theme, 'md')]}`.

**Trampa de Android:** `elevation` **solo** funciona con `backgroundColor` en el View. Un View transparente con `elevation` no proyecta sombra. Además el radio de `elevation` es fijo y no customizable; para radios grandes y control fino, mete un contenedor con sombra detrás del contenido.

**Trampa de iOS:** la sombra se dibuja **fuera** de los límites del padre si no hay `overflow: 'hidden'`. Por eso las cards con borde redondeado y sombra necesitan a veces un wrapper.

---

## Gradientes, blur e iconos

```tsx
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Home, Car, Compass, User } from 'lucide-react-native'
// o: import { MaterialCommunityIcons } from '@expo/vector-icons'
```

```tsx
<LinearGradient
  colors={['rgba(0,0,0,0)', theme.colors.bg]}
  style={styles.heroGradient}
  pointerEvents="none"     // importante: el gradiente no debe capturar toques
/>
```

**`pointerEvents="none"` en cualquier overlay decorativo.** Un gradiente invisible sobre un botón lo hace inclicable, y el bug es invisible en el código.

Si el proyecto no tiene `expo-linear-gradient`, el fallback es un `View` con `backgroundColor` y opacidad, o una dependencia unificada. No implementes gradientes a mano con `Image`.

---

## Feedback táctil

```tsx
import { Pressable, StyleSheet } from 'react-native'

type PressableCardProps = {
  onPress: () => void
  children: React.ReactNode
  disabled?: boolean
  accessibilityLabel: string
}

export function PressableCard({ onPress, children, disabled, accessibilityLabel }: PressableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      android_ripple={{ color: theme.colors.accentSoft, borderless: false }}
      // Hit area ampliada sin agrandar el elemento visual
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.5 },
      ]}
    >
      {children}
    </Pressable>
  )
}
```

Reglas:

- **`Pressable` con `style` como función** para el estado `pressed`. `TouchableOpacity` funciona pero no da `android_ripple` ni control de `transform`.
- **Tamaño táctil ≥ 44px.** `hitSlop` amplía el área, pero cuidado: en un grid de 4 columnas, un `hitSlop` grande solapa las áreas vecinas.
- **`android_ripple` en Android, opacity/scale en ambos.** El ripple es native y se siente mejor; la opacidad es el fallback en iOS.
- **Animación de `transform` con `useNativeDriver: true`** cuando uses `Animated`. Sin eso, cada frame pasa por el bridge y se pierde el 60fps.

---

## Accesibilidad

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Reservar servicio para el Nebula GT"
  accessibilityHint="Abre el formulario de reserva"
  accessibilityState={{ selected: isSelected, disabled: false, busy: isLoading }}
>
  {/* Icono decorativo: se oculta para no duplicar el label */}
  <Wrench size={20} color={theme.colors.accent} accessibilityElementsHidden />
  <Text style={styles.label}>Servicio</Text>
</Pressable>
```

- **`accessibilityRole`**: `button`, `link`, `header`, `image`, `search`, `tab`, `switch`.
- **`accessibilityLabel`**: obligatorio en todo control sin texto visible. Describe la **acción**, no el objeto ("Reservar servicio", no "Botón").
- **`accessibilityState`**: `disabled`, `selected`, `checked`, `busy`. Un botón de loading debe tener `busy: true`.
- **Agrupar**: `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` en un contenedor, para que el lector no lea cada icono suelto.
- **`allowFontScaling`**: **déjalo en `true`** (es el default). Si necesitas limitarlo por diseño, ponle un `maxFontSizeMultiplier` **razonable** (1.3-1.5), nunca 1.0 — ponerlo a 1 rompe la accesibilidad de quien usa letra grande.

---

## Listas

```tsx
import { FlatList, StyleSheet } from 'react-native'
import { memo, useCallback } from 'react'

type Row = { id: string; label: string; value: string }

const renderItem = useCallback(
  ({ item }: { item: Row }) => <MetricRow item={item} />,
  [],
)

const keyExtractor = useCallback((item: Row) => item.id, [])

<FlatList
  data={rows}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  contentContainerStyle={styles.listContent}
  ItemSeparatorComponent={Separator}
  // Solo si las filas tienen altura fija y conocida
  getItemLayout={(_, index) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })}
/>
```

- **`keyExtractor` siempre.** Sin él, FlatList usa `item.key` o el índice, y el índice rompe el estado al reordenar.
- **`getItemLayout` solo con altura fija.** Merma el cálculo, pero con altura variable produce scroll roto.
- **`memo` en el item**, no en el `renderItem`. Memoizar el callback sin memoizar el componente no evita re-renders.
- **FlashList** si la lista es larga (>100 filas) o tiene imágenes. O `@shopify/flash-list` requiere layout medido; no lo mezcles con `getItemLayout` de FlatList.
- **`removeClippedSubviews`** en Android con listas muy largas. En iOS suele causar glitches; no lo actives a ciebas.

---

## Imágenes

```tsx
import { Image } from 'expo-image'

<Image
  source={{ uri: vehicle.imageUrl }}
  style={styles.thumb}
  contentFit="cover"
  transition={200}              // crossfade, quita el "pop" de carga
  cachePolicy="memory-disk"
  accessibilityLabel="Sedán eléctrico Nebula GT, vista lateral"
  placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};of' }}
/>
```

`expo-image` supera a `Image` de RN en caché, transiciones y blurhash. Si el proyecto solo tiene `Image` de RN, entonces `resizeMode="cover"` y acepta el coste.

**Placeholder mientras carga**: blurhash o un `View` con el color `surfaceAlt` de la misma proporción. Una imagen sin placeholder en un grid produce un salto de layout.

---

## Layout y pantallas seguras

```tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export function Screen({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ... */}
      <View style={{ paddingBottom: insets.bottom + 8 }}>{children}</View>
    </View>
  )
}
```

- **`react-native-safe-area-context`, no `SafeAreaView` de RN.** El de RN solo funciona en iOS y no cubre el notch en Android.
- **`useSafeAreaInsets()` > `SafeAreaView` fijo** cuando necesitas el valor numérico (padding de una tab bar, por ejemplo).
- **Bottom tab bar**: el padding inferior debe sumar `insets.bottom`, o el último item queda bajo el gesto de inicio.
- **`KeyboardAvoidingView`** en toda pantalla con inputs, con `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`.
- **ScrollView con `contentContainerStyle`, nunca `style`,** para el padding. Y `keyboardShouldPersistTaps="handled"` para que el teclado no se coma el primer tap.

---

## Navegación: tab bar personalizada (Tema C)

React Navigation con un `tabBar` propio, en lugar del estilo por defecto:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator()

<Tab.Navigator
  tabBar={(props) => <GlassTabBar {...props} />}
  screenOptions={{ headerShown: false }}
>
  <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: 'Home',    icon: Home }} />
  <Tab.Screen name="Garage"  component={GarageScreen}  options={{ title: 'Garage',  icon: Car }} />
  <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore', icon: Compass }} />
  <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', icon: User }} />
</Tab.Navigator>
```

`GlassTabBar` (implementación completa en `mobile-patterns.md`) cumple:

- Pill verde translúcida en el ítem activo.
- Fondo de superficie con borde sutil.
- Respeto de `insets.bottom`.
- `accessibilityRole="tab"` y `accessibilityState={{ selected }}`.
- Etiqueta visible en el activo (solo icono no basta para accesibilidad).

---

## Modo oscuro / claro y tamaños

- **`useColorScheme()`** devuelve `'light' | 'dark' | null`. `null` ocurre en iOS con pantalla en modo auto apagada: **siempre** tiene fallback.
- **No hardcodees `Platform.OS` para estilos visuales.** Diferencias legítimas de estilo entre plataformas son pocas (sombra, ripple, behaviors de teclado). Todo lo demás va por tokens.
- **Probá en ambas plataformas.** Android devuelve altura de barra de estado distinta, tiene botones de navegación, y `elevation` donde iOS no lo tiene. Un diseño que solo probaste en iOS falla en Android.
- **iPhone SE (375px de ancho)** es el test de layout más duro. Si funciona ahí, funciona en todas partes.

---

## Animaciones

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

const scale = useSharedValue(1)

const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

scale.value = withSpring(0.96, { damping: 18, stiffness: 180, mass: 0.8 })
```

Usa los valores de `theme.motion.spring` para que las animaciones sean consistentes con el web. `Animated` de RN sirve para transiciones simples; `reanimated` para gestos y animaciones en el hilo de UI (60fps sin caídas).

**Respeta la reducción de movimiento**: lee `AccessibilityInfo.isReduceMotionEnabled()` y, si está activo, sustituye animaciones de posición por cambios de opacidad de 100ms.
