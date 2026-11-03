import { useEffect, useRef, useState } from 'react'
import { CarFront } from 'lucide-react'

interface Props { imagen?: string; video?: string; descripcion: string }

export default function MedioVisual({ imagen, video, descripcion }: Props) {
  const reproductor = useRef<HTMLVideoElement>(null)
  const [fallo, setFallo] = useState(false)
  const [pausado, setPausado] = useState(false)
  useEffect(() => {
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    const actualizar = () => {
      if (preferencia.matches) { reproductor.current?.pause(); setPausado(true) }
    }
    actualizar()
    preferencia.addEventListener('change', actualizar)
    return () => preferencia.removeEventListener('change', actualizar)
  }, [])
  return <div className="medio-visual">
    {video && !fallo ? <>
      <video ref={reproductor} src={video} poster={imagen || undefined} autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} loop muted playsInline preload="metadata" aria-label={descripcion} onError={() => setFallo(true)} onPlay={() => setPausado(false)} onPause={() => setPausado(true)} />
      <button className="medio-visual__control" onClick={() => {
        const elemento = reproductor.current
        if (elemento?.paused) void elemento.play().catch(() => setPausado(true))
        else elemento?.pause()
      }}>{pausado ? 'Reproducir video' : 'Pausar video'}</button>
    </> : imagen && !fallo ? <img src={imagen} alt={descripcion} onError={() => setFallo(true)} /> :
      <div className="medio-visual__reserva" role="img" aria-label={descripcion}>
        <CarFront size={56} strokeWidth={1} aria-hidden="true" /><span>{descripcion}</span>
      </div>}
  </div>
}
