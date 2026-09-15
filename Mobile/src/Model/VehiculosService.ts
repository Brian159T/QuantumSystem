import axios from 'axios';
import { API_URL } from '../Config/api';

const VEHICULOS_URL = `${API_URL}/vehiculos`;

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
  const response = await axios.get<ApiResponse>(VEHICULOS_URL);

  return response.data.body;
}

export default {
  obtenerVehiculos,
};
