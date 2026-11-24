# Evidencia de tema y asesoría

Verificación local en `http://localhost:3113`, con datos de seguimiento nuevos y base SQLite temporal. Las capturas omiten los códigos privados. Precios, existencias y pedidos son de demostración.

## Capturas

- `asesoria-escritorio.png`: conversación en escritorio; el campo de escritura queda bajo el historial.
- `asesoria-movil.png`: el mismo panel y el compositor en móvil.
- `menu-bolsa-movil.png`: menú desplegado a 390 px; enlaces y bolsa visibles, menú desplazable verticalmente.
- `seguimiento-pedido-escritorio.png`: pedido cargado en estado «en preparación», total y dos eventos.
- `seguimiento-servicio-movil.png`: servicio cargado en estado «diagnóstico»; se verificaron dos eventos en el DOM. El recorte móvil muestra el inicio de la ficha de resultado.

## Verificaciones

- Secuencia de chat en un solo campo: «Busco una guitarra eléctrica para rock por ₡120 000» → «¿Hay una más barata?» → «Subí el presupuesto a ₡150 000». Se conservaron tipo, estilo y conversación, y el presupuesto activo quedó en ₡150 000. En esta vista previa sin clave se utilizó el modo local.
- Se cargaron en la interfaz un pedido demo y un servicio demo avanzados por el operador demo; las fichas mostraron sus estados y actividad sin exponer los códigos.
- Los dos endpoints de búsqueda rechazaron un código inválido con HTTP 400.
- `recorrido-rutas.json` registra 11 rutas en escritorio (1440 px), móvil (390 px) y ancho equivalente a zoom 200 % (720 px): 33 comprobaciones, cero desbordamientos horizontales.
- `npm test`: 31/31; `npm run lint`: correcto; `npm run build`: correcto; `tests/api-smoke.mjs`: correcto (11 rutas, catálogo, asesoría, pedidos, servicios, transiciones y stock).

La revisión es una comprobación de prototipo en navegador Chromium local; no representa pruebas en dispositivos físicos ni revisión manual del estudiante.
