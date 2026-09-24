import { useState } from 'react'
import { Bot, MessageCircle, Send, X } from 'lucide-react'

interface Mensaje {
  id: string
  remitente: 'usuario' | 'asistente'
  texto: string
  hora: string
}

const MENSAJE_INICIAL: Mensaje = {
  id: '0',
  remitente: 'asistente',
  texto: '¡Hola! Soy el asistente de Quantum. ¿En qué puedo ayudarte?',
  hora: '',
}

const horaActual = () =>
  new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

export default function Chatbot() {
  const [visible, setVisible] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL])
  const [texto, setTexto] = useState('')

  const enviar = () => {
    const contenido = texto.trim()
    if (!contenido) return
    setMensajes((prev) => [
      ...prev,
      { id: String(Date.now()), remitente: 'usuario', texto: contenido, hora: horaActual() },
    ])
    setTexto('')
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
                <span className="chatbot-panel__punto" />
                En línea
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
            {mensajes.map((mensaje) => {
              const esUsuario = mensaje.remitente === 'usuario'
              return (
                <div
                  key={mensaje.id}
                  className={esUsuario ? 'chatbot-burbuja chatbot-burbuja--usuario' : 'chatbot-burbuja'}
                >
                  <p>{mensaje.texto}</p>
                  {mensaje.hora && <time>{mensaje.hora}</time>}
                </div>
              )
            })}
          </div>

          <footer className="chatbot-panel__input">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') enviar()
              }}
            />
            <button
              className="chatbot-panel__enviar"
              onClick={enviar}
              disabled={!texto.trim()}
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </footer>
        </div>
      )}
    </>
  )
}