# Arquitectura - Quantum / Voltus

Documento de referencia para que una IA (u otro desarrollador) entienda rapidamente **como esta armado** el proyecto antes de tocar c�digo.

> **Nota de naming**: La marca/producto que muestra la UI se llama **Voltus**, pero el nombre interno del proyecto y la base de datos es **Quantum**. App movil = **QuantumApp**. Ver `React Navigation` para la app movil y un SPA propio para web.

---

## 1. Resumen de alto nivel

Monorepo con **tres subproyectos separados** (cada uno muy independiente, con su propia node_modules y, en algunos casos, su propio repo git):

| Carpeta | Tipo | Stack | Estado |
|---------|------|-------|--------|
| `Backend/` | API REST | Node.js + Express 5 + TypeScript + PostgreSQL | **Activo**, conectado a la BD |
| `Mobile/` | App movil (la app real) | Expo SDK 54 + React Native + TypeScript | **Activo**, consume la API |
| `Frontend/` | Frontend web (SPA) | Vite + React 19 + TypeScript | Parcialmente construido, consume la API |
| `docs/` | Documentacion | Markdown | Documentacion de contexto |

**Comunicacion**: `Mobile/` y `Frontend/` llaman a `Backend/` via **REST JSON** (axios en Mobile, fetch en Frontend-web). El backend es la unica fuente de verdad contra la BD.

**DB**: el backend consume **PostgreSQL `QuantumSystemDB`** (driver `pg`, puerto 5432; ver `docs/base-datos.md`).

> **Estado de la migracion**: la base se migro a **PostgreSQL `QuantumSystemDB` + pgvector** de manera **local** (embeddings de Gemini poblados) y el **backend ya la consume** via la capa `src/DB/pg.ts` (ex `mysql.ts`). Pendiente: subir a Supabase (plan Free) y conectar el backend en Render (seccion 6 de `docs/Decisiones-tecnicas.md`).

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
import db from '../../DB/pg';
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
   → DB/pg.ts (helpers promisificados sobre el pool)
   → PostgreSQL
   → la respuesta se envuelve en red/respuestas (sobre JSON uniforme)
