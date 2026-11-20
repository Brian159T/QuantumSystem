import { useVehiculos } from '../../hooks/useDatos'
import MedioVisual from '../../components/MedioVisual'
import { MULTIMEDIA } from '../../config/multimedia'
import CarruselInicio from '../../components/CarruselInicio'
import imagenEquteVolante from '../../../assets/Equte volante.png'
import imagenNexusPantalla from '../../../assets/Pantalla nexus plus.png'
import imagenE4Botones from '../../../assets/E4 Montanero botones.png'

interface PaginaInicioProps { alVerVehiculos: () => void }

interface DetalleModelo { imagen: string; alt: string; texto: string }

const DETALLES_MODELO: Record<'equte' | 'nexus' | 'e4', DetalleModelo> = {
  equte: {
    imagen: imagenEquteVolante,
    alt: 'Volante de la KAIYI EQUTE',
    texto: 'Volante envolvente y mandos al alcance para una conducción cómoda en cada trayecto.',
  },
  nexus: {
    imagen: imagenNexusPantalla,
    alt: 'Pantalla de la NEXUS PLUS',
    texto: 'Pantalla de última generación con información, navegación y entretenimiento en alta definición.',
  },
  e4: {
    imagen: imagenE4Botones,
    alt: 'Botones interiores de la E4 MONTAÑERO',
    texto: 'Botones y materiales cuidados al detalle para que el confort te acompañe dentro del vehículo.',
  },
}

function detalleModelo(nombre: string): DetalleModelo | null {
  if (nombre.toLowerCase().replace(/[^a-z]/g, '').includes('equte')) return DETALLES_MODELO.equte
  if (/nexus\s*plus/i.test(nombre)) return DETALLES_MODELO.nexus
  if (/\be\s*-?\s*4\b/i.test(nombre)) return DETALLES_MODELO.e4
  return null
}

export default function PaginaInicio({ alVerVehiculos }: PaginaInicioProps) {
  const { datos: modelos, cargando } = useVehiculos()
  return <div className="pagina-inicio editorial">
    <MedioVisual
      video={MULTIMEDIA.videoInicio}
      imagen={MULTIMEDIA.portadaVideo}
      descripcion="Quantum E-QUTE en movimiento"
      mostrarControl={false}
    />
    <section className="editorial__seccion" aria-labelledby="titulo-familia-quantum">
      <p className="editorial__ceja">ENCUENTRA TU QUANTUM</p><h2 id="titulo-familia-quantum">Diseñado para tu día a día.</h2>
      <p className="editorial__subtitulo">Conoce nuestra familia de vehículos eléctricos.</p>
    </section>
    <CarruselInicio />
    <MedioVisual
      video={MULTIMEDIA.videoCarga}
      descripcion="Carga eléctrica de un vehículo Quantum"
      mostrarControl={false}
    />
    <section className="editorial__seccion" id="modelos">
      <div className="editorial__modelos">
        {modelos.slice(0, 3).map(modelo => {
          const detalle = detalleModelo(modelo.Nombre_Modelo)
          return <article key={modelo.id_vehiculo ?? modelo.Nombre_Modelo} className={detalle ? 'editorial__modelo--detalle' : undefined}>
            <MedioVisual imagen={detalle?.imagen ?? modelo.imagen} descripcion={detalle?.alt ?? modelo.Nombre_Modelo} />
            <h3>{modelo.Nombre_Modelo}</h3><p>{modelo.Tipo}</p><p>{modelo.Autonomia}</p>
            {detalle && <p className="editorial__modelo-detalle">{detalle.texto}</p>}
            <button className="editorial__enlace" onClick={alVerVehiculos}>Conocer el modelo →</button>
          </article>
        })}
      </div>
      {!modelos.length && <p className="editorial__estado" role="status">{cargando ? 'Cargando modelos…' : 'El catálogo no está disponible en este momento.'}</p>}
    </section>
    <section className="editorial__seccion editorial__lavado">
      <p className="editorial__ceja">A TU RITMO</p><h2>Tu próximo paso. A tu manera.</h2>
      <p className="editorial__subtitulo">Explora los modelos y consulta las opciones de compra y financiamiento.</p>
      <button className="boton boton--claro" onClick={alVerVehiculos}>Encontrar mi Quantum</button>
    </section>
    <section className="editorial__seccion editorial__seccion--video" aria-labelledby="titulo-experiencia-quantum">
      <div className="editorial__seccion-contenido">
        <p className="editorial__ceja">LA EXPERIENCIA QUANTUM</p><h2 id="titulo-experiencia-quantum">Imagina el camino que viene.</h2>
        <p className="editorial__subtitulo">Diseño, tecnología y movilidad eléctrica en cada recorrido.</p>
      </div>
      <MedioVisual video={MULTIMEDIA.videoExperiencia} descripcion="La experiencia de conducir un Quantum" mostrarControl={false} />
    </section>
  </div>
}
