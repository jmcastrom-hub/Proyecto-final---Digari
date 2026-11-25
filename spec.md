# Digari Studio — especificación P0

## Alcance y actores

Prototipo académico local para clientes y operador de demostración. El servidor es autoridad para catálogo, precios demo, stock demo, pedidos, servicios y transiciones. Contenido externo es solo enlace informativo; no hay integración con sistemas de Digari.

## Requisitos funcionales

### RF-01 — Catálogo y comparación

**Entrada:** texto de búsqueda, tipo/familia, rango CRC, disponibilidad, estilo/uso e IDs para comparación. **Salida:** fichas filtradas con precio y stock etiquetados como demo, atributos y motivos de compatibilidad; tabla de 2–3 productos; favoritos/valoración personal locales.

**Aceptación observable:** buscar y filtrar actualiza resultados; filtros inválidos o rango mínimo > máximo producen validación clara; solo se comparan de 2 a 3 IDs existentes y distintos; se puede abrir ficha y seleccionar variante válida; favoritos sobreviven recarga en el mismo navegador. Sin resultados ofrece limpiar filtros. No copiar precios/stock del sitio como actuales.

### RF-02 — Estudio 3D/audio

**Entrada:** ID de producto compatible, controles de vista y acción de reproducción. **Salida:** modelo 3D procedural/GLB ilustrativo con giro 360°, elevación, zoom, reinicio y alternativa accesible; audio Web Audio o muestra autorizada; comparación A/B de perfiles claramente simulados.

**Aceptación observable:** controles de mouse/táctiles/teclado y etiquetas se verifican; el modelo se distingue como ilustrativo salvo que se licencie y verifique uno exacto; sonido inicia solo por acción del usuario; audio A/B usa misma señal con volumen equiparado y explica que la simulación no reproduce especificación real; si WebGL/audio falla se presenta alternativa e instrucción. Carga diferida del motor y muestras.

### RF-03 — Asesoría Gemini con continuidad local

**Entrada:** presupuesto CRC positivo, tipo, uso/estilo y texto acotado. **Salida:** hasta tres IDs candidatos, explicación, pregunta si faltan datos y etiqueta del modo Gemini o local.

**Aceptación observable:** servidor filtra candidatos por presupuesto/tipo/stock/compatibilidad; valida que IDs sugeridos estén en candidatos; clave ausente, timeout, cuota/error activa fallback determinista con mismos filtros; entrada demasiado larga/inválida se rechaza; Gemini nunca dicta precio, stock, orden o estado. Enviar solo preferencias y atributos de catálogo, nunca PII, credenciales ni historial de pedido. El historial opcional local se puede borrar y no se comparte al proveedor.

### RF-04 — Pedido/pago demo y seguimiento

**Entrada:** líneas `{productId, variantId?, quantity}`, opción simulada de retiro/envío no operativo y confirmación idempotente. **Salida:** total recalculado por servidor, código privado de consulta y estado/eventos mínimos.

**Aceptación observable:** pantalla indica “Pedido de demostración”; no pide tarjeta ni ejecuta cobro/reserva/entrega; servidor recalcula importes desde catálogo vigente demo; rechaza cantidad no entera o menor que 1, variante inválida y stock insuficiente; doble confirmación con misma clave idempotente registra una orden; token aleatorio de alta entropía permite consultar solo código, fecha, líneas resumidas y estado. Recibido → en preparación → listo/enviado → entregado; transiciones inválidas se rechazan. Persistencia SQLite comprobada tras reinicio.

### RF-05 — Servicios y contacto

**Entrada:** tipo (afinación, calibración, restauración, reparación), descripción acotada, canal de contacto demo y código privado de consulta; actualización por operador demo autorizado. **Salida:** código, estado y eventos.

**Aceptación observable:** validación requiere tipo y descripción no vacía con longitud máxima; registra localmente solicitud sintética; operador demo validado solo en entorno local y puede avanzar recibido → diagnóstico → en proceso → listo → entregado respetando transiciones; consulta revela datos mínimos. Contactos/sucursales enlazan a páginas públicas verificadas y se identifican como información del sitio fuente; formulario demo no envía nada. El taller propuesto no se presenta como servicio observado de Digari.

## Reglas comunes y errores

