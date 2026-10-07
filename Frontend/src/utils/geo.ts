export interface Coordenada {
  latitud: number
  longitud: number
}

export function calcularDistanciaKm(origen: Coordenada, destino: Coordenada): number {
  const radioTierra = 6371
  const aLat = ((destino.latitud - origen.latitud) * Math.PI) / 180
  const aLon = ((destino.longitud - origen.longitud) * Math.PI) / 180
  const a =
    Math.sin(aLat / 2) * Math.sin(aLat / 2) +
    Math.cos((origen.latitud * Math.PI) / 180) *
      Math.cos((destino.latitud * Math.PI) / 180) *
      Math.sin(aLon / 2) *
      Math.sin(aLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return radioTierra * c
}

export function formatearDistancia(km: number | null | undefined): string {
  if (km === null || km === undefined || isNaN(km)) return '—'
  if (km < 1) return `${Math.max(km * 1000, 1).toFixed(0)} m`
  return `${km.toFixed(1)} km`
}

export function formatearMinutos(minutos: number | null | undefined): string {
  if (minutos === null || minutos === undefined || isNaN(minutos)) return '—'
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.round(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const restantes = Math.round(minutos % 60)
  return `${horas} h ${restantes} min`
}