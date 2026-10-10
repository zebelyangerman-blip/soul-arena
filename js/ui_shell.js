'use strict';
/* R29 UI Shell — explicit CPU overlay sync, no MutationObserver polling. */
(function(){
  const VERSION='R29.0.0';
  const MODAL_IDS=Object.freeze(['game-mode-modal','cpu-preview-modal','future-updates-modal','feature-preview-modal','rules-modal','economy-modal','shop-modal','audio-settings-modal','pause-modal','battle-details-modal']);
  const openerById=new Map();
  function el(id){return document.getElementById(id)}
  function isOpen(id){const node=el(id);return !!node&&!node.classList.contains('hidden')}
  function syncBody(){document.body.classList.toggle('ui-modal-open',MODAL_IDS.some(isOpen));}
  function open(id,options={}){
    const node=el(id);if(!node)return false;
    const active=document.activeElement;if(active&&active!==document.body)openerById.set(id,active);
    node.classList.remove('hidden');node.setAttribute('aria-hidden','false');syncBody();
    if(options.focus!==false)requestAnimationFrame(()=>{const target=node.querySelector('[autofocus],button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');target?.focus?.({preventScroll:true});});
    return true;
  }
  function close(id,options={}){
    const node=el(id);if(!node)return false;
    node.classList.add('hidden');node.setAttribute('aria-hidden','true');syncBody();
    if(options.restoreFocus!==false){const prev=openerById.get(id);openerById.delete(id);if(prev&&prev.isConnected)requestAnimationFrame(()=>prev.focus?.({preventScroll:true}));}
    return true;
  }
  function top(){for(let i=MODAL_IDS.length-1;i>=0;i--)if(isOpen(MODAL_IDS[i]))return MODAL_IDS[i];return null}
  function initModals(){for(const id of MODAL_IDS){const node=el(id);if(node)node.setAttribute('aria-hidden',node.classList.contains('hidden')?'true':'false')}syncBody()}
  function syncCpuOverlay(){const overlay=el('cpu-thinking-overlay');if(!overlay)return;const show=document.body.dataset.cpuThinking==='true'&&document.body.dataset.gameMode==='cpu';overlay.classList.toggle('show',show);overlay.setAttribute('aria-hidden',show?'false':'true')}
  function audit(){
    const ids=[...document.querySelectorAll('[id]')].map(n=>n.id),dupes=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
    const legacyHub=document.querySelectorAll('.r16-mode-summary').length;
    const globalObserverMarkers=[...document.scripts].map(s=>s.src||'').filter(x=>/r25-runtime|r25-battle-explanations/.test(x));
    return Object.freeze({version:VERSION,duplicateIds:dupes,legacyHubModeRows:legacyHub,modalCount:MODAL_IDS.filter(id=>!!el(id)).length,openModals:MODAL_IDS.filter(isOpen),obsoleteScannerScripts:globalObserverMarkers,cpuOverlay:!!el('cpu-thinking-overlay')});
  }
  function boot(){initModals();syncCpuOverlay();window.__R26_UI_OBSERVER__=null;}
  window.SOUL_ARENA_UI_SHELL=Object.freeze({version:VERSION,modalIds:MODAL_IDS,open,close,isOpen,top,audit,syncCpuOverlay});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