- CRC entero no negativo para importes; cantidades enteras positivas; filtros y entradas acotados.
- Identificadores foráneos existentes, lista de comparación máximo tres, no duplicados.
- Operaciones críticas son transaccionales; cambios de estado generan evento inmutable y validan transición.
- Mensajes de error no exponen stack, secretos, tokens completos ni información de otras personas.
- Datos demo tienen etiqueta visible y origen documentado; la interfaz no sugiere disponibilidad comercial.

## Modelo de datos propuesto

- `Product(id, slug, name, family, category, description, priceCrc, demoStock, styleTags, useTags, compatibilityJson, variantsJson, modelRef, audioProfileRef, isDemo)`.
- `Favorite(id, productId, rating?, createdAt)` asociado a sesión anónima local; datos en navegador o SQLite según decisión de implementación.
- `Order(id, publicCodeHash, idempotencyKey, status, fulfillmentDemo, totalCrc, createdAt)`; `OrderLine(orderId, productId, variantId?, quantity, unitPriceCrc)`; `OrderEvent(orderId, fromStatus?, toStatus, actor, createdAt)`.
- `ServiceRequest(id, publicCodeHash, type, description, status, createdAt)`; `ServiceEvent(requestId, fromStatus?, toStatus, actor, createdAt)`.
- Catálogo semilla separado de transacciones. No conservar nombre/teléfono/correo real; para contacto emplear datos ficticios o enlace externo sin envío.

## Contratos de API propuestos

JSON, rutas Next.js `/api`; códigos 200/201 para éxito, 400 entrada inválida, 404 recurso/token desconocido, 409 stock/idempotencia/transición en conflicto, 429 límite excedido, 503 integración IA no disponible (con fallback local disponible).

| Método y ruta | Entrada principal | Respuesta |
|---|---|---|
| `GET /api/products?q&family&minPrice&maxPrice&inStock&style` | filtros acotados | `{items: ProductSummary[], total}` |
| `GET /api/products/:id` | ID/slug | `ProductDetail` con variantes demo |
| `POST /api/advice` | `{budgetCrc?, family?, style?, use?, question?}`; cuerpo hasta 4 KB | 200 `{mode, message, question, recommendations:[{productId, name, family, priceCrc, stockDemo, style, compatible, reason, href, compareHref}]}`; 400 entrada inválida; 413 cuerpo largo; 429 límite local |
| `POST /api/orders` | `{items, fulfillment, idempotencyKey, trackingCode}` | `201 {duplicate:false, trackingCode, totalCrc, status}`; repetición con la misma clave/código responde `200` con `duplicate:true` sin crear otro pedido |
| `POST /api/orders/lookup` | `{trackingCode}` | `{status, events, summary}` mínimo |
| `POST /api/services` | `{type, description}` | `201 {serviceId, trackingCode, status}` |
| `POST /api/services/lookup` | `{trackingCode}` | `{status, events, summary}` mínimo |
| `POST /api/operator/status` | `{kind, trackingCode, nextStatus, operatorToken}` | `{status}`; token solo en demo/local |

Validación de esquema en servidor; límites de frecuencia y tamaño en endpoints públicos. Nunca incluir `operatorDemoToken` en consultas/respuestas ni registrar secretos.

### P3 — contrato implementado de asesoría

`/asesoria` muestra el historial, un campo libre y los controles Enviar/Empezar de nuevo; no presenta un formulario separado de preferencias. El contexto estructurado (tope, tipo, estilo y uso) se conserva en `localStorage` para seguimientos, pero una pregunta general nueva sobre el inventario lo limpia. Cada petición de servidor consulta el catálogo vigente completo en SQLite y evalúa disponibilidad, criterios y presupuesto antes de escoger hasta tres productos diversos. «Mostrame más» excluye todos los IDs ya mostrados en el tema actual. Con tope sin coincidencias, la respuesta separa alternativas por encima del monto. Cada tarjeta toma nombre, precio demo, existencias, foto y enlace del catálogo. Gemini solo explica los IDs elegidos por el servidor; su modo y el modo local usan la misma selección y fallback. El proveedor opera con `store:false`; no se usa estado conversacional remoto. Límites: cuerpo 4 KB, texto 240 caracteres, 12 solicitudes/minuto por dirección, salida hasta 420 tokens y timeout 8 s.

## Arquitectura y tecnología

