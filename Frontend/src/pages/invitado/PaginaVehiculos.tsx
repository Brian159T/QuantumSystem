import MedioVisual from '../../components/MedioVisual'
import { MULTIMEDIA } from '../../config/multimedia'
import { useState } from 'react'
import { ArrowLeft, BatteryCharging, Gauge, PlugZap, Users, CarFront, Palette, CalendarCheck } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useVehiculos } from '../../hooks/useDatos'
import type { Vehiculo } from '../../types/Vehiculo'

interface PaginaVehiculosProps {
  alReservar: (vehiculo: Vehiculo) => void
}

export default function PaginaVehiculos({ alReservar }: PaginaVehiculosProps) {
  const { datos: modelos, cargando } = useVehiculos()
  const [seleccionado, setSeleccionado] = useState<Vehiculo | null>(null)
  const [colorPorModelo, setColorPorModelo] = useState<Record<string, number>>({})

  if (seleccionado) {
    const indiceColor = colorPorModelo[seleccionado.id_vehiculo ?? seleccionado.Nombre_Modelo] ?? 0
    const colorActivo = seleccionado.colores?.[indiceColor]

    const especificaciones = [
      { icono: BatteryCharging, etiqueta: 'Autonomía', valor: seleccionado.Autonomia, color: 'var(--verde)' },
      { icono: Gauge, etiqueta: 'Vel. máx.', valor: seleccionado.Velocidad_Maxima, color: 'var(--naranja)' },
      { icono: PlugZap, etiqueta: 'Carga rápida', valor: seleccionado.Carga_Rapida, color: 'var(--azul)' },
      { icono: Users, etiqueta: 'Asientos', valor: `${seleccionado.Nro_Asientos} pas.`, color: 'var(--azul)' },
      { icono: CarFront, etiqueta: 'Tracción', valor: seleccionado.Traccion, color: 'var(--morado)' },
    ]

    return (
      <div className="detalle-editorial">
        <div className="detalle-vehiculo__encabezado">
          <div>
            <h2 className="titulo-seccion">{seleccionado.Nombre_Modelo}</h2>
            <div style={{ color: 'var(--texto-pagina-suave)', fontSize: 13 }}>{seleccionado.Tipo}</div>
          </div>
          <button className="boton boton--claro" onClick={() => setSeleccionado(null)}>
            <ArrowLeft size={16} />
            Volver al catálogo
          </button>
        </div>

        <MedioVisual key={seleccionado.id_vehiculo ?? seleccionado.Nombre_Modelo} imagen={seleccionado.imagen} descripcion={seleccionado.Nombre_Modelo} />

        <div className="tarjeta" style={{ marginBottom: 20 }}>
          <div className="tarjeta__encabezado">
            <div>
              <div className="tarjeta__titulo">Colores disponibles</div>
              <div className="tarjeta__subtitulo">
                {colorActivo?.nombre ??
                  (seleccionado.colores?.length ? 'Selecciona un color' : 'Sin colores disponibles')}
              </div>
            </div>
            <Palette size={22} style={{ color: 'var(--verde)' }} />
          </div>
          {seleccionado.colores?.length ? (
            <div className="swatches">
              {seleccionado.colores.map((color, indice) => (
                <button
                  aria-label={color.nombre}
                  aria-pressed={indice === indiceColor}
                  key={color.nombre}
                  title={color.nombre}
                  className={`swatch${indice === indiceColor ? ' swatch--seleccionado' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() =>
                    setColorPorModelo((previo) => ({
                      ...previo,
                      [seleccionado.id_vehiculo ?? seleccionado.Nombre_Modelo]: indice,
                    }))
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="ficha-tecnica">
          {especificaciones.map((especificacion) => (
            <div key={especificacion.etiqueta} className="ficha-tecnica__item">
              <div
                className="ficha-tecnica__icono"
                style={{ background: 'var(--fondo-claro)', color: especificacion.color }}
              >
                <especificacion.icono size={20} />
              </div>
              <div>
                <div className="ficha-tecnica__etiqueta">{especificacion.etiqueta}</div>
                <div className="ficha-tecnica__valor">{especificacion.valor}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="precio-cta">
          <div>
            <div className="tarjeta__subtitulo">Precio base</div>
            <div className="precio-cta__valor">
              {seleccionado.precio ?? 'Consultar'}
              {seleccionado.precioOriginal && (
                <span className="precio-cta__original">{seleccionado.precioOriginal}</span>
              )}
            </div>
          </div>
          <button className="boton boton--primario" onClick={() => alReservar(seleccionado)}>
            <CalendarCheck size={16} />
            Reservar este modelo
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--texto-pagina-suave)', marginTop: 10, textAlign: 'center' }}>
          Reservar tu modelo no tiene costo
        </p>
      </div>
    )
  }

  return (
    <div className="pagina-vehiculos editorial">
      <section className="editorial__hero">
        <p className="editorial__ceja">LA FAMILIA QUANTUM</p>
        <h1>Eléctrico. Extraordinario.</h1>
        <p className="editorial__subtitulo">Un modelo para cada forma de moverte.</p>
        <a className="boton boton--primario" href="#catalogo">Explorar el catálogo</a>
        <MedioVisual video={MULTIMEDIA.videoVehiculos} imagen={MULTIMEDIA.portadaVideo} descripcion="Quantum en movimiento" />
      </section>
      <section className="editorial__seccion" id="catalogo">
      <EncabezadoSeccion titulo="Catálogo de Vehículos" contador={`${modelos.length} modelos`} />
      <div className="rejilla-vehiculos">
        {modelos.map((modelo, indice) => (
          <button
            key={modelo.id_vehiculo ?? modelo.Nombre_Modelo}
            className="tarjeta-vehiculo"
            onClick={() => setSeleccionado(modelo)}
          >
            <span className="tarjeta-vehiculo__indice">{indice + 1}.</span>
            <div className="tarjeta-vehiculo__info">
              <div className="tarjeta-vehiculo__fila-nombre">
                <span className="tarjeta-vehiculo__nombre">{modelo.Nombre_Modelo}</span>
                {modelo.etiqueta && (
                  <span className="insignia insignia--verde">{modelo.etiqueta}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--texto-suave)' }}>{modelo.Tipo}</div>
              <div className="tarjeta-vehiculo__especificacion">
                <BatteryCharging size={12} style={{ color: 'var(--verde)' }} />
                {modelo.Autonomia}
              </div>
              <div className="tarjeta-vehiculo__especificacion">
                <PlugZap size={12} style={{ color: 'var(--azul)' }} />
                {modelo.Carga_Rapida}
              </div>
              {modelo.colores && (
                <div className="swatches">
                  {modelo.colores.slice(0, 4).map((color) => (
                    <span key={color.nombre} className="swatch" style={{ backgroundColor: color.hex }} />
                  ))}
                </div>
              )}
              <div className="tarjeta-vehiculo__precio">
                {modelo.precio ?? 'Consultar'} USD
              </div>
            </div>
            <MedioVisual imagen={modelo.imagen} descripcion={modelo.Nombre_Modelo} />
          </button>
        ))}
      </div>
      {!modelos.length && <p className="editorial__estado" role="status">{cargando ? 'Cargando modelos…' : 'No hay modelos disponibles en este momento.'}</p>}
      </section>
    </div>
  )
}