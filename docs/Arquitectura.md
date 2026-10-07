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

#### Que hace cada carpeta/archivo del Backend

Flujo de una peticion: `index.ts` -> `app.ts` (middleware + montaje de rutas) -> `modulos/X/rutas.ts` -> `modulos/X/controlador.ts` -> `DB/pg.ts` -> PostgreSQL. Los errores vuelven por `red/errors.ts` usando el sobre uniforme `{error, status, body}`.

| Carpeta / archivo | Que hace |
|---|---|
| `src/index.ts` | Arranque: lee el puerto de `app.get('port')` y hace `listen`. |
| `src/app.ts` | Arma la app Express: `cors`, `morgan('dev')`, `express.json()`, `urlencoded`; monta cada router bajo `/api/*` y al final el middleware de errores. Aqui se ve de un vistazo que modulos existen. |
| `src/config.ts` | Configuracion unica desde `.env` (con defaults): puerto HTTP 4000, secreto JWT y credenciales PG (host, user, password, database `QuantumSystemDB`, port 5432). |
| `src/DB/pg.ts` | **Unica capa de acceso a datos.** Un `Pool` de `pg` con reconexion automatica (`SELECT 1` cada 2 s si falla) y helpers genericos: `todos`, `uno`, `agregar`, `actualizar`, `eliminar`, `query`, `ejecutar`. Escapa identificadores con comillas, filtra `undefined` y castea `::vector` cuando el valor viene como `{vector}`. Tambien fuerza `DATE` a string para no romper el contrato con los frontends. |
| `src/modulos/` | **Un CRUD por tabla**, cada uno en su carpeta con 3 archivos: `index.ts` (factory `crearControlador(db)` que recibe la DB inyectada), `rutas.ts` (Router + handlers con `try/catch -> next(error)`) y `controlador.ts` (logica de negocio, constantes `TABLA`/`CAMPO_ID`, funciones `camelCase`). Modulos: `auth`, `Usuarios`, `Clientes`, `Vehiculos`, `Colores`, `Vehiculos_Colores`, `Reservas`, `Estaciones_Carga`, `Servicios_Tecnicos`, `Chatbot`. Anadir un modulo = duplicar carpeta. |
| `src/modulos/Usuarios/seguridad.ts` | Middleware de autorizacion que valida el token JWT y ademas comprueba que el `id` del body coincida con el del token. |
| `src/red/respuestas.ts` | El sobre JSON uniforme: `success(req,res,body,status)` y `error(...)` -> siempre `{error, status, body}`. |
| `src/red/errors.ts` | Middleware final de Express: loguea el error y lo traduce con `respuesta.error` usando `err.statusCode` (o 500). |
| `src/middleware/errors.ts` | Fabrica `error(mensaje, codigo)` que crea `Error` con `statusCode`, para lanzar errores con codigo desde cualquier controlador. |
| `src/auth/index.ts` | Envoltura de JWT: `asignarToken` (sign) y `chequearToken.confirmarToken` (verifica `Authorization: Bearer`, decodifica y valida propiedad del recurso). |
| `src/ia/` | **Capa de IA con proveedor intercambiable.** `index.ts` es el selector (lee `CHAT_PROVEEDOR` del `.env`: `gemini` \| `deepseek`) y expone `estado()` para `GET /api/chatbot/estado`. `gemini.ts` y `deepseek.ts` implementan el contrato de `tipos.ts` (que define `Proveedor`, `MensajeConversacion` y el lector SSE compartido `leerSSE`). El nombre del modelo **siempre** viene del `.env`, nunca hardcodeado. |
| `src/embeddings/index.ts` | Genera vectores de 768 dims para poblar la columna `embedding` al guardar (POST/PUT). Tiene una **allowlist** `COLUMNAS_POR_TABLA` (solo `Vehiculos`, `Servicios_Tecnicos`, `Estaciones_Carga`) y una **denylist** de regex (correo, 7-14 digitos, claves) que aborta el envio de datos personales. Si falta la API key cae a feature hashing SHA-1 local. |
| `src/rag/index.ts` | Recuperacion de contexto para el chatbot: vectoriza la pregunta con el mismo embedder, busca por coseno (`<=>`) en las tablas de la allowlist, filtra por umbral y corta en `top_k`, y convierte cada fila en una frase legible con etiquetas en lenguaje natural. |
| `src/modulos/Chatbot/` | Combina RAG + IA: `/estado` (proveedor, modelo, si hay clave, si el RAG esta operativo), `/` (respuesta completa con el sobre JSON) y `/stream` (SSE con `X-Accel-Buffering: no` para que los proxies no buffereen). |
| `scripts/vectorizar_datos.ts` | Script one-off que (re)genera los embeddings de las tablas permitidas; comparte la misma logica y modelo que `src/embeddings`. |
| Raiz (`package.json`, `tsconfig.json`, `.env`) | `npm run dev` = `nodemon --exec ts-node src/index.ts`. `dotenv` esta en `devDependencies` pero `config.ts` lo requiere en runtime (bug conocido con `--omit=dev`). |

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
- `asignarToken(data)`: `jwt.sign(data, secret)` — **sin expiracion configurada**.
- `chequearToken.confirmarToken(req, id?)`: extrae el token del header `Authorization: Bearer <token>`, lo verifica y opcionalmente comprueba que `decodificado.id === id` (autorizacion por recurso).
- `decodificarCabecera(req)` adjunta el payload decodificado a `req.user`.

