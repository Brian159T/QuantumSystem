import { peticion } from './apiClient'
import type { EstacionCarga } from '../types/EstacionesYTalleres'

function adaptar(datos: EstacionCarga): EstacionCarga {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
  }
}

export async function obtenerEstaciones(): Promise<EstacionCarga[]> {
  try {
    const datos = await peticion<EstacionCarga[]>('/estaciones-carga')
    return datos.map(adaptar)
  } catch {
    return []
  }
}