import { Users, Car, Zap, MapPin, TrendingUp } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useEstaciones, useTalleres, useUsuarios, useVehiculos } from '../../hooks/useDatos'

export default function PaginaPanel() {
  const { datos: vehiculos } = useVehiculos()
  const { datos: estaciones } = useEstaciones()
  const { datos: usuarios } = useUsuarios()
  const { datos: talleres } = useTalleres()

  const conteos = {
    vehiculos: vehiculos.length,
    estaciones: estaciones.length,
    usuarios: usuarios.length,
    talleres: talleres.length,
  }

  const estadisticas = [
    { etiqueta: 'Vehículos', valor: conteos.vehiculos, icono: Car, color: 'var(--verde)' },
    { etiqueta: 'Estaciones', valor: conteos.estaciones, icono: Zap, color: 'var(--azul)' },
    { etiqueta: 'Usuarios', valor: conteos.usuarios, icono: Users, color: 'var(--morado)' },
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
            Accede a los módulos para gestionar el contenido
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
            <span className="tarjeta-gestion__cantidad">{conteos.talleres}</span>
          </button>
        </div>
      </section>
    </div>
  )
}