Next.js + TypeScript (interfaz y rutas de servidor), SQLite (persistencia local relacional/transaccional; migraciones y semilla reproducibles en Windows), Three.js (modelo 3D real y controles; carga bajo demanda) o alternativa equivalente con explicación. Web Audio API para tonos sintéticos; Gemini opcional del lado servidor con `GEMINI_API_KEY` y `GEMINI_MODEL`, sin requisito de pago. Si no hay clave o conexión, recomendador local determinista. Evitar dependencias de nube para ejecutar la demo. Lockfile, `.env.example` sin secretos, instrucciones PowerShell, respaldo de WebGL/audio y datos semilla.

## Privacidad, seguridad y límites

Minimización de datos; códigos de seguimiento no enumerables generados con Web Crypto (pedido) o `randomBytes` (servicio), guardando solo su hash; el código del pedido se mantiene en el navegador hasta recibir confirmación para sostener reintentos idempotentes. No PII real; token de operador exclusivamente local y nunca `NEXT_PUBLIC_*`; límites básicos de tamaño/longitud. No enviar historial o identificadores al proveedor Gemini. No prometer pagos, stock, disponibilidad de taller, recomendación profesional ni sonido/modelos exactos. Revisión humana requerida antes de cualquier adaptación al negocio. SQLite/local demo no es despliegue multiusuario robusto.

## Verificación y demo

Pruebas planeadas: flujo de búsqueda/filtro/comparación; presupuesto sin resultados y respuesta IA inválida/proveedor caído; total servidor, variante/cantidad/stock inválidos e idempotencia; seguimiento válido/token inválido/transición inválida; servicio, persistencia tras recarga/reinicio; accesibilidad básica, teclado, móvil, fallback WebGL/audio. Demo de 12 minutos y 3 de preguntas: contexto/caso, buscar recomendación con límite CRC, comparar dos productos y probar estudio, confirmar pedido demo y consultar después de recargar, servicio y avance de estado, entrada inválida, pruebas/documentos/supuestos. No presentar pruebas todavía no ejecutadas como completadas.


## Verificación P4 y alcance operativo

La instalación usa `npm ci`, Node 22.13 o superior y SQLite local. `DIGARI_DB_PATH` opcional permite aislar una base temporal; por defecto se usa `data/digari.sqlite`. El seed crea 15 productos sintéticos al iniciar una base nueva. No se requiere cuenta de nube ni API key.

| Requisito | Aceptación automatizada / observable | Estado y evidencia |
|---|---|---|
| RF-01 Catálogo | Búsqueda, presupuesto/rango, familias, comparación de 2–3 fichas, datos de compatibilidad; variante inválida rechazada | `tests/orders.test.ts`, `tests/advisor.test.ts`, `tests/api-smoke.mjs`; interfaz en `docs/validacion-p4.md` |
| RF-02 Estudio | Three.js bajo demanda, 15 geometrías, controles de giro, audio por acción y vista alternativa | `tests/models.test.ts`, `tests/audio-profiles.test.ts`, evidencia P2.1/P4; tacto y escucha física pendientes |
| RF-03 Asesoría | Fake provider valida IDs; presupuesto insuficiente/inválido; clave vacía usa modo local | `tests/advisor.test.ts` y smoke API; llamada autenticada Gemini pendiente |
| RF-04 Pedido y seguimiento | Total/stock recalculados, variante/cantidad validadas, confirmación idempotente, código hash y lectura tras reiniciar proceso | `tests/orders.test.ts`, `tests/api-smoke.mjs` |
| RF-05 Servicio/contacto | Solicitud, consulta, evento, transición secuencial, token inválido sin cambiar estado; contacto no envía | `tests/orders.test.ts`, `tests/api-smoke.mjs`; contacto externo no se ejecuta |

GitHub Actions (`.github/workflows/ci.yml`) repite `npm ci`, tests, lint, build y smoke del servidor. Los datos y códigos demo son locales; no migrar el token de operador, base SQLite ni credenciales al navegador/CI. No se considera el prototipo listo para producción o para operar datos de clientes.

## Contrato vigente de la refactorización RX

### Datos demo y migración

