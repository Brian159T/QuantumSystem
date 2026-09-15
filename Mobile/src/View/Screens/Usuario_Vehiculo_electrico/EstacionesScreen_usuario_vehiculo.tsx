import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native'

import React, { useEffect, useMemo, useState } from 'react'

import { MaterialCommunityIcons } from '@expo/vector-icons'

import MapView, {
  Marker,
  Polyline,
  Region,
} from 'react-native-maps'

import * as Location from 'expo-location'

import LogoutButton from '../../components/LogoutButton'

import EstacionesService, {
  EstacionCarga,
} from '../../../Model/EstacionesService'

import {
  styles,
  GREEN,
  BLUE,
  ORANGE,
  RED,
  BG,
  WHITE,
  SUBTLE,
  TEXT_MID,
} from '../../../styles/EstacionesScreen_usuario_vehiculo.styles'


// =====================================================
// TIPOS
// =====================================================

type Coordenada = {
  latitude: number
  longitude: number
}


// =====================================================
// COMPONENTE
// =====================================================

const EstacionesScreen_usuario_vehiculo = () => {

  // ===================================================
  // ESTACIONES
  // ===================================================

  const [estaciones, setEstaciones] =
    useState<EstacionCarga[]>([])

  const [loadingEstaciones, setLoadingEstaciones] =
    useState(true)

  const [errorEstaciones, setErrorEstaciones] =
    useState<string | null>(null)


  // ===================================================
  // UBICACIÓN DEL USUARIO
  // ===================================================

  const [ubicacionUsuario, setUbicacionUsuario] =
    useState<Coordenada | null>(null)

  const [loadingUbicacion, setLoadingUbicacion] =
    useState(true)

  const [errorUbicacion, setErrorUbicacion] =
    useState<string | null>(null)


  // ===================================================
  // ESTACIÓN SELECCIONADA
  // ===================================================

  const [estacionSeleccionada, setEstacionSeleccionada] =
    useState<EstacionCarga | null>(null)


  // ===================================================
  // BUSCADOR
  // ===================================================

  const [search, setSearch] = useState('')


  // ===================================================
  // CARGAR ESTACIONES
  // ===================================================

  useEffect(() => {

    const cargarEstaciones = async () => {

      try {

        setLoadingEstaciones(true)
        setErrorEstaciones(null)

        const data =
          await EstacionesService.obtenerEstaciones()

        console.log(
          'Estaciones recibidas:',
          data
        )

        setEstaciones(data)

      } catch (error) {

        console.error(
          'Error al obtener estaciones:',
          error
        )

        setErrorEstaciones(
          'No se pudieron cargar las estaciones'
        )

      } finally {

        setLoadingEstaciones(false)

      }

    }

    cargarEstaciones()

  }, [])


  // ===================================================
  // OBTENER UBICACIÓN DEL USUARIO
  // ===================================================

  useEffect(() => {

    const obtenerUbicacion = async () => {

      try {

        setLoadingUbicacion(true)
        setErrorUbicacion(null)

        // Solicitar permiso

        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync()

        if (status !== 'granted') {

          setErrorUbicacion(
            'Permiso de ubicación denegado'
          )

          return

        }

        // Obtener ubicación actual

        const location =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          })

        const coordenadas = {
          latitude:
            location.coords.latitude,

          longitude:
            location.coords.longitude,
        }

        console.log(
          'Ubicación del usuario:',
          coordenadas
        )

        setUbicacionUsuario(
          coordenadas
        )

      } catch (error) {

        console.error(
          'Error obteniendo ubicación:',
          error
        )

        setErrorUbicacion(
          'No se pudo obtener tu ubicación'
        )

      } finally {

        setLoadingUbicacion(false)

      }

    }

    obtenerUbicacion()

  }, [])


  // ===================================================
  // CALCULAR DISTANCIA
  // ===================================================

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {

    const R = 6371

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

      Math.cos(
        (lat1 * Math.PI) / 180
      ) *

      Math.cos(
        (lat2 * Math.PI) / 180
      ) *

      Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return R * c
  }


  // ===================================================
  // ESTACIÓN MÁS CERCANA
  // ===================================================
  // NOTA: se tipa explícitamente el useMemo como
  // EstacionCarga | null y se usa reduce en vez de
  // forEach con variable mutable externa, para que
  // TypeScript no infiera el tipo como "never".

  const estacionMasCercana =
    useMemo<EstacionCarga | null>(() => {

      if (
        !ubicacionUsuario ||
        estaciones.length === 0
      ) {
        return null
      }

      const estacionesValidas =
        estaciones.filter((estacion) => {

          const lat =
            Number(estacion.latitud)

          const lon =
            Number(estacion.longitud)

          return (
            !isNaN(lat) &&
            !isNaN(lon)
          )

        })

      if (estacionesValidas.length === 0) {
        return null
      }

      const resultado =
        estacionesValidas.reduce<{
          estacion: EstacionCarga | null
          distancia: number
        }>(
          (acc, estacion) => {

            const lat =
              Number(estacion.latitud)

            const lon =
              Number(estacion.longitud)

            const distancia =
              calcularDistancia(
                ubicacionUsuario.latitude,
                ubicacionUsuario.longitude,
                lat,
                lon
              )

            if (
              distancia <
              acc.distancia
            ) {

              return {
                estacion,
                distancia,
              }

            }

            return acc

          },
          {
            estacion: null,
            distancia: Infinity,
          }
        )

      return resultado.estacion

    }, [
      ubicacionUsuario,
      estaciones,
    ])


  // ===================================================
  // ESTACIÓN PARA MOSTRAR LA RUTA
  // ===================================================

  const estacionRuta =
    estacionSeleccionada ||
    estacionMasCercana


  // ===================================================
  // FILTRAR ESTACIONES
  // ===================================================

  const filteredStations =
    useMemo(() => {

      const texto =
        search
          .trim()
          .toLowerCase()

      if (!texto) {
        return estaciones
      }

      return estaciones.filter(
        (estacion) =>
          estacion.direccion
            ?.toLowerCase()
            .includes(texto)
      )

    }, [
      estaciones,
      search,
    ])


  // ===================================================
  // ESTADÍSTICAS
  // ===================================================

  const totalEstaciones =
    estaciones.length

  const estacionesActivas =
    estaciones.filter(
      (estacion) =>
        estacion.Estado
          ?.toLowerCase() === 'activo'
    ).length


  // ===================================================
  // SELECCIONAR ESTACIÓN
  // ===================================================

  const seleccionarEstacion = (
    estacion: EstacionCarga
  ) => {

    setEstacionSeleccionada(
      estacion
    )

  }


  // ===================================================
  // RENDER ESTACIÓN
  // ===================================================

  const renderStation = ({
    item,
  }: {
    item: EstacionCarga
  }) => {

    const activa =
      item.Estado
        ?.toLowerCase() === 'activo'

    const distancia =
      ubicacionUsuario
        ? calcularDistancia(
            ubicacionUsuario.latitude,
            ubicacionUsuario.longitude,
            Number(item.latitud),
            Number(item.longitud)
          )
        : null

    const esMasCercana =
      estacionMasCercana?.id_estacion ===
      item.id_estacion

    return (

      <View style={styles.stationCard}>

        {/* ENCABEZADO */}

        <View style={styles.stationTopRow}>

          <View style={styles.stationIconBox}>

            <MaterialCommunityIcons
              name="ev-station"
              size={22}
              color={GREEN}
            />

          </View>


          <View style={{ flex: 1 }}>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >

              <Text
                style={styles.stationName}
                numberOfLines={1}
              >
                {`Estación #${item.id_estacion}`}
              </Text>

              {esMasCercana && (

                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor:
                      `${GREEN}22`,
                  }}
                >

                  <Text
                    style={{
                      color: GREEN,
                      fontSize: 9,
                      fontWeight: '700',
                    }}
                  >
                    MÁS CERCANA
                  </Text>

                </View>

              )}

            </View>


            <View
              style={
                styles.stationAddressRow
              }
            >

              <MaterialCommunityIcons
                name="map-marker-outline"
                size={12}
                color={TEXT_MID}
              />

              <Text
                style={
                  styles.stationAddress
                }
                numberOfLines={2}
              >
                {item.direccion}
              </Text>

            </View>

          </View>

        </View>


        {/* INFORMACIÓN */}

        <View
          style={
            styles.stationInfoRow
          }
        >

          <View
            style={[
              styles.availabilityPill,

              activa
                ? styles.availabilityPillGreen
                : styles.availabilityPillRed,
            ]}
          >

            <View
              style={[
                styles.dotStatus,
                {
                  backgroundColor:
                    activa
                      ? GREEN
                      : RED,
                },
              ]}
            />

            <Text
              style={[
                styles.availabilityText,
                {
                  color:
                    activa
                      ? GREEN
                      : RED,
                },
              ]}
            >
              {activa
                ? 'Activa'
                : item.Estado}
            </Text>

          </View>


          <View
            style={
              styles.speedPill
            }
          >

            <MaterialCommunityIcons
              name="clock-outline"
              size={11}
              color={BLUE}
            />

            <Text
              style={[
                styles.speedPillText,
                {
                  color: BLUE,
                },
              ]}
            >
              {item.horarios}
            </Text>

          </View>

        </View>


        {/* DISTANCIA */}

        {distancia !== null && (

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}
          >

            <MaterialCommunityIcons
              name="map-marker-distance"
              size={15}
              color={GREEN}
            />

            <Text
              style={[
                styles.stationAddress,
                {
                  marginLeft: 6,
                  color: GREEN,
                },
              ]}
            >
              {`${distancia.toFixed(2)} km desde tu ubicación`}
            </Text>

          </View>

        )}


        {/* TELÉFONO */}

        {item.telefono && (

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
            }}
          >

            <MaterialCommunityIcons
              name="phone-outline"
              size={14}
              color={TEXT_MID}
            />

            <Text
              style={[
                styles.stationAddress,
                {
                  marginLeft: 6,
                },
              ]}
            >
              {item.telefono}
            </Text>

          </View>

        )}


        {/* COORDENADAS */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
          }}
        >

          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={14}
            color={GREEN}
          />

          <Text
            style={[
              styles.stationAddress,
              {
                marginLeft: 6,
              },
            ]}
          >
            {`${Number(item.latitud).toFixed(6)}, ${Number(
              item.longitud
            ).toFixed(6)}`}
          </Text>

        </View>


        {/* BOTÓN */}

        <View
          style={
            styles.stationFooter
          }
        >

          <View
            style={
              styles.stationFooterLeft
            }
          >

            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color={GREEN}
            />

            <Text
              style={
                styles.stationPrice
              }
            >
              Ubicación disponible
            </Text>

          </View>


          <TouchableOpacity
            style={
              styles.routeBtn
            }
            activeOpacity={0.85}
            onPress={() =>
              seleccionarEstacion(item)
            }
          >

            <MaterialCommunityIcons
              name="map-marker-path"
              size={14}
              color={WHITE}
            />

            <Text
              style={
                styles.routeBtnText
              }
            >
              Ver ruta
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    )

  }


  // ===================================================
  // PANTALLA
  // ===================================================

  return (

    <View style={styles.root}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={BG}
      />


      {/* HEADER */}

      <View style={styles.header}>

        <View
          style={{
            flex: 1,
          }}
        >

          <Text
            style={
              styles.headerSub
            }
          >
            ENCUENTRA TU
          </Text>

          <Text
            style={
              styles.headerTitle
            }
          >
            Carga Eléctrica
          </Text>

        </View>

        <LogoutButton />

      </View>


      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >


        {/* =========================================
            BUSCADOR
        ========================================= */}

        <View
          style={
            styles.searchSection
          }
        >

          <View
            style={
              styles.searchBar
            }
          >

            <MaterialCommunityIcons
              name="magnify"
              size={18}
              color={TEXT_MID}
            />

            <TextInput
              placeholder="Buscar por dirección..."
              placeholderTextColor={
                TEXT_MID
              }
              value={search}
              onChangeText={
                setSearch
              }
              style={
                styles.searchInput
              }
            />

          </View>

        </View>


        {/* =========================================
            MAPA
        ========================================= */}

        <View
          style={
            styles.mapContainer
          }
        >

          {loadingEstaciones ||
          loadingUbicacion ? (

            <View
              style={{
                flex: 1,
                justifyContent:
                  'center',
                alignItems:
                  'center',
              }}
            >

              <ActivityIndicator
                size="large"
                color={GREEN}
              />

              <Text
                style={{
                  color: WHITE,
                  marginTop: 10,
                }}
              >
                Obteniendo ubicación...
              </Text>

            </View>

          ) : errorEstaciones ||
            errorUbicacion ? (

            <View
              style={{
                flex: 1,
                justifyContent:
                  'center',
                alignItems:
                  'center',
                padding: 20,
              }}
            >

              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={35}
                color={RED}
              />

              <Text
                style={{
                  color: WHITE,
                  marginTop: 10,
                  textAlign:
                    'center',
                }}
              >
                {errorEstaciones ||
                  errorUbicacion}
              </Text>

            </View>

          ) : ubicacionUsuario ? (

            <MapView
              style={styles.map}

              initialRegion={{
                latitude:
                  ubicacionUsuario.latitude,

                longitude:
                  ubicacionUsuario.longitude,

                latitudeDelta:
                  0.04,

                longitudeDelta:
                  0.04,
              }}

              showsUserLocation

              showsMyLocationButton

              showsCompass

              showsTraffic={false}
            >


              {/* =================================
                  ESTACIONES
              ================================= */}

              {estaciones.map(
                (estacion) => {

                  const latitude =
                    Number(
                      estacion.latitud
                    )

                  const longitude =
                    Number(
                      estacion.longitud
                    )

                  if (
                    isNaN(latitude) ||
                    isNaN(longitude)
                  ) {
                    return null
                  }

                  const seleccionada =
                    estacionRuta?.id_estacion ===
                    estacion.id_estacion

                  return (

                    <Marker
                      key={
                        estacion.id_estacion
                      }

                      coordinate={{
                        latitude,
                        longitude,
                      }}

                      title={
                        `Estación #${estacion.id_estacion}`
                      }

                      description={
                        estacion.direccion
                      }

                      onPress={() =>
                        seleccionarEstacion(
                          estacion
                        )
                      }
                    >

                      <View
                        style={[
                          styles.marker,

                          seleccionada && {
                            transform: [
                              {
                                scale: 1.25,
                              },
                            ],
                          },
                        ]}
                      >

                        <MaterialCommunityIcons
                          name="ev-station"
                          size={
                            seleccionada
                              ? 28
                              : 24
                          }
                          color={WHITE}
                        />

                      </View>

                    </Marker>

                  )

                }
              )}


              {/* =================================
                  RUTA
              ================================= */}

              {ubicacionUsuario &&
              estacionRuta && (

                <Polyline
                  coordinates={[
                    ubicacionUsuario,

                    {
                      latitude:
                        Number(
                          estacionRuta.latitud
                        ),

                      longitude:
                        Number(
                          estacionRuta.longitud
                        ),
                    },
                  ]}

                  strokeColor={
                    GREEN
                  }

                  strokeWidth={5}
                />

              )}

            </MapView>

          ) : null}

        </View>


        {/* =========================================
            INFORMACIÓN DE RUTA
        ========================================= */}

        {ubicacionUsuario &&
        estacionRuta && (

          <View
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 14,
              backgroundColor:
                `${GREEN}12`,
              borderWidth: 1,
              borderColor:
                `${GREEN}30`,
            }}
          >

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >

              <MaterialCommunityIcons
                name="navigation-variant"
                size={20}
                color={GREEN}
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                }}
              >

                <Text
                  style={{
                    color: WHITE,
                    fontWeight: '700',
                    fontSize: 14,
                  }}
                >
                  {estacionSeleccionada
                    ? 'Ruta seleccionada'
                    : 'Estación más cercana'}
                </Text>

                <Text
                  style={{
                    color: TEXT_MID,
                    fontSize: 12,
                    marginTop: 3,
                  }}
                  numberOfLines={1}
                >
                  {`Estación #${estacionRuta.id_estacion} · ${estacionRuta.direccion}`}
                </Text>

              </View>

            </View>


            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
            >

              <MaterialCommunityIcons
                name="map-marker-distance"
                size={16}
                color={GREEN}
              />

              <Text
                style={{
                  color: GREEN,
                  fontWeight: '700',
                  marginLeft: 6,
                }}
              >
                {`${calcularDistancia(
                  ubicacionUsuario.latitude,
                  ubicacionUsuario.longitude,
                  Number(
                    estacionRuta.latitud
                  ),
                  Number(
                    estacionRuta.longitud
                  )
                ).toFixed(2)} km`}
              </Text>

              <Text
                style={{
                  color: TEXT_MID,
                  marginLeft: 6,
                }}
              >
                distancia aproximada
              </Text>

            </View>

          </View>

        )}


        {/* =========================================
            ESTADÍSTICAS
        ========================================= */}

        <View
          style={
            styles.statsRow
          }
        >

          {/* TOTAL */}

          <View
            style={
              styles.statCard
            }
          >

            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor:
                    `${GREEN}18`,
                },
              ]}
            >

              <MaterialCommunityIcons
                name="ev-station"
                size={18}
                color={GREEN}
              />

            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {totalEstaciones}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Estaciones
            </Text>

          </View>


          {/* ACTIVAS */}

          <View
            style={
              styles.statCard
            }
          >

            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor:
                    `${BLUE}18`,
                },
              ]}
            >

              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color={BLUE}
              />

            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {estacionesActivas}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Activas
            </Text>

          </View>


          {/* RESULTADOS */}

          <View
            style={
              styles.statCard
            }
          >

            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor:
                    `${ORANGE}18`,
                },
              ]}
            >

              <MaterialCommunityIcons
                name="map-search-outline"
                size={18}
                color={ORANGE}
              />

            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {filteredStations.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Encontradas
            </Text>

          </View>

        </View>


        {/* =========================================
            LISTA
        ========================================= */}

        <View
          style={
            styles.listSection
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <Text
              style={
                styles.sectionTitle
              }
            >
              Estaciones de carga
            </Text>

            <Text
              style={
                styles.resultsCount
              }
            >
              {`${filteredStations.length} resultados`}
            </Text>

          </View>


          {filteredStations.length ===
          0 ? (

            <View
              style={
                styles.emptyState
              }
            >

              <MaterialCommunityIcons
                name="ev-station"
                size={32}
                color={SUBTLE}
              />

              <Text
                style={
                  styles.emptyStateText
                }
              >
                No encontramos estaciones
              </Text>

            </View>

          ) : (

            <FlatList
              data={
                filteredStations
              }

              keyExtractor={
                (item) =>
                  String(
                    item.id_estacion
                  )
              }

              renderItem={
                renderStation
              }

              scrollEnabled={false}

              contentContainerStyle={{
                gap: 12,
              }}
            />

          )}

        </View>

      </ScrollView>

    </View>

  )
}


export default EstacionesScreen_usuario_vehiculo