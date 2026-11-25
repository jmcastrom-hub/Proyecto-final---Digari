import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { probes } from './qa-probes.mjs';
import { setTimeout as delay } from 'node:timers/promises';

const { QA_DEPS, QA_STAGE, QA_SHA } = process.env;
const { chromium } = await import(pathToFileURL(path.join(QA_DEPS,'node_modules/playwright-core/index.mjs')));
const folder='docs/qa', output=folder+'/resultados-e2e.json';
const csv=fs.readFileSync(folder+'/usuarios-simulados.csv','utf8').trim().split(/\r?\n/);
const cells=line=>Array.from(line.matchAll(/"((?:[^"]|"")*)"(?=,|$)/g),m=>m[1].replaceAll('""','"'));
const headers=cells(csv.shift());
const users=csv.map(line=>Object.fromEntries(cells(line).map((v,i)=>[headers[i],v])));
assert.equal(new Set(users.map(u=>u.id)).size,100);
const result=process.argv.includes('--resume')&&fs.existsSync(output)?JSON.parse(fs.readFileSync(output)):{
 sha:QA_SHA,branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),profiles:[]
};
assert.equal(result.sha,QA_SHA);
let browser;
try { browser=await chromium.launch({channel:'chrome',headless:true}); }
catch { browser=await chromium.connectOverCDP('http://127.0.0.1:9230'); }
result.browser=browser.version();
const digits=s=>Number(s.replace(/\D/g,''));
function save(){result.profiles.sort((a,b)=>a.id.localeCompare(b.id));fs.writeFileSync(output+'.tmp',JSON.stringify(result,null,2));fs.renameSync(output+'.tmp',output)}
async function run(u,port,diagnostic=false){
 const base='http://127.0.0.1:'+port, num=Number(u.id.slice(1));
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{cwd:QA_STAGE,windowsHide:true,stdio:'ignore',env:{...process.env,DIGARI_DB_PATH:path.join(QA_STAGE,u.id+'-'+Date.now()+'.sqlite'),GEMINI_API_KEY:''}});
 let context;
 try{
 let items;
 for(let i=0;i<200;i++){if(server.exitCode!==null)throw Error('No pudo iniciar el servidor exclusivo');try{items=(await (await fetch(base+'/api/products')).json()).items;if(items)break}catch{}await delay(100)}
 assert.equal(items?.length,15);
 const buildId=fs.readFileSync(path.join(QA_STAGE,'.next/BUILD_ID'),'utf8').trim();
 const manifest='static/'+buildId+'/_buildManifest.js';
 const served=await fetch(base+'/_next/'+manifest);
 assert.ok(served.ok && Buffer.from(await served.arrayBuffer()).equals(fs.readFileSync(path.join(QA_STAGE,'.next',manifest))));
 result.compilacionesVerificadas=[...new Set([...(result.compilacionesVerificadas||[]),buildId])];
 const p=items.find(x=>x.id===u.producto_objetivo),budget=Number(u.presupuesto_crc);
 const mobile=u.dispositivo.includes('móvil'),keyboard=u.dispositivo==='teclado',zoom=u.dispositivo.includes('zoom');
 const viewport={width:mobile?390:zoom?720:1280+80*(num%4),height:mobile?844:zoom?450:900};
 context=await browser.newContext({baseURL:base,viewport,hasTouch:mobile,isMobile:mobile,deviceScaleFactor:zoom?2:1});
 const page=await context.newPage();page.setDefaultTimeout(5000);
 if(diagnostic){
   const findings={perfil:u.id,url:base+'/',...await probes(page)};
   if(process.argv.includes('--diagnostic-only'))console.log(JSON.stringify(findings));
   else {result.diagnostico=findings;save()}
   return;
 }
 const l=s=>page.locator(s),btn=s=>page.getByRole('button',{name:s,exact:true}),go=url=>page.goto(url,{waitUntil:'domcontentloaded'});
 const act=async loc=>{if(keyboard){await loc.focus();await loc.press('Enter')}else if(mobile)await loc.tap();else await loc.click()};
 const card=l('.product-card').filter({has:l('a[href^="/productos/'+p.id+'"]')});
 const r={id:u.id,url:base+'/',viewport,producto:p.id,tareas:{}};let active,last;
 async function group(key,fn){active=r.tareas[key]={pasos:[]};last='abrir ruta';try{await fn();active.estado=active.pasos.some(x=>x.estado==='fallido')?'fallido':'completado'}catch(e){active.estado='fallido';active.pasos.push({paso:last,estado:'fallido',detalle:(e.name==='TimeoutError'?'Tiempo de espera agotado':e.name==='AssertionError'?'Resultado visible distinto del esperado':'Acción no completada')})}}
 function ok(paso,detalle=true){active.pasos.push({paso,estado:'completado',detalle})}
 function check(paso,yes,detalle){active.pasos.push({paso,estado:yes?'completado':'fallido',detalle})}
 const screen=async key=>{if(num%10!==1)return;const f='evidence/'+u.id+'-'+key+'.jpg';await page.screenshot({path:folder+'/'+f,type:'jpeg',quality:58});(r.capturas??=[]).push(f)};
 await group('inicio_menu_bolsa',async()=>{
 await go('/');const compact=viewport.width<1241;
 const toggle=l(compact?'.mobile-menu-trigger':'.nav-menu-trigger');
 last='abrir Tienda';await act(toggle);await act(l((compact?'.mobile-nav-panel':'#desktop-store-menu')+' a[href="/tienda"]'));
 await page.waitForURL('**/tienda');assert.equal(await toggle.getAttribute('aria-expanded'),'false');ok('Tienda y cierre');
 await page.setViewportSize({width:720,height:450});await act(l('.mobile-menu-trigger'));await act(l('.mobile-nav-panel a[href="/estudio"]'));await page.waitForURL('**/estudio');assert.equal(await l('.mobile-menu-trigger').getAttribute('aria-expanded'),'false');ok('Estudio y cierre a 720 px');
 await act(l('.cart-link'));await page.waitForURL('**/carrito');ok('Bolsa');await page.setViewportSize(viewport);
 });
 await group('tienda_ficha_promos',async()=>{
 await go('/tienda');await l('#filter-category').selectOption(p.category);last='presupuesto y categoría';
 const loaded=page.waitForResponse(x=>x.url().includes('/api/products?')&&new URL(x.url()).searchParams.get('maxPrice')===String(budget));
 await l('#filter-price').fill(String(budget));await loaded;await delay(120);
 const prices=await l('.product-price').allTextContents();check('filtros',prices.every(s=>digits(s)<=budget)&&((await card.count()>0)===(p.priceCrc<=budget)),{resultados:prices.length,dentro:p.priceCrc<=budget});
 if(p.priceCrc>budget)await l('#filter-price').fill('');
 await act(card.locator('h2 a'));await page.waitForURL('**/productos/'+p.id+'?*');
 assert.equal(await l('.detail-copy h1').textContent(),p.name);assert.equal(digits(await l('.detail-price').textContent()),p.priceCrc);ok('modelo, precio y stock',{nombre:p.name,precio:p.priceCrc,stock:await l('.stock-note').textContent()});
 const im=l('.detail-art img');await im.evaluate(i=>i.decode());const label=await l('.detail-art small').innerText();check('fotografía',label.startsWith('FOTOGRAFÍA'),label);await screen('ficha');
 await go('/promos');await act(l('.promo-list a').first());await page.waitForURL('**/tienda?category=*');ok('Promos abre categoría');
 });
 await group('comparacion_favoritos',async()=>{
 await go('/tienda');last='comparar dos';await card.locator('input[type=checkbox]').check();
 const other=l('.product-card').filter({hasNot:l('a[href^="/productos/'+p.id+'"]')}).first();await other.locator('input[type=checkbox]').check();assert.equal(await l('.compare-item').count(),2);ok('dos filas',await l('.compare-item h3').allTextContents());
 await act(card.locator('.favorite-button'));await go('/favoritos');await card.waitFor();ok('favorito recuperado',p.id);
 });
 await group('estudio_3d_audio',async()=>{
 await go('/estudio');await l('#studio-product').selectOption(p.id);assert.equal(await l('.studio-product-summary h2').textContent(),p.name);ok('producto seleccionado');
 await act(btn('Activar visor 3D'));await l('.model-canvas canvas,.model-fallback').first().waitFor();const canvas=l('.model-canvas canvas');
 if(await canvas.count()){const pixels=()=>canvas.screenshot({timeout:7000});const before=await pixels();await act(btn('Girar hacia la derecha'));const turn=await pixels();await act(btn('Acercar'));const near=await pixels();check('giro',!before.equals(turn),'capturas del lienzo');check('zoom',!turn.equals(near),'capturas del lienzo')}
 else check('giro y zoom',false,'Vista alternativa WebGL');
 last='audio';await act(btn('Activar audio'));await l('.audio-card').first().waitFor();
 if(await page.getByRole('heading',{name:'Accesorio pasivo'}).count())ok('accesorio sin timbre');
 else {const ab=page.getByRole('button',{name:/Escuchar A/});await act(await ab.count()?ab:l('[aria-label^="Reproducir nota"]').first());const status=await l('.audio-lab [role=status],.audio-panel [role=status],.audio-card ~ [role=status]').first().textContent();check('inicio de audio',/Hz|simulaci/i.test(status),status)}
 });
 await group('asesoria_tres_turnos',async()=>{
 await go('/asesoria');const box=l('#advice-message'),raised=budget+15000;
 for(const [i,msg] of [`Busco ${p.family} para ${p.style[0]} por ₡${budget}`,'¿Hay algo más barato?',`Subí el presupuesto a ₡${raised}`].entries()){
 last='turno '+(i+1);await box.fill(msg);await box.press('Enter');await l('.chat-assistant .mode-chip').nth(i+1).waitFor();ok(last,await l('.chat-assistant .mode-chip').nth(i+1).innerText());
 }
 const family=await l('#advice-family').inputValue(),style=await l('#advice-style').inputValue(),amount=await l('#advice-budget').inputValue();
 check('preferencias y modo local',family===p.family&&style===p.style[0]&&digits(amount)===raised&&(await l('.mode-chip.local').count())===4,{family,style,amount,esperados:[p.family,p.style[0],raised]});
 });
 await group('carrito_pedido_seguimiento',async()=>{
 await go('/productos/'+p.id);await act(l('.product-actions button'));await l('.product-actions [role=status]').waitFor();await act(l('.cart-link'));last='total';await l('.cart-line h3').waitFor();assert.equal(digits(await l('.summary-total strong').innerText()),p.priceCrc);ok(last,p.priceCrc);
 await act(l('.order-summary button'));await l('.tracking-code').waitFor();ok('pedido confirmado');await act(l('.receipt-card a'));await page.waitForURL('**/seguimiento?*');await page.reload();await page.waitForFunction(()=>document.querySelector('#tracking-code')?.value.length>0);await act(l('.tracking-form button'));await l('.event-list li').first().waitFor();assert.equal(digits(await l('.tracking-result .summary-total strong').innerText()),p.priceCrc);assert.match(await l('.tracking-result').innerText(),/recibido/i);ok('recuperado tras recarga');
 });
 await group('servicio_contacto',async()=>{
 try{await go('/servicios');const type=['afinación','calibración','restauración','reparación'][num%4];await l('#service-type').selectOption(type);await l('#service-desc').fill('Revisión demo de '+p.family);await act(l('.service-form-panel button'));await l('.notice-success code').waitFor();ok('servicio registrado',type);await act(l('.service-form-panel .notice-success a'));assert.equal(await l('#tracking-kind').inputValue(),'servicio');await act(l('.tracking-form button'));await l('.event-list li').first().waitFor();assert.match(await l('.tracking-result').innerText(),/recibido/i);ok('servicio recuperado');
 await l('#tracking-code').fill('invalido');await act(l('.tracking-form button'));ok('código inválido',await l('.tracking-form [role=alert]').innerText());
 }finally{await go('/contacto');await l('a[href^="mailto:"],a[href^="tel:"]').first().waitFor();ok('canal localizado')}
 });
 result.profiles.push(r);save();console.log(u.id,Object.values(r.tareas).map(t=>t.estado[0]).join(''));
 }finally{await context?.close();server.kill();await delay(150)}
}
if(process.argv.includes('--diagnostic-only')){
 try{await run(users[0],3184,true)}finally{await browser.close()}
 process.exit(0);
}
const pending=users.filter(u=>!result.profiles.some(r=>r.id===u.id));
try{if(pending[0]?.id==='U001')await run(pending.shift(),3180);
if(!process.argv.includes('--pilot'))await Promise.all(Array.from({length:3},async(_,i)=>{while(pending.length)await run(pending.shift(),3180+i)}));
if(result.profiles.length===100)await run(users[0],3180,true);
}finally{await browser.close()}
