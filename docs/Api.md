# API - Quantum (Backend)

Documentacion de los **endpoints REST** disponibles en el backend. Todos responden con el sobre uniforme:

```json
{ "error": bool, "status": int, "body": <payload o mensaje> }
```

- `error: false` → exito. `error: true` → error (mensaje en `body`).
- **Base URL** (backend): `http://<host>:4000/api`
  - Mobile: URL detectada automaticamente (`API_URL`, ver `Mobile/src/Config/api.ts`).
  - Web: via proxy Vite `/api` → `http://localhost:4000` (o `VITE_API_URL`).

---

## Resumen de rutas

| Metodo | Ruta | Modulo | Accion |
|--------|------|--------|--------|
| POST | `/api/auth/login` | auth | Iniciar sesion |
| GET | `/api/clientes` | Clientes | Listar (tabla `Roles`) |
| POST | `/api/clientes` | Clientes | Crear (tabla `Roles`) |
| GET | `/api/clientes/:id` | Clientes | Obtener uno (tabla `Roles`) |
| PUT | `/api/clientes/:id` | Clientes | Actualizar (tabla `Roles`) |
| DELETE | `/api/clientes/:id` | Clientes | Eliminar (tabla `Roles`) |
| GET | `/api/colores` | Colores | Listar colores |
| POST | `/api/colores` | Colores | Crear color |
| GET | `/api/colores/:id` | Colores | Obtener color |
| PUT | `/api/colores/:id` | Colores | Actualizar color |
| DELETE | `/api/colores/:id` | Colores | Eliminar color |
| GET | `/api/reservas` | Reservas | Listar reservas |
| POST | `/api/reservas` | Reservas | Crear reserva |
| GET | `/api/reservas/:id` | Reservas | Obtener reserva |
| PUT | `/api/reservas/:id` | Reservas | Actualizar reserva |
| DELETE | `/api/reservas/:id` | Reservas | Eliminar reserva |
| GET | `/api/vehiculos-colores` | Vehiculos_Colores | Listar relaciones N:M |
| GET | `/api/vehiculos-colores/vehiculo/:id` | Vehiculos_Colores | Colores de un vehiculo |
| GET | `/api/vehiculos-colores/color/:id` | Vehiculos_Colores | Vehiculos de un color |
| POST | `/api/vehiculos-colores` | Vehiculos_Colores | Crear relacion (N:M) |
| DELETE | `/api/vehiculos-colores/:idVehiculo/color/:idColor` | Vehiculos_Colores | Eliminar relacion |
| GET | `/api/usuarios` | Usuarios | Listar usuarios |
| POST | `/api/usuarios` | Usuarios | Crear usuario |
| GET | `/api/usuarios/:id` | Usuarios | Obtener usuario |
| PUT | `/api/usuarios/:id` | Usuarios | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Usuarios | Eliminar usuario |
| GET | `/api/vehiculos` | Vehiculos | Listar vehiculos |
| POST | `/api/vehiculos` | Vehiculos | Crear vehiculo |
| GET | `/api/vehiculos/:id` | Vehiculos | Obtener vehiculo |
| PUT | `/api/vehiculos/:id` | Vehiculos | Actualizar vehiculo |
| DELETE | `/api/vehiculos/:id` | Vehiculos | Eliminar vehiculo |
| GET | `/api/estaciones-carga` | Estaciones_Carga | Listar estaciones |
| POST | `/api/estaciones-carga` | Estaciones_Carga | Crear estacion |
| GET | `/api/estaciones-carga/:id` | Estaciones_Carga | Obtener estacion |
| PUT | `/api/estaciones-carga/:id` | Estaciones_Carga | Actualizar estacion |
| DELETE | `/api/estaciones-carga/:id` | Estaciones_Carga | Eliminar estacion |
| GET | `/api/servicios-tecnicos` | Servicios_Tecnicos | Listar talleres |
| POST | `/api/servicios-tecnicos` | Servicios_Tecnicos | Crear taller |
| GET | `/api/servicios-tecnicos/:id` | Servicios_Tecnicos | Obtener taller |
| PUT | `/api/servicios-tecnicos/:id` | Servicios_Tecnicos | Actualizar taller |
| DELETE | `/api/servicios-tecnicos/:id` | Servicios_Tecnicos | Eliminar taller |

