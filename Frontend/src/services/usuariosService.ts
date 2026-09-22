import { peticion } from './apiClient'
import { mocksUsuarios } from './mocks/usuarios'
import type { UsuarioAdministracion } from '../types/Usuario'

interface UsuarioApi {
  id_usuario: number
  nombre_usuario: string
  correo: string
  id_rol: number
  rol?: string
}

function adaptar(usuario: UsuarioApi): UsuarioAdministracion {
  return {
    id: String(usuario.id_usuario),
    name: usuario.nombre_usuario,
    email: usuario.correo,
    role: usuario.id_rol === 1 ? 'Administrador' : 'Usuario',
    status: 'Activo',
    vehicles: 0,
    joinedAt: '—',
  }
}

export async function obtenerUsuarios(): Promise<UsuarioAdministracion[]> {
  try {
    const datos = await peticion<UsuarioApi[]>('/usuarios')
    if (datos.length === 0) return mocksUsuarios
    return datos.map(adaptar)
  } catch {
    return mocksUsuarios
  }
}