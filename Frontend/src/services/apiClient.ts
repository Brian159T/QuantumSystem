export interface SobreApi<T> {
  error: boolean
  status: number
  body: T
}

export const URL_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '/api'

export async function peticion<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  })

  const datos = (await respuesta.json()) as SobreApi<T>

  if (datos.error) {
    const mensaje =
      typeof datos.body === 'string' ? datos.body : 'La API devolvió un error inesperado'
    throw new Error(mensaje)
  }

  return datos.body
}