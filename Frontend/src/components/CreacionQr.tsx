import { Download, QrCode } from 'lucide-react'
import * as QRCode from 'qrcode'
import { useEffect, useState } from 'react'

interface Props { codigo: string }

export default function CreacionQr({ codigo }: Props) {
  const [imagen, setImagen] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    const texto = String(codigo || '').trim()
    setImagen('')
    setError('')
    if (!texto) {
      setError('No se recibió el código de reserva.')
      return () => { activo = false }
    }
    void QRCode.toDataURL(texto, { width: 260, margin: 2, errorCorrectionLevel: 'M' })
      .then((url) => { if (activo) setImagen(url) })
      .catch(() => { if (activo) setError('No se pudo generar el código QR. Puedes conservar el código de reserva.') })
    return () => { activo = false }
  }, [codigo])

  return (
    <section className="creacion-qr" aria-labelledby="titulo-qr">
      <div className="creacion-qr__encabezado">
        <span className="creacion-qr__icono"><QrCode size={22} /></span>
        <div><p className="creacion-qr__ceja">CONFIRMACIÓN DIGITAL</p><h3 id="titulo-qr">Este es el QR de tu reserva</h3></div>
      </div>
      {imagen && <img className="creacion-qr__imagen" src={imagen} alt={`Código QR de la reserva ${codigo}`} />}
      {error && <p className="creacion-qr__error" role="alert">{error}</p>}
      <p>Escanea este código para identificar tu reserva: <strong>{codigo}</strong></p>
      {imagen && <a className="boton boton--primario boton--compacto creacion-qr__descarga" href={imagen} download={`reserva-${codigo}.png`}><Download size={15} /> Descargar QR</a>}
    </section>
  )
}
