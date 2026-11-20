import http from '../Config/http'

const TALLERES_URL = '/servicios-tecnicos'

// Refleja exactamente las columnas de la tabla Servicios_Tecnicos.
// No se agregan campos que no existen en la base de datos
// (rating, reseñas, certificado, especialidades, tiempo de espera, etc.)
export interface Taller {
  id_servicio: number
  direccion: string
  latitud: number
  longitud: number
  horarios: string
  telefono?: string
  Estado: string
}

interface ApiResponse {
  error: boolean
  body: Taller[]
}

async function obtenerTalleres(): Promise<Taller[]> {
  const response = await http.get<ApiResponse>(
    TALLERES_URL
  )

  return response.data.body
}

export default {
  obtenerTalleres,
}