export interface ColorVehiculo {
  nombre: string
  hex: string
}

export interface Vehiculo {
  // Campos de la tabla Vehiculos (API)
  id_vehiculo?: number
  Nombre_Modelo: string
  Tipo: string
  Autonomia: string
  Velocidad_Maxima: string
  Carga_Rapida: string
  Capacidad_Bateria: string
  Tiempo_Carga_Normal: string
  Traccion: string
  Nro_Asientos: string
  id_color?: number

  // Datos de presentación (complementan la API en modo demo)
  precio?: string
  precioOriginal?: string
  aceleracion?: string
  imagen?: string
  etiqueta?: string
  descuento?: string
  colores?: ColorVehiculo[]
}