import { useState } from 'react'
import { Zap, Home, Car, CalendarCheck, PlugZap, Wrench, Siren, LayoutDashboard, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Saludo from '../components/Saludo'
import LoginButton from '../components/LoginButton'
import LogoutButton from '../components/LogoutButton'
import Chatbot from '../components/Chatbot'
import PaginaInicio from '../pages/invitado/PaginaInicio'
import PaginaVehiculos from '../pages/invitado/PaginaVehiculos'
import PaginaReservas from '../pages/invitado/PaginaReservas'
import PaginaInicioCliente from '../pages/cliente/PaginaInicioCliente'
import PaginaEstaciones from '../pages/cliente/PaginaEstaciones'
import PaginaTalleres from '../pages/cliente/PaginaTalleres'
import PaginaEmergencias from '../pages/cliente/PaginaEmergencias'
import PaginaPanel from '../pages/administrador/PaginaPanel'
import PaginaUsuarios from '../pages/administrador/PaginaUsuarios'
import type { Vehiculo } from '../types/Vehiculo'
import { INICIO_POR_ROL, NAVEGACION, type Rol } from './config'

interface NavegacionIcono {
  id: string
  etiqueta: string
  icono: string
}

const ICONOS: Record<string, React.ReactNode> = {
  inicio: <Home size={16} />,
  vehiculos: <Car size={16} />,
  reservas: <CalendarCheck size={16} />,
  estaciones: <PlugZap size={16} />,
  talleres: <Wrench size={16} />,
  emergencias: <Siren size={16} />,
  panel: <LayoutDashboard size={16} />,
  usuarios: <Users size={16} />,
}

function IconoNav({ nombre }: { nombre: string }) {
  return ICONOS[nombre] ?? <Home size={16} />
}

function Aplicacion() {
  const { esInvitado, esCliente, esAdministrador } = useAuth()

  const rol: Rol = esAdministrador ? 'administrador' : esCliente ? 'cliente' : 'invitado'
  const [pantalla, setPantalla] = useState<string>('inicio')
  const [vehiculoParaReservar, setVehiculoParaReservar] = useState<Vehiculo | null>(null)

  const navegacion: NavegacionIcono[] = NAVEGACION[rol]
  const idsValidos = navegacion.map((item) => item.id)
  const pantallaActual = idsValidos.includes(pantalla) ? pantalla : INICIO_POR_ROL[rol]

  const irA = (id: string) => setPantalla(id)

  return (
    <div className={`aplicacion aplicacion--${rol}`}>
      <header className="cabecera-sitio">
        <div className="cabecera-sitio__interior">
          <button className="cabecera-sitio__marca" onClick={() => irA(INICIO_POR_ROL[rol])}>
            <span className="cabecera-sitio__logo">
              <Zap size={18} />
            </span>
            <span className="cabecera-sitio__nombre">QUANTUM</span>
          </button>

          <nav className="cabecera-sitio__nav">
            {navegacion.map((item) => (
              <button
                key={item.id}
                className={`cabecera-sitio__enlace${
                  pantallaActual === item.id ? ' cabecera-sitio__enlace--activo' : ''
                }`}
                onClick={() => irA(item.id)}
              >
                <IconoNav nombre={item.icono} />
                {item.etiqueta}
              </button>
            ))}
          </nav>

          <div className="cabecera-sitio__acciones">
            {esInvitado ? (
              <LoginButton />
            ) : (
              <>
                <Saludo />
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="contenido">
        <div className="contenido__cuerpo">
          {rol === 'invitado' && pantallaActual === 'inicio' && (
            <PaginaInicio alVerVehiculos={() => irA('vehiculos')} />
          )}
          {rol === 'invitado' && pantallaActual === 'vehiculos' && (
            <PaginaVehiculos
              alReservar={(vehiculo) => {
                setVehiculoParaReservar(vehiculo)
                irA('reservas')
              }}
            />
          )}
          {rol === 'invitado' && pantallaActual === 'reservas' && (
            <PaginaReservas vehiculoInicial={vehiculoParaReservar} />
          )}

          {rol === 'cliente' && pantallaActual === 'inicio' && (
            <PaginaInicioCliente alVerEstaciones={() => irA('estaciones')} />
          )}
          {rol === 'cliente' && pantallaActual === 'estaciones' && <PaginaEstaciones />}
          {rol === 'cliente' && pantallaActual === 'talleres' && <PaginaTalleres />}
          {rol === 'cliente' && pantallaActual === 'emergencias' && <PaginaEmergencias />}

          {rol === 'administrador' && pantallaActual === 'panel' && <PaginaPanel />}
          {rol === 'administrador' && pantallaActual === 'usuarios' && <PaginaUsuarios />}
        </div>
      </main>

      <footer className="pie-sitio">
        <div className="pie-sitio__columna pie-sitio__bloque-marca">
          <span className="pie-sitio__logo">
            <Zap size={13} /> QUANTUM
          </span>
          <p className="pie-sitio__frase">Movilidad eléctrica para un futuro sostenible.</p>
          <div className="pie-sitio__copy">© {new Date().getFullYear()} Quantum Mobility · Voltus</div>
        </div>
        <nav className="pie-sitio__columna">
          <h4 className="pie-sitio__titulo">Producto</h4>
          <a href="#" className="pie-sitio__enlace">
            Vehículos
          </a>
          <a href="#" className="pie-sitio__enlace">
            Reservas
          </a>
          <a href="#" className="pie-sitio__enlace">
            Estaciones de carga
          </a>
        </nav>
        <nav className="pie-sitio__columna">
          <h4 className="pie-sitio__titulo">Empresa</h4>
          <a href="#" className="pie-sitio__enlace">
            Nosotros
          </a>
          <a href="#" className="pie-sitio__enlace">
            Sostenibilidad
          </a>
          <a href="#" className="pie-sitio__enlace">
            Noticias
          </a>
        </nav>
        <nav className="pie-sitio__columna">
          <h4 className="pie-sitio__titulo">Soporte</h4>
          <a href="#" className="pie-sitio__enlace">
            Ayuda
          </a>
          <a href="#" className="pie-sitio__enlace">
            Privacidad
          </a>
          <a href="#" className="pie-sitio__enlace">
            Términos
          </a>
        </nav>
      </footer>

      <Chatbot />
    </div>
  )
}

export default function AppNavigator() {
  return <Aplicacion />
}