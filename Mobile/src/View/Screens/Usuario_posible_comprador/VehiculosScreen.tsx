import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LoginButton from '../../components/LoginButton'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SPEC_CARD_WIDTH = SCREEN_WIDTH - 40
import { styles, GREEN, BLUE, BG_DARK, WHITE, TEXT_DARK, TEXT_SOFT } from '../../../styles/VehiculosScreen.styles'


type CarColor = { name: string; hex: string }
type CarModel = {
  id: string
  name: string
  subtitle: string
  price: string
  originalPrice?: string
  range: string
  acceleration: string
  topSpeed: string
  charge: string
  seats: number
  drive: string
  image: string
  colors: CarColor[]
  badge?: string
  discount?: string
}

const CAR_MODELS: CarModel[] = [
  {
    id: '1', name: 'Voltus Neo', subtitle: 'Compact', price: '$34,900', originalPrice: '$41,880',
    range: '420 km', acceleration: '5.8s', topSpeed: '225 km/h', charge: 'AC/DC', seats: 5, drive: 'RWD',
    badge: '#1 Más vendido', discount: '20% OFF',
    image: 'https://placehold.co/500x280/0f2a1e/2fb676?text=Neo',
    colors: [{ name: 'Deep Blue', hex: '#1a3a6e' }, { name: 'Matte Green', hex: '#2fb676' },
             { name: 'Arctic White', hex: '#e8edf2' }, { name: 'Charcoal', hex: '#3a3a3a' }],
  },
  {
    id: '2', name: 'Voltus Terra', subtitle: 'SUV', price: '$47,500',
    range: '510 km', acceleration: '6.2s', topSpeed: '210 km/h', charge: 'AC/DC', seats: 7, drive: 'AWD',
    badge: '#2 Popular',
    image: 'https://placehold.co/500x280/0f1f3d/4D9FFF?text=Terra',
    colors: [{ name: 'Ocean Blue', hex: '#1e4080' }, { name: 'Pearl White', hex: '#f0f0f0' },
             { name: 'Midnight Black', hex: '#1a1a1a' }, { name: 'Desert Red', hex: '#8b2020' }],
  },
  {
    id: '3', name: 'Voltus Arc', subtitle: 'Sedán', price: '$39,200',
    range: '480 km', acceleration: '5.1s', topSpeed: '240 km/h', charge: 'AC/DC', seats: 5, drive: 'RWD',
    badge: 'Nuevo 2024',
    image: 'https://placehold.co/500x280/1a1a2e/2fb676?text=Arc',
    colors: [{ name: 'Graphite', hex: '#4a4a5a' }, { name: 'Sky Blue', hex: '#4D9FFF' },
             { name: 'Ice White', hex: '#dce8f0' }, { name: 'Forest', hex: '#1e4a2a' }],
  },
  {
    id: '4', name: 'Voltus Crest', subtitle: 'Pickup', price: '$58,000',
    range: '390 km', acceleration: '7.0s', topSpeed: '185 km/h', charge: 'AC/DC', seats: 5, drive: '4WD',
    badge: 'Ed. Limitada',
    image: 'https://placehold.co/500x280/1a0f2e/9b59b6?text=Crest',
    colors: [{ name: 'Volcanic Black', hex: '#1a1a1a' }, { name: 'Bronze', hex: '#8b6914' },
             { name: 'Steel Gray', hex: '#6a7080' }, { name: 'Army Green', hex: '#3a4a20' }],
  },
  {
    id: '5', name: 'Voltus Zen', subtitle: 'Hatchback', price: '$28,400',
    range: '360 km', acceleration: '8.2s', topSpeed: '175 km/h', charge: 'AC', seats: 5, drive: 'FWD',
    badge: 'Más accesible',
    image: 'https://placehold.co/500x280/0f2a2a/2fb676?text=Zen',
    colors: [{ name: 'Coral', hex: '#c0604a' }, { name: 'Mint', hex: '#5abf9a' },
             { name: 'Lemon', hex: '#c8b840' }, { name: 'Navy', hex: '#1a2a5e' }],
  },
  {
    id: '6', name: 'Voltus Apex', subtitle: 'Coupé', price: '$64,900',
    range: '550 km', acceleration: '3.2s', topSpeed: '280 km/h', charge: 'DC Rápida', seats: 4, drive: 'AWD',
    badge: 'Performance',
    image: 'https://placehold.co/500x280/2a0f0f/e74c3c?text=Apex',
    colors: [{ name: 'Racing Red', hex: '#c0192a' }, { name: 'Carbon Black', hex: '#101010' },
             { name: 'Titanium', hex: '#8a9090' }, { name: 'Neon Green', hex: '#2fb676' }],
  },
  {
    id: '7', name: 'Voltus Drift', subtitle: 'Sport', price: '$72,000',
    range: '500 km', acceleration: '2.9s', topSpeed: '310 km/h', charge: 'DC Rápida', seats: 2, drive: 'RWD',
    badge: 'Top Velocidad',
    image: 'https://placehold.co/500x280/1a1000/f39c12?text=Drift',
    colors: [{ name: 'Sunset Orange', hex: '#c85a10' }, { name: 'Yellow Sport', hex: '#d4a010' },
             { name: 'Matte Black', hex: '#181818' }, { name: 'White Pearl', hex: '#f5f5f5' }],
  },
  {
    id: '8', name: 'Voltus Nova', subtitle: 'Crossover', price: '$43,500',
    range: '465 km', acceleration: '6.0s', topSpeed: '205 km/h', charge: 'AC/DC', seats: 5, drive: 'AWD',
    badge: 'Familia ideal',
    image: 'https://placehold.co/500x280/0f1a2a/2fb676?text=Nova',
    colors: [{ name: 'Aurora Blue', hex: '#2a5080' }, { name: 'Sand', hex: '#a89060' },
             { name: 'Olive', hex: '#5a6030' }, { name: 'Snow', hex: '#f0f2f5' }],
  },
  {
    id: '9', name: 'Voltus Orion', subtitle: 'SUV Grande', price: '$55,800',
    range: '430 km', acceleration: '6.8s', topSpeed: '195 km/h', charge: 'AC/DC', seats: 7, drive: 'AWD',
    badge: 'Más espacioso',
    image: 'https://placehold.co/500x280/0a1628/4D9FFF?text=Orion',
    colors: [{ name: 'Galaxy Black', hex: '#141820' }, { name: 'Cosmic Blue', hex: '#1e3060' },
             { name: 'Silver', hex: '#a0a8b0' }, { name: 'Crimson', hex: '#8a1a2a' }],
  },
  {
    id: '10', name: 'Voltus Lux', subtitle: 'Luxury', price: '$89,000',
    range: '580 km', acceleration: '4.0s', topSpeed: '260 km/h', charge: 'DC Rápida', seats: 5, drive: 'AWD',
    badge: 'Exclusivo',
    image: 'https://placehold.co/500x280/1a1500/f1c40f?text=Lux',
    colors: [{ name: 'Obsidian', hex: '#0a0a0a' }, { name: 'Champagne', hex: '#c0a860' },
             { name: 'Bordeaux', hex: '#601830' }, { name: 'Ivory', hex: '#f0ead0' }],
  },
  {
    id: '11', name: 'Voltus Scout', subtitle: 'Off-road', price: '$51,200',
    range: '410 km', acceleration: '7.5s', topSpeed: '180 km/h', charge: 'AC/DC', seats: 5, drive: '4WD',
    badge: 'Aventura',
    image: 'https://placehold.co/500x280/0f2010/2fb676?text=Scout',
    colors: [{ name: 'Jungle Green', hex: '#2a5020' }, { name: 'Mud Brown', hex: '#6a4820' },
             { name: 'Rock Gray', hex: '#607060' }, { name: 'Sand Dune', hex: '#c0a870' }],
  },
  {
    id: '12', name: 'Voltus Mini', subtitle: 'City Car', price: '$22,900',
    range: '300 km', acceleration: '9.5s', topSpeed: '155 km/h', charge: 'AC', seats: 4, drive: 'FWD',
    badge: 'Más económico',
    image: 'https://placehold.co/500x280/101a0f/2fb676?text=Mini',
    colors: [{ name: 'Candy Red', hex: '#b82030' }, { name: 'Sky Blue', hex: '#5090c0' },
             { name: 'Lime', hex: '#70b030' }, { name: 'White', hex: '#f5f5f5' }],
  },
]

