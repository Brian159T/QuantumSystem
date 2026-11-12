import { useEffect, useState } from 'react'
import { obtenerAnalisisReservas } from '../services/analisisReservasService'

export default function useAnalisisReservas() {
  const [datos, setDatos] = useState<Awaited<ReturnType<typeof obtenerAnalisisReservas>> | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let activo = true
    let temporizador: ReturnType<typeof setTimeout>
    async function actualizar() {
      try {
        const resultado = await obtenerAnalisisReservas()
        if (activo) { setDatos(resultado); setError('') }
      } catch {
        if (activo) setError('No se pudieron actualizar los resultados. Comprueba la conexión con el backend.')
      } finally {
        if (activo) temporizador = setTimeout(actualizar, 10000)
      }
    }
    void actualizar()
    return () => { activo = false; clearTimeout(temporizador) }
  }, [])
  return { datos, error }
}
