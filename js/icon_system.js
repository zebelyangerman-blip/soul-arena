'use strict';
/* R27 Icon System — one local SVG registry, no emoji fallbacks, no DOM observer. */
(function(){
  const VERSION='R27.0.0';
  const DEFINITIONS=Object.freeze({
    coin:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 7.8l1.15 2.35 2.6.38-1.88 1.83.44 2.59L12 13.74l-2.31 1.21.44-2.59-1.88-1.83 2.6-.38L12 7.8z" class="ui-icon-fill"/>',
    shard:'<path d="M12 2.8l6.6 5.1-2.45 9.2L12 21.2l-4.15-4.1L5.4 7.9 12 2.8z"/><path d="M5.4 7.9h13.2M7.85 17.1L12 7.9l4.15 9.2M12 2.8v5.1"/>',
    rating:'<circle cx="12" cy="9" r="5"/><path d="M9.2 13.1L7.6 21l4.4-2.7 4.4 2.7-1.6-7.9"/><path d="M12 6.1l.85 1.73 1.9.28-1.37 1.34.32 1.89L12 10.45l-1.7.89.32-1.89-1.37-1.34 1.9-.28L12 6.1z" class="ui-icon-fill"/>',
    volume:'<path d="M4 9.2h3.3L12 5.5v13l-4.7-3.7H4V9.2z"/><path d="M15.5 8.1a5 5 0 010 7.8M17.9 5.7a8.4 8.4 0 010 12.6"/>',
    volumeOff:'<path d="M4 9.2h3.3L12 5.5v13l-4.7-3.7H4V9.2z"/><path d="M16 9l5 5M21 9l-5 5"/>',
    profile:'<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/>',
    shop:'<path d="M5 8h14l-1 12H6L5 8z"/><path d="M8.3 9V6.5A3.7 3.7 0 0112 2.8a3.7 3.7 0 013.7 3.7V9"/>',
    bestiary:'<path d="M4 4.5h6.2A3.8 3.8 0 0114 8.3V20a3.8 3.8 0 00-3.8-3.8H4V4.5z"/><path d="M20 4.5h-6.2A3.8 3.8 0 0010 8.3V20a3.8 3.8 0 013.8-3.8H20V4.5z"/>',
    trophy:'<path d="M8 4h8v4.4c0 3.2-1.6 5.1-4 5.1s-4-1.9-4-5.1V4z"/><path d="M8 6H4.5v1.5c0 2.7 1.5 4.2 4.1 4.4M16 6h3.5v1.5c0 2.7-1.5 4.2-4.1 4.4M12 13.5V18M8.5 21h7M9.5 18h5"/>',
    rules:'<path d="M7 3h9a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M8.5 7h6M8.5 11h6M8.5 15h4.5"/>',
    future:'<path d="M14 4c2.8-1.2 4.9-1 6-.8.2 1.1.4 3.2-.8 6l-5.3 5.3-4.4-4.4L14 4z"/><path d="M9.4 10.2L6 10.8 3.8 13l4.2 1M13.8 14.6l-.6 3.4-2.2 2.2-1-4.2M15.8 7.2h.01"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.5 5.5L17 7M7 17l-1.5 1.5M18.5 18.5L17 17M7 7L5.5 5.5"/><circle cx="12" cy="12" r="7"/>',
    users:'<circle cx="9" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.3"/><path d="M3.5 19c.6-3.7 2.6-5.7 5.5-5.7s4.9 2 5.5 5.7M14.2 14.2c2.9-.3 4.9 1.3 5.4 4.8"/>',
    cpu:'<rect x="5" y="6" width="14" height="12" rx="3"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M2 10h3M19 10h3M2 14h3M19 14h3"/><circle cx="9.5" cy="11.5" r="1" class="ui-icon-fill"/><circle cx="14.5" cy="11.5" r="1" class="ui-icon-fill"/><path d="M9 15h6"/>',
    online:'<circle cx="12" cy="12" r="9"/><path d="M3.4 12h17.2M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21c-2.3-2.4-3.5-5.4-3.5-9S9.7 5.4 12 3z"/>',
    prime:'<path d="M12 2.7l2.05 5.05L19.5 6.5l-1.25 5.45L23.3 14l-5.05 2.05 1.25 5.45-5.45-1.25L12 25.3l-2.05-5.05L4.5 21.5l1.25-5.45L.7 14l5.05-2.05L4.5 6.5l5.45 1.25L12 2.7z" transform="scale(.82) translate(2.6 2.6)"/><circle cx="12" cy="12" r="3.1" class="ui-icon-fill"/>',
    arena:'<path d="M4 20h16M6 20v-6l6-3.5 6 3.5v6M9 20v-4h6v4M4 8l8-5 8 5-8 4-8-4z"/>',
    swords:'<path d="M4 4l7.5 7.5M20 4l-7.5 7.5M9.8 13.2L5 18l1 2 2 1 4.8-4.8M14.2 13.2L19 18l-1 2-2 1-4.8-4.8"/><path d="M3 3l5 1-4 4-1-5zM21 3l-5 1 4 4 1-5z"/>',
    shield:'<path d="M12 3l7 2.8v5.4c0 4.4-2.5 7.6-7 9.8-4.5-2.2-7-5.4-7-9.8V5.8L12 3z"/><path d="M9 12l2 2 4-4"/>',
    back:'<path d="M10 5l-7 7 7 7M4 12h16"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
    play:'<path d="M8 5l11 7-11 7V5z" class="ui-icon-fill"/>',
    reward:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3V9z" class="ui-icon-fill"/><path d="M18 3v4M16 5h4"/>',
    collection:'<path d="M7 7h10l2 4v8H5v-8l2-4z"/><path d="M9 7V5a3 3 0 016 0v2M8 12h8"/>',
    gift:'<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M3 7h18v4H3zM12 7v13M12 7c-3.5 0-5.5-.6-5.5-2.2C6.5 3.6 7.4 3 8.5 3 10.4 3 12 7 12 7zM12 7s1.6-4 3.5-4c1.1 0 2 .6 2 1.8C17.5 6.4 15.5 7 12 7z"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8" cy="8" r="1" class="ui-icon-fill"/><circle cx="16" cy="8" r="1" class="ui-icon-fill"/><circle cx="12" cy="12" r="1" class="ui-icon-fill"/><circle cx="8" cy="16" r="1" class="ui-icon-fill"/><circle cx="16" cy="16" r="1" class="ui-icon-fill"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    check:'<path d="M5 12.5l4.2 4.2L19 7"/>',
    lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    spark:'<path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
    fighter:'<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.5-3.9 2.8-6 6.5-6s6 2.1 6.5 6"/><path d="M4 6l3-3M20 6l-3-3"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="M15.2 15.2L21 21"/>',
    wheel:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.1"/><path d="M12 3.5V9.9M12 14.1v6.4M3.5 12h6.4M14.1 12h6.4M6 6l4.5 4.5M13.5 13.5L18 18M18 6l-4.5 4.5M10.5 13.5L6 18"/>',
    target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" class="ui-icon-fill"/>',
    brain:'<path d="M9 5.2a3 3 0 00-5 2.2c0 .8.3 1.5.8 2A3.4 3.4 0 005 15.7c.2 2 1.8 3.3 3.7 3.3H10V6.2A2.2 2.2 0 009 5.2zM15 5.2a3 3 0 015 2.2c0 .8-.3 1.5-.8 2a3.4 3.4 0 01-.2 6.3c-.2 2-1.8 3.3-3.7 3.3H14V6.2a2.2 2.2 0 011-1z"/><path d="M7 9.5h3M7.5 14H10M14 9.5h3M14 14h2.5"/>',
    heart:'<path d="M12 20s-7-4.2-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.8-7 10-7 10z"/>',
    crown:'<path d="M4 8l4 4 4-7 4 7 4-4-2 11H6L4 8z"/><path d="M7 16h10"/>',
    skull:'<path d="M6 10a6 6 0 1112 0v3.5l-2 2V19h-2v-2h-4v2H8v-3.5l-2-2V10z"/><circle cx="9" cy="11" r="1" class="ui-icon-fill"/><circle cx="15" cy="11" r="1" class="ui-icon-fill"/><path d="M11 14h2"/>',
    palette:'<path d="M12 3a9 9 0 100 18h1.6a2 2 0 001.4-3.4 1.6 1.6 0 011.1-2.7H19A2 2 0 0021 13c0-5.5-4-10-9-10z"/><circle cx="8" cy="9" r="1" class="ui-icon-fill"/><circle cx="12" cy="7" r="1" class="ui-icon-fill"/><circle cx="16" cy="9" r="1" class="ui-icon-fill"/><circle cx="8" cy="13" r="1" class="ui-icon-fill"/>',
    frame:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 8h8v8H8z"/>',
    background:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M5 16l4-4 3 3 2-2 5 4"/><circle cx="16" cy="9" r="1.2" class="ui-icon-fill"/>',
    tag:'<path d="M4 5h9l7 7-8 8-8-8V5z"/><circle cx="8" cy="9" r="1.2" class="ui-icon-fill"/>',
    question:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 014.8 1c0 2-2.5 2.1-2.5 4M12 17h.01"/>',
    lightning:'<path d="M13.5 2.8L6 13h5l-.5 8.2L18 10h-5l.5-7.2z" class="ui-icon-fill"/>',
    flame:'<path d="M12 21c-4 0-7-2.8-7-6.5 0-3.2 1.9-5.5 4.2-8.3.3 2.1 1.1 3.2 2.2 4.2.2-3.4 1.8-5.8 4.4-8.1-.1 3.2 3.2 5.4 3.2 9.4 0 5.1-3.1 9.3-7 9.3z"/>',
    snow:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 5.5L12 8l2.5-2.5M9.5 18.5L12 16l2.5 2.5"/>',
    void:'<circle cx="12" cy="12" r="8.5"/><path d="M7 12c1.6-3.7 8.4-3.7 10 0-1.6 3.7-8.4 3.7-10 0z"/><circle cx="12" cy="12" r="1.4" class="ui-icon-fill"/>'
  });
  const ALIASES=Object.freeze({sound:'volume',soundOn:'volume',soundOff:'volumeOff',coins:'coin',medal:'rating',book:'bestiary',achievement:'trophy',game:'swords',fight:'swords',robot:'cpu',globe:'online',bag:'collection'});
  function resolve(name){const key=String(name||'').trim();return DEFINITIONS[key]?key:(ALIASES[key]||'info');}
  function svg(name,options={}){
    const key=resolve(name), cls=['ui-icon',`ui-icon--${key}`,options.className||''].filter(Boolean).join(' '), label=String(options.label||'').trim();
    const size=Number(options.size)||24;
    const aria=label?`role="img" aria-label="${label.replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}"`:'aria-hidden="true"';
    return `<svg class="${cls}" ${aria} viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" focusable="false"><g>${DEFINITIONS[key]}</g></svg>`;
  }
  function hydrate(root=document){
    const nodes=[];
    if(root?.matches?.('[data-ui-icon]'))nodes.push(root);
    if(root?.querySelectorAll)nodes.push(...root.querySelectorAll('[data-ui-icon]'));
    for(const node of nodes){
      const name=node.dataset.uiIcon;if(!name)continue;
      const size=Number(node.dataset.iconSize)||undefined;
      node.innerHTML=svg(name,{size,label:node.dataset.iconLabel||''});
      node.classList.add('ui-icon-slot');
      node.dataset.iconHydrated='true';
    }
    return nodes.length;
  }
  function setSlot(node,name,options={}){if(!node)return false;node.dataset.uiIcon=resolve(name);node.innerHTML=svg(name,options);node.classList.add('ui-icon-slot');node.dataset.iconHydrated='true';return true;}
  function audit(root=document){
    const required=['coin','shard','rating','volume','volumeOff','profile','shop','bestiary','trophy','rules','future','settings','users','cpu','online','prime','arena','swords','back','close','info','play','reward','collection','gift','dice','menu','search','wheel','target','brain','heart','crown','skull','palette','frame','background','tag','question','lightning','flame','snow','void'];
    const missing=required.filter(x=>!DEFINITIONS[x]);
    const slots=[...root.querySelectorAll?.('[data-ui-icon]')||[]];
    const unhydrated=slots.filter(n=>!n.querySelector('svg.ui-icon')).map(n=>n.dataset.uiIcon||'');
    const resourceEmoji=/[🪙💰💎🔊🔇🏅🏆🎬👤📚🛍️🎒⚙️💬🌐🚀📜]/u;
    const visibleLegacy=[...root.querySelectorAll?.('body *')||[]].filter(n=>n.children.length===0&&n.offsetParent!==null&&resourceEmoji.test(n.textContent||'')).slice(0,50).map(n=>(n.textContent||'').trim().slice(0,80));
    return Object.freeze({version:VERSION,definitions:Object.keys(DEFINITIONS).length,missingRequired:missing,slots:slots.length,unhydrated,visibleLegacyResourceEmoji:visibleLegacy});
  }
  function boot(){hydrate(document);document.documentElement.dataset.iconSystem='r27';}
  window.SOUL_ARENA_ICONS=Object.freeze({version:VERSION,names:Object.freeze(Object.keys(DEFINITIONS)),svg,hydrate,setSlot,audit,resolve});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
