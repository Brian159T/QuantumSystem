import axios from 'axios';
import { API_URL } from '../Config/api';

const COLORES_URL = `${API_URL}/colores`;

export interface Color {
  id_color: number;
  Color: string;
}

interface ApiResponse {
  error: boolean;
  body: Color[];
}

async function obtenerColores(): Promise<Color[]> {
  const response = await axios.get<ApiResponse>(COLORES_URL);

  return response.data.body;
}

export default {
  obtenerColores,
};
