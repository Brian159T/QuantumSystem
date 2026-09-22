import type { Usuario } from '../types/Usuario'

export function esAdministrador(usuario: Usuario | null): boolean {
  if (!usuario) return false
  const rol = usuario.rol?.toLowerCase() ?? ''
  return rol.includes('admin') || usuario.id_rol === 1
}

export function esCliente(usuario: Usuario | null): boolean {
  if (!usuario) return false
  if (esAdministrador(usuario)) return false
  const rol = usuario.rol?.toLowerCase() ?? ''
  return (
    rol.includes('client') ||
    rol.includes('usuario') ||
    rol.includes('user') ||
    usuario.id_rol === 2
  )
}