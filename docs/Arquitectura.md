# Arquitectura - Quantum / Voltus

Documento de referencia para que una IA (u otro desarrollador) entienda rapidamente **como esta armado** el proyecto antes de tocar c�digo.

> **Nota de naming**: La marca/producto que muestra la UI se llama **Voltus**, pero el nombre interno del proyecto y la base de datos es **Quantum**. App movil = **QuantumApp**. Ver `React Navigation` para la app movil y un SPA propio para web.

---

## 1. Resumen de alto nivel

Monorepo con **tres subproyectos separados** (cada uno muy independiente, con su propia node_modules y, en algunos casos, su propio repo git):

| Carpeta | Tipo | Stack | Estado |
|---------|------|-------|--------|
| `Backend/` | API REST | Node.js + Express 5 + TypeScript + MySQL | **Activo**, conectado a la BD |
| `Mobile/` | App movil (la app real) | Expo SDK 54 + React Native + TypeScript | **Activo**, consume la API |
| `Frontend/` | Frontend web (SPA) | Vite + React 19 + TypeScript | Parcialmente construido, consume la API |
| `docs/` | Documentacion | Markdown | Documentacion de contexto |

**Comunicacion**: `Mobile/` y `Frontend/` llaman a `Backend/` via **REST JSON** (axios en Mobile, fetch en Frontend-web). El backend es la unica fuente de verdad contra MySQL.

**DB**: MySQL `quantumappdb` (ver `docs/base-datos.md`).

> **Migracion planificada**: el plan es migrar la BD a **PostgreSQL + pgvector** de manera local y luego subirla a **Supabase** (plan Free) cuando esté lista. El backend pasaria del driver `mysql` al driver `pg`. Ver seccion 6 de `docs/Decisiones-tecnicas.md`.

---

## 2. Arquitectura del Backend (`Backend/`)

### 2.1 Patron general: **por modulo con CRUD generico**

Cada entidad vive en `src/modulos/<Entidad>/` y sigue la misma estructura de 3 archivos:

```
src/modulos/<Entidad>/
├── index.ts          # "Fabrica": inyecta la DB y exporta el controlador instanciado
├── controlador.ts    # factory `export default function (dbInyectada?)`
│                     #   define TABLA y CAMPO_ID como constantes, expone CRUD
└── rutas.ts          # express.Router, handlers que responden via red/respuestas
```

**Patron de inyeccion de DB**: el controlador recibe la DB como parametro (`dbInyectada`), permitiendo pasar una DB mock en tests. El `index.ts` de cada modulo siempre hace:

```ts
import db from '../../DB/mysql';
import crearControlador from './controlador';
const controlador = crearControlador(db);
export default controlador;
```

**Duplicar una carpeta = crear un nuevo modulo CRUD** (decision de diseno central).

### 2.2 Capas y flujo de una peticion

```
HTTP request
   → app.ts (middleware globales: morgan, express.json)
   → rutas.ts del modulo (express.Router)
   → controlador.ts (logica, usa TABLA/CAMPO_ID)
   → DB/mysql.ts (helpers promisificados sobre la conexion)
   → MySQL
   → la respuesta se envuelve en red/respuestas (sobre JSON uniforme)
```

### 2.3 Mapa de archivos del Backend (`src/`)

| Archivo | Rol |
|---------|-----|
| `index.ts` | Entry point: lee `port` de la app y levanta el servidor |
| `app.ts` | Crea la app Express, monta middlewares y TODAS las rutas, monta el manejador global de errores al final |
| `config.ts` | Lee `.env` (PORT, MYSQL_*, JET_SECRET). Usa `dotenv` |
| `DB/mysql.ts` | Conexion MySQL unica + 7 helpers genericos de query |
| `auth/index.ts` | JWT: `asignarToken`, `chequearToken` |
| `middleware/errors.ts` | Fabrica de errores con `statusCode` opcional |
| `red/respuestas.ts` | Sobre de respuesta `success`/`error` |
| `red/errors.ts` | Middleware global que captura `next(error)` y responde |
| `modulos/auth/` | Login (JOIN Usuarios+Roles, bcrypt, JWT) |
| `modulos/Usuarios/` | CRUD Usuarios (bcrypt hash) + `seguridad.ts` (JWT, definido pero desconectado) |
| `modulos/Vehiculos/` | CRUD Vehiculos |
| `modulos/Estaciones_Carga/` | CRUD Estaciones_Carga |
| `modulos/Servicios_Tecnicos/` | CRUD Servicios_Tecnicos |
| `modulos/Clientes/` | CRUD que apunta a la tabla `roles` (modulo con bug, ver gotchas) |