```

### 2.3 Mapa de archivos del Backend (`src/`)

| Archivo | Rol |
|---------|-----|
| `index.ts` | Entry point: lee `port` de la app y levanta el servidor |
| `app.ts` | Crea la app Express, monta middlewares y TODAS las rutas, monta el manejador global de errores al final |
| `config.ts` | Lee `.env` (PORT, PG*, JET_SECRET). Usa `dotenv` |
| `DB/pg.ts` | Pool PostgreSQL + 7 helpers genericos de query |
| `auth/index.ts` | JWT: `asignarToken`, `chequearToken` |
| `middleware/errors.ts` | Fabrica de errores con `statusCode` opcional |
| `red/respuestas.ts` | Sobre de respuesta `success`/`error` |
| `red/errors.ts` | Middleware global que captura `next(error)` y responde |
| `modulos/auth/` | Login (JOIN Usuarios+Roles, bcrypt, JWT) |
| `modulos/Usuarios/` | CRUD Usuarios (bcrypt hash) + `seguridad.ts` (JWT, definido pero desconectado) |
| `modulos/Vehiculos/` | CRUD Vehiculos |
| `modulos/Estaciones_Carga/` | CRUD Estaciones_Carga |
| `modulos/Servicios_Tecnicos/` | CRUD Servicios_Tecnicos |
| `modulos/Colores/` | CRUD Colores |
| `modulos/Reservas/` | CRUD Reservas (POST con defaults Fecha_Reserva=hoy, Estado='Pendiente') |
| `modulos/Vehiculos_Colores/` | CRUD N:M Vehiculos↔Colores (listar, por vehiculo, por color, crear, eliminar) |
| `modulos/Clientes/` | CRUD sobre la tabla `Roles` (apunta a Roles; ver gotchas) |

### 2.4 Detalle de la capa DB (`src/DB/pg.ts`)

Un **pool** PostgreSQL con los mismos 7 helpers que tenia la capa MySQL (misma interfaz, misma inyeccion de DB):
- Los **identificadores** (tablas/columnas) se citan con **comillas dobles** (`"Vehiculos"`, `"Nombre_Modelo"`), obligatorio en Postgres por los nombres mixtos.
- Los **valores** usan parametros posicionales `$1, $2...`. En las queries en crudo, `??` se convierte en identificador y `?` en parametro (misma escritura que antes).
- `agregar` hace `INSERT ... ON CONFLICT DO NOTHING` (equivalente al upsert de MySQL) e ignora valores `undefined`.
- El tipo `DATE` se devuelve como texto `YYYY-MM-DD`.
- Si `connect` falla, reintenta cada **2 segundos** (`pool` con auto-reconexion).

| Funcion | SQL resultante |
|---------|----------------|
| `todos(tabla)` | `SELECT * FROM "tabla"` |
| `uno(tabla, campoId, id)` | `SELECT * FROM "tabla" WHERE "campoId" = $1` (devuelve la primera fila) |
| `agregar(tabla, data)` | `INSERT INTO "tabla" (cols) VALUES ($1..) ON CONFLICT DO NOTHING` |
| `actualizar(tabla, campoId, id, data)` | `UPDATE "tabla" SET "col" = $1.. WHERE "campoId" = $n` |
| `eliminar(tabla, campoId, id)` | `DELETE FROM "tabla" WHERE "campoId" = $1` |
| `query(tabla, consulta)` | `SELECT * FROM "tabla" WHERE "col" = $1..` (devuelve la primera fila) |
| `ejecutar(sql, valores)` | Query libre (auth/login JOIN, Vehiculos_Colores) |

Uso de `??` para identificadores y `?` para valores: **antisiSQL-injection**.

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
- **GET (todos/uno) enriquece** cada vehiculo con un array `colores` obtenido de la tabla N:M `Vehiculos_Colores` (JOIN con `Colores`). POST/PUT **persisten `Precio_USD`** (renombrado de `Precio_Bs` y agregado al controlador).

#### Modulo `Vehiculos_Colores` (N:M)
- CRUD para la tabla `Vehiculos_Colores` (PK compuesta `id_vehiculo`+`id_color`), que **no se ajusta al CRUD generico** de un solo `CAMPO_ID`:
  - `todos()` → lista pares.
  - `coloresDeVehiculo(id)` → JOIN con `Colores` (`SELECT c.id_color, c.Color`).
  - `vehiculosDeColor(id)` → JOIN con `Vehiculos` (`id_vehiculo`, `Nombre_Modelo`).
  - `agregar(body)` → upsert (`db.agregar`, sin duplicados).
  - `eliminar(idVehiculo, idColor)` → DELETE por par exacto (usa `db.ejecutar`).

#### Modulo `Estaciones_Carga` / `Servicios_Tecnicos`
- CRUD completo, ambos id�nticos en estructura (mismos campos: direccion, latitud, longitud, horarios, telefono, Estado).

#### Modulo `Colores`
- CRUD completo sobre la tabla `Colores` (`id_color`, `Color`).

#### Modulo `Reservas`
- CRUD completo sobre la tabla `Reservas`. El POST usa defaults `Fecha_Reserva`=hoy y `Estado`='Pendiente' si no vienen. Campos: `nombres`, `apellidos`, `cedula_identidad`, `modelo`, `color` (FK → `Colores.id_color`).

#### Modulo `Clientes`
- CRUD sobre la tabla **`Roles`** (`id_rol`, `Nombre`). Antes apuntaba a la tabla `roles` con firmas rotas; quedaron alineadas con el resto de modulos (incluye PUT). El frontend no lo consume.

### 2.8 Configuracion (`config.ts` + `.env`)

```env
PORT=4000
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=123456
PGDATABASE=QuantumSystemDB
PGPORT=5432
```

Defaults del codigo (si falta la var): puerto HTTP `4000`, host `localhost`, user `postgres`, password `''`, db `QuantumSystemDB`, puerto PG `5432`.

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
│   ├── TalleresService.ts         # axios → /servicios-tecnicos
│   ├── ColoresService.ts          # axios → /colores
│   ├── VehiculosService.ts        # axios → /vehiculos (GET lista, incluye Precio_USD)
│   └── ReservasService.ts         # axios → /reservas (POST guarda reserva)
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

- **Config/api.ts**: usa `Constants.expoConfig?.hostUri` para **detectar automaticamente la IP del servidor de desarrollo** y construye `API_URL = http://<host>:4000/api`. Si no hay `hostUri` (p. ej. en web), **cae a `http://localhost:4000/api`**. (Mejora vs. el IP hardcodeado que menciona el AGENTS.md; el IP estatico ya fue reemplazado.)
- **Stub de mapas en web**: `react-native-maps` es nativo y no existe en web; `metro.config.js` lo redirige (solo en plataforma `web`) a `src/stubs/react-native-maps.web.tsx`, que renderiza un placeholder. Las pantallas no se modifican.
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
| `VehiculosScreen.tsx` (Invitado) | **Real API** (VehiculosService GET /vehiculos + ColoresService GET /colores) | Listado + detalle; colores desde `colores[]` N:M (fallback a id_color); sin foto (placeholder) |
| `ReservasScreen.tsx` (Invitado) | **Real API** (ReservasService POST /reservas, ColoresService GET /colores, VehiculosService GET /vehiculos) | Formulario validado; modelos desde /vehiculos; sin QR (class component) |
| `InicioScreen_usuario_vehiculo.tsx` (Cliente) | **Mock** | Bateria, estaciones cercanas, historial |
| `EstacionesScreen_usuario_vehiculo.tsx` (Cliente) | **Real API** (EstacionesService) + ubicacion | Mapa, filtros, listado real |
| `TalleresScreen_usuario_vehiculo.tsx` (Cliente) | **Real API** (TalleresService + useTalleresViewModel) | Mapa, filtros, cercanos |
| `EmergenciasScreen_usuario_vehiculo.tsx` (Cliente) | **Mock** | SOS, contactos |
| `Interfaz_Administrador_Inicio.tsx` (Admin) | **Mock** | Stats, gestion contenido |
| `Interfaz_Administrador_usuarios.tsx` (Admin) | **Mock** | CRUD mock de usuarios |

