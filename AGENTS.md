# AGENTS.md - QuantumApp

Contexto permanente del proyecto. **Leelo antes de modificar codigo.** No hay repo git en la raiz (MPer: cada subproyecto puede tener el suyo propio).

---

## ⚠️ LEE PRIMERO: Documentacion detallada en `docs/`

Este archivo da un resumen general. Para contexto **completo y detallado** de cada aspecto del proyecto, **lee primero los archivos de la carpeta `docs/`**:

| Archivo | Que contiene |
|---------|--------------|
| **`docs/Arquitectura.md`** | Como esta armado todo el proyecto: Backend, app movil (Mobile) y frontend web (Frontend). Estructura de carpetas, patrones, capas y flujo de peticiones. |
| **`docs/Api.md`** | **Todos los endpoints REST** del backend: metodos, rutas, body, respuestas, errores y sobre JSON unico. |
| **`docs/base-datos.md`** | **Esquema completo de la base de datos** MySQL `quantumappdb`: tablas, columnas, tipos y relaciones. |
| **`docs/Decisiones-tecnicas.md`** | Stack, herramientas, convenciones de codigo, paleta de colores, decisiones implementadas y gotchas/errores conocidos. |
| **`docs/Funcionalidades.md`** | Funcionalidades por rol de usuario y estado de integracion real con la API por pantalla. |

> **Regla**: si necesitas detalles sobre API, BD, arquitectura, decisiones tecnicas o funcionalidades, consulta los `.md` de `docs/` en vez de asumir.

---

## Objetivo

App de la empresa **Quantum** (marca de autos electricos; la UI usa el nombre temporal **Voltus**): catalogo de vehiculos electricos, reservas de modelos, estaciones de carga, talleres autorizados, emergencias y panel de administracion. La **app movil** (Expo/React Native) es la principal; ademas hay un **frontend web** (Vite) separado.

## Estructura del monorepo

```
Backend/      # API REST (Node.js + Express 5 + TS + MySQL)  -> activo
Mobile/       # App movil (Expo SDK 54 / React Native)       -> app principal, consume la API
Frontend/     # Frontend web (Vite + React 19 + TS)          -> SPA independiente, consume la API
docs/         # Documentacion de contexto (leerla primero)
```

> **Nota sobre carpetas**: la **app movil real esta en `Mobile/`**. `Frontend/` es el **frontend web** (Vite), no la app movil.

## Stack

- **Backend (`Backend/`)**: Node.js + Express 5 + TypeScript (ts-node/nodemon), MySQL (driver `mysql`), JWT (`jsonwebtoken`), `bcrypt` (salt 5), `morgan`, `dotenv`.
- **App movil (`Mobile/`)**: Expo SDK 54, React 19.1, React Native 0.81, TypeScript, React Navigation (bottom-tabs), NativeWind v4 (configurado pero **no usado** en pantallas), axios, `@expo/vector-icons` (MaterialCommunityIcons), react-native-maps, expo-location, fuentes Poppins.
- **Frontend web (`Frontend/`)**: Vite + React 19 + TS, `lucide-react`, `fetch` nativo. SPA con arquitectura limpia (domain/data/infraestructura/presentation), con fallback a mocks si la API falla.

## Comunicacion Backend <-> Frontend

REST JSON. Respuestas siempre con el sobre:
```json
{ "error": bool, "status": int, "body": <payload o mensaje> }
```
- **Mobile**: usa **axios**. La URL base se detecta automaticamente en `Mobile/src/Config/api.ts` (`Constants.expoConfig?.hostUri` → `http://<host>:4000/api`).
- **Frontend web**: usa `fetch` via `Frontend/src/infraestructura/http/ApiClient.ts` (`/api`, con proxy Vite a `http://localhost:4000` en dev).
- El token JWT se guarda en el contexto de auth, pero **aun no se envia** en peticiones reales (solo login/registro hacen requests).

## Base de datos

MySQL `quantumappdb` (configurable via `.env` de Backend, puerto 4000). **El esquema completo esta documentado en `docs/base-datos.md`.** Resumen de tablas:

- **Roles**, **Usuarios** (PK `id_usuario`, FK `id_rol`), **Colores**, **Vehiculos** (FK `id_color`), **Reservas**
- **Usuarios_Reservas** (N:M Usuarios↔Reservas), **Usuarios_Vehiculos** (N:M Usuarios↔Vehiculos)
- **Estaciones_Carga**, **Servicios_Tecnicos**

El backend solo tiene CRUD para Usuarios, Vehiculos, Estaciones_Carga y Servicios_Tecnicos (mas `Clientes`, que usa la tabla `roles` por error). **No hay modulos para Colores, Reservas, Usuarios_Reservas ni Usuarios_Vehiculos** (tablas sin endpoints).

## Endpoints (lista resumida)

