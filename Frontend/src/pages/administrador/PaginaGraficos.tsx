import { Activity, BarChart3, ChartNoAxesCombined, FileDown, PanelsTopLeft, PlugZap } from 'lucide-react'
import '../../styles/graficos.css'
import GraficosReservas from '../../components/GraficosReservas'
import InterpretacionReservas from '../../components/InterpretacionReservas'
import GraficoEstaciones from '../../components/GraficoEstaciones'
import InterpretacionEstaciones from '../../components/InterpretacionEstaciones'
import GraficoModeloMasReservado from '../../components/GraficoModeloMasReservado'
import GraficoEstacionesCarga from '../../components/GraficoEstacionesCarga'
import useAnalisisReservas from '../../hooks/useAnalisisReservas'
import useAnalisisEstaciones from '../../hooks/useAnalisisEstaciones'
import { abrirReporteGrafico } from '../../utils/reportesGraficos'

// Los espacios restantes se mantienen pendientes hasta disponer de sus paneles.
const PANELES = [
  { id: 'reservas', titulo: 'Evolución de reservas', descripcion: 'Comportamiento de las reservas a lo largo del tiempo.', categoria: 'Reservas y ventas', icono: ChartNoAxesCombined, principal: true },
]

export default function PaginaGraficos() {
  const { datos: reservas, reporte: reporteReservas } = useAnalisisReservas()
  const { datos: estaciones, reporte: reporteEstaciones } = useAnalisisEstaciones()
  const datos = { reservas, estaciones, tablas: reporteReservas?.tablas ?? reporteEstaciones?.tablas ?? null }
  const botonReporte = (tipo: 'reservas' | 'estaciones' | 'modelo' | 'red') => (
    <div className="boton-reporte__envoltura">
      <button className="boton boton--primario boton--compacto boton-reporte" type="button" onClick={() => void abrirReporteGrafico({ tipo, datos })}>
        <FileDown size={16} aria-hidden="true" /> Generar reporte PDF
      </button>
    </div>
  )

  return (
    <div className="pagina-graficos">
      <section className="graficos-resumen" aria-labelledby="titulo-analitica">
        <div className="graficos-resumen__icono"><PanelsTopLeft size={24} aria-hidden="true" /></div>
        <div className="graficos-resumen__texto">
          <p className="graficos-ceja">CENTRO DE ANÁLISIS</p>
          <h2 id="titulo-analitica">El panorama de tu negocio</h2>
          <p>Consulta tus indicadores en un solo espacio, con paneles organizados por área.</p>
        </div>
        <span className="graficos-etiqueta">Reservas y estaciones · Análisis</span>
      </section>

      <div className="graficos-separador">
        <h2>Paneles de análisis</h2>
        <span>Visualizaciones de Grafana</span>
      </div>

      <div className="graficos-rejilla">
        {PANELES.map(({ id, titulo, descripcion, categoria, icono: Icono, principal }) => (
          <section key={id} className={`grafico-tarjeta${principal ? ' grafico-tarjeta--amplia' : ''}`} aria-labelledby={`grafico-${id}`}>
            <header className="grafico-tarjeta__cabecera">
              <div className="grafico-tarjeta__icono"><Icono size={21} aria-hidden="true" /></div>
              <div>
                <p className="graficos-ceja">{categoria}</p>
                <h3 id={`grafico-${id}`}>{titulo}</h3>
                <p className="grafico-tarjeta__descripcion">{descripcion}</p>
              </div>
            </header>
            <div className={`grafico-tarjeta__espacio${id === 'reservas' ? ' grafico-tarjeta__espacio--panel' : ''}`}>
              {id === 'reservas' ? <GraficosReservas /> : (
              <div className="grafico-tarjeta__vacio">
                <span className="grafico-tarjeta__simbolo"><Icono size={32} strokeWidth={1.4} aria-hidden="true" /></span>
                <h4>Tu próximo indicador, aquí</h4>
                <p>Este espacio está preparado para mostrar un panel de Grafana.</p>
                <span className="grafico-tarjeta__pendiente">Pendiente de conectar</span>
              </div>
              )}
            </div>
            {botonReporte('reservas')}
            <footer className="grafico-tarjeta__pie">
              {id === 'reservas' ? 'Últimos 30 días · Actualización cada 10 s · Fuente: Grafana' : 'Sin datos conectados'}
            </footer>
          </section>
        ))}
        <InterpretacionReservas />
        <section className="grafico-tarjeta grafico-tarjeta--amplia" aria-labelledby="grafico-estaciones">
          <header className="grafico-tarjeta__cabecera">
            <div className="grafico-tarjeta__icono"><PlugZap size={21} aria-hidden="true" /></div>
            <div>
              <p className="graficos-ceja">RED DE CARGA</p>
              <h3 id="grafico-estaciones">Estaciones de carga</h3>
              <p className="grafico-tarjeta__descripcion">Consulta las estaciones y la información de la red registrada en la plataforma.</p>
            </div>
          </header>
          <div className="grafico-tarjeta__espacio grafico-tarjeta__espacio--panel"><GraficoEstaciones /></div>
          {botonReporte('estaciones')}
          <footer className="grafico-tarjeta__pie">Actualización cada 10 s · Fuente: Grafana</footer>
        </section>
        <InterpretacionEstaciones />
        <section className="grafico-tarjeta grafico-tarjeta--amplia" aria-labelledby="grafico-modelo-mas-reservado">
          <header className="grafico-tarjeta__cabecera">
            <div className="grafico-tarjeta__icono"><BarChart3 size={21} aria-hidden="true" /></div>
            <div>
              <p className="graficos-ceja">RESERVAS Y VENTAS</p>
              <h3 id="grafico-modelo-mas-reservado">Modelo más reservado</h3>
              <p className="grafico-tarjeta__descripcion">Ranking de los modelos con mayor cantidad de reservas registradas.</p>
            </div>
          </header>
          <div className="grafico-tarjeta__espacio grafico-tarjeta__espacio--panel"><GraficoModeloMasReservado /></div>
          {botonReporte('modelo')}
          <footer className="grafico-tarjeta__pie">Fuente: Grafana</footer>
        </section>
        <section className="grafico-tarjeta grafico-tarjeta--amplia" aria-labelledby="grafico-estaciones-carga">
          <header className="grafico-tarjeta__cabecera">
            <div className="grafico-tarjeta__icono"><Activity size={21} aria-hidden="true" /></div>
            <div>
              <p className="graficos-ceja">RED DE CARGA</p>
              <h3 id="grafico-estaciones-carga">Gráfico de estaciones de carga</h3>
              <p className="grafico-tarjeta__descripcion">Visualización del comportamiento de las estaciones de carga registradas.</p>
            </div>
          </header>
          <div className="grafico-tarjeta__espacio grafico-tarjeta__espacio--panel"><GraficoEstacionesCarga /></div>
          {botonReporte('red')}
          <footer className="grafico-tarjeta__pie">Actualización cada 10 s · Fuente: Grafana</footer>
        </section>
      </div>
      <p className="graficos-nota">Los paneles requieren acceso a Grafana y una sesión autorizada. Los resúmenes se calculan desde la API; su coincidencia con cada gráfico depende de la consulta y los filtros configurados en Grafana.</p>
    </div>
  )
}
