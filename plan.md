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
| P1-01 | Arranque Next.js/TypeScript reproducible Windows, SQLite, semilla y README | P0-07 | Agente + revisión estudiante | Completada técnicamente | App Router, Node `node:sqlite`, lockfile npm, 15 fichas semilla y `.env.example` | `npm ci`, tests, lint y build ejecutados; revisión humana pendiente | Commit P1 |
| P1-02 | Catálogo, búsqueda, filtros, ficha, variantes, favoritos y comparación | P1-01 | Agente | Implementada; revisión visual manual pendiente | RF-01 con búsqueda, familia/categoría, rango CRC, estilo/uso, disponibilidad, variantes, favoritos/valoración local y comparación 2–3 | Suite y smoke HTTP; captura headless no inició por procesos Chrome existentes; verificar UI/escritorio/móvil/teclado manualmente | Commit P1 |
| P1-03 | Pedido demo, idempotencia, transiciones y seguimiento | P1-02 | Agente | Completada técnicamente | RF-04 total del servidor, descuento de stock demo, WebCrypto/hash y eventos SQLite | Unit tests y smoke API: cantidad/stock inválidos, reintento, código privado y cambio de estado | Commit P1 |
| P1-04 | Servicios y contacto | P1-01 | Agente | Implementada; verificación manual de enlaces pendiente | RF-05 registro/consulta/avance demo; contactos reportados con enlaces oficiales identificables | Unit tests y smoke API de servicio/transición; confirmar canales originales antes de presentar | Commit P1 |
| P1-05 | Primer ciclo IA documentado | P1-02…P1-04 | Agente; revisión estudiante | Ciclo documentado; revisión humana pendiente | `docs/uso-ia.md` registra tarea, extracto, resultado, correcciones y pruebas | Revisión humana del estudiante pendiente; no se registra aprobación de UI/datos en su nombre | Commit P1 |
| P2-01 | Estudio Three.js/modelos por familia y fallback | P1-02 | Agente | Implementada; revisión navegador pendiente | 15 fichas mapeadas a geometría procedural; visor bajo demanda, control 360°/elevación/zoom, teclado, tacto, fallback y limpieza de recursos | 12 pruebas, lint, build y smoke API pasaron; Chrome/Edge headless fallaron antes de capturar por GPU no disponible. Falta verificación visual de tacto/teclado/fallback en escritorio y móvil | `Implementar estudio 3D y audio demo` |
| P2-02 | Audio sintético y comparador A/B | P2-01 | Agente | Implementada; escucha manual pendiente | Notas y escalas de 12 tonalidades, triadas y progresiones; Web Audio bajo demanda; A/B con búfer común y nivel B corregido por RMS | Suite valida notas, E♯/F y B♯/C, 12 escalas y progresiones; escuchar manualmente cuando navegador esté disponible. Sin medición física | `Implementar estudio 3D y audio demo` |
| P3-01 | Asesoría contextual Gemini y alternativa determinista | P1-02 | Agente | Pendiente | RF-03 útil con o sin clave | Agente simulado: inválido, candidatos, fuera de catálogo, timeout | Pendiente |
| P4-01 | Suite automatizada, build, rendimiento, accesibilidad y móvil | P1…P3 | Agente + revisión estudiante | Pendiente | Comandos reproducibles y hallazgos corregidos/documentados | Flujo completo, errores, persistencia, ruta catálogo y carga 3D medidas | Pendiente |
| P4-02 | Negocio, uso de IA, demo y ensayo | P4-01 | Estudiante + agente | Pendiente | `docs/negocio.md`, `docs/uso-ia.md` con ≥3 ciclos reales y `docs/demo.md` | Ensayo de 12 min + 3 min preguntas; revisión humana explícita | Pendiente |
| P5-01 | Verificar acceso, tag/commit final y entregar | P4-02 | Estudiante | Pendiente | README/rúbrica completos, remoto accesible y SHA/tag identificable | Acceso del docente y demo reproducible | Pendiente |

## Trazabilidad requisito → tarea → comprobación

| Requisito | Tareas | Comprobación de cierre |
|---|---|---|
| RF-01 | P1-02, P4-01 | Buscar/filtrar, ficha/variantes, comparar 2–3, favorito tras recarga y entrada inválida |
| RF-02 | P2-01, P2-02, P4-01 | Suite valida 15 mallas y datos musicales; falta revisión visual/auditiva real en navegador, tacto, teclado y fallback WebGL |
| RF-03 | P3-01, P4-01 | Presupuesto insuficiente/entrada inválida, solo IDs candidatos y fallback sin proveedor |
| RF-04 | P1-03, P4-01 | Total servidor, stock y cantidad inválidos, idempotencia, token, persistencia y transición |
| RF-05 | P1-04, P4-01 | Solicitar, consultar, transición permitida/rechazada y contacto externo sin envío |
| Métrica de negocio | P4-02 | Mismo caso y condiciones en sitio actual/prototipo; mediana y tasa de éxito, base no medida identificada |
| Demo/rúbrica | P4-02, P5-01 | Flujo vivo, error, prueba automatizada, docs, commits y acceso verificado |

## Demo prevista

Caso: músico principiante busca guitarra bajo un presupuesto CRC dado para tocar en casa; elige por tipo/uso/estilo, compara dos opciones demo, gira el modelo y escucha sonido sintético; confirma pedido de demostración, recarga y consulta el código; después registra una solicitud demo de afinación y muestra seguimiento/actualización. Incluir cantidad inválida y stock insuficiente, prueba automatizada, instrucciones para instalación, límites y contingencia sin Gemini/WebGL/audio. Duración objetivo 12 minutos de operación y 3 de preguntas. Caso y precios sintéticos, no oferta de Digari.

### Revisión P2 pendiente

En `/estudio`, elegir y activar un producto de cada familia registrada, arrastrar 360° y cambiar elevación/zoom con ratón, tacto y teclado; restablecer; probar el fallback con WebGL deshabilitado. Activar cada nota manualmente; verificar que no haya autoplay; escuchar las dos progresiones y A/B en un equipo de audio real sin presentar la simulación como medición. Chrome y Edge headless no llegaron a capturar la ruta: ambos informaron que el proceso GPU no estaba disponible. Medir carga o FPS solo con herramienta/equipo identificado y anotar versión, dispositivo y método; no hay mediciones de runtime. La revisión del estudiante queda pendiente.
