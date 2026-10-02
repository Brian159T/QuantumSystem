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
6. **Frontend-web separado** (Vite) como app independiente, con **arquitectura basada en componentes** (components/pages/hooks/services/utils/types/routes), hooks que envuelven a los services y fallback a mocks si la API falla. El **fondo de pagina se aclara por rol** (`componentes.css`: gradientes claros verde/azul/gris-azul para invitado/cliente/admin) con textos de pagina adaptados (`--texto-pagina` / `--texto-pagina-suave`), mientras la cabecera y las tarjetas mantienen el tema oscuro. **Sept 2026**: el rol invitado se re-estilizo (fondo gris medio en vez de blanco, navbar mas oscuro, textos/iconos clave en negro, footer negro con letras blancas, banners negros a ancho completo pegados a navbar/footer, catalogo destacado sobre franja gris) sin cambiar logica.
7. **Deteccion automatica de IP** en el movil (`Config/api.ts`): usa `Constants.expoConfig?.hostUri` para construir `API_URL`, con **fallback a `http://localhost:4000/api`** cuando no hay `hostUri` (p. ej. en web). En web, `react-native-maps` se sustituye por un **stub** (`src/stubs/react-native-maps.web.tsx`) via alias en `metro.config.js`.
8. **Backend con PostgreSQL**: el backend **ya corre con el driver `pg`** contra `QuantumSystemDB` local. La capa `src/DB/pg.ts` preserva la interfaz de la anterior `mysql.ts` (misma inyeccion de DB), usando identificadores entre comillas dobles (`"Vehiculos"`), parametros `$n` (`??` = identificador, `?` = valor en queries en crudo) y upsert con `ON CONFLICT DO NOTHING`.
9. **Chatbot visual en web**: el componentes `components/Chatbot.tsx` replica al del movil (FAB flotante + panel "Asistente Quantum") y se monta **una sola vez** en `AppNavigator.tsx`, visible en todas las paginas y roles. Es **solo la capa visual** (sin respuestas ni API); el flujo RAG con Gemini sigue pendiente (roadmap paso 7).

---

## 5. Gotchas / errores conocidos (importante para la IA)

