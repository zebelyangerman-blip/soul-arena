
'use strict';
/* R34 transparent battle explanation adapter. Presentation only; never changes the winner. */
(function(){
  const VERSION='R34.0.0';
  const STATE_LABELS=['Свежий','Ранен','Истощён','На грани','Мёртв'];
  const TYPE_META=Object.freeze({
    counter:Object.freeze({label:'СПЕЦИАЛЬНЫЙ КОНТР',icon:'shield'}),
    fatigue:Object.freeze({label:'НАКОПЛЕННЫЙ УРОН',icon:'heart'}),
    equalizer:Object.freeze({label:'ВЗАИМНОЕ ИСТОЩЕНИЕ',icon:'swords'}),
    survival:Object.freeze({label:'УСЛОВИЕ УБИЙСТВА',icon:'spark'}),
    initiative:Object.freeze({label:'ТЕМП И ИНИЦИАТИВА',icon:'lightning'}),
    ability:Object.freeze({label:'ОСОБАЯ СПОСОБНОСТЬ',icon:'prime'}),
    arena:Object.freeze({label:'УСЛОВИЯ АРЕНЫ',icon:'arena'}),
    rating:Object.freeze({label:'ОБЩЕЕ ПРЕИМУЩЕСТВО',icon:'swords'})
  });
  const LABEL_MAP=Object.freeze({
    'anti-divine reflection hard counter':'зеркальный контр божественной форме',
    'spatial barrier hard counter':'пространственный контр полю увядания',
    'balance counters event reversal':'Баланс контрит инверсию события',
    'miracle recovery after catastrophic damage':'восстановление после критического урона',
    'volatile pressure vs adaptive dosage':'нестабильное духовное давление против адаптивной дозировки',
    'event reversal exception':'инверсия уже произошедшего события',
    'verified pair/form interaction':'подтверждённое правило конкретной пары',
    'special interaction':'особое взаимодействие способностей',
    'forced mutual attrition':'принудительное взаимное истощение'
  });
  function stateLabel(v){const n=Math.max(0,Math.min(4,Math.trunc(Number(v)||0)));return STATE_LABELS[n]||STATE_LABELS[0]}
  function humanLabel(value){const raw=String(value||'').trim();return LABEL_MAP[raw.toLowerCase()]||raw||'особое взаимодействие'}
  function unique(values){const out=[];const seen=new Set();for(const value of values){const x=String(value||'').trim();if(!x||seen.has(x))continue;seen.add(x);out.push(x)}return out}
  function reasonLabels(engine){return unique((Array.isArray(engine?.reasons)?engine.reasons:[]).map(x=>humanLabel(x?.label)))}
  function specialLabels(engine){
    const labels=[];
    for(const r of (engine?.hax?.pairRules||[])) labels.push(humanLabel(r?.label));
    for(const r of (engine?.verification?.matches||[])) labels.push(humanLabel(r?.label));
    const eq=engine?.finalRatingPolicy?.equalizationApplied;if(eq?.label)labels.push(humanLabel(eq.label));
    return unique(labels).filter(x=>x!=='подтверждённое правило конкретной пары' || labels.length===1);
  }
  function includesAny(items,parts){return items.some(x=>parts.some(p=>String(x).toLowerCase().includes(p)))}
  function buildExplanation(context={}){
    const winner=context.winner||{},loser=context.loser||{},engine=context.engine||{};
    const wr=Number(winner.rating),lr=Number(loser.rating);
    const ratingsKnown=Number.isFinite(wr)&&Number.isFinite(lr);
    const upset=ratingsKnown&&wr<lr;
    const winnerState=Number(winner.entryState)||0,loserState=Number(loser.entryState)||0;
    const stateGap=loserState-winnerState;
    const reasons=reasonLabels(engine), specials=specialLabels(engine);
    const equalizer=engine?.finalRatingPolicy?.equalizationApplied||null;
    const hard=Boolean(context.hardOverrideApplied||engine?.hardOverrideApplied);
    const suppressed=Boolean(engine?.hardOverrideSuppressedByFatigue);
    const fatigueChanged=Boolean(context.fatigueChanged);
    const fatiguePrimary=Boolean(context.fatiguePrimary);
    const miracle=includesAny(specials,['восстановление после критического урона','miracle']);
    const initiative=includesAny(reasons,['инициатив','скорост','темп']);
    const ability=includesAny(reasons,['особ','hax','способност','техник']);
    const arena=includesAny(reasons,['арен']);
    let type='rating';
    if(hard) type='counter';
    else if(equalizer) type='equalizer';
    else if(miracle) type='survival';
    else if(fatigueChanged || (fatiguePrimary&&Math.abs(stateGap)>=1) || Math.abs(stateGap)>=2) type='fatigue';
    else if(initiative) type='initiative';
    else if(ability||specials.length) type='ability';
    else if(arena) type='arena';
    const meta=TYPE_META[type]||TYPE_META.rating;
    let headline='Суммарное преимущество оказалось решающим';
    let summary=`В этой дуэли побеждает ${winner.name}: движок сравнил форму, состояние, боевой профиль, способности и арену.`;
    if(type==='counter'){headline='Сработало специальное правило этой пары';summary=`Путь к победе возник не из-за скрытой прибавки к рейтингу: ключевая способность ${loser.name} попала под прямой контр или обход со стороны победителя.`;}
    else if(type==='fatigue'){headline='Состояние бойцов изменило реальную боеспособность';summary=`Это не абстрактный «идеальный» бой: накопленные повреждения изменили скорость, защиту, выносливость и стабильность техник участников.`;}
    else if(type==='equalizer'){headline='Техника затянула бой во взаимное истощение';summary=`Специальная механика ${winner.name} или соперника свела преимущество к почти ничейной изматывающей дуэли. Это не означает равенство их общего рейтинга.`;}
    else if(type==='survival'){headline='Одного критического попадания недостаточно';summary=`В этой паре движок проверяет условие окончательной победы: тяжёлый урон сам по себе не гарантирует завершение боя, если активна подтверждённая механика восстановления.`;}
    else if(type==='initiative'){headline='Темп боя не дал сопернику реализовать весь арсенал';summary=`Преимущество победителя в скорости, реакции и запуске техники позволило навязать решающее действие раньше ответа соперника.`;}
    else if(type==='ability'){headline='Решающим стало взаимодействие способностей';summary=`Общий рейтинг дал базовую расстановку сил, но конкретные свойства техник создали дополнительный перевес в пользу победителя.`;}
    else if(type==='arena'){headline='Арена усилила уже существующее преимущество';summary=`Условия площадки усилили уже существующие сильные стороны победителя, но арена не заменяет рейтинг и не создаёт большой разрыв силы из ничего.`;}

    const bullets=[];
    if(ratingsKnown){
      if(upset) bullets.push(`Рейтинг формы: ${winner.name} — ${wr}, ${loser.name} — ${lr}. Более высокий общий рейтинг проиграл именно этот бой, а не «стал слабее навсегда».`);
      else bullets.push(`Рейтинг формы: ${winner.name} — ${wr}, ${loser.name} — ${lr}. Это стартовая база расчёта, а не единственный критерий.`);
    }
    if(winnerState!==loserState || fatiguePrimary){bullets.push(`Состояние на входе: ${winner.name} — «${stateLabel(winnerState)}», ${loser.name} — «${stateLabel(loserState)}». Повреждения переносятся из прошлых дуэлей.`)}
    if(specials.length) bullets.push(`Специальное взаимодействие: ${specials.slice(0,2).join('; ')}.`);
    if(suppressed) bullets.push('Обычный специальный override этой способности был ослаблен текущим состоянием бойца: усталость влияет и на надёжность hax.');
    const visibleReasons=reasons.filter(x=>!specials.includes(x)).slice(0,2);
    if(visibleReasons.length) bullets.push(`Ключевые факторы движка: ${visibleReasons.join(', ')}.`);
    if(context.arena?.name) bullets.push(`Арена: «${context.arena.name}». Её бонус учитывается как небольшой модификатор конкретных параметров, а не как отдельный «рейтинг».`);
    const exit=stateLabel(context.winnerExitState);
    if(Number(context.winnerExitState)>winnerState) bullets.push(`Цена победы: ${context.difficulty||'тяжёлый бой'}; победитель продолжит матч в состоянии «${exit}».`);
    else bullets.push(`Цена победы: ${context.difficulty||'бой'}; итоговое состояние победителя — «${exit}».`);
    let caution=`Результат относится к этой форме, этому состоянию и этой арене. Он не переписывает общий рейтинг персонажей.`;
    if(upset&&type==='fatigue') caution=`Если ${loser.name} начнёт бой свежим, исход может быть совсем другим. Здесь победил не «более сильный вообще», а более боеспособный в конкретный момент.`;
    else if(upset&&type==='counter') caution=`Это исключение конкретной пары. ${winner.name} не получает рейтинг ${lr}: специальный обход работает именно против этой механики.`;
    else if(type==='equalizer') caution='Почти ничейное истощение — это свойство техники, а не доказательство равной общей силы.';
    else if(type==='survival') caution='Восстановление продлевает бой, но не делает персонажа бессмертным: движок всё равно проверяет доступные условия окончательной победы.';
    if(engine?.finalRatingPolicy?.gapGuardApplied) bullets.push('Защита шкалы силы сработала: обычные бонусы не получили права перевернуть большой свежий разрыв рейтинга без подтверждённого ability-bypass.');
    return Object.freeze({version:VERSION,type,typeLabel:meta.label,icon:meta.icon,headline,summary,bullets:Object.freeze(bullets.slice(0,6)),caution,upset,ratingGap:ratingsKnown?Math.abs(wr-lr):null});
  }
  function canonicalNarrative(a,b){const canon=window.R25Canon;if(!canon||typeof canon.explain!=='function')return '';try{return String(canon.explain(a,b)||'').trim()}catch(_){return ''}}
  function improveNarrative(model,fallback){return buildExplanation(model||{}).summary||canonicalNarrative(model?.winner?.name,model?.loser?.name)||fallback||''}
  window.SOUL_ARENA_BATTLE_EXPLAINER=Object.freeze({version:VERSION,canonicalNarrative,improveNarrative,buildExplanation,stateLabel,humanLabel});
})();
