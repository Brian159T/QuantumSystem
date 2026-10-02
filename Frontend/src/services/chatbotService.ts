import { URL_BASE } from './apiClient'
import { obtenerTokenSesion } from '../utils/sesion'

// Cliente del chatbot. El backend expone dos modos:
//   POST /chatbot          -> respuesta completa en el sobre {error,status,body}
//   POST /chatbot/stream   -> SSE, un evento por trozo de texto
//
// Se usa el de stream porque la respuesta aparece mientras se genera; con
// el modelo de pago la latencia sube y sin esto el chat se siente colgado.
// El modo simple queda disponible igual, por si hay que depurar.

export interface FuenteChatbot {
  tabla: string
  id: number | string
  titulo: string
  texto: string
  similitud: number
}

export interface TurnoHistorial {
  rol: 'user' | 'assistant'
  texto: string
}

export interface EstadoChatbot {
  enLinea: boolean
  proveedor: string
  modelo: string
  ragOperativo: boolean
  tablasIndexadas: string[]
  mensaje: string
}

export interface RespuestaChatbot {
  texto: string
  fuentes: FuenteChatbot[]
  proveedor: string
  modelo: string
}

// Eventos que el backend emite por SSE.
export type EventoChatbot =
  | { tipo: 'contexto'; fuentes: FuenteChatbot[]; proveedor: string; modelo: string }
  | { tipo: 'token'; texto: string }
  | { tipo: 'fin'; texto: string; fuentes: FuenteChatbot[] }
  | { tipo: 'error'; mensaje: string }

function cabeceras(): Record<string, string> {
  const token = obtenerTokenSesion()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// El historial solo se manda si hay al menos un turno: enviarlo vacio
// solo gastaria tokens.
function cuerpo(mensaje: string, historial: TurnoHistorial[]) {
  return { mensaje, historial: historial.slice(-6) }
}

export async function obtenerEstado(): Promise<EstadoChatbot | null> {
  try {
    const respuesta = await fetch(`${URL_BASE}/chatbot/estado`, {
      headers: cabeceras(),
    })
    const sobre = await respuesta.json()
    return sobre?.error ? null : (sobre.body as EstadoChatbot)
  } catch {
    return null
  }
}

export async function preguntar(
  mensaje: string,
  historial: TurnoHistorial[] = []
): Promise<RespuestaChatbot> {
  const respuesta = await fetch(`${URL_BASE}/chatbot`, {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify(cuerpo(mensaje, historial)),
  })

  const sobre = await respuesta.json().catch(() => null)
  if (!sobre || sobre.error) {
    throw new Error(sobre?.body ?? 'No se pudo contactar al asistente')
  }
  return sobre.body as RespuestaChatbot
}

// Streaming: se lee el body como flujo de bytes y se trocea por eventos SSE.
// onEvento se llama en cuanto llega cada trozo, que es lo que hace que el
// texto aparezca progresivamente en la burbuja.
export async function preguntarEnStream(
  mensaje: string,
  historial: TurnoHistorial[] = [],
  onEvento: (evento: EventoChatbot) => void
): Promise<void> {
  const respuesta = await fetch(`${URL_BASE}/chatbot/stream`, {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify(cuerpo(mensaje, historial)),
  })

  if (!respuesta.ok || !respuesta.body) {
    const sobre = await respuesta.json().catch(() => null)
    throw new Error(sobre?.body ?? 'No se pudo contactar al asistente')
  }

  const lector = respuesta.body.getReader()
  const decodificador = new TextDecoder()
  let buffer = ''

  const procesar = (bloque: string) => {
    let tipo = 'token'
    let carga = ''

    for (const linea of bloque.split('\n')) {
      if (linea.startsWith('event:')) {
        tipo = linea.slice(6).trim()
      } else if (linea.startsWith('data:')) {
        carga += linea.slice(5).trim()
      }
    }

    if (!carga) return
    let datos: Record<string, unknown>
    try {
      datos = JSON.parse(carga) as Record<string, unknown>
    } catch {
      return
    }
    onEvento({ tipo, ...datos } as EventoChatbot)
  }

  try {
    for (;;) {
      const { done, value } = await lector.read()
      if (done) break
      buffer += decodificador.decode(value, { stream: true })
      const bloques = buffer.split('\n\n')
      buffer = bloques.pop() ?? ''
      bloques.forEach(procesar)
    }
    if (buffer.trim()) procesar(buffer)
  } finally {
    lector.releaseLock()
  }
}