1. **`config.ts` lee `process.env.JET_SECRET`** (typo de "JWT"), no `JWT_SECRET`. El `.env` no la define, asi que el secret siempre cae a `'notasecreta!'`.
2. **`.env` del backend** no esta versionado. Defaults de `config.ts`: puerto HTTP 4000, host `localhost`, user `postgres`, password `''`, db `QuantumSystemDB`, puerto PG `5432`.
3. **`Mobile/cesconfig.jsonc`**: archivo de debug de NativeWind, ignorable/eliminable.
4. **`tsconfigPaths` (alias `@/*`)** habilitado en Expo, pero las pantallas importan por **ruta relativa**.
5. **`Modulo Clientes`** apunta a la tabla **`Roles`** (nombre heredado del modulo; es el CRUD de roles). No lo consume el frontend.
6. **No existe `POST /api/auth/registro`** en el backend. El movil lo llama (fallaria); el web lo resuelve con `POST /usuarios` + `POST /auth/login`.
7. **Token JWT**: el **web** ya lo envia en todas las peticiones (`Authorization: Bearer` via `utils/sesion.ts`, token persistido en `localStorage` desde sept 2026). El **movil** aun no lo envia (solo login/registro hacen requests).
8. **`Roles.Nombre` se compara como string** en el movil (`rol === 'cliente'` / `'administrador'` en minuscula); depende del dato en la BD.
9. **Vehiculos**: handlers con `console.log` de debug.
10. **Login 401 (corregido sept 2026)**: credenciales invalidas responden **401** con `{error:true, status:401, body:"Correo o contraseña incorrectos"}`. Antes devolvian 500 porque el controlador lanzaba `new Error` sin `statusCode`; ahora usa `error(msg, 401)` de `middleware/errors.ts`.
11. **Sin fallback a mocks (web, sept 2026)**: los services devuelven `[]` si la API falla o trae lista vacia (la UI no inventa datos). Los antiguos `Frontend/src/services/mocks/*` se eliminaron.
12. **Suspender usuarios (web)**: la tabla `Usuarios` no tiene campo de estado; el toggle "suspender/reactivar" se quito del admin para no simular datos.
13. **`dotenv` en devDependencies**: `require('dotenv').config()` puede fallar en produccion.

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
   - Pendiente (cuando corresponda): documentos de la empresa (PDFs) e imagenes (catalogo) en tablas/columnas adicionales. Ver la subseccion **"Mejoras propuestas (pendiente de decidir)"** mas abajo.
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
7. **Chatbot con IA**: usar **Google Gemini API** (free tier, $0) para el RAG/chat, pero **dejarlo desacoplado** para poder cambiarlo a un proveedor mas potente/de paga (p. ej. OpenAI, Claude) sin rehacer la app cuando se requiera. El flujo ya tiene la base: datos vectorizados en Postgres local → backend busca por similitud (`<=>`) → contexto a Gemini → respuesta al frontend. Aclaracion del flujo RAG: la columna `embedding` guarda **un vector por fila** (representacion semantica de sus demas columnas) y sirve de **clave de busqueda**; al recibir una pregunta, el backend la vectoriza, busca la(s) fila(s) mas parecida(s) con `<=>` y le pasa a la IA el **texto de esa fila** como contexto (nunca el vector, que solo es la llave de busqueda). **Estado actual**: la **capa visual** del chatbot ya existe en el movil (`Mobile/src/View/components/Chatbot.tsx`) y en el web (`Frontend/src/components/Chatbot.tsx`); falta implementar el backend/IA (el RAG sigue pendiente).

   **Modelo de generacion decidido (sept 2026):** `gemini-2.5-flash-lite` en **free tier** ($0, ~15 RPM / ~1.000 RPD), con paso previsto a `deepseek-flash` de pago cuando se agote el limite diario. Ver la seccion **"Modelo de IA del chatbot: decision y plan de migracion"** mas abajo para el detalle de precios, motivos y como se ejecuta el cambio.

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

### Modelo de IA del chatbot: decision y plan de migracion

> **Estado: DECIDIDO (sept 2026).** Modelo inicial `gemini-2.5-flash-lite` (free tier). Destino de pago: `deepseek-flash`.

#### Decision

| Fase | Modelo | Proveedor | Coste | Limite |
|------|--------|-----------|-------|--------|
| **Inicial (actual)** | `gemini-2.5-flash-lite` | Google Gemini API | **$0** | ~15 RPM / **~1.000 RPD** |
| **Cuando se agote el RPD** | `deepseek-flash` | DeepSeek API | ~$0.0004/pregunta | Sin tope diario (solo concurrencia) |

**Por que flash-lite y no flash:** da ~1.000 requests/dia en vez de ~250, o sea 4x margen, asi que la etapa de desarrollo y demostracion del proyecto de grado ocurre completa en el free tier. Nota: desde abril 2026 los modelos **Pro-salieron del free tier** y son de pago, asi que la eleccion esta forzada a la familia **Flash**.

**Por que DeepSeek como destino de pago y no Gemini paid:** el output es lo que domina el coste en un chatbot (respuestas largas) y ahi DeepSeek es ~4x mas barato. A escala del proyecto la diferencia real es de **~$1.60/mes (Gemini paid) vs ~$1.70-3.10/mes (DeepSeek)**: no decide la eleccion, pero no cuesta nada elegir el mas barato.

**Diferencia que si importa (privacidad):** Gemini free tier **si usa** el contenido enviado para mejorar sus productos; DeepSeek declara **no guardar** los datos de las llamadas por defecto (verificar en `api-docs.deepseek.com` antes de apoyar la decision de privacidad en esa garantia, la fuente consultada fue de terceros). Esa es la razon de peso para migrar cuando se pase a pago.

