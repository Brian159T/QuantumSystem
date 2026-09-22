import { useMemo, useState } from 'react'
import { Search, Siren, MapPin, Star, Wrench, Battery, Zap, Disc, CarFront, Check } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useTalleres } from '../../hooks/useDatos'

const ESPECIALIDADES = ['Todos', 'Baterías', 'Electrónica', 'Motor eléctrico', 'Carrocería', 'Neumáticos']

function IconoEspecialidad({ especialidad }: { especialidad: string }) {
  switch (especialidad) {
    case 'Baterías':
      return <Battery size={14} />
    case 'Motor eléctrico':
      return <Zap size={14} />
    case 'Neumáticos':
      return <Disc size={14} />
    case 'Carrocería':
      return <CarFront size={14} />
    default:
      return <Wrench size={14} />
  }
}

export default function PaginaTalleres() {
  const { datos: talleres } = useTalleres()
  const [busqueda, setBusqueda] = useState('')
  const [especialidad, setEspecialidad] = useState('Todos')
  const [soloAbiertos, setSoloAbiertos] = useState(false)

  const filtrados = useMemo(() => {
    return talleres
      .filter((taller) => {
        const coincideBusqueda =
          busqueda.trim().length === 0 ||
          (taller.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
          taller.direccion.toLowerCase().includes(busqueda.toLowerCase())
        const coincideEspecialidad =
          especialidad === 'Todos' || (taller.especialidades ?? []).includes(especialidad)
        const coincideHorario = !soloAbiertos || taller.abiertoAhora
        return coincideBusqueda && coincideEspecialidad && coincideHorario
      })
      .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0))
  }, [talleres, busqueda, especialidad, soloAbiertos])

  return (
    <div>
      <div className="buscador" style={{ marginBottom: 18 }}>
        <div className="buscador__campo">
          <span className="buscador__icono">
            <Search size={16} />
          </span>
          <input
            className="buscador__entrada"
            placeholder="Buscar taller por nombre o dirección..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
      </div>

      <div className="banner-emergencia" style={{ marginBottom: 24 }}>
        <div className="banner-emergencia__contenido">
          <span className="banner-emergencia__icono">
            <Siren size={26} />
          </span>
          <div>
            <div className="banner-emergencia__titulo">¿Tienes una avería o emergencia?</div>
            <div className="banner-emergencia__subtitulo">
              Estamos disponibles para asistirte las 24 horas del día
            </div>
          </div>
        </div>
        <button className="boton boton--claro">
          <Siren size={15} />
          Solicitar ayuda
        </button>
      </div>

      <section className="seccion">
        <EncabezadoSeccion titulo="Especialidad" />
        <div className="fila-filtros" style={{ marginBottom: 14 }}>
          {ESPECIALIDADES.map((filtro) => (
            <button
              key={filtro}
              className={`chip${especialidad === filtro ? ' chip--activo' : ''}`}
              onClick={() => setEspecialidad(filtro)}
            >
              <IconoEspecialidad especialidad={filtro} />
              {filtro}
            </button>
          ))}
        </div>
        <label className="interruptor">
          <span className={`interruptor__caja${soloAbiertos ? ' interruptor__caja--activa' : ''}`}>
            {soloAbiertos && <Check size={13} />}
          </span>
          <input
            type="checkbox"
            checked={soloAbiertos}
            onChange={(evento) => setSoloAbiertos(evento.target.checked)}
            style={{ display: 'none' }}
          />
          Mostrar solo abiertos ahora
        </label>
      </section>

      <section className="seccion">
        <EncabezadoSeccion
          titulo="Talleres autorizados"
          contador={`${filtrados.length} resultados`}
        />
        {filtrados.length === 0 ? (
          <div className="vacio">
            <span className="vacio__icono">
              <Wrench size={24} />
            </span>
            No encontramos talleres con estos filtros
          </div>
        ) : (
          <div className="lista-resultados">
            {filtrados.map((taller) => (
              <div key={taller.id_servicio ?? taller.direccion} className="tarjeta-servicio">
                <div className="tarjeta-servicio__superior">
                  <span
                    className="tarjeta-servicio__icono"
                    style={{ background: 'rgba(129,140,248,0.14)', color: 'var(--morado)' }}
                  >
                    <Wrench size={20} />
                  </span>
                  <div>
                    <div className="tarjeta-servicio__nombre">{taller.nombre}</div>
                    <div className="tarjeta-servicio__direccion">
                      <MapPin size={11} /> {taller.direccion}
                    </div>
                  </div>
                  <div className="tarjeta-servicio__distancia">
                    <div className="tarjeta-servicio__distancia-valor">
                      {taller.distanciaKm?.toFixed(1)}
                    </div>
                    <div className="tarjeta-servicio__distancia-unidad">km</div>
                  </div>
                </div>

                <div className="tarjeta-servicio__fila">
                  {taller.abiertoAhora ? (
                    <span className="insignia insignia--verde">
                      <span className="punto-estado punto-estado--verde" />
                      Abierto ahora
                    </span>
                  ) : (
                    <span className="insignia insignia--rojo">
                      <span className="punto-estado punto-estado--rojo" />
                      Cerrado
                    </span>
                  )}
                  <span className="insignia" style={{ background: 'var(--fondo-claro)', color: 'var(--texto-suave)' }}>
                    {(taller.especialidades ?? []).join(', ')}
                  </span>
                  <span className="insignia insignia--azul">{taller.espera}</span>
                </div>

                <div className="tarjeta-servicio__pie">
                  <span className="tarjeta-servicio__calificacion">
                    <Star size={13} style={{ color: 'var(--naranja)' }} />
                    {taller.rating?.toFixed(1)} · {taller.telefono}
                  </span>
                  <button className="boton boton--azul boton--compacto">
                    <MapPin size={14} />
                    Ver ruta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}