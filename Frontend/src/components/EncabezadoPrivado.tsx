interface Props {
  pantalla: string
  administrador: boolean
}

const CONTENIDO: Record<string, { titulo: string; acento: string; descripcion: string }> = {
  inicio: { titulo: 'Tu mundo, en', acento: 'movimiento.', descripcion: 'Tu vehículo, tus estaciones y tu próximo recorrido. Todo en un mismo lugar.' },
  estaciones: { titulo: 'Conecta con tu', acento: 'camino.', descripcion: 'Explora las estaciones de carga y encuentra la ruta para seguir avanzando.' },
  talleres: { titulo: 'Cuidamos cada', acento: 'recorrido.', descripcion: 'Encuentra talleres autorizados y consulta sus servicios y disponibilidad.' },
  emergencias: { titulo: 'Asistencia a tu', acento: 'alcance.', descripcion: 'Accede a los contactos y las opciones de asistencia en el camino.' },
  panel: { titulo: 'Una visión.', acento: 'Todo Quantum.', descripcion: 'Consulta los indicadores y accede a la gestión de la plataforma.' },
  usuarios: { titulo: 'Personas que nos', acento: 'conectan.', descripcion: 'Busca, crea y administra las cuentas y sus roles desde un mismo espacio.' },
}

export default function EncabezadoPrivado({ pantalla, administrador }: Props) {
  const contenido = CONTENIDO[pantalla]
  if (!contenido) return null

  return (
    <header className="encabezado-privado" key={pantalla}>
      <div className="encabezado-privado__texto">
        <p className="encabezado-privado__etiqueta">QUANTUM / {administrador ? 'ADMINISTRACIÓN' : 'TU ESPACIO'}</p>
        <h1>{contenido.titulo} <span>{contenido.acento}</span></h1>
        <p className="encabezado-privado__descripcion">{contenido.descripcion}</p>
      </div>
      <svg className="encabezado-privado__orbita" viewBox="0 0 320 320" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="espectro-orbita" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b3c6e8" /><stop offset=".33" stopColor="#24dad9" />
            <stop offset=".66" stopColor="#1b66f8" /><stop offset="1" stopColor="#9e3db2" />
          </linearGradient>
        </defs>
        <ellipse cx="160" cy="160" rx="142" ry="110" stroke="url(#espectro-orbita)" strokeWidth="1" transform="rotate(-32 160 160)" />
      </svg>
    </header>
  )
}
