(function(root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./curriculum-data.js') : root.Curriculum);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LearningModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(C) {
  const DAY = 86400000, LIMIT = 2000;
  const questions = new Map(C.questions.map(q=>[q.id,q]));
  const patternIds = ['csharp','unity','audio'].flatMap(r=>[1,2,3,4,5].map(n=>`lab-${r}-${n}`));
  const legacyIds = ['c','u','a'].flatMap(r=>[1,2,3,4,5].map(n=>r+n));
  const activities = {seen:Object.keys(C.units),answer:[...questions.keys()],hint:[...questions.keys(),...patternIds],project:C.project.map(x=>x.id),pattern:patternIds,legacy:legacyIds};
  function clean(input) {
    if (input === undefined || input === null) return {version:1,events:[]};
    if (input.version !== 1 || !Array.isArray(input.events) || input.events.length > LIMIT) throw Error('Historial de aprendizaje inválido o incompatible.');
    const found = new Map();
    for (const e of input.events) {
      if (!e || typeof e.id !== 'string' || !/^[a-zA-Z0-9_-]{1,90}$/.test(e.id) || !Number.isSafeInteger(e.at) || e.at < 0 || e.at > 8640000000000000 || !Object.hasOwn(activities,e.kind) || !activities[e.kind].includes(e.activity)) continue;
      const value = {id:e.id,at:e.at,kind:e.kind,activity:e.activity};
      if (e.kind === 'answer') {
        if (!Number.isInteger(e.answer) || e.answer < 0 || e.answer >= questions.get(e.activity).choices.length) continue;
        value.answer = e.answer;
      }
      if (['pattern','legacy'].includes(e.kind)) value.ok = e.ok === true;
      if (e.kind === 'project') {
        if (typeof e.note !== 'string' || e.note.trim().length < 20) continue;
        value.note = e.note.trim().slice(0,800);
      }
      // Resolución determinista de IDs duplicados, independiente del orden de sincronización.
      if (!found.has(e.id) || JSON.stringify(value) > JSON.stringify(found.get(e.id))) found.set(e.id,value);
    }
    return {version:1,events:[...found.values()].sort((a,b)=>a.at-b.at || a.id.localeCompare(b.id))};
  }
  function merge(a,b) {
    const byId = new Map();
    for (const e of [...clean(a).events,...clean(b).events]) {
      if (!byId.has(e.id) || JSON.stringify(e)>JSON.stringify(byId.get(e.id))) byId.set(e.id,e);
    }
    if (byId.size > LIMIT) throw Error('El historial alcanzó 2.000 evidencias. Exportá una copia antes de continuar.');
    return clean({version:1,events:[...byId.values()]});
  }
  function summary(input,now=Date.now()) {
    const events = clean(input).events.filter(e=>e.at<=now), latest = new Map();
    for (const e of events) if(e.kind==='answer') latest.set(e.activity,e);
    const diagnostic = C.questions.filter(q=>q.purpose==='diagnostic');
    const diagnosticDone = diagnostic.every(q=>latest.has(q.id));
    const report = {};
    for(const id of Object.keys(C.units)) {
      const qs = C.questions.filter(q=>q.competency===id), has = purpose=>qs.filter(q=>q.purpose===purpose);
      const correct = q=>latest.get(q.id)?.answer===q.answer;
      const seen = events.some(e=>e.kind==='seen'&&e.activity===id);
      const practiced = has('practice').some(q=>latest.has(q.id));
      const assessmentCorrect = has('assessment').filter(correct).length;
      const understood = seen && practiced && assessmentCorrect===has('assessment').length;
      const applied = understood && has('application').every(correct);
      // Primer instante con una evaluación completa y correcta. Un diagnóstico no programa repasos.
      const snapshots = new Map(); let start = null;
      for(const e of events) {
        if(e.kind!=='answer'||!has('assessment').some(q=>q.id===e.activity)) continue;
        snapshots.set(e.activity,e.answer);
        if(start===null && has('assessment').every(q=>snapshots.get(q.id)===q.answer)) start=e.at;
      }
      let due = start===null?null:start+DAY, streak=0, accepted=[];
      for(const e of events) {
        const q=questions.get(e.activity);
        if(e.kind!=='answer'||q?.competency!==id||q.purpose!=='review'||due===null||e.at<due) continue;
        const ok=e.answer===q.answer;
        streak=ok?streak+1:0;
        due=e.at+([1,3,7,14][Math.min(streak,3)])*DAY;
        accepted.push({...e,ok});
      }
      const errors = {};
      for(const e of events) {
        const q=questions.get(e.activity);
        if(e.kind==='answer'&&q?.competency===id&&e.answer!==q.answer) errors[q.error]=(errors[q.error]||0)+1;
      }
      report[id]={seen,practiced,understood,applied,consolidated:applied&&streak>=3,assessmentCorrect,assessmentTotal:has('assessment').length,
        diagnosticCorrect:has('diagnostic').filter(correct).length,diagnosticTotal:has('diagnostic').length,
        attempts:events.filter(e=>e.kind==='answer'&&questions.get(e.activity)?.competency===id).length,
        hints:events.filter(e=>e.kind==='hint'&&questions.get(e.activity)?.competency===id).length,errors,
        review:{due,streak,results:accepted},available:C.nodes.find(n=>n.id===id).requires.every(r=>report[r]?.understood)};
    }
    const recommendations=[];
    if(!diagnosticDone) recommendations.push({kind:'diagnostic',text:'Completá el diagnóstico: todavía faltan respuestas.',target:'diagnostic'});
    for(const [id,x] of Object.entries(report)) if(x.review.due!==null&&x.review.due<=now) recommendations.push({kind:'review',competency:id,text:`Repaso pendiente: ${C.nodes.find(n=>n.id===id).name}.`,target:'reviews'});
    for(const [id,x] of Object.entries(report)) {
      if(!x.available||x.consolidated)continue;
      const phase=!x.seen?'leer':!x.practiced?'practicar':!x.understood?'evaluar':!x.applied?'aplicar':'esperar el próximo repaso';
      recommendations.push({kind:'unit',competency:id,text:`${C.nodes.find(n=>n.id===id).name}: ${phase}.`,target:'unit'});
      break;
    }
    return {report,diagnosticDone,diagnosticAnswered:diagnostic.filter(q=>latest.has(q.id)).length,diagnosticTotal:diagnostic.length,recommendations,events,latest};
  }
  function reviewQuestion(input,id,now=Date.now()) {
    const state=summary(input,now).report[id];
    if(!state || state.review.due===null || state.review.due>now) return null;
    const bank=C.questions.filter(q=>q.competency===id&&q.purpose==='review');
    return bank[state.review.results.length%bank.length];
  }
  return {DAY,LIMIT,clean,merge,summary,reviewQuestion};
});
