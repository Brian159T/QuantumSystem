const URL_PANEL = 'http://localhost:3000/d-solo/adljdq9/modelo-mas-reservado?from=1794855861776&to=1794859461776&timezone=browser&orgId=1&panelId=1'

export default function GraficoModeloMasReservado() {
  return (
    <iframe
      className="grafico-reservas"
      src={URL_PANEL}
      title="Modelo más reservado en Grafana"
      width="100%"
      height="420"
    />
  )
}
