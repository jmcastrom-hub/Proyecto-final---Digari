# Verificación de preparación de entrega

## Alcance y versión

Rama `refactor/experiencia-digari`. Código probado: `0d2f086c26c167fa3854067a515c748b3107d737`. Se comprobó el PDF CENFOTEC (`Proyecto_Final_LE_Claude_Code (1).pdf`, referencia local no versionada): la entrega central es operar la solución en vivo con un caso empresarial, completar un proceso de entrada/regla/resultado verificable, defender la propuesta empresarial y documentar desarrollo asistido por IA y revisión humana. No requiere diapositivas. Esta verificación prepara el ensayo, no declara que el estudiante lo haya realizado.

No se cambió lógica de la aplicación en esta fase. Instalación, base, pruebas y Chrome usaron la copia limpia `digari-final-clean-f8553c1c35d1477d9985d61d386e5d08` bajo `%TEMP%`; `.env.local` y `data/digari.sqlite` no se copiaron ni modificaron. Gemini se deshabilitó mediante modelo de prueba inválido/ausencia de clave; el valor de `.env.local` no se leyó.

## Instalación, test, lint, build y smoke

Entorno observado: Windows, Node 26.13.0, npm 11.20.0, Next 15.5.29. `npm` invocado como alias PowerShell fue impedido por la política local de scripts (`PSSecurityException`); se usó `npm.cmd`, que ejecuta el binario de npm sin cambiar la política.

| Comando/procedimiento | Resultado |
|---|---|
| `npm.cmd ci` en copia sin `node_modules` | Pasó; 313 paquetes instalados desde `package-lock.json` en 59 s. |
| `npm.cmd test` | Pasó; 39/39, 8 suites, incluye consultas generales, presupuesto cero, uso del inventario completo, candidato al final de la lista, entrada inválida y fallback. |
| `npm.cmd run lint` | Pasó sin errores. |
| Preparación de SQLite vacía antes de compilar | Pasó con `$env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-final-clean-build.sqlite'; node -e "require('./.test-dist/lib/db.js')"`. |
| `npm.cmd run build` | Pasó; Next generó 13 páginas estáticas y rutas API dinámicas. |
| Smoke HTTP con DB temporal y `DIGARI_DEMO_OPERATOR_TOKEN=local-demo-only` | Pasó: 11 páginas, catálogo/filtros, asesoría local y validación, pedido idempotente/código privado, servicio/transiciones y rechazo por stock insuficiente. Servidor en `127.0.0.1:3120`. |

**Nota reproducible de build:** una primera invocación de `next build` con una DB inexistente falló porque varios workers intentaron sembrar productos al mismo tiempo (`UNIQUE constraint failed`). El mismo procedimiento que usa `.github/workflows/ci.yml` —inicializar la DB una vez antes del build— pasó. README documenta ahora ese paso. No se cambió el comportamiento de runtime.

## Recorrido en Chrome normal

Chrome estable **157.0.8103.80**, perfil temporal separado de la cuenta/perfil habitual; URL de la build limpia **http://127.0.0.1:3118/**. El servidor quedó activo al finalizar la comprobación. Gemini no se invocó.

| Paso visible | Resultado observado |
|---|---|
| Asesoría, texto libre | En un mismo compositor se enviaron “¿Qué instrumentos tenés?”, “¿Cuál me recomendás para empezar?” y “¿Hay algo más barato?”. Cada turno produjo respuesta local y tarjetas con fotos/precios/enlaces; el seguimiento barato no repitió la referencia. La regresión ampliada de siete casos pasó además en Chrome automatizado 157: `node tests/advice-chat-inventory.mjs` (evidencia previa relacionada en `docs/qa/advice-chat-inventory.md`). |
| Comparación | Se compararon Yamaha F310 y Squier Affinity Strat roja; la tabla mostró ambos productos (2/3). Los dos precios mostrados, ₡84 900 y ₡109 900, están bajo el tope común de ₡120 000. |
| Estudio | Selección Yamaha F310; visor activado, canvas 1101×672 con WebGL disponible; panel de audio sintético cargó con 14 notas. No se registró una valoración de escucha física. La alternativa WebGL está cubierta por la prueba que fuerza ausencia de contexto en P2.1, no se activó en esta sesión de Chrome. |
| Pedido y regla | La Bolsa mostró Yamaha F310 y total demo ₡84 900, indicó que no cobra tarjeta ni reserva, y el servidor creó pedido sintético. El código quedó omitido del registro. Seguimiento respondió “Recibido” con evento `recibido`; tras recargar la consulta devolvió el mismo estado/evento. La regla de stock insuficiente fue rechazada por el smoke API. |
| Entrada inválida | Código de seguimiento inválido produjo mensaje de validación y no resultado privado. |

URLs probadas: `/asesoria`, `/tienda`, `/carrito`, `/seguimiento?kind=pedido&code=…` (código excluido de este archivo) y `/estudio?product=acustica-luz`. El render de canvas y el panel de audio cargaron; no se afirma que un sonido se escuchara en parlantes físicos.

## No confundir con la auditoría de 100 perfiles

`docs/qa/informe-usabilidad.md` y `docs/qa/resultados-e2e.json` reportan la auditoría **histórica** de 100 perfiles simulados sobre `d98cc905c4fa1a7ccea2124c6e9220c4c836d2f3`: 100 ejecutados, 100 aprobaron los siete rubros de esa suite. Son recorridos automatizados, opiniones sintéticas y otra revisión del código; **no son participantes reales ni se repitieron en `0d2f086`**. Esta entrega solo registra los recorridos de candidato indicados arriba.

## Pendientes que requieren una persona

- José Manuel Castro Moya realiza y cronometra su propio ensayo de 12 minutos de operación + 3 de preguntas; registra tiempo y problemas en un archivo de evidencia después de hacerlo. No se marcó como completado.
- Revisión y aprobación del estudiante sobre documentos, textos, recomendaciones y prototipo; pendiente.
- Medición comparativa con participantes del sitio actual/prototipo usando el caso de **₡120 000**: mediana y tasa de éxito aún sin medir.
- Gemini con clave activa, escucha en equipo real, tacto en teléfono físico y confirmación de permiso/datos con Digari: pendientes.
- Después del ensayo y aprobación: actualizar el PR #1; no fusionar ni alterar `entrega-final-v1.0.0` antes de recibir esa aprobación. CI del SHA candidato se registra en la entrega posterior al push.
