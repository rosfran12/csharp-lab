(() => {
  const section = document.getElementById('codeLab');
  section.innerHTML = `<h2>Laboratorio de código</h2>
    <p class="lab-notice"><strong>Modo de validación limitada · No es un compilador.</strong> Compara tokens con un patrón conocido por práctica. Ignora espacios y comentarios; puede rechazar otras soluciones C# correctas. No ejecuta código ni comprueba tipos o resultados.</p>
    <div class="lab-toolbar"><label>Ruta<select id="labRoute"><option value="csharp">C# general</option><option value="unity">C# para Unity</option><option value="audio">Game Audio</option></select></label><label>Práctica progresiva<select id="labExercise"></select></label></div>
    <article class="card"><h3 id="labTitle"></h3><p id="labTask"></p><p id="labConnection" class="muted"></p>
    <label class="code-label" for="codeEditor">Código C# editable</label><p id="editorHelp" class="muted">Reemplazá los marcadores ___. Se guarda al escribir. Podés usar el teclado del celular; Tab conserva la navegación entre controles. Límite: 12.000 caracteres.</p>
    <label><input id="plainCode" type="checkbox"> Texto sin resaltado</label>
    <div class="code-shell" id="codeShell"><div class="code-gutter" aria-hidden="true"><div id="codeLines"></div></div><div class="code-area"><div class="code-highlight" aria-hidden="true"><pre id="codeHighlight"></pre></div><textarea id="codeEditor" aria-describedby="editorHelp" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="12000"></textarea></div></div>
    <div class="lab-actions"><button class="primary" id="validateCode">Validar patrón</button><button id="showLabHint">Ver pista</button><button id="showLabSolution">Ver solución (con ayuda)</button><button id="resetLabDraft">Restaurar ejemplo</button><button id="downloadLabCode">Descargar .cs</button></div>
    <p id="labHint" hidden></p><p id="labFeedback" role="status"></p><p id="labRecord" class="muted"></p></article>
    <h3>Programación por ruta</h3><div id="labStats" class="lab-stats"></div>`;
  const editor = document.getElementById('codeEditor'), routeSelect = document.getElementById('labRoute'), exerciseSelect = document.getElementById('labExercise');
  const feedback = document.getElementById('labFeedback'), hint = document.getElementById('labHint');
  let selected = CodeLabData[0];
  const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  function highlight() {
    const source = editor.value;
    // Reconoce comentarios y strings antes de colorear palabras; siempre escapa HTML.
    const re = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\])*"|\b(?:int|float|bool|if|else|for|while|return|true|false|void|public|class|using)\b|\b\d+(?:\.\d+)?[fF]?\b/g;
    let output = '', last = 0;
    for (const m of source.matchAll(re)) {
      output += escape(source.slice(last,m.index));
      const type = m[0].startsWith('/') ? 'comment' : m[0].startsWith('"') ? 'string' : /^\d/.test(m[0]) ? 'number' : 'keyword';
      output += `<span class="tok-${type}">${escape(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    document.getElementById('codeHighlight').innerHTML = output + escape(source.slice(last)) + '\n';
    document.getElementById('codeLines').textContent = Array.from({length:source.split('\n').length},(_,i)=>i+1).join('\n');
    alignScroll();
  }
  function alignScroll() {
    document.getElementById('codeHighlight').style.transform = `translate(${-editor.scrollLeft}px, ${-editor.scrollTop}px)`;
    document.getElementById('codeLines').style.transform = `translateY(${-editor.scrollTop}px)`;
  }
  function record() {
    data.lab ||= {};
    return data.lab[selected.id] ||= {attempts:0,errors:0,solved:false,unassisted:false,hintUsed:false,draft:selected.starter};
  }
  function stats() {
    const lab = ProgressV2.cleanLab(data.lab);
    const markup = Object.keys(routes).map(r => {
      const entries = CodeLabData.filter(ex=>ex.route===r).map(ex=>lab[ex.id]).filter(Boolean);
      return `<div class="card"><h4>${routes[r].name}</h4><p>${entries.filter(x=>x.solved).length}/5 patrones resueltos</p><p>${entries.reduce((n,x)=>n+x.attempts,0)} intentos · ${entries.reduce((n,x)=>n+x.errors,0)} errores de validación</p><p>${entries.filter(x=>x.unassisted).length} resueltos sin ayuda</p></div>`;
    }).join('');
    document.getElementById('labStats').innerHTML = markup;
    document.getElementById('labProgressSummary').innerHTML = markup;
    const x = lab[selected.id];
    document.getElementById('labRecord').textContent = x ? `${x.attempts} intentos · ${x.errors} errores de validación · ${x.solved?'Patrón resuelto':'Pendiente'}${x.unassisted?' · Resuelto sin ayuda':x.hintUsed?' · Se consultó ayuda':''}` : 'Sin intentos.';
  }
  function loadExercise() {
    selected = CodeLabData.find(ex=>ex.id===exerciseSelect.value) || CodeLabData[0];
    const saved = data.lab?.[selected.id];
    editor.value = saved ? saved.draft : selected.starter;
    document.getElementById('labTitle').textContent = selected.topic+' · '+selected.title;
    document.getElementById('labTask').textContent = selected.task;
    document.getElementById('labConnection').textContent = selected.connection;
    feedback.textContent = ''; hint.hidden = true; hint.textContent = '';
    highlight(); stats();
  }
  function chooseRoute() {
    exerciseSelect.replaceChildren(...CodeLabData.filter(ex=>ex.route===routeSelect.value).map((ex,i) => new Option(`${i+1}. ${ex.topic}: ${ex.title}`, ex.id)));
    loadExercise();
  }
  editor.addEventListener('input', () => { record().draft = editor.value; save(); highlight(); feedback.textContent = ''; });
  editor.addEventListener('scroll', alignScroll);
  routeSelect.onchange = chooseRoute;
  exerciseSelect.onchange = loadExercise;
  document.getElementById('plainCode').onchange = e => document.getElementById('codeShell').classList.toggle('plain',e.target.checked);
  document.getElementById('validateCode').onclick = () => {
    const x = record(), result = CodeValidator.validate(editor.value, selected.solution);
    x.draft = editor.value; x.attempts++;
    if (result.ok) { x.solved = true; if (!x.hintUsed) x.unassisted = true; } else x.errors++;
    save(); stats(); feedback.textContent = result.message;
  };
  document.getElementById('showLabHint').onclick = () => { record().hintUsed = true; save(); stats(); hint.hidden = false; hint.textContent = selected.hint; };
  document.getElementById('showLabSolution').onclick = () => { record().hintUsed = true; save(); stats(); hint.hidden = false; hint.textContent = 'Solución de referencia (no ejecutada):\n'+selected.solution; };
  document.getElementById('resetLabDraft').onclick = () => {
    if (!confirm('¿Restaurar el código inicial? Se conserva el historial de intentos y ayuda.')) return;
    record().draft = selected.starter; save(); loadExercise();
  };
  document.getElementById('downloadLabCode').onclick = () => {
    const url = URL.createObjectURL(new Blob([editor.value],{type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = selected.id+'.cs'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.addEventListener('progress-render', stats);
  window.addEventListener('progress-replaced', loadExercise);
  chooseRoute();
})();
