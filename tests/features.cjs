const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath()),headless:true,args:['--no-sandbox']});
 try {
  const a = await browser.newContext(), b = await browser.newContext();
  const pa = await a.newPage(), pb = await b.newPage();
  await pa.goto('http://127.0.0.1:8000');
  await pb.goto('http://127.0.0.1:8000');
  const key = require('node:crypto').randomBytes(32).toString('hex');
  for (const page of [pa,pb]) {
   await page.getByRole('button',{name:'Mi progreso',exact:true}).click();
   await page.locator('#syncKey').fill(key);
   await page.locator('#connectSync').click();
   await page.waitForFunction(() => document.getElementById('syncStatus').textContent.startsWith('Progreso sincronizado'));
  }
  await pa.evaluate(() => { data.done.c1=true; data.attempts.c1=2; data.lab = {'lab-unity-1': {attempts:3,errors:2,solved:true,unassisted:false,hintUsed:true,draft:'local draft'}}; save(); });
  await pa.waitForTimeout(1000);
  await pb.locator('#connectSync').click();
  await pb.waitForFunction(() => data.done.c1 === true && data.attempts.c1 === 2);
  await pb.waitForFunction(() => data.lab?.['lab-unity-1']?.solved === true);
  assert.equal(await pb.evaluate(() => data.lab['lab-unity-1'].errors),2);
  assert.equal(await pb.evaluate(() => data.lab['lab-unity-1'].hintUsed),true);
  assert.equal(await pa.evaluate(() => data.lab['lab-unity-1'].draft),'local draft');
  const unauth = await b.request.post('http://127.0.0.1:8000/api/progress',{data:{done:{}}});
  assert.equal(unauth.status(),401);
  assert.equal((await b.request.get('http://127.0.0.1:8000/.lab-data/')).status(),404);
  await pa.evaluate(() => navigator.serviceWorker.ready);
  await pa.reload();
  await pa.waitForFunction(() => !!navigator.serviceWorker.controller);
  await a.setOffline(true);
  await pa.reload();
  assert.equal(await pa.locator('#cards .card').count(),3);
  await pa.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
  assert.equal(await pa.locator('#labExercise option').count(),5);
  await pa.locator('#codeEditor').fill('int puntos = 10;\nConsole.WriteLine(puntos);');
  await pa.locator('#validateCode').click();
  assert.match(await pa.locator('#labFeedback').innerText(),/Patrón de la práctica validado/);
  const cs = await pa.evaluate(async () => (await fetch('./runtime/Program.cs')).text());
  assert.match(cs,/Console.WriteLine/);
  await a.close(); await b.close();
  console.log('OK: sincronización entre contextos, autenticación, archivos privados y recarga/descargas offline');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
