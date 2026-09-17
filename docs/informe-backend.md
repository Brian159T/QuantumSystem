# Informe de Arquitectura — Backend (Node/Express + TS + PostgreSQL + pgvector)

**Alcance:** API REST `Backend/`. Este informe cubre la arquitectura completa: el flujo de una peticion HTTP, la funcion de cada archivo, el patron de modulos, la **vectorizacion (embeddings)** de principio a fin y la autenticacion.

**Stack real:** Express 5.2.1, TypeScript (ts-node/nodemon), `pg` 8.13, `jsonwebtoken`, `bcrypt` 6, `cors`, `morgan`, `dotenv`. CommonJS. Arranca con `npm run dev` = `nodemon --exec ts-node src/index.ts`. No hay tests configurados.

---

## 1. Mapa del proyecto y funcion de CADA archivo

```
Backend/
├── src/
│   ├── index.ts              ENTRADA. Crea app y hace app.listen(app.get('port')) (index.ts:4-8)
│   ├── app.ts                Express app: cors + morgan + json + urlencoded, fija puerto,
│   │                         monta las 9 rutas bajo /api/* y registra el middleware de error (:21-40)
│   ├── config.ts             Config desde variables de entorno con defaults.
│   │                         app.port=4000 · jwt.secret=JET_SECRET (typo!) · pg{host:localhost,
│   │                         user:postgres, db:QuantumSystemDB, port:5432} (:5-18)
│   │
│   ├── auth/index.ts         Utilidades JWT: asignarToken (firma, sin expiracion),
│   │                         verificarToken, chequearToken.confirmarToken, obtenerToken (Bearer)
│   │
│   ├── DB/pg.ts              CAPA DE DATOS generica. Pool de conexiones, parser de DATE como string,
│   │                         helpers de SQL seguro (identificar/lugaresDesde/sinIndefinidos),
│   │                         guard esVector (casteo ::vector) y las funciones CRUD + ejecutar
│   │
│   ├── embeddings/index.ts   SERVICIO DE VECTORIZACION compartido (Gemini + fallback hashing local). (detalle en seccion 5)
│   │
│   ├── middleware/errors.ts  Factory de errores: error(mensaje, code?) -> Error con statusCode (:5-13)
│   │
│   ├── red/
│   │   ├── respuestas.ts     Sobre JSON uniforme: success() -> {error:false,status,body} (:3-14),
│   │   │                     error() -> {error:true,status,body} (:16-27)
│   │   └── errors.ts         Middleware de error de Express: log + respuesta.error(err.statusCode||500) (:4-16)
│   │
│   └── modulos/              UN MODULO POR ENTIDAD (patron de 3-4 archivos)
│       ├── auth/         controlador.ts · index.ts · rutas.ts   (solo POST /login)
│       ├── Clientes/     CRUD sobre la tabla "Roles"            (los clientes SON roles)
│       ├── Colores/      CRUD sobre "Colores"                   (sin embedding)
│       ├── Estaciones_Carga/ CRUD (CON embedding)
│       ├── Reservas/     CRUD (CON embedding; defaults Fecha_Reserva/Estado)
│       ├── Servicios_Tecnicos/ CRUD (CON embedding)
│       ├── Usuarios/     CRUD (CON embedding + bcrypt salt 5 + seguridad.ts SIN USAR)
│       ├── Vehiculos/    CRUD (CON embedding + enriquece GET con colores N:M)
│       └── Vehiculos_Colores/ N:M Vehiculos<->Colores (rutas propias)
└── scripts/
    └── vectorizar_datos.ts   Vectorizador masivo: procesa SOLO filas con embedding IS NULL
                              de las 5 tablas con columna vectorial. (detalle en seccion 5.4)
```

### Rol de los 3 archivos de cada modulo

| Archivo | Funcion |
|---|---|
| `controlador.ts` | **Factory** `export default function (dbInyectada?: any)`. Define `todos/uno/agregar/actualizar/eliminar` usando `db.<funcion>(TABLA, ...)`. Aqui vive la logica de negocio por entidad (defaults, hasheo, vectorizacion). |
| `index.ts` | Instancia el controlador con la DB real: `const controlador = crearControlador(db); export default controlador;` |
| `rutas.ts` | Router Express. Mapea verbos/rutas a handlers `async` con `try/catch -> next(error)` y responde `respuesta.success(...)`. |

