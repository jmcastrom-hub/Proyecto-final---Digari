# Guion de entrega: Digari Studio

Duración objetivo: **12 minutos de operación y 3 minutos de preguntas**. La demostración en vivo es la entrega central indicada por la consigna CENFOTEC; este documento es un guion, no constancia de que el estudiante ya lo ensayó o presentó. No se requieren diapositivas.

## Caso y datos que se mostrarán

Una persona principiante quiere una guitarra para practicar en casa; compara una acústica con una eléctrica y dispone de **₡120 000** para el instrumento (accesorios fuera del presupuesto). El catálogo demo contiene [Yamaha F310 · guitarra acústica](/productos/acustica-luz), **₡84 900**, y [Squier Affinity Strat roja · guitarra eléctrica](/productos/electrica-bruma), **₡109 900**. Ambas están bajo el tope y aparecen con stock demo. Los importes y existencias son sintéticos, no una cotización de Digari. Elegirá la acústica para el pedido demostrativo; en Estudio puede revisar también la eléctrica. No se mostrará una compra real.

## Preparación y cronometrado del ensayo del estudiante

1. En una copia limpia del repositorio, desde PowerShell: `npm ci`, `npm test`, `npm run lint`. Para build con SQLite vacía, usa el paso de inicialización temporal del README y después `npm run build`.
2. Abre una terminal para el servidor y otra para el smoke API. En ambas define la misma ruta SQLite temporal y el token local según los comandos de README; no apuntes a `data/digari.sqlite` ni compartas códigos reales.
3. Inicia `npm run start`; abre Chrome normal en `http://localhost:3000`. Verifica `/`, `/asesoria`, `/tienda`, `/estudio` y `/seguimiento`. Selecciona modo local en las condiciones de ensayo: no hace falta ni se debe exponer una clave.
4. Antes de compartir pantalla, confirma que el carrito esté vacío y que la DB sea temporal. El reset se hace eliminando **solo ese archivo temporal antes de iniciar**. No borres la base habitual.
5. Para tu ensayo, inicia un cronómetro al comenzar la narración del caso; detén el tiempo de operación en 12:00. Reserva 3:00 para preguntas. Registra duración real, pasos completados, errores/retrocesos y si necesitaste ayuda. No marques este ensayo como hecho hasta realizarlo tú.

## Recorrido en vivo: 12 minutos

| Tiempo | Acción | Qué comprobar y explicar |
|---|---|---|
| 0:00–1:00 | Presentar el caso desde Inicio | Tope de ₡120 000, guitarra para practicar en casa. Aclarar empresa real, prototipo independiente y datos demo. |
| 1:00–2:30 | Asesoría desde texto libre | Escribir una consulta sin completar preferencias previas. Mostrar modo local y opciones del catálogo con foto, nombre, precio y enlace. No afirmar Gemini online. |
| 2:30–4:00 | Tienda y comparación | Abrir guitarra, comprobar Yamaha F310 ₡84 900 y Squier Affinity Strat ₡109 900; seleccionar ambas y revisar comparación y compatibilidad. Enlaces directos arriba. |
| 4:00–6:00 | Estudio | Abrir la acústica, activar visor bajo demanda, girar/zoom/restablecer. Activar una nota con clic y leer etiqueta de audio sintético. Seleccionar la eléctrica y comprobar que cambia el perfil. |
| 6:00–8:00 | Pedido de demostración | Añadir Yamaha F310, verificar precio y total, confirmar el mensaje “Pedido de demostración”. Sin tarjeta ni pago. Copiar el código solo para esta sesión. |
| 8:00–9:15 | Recarga y seguimiento | Abrir Seguimiento, introducir el código recién emitido y mostrar estado/eventos tras recargar. No guardar el código en capturas ni documentos. |
| 9:15–10:30 | Regla y entrada inválida | En una sesión limpia/fixture, demostrar cantidad inválida o stock insuficiente y el rechazo del servidor. Explicar que el servidor recalcula precio y stock. No contaminar el caso del pedido mostrado. |
| 10:30–11:30 | Servicios | Crear solicitud ficticia de afinación y consultar el estado. Mostrar actualización demo solo si el token local está configurado; no presentarlo como operación real. |
| 11:30–12:00 | Evidencia y límites | Abrir README, spec, plan, uso IA, negocio, validación y CI. Separar comprobaciones automáticas de ensayo/aprobación aún pendientes. |

## Preguntas: 3 minutos

1. ¿Qué impide interpretar los precios, existencias o estados demo como oferta/inventario oficial?
2. ¿Qué decide el servidor y qué aporta Gemini cuando está disponible?
3. ¿Qué evidencia falta antes de proponer un piloto con Digari?

## Contingencias

- **Gemini no disponible o sin Internet:** seguir en modo local; mostrar la etiqueta de modo. No pedir ni mostrar una clave.
- **WebGL no disponible:** usar la vista alternativa y nombrarla como imagen/alternativa, no como modelo 3D.
- **Audio bloqueado o sin salida:** dejar que las etiquetas y las pruebas unitarias demuestren la síntesis; no afirmar escucha.
- **Servidor o SQLite:** iniciar con DB temporal vacía y revisar los logs sin borrar los datos habituales. Si no se recupera, mostrar resultados de tests y registrar el fallo.
- **Código de seguimiento perdido:** crear un caso de demostración nuevo en la DB temporal. No se puede recuperar una cuenta real porque no existe.
- **Falta tiempo:** priorizar consulta → comparación → estudio → pedido → recarga/seguimiento; explicar servicios y error con la evidencia de smoke si es necesario, sin declarar pasos no vistos como hechos en vivo.

## Evidencia y estado

Los comandos y resultados automáticos por SHA están en [`validacion-entrega.md`](validacion-entrega.md). El registro histórico de 100 perfiles simulados está en [`qa/informe-usabilidad.md`](qa/informe-usabilidad.md) y no equivale a repetir el flujo en el candidato. Ensayo del estudiante, presentación oral, escucha con equipo real, tacto físico, prueba con participantes y revisión/aprobación final: **pendientes hasta realizarlos**.
