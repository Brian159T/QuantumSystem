import { peticion } from './apiClient'
import type { AnalisisReservas } from './analisisReservasService'
import type { AnalisisEstaciones } from './analisisEstacionesService'

export interface ReporteGraficos {
  periodoDias: number
  actualizado: string
  reservas: Omit<AnalisisReservas, 'actualizado'>
  estaciones: Omit<AnalisisEstaciones, 'actualizado'>
  tablas: Record<'reservas' | 'estaciones' | 'modelo' | 'red', TablaReporte>
}

export interface TablaReporte {
  encabezados: string[]
  filas: string[][]
}

export function obtenerReporteGraficos(): Promise<ReporteGraficos> {
  return peticion<ReporteGraficos>('/reportes/graficos')
}
