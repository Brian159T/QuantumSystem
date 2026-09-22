import { obtenerTokenSesion } from '../utils/sesion'

export interface SobreApi<T> {
  error: boolean
  status: number
  body: T
}

export const URL_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '/api'

function mensajeSinConexion(respuesta: Response | null): string {
  if (respuesta) {
    return `No se pudo conectar con el backend (${respuesta.status} ${respuesta.statusText}). Verifica que el servidor esté levantado.`
  }
  return 'No se pudo conectar con el backend. Verifica que el servidor esté levantado.'
}

export async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerTokenSesion()
  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opciones.headers,
      },
      ...opciones,
    })
  } catch {
    throw new Error(mensajeSinConexion(null))
  }

  let datos: SobreApi<T>
  try {
    datos = (await respuesta.json()) as SobreApi<T>
  } catch {
    throw new Error(mensajeSinConexion(respuesta))
  }

  if (typeof datos !== 'object' || datos === null || typeof datos.error !== 'boolean') {
    throw new Error(mensajeSinConexion(respuesta))
  }

  if (datos.error) {
    const mensaje =
      typeof datos.body === 'string' ? datos.body : 'La API devolvió un error inesperado'
    throw new Error(mensaje)
  }

  return datos.body
}