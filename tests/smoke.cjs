// Ejecutar con Playwright instalado: node tests/smoke.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath()),
    headless: true, args: ['--no-sandbox']
  });
  try {
    for (const width of [360, 390, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width <= 390, hasTouch: width <= 390 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
      assert.equal(await page.locator('#cards .card').count(), 3);
      const exercises = await page.evaluate(() => exercises.map(x => ({ id:x.id, route:x.route, title:x.title, answer:x.answer, type:x.type })));
      assert.equal(exercises.length, 15);
      await page.getByRole('button', { name:'Curso guiado', exact:true }).click();
      await page.locator('#lesson button.primary').click();
      assert.match(await page.locator('#result-lesson').innerText(), /Elegí/);
      await page.locator('#lesson input[value="0"]').check();
      await page.locator('#lesson button.primary').click();
      assert.match(await page.locator('#result-lesson').innerText(), /Todavía no/);
      for (const ex of exercises) {
        const routeLabel = {csharp:'C# general', unity:'C# para Unity', audio:'Game Audio'}[ex.route];
        await page.locator('#routeButtons').getByRole('button', {name:routeLabel}).click();
        await page.locator('.lesson-list').getByRole('button', {name:new RegExp(ex.title)}).click();
        if (ex.type === 'number') {
          await page.locator('#answer-lesson').fill('999');
          await page.locator('#lesson button.primary').click();
          assert.match(await page.locator('#result-lesson').innerText(), /Todavía no/);
          await page.locator('#answer-lesson').fill(String(ex.answer));
        } else await page.locator(`#lesson input[value="${ex.answer}"]`).check();
        await page.locator('#lesson button.primary').click();
        assert.match(await page.locator('#result-lesson').innerText(), /¡Correcto!/);
        assert.ok((await page.locator('#result-lesson').innerText()).length > 25);
        await page.locator('#lesson').getByRole('button', {name:'Otro ejercicio'}).click();
        assert.notEqual(await page.locator('#lesson article').getAttribute('data-exercise'), ex.id);
        // Finishing another route must not mutate completed or unstarted routes.
        const done = await page.evaluate(() => JSON.parse(localStorage.getItem('csharp-lab-v1')).done);
        assert.equal(done[ex.id], true);
        assert.equal(Object.keys(done).length, exercises.indexOf(ex) + 1);
      }
      await page.reload();
      assert.equal(await page.locator('#cards strong').filter({hasText:'100%'}).count(), 3);
      for (const name of ['Panel','Curso guiado','Práctica libre','Mi progreso']) {
        await page.getByRole('button', {name, exact:true}).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}: overflow on ${name}`);
      }
      await page.getByRole('button', {name:'Práctica libre', exact:true}).click();
      await page.locator('#practiceRoute').selectOption('audio');
      await page.getByRole('button', {name:'Nuevo desafío'}).click();
      assert.match(await page.locator('#challenge').innerText(), /Game Audio/);
      const first = await page.locator('#challenge h3').first().innerText();
      await page.getByRole('button', {name:'Nuevo desafío'}).click();
      assert.notEqual(await page.locator('#challenge h3').first().innerText(), first);
      await page.getByRole('button', {name:'Mi progreso', exact:true}).click();
      const downloaded = page.waitForEvent('download');
      await page.getByRole('button', {name:'Exportar progreso (.json)'}).click();
      const progress = JSON.parse(await fs.readFile(await (await downloaded).path(), 'utf8'));
      assert.equal(Object.keys(progress.done).length, 15);
      page.once('dialog', d => d.accept());
      await page.getByRole('button', {name:'Reiniciar progreso', exact:true}).click();
      assert.equal(await page.locator('#progressCards h2').filter({hasText:/^0%$/}).count(), 3);
      page.once('dialog', d => d.accept());
      await page.locator('#importFile').setInputFiles({name:'progress.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(progress))});
      await page.waitForFunction(() => Object.keys(JSON.parse(localStorage.getItem('csharp-lab-v1')).done).length === 15);
      const invalidDialog = page.waitForEvent('dialog');
      await page.locator('#importFile').setInputFiles({name:'bad.json', mimeType:'application/json', buffer:Buffer.from('{"done":[]}')});
      const dialog = await invalidDialog; assert.match(dialog.message(), /no válido/); await dialog.accept();
      assert.equal(await page.evaluate(() => Object.keys(data.done).length), 15);
      // Existing v1 exports keep original exercise identifiers and ignore unknown data.
      await page.evaluate(() => localStorage.setItem('csharp-lab-v1', JSON.stringify({done:{c1:true,unknown:true}, attempts:{c1:2}})));
      await page.reload();
      assert.match(await page.locator('#cards').innerText(), /20% completado/);
      assert.equal(await page.evaluate(() => Object.keys(data.done).length), 1);
      await page.evaluate(() => localStorage.setItem('csharp-lab-v1', 'null'));
      await page.reload();
      assert.match(await page.locator('#storageStatus').innerText(), /recuperar/);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: 15 ejercicios, rutas, corrección, persistencia, práctica, exportación/importación y compatibilidad v1`);
      await context.close();
    }
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
    const page = await blocked.newPage();
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
    await page.getByRole('button', {name:'Curso guiado',exact:true}).click();
    await page.locator('#lesson input[value="1"]').check();
    await page.locator('#lesson button.primary').click();
    assert.match(await page.locator('#storageStatus').innerText(), /No se pudo guardar/);
    assert.match(await page.locator('#result-lesson').innerText(), /¡Correcto!/);
    await blocked.close();
    console.log('PASS almacenamiento bloqueado: aviso y sesión operativa');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
