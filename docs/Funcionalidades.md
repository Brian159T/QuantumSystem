# Funcionalidades - Quantum / Voltus

Catalogo de funcionalidades de la app por **rol de usuario**, en la **app movil** (`Mobile/`) y el **frontend web** (`Frontend/`).

Los roles se determinan por `Roles.Nombre` (string) y se reflejan en los flags de `useAuth()`: `esInvitado`, `esCliente`, `esAdministrador`.

> **Estado general**: La gran mayoria de pantallas usan **datos mock hardcodeados**. Solo login/registro, y (en el movil) las pantallas de Estaciones, Talleres, Vehiculos y Reservas consumen la **API real**. Detalle por pantalla al final.
>
> **Cambios sept 2026 (frontend web)**: se elimino el **fallback a mocks** de los services (si la API falla o devuelve lista vacia, la UI muestra **listas vacias**, nunca datos falsos); el CRUD de usuarios del admin ahora **crea/elimina via `/usuarios`** y envia el **token JWT** en todas las peticiones. El codigo de confirmacion de reserva sigue generado en el cliente (pendiente de campo en BD).
>
> **▶ Trabajo pendiente (a realizar durante los proximos dias)**: ver la **seccion 6 "Pendientes funcionales (tablero de kanban)"** al final de este archivo. Incluye la mejora de CSS del frontend web y mobile.

---

## Roles y acceso

| Rol | Flags | Descripcion |
|-----|-------|-------------|
| **Invitado** (sin login) | `esInvitado` | Usuario sin cuenta; ve catalogo, vehiculos y reservas |
| **Cliente** / usuario con vehiculo electrico | `esCliente` | Usuario logueado con rol Cliente: carga, talleres, emergencias |
| **Administrador** | `esAdministrador` | Usuario logueado con rol Administrador: panel y gestion de usuarios |

---

## 1. Funcionalidades del INVITADO

### 1.1 Inicio (Movil: `InicioScreen.tsx` / Web: `PaginaInicio.tsx`)
- Hero de bienvenida con la marca Voltus.
- Estadisticas rapidas.
- **Catalogo** de modelos destacados (movil: `CAR_MODELS` mock; web: desde la API con fallback a mock).
- **Planes de pago flexibles**.
- **Banner de test drive**.
- Boton para ver los vehiculos (web: `alVerVehiculos`).

### 1.2 Catalogo de Vehiculos (Movil: `VehiculosScreen.tsx` / Web: `PaginaVehiculos.tsx`)
- **Integrado con la API real** (movil: `VehiculosService.obtenerVehiculos` + `ColoresService.obtenerColores`).
- Listado del catalogo con datos de la tabla `Vehiculos` (nombre, tipo, autonomia, carga rapida, precio `Precio_USD`).
- **Espacio reservado para la foto** de cada modelo (placeholder con icono; las imagenes se agregaran despues; la tabla no tiene columna de imagen aun).
- **Vista de detalle** (web) por modelo: selector de **colores** con la paleta del API; se muestran **solo los colores realmente disponibles** de ese modelo (los de la N:M `Vehiculos_Colores`). En el movil, si el array `colores` viene vacio cae al `id_color`. Ademas la **ficha tecnica** (autonomia, bateria, velocidad maxima, carga, asientos, traccion).
- Sombras/colores con opacidad calculados en JS.
- Web: boton para **reservar** un vehiculo (pasa el vehiculo a la pantalla de reservas).

### 1.3 Reservas (Movil: `ReservasScreen.tsx` / Web: `PaginaReservas.tsx`)
- Seleccion de **modelo** (desde la API `GET /vehiculos`, muestra precio) y **color** (colores **desde la API** `GET /colores`), con form de **datos personales** (nombres, apellidos, cedula). En el web, al reservar se muestran **solo los colores disponibles de cada modelo** (sin paleta generica); si el modelo no tiene colores, se indica "Este modelo aún no tiene colores disponibles".
- **Validacion de campos** con errores por campo (nombres/apellidos ≥2 caracteres, cedula 6-10 digitos, modelo y color requeridos).
- **Modal de confirmacion** de reserva con:
  - Datos del cliente y del vehiculo (modelo, color).
  - Boton **"Confirmar reserva"** en el web (el movil usa **"EFECTUAR PAGO Y CONFIRMAR"**).
- Al confirmar **guarda la reserva en la API** (`POST /reservas`) con nombres, apellidos, cedula, modelo y color (FK). Genera **codigo de confirmacion**.
- En el web la reserva es **sin costo** (se quito el pago inicial de 1000 USD); el movil aun simula el pago.
- Movil: es un **class component** (unico en el proyecto).
- **No hay QR**: el pago se simula directamente con el boton de confirmar.

