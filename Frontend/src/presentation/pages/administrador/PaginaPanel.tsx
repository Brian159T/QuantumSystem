import { useEffect, useState } from 'react'
import { Users, Car, Zap, Banknote, TrendingUp, UserPlus, FileText, MapPin, CheckCircle2 } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { catalogoUseCase, estacionesUseCase, usuariosUseCase } from '../../../data'

const ACTIVIDAD = [
  { id: '1', accion: 'Nuevo usuario registrado', detalle: 'María Fernanda López · hace 2 h', icono: UserPlus, color: 'var(--verde)' },
  { id: '2', accion: 'Reserva de Voltus Neo confirmada', detalle: 'Juan Pérez · hace 5 h', icono: FileText, color: 'var(--azul)' },
  { id: '3', accion: 'Vehículo agregado al catálogo', detalle: 'Voltus Aero GT · ayer', icono: Car, color: 'var(--naranja)' },
  { id: '4', accion: 'Nueva estación de carga activada', detalle: 'Voltus Hub Obrajes · ayer', icono: MapPin, color: 'var(--morado)' },
]

export default function PaginaPanel() {
  const [conteos, setConteos] = useState({ vehiculos: 0, estaciones: 0, usuarios: 0 })

  useEffect(() => {
    Promise.all([
      catalogoUseCase.obtenerCatalogo(),
      estacionesUseCase.obtenerEstaciones(),
      usuariosUseCase.obtenerUsuarios(),
    ]).then(([vehiculos, estaciones, usuarios]) => {
      setConteos({
        vehiculos: vehiculos.length,
        estaciones: estaciones.length,
        usuarios: usuarios.length,
      })
    })
  }, [])

  const estadisticas = [
    { etiqueta: 'Vehículos', valor: conteos.vehiculos, icono: Car, color: 'var(--verde)' },
    { etiqueta: 'Estaciones', valor: conteos.estaciones, icono: Zap, color: 'var(--azul)' },
    { etiqueta: 'Usuarios', valor: conteos.usuarios, icono: Users, color: 'var(--morado)' },
    { etiqueta: 'Ingresos', valor: '$54.2K', icono: Banknote, color: 'var(--naranja)' },
  ]

  return (
    <div>
      <div className="banner" style={{ marginBottom: 26, padding: '28px 32px' }}>
        <div className="banner__lienzo" />
        <div className="banner__contenido">
          <div className="banner__ceja">Panel de administración</div>
          <div className="banner__titulo">Hola, Admin</div>
          <div className="banner__subtitulo">
            <span className="punto-estado punto-estado--verde" />
            Todo funciona correctamente
          </div>
        </div>
        <div className="banner__icono">
          <TrendingUp size={42} />
        </div>
      </div>

      <div className="fila-estadisticas">
        {estadisticas.map((estadistica) => (
          <div key={estadistica.etiqueta} className="tarjeta-estadistica">
            <div
              className="tarjeta-estadistica__icono"
              style={{ background: `${estadistica.color}18`, color: estadistica.color }}
            >
              <estadistica.icono size={22} />
            </div>
            <div>
              <div className="tarjeta-estadistica__valor">{estadistica.valor}</div>
              <div className="tarjeta-estadistica__etiqueta">{estadistica.etiqueta}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="seccion">
        <EncabezadoSeccion titulo="Gestión de contenido" />
        <div className="rejilla-gestion">
          <button className="tarjeta-gestion">
            <span className="tarjeta-gestion__icono" style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}>
              <Car size={24} />
            </span>
            <div>
              <div className="tarjeta-gestion__titulo">Catálogo de vehículos</div>
              <div className="tarjeta-gestion__detalle">Editar modelos, precios y disponibilidad</div>
            </div>
            <span className="tarjeta-gestion__cantidad">{conteos.vehiculos}</span>
          </button>
          <button className="tarjeta-gestion">
            <span className="tarjeta-gestion__icono" style={{ background: 'var(--azul-suave)', color: 'var(--azul)' }}>
              <Zap size={24} />
            </span>
            <div>
              <div className="tarjeta-gestion__titulo">Estaciones de carga</div>
              <div className="tarjeta-gestion__detalle">Administrar red de carga y horarios</div>
            </div>
            <span className="tarjeta-gestion__cantidad">{conteos.estaciones}</span>
          </button>
          <button className="tarjeta-gestion">
            <span className="tarjeta-gestion__icono" style={{ background: 'rgba(129,140,248,0.14)', color: 'var(--morado)' }}>
              <Users size={24} />
            </span>
            <div>
              <div className="tarjeta-gestion__titulo">Usuarios</div>
              <div className="tarjeta-gestion__detalle">Gestionar cuentas y roles</div>
            </div>
            <span className="tarjeta-gestion__cantidad">{conteos.usuarios}</span>
          </button>
          <button className="tarjeta-gestion">
            <span className="tarjeta-gestion__icono" style={{ background: 'rgba(245,158,11,0.14)', color: 'var(--naranja)' }}>
              <MapPin size={24} />
            </span>
            <div>
              <div className="tarjeta-gestion__titulo">Talleres autorizados</div>
              <div className="tarjeta-gestion__detalle">Gestionar red de talleres</div>
            </div>
            <span className="tarjeta-gestion__cantidad">4</span>
          </button>
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion titulo="Actividad reciente" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACTIVIDAD.map((actividad) => (
            <div key={actividad.id} className="fila-actividad">
              <span
                className="fila-actividad__icono"
                style={{ background: `${actividad.color}18`, color: actividad.color }}
              >
                <actividad.icono size={18} />
              </span>
              <div>
                <div className="fila-actividad__accion">{actividad.accion}</div>
                <div className="fila-actividad__detalle">{actividad.detalle}</div>
              </div>
              <span className="insignia insignia--verde" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={12} />
                Completado
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}