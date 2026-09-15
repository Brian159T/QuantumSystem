import { AuthUseCase } from '../domain/usecases/AuthUseCase'
import { CatalogoUseCase, EstacionesUseCase, TalleresUseCase, UsuariosUseCase } from '../domain/usecases/DatosUseCases'
import { AuthRepositoryImpl } from './repositories/AuthRepositoryImpl'
import { VehiculoRepositoryImpl } from './repositories/VehiculoRepositoryImpl'
import { EstacionRepositoryImpl, TallerRepositoryImpl } from './repositories/EstacionYTallerRepositoryImpl'
import { UsuarioRepositoryImpl } from './repositories/UsuarioRepositoryImpl'

export const authUseCase = new AuthUseCase(new AuthRepositoryImpl())
export const catalogoUseCase = new CatalogoUseCase(new VehiculoRepositoryImpl())
export const estacionesUseCase = new EstacionesUseCase(new EstacionRepositoryImpl())
export const talleresUseCase = new TalleresUseCase(new TallerRepositoryImpl())
export const usuariosUseCase = new UsuariosUseCase(new UsuarioRepositoryImpl())