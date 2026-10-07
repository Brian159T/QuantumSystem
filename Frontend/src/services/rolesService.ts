import { peticion } from './apiClient'

export interface RolApi {
  id_rol: number
  Nombre: string
}

export async function obtenerRoles(): Promise<RolApi[]> {
  try {
    return await peticion<RolApi[]>('/clientes')
  } catch {
    return []
  }
}