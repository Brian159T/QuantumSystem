# Decisiones Tecnicas - Quantum / Voltus

Registro del **stack**, **herramientas** y **decisiones de diseno** tomadas en el proyecto, para mantener consistencia y no revertir sin motivo.

---

## 1. Stack del proyecto

### Backend (`Backend/`)
| Aspecto | Eleccion |
|---------|----------|
| Runtime | Node.js + TypeScript (ts-node / nodemon) |
| Framework | Express 5 |
| Base de datos | PostgreSQL `QuantumSystemDB` (driver `pg`) — **activo**; `pgvector` + embeddings Gemini poblados |
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
6. **Frontend-web separado** (Vite) como app independiente, con **arquitectura basada en componentes** (components/pages/hooks/services/utils/types/routes), hooks que envuelven a los services y fallback a mocks si la API falla. El **fondo de pagina se aclara por rol** (`componentes.css`: gradientes claros verde/azul/gris-azul para invitado/cliente/admin) con textos de pagina adaptados (`--texto-pagina` / `--texto-pagina-suave`), mientras la cabecera y las tarjetas mantienen el tema oscuro.
7. **Deteccion automatica de IP** en el movil (`Config/api.ts`): usa `Constants.expoConfig?.hostUri` para construir `API_URL`, con **fallback a `http://localhost:4000/api`** cuando no hay `hostUri` (p. ej. en web). En web, `react-native-maps` se sustituye por un **stub** (`src/stubs/react-native-maps.web.tsx`) via alias en `metro.config.js`.
8. **Backend con PostgreSQL**: el backend **ya corre con el driver `pg`** contra `QuantumSystemDB` local. La capa `src/DB/pg.ts` preserva la interfaz de la anterior `mysql.ts` (misma inyeccion de DB), usando identificadores entre comillas dobles (`"Vehiculos"`), parametros `$n` (`??` = identificador, `?` = valor en queries en crudo) y upsert con `ON CONFLICT DO NOTHING`.

---

## 5. Gotchas / errores conocidos (importante para la IA)

1. **`config.ts` lee `process.env.JET_SECRET`** (typo de "JWT"), no `JWT_SECRET`. El `.env` no la define, asi que el secret siempre cae a `'notasecreta!'`.
2. **`.env` del backend** no esta versionado. Defaults de `config.ts`: puerto HTTP 4000, host `localhost`, user `postgres`, password `''`, db `QuantumSystemDB`, puerto PG `5432`.
3. **`Mobile/cesconfig.jsonc`**: archivo de debug de NativeWind, ignorable/eliminable.
4. **`tsconfigPaths` (alias `@/*`)** habilitado en Expo, pero las pantallas importan por **ruta relativa**.
5. **`Modulo Clientes`** apunta a la tabla **`Roles`** (nombre heredado del modulo; es el CRUD de roles). No lo consume el frontend.
6. **No existe `POST /api/auth/registro`** en el backend. El movil lo llama (fallaria); el web lo resuelve con `POST /usuarios` + `POST /auth/login`.
7. **El token JWT se guarda pero no se envia** en peticiones reales (solo login/registro hacen requests).
8. **`Roles.Nombre` se compara como string** en el movil (`rol === 'cliente'` / `'administrador'` en minuscula); depende del dato en la BD.
9. **Vehiculos**: handlers con `console.log` de debug.
10. **`dotenv` en devDependencies**: `require('dotenv').config()` puede fallar en produccion.

---

## 6. Plan de despliegue / hoja de ruta (Roadmap)

Plan acordado para publicar el proyecto en la nube. Estado al **septiembre 2026**: los pasos 1, 2 y 3 estan **completados en local**; los demas estan pendientes.

1. **Migrar la base de datos de MySQL a PostgreSQL de manera local** — ✅ **HECHO**.
   - No se uso pgloader; se creo el esquema y se cargaron los datos en la base `QuantumSystemDB` (PostgreSQL 17) con un script SQL de una sola ejecucion (ya eliminado).
   - Quedo en el mismo motor (Postgres) que Supabase, la subida posterior no tiene fricción (mismos tipos, extensiones y esquema).
   - **Las relaciones son las mismas que tenia la base MySQL antigua**: la migracion preservo todas las FKs sin cambios (solo se ampliaron anchos de columnas y se agregaron los `embedding`). Verificado contra la base real.
   - Detalle de tipos, tablas y estado migrado: ver `docs/base-datos.md`.
