'use strict';
/* R87 uses the same public-information decision core as online opponents. */
(function () {
  const core=window.SOUL_ARENA_DECISION_CORE;
  if(!core)throw new Error('R87 decision core must load before CPU AI');
  const levels={easy:.2,medium:.48,hard:.76,master:.96};
  const range=Object.freeze({min:2200,max:4800});
  const DIFFICULTIES=Object.freeze(Object.fromEntries([
    ['easy','Лёгкий','Ⅰ','Распознаёт сильные карты и полезные Праймы; рассчитывает ближайший ход.'],
    ['medium','Средний','Ⅱ','Сравнивает контрпики и состояние команды на два хода вперёд.'],
    ['hard','Сложный','Ⅲ','Рассчитывает контрпики, усталость и сохранение бойцов на несколько ходов.'],
    ['master','Мастер','Ⅳ','Выбирает лучший рассчитанный план по открытой боевой модели.']
  ].map(([id,label,roman,description])=>[id,Object.freeze({id,label,roman,description,thinkMin:range.min,thinkMax:range.max})])));
  const getDifficulty=id=>DIFFICULTIES[id]||DIFFICULTIES.medium;
  const normalize=c=>({id:Number(c.id),basePower:Number(c.basePower)||0,primePower:Number(c.primePower)||0,
    type:c.type,prime:Boolean(c.isPrime??c.prime),state:Number(c.state)||0});
  function contextFor(context) {
    const originals=[...(context.ownTeam||context.team||[]),...(context.opponentTeam||[])];
    if(context.card)originals.push(context.card);
    const byId=new Map(originals.map(c=>[Number(c.id),c]));
    return {ownTeam:(context.ownTeam||context.team||[]).map(normalize),
      opponentTeam:(context.opponentTeam||[]).map(normalize),
      opponentLocked:context.opponentLocked?normalize(context.opponentLocked):null,
      seat:1,skill:levels[getDifficulty(context.difficulty).id],risk:.32,random:context.random,
      arenas:context.arenaIds,arena:context.arena,maxEvaluations:180,
      evaluate:typeof context.evaluateDuel==='function'?(a,b,arena)=>{
        const aa={...(byId.get(a.id)||{}),...a,isPrime:a.prime};
        const bb={...(byId.get(b.id)||{}),...b,isPrime:b.prime};
        const result=context.evaluateDuel(aa,a.prime?'Прайм':'База',bb,b.prime?'Прайм':'База',
          {stateA:a.state,stateB:b.state,arena});
        if(!result)return null;
        const entry=result.winnerId===a.id?a.state:b.state;
        return {...result,winnerStateAfter:Number.isInteger(result.winnerStateAfter)?result.winnerStateAfter:
          Number.isInteger(result.winnerProjectedExitState)?result.winnerProjectedExitState:
          Math.min(4,entry+(Number(result.winnerStateDelta)||0))};
      }:null};
  }
  function chooseDraftAction(context={}) {
    const r=core.draft({...contextFor(context),card:context.card?normalize(context.card):null});
    return Object.freeze({...r,action:r.choice});
  }
  function choosePrimeTargets(context={}) {
    return Object.freeze(core.prime({...contextFor(context),count:context.count}).ids);
  }
  function chooseBattleFighter(context={}) {
    const r=core.battle(contextFor(context));return Object.freeze({...r,fighterId:r.id});
  }
  function thinkDelay(_id,random=Math.random) {
    return Math.round(range.min+(range.max-range.min)*Math.max(0,Math.min(.999999999,Number(random())||0)));
  }
  window.SOUL_ARENA_CPU_AI=Object.freeze({engineVersion:core.version,cpuPlayer:2,difficulties:DIFFICULTIES,
    getDifficulty,thinkDelay,chooseDraftAction,choosePrimeTargets,chooseBattleFighter,
    policy:Object.freeze({noHiddenInformation:true,noFutureDraftPoolAccess:true,noOpponentPrivateChoiceAccess:true,
      noStatBonuses:true,noRngManipulation:true,usesOnlyCurrentOpenCardDuringDraft:true,
      publicRosterAnalysisAllowed:true,visualThinkTimingIndependentOfDifficulty:true}),
    validate:()=>Object.freeze({ok:true,engineVersion:core.version,cpuPlayer:2,
      difficulties:Object.freeze(Object.keys(DIFFICULTIES)),errors:Object.freeze([])})});
})();
