# AGENTS.md - QuantumApp

Contexto permanente del proyecto. **Leelo antes de modificar codigo.** Repo git **unico en la raiz** (monorepo, rama `main`, publicado en GitHub).

---

## ⚠️ LEE PRIMERO: Documentacion detallada en `docs/`

Este archivo da un resumen general. Para contexto **completo y detallado** de cada aspecto del proyecto, **lee primero los archivos de la carpeta `docs/`**:

| Archivo | Que contiene |
|---------|--------------|
| **`docs/Arquitectura.md`** | Como esta armado todo el proyecto: Backend, app movil (Mobile) y frontend web (Frontend). Estructura de carpetas, patrones, capas y flujo de peticiones. |
| **`docs/Api.md`** | **Todos los endpoints REST** del backend: metodos, rutas, body, respuestas, errores y sobre JSON unico. |
| **`docs/base-datos.md`** | **Esquema completo de la base de datos**: PostgreSQL `QuantumSystemDB` (+ pgvector + embeddings Gemini), **usada por el backend hoy** . Tablas, columnas, tipos, relaciones y datos cargados. |
| **`docs/Decisiones-tecnicas.md`** | Stack, herramientas, convenciones de codigo, paleta de colores, decisiones implementadas y gotchas/errores conocidos. |
| **`docs/Funcionalidades.md`** | Funcionalidades por rol de usuario y estado de integracion real con la API por pantalla. |

> **Regla**: si necesitas detalles sobre API, BD, arquitectura, decisiones tecnicas o funcionalidades, consulta los `.md` de `docs/` en vez de asumir.

---

## Objetivo

App de la empresa **Quantum** (marca de autos electricos; la UI usa el nombre temporal **Voltus**): catalogo de vehiculos electricos, reservas de modelos, estaciones de carga, talleres autorizados, emergencias y panel de administracion. La **app movil** (Expo/React Native) es la principal; ademas hay un **frontend web** (Vite) separado.

## Estructura del monorepo

```
Backend/      # API REST (Node.js + Express 5 + TS + PostgreSQL)  -> activo
Mobile/       # App movil (Expo SDK 54 / React Native)       -> app principal, consume la API
Frontend/     # Frontend web (Vite + React 19 + TS)          -> SPA independiente, consume la API
docs/         # Documentacion de contexto (leerla primero)
```

> **Nota sobre carpetas**: la **app movil real esta en `Mobile/`**. `Frontend/` es el **frontend web** (Vite), no la app movil.

## Stack

- **Backend (`Backend/`)**: Node.js + Express 5 + TypeScript (ts-node/nodemon), PostgreSQL (driver `pg`, base `QuantumSystemDB`), JWT (`jsonwebtoken`, expira 8h), `bcrypt` (salt 10), `helmet`, `express-rate-limit`, `cookie-parser`, `cors`, `morgan`, `dotenv`.
- **App movil (`Mobile/`)**: Expo SDK 54, React 19.1, React Native 0.81, TypeScript, React Navigation (bottom-tabs), NativeWind v4 (configurado pero **no usado** en pantallas), axios, `@expo/vector-icons` (MaterialCommunityIcons), react-native-maps, expo-location, fuentes Poppins.
- **Frontend web (`Frontend/`)**: Vite + React 19 + TS, `lucide-react`, `fetch` nativo, **Leaflet** (mapas) + `@types/leaflet`. SPA **basado en componentes** (`components/`, `pages/`, `hooks/`, `services/`, `utils/`, `types/`, `routes/`). Desde sept 2026 los services **no caen a mocks**: si la API falla o devuelve lista vacia, devuelven `[]` (la UI no inventa datos).

## Comunicacion Backend <-> Frontend

