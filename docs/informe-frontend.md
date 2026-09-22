# Informe de Arquitectura — Frontend web (Vite + React 19 + TS)

**Alcance:** SPA `Frontend/` (la app web, independiente de la app movil `Mobile/`). Este informe describe la arquitectura desde la perspectiva del flujo real: **que pasa desde que el usuario hace una accion en la interfaz hasta que la respuesta se pinta en pantalla.**

---

## 1. Resumen ejecutivo

- SPA **basada en componentes**: `components/`, `pages/`, `hooks/`, `services/`, `utils/`, `types/`, `routes/`, `assets/` y `styles/`.
- **Sin React Router**: la navegacion es por **estado** (`routes/AppNavigator.tsx` guarda la pantalla actual en `useState`; la config de routeos vive en `routes/config.ts`).
- **fetch nativo** (no axios) a traves de un unico cliente HTTP: `src/services/apiClient.ts`.
- **Hooks de datos reutilizables**: las paginas **no llaman la API directo**; consumen `useDatos.ts` (`useVehiculos`, `useEstaciones`, `useTalleres`, `useUsuarios`) y `useAuth.ts`, que envuelven a los services.
- **Fallback universal a mocks**: si la API falla o devuelve listas vacias, los services devuelven datos mock (`services/mocks/`); por eso las pantallas "nunca fallan".
- Un unico contexto global: `AuthContext`/`AuthProvider` (todo en memoria, sin persistencia).
- Token JWT guardado en contexto pero **aun no se envia** en las peticiones.

---

## 2. Estructura de `src/` (por carpeta)

```
Frontend/src/
├── main.tsx                       # Entrada: createRoot(<App/>) + importa los 4 CSS del tema
├── App.tsx                        # Widget raiz: <AuthProvider><AppNavigator/></AuthProvider>
│
├── components/                    # Componentes reutilizables de la interfaz
│   ├── EncabezadoSeccion.tsx      # Titulo de seccion con enlace/contador
│   ├── LoginButton.tsx            # Boton "Cuenta" + abre LoginModal
│   ├── LoginModal.tsx             # Modal login/registro (usa useAuth)
│   ├── LogoutButton.tsx           # Boton "Salir"
│   └── Saludo.tsx                 # Avatar + "Hola, {nombre}" (usa useAuth)
│
├── pages/                         # Paginas completas del sistema (segun rol)
│   ├── invitado/                  # PaginaInicio, PaginaVehiculos, PaginaReservas
│   ├── cliente/                   # PaginaInicioCliente, PaginaEstaciones, PaginaTalleres, PaginaEmergencias
│   └── administrador/             # PaginaPanel, PaginaUsuarios
│
├── hooks/                         # Hooks personalizados y logica reutilizable
│   ├── useAuth.ts                 # createContext + hook useAuth() (el estado vive en AuthProvider)
│   ├── AuthProvider.tsx           # Estado de auth en memoria (login/registro, flags de rol)
│   └── useDatos.ts                # useColeccion<T> + useVehiculos/useEstaciones/useTalleres/useUsuarios
│
├── services/                      # Comunicacion con el backend/API
│   ├── apiClient.ts               # SobreApi<T> {error,status,body} + peticion<T>() (fetch)
│   ├── authService.ts             # iniciarSesion, registrar (POST /usuarios + /auth/login)
│   ├── vehiculosService.ts        # GET /vehiculos + adaptar (imagen, colores con id_color) + fallback mocks
│   ├── estacionesService.ts       # GET /estaciones-carga + fallback mocks
│   ├── talleresService.ts         # GET /servicios-tecnicos + fallback mocks
│   ├── usuariosService.ts         # GET /usuarios + adaptar + fallback mocks
│   ├── coloresService.ts          # GET /colores (ColorApi {id_color, Color})
│   ├── reservasService.ts         # POST /reservas (crearReserva) + resolverIdColor
│   └── mocks/
│       ├── vehiculos.ts           # 6 modelos Voltus
│       ├── estacionesYTalleres.ts # 5 estaciones + 5 talleres
│       └── usuarios.ts            # 5 usuarios para el panel admin
│
├── utils/                         # Funciones auxiliares y utilidades
│   ├── roles.ts                   # esRolAdministrador, esRolCliente (parse del string rol / id_rol)
│   └── iniciales.ts               # obtenerIniciales
│
├── types/                         # Interfaces y tipos de TypeScript (contrato compartido)
│   ├── Usuario.ts                 # Usuario, Credenciales, DatosRegistro, RespuestaAuth, UsuarioAdministracion
│   ├── Vehiculo.ts                # Vehiculo, ColorVehiculo
│   └── EstacionesYTalleres.ts     # EstacionCarga, ServicioTecnico, VelocidadCarga
│
├── routes/                        # Configuracion de las rutas de la app
│   ├── config.ts                  # NAVEGACION (tabs por rol) + INICIO_POR_ROL
│   └── AppNavigator.tsx           # Shell + router por estado + nav por rol
│
├── styles/                        # variables.css, base.css, componentes.css, paginas.css
└── assets/                        # hero.png, react.svg, vite.svg
```

