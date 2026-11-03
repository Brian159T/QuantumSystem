# Plan de Grafana — Quantum

Fecha: 16 de octubre de 2026.

Estado: plan acordado, pendiente de implementación. Este documento no implica que Grafana, Prometheus ni la recolección de eventos estén instalados.

## Introducción

QuantumSystem es una plataforma digital para Quantum, una empresa de vehículos eléctricos. Integra una aplicación móvil, un frontend web y un backend conectado a PostgreSQL para centralizar el catálogo de vehículos, las reservas y la consulta de estaciones de carga y talleres autorizados. Contempla perfiles de visitante, cliente y administrador, con funcionalidades acordes a sus necesidades.

Además de facilitar estos procesos, el proyecto necesita conocer el comportamiento de sus servicios y analizar la actividad registrada. Grafana permitirá transformar métricas técnicas y datos de uso en información visual para apoyar el mantenimiento de la plataforma y las decisiones de la empresa.

## Grafana en Quantumsystem

Grafana se utilizará para observar el funcionamiento técnico y la actividad del proyecto mediante tres paneles, complementados con una etapa de predicción de ventas. La implementación será progresiva y se verificará contra datos reales. El cálculo de los indicadores y pronósticos se apoyará en fuentes y procesos independientes de su visualización.

## 1. Objetivo y alcance

Incorporar tres paneles para supervisar la operación de Quantum y apoyar decisiones con datos reales:

1. Estadísticas de reservas y ventas (primer avance: conexión directa a PostgreSQL).
2. Salud del backend.
3. Uso de estaciones de carga y talleres autorizados.

La información debe provenir del backend, las reservas persistidas y las interacciones reales de la web y la app móvil. No se deben presentar datos mock como actividad real.

La predicción de ventas mediante regresión lineal ampliará el panel de reservas cuando exista suficiente histórico. Para este plan, una venta es una reserva con estado `Confirmada` o `Entregada` (ver sección 8); no representa ingresos monetarios. El objetivo conjunto es facilitar la detección de fallos, reconocer preferencias de modelos y colores, analizar el interés por los lugares registrados y evaluar tendencias de demanda.

## 2. Arquitectura propuesta

```text
Backend Express → prom-client → Prometheus → Grafana
Reservas en PostgreSQL ───────────────────→ Grafana
Web y móvil → API de eventos → PostgreSQL → Grafana
Histórico de ventas (reservas confirmadas/entregadas) → proceso de predicción → PostgreSQL → Grafana
```

- Instrumentar Express para recoger métricas técnicas y exponerlas en un endpoint de métricas accesible al recolector.
- Usar Prometheus para almacenar series temporales de salud del backend.
- Conectar Grafana a PostgreSQL mediante un usuario de solo lectura, limitado a vistas o consultas agregadas para reservas y eventos.
- Registrar eventos mediante el backend: las aplicaciones no se conectan directamente a PostgreSQL ni a Grafana.
- Comenzar en desarrollo local. Antes del despliegue previsto en Supabase, Render y Vercel, definir el alojamiento de Grafana y Prometheus, conectividad, retención y credenciales por entorno.

### Decisiones para el primer avance

- Usar **Grafana OSS (Open Source) para Windows**, mediante el instalador `.msi`. Esta edición cubre el alcance previsto; no se requieren funciones Enterprise.
- Conectar primero Grafana directamente a PostgreSQL y construir el panel de reservas. Prometheus se incorporará en la segunda fase para la salud del backend.
- El usuario del backend confirmado en `Backend/.env` es `postgres`. Para Grafana se creará un usuario específico de solo lectura, limitado a vistas agregadas. No guardar contraseñas en la documentación.
- Parámetros locales de referencia del proyecto: servidor `localhost:5432`, base `QuantumSystemDB`. Verificar los valores del entorno al configurar la fuente de datos.
- Consultar Grafana localmente en `http://localhost:3000` cuando el servicio esté iniciado y conserve el puerto predeterminado.
- La instalación, la creación del usuario de lectura y la conexión aún no están verificadas; no se consideran tareas completadas.

### Despliegue posterior

Los paneles se prepararán y verificarán localmente. Después se exportarán sus definiciones y consultas para importarlas o aprovisionarlas en una instancia de Grafana alojada. Allí se configurará la conexión a PostgreSQL en Supabase según la migración prevista, con credenciales y permisos propios del entorno.

