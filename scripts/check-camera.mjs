import fs from 'node:fs';
import assert from 'node:assert/strict';
// Check the production camera path itself, including every gate transition.
const source=fs.readFileSync(new URL('../portal.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('  function sample(p){'),source.indexOf('  function updateTarget()'));
const projects=JSON.parse(fs.readFileSync(new URL('../projects.json',import.meta.url),'utf8')).projects,gates=projects.map((_,i)=>({group:{position:{x:i%2===0?-2.8:2.8,z:-30-i*48}}})),length=projects.length+.85;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const sample=new Function('gates','projects','journeyLength','THREE','clamp','mix','smooth',body+'return sample;')(gates,projects,length,{Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z});}}},clamp,mix,smooth);
let last=Infinity;
for(let i=0;i<=10000;i++){const s=sample(i/10000);assert.ok(Number.isFinite(s.z)&&Number.isFinite(s.x));assert.ok(s.lookZ<s.z,'Camera must always face forward');assert.ok(s.z<=last+1e-9,'Camera must not travel backwards');last=s.z;}
for(let i=1;i<=projects.length;i++){const p=i/length,a=sample(p-1e-9),b=sample(p+1e-9);assert.ok(Math.abs(a.z-b.z)<1e-4,'Continuous depth at gate transition');assert.ok(Math.abs(a.x-b.x)<1e-4,'Continuous horizontal position');}
assert.ok(sample(1).tail>.99);assert.ok(sample(1).z<gates.at(-1).group.position.z-70);
console.log('PASS: 10,001 forward-facing path samples; five continuous gate/continuation transitions; passage extends beyond the final project.');
