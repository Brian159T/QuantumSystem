import { calcularDistanciaKm, type Coordenada } from '../utils/geo'

export interface RutaResultado {
  coordenadas: [number, number][]
  distanciaKm: number
  duracionMin: number | null
  porCalles: boolean
}

const URL_OSRM = 'https://router.project-osrm.org/route/v1/driving'

export async function obtenerRuta(
  origen: Coordenada,
  destino: Coordenada
): Promise<RutaResultado> {
  try {
    const respuesta = await fetch(
      `${URL_OSRM}/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=full&geometries=geojson`
    )
    if (!respuesta.ok) throw new Error('No se pudo consultar la ruta')

    const datos = (await respuesta.json()) as {
      code?: string
      routes?: { distance: number; duration: number; geometry: { coordinates: number[][] } }[]
    }

    if (datos?.code !== 'Ok' || !datos.routes?.[0]) {
      throw new Error('OSRM no devolvió una ruta válida')
    }

    const ruta = datos.routes[0]
    return {
      coordenadas: ruta.geometry.coordinates.map(
        ([lon, lat]) => [lat, lon] as [number, number]
      ),
      distanciaKm: ruta.distance / 1000,
      duracionMin: ruta.duration / 60,
      porCalles: true,
    }
  } catch {
    // Sin rutas por calles: se cae a la línea recta con la distancia real
    // (Haversine) calculada desde las coordenadas reales, igual que hace el mobile.
    return {
      coordenadas: [
        [origen.latitud, origen.longitud],
        [destino.latitud, destino.longitud],
      ],
      distanciaKm: calcularDistanciaKm(origen, destino),
      duracionMin: null,
      porCalles: false,
    }
  }
}