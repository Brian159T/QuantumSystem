import { useEffect, useState } from 'react'
import { obtenerEstaciones } from '../services/estacionesService'
import { obtenerTalleres } from '../services/talleresService'
import { obtenerUsuarios } from '../services/usuariosService'
import { obtenerVehiculos } from '../services/vehiculosService'
import type { EstacionCarga, ServicioTecnico } from '../types/EstacionesYTalleres'
import type { UsuarioAdministracion } from '../types/Usuario'
import type { Vehiculo } from '../types/Vehiculo'

interface ResultadoDatos<T> {
  datos: T[]
  cargando: boolean
  actualizar: (nuevosDatos: T[] | ((previos: T[]) => T[])) => void
  recargar: () => void
}

function useColeccion<T>(obtener: () => Promise<T[]>): ResultadoDatos<T> {
  const [datos, setDatos] = useState<T[]>([])
  const [cargando, setCargando] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let activo = true
    obtener()
      .then((resultado) => {
        if (activo) setDatos(resultado)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [obtener, version])

  return {
    datos,
    cargando,
    actualizar: setDatos,
    recargar: () => {
      setCargando(true)
      setVersion((previa) => previa + 1)
    },
  }
}

export function useVehiculos(): ResultadoDatos<Vehiculo> {
  return useColeccion<Vehiculo>(obtenerVehiculos)
}

export function useEstaciones(): ResultadoDatos<EstacionCarga> {
  return useColeccion<EstacionCarga>(obtenerEstaciones)
}

export function useTalleres(): ResultadoDatos<ServicioTecnico> {
  return useColeccion<ServicioTecnico>(obtenerTalleres)
}

export function useUsuarios(): ResultadoDatos<UsuarioAdministracion> {
  return useColeccion<UsuarioAdministracion>(obtenerUsuarios)
}