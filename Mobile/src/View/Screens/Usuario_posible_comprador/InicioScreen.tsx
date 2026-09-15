import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LoginButton from '../../components/LoginButton'
import { styles, SCREEN_WIDTH, CARD_WIDTH, CARD_GAP, CARD_SIDE_PADDING, GREEN, BLUE, BG, WHITE, SUBTLE, TEXT_DARK, TEXT_MID,PLACEHOLDER_HERO } from '../../../styles/InicioScreen.styles'



const CAR_MODELS = [
  {
    id: '1',
    name: 'Voltus Neo',
    type: 'Compact',
    price: '$34,900',
    range: '420 km',
    charge: '6 meses gratis',
    badge: '#1 Más vendido',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/0f2a1e/2fb676?text=Neo',
  },
  {
    id: '2',
    name: 'Voltus Terra',
    type: 'SUV',
    price: '$47,500',
    range: '510 km',
    charge: 'AWD incluido',
    badge: '#2 Popular',
    badgeGreen: false,
    image: 'https://placehold.co/400x220/0f1f3d/4D9FFF?text=Terra',
  },
  {
    id: '3',
    name: 'Voltus Arc',
    type: 'Sedán',
    price: '$39,200',
    range: '480 km',
    charge: 'Sunroof incluido',
    badge: 'Nuevo 2024',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/1a1a2e/2fb676?text=Arc',
  },
  {
    id: '4',
    name: 'Voltus Crest',
    type: 'Pickup',
    price: '$58,000',
    range: '390 km',
    charge: 'Carga rápida DC',
    badge: 'Edición limitada',
    badgeGreen: false,
    image: 'https://placehold.co/400x220/1a0f2e/9b59b6?text=Crest',
  },
  {
    id: '5',
    name: 'Voltus Zen',
    type: 'Hatchback',
    price: '$28,400',
    range: '360 km',
    charge: 'Seguro 1 año',
    badge: 'Más accesible',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/0f2a2a/2fb676?text=Zen',
  },
  {
    id: '6',
    name: 'Voltus Apex',
    type: 'Coupé',
    price: '$64,900',
    range: '550 km',
    charge: '0-100 en 3.2s',
    badge: 'Performance',
    badgeGreen: false,
    image: 'https://placehold.co/400x220/2a0f0f/e74c3c?text=Apex',
  },
  {
    id: '7',
    name: 'Voltus Drift',
    type: 'Sport',
    price: '$72,000',
    range: '500 km',
    charge: 'Modo pista',
    badge: 'Top velocidad',
    badgeGreen: false,
    image: 'https://placehold.co/400x220/1a1000/f39c12?text=Drift',
  },
  {
    id: '8',
    name: 'Voltus Nova',
    type: 'Crossover',
    price: '$43,500',
    range: '465 km',
    charge: 'Techo solar',
    badge: 'Familia ideal',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/0f1a2a/2fb676?text=Nova',
  },
  {
    id: '9',
    name: 'Voltus Orion',
    type: 'SUV Grande',
    price: '$55,800',
    range: '430 km',
    charge: '7 pasajeros',
    badge: 'Más espacioso',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/0a1628/4D9FFF?text=Orion',
  },
  {
    id: '10',
    name: 'Voltus Lux',
    type: 'Luxury',
    price: '$89,000',
    range: '580 km',
    charge: 'Premium total',
    badge: 'Exclusivo',
    badgeGreen: false,
    image: 'https://placehold.co/400x220/1a1500/f1c40f?text=Lux',
  },
  {
    id: '11',
    name: 'Voltus Scout',
    type: 'Off-road',
    price: '$51,200',
    range: '410 km',
    charge: '4x4 eléctrico',
    badge: 'Aventura',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/0f2010/2fb676?text=Scout',
  },
  {
    id: '12',
    name: 'Voltus Mini',
    type: 'City Car',
    price: '$22,900',
    range: '300 km',
    charge: 'Ideal ciudad',
    badge: 'Más económico',
    badgeGreen: true,
    image: 'https://placehold.co/400x220/101a0f/2fb676?text=Mini',
  },
]

// sombras reutilizadas
const shadowSm = {
  shadowColor: '#0d1b3e',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
}
const shadowMd = {
  shadowColor: '#0d1b3e',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
}
const shadowDark = {
  shadowColor: '#000',
  shadowOpacity: 0.18,
  shadowRadius: 16,
  elevation: 6,
}
const shadowDarkStrong = {
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 14,
  elevation: 5,
}

