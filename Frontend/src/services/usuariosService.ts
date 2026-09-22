import { peticion } from './apiClient'
import type { UsuarioAdministracion } from '../types/Usuario'

interface UsuarioApi {
  id_usuario: number
  nombre_usuario: string
  correo: string
  id_rol: number
  rol?: string
}

export interface DatosNuevoUsuario {
  nombre_usuario: string
  correo: string
  contrasena: string
  id_rol: number
}

function adaptar(usuario: UsuarioApi): UsuarioAdministracion {
  return {
    id: usuario.id_usuario,
    name: usuario.nombre_usuario,
    email: usuario.correo,
    id_rol: usuario.id_rol,
    role: usuario.id_rol === 1 ? 'Administrador' : 'Usuario',
  }
}

export async function obtenerUsuarios(): Promise<UsuarioAdministracion[]> {
  try {
    const datos = await peticion<UsuarioApi[]>('/usuarios')
    return datos.map(adaptar)
  } catch {
    return []
  }
}

export async function crearUsuario(datos: DatosNuevoUsuario): Promise<void> {
  await peticion('/usuarios', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export async function eliminarUsuario(id: number): Promise<void> {
  await peticion(`/usuarios/${id}`, {
    method: 'DELETE',
  })
}