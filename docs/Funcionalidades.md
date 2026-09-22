# Funcionalidades - Quantum / Voltus

Catalogo de funcionalidades de la app por **rol de usuario**, en la **app movil** (`Mobile/`) y el **frontend web** (`Frontend/`).

Los roles se determinan por `Roles.Nombre` (string) y se reflejan en los flags de `useAuth()`: `esInvitado`, `esCliente`, `esAdministrador`.

> **Estado general**: La gran mayoria de pantallas usan **datos mock hardcodeados**. Solo login/registro, y (en el movil) las pantallas de Estaciones, Talleres, Vehiculos y Reservas consumen la **API real**. Detalle por pantalla al final.

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
- **Estadisticas** (totales: vehiculos, estaciones, usuarios).
- **Gestion de contenido** en tarjetas (cada una con enlace "Gestionar").
- **Actividad reciente** (mock `RECENT_ACTIVITY`).

### 3.2 Gestion de Usuarios (Movil: `Interfaz_Administrador_usuarios.tsx` / Web: `PaginaUsuarios.tsx`)
- CRUD **mock** de usuarios (`INITIAL_USERS` / `USERS`): **buscar**, **filtrar por estado** (Todos/Activo/Suspendido), **suspender** (toggle de estado), **editar**, **eliminar** (con confirmacion), y **agregar** usuario.
- **Estadisticas**: usuarios activos, administradores.
- Tarjetas expandibles con acciones.

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
| Login / Registro (`AuthService`) | **Real API** |

### Frontend web (`Frontend/`)

| Pagina | Uso de API |
|--------|-----------|
| `PaginaInicio.tsx` | API `/vehiculos` (fallback mock) |
| `PaginaVehiculos.tsx` | Via `useVehiculos()` / `vehiculosService` (fallback mock) |
| `PaginaReservas.tsx` | **Real API** (POST /reservas, GET /vehiculos, GET /colores) |
| `PaginaInicioCliente.tsx` | Mock |
| `PaginaEstaciones.tsx` | API `/estaciones-carga` (fallback mock) |
| `PaginaTalleres.tsx` | API `/servicios-tecnicos` (fallback mock) |
| `PaginaEmergencias.tsx` | Mock |
| `PaginaPanel.tsx` | API (stats dinamicas) con fallback |
| `PaginaUsuarios.tsx` | API `/usuarios` (fallback mock) |
| Login / Registro (`authService`) | **Real API** |

---

## 5. Funcionalidades transversales

- **Autenticacion** (login/registro) con JWT; estado en contexto (`useAuth`).
- **Logout** (vuelve a flujo de invitado).
- **Saludo** con iniciales y rol del usuario logueado.
- **Navegacion por tabs/rol** (movil: react-navigation; web: navegacion por estado).
- **Geolocalizacion** (movil): permisos, coordenadas, distancia Haversine. Usado en Estaciones y Talleres.
