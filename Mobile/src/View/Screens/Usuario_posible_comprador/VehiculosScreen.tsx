import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginButton from '../../components/LoginButton';
import VehiculosService, { Vehiculo } from '../../../Model/VehiculosService';
import ColoresService, { Color } from '../../../Model/ColoresService';
import {
  styles,
  GREEN,
  BLUE,
  BG_DARK,
  WHITE,
  TEXT_SOFT,
} from '../../../styles/VehiculosScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPEC_CARD_WIDTH = SCREEN_WIDTH - 40;

type CarColor = { name: string; hex: string };
type CarModel = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  range: string;
  battery: string;
  topSpeed: string;
  charge: string;
  seats: number;
  drive: string;
  photoUrl: string | null;
  colors: CarColor[];
};

const HEX_POR_NOMBRE: Record<string, string> = {
  Blanco: '#f0f4ff',
  Negro: '#0a1628',
  Gris: '#9ca3af',
  Rojo: '#dc2626',
  Azul: '#1e4fd8',
  Verde: '#2fb676',
  Amarillo: '#facc15',
};

function formatearPrecio(precio: number | null | undefined): string {
  const valor = Number(precio);
  return Number.isNaN(valor) ? '—' : `$${valor.toLocaleString('en-US')}`;
}

function vehiculoColors(v: Vehiculo, colorPorId: Map<number, CarColor>): CarColor[] {
  const colorsApi = v.colores?.filter((c) => c && c.id_color != null);
  if (colorsApi && colorsApi.length > 0) {
    return colorsApi.map((c) => ({
      name: c.Color,
      hex: HEX_POR_NOMBRE[c.Color] || '#94a3b8',
    }));
  }
  const colorBase = v.id_color != null ? colorPorId.get(v.id_color) : undefined;
  return colorBase ? [colorBase] : [{ name: 'N/D', hex: '#94a3b8' }];
}

function mapearVehiculo(v: Vehiculo, colorPorId: Map<number, CarColor>): CarModel {
  return {
    id: String(v.id_vehiculo),
    name: v.Nombre_Modelo,
    subtitle: v.Tipo,
    price: formatearPrecio(v.Precio_USD),
    range: v.Autonomia,
    battery: v.Capacidad_Bateria,
    topSpeed: v.Velocidad_Maxima,
    charge: v.Carga_Rapida,
    seats: Number(v.Nro_Asientos) || 5,
    drive: v.Traccion,
    photoUrl: null,
    colors: vehiculoColors(v, colorPorId),
  };
}

// sombras y colores con opacidad calculados en JS
const shadowListCard = {
  shadowColor: '#0d1b3e',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};
const shadowCardSoft = {
  shadowColor: '#0d1b3e',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};
const shadowSwatch = { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 };
const LIGHT_HEX = ['#f5f5f5', '#f0f0f0', '#e8edf2', '#f0ead0', '#dce8f0'];

