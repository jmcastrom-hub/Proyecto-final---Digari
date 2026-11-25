# Regresión de Asesoría con inventario completo

## Ejecución en Chrome

- Rama: `refactor/experiencia-digari`.
- Chrome: `157.0.8103.80`.
- Vista previa local: `http://localhost:3118/asesoria`.
- Instancia de prueba: build local con SQLite temporal y modelo Gemini deshabilitado; la clave de `.env.local` no se utilizó.
- Repetición: `node tests/advice-chat-inventory.mjs`.

La prueba abrió `/asesoria` primero con preferencias antiguas guardadas (`₡0`, Bajo, funk, ensayo). El bloque de preferencias ya no aparece y una pregunta general ignoró esos valores. Desde el mismo campo se recorrió:

| Mensaje | Resultado observado |
|---|---|
| «¿Qué instrumentos tenés?» | Resumió las seis familias de instrumentos con existencias demo y mostró tres tarjetas variadas. |
| «¿Cuál me recomendás para empezar?» | Mostró opciones concretas sin pedir presupuesto, estilo o uso en campos aparte. |
| «¿Hay algo más barato?» | Mostró dos productos distintos a los ya recomendados, ambos por debajo del precio de referencia. |
| «Busco un bajo máximo ₡120 000» | No presentó el bajo de ₡129 900 como elegible. Lo mostró separado, rotulado como alternativa por encima del tope. |
| «¿Qué equipo tenés?» | Volvió a resumir las 15 familias con existencias pese al tope anterior. La petición no envió presupuesto, tipo, estilo ni uso heredados. |

En una conversación nueva se preguntó «¿Qué equipo tenés?» y luego «mostrame más»: las tarjetas nuevas no repitieron las primeras. En otra conversación, «Busco un bajo máximo ₡0» mantuvo el tope cero y rotuló por separado las alternativas. Las tarjetas comprobadas tenían fotografía cargada con texto alternativo, nombre/modelo, precio CRC y enlace de ficha. El modo local quedó visible en las respuestas.

Captura de la interfaz y tarjeta de alternativa: [advice-chat-inventory.png](advice-chat-inventory.png).

## Cobertura del catálogo

`POST /api/advice` obtiene `listProducts()` completo desde SQLite antes de filtrar y recortar las recomendaciones a tres. Una prueba unitaria agrega un piano digital válido como último elemento del arreglo del inventario y confirma que se encuentra por su estilo y tipo; el contrato no recorta la lista antes de aplicar filtros. «Mostrame más» recibe IDs previos validados contra el inventario y los excluye para evitar repetición.

La selección y los datos de las tarjetas los decide el servidor local. Las pruebas del proveedor Gemini usan un proveedor simulado que solo puede explicar IDs elegidos por el servidor. No se hizo una llamada real a Gemini.
