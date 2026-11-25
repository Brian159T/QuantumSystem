import { useEffect, useState } from 'react'
import { obtenerReporteGraficos } from '../services/reportesService'

export default function useAnalisisEstaciones() {
  const [datos, setDatos] = useState<Awaited<ReturnType<typeof obtenerReporteGraficos>>['estaciones'] & { actualizado: string } | null>(null)
  const [error, setError] = useState('')
  const [reporte, setReporte] = useState<Awaited<ReturnType<typeof obtenerReporteGraficos>> | null>(null)
  useEffect(() => {
    let activo = true
    let temporizador: ReturnType<typeof setTimeout>
    async function actualizar() {
      try {
        const resultado = await obtenerReporteGraficos()
        if (activo) { setReporte(resultado); setDatos({ ...resultado.estaciones, actualizado: new Date(resultado.actualizado).toLocaleTimeString('es') }); setError('') }
      } catch {
        if (activo) setError('No se pudieron actualizar las estaciones. Comprueba la conexión con el backend.')
      } finally {
        if (activo) temporizador = setTimeout(actualizar, 10000)
      }
    }
    void actualizar()
    return () => { activo = false; clearTimeout(temporizador) }
  }, [])
  return { datos, error, reporte }
}