#### Estructura del codigo (a implementar cuando se construya el chatbot)

El cambio de proveedor debe ser **una variable de entorno**, no un cambio de codigo. Interfaz propuesta:

```
generarRespuesta(prompt, contexto) -> string
```

con dos implementaciones intercambiables (`GeminiChat`, `DeepSeekChat`) elegidas por `GEMINI_CHAT_MODEL` / `CHAT_PROVEEDOR` del `.env`. Reglas que hacen posible la migracion:

1. **Nombre del modelo siempre en `.env`**, nunca hardcodeado, aunque hoy haya un solo proveedor.
2. **Streaming desde el dia 1.** Al migrar a un modelo de pago la latencia sube; si ya se transmite, el usuario no lo nota. Anadirlo despues obliga a tocar la UI del chatbot.
3. **Context caching activo** (system prompt fijo). DeepSeek cobra ~3% del precio de entrada por cache hit, y sirve en ambos proveedores: es el mayor ahorro disponible sin cambiar de modelo.

Si en cambio el `fetch` queda embebido en el controlador, cada cambio de proveedor es una modificacion que puede romper el chatbot entero.

#### Estimacion de coste (proyecto de grado: 200 usuarios x 20 preguntas = 4.000 preguntas/mes)

Tokens por pregunta con las 25 filas actuales: ~2.000 de entrada (300 system + ~1.700 contexto RAG + 30 pregunta) y ~500 de salida.

| Escenario | Gemini flash-lite | DeepSeek flash |
|-----------|------------------|----------------|
| Free tier / credito inicial | **$0** | $0 (5M tokens de regalo ≈ 6.500 preguntas) |
| 1 mes pagando | ~$1.60 | ~$1.70 (con cache) a ~$3.10 (sin cache) |
| 6 meses pagando | ~$9.60 | ~$10 (con cache) a ~$18.50 |
| 100.000 preguntas | ~$40 | ~$42 (con cache) a ~$77 |

Precios de referencia (verificados sept 2026): Gemini `2.5-flash-lite` paid $0.18/1M in, $0.72/1M out. DeepSeek `deepseek-flash` $0.22/1M in, $0.66/1M out **off-peak**; el doble en hora pico (01:00-04:00 y 06:00-10:00 UTC).

#### Aviso importante sobre los free tier

- **Gemini free tier no se puede convertir en factura.** Ese es su limite de gasto real: sin cuenta de facturacion no hay cobro posible. En cuanto se anade tarjeta se entra en Tier 1 y desaparecen los topes (queda un freno de ~$10/10 min, que es throttle, no tope).
- **DeepSeek exige funded account desde el dia 1** para seguir mas alla de los 5M tokens de regalo. Es decir, al migrar se pierde el techo de gasto gratis. A esta escala es irrelevante, pero conviene saberlo: **no anadir tarjeta de pago hasta que el free tier de Gemini devuelva un 429 real**, y si se anade, configurar alerta de presupuesto en la consola.

### Vectorizacion: metodo actual vs metodo de la carpeta `db_vectorial`

> **Estado: el metodo actual (Gemini) es el que se usa. `db_vectorial` es un experimento separado, NO parte de la app.** Se documenta aqui para dejar constancia de la comparacion y de por que se descarto como sustituto.

#### Que hace cada metodo

