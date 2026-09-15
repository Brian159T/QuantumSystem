export interface Usuario {
  id_usuario: number
  nombre_usuario: string
  correo: string
  id_rol: number
  rol: string // "Cliente" | "Administrador" (según Roles.Nombre en la BD)
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface Credenciales {
  correo: string
  contrasena: string
}