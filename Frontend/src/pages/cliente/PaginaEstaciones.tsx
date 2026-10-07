import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Search,
  Crosshair,
  Zap,
  Plug,
  Car,
  Layers,
  Star,
  MapPin,
  Check,
  Navigation,
  Route,
  Timer,
} from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import MapaLugar, { type LugarEnMapa } from '../../components/MapaLugar'
import { useEstaciones } from '../../hooks/useDatos'
import { useUbicacion } from '../../hooks/useUbicacion'
import { useRuta } from '../../hooks/useRuta'
import {
  calcularDistanciaKm,
  formatearDistancia,
  formatearMinutos,
  type Coordenada,
} from '../../utils/geo'
import type { EstacionCarga, VelocidadCarga } from '../../types/EstacionesYTalleres'

type FiltroConector = 'Todos' | 'CCS' | 'CHAdeMO' | 'Tipo 2' | 'Tesla'

const FILTROS: { clave: FiltroConector; etiqueta: string }[] = [
  { clave: 'Todos', etiqueta: 'Todos' },
  { clave: 'CCS', etiqueta: 'CCS' },
  { clave: 'CHAdeMO', etiqueta: 'CHAdeMO' },
  { clave: 'Tipo 2', etiqueta: 'Tipo 2' },
  { clave: 'Tesla', etiqueta: 'Tesla' },
]

const COLOR_ESTACION = '#16a34a'

function colorVelocidad(velocidad: VelocidadCarga | undefined): string {
  if (velocidad === 'Ultra rápida') return 'var(--verde)'
  if (velocidad === 'Rápida') return 'var(--azul)'
  return 'var(--naranja)'
}

function coordenadasValidas(item: { latitud?: number; longitud?: number }): boolean {
  return (
    typeof item.latitud !== 'undefined' &&
    typeof item.longitud !== 'undefined' &&
    !isNaN(Number(item.latitud)) &&
    !isNaN(Number(item.longitud))
  )
}

function punto(estacion: EstacionCarga): Coordenada | null {
  if (!coordenadasValidas(estacion)) return null
  return { latitud: Number(estacion.latitud), longitud: Number(estacion.longitud) }
}

function aEstacionLugar(estacion: EstacionCarga): LugarEnMapa | null {
  const coordenadas = punto(estacion)
  if (!coordenadas) return null
  return {
    id: estacion.id_estacion ?? estacion.direccion,
    nombre: estacion.nombre ?? 'Estación de carga',
    direccion: estacion.direccion,
    latitud: coordenadas.latitud,
    longitud: coordenadas.longitud,
    icono: <Zap size={15} />,
    color: COLOR_ESTACION,
  }
}