| Eje | **Metodo actual (Backend + Gemini)** | **`db_vectorial/` (Python + Ollama + CLIP)** |
|------|------------------------------------|-------------------------------------------|
| Base de datos | `QuantumSystemDB` (la de la app) | **`dbbrand`** (otra BD, usuario `b`) |
| Motor texto | Gemini `gemini-embedding-001` | Ollama local `mxbai-embed-large` |
| Motor imagen | No soportado | CLIP `openai/clip-vit-base-patch32` |
| Dimensiones | 768 | 1024 (texto) / 512 (imagen) |
| Donde corre | Proceso Express, automatico en cada POST/PUT | Scripts Python manuales, fuera del backend |
| Origen | Filas reales de las tablas | `datos.csv` (3 filas) + 10 JPG locales |
| Cuando vectoriza | Automatico (write-through) y batch de respaldo | Solo batch manual |
| Busqueda | **Ninguna implementada** (el `<=>` solo esta documentado) | Implementada: `<=>` y `<->`, umbral `< 0.30`, top-3 |
| Idempotencia | `WHERE "embedding" IS NULL` + retardo 120 ms | `embedding_imagen IS NULL` + commit parcial cada 4 |
| Credenciales | `.env` via `dotenv` | **Hardcodeadas en los 4 scripts** |
| Repositorio | Monorepo `main` | **Repo git separado**, no trackeado en el monorepo |

#### Como vectoriza la carpeta `db_vectorial`

- **Texto** (`indexa_texto.py`): lee `datos.csv`, vectoriza **solo** la columna `descripcion` (linea 110) y la guarda en `marcas_embeddings.embedding vector(1024)`. La llamada es `POST http://127.0.0.1:11434/api/embed` (linea 12) al modelo `mxbai-embed-large:latest` → **1024 dims**.
- **Imagenes** (`indexa_imagenes.py`): CLIP con `transformers` + `torch` (lineas 38-39). Carga la imagen desde URL http(s) o ruta local, aplica `get_image_features` con normalizacion L2 → **512 dims**, y la guarda en `marcas_embeddings.embedding_imagen` con un `UPDATE` incremental (`WHERE embedding_imagen IS NULL`).
- **Busqueda** (`buscar_texto.py`, `buscar_imagen.py`): el vector se pasa como string `"[a,b,c]"` con cast `%s::vector`; `buscar_texto.py` usa `<=>` (coseno) y `<->` (L2) con `LIMIT 1`; `buscar_imagen.py` usa `<=>` con umbral de distancia `< 0.30` y `top_k=3`.
- Ambos vectores viven en **espacios distintos y nunca se comparan entre si** (1024 vs 512).

#### Comparacion en produccion

**Seguridad**

| | Metodo actual | `db_vectorial` |
|---|---|---|
| Egresion de datos | **Si**, a Google | **Ninguna** (todo local) |
| PII enviada | Si (ver plan de seguridad mas abajo) | Ninguna, pero tampoco toca datos de la empresa |
| API keys | 1, en `.env` | 0, pero **password en el codigo** |
| Clave en query string | No (header `x-goog-api-key`) | No aplica |
| Superficie de ataque | Fallback silencioso que escribe vectores inservibles | **SSRF** (descarga URLs sin validar host), `torch`, Ollama sin auth en `:11434` |
| Datos usados para entrenar | **Si** en free tier | No aplica |

El metodo nuevo gana en privacidad y pierde en higiene de secretos y superficie de ataque. Ademas, su privacidad es en parte casualidad: protege los datos de la empresa **porque nunca los toca** (apunta a `dbbrand` con un CSV de marcas publicas). Si se conectara a `QuantumSystemDB` manteniendo Ollama/CLIP locales, la privacidad se mantiene.

**Proceso**

- El metodo actual vectoriza **automaticamente en cada POST/PUT** (5 controladores), asi que la columna nunca queda desactualizada; el batch `vectorizar_datos.ts` solo rescata filas con `embedding IS NULL`.
- `db_vectorial` es **batch manual**: requiere Ollama instalado, ejecucion manual, y procesa imagen por imagen (su `BATCH_SIZE` solo controla la frecuencia de commit, no el lote real).
- El metodo actual tiene **desventajas propias**: logica duplicada entre `src/embeddings/index.ts` y `scripts/vectorizar_datos.ts` (por diseno), y **ningun indice HNSW** sobre `embedding` ni `embedding_imagen`, o sea seq scan en cada busqueda.
- `db_vectorial` tiene la ventaja de **implementar la busqueda** con umbral y `top_k`, que es justo lo que el metodo actual necesita para el RAG (el `LIMIT 1` sin umbral de `docs/base-datos.md:205` es un riesgo de alucinacion).

