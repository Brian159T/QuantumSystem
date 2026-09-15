import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native'
import React, { useRef, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LogoutButton from '../../components/LogoutButton'
import { styles, SCREEN_WIDTH, CARD_WIDTH, CARD_GAP, CARD_SIDE_PADDING, GREEN, BLUE, ORANGE, RED, BG, WHITE, OFF_WHITE, SUBTLE, TEXT_DARK, TEXT_MID } from '../../../styles/InicioScreen_usuario_vehiculo.styles'
import Saludo from '../../components/Saludo'
// ── DATOS DEL VEHÍCULO (mock) ──
const VEHICLE = {
  name: 'Voltus Neo',
  plate: 'BLP-1204',
  batteryPct: 68,
  rangeKm: 286,
  isCharging: false,
  minutesToFull: 42,
  lastChargedAt: 'Hoy, 07:40 AM',
  health: 96,
}

const NEARBY_STATIONS = [
  {
    id: '1',
    name: 'Voltus Hub San Miguel',
    distanceKm: 1.2,
    available: 4,
    total: 6,
    speed: 'Ultra rápida',
    pricePerKwh: '$0.32',
  },
  {
    id: '2',
    name: 'GreenPlug Zona Sur',
    distanceKm: 3.4,
    available: 2,
    total: 8,
    speed: 'Rápida',
    pricePerKwh: '$0.35',
  },
  {
    id: '3',
    name: 'Voltus Station Sopocachi',
    distanceKm: 4.1,
    available: 0,
    total: 2,
    speed: 'Estándar',
    pricePerKwh: '$0.30',
  },
  {
    id: '4',
    name: 'EcoCarga Obrajes',
    distanceKm: 5.0,
    available: 1,
    total: 4,
    speed: 'Rápida',
    pricePerKwh: '$0.28',
  },
]

const HISTORY = [
  { id: '1', date: 'Ayer, 19:20', station: 'Voltus Hub San Miguel', kwh: 32, cost: '$10.24' },
  { id: '2', date: 'Lun, 08:05', station: 'GreenPlug Zona Sur', kwh: 41, cost: '$14.35' },
  { id: '3', date: 'Sáb, 17:50', station: 'Voltus Station Sopocachi', kwh: 18, cost: '$5.40' },
]

const speedColor = (speed: string) => {
  if (speed === 'Ultra rápida') return GREEN
  if (speed === 'Rápida') return BLUE
  return ORANGE
}

const batteryColor = (pct: number) => {
  if (pct >= 50) return GREEN
  if (pct >= 20) return ORANGE
  return RED
}

const InicioScreen_usuario_vehiculo = () => {
  const flatListRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const onScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP))
    setActiveIndex(index)
  }

  const renderStationCard = ({ item }: { item: typeof NEARBY_STATIONS[0] }) => {
    const isFull = item.available === 0
    return (
      <View style={styles.stationCard}>
        <View style={styles.stationCardTop}>
          <View style={styles.stationIconBox}>
            <MaterialCommunityIcons name="ev-station" size={20} color={GREEN} />
          </View>
          <View style={styles.stationDistanceBox}>
            <Text style={styles.stationDistanceValue}>{item.distanceKm.toFixed(1)}</Text>
            <Text style={styles.stationDistanceUnit}>{'km'}</Text>
          </View>
        </View>

        <Text style={styles.stationName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.stationInfoRow}>
          <View style={[styles.availabilityPill, isFull ? styles.availabilityPillRed : styles.availabilityPillGreen]}>
            <View style={[styles.dotStatus, { backgroundColor: isFull ? RED : GREEN }]} />
            <Text style={[styles.availabilityText, { color: isFull ? RED : GREEN }]}>
              {isFull ? 'Ocupado' : `${item.available}/${item.total} libres`}
            </Text>
          </View>
        </View>

        <View style={styles.stationFooter}>
          <View style={styles.speedRow}>
            <MaterialCommunityIcons name="flash" size={12} color={speedColor(item.speed)} />
            <Text style={[styles.speedText, { color: speedColor(item.speed) }]}>{item.speed}</Text>
          </View>
          <Text style={styles.stationPrice}>{item.pricePerKwh}{'/kWh'}</Text>
        </View>

        <TouchableOpacity style={styles.routeBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="map-marker-path" size={13} color={WHITE} />
          <Text style={styles.routeBtnText}>{'Ver ruta'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── HEADER FIJO ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Saludo />
        </View>
        <LogoutButton />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── TARJETA DE VEHÍCULO / BATERÍA ── */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleTopRow}>
            <View>
              <Text style={styles.vehicleName}>{VEHICLE.name}</Text>
              <Text style={styles.vehiclePlate}>{VEHICLE.plate}</Text>
            </View>
            <View style={styles.vehicleStatusPill}>
              <MaterialCommunityIcons
                name={VEHICLE.isCharging ? 'flash' : 'check-circle-outline'}
                size={12}
                color={VEHICLE.isCharging ? ORANGE : GREEN}
              />
              <Text style={[styles.vehicleStatusText, { color: VEHICLE.isCharging ? ORANGE : GREEN }]}>
                {VEHICLE.isCharging ? 'Cargando' : 'Listo'}
              </Text>
            </View>
          </View>

          <View style={styles.batteryRow}>
            <View style={styles.batteryRingBox}>
              <View style={styles.batteryRingOuter}>
                <Text style={styles.batteryPct}>{`${VEHICLE.batteryPct}%`}</Text>
                <Text style={styles.batteryPctLabel}>{'batería'}</Text>
              </View>
            </View>

            <View style={styles.batteryDetails}>
              <View style={styles.batteryBarTrack}>
                <View
                  style={[
                    styles.batteryBarFill,
                    { width: `${VEHICLE.batteryPct}%`, backgroundColor: batteryColor(VEHICLE.batteryPct) },
                  ]}
                />
              </View>

              <View style={styles.batteryStatsRow}>
                <View style={styles.batteryStatItem}>
                  <MaterialCommunityIcons name="road-variant" size={13} color={WHITE} />
                  <Text style={styles.batteryStatText}>{`${VEHICLE.rangeKm} km`}</Text>
                </View>
                <View style={styles.batteryStatItem}>
                  <MaterialCommunityIcons name="heart-pulse" size={13} color={WHITE} />
                  <Text style={styles.batteryStatText}>{`Salud ${VEHICLE.health}%`}</Text>
                </View>
              </View>

              <Text style={styles.lastCharged}>{`Última carga: ${VEHICLE.lastChargedAt}`}</Text>
            </View>
          </View>
        </View>

        {/* ── ACCIONES RÁPIDAS ── */}
        <View style={styles.quickActionsRow}>
          {[
            { icon: 'map-search-outline', label: 'Buscar\nestación', color: GREEN },
            { icon: 'flash-outline', label: 'Iniciar\ncarga', color: BLUE },
            { icon: 'routes', label: 'Planificar\nviaje', color: ORANGE },
            { icon: 'history', label: 'Historial', color: '#a78bfa' },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} activeOpacity={0.85}>
              <View style={[styles.quickActionIconBox, { backgroundColor: `${a.color}18` }]}>
                <MaterialCommunityIcons name={a.icon as any} size={20} color={a.color} />
              </View>
              <Text style={styles.quickActionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── ESTACIONES CERCANAS ── */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{'Estaciones cercanas'}</Text>
            <TouchableOpacity style={styles.sectionLinkRow}>
              <Text style={styles.sectionLink}>{'Ver todas'}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={GREEN} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={NEARBY_STATIONS}
            keyExtractor={item => item.id}
            renderItem={renderStationCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselList}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH + CARD_GAP,
              offset: (CARD_WIDTH + CARD_GAP) * index,
              index,
            })}
          />

          <View style={styles.dots}>
            {NEARBY_STATIONS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── BANNER: PLANIFICAR VIAJE ── */}
        <View style={styles.tripBanner}>
          <View style={styles.tripBannerLeft}>
            <Text style={styles.tripBannerEyebrow}>{'Ruta inteligente'}</Text>
            <Text style={styles.tripBannerTitle}>{'Planifica tu\npróximo viaje'}</Text>
            <Text style={styles.tripBannerSub}>{'Calculamos paradas de carga en el camino'}</Text>
            <TouchableOpacity style={styles.tripBannerBtn}>
              <MaterialCommunityIcons name="map-marker-distance" size={13} color={WHITE} />
              <Text style={styles.tripBannerBtnText}>{' Crear ruta'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tripBannerIconBox}>
            <MaterialCommunityIcons name="car-electric" size={42} color={GREEN} />
          </View>
        </View>

        {/* ── HISTORIAL DE CARGAS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Historial de cargas'}</Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            {HISTORY.map(h => (
              <View key={h.id} style={styles.historyRow}>
                <View style={styles.historyIconBox}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyStation} numberOfLines={1}>{h.station}</Text>
                  <Text style={styles.historyDate}>{h.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyKwh}>{`${h.kwh} kWh`}</Text>
                  <Text style={styles.historyCost}>{h.cost}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default InicioScreen_usuario_vehiculo

