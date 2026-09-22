import { Map, Zap, Route, History, Road, HeartPulse, MapPin, CarFront } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useEstaciones } from '../../hooks/useDatos'

interface PaginaInicioClienteProps {
  alVerEstaciones: () => void
}

const VEHICULO = {
  nombre: 'Voltus Neo',
  placa: 'BLP-1204',
  bateria: 68,
  rangoKm: 286,
  salud: 96,
  ultimaCarga: 'Hoy, 07:40 AM',
}

const HISTORIAL = [
  { id: '1', fecha: 'Ayer, 19:20', estacion: 'Voltus Hub San Miguel', kwh: 32, costo: '$10.24' },
  { id: '2', fecha: 'Lun, 08:05', estacion: 'GreenPlug Zona Sur', kwh: 41, costo: '$14.35' },
  { id: '3', fecha: 'Sáb, 17:50', estacion: 'Voltus Station Sopocachi', kwh: 18, costo: '$5.40' },
]

export default function PaginaInicioCliente({ alVerEstaciones }: PaginaInicioClienteProps) {
  const { datos: estaciones } = useEstaciones()

  const acciones = [
    { icono: Map, etiqueta: 'Buscar\nestación', color: 'var(--verde)', alClic: alVerEstaciones },
    { icono: Zap, etiqueta: 'Iniciar\ncarga', color: 'var(--azul)' },
    { icono: Route, etiqueta: 'Planificar\nviaje', color: 'var(--naranja)' },
    { icono: History, etiqueta: 'Historial', color: 'var(--morado)' },
  ]

  return (
    <div>
      <div className="tarjeta tarjeta--oscura">
        <div className="vehiculo-propio__superior">
          <div>
            <div className="tarjeta__titulo" style={{ color: 'var(--blanco)' }}>
              {VEHICULO.nombre}
            </div>
            <div className="vehiculo-propio__placa">{VEHICULO.placa}</div>
          </div>
          <span className="insignia insignia--verde">
            <span className="punto-estado punto-estado--verde" />
            Listo
          </span>
        </div>

        <div className="vehiculo-propio__bateria">
          <div className="anillo-bateria">
            <div className="anillo-bateria__centro">
              <div>
                <div className="anillo-bateria__porcentaje">{VEHICULO.bateria}%</div>
                <div className="anillo-bateria__etiqueta">batería</div>
              </div>
            </div>
          </div>
          <div className="vehiculo-propio__datos">
            <div>
              <div className="barra-bateria">
                <div className="barra-bateria__relleno" style={{ width: `${VEHICULO.bateria}%` }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Road size={13} /> {VEHICULO.rangoKm} km
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HeartPulse size={13} /> Salud {VEHICULO.salud}%
                </span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              Última carga: {VEHICULO.ultimaCarga}
            </div>
          </div>
        </div>
      </div>

      <section className="seccion">
        <div className="acciones-rapidas">
          {acciones.map((accion) => (
            <button key={accion.etiqueta} className="accion-rapida" onClick={accion.alClic}>
              <span
                className="accion-rapida__icono"
                style={{ background: 'var(--fondo-claro)', color: accion.color }}
              >
                <accion.icono size={22} />
              </span>
              <span className="accion-rapida__etiqueta">{accion.etiqueta}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion
          titulo="Estaciones cercanas"
          enlace="Ver todas"
          alHacerClicEnlace={alVerEstaciones}
        />
        <div className="carrusel">
          {estaciones.map((estacion) => (
            <div key={estacion.id_estacion ?? estacion.direccion} className="carrusel__item">
              <div className="tarjeta tarjeta--oscura">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span
                    className="tarjeta-servicio__icono"
                    style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}
                  >
                    <Zap size={20} />
                  </span>
                  <span className="tarjeta-servicio__distancia" style={{ marginLeft: 'auto' }}>
                    <span className="tarjeta-servicio__distancia-valor">
                      {estacion.distanciaKm?.toFixed(1)}
                    </span>{' '}
                    <span className="tarjeta-servicio__distancia-unidad">km</span>
                  </span>
                </div>
                <div className="tarjeta__titulo" style={{ color: 'var(--blanco)', fontSize: 15 }}>
                  {estacion.nombre}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {estacion.disponibles === 0 ? (
                    <span className="insignia insignia--rojo">Ocupado</span>
                  ) : (
                    <span className="insignia insignia--verde">
                      {estacion.disponibles}/{estacion.totales} libres
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    {estacion.velocidad} · {estacion.precioPorKwh}/kWh
                  </span>
                  <button className="boton boton--primario boton--compacto">
                    <MapPin size={14} />
                    Ver ruta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion">
        <div className="banner">
          <div className="banner__lienzo" />
          <div className="banner__contenido">
            <div className="banner__ceja">Ruta inteligente</div>
            <div className="banner__titulo">
              Planifica tu próximo viaje
            </div>
            <div className="banner__subtitulo">
              Calculamos paradas de carga en el camino
            </div>
            <button className="boton boton--primario">
              <Map size={15} />
              Crear ruta
            </button>
          </div>
          <div className="banner__icono">
            <CarFront size={42} />
          </div>
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion titulo="Historial de cargas" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HISTORIAL.map((registro) => (
            <div key={registro.id} className="fila-actividad">
              <span
                className="fila-actividad__icono"
                style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}
              >
                <Zap size={18} />
              </span>
              <div>
                <div className="fila-actividad__accion">{registro.estacion}</div>
                <div className="fila-actividad__detalle">{registro.fecha}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{registro.kwh} kWh</div>
                <div className="fila-actividad__detalle">{registro.costo}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}