---

## 2. Funcionalidades del CLIENTE (usuario con vehiculo electrico)

### 2.1 Inicio del Cliente (Movil: `InicioScreen_usuario_vehiculo.tsx` / Web: `PaginaInicioCliente.tsx`)
- **Panel del vehiculo propio** con **anillo de bateria** (colores segun nivel: verde ≥50%, naranja ≥20%, rojo <20%).
- **Acciones rapidas**.
- **Carrusel de estaciones cercanas** (mock `NEARBY_STATIONS`), con tarjetas que marcan estaciones llenas (`available === 0`).
- **Historial de cargas** (mock `HISTORY`).
- Web: ademas banner de ruta inteligente.

### 2.2 Estaciones de Carga (Movil: `EstacionesScreen_usuario_vehiculo.tsx` / Web: `PaginaEstaciones.tsx`)
- **Integrado con la API real** (`EstacionesService.obtenerEstaciones`).
- **Ubicacion del usuario** (expo-location).
- **Mapa** con las estaciones (react-native-maps en movil; mapa placeholder en web).
- **Buscador** y **filtros por tipo de conector** (CCS, CHAdeMO, Tipo 2, Tesla).
- Toggle de **solo disponibles/abiertas** y **estadisticas** (total, activas).
- Tarjetas de servicio con disponibilidad, precio, rating, conectores, 24 horas.

### 2.3 Talleres Autorizados (Movil: `TalleresScreen_usuario_vehiculo.tsx` / Web: `PaginaTalleres.tsx`)
- **Integrado con la API real** (`TalleresService.obtenerTalleres` + `useTalleresViewModel`).
- **Ubicacion del usuario** (permiso + coordenadas).
- **Mapa** con talleres; se resalta el **taller mas cercano** (calculo Haversine) y el **taller seleccionado para ruta**.
- **Buscador** por direccion y toggle **"solo abiertos/disponibles"** (`Estado === 'disponible'`).
- **Estadisticas**: total, disponibles, con telefono.
- Tarjetas con estado abierto/cerrado, tiempo de espera, especialidades, rating.

### 2.4 Emergencias (Movil: `EmergenciasScreen_usuario_vehiculo.tsx` / Web: `PaginaEmergencias.tsx`)
- **Boton SOS** con animacion de pulso.
- **Tarjeta de servicio de salud**.
- **Contactos de emergencia**.
- **Consejo de seguridad**.

---

## 3. Funcionalidades del ADMINISTRADOR

### 3.1 Panel / Inicio del Administrador (Movil: `Interfaz_Administrador_Inicio.tsx` / Web: `PaginaPanel.tsx`)
- **Banner de bienvenida**.
- **Estadisticas** (totales reales desde la API: vehiculos, estaciones, usuarios).
- **Gestion de contenido** en tarjetas con conteos reales (vehiculos, estaciones, usuarios y talleres via `/servicios-tecnicos`).
- Se quitaron los valores hardcodeados ("Ingresos", "Actividad reciente") y el conteo fijo de talleres (sept 2026).

### 3.2 Gestion de Usuarios (Movil: `Interfaz_Administrador_usuarios.tsx` / Web: `PaginaUsuarios.tsx`)
- **Web (sept/oct 2026)**: lista real desde `GET /usuarios` (sin campos inventados; el rol se deriva de `id_rol`), **crear** usuario via `POST /usuarios` (nombre, correo, contrasena y rol elegido en un **combobox cargado desde `GET /clientes`**, la tabla `Roles`, para que el administrador escoja el rol) y **eliminar** via `DELETE /usuarios/:id`, ambos con refresco de la lista tras la operacion. **Buscar** por nombre/correo y **filtrar por rol**.
- **Suspender/reactivar se quitaron** en el web: la tabla `Usuarios` no tiene campo de estado para persistirlo (no se debe simular).
- Movil: sigue siendo CRUD **mock** (`INITIAL_USERS`).

---

## 4. Estado de integracion con la API (por pantalla)

### App movil (`Mobile/`)

| Pantalla | Uso de API |
|----------|-----------|
| Inicio `InicioScreen.tsx` | Mock (`CAR_MODELS`) |
| `VehiculosScreen.tsx` | **Real API** (GET /vehiculos + GET /colores) |
| `ReservasScreen.tsx` | **Real API** (POST /reservas, GET /colores, GET /vehiculos) |
| `InicioScreen_usuario_vehiculo.tsx` | Mock (`VEHICLE`, `NEARBY_STATIONS`, `HISTORY`) |
| `EstacionesScreen_usuario_vehiculo.tsx` | **Real API** + ubicacion |
| `TalleresScreen_usuario_vehiculo.tsx` | **Real API** + ubicacion |
| `EmergenciasScreen_usuario_vehiculo.tsx` | Mock |
| `Interfaz_Administrador_Inicio.tsx` | Mock (`OVERVIEW`, `MANAGEMENT_SECTIONS`, `RECENT_ACTIVITY`) |
| `Interfaz_Administrador_usuarios.tsx` | Mock (`INITIAL_USERS`) |
| Login (`AuthService`) | **Real API** (`POST /auth/login`) |
| Registro (`AuthService`) | **Roto**: la ruta `POST /auth/registro` **ya existe** en el backend, pero el movil envia `{correo, contrasena}` sin `nombre_usuario`, asi que responde `400` (campos obligatorios) |

