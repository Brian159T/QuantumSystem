import { useCallback, useEffect, useState } from 'react'
import type { Coordenada } from '../utils/geo'

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<Coordenada | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const obtener = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Tu navegador no soporta geolocalización')
      setCargando(false)
      return
    }

    setCargando(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacion({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        })
        setCargando(false)
      },
      () => {
        setError('No se pudo obtener tu ubicación. Revisa los permisos del navegador.')
        setCargando(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [])

  useEffect(() => {
    const temporizador = setTimeout(obtener, 0)
    return () => clearTimeout(temporizador)
  }, [obtener])

  return { ubicacion, cargando, error, solicitar: obtener }
}