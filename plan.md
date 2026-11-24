# Digari Studio — plan de trabajo

Estados: **Completada** solo con evidencia verificable; **En curso** si hay cambios actuales; **Pendiente** por defecto. Responsable de implementación y revisión: José Manuel Castro Moya (confirmado por prompt del proyecto; revisar autoría final). Commits se completarán por fase. No registrar mediciones, pruebas, revisión humana ni demo como realizadas antes de ejecutarlas.

| ID | Fase / tarea | Dependencias | Responsable | Estado | Entregable y criterio de cierre | Prueba / evidencia | Commit |
|---|---|---|---|---|---|---|---|
| P0-01 | Verificar raíz autorizada, `.git`, rama, remotos y base | — | Agente + estudiante | Completada | Raíz `C:/Users/pc/OneDrive/Desktop/Proyecto Final -Dagari`, rama `main`, `origin` correcto | `git rev-parse --show-toplevel` y estado Git confirmados en P1 | a9ba7a2 |
| P0-02 | Leer consigna, prompt y consolidar auditoría existente | — | Agente | Completada | Consigna, requisitos y matriz de auditoría registrados; no repetir recorrido del sitio | Guía P1 y documentos P0 consultados; vacíos dinámicos conservados | a9ba7a2 |
| P0-03 | Definir problema, usuarios, alcance y métrica | P0-02 | Agente; revisión estudiante pendiente | Documentada; revisión humana pendiente | `intent.md` distingue hechos/supuestos/demo y meta ≤5 min | Comparación propuesta con mediana y tasa de éxito; base aún no medida | a9ba7a2 |
| P0-04 | Especificar RF, reglas, datos, API, arquitectura y privacidad | P0-03 | Agente; revisión estudiante pendiente | Documentada; revisión humana pendiente | `spec.md` define RF-01…RF-05, contratos y criterios observables | P1 implementa RF-01, RF-04 y RF-05; RF-02/03 quedan para fases siguientes | a9ba7a2 |
| P0-05 | Descomponer tareas y demo | P0-03, P0-04 | Agente | Completada; se actualiza por fase | `plan.md` incluye tareas, dependencias, responsables, estado, pruebas y commit | Rúbrica, trazabilidad y caso de demo definidos | a9ba7a2 |
| P0-06 | Registrar auditoría pública y límites pendientes | Auditoría suministrada | Agente | Matriz existente; verificación interactiva pendiente | `docs/auditoria-digari.md` registra rutas, alcance y límites de acceso | No repetir auditoría completa; faltan interacciones visuales manuales | a9ba7a2 |
| P0-07 | Revisar consistencia y guardar commit base P0 | P0-01…P0-06 | Estudiante + agente | Completada según base P0 indicada | Documentos P0 publicados sobre `origin/main`; SHA base conocido | `git log` muestra a9ba7a2 y `main` sigue `origin/main` | a9ba7a2 |
| P1-01 | Arranque Next.js/TypeScript reproducible Windows, SQLite, semilla y README | P0-07 | Agente + revisión estudiante | Completada técnicamente | App Router, Node `node:sqlite`, lockfile npm, 15 fichas semilla y `.env.example` | `npm ci`, tests, lint y build ejecutados; revisión humana pendiente | 2d0e7fb |
| P1-02 | Catalogo, busqueda, filtros, ficha, variantes, favoritos y comparacion | P1-01 | Agente | Implementada; revision estudiante pendiente | RF-01 con filtros CRC, estilo/uso, favoritos locales, ficha y comparacion 2-3 | tests/orders.test.ts + browser rehearsal P4; comprobar en telefono/teclado manualmente | 2d0e7fb |
| P1-03 | Pedido demo, idempotencia, transiciones y seguimiento | P1-02 | Agente | Completada técnicamente | RF-04 total del servidor, descuento de stock demo, WebCrypto/hash y eventos SQLite | Unit tests y smoke API: cantidad/stock inválidos, reintento, código privado y cambio de estado | 2d0e7fb |
| P1-04 | Servicios y contacto | P1-01 | Agente | Implementada; verificación manual de enlaces pendiente | RF-05 registro/consulta/avance demo; contactos reportados con enlaces oficiales identificables | Unit tests y smoke API de servicio/transición; confirmar canales originales antes de presentar | 2d0e7fb |
| P1-05 | Primer ciclo IA documentado | P1-02…P1-04 | Agente; revisión estudiante | Ciclo documentado; revisión humana pendiente | `docs/uso-ia.md` registra tarea, extracto, resultado, correcciones y pruebas | Revisión humana del estudiante pendiente; no se registra aprobación de UI/datos en su nombre | 2d0e7fb |
| P2-01 | Estudio Three.js/modelos por familia y fallback | P1-02 | Agente | Implementado; tacto fisico pendiente | 15 fichas con geometria procedural, carga bajo demanda, giro, teclado, fallback y liberacion | tests/models.test.ts; Chrome Headless/SwiftShader verifico canvas y fallback forzado; telefono pendiente | 11db023, 48470c0 |
| P2-02 | Audio sintetico y comparador A/B | P2-01 | Agente | Implementado; escucha fisica pendiente | Notas/escalas/triadas, Web Audio, A/B simulado; timbre especifico por instrumento | tests/models.test.ts, tests/audio-profiles.test.ts; C=261.63 Hz para guitarra/teclado/bajo en Chrome headless | 11db023, 48470c0 |
| P2.1-01 | Medicion de fluidez, render y perfil por instrumento | P2-01, P2-02 | Agente + revision estudiante | Implementado; escucha y tacto fisico pendientes | Giro coalescido por frame, buffer limitado en alta densidad, perfiles sinteticos separados | docs/medicion-p2.1.md; npm test 23/23, lint/build; Chrome Headless/SwiftShader; audio C y fallback WebGL simulados | 48470c0 |
| P3-01 | Chat de asesoría y continuidad local | P1-02, P2 | Agente | Implementado; revisión estudiante pendiente | `/asesoria`, preferencias CRC/tipo/uso/estilo, hasta 3 recomendaciones y chat borrable en localStorage | Unit tests, lint/build y smoke API; revisar manualmente mensajes, recarga y borrado | f4b5d30 |
| P3-02 | Filtro determinista y respuestas seguras | P3-01 | Agente | Implementado | Servidor filtra presupuesto, familia, stock demo, estilo y compatibilidad; completa lo faltante con preguntas | Pruebas de entrada inválida, datos faltantes, presupuesto insuficiente y razones locales | f4b5d30 |
| P3-03 | Gemini opcional por Interactions API | P3-02 | Agente | Implementado; prueba real pendiente | REST de servidor, `store:false`, modelo configurable, IDs verificados, cuota/frecuencia/tamaño y fallback por error | Fake provider cubre respuesta válida, ID ajeno y timeout; no se usó secreto de un proyecto previo | f4b5d30 |
| P3-04 | Pruebas, privacidad, documentación y demo offline | P3-01…P3-03 | Agente; revisión estudiante pendiente | Implementado; revisión humana pendiente | `.env.example` sin secreto, contratos actualizados, ciclo P3 y camino offline repetible | Repetir `npm test`, `npm run lint`, `npm run build`, smoke API con la clave vacía | f4b5d30 |
| P4-01 | Test automatizado, instalación limpia, carga, accesibilidad y CI | P1-01...P3-04 | Agente; revisión estudiante pendiente | Verificado técnicamente; revisión física pendiente | SQLite temporal, seed reproducible, catálogo/pedido/seguimiento persistente, stock/compatibilidad, variante/token inválidos y ensayo de navegador | `docs/validacion-p4.md`; npm ci, test 25/25, lint, build, smoke API y Chrome headless registrados | P4 (SHA indicado en la entrega) |
| P4-02 | Documentación final y guion de demo | P4-01 | Agente; aprobación estudiante pendiente | Documentado; revisión humana pendiente | README, intent/spec/plan, 4 ciclos IA, negocio y demo 12+3 min; sin atribuir demo oral | `docs/uso-ia.md`, `docs/negocio.md`, `docs/demo.md`; demo oral no presentada | cc622b1 |
| P5-01 | Verificar acceso, tag/commit final y entregar | P4-02 | Estudiante | Pendiente | README/rúbrica completos, remoto accesible y SHA/tag identificable | Acceso del docente y demo reproducible | Pendiente |