**Direccion de dependencias (siempre asi):**

```
pages (React)
      │  consumen hooks (useAuth / useDatos)
      ▼
hooks ────► services (obtenerVehiculos, iniciarSesion, ...)
                 │  unico punto que toca la API
                 ▼
           services/apiClient.ts (peticion + fetch)
                 │
                 ▼
               Backend (localhost:4000, con proxy Vite /api)
```

`types/` es el contrato compartido entre las tres capas; `utils/` lo consumen hooks y paginas (no toca la API).

---

## 3. Punto de entrada y arranque

| # | Archivo | Funcion |
|---|---|---|
| 1 | `index.html` | `<div id="root">` + `<script src="/src/main.tsx">` + Inter (via @fontsource) + `<title>Quantum | Voltus</title>` |
| 2 | `src/main.tsx` | `createRoot(...).render(<App/>)` dentro de `<StrictMode>`; importa `styles/variables.css`, `base.css`, `componentes.css`, `paginas.css` |
| 3 | `src/App.tsx` | Devuelve `<AuthProvider><AppNavigator/></AuthProvider>` |
| 4 | `src/routes/AppNavigator.tsx` | Widget raiz de UI: actua como **shell + router** (client del contexto de auth) |

### El "router" que no es router (`routes/AppNavigator.tsx` + `routes/config.ts`)

- `config.ts` exporta `NAVEGACION` (mapa de tabs por rol `{id, etiqueta, icono}`) e `INICIO_POR_ROL`.
- Estado `pantalla: string` via `useState('inicio')` + funcion `irA(id)`.
- `useAuth()` deriva el rol (`esAdministrador ? 'administrador' : esCliente ? 'cliente' : 'invitado'`).
- **Guard de ruta**: si `pantalla` no esta en los ids validos del rol, se fuerza `INICIO_POR_ROL[rol]`. Asi, al cambiar de rol la app "cae" a la pagina inicial de ese rol.
- Header: marca, nav con `IconoNav` (mapa nombre→icono lucide) y LoginButton (invitado) o Saludo + LogoutButton (logueado).
- Render condicional de las 10 paginas segun `rol` + `pantallaActual`.

### Contexto de auth (`hooks/useAuth.ts` + `hooks/AuthProvider.tsx`)

- `AuthProvider.tsx` es el widget que guarda el estado: `usuario`, `token`, `cargandoLogin`, `cargandoRegistro`, `errorLogin`, `errorRegistro`. **Todo en memoria** (al recargar la pagina se vuelve a invitado).
- `useAuth.ts` crea el contexto y expone el hook `useAuth()` (se separa del widget para respetar la regla eslint `react-refresh/only-export-components`).
- Flags de rol via `utils/roles.ts`: `esRolAdministrador` si rol incluye 'admin' o `id_rol === 1`; `esRolCliente` si incluye 'client'/'usuario'/'user' o `id_rol === 2`. `esInvitado = !usuario`.

