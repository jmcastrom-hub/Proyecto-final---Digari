# Digari Studio — intención del proyecto

## Contexto y problema

Digari Music Store es una empresa real de instrumentos musicales y audio profesional en Costa Rica. La auditoría pública incluida en `PROMPTS_PROYECTO_DIGARI.md` describe catálogo amplio, navegación por categorías, asesoría técnica, financiamiento y dos sucursales. Esa evidencia proviene de la auditoría suministrada y no equivale a una medición actual del proceso interno. No se obtuvo acceso a inventario, CRM, pedidos ni operaciones privadas de Digari.

**Problema a validar:** para elegir equipo compatible con presupuesto, tipo de uso y estilo, el cliente debe navegar fichas distribuidas en el catálogo y posiblemente pedir asesoría por canales separados. No hay evidencia observada de que el personal actualmente carezca de seguimiento; se propone un flujo demostrativo para conectar recomendación, evaluación y estado de pedido o servicio.

## Usuarios

- **Principal:** persona que compara instrumentos o equipos de audio y busca una opción compatible con su presupuesto, tipo de producto y estilo/uso.
- **Secundario:** personal autorizado que registra avances de una orden de demostración o servicio en taller.

## Propuesta y flujo de negocio

Digari Studio será un prototipo académico de asesoría y seguimiento, no un sistema oficial ni conectado a Digari. Flujo principal: buscar o pedir recomendación → probar y comparar en un estudio 3D/audio → registrar pedido de prueba → consultar su estado. Flujo secundario: solicitar afinación, calibración, restauración o reparación → consultar y actualizar el estado.

## Evidencia, supuestos y datos

- **Hechos de la consigna y auditoría existente:** empresa real y dominio público `digaricr.com`; la auditoría describe secciones de tienda, DJ, Home Studio, instrumentos, audio, asesoría, financiamiento, servicios y contacto; informa sucursales Desamparados Centro y Sabana Sur; reporta que se revisaron páginas públicas y muestras de fichas. Rutas y límites se detallan en `docs/auditoria-digari.md`.
- **Supuestos por validar con usuarios/Digari:** la selección comparativa y el seguimiento unificado tienen valor operativo; una prueba guiada puede reducir esfuerzo del cliente; personal de taller podría actualizar estados en una interfaz sencilla.
- **Datos de demostración:** productos, CRC, existencias, compatibilidad, cuentas de operador, solicitudes y estados serán sintéticos y persistidos localmente. No representan precios ni stock vigentes.

## Objetivo e indicador

Meta sugerida: completar el caso principal en **≤5 minutos**. Medir en una prueba moderada con el mismo caso, instrucciones y punto de inicio en el sitio actual y en el prototipo: mediana del tiempo de tarea y tasa de éxito (casos completados correctamente / intentos). Registrar muestra, dispositivo, fechas, abandonos y errores. No existe línea base medida; cualquier tiempo o mejora previa a la medición es hipótesis, no resultado.

## Alcance y estado P0–P4

P0 definió el caso y los requisitos antes de construir. P1–P3 implementan catálogo, pedidos y servicios; estudio 3D/audio; y asesoría local con Gemini opcional. P2.1 corrigió el trabajo de arrastre y los perfiles de audio. P4 agrega instalación limpia, CI, trazabilidad, pruebas y guion. El prototipo sigue siendo local y académico.

## Exclusiones y límites

Sin compra, pago, reserva, despacho, contacto ni solicitud real; sin integrar stock, precios, identidad, pedidos o servicios de Digari; sin guardar datos personales reales; sin presentar modelos 3D, perfiles sonoros, datos demo o respuestas de IA como información oficial. El sitio actual conserva el acceso a información original mediante enlaces públicos comprobados donde se definan.

## Aprobación pendiente

Revisión humana del estudiante y eventual validación de pertinencia por Digari quedan pendientes. El prototipo no está autorizado para uso productivo.

## Caso de entrega y validación pendiente

El caso se fija en `docs/demo.md` y `docs/negocio.md`: persona principiante busca guitarra para practicar en casa, compara Yamaha F310 (₡84 900; `/productos/acustica-luz`) y Squier Affinity Strat roja (₡109 900; `/productos/electrica-bruma`) con tope de **₡120 000** para el instrumento, y explica una elección. Los precios y stock son demo. Objetivo sugerido: mediana ≤5 minutos; medir también la tasa de éxito con la misma instrucción en el sitio público y el prototipo. No existe línea base ni prueba moderada medida; cifras de carga no miden éxito de tarea. La auditoría de 100 perfiles es simulada y corresponde a otra versión. El ensayo oral del estudiante, aprobación humana, escucha real, tacto físico y validación con Digari siguen pendientes.
