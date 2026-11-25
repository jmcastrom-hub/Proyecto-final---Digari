# Auditoría de la refactorización de Digari Studio

Fecha: 2026-11-24. Rama: `refactor/experiencia-digari`. Verificación posterior hecha en Chrome Headless 157 con el build de producción local.

## Rutas y vistas

Se recorrieron Inicio (`/`), Tienda (`/tienda`), ficha (`/productos/acustica-luz`), Promos (`/promos`), Favoritos (`/favoritos`), Carrito (`/carrito`), Estudio (`/estudio`), Asesoría (`/asesoria`), Servicios (`/servicios`), Seguimiento (`/seguimiento`) y Contacto (`/contacto`). Cada ruta se cargó en escritorio 1440×900 DPR 1, móvil 390×844 DPR 1 y una ventana equivalente a zoom 200% (720×450 DPR 2): 33 combinaciones en total. `docs/evidencia-refactor/resultados-rutas.json` conserva títulos, imágenes cargadas, tamaño de documento y desbordamiento medido. No se encontró desbordamiento horizontal. El menú desplegable se abrió por separado en escritorio y móvil; la navegación móvil conserva acceso desplazable a todos sus enlaces. «Favoritos» tiene texto visible y el contador/entrada a la bolsa quedan en el encabezado.

También se observaron selectores, formularios, estado vacío de Favoritos, estados de validación/deshabilitado de las pruebas existentes y controles de producto. Asesoría presenta el cuadro de consulta y envío en la vista móvil inicial; el estudio deja visibles las opciones de producto, modelo, giro, elevación, zoom y reinicio. No se simuló una compra, reserva ni envío real. Capturas comparables seleccionadas están en `docs/evidencia-refactor/antes` y `docs/evidencia-refactor/despues`.

## Superficies y contraste

El texto marfil (`#f0e8da`) se reserva para nogal/carbón; el texto oscuro de catálogo y formularios va sobre superficies claras (`#fff`/`#f7f7f1`). En el Estudio el selector usa `rgb(25,24,23)` y el resumen, especificaciones, controles de audio y pie usan `rgb(33,31,28)`. Chrome calculó las siguientes relaciones después del cambio, usando los colores computados de cada elemento:

| Superficie | Texto / fondo observado | Contraste |
|---|---|---:|
| Selector del Estudio | `rgb(240,232,218)` / `rgb(25,24,23)` | 14.57:1 |
| Resumen, panel, tarjeta de audio, acordeón | `rgb(240,232,218)` / `rgb(33,31,28)` | 13.51:1 |
| Título de ficha | `rgb(240,232,218)` / transparente sobre resumen oscuro | 17.26:1 calculado contra el fondo del resumen |
| Texto secundario en audio | `rgb(196,184,167)` / `rgb(33,31,28)` | 10.76:1 |

Todos superan WCAG AA para texto normal. El muestreo se limitó a esas superficies y no representa una certificación automatizada de todas las combinaciones/interacciones. Los estados de foco se conservaron con estilos visibles existentes; quedan pendientes evaluación con lector de pantalla y revisión humana del estudiante.

## Estudio 3D y carga diferida

Las 15 fichas conservaron sus IDs y referencias de modelo. Chrome verificó un canvas WebGL para cada familia y que siga activo tras dos giros de ocho pasos (aproximación de frente, costado y reverso); una prueba automatizada adicional valida las 15 mallas sin depender de GPU. La guitarra acústica ahora incluye caja, tapa y veta procedural, boca/roseta, puente, cuerdas, trastes, clavijero y clavijas. Se conservaron los controles de puntero, botones, teclado y táctiles, y la ilustración SVG específica de cada ficha sigue siendo alternativa si WebGL no está disponible. La maqueta es ilustrativa, no reproducción exacta.

Al entrar a Estudio hubo 16 recursos JS; al enfocar/activar el visor se solicitaron cuatro chunks adicionales, sin canvas antes de activarlo. Abrir audio añadió su chunk separado. No hay archivos de muestras de audio en el catálogo de recursos: los tonos son Web Audio sintético y se producen solo tras una acción. La prueba cubrió navegador emulado; tacto físico y escucha con equipo real quedan pendientes.

## Rendimiento medido

Protocolo común: Chrome Headless 157, producción, 1440×900, DPR 1, cache deshabilitada; cuatro navegaciones por ruta y veinte interacciones del botón para rotación. `loadEventEnd` mide el evento de carga, no tiempo de completar el caso de negocio.

| Medición | Base `d482f128` | Refactor | Cambio |
|---|---:|---:|---:|
| Inicio, mediana de carga | 57 ms | 69 ms | +12 ms |
| Tienda, mediana de carga | 70 ms | 67 ms | −3 ms |
| Asesoría, mediana de carga | 86 ms | 60 ms | −26 ms |
| Abrir visor hasta canvas + 2 frames (frío) | 467.9 ms | 488.3 ms | +20.4 ms |
| Girar hasta dos frames, mediana / p95 | 33.30 / 34.5 ms | 33.35 / 34.3 ms | sin mejora mediana |

La intención de enfocar/clicar el botón precarga el motor: tras una espera de 300 ms para la primera respuesta de puntero, el clic llegó a canvas + dos frames en 417.8 ms; esa medida no incluye los 300 ms de espera y no se debe presentar como carga total. El total desde el comienzo del hover fue 744.1 ms. Por tanto, la carga fría del visor no mejoró y la respuesta de giro se mantuvo estable; el beneficio comprobado es adelantar la descarga durante una pausa natural de lectura. Las diferencias de rutas son pequeñas y variables; no se afirma una mejora uniforme. Transferencias medidas: Inicio 4861→4874 B, Tienda 3941→3963 B y Asesoría 5107→5122 B.

## Catálogo y persistencia

La migración `brands-prices-stock-2026-01` actualizó las 15 fichas por ID en la base existente. Después de la migración y del ensayo, los conteos leídos en la base local quedaron: 15 productos, 1 pedido, 1 línea de pedido, 2 eventos de pedido, 2 solicitudes de servicio y 4 eventos de servicio. La prueba de migración en SQLite aislado verifica además que el nombre/precio histórico de una línea y los estados no cambien. El smoke API de extremo a extremo se ejecutó contra otra base temporal, sin añadir pedidos a los datos locales. Marca propuesta, especificaciones, precios y existencias son datos de demostración; no se verificaron modelos comerciales exactos.

La suite verificó seguimiento de la asesoría por varios turnos (alternativa más barata, presupuesto nuevo, uso de ensayo), proveedor simulado y fallback local ante 503. También verificó catálogo, validación de presupuestos, pedido idempotente, token inválido, falta de stock, servicio y persistencia; ver `npm test` y `npm run test:api` registrados en el commit de la rama.

## Límites y revisión pendiente

El usuario mencionó una tercera imagen de referencia, pero no estaba adjunta ni disponible en los archivos legibles de la carpeta; los modelos se construyeron con su descripción textual. No se comprobó el dispositivo físico táctil, la escucha en equipo real, la llamada autenticada a Gemini ni la aprobación visual del estudiante. Los benchmarks no midieron personas, tasa de éxito ni mediana de completar el objetivo de cinco minutos. La preview verificable de esta compilación es `http://localhost:3113/`; se aisló en `DIGARI_DB_PATH` temporal. El listener previo en 3110 respondió con chunks 400 y no se cerró porque no se pudo atribuir de forma segura a una sesión nuestra.
