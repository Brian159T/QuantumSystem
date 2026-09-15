# Base de Datos - QuantumApp

Motor actual: **MySQL** — Base de datos: `quantumappdb`

> **Migracion planificada**: el plan es migrar a **PostgreSQL** (con `pgvector`) primero de manera local y subirlo a **Supabase** cuando esté listo. Ver seccion 6 de `docs/Decisiones-tecnicas.md`. Este documento describe el esquema **actual** en MySQL; tras la migracion se actualizara con el esquema Postgres (tipos, extension `vector`, etc.).

## Diagrama de relaciones

```
Roles (1) ──── (N) Usuarios
                          │
              ┌───────────┴───────────┐
              │                       │
      Usuarios_Reservas       Usuarios_Vehiculos
              │                       │
              ▼                       ▼
          Reservas              Vehiculos ──── (N) ──── Colores (1)

Estaciones_Carga  (independiente)
Servicios_Tecnicos (independiente)
```

## Tablas

### Roles

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_rol` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `Nombre` | VARCHAR(50) | NOT NULL |

### Usuarios

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_usuario` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `nombre_usuario` | VARCHAR(50) | NOT NULL |
| `correo` | VARCHAR(70) | NOT NULL |
| `contrasena` | VARCHAR(255) | NOT NULL — hash bcrypt (salt 5) |
| `id_rol` | INT | FK → Roles(id_rol), NOT NULL |

### Colores

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_color` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `Color` | VARCHAR(20) | NOT NULL |

### Vehiculos

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_vehiculo` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `Velocidad_Maxima` | VARCHAR(70) | NOT NULL |
| `Autonomia` | VARCHAR(50) | NOT NULL |
| `Tipo` | VARCHAR(40) | NOT NULL |
| `Carga_Rapida` | VARCHAR(40) | NOT NULL |
| `Nombre_Modelo` | VARCHAR(50) | NOT NULL |
| `Capacidad_Bateria` | VARCHAR(50) | NOT NULL |
| `Tiempo_Carga_Normal` | VARCHAR(40) | NOT NULL |
| `Traccion` | VARCHAR(50) | NOT NULL |
| `Nro_Asientos` | VARCHAR(20) | NOT NULL |
| `id_color` | INT | FK → Colores(id_color), NOT NULL |

### Reservas

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_reserva` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `Monto_Reserva` | FLOAT | NOT NULL |
| `Fecha_Reserva` | DATE | NOT NULL |
| `Estado` | VARCHAR(50) | NOT NULL |

### Usuarios_Reservas (N:M)

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_usuario` | INT | PK compuesto, FK → Usuarios(id_usuario), NOT NULL |
| `id_reserva` | INT | PK compuesto, FK → Reservas(id_reserva), NOT NULL |

### Usuarios_Vehiculos (N:M)

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_usuario` | INT | PK compuesto, FK → Usuarios(id_usuario), NOT NULL |
| `id_vehiculo` | INT | PK compuesto, FK → Vehiculos(id_vehiculo), NOT NULL |

### Servicios_Tecnicos

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_servicio` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `direccion` | VARCHAR(50) | NOT NULL |
| `latitud` | FLOAT | NOT NULL |
| `longitud` | FLOAT | NOT NULL |
| `horarios` | VARCHAR(50) | NOT NULL |
| `telefono` | VARCHAR(20) | — |
| `Estado` | VARCHAR(30) | — |

### Estaciones_Carga

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id_estacion` | INT | PK, AUTO_INCREMENT, NOT NULL |
| `direccion` | VARCHAR(50) | NOT NULL |
| `latitud` | FLOAT | NOT NULL |
| `longitud` | FLOAT | NOT NULL |
| `horarios` | VARCHAR(50) | NOT NULL |
| `telefono` | VARCHAR(20) | — |
| `Estado` | VARCHAR(30) | — |
