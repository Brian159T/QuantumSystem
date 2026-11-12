import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Ejecuta el servicio TypeScript sin añadir un framework ni consultar el servidor público.
async function cargarServicio() {
  const convertir = (fuente) =>
    'data:text/javascript;base64,' +
    Buffer.from(
      ts.transpileModule(fuente, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    ).toString('base64')
  const geo = convertir(await readFile(new URL('../src/utils/geo.ts', import.meta.url), 'utf8'))
  const fuente = (
    await readFile(new URL('../src/services/rutasService.ts', import.meta.url), 'utf8')
  )
    .replace("'../utils/geo'", JSON.stringify(geo))
    .replace('import.meta.env.VITE_OSRM_URL', 'undefined')
  return import(convertir(fuente))
}

test('selección vial, geometría, errores y cancelación', async () => {
  const servicio = await cargarServicio()
  const original = globalThis.fetch
  const respuestas = []
  const llamadas = []
  globalThis.fetch = async (url) => {
    llamadas.push(url)
    return { ok: true, json: async () => respuestas.shift() }
  }
  const origen = { latitud: -17.4, longitud: -66.1 }
  const destinos = [
    { latitud: -17.401, longitud: -66.101 },
    { latitud: -17.45, longitud: -66.15 },
    { latitud: -17.46, longitud: -66.16 },
  ]
  try {
    // El más cercano en línea recta tarda más; un destino sin acceso devuelve null.
    respuestas.push({ code: 'Ok', durations: [[0, 900, 120, null]] })
    assert.equal(await servicio.obtenerDestinoCercano(origen, destinos), 1)
    assert.match(llamadas[0], /table\/v1\/driving\/-66.1,-17.4;/)
    assert.match(llamadas[0], /sources=0&annotations=duration/)

    respuestas.push({
      code: 'Ok',
      routes: [
        {
          distance: 2400,
          duration: 120,
          geometry: {
            coordinates: [
              [-66.1, -17.4],
              [-66.12, -17.42],
              [-66.15, -17.45],
            ],
          },
        },
      ],
    })
    const ruta = await servicio.obtenerRuta(origen, destinos[1])
    assert.deepEqual(ruta.coordenadas, [
      [-17.4, -66.1],
      [-17.42, -66.12],
      [-17.45, -66.15],
    ])
    assert.equal(ruta.distanciaKm, 2.4)
    assert.equal(ruta.duracionMin, 2)
    assert.equal(ruta.porCalles, true)

    respuestas.push({ code: 'Ok', durations: [[0, null, null, null]] })
    await assert.rejects(servicio.obtenerDestinoCercano(origen, destinos), /accesibles/)
    respuestas.push({ code: 'NoRoute' })
    await assert.rejects(servicio.obtenerRuta(origen, destinos[0]), /ruta en auto/)
    await assert.rejects(
      servicio.obtenerRuta({ latitud: 91, longitud: 0 }, destinos[0]),
      /inválidas/,
    )
    const control = new AbortController()
    control.abort()
    const cantidad = llamadas.length
    await assert.rejects(servicio.obtenerRuta(origen, destinos[0], control.signal), {
      name: 'AbortError',
    })
    assert.equal(llamadas.length, cantidad)
  } finally {
    globalThis.fetch = original
  }
})
