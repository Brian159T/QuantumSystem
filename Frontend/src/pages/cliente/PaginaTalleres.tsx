import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Search,
  Siren,
  MapPin,
  Star,
  Wrench,
  Battery,
  Zap,
  Disc,
  CarFront,
  Check,
  Crosshair,
  Navigation,
  Route,
  Timer,
} from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import MapaLugar, { type LugarEnMapa } from '../../components/MapaLugar'
import { useTalleres } from '../../hooks/useDatos'
import { useUbicacion } from '../../hooks/useUbicacion'
import { useRuta } from '../../hooks/useRuta'
import {
  calcularDistanciaKm,
  formatearDistancia,
  formatearMinutos,
  type Coordenada,
} from '../../utils/geo'
import type { ServicioTecnico } from '../../types/EstacionesYTalleres'

const ESPECIALIDADES = ['Todos', 'Baterías', 'Electrónica', 'Motor eléctrico', 'Carrocería', 'Neumáticos']

const COLOR_TALLER = '#818cf8'

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

function coordenadasValidas(item: { latitud?: number; longitud?: number }): boolean {
  return (
    typeof item.latitud !== 'undefined' &&
    typeof item.longitud !== 'undefined' &&
    !isNaN(Number(item.latitud)) &&
    !isNaN(Number(item.longitud))
  )
}

function punto(taller: ServicioTecnico): Coordenada | null {
  if (!coordenadasValidas(taller)) return null
  return { latitud: Number(taller.latitud), longitud: Number(taller.longitud) }
}

function aTallerLugar(taller: ServicioTecnico): LugarEnMapa | null {
  const coordenadas = punto(taller)
  if (!coordenadas) return null
  return {
    id: taller.id_servicio ?? taller.direccion,
    nombre: taller.nombre ?? 'Taller autorizado',
    direccion: taller.direccion,
    latitud: coordenadas.latitud,
    longitud: coordenadas.longitud,
    icono: <Wrench size={15} />,
    color: COLOR_TALLER,
  }
}

export default function PaginaTalleres() {
  const { datos: talleres } = useTalleres()
  const { ubicacion, cargando: cargandoUbicacion, error: errorUbicacion, solicitar } = useUbicacion()
  const [busqueda, setBusqueda] = useState('')
  const [especialidad, setEspecialidad] = useState('Todos')
  const [soloAbiertos, setSoloAbiertos] = useState(false)
  const [seleccionado, setSeleccionado] = useState<LugarEnMapa | null>(null)
  const seccionMapaRef = useRef<HTMLElement | null>(null)

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
      .sort((a, b) => {
        const dA = ubicacion && punto(a) ? calcularDistanciaKm(ubicacion, punto(a)!) : (a.distanciaKm ?? Infinity)
        const dB = ubicacion && punto(b) ? calcularDistanciaKm(ubicacion, punto(b)!) : (b.distanciaKm ?? Infinity)
        return dA - dB
      })
  }, [talleres, busqueda, especialidad, soloAbiertos, ubicacion])

  const lugares = useMemo(
    () =>
      filtrados
        .map(aTallerLugar)
        .filter((lugar): lugar is LugarEnMapa => lugar !== null),
    [filtrados]
  )

  const masCercano = useMemo<LugarEnMapa | null>(() => {
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
    setSeleccionado(lugar)
  }, [])

  const destino = seleccionado ?? masCercano
  const destinoCoordenada = destino
    ? { latitud: destino.latitud, longitud: destino.longitud }
    : null
  const { ruta, cargando: cargandoRuta } = useRuta(ubicacion, destinoCoordenada)

  const verRuta = (taller: ServicioTecnico) => {
    const lugar = aTallerLugar(taller)
    if (!lugar) return
    setSeleccionado(lugar)
    seccionMapaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
        <button className="boton boton--azul" title="Usar mi ubicación" onClick={solicitar}>
          <Crosshair size={16} />
        </button>
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
          colorRuta={COLOR_TALLER}
          destinoId={destino?.id ?? null}
          alSeleccionar={alSeleccionar}
        />

        {destino && (
          <div className="tarjeta-ruta">
            <div className="tarjeta-ruta__destino">
              <span className="tarjeta-ruta__icono" style={{ background: COLOR_TALLER }}>
                <Wrench size={18} />
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
            {filtrados.map((taller) => {
              const puntoTaller = punto(taller)
              const distanciaUbicacion =
                ubicacion && puntoTaller ? calcularDistanciaKm(ubicacion, puntoTaller) : null
              const distanciaMostrada = distanciaUbicacion ?? taller.distanciaKm
              return (
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
                        {distanciaMostrada?.toFixed(1)}
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
                    {taller.especialidades && taller.especialidades.length > 0 && (
                      <span
                        className="insignia"
                        style={{ background: 'var(--fondo-claro)', color: 'var(--texto-suave)' }}
                      >
                        {taller.especialidades.join(', ')}
                      </span>
                    )}
                    {taller.espera && <span className="insignia insignia--azul">{taller.espera}</span>}
                  </div>

                  <div className="tarjeta-servicio__pie">
                    <span className="tarjeta-servicio__calificacion">
                      <Star size={13} style={{ color: 'var(--naranja)' }} />
                      {taller.rating?.toFixed(1) ?? '—'}
                      {taller.telefono ? ` · ${taller.telefono}` : ''}
                    </span>
                    <button className="boton boton--azul boton--compacto" onClick={() => verRuta(taller)}>
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