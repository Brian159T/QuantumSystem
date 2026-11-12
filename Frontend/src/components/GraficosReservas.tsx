// Período móvil para incluir las nuevas reservas en cada actualización.
const URL_PANEL = 'http://localhost:3000/d-solo/ad5j5kw/grafico-de-reservas?from=now-30d&to=now&timezone=browser&orgId=1&panelId=panel-1&theme=dark&refresh=10s'

export default function GraficosReservas() {
  return (
    <iframe
      className="grafico-reservas"
      src={URL_PANEL}
      title="Evolución de reservas en Grafana"
      width="100%"
      height="420"
    />
  )
}
