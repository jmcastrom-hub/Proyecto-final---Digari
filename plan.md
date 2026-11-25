# Digari Studio — plan y trazabilidad de entrega

Estado referido al candidato cuyo código parte de `0d2f086`; no declara que el estudiante haya ensayado, aprobado o presentado la solución. Los SHA cortos identifican commits de implementación/evidencia en el historial de la rama. Resultados actuales por candidato se registran en [`docs/validacion-entrega.md`](docs/validacion-entrega.md).

## Plan por tareas

| ID | Tarea | Dependencias | Responsable | Estado | Criterio y prueba | SHA |
|---|---|---|---|---|---|---|
| P0-01 | Definir usuario, problema, alcance demo, RF y restricciones | — | Estudiante/Codex | Entregado; aprobación final pendiente | `intent.md`, `spec.md`, consigna PDF como referencia local | `a9ba7a2` |
| P1-01 | Catálogo, búsqueda/filtros, ficha, comparación y favoritos | P0-01 | Codex | Implementado | `tests/orders.test.ts`, tests de asesoría/catálogo y smoke | `2d0e7fb` |
| P1-02 | Carrito/pedido demo, recalcular total, validación, idempotencia y seguimiento SQLite | P1-01 | Codex | Implementado | `tests/orders.test.ts`, `tests/api-smoke.mjs`; reconsulta/persistencia | `2d0e7fb`, `6956e8c` |
| P1-03 | Servicios demo, consulta y transición por operador local | P0-01 | Codex | Implementado; no es flujo productivo | Pruebas de token inválido, transición válida e inválida, smoke | `2d0e7fb`, `6956e8c` |
| P2-01 | Estudio, 15 maquetas 3D, controles y alternativa | P1-01 | Codex | Implementado; revisión humana, tacto y WebGL físico pendientes | `tests/models.test.ts`; evidencia Chrome headless en `docs/validacion-p4.md` y `docs/acabado-visual.md` | `11db023`, `f91c783` |
| P2-02 | Síntesis y perfiles de audio por producto | P2-01 | Codex | Implementado; escucha real pendiente | `tests/audio-profiles.test.ts`; activación explícita, simulación etiquetada | `48470c0` |
| P3-01 | Asesoría conversacional libre con inventario SQLite completo, criterios explícitos y “mostrar más” | P1-01 | Codex | Implementado; aprobación del estudiante pendiente | `tests/advisor.test.ts`, `tests/advice-chat-inventory.mjs`, modo local y proveedor simulado | `92cb8f3`, `d98cc90`, `0d2f086` |
| P3-02 | Gemini opcional del lado servidor y fallback local | P3-01 | Codex | Integrado; llamada real autenticada no verificada en esta entrega | Tests de contrato/fallo simulado; sin clave real ni PII | `f4b5d30` |
| UX-01 | Contraste de categorías y superficies oscuras | P1/P3 | Codex; instrucción correctiva del estudiante | Corregido; aprobación final pendiente | `tests/category-tiles-check.mjs`, capturas desktop/móvil; evidencia complementaria en `docs/evidencia-tema-chat/` | `13c5ed5`, `36080a7` |
| UX-02 | Cierre, Escape, foco y anclaje del menú móvil | UX-01 | Codex; instrucción correctiva del estudiante | Corregido en emulación; teléfono físico pendiente | `docs/evidencia-menu/verificacion.json`, capturas de móvil y 200 % | `90ee345` |
| UX-03 | Chat simple y recomendaciones de todo el inventario | P3-01 | Codex; instrucción correctiva del estudiante | Corregido; revisión humana pendiente | Regresión de consulta general, producto al final, presupuesto, tarjetas y continuidad documentada | `13c5ed5`, `0d2f086` |
| QA-01 | Perfiles de usabilidad simulados | UX | Codex | Histórico; no equivale a personas | 100 perfiles ejecutados sobre `d98cc90`: 100/100 rúbricas aprobadas en esa auditoría. No es ejecución del candidato `0d2f086` | `b08128a` (evidencia); `d98cc90` (base probada) |
| FD-01 | Alinear documentos y preparar demo final | Todo lo anterior | Codex | En cierre documental; revisión/aprobación pendiente | README, intención, spec, plan, guion 12+3, caso comparable y validación por SHA | Este commit de documentación en PR #1 |
| FD-02 | Ensayo oral, revisión/aprobación del estudiante y decisión de merge | FD-01 | José Manuel Castro Moya | **Pendiente** | El estudiante ejecuta el guion, registra su tiempo/resultado y da aprobación explícita. El PR permanece abierto hasta entonces. | Pendiente |

## Trazabilidad requisito → tarea → verificación → SHA

