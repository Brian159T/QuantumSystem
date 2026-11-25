import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { AnalisisReservas } from '../services/analisisReservasService'
import type { AnalisisEstaciones } from '../services/analisisEstacionesService'
import type { TablaReporte } from '../services/reportesService'

pdfMake.addVirtualFileSystem(pdfFonts)

export type TipoReporte = 'reservas' | 'estaciones' | 'modelo' | 'red'
interface DatosReporte { reservas: AnalisisReservas | null; estaciones: AnalisisEstaciones | null; tablas: Record<TipoReporte, TablaReporte> | null }
interface OpcionesReporte { tipo: TipoReporte; datos: DatosReporte }

const VERDE = '#2fb676'
const VERDE_OSCURO = '#145c3c'
const AZUL = '#4d9fff'
const FONDO = '#edf7f5'

const PANELES: Record<TipoReporte, { titulo: string; categoria: string; descripcion: string }> = {
  reservas: { titulo: 'Evolucion de reservas', categoria: 'Reservas y ventas', descripcion: 'Tabla de reservas registradas durante los ultimos 30 dias.' },
  modelo: { titulo: 'Modelo mas reservado', categoria: 'Preferencia de modelos', descripcion: 'Ranking de modelos segun sus reservas registradas.' },
  estaciones: { titulo: 'Estaciones de carga', categoria: 'Red de carga', descripcion: 'Distribucion de estaciones segun el estado registrado.' },
  red: { titulo: 'Grafico de estaciones de carga', categoria: 'Red de carga', descripcion: 'Resumen tabular del estado de la red de carga.' },
}

function interpretacion(datos: DatosReporte, tipo: TipoReporte): string[] {
  const reservas = datos.reservas
  const estaciones = datos.estaciones
  if ((tipo === 'reservas' || tipo === 'modelo') && reservas) {
    if (!reservas.total) return ['No hay reservas en el periodo seleccionado; no es posible identificar preferencias ni picos de actividad.']
    if (tipo === 'modelo') return [`${reservas.modelosPrincipales.join(', ')} lidera${reservas.modelosPrincipales.length > 1 ? 'n' : ''} el ranking con ${reservas.maximoModelo} reserva${reservas.maximoModelo === 1 ? '' : 's'}. La tabla sirve para orientar la priorizacion comercial, pero no representa ingresos ni una proyeccion futura.`]
    return [`La tabla contiene ${reservas.total} reservas del periodo analizado. ${reservas.pendientes ? `Hay ${reservas.pendientes} pendiente${reservas.pendientes === 1 ? '' : 's'} que requiere${reservas.pendientes === 1 ? '' : 'n'} seguimiento.` : 'No se observan reservas pendientes.'}`, `El mayor interes se concentra en ${reservas.modelosPrincipales.join(', ')}, con ${reservas.maximoModelo} reserva${reservas.maximoModelo === 1 ? '' : 's'}. El maximo diario fue de ${reservas.maximoDia} reserva${reservas.maximoDia === 1 ? '' : 's'}.`]
  }
  if ((tipo === 'estaciones' || tipo === 'red') && estaciones) {
    if (!estaciones.total) return ['No hay estaciones registradas; se necesitan datos para interpretar la red de carga.']
    return [`La tabla registra ${estaciones.total} estaciones; ${estaciones.disponibles} tienen estado Disponible (${Math.round(estaciones.disponibles / estaciones.total * 100)} %).`, `${estaciones.sinEstado ? `Conviene completar el estado de ${estaciones.sinEstado} estacion${estaciones.sinEstado === 1 ? '' : 'es'}.` : 'Todas las estaciones tienen un estado registrado.'} El estado del catalogo no mide ocupacion en tiempo real.`]
  }
  return ['Los datos analiticos no estan disponibles en este momento.']
}

