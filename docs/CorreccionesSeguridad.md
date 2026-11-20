# Correcciones de seguridad

Este documento explica, con palabras sencillas, qué estaba mal y qué se arregló en octubre de 2026.

## Resumen

Antes, casi cualquier persona podía ver y cambiar datos si sabía la dirección de la API. Las contraseñas se guardaban con una protección débil, los "tickets" de acceso (tokens) nunca caducaban y algunos errores mostraban información interna del servidor.

Ahora, ver el catálogo sigue siendo público, pero cambiar datos o ver usuarios y reservas solo lo puede hacer un administrador con un token válido.

## Qué estaba mal y cómo se corrigió

### 1. Cualquiera podía ver usuarios, reservas y roles

- **Antes:** las rutas `/api/usuarios`, `/api/reservas` y `/api/clientes` no pedían permisos.
- **Ahora:** piden un token de administrador. Si no hay token, responden `401`. Si el usuario no es administrador, responden `403`.

### 2. Cualquiera podía crear o cambiar autos, colores, estaciones y talleres

- **Antes:** los botones de crear, editar y borrar estaban abiertos.
- **Ahora:** solo los puede usar un administrador. Ver los datos (`GET`) sigue siendo público.

### 3. La API devolvía la contraseña convertida en código

- **Antes:** al listar usuarios se enviaba el código de la contraseña (llamado *hash*).
- **Ahora:** solo se envían el nombre, el correo, el id y el rol. El código de la contraseña nunca sale del servidor.

### 4. El navegador decidía quién era administrador

- **Antes:** la web mostraba pantallas de administrador porque el guardado local decía que el usuario lo era, pero el servidor no lo comprobaba.
- **Ahora:** el servidor comprueba el rol en cada petición. Además, la web vuelve a preguntar quién es el usuario al abrir la app (`/api/auth/sesion`).

### 5. Cualquier página web podía llamar a la API

- **Antes:** CORS estaba abierto: cualquier sitio podía leer las respuestas desde un navegador.
- **Ahora:** solo se permiten las páginas indicadas en `CORS_ORIGINS`. Las apps móviles y las herramientas de consola siguen funcionando.

### 6. El sistema creía todo lo que enviaba el usuario

- **Antes:** se podía enviar el id de usuario, la fecha o el estado de una reserva en el formulario.
- **Ahora:** el servidor ignora esos datos. La reserva siempre se guarda con la fecha de hoy y el estado "Pendiente". También revisa que nombre, apellido, cédula, modelo y color estén bien escritos.

### 7. Los errores contaban demasiado

- **Antes:** algunos errores mostraban mensajes internos del servidor.
- **Ahora:** si falla algo grave, solo se dice "Error interno del servidor". Los errores por datos mal escritos sí explican qué pasó.

### 8. Los registros mostraban datos sensibles

- **Antes:** había `console.log` que imprimían cabeceras y datos de las peticiones, donde podía aparecer el token.
- **Ahora:** esos registros se quitaron. También se borró un archivo viejo de seguridad que no se usaba.

### 9. No había límite de intentos

- **Antes:** se podían probar contraseñas sin parar o llenar el chatbot de preguntas.
- **Ahora:** hay un límite: 300 peticiones cada 15 minutos en general, **6 intentos fallidos de login cada 15 minutos** (el siguiente devuelve `429` con `"Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar."`; un login correcto reinicia el contador), 20 registros cada 15 minutos y 30 preguntas al chatbot por minuto. Los datos enviados también tienen un tamaño máximo de 100 KB. Login y registro usan claves distintas en `Rate_Limits`.

### 10. Las contraseñas estaban poco protegidas

- **Antes:** se guardaban con bcrypt nivel 5, que es fácil de romper.
- **Ahora:** se guardan con bcrypt nivel 10. Si al entrar se detecta una contraseña guardada con el nivel viejo, se vuelve a guardar con el nivel nuevo.

### 11. Los tokens nunca caducaban y el secreto estaba mal escrito

