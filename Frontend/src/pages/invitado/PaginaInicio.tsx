import { Flame, ArrowRight, BatteryCharging, Clock, ShieldCheck, Banknote, KeyRound, CalendarCheck, Zap, CheckCircle } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useVehiculos } from '../../hooks/useDatos'

interface PaginaInicioProps {
  alVerVehiculos: () => void
}

export default function PaginaInicio({ alVerVehiculos }: PaginaInicioProps) {
  const { datos: modelos } = useVehiculos()

  return (
    <div>
      <section className="hero">
        <div className="hero__imagen">
          <img src={modelos[0]?.imagen} alt={modelos[0]?.Nombre_Modelo ?? 'Voltus Neo'} />
        </div>
        <div className="hero__lienzo" />
        <div className="hero__contenido">
          <span className="hero__insignia">
            <Flame size={13} />
            Oferta del mes
          </span>
          <h1 className="hero__titulo">
            Hasta 20% OFF <br />
            <span>Voltus Neo 2024</span>
          </h1>
          <p className="hero__subtitulo">
            Redescubre la movilidad eléctrica con la nueva generación de vehículos Quantum.
          </p>
          <div className="hero__acciones">
            <button className="boton boton--primario" onClick={alVerVehiculos}>
              Ver Modelos
              <ArrowRight size={16} />
            </button>
            <button className="boton boton--claro" onClick={alVerVehiculos}>
              Conocer más
            </button>
          </div>
        </div>
        <div className="hero__decoracion" />
      </section>

      <section className="fila-estadisticas">
        <div className="tarjeta-estadistica">
          <div
            className="tarjeta-estadistica__icono"
            style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}
          >
            <BatteryCharging size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">420 km</div>
            <div className="tarjeta-estadistica__etiqueta">Autonomía</div>
          </div>
        </div>
        <div className="tarjeta-estadistica">
          <div
            className="tarjeta-estadistica__icono"
            style={{ background: 'var(--azul-suave)', color: 'var(--azul)' }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">45 min</div>
            <div className="tarjeta-estadistica__etiqueta">Carga rápida</div>
          </div>
        </div>
        <div className="tarjeta-estadistica">
          <div
            className="tarjeta-estadistica__icono"
            style={{ background: 'rgba(167,139,250,0.14)', color: 'var(--morado)' }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="tarjeta-estadistica__valor">5★</div>
            <div className="tarjeta-estadistica__etiqueta">Seguridad</div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion titulo="Modelos Destacados" enlace="Ver todos" alHacerClicEnlace={alVerVehiculos} />
        <div className="carrusel">
          {modelos.map((modelo) => (
            <div key={modelo.id_vehiculo ?? modelo.Nombre_Modelo} className="carrusel__item">
              <div className="tarjeta-modelo">
                <div className="tarjeta-modelo__imagen">
                  <img src={modelo.imagen} alt={modelo.Nombre_Modelo} loading="lazy" />
                  {modelo.etiqueta && (
                    <span className="insignia insignia--verde tarjeta-modelo__insignia">
                      {modelo.etiqueta}
                    </span>
                  )}
                </div>
                <div className="tarjeta-modelo__cuerpo">
                  <div className="tarjeta-modelo__nombre">{modelo.Nombre_Modelo}</div>
                  <div className="tarjeta-modelo__tipo">{modelo.Tipo}</div>
                  <div className="tarjeta-modelo__datos">
                    <span className="dato-rapido">
                      <BatteryCharging size={12} style={{ color: 'var(--verde)' }} />
                      {modelo.Autonomia}
                    </span>
                    <span className="dato-rapido">
                      <Zap size={12} style={{ color: 'var(--azul)' }} />
                      {modelo.Carga_Rapida}
                    </span>
                  </div>
                  <div className="tarjeta-modelo__pie">
                    <div className="tarjeta-modelo__precio">
                      {modelo.precio ?? 'Consultar'} <span>USD</span>
                    </div>
                    <button className="boton boton--claro boton--compacto" onClick={alVerVehiculos}>
                      Ver
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion titulo="Planes de Pago Flexibles" />
        <div className="rejilla-planes">
          <div className="tarjeta-plan">
            <div
              className="tarjeta-plan__icono"
              style={{ background: 'var(--azul-suave)', color: 'var(--azul)' }}
            >
              <Banknote size={26} />
            </div>
            <div className="tarjeta-plan__etiqueta">Crédito Automotriz</div>
            <div className="tarjeta-plan__precio">
              Desde $499 <small>USD/mes*</small>
            </div>
            <div className="tarjeta-plan__caracteristica">
              <CheckCircle color="var(--azul)" size={15} /> Plazos hasta 72 meses
            </div>
            <div className="tarjeta-plan__caracteristica">
              <CheckCircle color="var(--azul)" size={15} /> Tasa preferencial
            </div>
            <div className="tarjeta-plan__accion">
              <button className="boton boton--azul boton--completo">Cotizar Ahora</button>
            </div>
          </div>

          <div className="tarjeta-plan">
            <div
              className="tarjeta-plan__icono"
              style={{ background: 'var(--verde-suave)', color: 'var(--verde)' }}
            >
              <KeyRound size={26} />
            </div>
            <div className="tarjeta-plan__etiqueta">Arrendamiento</div>
            <div className="tarjeta-plan__precio">
              Desde $399 <small>USD/mes*</small>
            </div>
            <div className="tarjeta-plan__caracteristica">
              <CheckCircle color="var(--verde)" size={15} /> Actualiza cada 3 años
            </div>
            <div className="tarjeta-plan__caracteristica">
              <CheckCircle color="var(--verde)" size={15} /> Mantenimiento incluido
            </div>
            <div className="tarjeta-plan__accion">
              <button className="boton boton--borde-verde boton--completo">Más Información</button>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <div className="banner">
          <div className="banner__lienzo" />
          <div className="banner__contenido">
            <div className="banner__ceja">Experiencia real</div>
            <div className="banner__titulo">
              Agenda tu <br />
              Test Drive
            </div>
            <div className="banner__subtitulo">Gratis · Sin compromiso</div>
            <button className="boton boton--primario">
              <CalendarCheck size={15} />
              Reservar
            </button>
          </div>
          <div className="banner__icono">
            <Zap size={44} />
          </div>
        </div>
      </section>
    </div>
  )
}