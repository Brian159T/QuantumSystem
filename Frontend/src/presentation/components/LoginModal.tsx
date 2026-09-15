import { useState } from 'react'
import { X, ShieldCheck, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface LoginModalProps {
  visible: boolean
  onCerrar: () => void
}

type Pantalla = 'login' | 'registro'

export default function LoginModal({ visible, onCerrar }: LoginModalProps) {
  const { iniciarSesion, registrar, cargandoLogin, cargandoRegistro, errorLogin, errorRegistro } =
    useAuth()

  const [pantalla, setPantalla] = useState<Pantalla>('login')

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')

  const [nombreRegistro, setNombreRegistro] = useState('')
  const [correoRegistro, setCorreoRegistro] = useState('')
  const [contrasenaRegistro, setContrasenaRegistro] = useState('')
  const [confirmacionRegistro, setConfirmacionRegistro] = useState('')
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null)

  if (!visible) return null

  const manejarLogin = async () => {
    const correcto = await iniciarSesion({ correo, contrasena })
    if (correcto) cerrar()
  }

  const manejarRegistro = async () => {
    setErrorConfirmacion(null)
    if (contrasenaRegistro !== confirmacionRegistro) {
      setErrorConfirmacion('Las contraseñas no coinciden')
      return
    }
    const correcto = await registrar({
      nombre_usuario: nombreRegistro,
      correo: correoRegistro,
      contrasena: contrasenaRegistro,
    })
    if (correcto) cerrar()
  }

  const cerrar = () => {
    onCerrar()
    setPantalla('login')
    setErrorConfirmacion(null)
  }

  return (
    <div className="fondo-modal" onClick={cerrar}>
      <div className="modal" onClick={(evento) => evento.stopPropagation()}>
        <div className="modal__encabezado">
          <div className="modal__titulo">
            {pantalla === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </div>
          <button className="boton boton--icono" onClick={cerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="modal__cuerpo">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: 22,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 18,
                background: 'var(--verde-suave)',
                color: 'var(--verde)',
                marginBottom: 12,
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--texto-principal)' }}>
              {pantalla === 'login' ? 'Bienvenido de nuevo' : 'Únete a Voltus'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--texto-suave)', marginTop: 4 }}>
              {pantalla === 'login'
                ? 'Ingresa tus datos para continuar'
                : 'Completa el formulario para registrarte'}
            </div>
          </div>

          {pantalla === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <label className="campo__etiqueta">Correo electrónico</label>
                <input
                  className="campo__entrada"
                  type="email"
                  placeholder="tu@correo.com"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Contraseña</label>
                <input
                  className="campo__entrada"
                  type="password"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                />
              </div>

              {errorLogin && <div className="alerta alerta--error">{errorLogin}</div>}

              <button
                className="boton boton--primario boton--completo"
                onClick={manejarLogin}
                disabled={cargandoLogin}
              >
                <LogIn size={16} />
                {cargandoLogin ? 'Ingresando...' : 'Iniciar sesión'}
              </button>

              <button
                className="boton boton--borde-verde boton--completo"
                onClick={() => setPantalla('registro')}
              >
                <UserPlus size={16} />
                ¿No tienes cuenta? Crear una cuenta
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <label className="campo__etiqueta">Nombre completo</label>
                <input
                  className="campo__entrada"
                  placeholder="Ej. Juan Pérez Mamani"
                  value={nombreRegistro}
                  onChange={(evento) => setNombreRegistro(evento.target.value)}
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Correo electrónico</label>
                <input
                  className="campo__entrada"
                  type="email"
                  placeholder="tu@correo.com"
                  value={correoRegistro}
                  onChange={(evento) => setCorreoRegistro(evento.target.value)}
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Contraseña</label>
                <input
                  className="campo__entrada"
                  type="password"
                  placeholder="••••••••"
                  value={contrasenaRegistro}
                  onChange={(evento) => setContrasenaRegistro(evento.target.value)}
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Confirmar contraseña</label>
                <input
                  className="campo__entrada"
                  type="password"
                  placeholder="••••••••"
                  value={confirmacionRegistro}
                  onChange={(evento) => setConfirmacionRegistro(evento.target.value)}
                />
              </div>

              {(errorConfirmacion || errorRegistro) && (
                <div className="alerta alerta--error">{errorConfirmacion ?? errorRegistro}</div>
              )}

              <button
                className="boton boton--primario boton--completo"
                onClick={manejarRegistro}
                disabled={cargandoRegistro}
              >
                <UserPlus size={16} />
                {cargandoRegistro ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <button
                className="boton boton--borde-verde boton--completo"
                onClick={() => setPantalla('login')}
              >
                Volver a iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}