REST JSON. Respuestas siempre con el sobre:
```json
{ "error": bool, "status": int, "body": <payload o mensaje> }
```
- **Mobile**: usa **axios** a traves de `Mobile/src/Config/http.ts` (interceptor que agrega `Authorization: Bearer`). La URL base se toma de `EXPO_PUBLIC_API_URL` o, en desarrollo, se detecta desde `Constants.expoConfig?.hostUri` (`http://<host>:4000/api`). En produccion exige `https://`.
- **Frontend web**: usa `fetch` via `Frontend/src/services/apiClient.ts` (`/api`, con proxy Vite a `http://localhost:4000` en dev) y `credentials: 'include'`. Las paginas no llaman la API directo: consumen hooks (`useDatos.ts`) que envuelven a los services.
- El token JWT del web vive en una **cookie httpOnly** (`quantum_token`, definida por el backend en `/auth/login`); JS solo guarda el usuario en `localStorage`. El movil guarda el token **en memoria** (`Mobile/src/Config/token.ts`) y lo envia en cada peticion via interceptor.

## Base de datos

**El backend usa hoy PostgreSQL `QuantumSystemDB`** (configurable via `.env` de Backend, base local en el puerto 5432, con `pgvector` y embeddings de Gemini ya poblados). **El esquema completo esta documentado en `docs/base-datos.md`.** Resumen de tablas:

- **Roles**, **Usuarios** (PK `id_usuario`, FK `id_rol`), **Colores**, **Vehiculos** (FK `id_color`, columna `Precio_USD`, columna **derivada** `Colores_Disponibles`; sin columna de imagen), **Reservas**
- **Vehiculos_Colores** (N:M Vehiculos↔Colores, **con endpoints** `/api/vehiculos-colores`), **Usuarios_Reservas** (N:M Usuarios↔Reservas), **Usuarios_Vehiculos** (N:M Usuarios↔Vehiculos)
- **Estaciones_Carga**, **Servicios_Tecnicos**

El backend tiene CRUD para Usuarios, Vehiculos, Estaciones_Carga, Servicios_Tecnicos, **Colores**, **Reservas** y **Vehiculos_Colores** (N:M, con rutas propias `/api/vehiculos-colores`), mas `Clientes` que apunta a la tabla `Roles`. **No hay modulos para Usuarios_Reservas ni Usuarios_Vehiculos** (tablas sin endpoints). El POST de Reservas es **publico** y fuerza `Fecha_Reserva`=hoy y `Estado`='Pendiente' (validando nombres, apellidos, cedula con regex, existencia real de modelo y color); listar/editar/eliminar reservas requiere **admin**. El GET de Vehiculos **enriquece** cada fila con un array `colores` (N:M `Vehiculos_Colores` JOIN `Colores`; si no hay relaciones, devuelve el color principal `id_color`) y los POST/PUT persisten `Precio_USD`. La columna derivada `Vehiculos.Colores_Disponibles` (todos los colores del modelo, mantenida por trigger desde la N:M) entra al `embedding` via la allowlist, para que el **chatbot** responda los colores de cada modelo (ver `docs/base-datos.md`).

## Endpoints (lista resumida)

Base `/api`. **Detalle completo en `docs/Api.md`.**

- `POST /api/auth/login` - body `{correo, contrasena}` -> `{token, usuario}` (JOIN Usuarios+Roles; JWT expira en 8h). Tambien setea la cookie httpOnly `quantum_token`.
- `POST /api/auth/logout` - limpia la cookie `quantum_token`.
- `GET /api/auth/sesion` - valida el JWT (header o cookie) y devuelve `{usuario}` actualizado desde la BD (401 si el token ya no es valido).
- `GET|POST /api/clientes`, `GET /api/clientes/:id`, `DELETE /api/clientes/:id` (tabla `Roles`) - **solo admin**.
- `GET|POST|PUT|DELETE /api/usuarios[/:id]` - **solo admin**; POST/PUT hashean la contrasena (bcrypt 10) y las respuestas nunca incluyen el hash.
- `GET|POST|PUT|DELETE /api/vehiculos[/:id]` - GET publico; **mutaciones solo admin**.
- `GET|POST|PUT|DELETE /api/servicios-tecnicos[/:id]` - GET publico; **mutaciones solo admin**.
- `GET|POST|PUT|DELETE /api/estaciones-carga[/:id]` - GET publico; **mutaciones solo admin**.
- `GET|POST|PUT|DELETE /api/colores[/:id]` - GET publico; **mutaciones solo admin**.
- `/api/reservas`: `POST` publico (reserva de invitado); `GET|PUT|DELETE` **solo admin**.
- `/api/vehiculos-colores`: `GET /` (listar), `GET /vehiculo/:id` (colores de un vehiculo), `GET /color/:id` (vehiculos de un color), `POST /` (crear N:M), `DELETE /:idVehiculo/color/:idColor` - GET publico; **mutaciones solo admin**.
- El backend define `POST /api/auth/registro` (oct 2026): crea el usuario **siempre con rol Cliente** (busca el rol por nombre en `Roles`) y devuelve `{token, usuario}`, igual que el login. El web lo consume directo pero **no auto-loguea**: muestra un mensaje de "Registro exitoso" y el usuario entra manualmente (`AuthProvider.registrar()` descarta la sesion; estado `exito` en `LoginModal.tsx`). El movil lo llama con `nombre_usuario` desde el formulario de registro (M6 cerrado).

