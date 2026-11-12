import { coordenadaValida, type Coordenada } from '../utils/geo'

export interface RutaResultado {
  coordenadas: [number, number][]
  distanciaKm: number
  duracionMin: number | null
  porCalles: boolean
}

const URL_OSRM = (import.meta.env.VITE_OSRM_URL ?? 'https://router.project-osrm.org').replace(
  /\/$/,
  '',
)
let cola: Promise<unknown> = Promise.resolve()
let ultimaConsulta = 0

function serializar(punto: Coordenada): string {
  if (!coordenadaValida(punto)) throw new Error('Coordenadas inválidas')
  return `${punto.longitud},${punto.latitud}`
}

// Una cola por sesión evita ráfagas al cambiar de pantalla o destino.
async function consultar(ruta: string, signal?: AbortSignal): Promise<unknown> {
  const trabajo = cola
    .catch(() => undefined)
    .then(async () => {
      signal?.throwIfAborted()
      await new Promise((resolver) =>
        setTimeout(resolver, Math.max(0, 1100 - (Date.now() - ultimaConsulta))),
      )
      signal?.throwIfAborted()
      ultimaConsulta = Date.now()
      const control = new AbortController()
      const cancelar = () => control.abort()
      signal?.addEventListener('abort', cancelar, { once: true })
      const temporizador = setTimeout(cancelar, 15000)
      try {
        const respuesta = await fetch(`${URL_OSRM}${ruta}`, { signal: control.signal })
        if (!respuesta.ok) throw new Error('El servicio de rutas no está disponible')
        return await respuesta.json()
      } finally {
        clearTimeout(temporizador)
        signal?.removeEventListener('abort', cancelar)
      }
    })
  cola = trabajo
  return trabajo
}

export async function obtenerDestinoCercano(
  origen: Coordenada,
  destinos: Coordenada[],
  signal?: AbortSignal,
): Promise<number> {
  const puntos = [origen, ...destinos].map(serializar).join(';')
  const datos = (await consultar(
    `/table/v1/driving/${puntos}?sources=0&annotations=duration`,
    signal,
  )) as {
    code?: string
    durations?: (number | null)[][]
  }
  if (datos.code !== 'Ok' || datos.durations?.[0]?.length !== destinos.length + 1) {
    throw new Error('No se pudieron comparar los destinos en auto')
  }
  let indice = -1
  let menor = Infinity
  datos.durations[0].slice(1).forEach((duracion, posicion) => {
    if (
      typeof duracion === 'number' &&
      Number.isFinite(duracion) &&
      duracion >= 0 &&
      duracion < menor
    ) {
      indice = posicion
      menor = duracion
    }
  })
  if (indice === -1) throw new Error('No hay destinos accesibles en auto desde tu ubicación')
  return indice
}

export async function obtenerRuta(
  origen: Coordenada,
  destino: Coordenada,
  signal?: AbortSignal,
): Promise<RutaResultado> {
  const datos = (await consultar(
    `/route/v1/driving/${serializar(origen)};${serializar(destino)}?overview=full&geometries=geojson`,
    signal,
  )) as {
    code?: string
    routes?: { distance: number; duration: number; geometry: { coordinates: number[][] } }[]
  }
  const ruta = datos.routes?.[0]
  if (
    datos.code !== 'Ok' ||
    !ruta ||
    !Number.isFinite(ruta.distance) ||
    !Number.isFinite(ruta.duration) ||
    !Array.isArray(ruta.geometry?.coordinates) ||
    ruta.geometry.coordinates.length < 2 ||
    !ruta.geometry.coordinates.every(([lon, lat]) =>
      coordenadaValida({ latitud: lat, longitud: lon }),
    )
  ) {
    throw new Error('No se encontró una ruta en auto para este destino')
  }
  return {
    coordenadas: ruta.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distanciaKm: ruta.distance / 1000,
    duracionMin: ruta.duration / 60,
    porCalles: true,
  }
}
