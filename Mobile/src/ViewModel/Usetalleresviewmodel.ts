import { useEffect, useMemo, useState } from 'react'

import * as Location from 'expo-location'

import TalleresService, {
  Taller,
} from '../Model/TalleresService'


// =====================================================
// TIPOS
// =====================================================

export type Coordenada = {
  latitude: number
  longitude: number
}

export interface UseTalleresViewModelResult {
  talleres: Taller[]
  loadingTalleres: boolean
  errorTalleres: string | null

  ubicacionUsuario: Coordenada | null
  loadingUbicacion: boolean
  errorUbicacion: string | null

  search: string
  setSearch: (texto: string) => void

  onlyAvailable: boolean
  setOnlyAvailable: (valor: boolean) => void

  filteredTalleres: Taller[]

  totalTalleres: number
  disponiblesCount: number
  conTelefonoCount: number

  tallerSeleccionado: Taller | null
  seleccionarTaller: (taller: Taller) => void

  tallerMasCercano: Taller | null
  tallerRuta: Taller | null

  calcularDistancia: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number

  recargar: () => void
}


// =====================================================
// VIEWMODEL
// =====================================================

function useTalleresViewModel(): UseTalleresViewModelResult {

  // ===================================================
  // TALLERES
  // ===================================================

  const [talleres, setTalleres] =
    useState<Taller[]>([])

  const [loadingTalleres, setLoadingTalleres] =
    useState(true)

  const [errorTalleres, setErrorTalleres] =
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
  // TALLER SELECCIONADO
  // ===================================================

  const [tallerSeleccionado, setTallerSeleccionado] =
    useState<Taller | null>(null)


  // ===================================================
  // ESTADO DE UI
  // ===================================================

  const [search, setSearch] =
    useState('')

  const [onlyAvailable, setOnlyAvailable] =
    useState(false)


  // ===================================================
  // CARGA DE TALLERES
  // ===================================================

  const cargarTalleres = async () => {

    try {

      setLoadingTalleres(true)
      setErrorTalleres(null)

      const data =
        await TalleresService.obtenerTalleres()

      setTalleres(data)

    } catch (err) {

      console.error(
        'Error al obtener talleres:',
        err
      )

      setErrorTalleres(
        'No se pudieron cargar los talleres'
      )

    } finally {

      setLoadingTalleres(false)

    }

  }

  useEffect(() => {

    cargarTalleres()

  }, [])


  // ===================================================
  // OBTENER UBICACIÓN DEL USUARIO
  // ===================================================

  useEffect(() => {

    const obtenerUbicacion = async () => {

      try {

        setLoadingUbicacion(true)
        setErrorUbicacion(null)

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

        const location =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          })

        setUbicacionUsuario({
          latitude:
            location.coords.latitude,

          longitude:
            location.coords.longitude,
        })

      } catch (err) {

        console.error(
          'Error obteniendo ubicación:',
          err
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
  // CALCULAR DISTANCIA (Haversine)
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
  // TALLER MÁS CERCANO
  // ===================================================

  const tallerMasCercano =
    useMemo<Taller | null>(() => {

      if (
        !ubicacionUsuario ||
        talleres.length === 0
      ) {
        return null
      }

      const talleresValidos =
        talleres.filter((taller) => {

          const lat =
            Number(taller.latitud)

          const lon =
            Number(taller.longitud)

          return (
            !isNaN(lat) &&
            !isNaN(lon)
          )

        })

      if (talleresValidos.length === 0) {
        return null
      }

      const resultado =
        talleresValidos.reduce<{
          taller: Taller | null
          distancia: number
        }>(
          (acc, taller) => {

            const distancia =
              calcularDistancia(
                ubicacionUsuario.latitude,
                ubicacionUsuario.longitude,
                Number(taller.latitud),
                Number(taller.longitud)
              )

            if (
              distancia <
              acc.distancia
            ) {

              return {
                taller,
                distancia,
              }

            }

            return acc

          },
          {
            taller: null,
            distancia: Infinity,
          }
        )

      return resultado.taller

    }, [
      ubicacionUsuario,
      talleres,
    ])


  // ===================================================
  // TALLER PARA MOSTRAR LA RUTA
  // ===================================================

  const tallerRuta =
    tallerSeleccionado ||
    tallerMasCercano


  // ===================================================
  // SELECCIONAR TALLER
  // ===================================================

  const seleccionarTaller = (
    taller: Taller
  ) => {

    setTallerSeleccionado(taller)

  }


  // ===================================================
  // FILTRADO
  // ===================================================

  const filteredTalleres =
    useMemo(() => {

      const texto =
        search
          .trim()
          .toLowerCase()

      return talleres.filter((taller) => {

        const coincideTexto =
          texto.length === 0 ||
          taller.direccion
            ?.toLowerCase()
            .includes(texto)

        const coincideDisponible =
          !onlyAvailable ||
          taller.Estado
            ?.toLowerCase() === 'disponible'

        return (
          coincideTexto &&
          coincideDisponible
        )

      })

    }, [
      talleres,
      search,
      onlyAvailable,
    ])


  // ===================================================
  // ESTADÍSTICAS (derivadas solo de datos reales)
  // ===================================================

  const totalTalleres =
    talleres.length

  const disponiblesCount =
    talleres.filter(
      (taller) =>
        taller.Estado
          ?.toLowerCase() === 'disponible'
    ).length

  const conTelefonoCount =
    talleres.filter(
      (taller) => !!taller.telefono
    ).length


  return {
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

    tallerSeleccionado,
    seleccionarTaller,

    tallerMasCercano,
    tallerRuta,

    calcularDistancia,

    recargar: cargarTalleres,
  }

}

export default useTalleresViewModel