import { peticion } from './apiClient'
import type { Credenciales, DatosRegistro, RespuestaAuth, Usuario } from '../types/Usuario'

export interface RespuestaSesion {
  usuario: Usuario
}

function validarSesion(datos: RespuestaAuth): RespuestaAuth {
  const tieneToken = typeof datos?.token === 'string' && datos.token.length > 0
  const tieneUsuario = typeof datos?.usuario === 'object' && datos.usuario !== null

  if (!tieneToken || !tieneUsuario) {
    throw new Error('El backend devolvió una respuesta de autenticación inválida')
  }

  return datos
}

export async function iniciarSesion(credenciales: Credenciales): Promise<RespuestaAuth> {
  const datos = await peticion<RespuestaAuth>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  })

  return validarSesion(datos)
}

export async function cerrarSesion(): Promise<void> {
  await peticion<void>('/auth/logout', { method: 'POST' })
}

export async function obtenerSesion(): Promise<RespuestaSesion> {
  const datos = await peticion<RespuestaSesion>('/auth/sesion')

  if (typeof datos?.usuario !== 'object' || datos.usuario === null) {
    throw new Error('La sesion devuelta por el backend no es valida')
  }

  return datos
}

export async function registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
  const respuesta = await peticion<RespuestaAuth>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre_usuario: datos.nombre_usuario,
      correo: datos.correo,
      contrasena: datos.contrasena,
    }),
  })

  return validarSesion(respuesta)
}