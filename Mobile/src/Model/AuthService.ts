import axios from 'axios'
import { AuthResponse, Credenciales } from './Usuario'
import { API_URL } from '../Config/api'

const AUTH_URL = `${API_URL}/auth`

async function login({
  correo,
  contrasena,
}: Credenciales): Promise<AuthResponse> {

  const response = await axios.post(
    `${AUTH_URL}/login`,
    {
      correo,
      contrasena,
    }
  )

  return response.data.body
}

async function registro({
  correo,
  contrasena,
}: Credenciales): Promise<AuthResponse> {

  const response = await axios.post<AuthResponse>(
    `${AUTH_URL}/registro`,
    {
      correo,
      contrasena,
    }
  )

  return response.data
}

export default {
  login,
  registro,
}