2. **Configurar los campos vectoriales (`pgvector`) localmente** — ✅ **HECHO** (parcial: solo las tablas de la app).
   - `CREATE EXTENSION vector;` (extension `pgvector` ya instalada a nivel de sistema en PostgreSQL 17 Windows; el instalador de una sola ejecucion se elimino tras reproducirla).
   - Columnas `"embedding" vector(768)` en **Usuarios, Vehiculos, Reservas, Servicios_Tecnicos y Estaciones_Carga**.
   - **Embeddings generados con Gemini** (`gemini-embedding-001`, dimension 768) y poblados via `Backend/scripts/vectorizar_datos.ts` (lee la clave `API_KEY_GOOGLE_AI_STUDIO` de `Backend/.env`; fallback local sin IA si no hay clave).
   - Pendiente (cuando corresponda): documentos de la empresa (PDFs) e imagenes (catalogo) en tablas/columnas adicionales.
3. **Adaptar el backend a PostgreSQL local** — ✅ **HECHO** (septiembre 2026).
   - Nueva capa `Backend/src/DB/pg.ts` con la **misma interfaz** que tenia `mysql.ts` (se elimino) y mismos modulos/rutas (arquitectura intacta).
   - `config.ts` expone `config.pg` (`PGHOST/PGUSER/PGPASSWORD/PGDATABASE/PGPORT`) y el `.env` apunta a `QuantumSystemDB` (puerto 5432).
   - SQL en crudo ajustado a sintaxis Postgres (identificadores mixtos entre comillas dobles, parametros `$n`).
   - Detalle completo de los cambios: `docs/base-datos.md` (seccion "Migracion del backend a PostgreSQL").
4. **Subir la base de datos a Supabase (plan Free)** — pendiente.
   - Opcion A (recomendada): **Dashboard → Database → Import from other databases** (soporta Postgres/MySQL).
   - Opcion B: `pg_dump` del Postgres local y `pg_restore` en la base de Supabase (mismo motor, cero incompatibilidades).
5. **Conectar el backend a Supabase** con sus credenciales (ya usa driver `pg`; solo cambiar el `.env`/`config.ts`) y **subirlo a Render** — pendiente.
6. **Adaptar el frontend** para consumir las APIs del backend publicado en Render y **subirlo a Vercel**.
7. **Chatbot con IA**: usar **Google Gemini API** (free tier, $0) para el RAG/chat, pero **dejarlo desacoplado** para poder cambiarlo a un proveedor mas potente/de paga (p. ej. OpenAI, Claude) sin rehacer la app cuando se requiera. El flujo ya tiene la base: datos vectorizados en Postgres local → backend busca por similitud (`<=>`) → contexto a Gemini → respuesta al frontend. Aclaracion del flujo RAG: la columna `embedding` guarda **un vector por fila** (representacion semantica de sus demas columnas) y sirve de **clave de busqueda**; al recibir una pregunta, el backend la vectoriza, busca la(s) fila(s) mas parecida(s) con `<=>` y le pasa a la IA el **texto de esa fila** como contexto (nunca el vector, que solo es la llave de busqueda).

Evolucion de la arquitectura:

```
HOY:       PostgreSQL + pgvector (local) + embeddings Gemini
           Backend con driver pg (capa src/DB/pg.ts) → QuantumSystemDB local
FUTURO:    Supabase (Postgres+pgvector+Storage) → Backend en Render → Vercel (web) + Mobile
             ↑ Gemini (free tier) orquesta RAG desde el backend
```

Notas:
- Los pasos 1 a 3 quedaron registrados en `docs/base-datos.md` (esquema, datos, como reproducir la vectorizacion y resumen de la migracion del backend).
- Desarrollar localmente en Postgres+pgvector (sin depender de red) y **subir a Supabase solo cuando esté listo**.
- Las credenciales (Supabase, Render, Vercel, Gemini) **solo van en variables de entorno**, nunca en el repo (`API_KEY_GOOGLE_AI_STUDIO` y `PGPASSWORD` van por `.env`/entorno).
- El backend ya corre en Postgres; si en el futuro no se usara Supabase, alternativas como Neon / Fly.io / Railway (ambas Postgres) serian mas simples que volver a MySQL (descartado).

---

## 7. Comandos utiles

### Backend
```
cd Backend && npm run dev        # nodemon + ts-node, puerto 4000 (requiere PostgreSQL local + .env)
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
