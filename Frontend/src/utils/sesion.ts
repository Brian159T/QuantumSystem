import type { Usuario } from '../types/Usuario'

const CLAVE_USUARIO = 'quantum_usuario'

export const EVENTO_SESION_EXPIRADA = 'quantum:sesion-expirada'

function disponibleLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function obtenerUsuarioSesion(): Usuario | null {
  if (!disponibleLocalStorage()) return null
  const crudo = localStorage.getItem(CLAVE_USUARIO)
  if (!crudo) return null
  try {
    const usuario = JSON.parse(crudo) as Usuario
    return typeof usuario === 'object' && usuario !== null ? usuario : null
  } catch {
    return null
  }
}

export function guardarSesion(usuario: Usuario): void {
  if (!disponibleLocalStorage()) return
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function limpiarSesion(): void {
  if (!disponibleLocalStorage()) return
  localStorage.removeItem(CLAVE_USUARIO)
}

export function notificarSesionExpirada(): void {
  limpiarSesion()
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
}