---

## 2. Flujo de una peticion HTTP de principio a fin

Ejemplo: `POST /api/vehiculos` (con vectorizacion incluida).

```
1. ENTRADA  app.ts:21-24
   cors() -> morgan('dev') -> express.json() -> express.urlencoded()

2. RUTA     app.ts:33  app.use('/api/vehiculos', vehiculos)  -> delega al Router del modulo

3. HANDLER  vehiculos/rutas.ts:55-86 (agregar)
   try { await controlador.agregar(body) ; respuesta.success(res, '...', 201) }
   catch (error) { next(error) }

4. CONTROLADOR  vehiculos/controlador.ts:98-136 (agregar)
   const vehiculo = { Velocidad_Maxima, Autonomia, Tipo, ..., Precio_USD }
   const literal = await embeddings.embeddingDeObjeto(vehiculo)   // :128  VECTORIZA
   if (literal) vehiculo.embedding = { vector: literal }          // :129
   return db.agregar(TABLA, vehiculo)                             // :131

5. CAPA DE DATOS  DB/pg.ts:81-98 (agregar)
   sinIndefinidos() filtra undefined
   INSERT INTO "Vehiculos" ("col1",...,"embedding") VALUES ($1,...,$N::vector) ON CONFLICT DO NOTHING
   // el sufijo ::vector se agrega solo si el valor pasa el guard esVector (objeto {vector:string})

6. RESPUESTA  red/respuestas.ts:9-13
   { error: false, status: 201, body: 'Vehículo agregado satisfactoriamente' }

7. ERRORES (si algo lanza)  rutas -> next(error) -> app.ts:40 -> red/errors.ts:4-16
   { error: true, status: err.statusCode || 500, body: err.message }
```

**Mismo patron en todos los modulos.** La capa de datos `DB/pg.ts` es generica:

| Funcion | Uso | SQL |
|---|---|---|
| `todos(tabla)` | :62 | `SELECT * FROM "tabla"` (todas las filas) |
| `uno(tabla, campoId, id)` | :68 | `SELECT * FROM "tabla" WHERE "campoId" = $1` |
| `agregar(tabla, data)` | :81 | `INSERT ... ON CONFLICT DO NOTHING` (omite undefined) |
| `actualizar(tabla, campoId, id, data)` | :100 | `UPDATE ... SET ... WHERE "campoId" = $1` |
| `eliminar(tabla, campoId, id)` | :127 | `DELETE ... WHERE "campoId" = $1` |
| `query(tabla, consulta)` | :138 | select por condiciones |
| `ejecutar(sql, valores)` | :163 | SQL libre; convierte `?` -> `$n` y `??` -> identificador entrecomillado (herencia MySQL) |

---

## 3. Patron: CRUD generico con inyeccion de DB

```ts
const TABLA   = 'Roles';      // controlador.ts:3  (constante en MAYUSCULAS)
const CAMPO_ID = 'id_rol';    // controlador.ts:4

export default function (dbInyectada?: any) {   // :11  factory
    const db = dbInyectada || dbPg;             // :13  inyeccion con fallback a la DB real
    ...
    return { todos, uno, eliminar, agregar, actualizar };
}
```

**Como crear un modulo nuevo** (decision 1 de arquitectura):
1. Duplicar una carpeta de modulo existente.
2. Cambiar `TABLA`, `CAMPO_ID` y la interfaz/mapeo de `body` en `agregar`/`actualizar`.
3. Montarlo en `src/app.ts`: `app.use('/api/<entidad>', nuevoModulo)`.
4. (Opcional) Si la tabla tiene columna `embedding`, anadir las 3 lineas de vectorizacion (seccion 5.2).

---

## 4. Endpoints por modulo (todos bajo `/api`, montados en app.ts:30-38)

