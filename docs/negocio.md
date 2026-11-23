# Caso de negocio: Digari Studio

## Problema y propuesta

Digari Music Store es una empresa real. La auditoría pública heredada describe un catálogo amplio y opciones de asesoría, financiamiento y contacto; no se obtuvo acceso a sus datos comerciales u operaciones internas. El problema de selección y seguimiento integrado es una hipótesis que debe validarse con clientes y personal de Digari.

Digari Studio propone una experiencia académica para que una persona con presupuesto y tipo/uso definidos encuentre opciones compatibles, las compare y consulte el estado de un pedido de prueba. Un segundo flujo registra solicitudes ficticias de afinación, calibración, restauración o reparación y permite mostrar transiciones con un operador demo local. La aplicación no está integrada con Digari y no genera ventas, reservas ni contactos reales.

## Caso de medición comparable

**Participante:** persona principiante que busca una guitarra para practicar en casa, abierta a comparar formato acústico y eléctrico. **Límite:** ₡180,000 para la guitarra; accesorios adicionales quedan fuera del presupuesto del caso. **Criterios:** buscar “guitarra”, revisar compatibilidad y comparar la Guitarra acústica Luz (₡74,900) con la Guitarra eléctrica Bruma (₡169,900), ambas bajo el límite, para elegir según uso/estilo. **Inicio:** página pública de entrada del sitio actual y portada de Digari Studio, respectivamente. **Fin:** participante identifica ambas fichas dentro del límite y explica su elección.

| Resultado | Sitio público actual | Prototipo Digari Studio |
|---|---|---|
| Mediana de tiempo | No medida | No medida con participante |
| Tasa de éxito | No medida | No medida con participante |
| Evidencia disponible | Auditoría heredada; navegación dinámica actual pendiente de revisión humana | Suite automatizada, smoke API y prueba Chrome headless; no equivalen a una prueba moderada |

Objetivo sugerido: mediana de finalización de **≤5 minutos** en el prototipo. Medir también éxito (casos completados correctamente / intentos), errores, abandonos, dispositivo, fecha y cantidad de participantes. Usar las mismas instrucciones, contenido y límite de tiempo en ambos sistemas. La línea base sigue sin medir; no se atribuye una mejora.

## Supuestos que requieren validación

- Clientes valoran reunir compatibilidad, presupuesto, comparación y seguimiento en un flujo.
- Las fichas del catálogo real tienen atributos suficientes para filtrar de manera fiable.
- Personal de Digari aceptaría un flujo de seguimiento y tendría permisos definidos para actualizar estados.
- Las etiquetas y timbres ilustrativos del estudio ayudan a decidir sin confundirse con un producto exacto.
- La empresa puede autorizar el tratamiento, los datos, la seguridad y cualquier integración antes de un piloto.

## Costos estimados y dependencias

Las siguientes cifras son estimaciones de costo directo del **prototipo local**, no cotizaciones ni costos de operación de Digari.

| Concepto | Estimación inicial | Supuesto / incertidumbre |
|---|---:|---|
| Next.js, SQLite, Three.js y Web Audio | ₡0 en licencias obligatorias | Dependencias open source; verificar licencias antes de un piloto |
| Ejecución local de la demo | ₡0 de infraestructura adicional | Usa una computadora existente; electricidad y tiempo no incluidos |
| Muestras, modelos y contenido | ₡0 | Geometría y sonido sintéticos propios; no hay material comercial autorizado |
| Gemini | ₡0 en modo local; costo variable si se activa | No requerido para ejecutar. Precio y cuota dependen del modelo/proveedor y no están incluidos en este estimado |
| Piloto integrado | Por cotizar | Requiere estimar alojamiento, seguridad, respaldo, soporte, integración, formación, revisión legal y mantenimiento con Digari |

No se incluyen horas de desarrollo del estudiante/agente, impuestos ni compras de dispositivos. No se deben tomar decisiones presupuestarias del negocio con esta tabla.

## Controles, privacidad y límites

- P4 usa productos, precios CRC, existencias, pedidos, códigos y servicios sintéticos. No importar contactos ni datos reales.
- No se recopilan tarjetas; no se ejecutan pagos, reservas, despachos, mensajes o servicios.
- El catálogo y los estados son autoridad del servidor local; IA opcional solo explica candidatos ya filtrados.
- Códigos privados no enumerables; se almacenan como hashes. Operador local mediante token solo de demo; no equivale a control de acceso para producción.
- No compartir PII, códigos ni historial de pedidos con Gemini. Mantener API key fuera del navegador y del repositorio.
- Validar con asesoría, taller, operaciones, TI y privacidad de Digari antes de cualquier piloto.

## Responsables y decisión

| Rol | Responsabilidad propuesta |
|---|---|
| Estudiante / autor del proyecto | Dueño académico, aprueba alcance y realiza revisión humana de documentos e interfaz |
| Equipo de desarrollo | Pruebas, privacidad por diseño, soporte y cambios controlados |
| Representante autorizado de Digari | Valida problema, catálogo, vocabulario, operación y permiso de piloto |
| Personal de tienda/taller | Valida casos, estados y necesidades de formación; no se les atribuye aprobación actual |
| Participantes de prueba | Ejecutan el caso comparable y autorizan la recolección anónima de métricas |

## Ruta propuesta: piloto → ajustes → ampliación

1. **Preparar piloto:** validar necesidad y autorización con Digari; definir responsable, datos permitidos, controles de acceso, retención, soporte y criterios de parada. Empezar con datos ficticios o un conjunto aprobado y mínimo.
2. **Probar y ajustar:** moderar el mismo caso en sitio actual y prototipo; revisar mediana, éxito, errores, accesibilidad, compatibilidad y claridad de etiquetas. Corregir y volver a probar; registrar decisiones del representante autorizado.
3. **Decidir ampliación:** solo si la empresa aprueba el valor y la seguridad, estimar integración con catálogo/inventario y pedidos, arquitectura multiusuario, disponibilidad, respaldos, monitoreo, privacidad y costos. Sin aprobación, conservarlo como demo académica y retirar cualquier dato real.

La ruta es una propuesta, no un acuerdo ni una aprobación de Digari.
