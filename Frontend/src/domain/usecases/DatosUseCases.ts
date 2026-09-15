import type { RepositorioVehiculos, RepositorioEstaciones, RepositorioTalleres, RepositorioUsuarios } from '../repositories/Repositorios'
import type { Vehiculo } from '../modelos/Vehiculo'
import type { EstacionCarga, ServicioTecnico } from '../modelos/EstacionesYTalleres'
import type { UsuarioAdministracion } from '../modelos/Usuario'

export class CatalogoUseCase {
  private readonly repositorio: RepositorioVehiculos

  constructor(repositorio: RepositorioVehiculos) {
    this.repositorio = repositorio
  }

  obtenerCatalogo(): Promise<Vehiculo[]> {
    return this.repositorio.obtenerTodos()
  }
}

export class EstacionesUseCase {
  private readonly repositorio: RepositorioEstaciones

  constructor(repositorio: RepositorioEstaciones) {
    this.repositorio = repositorio
  }

  obtenerEstaciones(): Promise<EstacionCarga[]> {
    return this.repositorio.obtenerTodas()
  }
}

export class TalleresUseCase {
  private readonly repositorio: RepositorioTalleres

  constructor(repositorio: RepositorioTalleres) {
    this.repositorio = repositorio
  }

  obtenerTalleres(): Promise<ServicioTecnico[]> {
    return this.repositorio.obtenerTodos()
  }
}

export class UsuariosUseCase {
  private readonly repositorio: RepositorioUsuarios

  constructor(repositorio: RepositorioUsuarios) {
    this.repositorio = repositorio
  }

  obtenerUsuarios(): Promise<UsuarioAdministracion[]> {
    return this.repositorio.obtenerTodos()
  }
}