> **No existen** endpoints para: `Usuarios_Reservas`, `Usuarios_Vehiculos` (tablas sin CRUD en backend). Tampoco existe `POST /api/auth/registro` (aunque los frontends lo consumen).

---

## Autenticacion

### POST `/api/auth/login`

Inicia sesion. Busca por correo, valida contrasena y devuelve token JWT + datos del usuario (incluye el rol via JOIN con `Roles`).

**Body:**
```json
{ "correo": "string", "contrasena": "string" }
```

**Respuesta (200):**
```json
{
  "error": false,
  "status": 200,
  "body": {
    "token": "eyJhbGciOi...",
    "usuario": {
      "id_usuario": 1,
      "nombre_usuario": "Juan",
      "correo": "juan@mail.com",
      "id_rol": 2,
      "rol": "Cliente"
    }
  }
}
```

**Errores (401/500):**
- `body`: `"Correo o contraseña incorrectos"` si el correo no existe o la contrasena no coincide.

> **Nota**: el frontend movil llama a `POST /api/auth/registro`, pero **el backend no define esa ruta**. El frontend web resuelve el registro llamando `POST /api/usuarios` (rol cliente) + `POST /api/auth/login`.

---

## CRUD generico

El resto de modulos siguen la misma convencion CRUD. Se listan a continuacion con sus campos.

### `/api/usuarios`

- **GET `/api/usuarios`** → lista de todos los usuarios (body: array).
- **GET `/api/usuarios/:id`** → un usuario (body: objeto o `undefined` si no existe).
- **POST `/api/usuarios`** → crea. Body:
  ```json
  { "nombre_usuario": "str", "correo": "str", "contrasena": "str", "id_rol": 2 }
  ```
  La contrasena se hashea con bcrypt (salt 5) antes de guardar. Respuesta 201 con mensaje.
- **PUT `/api/usuarios/:id`** → actualiza. Body (los campos que se quieran cambiar):
  ```json
  { "nombre_usuario": "str", "correo": "str", "contrasena": "str(opcional)", "id_rol": 2 }
  ```
  Si `contrasena` viene, se re-hashea. Respuesta 200.
- **DELETE `/api/usuarios/:id`** → elimina. Respuesta 200.

### `/api/vehiculos`

Campos (tabla `Vehiculos`): `Velocidad_Maxima`, `Autonomia`, `Tipo`, `Carga_Rapida`, `Nombre_Modelo`, `Capacidad_Bateria`, `Tiempo_Carga_Normal`, `Traccion`, `Nro_Asientos` (todos string), `id_color` (number) y `Precio_USD` (DECIMAL).

- GET `/api/vehiculos` / GET `/api/vehiculos/:id` — **cada vehiculo incluye un array `colores`** con los colores de la tabla N:M `Vehiculos_Colores` (JOIN con `Colores` → `{id_color, Color}`). Si el vehiculo no tiene relaciones, `colores` es `[]`.
- POST `/api/vehiculos` (201) / PUT `/api/vehiculos/:id` (200) / DELETE `/api/vehiculos/:id` (200) — POST/PUT **persisten `Precio_USD`** (corregido).
- Los handlers de Vehiculos imprimen `console.log` de debug (headers/body/id).

### `/api/vehiculos-colores`

Relaciones N:M entre la tabla `Vehiculos` y la tabla `Colores` (modulo `Vehiculos_Colores`). Tabla: `Vehiculos_Colores` (PK compuesta `id_vehiculo` + `id_color`).

- **GET `/api/vehiculos-colores`** → lista todas las relaciones:
  ```json
  { "id_vehiculo": 8, "id_color": 4 }
  ```
- **GET `/api/vehiculos-colores/vehiculo/:idVehiculo`** → colores de un vehiculo (JOIN con `Colores`):
  ```json
  [ { "id_color": 4, "Color": "Rojo" }, { "id_color": 5, "Color": "Azul" } ]
  ```
