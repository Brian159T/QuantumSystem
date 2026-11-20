import { useEffect, useState, type ReactNode } from 'react'
import type { Credenciales, DatosRegistro } from '../types/Usuario'
import * as authService from '../services/authService'
import { esAdministrador, esCliente } from '../utils/roles'
import {
  EVENTO_SESION_EXPIRADA,
  guardarSesion,
  limpiarSesion,
  obtenerUsuarioSesion,
} from '../utils/sesion'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState(() => obtenerUsuarioSesion())
  const [cargandoLogin, setCargandoLogin] = useState(false)
  const [cargandoRegistro, setCargandoRegistro] = useState(false)
  const [errorLogin, setErrorLogin] = useState<string | null>(null)
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null)

  useEffect(() => {
    const manejarExpiracion = () => setUsuario(null)
    window.addEventListener(EVENTO_SESION_EXPIRADA, manejarExpiracion)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, manejarExpiracion)
  }, [])

  useEffect(() => {
    let vigente = true

    authService
      .obtenerSesion()
      .then((datos) => {
        if (!vigente) return
        setUsuario(datos.usuario)
        guardarSesion(datos.usuario)
      })
      .catch(() => {
        // Un fallo de red no debe borrar una sesion que sigue siendo valida.
        // El 401 ya fue notificado por apiClient.
      })

    return () => {
      vigente = false
    }
  }, [])

  const iniciarSesion = async (credenciales: Credenciales): Promise<boolean> => {
    setErrorLogin(null)
    setCargandoLogin(true)
    try {
      const datos = await authService.iniciarSesion(credenciales)
      setUsuario(datos.usuario)
      guardarSesion(datos.usuario)
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
      // Solo crea la cuenta; NO inicia sesion para que el usuario
      // entre manualmente con sus credenciales.
      await authService.registrar(datos)
      return true
    } catch (error) {
      setErrorRegistro(error instanceof Error ? error.message : 'No se pudo crear la cuenta')
      return false
    } finally {
      setCargandoRegistro(false)
    }
  }

  const cerrarSesion = () => {
    void authService.cerrarSesion()
    setUsuario(null)
    limpiarSesion()
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token: null,
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
