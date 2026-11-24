# Arquitectura - Quantum / Voltus

### Actualizacion visual del frontend web (noviembre de 2026)

El contenedor `.espacio-privado` reune el diseno visual de cliente y administrador: fondo general `#070f0f`, tarjetas con relleno `#edf7f5`, texto negro en negrilla, franja verde superior, sombras suaves y lineas separadoras. El sidebar mantiene sus estilos originales. Los iconos usan marcos circulares negros de 1px y los botones de rutas usan bordes negros delgados.

En `PaginaInicioCliente.tsx`, el mismo tratamiento visual se aplica al vehiculo propio, acciones rapidas, estaciones cercanas, historial de cargas y ruta inteligente. `EncabezadoSeccion` y `EncabezadoPrivado` muestran titulos en mayusculas y en una sola linea horizontal con truncado responsive.

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
| `config.ts` | Lee `.env` (PORT, PG*, `JWT_SECRET`/`JET_SECRET`, `JWT_EXPIRACION`, `CORS_ORIGINS`). Usa `dotenv` |
| `DB/pg.ts` | Pool PostgreSQL + 7 helpers genericos de query |
| `auth/index.ts` | JWT + autorizacion: `asignarToken`, `autenticar`, `soloAdmin` |
| `middleware/errors.ts` | Fabrica de errores con `statusCode` opcional |
| `red/respuestas.ts` | Sobre de respuesta `success`/`error` |
| `red/errors.ts` | Middleware global que captura `next(error)` y responde |
| `modulos/auth/` | Login/registro/sesion (JOIN Usuarios+Roles, bcrypt 10, JWT 8h) |
| `modulos/Usuarios/` | CRUD Usuarios **solo admin** (bcrypt 10, respuestas sin hash) |
| `modulos/Vehiculos/` | CRUD Vehiculos |
| `modulos/Estaciones_Carga/` | CRUD Estaciones_Carga |
| `modulos/Servicios_Tecnicos/` | CRUD Servicios_Tecnicos |
| `modulos/Colores/` | CRUD Colores |
| `modulos/Reservas/` | CRUD Reservas (POST con defaults Fecha_Reserva=hoy, Estado='Pendiente') |
| `modulos/Vehiculos_Colores/` | CRUD N:M Vehiculos↔Colores (listar, por vehiculo, por color, crear, eliminar) |
| `modulos/Clientes/` | CRUD sobre la tabla `Roles` (apunta a Roles; ver gotchas) |

#### Que hace cada carpeta/archivo del Backend

Flujo de una peticion: `index.ts` -> `app.ts` (middleware + montaje de rutas) -> `modulos/X/rutas.ts` -> `modulos/X/controlador.ts` -> `DB/pg.ts` -> PostgreSQL. Los errores vuelven por `red/errors.ts` usando el sobre uniforme `{error, status, body}`.

