const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLink = value => { try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const safeImage = value => { const url = value ? safeLink(value) : ''; return url || 'assets/favicon.svg'; };
const posterTitle = p => escapeHTML(p.posterTitle || p.title).replaceAll('\n', '<br>');
function youtubeId(value) { try { const url=new URL(value);let id='';if(url.hostname==='youtu.be') id=url.pathname.slice(1);else if(['youtube.com','www.youtube.com','www.youtube-nocookie.com'].includes(url.hostname))id=url.searchParams.get('v')||url.pathname.split('/').pop();return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';}catch{return '';}}
const outbound = (label,url,className='') => url && safeLink(url) ? `<a class="${className}" href="${escapeHTML(safeLink(url))}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>` : '';
let data, projects = [], current = 0, filter = 'all', motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches;
let opener = null, toastTimer, activeProject = null, galleryIndex = 0;
const dialog = $('#project-dialog');
const notify = message => { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600); };

function projectStore(p){return (p.links||[]).find(l=>{try{return new URL(l.url).hostname==='play.google.com';}catch{return false;}});}
function projectActions(p){const store=projectStore(p);return `${store?outbound('Google Play · 앱 보기',store.url,'store-link'):''}${outbound('GitHub · 프로젝트 소스',p.sourceUrl)}${outbound(p.demoLabel||'서비스 열기',p.demoUrl)}${!p.sourceUrl?`<button data-watch="${escapeHTML(p.id)}">핵심 설명 보기 ↗</button>`:''}`;}
function portfolioContent(){return projects;}
function portfolioDestinations(p){const store=projectStore(p);return `${store?outbound('Google Play',store.url):''}${outbound('GitHub',p.sourceUrl)}${outbound('서비스 열기',p.demoUrl)}`;}
function renderGrid() {
  const term = $('#project-search').value.trim().toLocaleLowerCase();
  const visible = projects.filter(p => (filter === 'all' || p.category === filter) && [p.title,p.summary,p.category,p.description,...p.tags].join(' ').toLocaleLowerCase().includes(term));
  $('#project-grid').innerHTML = visible.map(p => `<article class="project-card"><button class="project-open" data-id="${escapeHTML(p.id)}" aria-label="${escapeHTML(p.title)} 프로젝트 상세 보기" aria-haspopup="dialog"><div class="card-art"><img src="${escapeHTML(safeImage(p.image))}" alt="${escapeHTML(p.title)} — ${escapeHTML(p.summary)}" loading="lazy" width="1000" height="625"><div class="card-topline"><span>${escapeHTML(p.type)}</span><span class="card-badge">${escapeHTML(p.category)}</span></div><span class="card-title-art">${posterTitle(p)}</span><span class="card-open-icon" aria-hidden="true">↗</span></div><div class="card-info"><div class="card-heading"><h3>${escapeHTML(p.title)}</h3><span>${escapeHTML(p.year)} ↗</span></div><p>${escapeHTML(p.summary)}</p><div class="card-tags">${p.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div></div></button><div class="card-resource-links">${projectActions(p)}</div></article>`).join('');
  $('#result-count').textContent = `${String(visible.length).padStart(2, '0')} PROJECT${visible.length === 1 ? '' : 'S'}`;
  $('#empty-state').hidden = visible.length > 0;
  document.dispatchEvent(new Event('portfolio:render'));
  $$('.project-open').forEach(button => button.addEventListener('click', () => openProject(button.dataset.id, button)));
  $$('[data-watch]').forEach(button => button.addEventListener('click', () => { openProject(button.dataset.watch,button); $('#project-videos')?.scrollIntoView({behavior:motionOff?'instant':'smooth',block:'start'}); }));
  $$('img').forEach(img => img.addEventListener('error', () => { if (!img.dataset.fallback) { img.dataset.fallback = 'true'; img.src = 'assets/favicon.svg'; } }, { once:true }));
}
function openProject(id, trigger) {
  const p = projects.find(p => p.id === id); if (!p) return;
  opener = trigger || document.activeElement; activeProject=p; galleryIndex=0;
  const gallery=Array.isArray(p.gallery)?p.gallery:[], videos=Array.isArray(p.videos)?p.videos:[];
  $('#dialog-content').innerHTML = renderScreening(p);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0; document.body.classList.add('dialog-open');
  history.replaceState(null, '', `#project/${encodeURIComponent(p.id)}`);
  $('#dialog-done').addEventListener('click',closeProject);

  if(gallery.length){renderGallery();$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{galleryIndex=Number(b.dataset.gallery);renderGallery();}));$('#gallery-prev').addEventListener('click',()=>{galleryIndex=(galleryIndex+gallery.length-1)%gallery.length;renderGallery();});$('#gallery-next').addEventListener('click',()=>{galleryIndex=(galleryIndex+1)%gallery.length;renderGallery();});}
  $$('[data-video]').forEach(button=>button.addEventListener('click',()=>playVideo(Number(button.dataset.video))));
  $$('[data-mapping]').forEach(button=>button.addEventListener('click',()=>{const state=button.dataset.mapping;$('#mapping-demo-image').src=safeImage(p.mappingDemo[state]);$('#mapping-original').href=safeImage(p.mappingDemo[state]);$('#mapping-demo-image').alt=state==='after'?'print와 한국어·영어 설명이 함께 강조된 실제 화면':'조각을 선택하기 전의 일반 학습 화면';$('#mapping-demo-caption').textContent=state==='after'?'실제 서비스 · 선택 집중 보기에서 print 조각을 선택한 상태':'실제 서비스 · 같은 예제의 조각 선택 전 화면';$$('[data-mapping]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
}
function renderGallery(){const gallery=activeProject.gallery,g=gallery[galleryIndex];$('#gallery-main').src=safeImage(g.src);$('#gallery-main').alt=g.caption;$('#gallery-original').href=safeImage(g.src);$('#gallery-caption').textContent=g.caption;$('#gallery-counter').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;$$('[data-gallery]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===galleryIndex)));$('#gallery-prev').disabled=gallery.length<2;$('#gallery-next').disabled=gallery.length<2;}
function playVideo(index){const video=activeProject.videos[index],id=youtubeId(video.url);if(id){$('#video-player').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${escapeHTML(video.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;}else if(safeLink(video.url)&&/\.mp4(?:\?|$)/i.test(video.url)){$('#video-player').innerHTML=`<video controls playsinline preload="metadata" src="${escapeHTML(safeLink(video.url))}"></video>`;}else{$('#video-player').innerHTML=`<p>별도 창에서 영상을 확인해주세요.</p>${outbound('영상 열기',video.url)}`;}$$('[data-video]').forEach((b,i)=>{const selected=Number(b.dataset.video)===index;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});}
function closeProject() { dialog.close(); }
function syncProjectHash(){if(!data)return;if(location.hash.startsWith('#project/')){try{const id=decodeURIComponent(location.hash.slice(9));if(activeProject?.id!==id)openProject(id);}catch{notify('프로젝트 주소를 확인해주세요.');}}else if(dialog.open)dialog.close();}
window.addEventListener('hashchange',syncProjectHash);
dialog.addEventListener('close', () => { $('#dialog-content').innerHTML='';activeProject=null;document.body.classList.remove('dialog-open'); history.replaceState(null, '', '#work'); opener?.focus({preventScroll:true}); });
$('#close-dialog').addEventListener('click',closeProject);
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeProject(); } });
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderGrid();}));
$('#project-search').addEventListener('input',renderGrid);
$('#reset-filters').addEventListener('click',()=>{$('#project-search').value='';$('[data-filter="all"]').click();});
function updateMotion(){document.body.classList.toggle('motion-off',motionOff);$('#motion-toggle').innerHTML=`<span aria-hidden="true">◉</span> MOTION ${motionOff?'OFF':'ON'}`;$('#motion-toggle').setAttribute('aria-pressed',String(motionOff));$('#motion-toggle').setAttribute('aria-label',motionOff?'연출 켜기':'연출 줄이기');document.dispatchEvent(new Event('portfolio:motion'));}
$('#motion-toggle').addEventListener('click',()=>{motionOff=!motionOff;updateMotion();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{motionOff=event.matches;updateMotion();});
updateMotion();

function renderProfile(){
  const profile=data.profile;$('#profile-bio').textContent=profile.bio;document.title=`${profile.name} — ${profile.title}`;
  $('.archive-meta>span:first-child').innerHTML=profile.demo?'DEMO COLLECTION <span class="demo-dot"></span> 예시 프로젝트':'PROJECT COLLECTION <span class="demo-dot"></span> 프로젝트 아카이브';
  $('#copyright-name').textContent=profile.name;
  $$('.brand').forEach(el=>{if(!el.classList.contains('footer-brand')){el.innerHTML=`<span class="brand-icon" aria-hidden="true">${escapeHTML(profile.name[0].toLowerCase())}</span>${escapeHTML(profile.name)}<span class="brand-dot">/ DEV</span>`;el.setAttribute('aria-label',`${profile.name} 홈`);}else el.textContent=profile.name;});

}
async function init(){
  try{
    const response=await fetch('projects.json');if(!response.ok)throw new Error('Project data unavailable');data=await response.json();
    if(new URLSearchParams(location.search).has('preview')){try{const saved=localStorage.getItem('frame-portfolio-draft');if(saved){const draft=JSON.parse(saved);if(draft.schemaVersion===data.schemaVersion){data=draft;const banner=document.createElement('div');banner.className='preview-banner';banner.innerHTML='로컬 초안 미리보기 · <a href="studio.html">편집으로 돌아가기 ↗</a>';document.body.append(banner);}else notify('이전 형식의 초안 대신 현재 프로젝트를 표시합니다.');}}catch{notify('저장된 초안을 읽지 못했습니다. 기본 콘텐츠를 표시합니다.');}}
    if(!Array.isArray(data.projects)||!data.profile)throw new Error('Invalid project data');
    projects=data.projects;$('.nav-work span').textContent=String(projects.length).padStart(2,'0');$('[data-filter="all"] sup').textContent=String(projects.length).padStart(2,'0');
    renderProfile();renderGrid();$('#year').textContent=new Date().getFullYear();
    syncProjectHash();
    if(!projects.length)$('#empty-state').hidden=false;
  }catch(error){console.error(error);$('#hero-error').hidden=false;$('#result-count').textContent='LOAD ERROR';}
}
init();
