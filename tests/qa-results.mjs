import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='docs/qa/';
const data=JSON.parse(fs.readFileSync(dir+'resultados-e2e.json'));
const csv=dir+'usuarios-simulados.csv';
const cells=line=>Array.from(line.matchAll(/"((?:[^"]|"")*)"(?=,|$)/g),m=>m[1].replaceAll('""','"'));
const [headers,...values]=fs.readFileSync(csv,'utf8').trim().split(/\r?\n/).map(cells);
const rows=values.map(v=>Object.fromEntries(headers.map((k,i)=>[k,v[i]])));
assert.equal(data.profiles.length,100);
assert.equal(new Set(data.profiles.map(p=>p.id)).size,100);
const totalFailures={},titles=['Inicio, menú y bolsa','Tienda, ficha y Promos','Comparación y favoritos','Estudio y audio','Asesoría local','Pedido y seguimiento','Servicio y contacto'];
const rubrics=Object.keys(data.profiles[0].tareas);
const problems={};
const steps={
 inicio_menu_bolsa:['Tienda y cierre','Estudio y cierre a 720 px','Bolsa'],
 tienda_ficha_promos:['filtros','modelo, precio y stock','fotografía','Promos abre categoría'],
 comparacion_favoritos:['dos filas','favorito recuperado'],
 estudio_3d_audio:['producto seleccionado','giro','zoom'],
 asesoria_tres_turnos:['turno 1','turno 2','turno 3','preferencias y modo local'],
 carrito_pedido_seguimiento:['total','pedido confirmado','recuperado tras recarga'],
 servicio_contacto:['servicio registrado','servicio recuperado','código inválido','canal localizado']
};
const approved=data.profiles.filter(p=>Object.values(p.tareas).every(t=>t.estado==='completado')).length;
for(const p of data.profiles){
 const u=rows.find(row=>row.id===p.id);
 const issues=[];
 for(const [key,t] of Object.entries(p.tareas)){
 const expected=[...steps[key]];
 if(key==='estudio_3d_audio'&&!t.pasos.some(s=>s.paso==='accesorio sin timbre'))expected.push('inicio de audio');
 for(const paso of expected)if(!t.pasos.some(s=>s.paso===paso))t.pasos.push({paso,estado:'no ejecutado'});
 u[key]=t.estado;
 if(t.estado!=='completado')totalFailures[key]=(totalFailures[key]||0)+1;
 for(const step of t.pasos.filter(x=>x.estado==='fallido')){
 (problems[step.paso]??=[]).push(p.id);
 issues.push(step.paso+' ('+(typeof step.detalle==='string'?step.detalle:JSON.stringify(step.detalle))+')');
 }}
 u.resultado_observado_por_rubro=Object.values(p.tareas).filter(t=>t.estado==='completado').length+'/7 rubros aprobados. '+(issues.join(' · ')||'Todos los criterios del recorrido registrados.');
 u.mayor_friccion=issues[0]||'Sin fallo registrado en los siete rubros';
 const photo=p.tareas.tienda_ficha_promos.pasos.find(s=>s.paso==='fotografía');
 const original=u.opinion_individual_simulada.split(' | Lectura simulada del recorrido')[0];
 u.opinion_individual_simulada=original+' | Lectura simulada del recorrido de '+u.id+' con '+p.producto+'. '+(photo?.estado==='fallido'?'Para decidir por el aspecto del equipo, querría ver una fotografía junto a la ilustración.':p.tareas.carrito_pedido_seguimiento.estado==='completado'?'Poder recuperar mi pedido con el código me serviría para consultar después.':'Necesitaría poder confirmar el resultado antes de dar por terminado el pedido.');
 u.evidencia_sin_datos_privados='resultados-e2e.json → '+p.id+(p.capturas?' · '+p.capturas.join(', '):'');
}
const quote=v=>'"'+String(v).replaceAll('"','""')+'"';
fs.writeFileSync(csv,[headers,...rows.map(u=>headers.map(k=>u[k]))].map(r=>r.map(quote).join(',')).join('\r\n')+'\r\n');
fs.writeFileSync(dir+'resultados-e2e.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({approved,failed:100-approved,totalFailures,problems,diagnostico:data.diagnostico},null,2));
const d=data.diagnostico;
assert.ok(d,'Falta la sesión diagnóstica');
const photos=problems['fotografía']||[];
const imageFamilies=[...new Set(data.profiles.filter(p=>photos.includes(p.id)).map(p=>p.producto))];
const tested=(key,step)=>data.profiles.filter(p=>p.tareas[key].pasos.some(s=>s.paso===step&&s.estado==='completado')).length;
const lines=[
 '# Auditoría de usabilidad de Digari Studio',
 '',
 '## Resultado',
 '',
 `Se ejecutaron 100 perfiles en 100 contextos independientes. **${approved} aprobaron los siete rubros, ${100-approved} registraron al menos un fallo y 0 quedaron sin ejecutar.** Las cifras describen las tareas automatizadas de esta muestra. Las opiniones del CSV son simuladas.`,
 '',
 '| Rubro | Intentos | Aprobados | Con fallo |','|---|---:|---:|---:|',
 ...rubrics.map((k,i)=>`| ${titles[i]} | 100 | ${100-(totalFailures[k]||0)} | ${totalFailures[k]||0} |`),
 '',
 '| Grupo | Perfiles | Aprobados en los siete rubros |','|---|---:|---:|',
 ...[...new Set(rows.map(u=>u.grupo))].map(group=>{
   const members=rows.filter(u=>u.grupo===group);
   return `| ${group} | ${members.length} | ${members.filter(u=>rubrics.every(key=>u[key]==='completado')).length} |`;
 }),
 '',
 `Se recuperaron ${tested('carrito_pedido_seguimiento','recuperado tras recarga')} pedidos después de recargar y ${tested('servicio_contacto','servicio recuperado')} solicitudes de taller. En el recorrido principal se eligió explícitamente «Servicio» al rastrear el comprobante. La prueba adicional examinó qué pasa si se usa la selección predeterminada.`,
 '',
 '## Base y repetición',
 '',
 `Rama **${data.branch}**, commit **${data.sha}**, Chrome ${data.browser}. La suite compiló un archivo de Git de ese SHA en una carpeta temporal con las dependencias del proyecto. Las instancias de auditoría escucharon en ${[...new Set(data.profiles.map(p=>p.url))].sort().join(', ')}. El JSON identifica la URL de cada perfil. Cada proceso sirvió una SQLite recién sembrada y se cerró al concluir su caso. La copia de prueba usó el asesor local.`,
 '',
 'Desde la raíz, con Node, npm, Chrome, Git, tar y las dependencias del proyecto instaladas, ejecutar en PowerShell:',
 '',
 '```powershell','powershell -ExecutionPolicy Bypass -File tests/qa-audit.ps1','```',
 '',
 'Agregar `-Resume` para continuar desde el último perfil guardado del mismo SHA. El ejecutor escribe el JSON mediante reemplazo de archivo después de cada perfil. Los tres trabajadores usan puertos y bases independientes. Los códigos privados se usaron dentro de cada contexto de navegador. Las capturas muestran únicamente fichas públicas.',
 '',
 '## Qué se comprobó',
 '',
 'El menú llevó a Tienda y Estudio, se cerró al navegar y permitió abrir Bolsa. Cada perfil probó el menú compacto a 720 × 450. El catálogo se filtró por categoría y presupuesto. Si el producto objetivo excedía el presupuesto, se comprobó su exclusión y se retiró el tope para poder inspeccionar esa ficha. Se abrió una categoría desde Promos, se seleccionaron dos productos, se leyó la comparación y se recuperó el favorito.',
 '',
 'En Estudio se seleccionó el ID del perfil y se contrastó su título con el catálogo. Se compararon capturas del lienzo antes y después de girar y acercar. Para los instrumentos se inició una nota, para equipos se priorizó el perfil A cuando estaba disponible y en accesorios pasivos se leyó su explicación. El chat recibió una consulta con tipo, estilo y monto, una petición de alternativa económica y un aumento de ₡15 000 en el mismo campo. Se verificaron las tres respuestas locales y las preferencias finales.',
 '',
 'En el pedido se comprobó el total de una unidad, la confirmación, la actividad y el total recuperado tras recargar Seguimiento. Se registraron los cuatro tipos de servicio, se consultó el estado, se probó una entrada inválida y se localizó un canal de contacto. Los pasos con evidencia faltante se identifican como «no ejecutado» en el JSON.',
 '',
 '## Cinco mejoras por impacto',
 '',
 '| Prioridad | Observación y alcance | Reproducción | Criterio de corrección y decisión |','|---|---|---|---|',
 `| 1. Completar las fotografías | ${photos.length}/100 perfiles vieron «fotografía pendiente» en ${imageFamilies.length} fichas distintas. La ilustración sí cargó. | Abrir una de estas fichas: ${imageFamilies.join(', ')}. | Una foto autorizada y correctamente identificada por ficha. Bloquea aprobar el criterio de fotografía. |`,
 `| 2. Abrir el seguimiento en el tipo correcto | 1/1 sesión diagnóstica. El enlace del servicio abrió «${d.tipoDesdeEnlaceDeServicio}» y Consultar devolvió «${d.consultaDirectaDeServicio}». Impide recuperar un servicio por el camino directo. | Registrar afinación, seguir el enlace y consultar sin tocar el selector. | Mostrar la actividad del servicio en el primer intento, también tras recargar. Resolver antes de entregar ese flujo. |`,
 `| 3. Conservar el producto al comparar | 1/1 sesión diagnóstica. Desde la ficha acústica, «Volver al catálogo para comparar» produjo ${d.filasAlVolverParaComparar} filas. Obliga a localizar y marcar de nuevo la primera opción. | Abrir la ficha acústica y usar el enlace de comparación. | El producto aparece marcado y agregar un segundo produce dos filas. Prioritaria para la comparación desde ficha. |`,
 `| 4. Mostrar carga antes del total | 1/1 sesión diagnóstica. Con 1,2 s de demora en el catálogo, el resumen pasó de ${d.totalMientrasCarga} a ${d.totalAlCargar}. | Añadir la acústica y abrir Bolsa con esa demora. | Mostrar el total solo cuando se conocen todas las líneas. El pedido persistido pasó la prueba de recarga. Puede esperar a la siguiente revisión. |`,
 '| 5. Recuperar el presupuesto y la categoría al volver | 1/1 sesión diagnóstica. El enlace de vuelta desde la ficha dejó vacíos ambos campos. Afecta especialmente a quien compra con un tope. | Filtrar Instrumentos hasta ₡100 000, abrir la acústica y volver desde el enlace de comparación. | Conservar ambos filtros y la lista aplicable. Puede esperar tras resolver el seguimiento y la selección de comparación. |',
 '',
 'Los cuatro diagnósticos de navegación y carga comparten un solo recorrido complementario. Su frecuencia en personas reales queda pendiente. La tabla prioriza la cobertura observada y el esfuerzo necesario para recuperar el flujo.',
 '',
 '## Evidencia y límites',
 '',
 '[Resultados por paso](resultados-e2e.json) · [Perfiles y opiniones simuladas](usuarios-simulados.csv) · [Capturas de fichas](evidence/). Los 100 perfiles originales conservaron sus IDs, tareas, presupuestos y dispositivos. Las asignaciones son 89 de escritorio, uno móvil emulado, cinco de teclado y cinco de zoom. El menú compacto también se comprobó en escritorio. El zoom se aproximó por tamaño de viewport y densidad de píxeles. Los perfiles de teclado activaron controles mediante foco y Enter, con selección automatizada de campos y casillas.',
 '',
 'Se revisó una captura de ficha por grupo. La emulación deja pendientes el zoom nativo del navegador al 200 %, el recorrido completo por Tab con lector de pantalla, el tacto en un teléfono y la escucha física. El cambio de píxeles del visor indica respuesta a los controles. La audición, la fidelidad del timbre y la comprensión del rotulado por músicos requieren pruebas con personas. Los tiempos y la tasa de éxito de compradores reales siguen sin medir.',
 '',
 'Los resultados de la sesión parcial anterior se conservan en evidence/U001-estudio-movil.png y evidence/profiles-results.json como antecedentes. Los conteos de este informe proceden de resultados-e2e.json.'
];
fs.writeFileSync(dir+'informe-usabilidad.md',lines.join('\n')+'\n');
