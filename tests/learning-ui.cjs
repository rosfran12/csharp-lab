const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const C=require('../curriculum-data.js'),M=require('../learning-model.js');
const fs=require('node:fs/promises');
const launch={executablePath:process.env.CHROMIUM_PATH||(require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox']};
const base=process.env.TEST_URL||'http://127.0.0.1:8000';
const start=Date.UTC(2026,10,12,12);
(async()=>{
 const browser=await chromium.launch(launch);
 try{
  for(const width of [360,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.clock.setFixedTime(start);
   await page.goto(base);
   // Importar progreso anterior no fabrica dominio ni borra aciertos.
   await page.evaluate(()=>{data.done={c1:true,u1:true,a1:true};data.attempts={c1:2};save();});
   await page.getByRole('button',{name:'Abrir diagnóstico inicial',exact:true}).click();
   for(const q of C.questions.filter(q=>q.purpose==='diagnostic')){
    const form=page.locator(`[data-question="${q.id}"]`);
    await form.locator(`input[value="${q.answer}"]`).check();await form.locator('button[type=submit]').click();
   }
   assert.match(await page.locator('#diagnosticSummary').innerText(),/6\/6/);
   assert.equal(await page.evaluate(()=>LearningModel.summary(data.learning).report.variables.understood),false);
   assert.equal(await page.evaluate(()=>Object.keys(data.done).length),3);
   await page.getByRole('button',{name:'Mapa curricular',exact:true}).click();
   assert.equal(await page.locator('[data-open-unit="operators"]').isDisabled(),true);
   for(const id of Object.keys(C.units)){
    await page.locator(`[data-open-unit="${id}"]`).click();
    await page.locator('[data-demo="0"]').fill(id==='variables'?'45':'4');
    assert.ok((await page.locator('#unitDemoResult').innerText()).length>10);
    await page.locator('#confirmLesson').click();
    const practice=C.questions.find(q=>q.competency===id&&q.purpose==='practice');
    let form=page.locator(`[data-question="${practice.id}"]`);
    await form.locator('[data-hint]').click();
    await form.locator(`input[value="${(practice.answer+1)%practice.choices.length}"]`).check();
    await form.locator('button[type=submit]').click();
    for(const q of C.questions.filter(q=>q.competency===id&&['practice','assessment','application'].includes(q.purpose))){
     form=page.locator(`[data-question="${q.id}"]`);
     await form.locator(`input[value="${q.answer}"]`).check();await form.locator('button[type=submit]').click();
    }
    const evidence=await page.evaluate(id=>LearningModel.summary(data.learning).report[id],id);
    assert.equal(evidence.seen&&evidence.practiced&&evidence.understood&&evidence.applied,true);
    assert.equal(evidence.consolidated,false);assert.equal(evidence.hints,1);
    assert.equal(Object.values(evidence.errors).reduce((a,b)=>a+b,0),1);
    await page.getByRole('button',{name:'Mapa curricular',exact:true}).click();
   }
   // Proyecto secuencial: notas autodeclaradas, sin aumentar consolidación.
   await page.getByRole('button',{name:'Proyecto de pasos',exact:true}).click();
   for(const step of C.project){
    await page.locator(`#note-${step.id}`).fill('Diseño pendiente de verificar en mi PC. <img src=x onerror=alert(1)>');
    await page.locator(`[data-project="${step.id}"] button`).click();
    assert.match(await page.locator(`[data-project="${step.id}"] [role=status]`).innerText(),/Sin verificación/);
   }
   assert.equal(await page.locator('#footstepsProject img').count(),0);
   // No se puede resolver anticipadamente un repaso ni consolidar en la misma sesión.
   await page.getByRole('button',{name:'Repasos',exact:true}).click();
   assert.equal(await page.locator('#reviewQueue form').count(),0);
   let time=start+M.DAY;
   for(const wait of [3,7,14]){
    await page.clock.setFixedTime(time);
    await page.getByRole('button',{name:'Repasos',exact:true}).click();
    const q=await page.evaluate(()=>LearningModel.reviewQuestion(data.learning,'variables'));
    assert.ok(q);
    const form=page.locator(`[data-question="${q.id}"]`);
    assert.equal(await form.locator('input:checked').count(),0);
    assert.equal(await form.locator('[role=status]').innerText(),'');
    await form.locator(`input[value="${q.answer}"]`).check();await form.locator('button[type=submit]').click();
    assert.equal(await form.locator('button[type=submit]').isDisabled(),true);
    time+=wait*M.DAY;
   }
   assert.equal(await page.evaluate(()=>LearningModel.summary(data.learning).report.variables.consolidated),true);
   await page.getByRole('button',{name:'Panel de evidencias',exact:true}).click();
   assert.match(await page.locator('#learningErrors').innerText(),/respuestas incorrectas/);
   await page.reload();
   assert.equal(await page.evaluate(()=>LearningModel.summary(data.learning).report.variables.consolidated),true);
   assert.equal(await page.evaluate(()=>data.attempts.c1),2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   assert.deepEqual(errors,[]);
   await context.close();
   console.log(`PASS aprendizaje ${width}px: diagnóstico, unidad, desbloqueos, notas, errores y tres fechas de repaso`);
  }
  // Exportación/importación y unión real de evidencias entre dispositivos.
  const a=await browser.newContext(),b=await browser.newContext(),pa=await a.newPage(),pb=await b.newPage();
  for(const p of [pa,pb])await p.goto(base);
  await pa.evaluate(()=>LearningUI.record('seen','variables'));
  await pa.getByRole('button',{name:'Mi progreso',exact:true}).click();
  const [download]=await Promise.all([pa.waitForEvent('download'),pa.getByRole('button',{name:'Exportar progreso (.json)',exact:true}).click()]);
  const json=await fs.readFile(await download.path(),'utf8');
  assert.equal(JSON.parse(json).learning.events.length,1);
  pb.on('dialog',d=>d.accept());
  await pb.locator('#importFile').setInputFiles({name:'v21.json',mimeType:'application/json',buffer:Buffer.from(json)});
  await pb.waitForFunction(()=>data.learning?.events.length===1);
  const key=require('node:crypto').randomBytes(32).toString('hex');
  for(const p of [pa,pb]){
   await p.getByRole('button',{name:'Mi progreso',exact:true}).click();await p.locator('#syncKey').fill(key);await p.locator('#connectSync').click();
   await p.waitForFunction(()=>document.getElementById('syncStatus').textContent.startsWith('Progreso sincronizado'));
  }
  await pb.evaluate(()=>LearningUI.record('seen','operators'));
  await pb.waitForTimeout(1000);
  await pa.locator('#connectSync').click();
  await pa.waitForFunction(()=>data.learning.events.length===2);
  assert.equal(await pa.evaluate(()=>data.learning.events.filter(e=>e.activity==='variables').length),1);
  await a.close();await b.close();
  console.log('PASS aprendizaje: JSON 2.1 y sincronización idempotente entre navegadores');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