---

## 4. Pantallas y su funcion

### Rol invitado (sin login)
| id | Pagina | Archivo | Notas |
|---|---|---|---|
| `inicio` | PaginaInicio | `pages/invitado/PaginaInicio.tsx` | Landing: hero, stats, modelos destacados (API), planes, test drive |
| `vehiculos` | PaginaVehiculos | `pages/invitado/PaginaVehiculos.tsx` | Catalogo completo + detalle con colores + boton "Reservar este modelo" |
| `reservas` | PaginaReservas | `pages/invitado/PaginaReservas.tsx` | Formulario (nombres, apellidos, cedula) + **POST /reservas real**; sin pago inicial |

### Rol cliente (logueado)
| id | Pagina | Archivo | Notas |
|---|---|---|---|
| `inicio` | PaginaInicioCliente | `pages/cliente/PaginaInicioCliente.tsx` | Vehiculo propio (mock), estaciones cercanas (API), historial (mock) |
| `estaciones` | PaginaEstaciones | `pages/cliente/PaginaEstaciones.tsx` | API + buscador + filtros (conector, disponibilidad, distancia) |
| `talleres` | PaginaTalleres | `pages/cliente/PaginaTalleres.tsx` | API + buscador + filtros (especialidad, abiertos) |
| `emergencias` | PaginaEmergencias | `pages/cliente/PaginaEmergencias.tsx` | 100% estatico: SOS, contactos `tel:` |

### Rol administrador
| id | Pagina | Archivo | Notas |
|---|---|---|---|
| `panel` | PaginaPanel | `pages/administrador/PaginaPanel.tsx` | Stats con **conteos reales** via `Promise.all` de 3 services |
| `usuarios` | PaginaUsuarios | `pages/administrador/PaginaUsuarios.tsx` | Lectura inicial via API; CRUD posterior **100% local** (estado via `actualizar` del hook) |

---

## 5. Patrones: hooks, services y fallback

### Hook generic de colecciones (`hooks/useDatos.ts`) — la clave

```ts
function useColeccion<T>(obtener: () => Promise<T[]>): ResultadoDatos<T> {
  // useState([]) + useEffect -> obtener().then(setDatos) .finally(cargando=false)
  // devuelve { datos, cargando, actualizar }  (actualizar = setDatos, para mutaciones locales)
}

export function useVehiculos(): ResultadoDatos<Vehiculo> { return useColeccion<Vehiculo>(obtenerVehiculos) }
export function useEstaciones(): ResultadoDatos<EstacionCarga> { ... }
export function useTalleres(): ResultadoDatos<ServicioTecnico> { ... }
export function useUsuarios(): ResultadoDatos<UsuarioAdministracion> { ... }
```

- La paginas consumen `{ datos, cargando }` y hacen `useMemo` para filtros; el setter `actualizar` permite a `PaginaUsuarios` mutar la lista localmente tras un CRUD mock.
- `PaginaReservas` **no** dispara `useVehiculos` en un effect para preseleccionar: recibe `vehiculoInicial` por prop desde `AppNavigator` e inicializa el formulario con `useState` (evita mutar estado en efectos, regla eslint `react-hooks/set-state-in-effect`).

### Services con fallback (`services/*Service.ts`)

```
try   -> peticion('/vehiculos')          (apiClient desempaqueta el sobre)
        ├─ si length === 0  -> mocks
        └─ si datos ok      -> datos.map(adaptar)   (enriquecer con campos demo)
catch -> mocks
```

