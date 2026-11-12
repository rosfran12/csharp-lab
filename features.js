(() => {
  const offline = document.getElementById('offlineStatus');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
      offline.textContent = 'Disponible sin conexión después de esta carga. El navegador puede eliminar su caché.';
    }).catch(() => { offline.textContent = 'No se pudo preparar el acceso offline. Reintentá con conexión mediante HTTPS o localhost.'; });
  } else offline.textContent = 'Para instalar el acceso offline, abrí el sitio mediante HTTPS o localhost.';
  const keyInput = document.getElementById('syncKey'), status = document.getElementById('syncStatus');
  let key = '', busy = false, pending = false;
  try { key = localStorage.getItem('csharp-lab-sync-key') || ''; } catch {}
  keyInput.value = key;
  document.getElementById('newSyncKey').onclick = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    keyInput.value = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    status.textContent = 'Clave generada. Copiala a tus otros dispositivos y pulsá Conectar.';
  };
  async function sync() {
    if (!key) return;
    if (busy) { pending = true; return; }
    busy = true;
    const activeKey = key;
    const previous = JSON.stringify(data);
    try {
      const payload = {...data, lab:Object.fromEntries(Object.entries(data.lab || {}).map(([id, value]) => [id, {...value, draft:''}]))};
      const response = await fetch('./api/progress', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+key}, body:JSON.stringify(payload), cache:'no-store' });
      if (!response.ok) throw Error();
      const remote = cleanProgress(await response.json());
      if (key !== activeKey) return;
      for (const ex of exercises) {
        if (remote.done[ex.id]) data.done[ex.id] = true;
        data.attempts[ex.id] = Math.max(data.attempts[ex.id] || 0, remote.attempts[ex.id] || 0);
      }
      for (const [id, value] of Object.entries(remote.lab || {})) {
        if (!data.lab?.[id]) value.draft = CodeLabData.find(ex => ex.id === id)?.starter || '';
      }
      data.lab = ProgressV2.mergeLab(data.lab, remote.lab);
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
      if (JSON.stringify(data) !== previous) render();
      status.textContent = 'Progreso sincronizado. Se actualizará automáticamente mientras la página esté abierta.';
    } catch { status.textContent = 'Sin conexión con el servidor de sincronización. El progreso sigue disponible localmente; se reintentará.'; }
    finally { busy = false; if (pending) { pending = false; sync(); } }
  }
  window.queueSync = () => { if (key) { clearTimeout(window.syncTimer); window.syncTimer = setTimeout(sync, 600); } };
  document.getElementById('connectSync').onclick = () => {
    const candidate = keyInput.value.trim();
    if (!/^[a-zA-Z0-9_-]{32,128}$/.test(candidate)) { status.textContent = 'Usá una clave de 32 a 128 letras, números, guiones o guiones bajos.'; return; }
    key = candidate;
    try { localStorage.setItem('csharp-lab-sync-key', key); } catch {}
    sync();
  };
  document.getElementById('disconnectSync').onclick = () => {
    key = ''; keyInput.value = '';
    try { localStorage.removeItem('csharp-lab-sync-key'); } catch {}
    status.textContent = 'Sincronización desconectada. La copia local se conserva.';
  };
  window.addEventListener('online', sync);
  setInterval(sync, 30000);
  if (key) sync();
})();
