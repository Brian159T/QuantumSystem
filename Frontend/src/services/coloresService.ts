import { peticion } from './apiClient'

export interface ColorApi {
  id_color: number
  Color: string
}

export async function obtenerColores(): Promise<ColorApi[]> {
  try {
    return await peticion<ColorApi[]>('/colores')
  } catch {
    return []
  }
}