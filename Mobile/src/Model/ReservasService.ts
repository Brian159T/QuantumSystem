import http from '../Config/http';

const RESERVAS_URL = '/reservas';

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
  const response = await http.post<ApiResponse>(RESERVAS_URL, reserva);

  return response.data.body;
}

export default {
  crearReserva,
};
