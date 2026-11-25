import { URL_PANELES_GRAFANA } from '../config/grafana'

const URL_PANEL = URL_PANELES_GRAFANA.red

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
