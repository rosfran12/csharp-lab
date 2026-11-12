// Servidor opcional: node server.cjs. Publicar detrás de HTTPS.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const ProgressV2 = require('./progress-v2.js');
const LearningModel = require('./learning-model.js');
const store = path.resolve(process.env.LAB_DATA_DIR || path.join(root, '.lab-data'));
fs.mkdirSync(store, {recursive:true, mode:0o700});
const ids = ['c1','c2','c3','c4','c5','u1','u2','u3','u4','u5','a1','a2','a3','a4','a5'];
const files = new Set(['index.html','features.js','curriculum-data.js','learning-model.js','learning-ui.js','learning.css','progress-v2.js','lab-data.js','lab-validator.js','lab.js','lab.css','sw.js','manifest.webmanifest','icon.svg','runtime/Program.cs','runtime/Lab.csproj','runtime/LabRuntime.cs']);
const types = {'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.cs':'text/plain; charset=utf-8','.csproj':'text/plain; charset=utf-8'};
http.createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  const send = (status, value) => { res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(value)); };
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return send(400, {error:'URL inválida'}); }
  if (url.pathname === '/api/progress') {
    if (req.method !== 'POST') return send(405, {error:'Método inválido'});
    const auth = req.headers.authorization || '';
    if (!/^Bearer [a-zA-Z0-9_-]{32,128}$/.test(auth)) return send(401, {error:'Clave inválida'});
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(415, {error:'Se requiere JSON'});
    // No CORS: el navegador solo puede usar la API desde el mismo origen.
    const filename = path.join(store, crypto.createHash('sha256').update(auth.slice(7)).digest('hex')+'.json');
    try {
      let body = ''; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 6000000) return send(413, {error:'Archivo demasiado grande'}); body += chunk; }
      const incoming = JSON.parse(body);
      if (!incoming || !incoming.done || typeof incoming.done !== 'object' || Array.isArray(incoming.done)) return send(400, {error:'Progreso inválido'});
      // Operación síncrona y atómica: no se intercalan lecturas/escrituras entre solicitudes.
      const saved = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {done:{},attempts:{}};
      for (const id of ids) {
        if (incoming.done[id] === true) saved.done[id] = true;
        const n = incoming.attempts?.[id];
        if (Number.isSafeInteger(n) && n >= 0) saved.attempts[id] = Math.max(saved.attempts[id] || 0, n);
      }
      saved.learning = LearningModel.merge(saved.learning, incoming.learning);
      saved.lab = ProgressV2.mergeLab(saved.lab, incoming.lab);
      for (const value of Object.values(saved.lab)) value.draft = ''; // Solo métricas; los borradores se trasladan por JSON.
      fs.writeFileSync(filename+'.tmp', JSON.stringify(saved), {mode:0o600});
      fs.renameSync(filename+'.tmp', filename);
      return send(200, saved);
    } catch (error) { return send(error instanceof SyntaxError ? 400 : 500, {error:'No se pudo guardar el progreso'}); }
  }
  const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!files.has(name) || !['GET','HEAD'].includes(req.method)) return send(404, {error:'No encontrado'});
  try {
    const content = fs.readFileSync(path.join(root,name));
    res.writeHead(200, {'Content-Type':types[path.extname(name)], 'Cache-Control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { send(404, {error:'No encontrado'}); }
}).listen(Number(process.env.PORT || 8000), process.env.HOST || '127.0.0.1', () => console.log('C# Lab listo en el puerto '+(process.env.PORT || 8000)));
