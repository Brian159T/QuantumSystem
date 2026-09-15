import { useState } from 'react'
import { Siren, Phone, MapPin, PhoneCall, ShieldAlert, Clock } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'

const CONTACTOS = [
  { nombre: 'Emergencias', numero: '911', tipo: 'Llamar' },
  { nombre: 'Asistencia vial', numero: '800 124 112', tipo: 'Llamar' },
  { nombre: 'Bomberos', numero: '119', tipo: 'Llamar' },
  { nombre: 'Policía', numero: '110', tipo: 'Llamar' },
]

export default function PaginaEmergencias() {
  const [sosActivo, setSosActivo] = useState(false)

  return (
    <div>
      <section className="seccion seccion--centrada">
        <div
          className={`boton-sos${sosActivo ? ' boton-sos--activo' : ''}`}
          onClick={() => setSosActivo((previo) => !previo)}
        >
          <span className="boton-sos__pulso" />
          <Siren size={40} />
          <span className="boton-sos__etiqueta">SOS</span>
          {sosActivo && <span className="boton-sos__estado">Alerta enviada · ayuda en camino</span>}
        </div>
        <p className="ayuda-texto">
          {sosActivo
            ? 'Tu ubicación fue enviada a emergencias.'
            : 'Presiona y mantén para enviar tu ubicación a emergencias.'}
        </p>
      </section>

      <section className="seccion">
        <div className="tarjeta" style={{ background: 'var(--azul-suave)', border: 'none' }}>
          <div className="tarjeta__encabezado">
            <div>
              <div className="tarjeta__titulo" style={{ color: 'var(--azul)' }}>
                Servicio de salud
              </div>
              <div className="tarjeta__subtitulo" style={{ color: 'var(--texto-suave)' }}>
                Atención médica de emergencia las 24h
              </div>
            </div>
            <ShieldAlert size={24} style={{ color: 'var(--azul)' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="boton boton--azul">
              <PhoneCall size={15} />
              Llamar al 911
            </button>
            <button className="boton boton--claro">
              <MapPin size={15} />
              Ver hospitales
            </button>
          </div>
        </div>
      </section>

      <section className="seccion">
        <EncabezadoSeccion titulo="Contactos de emergencia" />
        <div className="lista-resultados">
          {CONTACTOS.map((contacto) => (
            <a
              key={contacto.nombre}
              href={`tel:${contacto.numero}`}
              className="tarjeta-contacto"
            >
              <span className="tarjeta-contacto__icono">
                <Phone size={18} />
              </span>
              <span className="tarjeta-contacto__info">
                <span className="tarjeta-contacto__nombre">{contacto.nombre}</span>
                <span className="tarjeta-contacto__numero">{contacto.numero}</span>
              </span>
              <span className="tarjeta-contacto__accion">{contacto.tipo}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="seccion">
        <div className="consejo">
          <span className="consejo__icono">
            <Clock size={18} />
          </span>
          <span>
            Compartir tu ubicación en tiempo real ayuda a que la asistencia llegue más rápido.
          </span>
        </div>
      </section>
    </div>
  )
}