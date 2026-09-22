import { peticion } from './apiClient'
import type { Credenciales, DatosRegistro, RespuestaAuth } from '../types/Usuario'

const ROL_CLIENTE = 2

export async function iniciarSesion(credenciales: Credenciales): Promise<RespuestaAuth> {
  return peticion<RespuestaAuth>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  })
}

export async function registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
  await peticion('/usuarios', {
    method: 'POST',
    body: JSON.stringify({
      nombre_usuario: datos.nombre_usuario,
      correo: datos.correo,
      contrasena: datos.contrasena,
      id_rol: ROL_CLIENTE,
    }),
  })

  return peticion<RespuestaAuth>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo: datos.correo, contrasena: datos.contrasena }),
  })
}