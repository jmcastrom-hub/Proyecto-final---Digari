# Uso de IA — ciclos P1, P2 y P3

## Ciclo 3 · Asesoría contextual y modo local (P3)

- **Tarea:** incorporar una conversación de presupuesto/tipo/uso/estilo con hasta tres opciones, fallback local y Gemini opcional sin afectar pedidos, catálogo ni seguimiento.
- **Extracto del prompt:** “Integra Gemini con datos del catálogo y valida también el flujo offline.”
- **Diseño elegido:** `/asesoria` mantiene turnos y preferencias en `localStorage`; el mensaje libre se conserva localmente y el servidor solo lo transforma en una intención controlada (comparar/alternativas/recomendar). A Gemini van selecciones estructuradas y hasta tres candidatos filtrados; no van turnos previos, texto libre, datos personales, códigos ni estado de pedidos. La salida se limita a IDs/razones/pregunta, cada ID se valida contra candidatos y los datos comerciales se vuelven a leer del catálogo servidor.
- **Contrato consultado:** REST `POST /v1beta/interactions` de Google AI Studio, JSON estructurado en `response_format`, `store:false` y `generation_config.max_output_tokens`; el modelo predeterminado `gemini-3.8-flash` aparece en la lista oficial vigente. El uso del modelo requiere clave propia en `.env.local`; la clave ejemplo está vacía y no se incluyó ningún secreto. [Interactions API](https://ai.google.dev/gemini-api/docs/interactions), [modelos](https://ai.google.dev/gemini-api/docs/models) y [salida estructurada](https://ai.google.dev/gemini-api/docs/structured-output).
- **Límites:** cuerpo 4 KB, texto 240 caracteres, 12 solicitudes/minuto por cliente, salida máxima solicitada 420 tokens y timeout de 8 s. Error/cuota/timeout/respuesta inválida activa los mismos filtros deterministas. El rate limit en memoria solo sirve para el prototipo local. No se comparten historial ni órdenes con el proveedor.
- **Pruebas:** npm test paso 21 pruebas (Gemini fake/local, entrada invalida, candidato ajeno, fallback); lint, build y smoke API pasaron. No hubo llamada autenticada: no se facilito clave del proyecto.
- **Correccion aplicada:** IDs de candidato revalidados por el servidor; fallback local ante error; texto libre e historial no enviados a Gemini.
- **Revisión humana del estudiante:** **pendiente**. Confirmar si la conversación y el mensaje de privacidad se entienden; revisar recomendaciones y enlaces demo. No se registra aprobación.
- **Commit asociado:** `f4b5d30` — Integrar asesoría Gemini con fallback local.

## Ciclo 2 · Estudio 3D y herramientas de audio (P2)

- **Tarea:** asociar modelos 3D procedurales a las 15 fichas, activar el visor/audio bajo demanda, incluir controles accesibles, contenidos musicales y comparación A/B simulada; mantener catálogo, SQLite y flujos demo de P1.
- **Extracto del prompt:** “Implementa el estudio 3D y el audio sin romper el catálogo, el carrito ni el seguimiento. Comprueba que las 15 fichas tengan un modelo 3D asociado, que el visor y el audio carguen bajo demanda y que las simulaciones estén identificadas.”
- **Resultado:** registro de 15 referencias de geometría real Three.js (guitarras acústica/eléctrica, bajo, teclado, ukelele, flauta, cuerdas, cable, caña, micrófono, monitor, parlante, DJ, audífonos e interfaz); migración aditiva de SQLite; controles táctiles y de teclado; alternativas gráficas sin WebGL; audio Web Audio con notas, escalas/triadas, progresiones y perfiles A/B.
- **Límites y supuestos:** todos los modelos son ilustrativos, no reproducciones de productos comerciales. Los perfiles A/B son una transformación digital sobre un búfer común y sintetizado, con corrección RMS calculada en el navegador; no simulan especificaciones o mediciones físicas. No se disponen de muestras grabadas identificadas/autorizadas. Accesorios pasivos no producen tonos atribuidos.
- **Verificacion automatizada:** al commit P2 habia 12 pruebas unitarias acumuladas para pedidos, modelos, geometria y audio; lint, build y smoke API tambien se ejecutaron. Revision humana y escucha fisica pendientes.
- **Revisión manual:** pendiente abrir `/estudio` en navegador de escritorio y móvil, comprobar WebGL y fallback, tacto, teclado, activación/pausa, notas/progresiones y escucha A/B. Se intentó Chrome y Edge headless con perfiles temporales aislados; ambos finalizaron antes de capturar la página con `gpu_data_manager_impl_private` (GPU process isn't usable). No se pudo observar el producto en navegador. No se registran mediciones de FPS, tiempos, latencia o nivel físico porque aún no se midieron. La revisión y aceptación del estudiante también están pendientes.
- **Para retomar la revisión:** iniciar `npm run dev` o `npm start`, abrir `http://localhost:3000/estudio` en Chrome/Edge con aceleración gráfica disponible, activar el visor/audio y repetir en viewport móvil; apagar WebGL para verificar la ilustración alternativa. Verificar controles de puntero/tacto, flechas/+/−/R, no autoplay y la comparación A/B por acción explícita.
- **Revisión humana del estudiante:** **pendiente**. Evaluar calidad/identificación de modelos, ergonomía móvil, escritura musical y etiquetas de simulación. No se atribuye aprobación.
- **Commit asociado:** `11db023` — Implementar estudio 3D y audio demo.

### Correccion P2.1 registrada despues del ciclo 2

- **Tarea:** investigar fluidez y confirmar que el perfil de audio cambie con la ficha.
- **Extracto:** "Mide antes y despues la carga del visor y la respuesta al girar el modelo. Prueba la misma nota en guitarra, teclado y bajo."
- **Resultado:** arrastre coalescido por requestAnimationFrame, sin setState por evento; perfiles de guitarra/teclado/bajo diferenciados. Chrome Headless verifico C a 261.63 Hz y fallback WebGL. Mediana de apertura 445.3 ms base / 447.9 ms P2.1; 100 eventos al siguiente frame 17.0 / 17.7 ms, sin mejora medible.
- **Revision humana:** escucha real y tacto en telefono pendientes.
- **Commit:** 48470c0, Optimizar giro y perfiles de audio del estudio.

## Ciclo 1 · Catálogo y seguimiento de pedidos demo

- **Tarea:** implementar el incremento P1 de Digari Studio a partir de `intent.md`, `spec.md` y `plan.md`: catálogo de 12–16 fichas sintéticas, carrito/checkout sin pago, seguimiento privado y solicitudes/estados demo.
- **Extracto del prompt:** “Implementa la tienda y el flujo de pedido y seguimiento, ejecuta las pruebas, actualiza plan.md y guarda un commit descriptivo. Trabaja solo en P1.” Se tomó la sección P1 de `PROMPTS_PROYECTO_DIGARI.md` como alcance y no se inició P2/P3.
- **Resultado del agente:** esqueleto Next.js/TypeScript; 15 fichas ficticias; búsqueda y filtros de catálogo; ficha con compatibilidad, variantes y origen; favoritos y valoración en navegador; comparación de hasta tres; carrito local; rutas de servidor para listar catálogo, registrar pedidos idempotentes, consultar pedido/servicio y avanzar estados; SQLite local con semilla, líneas y eventos; formularios de contacto/servicio demo; pruebas automatizadas previstas para regla de stock, total, idempotencia y transiciones.
- **Decisiones revisables:** datos únicamente de demostración; el servidor vuelve a leer precios y stock; el código de pedido se crea con Web Crypto y se conserva como hash; los reintentos idempotentes reutilizan el mismo código; códigos de servicio se crean en servidor con aleatoriedad criptográfica y se guardan como hash. Gemini y el estudio 3D/audio quedan para fases posteriores. El panel de operador lleva token local; no es seguridad apta para producción.
- **Correcciones durante el ciclo:** se implementaron transacciones `BEGIN IMMEDIATE` y `busy_timeout` de `node:sqlite`; se acotó la raíz de trazado de Next al proyecto para evitar leer el repositorio superior; el catálogo usa ilustraciones CSS originales en vez de fotos no autorizadas; contacto y horarios heredados se rotulan como información de la auditoría con enlace oficial de confirmación; el código asociado a una clave idempotente se valida para evitar devolver un código ajeno.
- **Pruebas:** al commit P1 existian 7 casos unitarios en tests/orders.test.ts; la suite crecio en ciclos posteriores. La ejecucion P4 se registra en docs/validacion-p4.md y no se atribuye retrospectivamente.
- **Revisión humana del estudiante:** **pendiente**. Confirmar texto/estilo, enlaces/horarios, flujo de operador demo, política local de datos y errores de interfaz en escritorio y móvil. No se registra aprobación ni corrección humana antes de esa revisión.
- **Commit asociado:** `2d0e7fb` — Implementar tienda demo y seguimiento de Digari.


## Ciclo 4 · Cierre verificable P4

- **Tarea:** preparar instalación limpia, cerrar pruebas de pedido/servicio/asesoría local, ensayar el flujo principal y terminar documentos trazables.
- **Extracto del prompt:** “Valida una instalación limpia y ensaya la demo de principio a fin: catálogo, comparación, estudio 3D, pedido demo y seguimiento tras recargar.”
- **Resultado:** copia limpia con `npm ci`; 25/25 tests, lint, build y smoke API aprobados; Chrome headless verificó 15 fichas, comparación de dos, pedido y recarga, canvas WebGL, nota C sintética y consulta de servicio. Evidencia y mediciones puntuales en `docs/validacion-p4.md`.
- **Correcciones aplicadas:** SQLite admite `DIGARI_DB_PATH` para aislar seed y pruebas; se agregaron persistencia entre procesos, compatibilidad en filtro, variant/token inválidos en smoke y CI GitHub Actions. Los valores P2.1 y P4 se mantienen separados.
- **Revisión humana:** pendiente. Revisar escucha en equipo real, tacto en teléfono, fallback visual, claridad de contenidos y guion de demo. Gemini en línea también pendiente por falta de clave activa.
- **Commit asociado:** P4 — Completar validación y documentación (SHA indicado en la entrega).

## Ciclo 5 · Refactor de experiencia y catálogo (RX)

- **Tarea:** corregir el contraste de Estudio, dar continuidad a la asesoría, mejorar las 15 maquetas 3D y actualizar el inventario demo sin alterar la historia SQLite; conservar cambios locales, etiqueta y archivos de referencia del estudiante.
- **Extracto del prompt:** «Trabaja sobre la versión local que contiene d482f128… conserva los cambios locales, .env.local, los datos existentes y la etiqueta entrega-final-v1.0.0… compara asesoría por turnos y registra evidencia antes/después».
- **Resultado:** se definió contraste marfil/nogal y tinta/marfil claro; se actualizaron nombres de marca sugeridos, precios/stock sintéticos; una migración transaccional actualiza filas por ID; geometrías incluyen cuerpo, veta, herrajes, controles o conectores según familia; `conversationId`, preferencias y hasta tres IDs anteriores permiten cambios de presupuesto/uso y «más barato»; se preserva el modo determinista.
- **Revisión humana del agente:** primera prueba de la asesoría indicó que las expectativas de tests usaban el inventario anterior; se ajustaron a los precios nuevos. En la conversación se incorporó el caso «no existe otra ficha más barata» con una respuesta explícita. El runner de pruebas ahora usa SQLite temporal después de verificar que los tests anteriores limpiaban tablas que comparten ruta con los datos locales.
- **Prueba automatizada comprobada:** `npm test` pasó 31/31; incluye geometría para las 15 fichas, migración aditiva que conserva datos históricos, validación de preferencias/IDs, precio y stock servidor, simulación provider y fallback 503. El conteo de datos existentes fue 1 pedido, 1 línea, 2 eventos de pedido, 2 servicios y 4 eventos de servicio antes y después de migrar.
- **Verificación visual/complementaria:** auditoría previa de 11 rutas × escritorio/móvil/200% capturada. Referencia de tercera imagen no venía adjunta al proyecto accesible, por lo que las maquetas siguen especificaciones textuales propias. Escucha real, tacto en teléfono y revisión del estudiante siguen pendientes; Gemini real solo se afirma si se valida una llamada con clave activa.
- **Commit asociado:** se anotará el SHA después del commit selectivo de esta rama. No se modifica la etiqueta final.

### Verificación final del ciclo 5

- **Qué se corrigió tras revisar:** la primera vista previa en `localhost:3110` tenía chunks de Next que devolvían HTTP 400 y dejaba `/estudio` en «Abriendo el estudio…». No se cerró ese listener porque el entorno no permitió identificar con seguridad su propietario. Se inició un servidor de producción independiente en `http://localhost:3113/`; ese sí cargó e hidrató todas las rutas.
- **Pruebas:** `npm test` 31/31; `npm run lint`; `npm run build`; `npm run test:api` con SQLite temporal: 11 rutas, catálogo/imágenes y filtros, asesoría local/validación, pedido repetido idempotente, token inválido, stock, servicio y estados. La base local conserva sus conteos históricos. La llamada externa Gemini no se declara probada.
- **Evidencia visual:** 33 rutas/vistas sin overflow; 15 modelos WebGL comprobados al frente, costado y reverso; menú desktop/móvil y asesoría móvil capturados. Contraste observado 10.76:1–17.26:1 en superficies auditadas. `docs/auditoria-refactor.md` contiene protocolo y resultados; las capturas comparables están bajo `docs/evidencia-refactor/`.
- **Rendimiento observado:** mismas condiciones, Chrome 157, 1440×900 DPR1, cache deshabilitada y cuatro repeticiones. Inicio/tienda/asesoría: mediana `loadEventEnd` 57/70/86 ms antes y 69/67/60 ms después. Visor frío 467.9/488.3 ms; giro a dos frames 33.30/33.35 ms. No se reclama mejora global; el hover precarga cuatro chunks y reduce la espera post-hover medida, pero el total depende del tiempo de lectura.
- **Revisión humana pendiente:** el estudiante debe revisar el aspecto/modelos y aprobar textos/flujo; además quedan prueba táctil en teléfono, escucha en equipo real y Gemini con una clave que dé respuesta válida. La imagen de referencia adicional mencionada no estaba adjunta. El SHA se agrega tras el commit.
