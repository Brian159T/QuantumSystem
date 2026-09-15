import type { RepositorioEstaciones, RepositorioTalleres } from '../../domain/repositories/Repositorios'
import type { EstacionCarga, ServicioTecnico } from '../../domain/modelos/EstacionesYTalleres'
import { peticion } from '../../infraestructura/http/ApiClient'
import { mocksEstaciones, mocksTalleres } from '../mocks/estacionesYTalleres.mock'

function adaptarEstacion(datos: EstacionCarga): EstacionCarga {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
    conectores: datos.conectores ?? ['Tipo 2'],
    velocidad: datos.velocidad ?? 'Rápida',
    disponibles: datos.disponibles ?? 0,
    totales: datos.totales ?? 0,
  }
}

function adaptarTaller(datos: ServicioTecnico): ServicioTecnico {
  return {
    ...datos,
    nombre: datos.nombre ?? datos.direccion,
    especialidades: datos.especialidades ?? ['Electrónica'],
  }
}

export class EstacionRepositoryImpl implements RepositorioEstaciones {
  async obtenerTodas(): Promise<EstacionCarga[]> {
    try {
      const datos = await peticion<EstacionCarga[]>('/estaciones-carga')
      if (datos.length === 0) return mocksEstaciones
      return datos.map(adaptarEstacion)
    } catch {
      return mocksEstaciones
    }
  }
}

export class TallerRepositoryImpl implements RepositorioTalleres {
  async obtenerTodos(): Promise<ServicioTecnico[]> {
    try {
      const datos = await peticion<ServicioTecnico[]>('/servicios-tecnicos')
      if (datos.length === 0) return mocksTalleres
      return datos.map(adaptarTaller)
    } catch {
      return mocksTalleres
    }
  }
}