**Problemas de coherencia de `db_vectorial`:** `tabla.sql` crea la tabla `imagenes` e indexa `brand.marcas_embeddings`, pero los scripts usan `marcas_embeddings` **sin esquema** (objetos distintos); el unico indice HNSW del proyecto apunta a una tabla que nadie consulta; `buscar_texto.py:189` llama a `umain()` dejando muerto `main()`, asi que la comparacion coseno vs L2 nunca se ejecuta; y las credenciales (`user: b`, `password: a`) estan committed en su propio repo.

#### Decision

**Se mantiene el metodo actual (Gemini).** Motivos:

1. Los 25 vectores ya estan poblados y las 5 tablas de la app son la unica fuente de datos del chatbot.
2. Los modelos son **incomparables entre si**: Gemini 768, Ollama 1024, CLIP 512. Cambiar de embedder obliga a re-vectorizar todo y a alterar el tipo de la columna.
3. El metodo nuevo no aporta una lectura lista: sus scripts apuntan a otra base de datos.
4. Los problemas que si tiene (allowlist, secuencia silenciosa, falta de indice, falta de busqueda) se pueden corregir en el metodo actual con mucho menos esfuerzo que migrar.

**Lo que si se conserva de `db_vectorial`:**
- El patron de **umbral de similitud y `top_k`** para la busqueda del chatbot, que evita devolver filas irrelevantes al modelo.
- La idea de **vectorizar imagenes del catalogo** (ver "Mejoras propuestas" A), que es un pendiente real del roadmap.
- Si en el futuro se quiere vectorizar imagenes en Node en vez de Python, la via es `@huggingface/transformers` (Transformers.js sobre ONNX) en vez de `torch`: pesa ~300 MB en vez de ~2 GB y evita mantener un runtime de Python. **Ojo:** hay que usar la **proyeccion** (`CLIPVisionModelWithProjection`, 512 dims), no el pooled de la vision tower, y el preprocesado debe ser identico al de `CLIPProcessor`.

### Plan de seguridad: dejar de enviar datos personales a Gemini

> **Estado: IMPLEMENTADO (oct 2026).** `Usuarios` y `Reservas` ya no se vectorizan; las 3 tablas restantes usan allowlist explicita de columnas + denylist por regex; la clave viaja en el header `x-goog-api-key`. Objetivo cumplido: **ningun dato de `Usuarios` ni `Reservas` sale del servidor**.

#### Diagnostico

Hoy `textoDeObjeto` (`Backend/src/embeddings/index.ts:23-35`) concatena **toda** la fila salvo `embedding`. Sin allowlist, eso manda a Google:

| Tabla | Lo que sale hoy | Contiene PII |
|-------|-----------------|--------------|
| `Usuarios` | `correo`, `nombre_usuario`, **`contrasena`** (hash bcrypt) | **Si** |
| `Reservas` | `nombres`, `apellidos`, **`cedula_identidad`**, datos del vehiculo | **Si** |
| `Vehiculos` | modelo, tipo, autonomia, precio | No |
| `Servicios_Tecnicos` | nombre, descripcion, precio | No |
| `Estaciones_Carga` | nombre, direccion, coordenadas | No |

Detalle que agrava el caso: en `Usuarios/controlador.ts` el bcrypt se aplica en las lineas 62-65 y la vectorizacion se dispara en la 71, o sea **el hash ya esta listo cuando se manda**.

El dato relevante: **3 de las 5 tablas que hoy se vectorizan no contienen ni un dato personal. El 100% del riesgo esta en `Usuarios` y `Reservas`.**

