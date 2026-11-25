import { useEffect, useState } from 'react'
import { obtenerReporteGraficos } from '../services/reportesService'

export default function useAnalisisReservas() {
  const [datos, setDatos] = useState<Awaited<ReturnType<typeof obtenerReporteGraficos>>['reservas'] & { actualizado: string } | null>(null)
  const [error, setError] = useState('')
  const [reporte, setReporte] = useState<Awaited<ReturnType<typeof obtenerReporteGraficos>> | null>(null)
  useEffect(() => {
    let activo = true
    let temporizador: ReturnType<typeof setTimeout>
    async function actualizar() {
      try {
        const resultado = await obtenerReporteGraficos()
        if (activo) { setReporte(resultado); setDatos({ ...resultado.reservas, actualizado: new Date(resultado.actualizado).toLocaleTimeString('es') }); setError('') }
      } catch {
        if (activo) setError('No se pudieron actualizar los resultados. Comprueba la conexión con el backend.')
      } finally {
        if (activo) temporizador = setTimeout(actualizar, 10000)
      }
    }
    void actualizar()
    return () => { activo = false; clearTimeout(temporizador) }
  }, [])
  return { datos, error, reporte }
}