| Modulo | Rutas | Destacado |
|---|---|---|
| **auth** | `POST /login` | Unico endpoint. JOIN Usuarios+Roles, `bcrypt.compare`, devuelve `{token, usuario}`. **No existe `/api/auth/registro`.** |
| **clientes** | CRUD `GET/POST/PUT/DELETE /[/:id]` | CRUD puro sobre la tabla **`Roles`** |
| **usuarios** | CRUD | POST/PUT hashean contrasena (bcrypt salt 5) y vectorizan. `seguridad.ts` esta importado pero **nunca se ejecuta** |
| **vehiculos** | CRUD | GET enriquece con array `colores` (N:M) usando un solo query global + Map (:39-86); POST/PUT persisten `Precio_USD` y vectorizan |
| **servicios-tecnicos** | CRUD | Vectoriza |
| **estaciones-carga** | CRUD | Vectoriza |
| **colores** | CRUD | Sin embedding |
| **reservas** | CRUD | POST aplica defaults `Fecha_Reserva`=hoy y `Estado`='Pendiente' (:34-37); vectoriza |
| **vehiculos-colores** | `GET /`, `GET /vehiculo/:id`, `GET /color/:id`, `POST /`, `DELETE /:idVehiculo/color/:idColor` | N:M con rutas propias; usa `db.ejecutar` con `?`->`$n` |

**Tablas con embedding (POST/PUT vectorizan):** Usuarios, Vehiculos, Servicios_Tecnicos, Estaciones_Carga, Reservas.
**Sin embedding:** Roles (clientes), Colores, Vehiculos_Colores.

---

## 5. LA VECTORIZACION completa

### 5.1 `src/embeddings/index.ts` — servicio compartido

| Funcion | Linea | Que hace |
|---|---|---|
| `DIM = 768` | :15 | Dimension del vector (coincide con `outputDimensionality` enviado a Gemini) |
| `API_KEY` | :16-17 | `API_KEY_GOOGLE_AI_STUDIO \|\| GEMINI_API_KEY` (del `.env` del Backend) |
| `MODELO` | :18 | `GEMINI_EMBEDDING_MODEL \|\| 'gemini-embedding-001'` |
| `MAX_CHARS = 8000` | :19 | Trunca el texto antes de vectorizar |
| `textoDeObjeto(objeto)` | :23-35 | Convierte un objeto en texto `"columna:valor columna:valor ..."`. Excluye `embedding`, omite null/undefined/object. Une con espacio simple |
| `textoDeActualizacion(actual, cambios)` | :39-48 | Mezcla la fila actual de BD con los cambios del PUT (ignora claves undefined) -> texto de la fila "efectiva" post-update |
| `embeddingGemini(texto)` | :51-71 | `fetch` a `.../models/{MODELO}:embedContent?key=API_KEY` con `POST` y `outputDimensionality:768`. Devuelve literal `[0.123456,...]` (6 decimales) |
| `vectorHashing(texto)` | :74-97 | **Fallback local deterministico sin IA**: tokeniza, sha1 por token, indice %768 + signo, normaliza L2 |
| `vectorizar(texto)` | :101-111 | Entrada: null si no hay texto; trunca a 8000; **elige Gemini si hay key, si no hashing**; excepcion -> log + null (no rompe el POST/PUT) |
| `embeddingDeObjeto(objeto)` | :114-116 | `vectorizar(textoDeObjeto(objeto))` (alta) |
| `embeddingDeActualizacion(actual,cambios)` | :119-124 | `vectorizar(textoDeActualizacion(...))` (update) |

### 5.2 Como conecta con los controllers (POST/PUT de los 5 modulos)

En cada `agregar` (alta):
```ts
const literal = await embeddings.embeddingDeObjeto(objeto);     // ej. Usuarios:71
if (literal) objeto.embedding = { vector: literal };            // ej. Usuarios:72
return db.agregar(TABLA, objeto);                               // ej. Usuarios:74
```

En cada `actualizar`:
```ts
const actual = (await db.uno(TABLA, CAMPO_ID, id)) || {};              // ej. Usuarios:105-109
const literal = await embeddings.embeddingDeActualizacion(actual, cambios); // :110
if (literal) cambios.embedding = { vector: literal };                 // :111
return db.actualizar(TABLA, CAMPO_ID, id, cambios);                   // :113-118
```

