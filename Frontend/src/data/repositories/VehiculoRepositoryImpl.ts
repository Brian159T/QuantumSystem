import type { RepositorioVehiculos } from '../../domain/repositories/Repositorios'
import type { Vehiculo } from '../../domain/modelos/Vehiculo'
import { peticion } from '../../infraestructura/http/ApiClient'
import { mocksVehiculos } from '../mocks/vehiculos.mock'

const PALETA_COLORES = [
  { nombre: 'Quantum Green', hex: '#2fb676' },
  { nombre: 'Electric Blue', hex: '#4D9FFF' },
  { nombre: 'Midnight Black', hex: '#10131f' },
  { nombre: 'Pearl White', hex: '#eef1f7' },
]

function adaptar(datos: Vehiculo): Vehiculo {
  const clave = datos.Nombre_Modelo || `Modelo ${datos.id_vehiculo ?? ''}`
  return {
    ...datos,
    imagen: datos.imagen ?? `https://placehold.co/500x280/0f1f3d/4D9FFF?text=${encodeURIComponent(clave)}`,
    colores: datos.colores ?? PALETA_COLORES,
  }
}

export class VehiculoRepositoryImpl implements RepositorioVehiculos {
  async obtenerTodos(): Promise<Vehiculo[]> {
    try {
      const datos = await peticion<Vehiculo[]>('/vehiculos')
      if (datos.length === 0) return mocksVehiculos
      return datos.map(adaptar)
    } catch {
      return mocksVehiculos
    }
  }
}