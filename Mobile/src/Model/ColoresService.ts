import http from '../Config/http';

const COLORES_URL = '/colores';

export interface Color {
  id_color: number;
  Color: string;
}

interface ApiResponse {
  error: boolean;
  body: Color[];
}

async function obtenerColores(): Promise<Color[]> {
  const response = await http.get<ApiResponse>(COLORES_URL);

  return response.data.body;
}

export default {
  obtenerColores,
};
