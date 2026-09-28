# Patrones móviles (React Native + TypeScript)

Recetas completas del **Tema C — `darkGreenMobile`** (verde oscuro, app de gestión de vehículo).
Datos de ejemplo inventados.

## Bloques base

### Card, SectionTitle, Button

```tsx
// components/Card.tsx
import type { ViewStyle } from 'react-native'
import { View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { shadow } from '@/theme/shadows'

type CardProps = {
  children: React.ReactNode
  style?: ViewStyle
  padding?: 'none' | 'sm' | 'md'
  elevation?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, style, padding = 'md', elevation = 'sm' }: CardProps) {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing[padding === 'md' ? 'lg' : padding === 'sm' ? 'md' : 0],
        },
        shadow(theme, elevation),
        style,
      ]}
    >
      {children}
    </View>
  )
}
```

```tsx
// components/Button.tsx
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Variant = 'primary' | 'surface' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  accessibilityLabel?: string
}

const HEIGHT: Record<Size, number> = { sm: 40, md: 48, lg: 56 }
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 16 }

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const { theme } = useTheme()
  const isDisabled = disabled || loading

  const background =
    variant === 'primary' ? theme.colors.primary :
    variant === 'surface' ? theme.colors.surfaceAlt : 'transparent'

  const color =
    variant === 'primary' ? theme.colors.primaryContrast : theme.colors.text

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={{ color: theme.colors.accentSoft }}
      style={({ pressed }) => [
        styles.button,
        {
          height: HEIGHT[size],
          backgroundColor: background,
          borderRadius: theme.radii.pill,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.spacing.xl,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        pressed && { opacity: 0.8 },
        isDisabled && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text
          style={{
            color,
            fontSize: FONT[size],
            fontWeight: '700',
            letterSpacing: 0.04,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  )
}
```

---

## 1. VehicleCard — tarjeta de vehículo con estado de batería

```tsx
// features/garage/VehicleCard.tsx
import { memo } from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import { Battery, Clock, Plug, ArrowRight } from 'lucide-react-native'
import { useTheme } from '@/theme/useTheme'
import { shadow } from '@/theme/shadows'
import { Card } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'

export type Vehicle = {
  id: string
  name: string
  plate: string
  imageUrl: string
  batteryLevel: number      // 0 - 100
  rangeKm: number
  isCharging: boolean
  lastSeenAt: string
}

type VehicleCardProps = {
  vehicle: Vehicle
  onPress: (vehicle: Vehicle) => void
}

function VehicleCardBase({ vehicle, onPress }: VehicleCardProps) {
  const { theme } = useTheme()

  const statusColor = vehicle.isCharging ? theme.colors.success : theme.colors.warning
  const statusLabel = vehicle.isCharging ? 'Cargando' : 'En reposo'

  return (
    <Pressable
      onPress={() => onPress(vehicle)}
      accessibilityRole="button"
      accessibilityLabel={`${vehicle.name}, matricula ${vehicle.plate}, bateria ${vehicle.batteryLevel} por ciento`}
      accessibilityHint="Abre el detalle del vehiculo"
      android_ripple={{ color: theme.colors.accentSoft }}
      style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
    >
      <Card elevation="md" padding="none" style={{ overflow: 'hidden' }}>
        <View style={styles.media}>
          <Image
            source={{ uri: vehicle.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${vehicle.name}, ${vehicle.plate}`}
          />

          {/* Chip de estado sobre la foto */}
          <View style={[styles.statusChip, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: theme.colors.text }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.flex}>
              <Text
                numberOfLines={1}
                style={[styles.name, { color: theme.colors.text, fontSize: theme.typography.subheading.fontSize }]}
              >
                {vehicle.name}
              </Text>
              <Text
                style={[
                  styles.plate,
                  { color: theme.colors.textMuted, fontSize: theme.typography.caption.fontSize },
                ]}
              >
                {vehicle.plate}
              </Text>
            </View>

            <ArrowRight size={20} color={theme.colors.textMuted} accessibilityElementsHidden />
          </View>

          <View style={styles.batteryRow}>
            <Battery size={18} color={theme.colors.primary} accessibilityElementsHidden />
            <Text style={[styles.batteryValue, { color: theme.colors.text }]}>
              {vehicle.batteryLevel}%
            </Text>
            <Text style={[styles.batteryHint, { color: theme.colors.textMuted }]}>
              ~{vehicle.rangeKm} km
            </Text>
          </View>

          <ProgressBar
            value={vehicle.batteryLevel}
            tint={vehicle.batteryLevel < 20 ? theme.colors.danger : theme.colors.primary}
            track={theme.colors.surfaceAlt}
            accessibilityLabel={`Bateria al ${vehicle.batteryLevel} por ciento`}
          />

          <View style={styles.footer}>
            <View style={styles.metaItem}>
              <Clock size={14} color={theme.colors.textMuted} accessibilityElementsHidden />
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{vehicle.lastSeenAt}</Text>
            </View>
            <View style={styles.metaItem}>
              <Plug size={14} color={theme.colors.textMuted} accessibilityElementsHidden />
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>220 kW</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

