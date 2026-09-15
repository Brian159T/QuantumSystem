# Decisiones Tecnicas - Quantum / Voltus

Registro del **stack**, **herramientas** y **decisiones de diseno** tomadas en el proyecto, para mantener consistencia y no revertir sin motivo.

---

## 1. Stack del proyecto

### Backend (`Backend/`)
| Aspecto | Eleccion |
|---------|----------|
| Runtime | Node.js + TypeScript (ts-node / nodemon) |
| Framework | Express 5 |
| Base de datos | MySQL (driver `mysql`) |
| Autenticacion | JWT (`jsonwebtoken`) + `bcrypt` (salt 5) |
| Logging | `morgan` ('dev') |
| Variables de entorno | `dotenv` (via `.env`, cargado con `require('dotenv').config()`) |
| TypeScript | `strict: true`, `target ES2020`, `module Node16` |
| Script | `npm run dev` (nodemon --exec ts-node src/index.ts) |
| Puerto | 4000 (default) |

### App movil (`Mobile/`)
| Aspecto | Eleccion |
|---------|----------|
| Framework | **Expo SDK 54** |
| React / React Native | React 19.1 / React Native 0.81.5 |
| Navegacion | `@react-navigation/native` + `bottom-tabs` |
| Iconos | `@expo/vector-icons` (MaterialCommunityIcons) |
| HTTP | `axios` |
| Mapas | `react-native-maps` |
| Ubicacion | `expo-location` |
| Estilos | `StyleSheet.create` por pantalla en `src/styles/*.styles.ts`. **NativeWind v4 instalado pero inactivo** |
| Fuentes | Poppins (`@expo-google-fonts/poppins`) |
| Scripts | `npm start`, `android`, `ios`, `web`, `prebuild`, `lint` (eslint+prettier), `format` |

### Frontend web (`Frontend/`)
| Aspecto | Eleccion |
|---------|----------|
| Build tool | Vite |
| React | React 19 |
| Iconos | `lucide-react` |
| HTTP | `fetch` nativo (ApiClient) |
| Estilos | CSS en `src/styles/` (variables.css, base, componentes, paginas) |
| Scripts | `npm run dev|build|lint|preview` |
| Proxy (dev) | Vite proxy `/api` → `http://localhost:4000` |

---

## 2. Convenciones de codigo

- **Idioma**: nombres de archivos, funciones, variables y comentarios en **espanol**.
- **Backend**:
  - `camelCase` para funciones; `PascalCase` para interfaces.
  - `TABLA` y `CAMPO_ID` como constantes en MAYUSCULAS por modulo.
  - Handlers `async try/catch` → `next(error)`.
  - Factory de controlador: `export default function (dbInyectada?)`.
  - Respuestas siempre con `red/respuestas` (success/error).
- **Frontend (movil)**:
  - Pantallas con hooks funcionales (excepto `ReservasScreen` que es class component).
  - Estilos separados en `src/styles/<Pantalla>.styles.ts` con `StyleSheet.create`.
  - Constantes de color exportadas desde el styles.
- **Formato**: Prettier (`singleQuote`, `printWidth 100`) + ESLint (`config-expo`).

---

## 3. Paleta de colores compartida

Constantes de color repetidas en los `*.styles.ts` (movil) y `variables.css` (web):

| Constante | Valor | Uso |
|-----------|-------|-----|
| `GREEN` | `#2fb676` | Verde Quantum (accion principal) |
| `BLUE` | `#4D9FFF` | Azul electrico (secundario/accent) |
| `BG` / fondo | `#0A0F1E` (movil) | Fondo oscuro |
| `TEXT_DARK` / `TEXT_MID` / `SUBTLE` | variaciones | Textos |
| `WHITE` / `OFF_WHITE` | blancos | Fondo de tarjetas |
| `ORANGE` / `RED` | naranja/rojo | Alertas, niveles bajos, SOS |

Ojo: cada `styles.ts` define sus propias constantes (no hay un archivo central unico de tokens todavia).

---

## 4. Decisiones de arquitectura implementadas (NO revertir sin motivo)

1. **CRUD generico por modulo con inyeccion de DB** (backend). Duplicar la carpeta de un modulo = nuevo modulo CRUD.
2. **Sobre de respuesta JSON uniforme**: `{ error, status, body }`.
3. **Autenticacion JWT** (sin expiracion configurada) + **bcrypt salt 5** para contrasenas.
4. **Auth context con flags derivados de rol** (`esInvitado/esCliente/esAdministrador`) para navegacion por tabs.
5. **Estilos por pantalla** en `*.styles.ts` con paleta compartida; NativeWind instalado pero **inactivo** (`global.css` comentado en movil).
6. **Frontend-web separado** (Vite) como app independiente, con arquitectura limpia (domain/data/infra/presentation) y fallback a mocks si la API falla.
7. **Deteccion automatica de IP** en el movil (`Config/api.ts`) usando `Constants.expoConfig?.hostUri` para construir `API_URL` (en vez de IP fija).