Se trasladarán configuraciones de paneles, no imágenes estáticas: los gráficos se generarán consultando las fuentes conectadas. Las credenciales se configurarán por separado. El alojamiento de Grafana y Prometheus sigue pendiente de elección; el plan no asigna estos servicios automáticamente a Render o Vercel.

## 3. Panel: salud del backend

### Uso previsto

El equipo técnico consultará este panel para comprobar el comportamiento de las operaciones de autenticación, catálogo, reservas y consulta de lugares. La distribución del tráfico por ruta permitirá reconocer qué servicios reciben más solicitudes y en qué períodos aumenta la carga.

Los tiempos de respuesta se analizarán junto con los errores y el consumo de recursos. Por ejemplo, si el registro de reservas se vuelve lento, se podrá revisar si el cambio coincide con un incremento de solicitudes o de memoria utilizada. Estos datos orientarán la investigación; la causa deberá contrastarse con los registros del backend y el estado de sus dependencias.

El p95 complementará los valores centrales de latencia al mostrar si una parte de las solicitudes tarda considerablemente más. Los filtros por período y ruta permitirán comparar el comportamiento antes y después de un cambio, siempre que las condiciones de tráfico sean comparables.

### Indicadores

| Indicador | Propósito |
|---|---|
| Disponibilidad del backend | Detectar pérdida de respuesta del servicio |
| Peticiones por minuto | Observar volumen de tráfico |
| Errores por endpoint y código HTTP | Identificar operaciones que fallan |
| Porcentaje de respuestas 5xx | Evaluar fallos del servidor respecto al tráfico |
| Latencia p50 y p95 por endpoint | Detectar lentitud; p95 es el tiempo dentro del cual responde el 95 % de las solicitudes |
| Memoria y CPU del proceso Node.js | Reconocer presión sobre los recursos |

### Implementación prevista

- Añadir contadores de solicitudes e histogramas de duración con `prom-client`.
- Usar etiquetas acotadas: método HTTP, plantilla de ruta y código de respuesta. Por ejemplo, `/api/vehiculos/:id`, sin incluir identificadores concretos ni parámetros de consulta.
- Separar las rutas de métricas y comprobación de salud del tráfico funcional al calcular indicadores.
- Definir una comprobación de salud y distinguir la accesibilidad del recolector de la disponibilidad HTTP del backend: un fallo de recolección no demuestra por sí solo que la aplicación esté caída.
- Mantener el contrato JSON existente en los endpoints de negocio; documentar el formato específico del endpoint de métricas.

### Alertas iniciales propuestas

- Backend sin responder durante dos minutos.
- Respuestas 5xx superiores al 5 % durante cinco minutos, con un volumen mínimo de solicitudes para evitar alertas engañosas cuando hay poco tráfico.
- Latencia p95 elevada de forma sostenida; fijar el umbral después de medir una línea base.

Los umbrales son iniciales y deberán ajustarse con tráfico real. Configurar el destinatario y canal de alertas al implementar esta fase.

Ante una alerta se revisarán el período afectado, las operaciones con errores, la latencia y los recursos consumidos. Registrar la causa y la resolución permitirá ajustar las alertas y reconocer incidentes recurrentes. Una alerta señalará una condición que requiere revisión, sin atribuir automáticamente una causa al problema.

## 4. Panel: estadísticas de reservas y ventas

### Uso previsto

El personal administrativo utilizará este panel para consultar la evolución de las reservas y ventas, y las preferencias de los interesados. La serie temporal permitirá comparar períodos, mientras que los rankings de modelos y colores ayudarán a reconocer qué opciones concentran la demanda registrada.

La distribución por estado permitirá observar la composición actual de las reservas seleccionadas. Por ejemplo, un administrador podrá consultar las reservas de un modelo durante un mes y revisar cuántas permanecen pendientes según los datos persistidos. Esta información servirá como apoyo al seguimiento comercial y a la revisión del catálogo.

Los resultados del panel se interpretan como reservas y no como ingresos. La serie de ventas que alimenta la predicción (sección 8) es el subconjunto de reservas con estado `Confirmada` o `Entregada`; el resto de indicadores sigue contando todas las reservas. Al filtrar un período por fecha de reserva, los estados mostrados serán los actuales de esas reservas, no una reconstrucción de sus estados en una fecha pasada.

### Indicadores

- Total de reservas del período seleccionado.
- Ventas del período: reservas con estado `Confirmada` o `Entregada` (definición de la sección 8).
- Reservas por día.
- Modelos más reservados.
- Distribución por estado, usando los valores realmente persistidos.
- Colores más elegidos.