## Trazabilidad requisito → tarea → comprobación

| Requisito | Tareas | Comprobación de cierre | Commit asociado |
|---|---|---|
| RF-01 | P1-02, P4-01 | Buscar/filtrar, ficha/variantes, comparar 2–3, favorito tras recarga y entrada inválida | 2d0e7fb, cc622b1 |
| RF-02 | P2-01, P2-02, P4-01 | Suite valida 15 mallas y datos musicales; Chrome headless verificó canvas/arrastre y P2.1 forzó fallback; tacto, escucha y revisión humana pendientes | 11db023, 48470c0, cc622b1 |
| RF-03 | P3-01…P3-04, P4-01 | Suite fake/local cubre presupuesto insuficiente, entrada inválida, candidato ajeno, proveedor caído, validación de IDs y límites de contexto; falta cualquier llamada real autenticada | f4b5d30, cc622b1 |
| RF-04 | P1-03, P4-01 | Total servidor, stock y cantidad inválidos, idempotencia, token, persistencia y transición | 2d0e7fb, P4 |
| RF-05 | P1-04, P4-01 | Solicitar, consultar, transición permitida/rechazada y contacto externo sin envío | 2d0e7fb, P4 |
| Métrica de negocio | P4-02 | Mismo caso y condiciones en sitio actual/prototipo; mediana y tasa de éxito, base no medida identificada | P0, cc622b1 |
| Demo/rúbrica | P4-02, P5-01 | Flujo vivo, error, prueba automatizada, docs, commits y acceso verificado | P0, P4 |

## Demo prevista

