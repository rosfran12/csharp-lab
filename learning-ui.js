(() => {
  const C=Curriculum,M=LearningModel, root=document.getElementById('learning');
  const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const names=Object.fromEntries(C.nodes.map(n=>[n.id,n.name]));
  const date=t=>new Date(t).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
  const state=()=>M.summary(data.learning);
  let currentUnit='variables';
  root.innerHTML=`<h2>Aprendizaje progresivo · C# Lab 2.1</h2><p class="learning-note">Unidad 1: variables, operadores y condicionales. Los estados se calculan con evidencias de actividades; no representan porcentajes de dominio. El diagnóstico orienta, pero no acredita comprensión por sí solo.</p>
    <p id="learningStatus" role="status"></p><nav class="learning-nav" aria-label="Aprendizaje"><button data-learning-tab="map" aria-pressed="true">Mapa curricular</button><button data-learning-tab="diagnostic" aria-pressed="false">Diagnóstico inicial</button><button data-learning-tab="unit" aria-pressed="false">Unidad 1</button><button data-learning-tab="evidence" aria-pressed="false">Panel de evidencias</button><button data-learning-tab="reviews" aria-pressed="false">Repasos</button><button data-learning-tab="project" aria-pressed="false">Proyecto de pasos</button></nav>
    <div id="learning-map" class="learning-tabpanel"><h3>Niveles y prerrequisitos</h3><label for="curriculumRoute">Ver ruta</label><select id="curriculumRoute"><option value="all">Las tres rutas</option><option value="csharp">C# general</option><option value="unity">C# para Unity</option><option value="audio">Game Audio</option></select><p>Los fundamentos son compartidos. Las unidades futuras se muestran como planificadas; los laboratorios anteriores siguen disponibles.</p><div id="curriculumMap" class="learning-grid"></div><h3>Próximas actividades</h3><div id="learningRecommendations"></div></div>
    <div id="learning-diagnostic" class="learning-tabpanel" hidden><h3>Diagnóstico inicial</h3><p>Seis preguntas, dos por competencia. Podés responder en varias sesiones. Se conserva la última respuesta y el historial de intentos. No cambia tus aciertos anteriores ni habilita automáticamente competencias.</p><div id="diagnosticSummary" role="status"></div><div id="diagnosticQuestions"></div></div>
    <div id="learning-unit" class="learning-tabpanel" hidden><h3>Unidad 1 · Fundamentos para juegos y audio</h3><label for="unitCompetency">Competencia</label><select id="unitCompetency"></select><div id="unitContent"></div></div>
    <div id="learning-evidence" class="learning-tabpanel" hidden><h3>Panel de evidencias</h3><details id="learningDetails"><summary>Cómo se calcula cada estado</summary><p>Visto: confirmaste la lectura. Practicado: enviaste al menos una respuesta de práctica. Comprendido: visto y practicado, con las dos últimas respuestas de evaluación correctas. Aplicado: además, resolviste el caso de aplicación. Consolidado: además, acertaste tres repasos programados consecutivos en fechas distintas. Son criterios de esta unidad, no una certificación. Un error de repaso reinicia la secuencia de consolidación.</p><p>Los patrones del laboratorio son práctica de escritura limitada; nunca se toman como prueba de compilación ni como evaluación de comprensión. El historial anterior se conserva sin inventarle fechas o evidencias.</p></details><div id="learningEvidence" class="learning-grid"></div><h3>Errores frecuentes e intentos</h3><div id="learningErrors"></div><h3>Actividad reciente</h3><ol id="learningHistory"></ol></div>
    <div id="learning-reviews" class="learning-tabpanel" hidden><h3>Repasos espaciados</h3><p>El primer repaso se programa 24 horas después de completar correctamente la evaluación de una competencia. Tras acertar, el intervalo pasa a 3, 7 y luego 14 días. Un error vuelve a 1 día. Se usa el reloj de este dispositivo y la fecha real de respuesta; varias respuestas el mismo día no adelantan la consolidación. No hay notificaciones con la aplicación cerrada.</p><div id="reviewQueue"></div></div>
    <div id="learning-project" class="learning-tabpanel" hidden><h3>Proyecto guiado: de variables a pasos en Unity + Wwise</h3><p>Los tres primeros pasos aplican los fundamentos a un diseño. La integración real se realiza en tu PC con Unity y Wwise. Las notas son declaraciones del estudiante; no verifican que un runtime haya funcionado ni suman estados de dominio.</p><div id="footstepsProject"></div><p><a href="./runtime/LabRuntime.cs" download>Componente inicial de Unity (2.0)</a> · <a href="./runtime/Program.cs" download>Prácticas .NET</a></p></div>`;

  function record(kind,activity,extra={}) {
    const order=Math.max(0,...M.clean(data.learning).events.map(e=>e.order))+1;
    const event={id:crypto.randomUUID(),at:Date.now(),order,kind,activity,...extra};
    try {
      data.learning=M.merge(data.learning,{version:1,events:[event]});
      save(); refreshSummary();
      document.getElementById('learningStatus').textContent='Evidencia guardada en esta sesión.';
      return true;
    } catch(e) { document.getElementById('learningStatus').textContent=e.message+' Conservá una copia exportando el progreso.'; return false; }
  }
  window.LearningUI={record};
  document.getElementById('startDiagnostic').onclick=()=>{go('learning');showTab('diagnostic');};
  const badges=x=>`<ul class="learning-badges">${[['seen','Visto'],['practiced','Practicado'],['understood','Comprendido'],['applied','Aplicado'],['consolidated','Consolidado']].map(([key,label])=>`<li class="${x[key]?'evidence-yes':''}">${x[key]?'✓':'○'} ${label}</li>`).join('')}</ul>`;
  function refreshSummary() {
    const s=state();
    const cards=Object.entries(s.report).map(([id,x])=>`<div class="card"><h3>${names[id]}</h3>${badges(x)}<p>Evaluación actual: ${x.assessmentCorrect}/${x.assessmentTotal} respuestas correctas.</p><p>${x.attempts} intentos · ${x.hints} pistas consultadas</p><p>Repasos programados acertados consecutivos: ${x.review.streak}. ${x.review.due===null?'Aún sin fecha de repaso.':'Próximo: '+date(x.review.due)}</p></div>`).join('');
    document.getElementById('diagnosticHomeStatus').textContent=s.diagnosticDone?'Diagnóstico completado. Revisá tus próximas actividades.':`Empezá por el diagnóstico inicial (${s.diagnosticAnswered}/${s.diagnosticTotal} respuestas).`;
    document.getElementById('learningEvidence').innerHTML=cards;
    document.getElementById('learningProgressSummary').innerHTML=cards;
    document.getElementById('diagnosticSummary').textContent=`${s.diagnosticAnswered}/${s.diagnosticTotal} preguntas respondidas. `+Object.entries(s.report).map(([id,x])=>`${names[id]}: ${x.diagnosticCorrect}/${x.diagnosticTotal} correctas${x.diagnosticCorrect===x.diagnosticTotal?' (señal inicial favorable; falta evaluación)':' (conviene revisar fundamentos)'}`).join(' · ');
    document.getElementById('learningRecommendations').innerHTML=s.recommendations.map(r=>`<p>${escape(r.text)} <button data-next="${r.target}" data-competency="${r.competency||'variables'}">Ir a la actividad</button></p>`).join('')||'<p>No hay actividades pendientes en esta unidad.</p>';
    const frequent=Object.entries(s.report).flatMap(([id,x])=>Object.entries(x.errors).map(([tag,count])=>({id,tag,count}))).sort((a,b)=>b.count-a.count);
    const patterns=s.events.filter(e=>e.kind==='pattern'),legacy=s.events.filter(e=>e.kind==='legacy');
    document.getElementById('learningErrors').innerHTML=(frequent.length?`<ul>${frequent.map(x=>`<li>${names[x.id]} · ${escape(x.tag)}: ${x.count} respuestas incorrectas</li>`).join('')}</ul>`:'<p>Todavía no se registraron errores en las actividades nuevas.</p>')+`<p>Desde 2.1: ${patterns.length} validaciones de patrones (${patterns.filter(e=>!e.ok).length} no coincidentes) y ${legacy.length} intentos en cuestionarios anteriores (${legacy.filter(e=>!e.ok).length} incorrectos). Las pistas del laboratorio se registran aparte: ${s.events.filter(e=>e.kind==='hint'&&e.activity.startsWith('lab-')).length}.</p><p>Historial anterior conservado: ${Object.keys(data.done).length} cuestionarios resueltos y ${Object.values(data.lab||{}).filter(x=>x.solved).length} patrones resueltos. Sus fechas y errores detallados anteriores no se pueden reconstruir.</p>`;
    const purposeNames={diagnostic:'diagnóstico',practice:'práctica',assessment:'evaluación',application:'aplicación',review:'repaso'};
    const kinds={seen:'Lectura confirmada',answer:'Respuesta',hint:'Ayuda consultada',project:'Nota de proyecto (autodeclarada)',pattern:'Validación de patrón',legacy:'Cuestionario anterior'};
    document.getElementById('learningHistory').innerHTML=s.events.slice(-20).reverse().map(e=>{const q=C.questions.find(q=>q.id===e.activity);return `<li>${date(e.at)} · ${kinds[e.kind]} · ${escape(q?names[q.competency]+' / '+purposeNames[q.purpose]:e.activity)}${q&&e.kind==='answer'?(e.answer===q.answer?' · Correcta':' · Incorrecta'):''}</li>`;}).join('')||'<li>Sin evidencias registradas.</li>';
    renderMap(s);
    const selected=document.getElementById('unitCompetency').value||currentUnit;
    document.getElementById('unitCompetency').replaceChildren(...Object.keys(C.units).map(id=>{const opt=new Option(names[id]+(s.report[id].available?'':' · Requisito pendiente'),id);opt.disabled=!s.report[id].available;return opt;}));
    document.getElementById('unitCompetency').value=selected;
  }
  function renderMap(s=state()) {
    const filter=document.getElementById('curriculumRoute').value;
    document.getElementById('curriculumMap').innerHTML=C.nodes.filter(n=>filter==='all'||n.routes.includes(filter)).map(n=>{
      const available=n.requires.every(id=>s.report[id]?.understood),x=s.report[n.id];
      return `<article class="card"><p class="muted">Nivel ${n.level} · ${n.routes.map(r=>routes[r].name).join(' / ')}</p><h3>${n.name}</h3><p>${n.goal}</p><p>Prerrequisitos: ${n.requires.length?n.requires.map(id=>names[id]).join(', '):'ninguno'}. Para avanzar se exige el estado Comprendido.</p><p>${!n.ready?'Unidad planificada; aún sin evaluación propia.':available?'Disponible':'Pendiente de prerrequisitos'}</p>${x?badges(x):''}${n.ready?`<button data-open-unit="${n.id}" ${available?'':'disabled'}>Estudiar ${n.name}</button>`:''}</article>`;
    }).join('');
  }
  function questionHTML(q) {
    const last=q.purpose==='review'?null:state().latest.get(q.id);
    return `<form class="learning-question" data-question="${q.id}"><fieldset><legend>${escape(q.prompt)}</legend>${q.choices.map((text,i)=>`<label class="choice"><input type="radio" name="${q.id}" value="${i}" ${last?.answer===i?'checked':''}>${escape(text)}</label>`).join('')}</fieldset><button class="primary" type="submit">Responder</button>${q.purpose==='practice'?'<button type="button" data-hint="'+q.id+'">Ver pista</button>':''}<p role="status">${last?'Última respuesta: '+(last.answer===q.answer?'correcta.':'incorrecta.')+' '+escape(q.explanation):''}</p></form>`;
  }
  function renderUnit() {
    const id=currentUnit,u=C.units[id],x=state().report[id];
    if(!x.available){document.getElementById('unitContent').textContent='Primero completá la evaluación del prerrequisito.';return;}
    document.getElementById('unitCompetency').value=id;
    const qs=purpose=>C.questions.filter(q=>q.competency===id&&q.purpose===purpose).map(questionHTML).join('');
    document.getElementById('unitContent').innerHTML=`<article class="card"><h3>${u.title}</h3><p>${u.explain}</p><pre>${escape(u.code)}</pre><p>${u.connection}</p><h4>Exploración interactiva</h4><p>${u.demo}</p><div class="learning-demo">${u.inputs.map(([label,value],i)=>`<label>${label}<input type="number" step="any" min="-10000" max="10000" data-demo="${i}" value="${value}"></label>`).join('')}<output id="unitDemoResult" aria-live="polite"></output></div><button id="confirmLesson">Confirmar lectura de ${names[id]}</button><p class="muted">Confirmar lectura registra Visto, no Comprendido.</p></article><h3>Práctica guiada</h3>${qs('practice')}<button id="writeUnitCode">Escribir C# en el laboratorio</button><p class="muted">El laboratorio compara patrones; no compila ni ejecuta C# y no reemplaza esta evaluación.</p><h3>Evaluación de comprensión</h3><p>Respondé sin pistas. Podés reintentar: cuenta la última respuesta de cada pregunta; el historial de errores se conserva.</p>${qs('assessment')}<h3>Aplicación al proyecto</h3><p>Este caso acredita una decisión de diseño, no una ejecución real de Unity o Wwise.</p>${qs('application')}`;
    updateDemo();
  }
  function updateDemo() {
    const inputs=[...root.querySelectorAll('[data-demo]')],values=inputs.map(e=>e.value===''?NaN:Number(e.value));
    const out=document.getElementById('unitDemoResult');if(!out)return;
    out.textContent=values.some(n=>!Number.isFinite(n)||Math.abs(n)>10000)?'Ingresá dos números entre -10.000 y 10.000.':currentUnit==='variables'?`Valor inicial: ${values[0]}. Después de asignar: ${values[1]}.`:currentUnit==='operators'?`Distancia: ${values[0]*values[1]} unidades.`:`${values[0]} <= ${values[1]} es ${values[0]<=values[1]?'true: entra al if.':'false: entra al else.'}`;
  }
  function renderReviews() {
    const s=state();
    document.getElementById('reviewQueue').innerHTML=Object.entries(s.report).map(([id,x])=>{
      const q=M.reviewQuestion(data.learning,id);
      return `<article class="card learning-project-step"><h4>${names[id]}</h4><p>${x.review.due===null?'Completá correctamente la evaluación para programar un repaso.':q?'Repaso disponible.':'Próximo repaso: '+date(x.review.due)}</p>${q?questionHTML(q):''}<p>Resultados programados: ${x.review.results.length?x.review.results.map(e=>(e.ok?'Correcto':'Incorrecto')+' ('+date(e.at)+')').join(' · '):'ninguno'}.</p></article>`;
    }).join('');
  }
  function renderProject() {
    const s=state();
    document.getElementById('footstepsProject').innerHTML=C.project.map((step,i)=>{
      const latest=s.events.filter(e=>e.kind==='project'&&e.activity===step.id).at(-1);
      const allowed=s.report[step.requires].applied && (i===0||s.events.some(e=>e.kind==='project'&&e.activity===C.project[i-1].id));
      return `<article class="card learning-project-step"><h4>${step.title}</h4><p>${step.body}</p><p>${step.check}</p><p>Requisito: aplicación de ${names[step.requires]}${i?' y nota del paso anterior':''}.</p><form data-project="${step.id}"><label for="note-${step.id}">Decisión u observación (20 a 800 caracteres)</label><textarea id="note-${step.id}" maxlength="800" minlength="20" required ${allowed?'':'disabled'}>${escape(latest?.note||'')}</textarea><button ${allowed?'':'disabled'}>Guardar nota del paso</button><p role="status">${latest?'Nota registrada por el estudiante el '+date(latest.at)+'. Sin verificación del runtime.':allowed?'Listo para registrar tu decisión.':'Completá los requisitos para registrar este paso.'}</p></form></article>`;
    }).join('');
  }
  function showTab(tab,competency) {
    if(competency&&C.units[competency])currentUnit=competency;
    root.querySelectorAll('.learning-tabpanel').forEach(el=>el.hidden=el.id!=='learning-'+tab);
    root.querySelectorAll('[data-learning-tab]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.learningTab===tab)));
    refreshSummary();
    if(tab==='unit')renderUnit();
    if(tab==='diagnostic')document.getElementById('diagnosticQuestions').innerHTML=C.questions.filter(q=>q.purpose==='diagnostic').map(questionHTML).join('');
    if(tab==='reviews')renderReviews();
    if(tab==='project')renderProject();
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.learningTab)showTab(b.dataset.learningTab);
    if(b.dataset.openUnit)showTab('unit',b.dataset.openUnit);
    if(b.dataset.next)showTab(b.dataset.next,b.dataset.competency);
    if(b.id==='confirmLesson')record('seen',currentUnit);
    if(b.dataset.hint){const q=C.questions.find(q=>q.id===b.dataset.hint);if(record('hint',q.id))b.closest('form').querySelector('[role=status]').textContent=C.units[q.competency].hint;}
    if(b.id==='writeUnitCode'){
      go('codeLab');
      window.dispatchEvent(new CustomEvent('open-code-lab',{detail:{route:'csharp',id:'lab-csharp-'+({variables:1,operators:2,conditionals:3}[currentUnit])}}));
    }
  });
  root.addEventListener('change',e=>{if(e.target.id==='curriculumRoute')renderMap();if(e.target.id==='unitCompetency'){currentUnit=e.target.value;renderUnit();}});
  root.addEventListener('input',e=>{if(e.target.matches('[data-demo]'))updateDemo();});
  root.addEventListener('submit',e=>{
    e.preventDefault();const form=e.target;
    if(form.dataset.project){const step=C.project.find(x=>x.id===form.dataset.project),note=form.querySelector('textarea').value;if(note.trim().length<20)return;if(record('project',step.id,{note}))renderProject();return;}
    const q=C.questions.find(q=>q.id===form.dataset.question);if(!q)return;
    const result=form.querySelector('[role=status]'),answer=form.querySelector('input:checked');
    if(!answer){result.textContent='Elegí una respuesta antes de continuar.';return;}
    if(q.purpose==='review'&&M.reviewQuestion(data.learning,q.competency)?.id!==q.id){result.textContent='Este repaso ya se registró o todavía no está disponible.';return;}
    const value=Number(answer.value);
    if(record('answer',q.id,{answer:value})){
      result.textContent=(value===q.answer?'Correcto. ':'Revisá este punto. ')+q.explanation;
      if(q.purpose==='review'){form.querySelector('button[type=submit]').disabled=true;result.textContent+=' El próximo repaso se programó para otra fecha.';}
    }
  });
  window.addEventListener('progress-render',refreshSummary);
  window.addEventListener('progress-replaced',()=>showTab('map'));
  window.addEventListener('learning-open',()=>showTab('map'));
  setInterval(refreshSummary,60000);
  showTab('map');
})();
