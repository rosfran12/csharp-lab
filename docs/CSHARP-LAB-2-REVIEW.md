# C# Lab 2.0 — propuesta para revisión

Estado: rama `review/csharp-lab-2`. No incorporada a main, sin despliegue ni cambios en los permisos del sitio. La base de trabajo contenía cambios sin commit de la versión 1.2; se conservan e incluyen para que el conjunto sea reproducible. No se eliminan archivos ni funciones previas.

## Qué cambia

- Laboratorio de código separado del curso y la práctica de preguntas: 15 desafíos guiados, 5 por cada ruta. Orden: variables, operadores, condicionales, bucles y métodos.
- Editor con textarea nativo, resaltado local sin dependencias, numeración y scroll coordinado. En móvil admite teclado del sistema, scroll horizontal dentro del editor y ajuste vertical. Modo de texto sin resaltado y soporte para colores forzados. Tab sigue navegando, sin capturar el foco. Las capas visuales duplicadas se excluyen de lectores de pantalla.
- Cada práctica tiene consigna, ejemplo editable, pista, solución consultable y descarga del fragmento .cs. Los fragmentos Unity requieren el contexto de un componente; el archivo descargado no es un proyecto completo.
- Métricas de programación por ruta: patrones resueltos, intentos, errores de validación y resoluciones sin ayuda. No cambian los porcentajes de los 15 ejercicios anteriores. Ver una pista o solución marca ayuda de forma persistente; restaurar el ejemplo no la borra. Un acierto previo sin ayuda conserva ese logro aunque luego se consulte una pista. No se detecta ayuda externa: son indicadores de práctica, no calificaciones verificadas.

## Persistencia y compatibilidad

Se mantiene la clave `csharp-lab-v1` y se aceptan datos sin versión o de versión 1. Se conservan `done` y `attempts`; la nueva propiedad `lab` es opcional. La exportación usa versión 2 e incluye borradores y métricas. Una importación de una versión desconocida se rechaza sin sustituir la sesión. Las importaciones reemplazan la copia local, igual que antes; exportar antes si se desea conservar otra copia.

Los borradores se guardan inmediatamente al escribir, sin depender de beforeunload, y los intentos/pistas al pulsar su botón. Las pruebas cierran el proceso Chromium y vuelven a abrir el mismo perfil temporal, con progreso v1 y v2. El progreso sobrevive a un cierre normal del navegador, pero no al borrado de datos, modo incógnito, cambios de origen o políticas del navegador. Si el almacenamiento está bloqueado sigue funcionando la sesión y se puede exportar JSON. No se copia progreso entre sitios u orígenes automáticamente.

El servidor opcional conserva las métricas nuevas. Combina aciertos y ayuda con OR y contadores con el máximo por ejercicio; los intentos simultáneos en varios dispositivos **no se suman**. Los borradores son locales y se trasladan exportando/importando JSON; la sincronización no envía el código a ejecutar ni lo almacena. Reiniciar sigue borrando solo la copia local, con confirmación; la conexión al servidor puede restaurar el historial anterior. Desconectarla antes de empezar una copia local nueva.

## Investigación: ejecución real

Consultado el 12 de noviembre de 2026:

