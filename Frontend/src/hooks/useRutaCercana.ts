import { useEffect, useState } from 'react'
import { obtenerDestinoCercano, obtenerRuta, type RutaResultado } from '../services/rutasService'
import type { Coordenada } from '../utils/geo'

interface Destino extends Coordenada {
  id: string | number
}
interface Resultado {
  clave: string
  destinoId: string | number | null
  ruta: RutaResultado | null
  error: string | null
}

export function useRutaCercana<T extends Destino>(
  origen: Coordenada | null,
  lugares: T[],
  seleccionado: T | null,
) {
  const [intento, setIntento] = useState(0)
  // La identidad del objeto de React no debe disparar nuevas consultas.
  const clave = JSON.stringify({
    intento,
    origen,
    destinos: lugares.map(({ id, latitud, longitud }) => ({ id, latitud, longitud })),
    seleccionadoId: lugares.find((lugar) => lugar.id === seleccionado?.id)?.id ?? null,
  })
  const [resultado, setResultado] = useState<Resultado | null>(null)

  useEffect(() => {
    const entrada = JSON.parse(clave) as {
      origen: Coordenada | null
      destinos: Destino[]
      seleccionadoId: string | number | null
    }
    if (!entrada.origen || entrada.destinos.length === 0) return
    const control = new AbortController()
    const temporizador = setTimeout(async () => {
      try {
        const destino =
          entrada.destinos.find((lugar) => lugar.id === entrada.seleccionadoId) ??
          entrada.destinos[
            await obtenerDestinoCercano(entrada.origen!, entrada.destinos, control.signal)
          ]
        const ruta = await obtenerRuta(entrada.origen!, destino, control.signal)
        if (!control.signal.aborted)
          setResultado({ clave, destinoId: destino.id, ruta, error: null })
      } catch (error) {
        if (!control.signal.aborted)
          setResultado({
            clave,
            destinoId: null,
            ruta: null,
            error: error instanceof Error ? error.message : 'No se pudo calcular la ruta en auto',
          })
      }
    }, 400)
    return () => {
      clearTimeout(temporizador)
      control.abort()
    }
  }, [clave])

  const vigente = resultado?.clave === clave ? resultado : null
  return {
    destino: lugares.find((lugar) => lugar.id === vigente?.destinoId) ?? null,
    ruta: vigente?.ruta ?? null,
    error: vigente?.error ?? null,
    cargando: Boolean(origen && lugares.length && !vigente),
    recalcular: () => setIntento((actual) => actual + 1),
  }
}
