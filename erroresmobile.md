# Errores y diagnóstico de Mobile

## Proyecto

- Proyecto: QuantumSystem / QuantumApp
- Aplicación móvil: `Mobile/`
- Backend: `Backend/`
- Sistema operativo: Windows 10
- Expo SDK: 54
- React Native: 0.81.5
- Expo Dev Client: 6.0.21
- Node.js: 24.13.0
- npm: 11.6.2
- Dispositivo: Android físico
- IP Wi-Fi del equipo: `192.168.0.17`
- Gateway: `192.168.0.1`
- Metro: puerto `8081`
- Backend Express: puerto `4000`

## 1. Error inicial de conexión con Metro

### Síntoma

Al ejecutar Expo en LAN y escanear el QR desde el Development Build aparecía:

```text
java.net.SocketTimeoutException: failed to connect to /192.168.0.17 (port 8081)
```

### Comprobaciones realizadas

- La interfaz Wi-Fi activa era `192.168.0.17/24`.
- La puerta de enlace era `192.168.0.1`.
- La ruta `192.168.0.0/24` utilizaba la interfaz Wi-Fi.
- Metro escuchaba en:

```text
0.0.0.0:8081
[::]:8081
```

- Metro respondía correctamente desde el propio equipo:

```text
http://127.0.0.1:8081/status
http://192.168.0.17:8081/status
```

Respuesta esperada:

```text
packager-status:running
```

- El adaptador VirtualBox usaba `192.168.56.1`, pero el script LAN excluía correctamente esa red.
- No se detectó una VPN activa.

### Configuración LAN existente

El archivo `Mobile/scripts/start-expo-lan.cjs`:

- Detecta interfaces IPv4 activas.
- Prioriza una IP `192.168.x.x`, excluyendo `192.168.56.x`.
- Define `REACT_NATIVE_PACKAGER_HOSTNAME`.
- Define la API como `http://<ip-local>:4000/api`.
- Inicia Expo con `--lan` o `--tunnel` según el comando.

Comandos disponibles:

```powershell
cd D:\Proyecto de Grado\QuantumSystem\Mobile
npm run start:lan -- --dev-client
npm run start:tunnel -- --dev-client
```

## 2. Causa raíz de la conectividad LAN

La causa no era Expo, Metro, la IP, VirtualBox ni el script LAN.

La regla efectiva de Windows Defender Firewall:

```text
codex_sandbox_offline_block_inbound
```

tenía estas características:

```text
Descripción: Codex Sandbox Offline - Block Non-Loopback Inbound
Dirección: Entrante
Perfiles: Dominio, Privada y Pública
Acción: Bloquear
RemoteIP: todo tráfico excepto loopback
```

Esta regla pertenece al mecanismo de seguridad del sandbox de Codex. Por seguridad, no se modificó ni deshabilitó.

También se encontró una regla de bloqueo para `node.exe`:

```text
Node.js JavaScript Runtime
Perfil: Privada
Protocolo: TCP
Acción: Bloquear
```

Aunque existían reglas permitiendo Metro y Node.js, las reglas de bloqueo explícitas prevalecen sobre los permisos. Esto bloquea tanto Metro (`8081`) como Express (`4000`) desde el teléfono.

En el momento de la comprobación, ambos servicios sí escuchaban localmente:

```text
TCP 0.0.0.0:8081 LISTENING
TCP 0.0.0.0:4000 LISTENING
```

## 3. Solución de firewall para ejecutar fuera del sandbox

La regla del sandbox no debe alterarse. Para desarrollar en LAN, Metro y Express deben ejecutarse desde una terminal normal de Windows, fuera del entorno sandbox de Codex.

En una PowerShell iniciada directamente en Windows y ejecutada como administrador, crear reglas limitadas a la red privada:

```powershell
New-NetFirewallRule `
  -DisplayName "QuantumApp Metro LAN 8081" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8081 `
  -RemoteAddress 192.168.0.0/24 `
  -Profile Private

New-NetFirewallRule `
  -DisplayName "QuantumApp Backend LAN 4000" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 4000 `
  -RemoteAddress 192.168.0.0/24 `
  -Profile Private
```

