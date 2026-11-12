/* Esquema compartido por navegador y servidor. Se conserva la clave v1. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ProgressV2 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ids = ['csharp','unity','audio'].flatMap(route => [1,2,3,4,5].map(n => `lab-${route}-${n}`));
  const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
  function cleanLab(input) {
    const result = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return result;
    for (const id of ids) {
      const x = input[id];
      if (!x || typeof x !== 'object' || Array.isArray(x)) continue;
      const attempts = count(x.attempts);
      result[id] = {attempts, errors:Math.min(count(x.errors), attempts), solved:x.solved === true,
        unassisted:x.solved === true && x.unassisted === true, hintUsed:x.hintUsed === true,
        draft:typeof x.draft === 'string' ? x.draft.slice(0, 12000) : ''};
    }
    return result;
  }
  function mergeLab(local, remote) {
    const a = cleanLab(local), b = cleanLab(remote);
    for (const id of ids) {
      if (!b[id]) continue;
      if (!a[id]) { a[id] = b[id]; continue; }
      const x = a[id], y = b[id];
      for (const key of ['attempts','errors']) x[key] = Math.max(x[key], y[key]);
      for (const key of ['solved','unassisted','hintUsed']) x[key] = x[key] || y[key];
      // El borrador del dispositivo activo tiene prioridad; no es edición colaborativa.
    }
    return a;
  }
  return {ids, cleanLab, mergeLab};
});
