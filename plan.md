# Digari Studio — plan de trabajo

Estados: **Completada** solo con evidencia verificable; **En curso** si hay cambios actuales; **Pendiente** por defecto. Responsable de implementación y revisión: José Manuel Castro Moya (confirmado por prompt del proyecto; revisar autoría final). Commits se completarán por fase. No registrar mediciones, pruebas, revisión humana ni demo como realizadas antes de ejecutarlas.

| ID | Fase / tarea | Dependencias | Responsable | Estado | Entregable y criterio de cierre | Prueba / evidencia | Commit |
|---|---|---|---|---|---|---|---|
| P0-01 | Verificar raíz autorizada, `.git`, rama, remotos y base | — | Agente + estudiante | En curso / bloqueada por resolución Git | `rev-parse --show-toplevel` coincide exactamente con `Proyecto Final -Dagari`; sin escribir repo superior | Comandos Git reproducibles y estado de archivos | Pendiente |
| P0-02 | Leer consigna, prompt y consolidar auditoría existente | — | Agente | Completada parcialmente | Requisitos y observaciones registradas en documentos; no repetir inspección masiva del sitio | Consigna textual leída; auditoría fuente identificada; vacíos del navegador declarados | Pendiente |
| P0-03 | Definir problema, usuarios, alcance y métrica | P0-02 | Agente; revisión estudiante pendiente | Pendiente | `intent.md` separa hechos, supuestos y datos demo; define objetivo ≤5 min y medición comparable | Revisión contra rúbrica y confirmar que base es hipótesis | Pendiente |
| P0-04 | Especificar RF, reglas, datos, API, arquitectura y privacidad | P0-03 | Agente; revisión estudiante pendiente | Pendiente | `spec.md` con RF-01…RF-05, contratos y criterios observables | Checklist de aceptación enlazable a pruebas futuras | Pendiente |
| P0-05 | Descomponer tareas y demo | P0-03, P0-04 | Agente | Pendiente | `plan.md` incluye dependencias, responsable, estado, prueba y commit por tarea | Rúbrica 100 puntos, demo 12+3 min y caso inválido | Pendiente |
| P0-06 | Registrar auditoría pública y límites pendientes | Auditoría suministrada | Agente | Pendiente | `docs/auditoria-digari.md` contiene rutas observadas, alcance prototipo y verificaciones no posibles | No repetir auditoría completa; navegador interactivo pendiente | Pendiente |
| P0-07 | Revisar consistencia y guardar commit base P0 | P0-01…P0-06 | Estudiante + agente | Bloqueada por raíz Git | Archivos P0 revisados, origin correcto desde `origin/main`, commit descriptivo publicado si autenticación funciona | `git status`, diff, `rev-parse`, build no aplica a P0 | Pendiente |
| P1-01 | Arranque Next.js/TypeScript reproducible Windows, SQLite, semilla y README | P0-07 | Agente + revisión estudiante | Pendiente | Instalación limpia con comandos verificados; no secretos | Instalación y carga de catálogo demo | Pendiente |
| P1-02 | Catálogo, búsqueda, filtros, ficha, variantes, favoritos y comparación | P1-01 | Agente | Pendiente | RF-01 operable con productos sintéticos | Filtros, inválidos, 2–3 comparación, persistencia local | Pendiente |
| P1-03 | Pedido demo, idempotencia, transiciones y seguimiento | P1-02 | Agente | Pendiente | RF-04 persistente sin pago real | Stock/cantidad inválida, duplicado, token y estado tras reinicio | Pendiente |
| P1-04 | Servicios y contacto | P1-01 | Agente | Pendiente | RF-05 con servicio sintético, estados y contactos enlazados | Crear/consultar/actualizar y transiciones inválidas | Pendiente |
| P1-05 | Primer ciclo IA documentado | P1-02…P1-04 | Agente; revisión estudiante | Pendiente | `docs/uso-ia.md` registra prompt, resultado, revisión/corrección real, commit | Evidencia de trabajo efectivamente ejecutado | Pendiente |
| P2-01 | Estudio Three.js/modelos por familia y fallback | P1-02 | Agente | Pendiente | RF-02 3D útil y etiquetado ilustrativo | Navegación escritorio/móvil/teclado y modo sin WebGL | Pendiente |
| P2-02 | Audio sintético y comparador A/B | P2-01 | Agente | Pendiente | Audio bajo demanda y advertencias de simulación | Reproducción manual, octavas/tonalidades; no autoplay | Pendiente |
| P3-01 | Asesoría contextual Gemini y alternativa determinista | P1-02 | Agente | Pendiente | RF-03 útil con o sin clave | Agente simulado: inválido, candidatos, fuera de catálogo, timeout | Pendiente |
| P4-01 | Suite automatizada, build, rendimiento, accesibilidad y móvil | P1…P3 | Agente + revisión estudiante | Pendiente | Comandos reproducibles y hallazgos corregidos/documentados | Flujo completo, errores, persistencia, ruta catálogo y carga 3D medidas | Pendiente |
| P4-02 | Negocio, uso de IA, demo y ensayo | P4-01 | Estudiante + agente | Pendiente | `docs/negocio.md`, `docs/uso-ia.md` con ≥3 ciclos reales y `docs/demo.md` | Ensayo de 12 min + 3 min preguntas; revisión humana explícita | Pendiente |
| P5-01 | Verificar acceso, tag/commit final y entregar | P4-02 | Estudiante | Pendiente | README/rúbrica completos, remoto accesible y SHA/tag identificable | Acceso del docente y demo reproducible | Pendiente |

## Trazabilidad requisito → tarea → comprobación

| Requisito | Tareas | Comprobación de cierre |
|---|---|---|
| RF-01 | P1-02, P4-01 | Buscar/filtrar, ficha/variantes, comparar 2–3, favorito tras recarga y entrada inválida |
| RF-02 | P2-01, P2-02, P4-01 | Rotación 3D real/procedural, controles accesibles, reproducción iniciada por usuario y fallbacks |
| RF-03 | P3-01, P4-01 | Presupuesto insuficiente/entrada inválida, solo IDs candidatos y fallback sin proveedor |
| RF-04 | P1-03, P4-01 | Total servidor, stock y cantidad inválidos, idempotencia, token, persistencia y transición |
| RF-05 | P1-04, P4-01 | Solicitar, consultar, transición permitida/rechazada y contacto externo sin envío |
| Métrica de negocio | P4-02 | Mismo caso y condiciones en sitio actual/prototipo; mediana y tasa de éxito, base no medida identificada |
| Demo/rúbrica | P4-02, P5-01 | Flujo vivo, error, prueba automatizada, docs, commits y acceso verificado |

## Demo prevista

Caso: músico principiante busca guitarra bajo un presupuesto CRC dado para tocar en casa; elige por tipo/uso/estilo, compara dos opciones demo, gira el modelo y escucha sonido sintético; confirma pedido de demostración, recarga y consulta el código; después registra una solicitud demo de afinación y muestra seguimiento/actualización. Incluir cantidad inválida y stock insuficiente, prueba automatizada, instrucciones para instalación, límites y contingencia sin Gemini/WebGL/audio. Duración objetivo 12 minutos de operación y 3 de preguntas. Caso y precios sintéticos, no oferta de Digari.
