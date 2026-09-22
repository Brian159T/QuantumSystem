import { peticion } from './apiClient'
import type { ServicioTecnico } from '../types/EstacionesYTalleres'

function adaptar(datos: ServicioTecnico): ServicioTecnico {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
    abiertoAhora: datos.Estado === 'disponible',
  }
}

export async function obtenerTalleres(): Promise<ServicioTecnico[]> {
  try {
    const datos = await peticion<ServicioTecnico[]>('/servicios-tecnicos')
    return datos.map(adaptar)
  } catch {
    return []
  }
}