export interface Usuario {
  id_usuario: number
  nombre_usuario: string
  correo: string
  id_rol: number
  rol: string
}

export interface Credenciales {
  correo: string
  contrasena: string
}

export interface DatosRegistro {
  nombre_usuario: string
  correo: string
  contrasena: string
}

export interface RespuestaAuth {
  token: string
  usuario: Usuario
}

export interface UsuarioAdministracion {
  id: string
  name: string
  email: string
  role: 'Usuario' | 'Administrador'
  status: 'Activo' | 'Suspendido'
  vehicles: number
  joinedAt: string
}