| Carpeta / archivo | Que hace |
|---|---|
| `src/index.ts` | Arranque: lee el puerto de `app.get('port')` y hace `listen`. |
| `src/app.ts` | Arma la app Express: `helmet`, `cors` con allowlist, `morgan('dev')`, `express.json({limit:'100kb'})`, `urlencoded` y rate limits; monta cada router bajo `/api/*` y al final el middleware de errores. Aqui se ve de un vistazo que modulos existen. El login permite **6 fallidos/15 min** (`skipSuccessfulRequests` + reset tras un 200), el registro 20/15 min y el chatbot 30/min; login/registro usan claves prefijadas distintas en `Rate_Limits`. |
| `src/config.ts` | Configuracion unica desde `.env` (con defaults): puerto HTTP 4000, secreto JWT y credenciales PG (host, user, password, database `QuantumSystemDB`, port 5432). |
| `src/DB/pg.ts` | **Unica capa de acceso a datos.** Un `Pool` de `pg` con reconexion automatica (`SELECT 1` cada 2 s si falla) y helpers genericos: `todos`, `uno`, `agregar`, `actualizar`, `eliminar`, `query`, `ejecutar`. Escapa identificadores con comillas, filtra `undefined` y castea `::vector` cuando el valor viene como `{vector}`. Tambien fuerza `DATE` a string para no romper el contrato con los frontends. |
| `src/modulos/` | **Un CRUD por tabla**, cada uno en su carpeta con 3 archivos: `index.ts` (factory `crearControlador(db)` que recibe la DB inyectada), `rutas.ts` (Router + handlers con `try/catch -> next(error)`) y `controlador.ts` (logica de negocio, constantes `TABLA`/`CAMPO_ID`, funciones `camelCase`). Modulos: `auth`, `Usuarios`, `Clientes`, `Vehiculos`, `Colores`, `Vehiculos_Colores`, `Reservas`, `Estaciones_Carga`, `Servicios_Tecnicos`, `Chatbot`. Anadir un modulo = duplicar carpeta. |
| `src/red/respuestas.ts` | El sobre JSON uniforme: `success(req,res,body,status)` y `error(...)` -> siempre `{error, status, body}`. |
| `src/red/errors.ts` | Middleware final de Express: loguea el error y lo traduce con `respuesta.error` usando `err.statusCode` (o 500). |
| `src/middleware/errors.ts` | Fabrica `error(mensaje, codigo)` que crea `Error` con `statusCode`, para lanzar errores con codigo desde cualquier controlador. |
| `src/auth/index.ts` | Envuelve JWT: `asignarToken` (firma con expiracion), cookie httpOnly `quantum_token`, `autenticar` (header o cookie) y `soloAdmin` (consulta el rol en la BD y exige administrador). |
| `src/ia/` | **Capa de IA con proveedor intercambiable.** `index.ts` es el selector (lee `CHAT_PROVEEDOR` del `.env`: `gemini` \| `deepseek`) y expone `estado()` para `GET /api/chatbot/estado`. `gemini.ts` y `deepseek.ts` implementan el contrato de `tipos.ts` (que define `Proveedor`, `MensajeConversacion` y el lector SSE compartido `leerSSE`). El nombre del modelo **siempre** viene del `.env`, nunca hardcodeado. |
| `src/embeddings/index.ts` | Genera vectores de 768 dims para poblar la columna `embedding` al guardar (POST/PUT). Tiene una **allowlist** `COLUMNAS_POR_TABLA` (solo `Vehiculos`, `Servicios_Tecnicos`, `Estaciones_Carga`) y una **denylist** de regex (correo, 7-14 digitos, claves) que aborta el envio de datos personales. Si falta la API key devuelve `null` con warning y **no genera vectores falsos**. |
| `src/rag/index.ts` | Recuperacion de contexto para el chatbot: vectoriza la pregunta con el mismo embedder, busca por coseno (`<=>`) en las tablas de la allowlist, filtra por umbral y corta en `top_k`, y convierte cada fila en una frase legible con etiquetas en lenguaje natural. Incluye la denylist de prompt injection y serializa cada valor del contexto como texto literal entre comillas (omite valores sospechosos). |
| `src/modulos/Chatbot/` | Combina RAG + IA: `/estado` (proveedor, modelo, si hay clave, si el RAG esta operativo), `/` (respuesta completa con el sobre JSON) y `/stream` (SSE con `X-Accel-Buffering: no` para que los proxies no buffereen). |
| `scripts/vectorizar_datos.ts` | Script one-off que (re)genera los embeddings de las tablas permitidas; comparte la misma logica y modelo que `src/embeddings`. |
| Raiz (`package.json`, `tsconfig.json`, `.env.example`) | `npm run dev` = `nodemon --exec ts-node src/index.ts`. `dotenv` esta en `dependencies` (necesario en runtime). |

