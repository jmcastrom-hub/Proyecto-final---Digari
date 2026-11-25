# Caso de negocio: Digari Studio

## Problema y propuesta

Digari Music Store es una empresa real. La auditoría pública heredada describe categorías de instrumentos/audio, asesoría y servicios; no se obtuvo acceso a sus operaciones privadas. La dificultad de encontrar una opción por presupuesto y reunir comparación/seguimiento en un solo flujo es una **hipótesis**, no un hallazgo medido del negocio.

Digari Studio es un prototipo académico independiente. Conecta catálogo demo, recomendación local, comparación, estudio 3D/audio ilustrativo, pedido sin pago y seguimiento ficticio. Un flujo secundario demuestra solicitud y estados de servicio. No genera una operación para Digari.

## Mismo caso para comparar el sitio actual y el prototipo

**Instrucción idéntica:** “Sos principiante y buscás una guitarra para practicar en casa. Tenés un máximo de **₡120 000 para el instrumento**, accesorios fuera del presupuesto. Encontrá y compará una guitarra acústica y una eléctrica dentro del tope, confirma modelo y precio, y explicá cuál escogerías para practicar en casa”. **Inicio:** portada pública de Digari Music Store para el sitio actual; portada de Digari Studio para el prototipo. **Fin correcto:** el participante identifica ambas categorías/opciones, verifica que no exceden el tope y explica una elección. El prototipo ofrece Yamaha F310 a ₡84 900 (`/productos/acustica-luz`) y Squier Affinity Strat roja a ₡109 900 (`/productos/electrica-bruma`); esos nombres e importes son datos demo del software, no cotización vigente.

| Métrica con la misma instrucción | Sitio público actual | Digari Studio |
|---|---|---|
| Mediana de tiempo de tarea | No medida | No medida con participantes |
| Tasa de éxito | No medida | No medida con participantes |
| Evidencia técnica disponible | Auditoría pública heredada; no es ensayo comparable | Pruebas automatizadas y navegador automatizado documentados por SHA; no sustituyen observación de personas |

**Objetivo sugerido para el prototipo:** mediana ≤5 minutos y reportar tasa de éxito (termina correctamente/intentó). Es un objetivo, no resultado alcanzado. Para medir, reclutar participantes con consentimiento; balancear o alternar orden entre sitio actual y prototipo; usar mismo dispositivo o registrar diferencias; cronometrar desde la instrucción hasta elección explicada; registrar ayudas, errores, abandonos y resultados; calcular mediana y proporción de éxito con denominadores. No inventar la línea base ni generalizar desde una sola sesión. La auditoría de 100 perfiles fue simulada y no cuenta como muestra humana.

## Hechos, hipótesis y restricciones

- **Hechos comprobables del prototipo:** catálogo de 15 fichas, importes/stock demo, reglas servidor de pedido/seguimiento y modo de asesoría local; ver resultados por SHA en `validacion-entrega.md`.
- **Supuestos:** comparar formatos de instrumento reduce esfuerzo; recomendar equipo compatible facilita una decisión; seguimiento unificado sería útil para clientes/personal. Validar con usuarios y Digari.
- **Sin acceso:** inventario actual, precios comerciales, clientes, pedidos, CRM, personal, procesos de taller, métricas internas o autorización para piloto.
- **Limitación del inventario demo:** hay una ficha por cada familia listada; no hay cinco modelos por familia. No prometer variedad que la app no tiene.

## Costos aproximados y dependencias

| Rubro | Estimación del prototipo | Condición |
|---|---:|---|
| Next.js, TypeScript, SQLite, Three.js y Web Audio | ₡0 en licencias obligatorias | Paquetes open source; revisar licencias/avisos antes de uso externo |
| Demostración local | ₡0 en infraestructura incremental | Usa una computadora existente; excluye electricidad y trabajo |
| IA | ₡0 si usa modo local | Gemini es opcional; si se habilita, revisar precio/cuota vigentes del proveedor |
| Operación de piloto | Por cotizar | Alojamiento, seguridad, soporte, respaldo, integración, privacidad, formación y mantenimiento requieren estimación con Digari |

No son cotizaciones. No incluyen horas, impuestos, compra de equipos ni compromiso comercial.

## Controles, responsables y límites

Precios, stock, fotos, disponibilidad, códigos y estados visibles son de demostración. No hay pagos, tarjetas, reserva, envío ni mensajes. SQLite local, token demo y limitación de frecuencia en memoria no son aptos para producción/multiusuario. La recomendación de IA no decide productos/precios/estados: el servidor selecciona del catálogo y la clave, si existe, se mantiene del lado servidor. Nunca enviar PII, códigos privados o pedidos. Antes de un piloto, Digari debe nombrar responsable y aprobar problema, catálogo/licencias, datos, privacidad, roles, seguridad, retención, soporte y criterio de parada.

| Rol propuesto | Responsabilidad |
|---|---|
| José Manuel Castro Moya, estudiante | Autor académico, ensaya la demo y realiza revisión/aprobación humana; todavía pendiente |
| Equipo técnico | Mantener pruebas, limitar datos y proponer controles de producción |
| Representante autorizado de Digari | Validar necesidad, información, permisos y decisión de piloto; no hay aprobación registrada |
| Participantes | Ejecutar el mismo caso con consentimiento y métricas mínimas |

## Camino de adopción propuesto

1. **Validar necesidad y permiso:** conversar con clientes y Digari; sin importar datos reales.
2. **Medir y ajustar:** comparar el mismo caso/instrucción de ₡120 000; revisar tiempo, éxito, errores y accesibilidad; actualizar hipótesis con evidencia.
3. **Decidir piloto:** solo con aprobación expresa, controles, responsables, presupuesto y datos autorizados; ampliar después de revisar seguridad y resultados. Sin eso, se conserva como demostración académica local.