## Tipos de usuario y funcionalidades

Roles determinados por `Roles.Nombre` (string) y flags de `useAuth()`; las tabs/paginas cambian segun rol. **Detalle por pantalla en `docs/Funcionalidades.md`.**

- **Invitado** (sin login): Inicio (catalogo Voltus, planes, test drive), Vehiculos (API real: listado + detalle con colores N:M y placeholder de foto), Reservas (formulario validado, modelos/colores desde API y guardado via API real, sin QR).
- **Cliente** (usuario con vehiculo electrico): Inicio (bateria, estaciones cercanas, historial), Estaciones de Carga (API real, **mapa Leaflet con ruta por calles via OSRM**), Talleres Autorizados (API real, **mapa Leaflet con ruta por calles**), Emergencias (SOS, contactos).
- **Administrador**: Inicio (stats y gestion de contenido con conteos reales desde la API) y Usuarios (CRUD real via API: listar, buscar, filtrar, **crear** y **eliminar**; sin suspender porque no hay campo de estado).

La mayoria de pantallas usa **datos mock hardcodeados**; en el web, login/registro, Vehiculos, Reservas y Estaciones/Talleres consumen la **API real** y el admin hace **CRUD real** de usuarios. El resto son mocks (ver `docs/Funcionalidades.md`).

**▶ Trabajo pendiente activo (tablero de kanban):** la lista completa de tareas por hacer (y ya hechas) esta en `docs/Funcionalidades.md`, seccion **6 "Pendientes funcionales"** — movil M1-M10, web W1-W9, comunes C1-C5 (incluye la **mejora de CSS del frontend web y mobile**). Tambien son pasos 8 y 9 del roadmap en `docs/Decisiones-tecnicas.md`. Revisarla antes de asumir que una pantalla ya funciona.

## Convenciones de codigo

- Nombres de archivos/funciones y comentarios en **espanol**.
- Backend: `camelCase` para funciones, `PascalCase` para interfaces; `TABLA` y `CAMPO_ID` como constantes en mayusculas; handlers `try/catch` -> `next(error)`; factory `export default function (dbInyectada?)`.
- App movil: pantallas con hooks funcionales (salvo `ReservasScreen` que es class component); estilos en `StyleSheet.create` separados en `src/styles/`; constantes de color exportadas.
- Frontend web: arquitectura basada en componentes (`components/pages/hooks/services/utils/types/routes`). Flujo `pages -> hooks -> services -> apiClient -> Backend`; si la API falla o devuelve lista vacia, los services devuelven `[]` (sin mocks).
- Formato: Prettier (singleQuote, printWidth 100) + ESLint (config-expo en movil).
- Respuestas API siempre con `red/respuestas` (success/error).
- No hay framework de tests configurado.

## Comandos

- Backend: `cd Backend && npm run dev` (nodemon + ts-node, puerto 4000). Requiere PostgreSQL local (`QuantumSystemDB`, puerto 5432) y `.env`.
- App movil: `cd Mobile && npm start` (expo), `npm run android|ios|web`, `npm run prebuild`, `npm run lint` (eslint + prettier check), `npm run format`.
- Frontend web: `cd Frontend && npm run dev|build|lint|preview`.

