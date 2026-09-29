'use strict';
(() => {
  const dictionaries = window.MineLocales;
  const storageKey = 'demons-of-the-mine:language';
  const select = document.getElementById('language-select');
  const names = {en:'English',de:'Deutsch',es:'Español',tr:'Türkçe',ru:'Русский','zh-Hans':'简体中文',ja:'日本語','pt-BR':'Português',ko:'한국어'};
  const resolve = value => {
    if (names[value]) return value;
    const base = String(value || '').toLowerCase().split('-')[0];
    return base === 'zh' ? 'zh-Hans' : base === 'pt' ? 'pt-BR' : names[base] ? base : null;
  };
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage can be disabled. */ }
  let language = resolve(saved) || (navigator.languages || [navigator.language]).map(resolve).find(Boolean) || 'en';
  const lookup = (locale, key) => key.split('.').reduce((value, part) => value?.[part], dictionaries[locale]);
  const t = (key, values = {}) => {
    const template = lookup(language, key) ?? lookup('en', key) ?? key;
    return String(template).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  };
  const bindings = [];
  function bind(selector, key, mode = 'text', attribute = '') {
    document.querySelectorAll(selector).forEach(element => {
      if (mode === 'label') {
        // Preserve icons, numeric badges, and the existing button/link itself.
        const nodes = [...element.childNodes].filter(node => node.nodeType === 3);
        const label = document.createElement('span');
        label.className = 'translated-label';
        element.insertBefore(label, nodes[0] || element.firstChild);
        nodes.forEach(node => node.remove());
        element = label;
      }
      bindings.push({element, key, mode, attribute});
    });
  }
  function formatted(element, text, heading = false) {
    const year = () => {
      const wrapper = document.createElement('span');
      wrapper.className = 'year';
      ['18','6','1'].forEach((digits, index) => {
        const part = document.createElement('span');
        part.className = ['year-prefix','year-union','year-confederacy'][index];
        part.textContent = digits;
        wrapper.append(part);
      });
      return wrapper;
    };
    const fragment = document.createDocumentFragment();
    text.split('\n').forEach((line, index) => {
      if (index) fragment.append(document.createElement('br'));
      const target = heading && index ? document.createElement('em') : fragment;
      line.split('{year}').forEach((part, i) => {
        if (i) target.append(year());
        target.append(document.createTextNode(part));
      });
      if (target !== fragment) fragment.append(target);
    });
    element.replaceChildren(fragment);
  }
  bind('.skip-link','nav.0'); bind('.menu-toggle','nav.1','label');
  ['about','mine','features','gallery','studio'].forEach((id,index) => bind('.nav-link[href="#'+id+'"]','nav.'+(index+2)));
  bind('.mobile-steam, .hero-actions .steam-link','nav.7','label');
  bind('#language-label','nav.8'); bind('#language-select','nav.8','attribute','aria-label');
  bind('.scene-caption>span:first-child','hero.0','label');
  bind('.intro-heading .eyebrow','hero.1','formatted'); bind('.intro-heading h1','hero.2','heading');
  bind('.intro-copy>p','hero.3');
  [0,1,2].forEach(i=>bind('.hero-tags>span:nth-child('+(i+1)+')','hero.'+(i+4)));
  bind('.hero-actions .secondary, #story-to-map','nav.3','label');
  bind('.story-heading .eyebrow, #story-dialog>.eyebrow','story.0');
  bind('#dialog-story-title','story.1','label');
  bind('.america-heading','story.1','attribute','alt');
  bind('.story-heading>.small-label','story.2','formatted'); bind('#story-open','story.3','label');
  [0,1,2].forEach(i=>{
    bind('.story-copy>p:nth-child('+(i+1)+')','story.'+(i+4),'formatted');
    bind('#story-dialog>p:not(.eyebrow):nth-of-type('+(i+2)+')','story.'+(i+4),'formatted');
  });
  bind('#mine .section-heading .eyebrow','map.0'); bind('#map-heading','map.1','heading');
  bind('#mine .section-heading>p','map.2'); bind('.atlas-toolbar>span','map.3','label');
  bind('#reset-map','map.4'); bind('.map-top>span:first-child','map.5','formatted'); bind('.map-top>span:last-child','map.6');
  [7,8,9,10].forEach((key,index)=>bind('.mine-map text:nth-of-type('+(index+1)+')','map.'+key));
  bind('#map-explored','map.11'); bind('#map-danger','map.12');
  bind('.danger-line>span:first-child','map.15'); bind('.field-note>span','map.16');
  bind('.atlas-caption>p','map.19'); bind('.atlas-caption>span','map.20');
  ['refuge','union','south','railway','rift'].forEach((id,index)=>{
    bind('[data-location="'+id+'"] .pin-label','locations.'+index+'.0');
    bind('[data-location="'+id+'"]','locations.'+index+'.0','attribute','aria-label');
  });
  bind('#features .eyebrow','features.0'); bind('#features-title','features.1','heading');
  bind('#features .section-heading>p','features.2');
  [0,1,2].forEach(i=>{
    const base='.mechanics-grid article:nth-child('+(i+1)+')';
    bind(base+' h3','features.'+(3+i*3)); bind(base+' p','features.'+(4+i*3));
    bind(base+' button','features.'+(5+i*3),'label');
  });
  bind('#gallery .eyebrow','gallery.0'); bind('#gallery-title','gallery.1','heading');
  bind('#gallery .section-heading>p','gallery.2'); bind('#tab-world','gallery.3','label'); bind('#tab-factions','gallery.4','label');
  bind('.concept-note','gallery.5');
  bind('#tab-places','scenes.tab','label');
  bind('#place-art-open','scenes.view','label');
  bind('.scene-map-link','scenes.showMap','label');
  ['refuge','union','south','shrine'].forEach((id,i)=>{
    const base='[data-scene="'+id+'"]';
    bind(base+' strong',i<3?'locations.'+i+'.0':'scenes.shrine');
    bind(base+' .scene-faction','locations.'+(i<3?i:4)+'.1');
    bind(base+' .scene-copy','scenes.items.'+i+'.0');
    bind(base+' img','scenes.items.'+i+'.1','attribute','alt');
  });
  const artIds=['gameplay','settlement','enemies','union','confederation','family'];
  artIds.forEach((id,i)=>{
    const base='[data-art="'+id+'"]';
    bind(base+' .art-label>span:first-child','art.'+i+'.0'); bind(base+' strong','art.'+i+'.1');
    bind(base,'art.'+i+'.2','attribute','data-caption'); bind(base+' img','art.'+i+'.3','attribute','alt');
    if(i>2) bind(base+' .card-copy','art.'+i+'.4');
  });
  bind('#studio .eyebrow','studio.0'); bind('#studio h2','studio.1','heading');
  bind('#studio p:not(.eyebrow)','studio.2'); bind('#studio .text-button','studio.3','label');
  bind('.site-footer>span:nth-of-type(2)','studio.4'); bind('.private-badge','studio.5','label');
  const attributes=[['#main-nav',0],['.brand',1],['.steam-link',2],['.map-pins',3],['.location-detail',4],['#previous-place',5],['#next-place',6],['.gallery-tabs',7],['#story-dialog .dialog-close',8],['#art-dialog .dialog-close',9]];
  attributes.forEach(([selector,index])=>bind(selector,'a11y.'+index,'attribute','aria-label'));
  bind('.hero-art','a11y.10','attribute','alt'); bind('meta[name="description"]','a11y.12','attribute','content');
  function apply(next, announce = false) {
    language = resolve(next) || 'en';
    document.documentElement.lang = language;
    select.value = language;
    bindings.forEach(({element,key,mode,attribute})=>{
      const text=t(key);
      if(mode==='attribute') element.setAttribute(attribute,text);
      else if(mode==='formatted'||mode==='heading') formatted(element,text,mode==='heading');
      else element.textContent=text;
    });
    ['refuge','union','south','shrine'].forEach((id,i)=>{
      const title=t(i<3?'locations.'+i+'.0':'scenes.shrine');
      document.querySelector('[data-art="scene-'+id+'"]').dataset.caption=title+' · '+t('scenes.concept');
    });
    // The open viewer follows language changes for both existing art and new scenes.
    const image = document.getElementById('art-dialog-image');
    const currentArt=image.dataset.art;
    const card=currentArt && document.querySelector('[data-art="'+currentArt+'"]');
    if(card){document.getElementById('art-dialog-caption').textContent=card.dataset.caption;image.alt=card.querySelector('img').alt;}
    document.dispatchEvent(new CustomEvent('site:languagechange',{detail:{language}}));
    if(announce) document.getElementById('language-status').textContent=t('a11y.11',{language:names[language]});
  }
  window.SiteI18n={t,get language(){return language;}};
  select.addEventListener('change',()=>{
    apply(select.value,true);
    try {localStorage.setItem(storageKey,language);} catch { /* The selection still works for this visit. */ }
  });
  apply(language);
})();
