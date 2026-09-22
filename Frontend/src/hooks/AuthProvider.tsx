import { useState, type ReactNode } from 'react'
import type { Credenciales, DatosRegistro, Usuario } from '../types/Usuario'
import * as authService from '../services/authService'
import { esAdministrador, esCliente } from '../utils/roles'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [cargandoLogin, setCargandoLogin] = useState(false)
  const [cargandoRegistro, setCargandoRegistro] = useState(false)
  const [errorLogin, setErrorLogin] = useState<string | null>(null)
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null)

  const iniciarSesion = async (credenciales: Credenciales): Promise<boolean> => {
    setErrorLogin(null)
    setCargandoLogin(true)
    try {
      const datos = await authService.iniciarSesion(credenciales)
      setUsuario(datos.usuario)
      setToken(datos.token)
      return true
    } catch (error) {
      setErrorLogin(error instanceof Error ? error.message : 'Correo o contraseña incorrectos')
      return false
    } finally {
      setCargandoLogin(false)
    }
  }

  const registrar = async (datos: DatosRegistro): Promise<boolean> => {
    setErrorRegistro(null)
    setCargandoRegistro(true)
    try {
      const datosAuth = await authService.registrar(datos)
      setUsuario(datosAuth.usuario)
      setToken(datosAuth.token)
      return true
    } catch (error) {
      setErrorRegistro(error instanceof Error ? error.message : 'No se pudo crear la cuenta')
      return false
    } finally {
      setCargandoRegistro(false)
    }
  }

  const cerrarSesion = () => {
    setUsuario(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargandoLogin,
        cargandoRegistro,
        errorLogin,
        errorRegistro,
        iniciarSesion,
        registrar,
        cerrarSesion,
        esInvitado: !usuario,
        esCliente: esCliente(usuario),
        esAdministrador: esAdministrador(usuario),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}