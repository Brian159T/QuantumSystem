import { URL_PANELES_GRAFANA } from '../config/grafana'

const URL_PANEL = URL_PANELES_GRAFANA.estaciones

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