export const VehicleCard = memo(VehicleCardBase)
```

```ts
// components/ProgressBar.tsx
import { View } from 'react-native'

type ProgressBarProps = {
  value: number          // 0 - 100
  tint: string
  track: string
  height?: number
  accessibilityLabel: string
}

export function ProgressBar({
  value,
  tint,
  track,
  height = 8,
  accessibilityLabel,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}
    >
      <View style={{ width: `${clamped}%`, height: '100%', backgroundColor: tint, borderRadius: height / 2 }} />
    </View>
  )
}
```

Notas del patrón:
- `borderWidth: 1` con `borderColor: theme.colors.border` (rgba) da el hairline verde sutil del tema; sin `overflow: 'hidden'` la imagen se sale de las esquinas redondeadas.
- La tarjeta se envuelve en `Pressable`, no en `Card`, para que el ripple de Android no se recorte en los bordes redondeados.
- `memo` en la tarjeta: la lista la re-renderiza en cada cambio de estado global.

---

## 2. MetricsRow — fila de métricas de consumo

```tsx
// features/home/MetricsRow.tsx
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Fuel, Receipt, Activity } from 'lucide-react-native'
import { useTheme } from '@/theme/useTheme'
import { shadow } from '@/theme/shadows'

export type MetricKind = 'fuel' | 'expense' | 'health'

type Metric = {
  kind: MetricKind
  label: string
  value: string
  unit: string
  delta?: number        // porcentaje vs. mes anterior
}

type MetricsRowProps = {
  metrics: Metric[]
  onSelect: (kind: MetricKind) => void
}

/** Cada icono usa su color secundario; el verde se reserva para el activo. */
const ACCENTS: Record<MetricKind, string> = {
  fuel: '#F59E0B',
  expense: '#A855F7',
  health: '#22C55E',
}

const ICONS: Record<MetricKind, typeof Fuel> = {
  fuel: Fuel,
  expense: Receipt,
  health: Activity,
}

const deltaColor = (delta: number, theme: ReturnType<typeof useTheme>['theme']) =>
  delta <= 0 ? theme.colors.success : theme.colors.danger

