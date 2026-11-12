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

El artefacto incluye solamente `index.html`; no publica tests ni archivos internos. No requiere configurar una ruta base: el sitio es autocontenido y funciona bajo el subdirectorio del repositorio. La configuración del workflow prepara la publicación; no activa Pages ni publica cambios hasta que se suban y se ejecute en GitHub.

También puede publicarse en Cloudflare Pages (framework `None`, sin compilación, raíz como salida) o Vercel como sitio estático.

## Limitaciones

Los fragmentos C# son ilustrativos: no se compilan ni ejecutan. Unity y Wwise son contenidos educativos, sin integración con sus runtimes. La aplicación no sincroniza entre dispositivos; exportá e importá el JSON para trasladar el progreso. El progreso depende del navegador y del origen. El archivo descargado funciona sin conexión, pero no hay un service worker que garantice disponibilidad offline del sitio alojado.