#### Decision

1. **`Usuarios` y `Reservas` dejan de vectorizarse por completo.** Es la medida que mas riesgo elimina por menos codigo, y elimina el problema por construccion en lugar de por configuracion (el allowlist se olvida ampliar dentro de seis meses; quitar dos imports no).
2. **Allowlist explicita por tabla** para las 3 restantes, en lugar del "todo menos `embedding`".
3. **Denylist por regex** como segunda capa: correos, cedulas (10-13 digitos), telefonos y cualquier clave parecida a `contrasena` abortan la llamada y loguean alerta. Dos defensas que fallan juntas valen mas que una sola correcta.

Justificacion funcional: el chatbot responde sobre el **catalogo** (vehiculos, estaciones, talleres). Una fila de usuario o reserva no aporta contexto util a esa pregunta, asi que su coste es cero y su riesgo es todo.

#### Medidas complementarias

| # | Medida | Esfuerzo | Impacto | Estado |
|---|--------|----------|---------|--------|
| 1 | Quitar `Usuarios` y `Reservas` de la vectorizacion (quitar los imports en sus 2 controladores) | Bajo | **Elimina toda la PII** | **Hecho** |
| 2 | Allowlist por tabla en `src/embeddings/index.ts`, compartida por `scripts/vectorizar_datos.ts` | Bajo | Estructural, no por configuracion | **Hecho** |
| 3 | Denylist de regex (correo, cedula/telefono, `contrasena`) | Bajo | Defensa en profundidad | **Hecho** |
| 4 | `EMBEDDINGS_ALLOW_REMOTE=false` | Bajo | Modo garantizado sin egress | Pendiente |
| 5 | `EMBEDDINGS_ENABLED=false` | Bajo | Apagar vectorizacion sin redesplegar logica | Pendiente |
| 6 | `EMBEDDINGS_DRYRUN=true` | Bajo | Imprime el texto exacto sin llamar a Gemini (unica forma de verificar el allowlist) | Pendiente |
| 7 | Log de huella SHA-256 del texto enviado (tabla, id, modelo, nº chars) | Medio | Evidencia para auditoria | Pendiente |
| 8 | Mover la key de `?key=` a header `x-goog-api-key` | Bajo | La query string acaba en logs de proxy/plataforma | **Hecho** |
| 9 | Rotar la clave actual de `Backend/.env` y restrictarla en la consola de Google | Bajo | Superficie de credenciales | Pendiente |
| 10 | Banner de proveedor al arrancar + eliminar el fallback silencioso | Bajo | Detecta la averia antes que el usuario | Pendiente |
| 11 | `.env.example` (ya whitelisteado en `.gitignore:7`, nunca creado) | Bajo | Documenta que variables existen | Pendiente |
| 12 | Mover `dotenv` de `devDependencies` a `dependencies` | Bajo | El backend no arranca en `npm ci --omit=dev` | Pendiente |

#### Como quedo implementado

`Backend/src/embeddings/index.ts` es ahora la **unica fuente de verdad** de que sale del servidor:

1. **`COLUMNAS_POR_TABLA`**: allowlist con las 3 tablas y sus columnas. `Vehiculos` (10 columnas de catalogo), `Servicios_Tecnicos` y `Estaciones_Carga` (direccion, horarios, Estado, latitud, longitud).
2. **Tabla fuera de la allowlist = no se vectoriza.** `textoDeFila` devuelve `null` y avisa por consola, asi que anadir una llamada a embeddings en `Usuarios` o `Reservas` **no envia nada** (fallo por construccion, no por configuracion).
3. **`PATRONES_PROHIBIDOS` (denylist)** sobre el texto ya armado: correo, bloque de 7-14 digitos (cedula/telefono) y cualquier `contrase|contrasena|password|clave_hash|secret`. Si coincide, **no se llama a Gemini** y se loguea en `error`.
4. `embeddingDeObjeto` paso a **`embeddingDeFila(tabla, fila)`** y `embeddingDeActualizacion` exige la tabla como primer argumento: no hay forma de vectorizar sin nombrar la tabla.
5. La **clave va en el header `x-goog-api-key`**, no en `?key=` (tambien en `scripts/vectorizar_datos.ts`).
6. `scripts/vectorizar_datos.ts` importa la allowlist y el denylist del servicio: **una sola definicion**, y su lista `TABLAS` quedo en las 3 tablas seguras.

