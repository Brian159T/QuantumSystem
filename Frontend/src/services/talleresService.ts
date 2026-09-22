import { peticion } from './apiClient'
import { mocksTalleres } from './mocks/estacionesYTalleres'
import type { ServicioTecnico } from '../types/EstacionesYTalleres'

function adaptar(datos: ServicioTecnico): ServicioTecnico {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
    especialidades: datos.especialidades ?? ['Electrónica'],
  }
}

export async function obtenerTalleres(): Promise<ServicioTecnico[]> {
  try {
    const datos = await peticion<ServicioTecnico[]>('/servicios-tecnicos')
    if (datos.length === 0) return mocksTalleres
    return datos.map(adaptar)
  } catch {
    return mocksTalleres
  }
}