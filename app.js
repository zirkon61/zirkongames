'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const scrollToSection = id => $(id).scrollIntoView({behavior:motionQuery.matches?'instant':'smooth'});
const locations = [
{id:'refuge',number:'01',depth:'− 80 M',faction:'THE CIVILIANS',title:'The refuge',copy:"Driven underground by the plague, civilians have built a fragile refuge between timber beams and cold stone. Families and miners survive by lantern light, caught between two warring factions.",risk:'LOW · A FRAGILE PEACE',icon:'lamp',mechanic:'Talk to the civilians.',action:'Learn which parts of the caverns are held by the Union and the Confederacy. The people of the settlement offer your first glimpse into the divided mine.',route:'M163 203 176 262 173 308'},
{id:'union',number:'02',depth:'− 160 M',faction:'THE UNION',title:'Union outpost',copy:'Blue uniforms stand behind timber barricades. Union soldiers hold the northern access tunnels. Whoever controls the supply routes has power, even this far below ground.',risk:'MEDIUM · ARMED CHECKPOINT',icon:'shield',mechanic:'Read the human front lines.',action:'Find the connections between the occupied tunnels. Keep a route back to the civilian settlement in mind.',route:'M163 203 176 262 173 308 226 309 278 282 332 295 408 262'},
{id:'south',number:'03',depth:'− 220 M',faction:'THE CONFEDERACY',title:'Southern shaft',copy:'Confederate soldiers have entrenched themselves on the other side of the mine. They share neither supplies nor trust with the Union. The creatures below threaten both camps.',risk:'HIGH · CONTESTED GROUND',icon:'shield',mechanic:'Navigate a divided mine.',action:'Follow the old tracks through the rival territories. Every crossing brings another uncertain encounter.',route:'M163 203 176 262 173 308 226 309 278 282 332 295 408 262 458 290 541 320 621 313'},
{id:'railway',number:'04',depth:'− 340 M',faction:'ABANDONED MINING TERRITORY',title:'The old railway',copy:'Buckled rails disappear beneath collapsed beams. A handcar sits idle in the dust. Among the remains of the gold rush lie the parts that could make the next journey possible.',risk:'MEDIUM · UNSTABLE TUNNELS',icon:'rail',mechanic:'Salvage. Repair. Go deeper.',action:'Clear the rubble, reconnect the tracks and recover machinery. The railway could become the settlement’s lifeline.',route:'M163 203 176 262 173 308 226 309 278 282 332 295 324 362'},
{id:'rift',number:'05',depth:'− 600 M',faction:'THE ANCIENT THREAT',title:'The rift',copy:'The last timber supports end at a glowing fracture in the rock. Here, there are no human front lines. Only demons, the restless dead, and sounds no living throat should make.',risk:'EXTREME · NO SAFE PASSAGE',icon:'diamond',mechanic:'Light the way. Face the dark.',action:'Look beyond the reach of your lantern. The deepest tunnels hide the greatest threat — and the longest journey home.',route:'M163 203 176 262 173 308 226 309 278 282 332 295 324 362 370 405 455 481 518 520'}
];
let activeLocation=0;
const visited=new Set(['refuge']);
function selectLocation(id) {
  const index=locations.findIndex(l=>l.id===id);
  if(index<0)return;
  activeLocation=index;
  const item=locations[index];
  visited.add(id);
  const t=window.SiteI18n.t;
  const local=part=>t('locations.'+index+'.'+part);
  const fields={number:t('map.14',{number:item.number}),depth:item.depth,faction:local(1),title:local(0),copy:local(2),risk:local(3),mechanic:local(4),action:local(5)};
  Object.entries(fields).forEach(([key,value])=>$('#place-'+key).textContent=value);
  $('#place-art-open').hidden=!['refuge','union','south'].includes(id);
  $('#place-icon').setAttribute('href','#i-'+item.icon);
  $('#place-risk').classList.toggle('high',index===2||index===4);
  $('#active-route').setAttribute('d',item.route);
  $('#active-route').setAttribute('stroke',index===4?'#c47a67':'#d2b575');
  $$('.map-pin').forEach(pin=>{
    const selected=pin.dataset.location===id;
    pin.classList.toggle('selected',selected);
    pin.classList.toggle('visited',visited.has(pin.dataset.location));
    pin.setAttribute('aria-pressed',String(selected));
  });
  $('#visited-count').textContent=t('map.13',{count:visited.size});
  $('#discovery-label').textContent=visited.size===5?t('map.18'):t('map.17',{number:item.number});
}
document.addEventListener('site:languagechange',()=>selectLocation(locations[activeLocation].id));
selectLocation('refuge');
$$('.map-pin').forEach(pin=>pin.addEventListener('click',()=>selectLocation(pin.dataset.location)));
$('#previous-place').addEventListener('click',()=>selectLocation(locations[(activeLocation+4)%5].id));
$('#next-place').addEventListener('click',()=>selectLocation(locations[(activeLocation+1)%5].id));
$('#reset-map').addEventListener('click',()=>{visited.clear();selectLocation('refuge');});
$$('[data-go-place]').forEach(button=>button.addEventListener('click',()=>{selectLocation(button.dataset.goPlace);scrollToSection('#mine');}));
const tabIds=['places','world','factions'];
function selectTab(id,focus=false){tabIds.forEach(name=>{const selected=name===id;const tab=$('#tab-'+name);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$('#panel-'+name).hidden=!selected;});if(focus)$('#tab-'+id).focus();}
tabIds.forEach((id,index)=>{const tab=$('#tab-'+id);tab.addEventListener('click',()=>selectTab(id));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();selectTab(e.key==='Home'?tabIds[0]:e.key==='End'?tabIds[tabIds.length-1]:tabIds[(index+(e.key==='ArrowRight'?1:-1)+tabIds.length)%tabIds.length],true);}});});
const menuToggle=$('.menu-toggle');const nav=$('#main-nav');
function closeMenu(){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
$$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menuToggle.focus();}});
document.addEventListener('click',e=>{if(!$('.site-header').contains(e.target))closeMenu();});
matchMedia('(min-width: 1281px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;$$('.nav-link').forEach(link=>{const selected=link.getAttribute('href')==='#'+entry.target.id;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});});},{rootMargin:'-15% 0px -60% 0px',threshold:0});
['about','mine','features','gallery','studio'].forEach(id=>observer.observe($('#'+id)));
$$('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
$('#story-open').addEventListener('click',()=>$('#story-dialog').showModal());
$('#story-to-map').addEventListener('click',()=>{$('#story-dialog').close();scrollToSection('#mine');});
function openArtwork(id){
  const button=document.querySelector('[data-art="'+id+'"]');
  if(!button)return;
  const image=$('#art-dialog-image');
  image.dataset.art=id;
  image.src=button.querySelector('img').getAttribute('src');
  image.alt=button.querySelector('img').alt;
  $('#art-dialog-caption').textContent=button.dataset.caption;
  $('#art-dialog').showModal();
}
$$('[data-art]').forEach(button=>button.addEventListener('click',()=>openArtwork(button.dataset.art)));
$('#place-art-open').addEventListener('click',()=>openArtwork('scene-'+locations[activeLocation].id));
// Ambient sparks stay visible throughout the page and never intercept interaction.
(() => {
  const canvas = $('#embers');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, particles = [], frameId = 0, lastTime = 0;

  function makeParticle(fillViewport = false) {
    return {
      x: Math.random() * width,
      y: fillViewport ? Math.random() * height : height + 8,
      radius: 0.75 + Math.random() * 1.05,
      speed: 12 + Math.random() * 19,
      drift: Math.random() * 5 - 2.5,
      phase: Math.random() * Math.PI * 2,
      age: Math.random() * 10,
      glint: Math.random() < 0.2
    };
  }

  function draw(delta) {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.y -= p.speed * delta;
      p.age += delta;
      p.x += (p.drift + Math.sin(p.age + p.phase) * 3) * delta;
      if (p.y < -12 || p.x < -12 || p.x > width + 12) {
        p = particles[i] = makeParticle();
      }
      const fade = Math.max(0, Math.min(1, p.y / 45, (height - p.y) / 35));
      const twinkle = 0.3 + 0.7 * ((Math.sin(p.age * 2.2 + p.phase) + 1) / 2);
      const alpha = fade * twinkle * 0.82;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
      halo.addColorStop(0, 'rgba(255,211,130,' + alpha + ')');
      halo.addColorStop(1, 'rgba(222,135,47,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,171,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      if (p.glint && twinkle > 0.88) {
        ctx.strokeStyle = 'rgba(255,228,165,' + alpha * 0.65 + ')';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(p.x - p.radius * 3, p.y);
        ctx.lineTo(p.x + p.radius * 3, p.y);
        ctx.moveTo(p.x, p.y - p.radius * 3);
        ctx.lineTo(p.x, p.y + p.radius * 3);
        ctx.stroke();
      }
    }
  }

  function frame(time) {
    frameId = 0;
    if (document.hidden) return;
    const delta = Math.min((time - lastTime) / 1000 || 0.016, 0.045);
    lastTime = time;
    draw(delta * (motionQuery.matches ? 0.35 : 1));
    frameId = requestAnimationFrame(frame);
  }

  function sync() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    const running = !document.hidden;
    canvas.dataset.running = String(running);
    // Keep the ambient effect animated; a reduced-motion preference slows it down.
    if (!document.hidden) draw(0);
    if (running) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(frame);
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: width < 761 ? 24 : 58 }, () => makeParticle(true));
    sync();
  }

  motionQuery.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(resize).observe(canvas);
  resize();
})();
