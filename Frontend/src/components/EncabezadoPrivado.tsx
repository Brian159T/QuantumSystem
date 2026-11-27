interface Props {
  pantalla: string
  administrador: boolean
}

const CONTENIDO: Record<string, { titulo: string; acento: string; descripcion: string }> = {
  graficos: { titulo: 'Datos que inspiran', acento: 'decisiones.', descripcion: 'Una mirada a las reservas, la operación y la actividad de Quantum.' },
  proyeccion: { titulo: 'Anticipa el', acento: 'movimiento.', descripcion: 'Interpreta la tendencia reciente de reservas y prepara tus siguientes decisiones.' },
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
    </header>
  )
}
