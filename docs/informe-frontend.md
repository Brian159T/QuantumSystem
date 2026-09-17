# Informe de Arquitectura — Frontend web (Vite + React 19 + TS)

**Alcance:** SPA `Frontend/` (la app web, independiente de la app movil `Mobile/`). Este informe describe la arquitectura desde la perspectiva del flujo real: **que pasa desde que el usuario hace una accion en la interfaz hasta que la respuesta se pinta en pantalla.**

---

## 1. Resumen ejecutivo

- SPA de **4 capas**: `presentation` → `domain` → `data` → `infraestructura` (arquitectura limpia ligera).
- **Sin React Router**: la navegacion es por **estado** (`AppNavigator.tsx` guarda la pantalla actual en un `useState`).
- **fetch nativo** (no axios) a traves de un unico cliente HTTP: `src/infraestructura/http/ApiClient.ts`.
- **Inyeccion de dependencias manual y centralizada** en `src/data/index.ts` (composite root).
- **Fallback universal a mocks**: si la API falla o devuelve listas vacias, los repositorios devuelven datos mock; por eso las pantallas "nunca fallan".
- Un unico contexto global: `AuthContext`/`AuthProvider` (todo en memoria, sin persistencia).
- Token JWT guardado en contexto pero **aun no se envia** en las peticiones.

---

## 2. Estructura de `src/` (por capa)

```
Frontend/src/
├── main.tsx                       # Entrada: createRoot(<App/>) + importa los 4 CSS del tema
├── App.tsx                        # Solo renderiza <AppNavigator/>
│
├── domain/                        # CAPA DOMINIO: tipos e interfaces puras (sin dependencias)
│   ├── modelos/
│   │   ├── Usuario.ts             # Usuario, Credenciales, DatosRegistro, RespuestaAuth, UsuarioAdministracion
│   │   ├── Vehiculo.ts            # Vehiculo, ColorVehiculo
│   │   └── EstacionesYTalleres.ts # EstacionCarga, ServicioTecnico, VelocidadCarga
│   ├── repositories/
│   │   └── Repositorios.ts        # Las 5 interfaces de repositorio (contratos)
│   └── usecases/
│       ├── AuthUseCase.ts         # iniciarSesion, registrar
│       └── DatosUseCases.ts       # CatalogoUseCase, EstacionesUseCase, TalleresUseCase, UsuariosUseCase
│
├── data/                          # CAPA DATA: implementaciones concretas + mocks
│   ├── index.ts                   # COMPOSICION RAIZ: instancia los 5 usecases con sus impls
│   ├── repositories/
│   │   ├── AuthRepositoryImpl.ts          # POST /auth/login (+ registro en 2 pasos)
│   │   ├── VehiculoRepositoryImpl.ts      # GET /vehiculos + adaptar + fallback mocks
│   │   ├── EstacionYTallerRepositoryImpl.ts # GET /estaciones-carga y /servicios-tecnicos
│   │   └── UsuarioRepositoryImpl.ts       # GET /usuarios + adaptar + fallback mocks
│   └── mocks/
│       ├── vehiculos.mock.ts      # 6 modelos Voltus
│       ├── estacionesYTalleres.mock.ts    # 5 estaciones + 5 talleres
│       └── usuarios.mock.ts       # 5 usuarios para el panel admin
│
├── infraestructura/               # CAPA INFRAESTRUCTURA: transporte HTTP
│   └── http/
│       └── ApiClient.ts           # SobreApi<T> {error,status,body} + peticion<T>() (fetch)
│
└── presentation/                  # CAPA PRESENTACION: React
    ├── navigation/
    │   └── AppNavigator.tsx       # Shell + router por estado + nav por rol
    ├── context/
    │   ├── AuthContext.ts         # createContext + hook useAuth()
    │   └── AuthProvider.tsx       # Estado de auth, login/registro, flags de rol
    ├── components/
    │   ├── LoginButton.tsx / LoginModal.tsx / LogoutButton.tsx
    │   ├── Saludo.tsx             # Avatar + "Hola, {nombre}"
    │   └── EncabezadoSeccion.tsx  # Titulo de seccion reutilizable
    ├── pages/                     # 9 pantallas (ver seccion 4)
    └── styles/                    # variables.css, base.css, componentes.css, paginas.css
```

**Direccion de dependencias (siempre asi):**

