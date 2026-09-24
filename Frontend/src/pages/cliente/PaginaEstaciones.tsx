import { useMemo, useState } from 'react'
import { Search, Crosshair, MapPinned, Zap, Plug, Car, Layers, Star, MapPin, Check } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useEstaciones } from '../../hooks/useDatos'
import type { VelocidadCarga } from '../../types/EstacionesYTalleres'

type FiltroConector = 'Todos' | 'CCS' | 'CHAdeMO' | 'Tipo 2' | 'Tesla'

const FILTROS: { clave: FiltroConector; etiqueta: string }[] = [
  { clave: 'Todos', etiqueta: 'Todos' },
  { clave: 'CCS', etiqueta: 'CCS' },
  { clave: 'CHAdeMO', etiqueta: 'CHAdeMO' },
  { clave: 'Tipo 2', etiqueta: 'Tipo 2' },
  { clave: 'Tesla', etiqueta: 'Tesla' },
]

function colorVelocidad(velocidad: VelocidadCarga | undefined): string {
  if (velocidad === 'Ultra rápida') return 'var(--verde)'
  if (velocidad === 'Rápida') return 'var(--azul)'
  return 'var(--naranja)'
}

export default function PaginaEstaciones() {
  const { datos: estaciones } = useEstaciones()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroConector>('Todos')
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const filtradas = useMemo(() => {
    return estaciones
      .filter((estacion) => {
        const coincideBusqueda =
          busqueda.trim().length === 0 ||
          (estacion.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
          estacion.direccion.toLowerCase().includes(busqueda.toLowerCase())
        const coincideFiltro =
          filtro === 'Todos' || (estacion.conectores ?? []).includes(filtro)
        const coincideDisponibilidad = !soloDisponibles || (estacion.disponibles ?? 0) > 0
        return coincideBusqueda && coincideFiltro && coincideDisponibilidad
      })
      .sort((a, b) => (a.distanciaKm ?? 0) - (b.distanciaKm ?? 0))
  }, [estaciones, busqueda, filtro, soloDisponibles])

  const totalDisponibles = estaciones.reduce((acumulador, estacion) => acumulador + (estacion.disponibles ?? 0), 0)
  const totalPuertos = estaciones.reduce((acumulador, estacion) => acumulador + (estacion.totales ?? 0), 0)
  const operativas = estaciones.filter((estacion) => estacion.Estado === 'disponible').length

  return (
    <div>
      <div className="buscador" style={{ marginBottom: 20 }}>
        <div className="buscador__campo">
          <span className="buscador__icono">
            <Search size={16} />
          </span>
          <input
            className="buscador__entrada"
            placeholder="Buscar por nombre o dirección..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
        <button className="boton boton--azul" title="Usar mi ubicación">
          <Crosshair size={16} />
        </button>
      </div>

      <div className="mapa-lugar" style={{ marginBottom: 22 }}>
        <MapPinned size={32} style={{ color: 'var(--verde)' }} />
        <div>
          <strong style={{ color: 'var(--texto-principal)' }}>Mapa interactivo</strong>
          <div>Aquí se mostrará la ruta más corta a la estación seleccionada</div>
        </div>
      </div>

      <div className="fila-estadisticas">
        <div className="tarjeta-estadistica">
          <div className="tarjeta-estadistica__icono">
            <Zap size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">{estaciones.length}</div>
            <div className="tarjeta-estadistica__etiqueta">Estaciones cerca</div>
          </div>
        </div>
        <div className="tarjeta-estadistica">
          <div className="tarjeta-estadistica__icono">
            <Plug size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">
              {totalDisponibles}/{totalPuertos}
            </div>
            <div className="tarjeta-estadistica__etiqueta">Puntos libres</div>
          </div>
        </div>
        <div className="tarjeta-estadistica">
          <div className="tarjeta-estadistica__icono">
            <Check size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">{operativas}</div>
            <div className="tarjeta-estadistica__etiqueta">Operativas</div>
          </div>
        </div>
      </div>

      <section className="seccion">
        <EncabezadoSeccion titulo="Tipo de conector" />
        <div className="fila-filtros" style={{ marginBottom: 14 }}>
          {FILTROS.map((filtroItem) => (
            <button
              key={filtroItem.clave}
              className={`chip${filtro === filtroItem.clave ? ' chip--activo' : ''}`}
              onClick={() => setFiltro(filtroItem.clave)}
            >
              <IconoConector tipo={filtroItem.clave} />
              {filtroItem.etiqueta}
            </button>
          ))}
        </div>
        <label className="interruptor">
          <span className={`interruptor__caja${soloDisponibles ? ' interruptor__caja--activa' : ''}`}>
            {soloDisponibles && <Check size={13} />}
          </span>
          <input
            type="checkbox"
            checked={soloDisponibles}
            onChange={(evento) => setSoloDisponibles(evento.target.checked)}
            style={{ display: 'none' }}
          />
          Mostrar solo disponibles ahora
        </label>
      </section>

      <section className="seccion">
        <EncabezadoSeccion
          titulo="Estaciones cercanas"
          contador={`${filtradas.length} resultados`}
        />
        {filtradas.length === 0 ? (
          <div className="vacio">
            <span className="vacio__icono">
              <Zap size={24} />
            </span>
            No encontramos estaciones con estos filtros
          </div>
        ) : (
          <div className="lista-resultados">
            {filtradas.map((estacion) => {
              const llena = (estacion.disponibles ?? 0) === 0
              return (
                <div key={estacion.id_estacion ?? estacion.direccion} className="tarjeta-servicio">
                  <div className="tarjeta-servicio__superior">
                    <span
                      className="tarjeta-servicio__icono"
                      style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}
                    >
                      <Zap size={20} />
                    </span>
                    <div>
                      <div className="tarjeta-servicio__nombre">{estacion.nombre}</div>
                      <div className="tarjeta-servicio__direccion">
                        <MapPin size={11} /> {estacion.direccion}
                      </div>
                    </div>
                    <div className="tarjeta-servicio__distancia">
                      <div className="tarjeta-servicio__distancia-valor">
                        {estacion.distanciaKm?.toFixed(1)}
                      </div>
                      <div className="tarjeta-servicio__distancia-unidad">km</div>
                    </div>
                  </div>

                  <div className="tarjeta-servicio__fila">
                    {llena ? (
                      <span className="insignia insignia--rojo">Sin disponibilidad</span>
                    ) : (
                      <span className="insignia insignia--verde">
                        {estacion.disponibles ?? '—'}/{estacion.totales ?? '—'} disponibles
                      </span>
                    )}
                    {estacion.velocidad && (
                      <span
                        className="insignia"
                        style={{
                          background: `${colorVelocidad(estacion.velocidad)}18`,
                          color: colorVelocidad(estacion.velocidad),
                        }}
                      >
                        {estacion.velocidad}
                      </span>
                    )}
                    {estacion.abierto24h && <span className="insignia insignia--azul">24h</span>}
                  </div>

                  <div className="tarjeta-servicio__fila">
                    {(estacion.conectores ?? []).map((conector) => (
                      <span key={conector} className="chip" style={{ padding: '5px 12px', fontSize: 12 }}>
                        {conector}
                      </span>
                    ))}
                  </div>

                  <div className="tarjeta-servicio__pie">
                    <span className="tarjeta-servicio__calificacion">
                      <Star size={13} style={{ color: 'var(--naranja)' }} />
                      {estacion.rating?.toFixed(1) ?? '—'}
                      {estacion.precioPorKwh ? ` · ${estacion.precioPorKwh} / kWh` : ''}
                    </span>
                    <button className="boton boton--primario boton--compacto">
                      <MapPin size={14} />
                      Ver ruta
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function IconoConector({ tipo }: { tipo: FiltroConector }) {
  switch (tipo) {
    case 'Todos':
      return <Layers size={15} />
    case 'Tesla':
      return <Car size={15} />
    default:
      return <Plug size={15} />
  }
}