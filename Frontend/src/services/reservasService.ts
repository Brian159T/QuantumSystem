import { peticion } from './apiClient'
import { obtenerColores } from './coloresService'
import type { ColorVehiculo, Vehiculo } from '../types/Vehiculo'

export interface DatosReserva {
  nombres: string
  apellidos: string
  cedula_identidad: string
  modelo: string
  color: number
}

export async function crearReserva(datos: DatosReserva): Promise<void> {
  await peticion<void>('/reservas', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export async function resolverIdColor(
  color: ColorVehiculo | null,
  modelo: Vehiculo | null,
): Promise<number> {
  if (color?.id_color != null) return color.id_color
  if (modelo?.id_color != null) return modelo.id_color
  if (color) {
    const colores = await obtenerColores()
    const coincidencia = colores.find(
      (colorBD) => colorBD.Color.toLocaleLowerCase() === color.nombre.toLocaleLowerCase(),
    )
    if (coincidencia) return coincidencia.id_color
  }
  throw new Error('No se pudo identificar el color seleccionado en la base de datos')
}