**Regla de dependencias**: `app.ts -> modulos/*/rutas -> index (factory) -> controlador -> DB/pg`. Los controladores nunca escriben SQL directamente; `ia/`, `embeddings/` y `rag/` son servicios que solo los modulos consumidores (Vehiculos, Reservas, Chatbot) importan.

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
- `asignarToken(data)`: `jwt.sign(data, secret, { expiresIn: '8h' })` con algoritmo HS256.
- `autenticar(req, res, next)`: extrae el token del header `Authorization: Bearer <token>` o de la cookie `quantum_token`, lo verifica y lo adjunta a `req.user`.
- `soloAdmin(req, res, next)`: valida el token, consulta `Usuarios + Roles` en la BD y exige `id_rol === 1` o rol `admin`/`administrador` (401 si no hay token/usuario, 403 si el rol no es admin).

Secret tomado de `config.jwt.secret` = `JWT_SECRET` o el legado `JET_SECRET`; si falta en desarrollo se genera uno aleatorio temporal. En produccion, si falta `JWT_SECRET`, el backend **lanza error al arrancar**. `JWT_EXPIRACION` (por defecto `8h`) controla la caducidad; `GET /api/auth/sesion` revalida al usuario contra la BD.

## 7. Gestion de imagenes del sistema

Para las imágenes del catálogo (vehículos), se adopta el siguiente criterio:

- **No guardar binarios en PostgreSQL** (`bytea` ni Large Objects). Estos binarios, si se incluyen en `pg_dump`, se restauran dentro del cluster y aumentan innecesariamente el tamaño de la base.
- **Usar Supabase Storage** (S3-compatible) para el almacenamiento físico. Los **metadatos** (ruta, nombre, tamaño) permanecen en PostgreSQL.
- **Guardar solo la URL** en la base de datos. En desarrollo local: archivos en `Backend/public/imagenes/vehiculos/` con URL `http://localhost:4000/imagenes/vehiculos/<archivo>`. En producción: bucket público `vehiculos` en Supabase Storage con su URL pública.
- **Esquema propuesto:**
  - `Opción A` (actual/principal): añadir `imagen_url TEXT` a la tabla `"Vehiculos"`.
  - `Opción B` (galería): crear `"Vehiculo_Imagenes"` (`id_imagen`, `id_vehiculo` FK, `url`, `es_principal`, `orden`) para soportar múltiples fotos por vehículo.

**Recomendación:** iniciar con **Opción A**. El frontend debe mostrar `imagen_url` si existe, o el placeholder actual si está vacío.

Más detalles en `docs/Decisiones-tecnicas.md`, sección **"9. Gestión de imágenes del sistema"**.

---

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
- `POST /login`: busca por `correo`, hace JOIN `Usuarios INNER JOIN Roles` para obtener `rol` (el `Nombre` del rol), compara la contrasena con `bcrypt.compare` (hash falso cuando no hay usuario, para igualar tiempos), rehashea si el coste es menor a 10, devuelve `{ token, usuario }` (sin el hash) y setea la cookie httpOnly.
- `POST /registro`: crea el usuario siempre con rol Cliente, hashea con bcrypt 10 antes de chequear duplicados y devuelve `{ token, usuario }`. Responde `409` generico si el correo ya existe.
- `POST /logout`: limpia la cookie `quantum_token`.
- `GET /sesion`: revalida el JWT (header o cookie) contra la BD (`auth.autenticar`) y devuelve `{ usuario }` actualizado.

#### Modulo `Usuarios`
- CRUD completo **solo admin**; las rutas usan `router.use(auth.soloAdmin)`.
- En `agregar` y `actualizar` hashea la contrasena con `bcrypt` (salt 10). En `actualizar`, el cambio de contrasena es condicional (solo si viene `body.contrasena`).
- Los `GET` devuelven solo `id_usuario`, `nombre_usuario`, `correo` e `id_rol` (nunca el hash). `id_usuario` del body se ignora (sin mass assignment).

#### Modulo `Vehiculos`
- CRUD completo; los mutadores (POST/PUT/DELETE) requieren rol admin.
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

`dotenv` esta en **dependencies** y se carga con `require('dotenv').config()`. Hay `.env.example` en `Backend/`, `Frontend/` y `Mobile/` con las variables necesarias.

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

#### Que hace cada carpeta/archivo de Mobile

Flujo: `App.tsx` -> `View/Navigation/AppNavigator` -> `View/Screens` -> `ViewModel` -> `Model` -> axios -> Backend, con los estilos en `src/styles/`.

