const URL_PANEL = 'http://localhost:3000/d-solo/add5j8r/grafico-de-tabla-de-estaciones-de-carga?from=now-30d&to=now&timezone=browser&orgId=1&panelId=1&theme=dark&refresh=10s'

export default function GraficoEstaciones() {
  return (
    <iframe
      className="grafico-reservas"
      src={URL_PANEL}
      title="Estaciones de carga en Grafana"
      width="100%"
      height="420"
    />
  )
}