### 2.4 Detalle de la capa DB (`src/DB/mysql.ts`)

Una **unica conexion** MySQL (no pool) con reconexion automatica:
- Si `connect` falla, reintenta cada **2 segundos**.
- Si el evento `error` es `PROTOCOL_CONNECTION_LOST`, reconecta; si no, lanza.

Helpers exportados (todos promisificados con `mysql` y queries parametrizadas):

| Funcion | SQL resultante |
|---------|----------------|
| `todos(tabla)` | `SELECT * FROM ??` |
| `uno(tabla, campoId, id)` | `SELECT * FROM ?? WHERE ?? = ?` (devuelve `result[0]`) |
| `agregar(tabla, data)` | `INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?` (upsert) |
| `actualizar(tabla, campoId, id, data)` | `UPDATE ?? SET ? WHERE ?? = ?` |
| `eliminar(tabla, campoId, id)` | `DELETE FROM ?? WHERE ?? = ?` |
| `query(tabla, consulta)` | `SELECT * FROM ?? WHERE ?` (devuelve `result[0]`) |
| `ejecutar(sql, valores)` | Query libre (usado por auth/login para el JOIN) |

Uso de `??` para identificadores (tablas/columnas) y `?` para valores: **antisiSQL-injection**.

### 2.5 Autenticacion (JWT)

`src/auth/index.ts`:
- `asignarToken(data)`: `jwt.sign(data, secret)` — **sin expiracion configurada**.
- `chequearToken.confirmarToken(req, id?)`: extrae el token del header `Authorization: Bearer <token>`, lo verifica y opcionalmente comprueba que `decodificado.id === id` (autorizacion por recurso).
- `decodificarCabecera(req)` adjunta el payload decodificado a `req.user`.

Secret tomado de `config.jwt.secret` = `process.env.JET_SECRET || 'notasecreta!'`.

> **Importante**: `config.ts` lee `JET_SECRET` (**typo**, falta "W"). En `.env` no existe esa variable, por lo que el secret siempre cae al fallback `'notasecreta!'`.

### 2.6 Sobre de respuesta uniforme

Todas las respuestas pasan por `red/respuestas.ts`:

```json
{ "error": bool, "status": int, "body": <payload o mensaje> }
```

- `success(req, res, mensaje, statusCode=200)`
- `error(req, res, mensaje, statusCode=500)`

Los errores se loguean con `red/errors.ts` (`console.log('[error]', err)`) y responden con `err.message` y `err.statusCode || 500`.

### 2.7 Modulos individuales

#### Modulo `auth`
- S**olo** `POST /login`. Busca por `correo`, hace JOIN `Usuarios INNER JOIN Roles` para obtener `rol` (el `Nombre` del rol), compara la contrasena con `bcrypt.compare`, y devuelve `{ token, usuario }`.
- **No existe** `POST /registro` en el backend (el Mobile y el web lo llaman, pero no esta definido).

#### Modulo `Usuarios`
- CRUD completo. En `agregar` y `actualizar` hashea la contrasena con `bcrypt.hash(contrasena, salt=5)`.
- En `actualizar`, el cambio de contrasena es condicional (solo si viene `body.contrasena`).
- `seguridad.ts` define un middleware JWT pero **no esta conectado** a ninguna ruta (las rutas estan abiertas).

