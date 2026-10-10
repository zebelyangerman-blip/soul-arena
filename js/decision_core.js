/* R87: common public-information strategy for local and online opponents.
   The server copy is generated verbatim by sync-decision-core.mjs. */
(function (root) {
  'use strict';
  const VERSION = 'R87.0';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
  const alive = team => (team || []).filter(c => c && c.state < 4);
  const power = c => (c.prime ? c.primePower : c.basePower) * [1,.85,.65,.45,0][c.state || 0];
  const quality = c => c.basePower * .77 + c.primePower * .23;
  const copy = team => team.map(c => ({...c}));
  const mean = values => values.length ? values.reduce((a,b) => a+b,0)/values.length : 0;
  const randomUnit = fn => clamp(typeof fn === 'function' ? fn() : Math.random(),0,.999999999);

  function planner(context) {
    const budget = {used:0,failures:0,max:Math.max(0,Math.floor(context.maxEvaluations ?? 180))};
    const cache = new Map();
    function preview(a,b,arena) {
      const key = `${a.id}.${+a.prime}.${a.state}|${b.id}.${+b.prime}.${b.state}|${arena?.id || arena || ''}`;
      if (cache.has(key)) return cache.get(key);
      if (budget.used >= budget.max || typeof context.evaluate !== 'function') return null;
      budget.used++;
      // Evaluators receive copies: planning cannot change a roster or fatigue.
      let result;
      try {result=context.evaluate({...a},{...b},arena);}
      catch {budget.failures++;return null;}
      if (!result || ![a.id,b.id].includes(result.winnerId)) return null;
      const out = {won:result.winnerId === a.id,
        ours:{...a,state:result.winnerId === a.id ? result.winnerStateAfter : 4},
        theirs:{...b,state:result.winnerId === b.id ? result.winnerStateAfter : 4},
        margin:Math.abs(Number(result.margin) || 0)};
      cache.set(key,out);
      return out;
    }
    function utility(a,b,arena,exact=true) {
      const r = exact ? preview(a,b,arena) : null;
      return r ? (r.won ? 100 : -100) +
        (r.won ? power(r.ours) : -power(r.theirs))*.18 : (power(a)-power(b))*2;
    }
    return {budget,preview,utility};
  }

  function choose(candidates, context, regret=4) {
    const sorted = [...candidates].sort((a,b) => b.score-a.score || String(a.key).localeCompare(String(b.key)));
    if (!sorted.length) return null;
    const skill = clamp(context.skill ?? .5,0,1);
    const gap = sorted.length > 1 ? sorted[0].score-sorted[1].score : 100;
    // Difficulty varies planning depth and close alternatives, never a random
    // giveaway of a clearly superior card or a known losing counterpick.
    const allowance = skill >= .9 ? 0 : regret*(1-skill);
    const options = sorted.filter(c => sorted[0].score-c.score <= allowance+1e-9);
    const pick = options[Math.floor(randomUnit(context.random)*options.length)];
    return {...pick,confidence:clamp(.6+gap/80,.6,.99),alternatives:options.length};
  }

  function draft(context) {
    const {card,ownTeam=[],opponentTeam=[]} = context;
    if (!card) return {choice:'pass',confidence:1,evaluations:0,reason:'missing-card'};
    if (ownTeam.length >= 5) return {choice:'pass',confidence:1,evaluations:0,reason:'full-team'};
    if (opponentTeam.length >= 5) return {choice:'keep',confidence:1,evaluations:0,reason:'opponent-full'};
    if (card.basePower >= 86 || card.primePower >= 95)
      return {choice:'keep',confidence:.99,evaluations:0,reason:'elite-card'};
    const p = planner(context), arenas = context.arenas?.length ? context.arenas : [null];
    const enemy = alive(opponentTeam), own = alive(ownTeam);
    const ownMean = mean(own.map(quality)) || 66;
    const enemyMean = mean(enemy.map(quality)) || 66;
    let score = (quality(card)-66)*2+(enemyMean-ownMean)*.15;
    score += (5-own.length)*.7;
    if (own.length === 4) score -= Math.max(0,69-quality(card))*.65;
    const sameType = own.filter(c => c.type === card.type).length;
    score -= sameType*.5;
    // Assess both keeping the card and the threat of giving it away, using
    // only already revealed rosters and an equal prior over possible arenas.
    const benefit = [], threat = [];
    for (const arena of arenas) {
      for (const opponent of enemy) benefit.push(p.utility(card,opponent,arena));
      for (const ours of own) threat.push(p.utility(card,ours,arena));
    }
    score += mean(benefit)*.055+mean(threat)*.07;
    const decision = choose([{key:'keep',choice:'keep',score},{key:'pass',choice:'pass',score:-score}],context,3);
    return {...decision,evaluations:p.budget.used,evaluationFailures:p.budget.failures,reason:'public-card-and-rosters'};
  }

  function combinations(items,count,index=0,current=[],out=[]) {
    if (current.length === count) {out.push([...current]);return out;}
    for (let i=index;i<=items.length-(count-current.length);i++) {
      current.push(items[i]);combinations(items,count,i+1,current,out);current.pop();
    }
    return out;
  }

  function prime(context) {
    const own = alive(context.ownTeam).sort((a,b)=>a.id-b.id), enemy = alive(context.opponentTeam).sort((a,b)=>a.id-b.id);
    const count = clamp(Math.floor(context.count || 0),0,own.length);
    if (!count || count === own.length) return {ids:count ? own.map(c=>c.id) : [],confidence:1,evaluations:0};
    const p = planner(context);
    let arenas = context.arenas?.length ? context.arenas : [null];
    // Compute both forms for EVERY fighter before comparing combinations.
    // This avoids favouring earlier roster entries when a budget is small.
    const perArena = own.length*enemy.length*2;
    const arenaCount = perArena ? Math.floor(p.budget.max/perArena) : arenas.length;
    const exact = arenaCount > 0;
    if (exact) arenas = arenas.slice(0,Math.max(1,Math.min(arenas.length,arenaCount)));
    const base = own.map(c=>enemy.flatMap(o=>arenas.map(a=>p.utility({...c,prime:false},o,a,exact))));
    const boosted = own.map(c=>enemy.flatMap(o=>arenas.map(a=>p.utility({...c,prime:true},o,a,exact))));
    const baseCoverage = base[0]?.map((_,j)=>Math.max(...base.map(row=>row[j]))) || [];
    const candidates = combinations(own.map((_,i)=>i),count).map(indices=>{
      const chosen = new Set(indices);
      const matrix = own.map((_,i)=>chosen.has(i) ? boosted[i] : base[i]);
      const coverage = baseCoverage.map((v,j)=>Math.max(...matrix.map(row=>row[j]))-v);
      const improvement = indices.reduce((s,i)=>s+mean(boosted[i].map((v,j)=>v-base[i][j])),0);
      const gain = indices.reduce((s,i)=>s+Math.max(0,own[i].primePower-own[i].basePower),0);
      // First create useful answers the team lacks, then improve the other
      // matchups. A high Base rating alone is not a reason to spend Prime.
      const score = mean(coverage)*.85+improvement*.45+gain*.55;
      return {key:indices.map(i=>own[i].id).sort((a,b)=>a-b).join(','),ids:indices.map(i=>own[i].id),score};
    });
    return {...choose(candidates,context,2),evaluations:p.budget.used,evaluationFailures:p.budget.failures,reason:'prime-marginal-team-value'};
  }

  function battle(context) {
    const own = copy(alive(context.ownTeam)).sort((a,b)=>a.id-b.id), enemy = copy(alive(context.opponentTeam)).sort((a,b)=>a.id-b.id);
    if (!own.length) return {id:null,confidence:1,evaluations:0};
    if (!enemy.length || own.length === 1) return {id:own[0].id,confidence:1,evaluations:0};
    const locked = context.opponentLocked && enemy.find(c=>c.id===context.opponentLocked.id);
    const p = planner(context), arena = context.arena;
    const skill = clamp(context.skill ?? .5,0,1);
    const depth = skill >= .82 ? 4 : skill >= .6 ? 3 : skill >= .32 ? 2 : 1;
    const risk = clamp(context.risk ?? .35,.05,.85);
    const preference = clamp(context.preference ?? 0,-.45,.45);
    const memo = new Map();
    function value(a,b) {
      if (!alive(a).length && !alive(b).length) return context.seat===1?1000:-1000;
      if (!alive(a).length) return -1000;
      if (!alive(b).length) return 1000;
      return (alive(a).length-alive(b).length)*48+
        (alive(a).reduce((s,c)=>s+power(c),0)-alive(b).reduce((s,c)=>s+power(c),0))*.4;
    }
    function after(a,b,ours,theirs,remaining,firstOwn) {
      const r = p.preview(a,b,arena);
      if (!r) return value(ours,theirs)+(power(a)-power(b))*.35;
      const aa = ours.map(c=>c.id===a.id ? r.ours : c);
      const bb = theirs.map(c=>c.id===b.id ? r.theirs : c);
      return future(aa,bb,remaining-1,firstOwn);
    }
    function future(a,b,remaining,firstOwn) {
      if (!alive(a).length || !alive(b).length || remaining<=0 || p.budget.used>=p.budget.max) return value(a,b);
      const key = `${remaining}:${+firstOwn}:${a.map(c=>`${c.id}.${c.state}`).join(',')}|${b.map(c=>`${c.id}.${c.state}`).join(',')}`;
      if (memo.has(key)) return memo.get(key);
      let result;
      if (firstOwn) result = Math.max(...alive(a).map(c=>{
        const scores = alive(b).map(o=>after(c,o,a,b,remaining,false));
        return Math.min(...scores)*(1-risk*.2)+mean(scores)*risk*.2;
      }));
      else {
        const scores = alive(b).map(o=>Math.max(...alive(a).map(c=>after(c,o,a,b,remaining,true))));
        result = Math.min(...scores)*(1-risk*.15)+mean(scores)*risk*.15;
      }
      memo.set(key,result);return result;
    }
    const opponents = locked ? [locked] : enemy;
    // All first-ply responses are evaluated before any deeper search.
    let candidates = own.map(c=>{
      const outcomes = opponents.map(o=>p.preview(c,o,arena));
      const utilities = opponents.map((o,i)=>{
        const r=outcomes[i];return r ? (r.won?100:-100)+(r.won?power(r.ours):-power(r.theirs))*.18 : (power(c)-power(o))*2;
      });
      const weights=opponents.map(o=>Math.max(.6,1+preference*(power(o)-65)/35));
      const average=utilities.reduce((s,v,i)=>s+v*weights[i],0)/weights.reduce((a,b)=>a+b,0);
      const score = locked ? average : Math.min(...utilities)*(1-risk*.25)+average*risk*.25;
      return {key:c.id,id:c.id,c,score,immediate:score,winning:locked ? outcomes[0]?.won : false,
        survives:locked ? outcomes[0]?.ours.state<4 : false};
    });
    // Every level must take a known winning response instead of knowingly
    // losing. Deeper search chooses among these responses to conserve cards.
    if (locked && candidates.some(c=>c.winning&&c.survives)) candidates=candidates.filter(c=>c.winning&&c.survives);
    else if (locked && candidates.some(c=>c.winning)) candidates=candidates.filter(c=>c.winning);
    const quota = Math.max(0,Math.floor((p.budget.max-p.budget.used)/candidates.length));
    for (const candidate of candidates) {
      if (depth<=1 || quota<=0) continue;
      const limit=p.budget.max;p.budget.max=Math.min(limit,p.budget.used+quota);
      const scores=opponents.map(o=>after(candidate.c,o,own,enemy,depth,Boolean(locked)));
      const lookahead=locked ? mean(scores) : Math.min(...scores)*(1-risk*.25)+mean(scores)*risk*.25;
      candidate.score=candidate.immediate*.48+lookahead*.52;
      p.budget.max=limit;
    }
    const result=choose(candidates,context,6);
    return {id:result.id,score:result.score,confidence:result.confidence,alternatives:result.alternatives,
      evaluations:p.budget.used,evaluationFailures:p.budget.failures,depth,reason:locked ? 'winning-response-and-reserves' : 'public-minimax'};
  }

  root.SOUL_ARENA_DECISION_CORE = Object.freeze({version:VERSION,draft,prime,battle,quality,power});
})(globalThis);