```
presentation (paginas + contextos)
      │  importan usecases YA instanciados desde data/index.ts
      ▼
data/index.ts (composite root)
      │  instancia, inyectando el repositorio por constructor
      ▼
domain/usecases ───► domain/repositories (interfaces) ───► data/repositories (impls)
                                                                │
                                                                ▼
                                        infraestructura/http/ApiClient.ts (fetch)
```

---

## 3. Punto de entrada y arranque

| # | Archivo | Funcion |
|---|---|---|
| 1 | `index.html` | `<div id="root">` + `<script src="/src/main.tsx">` + Poppins + `<title>Quantum | Voltus</title>` |
| 2 | `src/main.tsx` | `createRoot(...).render(<App/>)` dentro de `<StrictMode>`; importa `styles/variables.css`, `base.css`, `componentes.css`, `paginas.css` |
| 3 | `src/App.tsx` | Devuelve `<AppNavigator/>` |
| 4 | `src/presentation/navigation/AppNavigator.tsx` | Envuelve todo en `<AuthProvider>` y actua como **shell + router** |

### El "router" que no es router (`AppNavigator.tsx`)

- Estado `pantalla: string` via `useState('inicio')` (linea 76) + funcion `irA(id)` (linea 82).
- `useAuth()` deriva el rol: `esAdministrador ? 'administrador' : esCliente ? 'cliente' : 'invitado'` (linea 75).
- `NAVEGACION` (lineas 27-43): mapa de tabs por rol `{id, etiqueta, icono}`.
- **Guard de ruta** (lineas 79-80): si `pantalla` no esta en `idsValidos[rol]`, se fuerza `INICIO_POR_ROL[rol]`. Asi, al cambiar de rol la app "cae" a la pagina inicial de ese rol.
- Header (86-121): marca, nav con `IconoNav` (mapa nombre→icono lucide, 45-64), y LoginButton (invitado) o Saludo + LogoutButton (logueado).
- Render condicional de las 9 paginas segun `rol` + `pantallaActual` (125-148).

### Contexto de auth (`AuthProvider.tsx`)

- Estado: `usuario`, `token`, `cargandoLogin`, `cargandoRegistro`, `errorLogin`, `errorRegistro`. **Todo en memoria** (al recargar la pagina se vuelve a invitado).
- Flags de rol (6-22): `esRolAdministrador` si rol incluye 'admin' o `id_rol === 1`; `esRolCliente` si incluye 'client'/'usuario'/'user' o `id_rol === 2`.
- `esInvitado = !usuario`.

---

## 4. Pantallas y su funcion

### Rol invitado (sin login)
| id | Pagina | Archivo | Notas |
|---|---|---|---|
| `inicio` | PaginaInicio | `pages/invitado/PaginaInicio.tsx` | Landing: hero, stats, modelos destacados (API), planes, test drive |
| `vehiculos` | PaginaVehiculos | `pages/invitado/PaginaVehiculos.tsx` | Catalogo completo + detalle con colores + boton "Reservar este modelo" |
| `reservas` | PaginaReservas | `pages/invitado/PaginaReservas.tsx` | Formulario; **reserva simulada** (genera codigo local, NO llama a la API) |

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
| `panel` | PaginaPanel | `pages/administrador/PaginaPanel.tsx` | Stats con **conteos reales** via `Promise.all` de 3 usecases |
| `usuarios` | PaginaUsuarios | `pages/administrador/PaginaUsuarios.tsx` | Lectura inicial via API; CRUD posterior **100% local** (estado) |

---

## 5. Patrones: capas, inyeccion y fallback

### Inyeccion manual en `src/data/index.ts` (la clave)

```ts
export const authUseCase    = new AuthUseCase(new AuthRepositoryImpl())          // :8
export const catalogoUseCase  = new CatalogoUseCase(new VehiculoRepositoryImpl()) // :9
export const estacionesUseCase = new EstacionesUseCase(new EstacionRepositoryImpl()) // :10
export const talleresUseCase  = new TalleresUseCase(new TallerRepositoryImpl())    // :11
export const usuariosUseCase  = new UsuariosUseCase(new UsuarioRepositoryImpl())   // :12
```

Las paginas importan directamente estas instancias prefabricadas (p. ej. `PaginaVehiculos.tsx:4`). Los usecases **solo conocen la interfaz** (`RepositorioVehiculos`) gracias al constructor; la implementacion concreta se inyecta. Eso es inversion de dependencias.