#### Modulo `Vehiculos`
- CRUD completo, campos snake_case que reflejan la tabla. Incluye `console.log` de debug en agregar/actualizar/eliminar.

#### Modulo `Estaciones_Carga` / `Servicios_Tecnicos`
- CRUD completo, ambos id�nticos en estructura (mismos campos: direccion, latitud, longitud, horarios, telefono, Estado).

#### Modulo `Clientes` (con bug)
- CRUD sobre la tabla **`roles`** (error: deberia ser una tabla de clientes). No tiene PUT. El frontend no lo consume.

### 2.8 Configuracion (`config.ts` + `.env`)

```env
PORT=4000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=quantumappdb
```

Defaults del codigo (si falta la var): puerto `4000`, host `localhost`, user `root`, password `''`, db `quantumdb`.

`dotenv` esta en **devDependencies** y se carga con `require('dotenv').config()` (podria fallar en produccion con `--production`).

---

## 3. Arquitectura de la app movil (`Mobile/`)

App **React Native / Expo** (QuantumApp), SDK 54, React 19.1, RN 0.81. Es la app movil real del proyecto.

### 3.1 Estructura MVVM-lite

```
Mobile/src/
├── Config/
│   └── api.ts                     # Detecta la IP del host y construye API_URL
├── Model/                         # Tipos + servicios HTTP
│   ├── Usuario.ts                 # Tipos (Usuario, AuthResponse, Credenciales)
│   ├── AuthService.ts             # axios → /auth/login, /auth/registro
│   ├── EstacionesService.ts       # axios → /estaciones-carga
│   └── TalleresService.ts         # axios → /servicios-tecnicos
├── ViewModel/                     # Hooks de logica/estado
│   ├── AuthViewModel.tsx          # AuthContext + useAuth()
│   └── Usetalleresviewmodel.ts    # useTalleresViewModel (ubicacion, filtros, distancia)
├── View/
│   ├── Navigation/AppNavigator.tsx  # Tabs por rol (react-navigation)
│   ├── components/                # LoginButton, LogoutButton, Saludo
│   └── Screens/
│       ├── Usuario_posible_comprador/    # Invitado: Inicio, Vehiculos, Reservas
│       ├── Usuario_Vehiculo_electrico/   # Cliente: Inicio, Estaciones, Talleres, Emergencias
│       └── Usuario_Administrador/        # Admin: Inicio, Usuarios
└── styles/                        # Un *.styles.ts por pantalla (StyleSheet.create)
```

### 3.2 Detalle de capas y datos

