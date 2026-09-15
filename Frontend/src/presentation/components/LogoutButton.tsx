import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LogoutButton() {
  const { cerrarSesion } = useAuth()

  return (
    <button
      className="boton boton--secundario boton--compacto"
      onClick={cerrarSesion}
      title="Cerrar sesión"
    >
      <LogOut size={15} />
      Salir
    </button>
  )
}