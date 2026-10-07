import { useEffect, useState } from 'react'
import { obtenerRuta, type RutaResultado } from '../services/rutasService'
import type { Coordenada } from '../utils/geo'

export function useRuta(origen: Coordenada | null, destino: Coordenada | null) {
  const [ruta, setRuta] = useState<RutaResultado | null>(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let activo = true
    const temporizador = setTimeout(() => {
      if (!origen || !destino) {
        if (activo) {
          setRuta(null)
          setCargando(false)
        }
        return
      }

      setCargando(true)

      obtenerRuta(origen, destino)
        .then((resultado) => {
          if (activo) setRuta(resultado)
        })
        .catch(() => {
          if (activo) setRuta(null)
        })
        .finally(() => {
          if (activo) setCargando(false)
        })
    }, 0)

    return () => {
      activo = false
      clearTimeout(temporizador)
    }
  }, [origen, destino])

  return { ruta, cargando }
}