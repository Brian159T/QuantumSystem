import { URL_PANELES_GRAFANA } from '../config/grafana'

const URL_PANEL = URL_PANELES_GRAFANA.modelo

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
