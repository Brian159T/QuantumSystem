import type { RepositorioAuth } from '../repositories/Repositorios'
import type { Credenciales, DatosRegistro, RespuestaAuth } from '../modelos/Usuario'

export class AuthUseCase {
  private readonly repositorio: RepositorioAuth

  constructor(repositorio: RepositorioAuth) {
    this.repositorio = repositorio
  }

  iniciarSesion(credenciales: Credenciales): Promise<RespuestaAuth> {
    return this.repositorio.iniciarSesion(credenciales)
  }

  registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
    return this.repositorio.registrar(datos)
  }
}