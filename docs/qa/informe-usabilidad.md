# Auditoría de usabilidad de Digari Studio

## Resultado

Se ejecutaron 100 perfiles en 100 contextos independientes. **62 aprobaron los siete rubros, 38 registraron al menos un fallo y 0 quedaron sin ejecutar.** Las cifras describen las tareas automatizadas de esta muestra. Las opiniones del CSV son simuladas.

| Rubro | Intentos | Aprobados | Con fallo |
|---|---:|---:|---:|
| Inicio, menú y bolsa | 100 | 100 | 0 |
| Tienda, ficha y Promos | 100 | 62 | 38 |
| Comparación y favoritos | 100 | 100 | 0 |
| Estudio y audio | 100 | 100 | 0 |
| Asesoría local | 100 | 100 | 0 |
| Pedido y seguimiento | 100 | 100 | 0 |
| Servicio y contacto | 100 | 100 | 0 |

| Grupo | Perfiles | Aprobados en los siete rubros |
|---|---:|---:|
| principiantes | 10 | 10 |
| compradores de regalos | 10 | 7 |
| guitarristas | 10 | 8 |
| bajistas y tecladistas | 10 | 10 |
| productores de home studio | 10 | 0 |
| técnicos de audio | 10 | 2 |
| DJs | 10 | 3 |
| presupuesto ajustado | 10 | 8 |
| clientes de taller | 10 | 10 |
| navegación con teclado o zoom | 10 | 4 |

Se recuperaron 100 pedidos después de recargar y 100 solicitudes de taller. En el recorrido principal se eligió explícitamente «Servicio» al rastrear el comprobante. La prueba adicional examinó qué pasa si se usa la selección predeterminada.

## Base y repetición

Rama **refactor/experiencia-digari**, commit **90ee345fa2aeeb38bcf524f3ad24e6941438694a**, Chrome 157.0.8103.80. La suite compiló un archivo de Git de ese SHA en una carpeta temporal con las dependencias del proyecto. Las instancias de auditoría escucharon en http://127.0.0.1:3180/, http://127.0.0.1:3181/, http://127.0.0.1:3182/. El JSON identifica la URL de cada perfil. Cada proceso sirvió una SQLite recién sembrada y se cerró al concluir su caso. La copia de prueba usó el asesor local.

Desde la raíz, con Node, npm, Chrome, Git, tar y las dependencias del proyecto instaladas, ejecutar en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File tests/qa-audit.ps1
```

Agregar `-Resume` para continuar desde el último perfil guardado del mismo SHA. El ejecutor escribe el JSON mediante reemplazo de archivo después de cada perfil. Los tres trabajadores usan puertos y bases independientes. Los códigos privados se usaron dentro de cada contexto de navegador. Las capturas muestran únicamente fichas públicas.

## Qué se comprobó

El menú llevó a Tienda y Estudio, se cerró al navegar y permitió abrir Bolsa. Cada perfil probó el menú compacto a 720 × 450. El catálogo se filtró por categoría y presupuesto. Si el producto objetivo excedía el presupuesto, se comprobó su exclusión y se retiró el tope para poder inspeccionar esa ficha. Se abrió una categoría desde Promos, se seleccionaron dos productos, se leyó la comparación y se recuperó el favorito.

En Estudio se seleccionó el ID del perfil y se contrastó su título con el catálogo. Se compararon capturas del lienzo antes y después de girar y acercar. Para los instrumentos se inició una nota, para equipos se priorizó el perfil A cuando estaba disponible y en accesorios pasivos se leyó su explicación. El chat recibió una consulta con tipo, estilo y monto, una petición de alternativa económica y un aumento de ₡15 000 en el mismo campo. Se verificaron las tres respuestas locales y las preferencias finales.

En el pedido se comprobó el total de una unidad, la confirmación, la actividad y el total recuperado tras recargar Seguimiento. Se registraron los cuatro tipos de servicio, se consultó el estado, se probó una entrada inválida y se localizó un canal de contacto. Los pasos con evidencia faltante se identifican como «no ejecutado» en el JSON.

## Cinco mejoras por impacto

| Prioridad | Observación y alcance | Reproducción | Criterio de corrección y decisión |
|---|---|---|---|
| 1. Completar las fotografías | 38/100 perfiles vieron «fotografía pendiente» en 7 fichas distintas. La ilustración sí cargó. | Abrir una de estas fichas: audifonos-senda, cuerdas-onda, interfaz-faro, monitor-alfar, microfono-claro, parlante-brisa, controlador-eco. | Una foto autorizada y correctamente identificada por ficha. Bloquea aprobar el criterio de fotografía. |
| 2. Abrir el seguimiento en el tipo correcto | 1/1 sesión diagnóstica. El enlace del servicio abrió «pedido» y Consultar devolvió «error visible». Impide recuperar un servicio por el camino directo. | Registrar afinación, seguir el enlace y consultar sin tocar el selector. | Mostrar la actividad del servicio en el primer intento, también tras recargar. Resolver antes de entregar ese flujo. |
| 3. Conservar el producto al comparar | 1/1 sesión diagnóstica. Desde la ficha acústica, «Volver al catálogo para comparar» produjo 0 filas. Obliga a localizar y marcar de nuevo la primera opción. | Abrir la ficha acústica y usar el enlace de comparación. | El producto aparece marcado y agregar un segundo produce dos filas. Prioritaria para la comparación desde ficha. |
| 4. Mostrar carga antes del total | 1/1 sesión diagnóstica. Con 1,2 s de demora en el catálogo, el resumen pasó de ₡0 a ₡84 900. | Añadir la acústica y abrir Bolsa con esa demora. | Mostrar el total solo cuando se conocen todas las líneas. El pedido persistido pasó la prueba de recarga. Puede esperar a la siguiente revisión. |
| 5. Recuperar el presupuesto y la categoría al volver | 1/1 sesión diagnóstica. El enlace de vuelta desde la ficha dejó vacíos ambos campos. Afecta especialmente a quien compra con un tope. | Filtrar Instrumentos hasta ₡100 000, abrir la acústica y volver desde el enlace de comparación. | Conservar ambos filtros y la lista aplicable. Puede esperar tras resolver el seguimiento y la selección de comparación. |

Los cuatro diagnósticos de navegación y carga comparten un solo recorrido complementario. Su frecuencia en personas reales queda pendiente. La tabla prioriza la cobertura observada y el esfuerzo necesario para recuperar el flujo.

## Evidencia y límites

[Resultados por paso](resultados-e2e.json) · [Perfiles y opiniones simuladas](usuarios-simulados.csv) · [Capturas de fichas](evidence/). Los 100 perfiles originales conservaron sus IDs, tareas, presupuestos y dispositivos. Las asignaciones son 89 de escritorio, uno móvil emulado, cinco de teclado y cinco de zoom. El menú compacto también se comprobó en escritorio. El zoom se aproximó por tamaño de viewport y densidad de píxeles. Los perfiles de teclado activaron controles mediante foco y Enter, con selección automatizada de campos y casillas.

Se revisó una captura de ficha por grupo. La emulación deja pendientes el zoom nativo del navegador al 200 %, el recorrido completo por Tab con lector de pantalla, el tacto en un teléfono y la escucha física. El cambio de píxeles del visor indica respuesta a los controles. La audición, la fidelidad del timbre y la comprensión del rotulado por músicos requieren pruebas con personas. Los tiempos y la tasa de éxito de compradores reales siguen sin medir.

Los resultados de la sesión parcial anterior se conservan en evidence/U001-estudio-movil.png y evidence/profiles-results.json como antecedentes. Los conteos de este informe proceden de resultados-e2e.json.
