import { Lightbulb, PlugZap } from 'lucide-react'
import useAnalisisEstaciones from '../hooks/useAnalisisEstaciones'

export default function InterpretacionEstaciones() {
  const { datos, error } = useAnalisisEstaciones()
  return (
    <>
      <section className="grafico-tarjeta" aria-labelledby="resultados-estaciones">
        <header className="grafico-tarjeta__cabecera">
          <span className="grafico-tarjeta__icono"><PlugZap size={21} aria-hidden="true" /></span>
          <div><p className="graficos-ceja">RESULTADOS</p><h3 id="resultados-estaciones">La red de carga en cifras</h3></div>
        </header>
        <div className="analisis-reservas__contenido">
          {error && <p role="alert">{error}</p>}
          {!datos && !error && <p role="status">Consultando estaciones…</p>}
          {datos && <>
            <dl className="analisis-reservas__cifras">
              <div><dt>Estaciones registradas</dt><dd>{datos.total}</dd></div>
              <div><dt>Con estado disponible</dt><dd>{datos.disponibles}</dd></div>
              <div><dt>Sin estado registrado</dt><dd>{datos.sinEstado}</dd></div>
            </dl>
            <p>Última consulta correcta: {datos.actualizado}{error ? ' · Datos sin actualizar' : ''}</p>
          </>}
        </div>
      </section>
      <section className="grafico-tarjeta" aria-labelledby="interpretacion-estaciones">
        <header className="grafico-tarjeta__cabecera">
          <span className="grafico-tarjeta__icono"><Lightbulb size={21} aria-hidden="true" /></span>
          <div><p className="graficos-ceja">INTERPRETACIÓN</p><h3 id="interpretacion-estaciones">Estado de la red de carga</h3></div>
        </header>
        <div className="analisis-reservas__contenido">
          {error ? <p>La interpretación estará disponible al recuperar la conexión.</p> : !datos ? <p>Preparando el análisis…</p> : datos.total === 0 ? <p>No hay estaciones registradas. Se necesitan datos para analizar el estado de la red.</p> : <>
            <p><strong>{datos.disponibles} de {datos.total} estaciones</strong> tienen el estado «Disponible», equivalente al {Math.round(datos.disponibles / datos.total * 100)} % del catálogo.</p>
            <p>Distribución registrada: {datos.estados.map(([estado, cantidad]) => `${estado}: ${cantidad}`).join(' · ')}.</p>
            <p>{datos.sinEstado > 0 ? `Conviene revisar las ${datos.sinEstado} estaciones sin estado para completar la información de la red.` : 'Todas las estaciones tienen un estado registrado.'}</p>
          </>}
          <p className="graficos-nota">Resumen del catálogo actual desde la API, independiente de los filtros de Grafana. El estado registrado no mide ocupación en tiempo real, uso ni cantidad de conectores libres.</p>
        </div>
      </section>
    </>
  )
}