- `vehiculosService.ts` `adaptar()`: rellena `imagen` con `placehold.co`. `colores` refleja **solo los colores reales del modelo** (los que trae el backend, con `id_color`); si un modelo no tiene relaciones N:M, queda `colores: []` (sin paleta generica inventada).
- `estacionesService.ts` / `talleresService.ts`: `adaptarEstacion` pone `nombre ?? direccion`, `conectores ?? ['Tipo 2']`, `velocidad ?? 'Rápida'`; `adaptarTaller` analogo.
- `usuariosService.ts` `adaptar()`: traduce `UsuarioApi` → `UsuarioAdministracion` (`role` segun `id_rol === 1`, `status: 'Activo'` fijo, etc.).
- `authService.ts` `registrar()`: hace **2 peticiones encadenadas** (POST `/usuarios` con `id_rol: 2` y luego POST `/auth/login`) porque el backend no tiene ruta `/auth/registro`.

### Cliente HTTP unico (`services/apiClient.ts`)

```ts
interface SobreApi<T> { error: boolean; status: number; body: T }

URL_BASE = import.meta.env.VITE_API_URL || '/api'
// en dev: /api (vite.config.ts proxya /api -> http://localhost:4000)

export async function peticion<T>(ruta, opciones) {
  fetch(URL_BASE + ruta, { headers: {'Content-Type':'application/json'}, ...opciones })
  const datos = await res.json()
  if (datos.error) throw new Error(datos.body as string)
  return datos.body as T                          // devuelve body desempaquetado
}
```

### Utilidades (`utils/`)

- `roles.ts`: `esRolAdministrador(rol: string, id_rol?: number)` y `esRolCliente(...)` con logica robusta (id o coincidencia en string).
- `iniciales.ts`: `obtenerIniciales(nombre)` para el avatar del Saludo.

---

## 6. Flujos completos paso a paso

### Flujo A — Login: accion del usuario → pantalla

```
1.  Header: AppNavigator.tsx     ->  renderiza <LoginButton/> (esInvitado=true)
2.  LoginButton.tsx              ->  clic: setVisible(true) abre <LoginModal/>
3.  LoginModal.tsx               ->  manejarLogin(): await iniciarSesion({correo, contrasena})
4.  AuthProvider.tsx             ->  iniciarSesion: setCargandoLogin(true) + await authService.iniciarSesion()
5.  authService.ts:iniciarSesion ->  peticion<RespuestaAuth>('/auth/login', {method:'POST', body})
6.  apiClient.ts                 ->  fetch('/api/auth/login') (proxy-> :4000)  |  B A C K E N D
7.  apiClient.ts                 ->  parsea sobre {error,status,body}; si error lanza Error; si no devuelve body {token,usuario}
8.  AuthProvider.tsx             ->  setUsuario(datos.usuario), setToken(datos.token); returns true
9.  AuthProvider.tsx             ->  recalcula flags via utils/roles.ts: rol -> 'cliente'|'administrador', esInvitado=false
10. AppNavigator.tsx             ->  re-render; si pantalla no aplica al nuevo rol fuerza INICIO_POR_ROL
11. LoginModal.tsx               ->  if correcto cerrar()
12. UI final                     ->  header con Saludo+Logout; nav con tabs del rol; pagina inicial del rol
Fallo:  AuthProvider guarda errorLogin -> LoginModal.tsx pinta alerta; boton "Ingresando..." deshabilitado
```

### Flujo B — Invitado lista vehiculos, abre detalle y va a reservar