### Contratos del dominio (`domain/repositories/Repositorios.ts`)

| Interfaz | Metodos |
|---|---|
| `RepositorioAuth` | `iniciarSesion(Credenciales): Promise<RespuestaAuth>`, `registrar(DatosRegistro): Promise<RespuestaAuth>` |
| `RepositorioVehiculos` | `obtenerTodos(): Promise<Vehiculo[]>` |
| `RepositorioEstaciones` | `obtenerTodas(): Promise<EstacionCarga[]>` |
| `RepositorioTalleres` | `obtenerTodos(): Promise<ServicioTecnico[]>` |
| `RepositorioUsuarios` | `obtenerTodos(): Promise<UsuarioAdministracion[]>` |

### Fallback a mocks (patron identico en los 4 repositorios de datos)

```
try   -> peticion('/vehiculos')          (ApiClient desempaqueta el sobre)
        ├─ si length === 0  -> mocks
        └─ si datos ok      -> datos.map(adaptar)   (enriquecer con campos demo)
catch -> mocks
```

- `VehiculoRepositoryImpl.adaptar()` (13-20): rellena `imagen` con `placehold.co` y `colores` con una paleta si el backend no los trae.
- `EstacionYTallerRepositoryImpl`: `adaptarEstacion` (6-15) pone `nombre ?? direccion`, `conectores ?? ['Tipo 2']`, `velocidad ?? 'Rápida'`; `adaptarTaller` (17-23) analogo.
- `UsuarioRepositoryImpl.adaptar()` (14-24): traduce `UsuarioApi` → `UsuarioAdministracion` (`role` segun `id_rol === 1`, `status: 'Activo'` fijo, etc.).
- `AuthRepositoryImpl.registrar` (15-30): hace **2 peticiones encadenadas** (POST `/usuarios` con `id_rol: 2` y luego POST `/auth/login`) porque el backend no tiene ruta `/auth/registro`.

### Cliente HTTP unico (`infraestructura/http/ApiClient.ts`)

```ts
interface SobreApi<T> { error: boolean; status: number; body: T }   // :1-5

URL_BASE = import.meta.env.VITE_API_URL || '/api'                    // :7-8
// en dev: /api (vite.config.ts proxya /api -> http://localhost:4000)

async function peticion<T>(ruta, opciones) {                          // :10-25
  fetch(URL_BASE + ruta, { headers: {'Content-Type':'application/json'}, ...opciones })
  const datos = await res.json()
  if (datos.error) throw new Error(datos.body as string)              // :18-22
  return datos.body as T                                              // devuelve body desempaquetado
}
```

---

## 6. Flujos completos paso a paso

### Flujo A — Login: accion del usuario → pantalla

```
1.  Header: AppNavigator.tsx:111-118  ->  renderiza <LoginButton/> (esInvitado=true)
2.  LoginButton.tsx:10-14             ->  clic: setVisible(true) abre <LoginModal/>
3.  LoginModal.tsx:29-32              ->  manejarLogin(): await iniciarSesion({correo, contrasena})
4.  AuthProvider.tsx:32-46            ->  iniciarSesion: setCargandoLogin(true) + await authUseCase.iniciarSesion()
5.  AuthUseCase.ts:11-13              ->  delega en this.repositorio.iniciarSesion()
6.  AuthRepositoryImpl.ts:8-13        ->  peticion<RespuestaAuth>('/auth/login', {method:'POST', body})
7.  ApiClient.ts:10-14                ->  fetch('/api/auth/login') (proxy-> :4000)  |  B A C K E N D
8.  ApiClient.ts:16-24                ->  parsea sobre {error,status,body}; si error lanza Error; si no devuelve body {token,usuario}
9.  AuthProvider.tsx:36-39            ->  setUsuario(datos.usuario), setToken(datos.token); returns true
10. AuthProvider.tsx:79-81            ->  recalcula flags: rol -> 'cliente'|'administrador', esInvitado=false
11. AppNavigator.tsx:73-80            ->  re-render; si pantalla no aplica al nuevo rol fuerza INICIO_POR_ROL
12. LoginModal.tsx:31                 ->  if correcto cerrar()
13. UI final                          ->  header con Saludo+Logout; nav con tabs del rol; pagina inicial del rol
Fallo:  AuthProvider guarda errorLogin (:41) -> LoginModal.tsx:123 pinta alerta; boton "Ingresando..." deshabilitado
```