> **`telefono` quedo fuera a proposito.** Es el telefono comercial de los talleres/estaciones (no es un dato personal), pero incluirlo choca con el patron numerico de la denylist. Si mas adelante se quiere que el chatbot lo responda, la opcion limpia es consultarlo por query estructurada y no por RAG.

**Migracion aplicada a la base (oct 2026):** primero se vaciaron los vectores (`SET "embedding" = NULL`) porque se habían calculado con PII dentro; despues se **eliminaron las columnas** con `ALTER TABLE "Usuarios" DROP COLUMN "embedding"` y `ALTER TABLE "Reservas" DROP COLUMN "embedding"`. Ninguna FK ni indice dependia de ellas (las N:M `Usuarios_Reservas` y `Usuarios_Vehiculos` siguen en pie; la FK de `Usuarios` va por `id_usuario`, la de `Reservas` por `id_reserva`). Ademas se **re-vectorizaron las 3 tablas restantes** (`Vehiculos` 6, `Servicios_Tecnicos` 11, `Estaciones_Carga` 5) porque el texto cambio al pasar de "todas las columnas" a la allowlist; si no, los vectores viejos seguirian representando un texto que ya no se envia. La **extension `vector` (pgvector 0.8.2) se mantiene**: la necesitan las 3 tablas del chatbot.

#### El segundo fallo, independiente de la privacidad

**El fallback silencioso es peor que el problema de datos.** En `index.ts`, si falta la clave o falla la API, `vectorizar` captura el error y devuelve `null`; si la clave falta del todo, escribe `vectorHashing`: vectores de 768 dims **aparentemente validos pero semanticamente inservibles**. El endpoint responde 200, la columna se llena y nadie se entera hasta que el chatbot responde absurdo.

Un fallback que produce basura y no se distingue del camino bueno es peor que no tener fallback. Opciones: loguear en `error` con banner visible al arrancar, o escribir `NULL` para que el RAG detecte que falta indexar. **Al construir el chatbot hay que resolverlo**, porque el RAG depende de que los vectores significen algo.

#### Nota sobre la privacidad frente al coste

Los datos que quedarian despues de aplicar el allowlist son **nombre de modelo, precio, autonomia, nombre de taller, direccion de estacion**: catalogo de productos de una marca de autos. Eso no es informacion personal y su uso en el free tier es legitimo. **La garantia de que el contenido no se usa para entrenar solo existe en el tier de pago**, asi que la mitigacion real es no enviar el dato, no pagar.

### Mejoras propuestas (pendiente de decidir)

> **Estado: ideas anotadas, NADA implementado.** Quedan a la espera de que se decida la forma segura de hacerlo. No son decisiones tomadas.

#### A) Vectorizar imagenes del catalogo

Hoy `Vehiculos` **no tiene columna de imagen**, asi que hay que crear la capa primero.