### Fuente y filtros

- Consultar `Reservas` y las relaciones necesarias según el esquema documentado en [base-datos.md](base-datos.md).
- Usar la fecha de reserva para agrupar por día; definir explícitamente la zona horaria del panel.
- Incorporar filtros por período, modelo y estado.
- Mostrar únicamente resultados agregados: excluir nombres, apellidos, cédulas y demás datos personales.

### Límites del análisis inicial

- El estado actual no permite reconstruir cuándo cambió una reserva ni cuánto tardó en confirmarse. Esas métricas necesitan un historial de estados futuro. Por la misma razón, la venta se atribuye a la `Fecha_Reserva` y no a la fecha en que pasó a `Confirmada` o `Entregada`.
- La conversión de visitas a ventas requiere registrar visitas y definir su vinculación; queda fuera de esta primera versión.
- Los conteos reflejan los registros conservados: eliminar una reserva modifica los resultados históricos, incluida la serie de ventas, si no existe un historial independiente.

## 5. Panel: uso de estaciones y talleres

### Uso previsto

Este panel permitirá conocer la actividad dentro de las pantallas de estaciones y talleres. Se analizará tanto el acceso general a las secciones como el interés en lugares concretos y la intención de obtener indicaciones hacia ellos.

Los filtros por plataforma permitirán separar web y móvil, y los filtros por tipo de lugar facilitarán comparar estaciones con talleres. Las diferencias se interpretarán considerando las funciones disponibles en cada interfaz: una acción aún no implementada no se contará como falta de interés del usuario.

Por ejemplo, un lugar con muchas aperturas de detalle y pocas solicitudes de ruta podrá motivar una revisión de la información presentada o de la facilidad para obtener indicaciones. El indicador identificará un patrón; determinar su causa requerirá revisar la experiencia de uso. Los eventos disponibles no permitirán reconstruir recorridos individuales ni medir usuarios únicos.

### Eventos a registrar

| Evento | Cuándo se registra | Lugar asociado |
|---|---|---|
| `ver_listado` | Al entrar a la pantalla de estaciones o talleres | Ninguno |
| `ver_detalle` | Al abrir o seleccionar el detalle de un lugar | Estación o taller seleccionado |
| `solicitar_ruta` | Al pulsar la acción para obtener una ruta | Destino elegido |

Registrar acciones explícitas, evitando contar cada renderizado como una visita. Una recarga automática del listado no equivale a una nueva entrada a la pantalla.

### Datos propuestos del evento

| Campo | Descripción |
|---|---|
| `id_evento` | Identificador único para evitar duplicados cuando se reintenta el envío |
| `tipo_evento` | `ver_listado`, `ver_detalle` o `solicitar_ruta` |
| `tipo_lugar` | `estacion` o `taller` |
| `id_lugar` | Identificador del lugar; nulo para `ver_listado` |
| `plataforma` | `web` o `movil` |
| `fecha` | Fecha y hora de recepción asignada por el servidor |

No se necesitan nombres, correos, tokens, identificadores de usuario ni coordenadas del usuario para este alcance.

### Implementación prevista

- Crear una tabla de eventos mediante una migración y un módulo de backend acorde a la arquitectura existente.
- Definir el endpoint de recepción, su validación y respuesta con el sobre JSON del proyecto antes de conectar los clientes.
- Validar tipos permitidos, plataforma y existencia del lugar; limitar el volumen de recepción y deduplicar por `id_evento`.
- Integrar web mediante sus capas de hooks y servicios, y móvil mediante sus capas ViewModel y Model.
- El fallo del envío de analítica no debe impedir abrir detalles o solicitar rutas.
- Acordar retención y limpieza de eventos antes del despliegue; conservar agregados si se necesita historia de largo plazo.

### Indicadores

- Entradas a las pantallas por día y plataforma.
- Estaciones y talleres con más aperturas de detalle.
- Estaciones y talleres con más solicitudes de ruta.
- Evolución temporal de cada tipo de interacción.

Estos indicadores cuentan acciones, no usuarios únicos. Solicitar una ruta no demuestra llegada al destino, carga realizada ni atención en un taller. Ocupación de cargadores y energía suministrada requieren telemetría adicional fuera de este plan.

## 6. Orden de implementación y criterios de aceptación

### Fase 1: conexión a PostgreSQL y estadísticas de reservas