### Flujo B — Invitado lista vehiculos, abre detalle y va a reservar

```
1.  AppNavigator:128-135        ->  renderiza PaginaVehiculos (rol=invitado, pantalla='vehiculos')
2.  PaginaVehiculos:16-18       ->  useEffect: catalogoUseCase.obtenerCatalogo().then(setModelos)
3.  data/index.ts:9             ->  catalogoUseCase = new CatalogoUseCase(new VehiculoRepositoryImpl())
4.  CatalogoUseCase:13-15       ->  this.repositorio.obtenerTodos()
5.  VehiculoRepositoryImpl:23-31->  GET /vehiculos; []->mocks | ok->map(adaptar) | catch->mocks
6.  ApiClient:10-24             ->  GET /api/vehiculos; desempaqueta body (array enriquecido con colores de la N:M)
7.  adaptar():13-20             ->  rellena imagen + colores
8.  PaginaVehiculos:126-164     ->  setModelos -> se pintan tarjetas; clic en tarjeta -> setSeleccionado (131)
9.  detalle:20-121              ->  colores (66-81), ficha (84-99), "Reservar este modelo" -> alReservar (111)
10. AppNavigator:130-133        ->  setVehiculoParaReservar + irA('reservas')
11. PaginaReservas:29-40        ->  recarga catalogo, preselecciona vehiculoInicial + primer color
12. PaginaReservas:45-50        ->  confirmarReserva(): genera codigo VT-XXXX-ABC local (Math.random());
                                  NO hay POST a /reservas. Modal de exito (262-304).
```

### Flujo C — Cliente ve estaciones (resumen)

`AppNavigator:143` → `PaginaEstaciones:29-31` (`obtenerEstaciones`) → `EstacionRepositoryImpl:26-34` (GET `/estaciones-carga`, fallback mocks) → filtros con `useMemo` (33-46) → lista (151-219). Mismo patron para talleres.

### Flujo D — Panel admin (resumen)

`AppNavigator:147` → `PaginaPanel:16-28` → `Promise.all([obtenerCatalogo(), obtenerEstaciones(), obtenerUsuarios()])` → 3 GET paralelos → conteos de tarjetas.

---

## 7. Endpoints que consume el frontend

| Metodo | Ruta | Donde |
|---|---|---|
| POST | `/auth/login` | `AuthRepositoryImpl.ts:9` (login) y `:26` (auto-login post-registro) |
| POST | `/usuarios` | `AuthRepositoryImpl.ts:16` (registro con `id_rol:2`) |
| GET | `/vehiculos` | `VehiculoRepositoryImpl.ts:25` |
| GET | `/estaciones-carga` | `EstacionYTallerRepositoryImpl.ts:28` |
| GET | `/servicios-tecnicos` | `EstacionYTallerRepositoryImpl.ts:40` |
| GET | `/usuarios` | `UsuarioRepositoryImpl.ts:29` |

URL real en dev: `/api/...` → proxy Vite → `http://localhost:4000`.

---

## 8. Particularidades y gotchas

1. **El token JWT nunca se envia**: `ApiClient` no agrega header `Authorization`. Las peticiones autenticadas funcionan porque el backend aun no las exige.
2. **La reserva de PaginaReservas no persiste**: codigo local solo; sin POST a `/reservas`. QR placeholder.
3. **CRUD de usuarios admin es mock en memoria**: solo el listado inicial usa API; crear/suspender/eliminar mutan estado local (se pierde al recargar).
4. **Sin React Router** y sin deep-linking: navegacion por estado `pantalla`.
5. **Sin persistencia de sesion**: al recargar se vuelve a invitado.
6. **Modelos "enriquecidos"**: mezclan columnas del backend con campos demo (`precio`, `imagen`, `colores`, `distanciaKm`, `rating`).
7. **Registro en 2 pasos**: POST `/usuarios` + POST `/auth/login`.
8. **Carga sin spinners**: las listas se pintan vacias hasta resolver; con fallback a mocks la UI siempre se llena.
9. **Dead files**: `src/App.css` y `src/index.css` (restos del template Vite, no importados).

---

**Resumen:** SPA en 4 capas con inyeccion manual en `data/index.ts`, un solo cliente HTTP que espera el sobre `{error,status,body}`, navegacion por estado en `AppNavigator.tsx`, un contexto de auth en memoria y fallback universal a mocks en los repositorios.