// sombras y colores con opacidad calculados en JS
const shadowListCard = { shadowColor: '#0d1b3e', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }
const shadowCardSoft = { shadowColor: '#0d1b3e', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }
const shadowSwatch = { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }
const LIGHT_HEX = ['#f5f5f5', '#f0f0f0', '#e8edf2', '#f0ead0', '#dce8f0']

const VehiculosScreen = () => {
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null)
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({})
  const [specIndex, setSpecIndex] = useState(0)
  const specRef = useRef<FlatList>(null)

  // ── VISTA DETALLE ────────────────────────────────────────────────
  if (selectedModel) {
    const model = selectedModel
    const colorIdx = selectedColors[model.id] ?? 0
    const activeColor = model.colors[colorIdx]

    const specs = [
      { icon: 'lightning-bolt',       label: 'Autonomía',      value: model.range,          color: GREEN },
      { icon: 'speedometer',          label: '0-100 km/h',     value: model.acceleration,   color: BLUE },
      { icon: 'gauge',                label: 'Vel. máx.',      value: model.topSpeed,        color: '#f39c12' },
      { icon: 'ev-plug-type2',        label: 'Carga',          value: model.charge,          color: GREEN },
      { icon: 'account-group',        label: 'Asientos',       value: `${model.seats} pas.`, color: BLUE },
      { icon: 'car-traction-control', label: 'Tracción',       value: model.drive,           color: '#9b59b6' },
    ]

    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header — oscuro */}
          <View style={styles.detailHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedModel(null)}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={WHITE} />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>{model.name}</Text>
              <Text style={styles.headerSubtitle}>{model.subtitle}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Imagen */}
          <View
            style={[styles.imageWrap, { backgroundColor: `${activeColor.hex}22` }]}
          >
            <Image source={{ uri: model.image }} style={styles.detailImage} resizeMode="contain" />
            {model.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{model.discount}</Text>
              </View>
            )}
          </View>

          {/* Colores — tarjeta blanca */}
          <View style={[styles.colorsCard, shadowCardSoft]}>
            <Text style={styles.cardTitle}>Colores disponibles</Text>
            <View style={styles.activeColorRow}>
              <MaterialCommunityIcons name="palette" size={13} color={GREEN} />
              <Text style={styles.activeColorText}>{activeColor.name}</Text>
            </View>
            <View style={styles.swatchRow}>
              {model.colors.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.swatch,
                    shadowSwatch,
                    { backgroundColor: c.hex },
                    i === colorIdx ? styles.swatchActive : styles.swatchInactive,
                  ]}
                  onPress={() => setSelectedColors(prev => ({ ...prev, [model.id]: i }))}
                >
                  {i === colorIdx && (
                    <MaterialCommunityIcons
                      name="check"
                      size={14}
                      color={LIGHT_HEX.includes(c.hex) ? '#333' : WHITE}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.colorNamesRow}>
              {model.colors.map((c, i) => (
                <Text
                  key={i}
                  style={[
                    styles.colorNameText,
                    i === colorIdx ? styles.colorNameActive : styles.colorNameInactive,
                  ]}
                >
                  {c.name}
                </Text>
              ))}
            </View>
          </View>

          {/* Ficha técnica — tarjetas blancas */}
          <View style={styles.specsSection}>
            <Text style={styles.specsTitle}>Ficha Técnica</Text>
            <FlatList
              ref={specRef}
              data={specs}
              keyExtractor={(_, i) => String(i)}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SPEC_CARD_WIDTH + 12}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const i = Math.round(e.nativeEvent.contentOffset.x / (SPEC_CARD_WIDTH + 12))
                setSpecIndex(i)
              }}
              renderItem={({ item }) => (
                <View
                  style={[styles.specCard, shadowCardSoft, { width: SPEC_CARD_WIDTH, borderColor: `${item.color}33` }]}
                >
                  <View
                    style={[styles.specIconWrap, { backgroundColor: `${item.color}15` }]}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={styles.specLabel}>{item.label}</Text>
                  <Text style={[styles.specValue, { color: item.color }]}>
                    {item.value}
                  </Text>
                </View>
              )}
            />
            <View style={styles.specDotsRow}>
              {specs.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.specDot,
                    i === specIndex ? styles.specDotActive : styles.specDotInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Precio — tarjeta blanca */}
          <View style={[styles.priceCard, shadowCardSoft]}>
            <View>
              <Text style={styles.priceLabel}>Precio base</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{model.price}</Text>
                {model.originalPrice && (
                  <Text style={styles.originalPrice}>{model.originalPrice}</Text>
                )}
              </View>
            </View>
            <View
              style={[styles.driveBadge, { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}44` }]}
            >
              <MaterialCommunityIcons name="car-traction-control" size={14} color={GREEN} />
              <Text style={styles.driveBadgeText}>{model.drive}</Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="calendar-check" size={18} color={WHITE} />
            <Text style={styles.ctaButtonText}>RESERVAR ESTE MODELO</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>
            El precio de reserva es reembolsable
          </Text>
        </ScrollView>
      </View>
    )
  }

  // ── LISTA DE MODELOS ─────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />

      {/* Header — oscuro */}
      <View style={styles.listHeader}>
        <LoginButton onPress={() => {}} />
      </View>

      {/* Lista — fondo gris claro, tarjetas blancas */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}>
        {CAR_MODELS.map((model, index) => {
          const colorIdx = selectedColors[model.id] ?? 0
          const activeColor = model.colors[colorIdx]
          return (
            <TouchableOpacity
              key={model.id}
              style={[styles.modelCard, shadowListCard]}
              onPress={() => setSelectedModel(model)}
              activeOpacity={0.85}
            >
              <Text style={styles.modelIndex}>{index + 1}.</Text>

              <View style={styles.modelInfo}>
                <View style={styles.modelNameRow}>
                  <Text style={styles.modelName}>{model.name}</Text>
                  {model.badge && (
                    <View
                      style={[styles.modelBadge, { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}44` }]}
                    >
                      <Text style={styles.modelBadgeText}>{model.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modelSubtitle}>{model.subtitle}</Text>

                <View style={styles.modelSpecRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={11} color={GREEN} />
                  <Text style={styles.modelSpecText}>{model.range}</Text>
                </View>
                <View style={styles.modelSpecRow}>
                  <MaterialCommunityIcons name="ev-plug-type2" size={11} color={BLUE} />
                  <Text style={styles.modelSpecText}>{model.charge}</Text>
                </View>

                <View style={styles.modelColorsRow}>
                  {model.colors.map((c, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.miniSwatch,
                        { backgroundColor: c.hex },
                        i === colorIdx ? styles.miniSwatchActive : styles.miniSwatchInactive,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation?.()
                        setSelectedColors(prev => ({ ...prev, [model.id]: i }))
                      }}
                    />
                  ))}
                </View>
                <Text style={styles.modelColorName}>{activeColor.name}</Text>
              </View>

              <View style={styles.modelRight}>
                <Image source={{ uri: model.image }} style={styles.modelImage} resizeMode="contain" />
                <View
                  style={[styles.modelPriceBadge, { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}44` }]}
                >
                  <Text style={styles.modelPriceText}>De {model.price}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={TEXT_SOFT}
                  style={{ alignSelf: 'flex-end', marginTop: 4 }}
                />
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}


export default VehiculosScreen