Caso: músico principiante busca guitarra para practicar en casa con tope de ₡180,000 para el instrumento (accesorios fuera del presupuesto); compara la acústica Luz y la eléctrica Bruma, ambas bajo el tope, revisa diferencias de uso y compatibilidad, gira el modelo y escucha sonido sintético; confirma pedido de demostración, recarga y consulta el código; después registra una solicitud demo de afinación y muestra seguimiento/actualización. Incluir cantidad inválida y stock insuficiente, prueba automatizada, instrucciones para instalación, límites y contingencia sin Gemini/WebGL/audio. Duración objetivo 12 minutos de operación y 3 de preguntas. Caso y precios sintéticos, no oferta de Digari.

### Revisión manual pendiente después de P4

Chrome 157 headless/SwiftShader verificó en P4 la creación del canvas WebGL, la interacción de arrastre automatizada y el perfil de audio sintético en escritorio; P2.1 también forzó el fallback WebGL. La emulación de viewport móvil 390 px no tuvo overflow, pero no sustituye el tacto en teléfono. Siguen pendientes escucha con equipo real, prueba táctil física y revisión/aprobación del estudiante. No hay mediciones de FPS o latencia física ni evaluación de participantes.

### Evidencia de cierre P3

Verificado localmente: npm test (21/21), npm run lint, npm run build y npm run test:api (11 páginas/rutas). Preview de producción iniciado en http://localhost:3000/; / y /estudio respondieron HTTP 200 con GEMINI_API_KEY vacía y operador demo local. La llamada online autenticada y la revisión manual del estudiante siguen pendientes. P2 continúa con revisión visual/auditiva pendiente por fallo de GPU en Chrome/Edge headless.

### Evidencia P2.1

Ver `docs/medicion-p2.1.md` y `docs/validacion-p4.md` para protocolo y cifras. El P2.1 no encontro una mejora significativa de carga del visor ni de latencia hasta el siguiente frame; elimina actualizaciones React por evento y reduce resolucion en alta densidad. Revision tactile y escucha fisica siguen pendientes. P4 se registra en P4-01/P4-02.


### Estado de cierre P4

Los resultados exactos de instalacion, comandos, seed, browser y demo automatizada se registran en `docs/validacion-p4.md`. Las mediciones de navegador de catalogo y apertura 3D se distinguen de la metrica de tarea (todavia no medida con participantes). La revision del estudiante y la demo oral no se marcan completadas.

## Refactor de experiencia (rama `refactor/experiencia-digari`)

| ID | Tarea | Dependencias | Responsable | Estado | Prueba / evidencia | Commit |
|---|---|---|---|---|---|---|
| RX-01 | Confirmar raíz, rama, remoto, etiqueta y estado inicial; preservar cambios del usuario | P4 | Codex + estudiante | Verificado | Raíz Git exacta; rama `refactor/experiencia-digari`; remoto `origin` del proyecto; etiqueta intacta; `.env.local` no tocado | d482f128 base |
| RX-02 | Revisar las 11 rutas en escritorio, móvil y viewport de 200%; definir superficies de texto | RX-01 | Codex | Verificado; aprobación de estudiante pendiente | 33 combinaciones post; cero desbordamientos; menús desktop/móvil; contraste AA medido. Capturas en `docs/evidencia-refactor/` | Pendiente de commit |
| RX-03 | Corregir contraste y responsive de Estudio, pie y controles; mejorar 15 modelos 3D | RX-02 | Codex | Verificado en Chrome Headless 157; tacto físico pendiente | Suite valida 15 geometrías; canvas WebGL y giros a costado/reverso para 15 fichas; vista SVG disponible | Pendiente de commit |
| RX-04 | Actualizar las 15 fichas demo con marcas propuestas, precios CRC y stock solicitado mediante migración segura | RX-01 | Codex | Verificado; historia preservada | SQLite actual: 15 productos, 1 pedido/línea, 2 eventos, 2 servicios y 4 eventos; prueba de migración conserva historia | Pendiente de commit |
| RX-05 | Continuar asesoría con preferencias y referencias estructuradas; validar cambios naturales y modo local/fake | RX-01 | Codex | Verificado | `npm test`: 31/31; continuidad de opciones más baratas, presupuesto, ensayo y 503 simulado/local | Pendiente de commit |
| RX-06 | Medir antes/después misma configuración y verificar flujos, accesibilidad y rutas | RX-02…RX-05 | Codex; estudiante para revisión física | Verificado en emulación; revisión manual pendiente | Inicio/tienda/asesoría: 57/70/86→69/67/60 ms; visor frío 467.9→488.3 ms; giro 33.30→33.35 ms. Detalle y límites en `docs/auditoria-refactor.md` | Pendiente de commit |
| RX-07 | Actualizar especificación y ciclos IA, guardar commit y publicar rama/PR | RX-01…RX-06 | Codex; revisión del estudiante pendiente | Documentación y validación listas; publicar tras commit | `npm test`, lint, build, smoke API 11 rutas, `git diff --check`; excluir `.env.example`, `.env.local`, consigna/guía/PDF | Pendiente |

El objetivo de cinco minutos continúa siendo hipótesis: no se han reclutado participantes ni medido una línea base comparable de tasa de éxito. La revisión manual del estudiante, tacto en un teléfono físico, escucha en equipo real y llamada Gemini con clave activa siguen pendientes salvo que una evidencia posterior los compruebe expresamente.