---

## 5. Gotchas / errores conocidos (importante para la IA)

1. **`config.ts` lee `process.env.JET_SECRET`** (typo de "JWT"), no `JWT_SECRET`. El `.env` no la define, asi que el secret siempre cae a `'notasecreta!'`.
2. **`.env` del backend** no esta versionado. Defaults de `config.ts`: puerto 4000, host localhost, user root, db `quantumdb`.
3. **`Mobile/cesconfig.jsonc`**: archivo de debug de NativeWind, ignorable/eliminable.
4. **`tsconfigPaths` (alias `@/*`)** habilitado en Expo, pero las pantallas importan por **ruta relativa**.
5. **`Modulo Clientes`** apunta a la tabla **`roles`** por error y no tiene PUT; no lo consume el frontend.
6. **No existe `POST /api/auth/registro`** en el backend. El movil lo llama (fallaria); el web lo resuelve con `POST /usuarios` + `POST /auth/login`.
7. **El token JWT se guarda pero no se envia** en peticiones reales (solo login/registro hacen requests).
8. **`Roles.Nombre` se compara como string** en el movil (`rol === 'cliente'` / `'administrador'` en minuscula); depende del dato en la BD.
9. **Vehiculos**: handlers con `console.log` de debug.
10. **`dotenv` en devDependencies**: `require('dotenv').config()` puede fallar en produccion.

---

## 6. Plan de despliegue / hoja de ruta (Roadmap)

Plan acordado para publicar el proyecto en la nube. **Pendiente de ejecutar**; cada paso se hace "cuando llegue el momento".

1. **Migrar la base de datos de MySQL a PostgreSQL de manera local**.
   - Usar **pgloader**: `pgloader mysql://... quantumappdb postgresql://... quantumdb`.
   - Al quedar en el mismo motor (Postgres) que Supabase, la subida posterior no tiene fricción (mismos tipos, extensiones y esquema).
2. **Configurar los campos vectoriales (`pgvector`) localmente**:
   - `CREATE EXTENSION vector;`.
   - Añadir **tablas/columnas vectoriales** para:
     - **Documentos de la empresa** (PDFs).
     - **Imagenes de la empresa** (catalogo de vehiculos, etc.).
   - Generar embeddings (con Gemini free tier) y poblar las tablas en local.
   - Si se requiere, **modificar las tablas originales** (agregar/ajustar columnas, p. ej. tabla `Imagenes` con metadatos + storage).
3. **Subir la base de datos a Supabase (plan Free) cuando este lista**.
   - Opcion A (recomendada): **Dashboard → Database → Import from other databases** (soporta Postgres/MySQL).
   - Opcion B: `pg_dump` del Postgres local y `pg_restore` en la base de Supabase (mismo motor, cero incompatibilidades).
4. **Adaptar el backend** para consultar la **base de datos de Supabase** con sus credenciales (cambiar driver MySQL → `pg` y ajustar el SQL) y **subirlo a Render**.
5. **Adaptar el frontend** para consumir las APIs del backend publicado en Render y **subirlo a Vercel**.
6. **Chatbot con IA**: usar **Google Gemini API** (free tier, $0) para el RAG/chat, pero **dejarlo desacoplado** para poder cambiarlo a un proveedor mas potente/de paga (p. ej. OpenAI, Claude) sin rehacer la app cuando se requiera.

Evolucion de la arquitectura:

```
HOY:       MySQL (local)                       → Backend local → Mobile / Web
TRANSICION: PostgreSQL + pgvector (local)      → Backend local (dev)   ← se prepara y prueba aquí
FUTURO:    Supabase (Postgres+pgvector+Storage) → Backend en Render → Vercel (web) + Mobile
             ↑ Gemini (free tier) orquesta RAG desde el backend
```

Notas:
- La migración se hace cuando las tablas esten **completas**.
- Desarrollar localmente en Postgres+pgvector (sin depender de red) y **subir a Supabase solo cuando esté listo**.
- Las credenciales (Supabase, Render, Vercel, Gemini) **solo van en variables de entorno**, nunca en el repo.
- Alternativa a Supabase si se quisiera seguir con MySQL: PlanetScale / AWS RDS (descartada por ahora; el plan es Postgres/Supabase).

---

## 7. Comandos utiles

### Backend
```
cd Backend && npm run dev        # nodemon + ts-node, puerto 4000 (requiere MySQL + .env)
```

### Movil
```
cd Mobile && npm start           # expo start
npm run android / ios / web
npm run prebuild
npm run lint                     # eslint + prettier check
npm run format
```

### Web
```
cd Frontend && npm run dev | build | lint | preview
```

---

## 8. Referencias

- Arquitectura general: `docs/Arquitectura.md`
- Base de datos: `docs/base-datos.md`
- Endpoints: `docs/Api.md`
- Funcionalidades por rol: `docs/Funcionalidades.md`