**Login/registro** si tocan la API real (via AuthService). El resto es mayormente mock.

---

## 4. Arquitectura del frontend web (`Frontend/`)

SPA de **Vite + React 19 + TypeScript**. Es una app separada de la movil, con arquitectura propia **basada en componentes**.

### 4.1 Estructura (arquitectura basada en componentes)

```
Frontend/src/
├── components/           # Componentes reutilizables de la interfaz
│   ├── EncabezadoSeccion.tsx   # Titulo de seccion con enlace/contador
│   ├── LoginButton.tsx         # Boton "Cuenta" + abre LoginModal
│   ├── LoginModal.tsx          # Modal login/registro (usa useAuth)
│   ├── LogoutButton.tsx        # Boton "Salir"
│   └── Saludo.tsx              # Avatar + "Hola, {nombre}" (usa useAuth)
├── hooks/                # Hooks personalizados y logica reutilizable
│   ├── useAuth.ts              # AuthContext + createContext + hook useAuth()
│   ├── AuthProvider.tsx        # Widget de estado de auth (login/registro, flags de rol)
│   └── useDatos.ts             # useVehiculos, useEstaciones, useTalleres, useUsuarios
├── pages/                # Paginas completas del sistema (según rol)
│   ├── invitado/          # PaginaInicio, PaginaVehiculos, PaginaReservas
│   ├── cliente/           # PaginaInicioCliente, PaginaEstaciones, PaginaTalleres, PaginaEmergencias
│   └── administrador/     # PaginaPanel, PaginaUsuarios
├── routes/               # Configuracion de las rutas de la app
│   ├── config.ts              # NAVEGACION (tabs por rol) + INICIO_POR_ROL
│   └── AppNavigator.tsx       # Shell + router por estado
├── services/             # Comunicacion con el backend/API
│   ├── apiClient.ts           # peticion() con sobre {error, status, body}
│   ├── authService.ts         # iniciarSesion, registrar (POST /usuarios + /auth/login)
│   ├── vehiculosService.ts    # GET /vehiculos + adaptar + fallback mocks
│   ├── estacionesService.ts   # GET /estaciones-carga + fallback mocks
│   ├── talleresService.ts     # GET /servicios-tecnicos + fallback mocks
│   ├── usuariosService.ts     # GET /usuarios + adaptar + fallback mocks
│   └── mocks/                 # vehiculos.ts, usuarios.ts, estacionesYTalleres.ts
├── utils/                # Funciones auxiliares y utilidades
│   ├── roles.ts               # esRolAdministrador, esRolCliente
│   └── iniciales.ts           # obtenerIniciales
├── types/                # Interfaces y tipos de TypeScript
│   ├── Usuario.ts             # Usuario, Credenciales, DatosRegistro, RespuestaAuth, UsuarioAdministracion
│   ├── Vehiculo.ts            # Vehiculo, ColorVehiculo
│   └── EstacionesYTalleres.ts # EstacionCarga, ServicioTecnico, VelocidadCarga
├── styles/                # variables.css, base.css, componentes.css, paginas.css
└── assets/                # imagenes/iconos (hero.png, react.svg, vite.svg)
```