Las 15 fichas conservan sus IDs y referencias a geometría. La marca es una propuesta de categoría, no una asociación comercial verificada; no se afirma un número de modelo específico. Nombres, compatibilidad, precio y stock son sintéticos. El inventario de demostración propuesto es: Yamaha acústica ₡84 900 (8); Squier eléctrica ₡109 900 (6); Ibanez bajo ₡129 900 (5); Casio teclado ₡79 900 (8); Kala ukelele ₡29 900 (12); Yamaha flauta dulce ₡6 900 (10); D’Addario cuerdas ₡5 900 (12); Hosa cable ₡7 900 (10); Vandoren caña ₡3 500 (12); Behringer micrófono ₡23 900 (8); PreSonus monitor ₡54 900 (6); Behringer parlante activo ₡99 900 (4); Numark DJ ₡89 900 (4); Audio-Technica audífonos ₡26 900 (10); M-Audio interfaz ₡49 900 (6).

La migración `brands-prices-stock-2026-01` es transaccional e idempotente: actualiza las 15 fichas en su lugar, sin borrar tablas ni cambiar pedidos, líneas históricas, estados/eventos o solicitudes de servicio. Las pruebas se ejecutan con `DIGARI_DB_PATH` apuntando a SQLite temporal; no deben invocar rutinas de reset sobre `data/digari.sqlite`.

### Conversación de asesoría

`POST /api/advice` recibe texto libre y hasta 100 IDs anteriores para paginar sin repetición. El servidor comprueba esos IDs contra la lectura completa de SQLite, extrae un monto explícito (incluido ₡0), aplica el tipo/estilo/uso mencionados y no arrastra filtros heredados a preguntas generales de inventario. Resume familias con existencias y selecciona hasta tres candidatos tras evaluar todo el conjunto relevante. «Mostrame más» continúa sobre los candidatos no vistos; «más barato» conserva los criterios y usa el precio de las recomendaciones previas como referencia. Los resultados bajo tope y las alternativas sobre tope se devuelven en colecciones separadas. Nombre, precio, stock, foto y ruta de ficha provienen del catálogo. Gemini solo recibe los candidatos ya elegidos por el servidor y puede explicar sus diferencias; no controla selección, precio ni existencia. El modo local aplica el mismo algoritmo. Los IDs fuera del catálogo se rechazan.

### Superficies y controles del Estudio

Texto marfil se usa sobre nogal/carbón oscuros; texto oscuro sobre superficies claras reservadas para ilustración de producto. Selectores, resumen de ficha, especificaciones, tarjetas de audio, controles y pie del Estudio usan el primer esquema; la escena/canvas es decorativa y sin texto superpuesto. Los controles del visor mantienen foco visible, rotación por puntero, flechas, zoom, elevación y reinicio. El motor/modelo Three.js se importa solo al activar el visor; si falla WebGL se ofrece la ilustración SVG asociada a la ficha con etiqueta de alternativa.

La auditoría de contraste y las mediciones reproducibles de esta refactorización se registran en `docs/auditoria-refactor.md`. Los fondos oscuros del Estudio usan texto marfil/secundario y las superficies claras de catálogo/formularios usan tinta oscura. Las pruebas browser verifican 11 rutas en escritorio, móvil y ventana equivalente a zoom 200%, 15 canvas WebGL y controles en frente/costado/reverso. El visor se precarga ante foco o puntero y el audio únicamente al abrir su sección; la reproducción requiere una acción explícita. No se midió mejora de carga fría 3D y el giro quedó esencialmente igual.

El inventario se actualiza transaccionalmente sobre las filas existentes. Antes y después se revisan los conteos de pedidos, líneas, eventos y servicios; una prueba SQLite separada comprueba además que la migración no cambia los datos históricos de una solicitud. La carpeta de evidencia compara capturas antes/después y el archivo JSON conserva las 33 mediciones de vista. La tercera imagen de referencia solicitada no estaba presente en los archivos accesibles, por lo que las maquetas se ajustaron a la descripción textual.
# Nota de verificación visual posterior (RX-08)

La interfaz aplica texto de 16 px como base para lectura y controles frecuentes, superficies de texto diferenciadas para modo carbón y superficie clara, estados de foco y desplazamiento con espacio reservado al encabezado fijo. En el Estudio el contraste observado supera WCAG AA en selector y paneles (14.57:1 y 13.51:1, respectivamente). Los resultados de navegación a escritorio, móvil y viewport ampliado, además de la galería de cada producto, se versionan en `docs/evidencia-acabado/README.md`. La geometría procedural sigue siendo ilustrativa y no se presenta como réplica comercial.
