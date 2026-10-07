import { useEffect, useRef, type ReactNode } from 'react'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import 'leaflet/dist/leaflet.css'
import type { Coordenada } from '../utils/geo'

export interface LugarEnMapa {
  id: number | string
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  icono: ReactNode
  color: string
}

interface MapaLugarProps {
  lugares: LugarEnMapa[]
  ubicacion: Coordenada | null
  coordenadasRuta: [number, number][] | null
  rutaPorCalles?: boolean
  colorRuta?: string
  destinoId: number | string | null
  alSeleccionar: (lugar: LugarEnMapa) => void
}

const CENTRO_DEFECTO: [number, number] = [-17.3895, -66.1568]

function escaparTexto(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function iconoPunto(lugar: LugarEnMapa, activo: boolean): L.DivIcon {
  return L.divIcon({
    className: 'pin-mapa-envolvente',
    html: `
      <div class="pin-mapa${activo ? ' pin-mapa--activo' : ''}" style="--color-pin: ${lugar.color}">
        <div class="pin-mapa__circulo">
          <span class="pin-mapa__icono">${renderToStaticMarkup(lugar.icono)}</span>
        </div>
        <div class="pin-mapa__pico"></div>
      </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  })
}

const ICONO_USUARIO = L.divIcon({
  className: 'marcador-usuario',
  html: '<div class="marcador-usuario__halo"></div><div class="marcador-usuario__punto"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export default function MapaLugar({
  lugares,
  ubicacion,
  coordenadasRuta,
  rutaPorCalles,
  colorRuta = '#16a34a',
  destinoId,
  alSeleccionar,
}: MapaLugarProps) {
  const contenedorRef = useRef<HTMLDivElement | null>(null)
  const mapaRef = useRef<L.Map | null>(null)
  const capaMarcadoresRef = useRef<L.LayerGroup | null>(null)
  const capaUbicacionRef = useRef<L.LayerGroup | null>(null)
  const capaRutaRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return

    const mapa = L.map(contenedorRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa)

    capaMarcadoresRef.current = L.layerGroup().addTo(mapa)
    capaUbicacionRef.current = L.layerGroup().addTo(mapa)
    capaRutaRef.current = L.layerGroup().addTo(mapa)
    mapaRef.current = mapa

    const observador = new ResizeObserver(() => {
      mapa.invalidateSize()
    })
    observador.observe(contenedorRef.current)

    return () => {
      observador.disconnect()
      mapa.remove()
      mapaRef.current = null
    }
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    if (ubicacion) {
      mapa.setView([ubicacion.latitud, ubicacion.longitud], 14)
    } else if (lugares.length > 0) {
      mapa.setView([lugares[0].latitud, lugares[0].longitud], 13)
    } else {
      mapa.setView(CENTRO_DEFECTO, 12)
    }
  }, [ubicacion]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const capa = capaMarcadoresRef.current
    if (!capa) return

    capa.clearLayers()

    lugares.forEach((lugar) => {
      const marcador = L.marker([lugar.latitud, lugar.longitud], {
        icon: iconoPunto(lugar, lugar.id === destinoId),
        title: lugar.nombre,
        zIndexOffset: lugar.id === destinoId ? 500 : 0,
      })
      marcador.on('click', () => alSeleccionar(lugar))
      marcador.bindPopup(
        `<strong style="color:#1f2937">${escaparTexto(lugar.nombre)}</strong><br/><span style="color:#6b7280">${escaparTexto(lugar.direccion)}</span>`
      )
      marcador.addTo(capa)
    })
  }, [lugares, destinoId, alSeleccionar])

  useEffect(() => {
    const capa = capaUbicacionRef.current
    if (!capa) return

    capa.clearLayers()
    if (ubicacion) {
      L.marker([ubicacion.latitud, ubicacion.longitud], {
        icon: ICONO_USUARIO,
        zIndexOffset: 1000,
      }).addTo(capa)
    }
  }, [ubicacion])

  useEffect(() => {
    const capa = capaRutaRef.current
    const mapa = mapaRef.current
    if (!capa || !mapa) return

    capa.clearLayers()

    if (coordenadasRuta && coordenadasRuta.length >= 2) {
      L.polyline(coordenadasRuta, {
        color: colorRuta,
        weight: 5,
        opacity: 0.9,
        dashArray: rutaPorCalles ? undefined : '8 8',
        lineJoin: 'round',
      }).addTo(capa)

      mapa.fitBounds(L.latLngBounds(coordenadasRuta as [number, number][]), {
        padding: [50, 50],
        maxZoom: 16,
      })
    }
  }, [coordenadasRuta, rutaPorCalles, colorRuta])

  return (
    <div className="mapa-contenedor">
      <div ref={contenedorRef} className="mapa-leaflet" aria-label="Mapa interactivo" />
    </div>
  )
}