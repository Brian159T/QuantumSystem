import axios from 'axios';
import { API_URL } from '../Config/api';

const RESERVAS_URL = `${API_URL}/reservas`;

export interface NuevaReserva {
  nombres: string;
  apellidos: string;
  cedula_identidad: string;
  modelo: string;
  color: number;
}

interface ApiResponse {
  error: boolean;
  body: string;
}

async function crearReserva(reserva: NuevaReserva): Promise<string> {
  const response = await axios.post<ApiResponse>(RESERVAS_URL, reserva);

  return response.data.body;
}

export default {
  crearReserva,
};
