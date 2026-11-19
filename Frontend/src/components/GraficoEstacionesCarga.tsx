const URL_PANEL = 'http://localhost:3000/d-solo/adp8ztg/grafico-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s'

export default function GraficoEstacionesCarga() {
  return (
    <iframe
      className="grafico-reservas"
      src={URL_PANEL}
      title="Gráfico de estaciones de carga en Grafana"
      width="100%"
      height="420"
    />
  )
}