- [ ] Instalar e iniciar Grafana OSS en Windows.
- [ ] Revisar el esquema y los valores reales de modelo, color, estado y fecha.
- [ ] Crear acceso de solo lectura a datos agregados.
- [ ] Añadir PostgreSQL como fuente de datos y verificar la conexión a `QuantumSystemDB`.
- [ ] Construir el panel con total de reservas, evolución por fecha, modelos más reservados, estados y colores elegidos, con sus filtros.
- [ ] Comparar los totales del panel con consultas directas para un período conocido, incluyendo períodos sin reservas.
- [ ] Exportar la configuración del panel y documentar su puesta en marcha sin secretos.

El primer avance se considerará completo cuando la conexión funcione y el panel muestre indicadores que coincidan con los registros de la base. No requiere instrumentar Express ni instalar Prometheus.

### Fase 2: salud del backend

- [ ] Instrumentar Express y recoger métricas del proceso.
- [ ] Configurar Prometheus y Grafana en desarrollo.
- [ ] Crear el panel de salud con filtros por ruta y período.
- [ ] Configurar y comprobar alertas iniciales.
- [ ] Verificar con solicitudes exitosas, errores controlados y una interrupción del servicio en desarrollo que las métricas y alertas reflejan lo ocurrido.

### Fase 3: estaciones y talleres

- [ ] Crear la migración, el módulo de eventos y su contrato API.
- [ ] Conectar las acciones disponibles en web y móvil.
- [ ] Crear el panel con filtros por período, plataforma y tipo de lugar.
- [ ] Verificar que cada acción produce el evento esperado, que los reintentos no duplican eventos y que una caída de analítica no interrumpe la función principal.

## 7. Entregables previstos

- Tres paneles exportables de Grafana.
- Configuración reproducible del recolector y las fuentes de datos, sin secretos en Git.
- Instrumentación técnica del backend.
- Migración y contrato de eventos de uso.
- Integración de eventos en web y móvil.
- Guía de arranque, validación y operación de los paneles.

## 8. Predicción de ventas con regresión lineal

Estado: fase 4, pendiente de implementación después de los tres paneles anteriores.

### Objetivo y preparación

Estimar el total de ventas de las próximas cuatro semanas y mostrar en Grafana la serie real junto al pronóstico. El cálculo se realizará en un proceso del backend o script programado; Grafana visualizará resultados persistidos.

> **Definición de venta para este plan:** toda `Reserva` con `Estado` igual a `Confirmada` o `Entregada`. No existe una tabla de ventas ni un historial de cambios de estado; por eso la venta se atribuye a la `Fecha_Reserva` original y no a la fecha de confirmación. Si una reserva se elimina, también desaparece del histórico de ventas. No se interpreta como ingreso monetario.

- Agrupar las ventas por semana completa, definiendo zona horaria e inicio de semana. Se estima demanda de ventas, no ingresos.
- Completar con cero solo semanas con operación y registro confiable sin ventas; distinguirlas de períodos sin datos.
- Revisar fechas, duplicados y eliminaciones que alteren el histórico. Usar datos agregados sin información personal.
- Reunir inicialmente al menos 12 semanas completas para un piloto. Este mínimo no garantiza precisión; si los datos son insuficientes o casi todos los conteos son cero, indicar la limitación y posponer el pronóstico operativo.

### Modelo y validación

La regresión buscará una tendencia entre el paso del tiempo y las ventas semanales. Se plantea como un primer modelo interpretable para evaluar si el histórico permite anticipar la demanda. No se asumirá que una tendencia lineal describe estacionalidad, campañas u otros cambios de comportamiento que no estén representados en los datos.

```text
ventas_estimadas = intercepto + pendiente × indice_de_semana
```

- Comenzar con regresión lineal simple global. Considerar modelos por vehículo solo con suficiente historial por modelo.
- Separar entrenamiento y evaluación por fecha, sin mezclar aleatoriamente pasado y futuro. Validar con cortes temporales sucesivos y horizonte de cuatro semanas cuando el histórico lo permita.
- Comparar contra una referencia que repita el promedio de las últimas cuatro semanas completas disponibles en cada corte.
- Medir MAE y RMSE para ambos métodos. Evitar depender de MAPE cuando existen semanas sin ventas.
- Conservar salidas originales para diagnóstico; aplicar un mínimo de cero para uso operativo y redondear solo al mostrar cantidades. Evaluar el mismo tratamiento utilizado en producción.
- Si la regresión no mejora consistentemente la referencia, documentarla como experimento y mostrar el método mejor validado para uso operativo.
- Añadir intervalos de predicción cuando puedan estimarse y se revisen sus supuestos. El pronóstico no representa una cantidad garantizada.