## Decisiones implementadas (no revertir sin motivo)

Detalle completo en `docs/Decisiones-tecnicas.md`, **incluido el plan de despliegue/hoja de ruta** (seccion "Plan de despliegue / hoja de ruta (Roadmap)") que define la migracion a Supabase (Postgres + pgvector), deployment del backend en Render, del frontend en Vercel y el chatbot con IA. **Leelo antes de asumir el estado de la infraestructura.**

1. CRUD generico por modulo con inyeccion de DB (duplicar carpeta = nuevo modulo).
2. Sobre de respuesta JSON uniforme `{error, status, body}`.
3. Autenticacion JWT (expira en 8h, `algorithms: ['HS256']`) + bcrypt (salt 10, con rehash al iniciar sesion). `JWT_SECRET` obligatorio en produccion (acepta el legado `JET_SECRET`).
4. Contexto de auth con flags derivados de rol para navegacion por tabs.
5. Estilos por pantalla en `*.styles.ts` con paleta compartida; NativeWind instalado pero inactivo (`global.css` comentado).
6. Frontend-web separado (Vite) como app independiente, con arquitectura basada en componentes. Desde sept 2026 **sin fallback a mocks**: los services devuelven `[]` si la API falla o trae lista vacia.
7. Deteccion automatica de IP para `API_URL` en la app movil (`Mobile/src/Config/api.ts`), con `EXPO_PUBLIC_API_URL` como opcion explicita y **fallback a `localhost:4000`** en web. En web `react-native-maps` usa un stub (`Mobile/src/stubs/react-native-maps.web.tsx`) via `metro.config.js`.
8. **Modelo de IA del chatbot: `gemini-2.5-flash-lite` en free tier ($0)**, con paso previsto a **`deepseek-flash` de pago** cuando se agote el limite diario (~1.000 RPD). Decision tomada sept 2026. El **embedder no cambia**: sigue siendo `gemini-embedding-001` (768 dims) para los vectores ya guardados. El nombre del modelo de texto debe ir en **variable de entorno** (`GEMINI_CHAT_MODEL`), nunca hardcodeado, para que cambiar de proveedor sea editar el `.env`. Detalle, precios y plan de migracion en `docs/Decisiones-tecnicas.md` ("Modelo de IA del chatbot: decision y plan de migracion").
9. **`Usuarios` y `Reservas` NO tienen columna de vector** (implementado oct 2026). Son las unicas tablas con datos personales: sus controladores no importan `embeddings` y **la columna `embedding` fue eliminada de la base** (`DROP COLUMN`). Solo quedan 3 tablas con vectores: `Vehiculos`, `Servicios_Tecnicos` y `Estaciones_Carga`, que se vectorizan **unicamente con las columnas de `COLUMNAS_POR_TABLA`** (`Backend/src/embeddings/index.ts`), la unica fuente de verdad: una tabla fuera de la allowlist devuelve `null` y no llama a Gemini, y una **denylist de regex** (correo, bloque de 7-14 digitos, claves) aborta el envio. `embeddingDeObjeto` paso a ser **`embeddingDeFila(tabla, fila)`** y `embeddingDeActualizacion(tabla, actual, cambios)`. No reintroducir la concatenacion de "todas las columnas" ni volver a anadir la columna a esas 2 tablas. Detalle en `docs/Decisiones-tecnicas.md` ("Plan de seguridad: dejar de enviar datos personales a Gemini").
10. **La carpeta `db_vectorial/` NO es parte de la app**: es un experimento en Python con repo git propio, apuntando a otra base (`dbbrand`). Usa Ollama (1024 dims) y CLIP (512 dims), tiene credenciales hardcodeadas y no tiene indices validos. **No la copies ni la tomes como referencia de arquitectura**, salvo el patron de umbral de similitud + `top_k` de `buscar_imagen.py:92-97`, que si conviene replicar en el RAG. Comparacion completa en `docs/Decisiones-tecnicas.md` ("Vectorizacion: metodo actual vs metodo de la carpeta `db_vectorial`").
11. **Inicio invitado web (nov 2026)**: las 3 cards del catalogo usan imagenes de detalle (`Equte volante.png`, `Pantalla nexus plus.png`, `E4 Montanero botones.png`) con textos de confort/pantalla, borde de 2px `rgba(0,0,0,0.65)` y radio de 24px. El bloque "La experiencia de conducir un Quantum" reproduce `video dentro del auto2.mp4` en loop y a ancho completo de viewport; el video de carga es `carga electrica2.mp4`. En el cliente, las tarjetas "Estaciones cerca / Puntos libres / Operativas" usan el mismo relleno `#9DB69D`, borde blanco y radio 12px que las tarjetas de estación. Detalle en `docs/Funcionalidades.md` y `docs/Arquitectura.md`.

