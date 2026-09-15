import { useEffect, useState } from 'react'
import { Car, CreditCard, CheckCircle2, QrCode, X, Palette } from 'lucide-react'
import { catalogoUseCase } from '../../../data'
import type { Vehiculo } from '../../../domain/modelos/Vehiculo'

interface PaginaReservasProps {
  vehiculoInicial: Vehiculo | null
}

interface FormularioReserva {
  nombre: string
  ci: string
  modelo: Vehiculo | null
  color: { nombre: string; hex: string } | null
}

export default function PaginaReservas({ vehiculoInicial }: PaginaReservasProps) {
  const [modelos, setModelos] = useState<Vehiculo[]>([])
  const [formulario, setFormulario] = useState<FormularioReserva>({
    nombre: '',
    ci: '',
    modelo: null,
    color: null,
  })
  const [modalConfirmacion, setModalConfirmacion] = useState(false)
  const [modalExito, setModalExito] = useState(false)
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('')

  useEffect(() => {
    catalogoUseCase.obtenerCatalogo().then((datos) => {
      setModelos(datos)
      if (vehiculoInicial) {
        setFormulario((previo) => ({
          ...previo,
          modelo: vehiculoInicial,
          color: vehiculoInicial.colores?.[0] ?? null,
        }))
      }
    })
  }, [vehiculoInicial])

  const formularioValido =
    formulario.nombre && formulario.ci && formulario.modelo && formulario.color

  const confirmarReserva = () => {
    const codigo = `VT-${Math.floor(1000 + Math.random() * 9000)}-ABC`
    setCodigoConfirmacion(codigo)
    setModalConfirmacion(false)
    setModalExito(true)
  }

  const cerrarExito = () => {
    setModalExito(false)
    setFormulario({ nombre: '', ci: '', modelo: null, color: null })
  }

  return (
    <div>
      <div className="banner" style={{ marginBottom: 26, padding: '28px 32px' }}>
        <div className="banner__lienzo" />
        <div className="banner__contenido">
          <div className="banner__ceja">Reserva ahora</div>
          <div className="banner__titulo">Maneja el futuro</div>
          <div className="banner__subtitulo">Garantiza tu lugar con solo $1,000 USD</div>
        </div>
        <div className="banner__icono">
          <Car size={44} />
        </div>
      </div>

      <div className="formulario-reserva">
        <div className="formulario-reserva__columna">
          <div className="tarjeta">
            <div className="tarjeta__titulo" style={{ marginBottom: 18 }}>
              Datos personales
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="campo">
                <label className="campo__etiqueta">Nombre completo</label>
                <input
                  className="campo__entrada"
                  placeholder="Ej. Juan Pérez Mamani"
                  value={formulario.nombre}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, nombre: evento.target.value })
                  }
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Cédula de Identidad</label>
                <input
                  className="campo__entrada"
                  placeholder="Ej. 12345678"
                  value={formulario.ci}
                  onChange={(evento) => setFormulario({ ...formulario, ci: evento.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="tarjeta">
            <div className="tarjeta__titulo" style={{ marginBottom: 16 }}>
              Selecciona tu modelo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {modelos.map((modelo) => {
                const seleccionado = formulario.modelo?.id_vehiculo === modelo.id_vehiculo
                return (
                  <button
                    key={modelo.id_vehiculo ?? modelo.Nombre_Modelo}
                    className={`opcion-modelo${seleccionado ? ' opcion-modelo--seleccionado' : ''}`}
                    onClick={() =>
                      setFormulario({
                        ...formulario,
                        modelo,
                        color: modelo.colores?.[0] ?? null,
                      })
                    }
                  >
                    <span className="opcion-modelo__icono">
                      <Car size={20} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span className="opcion-modelo__nombre">{modelo.Nombre_Modelo}</span>
                      <br />
                      <span className="opcion-modelo__precio">
                        Base {modelo.precio ?? 'Consultar'} · Total <strong>{modelo.precio}</strong>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="formulario-reserva__columna">
          <div className="tarjeta">
            <div className="tarjeta__titulo" style={{ marginBottom: 16 }}>
              Elige tu color
            </div>
            {formulario.modelo?.colores ? (
              <div className="rejilla-colores">
                {formulario.modelo.colores.map((color) => {
                  const seleccionado = formulario.color?.hex === color.hex
                  return (
                    <button
                      key={color.nombre}
                      className={`opcion-color${seleccionado ? ' opcion-color--seleccionado' : ''}`}
                      onClick={() => setFormulario({ ...formulario, color })}
                    >
                      <span className="opcion-color__circulo" style={{ backgroundColor: color.hex }} />
                      <span className="opcion-color__nombre">{color.nombre}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="vacio">
                <span className="vacio__icono">
                  <Palette size={24} />
                </span>
                Primero selecciona un modelo
              </div>
            )}
          </div>

          <div className="fila-precio-reserva">
            <span className="fila-precio-reserva__etiqueta">Precio de reserva</span>
            <span className="fila-precio-reserva__valor">$1,000 USD</span>
          </div>

          <button
            className="boton boton--primario boton--completo"
            style={{ padding: '16px' }}
            disabled={!formularioValido}
            onClick={() => setModalConfirmacion(true)}
          >
            <CreditCard size={18} />
            Confirmar y pagar reserva
          </button>
          {!formularioValido && (
            <p style={{ fontSize: 12, color: 'var(--texto-suave)', textAlign: 'center' }}>
              Completa todos los campos para continuar
            </p>
          )}
        </div>
      </div>

      {modalConfirmacion && formulario.modelo && formulario.color && (
        <div className="fondo-modal">
          <div className="modal">
            <div className="modal__encabezado">
              <div className="modal__titulo">Confirmar reserva</div>
              <button className="boton boton--icono" onClick={() => setModalConfirmacion(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal__cuerpo" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 'var(--radio-suave)',
                  background: 'var(--fondo-claro)',
                }}
              >
                <span className="opcion-modelo__icono">
                  <Car size={20} />
                </span>
                <div>
                  <div style={{ fontWeight: 700 }}>{formulario.modelo.Nombre_Modelo}</div>
                  <div style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                    {formulario.color.nombre}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="campo__etiqueta">Nombre completo</span>
                <span>{formulario.nombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="campo__etiqueta">Cédula</span>
                <span>{formulario.ci}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="campo__etiqueta">Total a pagar</span>
                <strong style={{ color: 'var(--verde)' }}>$1,000 USD</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 18,
                  border: '1.5px dashed var(--borde-claro)',
                  borderRadius: 'var(--radio-suave)',
                  color: 'var(--texto-suave)',
                }}
              >
                <QrCode size={56} style={{ color: 'var(--texto-principal)' }} />
                <span style={{ fontSize: 12 }}>Código QR de pago · se añadirá próximamente</span>
              </div>
            </div>
            <div className="modal__pie">
              <button className="boton boton--claro" onClick={() => setModalConfirmacion(false)}>
                Cancelar
              </button>
              <button className="boton boton--primario" onClick={confirmarReserva}>
                Efectuar pago y confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalExito && (
        <div className="fondo-modal">
          <div className="modal">
            <div className="modal__cuerpo" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: '0 auto 16px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: 'var(--verde-suave)',
                  color: 'var(--verde)',
                }}
              >
                <CheckCircle2 size={38} />
              </div>
              <div className="modal__titulo">¡Reserva exitosa!</div>
              <p style={{ fontSize: 13, color: 'var(--texto-suave)', margin: '8px 0 20px' }}>
                Confirmación: <strong style={{ color: 'var(--verde)' }}>{codigoConfirmacion}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="campo__etiqueta">Vehículo</span>
                  <span>{formulario.modelo?.Nombre_Modelo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="campo__etiqueta">Color</span>
                  <span>{formulario.color?.nombre}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="campo__etiqueta">Costo reserva</span>
                  <strong style={{ color: 'var(--verde)' }}>$1,000 USD</strong>
                </div>
              </div>
              <button className="boton boton--primario boton--completo" onClick={cerrarExito}>
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}