# Registro de validación P4

Estado: verificación técnica local completada el 23 de noviembre de 2026. No equivale a revisión del estudiante, escucha con equipo real, prueba táctil física ni presentación oral.

## Instalación limpia y comandos

Copia limpia del código en `.p4-verify`, sin `.git`, `node_modules`, `.next` ni SQLite existente. Entorno: Windows, Node v26.13.0, npm 11.20.0. `npm ci` instaló 313 paquetes desde `package-lock.json`; el comando completo se ejecutó dentro de esa copia. Base aislada: `%TEMP%\digari-p4-clean.sqlite`; Gemini sin clave y operador demo local.

| Comando | Resultado observado |
|---|---|
| `npm ci` | Correcto en copia limpia; 313 paquetes, 56 s |
| `npm test` | 25/25, 7 suites; incluye SQLite desde proceso nuevo, idempotencia, stock, entrada, asesoría/fallback, catálogo/modelos/audio |
| `npm run lint` | Correcto, sin errores |
| `npm run build` | Correcto; Next.js 15.5.29 compiló 13 páginas estáticas y rutas API dinámicas |
| `npm run test:api` | Correcto: 11 rutas/páginas, recomendación local, presupuesto inválido/insuficiente, rango CRC inválido, pedido duplicado, variante inválida, código privado, token inválido, stock insuficiente, servicio y transición |
| Seed de catálogo | API devolvió 15 fichas; pruebas confirman referencias 3D no genéricas |

La primera `npm ci` en la carpeta activa falló con EPERM intentando reemplazar SWC en uso; no se detuvo ningún proceso ajeno. Para validar instalación se usó una copia limpia dentro de esta raíz autorizada. La instalación de la copia y su suite completaron.

## Ensayo local en navegador

Chrome 157 headless con WebGL SwiftShader; servidor de producción en `http://127.0.0.1:3100`, SQLite temporal y token solo de demo. El ensayo es automatizado, no una revisión humana.

| Control | Resultado y evidencia |
|---|---|
| Catálogo | 15 tarjetas visibles en `/tienda`. Una navegación produjo `loadEventEnd - fetchStart = 25 ms` según Navigation Timing; una observación local y con caché, no una línea base generalizable. |
| Carga inicial | Las URL de recursos de `/tienda` no contenían `three` ni archivos `.mp3`, `.wav` o `.ogg`; visor y audio solo se activaron en `/estudio`. |
| Comparación | Marqué Guitarra acústica Luz y Guitarra eléctrica Bruma; la interfaz mostró comparación lado a lado 2/3, precio, existencias, estilo y compatibilidad. |
| Pedido | Desde catálogo agregué la guitarra, confirmé «Pedido de demostración», obtuve código privado y consulté estado `recibido`. Tras recargar, el mismo código siguió cargado y la consulta devolvió el pedido persistido. Sin tarjeta, pago ni reserva real. |
| Visor 3D | En `/estudio`, clic de activación a aparición de `<canvas>`: 407 ms; canvas 582×260 px, WebGL disponible en SwiftShader, viewport 754×480, DPR 1. Se enviaron eventos de arrastre por CDP. Es una muestra única, no un FPS ni respuesta de hardware físico. |
| Audio | Tras seleccionar guitarra acústica, 14 botones de notas presentes. Activar C mostró `261.63 Hz · guitarra acústica sintética; simulación, no muestra grabada.` No se afirma percepción de audio. |
| Servicio | La interfaz registró solicitud demo de afinación, mostró código privado y consultó estado `recibido`; el smoke API actualizó a `diagnóstico` con token demo. Persistencia y transición también tienen test automatizado. |
| Asesoría offline | `test:api` recibió modo local, filtró por presupuesto/familia/compatibilidad y preguntó con presupuesto insuficiente. Los tests usan proveedor simulado para respuestas externas/timeout; no se usó clave Gemini. |
| Móvil y teclado | Chrome emuló 390×844 px/DPR 3: scrollWidth 390, sin overflow; Tab enfocó “Saltar al contenido”. No equivale a teléfono táctil. |

`docs/medicion-p2.1.md` conserva los valores antes/después P2.1 (445.3/447.9 ms y 17.0/17.7 ms): no mostraron mejora temporal. No se mezclan con la apertura P4 de 407 ms porque son ejecuciones y medidas diferentes.

## Límites aún abiertos

- Gemini con `GEMINI_API_KEY` activa: pendiente; el modo local está verificado.
- Escucha real con altavoces/audífonos: pendiente; tonos y perfiles son sintéticos.
- Tacto con un teléfono físico: pendiente; hubo evento de arrastre de ratón automatizado y la emulación móvil 390 px/DPR 3 de P2.1 no reemplaza la prueba táctil.
- Fallback WebGL: probado en Chrome headless P2.1 al forzar fallo de contexto; revisar manualmente con navegador/dispositivo del estudiante.
- Revisión humana del estudiante, comparación moderada con el sitio actual y demo oral: pendientes. Ninguna línea base de negocio fue medida.
- No hay muestras grabadas autorizadas e identificadas.
