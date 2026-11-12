# C# Lab — Unity & Game Audio

Plataforma educativa estática en español con tres rutas conectadas: C# general, C# aplicado a Unity y Game Audio. Funciona sin servicios externos ni dependencias de producción.

## Uso y desarrollo

Abrí `index.html` en un navegador o serví el repositorio:

```sh
cd /workspace/csharp-lab
python3 -m http.server 8000 --bind 127.0.0.1
```

Usá siempre el mismo origen para conservar el progreso: el almacenamiento de un archivo abierto directamente y el del servidor HTTP son independientes.

## Funciones

- Tres rutas con objetivos, introducciones, estrategias y conexiones entre conceptos.
- Curso guiado con selección de lección y navegación para repasar ejercicios resueltos.
- 15 ejercicios: 12 de opción múltiple y 3 de respuesta numérica. Cada corrección explica el razonamiento; una respuesta incorrecta permite reintentar.
- Práctica libre filtrada por ruta, sin repetir inmediatamente el desafío anterior. Sus aciertos también cuentan para la ruta correspondiente.
- Progreso e intentos independientes por ruta, más seguimiento de conceptos compartidos.
- Guardado local, exportación/importación JSON y reinicio con confirmación.
- Compatibilidad con el progreso anterior (`csharp-lab-v1`): los aciertos originales se mantienen. Al agregar ejercicios el porcentaje se recalcula sobre cinco desafíos por ruta.
- Aviso si el almacenamiento está bloqueado o los datos guardados no pueden recuperarse. Se puede exportar el progreso de la sesión.
- Controles con foco visible, respuestas agrupadas y diseño adaptable a celular.

## Comprobaciones

No hay compilación de producción. La prueba funcional `tests/smoke.cjs` usa Playwright y Chromium con el servidor anterior en ejecución:

```sh
node tests/smoke.cjs
```

Si Playwright no está instalado, podés mantener las herramientas fuera del repositorio:

```sh
npm install --prefix /tmp/csharp-lab-tools playwright
/tmp/csharp-lab-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/csharp-lab-tools/node_modules node tests/smoke.cjs
```

La prueba usa `/usr/bin/chromium` cuando existe y, en otro caso, el navegador instalado por Playwright. `CHROMIUM_PATH` permite indicar otro ejecutable y `TEST_URL` otro servidor. Comprueba los 15 ejercicios, correcciones, rutas independientes, persistencia, práctica, exportación/importación, datos inválidos y compatibilidad anterior en anchos de 360, 390, 768 y 1280 píxeles. Verifica que no haya desbordamiento horizontal ni errores de JavaScript. Usa contextos desechables y no modifica datos del navegador del usuario.

## Publicar con GitHub Pages

1. Subí los cambios al repositorio en GitHub.
2. En **Settings → Pages → Build and deployment → Source**, elegí **GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` publica al recibir un push a `main`. También se puede ejecutar desde **Actions → Publicar GitHub Pages → Run workflow**.
4. La URL publicada aparece en el entorno `github-pages` del despliegue.

El artefacto incluye la página, los recursos offline y las prácticas descargables; no publica tests ni archivos internos. No requiere configurar una ruta base: el sitio es autocontenido y funciona bajo el subdirectorio del repositorio. La configuración del workflow prepara la publicación; no activa Pages ni publica cambios hasta que se suban y se ejecute en GitHub.

También puede publicarse en Cloudflare Pages (framework `None`, sin compilación, raíz como salida) o Vercel como sitio estático.

## Capacidades y requisitos de la versión 1.2

- **Offline:** service worker con caché de la aplicación y prácticas. Requiere una primera carga mediante HTTPS o localhost; no intercepta la API ni guarda claves en caché. El navegador puede eliminar sus datos. El HTML solo ya no incluye todas las funciones: descargá el repositorio completo.
- **Sincronización:** ejecutá `node server.cjs` (Node 18 o superior). Para acceso entre dispositivos publicalo detrás de HTTPS, con `HOST=0.0.0.0` y un volumen persistente para `LAB_DATA_DIR`. Abrí ese servidor en todos los dispositivos y conectá la misma clave privada generada desde Mi progreso. No hay proveedor externo ni credenciales preconfiguradas. La clave funciona como contraseña y se guarda en el navegador; no la publiques. Respaldá el directorio de datos. Para un servicio público agregá límites de solicitudes y almacenamiento en el proxy.
- **Conflictos:** se unen aciertos y se conserva el máximo de intentos por ejercicio (los intentos simultáneos no se suman). La página sincroniza al guardar, al recuperar conexión y cada 30 segundos mientras está abierta. El reinicio es local; no borra el servidor. La sincronización recuperará los aciertos anteriores si sigue conectada.
- **C# real:** descargá `runtime/Program.cs` y `runtime/Lab.csproj` en una carpeta y ejecutá `dotnet run` con .NET SDK 8. No se ejecuta código arbitrario en el servidor ni se simula un compilador.
- **Unity real:** importá `runtime/LabRuntime.cs`, adjuntalo a un GameObject y asigná un AudioClip para escuchar pasos. Update mueve el objeto según Time.deltaTime.
- **Wwise real:** el script está dirigido a la integración Unity moderna con `AkUnitySoundEngine`. Instalá el paquete oficial, inicializá el motor, cargá tus SoundBanks y configurá los nombres de evento/RTPC. Activá el símbolo `CSHARP_LAB_WWISE`. En integraciones antiguas la clase puede llamarse `AkSoundEngine`: adaptá el nombre a tu versión. No se incluyen SDK ni SoundBanks propietarios.

GitHub Pages ofrece offline y descargas, pero no ejecuta `server.cjs`: la sincronización necesita alojar el servidor Node. No se ha desplegado ningún servidor ni se han comprobado .NET, Unity o Wwise en este entorno; esos runtimes no están instalados.

## C# Lab 2.0 (propuesta en revisión)

Se agrega **Laboratorio de código**, con editor móvil y 15 prácticas progresivas conectadas con las tres rutas. Usa **validación limitada de patrones**: no es un compilador, no ejecuta C# y puede rechazar otras soluciones válidas. Los cuestionarios y sus porcentajes se conservan. Las métricas de programación se muestran por separado; los borradores, intentos y uso de ayuda se guardan al interactuar y se incluyen al exportar JSON v2. Los archivos anteriores siguen siendo importables.

La sincronización opcional incluye las métricas nuevas; los borradores se trasladan por JSON. Ver [propuesta, investigación y limitaciones](docs/CSHARP-LAB-2-REVIEW.md). Prueba adicional: `node tests/lab-v2.cjs`. No se necesita compilar ni agregar dependencias de producción para usar esta versión en GitHub Pages.
