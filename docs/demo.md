# Guion de demostración de Digari Studio

Duración: **12 minutos de operación y 3 minutos de preguntas**. No requiere diapositivas. Usa el servidor local, la semilla sintética y una pantalla compartida. La demo no se ha presentado a público; este archivo es un guion y la revisión del estudiante queda pendiente.

## Preparación antes de iniciar el cronómetro

1. En PowerShell, desde la raíz: `npm ci`, `npm run build`.
2. En una terminal del servidor:

   ```powershell
   $env:DIGARI_DB_PATH = Join-Path $env:TEMP 'digari-p4-demo.sqlite'
   $env:DIGARI_DEMO_OPERATOR_TOKEN = 'local-demo-only'
   $env:GEMINI_API_KEY = ''
   npm run start
   ```

3. Confirmar `http://localhost:3000/` y `/estudio` responden. La primera carga crea 15 fichas de datos demo en SQLite. No reutilizar una base con información de terceros.
4. Segunda terminal: definir el mismo `DIGARI_DB_PATH` y token; ejecutar `npm run test:api`. Confirmar la suite automática antes de mostrar el recorrido.
5. Tener Chrome/Edge con WebGL disponible para la vista 3D. Si no lo está, usar la vista alternativa; si no hay salida de audio, mostrar las etiquetas y ejecutar `npm test`. No afirmar escucha física.

## Recorrido cronometrado

| Tiempo | Acción | Evidencia y narración |
|---|---|---|
| 0:00–1:00 | Inicio y caso | “Una persona principiante busca guitarra para practicar en casa y dispone de ₡180,000 para el instrumento; accesorios quedan fuera del caso.” Aclarar empresa real, prototipo independiente y datos sintéticos. |
| 1:00–3:00 | Catálogo y comparación | En Tienda, buscar guitarra, filtrar por presupuesto/uso; comparar Guitarra acústica Luz (₡74,900) y Guitarra eléctrica Bruma (₡169,900), ambas dentro del límite. Explicar compatibilidad, diferencias de uso, existencias y precio demo. El catálogo inicial no descarga Three.js ni muestras. |
| 3:00–5:30 | Estudio 3D/audio | Abrir Estudio 3D, activar modelo, girar, ajustar vista, restablecer. Activar audio con una acción y reproducir una nota. Mostrar el timbre sintético etiquetado y aclarar que no es grabación ni reproducción exacta. Si falla WebGL, mostrar la alternativa. |
| 5:30–7:30 | Pedido de prueba | Añadir la opción al carrito, revisar total y condición de retiro/envío ilustrativa; confirmar “Pedido de demostración”. No hay tarjeta ni pago. Copiar el código privado de prueba. |
| 7:30–9:00 | Seguimiento tras recargar | Recargar `/seguimiento?code=...`, consultar pedido y mostrar estado/eventos que siguen en SQLite. Aclarar que no es una orden real. |
| 9:00–10:30 | Servicio | Registrar solicitud demo de afinación con descripción ficticia; consultar el código, abrir operador local y moverla a diagnóstico. Mostrar historial. |
| 10:30–11:30 | Asesoría y error | Mostrar asesoría en modo local con la clave vacía. Enviar monto inválido o presupuesto insuficiente y mostrar validación/pregunta. No activar Gemini ni usar una clave ajena. |
| 11:30–12:00 | Evidencia y límites | Mostrar README, spec, plan, uso de IA, negocio, auditoría y validación P4. Indicar revisión humana y escucha/tacto físico pendientes. |

## Comprobaciones automatizadas relacionadas

- `npm test`: compatibilidad declarada, stock/cantidad, precio de servidor, idempotencia, persistencia tras abrir SQLite en un proceso nuevo, órdenes/servicios/transiciones, perfiles de audio, fallback asesor local y modelos 3D.
- `npm run lint`, `npm run build`, `npm run test:api`: errores de entrada/rango, variante, token operador inválido, repetición de confirmación, stock, consulta privada y transiciones.
- Medición de navegación de `/tienda` y activación 3D, comprobación de carga diferida, emulación móvil, estado de AudioContext, giro y alternativa WebGL: resultados y límites en `docs/validacion-p4.md` y `docs/medicion-p2.1.md`.

## Preguntas: 3 minutos

- ¿Qué datos son demo y qué requeriría acceso autorizado de Digari?
- ¿Cómo se evita que una respuesta de Gemini decida precio o estado?
- ¿Qué sigue pendiente para validar el caso de negocio y hacer un piloto seguro?

## Contingencias

- **Sin Internet / Gemini:** continuar con la asesoría local determinista.
- **WebGL no disponible:** usar la vista alternativa; no describirla como modelo 3D.
- **Audio bloqueado o sin parlantes:** no reproducir automáticamente; mostrar que la salida es una simulación y omitir la escucha física.
- **SQLite/servidor no inicia:** reiniciar con ruta de DB temporal; si persiste, mostrar el resultado de `npm test` y registrar el bloqueo. No borrar la base del usuario.
- **Código privado perdido:** consultar solo con el código entregado al crear el registro; no hay recuperación de cuenta real.
