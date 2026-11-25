# Regresión de Asesoría y estado del catálogo

## Recorrido de chat comprobado

- Rama: `refactor/experiencia-digari`.
- SHA de la aplicación: `d98cc905c4fa1a7ccea2124c6e9220c4c836d2f3`.
- Chrome: `157.0.8103.80`.
- Vista previa de prueba: `http://localhost:3118/asesoria`.
- Base: SQLite temporal; Gemini desactivado para no usar la clave local.
- El script reproducible es `node tests/advice-chat-regression.mjs`.

Los primeros cuatro mensajes se enviaron, en ese orden y desde el mismo campo:

| Mensaje | Resultado visible en Chrome |
|---|---|
| «¿Tienen bajos?» | Tarjeta Ibanez GSR180 BS desde el catálogo demo, con foto WebP cargada, precio ₡129 900 y enlace a la ficha. No preguntó por presupuesto, uso ni estilo. |
| «Busco un piano por ₡200 000» | Sin productos recomendados; explicó que aún no hay pianos acústicos ni digitales demo y que un teclado es otra familia. |
| «Busco una guitarra por ₡150 000» | Tarjetas de guitarra acústica y eléctrica; ambas muestran imagen, precio inferior al monto y enlace. La nueva búsqueda sustituyó el tipo y el presupuesto anteriores. |
| «¿Hay algo más barato?» | Conservó guitarra y comunicó que no quedaba una alternativa con existencias y precio menor entre las fichas disponibles. No propuso opciones fuera del límite. |

En una conversación nueva se comprobó además «Busco una guitarra acústica por ₡120 000»: la familia específica prevaleció sobre «Guitarra» y no mostró la eléctrica. En los cinco casos se mantuvieron el historial y el campo de escritura en pantalla. El proveedor Gemini real no se llamó en esta prueba; el modo local fue el observado. Las pruebas unitarias también cubren un proveedor simulado y el fallback.

Capturas: [respuesta con bajos y foto cargada](advice-chat-bajos.png) y [secuencia completa](advice-chat-regression.png). No contienen códigos privados.

## Inventario que permanece en la versión

El endpoint público devolvió **15 fichas en 15 familias; una ficha por familia**. Los rangos usados para este resumen son económicos (hasta ₡30 000), intermedios (₡30 001–₡100 000) y altos (más de ₡100 000). Todos los precios y stocks siguen siendo demostrativos.

| Familia actual | Total | Económico | Intermedio | Alto |
|---|---:|---:|---:|---:|
| Guitarra acústica | 1 | 0 | 1 | 0 |
| Guitarra eléctrica | 1 | 0 | 0 | 1 |
| Bajo | 1 | 0 | 0 | 1 |
| Teclado | 1 | 0 | 1 | 0 |
| Piano digital o acústico | 0 | 0 | 0 | 0 |
| Ukelele | 1 | 1 | 0 | 0 |
| Viento | 1 | 1 | 0 | 0 |
| Cuerdas | 1 | 1 | 0 | 0 |
| Cable | 1 | 1 | 0 | 0 |
| Caña | 1 | 1 | 0 | 0 |
| Micrófono | 1 | 1 | 0 | 0 |
| Monitor | 1 | 0 | 1 | 0 |
| Parlante | 1 | 0 | 1 | 0 |
| Controlador DJ | 1 | 0 | 1 | 0 |
| Audífonos | 1 | 1 | 0 | 0 |
| Interfaz | 1 | 0 | 1 | 0 |

**La meta de cinco modelos distintos por familia no está cumplida:** ninguna familia llega a cinco ni ofrece los tres rangos. El catálogo conserva 15 fotografías WebP con atribución, autor y licencia en [`fuentes-imagenes.md`](../fuentes-imagenes.md). Ese archivo documenta confirmación de modelo desde fuente oficial para 9/15; las otras seis fichas aún requieren confirmación oficial o aclaración de identidad/variante. No se añadieron productos ni se reutilizaron fotos como si fueran de modelos distintos.

## Suite de perfiles

La corrida completa de `tests/qa-audit.ps1` construyó desde Git el SHA `d98cc905c4fa1a7ccea2124c6e9220c4c836d2f3`, ejecutó 100 contextos aislados y aprobó 100/100 los siete rubros. Los datos por paso y la URL temporal están en [`resultados-e2e.json`](resultados-e2e.json); el resumen de tareas y límites está en [`informe-usabilidad.md`](informe-usabilidad.md). La suite verificó el asesor local, no Gemini en línea.
