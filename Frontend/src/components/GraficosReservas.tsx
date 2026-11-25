// Período móvil para incluir las nuevas reservas en cada actualización.
import { URL_PANELES_GRAFANA } from '../config/grafana'

const URL_PANEL = URL_PANELES_GRAFANA.reservas

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
