import http from '../Config/http'
import { guardarToken } from '../Config/token'
import { AuthResponse, Credenciales } from './Usuario'

const AUTH_URL = '/auth'

async function login({ correo, contrasena }: Credenciales): Promise<AuthResponse> {
  const response = await http.post(`${AUTH_URL}/login`, { correo, contrasena })
  const datos: AuthResponse = response.data.body

  guardarToken(datos.token)
  return datos
}

async function registro({
  nombre_usuario,
  correo,
  contrasena,
}: Credenciales): Promise<AuthResponse> {
  const response = await http.post(`${AUTH_URL}/registro`, {
    nombre_usuario,
    correo,
    contrasena,
  })
  const datos: AuthResponse = response.data.body

  guardarToken(datos.token)
  return datos
}

export default {
  login,
  registro,
}