const InicioScreen = () => {
  const flatListRef = useRef<FlatList>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % CAR_MODELS.length
        flatListRef.current?.scrollToIndex({ index: next, animated: true })
        return next
      })
    }, 3000)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [])

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP))
    setActiveIndex(index)
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % CAR_MODELS.length
        flatListRef.current?.scrollToIndex({ index: next, animated: true })
        return next
      })
    }, 3000)
  }

  const renderCarCard = ({ item }: { item: typeof CAR_MODELS[0] }) => (
    <View style={[styles.card, { width: CARD_WIDTH }, shadowMd]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <View
        style={[
          styles.badge,
          {
            backgroundColor: item.badgeGreen ? `${GREEN}26` : `${BLUE}26`,
            borderColor: item.badgeGreen ? `${GREEN}66` : `${BLUE}66`,
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: item.badgeGreen ? GREEN : BLUE }]}>
          {item.badge}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardType}>{item.type}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={13} color={GREEN} />
            <Text style={styles.infoText}>{item.range}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="ev-plug-type2" size={13} color={BLUE} />
            <Text style={styles.infoText}>{item.charge}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            {item.price}
            <Text style={styles.priceUsd}>{' USD'}</Text>
          </Text>
          <TouchableOpacity style={styles.verButton}>
            <Text style={styles.verButtonText}>{'Ver'}</Text>
            <MaterialCommunityIcons name="arrow-right" size={12} color={WHITE} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    // ✅ root es un View normal (no SafeAreaView) para poder poner el header fijo
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── HEADER FIJO — fuera del ScrollView ── */}
      <View style={styles.header}>
        <LoginButton onPress={() => {}} />
      </View>

      {/* ── SCROLL — todo el contenido aquí dentro ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── HERO BANNER ── */}
        <View style={[styles.hero, shadowDark]}>
          <Image source={{ uri: PLACEHOLDER_HERO }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <View
              style={[styles.offerBadge, { backgroundColor: `${GREEN}33`, borderColor: `${GREEN}66` }]}
            >
              <MaterialCommunityIcons name="fire" size={12} color={GREEN} />
              <Text style={styles.offerBadgeText}>
                {' Oferta del mes'}
              </Text>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.heroTitle}>
                {'Hasta 20% OFF\n'}
                <Text style={styles.heroTitleAccent}>{'Neo 2024'}</Text>
              </Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>{'Ver Modelos'}</Text>
                <MaterialCommunityIcons name="arrow-right" size={12} color={WHITE} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── STATS RÁPIDOS ── */}
        <View style={styles.statsRow}>
          {[
            { icon: 'lightning-bolt', value: '420km', label: 'Autonomía', color: GREEN },
            { icon: 'ev-station', value: '45min', label: 'Carga rápida', color: BLUE },
            { icon: 'shield-check', value: '5★', label: 'Seguridad', color: '#a78bfa' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, shadowSm]}>
              <View style={[styles.statIconWrap, { backgroundColor: `${s.color}18` }]}>
                <MaterialCommunityIcons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── MODELOS EN CARRUSEL ── */}
        <View style={styles.modelsSection}>
          <View style={[styles.modelsHeader, { paddingHorizontal: CARD_SIDE_PADDING }]}>
            <Text style={styles.sectionTitle}>{'Modelos Destacados'}</Text>
            <TouchableOpacity style={styles.verTodosButton}>
              <Text style={styles.verTodosText}>{'Ver todos'}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={GREEN} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={CAR_MODELS}
            keyExtractor={item => item.id}
            renderItem={renderCarCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{
              paddingLeft: CARD_SIDE_PADDING,
              paddingRight: CARD_SIDE_PADDING - CARD_GAP,
              gap: CARD_GAP,
            }}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH + CARD_GAP,
              offset: (CARD_WIDTH + CARD_GAP) * index,
              index,
            })}
          />

          {/* Dots */}
          <View style={styles.dotsRow}>
            {CAR_MODELS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({ index: i, animated: true })
                  setActiveIndex(i)
                }}
              >
                <View
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── PLANES DE PAGO ── */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>{'Planes de Pago Flexibles'}</Text>

          <View style={styles.plansRow}>
            {/* Crédito */}
            <View style={[styles.planCardBlue, shadowSm]}>
              <View style={styles.planIconBlue}>
                <MaterialCommunityIcons name="bank-outline" size={22} color={BLUE} />
              </View>
              <Text style={styles.planLabel}>
                {'Crédito Automotriz'}
              </Text>
              <Text style={styles.planPrice}>
                {'Desde\n'}
                <Text style={{ color: BLUE }}>{'$499'}</Text>
                <Text style={styles.planPriceUnit}>{' USD/mes*'}</Text>
              </Text>
              <View style={styles.planFeatures}>
                <View style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={12} color={BLUE} />
                  <Text style={styles.featureText}>{'Plazos hasta 72 meses'}</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={12} color={BLUE} />
                  <Text style={styles.featureText}>{'Tasa preferencial'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.creditButton}>
                <Text style={styles.creditButtonText}>{'Cotizar Ahora'}</Text>
              </TouchableOpacity>
            </View>

            {/* Leasing */}
            <View style={[styles.planCardGreen, shadowSm]}>
              <View style={styles.planIconGreen}>
                <MaterialCommunityIcons name="car-key" size={22} color={GREEN} />
              </View>
              <Text style={styles.planLabel}>
                {'Arrendamiento'}
              </Text>
              <Text style={styles.planPrice}>
                {'Desde\n'}
                <Text style={{ color: GREEN }}>{'$399'}</Text>
                <Text style={styles.planPriceUnit}>{' USD/mes*'}</Text>
              </Text>
              <View style={styles.planFeatures}>
                <View style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={12} color={GREEN} />
                  <Text style={styles.featureText}>{'Actualiza cada 3 años'}</Text>
                </View>
                <View style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={12} color={GREEN} />
                  <Text style={styles.featureText}>{'Mantenimiento incluido'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.leasingButton, { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}55` }]}
              >
                <Text style={styles.leasingButtonText}>{'Más Información'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── BANNER: TEST DRIVE ── */}
        <View style={[styles.testDriveBanner, shadowDarkStrong]}>
          <View style={styles.testDriveLeft}>
            <Text style={styles.testDriveEyebrow}>
              {'Experiencia real'}
            </Text>
            <Text style={styles.testDriveTitle}>{'Agenda tu\nTest Drive'}</Text>
            <Text style={styles.testDriveSubtitle}>{'Gratis · Sin compromiso'}</Text>
            <TouchableOpacity style={styles.testDriveButton}>
              <MaterialCommunityIcons name="calendar-check-outline" size={13} color={WHITE} />
              <Text style={styles.testDriveButtonText}>{' Reservar'}</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[styles.testDriveIconWrap, { backgroundColor: `${GREEN}20`, borderColor: `${GREEN}44` }]}
          >
            <MaterialCommunityIcons name="car-electric" size={44} color={GREEN} />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}



export default InicioScreen