const VehiculosScreen = () => {
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({});
  const [specIndex, setSpecIndex] = useState(0);
  const [modelos, setModelos] = useState<CarModel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const specRef = useRef<FlatList>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const [vehiculos, colores] = await Promise.all([
          VehiculosService.obtenerVehiculos(),
          ColoresService.obtenerColores(),
        ]);
        if (!activo) return;
        const colorPorId = new Map<number, CarColor>();
        colores.forEach((c: Color) => {
          colorPorId.set(c.id_color, { name: c.Color, hex: HEX_POR_NOMBRE[c.Color] || '#94a3b8' });
        });
        setModelos(vehiculos.map((v) => mapearVehiculo(v, colorPorId)));
        setCargando(false);
      } catch {
        if (!activo) return;
        setError('No se pudieron cargar los vehículos');
        setCargando(false);
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  // ── VISTA DETALLE ────────────────────────────────────────────────
  if (selectedModel) {
    const model = selectedModel;
    const colorIdx = selectedColors[model.id] ?? 0;
    const activeColor = model.colors[colorIdx] ?? model.colors[0];

    const specs = [
      { icon: 'lightning-bolt', label: 'Autonomía', value: model.range, color: GREEN },
      { icon: 'battery-charging', label: 'Batería', value: model.battery, color: BLUE },
      { icon: 'gauge', label: 'Vel. máx.', value: model.topSpeed, color: '#f39c12' },
      { icon: 'ev-plug-type2', label: 'Carga', value: model.charge, color: GREEN },
      { icon: 'account-group', label: 'Asientos', value: `${model.seats} pas.`, color: BLUE },
      { icon: 'car-traction-control', label: 'Tracción', value: model.drive, color: '#9b59b6' },
    ];

    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}>
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
          <View style={[styles.imageWrap, { backgroundColor: `${activeColor.hex}22` }]}>
            {model.photoUrl ? (
              <Image
                source={{ uri: model.photoUrl }}
                style={styles.detailImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.detailPhotoPlaceholder}>
                <MaterialCommunityIcons name="image-outline" size={48} color={TEXT_SOFT} />
                <Text style={styles.detailPhotoLabel}>Foto del modelo</Text>
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
                  onPress={() => setSelectedColors((prev) => ({ ...prev, [model.id]: i }))}>
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
                  ]}>
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
                const i = Math.round(e.nativeEvent.contentOffset.x / (SPEC_CARD_WIDTH + 12));
                setSpecIndex(i);
              }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.specCard,
                    shadowCardSoft,
                    { width: SPEC_CARD_WIDTH, borderColor: `${item.color}33` },
                  ]}>
                  <View style={[styles.specIconWrap, { backgroundColor: `${item.color}15` }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={styles.specLabel}>{item.label}</Text>
                  <Text style={[styles.specValue, { color: item.color }]}>{item.value}</Text>
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
              <Text style={styles.priceLabel}>Precio</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{model.price}</Text>
              </View>
            </View>
            <View
              style={[
                styles.driveBadge,
                { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}44` },
              ]}>
              <MaterialCommunityIcons name="car-traction-control" size={14} color={GREEN} />
              <Text style={styles.driveBadgeText}>{model.drive}</Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="calendar-check" size={18} color={WHITE} />
            <Text style={styles.ctaButtonText}>RESERVAR ESTE MODELO</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>El precio de reserva es reembolsable</Text>
        </ScrollView>
      </View>
    );
  }

  // ── LISTA DE MODELOS ─────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />

      {/* Header — oscuro */}
      <View style={styles.listHeader}>
        <LoginButton onPress={() => {}} />
      </View>

      {cargando ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={GREEN} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}>
          {modelos.map((model, index) => {
            const colorIdx = selectedColors[model.id] ?? 0;
            const activeColor = model.colors[colorIdx] ?? model.colors[0];
            return (
              <TouchableOpacity
                key={model.id}
                style={[styles.modelCard, shadowListCard]}
                onPress={() => setSelectedModel(model)}
                activeOpacity={0.85}>
                <Text style={styles.modelIndex}>{index + 1}.</Text>

                <View style={styles.modelInfo}>
                  <View style={styles.modelNameRow}>
                    <Text style={styles.modelName}>{model.name}</Text>
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
                          e.stopPropagation?.();
                          setSelectedColors((prev) => ({ ...prev, [model.id]: i }));
                        }}
                      />
                    ))}
                  </View>
                  <Text style={styles.modelColorName}>{activeColor.name}</Text>
                </View>

                <View style={styles.modelRight}>
                  {model.photoUrl ? (
                    <Image
                      source={{ uri: model.photoUrl }}
                      style={styles.modelImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.modelPhotoBox}>
                      <MaterialCommunityIcons name="image-outline" size={22} color={TEXT_SOFT} />
                      <Text style={styles.modelPhotoLabel}>Foto</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.modelPriceBadge,
                      { backgroundColor: `${GREEN}15`, borderColor: `${GREEN}44` },
                    ]}>
                    <Text style={styles.modelPriceText}>{model.price}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={TEXT_SOFT}
                    style={{ alignSelf: 'flex-end', marginTop: 4 }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default VehiculosScreen;
