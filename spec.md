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
| `POST /api/advice` | `{budgetCrc, family, style, use, question?}` | `{mode, recommendations:[{productId, reason}]}` |
| `POST /api/orders` | `{items, fulfillment, idempotencyKey, trackingCode}` | `201 {duplicate:false, trackingCode, totalCrc, status}`; repetición con la misma clave/código responde `200` con `duplicate:true` sin crear otro pedido |
| `POST /api/orders/lookup` | `{trackingCode}` | `{status, events, summary}` mínimo |
| `POST /api/services` | `{type, description}` | `201 {serviceId, trackingCode, status}` |
| `POST /api/services/lookup` | `{trackingCode}` | `{status, events, summary}` mínimo |
| `POST /api/operator/status` | `{kind, trackingCode, nextStatus, operatorToken}` | `{status}`; token solo en demo/local |

Validación de esquema en servidor; límites de frecuencia y tamaño en endpoints públicos. Nunca incluir `operatorDemoToken` en consultas/respuestas ni registrar secretos.

## Arquitectura y tecnología

Next.js + TypeScript (interfaz y rutas de servidor), SQLite (persistencia local relacional/transaccional; migraciones y semilla reproducibles en Windows), Three.js (modelo 3D real y controles; carga bajo demanda) o alternativa equivalente con explicación. Web Audio API para tonos sintéticos; Gemini opcional del lado servidor con `GEMINI_API_KEY` y `GEMINI_MODEL`, sin requisito de pago. Si no hay clave o conexión, recomendador local determinista. Evitar dependencias de nube para ejecutar la demo. Lockfile, `.env.example` sin secretos, instrucciones PowerShell, respaldo de WebGL/audio y datos semilla.

## Privacidad, seguridad y límites

Minimización de datos; códigos de seguimiento no enumerables generados con Web Crypto (pedido) o `randomBytes` (servicio), guardando solo su hash; el código del pedido se mantiene en el navegador hasta recibir confirmación para sostener reintentos idempotentes. No PII real; token de operador exclusivamente local y nunca `NEXT_PUBLIC_*`; límites básicos de tamaño/longitud. No enviar historial o identificadores al proveedor Gemini. No prometer pagos, stock, disponibilidad de taller, recomendación profesional ni sonido/modelos exactos. Revisión humana requerida antes de cualquier adaptación al negocio. SQLite/local demo no es despliegue multiusuario robusto.

## Verificación y demo

Pruebas planeadas: flujo de búsqueda/filtro/comparación; presupuesto sin resultados y respuesta IA inválida/proveedor caído; total servidor, variante/cantidad/stock inválidos e idempotencia; seguimiento válido/token inválido/transición inválida; servicio, persistencia tras recarga/reinicio; accesibilidad básica, teclado, móvil, fallback WebGL/audio. Demo de 12 minutos y 3 de preguntas: contexto/caso, buscar recomendación con límite CRC, comparar dos productos y probar estudio, confirmar pedido demo y consultar después de recargar, servicio y avance de estado, entrada inválida, pruebas/documentos/supuestos. No presentar pruebas todavía no ejecutadas como completadas.
