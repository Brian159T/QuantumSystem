import { useState, type ReactNode } from 'react'
import type { Credenciales, DatosRegistro, Usuario } from '../../domain/modelos/Usuario'
import { authUseCase } from '../../data'
import { AuthContext } from './AuthContext'

function esRolAdministrador(usuario: Usuario | null): boolean {
  if (!usuario) return false
  const rol = usuario.rol?.toLowerCase() ?? ''
  return rol.includes('admin') || usuario.id_rol === 1
}

function esRolCliente(usuario: Usuario | null): boolean {
  if (!usuario) return false
  if (esRolAdministrador(usuario)) return false
  const rol = usuario.rol?.toLowerCase() ?? ''
  return (
    rol.includes('client') ||
    rol.includes('usuario') ||
    rol.includes('user') ||
    usuario.id_rol === 2
  )
}

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
      const datos = await authUseCase.iniciarSesion(credenciales)
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
      const datosAuth = await authUseCase.registrar(datos)
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

  const value = {
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
    esCliente: esRolCliente(usuario),
    esAdministrador: esRolAdministrador(usuario),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}