export default function PaginaEstaciones() {
  const { datos: estaciones } = useEstaciones()
  const { ubicacion, cargando: cargandoUbicacion, error: errorUbicacion, solicitar } = useUbicacion()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroConector>('Todos')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [seleccionada, setSeleccionada] = useState<LugarEnMapa | null>(null)
  const seccionMapaRef = useRef<HTMLElement | null>(null)

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
      .sort((a, b) => {
        const dA = ubicacion && punto(a) ? calcularDistanciaKm(ubicacion, punto(a)!) : (a.distanciaKm ?? Infinity)
        const dB = ubicacion && punto(b) ? calcularDistanciaKm(ubicacion, punto(b)!) : (b.distanciaKm ?? Infinity)
        return dA - dB
      })
  }, [estaciones, busqueda, filtro, soloDisponibles, ubicacion])

  const lugares = useMemo(
    () =>
      filtradas
        .map(aEstacionLugar)
        .filter((lugar): lugar is LugarEnMapa => lugar !== null),
    [filtradas]
  )

  const masCercana = useMemo<LugarEnMapa | null>(() => {
    if (!ubicacion || lugares.length === 0) return null
    let menor: LugarEnMapa | null = null
    let distanciaMenor = Infinity
    lugares.forEach((lugar) => {
      const distancia = calcularDistanciaKm(ubicacion, lugar)
      if (distancia < distanciaMenor) {
        distanciaMenor = distancia
        menor = lugar
      }
    })
    return menor
  }, [ubicacion, lugares])

  const alSeleccionar = useCallback((lugar: LugarEnMapa) => {
    setSeleccionada(lugar)
  }, [])

  const destino = seleccionada ?? masCercana
  const destinoCoordenada = destino
    ? { latitud: destino.latitud, longitud: destino.longitud }
    : null
  const { ruta, cargando: cargandoRuta } = useRuta(ubicacion, destinoCoordenada)

  const verRuta = (estacion: EstacionCarga) => {
    const lugar = aEstacionLugar(estacion)
    if (!lugar) return
    setSeleccionada(lugar)
    seccionMapaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
        <button className="boton boton--azul" title="Usar mi ubicación" onClick={solicitar}>
          <Crosshair size={16} />
        </button>
      </div>

      <section className="seccion seccion-mapa" ref={seccionMapaRef}>
        <EncabezadoSeccion
          titulo="Mapa interactivo"
          contador={ubicacion ? 'Ruta más corta por calles' : 'Habilita tu ubicación para ver rutas'}
        />

        <MapaLugar
          lugares={lugares}
          ubicacion={ubicacion}
          coordenadasRuta={ruta?.coordenadas ?? null}
          rutaPorCalles={ruta?.porCalles}
          colorRuta={COLOR_ESTACION}
          destinoId={destino?.id ?? null}
          alSeleccionar={alSeleccionar}
        />

        {destino && (
          <div className="tarjeta-ruta">
            <div className="tarjeta-ruta__destino">
              <span className="tarjeta-ruta__icono">
                <Zap size={18} />
              </span>
              <div>
                <div className="tarjeta-ruta__nombre">{destino.nombre}</div>
                <div className="tarjeta-ruta__direccion">
                  <MapPin size={11} /> {destino.direccion}
                </div>
              </div>
            </div>

            {cargandoRuta ? (
              <div className="tarjeta-ruta__nota">Calculando la ruta más corta por las calles...</div>
            ) : !ubicacion ? (
              <div className="tarjeta-ruta__nota">
                <MapPin size={13} />
                {errorUbicacion ?? 'Habilita tu ubicación para trazar la ruta por las calles.'}
              </div>
            ) : ruta ? (
              <>
                <div className="tarjeta-ruta__datos">
                  <span className="tarjeta-ruta__dato">
                    <Route size={14} /> {ruta.porCalles ? 'Distancia por calles' : 'Distancia'}
                    <strong>{formatearDistancia(ruta.distanciaKm)}</strong>
                  </span>
                  <span className="tarjeta-ruta__dato">
                    <Timer size={14} /> {formatearMinutos(ruta.duracionMin)}
                  </span>
                  <span className="tarjeta-ruta__dato">
                    <Navigation size={14} /> {ruta.porCalles ? 'Por calles' : 'Línea recta'}
                  </span>
                </div>
                {!ruta.porCalles && (
                  <div className="tarjeta-ruta__nota">
                    No se pudo calcular una ruta por calles para este destino; se muestra la distancia en línea
                    recta desde tu ubicación actual.
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {cargandoUbicacion && (
          <div className="tarjeta-ruta__nota" style={{ marginTop: 12 }}>
            <Crosshair size={13} /> Obteniendo tu ubicación actual...
          </div>
        )}
      </section>

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
              const puntoEstacion = punto(estacion)
              const distanciaUbicacion =
                ubicacion && puntoEstacion ? calcularDistanciaKm(ubicacion, puntoEstacion) : null
              const distanciaMostrada = distanciaUbicacion ?? estacion.distanciaKm
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
                        {distanciaMostrada?.toFixed(1)}
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
                    <button
                      className="boton boton--primario boton--compacto"
                      onClick={() => verRuta(estacion)}
                    >
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