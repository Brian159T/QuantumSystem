import http from '../Config/http'

const ESTACIONES_URL = '/estaciones-carga'

export interface EstacionCarga {
  id_estacion: number
  direccion: string
  latitud: number
  longitud: number
  horarios: string
  telefono?: string
  Estado: string
}

interface ApiResponse {
  error: boolean
  body: EstacionCarga[]
}

async function obtenerEstaciones(): Promise<EstacionCarga[]> {
  const response = await http.get<ApiResponse>(
    ESTACIONES_URL
  )

  return response.data.body
}

export default {
  obtenerEstaciones,
}