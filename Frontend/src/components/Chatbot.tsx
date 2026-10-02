import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Bot, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { obtenerEstado, preguntarEnStream } from '../services/chatbotService'
import type { EventoChatbot, FuenteChatbot, TurnoHistorial } from '../services/chatbotService'

interface Mensaje extends TurnoHistorial {
  id: string
  hora: string
  pendiente?: boolean
  error?: boolean
  fuentes?: FuenteChatbot[]
}

const MENSAJE_INICIAL: Mensaje = {
  id: '0',
  rol: 'assistant',
  texto: '¡Hola! Soy el asistente de Quantum. Preguntame por los vehiculos electricos, las estaciones de carga o los talleres autorizados.',
  hora: '',
}

const PREGUNTAS_SUGERIDAS = [
  '¿Que vehiculos electricos tienen?',
  '¿Cuales son las estaciones de carga?',
  '¿Donde puedo reparar mi auto?',
]

const horaActual = () =>
  new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

// El historial que se manda al backend: los mensajes ya completos, sin el
// saludo inicial ni los que fallaron (un error no es contexto para el modelo).
function historialDe(mensajes: Mensaje[]): TurnoHistorial[] {
  return mensajes
    .filter((m) => m.id !== '0' && !m.pendiente && !m.error && m.texto.trim())
    .map((m) => ({ rol: m.rol, texto: m.texto }))
    .slice(-6)
}

export default function Chatbot() {
  const [visible, setVisible] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL])
  const [texto, setTexto] = useState('')
  const [enLinea, setEnLinea] = useState<boolean | null>(null)
  const [estadoTexto, setEstadoTexto] = useState('Conectando...')
  const [enviando, setEnviando] = useState(false)

  const finRef = useRef<HTMLDivElement>(null)
  // Contador en un ref en vez de Date.now(): el linter de React Compiler
  // rechaza funciones impuras en el cuerpo del componente, y ademas dos
  // ids generados en el mismo milisegundo colisionarian.
  const contadorRef = useRef(0)

  useEffect(() => {
    let vigente = true
    obtenerEstado().then((estado) => {
      if (!vigente) return
      if (!estado) {
        setEnLinea(false)
        setEstadoTexto('Sin conexion con la IA')
        return
      }
      setEnLinea(estado.enLinea)
      setEstadoTexto(estado.enLinea ? 'En linea' : 'Sin configurar')
    })
    return () => {
      vigente = false
    }
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes])

  const enviar = async (contenido: string) => {
    const pregunta = contenido.trim()
    if (!pregunta || enviando) return

    const historial = historialDe(mensajes)
    contadorRef.current += 1
    const idUsuario = `u-${contadorRef.current}`
    const idAsistente = `a-${contadorRef.current}`

    setMensajes((prev) => [
      ...prev,
      { id: idUsuario, rol: 'user', texto: pregunta, hora: horaActual() },
      { id: idAsistente, rol: 'assistant', texto: '', hora: horaActual(), pendiente: true },
    ])
    setTexto('')
    setEnviando(true)

    const agregarAlAsistente = (cambio: Partial<Mensaje>) => {
      setMensajes((prev) =>
        prev.map((m) => (m.id === idAsistente ? { ...m, ...cambio } : m))
      )
    }

    try {
      let acumulado = ''
      await preguntarEnStream(pregunta, historial, (evento: EventoChatbot) => {
        if (evento.tipo === 'token') {
          acumulado += evento.texto
          agregarAlAsistente({ texto: acumulado })
        } else if (evento.tipo === 'contexto') {
          agregarAlAsistente({ fuentes: evento.fuentes })
        } else if (evento.tipo === 'fin') {
          agregarAlAsistente({
            texto: evento.texto || acumulado,
            fuentes: evento.fuentes,
            pendiente: false,
          })
        } else if (evento.tipo === 'error') {
          agregarAlAsistente({
            texto: evento.mensaje,
            pendiente: false,
            error: true,
          })
        }
      })
      // Si el stream cerro sin evento "fin" y no llego nada, no se queda
      // la burbuja colgada esperando.
      agregarAlAsistente({ pendiente: false })
    } catch (err) {
      agregarAlAsistente({
        texto: err instanceof Error ? err.message : 'No se pudo obtener respuesta.',
        pendiente: false,
        error: true,
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      {!visible && (
        <button
          className="chatbot-fab"
          onClick={() => setVisible(true)}
          aria-label="Abrir chat del asistente"
        >
          <MessageCircle size={26} />
          <span className="chatbot-fab__punto" />
        </button>
      )}

      {visible && (
        <div className="chatbot-panel" role="dialog" aria-label="Asistente Quantum">
          <header className="chatbot-panel__header">
            <div className="chatbot-panel__avatar">
              <Bot size={18} />
            </div>
            <div className="chatbot-panel__info">
              <strong className="chatbot-panel__titulo">Asistente Quantum</strong>
              <span className="chatbot-panel__estado">
                <span
                  className={
                    enLinea === false ? 'chatbot-panel__punto chatbot-panel__punto--error' : 'chatbot-panel__punto'
                  }
                />
                {estadoTexto}
              </span>
            </div>
            <button
              className="chatbot-panel__cerrar"
              onClick={() => setVisible(false)}
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="chatbot-panel__mensajes">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={[
                  'chatbot-burbuja',
                  mensaje.rol === 'user' ? 'chatbot-burbuja--usuario' : '',
                  mensaje.error ? 'chatbot-burbuja--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {mensaje.pendiente && !mensaje.texto ? (
                  <span className="chatbot-burbuja__pensando">
                    <Loader2 size={14} className="chatbot-giro" />
                  </span>
                ) : (
                  <>
                    {mensaje.error && <AlertTriangle size={14} />}
                    <p>{mensaje.texto}</p>
                    {!!mensaje.fuentes?.length && (
                      <span className="chatbot-burbuja__fuentes">
                        {mensaje.fuentes.length} fuente{mensaje.fuentes.length > 1 ? 's' : ''} del
                        catalogo
                      </span>
                    )}
                  </>
                )}
                {mensaje.hora && !mensaje.pendiente && <time>{mensaje.hora}</time>}
              </div>
            ))}
            <div ref={finRef} />
          </div>

          {mensajes.length === 1 && (
            <div className="chatbot-panel__sugerencias">
              {PREGUNTAS_SUGERIDAS.map((sugerencia) => (
                <button key={sugerencia} onClick={() => enviar(sugerencia)}>
                  {sugerencia}
                </button>
              ))}
            </div>
          )}

          <footer className="chatbot-panel__input">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !enviando) enviar(texto)
              }}
              disabled={enviando || enLinea === false}
            />
            <button
              className="chatbot-panel__enviar"
              onClick={() => enviar(texto)}
              disabled={!texto.trim() || enviando || enLinea === false}
              aria-label="Enviar mensaje"
            >
              {enviando ? <Loader2 size={18} className="chatbot-giro" /> : <Send size={18} />}
            </button>
          </footer>
        </div>
      )}
    </>
  )
}