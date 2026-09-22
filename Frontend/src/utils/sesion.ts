import type { Usuario } from '../types/Usuario'

const CLAVE_TOKEN = 'quantum_token'
const CLAVE_USUARIO = 'quantum_usuario'

function disponibleLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function obtenerTokenSesion(): string | null {
  if (!disponibleLocalStorage()) return null
  return localStorage.getItem(CLAVE_TOKEN)
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

export function guardarSesion(token: string, usuario: Usuario): void {
  if (!disponibleLocalStorage()) return
  localStorage.setItem(CLAVE_TOKEN, token)
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function limpiarSesion(): void {
  if (!disponibleLocalStorage()) return
  localStorage.removeItem(CLAVE_TOKEN)
  localStorage.removeItem(CLAVE_USUARIO)
}