```
1.  AppNavigator                ->  renderiza PaginaVehiculos (rol=invitado, pantalla='vehiculos')
2.  PaginaVehiculos             ->  const { datos: modelos } = useVehiculos()
3.  useDatos.ts:useVehiculos    ->  useColeccion<Vehiculo>(obtenerVehiculos)
4.  useColeccion                ->  useEffect: obtenerVehiculos().then(setDatos)
5.  vehiculosService            ->  GET /vehiculos; []->mocks | ok->map(adaptar) | catch->mocks
6.  apiClient                   ->  GET /api/vehiculos; desempaqueta body (array enriquecido con colores de la N:M)
7.  adaptar()                   ->  rellena imagen + colores
8.  PaginaVehiculos             ->  setDatos -> se pintan tarjetas; clic en tarjeta -> setSeleccionado
9.  detalle                     ->  colores, ficha, "Reservar este modelo" -> alReservar
10. AppNavigator                ->  setVehiculoParaReservar + irA('reservas')
11. PaginaReservas              ->  recibe vehiculoInicial por prop; preselecciona modelo + primer color (useState)
12. PaginaReservas confirmar    ->  resolverIdColor() (id_color del modelo o GET /colores por nombre) + POST /reservas via reservasService; genera codigo VT-XXXX-ABC. Modal de exito.
```

### Flujo C — Cliente ve estaciones (resumen)

`AppNavigator` → `PaginaEstaciones` (usa `useEstaciones()`) → `estacionesService` (GET `/estaciones-carga`, fallback mocks) → filtros con `useMemo` → lista. Mismo patron para talleres.

### Flujo D — Panel admin (resumen)

`AppNavigator` → `PaginaPanel` → `Promise.all([obtenerVehiculos(), obtenerEstaciones(), obtenerUsuarios()])` → 3 GET paralelos → conteos de tarjetas.

---

## 7. Endpoints que consume el frontend

| Metodo | Ruta | Donde |
|---|---|---|
| POST | `/auth/login` | `authService.ts` (login) y (auto-login post-registro) |
| POST | `/usuarios` | `authService.ts` (registro con `id_rol:2`) |
| GET | `/vehiculos` | `vehiculosService.ts` |
| GET | `/estaciones-carga` | `estacionesService.ts` |
| GET | `/servicios-tecnicos` | `talleresService.ts` |
| GET | `/usuarios` | `usuariosService.ts` |

URL real en dev: `/api/...` → proxy Vite → `http://localhost:4000`.

---

## 8. Particularidades y gotchas

1. **El token JWT nunca se envia**: `apiClient` no agrega header `Authorization`. Las peticiones autenticadas funcionan porque el backend aun no las exige.
2. **La reserva de PaginaReservas SÍ persiste**: `POST /reservas` vía `reservasService.ts` (con `resolverIdColor`). El codigo de confirmacion se genera en el cliente; el backend no lo devuelve.
3. **CRUD de usuarios admin es mock en memoria**: solo el listado inicial usa API; crear/suspender/eliminar mutan estado local via `actualizar` del hook (se pierde al recargar).
4. **Sin React Router** y sin deep-linking: navegacion por estado `pantalla` en `routes/AppNavigator.tsx`.
5. **Sin persistencia de sesion**: al recargar se vuelve a invitado.
6. **Modelos "enriquecidos"**: mezclan columnas del backend con campos demo (`precio`, `imagen`, `colores`, `distanciaKm`, `rating`).
7. **Registro en 2 pasos**: POST `/usuarios` + POST `/auth/login`.
8. **Carga sin spinners**: las listas se pintan vacias hasta resolver; con fallback a mocks la UI siempre se llena.
9. **Config de rutas centralizada**: agregar una pantalla = tocarla en `routes/config.ts` (`NAVEGACION` + `INICIO_POR_ROL`) y en el render del `AppNavigator`.
10. **Reglas eslint que marcan el estilo**: `react-refresh/only-export-components` (contexto y widget separados: `useAuth.ts` vs `AuthProvider.tsx`) y `react-hooks/set-state-in-effect` (los hooks de datos y las paginas evitan `setState` síncrono en efectos).

---

**Resumen:** SPA basada en componentes con paginas que consumen hooks (`useDatos.ts`, `useAuth.ts`), hooks que envuelven services, un solo cliente HTTP (`services/apiClient.ts`) que espera el sobre `{error,status,body}`, navegacion por estado en `routes/AppNavigator.tsx` (config en `routes/config.ts`), un contexto de auth en memoria y fallback universal a mocks dentro de cada service.