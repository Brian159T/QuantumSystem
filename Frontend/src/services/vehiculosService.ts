import { FOTOS_VEHICULOS } from '../config/multimedia'
import { peticion } from './apiClient'
import type { ColorVehiculo, Vehiculo } from '../types/Vehiculo'

const HEX_COLORES_MARCA: Record<string, string> = {
  'quantum green': '#2fb676',
  'electric blue': '#4D9FFF',
  'midnight black': '#10131f',
  'pearl white': '#eef1f7',
}

function hexParaColor(nombre: string): string | undefined {
  return HEX_COLORES_MARCA[nombre.toLocaleLowerCase()]
}

function adaptar(datos: Vehiculo): Vehiculo {
  const coloresApi =
    Array.isArray(datos.colores) && datos.colores.length > 0 ? datos.colores : null
  const colores: ColorVehiculo[] = coloresApi
    ? coloresApi.map((color) => {
        const colorMarco = color as ColorVehiculo & { Color?: string }
        const nombre = colorMarco.Color ?? color.nombre
        return {
          id_color: colorMarco.id_color ?? color.id_color,
          nombre,
          hex: hexParaColor(nombre) ?? color.hex ?? '#4D9FFF',
        }
      })
    : []

  return {
    ...datos,
    imagen: FOTOS_VEHICULOS[String(datos.id_vehiculo)] || datos.imagen || '',
    colores,
  }
}

export async function obtenerVehiculos(): Promise<Vehiculo[]> {
  try {
    const datos = await peticion<Vehiculo[]>('/vehiculos')
    return datos.map(adaptar)
  } catch {
    return []
  }
}