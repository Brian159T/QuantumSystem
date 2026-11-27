import { CalendarRange, Database, Info, TrendingUp } from 'lucide-react'
import ProyeccionReservas from '../../components/ProyeccionReservas'
import type { Proyeccion } from '../../components/ProyeccionReservas'
import '../../styles/graficos.css'
import { useState } from 'react'

export default function PaginaProyeccionReservas() {
  const [resultado, setResultado] = useState<Proyeccion | null>(null)
  const promedio = resultado ? resultado.proyeccion.reduce((total, item) => total + item.cantidad, 0) / resultado.proyeccion.length : 0
  const totalEstimado = resultado?.proyeccion.reduce((total, item) => total + item.cantidad, 0) ?? 0
  const tendencia = resultado ? (resultado.pendiente > 0 ? 'crecimiento' : resultado.pendiente < 0 ? 'disminución' : 'estable') : ''
  return (
    <div className="pagina-proyeccion">
      <section className="graficos-resumen" aria-labelledby="titulo-proyeccion-pagina">
        <div className="graficos-resumen__icono"><TrendingUp size={24} aria-hidden="true" /></div>
        <div className="graficos-resumen__texto">
          <p className="graficos-ceja">ANÁLISIS PREDICTIVO</p>
          <h2 id="titulo-proyeccion-pagina">Proyección de Reservas</h2>
          <p>Observa la tendencia de las reservas recientes y estima el comportamiento de los próximos días.</p>
        </div>
        <span className="graficos-etiqueta">Regresión lineal · Datos reales</span>
      </section>

      <ProyeccionReservas alActualizar={setResultado} />

      <div className="proyeccion-resultado" aria-live="polite">
        <div className="proyeccion-resultado__encabezado">
          <div><p className="graficos-ceja">RESULTADO DE LA PROYECCIÓN</p><h2>Interpretación de los resultados</h2></div>
          <span className="graficos-etiqueta">Lectura automática</span>
        </div>
        {!resultado ? <p>Selecciona un horizonte para consultar la interpretación calculada con las reservas de la base de datos.</p> : <>
          <p>Para los próximos <strong>{resultado.horizonteDias === 30 ? '30 días' : '7 días'}</strong>, el modelo estima aproximadamente <strong>{totalEstimado.toFixed(1)} reservas</strong>, con un promedio de <strong>{promedio.toFixed(1)} reservas por día</strong>.</p>
          <p>La tendencia observada es de <strong>{tendencia}</strong>, con una variación estimada de <strong>{resultado.pendiente >= 0 ? '+' : ''}{resultado.pendiente} reservas por día</strong>. Usa este resultado como apoyo para planificar seguimiento y capacidad.</p>
        </>}
      </div>

      <section className="graficos-resumen proyeccion-interpretacion" aria-labelledby="titulo-interpretacion-proyeccion">
        <div className="graficos-resumen__icono"><Info size={24} aria-hidden="true" /></div>
        <div className="graficos-resumen__texto">
          <p className="graficos-ceja">INTERPRETACIÓN</p>
          <h2 id="titulo-interpretacion-proyeccion">Cómo leer la proyección</h2>
          <p>Comprende el horizonte, la tendencia y el alcance de la estimación estadística.</p>
        </div>
        <span className="graficos-etiqueta">Lectura de resultados</span>
        <div className="proyeccion-interpretacion__rejilla">
          <div className="grafico-tarjeta proyeccion-interpretacion__bloque">
            <CalendarRange size={20} aria-hidden="true" />
            <h3>Horizonte seleccionado</h3>
            <p>Elige 7 días para una lectura operativa de corto plazo o 1 mes para planificar capacidad y seguimiento comercial.</p>
          </div>
          <div className="grafico-tarjeta proyeccion-interpretacion__bloque">
            <TrendingUp size={20} aria-hidden="true" />
            <h3>Pendiente de la línea</h3>
            <p>Una pendiente positiva indica crecimiento esperado; una negativa señala una disminución. El valor se expresa en reservas promedio por día.</p>
          </div>
          <div className="grafico-tarjeta proyeccion-interpretacion__bloque">
            <Database size={20} aria-hidden="true" />
            <h3>Fuente y alcance</h3>
            <p>El cálculo usa las reservas diarias de los últimos 30 días de la tabla Reservas. La proyección es una estimación estadística, no una garantía.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
