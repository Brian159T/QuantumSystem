export type VelocidadCarga = 'Estándar' | 'Rápida' | 'Ultra rápida'

export interface EstacionCarga {
  // Campos de la tabla Estaciones_Carga (API)
  id_estacion?: number
  direccion: string
  latitud?: number
  longitud?: number
  horarios?: string
  telefono?: string
  Estado?: string

  // Datos de presentación (modo demo)
  nombre?: string
  distanciaKm?: number
  disponibles?: number
  totales?: number
  precioPorKwh?: string
  rating?: number
  conectores?: string[]
  velocidad?: VelocidadCarga
  abierto24h?: boolean
}

export interface ServicioTecnico {
  // Campos de la tabla Servicios_Tecnicos (API)
  id_servicio?: number
  direccion: string
  latitud?: number
  longitud?: number
  horarios?: string
  telefono?: string
  Estado?: string

  // Datos de presentación (modo demo)
  nombre?: string
  distanciaKm?: number
  rating?: number
  reseñas?: number
  certificado?: boolean
  especialidades?: string[]
  abiertoAhora?: boolean
  espera?: string
}