Ubicaciones exactas:
- `Usuarios/controlador.ts:71-72` (POST) y `:110-111` (PUT)
- `Vehiculos/controlador.ts:128-129` y `:174-175`
- `Servicios_Tecnicos/controlador.ts:75-76` y `:111-112`
- `Estaciones_Carga/controlador.ts:75-76` y `:111-112`
- `Reservas/controlador.ts:44-45` y `:60-61`

### 5.3 El campo `{ vector }` y el casteo `::vector` en `DB/pg.ts`

- `esVector(valor)` (`pg.ts:54-60`): un valor es "vector" si es objeto no-nulo con propiedad `vector` de tipo string. Es el wrapper que produce `embeddings.embeddingDeObjeto` al asignar `objeto.embedding = { vector: literal }`.
- INSERT (`agregar`, `pg.ts:90`): `VALUES ($1,...,$N::vector)` — se agrega `::vector` solo si el valor pasa `esVector`; el valor enviado es `data[clave].vector` (el string literal).
- UPDATE (`actualizar`, `pg.ts:112-122`): lo mismo, `"embedding" = $N::vector`.
- El literal llega a pgvector en formato `[0.123456,0.654321,...]` (768 numeros, 6 decimales) y PostgreSQL lo castea al tipo `vector(768)`.

**Diagrama de la vectorizacion:**

```
POST/PUT (5 modulos)
   │  objeto = {columnas de la fila}
   ▼
embeddings.embeddingDeObjeto / embeddingDeActualizacion
   │  texto = "columna:valor columna:valor ..."  (textoDeObjeto, MAX 8000 chars)
   ▼
vectorizar(texto)
   ├─ API_KEY?  ->  Gemini embedContent (modelo gemini-embedding-001, outputDimensionality 768)
   └─ sin key   ->  vectorHashing (sha1, deterministico)
   ▼
"[0.123456,0.654321,...]"   (literal string)
   ▼
objeto.embedding = { vector: literal }
   ▼
DB/pg.ts  esVector -> valores: "embedding" = $N::vector   (INSERT/UPDATE)
   ▼
QuantumSystemDB  columna "embedding" vector(768)
```

### 5.4 `scripts/vectorizar_datos.ts` — vectorizador masivo (respaldo/reproceso)

- Procesa **solo filas con `embedding IS NULL`** (`SELECT ... WHERE "embedding" IS NULL`, :153-155): es idempotente y reejecutable tras cada alta.
- Tablas objetivo (:56-62): Usuarios (`id_usuario`), Vehiculos (`id_vehiculo`), Reservas (`id_reserva`), Servicios_Tecnicos (`id_servicio`), Estaciones_Carga (`id_estacion`).
- Por tabla: consulta `information_schema.columns` (excluye `embedding`), selecciona filas NULL, y dentro de `BEGIN`/`COMMIT` arma el texto, trunca a 8000, llama a Gemini/hashing, y `UPDATE SET "embedding" = $1::vector WHERE "pk" = $2`.
- Delay de 120 ms entre llamadas si usa API key (free tier).
- Uso: `cd Backend/scripts && set PGPASSWORD=... && npx ts-node vectorizar_datos.ts`.
- Duplica la logica de `src/embeddings/index.ts` (por diseno, para poder correr sin el resto del backend).

> **Ojo**: el backend **ya vectoriza en tiempo real** en cada POST/PUT (desde `src/embeddings/`). El script queda como respaldo para filas que quedaron en NULL (p. ej. datos cargados antes de implementar la vectorizacion automatica).

---

## 6. Autenticacion

- `src/auth/index.ts`: firma JWT **sin expiracion** (`jwt.sign(data, secret)`, :8-10) usando `config.jwt.secret` (= `JET_SECRET` del `.env`, con fallback `'notasecreta!'`). `verificarToken` (:12-14); `chequearToken.confirmarToken(req, id?)` (:16-29) valida que el id del token == id pedido, si no lanza 401.
- **Login** (`modulos/auth/controlador.ts:17-81`): `SELECT` con JOIN `Usuarios` + `Roles` por correo (:22-34); si no existe o `bcrypt.compare` falla -> `'Correo o contraseña incorrectos'` (:38-51); firma token con payload `{id_usuario, nombre_usuario, correo, id_rol, rol}` (:53-59); devuelve `{token, usuario}`.
- **Registro**: el backend **no define** la ruta `/api/auth/registro` (solo existe `POST /auth/login`). El frontend web lo resuelve con `POST /usuarios` + `POST /auth/login`.
- **bcrypt salt 5**: `Usuarios/controlador.ts:62-65` (POST) y `:96-103` (PUT, solo si llega contrasena).

