# Acabado visual y verificación del PR #1

Base observada: `844fc89cba3f3ff4e43c27ce396679e2476a73e2` en `refactor/experiencia-digari`. El código corregido conserva la línea de nogal, carbón y ámbar. La comparación, las capturas y las imágenes WebGL están en [evidencia de acabado](evidencia-acabado/README.md).

## Cambios comprobables

- Texto principal, filtros, precios, controles y navegación parten de 16 px o más; botones táctiles tienen al menos 44 px en la regla para controles pequeños y 48 px en los controles principales. Las superficies claras del visor usan texto oscuro; las superficies oscuras conservan marfil.
- Se corrigió el literal corrupto de la ficha de producto. El selector de variante y controles nativos oscuros ya no heredan texto claro sobre fondo blanco. Las reglas de foco/scroll reservan margen para el encabezado fijo.
- Se reajustó la cámara a un encuadre horizontal en tres cuartos para guitarra, bajo y ukelele. La guitarra acústica tiene una tapa extruida con abertura geométrica, cavidad oscura profunda y roseta; se añadió una tapa posterior y se alinearon refuerzos al plano trasero. La orientación y las piezas responden a la rotación WebGL real.
- Se mantienen los 15 IDs/modelos, el giro, controles, alternativa por imagen y carga del visor bajo demanda. No se cambió inventario, pedidos ni estado de conversaciones.

## Verificaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| 11 rutas × escritorio 1440×900, móvil 390×844 y viewport 720×450/DPR2 | 33 capturas; cero desbordamientos horizontales |
| Superficies del Estudio | Contraste calculado: selector 14.57:1; texto/panel 13.51:1; encabezado 17.26:1; texto secundario 10.76:1 |
| Selectores y teclado | Selectores oscuros de 48–50 px; Tab hizo visible un contorno de 3 px en cinco rutas de escritorio y cinco de móvil. Menú móvil abierto: 15 enlaces dentro del viewport, con desplazamiento interno |
| Modelos con WebGL | 15 de 15 renderizaron en Chrome Headless 157; los 15 conservaron canvas tras giros; galería completa adjunta al PR mediante este commit |
| Continuidad del chat | `npm test` cubre “más barato”, cambio de presupuesto y uso; la misma conversación funciona con proveedor simulado y fallback local cuando responde 503. Smoke API en modo local OK |
| Suite automatizada | `npm test`: 31/31; `npm run lint`: OK; `npm run build`: OK; `npm run test:api`: 11 páginas/rutas y flujos demo OK |

La galería muestra los 15 modelos desde el frente; también hay evidencia girada de la acústica. El automatismo comprueba que el WebGL siga funcionando y que las referencias correspondan al producto seleccionado; no realiza un análisis de silueta píxel por píxel en todos los ángulos. La escucha en equipo real, el tacto en teléfono, la llamada a Gemini con clave y la revisión del estudiante siguen pendientes. Los modelos son ilustrativos, no exactos; en particular, flauta, caña, cuerdas, cable y audífonos son formas de baja complejidad.

## Vista previa y procesos

En el diagnóstico, ambos servidores de los puertos 3100 y 3113 respondían al proyecto Digari. Se comprobó que 3100 servía una compilación anterior de Digari y se detuvo únicamente ese proceso confirmado. La vista previa final debe servir la compilación de este commit en `http://localhost:3113`; puerto 3100 quedó libre. La base de datos usada por la vista previa está aislada bajo `.p4-verify/`, no es la base de uso del proyecto.
