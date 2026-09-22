import { peticion } from './apiClient'
import { mocksEstaciones } from './mocks/estacionesYTalleres'
import type { EstacionCarga } from '../types/EstacionesYTalleres'

function adaptar(datos: EstacionCarga): EstacionCarga {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
    conectores: datos.conectores ?? ['Tipo 2'],
    velocidad: datos.velocidad ?? 'Rápida',
    disponibles: datos.disponibles ?? 0,
    totales: datos.totales ?? 0,
  }
}

export async function obtenerEstaciones(): Promise<EstacionCarga[]> {
  try {
    const datos = await peticion<EstacionCarga[]>('/estaciones-carga')
    if (datos.length === 0) return mocksEstaciones
    return datos.map(adaptar)
  } catch {
    return mocksEstaciones
  }
}