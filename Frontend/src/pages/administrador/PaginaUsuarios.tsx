import { useMemo, useState } from 'react'
import { Search, UserPlus, Users, ShieldCheck, Trash2, X } from 'lucide-react'
import EncabezadoSeccion from '../../components/EncabezadoSeccion'
import { useUsuarios, useRoles } from '../../hooks/useDatos'
import { crearUsuario, eliminarUsuario } from '../../services/usuariosService'
import { obtenerIniciales } from '../../utils/iniciales'
import type { UsuarioAdministracion } from '../../types/Usuario'

interface NuevoUsuario {
  nombre: string
  correo: string
  contrasena: string
  idRol: number | null
}

const FORMULARIO_INICIAL: NuevoUsuario = { nombre: '', correo: '', contrasena: '', idRol: null }

export default function PaginaUsuarios() {
  const { datos: usuarios, recargar } = useUsuarios()
  const { datos: roles } = useRoles()
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('Todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState<NuevoUsuario>(FORMULARIO_INICIAL)
  const [guardando, setGuardando] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')
  const [confirmarEliminar, setConfirmarEliminar] = useState<UsuarioAdministracion | null>(null)

  const mapaRoles = useMemo(() => {
    return new Map(roles.map((rol) => [rol.id_rol, rol.Nombre]))
  }, [roles])

  const opcionesFiltro = useMemo(() => {
    return ['Todos', ...new Set(roles.map((rol) => rol.Nombre))]
  }, [roles])

  const filtrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const coincideBusqueda =
        busqueda.trim().length === 0 ||
        usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase())
      const nombreRol = mapaRoles.get(usuario.id_rol) ?? usuario.role
      const coincideRol = filtroRol === 'Todos' || nombreRol === filtroRol
      return coincideBusqueda && coincideRol
    })
  }, [usuarios, busqueda, filtroRol, mapaRoles])

  const estadisticas = useMemo(() => {
    return {
      total: usuarios.length,
      administradores: usuarios.filter((usuario) => usuario.role === 'Administrador').length,
    }
  }, [usuarios])

  const crearUsuarioNuevo = async () => {
    setErrorAccion('')
    if (
      !formulario.nombre.trim() ||
      !formulario.correo.trim() ||
      !formulario.contrasena ||
      formulario.idRol === null
    ) {
      setErrorAccion('Completa todos los campos y selecciona un rol')
      return
    }
    setGuardando(true)
    try {
      await crearUsuario({
        nombre_usuario: formulario.nombre.trim(),
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
        id_rol: formulario.idRol,
      })
      await recargar()
      setFormulario(FORMULARIO_INICIAL)
      setMostrarFormulario(false)
    } catch (error) {
      setErrorAccion(error instanceof Error ? error.message : 'No se pudo crear el usuario')
    } finally {
      setGuardando(false)
    }
  }

  const abrirFormulario = () => {
    setErrorAccion('')
    const cliente = roles.find((rol) => rol.Nombre.toLowerCase().includes('client'))
    setFormulario({ ...FORMULARIO_INICIAL, idRol: cliente?.id_rol ?? null })
    setMostrarFormulario(true)
  }

  const eliminar = async () => {
    if (!confirmarEliminar) return
    setErrorAccion('')
    setGuardando(true)
    try {
      await eliminarUsuario(confirmarEliminar.id)
      await recargar()
      setConfirmarEliminar(null)
    } catch (error) {
      setErrorAccion(error instanceof Error ? error.message : 'No se pudo eliminar el usuario')
      setConfirmarEliminar(null)
    } finally {
      setGuardando(false)
    }
  }

  const estadisticasVista = [
    { etiqueta: 'Total usuarios', valor: estadisticas.total, icono: Users, color: 'var(--verde)' },
    {
      etiqueta: 'Administradores',
      valor: estadisticas.administradores,
      icono: ShieldCheck,
      color: 'var(--azul)',
    },
  ]

  return (
    <div>
      <div className="tarjeta" style={{ marginBottom: 20 }}>
        <div className="tarjeta__encabezado">
          <div>
            <div className="tarjeta__titulo">Gestión de usuarios</div>
            <div className="tarjeta__subtitulo">Administra las cuentas registradas en la plataforma</div>
          </div>
          <button className="boton boton--primario" onClick={abrirFormulario}>
            <UserPlus size={16} />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="fila-estadisticas">
        {estadisticasVista.map((estadistica) => (
          <div key={estadistica.etiqueta} className="tarjeta-estadistica">
            <div
              className="tarjeta-estadistica__icono"
              style={{ background: `${estadistica.color}18`, color: estadistica.color }}
            >
              <estadistica.icono size={22} />
            </div>
            <div>
              <div className="tarjeta-estadistica__valor">{estadistica.valor}</div>
              <div className="tarjeta-estadistica__etiqueta">{estadistica.etiqueta}</div>
            </div>
          </div>
        ))}
      </div>

      {mostrarFormulario && (
        <div className="tarjeta" style={{ marginBottom: 20 }}>
          <div className="tarjeta__encabezado">
            <div>
              <div className="tarjeta__titulo">Nuevo usuario</div>
              <div className="tarjeta__subtitulo">El usuario podrá iniciar sesión con estas credenciales</div>
            </div>
            <button className="boton boton--icono" onClick={() => setMostrarFormulario(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="formulario-nuevo-usuario">
            <div className="campo">
              <label className="campo__etiqueta">Nombre completo</label>
              <input
                className="campo__entrada"
                placeholder="Ej. Andrea Suárez"
                value={formulario.nombre}
                onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              />
            </div>
            <div className="campo">
              <label className="campo__etiqueta">Correo electrónico</label>
              <input
                className="campo__entrada"
                placeholder="Ej. andrea@mail.com"
                value={formulario.correo}
                onChange={(evento) => setFormulario({ ...formulario, correo: evento.target.value })}
              />
            </div>
            <div className="campo">
              <label className="campo__etiqueta">Contraseña</label>
              <input
                className="campo__entrada"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formulario.contrasena}
                onChange={(evento) => setFormulario({ ...formulario, contrasena: evento.target.value })}
              />
            </div>
            <div className="campo">
              <label className="campo__etiqueta">Rol</label>
              <select
                className="campo__entrada"
                value={formulario.idRol ?? ''}
                onChange={(evento) =>
                  setFormulario({ ...formulario, idRol: Number(evento.target.value) })
                }
              >
                <option value="" disabled>
                  {roles.length === 0 ? 'No hay roles disponibles' : 'Selecciona un rol'}
                </option>
                {roles.map((rol) => (
                  <option key={rol.id_rol} value={rol.id_rol}>
                    {rol.Nombre}
                  </option>
                ))}
              </select>
            </div>
            <button className="boton boton--primario" onClick={crearUsuarioNuevo} disabled={guardando}>
              <UserPlus size={16} />
              {guardando ? 'Guardando...' : 'Crear usuario'}
            </button>
          </div>
        </div>
      )}

      <div className="buscador" style={{ marginTop: 28, marginBottom: 20 }}>
        <div className="buscador__campo">
          <span className="buscador__icono">
            <Search size={16} />
          </span>
          <input
            className="buscador__entrada"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
      </div>

      <div className="fila-filtros" style={{ marginBottom: 18 }}>
        {opcionesFiltro.map((rol) => (
          <button
            key={rol}
            className={`chip${filtroRol === rol ? ' chip--activo' : ''}`}
            onClick={() => setFiltroRol(rol)}
          >
            {rol}
          </button>
        ))}
      </div>

      {errorAccion && <div className="alerta alerta--error" style={{ marginBottom: 18 }}>{errorAccion}</div>}

      <section className="seccion">
        <EncabezadoSeccion titulo="Lista de usuarios" contador={`${filtrados.length} resultados`} />
        <div className="tabla-usuarios">
          <div className="tabla-usuarios__fila tabla-usuarios__fila--encabezado">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Acciones</span>
          </div>
          {filtrados.map((usuario) => (
            <div className="tabla-usuarios__fila" key={usuario.id}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="avatar">{obtenerIniciales(usuario.name)}</span>
                <span>
                  <span className="tabla-usuarios__nombre">{usuario.name}</span>
                  <br />
                  <span className="tabla-usuarios__correo">{usuario.email}</span>
                </span>
              </span>
              <span>
                <span className="insignia insignia--azul">
                  {mapaRoles.get(usuario.id_rol) ?? usuario.role}
                </span>
              </span>
              <span className="tabla-usuarios__acciones">
                <button
                  className="boton boton--icono boton--peligro"
                  title="Eliminar"
                  onClick={() => setConfirmarEliminar(usuario)}
                >
                  <Trash2 size={17} />
                </button>
              </span>
            </div>
          ))}
        </div>
        {filtrados.length === 0 && (
          <div className="vacio">
            <span className="vacio__icono">
              <Users size={24} />
            </span>
            No se encontraron usuarios con esos criterios
          </div>
        )}
      </section>

      {confirmarEliminar && (
        <div className="fondo-modal">
          <div className="modal">
            <div className="modal__encabezado">
              <div className="modal__titulo">Eliminar usuario</div>
              <button className="boton boton--icono" onClick={() => setConfirmarEliminar(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal__cuerpo">
              ¿Estás seguro de eliminar a{' '}
              <strong style={{ color: 'var(--texto-principal)' }}>{confirmarEliminar.name}</strong>?
              Esta acción no se puede deshacer.
            </div>
            <div className="modal__pie">
              <button className="boton boton--claro" disabled={guardando} onClick={() => setConfirmarEliminar(null)}>
                Cancelar
              </button>
              <button className="boton boton--peligro" disabled={guardando} onClick={eliminar}>
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}