import http from '../Config/http';

const VEHICULOS_URL = '/vehiculos';

export interface ColorVehiculo {
  id_color: number;
  Color: string;
}

export interface Vehiculo {
  id_vehiculo: number;
  Velocidad_Maxima: string;
  Autonomia: string;
  Tipo: string;
  Carga_Rapida: string;
  Nombre_Modelo: string;
  Capacidad_Bateria: string;
  Tiempo_Carga_Normal: string;
  Traccion: string;
  Nro_Asientos: string;
  id_color: number | null;
  Precio_USD: number | null;
  colores?: ColorVehiculo[];
}

interface ApiResponse {
  error: boolean;
  body: Vehiculo[];
}

async function obtenerVehiculos(): Promise<Vehiculo[]> {
  const response = await http.get<ApiResponse>(VEHICULOS_URL);

  return response.data.body;
}

export default {
  obtenerVehiculos,
};
