import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { ReporteGraficos, TablaReporte, TipoReporte } from '../Model/ReportesService';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.addVirtualFileSystem(pdfFonts);

const VERDE = '#2fb676';
const VERDE_OSCURO = '#145c3c';
const FONDO = '#edf7f5';

const TITULOS: Record<TipoReporte, { titulo: string; categoria: string; descripcion: string }> = {
  reservas: {
    titulo: 'Evolucion de reservas',
    categoria: 'Reservas y ventas',
    descripcion: 'Tabla de reservas registradas durante los ultimos 30 dias.',
  },
  modelo: {
    titulo: 'Modelo mas reservado',
    categoria: 'Preferencia de modelos',
    descripcion: 'Ranking de modelos segun sus reservas registradas.',
  },
  estaciones: {
    titulo: 'Estaciones de carga',
    categoria: 'Red de carga',
    descripcion: 'Distribucion de estaciones segun el estado registrado.',
  },
  red: {
    titulo: 'Grafico de estaciones de carga',
    categoria: 'Red de carga',
    descripcion: 'Resumen tabular del estado de la red de carga.',
  },
};

function descripcion(reporte: ReporteGraficos, tipo: TipoReporte): string[] {
  if ((tipo === 'reservas' || tipo === 'modelo') && !reporte.reservas.total)
    return ['No hay reservas en el periodo seleccionado.'];
  if (tipo === 'modelo')
    return [
      `${reporte.reservas.modelosPrincipales.join(', ')} lidera el ranking con ${reporte.reservas.maximoModelo} reservas. Este resultado orienta la priorizacion comercial.`,
    ];
  if (tipo === 'reservas')
    return [
      `Se registraron ${reporte.reservas.total} reservas. ${reporte.reservas.pendientes} permanecen pendientes.`,
      `El mayor interes se concentra en ${reporte.reservas.modelosPrincipales.join(', ')} y el maximo diario fue de ${reporte.reservas.maximoDia} reservas.`,
    ];
  if (!reporte.estaciones.total) return ['No hay estaciones registradas para analizar.'];
  return [
    `${reporte.estaciones.disponibles} de ${reporte.estaciones.total} estaciones tienen estado Disponible (${Math.round((reporte.estaciones.disponibles / reporte.estaciones.total) * 100)} %).`,
    reporte.estaciones.sinEstado
      ? `Conviene completar el estado de ${reporte.estaciones.sinEstado} estaciones.`
      : 'Todas las estaciones tienen un estado registrado.',
  ];
}

function tablaPdf(tabla: TablaReporte | undefined): any {
  if (!tabla || !tabla.filas.length)
    return { text: 'No hay registros para este periodo.', color: '#6d7b75', margin: [0, 8, 0, 16] };
  return {
    table: {
      headerRows: 1,
      widths: tabla.encabezados.map(() => '*'),
      body: [
        tabla.encabezados.map((text) => ({ text, bold: true, color: '#ffffff' })),
        ...tabla.filas.map((fila) => fila.map((text) => ({ text: text || '-', fontSize: 9 }))),
      ],
    },
    layout: {
      fillColor: (fila: number) => (fila === 0 ? VERDE_OSCURO : fila % 2 === 0 ? '#f5faf7' : null),
      hLineColor: '#cfe0d7',
      vLineColor: '#cfe0d7',
    },
    margin: [0, 8, 0, 18],
  };
}

export async function descargarReportePdf(
  reporte: ReporteGraficos,
  tipo: TipoReporte
): Promise<void> {
  const metadatos = TITULOS[tipo];
  const contenido = descripcion(reporte, tipo);
  const documento: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [36, 54, 36, 38],
    background: [{ canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 24, color: VERDE_OSCURO }] }],
    content: [
      { text: 'QUANTUM', style: 'marca' },
      { text: 'CENTRO DE ANALISIS', style: 'ceja' },
      { text: metadatos.titulo, style: 'titulo' },
      { text: metadatos.descripcion, style: 'subtitulo' },
      {
        columns: [
          { text: metadatos.categoria },
          { text: new Date(reporte.actualizado).toLocaleString('es'), alignment: 'right' },
        ],
        margin: [0, 20, 0, 16],
      },
      { text: 'Tabla del analisis', style: 'seccion' },
      tablaPdf(reporte.tablas[tipo]),
      { text: 'Descripcion del analisis', style: 'seccion' },
      {
        stack: contenido.map((text) => ({ text, margin: [0, 0, 0, 8] })),
        fillColor: FONDO,
        margin: [0, 0, 0, 18],
      },
      {
        text: 'Fuente: API de Quantum sobre PostgreSQL QuantumSystemDB. No se incluyen datos personales.',
        style: 'nota',
      },
    ],
    header: {
      text: 'REPORTE ADMINISTRATIVO - QUANTUM MOBILITY',
      alignment: 'right',
      margin: [36, 28, 36, 0],
      fontSize: 8,
      color: '#6d7b75',
    },
    footer: (pagina: number, paginas: number) => ({
      columns: [
        { text: 'Uso interno', color: '#6d7b75' },
        { text: `Pagina ${pagina} de ${paginas}`, alignment: 'right', color: '#6d7b75' },
      ],
      margin: [36, 0, 36, 20],
      fontSize: 8,
    }),
    styles: {
      marca: { color: VERDE, fontSize: 24, bold: true, characterSpacing: 4 },
      ceja: {
        color: '#4d9fff',
        fontSize: 9,
        bold: true,
        characterSpacing: 2,
        margin: [0, 5, 0, 14],
      },
      titulo: { color: '#18212b', fontSize: 23, bold: true },
      subtitulo: { color: '#53645d', fontSize: 10 },
      seccion: { color: VERDE_OSCURO, fontSize: 14, bold: true, margin: [0, 8, 0, 8] },
      nota: { color: '#6d7b75', fontSize: 8, italics: true },
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, color: '#25312c' },
  };
  const base64 = await pdfMake.createPdf(documento).getBase64();
  const uri = `${FileSystem.cacheDirectory}reporte-quantum-${tipo}-${Date.now()}.pdf`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Descargar reporte PDF',
    });
}