function MetricsRowBase({ metrics, onSelect }: MetricsRowProps) {
  const { theme } = useTheme()

  return (
    <View style={styles.row}>
      {metrics.map((metric) => {
        const Icon = ICONS[metric.kind]
        const accent = ACCENTS[metric.kind]

        return (
          <Pressable
            key={metric.kind}
            onPress={() => onSelect(metric.kind)}
            accessibilityRole="button"
            accessibilityLabel={`${metric.label}: ${metric.value} ${metric.unit}`}
            accessibilityHint="Ver detalle"
            android_ripple={{ color: theme.colors.accentSoft }}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
              },
              shadow(theme, 'sm'),
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: `${accent}22` }]}>
              <Icon size={18} color={accent} accessibilityElementsHidden />
            </View>

            <Text
              numberOfLines={1}
              style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.typography.caption.fontSize }]}
            >
              {metric.label}
            </Text>

            <View style={styles.valueRow}>
              <Text style={[styles.value, { color: theme.colors.text }]}>{metric.value}</Text>
              <Text style={[styles.unit, { color: theme.colors.textMuted }]}>{metric.unit}</Text>
            </View>

            {metric.delta !== undefined ? (
              <Text style={[styles.delta, { color: deltaColor(metric.delta, theme) }]}>
                {metric.delta > 0 ? '+' : ''}
                {metric.delta}% vs. mes anterior
              </Text>
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}

export const MetricsRow = memo(MetricsRowBase)
```

Datos de ejemplo:

```ts
const METRICS: Metric[] = [
  { kind: 'fuel', label: 'Consumo', value: '18.4', unit: 'kWh/100km', delta: -6 },
  { kind: 'expense', label: 'Gasto del mes', value: '142', unit: 'USD', delta: 12 },
  { kind: 'health', label: 'Salud de bateria', value: '94', unit: '%', delta: -1 },
]
```

Notas del patrón:
- El color verde de marca queda reservado para el elemento activo. Los datos usan su acento propio (ámbar / morado), igual que en el Tema B con el cian.
- El delta de consumo va en `success` si **baja** (es bueno), no si sube: la lógica de color es del dominio, no "verde = positivo".
- `${accent}22` es el mismo color con 13 % de alfa: un hex de 8 dígitos o `rgba` de `theme.effects.actionAccents`.

---

## 3. GlassTabBar — tab bar verde translúcida (Tema C)

```tsx
// navigation/GlassTabBar.tsx
import { Pressable, Text, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Home, Car, Compass, User } from 'lucide-react-native'
import { useTheme } from '@/theme/useTheme'
import { shadow } from '@/theme/shadows'
import { styles } from './GlassTabBar.styles'

const ICONS: Record<string, typeof Home> = {
  Home,
  Garage: Car,
  Explore: Compass,
  Profile: User,
}

const LABELS: Record<string, string> = {
  Home: 'Inicio',
  Garage: 'Garaje',
  Explore: 'Explorar',
  Profile: 'Perfil',
}

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.wrapper,
        {
          // El padding inferior suma el inset: sin esto el ultimo item
          // queda debajo del gesto de inicio del iPhone.
          paddingBottom: insets.bottom + theme.spacing.sm,
          paddingTop: theme.spacing.sm,
        },
        shadow(theme, 'lg'),
      ]}
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Capa solida de respaldo: si BlurView no monta (Android antiguo, web),
          el fondo sigue siendo opaco y el texto conserva el contraste. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.effects?.glass ?? theme.colors.surface, opacity: 0.92 },
        ]}
      />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = LABELS[route.name] ?? options.title ?? route.name
          const Icon = ICONS[route.name] ?? Home
          const focused = state.index === index

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              android_ripple={{ color: theme.colors.accentSoft, borderless: true, radius: 34 }}
              style={styles.item}
            >
              <View
                style={[
                  styles.pill,
                  focused
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: 'transparent' },
                ]}
              >
                <Icon
                  size={20}
                  color={focused ? theme.colors.primaryContrast : theme.colors.textMuted}
                  accessibilityElementsHidden
                />
              </View>

              {/* La etiqueta solo se muestra en el activo, pero sigue siendo
                  leida por el lector de pantalla en los inactivos. */}
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: focused ? theme.colors.text : theme.colors.textMuted },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
```

```ts
// navigation/GlassTabBar.styles.ts
import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.14)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 64,
    minHeight: 48,
    paddingHorizontal: 8,
  },
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
})
```

Cuatro correcciones que ya están aplicadas arriba (son los errores que hay que evitar):

1. El mapa `ICONS` solo declara claves que existen como `route.name`, y además hay un fallback `?? Home`. Una clave mal escrita devuelve `undefined` y React Native lanza al renderizar, normalmente en producción y solo en la pantalla que usa esa ruta.
2. La etiqueta **nunca** se oculta a lectores de pantalla: se oculta visualmente con ancho/opacidad, no con `display: 'none'`.
3. `BlurView` **siempre** necesita la capa opaca de respaldo: en Android sin `BlurView` montado, el texto claro sobre transparente es ilegible.
4. `position: 'absolute'` + `paddingBottom: insets.bottom` en la tab bar exige que la pantallaScrollable aplique `paddingBottom` extra (altura de la barra) para que el final del contenido no quede tapado.

---

## 4. Pantalla de detalle con carga, error y vacío

```tsx
// features/vehicle/VehicleScreen.tsx
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native'
import { BatteryCharging, TriangleAlert } from 'lucide-react-native'
import { useTheme } from '@/theme/useTheme'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import type { Vehicle } from '@/features/garage/VehicleCard'

type Props = {
  vehicle: Vehicle | null
  loading: boolean
  refreshing: boolean
  error: string | null
  onRefresh: () => void
  onRetry: () => void
}

export function VehicleScreen({ vehicle, loading, refreshing, error, onRefresh, onRetry }: Props) {
  const { theme } = useTheme()

  if (loading && !vehicle) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.helper, { color: theme.colors.textMuted }]}>Cargando vehiculo…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <TriangleAlert size={40} color={theme.colors.danger} accessibilityElementsHidden />
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>No pudimos cargar los datos</Text>
        <Text style={[styles.helper, { color: theme.colors.textMuted }]}>{error}</Text>
        <Button label="Reintentar" onPress={onRetry} />
      </View>
    )
  }

  if (!vehicle) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
        <BatteryCharging size={40} color={theme.colors.textMuted} accessibilityElementsHidden />
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Aun no hay vehiculos</Text>
        <Text style={[styles.helper, { color: theme.colors.textMuted }]}>
          Registra un vehiculo para ver su bateria y su consumo.
        </Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={styles.content}
      // Con teclado abierto, el primer tap no debe cerrarlo
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{vehicle.name}</Text>

      <Card>
        <Text style={{ color: theme.colors.text }}>Bateria</Text>
        <Text style={[styles.big, { color: theme.colors.primary }]}>{vehicle.batteryLevel}%</Text>
      </Card>
    </ScrollView>
  )
}
```

Los tres estados (carga / error / vacío) son parte del componente, no un `if` suelto en la pantalla. `error` y `!vehicle` son estados **distintos**: "no hay datos" no es "no se pudo cargar".
