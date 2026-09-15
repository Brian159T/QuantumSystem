import type { Credenciales, DatosRegistro, RespuestaAuth, UsuarioAdministracion } from '../modelos/Usuario'
import type { Vehiculo } from '../modelos/Vehiculo'
import type { EstacionCarga, ServicioTecnico } from '../modelos/EstacionesYTalleres'

export interface RepositorioAuth {
  iniciarSesion(credenciales: Credenciales): Promise<RespuestaAuth>
  registrar(datos: DatosRegistro): Promise<RespuestaAuth>
}

export interface RepositorioVehiculos {
  obtenerTodos(): Promise<Vehiculo[]>
}

export interface RepositorioEstaciones {
  obtenerTodas(): Promise<EstacionCarga[]>
}

export interface RepositorioTalleres {
  obtenerTodos(): Promise<ServicioTecnico[]>
}

export interface RepositorioUsuarios {
  obtenerTodos(): Promise<UsuarioAdministracion[]>
}