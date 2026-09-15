import type { RepositorioUsuarios } from '../../domain/repositories/Repositorios'
import type { UsuarioAdministracion } from '../../domain/modelos/Usuario'
import { peticion } from '../../infraestructura/http/ApiClient'
import { mocksUsuarios } from '../mocks/usuarios.mock'

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

export class UsuarioRepositoryImpl implements RepositorioUsuarios {
  async obtenerTodos(): Promise<UsuarioAdministracion[]> {
    try {
      const datos = await peticion<UsuarioApi[]>('/usuarios')
      if (datos.length === 0) return mocksUsuarios
      return datos.map(adaptar)
    } catch {
      return mocksUsuarios
    }
  }
}