- **GET `/api/vehiculos-colores/color/:idColor`** → vehiculos que tienen un color (JOIN con `Vehiculos`):
  ```json
  [ { "id_vehiculo": 8, "Nombre_Modelo": "TROOPER" } ]
  ```
- **POST `/api/vehiculos-colores`** (201) — body `{ "id_vehiculo": 8, "id_color": 1 }` (upsert, sin duplicados). Respuesta: mensaje.
- **DELETE `/api/vehiculos-colores/:idVehiculo/color/:idColor`** (200) — elimina el par exacto. Respuesta: mensaje.

### `/api/estaciones-carga`

Campos: `direccion`, `latitud` (number), `longitud` (number), `horarios`, `telefono` (opcional), `Estado`.

- GET `/api/estaciones-carga` / GET `:id` / POST (201) / PUT `:id` (200) / DELETE `:id` (200)

### `/api/servicios-tecnicos`

Campos (identicos a estaciones): `direccion`, `latitud`, `longitud`, `horarios`, `telefono` (opcional), `Estado`.

- GET `/api/servicios-tecnicos` / GET `:id` / POST (201) / PUT `:id` (200) / DELETE `:id` (200)

### `/api/colores`

Campos: `id_color`, `Color` (string). Tabla `Colores`.

- GET `/api/colores` / GET `:id` / POST (201) / PUT `:id` (200) / DELETE `:id` (200)

### `/api/reservas`

Campos de la tabla `Reservas`: `Fecha_Reserva` (date), `Estado`, `nombres`, `apellidos`, `cedula_identidad`, `modelo` (string), `color` (number, FK → `Colores.id_color`).

- GET `/api/reservas` / GET `:id` / POST (201) / PUT `:id` (200) / DELETE `:id` (200)
- **POST** body:
  ```json
  {
    "nombres": "str",
    "apellidos": "str",
    "cedula_identidad": "str",
    "modelo": "str",
    "color": 3
  }
  ```
  Si no se envian `Fecha_Reserva` ni `Estado`, se usan por defecto la **fecha de hoy** y **"Pendiente"**.

### `/api/clientes`

- GET `/api/clientes` / GET `/api/clientes/:id` / POST `/api/clientes` / PUT `/api/clientes/:id` / DELETE `/api/clientes/:id`
- **Opera sobre la tabla `Roles`** (`id_rol`, `Nombre`). Es el CRUD heredado con ese nombre; los frontends no lo consumen.

---

## Manejo de errores (backend)

- Los handlers usan `try/catch` y delegan con `next(error)`.
- `middleware/errors.ts` crea el error con `statusCode` opcional.
- `red/errors.ts` (global) responde: `{ error: true, status: <statusCode||500>, body: <message> }`.

**Errores tipicos:**
- `500` "Error interno" si el mensaje no viene.
- `401` con `"No viene token"` / `"Formato inválido"` si se intenta autorizar (via `auth.chequearToken`) — aunque hoy las rutas no exigen token.

---

## Consumo desde los frontends

### Mobile (`Mobile/src/Model/`)
- `AuthService.login` → `POST /auth/login`, devuelve `response.data.body`.
- `AuthService.registro` → `POST /auth/registro` (endpoint inexistente en backend).
- `EstacionesService.obtenerEstaciones` → `GET /estaciones-carga`, devuelve `response.data.body`.
- `TalleresService.obtenerTalleres` → `GET /servicios-tecnicos`, devuelve `response.data.body`.
- `ColoresService.obtenerColores` → `GET /colores`, devuelve `response.data.body`.
- `VehiculosService.obtenerVehiculos` → `GET /vehiculos`, devuelve `response.data.body`.
- `ReservasService.crearReserva` → `POST /reservas`, guarda la reserva del invitado.

### Web (`Frontend/src/services/apiClient.ts`)
- `peticion(ruta, opciones)` usa `fetch`, parse el sobre `{error, status, body}` y devuelve `body`; lanza `Error` si `error === true`.
- Llamadas (via `services/*Service.ts`): `/auth/login`, `/usuarios` (POST para registrar), `/vehiculos`, `/estaciones-carga`, `/servicios-tecnicos`, `/colores` y `POST /reservas` (crear reserva). En caso de fallo o array vacio, los services web **caen a mocks locales**.
