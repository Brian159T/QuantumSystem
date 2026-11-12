import { ChartColumnIncreasing, Lightbulb } from 'lucide-react'
import useAnalisisReservas from '../hooks/useAnalisisReservas'

export default function InterpretacionReservas() {
  const { datos, error } = useAnalisisReservas()
  return (
    <>
      <section className="grafico-tarjeta analisis-reservas" aria-labelledby="resultados-reservas">
        <header className="grafico-tarjeta__cabecera">
          <span className="grafico-tarjeta__icono"><ChartColumnIncreasing size={21} aria-hidden="true" /></span>
          <div><p className="graficos-ceja">RESULTADOS</p><h3 id="resultados-reservas">Las reservas en cifras</h3></div>
        </header>
        <div className="analisis-reservas__contenido">
          {error && <p role="alert">{error}</p>}
          {!datos && !error && <p role="status">Consultando reservas…</p>}
          {datos && <>
            <dl className="analisis-reservas__cifras">
              <div><dt>Reservas registradas</dt><dd>{datos.total}</dd></div>
              <div><dt>Pendientes</dt><dd>{datos.pendientes}</dd></div>
              <div><dt>Confirmadas o entregadas</dt><dd>{datos.confirmadas}</dd></div>
            </dl>
            <p>Consulta de los últimos 30 días por fecha de reserva, incluyendo hoy.</p>
            <p>Última consulta correcta: {datos.actualizado}{error ? ' · Datos sin actualizar' : ''}</p>
          </>}
        </div>
      </section>
      <section className="grafico-tarjeta analisis-reservas" aria-labelledby="interpretacion-reservas">
        <header className="grafico-tarjeta__cabecera">
          <span className="grafico-tarjeta__icono"><Lightbulb size={21} aria-hidden="true" /></span>
          <div><p className="graficos-ceja">INTERPRETACIÓN</p><h3 id="interpretacion-reservas">Qué nos dicen los datos</h3></div>
        </header>
        <div className="analisis-reservas__contenido">
          {error ? <p>La interpretación no está disponible hasta actualizar la consulta.</p> : !datos ? <p>Preparando el análisis…</p> : datos.total === 0 ? <p>No hay reservas registradas en este período. No es posible identificar preferencias ni picos de actividad.</p> : <>
            <p><strong>{datos.modelosPrincipales.join(', ')}</strong>{datos.modelosPrincipales.length === 1 ? ' concentra' : ' comparten el primer lugar con'} {datos.maximoModelo} reservas{datos.modelosPrincipales.length > 1 ? ' por modelo' : ''} ({Math.round(datos.maximoModelo / datos.total * 100)} % del total por modelo).</p>
            <p>El mayor volumen diario fue de <strong>{datos.maximoDia} reservas</strong>, registrado en: {datos.diasPrincipales.join(', ')}.</p>
            <p>{datos.pendientes > 0 ? `Hay ${datos.pendientes} reservas pendientes de seguimiento, equivalentes al ${Math.round(datos.pendientes / datos.total * 100)} % del período.` : 'No hay reservas pendientes en el período seleccionado.'}</p>
          </>}
          <p className="graficos-nota">Resumen independiente calculado desde la API de reservas. No lee la consulta ni los filtros internos de Grafana. Las reservas confirmadas o entregadas no representan ingresos monetarios.</p>
        </div>
      </section>
    </>
  )
}
