const assert=require('node:assert/strict');
const M=require('../learning-model.js'),C=require('../curriculum-data.js');
let serial=0;const t=Date.UTC(2026,10,12,12);
let history=M.clean();
function add(kind,activity,at=t,answer){history=M.merge(history,{version:1,events:[{id:'e'+(++serial),at,kind,activity,answer}]});}
const qs=(c,p)=>C.questions.filter(q=>q.competency===c&&q.purpose===p);
assert.equal(M.summary(history,t).diagnosticDone,false);
for(const q of C.questions.filter(q=>q.purpose==='diagnostic'))add('answer',q.id,t,q.answer);
assert.equal(M.summary(history,t).diagnosticDone,true);
assert.equal(M.summary(history,t).report.variables.understood,false);
assert.equal(M.summary(history,t).report.variables.review.due,null);
add('seen','variables');
add('hint',qs('variables','practice')[0].id);
add('answer',qs('variables','practice')[0].id,t,1);
for(const q of qs('variables','assessment'))add('answer',q.id,t,q.answer);
let s=M.summary(history,t).report.variables;
assert.equal(s.seen&&s.practiced&&s.understood,true);
assert.equal(s.applied,false);assert.equal(s.hints,1);assert.equal(s.errors.tipo,1);
assert.equal(M.summary(history,t).report.operators.available,true);
assert.equal(M.summary(history,t).report.conditionals.available,false);
for(const q of qs('variables','application'))add('answer',q.id,t,q.answer);
assert.equal(M.summary(history,t).report.variables.applied,true);
assert.equal(M.summary(history,t).recommendations.find(r=>r.kind==='unit').competency,'operators');
assert.equal(M.reviewQuestion(history,'variables',t),null);
const q0=qs('variables','review')[0];add('answer',q0.id,t,q0.answer);
assert.equal(M.summary(history,t).report.variables.review.streak,0);
let time=t+M.DAY;
for(let i=0;i<3;i++){
 const q=M.reviewQuestion(history,'variables',time);assert.ok(q);
 add('answer',q.id,time,q.answer);
 assert.equal(M.reviewQuestion(history,'variables',time),null);
 s=M.summary(history,time).report.variables;
 assert.equal(s.review.streak,i+1);
 if(i<2)assert.equal(s.consolidated,false);
 time=s.review.due;
}
assert.equal(M.summary(history,time).report.variables.consolidated,true);
let q=M.reviewQuestion(history,'variables',time);add('answer',q.id,time,(q.answer+1)%q.choices.length);
s=M.summary(history,time).report.variables;
assert.equal(s.consolidated,false);assert.equal(s.review.due,time+M.DAY);
assert.equal(M.summary(history,t-1).report.variables.seen,false);
assert.deepEqual(M.merge(history,history),history);
const split=Math.floor(history.events.length/2),a={version:1,events:history.events.slice(0,split)},b={version:1,events:history.events.slice(split)};
assert.deepEqual(M.merge(a,b),M.merge(b,a));
assert.deepEqual(M.clean({version:1,events:[{id:'x',at:t,kind:'answer',activity:q.id,answer:999}]}).events,[]);
assert.throws(()=>M.clean({version:99,events:[]}));
assert.throws(()=>M.clean({version:1,events:Array(2001).fill({})}));
assert.equal(M.clean({version:1,events:[{id:'x',at:t,kind:'constructor',activity:'x'}]}).events.length,0);
// Todos los prerrequisitos existen y el mapa es acíclico.
const known=new Set(C.nodes.map(n=>n.id));
function visit(id,stack=[]){assert.ok(!stack.includes(id));const n=C.nodes.find(n=>n.id===id);for(const r of n.requires){assert.ok(known.has(r));visit(r,[...stack,id]);}}
for(const n of C.nodes)visit(n.id);
const sameTime=M.clean({version:1,events:[{id:'z',at:t,order:1,kind:'answer',activity:'variables-diagnostic-1',answer:0},{id:'a',at:t,order:2,kind:'answer',activity:'variables-diagnostic-1',answer:1}]});
assert.equal(M.summary(sameTime,t).report.variables.diagnosticCorrect,1);
console.log('PASS motor 2.1: diagnóstico, criterios, errores, prerrequisitos, repasos 1/3/7 días, fallo, unión idempotente y datos inválidos');