function tablaPdf(tabla: TablaReporte | undefined): Content {
  if (!tabla || tabla.filas.length === 0) return { text: 'No hay registros para este periodo.', color: '#6d7b75', margin: [0, 6, 0, 18] }
  const encabezado = tabla.encabezados.map(texto => ({ text: texto, style: 'encabezadoTabla' }))
  const filas = tabla.filas.map(fila => fila.map(valor => ({ text: valor || '-', style: 'celdaTabla' })))
  return { table: { headerRows: 1, widths: tabla.encabezados.map(() => '*'), body: [encabezado, ...filas] }, layout: { fillColor: (fila: number) => fila === 0 ? VERDE_OSCURO : fila % 2 === 0 ? '#f5faf7' : null, hLineColor: '#cfe0d7', vLineColor: '#cfe0d7' }, margin: [0, 6, 0, 18] }
}

export function abrirReporteGrafico({ tipo, datos }: OpcionesReporte): void {
  const panel = PANELES[tipo]
  const tabla = datos.tablas?.[tipo]
  const interpretaciones = interpretacion(datos, tipo)
  const actualizado = datos.reservas?.actualizado || datos.estaciones?.actualizado || new Date().toLocaleTimeString('es-VE')
  const contenido: Content[] = [
    { text: 'QUANTUM', style: 'marca' },
    { text: 'CENTRO DE ANALISIS', style: 'ceja' },
    { text: panel.titulo, style: 'titulo' },
    { text: panel.descripcion, style: 'subtitulo' },
    { columns: [{ stack: [{ text: 'CATEGORIA', style: 'metaEtiqueta' }, { text: panel.categoria }] }, { stack: [{ text: 'ACTUALIZADO', style: 'metaEtiqueta' }, { text: actualizado }], alignment: 'right' }], margin: [0, 24, 0, 18] },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: VERDE }], margin: [0, 0, 0, 18] },
    { text: 'Datos de la grafica', style: 'seccion' },
    tablaPdf(tabla),
    { text: 'Descripcion del analisis', style: 'seccion' },
    { stack: interpretaciones.map(texto => ({ text: texto, margin: [0, 0, 0, 8] })), fillColor: FONDO, margin: [0, 0, 0, 18] },
    { text: 'Fuente: PostgreSQL QuantumSystemDB mediante el endpoint protegido de reportes. La tabla usa los datos que alimentan el analisis del panel correspondiente.', style: 'nota' },
  ]
  const documento: TDocumentDefinitions = {
    pageSize: 'A4', pageMargins: [42, 58, 42, 42], background: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 24, color: VERDE_OSCURO }] }], content: contenido,
    header: { text: 'REPORTE ADMINISTRATIVO - QUANTUM MOBILITY', alignment: 'right', margin: [42, 30, 42, 0], fontSize: 8, color: '#6d7b75' },
    footer: (pagina, paginas) => ({ columns: [{ text: 'Uso interno', color: '#6d7b75' }, { text: `Pagina ${pagina} de ${paginas}`, alignment: 'right', color: '#6d7b75' }], margin: [42, 0, 42, 22], fontSize: 8 }),
    styles: { marca: { color: VERDE, fontSize: 24, bold: true, characterSpacing: 4 }, ceja: { color: AZUL, fontSize: 9, bold: true, characterSpacing: 2, margin: [0, 5, 0, 14] }, titulo: { color: '#18212b', fontSize: 25, bold: true, margin: [0, 0, 0, 8] }, subtitulo: { color: '#53645d', fontSize: 11, margin: [0, 0, 0, 4] }, metaEtiqueta: { color: VERDE_OSCURO, fontSize: 8, bold: true, characterSpacing: 1, margin: [0, 0, 0, 3] }, seccion: { color: VERDE_OSCURO, fontSize: 14, bold: true, margin: [0, 10, 0, 10] }, encabezadoTabla: { color: '#ffffff', bold: true, fontSize: 9 }, celdaTabla: { color: '#25312c', fontSize: 9 }, nota: { color: '#6d7b75', fontSize: 8, italics: true, margin: [0, 8, 0, 0] } },
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#25312c' },
  }
  pdfMake.createPdf(documento).download(`reporte-quantum-${tipo}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