---

## 7. Configuracion y detalles clave

- **Puerto HTTP**: 4000 (`config.ts:5`, `index.ts:4-8`). **Puerto PostgreSQL**: 5432 (`config.ts:17`).
- **Typo `JET_SECRET`**: `config.ts:8` lee `JET_SECRET` (no `JWT_SECRET`). El `.env` real no define ninguna, se usa el default.
- **`.env` real contiene**: `PORT, PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT, API_KEY_GOOGLE_AI_STUDIO`.
- **Sobre de respuesta uniforme** en `red/respuestas.ts`: success `{error:false,status,body}` y error `{error:true,status,body}`; lo consume el ApiClient del frontend.
- **DATE como string**: `pg.ts:21` `types.setTypeParser(1082, v => v)` para no romper los frontends.
- **`ON CONFLICT DO NOTHING`**: los INSERT con PK duplicada se ignoran silenciosamente (`pg.ts:95`).
- **`ejecutar`**: hereda el estilo MySQL (`?` -> `$n`, `??` -> identificador entrecomillado); usado por auth, Vehiculos y Vehiculos_Colores.
- **Logs de debug** hardcodeados en `Vehiculos/rutas.ts` y `Vehiculos_Colores/rutas.ts`.
- **`middleware/errors.ts`**: factory para lanzar errores con `statusCode` (p. ej. 401 en auth).
- **`nodemon`** reinicia en dev; ts-node ejecuta TS directo (no hay build previo); `tsconfig.json` tiene `rootDir ./src` (scripts/ queda fuera del build).

---

## 8. Indice de citas clave (archivo:linea)

| Tema | Ubicacion |
|---|---|
| Entrada del servidor | `src/index.ts:4-8` |
| Middlewares + montaje de rutas | `src/app.ts:21-40` |
| Config defaults + typo JET_SECRET | `src/config.ts:5-18` |
| Pool / DATE parser / helpers | `src/DB/pg.ts:17,21,27-50` |
| Guard esVector + casteo ::vector | `src/DB/pg.ts:54-60,90,115` |
| CRUD generico + ejecutar | `src/DB/pg.ts:62-158` y `163-206` |
| Servicio de embeddings | `src/embeddings/index.ts:15-132` |
| Controllers con embedding (POST/PUT) | `Usuarios:71-72,110-111` · `Vehiculos:128-129,174-175` · `Servicios_Tecnicos:75-76,111-112` · `Estaciones_Carga:75-76,111-112` · `Reservas:44-45,60-61` |
| Vehiculos con colores (N:M) | `Vehiculos/controlador.ts:39-86` |
| Defaults de Reservas | `Reservas/controlador.ts:34-37` |
| N:M Vehiculos_Colores | `Vehiculos_Colores/controlador.ts:13-58` |
| JWT | `src/auth/index.ts:6-60` |
| Login (JOIN + bcrypt.compare) | `modulos/auth/controlador.ts:17-81` |
| Solo POST /login | `modulos/auth/rutas.ts:7` |
| Sobre de respuesta | `src/red/respuestas.ts:3-32` |
| Error middleware + factory | `src/red/errors.ts:4-16` · `src/middleware/errors.ts:5-13` |
| Script vectorizador | `scripts/vectorizar_datos.ts:48-202` |

---

**Resumen:** Express 5 con arquitectura de modulos por entidad (factory con inyeccion de DB), capa de datos generica con soporte `::vector`, respuesta uniforme `{error,status,body}`, JWT sin expiracion, y **vectorizacion automatica en POST/PUT** de las 5 tablas con columna `embedding` (Gemini o fallback local), con script de respaldo incremental para filas NULL.