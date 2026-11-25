# Auditoría de usabilidad de Digari Studio después de las correcciones

## Resultado medido

La suite ejecutó 100 perfiles en contextos independientes de Chrome con SQLite temporal por perfil. Los 100 aprobaron los siete rubros después de repetir en serie los 23 casos que habían agotado el tiempo de espera durante la primera pasada en tres navegadores. La primera pasada se conserva en `primera-pasada-957149a.json`. Los resultados finales están en `resultados-e2e.json` y las opiniones simuladas, separadas de las observaciones, en `usuarios-simulados.csv`.

| Rubro | Base 90ee345, aprobados | Versión 957149a, aprobados | Fallos finales |
|---|---:|---:|---:|
| Inicio, menú y Bolsa | 100/100 | 100/100 | 0 |
| Tienda, ficha, fotografía y Promos | 62/100 | 100/100 | 0 |
| Comparación y Favoritos | 100/100 | 100/100 | 0 |
| Estudio 3D y audio | 100/100 | 100/100 | 0 |
| Asesoría local, tres turnos | 100/100 | 100/100 | 0 |
| Pedido y seguimiento tras recarga | 100/100 | 100/100 | 0 |
| Servicio, seguimiento inválido y Contacto | 100/100 | 100/100 | 0 |

La base tenía 62 perfiles con los siete rubros aprobados y 38 con fallo de fotografía. La repetición final tiene **100 aprobados, 0 fallidos y 0 sin ejecutar**. Los 23 casos de la primera pasada nueva fallaron por tiempo de espera bajo ejecución simultánea y completaron los siete rubros al repetirse en serie. No se atribuyeron esos tiempos al producto sin reproducción bajo la misma condición.

## Las cinco mejoras auditadas

| Mejora | Resultado observable | Cómo repetir la comprobación |
|---|---|---|
| Fotografía de cada ficha | 15/15 imágenes WebP cargan y están rotuladas como fotografía de referencia. Se inspeccionaron las nuevas fotos para comprobar objeto y encuadre. El controlador usa una vista completa del Numark Mixtrack. | Abrir las 15 fichas y ejecutar `tests/qa-fixes.mjs`. Revisar los créditos de `docs/fuentes-imagenes.md`. |
| Enlace del servicio | El comprobante abre Seguimiento con «Servicio» elegido y muestra el estado al consultar directamente. Los pedidos conservan el tipo «Pedido». | Registrar un servicio y un pedido demo, usar sus enlaces y consultar los códigos en sus sesiones. |
| Comparación desde ficha | El enlace vuelve con una fila seleccionada. Se conservan categoría y presupuesto. El botón Atrás vuelve a la ficha. «Limpiar filtros» deja ambos campos vacíos. | Filtrar Instrumentos hasta ₡100 000, abrir la acústica y usar el enlace de comparación. |
| Bolsa en carga | Durante 1,2 s de demora controlada aparece «Cargando tu bolsa…». Después se ve ₡84 900, también tras recargar. Con carrito vaciado se ve el estado vacío. | Ejecutar `tests/qa-fixes.mjs` con la vista previa local. |
| Filtros al regresar | La URL conserva búsqueda, familia, categoría, rango de precios, estilo y disponibilidad. El enlace de regreso y Atrás restauran el filtro; la limpieza elimina los valores. | Aplicar filtros en Tienda, abrir una ficha, volver y borrar filtros. |

## Versión, entorno y reproducción

La rama auditada es `refactor/experiencia-digari`. La compilación de la suite corresponde a `957149a4e735a74efc81339e2fcc33f41cef1991` y se sirvió en `http://127.0.0.1:3180/`, `http://127.0.0.1:3181/` y `http://127.0.0.1:3182/` durante los lotes. Cada registro del JSON indica la URL exacta de su perfil. El archivo `baseline-90ee345.json` conserva el resultado anterior. La suite usa una copia del commit de Git, una base recién sembrada para cada perfil y Gemini desactivado para obtener respuestas locales reproducibles.

Desde la raíz del proyecto, con Node, npm, Chrome y las dependencias instaladas, repetir en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File tests/qa-audit.ps1
```

Para continuar una ejecución interrumpida del mismo SHA, agregar `-Resume`. El resultado de cada perfil se guarda antes de iniciar el siguiente. Para la comprobación puntual de las cinco correcciones, arrancar la versión en localhost y ejecutar `node tests/qa-fixes.mjs` con `QA_DEPS` apuntando a la instalación temporal de Playwright Core.

## Evidencia y límites

En cada recorrido se abrió el menú y se comprobó su cierre, se filtró y abrió una ficha, se compararon dos productos, se guardó un favorito, se seleccionó un modelo 3D y se accionaron giro y zoom. El audio se activó o se verificó la explicación de accesorio pasivo. El chat local recibió tres turnos con cambio de presupuesto. Se confirmó un pedido y se recuperó tras recargar; también se registró y consultó un servicio, se probó un código inválido y se localizó Contacto. Los códigos privados circularon solo en memoria del navegador y no figuran en los informes o capturas.

El CSV conserva las 100 tareas y sus opiniones marcadas como simuladas. Se revisó una captura por grupo. La emulación no sustituye el tacto en teléfono, la escucha con equipo real, un lector de pantalla ni entrevistas con clientes. La correspondencia exacta de la variante roja del ukelele Makala y las fichas históricas sin página oficial accesible siguen indicadas en `docs/fuentes-imagenes.md`. Los precios y existencias son de demostración. Las mediciones de tiempo y éxito con personas reales siguen pendientes.
