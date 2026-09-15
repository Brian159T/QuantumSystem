import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Linking,
} from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LogoutButton from '../../components/LogoutButton'
import { styles, GREEN, BLUE, ORANGE, RED, BG, WHITE, OFF_WHITE, SUBTLE, TEXT_DARK, TEXT_MID } from '../../../styles/EmergenciasScreen_usuario_vehiculo.styles'


// ── SERVICIO DE SALUD CONFIGURADO (mock) ──
type HealthService = {
  configured: boolean
  provider: string
  plan: string
  phone: string
  policyNumber: string
}

const DEFAULT_HEALTH_SERVICE: HealthService = {
  configured: true,
  provider: 'Seguros Illimani Salud',
  plan: 'Plan Premium Familiar',
  phone: '+591 800-10-2233',
  policyNumber: 'POL-88421',
}

const EMERGENCY_CONTACTS = [
  { id: '1', label: 'Grúa Voltus 24/7', number: '+591 700-11223', icon: 'tow-truck', color: ORANGE },
  { id: '2', label: 'Policía Boliviana', number: '110', icon: 'shield-alert-outline', color: BLUE },
  { id: '3', label: 'Bomberos', number: '119', icon: 'fire-truck', color: RED },
  { id: '4', label: 'Ambulancia', number: '118', icon: 'ambulance', color: GREEN },
]

const EmergenciasScreen_usuario_vehiculo = () => {
  const [healthService, setHealthService] = useState<HealthService>(DEFAULT_HEALTH_SERVICE)
  const [isConfiguring, setIsConfiguring] = useState(false)

  const callNumber = (number: string) => {
    const cleaned = number.replace(/[^+\d]/g, '')
    Linking.openURL(`tel:${cleaned}`)
  }

  const handleConfigure = () => {
    // Aquí se abriría un formulario o modal para editar el servicio de salud
    setIsConfiguring(true)
  }

  const handleCallHealthService = () => {
    callNumber(healthService.phone)
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── HEADER FIJO ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{'AYUDA INMEDIATA'}</Text>
          <Text style={styles.headerTitle}>{'Emergencias'}</Text>
        </View>
        <LogoutButton />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── BOTÓN SOS PRINCIPAL ── */}
        <View style={styles.sosCard}>
          <View style={styles.sosIconRing}>
            <MaterialCommunityIcons name="alert-decagram" size={30} color={RED} />
          </View>
          <Text style={styles.sosTitle}>{'¿Tienes una emergencia?'}</Text>
          <Text style={styles.sosSub}>{'Comparte tu ubicación y pide ayuda al instante'}</Text>
          <TouchableOpacity style={styles.sosBtn} activeOpacity={0.85} onPress={() => callNumber('911')}>
            <MaterialCommunityIcons name="phone-alert-outline" size={16} color={WHITE} />
            <Text style={styles.sosBtnText}>{'Llamar a emergencias'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── SERVICIO DE SALUD ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Tu servicio de salud'}</Text>

          <View style={styles.healthCard}>
            {healthService.configured ? (
              <>
                <View style={styles.healthTopRow}>
                  <View style={styles.healthIconBox}>
                    <MaterialCommunityIcons name="hospital-box-outline" size={22} color={GREEN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.healthProvider}>{healthService.provider}</Text>
                    <Text style={styles.healthPlan}>{healthService.plan}</Text>
                  </View>
                  <View style={styles.healthActivePill}>
                    <View style={styles.dotStatus} />
                    <Text style={styles.healthActiveText}>{'Activo'}</Text>
                  </View>
                </View>

                <View style={styles.healthDetailsRow}>
                  <View style={styles.healthDetailItem}>
                    <Text style={styles.healthDetailLabel}>{'N° de póliza'}</Text>
                    <Text style={styles.healthDetailValue}>{healthService.policyNumber}</Text>
                  </View>
                  <View style={styles.healthDetailDivider} />
                  <View style={styles.healthDetailItem}>
                    <Text style={styles.healthDetailLabel}>{'Teléfono'}</Text>
                    <Text style={styles.healthDetailValue}>{healthService.phone}</Text>
                  </View>
                </View>

                <View style={styles.healthBtnRow}>
                  <TouchableOpacity
                    style={styles.configureBtn}
                    activeOpacity={0.85}
                    onPress={handleConfigure}
                  >
                    <MaterialCommunityIcons name="cog-outline" size={14} color={TEXT_DARK} />
                    <Text style={styles.configureBtnText}>{'Configurar'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.callHealthBtn}
                    activeOpacity={0.85}
                    onPress={handleCallHealthService}
                  >
                    <MaterialCommunityIcons name="phone-outline" size={14} color={WHITE} />
                    <Text style={styles.callHealthBtnText}>{'Llamar ahora'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.healthEmptyState}>
                <MaterialCommunityIcons name="hospital-box-outline" size={30} color={SUBTLE} />
                <Text style={styles.healthEmptyTitle}>{'Aún no configuras tu servicio de salud'}</Text>
                <Text style={styles.healthEmptySub}>{'Agrega tu seguro o contacto médico para tenerlo a mano en caso de emergencia'}</Text>
                <TouchableOpacity style={styles.configureEmptyBtn} activeOpacity={0.85} onPress={handleConfigure}>
                  <MaterialCommunityIcons name="plus" size={14} color={WHITE} />
                  <Text style={styles.configureEmptyBtnText}>{'Configurar servicio'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isConfiguring && (
            <View style={styles.configuringNotice}>
              <MaterialCommunityIcons name="information-outline" size={14} color={BLUE} />
              <Text style={styles.configuringNoticeText}>
                {'Aquí se abrirá el formulario para editar tu proveedor, plan y número de póliza.'}
              </Text>
            </View>
          )}
        </View>

        {/* ── CONTACTOS DE EMERGENCIA ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'Contactos de emergencia'}</Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            {EMERGENCY_CONTACTS.map(c => (
              <View key={c.id} style={styles.contactRow}>
                <View style={[styles.contactIconBox, { backgroundColor: `${c.color}18` }]}>
                  <MaterialCommunityIcons name={c.icon as any} size={20} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Text style={styles.contactNumber}>{c.number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.contactCallBtn}
                  activeOpacity={0.85}
                  onPress={() => callNumber(c.number)}
                >
                  <MaterialCommunityIcons name="phone" size={16} color={WHITE} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ── BANNER: COMPARTIR UBICACIÓN ── */}
        <View style={styles.locationBanner}>
          <View style={styles.locationBannerLeft}>
            <Text style={styles.locationBannerEyebrow}>{'Seguridad extra'}</Text>
            <Text style={styles.locationBannerTitle}>{'Comparte tu\nubicación en vivo'}</Text>
            <Text style={styles.locationBannerSub}>{'Un contacto de confianza podrá ver dónde estás'}</Text>
            <TouchableOpacity style={styles.locationBannerBtn}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={13} color={WHITE} />
              <Text style={styles.locationBannerBtnText}>{' Compartir ahora'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationBannerIconBox}>
            <MaterialCommunityIcons name="crosshairs-gps" size={40} color={GREEN} />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default EmergenciasScreen_usuario_vehiculo

