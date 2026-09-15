import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LogoutButton from '../../components/LogoutButton'
import { styles, GREEN, BLUE, ORANGE, PURPLE, RED, BG, WHITE, OFF_WHITE, SUBTLE, TEXT_DARK, TEXT_MID } from '../../../styles/Interfaz_Administrador_Inicio.styles'
import Saludo from '../../components/Saludo'



// ── RESUMEN GENERAL (mock) ──
const OVERVIEW = {
  vehicleModels: 12,
  vehiclePhotos: 84,
  activePromotions: 5,
  workshops: 9,
  chargingStations: 14,
  pendingReview: 3,
}

// ── SECCIONES DE GESTIÓN ──
const MANAGEMENT_SECTIONS = [
  {
    id: 'photos',
    title: 'Fotos de Vehículos',
    subtitle: `${OVERVIEW.vehicleModels} modelos · ${OVERVIEW.vehiclePhotos} fotos`,
    icon: 'image-multiple-outline',
    color: BLUE,
  },
  {
    id: 'promotions',
    title: 'Promociones',
    subtitle: `${OVERVIEW.activePromotions} activas ahora`,
    icon: 'tag-outline',
    color: ORANGE,
  },
  {
    id: 'workshops',
    title: 'Talleres Autorizados',
    subtitle: `${OVERVIEW.workshops} ubicaciones registradas`,
    icon: 'wrench-outline',
    color: PURPLE,
  },
  {
    id: 'stations',
    title: 'Estaciones de Carga',
    subtitle: `${OVERVIEW.chargingStations} ubicaciones registradas`,
    icon: 'ev-station',
    color: GREEN,
  },
]

// ── ACTIVIDAD RECIENTE (mock) ──
const RECENT_ACTIVITY = [
  {
    id: '1',
    action: 'Nueva foto agregada',
    detail: 'Voltus Apex — vista lateral',
    time: 'Hace 12 min',
    icon: 'image-plus',
    color: BLUE,
  },
  {
    id: '2',
    action: 'Promoción actualizada',
    detail: '20% OFF Neo 2024',
    time: 'Hace 1 h',
    icon: 'tag-edit-outline',
    color: ORANGE,
  },
  {
    id: '3',
    action: 'Nueva estación registrada',
    detail: 'GreenPlug Zona Sur',
    time: 'Ayer, 18:40',
    icon: 'ev-station',
    color: GREEN,
  },
  {
    id: '4',
    action: 'Taller pendiente de revisión',
    detail: 'Taller Miraflores EV',
    time: 'Ayer, 10:15',
    icon: 'alert-circle-outline',
    color: RED,
  },
]

const Interfaz_Administrador_Inicio = () => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      
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
        {/* ── ALERTA DE PENDIENTES ── */}
        {OVERVIEW.pendingReview > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={ORANGE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {`${OVERVIEW.pendingReview} elementos pendientes de revisión`}
              </Text>
              <Text style={styles.alertSub}>{'Talleres y estaciones enviados por usuarios'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={ORANGE} />
          </View>
        )}

        {/* ── STATS GENERALES ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${BLUE}18` }]}>
              <MaterialCommunityIcons name="car-multiple" size={18} color={BLUE} />
            </View>
            <Text style={styles.statValue}>{OVERVIEW.vehicleModels}</Text>
            <Text style={styles.statLabel}>{'Modelos'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${GREEN}18` }]}>
              <MaterialCommunityIcons name="ev-station" size={18} color={GREEN} />
            </View>
            <Text style={styles.statValue}>{OVERVIEW.chargingStations}</Text>
            <Text style={styles.statLabel}>{'Estaciones'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${PURPLE}18` }]}>
              <MaterialCommunityIcons name="wrench-outline" size={18} color={PURPLE} />
            </View>
            <Text style={styles.statValue}>{OVERVIEW.workshops}</Text>
            <Text style={styles.statLabel}>{'Talleres'}</Text>
          </View>
        </View>

        {/* ── SECCIONES DE GESTIÓN ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Gestión de contenido'}</Text>

          <View style={styles.managementGrid}>
            {MANAGEMENT_SECTIONS.map(s => (
              <TouchableOpacity key={s.id} style={styles.managementCard} activeOpacity={0.85}>
                <View style={[styles.managementIconBox, { backgroundColor: `${s.color}18` }]}>
                  <MaterialCommunityIcons name={s.icon as any} size={24} color={s.color} />
                </View>
                <Text style={styles.managementTitle}>{s.title}</Text>
                <Text style={styles.managementSubtitle}>{s.subtitle}</Text>

                <View style={styles.managementFooter}>
                  <Text style={[styles.managementLink, { color: s.color }]}>{'Gestionar'}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={13} color={s.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── ACCIONES RÁPIDAS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Acciones rápidas'}</Text>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.85}>
              <MaterialCommunityIcons name="image-plus" size={16} color={WHITE} />
              <Text style={styles.quickActionBtnText}>{'Subir foto'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, styles.quickActionBtnOutline]} activeOpacity={0.85}>
              <MaterialCommunityIcons name="tag-plus-outline" size={16} color={TEXT_DARK} />
              <Text style={[styles.quickActionBtnText, { color: TEXT_DARK }]}>{'Nueva promo'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.quickActionsRow, { marginTop: 10 }]}>
            <TouchableOpacity style={[styles.quickActionBtn, styles.quickActionBtnOutline]} activeOpacity={0.85}>
              <MaterialCommunityIcons name="map-marker-plus-outline" size={16} color={TEXT_DARK} />
              <Text style={[styles.quickActionBtnText, { color: TEXT_DARK }]}>{'Agregar taller'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, styles.quickActionBtnOutline]} activeOpacity={0.85}>
              <MaterialCommunityIcons name="map-marker-plus-outline" size={16} color={TEXT_DARK} />
              <Text style={[styles.quickActionBtnText, { color: TEXT_DARK }]}>{'Agregar estación'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ACTIVIDAD RECIENTE ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{'Actividad reciente'}</Text>
            <TouchableOpacity style={styles.sectionLinkRow}>
              <Text style={styles.sectionLink}>{'Ver todo'}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={GREEN} />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12, gap: 10 }}>
            {RECENT_ACTIVITY.map(a => (
              <View key={a.id} style={styles.activityRow}>
                <View style={[styles.activityIconBox, { backgroundColor: `${a.color}18` }]}>
                  <MaterialCommunityIcons name={a.icon as any} size={18} color={a.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityAction}>{a.action}</Text>
                  <Text style={styles.activityDetail} numberOfLines={1}>{a.detail}</Text>
                </View>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Interfaz_Administrador_Inicio

