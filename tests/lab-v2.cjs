const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const examples = require('../lab-data.js');
const validator = require('../lab-validator.js');
const progress = require('../progress-v2.js');
const base = process.env.TEST_URL || 'http://127.0.0.1:8000';
const launch = {executablePath:process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath()),headless:true,args:['--no-sandbox']};
(async()=>{
 // Valida límites y evita aciertos debidos a código dentro de comentarios o strings.
 for (const ex of examples) {
  assert.equal(validator.validate(ex.solution,ex.solution).ok,true);
  assert.equal(validator.validate(ex.starter,ex.solution).ok,false);
  assert.equal(validator.validate('// solución\n'+ex.solution,ex.solution).ok,true);
  assert.equal(validator.validate('/*'+ex.solution+'*/',ex.solution).ok,false);
  assert.equal(validator.validate(ex.solution+'\nConsole.WriteLine(999);',ex.solution).ok,false);
 }
 assert.equal(validator.validate('/* comentario sin cerrar',examples[0].solution).ok,false);
 assert.equal(validator.validate('x'.repeat(12001),examples[0].solution).ok,false);
 assert.deepEqual(progress.cleanLab({unknown:{solved:true}}),{});
 const browser = await chromium.launch(launch);
 try {
  for(const width of [360,390,768,1280]) {
   const context=await browser.newContext({viewport:{width,height:844}}), page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base);
   await page.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
   assert.match(await page.locator('#codeLab').innerText(),/No es un compilador/);
   await page.locator('#validateCode').click();
   assert.match(await page.locator('#labFeedback').innerText(),/no coincide/);
   for(const ex of examples) {
    await page.locator('#labRoute').selectOption(ex.route);
    await page.locator('#labExercise').selectOption(ex.id);
    await page.locator('#codeEditor').fill(ex.solution);
    await page.locator('#validateCode').click();
    assert.match(await page.locator('#labFeedback').innerText(),/No se compiló ni ejecutó/);
   }
   const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('csharp-lab-v1')));
   assert.equal(Object.keys(data.done).length,0);
   assert.equal(Object.values(data.lab).filter(x=>x.solved&&x.unassisted).length,15);
   assert.equal(data.lab['lab-csharp-1'].errors,1);
   assert.equal(await page.locator('#codeHighlight .tok-keyword').count()>0,true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
   // El texto del editor nunca se interpreta como HTML.
   await page.locator('#codeEditor').fill('<img src=x onerror="window.attacked=true">');
   assert.equal(await page.locator('#codeHighlight img').count(),0);
   await page.locator('#validateCode').click();
   assert.equal(await page.evaluate(()=>!!window.attacked),false);
   await page.locator('#plainCode').check();
   assert.equal(await page.locator('#codeShell').evaluate(e=>e.classList.contains('plain')),true);
   assert.deepEqual(errors,[]);
   await context.close();
   console.log(`PASS laboratorio ${width}px: 15 prácticas, métricas, resaltado, texto seguro y ancho móvil`);
  }
  const context=await browser.newContext(), page=await context.newPage();
  await page.goto(base);
  await page.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
  await page.locator('#showLabHint').click();
  await page.locator('#codeEditor').fill(examples[0].solution);
  await page.locator('#validateCode').click();
  assert.equal(await page.evaluate(()=>data.lab['lab-csharp-1'].unassisted),false);
  page.on('dialog',d=>d.accept());
  await page.locator('#resetLabDraft').click();
  assert.equal(await page.evaluate(()=>data.lab['lab-csharp-1'].hintUsed),true);
  // Exportación/importación v2: conserva borrador, métricas y asistencia.
  await page.getByRole('button',{name:'Mi progreso',exact:true}).click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportar progreso (.json)',exact:true}).click()]);
  const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  assert.equal(exported.version,2);assert.equal(exported.lab['lab-csharp-1'].solved,true);
  await page.getByRole('button',{name:'Reiniciar progreso',exact:true}).click();
  assert.equal(await page.evaluate(()=>Object.keys(data.lab||{}).length),0);
  await page.locator('#importFile').setInputFiles({name:'v2.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await page.waitForFunction(()=>!!data.lab?.['lab-csharp-1']?.solved);
  assert.equal(await page.evaluate(()=>data.lab['lab-csharp-1'].hintUsed),true);
  // Un archivo futuro no debe reemplazar datos silenciosamente.
  await page.locator('#importFile').setInputFiles({name:'future.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:99,done:{}}))});
  assert.equal(await page.evaluate(()=>data.lab['lab-csharp-1'].solved),true);
  await context.close();
 } finally {await browser.close();}
 // Cierre REAL del proceso de Chromium y reapertura del mismo perfil persistente.
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'csharp-lab-persist-'));
 let context;
 try {
  context=await chromium.launchPersistentContext(profile,launch);
  let page=await context.newPage();await page.goto(base);
  await page.evaluate(()=>localStorage.setItem('csharp-lab-v1',JSON.stringify({done:{c1:true,u1:true},attempts:{c1:3,u1:1}})));
  await page.reload();
  assert.equal(await page.evaluate(()=>data.done.c1&&data.done.u1),true);
  await page.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
  await page.locator('#codeEditor').fill(examples[0].solution);
  await page.locator('#validateCode').click();
  await context.close();context=null;
  context=await chromium.launchPersistentContext(profile,launch);
  page=await context.newPage();await page.goto(base);
  assert.equal(await page.evaluate(()=>data.done.c1&&data.done.u1),true);
  assert.equal(await page.evaluate(()=>data.attempts.c1),3);
  assert.equal(await page.evaluate(()=>data.lab['lab-csharp-1'].unassisted),true);
  await page.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
  assert.equal(await page.locator('#codeEditor').inputValue(),examples[0].solution);
  console.log('PASS cierre/reapertura real de Chromium: migración v1, aciertos, intentos y borrador v2');
 } finally {if(context)await context.close();await fs.rm(profile,{recursive:true,force:true});}
 console.log('PASS validación limitada, ayuda persistente, reinicio y exportación/importación v2');
})().catch(e=>{console.error(e);process.exitCode=1});