Base `/api`. **Detalle completo en `docs/Api.md`.**

- `POST /api/auth/login` - body `{correo, contrasena}` -> `{token, usuario}` (JOIN Usuarios+Roles).
- `GET|POST /api/clientes`, `GET /api/clientes/:id`, `DELETE /api/clientes/:id` (tabla `roles`).
- `GET|POST|PUT|DELETE /api/usuarios[/:id]` - POST/PUT hashean la contrasena.
- `GET|POST|PUT|DELETE /api/vehiculos[/:id]`.
- `GET|POST|PUT|DELETE /api/servicios-tecnicos[/:id]`.
- `GET|POST|PUT|DELETE /api/estaciones-carga[/:id]`.
- Los frontends llaman a `/api/auth/registro` pero **el backend no define esa ruta** (solo `login`). El web lo resuelve con `POST /usuarios` + `POST /auth/login`.

## Tipos de usuario y funcionalidades

Roles determinados por `Roles.Nombre` (string) y flags de `useAuth()`; las tabs/paginas cambian segun rol. **Detalle por pantalla en `docs/Funcionalidades.md`.**

- **Invitado** (sin login): Inicio (catalogo Voltus, planes, test drive), Vehiculos (detalle + colores), Reservas (formulario + pago QR simulado).
- **Cliente** (usuario con vehiculo electrico): Inicio (bateria, estaciones cercanas, historial), Estaciones de Carga (API real), Talleres Autorizados (API real), Emergencias (SOS, contactos).
- **Administrador**: Inicio (stats, gestion de contenido, actividad reciente) y Usuarios (CRUD mock: buscar, filtrar, suspender, editar, eliminar).

La mayoria de pantallas usa **datos mock hardcodeados**; solo login/registro y (en movil) Estaciones y Talleres tocan la API real.

## Convenciones de codigo

- Nombres de archivos/funciones y comentarios en **espanol**.
- Backend: `camelCase` para funciones, `PascalCase` para interfaces; `TABLA` y `CAMPO_ID` como constantes en mayusculas; handlers `try/catch` -> `next(error)`; factory `export default function (dbInyectada?)`.
- App movil: pantallas con hooks funcionales (salvo `ReservasScreen` que es class component); estilos en `StyleSheet.create` separados en `src/styles/`; constantes de color exportadas.
- Frontend web: arquitectura limpia (domain/data/infraestructura/presentation) con inyeccion manual de repositorios; cae a mocks si la API falla.
- Formato: Prettier (singleQuote, printWidth 100) + ESLint (config-expo en movil).
- Respuestas API siempre con `red/respuestas` (success/error).
- No hay framework de tests configurado.

## Comandos

- Backend: `cd Backend && npm run dev` (nodemon + ts-node, puerto 4000). Requiere MySQL local y `.env`.
- App movil: `cd Mobile && npm start` (expo), `npm run android|ios|web`, `npm run prebuild`, `npm run lint` (eslint + prettier check), `npm run format`.
- Frontend web: `cd Frontend && npm run dev|build|lint|preview`.

## Decisiones implementadas (no revertir sin motivo)

Detalle completo en `docs/Decisiones-tecnicas.md`, **incluido el plan de despliegue/hoja de ruta** (seccion "Plan de despliegue / hoja de ruta (Roadmap)") que define la migracion a Supabase (Postgres + pgvector), deployment del backend en Render, del frontend en Vercel y el chatbot con Google Gemini (free tier). **Leelo antes de asumir el estado de la infraestructura.**

1. CRUD generico por modulo con inyeccion de DB (duplicar carpeta = nuevo modulo).
2. Sobre de respuesta JSON uniforme `{error, status, body}`.
3. Autenticacion JWT (sin expiracion configurada) + bcrypt (salt 5) para contrasenas.
4. Contexto de auth con flags derivados de rol para navegacion por tabs.
5. Estilos por pantalla en `*.styles.ts` con paleta compartida; NativeWind instalado pero inactivo (`global.css` comentado).
6. Frontend-web separado (Vite) como app independiente, con arquitectura limpia y fallback a mocks.
7. Deteccion automatica de IP para `API_URL` en la app movil (`Mobile/src/Config/api.ts`).

## Gotchas

- `config.ts` lee `process.env.JET_SECRET` (typo de "JWT"), no `JWT_SECRET`.
- El `.env` del Backend no esta en git; los defaults de config.ts son: puerto 4000, host localhost, user root, db `quantumdb`.
- `Mobile/cesconfig.jsonc` es un archivo de debug de NativeWind, se puede ignorar/eliminar.
- `tsconfigPaths` (alias `@/*`) esta habilitado en Expo pero las pantallas importan por ruta relativa.
- En el movil, el rol se compara como string (`rol === 'cliente'` / `'administrador'` en minuscula); depende del valor en la BD.
