import React, { createContext, useContext, useState, ReactNode } from 'react'
import AuthService from '../Model/AuthService'
import { Usuario, Credenciales } from '../Model/Usuario'

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  loadingLogin: boolean
  loadingRegistro: boolean
  errorLogin: string | null
  errorRegistro: string | null
  login: (credenciales: Credenciales) => Promise<boolean>
  registro: (credenciales: Credenciales) => Promise<boolean>
  logout: () => void
  // derivado del rol, listo para que la View lo consuma sin pensar
  esInvitado: boolean
  esCliente: boolean
  esAdministrador: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingRegistro, setLoadingRegistro] = useState(false)
  const [errorLogin, setErrorLogin] = useState<string | null>(null)
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null)

  const login = async (credenciales: Credenciales): Promise<boolean> => {
    setErrorLogin(null)
    setLoadingLogin(true)
    try {
      const data = await AuthService.login(credenciales)
      setUsuario(data.usuario)
      setToken(data.token)
      return true
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.mensaje ||
        error?.response?.data?.message ||
        'Correo o contraseña incorrectos'
      setErrorLogin(mensaje)
      return false
    } finally {
      setLoadingLogin(false)
    }
  }

  const registro = async (credenciales: Credenciales): Promise<boolean> => {
    setErrorRegistro(null)
    setLoadingRegistro(true)
    try {
      const data = await AuthService.registro(credenciales)
      setUsuario(data.usuario)
      setToken(data.token)
      return true
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.mensaje ||
        error?.response?.data?.message ||
        'No se pudo crear la cuenta'
      setErrorRegistro(mensaje)
      return false
    } finally {
      setLoadingRegistro(false)
    }
  }

  const logout = () => {
    setUsuario(null)
    setToken(null)
  }

  const rol = usuario?.rol?.toLowerCase() ?? null

  const value: AuthContextType = {
    usuario,
    token,
    loadingLogin,
    loadingRegistro,
    errorLogin,
    errorRegistro,
    login,
    registro,
    logout,
    esInvitado: !usuario,
    esCliente: rol === 'cliente',
    esAdministrador: rol === 'administrador',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  return ctx
}