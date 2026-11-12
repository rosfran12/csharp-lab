// Servidor estático desechable: reproduce el subdirectorio de GitHub Pages sin API.
const {chromium} = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const allowed = new Set(['index.html','lab.css','lab.js','lab-data.js','lab-validator.js','progress-v2.js','features.js','sw.js','icon.svg','manifest.webmanifest','runtime/Program.cs','runtime/Lab.csproj','runtime/LabRuntime.cs']);
const server = http.createServer(async(req,res)=>{
 const pathname = new URL(req.url,'http://localhost').pathname;
 if(!pathname.startsWith('/csharp-lab/')){res.writeHead(404);return res.end();}
 const file=pathname.slice('/csharp-lab/'.length)||'index.html';
 if(!allowed.has(file)){res.writeHead(404);return res.end();}
 try{
  const content=await fs.readFile(path.join(__dirname,'..',file));
  const type=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'text/plain';
  res.writeHead(200,{'Content-Type':type});res.end(content);
 }catch{res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath()),headless:true,args:['--no-sandbox']});
  const context=await browser.newContext(),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/csharp-lab/`);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('unrelated-cache');});
  await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button',{name:'Laboratorio de código',exact:true}).click();
  await page.locator('#codeEditor').fill('int puntos = 10;\nConsole.WriteLine(puntos);');
  await page.locator('#validateCode').click();
  assert.match(await page.locator('#labFeedback').innerText(),/Patrón de la práctica validado/);
  assert.equal(await page.evaluate(()=>caches.has('unrelated-cache')),true);
  assert.deepEqual(errors,[]);
  console.log('PASS GitHub Pages: laboratorio y validación offline bajo /csharp-lab/, sin backend');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