El MAE expresará la magnitud media del error en ventas por semana, mientras que el RMSE dará mayor peso a errores grandes. Se reportarán los períodos evaluados y las métricas de ambos métodos para que la selección pueda revisarse. Las doce semanas propuestas para el piloto no garantizan suficientes cortes de evaluación; el alcance de la validación dependerá del histórico disponible.

### Integración y panel

Crear mediante migración una tabla de predicciones con fecha de generación, semana objetivo, horizonte, valor estimado, límites del intervalo si existen, método, versión y período de entrenamiento. Conservar cada ejecución para comparar su predicción original con los resultados reales.

Actualizar inicialmente una vez por semana al cerrar la anterior. Elegir la herramienta de cálculo y el programador al implementar según el despliegue. No entrenar en cada petición; este proceso no requiere Gemini.

Añadir al panel de reservas y ventas:

- Serie real semanal de ventas y pronóstico de las próximas cuatro semanas.
- Intervalos de predicción cuando estén disponibles.
- Fecha de actualización, período de entrenamiento y método utilizado.
- MAE y RMSE comparados con el método base.
- Avisos de historial insuficiente o pronóstico desactualizado.

La visualización permitirá comparar lo esperado con lo observado una vez que cierre cada semana objetivo. El pronóstico podrá apoyar la planificación de la atención a interesados, acompañado de sus errores y supuestos. Si falla una actualización, se conservará la última ejecución y se indicará su antigüedad; no se presentará como un pronóstico recién calculado.

### Fase 4: tareas y aceptación

- [ ] Revisar calidad y cobertura del histórico y preparar la serie semanal.
- [ ] Implementar regresión lineal y método base.
- [ ] Validar cronológicamente sin información futura y registrar los errores.
- [ ] Crear la migración de predicciones y programar la actualización semanal.
- [ ] Integrar el pronóstico en Grafana y contrastarlo con resultados reales.
- [ ] Comprobar historial insuficiente, períodos sin ventas, predicciones negativas y fallos de actualización.
- [ ] Documentar resultados, supuestos y limitaciones para operación y defensa del proyecto.

Entregables adicionales: proceso reproducible de entrenamiento y pronóstico, migración de predicciones, reporte de validación y visualización en el panel de reservas y ventas.

## 9. Operación y verificación de los paneles

El acceso se destinará al equipo técnico y al personal autorizado según el panel. Definir usuarios, permisos, frecuencia de actualización y retención al implementar el entorno. Las credenciales se mantendrán fuera del repositorio y el acceso a PostgreSQL se limitará a los datos necesarios para visualizar los indicadores.

Cada panel deberá distinguir entre ausencia de actividad y ausencia de información. Una consulta válida sin reservas puede representar cero actividad; una fuente inaccesible debe mostrarse como un problema de consulta. Los indicadores de eventos deberán señalar desde qué fecha comenzó la recolección para evitar interpretar períodos anteriores como falta de uso.

### Verificación prevista

| Área | Comprobación | Evidencia esperada |
|---|---|---|
| Backend | Generar solicitudes exitosas y errores controlados en desarrollo | Conteos, códigos y tiempos coherentes con las solicitudes realizadas |
| Alertas | Interrumpir el servicio de forma controlada | Activación y recuperación según la condición configurada |
| Reservas | Comparar un período conocido con consultas directas | Coincidencia de totales, modelos, colores y estados |
| Eventos | Ejecutar acciones en web y móvil y reintentar un envío | Registro de cada acción sin duplicación por reintento |
| Pronóstico | Evaluar sobre semanas posteriores al entrenamiento | Errores reproducibles sin uso de datos futuros |
| Fuentes de datos | Simular indisponibilidad en desarrollo | Estado de error visible en lugar de ceros engañosos |

Para la defensa del proyecto se podrá mostrar tráfico controlado, una reserva de prueba y eventos de interacción, observando su representación en los paneles. Cualquier dato sintético utilizado para demostrar el modelo predictivo deberá identificarse y mantenerse separado del histórico real; no será evidencia de precisión sobre la demanda de la empresa.

## 10. Documentación relacionada

- [Arquitectura](Arquitectura.md).
- [API](Api.md).
- [Base de datos](base-datos.md).
- [Decisiones técnicas y roadmap](Decisiones-tecnicas.md).
- [Funcionalidades y pendientes](Funcionalidades.md).
