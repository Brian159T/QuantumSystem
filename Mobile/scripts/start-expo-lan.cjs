const os = require('node:os');
const { spawn } = require('node:child_process');
const argumentos = process.argv.slice(2);
const usaTunnel = argumentos.includes('--tunnel');
const usaLocalhost = argumentos.includes('--localhost');

function obtenerIpLocal() {
  const interfaces = os.networkInterfaces();
  const candidatas = Object.values(interfaces)
    .flatMap((lista) => lista ?? [])
    .filter((interfaz) => interfaz.family === 'IPv4' && !interfaz.internal)
    .map((interfaz) => interfaz.address);

  const ipWifi = candidatas.find((ip) => /^192\.168\.(?!56\.)\d+\.\d+$/.test(ip));
  return (
    ipWifi || candidatas.find((ip) => /^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) || candidatas[0]
  );
}

const ipLocal = obtenerIpLocal();
if (!ipLocal) {
  console.error('No se encontro una IPv4 local para iniciar Expo en LAN.');
  process.exit(1);
}

process.env.REACT_NATIVE_PACKAGER_HOSTNAME = ipLocal;
process.env.EXPO_NO_DEPENDENCY_VALIDATION = '1';
// Expo muestra los stacks completos de Metro y los errores de conexion cuando
// este indicador esta activo. Es especialmente util si Expo Go no descarga el bundle.
process.env.EXPO_DEBUG = process.env.EXPO_DEBUG || '1';
if (!process.env.EXPO_PUBLIC_API_URL)
  process.env.EXPO_PUBLIC_API_URL = `http://${ipLocal}:4000/api`;
if (!process.env.EXPO_PUBLIC_GRAFANA_URL)
  process.env.EXPO_PUBLIC_GRAFANA_URL = `http://${ipLocal}:3000`;

console.log(`Expo LAN: ${ipLocal}`);
console.log('Diagnostico Expo: activo (los errores de Metro y del bundle apareceran aqui).');
console.log(
  usaTunnel
    ? 'Conexion Expo: tunnel (no depende del firewall de la red local).'
    : usaLocalhost
      ? 'Conexion Expo: localhost (solo para este equipo).'
      : 'Conexion Expo: LAN (el celular debe alcanzar la IP del equipo).',
);
console.log(`API movil: ${process.env.EXPO_PUBLIC_API_URL}`);
console.log(`Grafana movil: ${process.env.EXPO_PUBLIC_GRAFANA_URL}`);

const cli = require.resolve('expo/bin/cli');
const tipoConexion = usaTunnel ? '--tunnel' : usaLocalhost ? '--localhost' : '--lan';
const argumentosSinConexion = argumentos.filter(
  (argumento) => !['--lan', '--tunnel', '--localhost'].includes(argumento),
);
const proceso = spawn(process.execPath, [cli, 'start', tipoConexion, ...argumentosSinConexion], {
  stdio: 'inherit',
  env: process.env,
});

proceso.on('exit', (codigo) => process.exit(codigo ?? 0));
