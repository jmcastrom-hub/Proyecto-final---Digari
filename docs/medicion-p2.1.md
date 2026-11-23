# P2.1: rendimiento y timbres del estudio

Fecha: 2026-11-23. La prueba se ejecutó contra el build de producción local en Windows, con Chrome Headless 157, SwiftShader y la misma ventana de 1280 × 1000. Los resultados son una medición del prototipo en este equipo; no representan un teléfono ni una GPU física.

## Inicio, tienda y estudio

Se hicieron siete GET locales consecutivos por ruta y se comparó la mediana del tiempo HTTP observado por Node. El tamaño de respuesta se mantuvo constante.

| Ruta | Antes: mediana / bytes | Después: mediana / bytes | Lectura |
|---|---:|---:|---|
| `/` | 5.48 ms / 19,318 | 5.37 ms / 19,318 | Sin cambio significativo |
| `/tienda` | 4.98 ms / 11,893 | 3.95 ms / 11,893 | Variación local; no se modificó la ruta |
| `/estudio` | 3.54 ms / 9,729 | 3.58 ms / 9,729 | Sin cambio significativo |

El bundle Three.js no aparece entre los recursos iniciales de Inicio o Tienda. Se solicita al activar el visor, así que no se encontró un cuello de botella 3D en la carga inicial de esas dos rutas. Estas mediciones de GET no miden carga percibida ni pintura del navegador.

## Activación del visor

Se limpió la caché del navegador entre cinco ensayos. Se midió desde activar el visor hasta disponer de un canvas WebGL.

| Build | Cinco mediciones | Mediana |
|---|---|---:|
| Base P2/P3 | 454.2, 442.9, 453.0, 444.0, 445.3 ms | 445.3 ms |
| P2.1 | 411.6, 458.1, 447.9, 476.3, 430.1 ms | 447.9 ms |

La diferencia de +2.6 ms (+0.6 %) no demuestra una mejora de carga. El conjunto de chunks del motor se mantuvo prácticamente igual: 772,181 bytes brutos antes y 772,671 después; transferencia informada por Chrome 196,406 y 196,537 bytes. El código deja el motor bajo demanda y reduce la resolución máxima en pantallas de alta densidad, pero no se atribuye una mejora de carga que las mediciones no muestran.

## Giro y renderizado

En cada ensayo se enviaron 100 eventos de puntero sintéticos en un mismo turno de JavaScript y se midió el tiempo hasta el siguiente `requestAnimationFrame`, 12 veces por build. La mediana fue 17.0 ms antes y 17.7 ms después; los máximos fueron 22.0 y 29.7 ms. Esta prueba no muestra una reducción de latencia y su variación depende de la planificación de frames de Chrome/SwiftShader.

La inspección del código sí confirma el cuello estructural corregido: antes cada `pointermove` llamaba `setAngle` y provocaba trabajo de React; ahora se acumulan deltas y se aplica el giro/render una sola vez por frame solicitado, sin actualizar estado React durante el arrastre. La vista cambió visiblemente tras el arrastre. En equipos con `devicePixelRatio ≥ 1.5`, el límite pasa de 1.5× a 1.25×: reduce 30.6 % los píxeles del buffer frente al límite anterior. Es una reducción de trabajo gráfico estimada por dimensión del buffer, no una medición de FPS.

## Audio por instrumento

Chrome confirmó que la misma nota C muestra 261.63 Hz en guitarra acústica, teclado y bajo, y que el perfil cambia con la ficha seleccionada. Los timbres se simulan con formas de onda, filtro pasa-bajos, sobretono y envolventes distintos; el texto los identifica como simulación. Las pruebas automáticas validan perfiles distintos y frecuencia base común. No se encontraron archivos de muestra de audio en el repositorio, por lo que no se atribuyen grabaciones autorizadas.

## Alcance verificado y pendiente

- `npm test`: 23/23; `npm run lint` y `npm run build`: pasaron.
- Chrome Headless con WebGL/SwiftShader renderizó el modelo; un bloqueo de WebGL inyectado mostró la vista alternativa etiquetada.
- Emulación móvil de 390 px y DPR 3: canvas a escala 1.25, documento de 390 px sin desbordamiento horizontal.
- Sigue pendiente escuchar el timbre con altavoces reales y revisar arrastre táctil en un teléfono físico. La latencia medida no mejoró; se debe repetir con ratón/GPU física y grabar percentiles de frame antes de afirmar fluidez.
