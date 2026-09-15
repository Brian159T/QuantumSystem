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

import React from 'react'

import { MaterialCommunityIcons } from '@expo/vector-icons'

import MapView, {
  Marker,
  Polyline,
} from 'react-native-maps'

import LogoutButton from '../../components/LogoutButton'

import useTalleresViewModel from '../../../ViewModel/Usetalleresviewmodel'

import { Taller } from '../../../Model/TalleresService'

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
} from '../../../styles/TalleresScreen_usuario_vehiculo.styles'


const TalleresScreen_usuario_vehiculo = () => {

  // ===================================================
  // VIEWMODEL
  // ===================================================

  const {
    talleres,
    loadingTalleres,
    errorTalleres,

    ubicacionUsuario,
    loadingUbicacion,
    errorUbicacion,

    search,
    setSearch,

    onlyAvailable,
    setOnlyAvailable,

    filteredTalleres,

    totalTalleres,
    disponiblesCount,
    conTelefonoCount,

    seleccionarTaller,

    tallerMasCercano,
    tallerRuta,

    calcularDistancia,
  } = useTalleresViewModel()


  // ===================================================
  // RENDER TALLER
  // ===================================================

  const renderTaller = ({
    item,
  }: {
    item: Taller
  }) => {

    const disponible =
      item.Estado
        ?.toLowerCase() === 'disponible'

    const distancia =
      ubicacionUsuario
        ? calcularDistancia(
            ubicacionUsuario.latitude,
            ubicacionUsuario.longitude,
            Number(item.latitud),
            Number(item.longitud)
          )
        : null

    const esMasCercano =
      tallerMasCercano?.id_servicio ===
      item.id_servicio

    return (

      <View style={styles.workshopCard}>

        {/* ENCABEZADO */}

        <View style={styles.workshopTopRow}>

          <View style={styles.workshopIconBox}>

            <MaterialCommunityIcons
              name="wrench"
              size={20}
              color={GREEN}
            />

          </View>


          <View style={{ flex: 1 }}>

            <View style={styles.workshopNameRow}>

              <Text
                style={styles.workshopName}
                numberOfLines={1}
              >
                {`Taller #${item.id_servicio}`}
              </Text>

              {esMasCercano && (

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
                    MÁS CERCANO
                  </Text>

                </View>

              )}

            </View>


            <View style={styles.workshopAddressRow}>

              <MaterialCommunityIcons
                name="map-marker-outline"
                size={12}
                color={TEXT_MID}
              />

              <Text
                style={styles.workshopAddress}
                numberOfLines={2}
              >
                {item.direccion}
              </Text>

            </View>

          </View>

        </View>


        {/* ESTADO Y HORARIO */}

        <View style={styles.workshopInfoRow}>

          <View
            style={[
              styles.statusPill,

              disponible
                ? styles.statusPillGreen
                : styles.statusPillRed,
            ]}
          >

            <View
              style={[
                styles.dotStatus,
                {
                  backgroundColor:
                    disponible
                      ? GREEN
                      : RED,
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    disponible
                      ? GREEN
                      : RED,
                },
              ]}
            >
              {item.Estado}
            </Text>

          </View>


          <View style={styles.waitPill}>

            <MaterialCommunityIcons
              name="clock-outline"
              size={11}
              color={ORANGE}
            />

            <Text
              style={styles.waitPillText}
              numberOfLines={1}
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
                styles.workshopAddress,
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
                styles.workshopAddress,
                { marginLeft: 6 },
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
              styles.workshopAddress,
              { marginLeft: 6 },
            ]}
          >
            {`${Number(item.latitud).toFixed(6)}, ${Number(
              item.longitud
            ).toFixed(6)}`}
          </Text>

        </View>


        {/* BOTÓN VER EN MAPA */}

        <View style={styles.workshopFooter}>

          <View style={styles.workshopFooterLeft}>

            <MaterialCommunityIcons
              name="wrench-outline"
              size={14}
              color={GREEN}
            />

            <Text style={styles.workshopRating}>
              {'Servicio de reparación'}
            </Text>

          </View>


          <TouchableOpacity
            style={styles.appointmentBtn}
            activeOpacity={0.85}
            onPress={() =>
              seleccionarTaller(item)
            }
          >

            <MaterialCommunityIcons
              name="map-marker-path"
              size={13}
              color={WHITE}
            />

            <Text style={styles.appointmentBtnText}>
              {'Ver ruta'}
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

        <View style={{ flex: 1 }}>

          <Text style={styles.headerSub}>
            {'SOPORTE TÉCNICO'}
          </Text>

          <Text style={styles.headerTitle}>
            {'Talleres Autorizados'}
          </Text>

        </View>

        <LogoutButton />

      </View>


      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* BUSCADOR */}

        <View style={styles.searchSection}>

          <View style={styles.searchBar}>

            <MaterialCommunityIcons
              name="magnify"
              size={18}
              color={TEXT_MID}
            />

            <TextInput
              placeholder="Buscar por dirección..."
              placeholderTextColor={TEXT_MID}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

          </View>

        </View>


        {/* MAPA */}

        <View style={styles.mapContainer}>

          {loadingTalleres ||
          loadingUbicacion ? (

            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
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
                {'Obteniendo ubicación...'}
              </Text>

            </View>

          ) : errorTalleres ||
            errorUbicacion ? (

            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
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
                  textAlign: 'center',
                }}
              >
                {errorTalleres ||
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

                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}

              showsUserLocation

              showsMyLocationButton

              showsCompass

              showsTraffic={false}
            >


              {/* MARCADORES DE TALLERES */}

              {talleres.map(
                (taller) => {

                  const latitude =
                    Number(taller.latitud)

                  const longitude =
                    Number(taller.longitud)

                  if (
                    isNaN(latitude) ||
                    isNaN(longitude)
                  ) {
                    return null
                  }

                  const seleccionado =
                    tallerRuta?.id_servicio ===
                    taller.id_servicio

                  return (

                    <Marker
                      key={taller.id_servicio}

                      coordinate={{
                        latitude,
                        longitude,
                      }}

                      title={
                        `Taller #${taller.id_servicio}`
                      }

                      description={
                        taller.direccion
                      }

                      onPress={() =>
                        seleccionarTaller(taller)
                      }
                    >

                      <View
                        style={[
                          styles.marker,

                          seleccionado && {
                            transform: [
                              { scale: 1.25 },
                            ],
                          },
                        ]}
                      >

                        <MaterialCommunityIcons
                          name="wrench"
                          size={
                            seleccionado
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


              {/* RUTA AL TALLER SELECCIONADO */}

              {ubicacionUsuario &&
              tallerRuta && (

                <Polyline
                  coordinates={[
                    ubicacionUsuario,
                    {
                      latitude:
                        Number(tallerRuta.latitud),

                      longitude:
                        Number(tallerRuta.longitud),
                    },
                  ]}

                  strokeColor={GREEN}
                  strokeWidth={5}
                />

              )}

            </MapView>

          ) : null}

        </View>


        {/* ESTADÍSTICAS (derivadas de datos reales) */}

        <View style={styles.statsRow}>

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIconBox,
                { backgroundColor: `${GREEN}18` },
              ]}
            >

              <MaterialCommunityIcons
                name="wrench-outline"
                size={18}
                color={GREEN}
              />

            </View>

            <Text style={styles.statValue}>
              {totalTalleres}
            </Text>

            <Text style={styles.statLabel}>
              {'Talleres'}
            </Text>

          </View>


          <View style={styles.statCard}>

            <View
              style={[
                styles.statIconBox,
                { backgroundColor: `${BLUE}18` },
              ]}
            >

              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color={BLUE}
              />

            </View>

            <Text style={styles.statValue}>
              {disponiblesCount}
            </Text>

            <Text style={styles.statLabel}>
              {'Disponibles'}
            </Text>

          </View>


          <View style={styles.statCard}>

            <View
              style={[
                styles.statIconBox,
                { backgroundColor: `${ORANGE}18` },
              ]}
            >

              <MaterialCommunityIcons
                name="phone-outline"
                size={18}
                color={ORANGE}
              />

            </View>

            <Text style={styles.statValue}>
              {conTelefonoCount}
            </Text>

            <Text style={styles.statLabel}>
              {'Con teléfono'}
            </Text>

          </View>

        </View>


        {/* TOGGLE SOLO DISPONIBLES */}

        <View style={styles.filterSection}>

          <TouchableOpacity
            style={styles.openToggle}
            onPress={() =>
              setOnlyAvailable(!onlyAvailable)
            }
            activeOpacity={0.85}
          >

            <View
              style={[
                styles.checkbox,
                onlyAvailable && styles.checkboxActive,
              ]}
            >

              {onlyAvailable && (

                <MaterialCommunityIcons
                  name="check"
                  size={12}
                  color={WHITE}
                />

              )}

            </View>

            <Text style={styles.openToggleText}>
              {'Mostrar solo talleres disponibles'}
            </Text>

          </TouchableOpacity>

        </View>


        {/* LISTA DE TALLERES */}

        <View style={styles.listSection}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              {'Talleres'}
            </Text>

            <Text style={styles.resultsCount}>
              {`${filteredTalleres.length} resultados`}
            </Text>

          </View>


          {loadingTalleres ? (

            <View
              style={{
                paddingVertical: 40,
                alignItems: 'center',
              }}
            >

              <ActivityIndicator
                size="large"
                color={GREEN}
              />

              <Text
                style={{
                  color: TEXT_MID,
                  marginTop: 10,
                }}
              >
                {'Cargando talleres...'}
              </Text>

            </View>

          ) : errorTalleres ? (

            <View style={styles.emptyState}>

              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={32}
                color={RED}
              />

              <Text style={styles.emptyStateText}>
                {errorTalleres}
              </Text>

            </View>

          ) : filteredTalleres.length === 0 ? (

            <View style={styles.emptyState}>

              <MaterialCommunityIcons
                name="wrench-outline"
                size={32}
                color={SUBTLE}
              />

              <Text style={styles.emptyStateText}>
                {'No encontramos talleres con estos filtros'}
              </Text>

            </View>

          ) : (

            <FlatList
              data={filteredTalleres}
              keyExtractor={(item) =>
                String(item.id_servicio)
              }
              renderItem={renderTaller}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />

          )}

        </View>

      </ScrollView>

    </View>

  )
}

export default TalleresScreen_usuario_vehiculo