Estas reglas:

- Mantienen Windows Defender Firewall activo.
- Solo permiten los puertos `8081` y `4000`.
- Solo aceptan conexiones desde `192.168.0.0/24`.
- No abren los puertos en redes públicas.
- No modifican la protección del sandbox de Codex.

### Reversión

```powershell
Remove-NetFirewallRule -DisplayName "QuantumApp Metro LAN 8081"
Remove-NetFirewallRule -DisplayName "QuantumApp Backend LAN 4000"
```

## 4. Pruebas desde el teléfono

El teléfono debe estar conectado a la misma red Wi-Fi que el equipo. No debe usar una red de invitados, VPN ni una red con aislamiento de clientes/AP Isolation.

Desde Chrome en Android comprobar:

```text
http://192.168.0.17:8081/status
```

Debe aparecer:

```text
packager-status:running
```

También comprobar el backend:

```text
http://192.168.0.17:4000/api
```

La respuesta puede ser un error JSON de ruta, pero no debe ser un timeout. Un timeout indica que todavía existe un bloqueo de red o aislamiento Wi-Fi.

## 5. Error de `TextDecoder('ascii')`

### Síntoma

La aplicación mostraba una pantalla roja con:

```text
[runtime not ready]: RangeError: Unknown encoding: ascii
```

### Dependencia responsable

La cadena de dependencias era:

```text
pdfmake@0.3.15
└── pdfkit@0.21.0
    └── fontkit@3.0.0
```

`Mobile/node_modules/pdfmake/build/pdfmake.js` ejecutaba `new TextDecoder(encoding)` con `encoding = 'ascii'`.

Hermes/React Native no acepta la etiqueta `ascii` en `TextDecoder`.

### Corrección aplicada

Se creó:

```text
Mobile/src/Config/textDecoder.ts
```

Y se añadió como primer import en:

```text
Mobile/App.tsx
```

El polyfill:

- Intercepta únicamente `ascii` y `us-ascii`.
- Decodifica los bytes directamente, sin convertirlos indiscriminadamente a UTF-8.
- Mantiene el `TextDecoder` nativo para UTF-8, UTF-16 y otras codificaciones.

No se actualizaron Expo, React Native ni `pdfmake`.

## 6. Configuración de la API móvil

Archivo:

```text
Mobile/src/Config/api.ts
```

En desarrollo, la aplicación utiliza la IP anunciada por Expo:

```text
http://192.168.0.17:4000/api
```

No se debe usar `localhost` desde el teléfono, porque `localhost` apuntaría al propio Android y no al PC.

Si se necesita fijar la URL temporalmente en PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.0.17:4000/api"
```

## 7. Flujo diario recomendado

Terminal 1, fuera del sandbox de Codex:

```powershell
cd D:\Proyecto de Grado\QuantumSystem\Backend
npm run dev
```

Terminal 2, fuera del sandbox de Codex:

```powershell
cd D:\Proyecto de Grado\QuantumSystem\Mobile
npx expo start --dev-client --lan --clear
```

Después:

1. Confirmar que el teléfono está en la misma Wi-Fi.
2. Escanear el QR desde el Development Build instalado.
3. Confirmar que Metro carga.
4. Probar inicio de sesión contra el backend local.
5. Modificar código en Visual Studio Code y verificar Fast Refresh.

No es necesario regenerar el APK para cambios JavaScript o TypeScript. Solo sería necesario un nuevo APK si se modifican dependencias nativas o configuración nativa que requiera recompilación.

## 8. Estado de cambios realizados

Cambios de código realizados:

- `Mobile/src/Config/textDecoder.ts`: polyfill dirigido para pdfmake/Hermes.
- `Mobile/App.tsx`: carga temprana del polyfill.

Cambios de firewall realizados durante este diagnóstico:

- Ninguno desde el entorno Codex.
- La regla `codex_sandbox_offline_block_inbound` no fue modificada.

Validaciones realizadas:

- TypeScript: correcto.
- ESLint: correcto.
- Prettier: correcto.
- Metro escuchando en `0.0.0.0:8081`.
- Backend escuchando en `0.0.0.0:4000`.

