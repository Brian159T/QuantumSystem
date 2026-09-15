import { useAuth } from '../context/AuthContext'

export default function Saludo() {
  const { usuario } = useAuth()

  const iniciales = (usuario?.nombre_usuario ?? 'U')
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  return (
    <div className="saludo">
      <span className="saludo__avatar">{iniciales}</span>
      <div className="saludo__texto">
        <div className="saludo__nombre">
          Hola, {usuario?.nombre_usuario?.split(' ')[0] ?? 'Usuario'}
        </div>
        <div className="saludo__rol">{usuario?.rol}</div>
      </div>
    </div>
  )
}