### Frontend web (`Frontend/`)

> **Sept 2026**: los services ya **no caen a mocks**; si la API falla o devuelve lista vacia, se muestra una lista vacia (la UI no inventa datos).

| Pagina | Uso de API |
|--------|-----------|
| `PaginaInicio.tsx` | API `/vehiculos` (si falla, carrera vacia) |
| `PaginaVehiculos.tsx` | Via `useVehiculos()` / `vehiculosService` |
| `PaginaReservas.tsx` | **Real API** (POST /reservas, GET /vehiculos, GET /colores) |
| `PaginaInicioCliente.tsx` | Mock |
| `PaginaEstaciones.tsx` | API `/estaciones-carga` (sin campos inventados; guardas para valores ausentes) |
| `PaginaTalleres.tsx` | API `/servicios-tecnicos` (estado abierto/cerrado derivado de `Estado`) |
| `PaginaEmergencias.tsx` | Mock |
| `PaginaPanel.tsx` | API (conteos reales; sin valores hardcodeados) |
| `PaginaUsuarios.tsx` | **Real API** (GET/POST/DELETE `/usuarios`) |
| Login / Registro (`authService`) | **Real API** (login via `POST /auth/login`; registro via `POST /auth/registro`, que crea el usuario **siempre con rol Cliente**) |

---

## 5. Funcionalidades transversales

- **Autenticacion** (login/registro) con JWT; estado en contexto (`useAuth`).
- **Logout** (vuelve a flujo de invitado).
- **Saludo** con iniciales y rol del usuario logueado.
- **Navegacion por tabs/rol** (movil: react-navigation; web: navegacion por estado).
- **Geolocalizacion** (movil): permisos, coordenadas, distancia Haversine. Usado en Estaciones y Talleres.
- **Chatbot (web)**: FAB flotante "Asistente Quantum" presente en **todas las interfaces y roles** (se monta una vez en `AppNavigator.tsx`, componente `components/Chatbot.tsx`). Igual que en el movil, es **solo visual**: saludo inicial, burbujas y hora de envio, sin respuestas del asistente ni conexion a API (el RAG con Gemini sigue pendiente, ver `docs/Decisiones-tecnicas.md`).

### Aspecto visual del rol invitado (web, sept 2026)

Ajustes de estilo de la pagina de invitado (sin cambiar logica): el fondo de pagina paso de blanco a un **gris medio** (y el navbar se oscurecio); los textos/titulos destacados, iconos de estadisticas y enlaces se muestran en **negro**; el footer tiene **fondo negro con letras blancas**; los banners "Reserva ahora" y "Experiencia real / Test Drive" son **negros a todo el ancho** (pegados al navbar arriba y al footer abajo); el catalogo de modelos destacados va sobre una **franja gris** a todo el ancho. Estos ajustes se concentran en `Frontend/src/styles/paginas.css`, `temas.css` y `componentes.css`.

---

## 6. Pendientes funcionales (tablero de kanban)

> **Estado: TRABAJO PENDIENTE (a realizar durante los proximos dias).** Lista de funcionalidades que aun **no funcionan** (mock, roto o inexistente) en cada plataforma, organizada para el tablero. Al terminar una tarea, moverla aqui como **Hecho** y actualizar la tabla de la seccion 4.

### 6.1 App movil (`Mobile/`)

