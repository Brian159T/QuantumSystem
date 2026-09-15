import { createContext, useContext } from 'react'
import type { Credenciales, DatosRegistro, Usuario } from '../../domain/modelos/Usuario'

export interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  cargandoLogin: boolean
  cargandoRegistro: boolean
  errorLogin: string | null
  errorRegistro: string | null
  iniciarSesion: (credenciales: Credenciales) => Promise<boolean>
  registrar: (datos: DatosRegistro) => Promise<boolean>
  cerrarSesion: () => void
  esInvitado: boolean
  esCliente: boolean
  esAdministrador: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  return contexto
}