- [Microsoft: Blazor WebAssembly en GitHub Pages](https://learn.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly/github-pages): confirma el alojamiento estático de aplicaciones .NET WebAssembly. Esto no aporta por sí solo un compilador interactivo.
- [Demostración csharp-wasm-compiler](https://github.com/ramyD/csharp-wasm-compiler): muestra compilación dinámica con Roslyn y ejecución en .NET WebAssembly. Es una demostración basada en .NET 7, no una integración probada ni adoptada por C# Lab.

Conclusión: es viable en principio ejecutar C# del lado del navegador en GitHub Pages. En esta entrega no existe un toolchain .NET/WASM instalado y verificado, ni pruebas de aislamiento, cancelación, consumo de memoria y compatibilidad móvil de ese runtime. Por eso 2.0 implementa exclusivamente el modo limitado autorizado. No se integra un servicio de compilación externo ni se solicitan claves de API.

Antes de habilitar ejecución real se requiere una prueba reproducible con runtime soportado, Roslyn empaquetado y referencias explícitas, revisión de licencias, ejecución en contexto aislado sin acceso al origen de la aplicación ni a claves/almacenamiento, restricción de red/interop y límites de CPU/memoria/salida. Debe poder cancelar un bucle infinito, manejar errores de compilación y pasar pruebas en móvil y bajo subdirectorios de Pages. Un Worker del mismo origen por sí solo no debe tratarse como barrera de seguridad para las credenciales. No se afirma que estos requisitos estén resueltos.

## Qué significa validar

El validador compara la secuencia de tokens con una solución de referencia por ejercicio. Ignora espacios y comentarios; no interpreta operadores, tipos, flujo, resultados ni llamadas de API. No usa eval, Function, procesos o solicitudes de ejecución. Puede rechazar variantes de C# válidas (nombres distintos, otras expresiones, bloques equivalentes, `using`, programas completos). La consigna prescribe la forma admitida. Un patrón aprobado no es una prueba de compilación o ejecución. Los mensajes se presentan como errores de validación, nunca como diagnósticos de Roslyn ni resultados de consola.

El resaltado es una ayuda léxica, no un analizador de C# completo. El editor admite hasta 12.000 caracteres por práctica. El código se escapa antes de generar la capa visual; pegar HTML no genera elementos ejecutables.

## Offline, publicación y alcance

El service worker incluye todos los recursos del laboratorio y las prácticas descargables. La caché se distingue por el alcance del sitio, para no mezclar instalaciones bajo distintos subdirectorios del mismo origen. Requiere primera carga online mediante HTTPS o localhost. El navegador puede descartar la caché. La API queda fuera de ella. El workflow Pages copia los archivos nuevos; no cambia la rama de despliegue ni publica esta propuesta.

GitHub Pages continúa sin backend para sincronizar. Esta función requiere `server.cjs` alojado con HTTPS y almacenamiento persistente, como en 1.2. .NET, Unity y Wwise no se ejecutan en el laboratorio; las prácticas descargables de 1.2 se conservan y requieren las herramientas locales. No están instaladas ni verificadas en este entorno.

## Comprobaciones y revisión manual

```sh
node server.cjs
# En otra terminal, con Playwright instalado:
node tests/smoke.cjs
node tests/features.cjs
node tests/lab-v2.cjs
node tests/pages-v2.cjs
```

Se mantiene Playwright fuera de las dependencias de producción. El nuevo workflow de PR instala una versión fijada para ejecutar estas comprobaciones sin publicar.

Cobertura: 15 preguntas anteriores y 15 prácticas de programación, anchos 360/390/768/1280, datos v1, cierre/reapertura real de Chromium, borradores, ayuda persistente, exportación/importación v2, versión futura rechazada, almacenamiento bloqueado, sincronización entre contextos y recarga/validación offline. Se prueban comentarios, código adicional, límites y texto HTML en el editor. Un servidor estático desechable reproduce /csharp-lab/ sin API y verifica la recarga y validación offline bajo ese subdirectorio.

Antes de aprobar: probar teclado y lector de pantalla en un celular físico, revisar consignas y patrones admitidos, decidir si la sincronización opcional se alojará y comprobar las prácticas externas en el PC con Unity/Wwise. Las comprobaciones automatizadas de accesibilidad no equivalen a una prueba con tecnologías de asistencia reales.

Resultado local de esta propuesta: las cuatro suites pasaron en Chromium; `git diff --check` y las comprobaciones de sintaxis JavaScript pasaron. El workflow de PR queda preparado, pero no fue ejecutado en GitHub. No se probaron Safari, Firefox, lectores de pantalla ni dispositivos físicos.
