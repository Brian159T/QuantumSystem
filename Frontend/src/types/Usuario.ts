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
  id: number
  name: string
  email: string
  id_rol: number
  role: 'Usuario' | 'Administrador'
}