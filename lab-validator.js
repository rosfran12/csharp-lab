/* Comparación léxica de patrones conocidos. No compila, interpreta ni evalúa C#. */
(function(root,factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CodeValidator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function tokens(source) {
    if (typeof source !== 'string' || source.length > 12000) throw Error('El límite del editor es de 12.000 caracteres.');
    const out = [];
    const re = /\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\[^\r\n]|[^"\\\r\n])*"|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?[fFdD]?|>=|<=|==|!=|\+\+|--|\+=|-=|&&|\|\||[{}();.,+*\/%<>=!\[\]-]/y;
    let pos = 0;
    while (pos < source.length) {
      re.lastIndex = pos;
      const m = re.exec(source);
      if (!m) throw Error(`Texto fuera del subconjunto admitido en la línea ${source.slice(0,pos).split('\n').length}.`);
      const t = m[0];
      if (source.startsWith('/*',pos) && !t.startsWith('/*')) throw Error('Comentario de bloque sin cerrar.');
      if (!/^\s|^\/\//.test(t) && !t.startsWith('/*')) out.push({value:t,line:source.slice(0,pos).split('\n').length});
      pos = re.lastIndex;
    }
    return out;
  }
  function validate(source, solution) {
    try {
      const actual = tokens(source), expected = tokens(solution);
      const i = expected.findIndex((t,i) => t.value !== actual[i]?.value);
      if (i !== -1) return {ok:false, message:`Línea ${actual[i]?.line || expected[i].line}: el código no coincide con el patrón solicitado. Revisá la consigna y los marcadores ___. No es un diagnóstico del compilador C#.`};
      if (actual.length !== expected.length) return {ok:false,message:'Hay instrucciones adicionales fuera del patrón admitido. No se ejecutaron.'};
      return {ok:true,message:'Patrón de la práctica validado. No se compiló ni ejecutó el código; esto no demuestra su comportamiento en .NET, Unity o Wwise.'};
    } catch(e) { return {ok:false,message:e.message+' No se ejecutó el código.'}; }
  }
  return {tokens,validate};
});
