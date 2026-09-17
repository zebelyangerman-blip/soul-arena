'use strict';
/* R29 Performance + Motion policy. No gameplay or combat math. */
(function(){
  const VERSION='R29.0.0';
  const coarse=!!window.matchMedia?.('(pointer: coarse)').matches;
  const reduceOs=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const cores=Math.max(1,Number(navigator.hardwareConcurrency)||4);
  const memory=Number(navigator.deviceMemory)||4;
  const narrow=Math.min(innerWidth||1024,innerHeight||768)<700;
  let tier='high';
  if(reduceOs||cores<=2||memory<=2) tier='low';
  else if(coarse||cores<=4||memory<=4||narrow) tier='balanced';
  const config=Object.freeze({
    tier,coarse,reduceOs,cores,memory,
    particleCount:tier==='high'?24:tier==='balanced'?12:6,
    particleFps:tier==='high'?30:tier==='balanced'?24:18,
    modalParticleFps:8,
    pointerParticleInteraction:tier==='high'&&!coarse,
    tilt:tier!=='low'&&!coarse,
    tiltMaxDeg:tier==='high'?7:5,
    cpuThinkMin:tier==='low'?760:820,
    cpuThinkMax:tier==='low'?980:1120,
    cpuPreviewMs:tier==='low'?260:380,
    cpuPostCommitMs:120,
    maxCpuCacheEntries:2400
  });
  function cpuDelay(base){
    const n=Number(base)||0;
    return Math.round(Math.max(config.cpuThinkMin,Math.min(config.cpuThinkMax,n+420)));
  }
  function audit(){
    const canv=document.getElementById('spirit-canvas');
    return Object.freeze({
      version:VERSION,tier:config.tier,config,
      backdropFilters:[...document.querySelectorAll('*')].filter(el=>{const s=getComputedStyle(el);return s.backdropFilter&&s.backdropFilter!=='none'}).length,
      visibleCards:[...document.querySelectorAll('.r22-bestiary-card,.r21-shop-item,.r22-achievement')].filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&!el.closest('.hidden')}).length,
      canvas:canv?{width:canv.width,height:canv.height,paused:document.body.dataset.fxPaused==='true'}:null,
      cpuStage:document.body.dataset.cpuStage||'idle'
    });
  }
  if(document.body) document.body.dataset.performanceTier=tier;
  window.SOUL_ARENA_PERFORMANCE=Object.freeze({version:VERSION,config,cpuDelay,audit});
})();
