# C# Lab 2.1 — primera etapa del aprendizaje progresivo

## Arquitectura revisada antes de implementar

Base: `origin/main` en `0129299`, con el PR #2 de 2.0 ya fusionado por el usuario. Se creó `review/csharp-lab-2.1`; esta propuesta no fusiona main ni publica el sitio.

La aplicación existente es estática, sin build ni dependencias de producción. `index.html` contiene rutas, cuestionarios, render y persistencia; `progress-v2.js` limpia las métricas del laboratorio; `lab-data.js`, `lab-validator.js` y `lab.js` separan consignas, comparación de patrones y editor. `features.js` gestiona offline/sincronización; `server.cjs` es un backend Node opcional de datos. `sw.js` guarda recursos por alcance. Pages publica una lista explícita de recursos. Se revisaron estas piezas y las cuatro suites antes de tocar archivos.

Decisión: agregar datos curriculares y un motor puro de evidencias, sin reescribir los cuestionarios ni sustituir el editor. El DOM se conecta mediante eventos explícitos. El mismo modelo normaliza datos tanto en navegador como en servidor, para evitar divergencias al sincronizar.

## Implementado

- Mapa de nueve competencias, tres niveles y prerrequisitos visibles, filtrable por las tres rutas. Los tres fundamentos son compartidos. Los niveles 2 y 3 están **planificados**, no se presentan como unidades completas ni acreditadas.
- Diagnóstico inicial de seis preguntas, dos por fundamento, accesible desde el panel inicial. Registra cada respuesta y muestra el último resultado por competencia. Identifica aciertos y temas por revisar sin inferir dominio, ni fabricar evidencias a partir de los aciertos de 2.0. No es obligatorio para acceder a la unidad ni un examen psicométrico validado.
- Unidad 1: variables/tipos, operadores/precedencia/división y condicionales/límites/lógica booleana. Cada tema incluye explicación, ejemplo C#, exploración numérica interactiva, dos prácticas, dos preguntas de evaluación, una aplicación a juegos/audio y enlace al ejemplo correspondiente del laboratorio. Hay 30 preguntas nuevas: 6 diagnósticas, 6 de práctica, 6 de evaluación, 3 de aplicación y 9 de repaso.
- Panel con estados calculados a partir del historial, sin porcentajes de dominio; categorías de errores de respuestas, intentos, pistas, resultados de repasos y últimas 20 evidencias. Desde esta versión se registran también los intentos de los cuestionarios anteriores y las validaciones/pistas del laboratorio. La falta de coincidencia de un patrón no se etiqueta como error de compilación.
- Repasos programados por competencia, cola de actividades y recomendaciones que priorizan diagnóstico pendiente, repasos vencidos y el siguiente contenido disponible. Al completar una aplicación, la recomendación avanza al siguiente fundamento disponible, sin exigir esperar días antes de estudiar otro contenido.
- Proyecto guiado en cuatro pasos: datos/estado; distancia y unidades; reglas de activación; configuración y verificación de Unity/Wwise en el PC. Requiere la aplicación correspondiente y notas secuenciales. Se guardan decisiones/observaciones de 20 a 800 caracteres; se muestran como autodeclaradas y **no** acreditan ejecución de un runtime.
- Se conservan las tres rutas, los 15 cuestionarios, los 15 patrones, borradores, JSON, prácticas descargables, offline y sincronización opcional. No se borran archivos existentes.

## Criterios de evidencia

| Estado | Regla de esta unidad |
| --- | --- |
| Visto | Confirmación explícita de lectura; no basta con abrir la página. |
| Practicado | Al menos una respuesta enviada en la práctica del tema, sea correcta o incorrecta. |
| Comprendido | Visto + practicado + última respuesta correcta en cada una de las dos preguntas de evaluación. No hay botones de pistas en la evaluación. |
| Aplicado | Comprendido + última respuesta correcta en el caso de aplicación al diseño. Es una aplicación conceptual, no una prueba de ejecución en Unity/Wwise. |
| Consolidado | Aplicado + tres repasos programados correctos consecutivos. |

Los estados se recalculan; un error posterior en evaluación puede retirar Comprendido/Aplicado, y un fallo en repaso reinicia la secuencia de Consolidado. Los aciertos históricos siguen visibles aunque no tengan las evidencias nuevas. Las notas del proyecto, un diagnóstico favorable o un patrón coincidente no conceden estados de comprensión por sí solos. Estas reglas son señales educativas transparentes, no certificaciones ni estimaciones de capacidad cognitiva. Las preguntas tienen soluciones finitas y pueden memorizarse.

## Calendario de repaso

Se programa el primer repaso 24 horas después de la primera evaluación completa y correcta. Tras cada acierto, se esperan 3, 7 y luego 14 días; un error reinicia la secuencia y espera 24 horas. El estado Consolidado requiere los tres primeros aciertos programados, además de Aplicado. Llegar tarde cuenta desde la fecha real de respuesta: no se recuperan varios intervalos en una sesión. El banco de tres preguntas por tema rota por resultado aceptado, también tras fallos. Las respuestas/explanaciones anteriores no se muestran antes de responder un nuevo repaso. Se muestran después, como corrección.

