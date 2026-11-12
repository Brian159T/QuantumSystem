import { peticion } from './apiClient'
import type { EstacionCarga } from '../types/EstacionesYTalleres'

export async function obtenerAnalisisEstaciones() {
  const estaciones = await peticion<EstacionCarga[]>('/estaciones-carga')
  if (!Array.isArray(estaciones)) throw new Error('La respuesta de estaciones no es válida.')
  const estados = new Map<string, number>()
  let disponibles = 0
  let sinEstado = 0
  for (const estacion of estaciones) {
    const estado = estacion.Estado?.trim().toLocaleLowerCase('es') || ''
    if (estado === 'disponible') disponibles++
    if (!estado) sinEstado++
    const etiqueta = estado || 'sin estado'
    estados.set(etiqueta, (estados.get(etiqueta) ?? 0) + 1)
  }
  return {
    total: estaciones.length,
    disponibles,
    sinEstado,
    estados: [...estados].sort(([a], [b]) => a.localeCompare(b, 'es')),
    actualizado: new Date().toLocaleTimeString('es'),
  }
}
