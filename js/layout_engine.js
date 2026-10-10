(function(){
  'use strict';
  const VERSION='R28.0.0';
  const keySelectors=[
    '.menu-screen','.menu-content','.r16-profile-strip','.r16-hub-panel','.r16-hub-grid','.r16-hub-footer-actions',
    '.r16-mode-card','.r16-cpu-grid article','#draft-card','#bonus-team-grid','#battle-layout',
    '.r21-shop-item','.r22-bestiary-card','.r22-achievement','.battle-details-modal-card'
  ];
  function overflowInfo(el){
    if(!el||el.offsetParent===null)return null;
    const x=Math.max(0,el.scrollWidth-el.clientWidth);
    const y=Math.max(0,el.scrollHeight-el.clientHeight);
    return {tag:el.tagName,id:el.id||'',className:String(el.className||'').slice(0,140),x,y,w:el.clientWidth,h:el.clientHeight};
  }
  function audit(){
    const checked=[];
    keySelectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{const r=overflowInfo(el);if(r)checked.push(r)}));
    const visibleControls=[...document.querySelectorAll('button,[role="button"],input,select')].filter(el=>{
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none';
    }).map(el=>{const r=el.getBoundingClientRect();return {id:el.id||'',text:(el.innerText||el.value||'').trim().slice(0,60),w:Math.round(r.width),h:Math.round(r.height)}});
    return {
      version:VERSION,
      viewport:{w:innerWidth,h:innerHeight},
      pageOverflowX:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      componentOverflow:checked.filter(x=>x.x>1),
      visibleControls:visibleControls.length,
      controlsBelow40:visibleControls.filter(x=>x.h<40||x.w<24),
      bodyFont:getComputedStyle(document.body).fontFamily,
      bodySize:getComputedStyle(document.body).fontSize,
      menuButtons:[...document.querySelectorAll('.r16-hub-grid .menu-secondary-btn')].map(el=>({text:el.innerText.trim(),overflow:el.scrollWidth>el.clientWidth+1})),
      duplicateIds:(()=>{const a=[...document.querySelectorAll('[id]')].map(x=>x.id);return [...new Set(a.filter((x,i)=>a.indexOf(x)!==i))]})()
    };
  }
  function validate(){
    const a=audit();
    return {ok:a.pageOverflowX===0&&a.componentOverflow.length===0&&a.controlsBelow40.length===0&&a.duplicateIds.length===0,version:VERSION,audit:a};
  }
  window.SOUL_ARENA_R28={version:VERSION,feature:'Typography & Responsive Layout Full Rebuild',audit,validate};
})();