Secret tomado de `config.jwt.secret` = `process.env.JET_SECRET || 'notasecreta!'`.

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

#### Que hace cada carpeta/archivo de Mobile

Flujo: `App.tsx` -> `View/Navigation/AppNavigator` -> `View/Screens` -> `ViewModel` -> `Model` -> axios -> Backend, con los estilos en `src/styles/`.

| Carpeta / archivo | Que hace |
|---|---|
| `App.tsx` | Raiz minima: solo monta `<AppNavigator />`. |
| `src/Config/api.ts` | Detecta la IP del host de Expo (`Constants.expoConfig.hostUri`) y exporta `API_URL = http://<host>:4000/api`, con fallback a `localhost:4000` para web/emulador. |
| `src/View/` | **Capa de presentacion (solo JSX).** `Navigation/AppNavigator.tsx` monta `SafeAreaProvider` -> `AuthProvider` -> `NavigationContainer` -> `Tab.Navigator`, y declara las tabs **condicionalmente segun el rol** (`esInvitado` / `esCliente` / `esAdministrador`) con iconos de `MaterialCommunityIcons` y una tab bar flotante; el `Chatbot` se monta una vez fuera del navigator. `Screens/` agrupa las pantallas por rol: `Usuario_posible_comprador/` (Inicio, Vehiculos, Reservas), `Usuario_Vehiculo_electrico/` (Inicio, Estaciones, Talleres, Emergencias) y `Usuario_Administrador/` (Inicio, Usuarios). `components/` tiene las piezas reutilizables: `Chatbot`, `LoginButton`, `LogoutButton`, `Saludo`. |
| `src/ViewModel/` | **Puente entre View y Model.** `AuthViewModel.tsx` es el `AuthProvider` (contexto con `usuario`, `token`, `login`, `registro`, `logout`, flags por rol, estados de carga y error) mas el hook `useAuth()`. `Usetalleresviewmodel.ts` es un ViewModel puntual de talleres. |
| `src/Model/` | **Capa de datos (axios, sin JSX).** Un service por recurso: `AuthService`, `VehiculosService`, `ReservasService`, `ColoresService`, `EstacionesService`, `TalleresService`. Devuelven el campo `body` del sobre (ej. `response.data.body` en login). `Usuario.ts` contiene las interfaces (`Usuario`, `AuthResponse`, `Credenciales`). |
| `src/styles/` | Un `*.styles.ts` por pantalla/componente con `StyleSheet.create`, mas la paleta compartida exportada desde aqui. Los estilos no viven en el JSX. |
| `src/stubs/react-native-maps.web.tsx` | Stub de `MapView`/`Marker` para que la app compile en web, donde la libreria nativa no existe. |
| `assets/` | Imagenes de la app (iconos, splash, logos). |
| Raiz (`app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `tsconfig.json`) | Configuracion Expo/Metro. `metro.config.js` inyecta el stub de mapas en web y registra NativeWind (`global.css` esta comentado: NativeWind esta instalado pero **no se usa**). `npm run lint` = eslint + prettier check. |

**Regla de dependencias**: `View -> ViewModel -> Model`. Las pantallas no llaman axios directamente. Gotchas: el token se guarda en el contexto pero **no se envia** en las peticiones (solo login/registro hacen requests); `ReservasScreen` es la unica pantalla que es class component en lugar de hook funcional.

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
│   └── administrador/     # PaginaPanel, PaginaUsuarios
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
| `src/pages/` | **Pantallas, agrupadas por rol** (`invitado/`, `cliente/`, `administrador/`). Cada `Pagina*.tsx` es una pantalla completa; consume datos via hooks y recibe callbacks (`alVerVehiculos`, `alReservar`) para navegar. |
| `src/components/` | **Piezas de UI reutilizables y sin datos**: `LoginModal`, `LoginButton`, `LogoutButton`, `Saludo`, `EncabezadoSeccion` (titulo de seccion) y `Chatbot` (widget flotante). |
| `src/hooks/` | **Capa de estado de React.** `useDatos.ts` contiene un hook generico `useColeccion` (carga, estado `cargando`, `actualizar`, `recargar`) y lo especial en `useVehiculos`, `useEstaciones`, `useTalleres`, `useUsuarios`. `AuthProvider.tsx` + `useAuth.ts` dan el contexto de sesion y los flags `esInvitado/esCliente/esAdministrador`. |
| `src/services/` | **Logica de datos pura (sin React).** Un archivo por recurso (`vehiculosService`, `reservasService`, `coloresService`, `usuariosService`, `estacionesService`, `talleresService`, `chatbotService`, `authService`). Traducen la API al modelo de la UI y devuelven `[]` si la API falla (sin mocks). |
| `src/services/apiClient.ts` | **Unica capa que habla con el backend.** `fetch` a `URL_BASE` (`VITE_API_URL` o `/api`), inyecta `Authorization: Bearer` desde la sesion, valida el sobre `{error, status, body}`, desenvuelve `body` y lanza errores con mensajes legibles. |
| `src/types/` | Interfaces TS del dominio de la UI: `Usuario.ts`, `Vehiculo.ts`, `EstacionesYTalleres.ts` (dos en un archivo). Evitan `any` en paginas y hooks. |
| `src/utils/` | Funciones auxiliares sin estado: `sesion.ts` (lee/escribe `localStorage`: `quantum_token`, `quantum_usuario`, con guardas por si `localStorage` no existe), `roles.ts` (`esAdministrador`/`esCliente` con fallback por `id_rol`), `iniciales.ts` (avatar con iniciales). |
| `src/styles/` | **CSS plano global, no modulos ni CSS-in-JS.** `variables.css` (tokens/paleta), `base.css` (reset + tipografia), `componentes.css` (~918 lineas, clases BEM de componentes), `paginas.css` (~1497 lineas, estilos por pantalla), `temas.css` (variantes por rol `.aplicacion--cliente`, etc.). |
| `src/assets/` | Imagenes importables por codigo (`logo_quantum.png`, `hero.png`, mockups de pagina). |
| `public/` | Archivos servidos tal cual, sin procesar (`favicon.svg`, `icons.svg`). |
| Raiz (`vite.config.ts`, `index.html`, `tsconfig.*.json`, `eslint.config.js`) | Configuracion de build de Vite (con proxy `/api` -> `localhost:4000`), HTML base, TypeScript en modo project references y ESLint. |

**Regla de dependencias**: las flechas van en un solo sentido -- `pages -> hooks -> services -> apiClient`. Las paginas nunca llaman a `fetch` ni a `apiClient` directamente, y los services nunca importan React.

### 4.2 Flujo de datos (componentes + hooks + servicios)

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
- `apiClient.peticion` agrega `Authorization: Bearer <token>` si hay sesion (token desde `utils/sesion.ts`, persistido en `localStorage`).

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
4. La UI guarda `usuario` y `token` en el **contexto** de autenticacion y los **persiste en `localStorage`** (`utils/sesion.ts`), restaurandolos al recargar.
5. Los **flags derivados** (`esInvitado/esCliente/esAdministrador`) definen que tabs/paginas ver.
6. El logout limpia `usuario` y `token` del contexto y de `localStorage` (vuelve a invitado).

> **OJO**: el **web** envia el token en todas las peticiones (`Authorization: Bearer`). El **movil** aun no lo envia (solo login/registro hacen requests).

---

## 6. Decisiones de arquitectura clave (resumen)

1. **Backend**: CRUD generico por modulo con inyeccion de DB. Duplicar carpeta = nuevo modulo.
2. **Sobre de respuesta uniforme** `{error, status, body}` en toda la API.
3. **JWT sin expiracion** + bcrypt (salt 5) para contrasenas.
4. **Mobile**: MVVM-lite con `AuthContext`; navegacion por tabs condicionada al rol.
5. **Web**: arquitectura basada en componentes (`components/pages/hooks/services/utils/types/routes`). Las paginas consumen hooks (`useDatos.ts`) que envuelven a los services (`apiClient.ts`); desde sept 2026 **sin fallback a mocks** (devuelven `[]` si falla/vacio) y enviando el token JWT. El admin hace CRUD real de usuarios.
6. **Paleta de colores** compartida (GREEN `#2fb676`, BLUE `#4D9FFF`, BG `#0A0F1E`, etc.), ver `docs/Decisiones-tecnicas.md`.

---

## 7. Referencias cruzadas

- **Esquema de la BD**: `docs/base-datos.md`
- **Endpoints** (metodos, rutas, body, respuestas): `docs/Api.md`
- **Funcionalidades por rol**: `docs/Funcionalidades.md`
- **Stack y decisiones detalladas**: `docs/Decisiones-tecnicas.md`