| # | Pantalla / area | Pendiente | Tipo |
|---|-----------------|-----------|------|
| M1 | Inicio (invitado) `InicioScreen.tsx` | Catalogo hardcodeado (`CAR_MODELS`) → consumir `GET /vehiculos` | Mock → API |
| M2 | Inicio cliente `InicioScreen_usuario_vehiculo.tsx` | Vehiculo propio, bateria, estaciones cercanas e historial de cargas mock (`VEHICLE`, `NEARBY_STATIONS`, `HISTORY`) | Mock → API |
| M3 | Emergencias `EmergenciasScreen_usuario_vehiculo.tsx` | SOS, contactos y servicio de salud 100% local (sin backend) | Sin backend |
| M4 | Panel admin `Interfaz_Administrador_Inicio.tsx` | Stats y gestion hardcodeados (`OVERVIEW`, `MANAGEMENT_SECTIONS`, `RECENT_ACTIVITY`) → conteos reales | Mock → API |
| M5 | Usuarios admin `Interfaz_Administrador_usuarios.tsx` | CRUD mock (`INITIAL_USERS`) → GET/POST/DELETE `/usuarios` (como en el web) | Mock → API |
| M6 | Registro (`AuthService.ts`) | La ruta `POST /auth/registro` **ya existe** en el backend, pero el movil envia `{correo, contrasena}` sin `nombre_usuario` → responde `400`. Falta enviar `nombre_usuario` (y el endpoint exige rol Cliente automaticamente) | **Roto a medias** |
| M7 | Chatbot `components/Chatbot.tsx` | Solo capa visual, sin respuestas (falta RAG + Gemini) | Sin backend |
| M8 | Reservas `ReservasScreen.tsx` | Pago simulado ("EFECTUAR PAGO Y CONFIRMAR") y codigo de confirmacion generado en el cliente (sin QR, sin campo en BD) | Parcial |
| M9 | Global (todos los services) | No envia `Authorization: Bearer`; solo login/registro tocan la API | Seguridad |
| M10 | Vehiculos / catalogo | Sin fotos reales (placeholder; `Vehiculos` no tiene columna de imagen) | Mejora |

### 6.2 Frontend web (`Frontend/`)

| # | Pagina / area | Pendiente | Tipo |
|---|---------------|-----------|------|
| W1 | `PaginaInicioCliente.tsx` | Panel de bateria (`VEHICULO.bateria`) e historial de cargas (`HISTORIAL`) hardcodeados; solo estaciones cercanas son API | Mock → API |
| W2 | `PaginaEmergencias.tsx` | Contactos de emergencia hardcodeados (`CONTACTOS`), SOS solo local | Sin backend |
| W3 | Chatbot `components/Chatbot.tsx` | Solo visual en todas las paginas/roles, sin API (RAG pendiente) | Sin backend |
| W4 | `PaginaEstaciones.tsx` y `PaginaTalleres.tsx` | Mapa placeholder (no hay mapa real en web) | Mejora |
| W5 | `PaginaReservas.tsx` | Codigo de confirmacion generado en el cliente (falta campo en BD / QR) | Parcial |
| W6 | `PaginaUsuarios.tsx` | Sin "suspender/reactivar" (la tabla `Usuarios` no tiene campo de estado) | Bloqueado por BD |
| W7 | Vehiculos / catalogo | Sin fotos reales (placeholder) | Mejora |
| W8 | Registro (`authService.ts`) | Consume `POST /auth/registro` (endpoint creado oct 2026; rol Cliente forzado) | **Hecho** |
| W9 | Listas (general) | Sin spinners de carga; las listas se pintan vacias hasta resolver | UX |

### 6.3 Tareas comunes (ambas plataformas)

| # | Tarea | Notas |
|---|-------|-------|
| C1 | **Mejora de CSS del frontend web y mobile** | Tarea explicita del tablero; usar la skill `ui-web-mobile` |
| C2 | Chatbot con IA (RAG + Gemini) | Capa visual ya existe en ambas; falta backend/IA. Ver roadmap paso 7 en `docs/Decisiones-tecnicas.md` |
| C3 | Fotos del catalogo de vehiculos | Requiere añadir `imagen_url` a `Vehiculos` (o tabla `Vehiculo_Imagenes`). Seguir **plan de Gestion de Imagenes** (`docs/Decisiones-tecnicas.md` §9 y `docs/Arquitectura.md` §7) |
| C4 | Estados de carga / vacio / error con spinner | Web y movil |
| C5 | Despliegue (Supabase → Render → Vercel) | Ver roadmap seccion 6 de `docs/Decisiones-tecnicas.md` |

### 6.4 Hecho (referencia)

- Backend CRUD completo + JWT/bcrypt, migracion a PostgreSQL + pgvector con embeddings Gemini.
- Backend: `POST /api/auth/registro` (oct 2026) — crea el usuario con rol Cliente (busca el rol por nombre) y devuelve `{token, usuario}`.
- Mobile: Vehiculos, Reservas, Estaciones y Talleres con **API real**; stub de `react-native-maps` para web.
- Web: sin fallback a mocks (`services` devuelven `[]`), CRUD real de usuarios con token JWT, **registro via `/auth/registro`**, combobox de roles del admin cargado desde `/clientes`, panel con conteos reales, rediseño del rol invitado.
- Chatbot visual (FAB) en web y movil; seguridad de embeddings (allowlist/denylist, sin PII).
