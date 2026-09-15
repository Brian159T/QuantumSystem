import type { RepositorioAuth } from '../../domain/repositories/Repositorios'
import type { Credenciales, DatosRegistro, RespuestaAuth } from '../../domain/modelos/Usuario'
import { peticion } from '../../infraestructura/http/ApiClient'

const ROL_CLIENTE = 2

export class AuthRepositoryImpl implements RepositorioAuth {
  async iniciarSesion(credenciales: Credenciales): Promise<RespuestaAuth> {
    return peticion<RespuestaAuth>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    })
  }

  async registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
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
}