### 4.2 Flujo de datos (componentes + hooks + servicios)

```
pages (React) → hooks (useDatos/useAuth) → services (fetch) → Backend
                     │
                     └── utils (roles, iniciales)
```

Las paginas **no hacen fetch directamente**: consumen hooks custom que envuelven a los services. Los services son el unico punto que toca la API (`apiClient.peticion`) y **cada uno cae a mocks** si la peticion falla o devuelve una lista vacia (modo demo/resiliente). Las `types/` son el contrato compartido entre pages, hooks y services.

### 4.3 Comunicacion con el backend

- `services/apiClient.ts`: `fetch` al `URL_BASE` + `ruta`. Parse el sobre `{error, status, body}`; si `error === true` lanza `Error` con el mensaje.
- `URL_BASE` = `import.meta.env.VITE_API_URL || '/api'`.
- En desarrollo, Vite (via `vite.config.ts` proxy) **reenvia `/api` a `http://localhost:4000`**, evitando CORS.
- `services/*Service.ts` **lee el body de la API y si la respuesta esta vacia o falla, cae a los mocks** (modo demo/resiliente).

### 4.4 Registro en el web (importante)

`authService.registrar` hace:
1. `POST /usuarios` con `{ nombre_usuario, correo, contrasena, id_rol: 2 }` (rol cliente).
2. Luego `POST /auth/login` y devuelve `{ token, usuario }`.

### 4.5 Routing/navegacion del web

`routes/AppNavigator.tsx` es un SPA con **navegacion por estado** (no usa react-router). La config de rutas vive en `routes/config.ts` (`NAVEGACION` por rol e `INICIO_POR_ROL`). El rol se calcula con `useAuth()` (flags `esInvitado/esCliente/esAdministrador`) y se renderiza un set de pantallas segun rol, con `pantallaActual` controlado por `useState`. Iconos con `lucide-react`.

### 4.6 Autenticacion (contexto + hook)

`hooks/AuthProvider.tsx` (widget) expone el hook `useAuth()` (definido en `hooks/useAuth.ts`) con: `usuario`, `token`, `cargandoLogin/Registro`, `errorLogin/Registro`, `iniciarSesion`, `registrar`, `cerrarSesion` y los flags derivados. El rol se infiere con una logica robusta en `utils/roles.ts`: `id_rol === 1` → admin; de lo contrario busca en el string `rol` coincidencias (`'admin'`, `'client'`, `'usuario'`, `'user'`).

---

## 5. Flujo de autenticacion (extremo a extremo)

1. **Cliente** ingresa `correo` + `contrasena` en la UI (Mobile `LoginButton` / web `LoginModal`).
2. El **AuthProvider**/hook `useAuth` llama al service de auth (fetch).
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
5. **Web**: arquitectura basada en componentes (`components/pages/hooks/services/utils/types/routes`). Las paginas consumen hooks (`useDatos.ts`) que envuelven a los services (`apiClient.ts`); cae a mocks si la API falla.
6. **Paleta de colores** compartida (GREEN `#2fb676`, BLUE `#4D9FFF`, BG `#0A0F1E`, etc.), ver `docs/Decisiones-tecnicas.md`.

---

## 7. Referencias cruzadas

- **Esquema de la BD**: `docs/base-datos.md`
- **Endpoints** (metodos, rutas, body, respuestas): `docs/Api.md`
- **Funcionalidades por rol**: `docs/Funcionalidades.md`
- **Stack y decisiones detalladas**: `docs/Decisiones-tecnicas.md`
