import { useVehiculos } from '../../hooks/useDatos'
import MedioVisual from '../../components/MedioVisual'
import { MULTIMEDIA } from '../../config/multimedia'
import CarruselInicio from '../../components/CarruselInicio'

interface PaginaInicioProps { alVerVehiculos: () => void }
export default function PaginaInicio({ alVerVehiculos }: PaginaInicioProps) {
  const { datos: modelos, cargando } = useVehiculos()
  return <div className="pagina-inicio editorial">
    <CarruselInicio alVerVehiculos={alVerVehiculos} />
    <section className="editorial__seccion" id="modelos">
      <p className="editorial__ceja">ENCUENTRA TU QUANTUM</p><h2>Diseñado para tu día a día.</h2>
      <p className="editorial__subtitulo">Conoce nuestra familia de vehículos eléctricos.</p>
      <div className="editorial__modelos">
        {modelos.slice(0, 3).map(modelo => <article key={modelo.id_vehiculo ?? modelo.Nombre_Modelo}>
          <MedioVisual imagen={modelo.imagen} descripcion={modelo.Nombre_Modelo} />
          <h3>{modelo.Nombre_Modelo}</h3><p>{modelo.Tipo}</p><p>{modelo.Autonomia}</p>
          <button className="editorial__enlace" onClick={alVerVehiculos}>Conocer el modelo →</button>
        </article>)}
      </div>
      {!modelos.length && <p className="editorial__estado" role="status">{cargando ? 'Cargando modelos…' : 'El catálogo no está disponible en este momento.'}</p>}
    </section>
    <section className="editorial__seccion editorial__lavado">
      <p className="editorial__ceja">A TU RITMO</p><h2>Tu próximo paso. A tu manera.</h2>
      <p className="editorial__subtitulo">Explora los modelos y consulta las opciones de compra y financiamiento.</p>
      <button className="boton boton--claro" onClick={alVerVehiculos}>Encontrar mi Quantum</button>
    </section>
    <section className="editorial__seccion">
      <p className="editorial__ceja">LA EXPERIENCIA QUANTUM</p><h2>Imagina el camino que viene.</h2>
      <p className="editorial__subtitulo">Diseño, tecnología y movilidad eléctrica en cada recorrido.</p>
      <MedioVisual imagen={MULTIMEDIA.experiencia} descripcion="La experiencia de conducir un Quantum" />
    </section>
  </div>
}