Se utiliza el reloj del dispositivo y duraciones de 24 horas, no un calendario de medianoches. El modelo puro permite probar fechas sin esperar días reales. No se envían notificaciones cuando la aplicación está cerrada. Alterar el reloj o editar/importar datos puede alterar las evidencias: no hay validación de identidad o de integridad criptográfica.

## Guardado y compatibilidad

Se conserva la clave `csharp-lab-v1`, `done`, `attempts`, `lab` y el contenedor JSON de versión 2, ampliándolo con `learning: {version: 1, events: [...]}`. Los datos v1/v2 sin `learning` crean un historial vacío sin tocar aciertos ni borradores. Las fechas antiguas no se inventan. El uso de pistas previo mantiene su indicador del laboratorio, aunque no se reconstruya el número de consultas anteriores.

Cada evidencia tiene UUID, fecha, orden causal local, tipo, actividad y respuesta/nota cuando corresponde. El orden evita ambigüedades entre acciones en el mismo milisegundo. El modelo recalcula la corrección a partir de las respuestas, no confía en un booleano `correct` importado. Descarta registros malformados; una versión de historial desconocida se rechaza. El máximo es de 2.000 evidencias: al alcanzarlo se avisa y se conserva el historial, sin eliminar evidencias silenciosamente. La ampliación/archivo del historial queda pendiente.

Se guarda al responder, confirmar lectura, consultar ayuda o registrar una nota. La exportación incluye el historial y la importación lo restaura. Reiniciar borra la copia local con la confirmación existente; un servidor conectado puede restaurar datos remotos, igual que en 2.0. Desconectar antes de iniciar una copia nueva.

La sincronización opcional une evidencias por ID, de forma idempotente y determinista, sin duplicar intentos ya recibidos. Dos eventos diferentes de dispositivos distintos sí se conservan. Los contadores anteriores siguen sus reglas de máximo de 2.0. Las notas del proyecto se sincronizan; los borradores de código siguen siendo locales y se trasladan por JSON. El servidor no ejecuta código. Pages no ofrece ese backend: el modo local, JSON y offline funcionan sin él.

La persistencia sigue dependiendo del navegador y origen. El borrado de almacenamiento, modo privado, políticas de cuota o cambio de dominio pueden impedir conservar datos. Una pestaña con una versión antigua de la aplicación no conoce el nuevo historial: conviene exportar y actualizar las pestañas antes de alternar versiones. No hay edición colaborativa de formularios en varias pestañas.

## Accesibilidad y móviles

Controles nativos, labels, fieldsets, mensajes de estado, navegación sin capturar Tab, estados expresados con texto además de color, tarjetas adaptables y foco visible. Se probaron anchos de 360, 390, 768 y 1280 píxeles en Chromium. Se mantiene el editor accesible de 2.0 y su modo sin resaltado. Las exploraciones son cálculos conocidos de JavaScript, nunca evaluación del texto C# escrito por el estudiante.

## Pruebas

```sh
node server.cjs
# Otra terminal con Playwright disponible:
node tests/learning-model.cjs
node tests/smoke.cjs
node tests/features.cjs
node tests/lab-v2.cjs
node tests/pages-v2.cjs
node tests/learning-ui.cjs
```

El CI del PR ejecuta estas seis suites, sin publicar. El test de Pages usa un servidor estático desechable bajo `/csharp-lab/`, sin API, y ahora verifica mapa y diagnóstico offline. El test del modelo cubre reglas, calendario, fallo/reinicio, prerrequisitos, orden, unión y datos inválidos. El test de UI recorre diagnóstico/unidad/proyecto, comprueba errores/pistas, simula fechas separadas y verifica JSON y sincronización entre dos navegadores. La prueba existente de perfil persistente verifica también que la telemetría 2.1 sobrevive al cierre real de Chromium.

## Falta desarrollar

- Unidades completas de bucles, métodos, componentes, eventos y sistemas de pasos/Wwise. El mapa las identifica como planificadas; sus prácticas antiguas no se eliminan.
- Proyecto ejecutable final con distancia real, superficies, animación y Wwise. El script descargable de 2.0 usa temporizador y no es la implementación final del diseño propuesto.
- Ejecución/compilación real en navegador. La comparación de patrones sigue explícitamente limitada. No se agregaron endpoints de ejecución, SDK propietarios ni claves privadas al cliente.
- Validación pedagógica de las reglas, más variantes de evaluación/transferencia y adaptación avanzada de dificultad. No se implementa un modelo estadístico de dominio.
- Edición colaborativa, archivo de historiales extensos, recordatorios con la aplicación cerrada y cuentas de estudiante.
- Pruebas físicas con Unity/Wwise, Safari, Firefox, celulares y lectores de pantalla. La automatización en Chromium no sustituye estas comprobaciones.

Resultado local: las seis suites pasaron en Chromium, incluidas las comprobaciones de cierre/reapertura y fechas de repaso separadas; pasaron las comprobaciones de sintaxis JavaScript y `git diff --check`. El resultado de CI en GitHub es independiente y debe revisarse en el PR.
