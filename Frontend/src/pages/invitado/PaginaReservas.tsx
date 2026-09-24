import { useState } from 'react'
import { Car, CalendarCheck, CheckCircle2, X, Palette } from 'lucide-react'
import { useVehiculos } from '../../hooks/useDatos'
import { crearReserva, resolverIdColor } from '../../services/reservasService'
import type { ColorVehiculo, Vehiculo } from '../../types/Vehiculo'

interface PaginaReservasProps {
  vehiculoInicial: Vehiculo | null
}

interface FormularioReserva {
  nombres: string
  apellidos: string
  ci: string
  modelo: Vehiculo | null
  color: ColorVehiculo | null
}

export default function PaginaReservas({ vehiculoInicial }: PaginaReservasProps) {
  const { datos: modelos } = useVehiculos()
  const [formulario, setFormulario] = useState<FormularioReserva>({
    nombres: '',
    apellidos: '',
    ci: '',
    modelo: vehiculoInicial,
    color: vehiculoInicial?.colores?.[0] ?? null,
  })
  const [modalConfirmacion, setModalConfirmacion] = useState(false)
  const [modalExito, setModalExito] = useState(false)
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('')
  const [cargandoReserva, setCargandoReserva] = useState(false)
  const [errorReserva, setErrorReserva] = useState('')

  const formularioValido =
    formulario.nombres.trim() &&
    formulario.apellidos.trim() &&
    formulario.ci.trim() &&
    formulario.modelo &&
    formulario.color

  const confirmarReserva = async () => {
    if (!formulario.modelo || !formulario.color) return
    setCargandoReserva(true)
    setErrorReserva('')
    try {
      const idColor = await resolverIdColor(formulario.color, formulario.modelo)
      await crearReserva({
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        cedula_identidad: formulario.ci.trim(),
        modelo: formulario.modelo.Nombre_Modelo,
        color: idColor,
      })
      const codigo = `VT-${Math.floor(1000 + Math.random() * 9000)}-ABC`
      setCodigoConfirmacion(codigo)
      setModalConfirmacion(false)
      setModalExito(true)
    } catch (error) {
      setErrorReserva(error instanceof Error ? error.message : 'No se pudo guardar la reserva')
    } finally {
      setCargandoReserva(false)
    }
  }

  const cerrarExito = () => {
    setModalExito(false)
    setFormulario({ nombres: '', apellidos: '', ci: '', modelo: null, color: null })
  }

  return (
    <div className="pagina-reservas">
      <div className="banner" style={{ marginBottom: 26, padding: '28px 32px' }}>
        <div className="banner__lienzo" />
        <div className="banner__contenido">
          <div className="banner__ceja">Reserva ahora</div>
          <div className="banner__titulo">Maneja el futuro</div>
          <div className="banner__subtitulo">Reserva tu modelo hoy, sin pago inicial</div>
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
                <label className="campo__etiqueta">Nombres</label>
                <input
                  className="campo__entrada"
                  placeholder="Ej. Juan Pérez"
                  value={formulario.nombres}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, nombres: evento.target.value })
                  }
                />
              </div>
              <div className="campo">
                <label className="campo__etiqueta">Apellidos</label>
                <input
                  className="campo__entrada"
                  placeholder="Ej. Mamani Flores"
                  value={formulario.apellidos}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, apellidos: evento.target.value })
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
                        Base {modelo.precio ?? 'Consultar'}
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
            {!formulario.modelo ? (
              <div className="vacio">
                <span className="vacio__icono">
                  <Palette size={24} />
                </span>
                Primero selecciona un modelo
              </div>
            ) : formulario.modelo.colores?.length === 0 ? (
              <div className="vacio">
                <span className="vacio__icono">
                  <Palette size={24} />
                </span>
                Este modelo aún no tiene colores disponibles
              </div>
            ) : (
              <div className="rejilla-colores">
                {formulario.modelo.colores?.map((color) => {
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
            )}
          </div>

          {errorReserva && <div className="alerta alerta--error">{errorReserva}</div>}

          <button
            className="boton boton--primario boton--completo"
            style={{ padding: '16px' }}
            disabled={!formularioValido}
            onClick={() => setModalConfirmacion(true)}
          >
            <CalendarCheck size={18} />
            Confirmar reserva
          </button>
          {!formularioValido && (
            <p style={{ fontSize: 12, color: 'var(--texto-pagina-suave)', textAlign: 'center' }}>
              Completa todos los campos para continuar
            </p>
          )}
          <p style={{ fontSize: 12, color: 'var(--texto-pagina-suave)', textAlign: 'center' }}>
            Reservar no tiene costo: tu lugar queda protegido hasta que decidas tu plan de pago.
          </p>
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
                <span className="campo__etiqueta">Nombres</span>
                <span>{formulario.nombres}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="campo__etiqueta">Apellidos</span>
                <span>{formulario.apellidos}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="campo__etiqueta">Cédula</span>
                <span>{formulario.ci}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--texto-suave)', textAlign: 'center' }}>
                Reserva sin costo, reembolsable y sin compromiso de compra.
              </p>
            </div>
            <div className="modal__pie">
              <button
                className="boton boton--claro"
                disabled={cargandoReserva}
                onClick={() => setModalConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                className="boton boton--primario"
                disabled={cargandoReserva}
                onClick={confirmarReserva}
              >
                {cargandoReserva ? 'Guardando...' : 'Confirmar reserva'}
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
                  <span className="campo__etiqueta">Costo de reserva</span>
                  <strong style={{ color: 'var(--verde)' }}>Sin costo</strong>
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