- **Antes:** el token no tenía fecha de fin. El secreto se leía de una variable mal escrita (`JET_SECRET`) y caía en un valor fijo y conocido (`notasecreta!`).
- **Ahora:** el token caduca a las 8 horas. El secreto se lee de `JWT_SECRET` (se acepta el nombre viejo solo por compatibilidad). En producción, si no hay secreto, el servidor no arranca. En la app móvil se exige que la dirección de la API use `https`.

### 12. El registro decía qué correos existían

- **Antes:** el mensaje "Ya existe una cuenta con ese correo" confirmaba que ese correo estaba registrado.
- **Ahora:** el mensaje es genérico. Además, la base tiene un índice único en el correo para que dos personas no se registren al mismo tiempo con el mismo correo.

### 13. Había librerías con avisos de seguridad

- **Antes:** `npm audit` mostraba vulnerabilidades.
- **Ahora:** se actualizaron las librerías del Backend y del Frontend. `dotenv` se movió a dependencias normales para que el servidor arranque en producción. En el móvil se arregló `postcss`. Queda un aviso de `image-size`, que es una herramienta interna de Expo para generar la app y no se tocó para no romper Metro.

### 14. La web no volvía a revisar la sesión

- **Antes:** si el token caducaba o el usuario se borraba, la pantalla seguía mostrando la sesión abierta.
- **Ahora:** al abrir la web se pregunta al servidor si la sesión sigue válida. Si el servidor dice que no (`401`), se cierra la sesión. Si lo que falla es la red, se mantiene.

## Lo que NO se cambió

El punto 15 de la lista original: las credenciales de PostgreSQL (una contraseña corta y el usuario `postgres`). Se dejó tal cual por decisión explícita.

## Cómo se comprobó

- `GET /api/vehiculos` responde `200` (es público).
- `GET /api/usuarios`, `/api/reservas` y `/api/clientes` sin token responden `401`.
- Backend: `npx tsc --noEmit` sin errores.
- Frontend: `npm run lint` y `npm run build` sin errores.
- Móvil: `tsc` sin errores y el archivo cambiado pasa Prettier.

## Datos que hay que configurar

- Backend: `JWT_SECRET`, `CORS_ORIGINS`, `TRUST_PROXY` y, si se quiere cambiar, `JWT_EXPIRACION` (por defecto `8h`).
- Frontend: `VITE_API_URL` si la API no está en el mismo dominio.
- Móvil: `EXPO_PUBLIC_API_URL` (debe ser `https` en producción).

Hay ejemplos en `Backend/.env.example`, `Frontend/.env.example` y `Mobile/.env.example`.

El índice único del correo ya se aplicó en la base local y ahora se crea automáticamente al arrancar el backend. El script `Backend/scripts/seguridad_usuario_correo.sql` sigue disponible como ayuda manual. La tabla `Rate_Limits` también se crea sola al arrancar.

## Cosas que todavía no se pueden evitar

- No existe un botón en el servidor para invalidar un token suelto: si alguien roba un token, puede usarlo hasta que caduque (8 horas). El logout de la web sí borra la cookie.
- El token de la web ya **no** está en `localStorage`: vive en una cookie httpOnly. El móvil lo guarda solo en memoria y se pierde al cerrar la app.
- El chatbot tiene instrucciones explícitas para tratar preguntas y contexto como datos, no como órdenes. Desde nov 2026 además rechaza patrones de **prompt injection** en la pregunta y en el historial (`400` con respuesta fija), descarta turnos sospechosos, omite valores del contexto que parezcan instrucciones, los envía como texto literal entre comillas y valida la salida antes de emitirla. Aun así, un modelo de IA puede fallar; no es una garantía absoluta.
- Quedan 11 avisos moderados de `npm audit` en herramientas de Expo 54 (glob/minimatch). Arreglarlos exige subir a Expo SDK 58, un cambio grande que no se hizo. El aviso alto de `image-size` ya se corrigió.