- **Modelo recomendado: `gemini-embedding-2`.** Es multimodal (texto, imagen, video, audio, PDF) y mapea **imagen y texto al mismo espacio vectorial**, asi que se puede buscar con texto y encontrar imagenes. Dimensiones 128-3072 (recomendadas 128 / 768 / 1536), input hasta 8.192 tokens. Disponible en la **Gemini API** (misma clave actual, free tier).
- **Descartada `multimodalembedding@001`** (1408 dims, el modelo multimodal clasico): solo esta en **Vertex AI**, lo que ataria el proyecto a GCP y a un proyecto con facturacion.
- Pasos propuestos:
  1. Crear `Vehiculo_Imagenes (id_vehiculo FK, ruta, mime_type, embedding vector(N))`. **No** guardar bytes en Postgres: el binario va en disco y luego en Supabase Storage (ya previsto en el roadmap).
  2. Nuevo script `Backend/scripts/vectorizar_imagenes.ts` clonando el patron de `vectorizar_datos.ts`: `WHERE "embedding" IS NULL` -> base64 -> `content.parts: [{ inlineData: { mimeType, data } }]` -> `UPDATE ... SET "embedding" = $1::vector`. Reusar el retardo de 120 ms (rate limit del free tier).
  3. **Enviar texto contextual junto a la imagen** (`Nombre_Modelo` + nombre del archivo): es lo que mas mejora la precision y distingue dos fotos casi iguales del mismo modelo.
  4. indice `CREATE INDEX ... USING hnsw ("embedding" vector_cosine_ops)` (opcional: con pocas filas no hace falta).
- **Decision critica (bloqueante):** si las imagenes se vectorizan con `gemini-embedding-2` y el texto se queda en `gemini-embedding-001`, **los vectores no son comparables** y `<=>` no significa nada entre modalidades. Dos salidas:
  - (a) **Re-vectorizar todas las tablas** con `gemini-embedding-2` a 768 dims (recomendado: ademas mejora el multilingue y el RAG).
  - (b) Columna aparte y limitarse a busqueda imagen -> imagen.

#### B) Privacidad: allowlist de columnas antes de enviar a Gemini (riesgo actual)

> **Resuelto como decision: ver "Plan de seguridad: dejar de enviar datos personales a Gemini" mas arriba.** Se conserva esta seccion como registro del problema detectado.

Hoy el texto que sale a Gemini se arma con **todas** las columnas de la fila salvo `embedding`:
`Backend/src/embeddings/index.ts:23-35` (`textoDeObjeto`, en tiempo real en cada POST/PUT) y `Backend/scripts/vectorizar_datos.ts:64-73` (`textoDeFila`, batch).

Eso significa que hoy se envian datos personales:

| Tabla | Lo que sale a Google |
|-------|---------------------|
| `Usuarios` | `correo`, `contrasena` (hash bcrypt), `nombre_usuario` |
| `Reservas` | `nombres`, `apellidos`, **`cedula_identidad`** |

- `contrasena` es un hash bcrypt con **salt 5** (debil) y **no deberia salir del servidor** aunque no sea reversible.
- `cedula_identidad`, correos y nombres son datos personales; el chatbot no los necesita para responder.
- **Mejora propuesta:** sustituir el "todo menos `embedding`" por una **allowlist por tabla** (solo las columnas que aportan significado semantico), excluyendo `contrasena`, `cedula_identidad`, `correo` y cualquier otra sin valor para el RAG. Alternativa mas simple si no se quiere tocar codigo: **no vectorizar `Usuarios` ni `Reservas`** (el chatbot catalogo/estaciones/talleres no las necesita).

#### C) Terminos de Google sobre el uso de los datos enviados

Segun los [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) (vigentes Mar 23 2026):

- **Unpaid / free tier:** Google **si usa** el contenido enviado para mejorar sus productos y **human reviewers pueden leer, anotar y procesar** las entradas y salidas. En la practica, tratar el free tier como "cualquier dato que no pondrias en un email".
- **Paid:** Google **no** usa los prompts (incluidos archivos, imagenes o documentos) ni las respuestas para mejorar productos; solo los loguea por tiempo limitado para detectar abuso.
- En EEA / Suiza / Reino Unido aplican los terminos de "Paid Services" **tambien al free tier**.
- Dato adicional ya correcto en el proyecto: la API key vive en `Backend/.env` y **nunca** en `Mobile/` ni `Frontend/`.

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