| Requisito | Tarea | Verificación | SHA asociado a código/prueba |
|---|---|---|---|
| RF-01 Catálogo | P1-01, UX-03 | Buscar/filtrar, fichas/precios demo, comparación y foto; smoke y consulta del inventario completo | `2d0e7fb`, `0d2f086` |
| RF-02 Estudio 3D/audio | P2-01/02 | 15 mallas y perfiles en tests; Chrome headless comprobó canvas, interacción y alternativa forzada | `11db023`, `48470c0`, `f91c783` |
| RF-03 Asesoría | P3-01/02, UX-03 | Texto libre, selección del conjunto completo antes del recorte, presupuesto y más resultados; Gemini fake/local | `f4b5d30`, `0d2f086` |
| RF-04 Pedido/seguimiento | P1-02 | Recalcular total/stock, entrada inválida, idempotencia y consulta persistente entre carga/proceso | `2d0e7fb`, `6956e8c` |
| RF-05 Servicio/contacto | P1-03 | Crear/consultar solicitud, autorizar transición demo y contacto enlazado sin envío real | `2d0e7fb`, `6956e8c` |
| Accesibilidad/tema | UX-01 | Categorías, tema/chat, captura escritorio/móvil y teclado | `13c5ed5`, `36080a7` |
| Navegación móvil | UX-02 | Menú cierra al navegar, Escape/clic exterior/cambio escritorio y foco documentados | `90ee345` |
| Usabilidad histórica | QA-01 | 100 perfiles simulados; distintos del candidato, sin participantes reales | `b08128a` |
| Propuesta/criterio comparable y demo | FD-01/02 | Mismo caso y presupuesto en `docs/negocio.md` y `docs/demo.md`; tiempo y éxito humanos aún no medidos | `a9ba7a2`, `6956e8c`; ensayo pendiente |

## Caso único de entrega

Principiante que busca guitarra para practicar en casa, con máximo **₡120 000** para el instrumento. Compara Yamaha F310 a ₡84 900 (`/productos/acustica-luz`) y Squier Affinity Strat roja a ₡109 900 (`/productos/electrica-bruma`), elige y explica cuál se ajusta. Son importes demo. La misma instrucción, tope, criterio de fin y condiciones se aplican a sitio actual y prototipo; la línea base y la tasa de éxito siguen sin medición humana. Objetivo propuesto: mediana ≤5 min.

## Cierre de la rúbrica CENFOTEC y estado

La rúbrica del PDF pide resolver un problema empresarial con un prototipo que complete un proceso de principio a fin y reglas verificables; presentar una propuesta defendible (usuario, problema, indicador y adopción); evidenciar trabajo asistido por IA y revisión humana; y operar la solución en vivo como entrega central, sin requerir diapositivas. README, especificación, guion, caso de negocio y evidencia automatizada respaldan esa demostración. No se afirma que la demostración ya se presentó.

**Pendiente del estudiante:** correr su propio ensayo cronometrado de 12 minutos y sus 3 minutos de preguntas, registrar resultado real, revisar los documentos/interfaz y aprobar explícitamente. No se integra el PR ni se altera `entrega-final-v1.0.0` hasta su aprobación.

## Lista de evidencia frente a la rúbrica PDF

| Criterio | Puntos | Evidencia preparada | Estado real |
|---|---:|---|---|
| Problema y propuesta empresarial | 10 | `intent.md`, usuario, problema como hipótesis, meta | Documentado; validación con personas/Digari pendiente |
| Especificación y arquitectura | 10 | `spec.md`: RF, reglas, datos, contratos, arquitectura y límites | Actualizado contra la app |
| Plan y trazabilidad | 10 | Tablas de tareas y requisito→prueba→SHA en este archivo | Actualizado; CI del candidato tras push |
| Funcionalidad y demo en vivo | 25 | Flujo comprobado en `docs/validacion-entrega.md`, guion `docs/demo.md` | Prueba técnica en Chrome completada; ensayo oral del estudiante pendiente |
| Desarrollo asistido por IA | 10 | `docs/uso-ia.md`, ciclos y tres revisiones del estudiante vinculadas a commits | Cambios documentados; aprobación final pendiente |
| Calidad y supervisión | 10 | Test, lint, build, smoke, protección de secretos y límites | Pruebas técnicas pasaron; Gemini real y revisión estudiante pendientes |
| Repositorio y reproducibilidad | 10 | README, lockfile, copia limpia, CI y PR #1 | CI/candidato por verificar después de publicar; confirmar acceso docente |
| Valor y adopción empresarial | 10 | `docs/negocio.md`, mismo caso para ambos sistemas, supuestos y ruta piloto | Métricas con personas sin medir; aprobación de Digari pendiente |
| Dominio y defensa | 5 | Guion de demo y preguntas preparados | Ensayo y defensa oral dependen del estudiante; pendientes |