| Carpeta / archivo | Que hace |
|---|---|
| `App.tsx` | Raiz minima: solo monta `<AppNavigator />`. |
| `src/Config/api.ts` | Detecta la IP del host de Expo (`Constants.expoConfig.hostUri`) y exporta `API_URL = http://<host>:4000/api`, con fallback a `localhost:4000` para web/emulador. |
| `src/View/` | **Capa de presentacion (solo JSX).** `Navigation/AppNavigator.tsx` monta `SafeAreaProvider` -> `AuthProvider` -> `NavigationContainer` -> `Tab.Navigator`, y declara las tabs **condicionalmente segun el rol** (`esInvitado` / `esCliente` / `esAdministrador`) con iconos de `MaterialCommunityIcons` y una tab bar flotante; el `Chatbot` se monta una vez fuera del navigator. `Screens/` agrupa las pantallas por rol: `Usuario_posible_comprador/` (Inicio, Vehiculos, Reservas), `Usuario_Vehiculo_electrico/` (Inicio, Estaciones, Talleres, Emergencias) y `Usuario_Administrador/` (Inicio, Usuarios). `components/` tiene las piezas reutilizables: `Chatbot`, `LoginButton`, `LogoutButton`, `Saludo`. |
| `src/ViewModel/` | **Puente entre View y Model.** `AuthViewModel.tsx` es el `AuthProvider` (contexto con `usuario`, `token`, `login`, `registro`, `logout`, flags por rol, estados de carga y error) mas el hook `useAuth()`. `Usetalleresviewmodel.ts` es un ViewModel puntual de talleres. |
| `src/Model/` | **Capa de datos (axios, sin JSX).** Un service por recurso: `AuthService`, `VehiculosService`, `ReservasService`, `ColoresService`, `EstacionesService`, `TalleresService`. Todos usan `Config/http.ts`, que agrega `Authorization: Bearer` desde `Config/token.ts` (token en memoria). Devuelven el campo `body` del sobre (ej. `response.data.body` en login). `Usuario.ts` contiene las interfaces (`Usuario`, `AuthResponse`, `Credenciales`). |
| `src/styles/` | Un `*.styles.ts` por pantalla/componente con `StyleSheet.create`, mas la paleta compartida exportada desde aqui. Los estilos no viven en el JSX. |
| `src/stubs/react-native-maps.web.tsx` | Stub de `MapView`/`Marker` para que la app compile en web, donde la libreria nativa no existe. |
| `assets/` | Imagenes de la app (iconos, splash, logos). |
| Raiz (`app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `tsconfig.json`) | Configuracion Expo/Metro. `metro.config.js` inyecta el stub de mapas en web y registra NativeWind (`global.css` esta comentado: NativeWind esta instalado pero **no se usa**). `npm run lint` = eslint + prettier check. |

**Regla de dependencias**: `View -> ViewModel -> Model`. Las pantallas no llaman axios directamente. Gotchas: el token se guarda en memoria (`Config/token.ts`) y se envia via interceptor; se pierde al reiniciar la app, asi que hay que volver a login. `ReservasScreen` es la unica pantalla que es class component en lugar de hook funcional.

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
│   ├── Chatbot.tsx              # FAB flotante + panel de chat "Asistente Quantum" (todas las interfaces)
│   ├── EncabezadoSeccion.tsx    # Titulo de seccion con enlace/contador
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
│   └── administrador/     # PaginaPanel, PaginaUsuarios, PaginaGraficos
├── routes/               # Configuracion de las rutas de la app
│   ├── config.ts              # NAVEGACION (tabs por rol) + INICIO_POR_ROL
│   └── AppNavigator.tsx       # Shell + router por estado
├── services/             # Comunicacion con el backend/API
│   ├── apiClient.ts           # peticion() con sobre {error, status, body}
│   ├── authService.ts         # iniciarSesion, registrar (POST /usuarios + /auth/login)
│   ├── vehiculosService.ts    # GET /vehiculos + adaptar; [] si falla/vacio
│   ├── estacionesService.ts   # GET /estaciones-carga; [] si falla/vacio
│   ├── talleresService.ts     # GET /servicios-tecnicos; [] si falla/vacio
│   ├── usuariosService.ts     # GET/POST/DELETE /usuarios + adaptar; [] si falla/vacio
│   └── (mocks/ eliminado sept 2026: ya no hay fallback a mocks)
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

#### Que hace cada carpeta/archivo del Frontend web

Flujo de datos: `main.tsx` -> `App` (AuthProvider) -> `routes/AppNavigator` -> `pages` -> `hooks` -> `services` -> `apiClient` (fetch) -> Backend.

| Carpeta / archivo | Que hace |
|---|---|
| `src/main.tsx` | Punto de entrada. Monta React con `createRoot`, importa las fuentes (Inter) y los 5 CSS globales en orden. |
| `src/App.tsx` | Envoltorio raiz: solo envuelve todo en `<AuthProvider>` y monta el `AppNavigator`. |
| `src/routes/` | **Navegacion y layout.** `AppNavigator.tsx` es el "router": cabecera con nav, `<main>` con la pagina activa y `<footer>`; decide que pagina se muestra con `useState('pantalla')` + condicionales por rol. `config.ts` define el tipo `Rol` y el menu `NAVEGACION` por rol + pantalla de inicio. No usa React Router: el estado reemplaza a las rutas. |
| `src/pages/` | **Pantallas, agrupadas por rol** (`invitado/`, `cliente/`, `administrador/`). Cada `Pagina*.tsx` es una pantalla completa; consume datos via hooks y recibe callbacks (`alVerVehiculos`, `alReservar`) para navegar. `invitado/PaginaInicio.tsx` arma las 3 cards de modelo con imágenes/textos de detalle y los bloques de video. |
| `src/components/` | **Piezas de UI reutilizables y sin datos**: `LoginModal`, `LoginButton`, `LogoutButton`, `Saludo`, `EncabezadoSeccion` (titulo de seccion), `MedioVisual` (imagen/video con fallback y respeto a `prefers-reduced-motion`), `CarruselInicio`, `Chatbot` (widget flotante) y `MapaLugar` (mapa **Leaflet** con marcadores, punto del usuario y ruta; lo usan Estaciones y Talleres). |
| `src/hooks/` | **Capa de estado de React.** `useDatos.ts` contiene un hook generico `useColeccion` (carga, estado `cargando`, `actualizar`, `recargar`) y lo especial en `useVehiculos`, `useEstaciones`, `useTalleres`, `useUsuarios`. `useUbicacion` obtiene la **geolocalizacion** del navegador (`navigator.geolocation`, re-pedible con `solicitar`) y `useRutaCercana` selecciona el destino accesible con menor tiempo de viaje y calcula la ruta en auto. `AuthProvider.tsx` + `useAuth.ts` dan el contexto de sesion y los flags `esInvitado/esCliente/esAdministrador`. |
| `src/services/` | **Logica de datos pura (sin React).** Un archivo por recurso (`vehiculosService`, `reservasService`, `coloresService`, `usuariosService`, `estacionesService`, `talleresService`, `chatbotService`, `authService`). Traducen la API al modelo de la UI y devuelven `[]` si la API falla (sin mocks). `rutasService` es el unico que NO habla con el backend: consume OSRM Table y Route, con errores explicitos sin linea recta de respaldo. |
| `src/services/apiClient.ts` | **Unica capa que habla con el backend.** `fetch` a `URL_BASE` (`VITE_API_URL` o `/api`) con `credentials: 'include'` (cookie httpOnly), valida el sobre `{error, status, body}`, desenvuelve `body` y lanza errores con mensajes legibles. |
| `src/types/` | Interfaces TS del dominio de la UI: `Usuario.ts`, `Vehiculo.ts`, `EstacionesYTalleres.ts` (dos en un archivo). Evitan `any` en paginas y hooks. |
| `src/utils/` | Funciones auxiliares sin estado: `sesion.ts` (lee/escribe solo `quantum_usuario` en `localStorage`; el token vive en cookie httpOnly), `roles.ts` (`esAdministrador`/`esCliente` con fallback por `id_rol`), `iniciales.ts` (avatar con iniciales), `geo.ts` (calculo **Haversine** de distancias y formateadores km/minutos para las rutas). |
| `src/styles/` | **CSS plano global, no modulos ni CSS-in-JS.** `variables.css` (tokens/paleta), `base.css` (reset + tipografia), `componentes.css` (~918 lineas, clases BEM de componentes), `paginas.css` (~2000 lineas, estilos por pantalla), `temas.css` (variantes por rol `.aplicacion--cliente`, etc.). |
| `src/assets/` | Imagenes y videos importables por codigo (`logo_quantum.png`, `Equte volante.png`, `Pantalla nexus plus.png`, `E4 Montanero botones.png`, `video dentro del auto2.mp4`, `carga electrica2.mp4`, etc.). |
| `public/` | Archivos servidos tal cual, sin procesar (`favicon.svg`, `icons.svg`). |
| Raiz (`vite.config.ts`, `index.html`, `tsconfig.*.json`, `eslint.config.js`) | Configuracion de build de Vite (con proxy `/api` -> `localhost:4000`), HTML base, TypeScript en modo project references y ESLint. |

**Regla de dependencias**: las flechas van en un solo sentido -- `pages -> hooks -> services -> apiClient`. Las paginas nunca llaman a `fetch` ni a `apiClient` directamente, y los services nunca importan React.

### 4.2 Flujo de datos (componentes + hooks + servicios)

#### Inicio invitado: cards y videos (nov 2026)

`PaginaInicio.tsx` consume `useVehiculos()` y, para las 3 primeras filas, aplica un mapa por nombre de modelo que sustituye la imagen genérica de la API por una imagen de detalle y agrega un texto corto:

| Modelo | Imagen | Texto |
|---|---|---|
| KAIYI EQUTE | `Equte volante.png` | Confort al volante y mandos al alcance |
| NEXUS PLUS | `Pantalla nexus plus.png` | Tecnología de pantalla de última generación |
| E4 MONTAÑERO | `E4 Montanero botones.png` | Confort interior y materiales cuidados |

Los videos se centralizan en `src/config/multimedia.ts`: `videoCarga` apunta a `carga electrica2.mp4` y `videoExperiencia` a `video dentro del auto2.mp4`. `MedioVisual` reproduce el video de experiencia en `loop`, `muted` y sin control visible; la sección usa `.editorial__seccion.editorial__seccion--video` para ocupar `100vw` (full-bleed) sin `!important`. Las cards llevan borde de 2px `rgba(0,0,0,0.65)` y radio de 24px definidos en `styles/paginas.css`.

#### Estaciones del cliente: tarjetas de resumen (nov 2026)

En `pages/cliente/PaginaEstaciones.tsx`, las tarjetas "Estaciones cerca", "Puntos libres" y "Operativas" comparten estilo con las tarjetas de estación (por ejemplo, "Subestación de Villa Tunari (Cruce San Mateo)"): relleno `#9DB69D`, borde blanco de 1px, radio 12px, padding 24px, separación de 16px y texto/iconos `#1c1c1c`. Las reglas viven en `styles/diseno-privado.css` con selectores `.aplicacion--cliente .fila-estadisticas ...`.

#### Gráficos del administrador (implementado el 11 de noviembre de 2026)

`routes/config.ts` incorpora `graficos` exclusivamente al menú administrador. `AppNavigator.tsx` monta `PaginaGraficos` condicionado al rol, con el icono `ChartNoAxesCombined` de Lucide. `EncabezadoPrivado.tsx` define el título y descripción de esta pantalla.

Hay dos flujos independientes:

```text
PaginaGraficos → GraficosReservas / GraficoEstaciones → iframe → Grafana local → fuente PostgreSQL configurada en Grafana
PaginaGraficos → InterpretacionReservas / InterpretacionEstaciones → hooks de análisis → services de análisis → apiClient → API REST → PostgreSQL
```

| Archivo bajo `Frontend/src/` | Responsabilidad |
|---|---|
| `pages/administrador/PaginaGraficos.tsx` | Ordena los dos paneles y las tarjetas de resultados e interpretación |
| `components/GraficosReservas.tsx` | Iframe del dashboard `ad5j5kw`, panel `panel-1` |
| `components/GraficoEstaciones.tsx` | Iframe del dashboard `add5j8r`, panel `1` |
| `components/InterpretacionReservas.tsx` | Cifras, preferencias de modelos, máximos diarios y seguimiento pendiente |
| `components/InterpretacionEstaciones.tsx` | Total, distribución de estados e interpretación del catálogo de estaciones |
| `hooks/useAnalisisReservas.ts`, `hooks/useAnalisisEstaciones.ts` | Consulta inicial, reintentos cada 10 segundos tras finalizar cada petición y limpieza al desmontar |
| `services/analisisReservasService.ts`, `services/analisisEstacionesService.ts` | Consultan los endpoints existentes y calculan resúmenes, propagando errores |
| `styles/graficos.css` | Tarjetas, estados vacíos, cifras e iframes adaptables, según los tokens visuales existentes |

Las URLs de Grafana están actualmente en los componentes y apuntan a `http://localhost:3000`. Solicitan tema oscuro, rango `now-30d` a `now` y `refresh=10s`. Los resúmenes no extraen datos del iframe ni leen el SQL del dashboard; su equivalencia requiere contrastar consultas, períodos y filtros. No se añadieron rutas de backend, migraciones ni dependencias npm.

La restricción por rol pertenece a la navegación web y no sustituye la autorización en Grafana. No hay proxy autenticado ni inicio de sesión único. Detalles de configuración y límites en [Plan-Grafana.md](Plan-Grafana.md).

```
pages (React) → hooks (useDatos/useAuth) → services (fetch) → Backend
                     │
                     └── utils (roles, iniciales)
```

Las paginas **no hacen fetch directamente**: consumen hooks custom que envuelven a los services. Los services son el unico punto que toca la API (`apiClient.peticion`) y **desde sept 2026 no caen a mocks**: si la peticion falla o devuelve una lista vacia devuelven `[]` (la UI muestra listas vacias, no datos falsos). Las `types/` son el contrato compartido entre pages, hooks y services.

### 4.3 Comunicacion con el backend

- `services/apiClient.ts`: `fetch` al `URL_BASE` + `ruta`. Parse el sobre `{error, status, body}`; si `error === true` lanza `Error` con el mensaje.
- `URL_BASE` = `import.meta.env.VITE_API_URL || '/api'`.
- En desarrollo, Vite (via `vite.config.ts` proxy) **reenvia `/api` a `http://localhost:4000`**, evitando CORS.
- `services/*Service.ts` **lee el body de la API; si la respuesta esta vacia o la peticion falla, devuelve `[]`** (sin mocks desde sept 2026).
- `apiClient.peticion` usa `credentials: 'include'` para enviar la cookie httpOnly `quantum_token` al backend.

### 4.4 Registro en el web (importante)

`authService.registrar` hace:
1. `POST /usuarios` con `{ nombre_usuario, correo, contrasena, id_rol: 2 }` (rol cliente).
2. Luego `POST /auth/login` y devuelve `{ token, usuario }`.

### 4.5 Routing/navegacion del web

`routes/AppNavigator.tsx` es un SPA con **navegacion por estado** (no usa react-router). La config de rutas vive en `routes/config.ts` (`NAVEGACION` por rol e `INICIO_POR_ROL`). El rol se calcula con `useAuth()` (flags `esInvitado/esCliente/esAdministrador`) y se renderiza un set de pantallas segun rol, con `pantallaActual` controlado por `useState`. Iconos con `lucide-react`.

**Chatbot global**: el componente `components/Chatbot.tsx` se monta **una sola vez** en `AppNavigator.tsx` (como hermano del `<footer>`, detras del `</div class="aplicacion">`), por lo que aparece en **todas las paginas y los 3 roles** (invitado, cliente, administrador). Es un FAB flotante verde (abajo a la derecha, `z-index: 80`) que abre un panel de chat "Asistente Quantum" con burbujas, hora de envio y saludo inicial. Al igual que el chatbot del movil, es **100% visual**: no consume API ni responde aun (el "cerebro" RAG + Gemini sigue pendiente, ver seccion 6 de `docs/Decisiones-tecnicas.md`).

### 4.6 Autenticacion (contexto + hook)

`hooks/AuthProvider.tsx` (widget) expone el hook `useAuth()` (definido en `hooks/useAuth.ts`) con: `usuario`, `token`, `cargandoLogin/Registro`, `errorLogin/Registro`, `iniciarSesion`, `registrar`, `cerrarSesion` y los flags derivados. El rol se infiere con una logica robusta en `utils/roles.ts`: `id_rol === 1` → admin; de lo contrario busca en el string `rol` coincidencias (`'admin'`, `'client'`, `'usuario'`, `'user'`).

---

## 5. Flujo de autenticacion (extremo a extremo)

1. **Cliente** ingresa `correo` + `contrasena` en la UI (Mobile `LoginButton` / web `LoginModal`).
2. El **AuthProvider**/hook `useAuth` llama al service de auth (fetch).
3. **Backend** `POST /api/auth/login` busca en `Usuarios` JOIN `Roles`, valida con `bcrypt.compare`, genera JWT y devuelve `{ token, usuario }`.
4. La UI guarda el `usuario` en el contexto y en `localStorage`; el **token queda en la cookie httpOnly** que seteo el backend. Al recargar, `GET /auth/sesion` restaura el usuario desde la cookie.
5. El backend valida el JWT en las rutas protegidas (`auth.soloAdmin` consulta el rol en la BD).
6. El logout llama a `POST /auth/logout` (limpia la cookie) y borra el usuario local (vuelve a invitado).

> **OJO**: el **web** envia el token en cookie httpOnly (`credentials: 'include'`). El **movil** lo envia en `Authorization: Bearer` desde `Config/http.ts`.
>
> **Registro (web, oct 2026)**: `POST /auth/registro` crea la cuenta con rol Cliente pero **NO inicia sesion**; `registrar()` en `AuthProvider.tsx` descarta el `{token, usuario}` de la respuesta. La UI muestra una pantalla de **"Registro exitoso"** (`LoginModal.tsx`, estado `exito`) y el usuario debe entrar manualmente con sus credenciales. Asi el admin creado por `PaginaUsuarios` y el cliente auto-registrado siguen flujos equivalentes.

---

## 6. Decisiones de arquitectura clave (resumen)

1. **Backend**: CRUD generico por modulo con inyeccion de DB. Duplicar carpeta = nuevo modulo.
2. **Sobre de respuesta uniforme** `{error, status, body}` en toda la API.
3. **JWT con expiracion de 8h** + bcrypt (salt 10) para contrasenas.
4. **Mobile**: MVVM-lite con `AuthContext`; navegacion por tabs condicionada al rol.
5. **Web**: arquitectura basada en componentes (`components/pages/hooks/services/utils/types/routes`). Las paginas consumen hooks (`useDatos.ts`) que envuelven a los services (`apiClient.ts`); desde sept 2026 **sin fallback a mocks** (devuelven `[]` si falla/vacio) y enviando el token en cookie httpOnly. El admin hace CRUD real de usuarios.
6. **Paleta de colores** compartida (GREEN `#2fb676`, BLUE `#4D9FFF`, BG `#0A0F1E`, etc.), ver `docs/Decisiones-tecnicas.md`.

---

## 7. Referencias cruzadas

- **Esquema de la BD**: `docs/base-datos.md`
- **Endpoints** (metodos, rutas, body, respuestas): `docs/Api.md`
- **Funcionalidades por rol**: `docs/Funcionalidades.md`
- **Stack y decisiones detalladas**: `docs/Decisiones-tecnicas.md`