- **Config/api.ts**: usa `Constants.expoConfig?.hostUri` para **detectar automaticamente la IP del servidor de desarrollo** y construye `API_URL = http://<host>:4000/api`. (Mejora vs. el IP hardcodeado que menciona el AGENTS.md; el IP estatico ya fue reemplazado.)
- **Model/**: servicios axios delgados. Cada uno retorna `response.data.body` (el sobre de la API). `interfaces` reflejan fielmente las columnas de la BD.
- **ViewModel/**: `AuthViewModel` expone `AuthContext` + hook `useAuth()` con `usuario`, `token`, `login`, `registro`, `logout` y flags derivados `esInvitado`, `esCliente`, `esAdministrador`.

  > El rol se eval�a con **string** `usuario.rol?.toLowerCase()` comparandolo contra `'cliente'` y `'administrador'`. OJO: esto depende de que `Roles.Nombre` en la DB tenga exactamente esos valores en min�scula.

- **Usetalleresviewmodel.ts**: hook `useTalleresViewModel` que integra `expo-location` (permiso + coordenadas), carga talleres reales de la API, filtra por `search` y `onlyAvailable` (Estado === 'disponible'), calcula distancia **Haversine** para hallar el taller mas cercano y maneja `tallerSeleccionado`/`tallerRuta`.

### 3.3 Navegacion por rol (`AppNavigator.tsx`)

Usa `@react-navigation/bottom-tabs`, con tab bar flotante (absolute, fondo `#0f172a`, radio 20, elevacion 12). Los **tabs cambian segun el rol** consultado desde `useAuth()`:

| Rol | Tabs |
|-----|------|
| Invitado (`esInvitado`) | Inicio, Vehiculos, Reservas |
| Cliente (`esCliente`) | Inicio Usuario, Estaciones de Carga, Talleres Autorizados, Emergencias |
| Administrador (`esAdministrador`) | Inicio Administrador, Usuarios |

Iconos con `@expo/vector-icons` (MaterialCommunityIcons). `SafeAreaProvider` envuelve todo.

### 3.4 Estado de integracion por pantalla

| Pantalla (dir Lender) | Uso de API | Notas |
|-----------------------|-----------|-------|
| `InicioScreen.tsx` (Invitado) | **Mock** (CAR_MODELS) | Catalogo Voltus |
| `VehiculosScreen.tsx` (Invitado) | **Mock** | Detalle + colores |
| `ReservasScreen.tsx` (Invitado) | **Mock** | Formulario + pago QR simulado (class component) |
| `InicioScreen_usuario_vehiculo.tsx` (Cliente) | **Mock** | Bateria, estaciones cercanas, historial |
| `EstacionesScreen_usuario_vehiculo.tsx` (Cliente) | **Real API** (EstacionesService) + ubicacion | Mapa, filtros, listado real |
| `TalleresScreen_usuario_vehiculo.tsx` (Cliente) | **Real API** (TalleresService + useTalleresViewModel) | Mapa, filtros, cercanos |
| `EmergenciasScreen_usuario_vehiculo.tsx` (Cliente) | **Mock** | SOS, contactos |
| `Interfaz_Administrador_Inicio.tsx` (Admin) | **Mock** | Stats, gestion contenido |
| `Interfaz_Administrador_usuarios.tsx` (Admin) | **Mock** | CRUD mock de usuarios |

**Login/registro** si tocan la API real (via AuthService). El resto es mayormente mock.

---

## 4. Arquitectura del frontend web (`Frontend/`)

SPA de **Vite + React 19 + TypeScript**. Es una app septara de la movil, con arquitectura propia.

### 4.1 Estructura (arquitectura limpia / hexagonal-lite)

```
Frontend/src/
├── domain/               # Capa de dominio pura
│   ├── modelos/            # Usuario, Vehiculo, EstacionesYTalleres (tipos)
│   ├── repositories/       # Repositorios.ts (interfaces abstractas)
│   └── usecases/           # AuthUseCase, CatalogoUseCase, EstacionesUseCase, TalleresUseCase, UsuariosUseCase
├── data/                 # Implementacion
│   ├── repositories/       # AuthRepositoryImpl, VehiculoRepositoryImpl, EstacionYTallerRepositoryImpl, UsuarioRepositoryImpl
│   ├── mocks/              # vehiculos.mock.ts, usuarios.mock.ts, estacionesYTalleres.mock.ts
│   └── index.ts            # Inyeccion de dependencias (exporta los useCases instanciados)
├── infraestructura/
│   └── http/ApiClient.ts   # fetch con sobre {error, status, body}
├── presentation/
│   ├── context/            # AuthContext.ts, AuthProvider.tsx
│   ├── navigation/         # AppNavigator.tsx
│   ├── components/         # LoginButton, LoginModal, LogoutButton, Saludo, EncabezadoSeccion
│   └── pages/
│       ├── invitado/       # PaginaInicio, PaginaVehiculos, PaginaReservas
│       ├── cliente/        # PaginaInicioCliente, PaginaEstaciones, PaginaTalleres, PaginaEmergencias
│       └── administrador/  # PaginaPanel, PaginaUsuarios
└── styles/                # base.css, componentes.css, paginas.css, variables.css
```

### 4.2 Flujo de datos (clean architecture)

```
pages (React) → usecases (domain) → repositories (interfaces) → Impl (data) → ApiClient (infraestructura) → Backend
```

La **capa `domain` no conoce** HTTP: los `UseCase` dependen de interfaces `Repositorio*` definidas en `domain/repositories/Repositorios.ts`. Las implementaciones (`*RepositoryImpl`) estan en `data/`. La inyeccion se hace manualmente en `data/index.ts`.

### 4.3 Comunicacion con el backend

- `infraestructura/http/ApiClient.ts`: `fetch` al `URL_BASE` + `ruta`. Parse el sobre `{error, status, body}`; si `error === true` lanza `Error` con el mensaje.
- `URL_BASE` = `import.meta.env.VITE_API_URL || '/api'`.
- En desarrollo, Vite (via `vite.config.ts` proxy) **reenvia `/api` a `http://localhost:4000`**, evitando CORS.
- `data/repositories/*.ts` **lee el body de la API y si la respuesta esta vacia o falla, cae a los mocks** (modo demo/resiliente).

### 4.4 Registro en el web (importante)

`AuthRepositoryImpl.registrar` hace:
1. `POST /usuarios` con `{ nombre_usuario, correo, contrasena, id_rol: 2 }` (rol cliente).
2. Luego `POST /auth/login` y devuelve `{ token, usuario }`.

### 4.5 Routing/navegacion del web

`AppNavigator.tsx` es un SPA con **navegacion por estado** (no usa react-router). El rol se calcula con `useAuth()` (flags `esInvitado/esCliente/esAdministrador`) y se renderiza un set de pantallas segun rol, con `pantallaActual` controlado por `useState`. Iconos con `lucide-react`.

### 4.6 Autenticacion (contexto)

`AuthProvider` expone el hook `useAuth()` con: `usuario`, `token`, `cargandoLogin/Registro`, `errorLogin/Registro`, `iniciarSesion`, `registrar`, `cerrarSesion` y los flags derivados. El rol se infiere con una logica robusta: `id_rol === 1` → admin; de lo contrario busca en el string `rol` coincidencias (`'admin'`, `'client'`, `'usuario'`, `'user'`).

---

## 5. Flujo de autenticacion (extremo a extremo)

1. **Cliente** ingresa `correo` + `contrasena` en la UI (Mobile `LoginButton` / web `LoginModal`).
2. El **ViewModel/AuthProvider** llama al service de auth (axios/fetch).
3. **Backend** `POST /api/auth/login` busca en `Usuarios` JOIN `Roles`, valida con `bcrypt.compare`, genera JWT y devuelve `{ token, usuario }`.
4. La UI guarda `usuario` y `token` en el **contexto** de autenticacion.
5. Los **flags derivados** (`esInvitado/esCliente/esAdministrador`) definen que tabs/paginas ver.
6. El logout solo limpia `usuario` y `token` del contexto (vuelve a invitado).

> **OJO**: el token JWT se guarda pero **aun no se envia** en las peticiones reales (salvo login/registro). No hay headers `Authorization` en el resto de llamadas.

---

## 6. Decisiones de arquitectura clave (resumen)

1. **Backend**: CRUD generico por modulo con inyeccion de DB. Duplicar carpeta = nuevo modulo.
2. **Sobre de respuesta uniforme** `{error, status, body}` en toda la API.
3. **JWT sin expiracion** + bcrypt (salt 5) para contrasenas.
4. **Mobile**: MVVM-lite con `AuthContext`; navegacion por tabs condicionada al rol.
5. **Web**: clean architecture (domain/usecases/data/infra/presentation) con inyeccion manual; cae a mocks si la API falla.
6. **Paleta de colores** compartida (GREEN `#2fb676`, BLUE `#4D9FFF`, BG `#0A0F1E`, etc.), ver `docs/Decisiones-tecnicas.md`.

---

## 7. Referencias cruzadas

- **Esquema de la BD**: `docs/base-datos.md`
- **Endpoints** (metodos, rutas, body, respuestas): `docs/Api.md`
- **Funcionalidades por rol**: `docs/Funcionalidades.md`
- **Stack y decisiones detalladas**: `docs/Decisiones-tecnicas.md`
