import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const data=JSON.parse(await readFile(path.join(root,'projects.json'),'utf8'));
assert.ok(data.profile.name);assert.ok(Array.isArray(data.projects));
const ids=new Set();let images=0,videos=0,cases=0;
for(const p of data.projects){assert.ok(!ids.has(p.id),'Duplicate project ID');ids.add(p.id);assert.match(p.id,/^[a-z0-9-]+$/);assert.ok(['Unity','Unreal Engine','Web','C++'].includes(p.category));for(const key of ['title','image','description','summary'])assert.equal(typeof p[key],'string');assert.ok(Array.isArray(p.tags));assert.ok(Array.isArray(p.features));if(!p.image.startsWith('https://'))assert.ok((await stat(path.join(root,p.image))).size>1000);for(const key of ['demoUrl','sourceUrl','readmeUrl'])if(p[key])assert.equal(new URL(p[key]).protocol,'https:');for(const g of p.gallery||[]){assert.equal(typeof g.caption,'string');assert.ok((await stat(path.join(root,g.src))).size>1000);images++;}for(const v of p.videos||[]){const u=new URL(v.url);assert.ok(['www.youtube.com','youtu.be'].includes(u.hostname));assert.ok(v.title);videos++;}for(const c of p.caseStudies||[]){for(const key of ['title','problem','solution','result'])assert.ok(c[key]);if(c.codeUrl)assert.equal(new URL(c.codeUrl).hostname,'github.com');cases++;}for(const l of p.links||[])assert.equal(new URL(l.url).protocol,'https:');}
assert.equal(data.profile.demo,false,'Actual project collection must not be marked demo');
for(const id of ['syntaxbridge-studio','tft-team-optimizer','unreal-combat','unity-arpg','cpp-directx-lab'])assert.ok(ids.has(id),`Missing required project ${id}`);
for(const file of ['index.html','app.js','screening.js','portal.js','portal.css','catalog.css','vendor/three/three.module.js','vendor/three/three.core.js','vendor/three/LICENSE','styles.css','project-details.css','cinema.css','studio.html','studio.js','studio.css','fonts.css','assets/favicon.svg'])assert.ok((await stat(path.join(root,file))).size>0);
for(const p of data.projects)if(p.mappingDemo){for(const phase of ['before','after'])assert.ok((await stat(path.join(root,p.mappingDemo[phase]))).size>1000);assert.notEqual(p.mappingDemo.before,p.mappingDemo.after);}
const fonts=await readFile(path.join(root,'fonts.css'),'utf8');for(const [,font] of fonts.matchAll(/url\(([^)]+)\)/g))assert.ok((await stat(path.join(root,font))).size>1000);
console.log(`PASS: ${data.projects.length} actual projects, ${images} gallery images, ${videos} videos, ${cases} engineering notes; IDs, categories, fonts, page assets, and link formats.`);

assert.equal(data.profile.github,'','Use project-specific GitHub destinations');
for(const p of data.projects)if(p.sourceUrl)assert.match(new URL(p.sourceUrl).pathname,/^\/kimdol\/[^/]+/);
assert.ok(data.projects.find(p=>p.id==='tft-team-optimizer').links.some(l=>l.url==='https://play.google.com/store/apps/details?id=com.UrsusCertamen.TFTool'));

assert.equal(data.projects.find(p=>p.id==='tft-team-optimizer').demoUrl,'','TFT website link intentionally removed; retain web screenshots and Google Play');

const markup=await readFile(path.join(root,'index.html'),'utf8');
assert.equal((markup.match(/id="work-heading"/g)||[]).length,1,'One Selected work heading');
assert.ok(!markup.includes('id="cinema-track"'),'No duplicate hero project carousel');
assert.ok(data.projects.every(p=>!p.tags.some(t=>t.toUpperCase()==='PHP')),'No PHP technology badges');

assert.ok(markup.indexOf('id="work"')<markup.indexOf('id="journey"'),'Project catalog must precede portal section');
assert.ok(markup.includes('id="journey-heading"'),'Distinct portal section heading required');