## Gotchas

- `config.ts` lee `JWT_SECRET` (con `JET_SECRET` como fallback legado). Sin `JWT_SECRET` en desarrollo genera un secreto aleatorio temporal; en `NODE_ENV=production` **lanza error** si falta.
- El `.env` del Backend no esta en git; los defaults de config.ts son: puerto HTTP 4000, host `localhost`, user `postgres`, db `QuantumSystemDB`, puerto PG 5432. Los tres `.env.example` (`Backend/`, `Frontend/`, `Mobile/`) documentan las variables.
- `CORS_ORIGINS` (coma-separado) es obligatorio en produccion; en desarrollo se permiten `localhost:5173`, `4173`, `8081` y `19006`. El backend usa `helmet` (CSP desactivada) y rate limit: 300 req/15 min por IP en `/api`, **6 intentos fallidos/15 min en login** (el siguiente devuelve 429 y un login correcto reinicia el contador), 20/15 min en registro y 30/min en el chatbot. Los contadores viven en la tabla `Rate_Limits` (store compartido, con claves separadas para login y registro) y `TRUST_PROXY` es configurable.
- `Mobile/cesconfig.jsonc` es un archivo de debug de NativeWind, se puede ignorar/eliminar.
- `tsconfigPaths` (alias `@/*`) esta habilitado en Expo pero las pantallas importan por ruta relativa.
- En el movil, el rol se compara como string (`rol === 'cliente'` / `'administrador'` en minuscula); depende del valor en la BD.
- `src/embeddings/index.ts` **solo vectoriza las tablas de `COLUMNAS_POR_TABLA`** (`Vehiculos`, `Servicios_Tecnicos`, `Estaciones_Carga`) y solo con las columnas listadas; cualquier otra tabla devuelve `null` sin llamar a Gemini. Antes de anadir una tabla ahi, revisar que ninguna columna tenga datos personales.
- `Vehiculos.Colores_Disponibles` es **derivada** (trigger `fn_vehiculos_colores_disponibles`): el trigger actualiza el texto pero **no re-vectoriza**. Tras cambiar colores por `/api/vehiculos-colores` hay que poner `"embedding" = NULL` en ese vehiculo y correr `Backend/scripts/vectorizar_datos.ts`.
- Si falta la clave de Gemini, `src/embeddings/index.ts` **no genera vectores**: devuelve `null` y avisa en logs. El script `Backend/scripts/vectorizar_datos.ts` falla con mensaje explicito. No reintroducir el feature hashing.
- `dotenv` esta en `devDependencies` de `Backend/package.json` pero `config.ts:1` hace `require('dotenv')`: con `npm ci --omit=dev` (Render) el backend no arranca. (Corregido: `dotenv` ya esta en `dependencies`; falta que Render lo instale con `npm ci`.)
- `Usuarios.correo` tiene indice unico (`Usuarios_correo_unique`, script `Backend/scripts/seguridad_usuario_correo.sql`) para cerrar la condicion de carrera del registro; si se recrea la BD hay que volver a aplicarlo.
- No hay indice HNSW en `QuantumSystemDB` (con ~25 filas el seq scan aguanta, pero crearlo antes de que las tablas crezcan).
- El chatbot rechaza prompt injection en pregunta/historial (`400` con respuesta fija), omite valores del contexto que parezcan instrucciones y valida la salida antes de emitirla; en `/chatbot/stream` el evento `token` llega completo en uno solo para no filtrar texto manipulado.
