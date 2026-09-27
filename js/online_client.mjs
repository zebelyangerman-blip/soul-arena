const root = document.createElement('div');
root.id = 'online-screen';
root.className = 'online-screen hidden';
root.setAttribute('role', 'dialog');
root.setAttribute('aria-modal', 'true');
root.setAttribute('aria-label', 'Онлайн-арена');
root.innerHTML = `
  <div class="online-wrap">
    <header class="online-top">
      <div><small>АРЕНА ДУШ · ПОИСК СОПЕРНИКА</small><h1>Онлайн-арена</h1></div>
      <button type="button" class="online-close" data-action="close" aria-label="Закрыть онлайн-арену">✕</button>
    </header>
    <div class="online-connection" role="status" aria-live="polite" id="online-connection"></div>
    <div class="online-message hidden" role="alert" id="online-error"></div>
    <main id="online-content"></main>
  </div>`;
document.body.append(root);

const ui = {
  content: root.querySelector('#online-content'),
  connection: root.querySelector('#online-connection'),
  error: root.querySelector('#online-error')
};
const catalog = window.SOUL_ARENA_CHARACTER_DATA?.characters || [];
const arenaCatalog = window.SOUL_ARENA_ARENA_RULES?.arenas || [];
const fighter = id => catalog.find(c => c.id === id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roomPattern = /^[A-HJ-NP-Z2-9]{10}$/;
const storageKey = 'soulArenaOnlineRoomV1';
const searchKey = 'soulArenaMatchSearchV1';
const local = ['localhost','127.0.0.1'].includes(location.hostname);
const configured = String(window.SOUL_ARENA_ONLINE_ENDPOINT || '').trim().replace(/\/+$/, '');
const endpoint = configured || (local ? 'http://127.0.0.1:8787' : '');
let token = null, socket = null, room = null, view = null, reconnectTimer = null;
let connecting = false, closed = false, pending = false, primeSelection = new Set(), battleSelection = null, status = '';
let queueing = false, queueSince = null, queueTimer = null, profile = null, leaderboard = null;
let presence = null, secondTimer = null, clockOffset = 0;
let duelExpanded = false, lastRenderedRoom = null, lastRenderedVersion = -1;

function setStatus(value) { status = value; ui.connection.textContent = value; }
function setError(value) {
  ui.error.textContent = value || '';
  ui.error.classList.toggle('hidden', !value);
}
function isOpen() { return !root.classList.contains('hidden'); }
function isMyTurn(match, seat) { return match.turn === seat; }
function own(match, seat) { return match.teams[seat] || []; }
function opponent(match, seat) { return match.teams[1-seat] || []; }
function fighterName(id) { return fighter(id)?.public?.name || `Боец #${id}`; }
function arena(id) { return arenaCatalog.find(a => a.id === id); }
function arenaName(id) { return arena(id)?.publicName || 'Арена'; }
function statusName(state) { return ['Свежий','Ранен','Истощён','На грани','Мёртв'][state] || '—'; }
function rankTitle(rating) {
  const score=Number(rating)||0;
  if(score>=2500) return 'Властелин арены';
  if(score>=2400) return 'Хранитель арены';
  if(score>=2200) return 'Легенда';
  if(score>=2000) return 'Чемпион';
  if(score>=1800) return 'Грандмастер';
  if(score>=1600) return 'Мастер';
  if(score>=1400) return 'Ветеран';
  if(score>=1200) return 'Боец';
  if(score>=1000) return 'Любитель';
  return 'Новичок';
}
function portrait(id) {
  const image=fighter(id)?.public?.portrait;
  return image?`<img loading="lazy" decoding="async" src="images/${encodeURIComponent(image)}" alt="">`:
    escapeHtml(fighter(id)?.public?.emoji||'⚔️');
}
function card(item, selectable = false, selected = false) {
  const entry = fighter(item.id);
  const name = escapeHtml(entry?.public?.name || `Боец #${item.id}`);
  const inactive = item.state >= 4;
  return `<button type="button" class="online-fighter online-state-${item.state} ${inactive?'is-out':''} ${selected?'is-selected':''}"
      ${selectable&&!inactive?'data-action="select" data-id="'+item.id+'"':'disabled'}>
      <span class="online-avatar">${portrait(item.id)}</span>
      <span class="online-fighter-info"><b>${name}</b><small>${item.prime?'ПРАЙМ · ':''}${statusName(item.state)}</small></span>
      ${selected?'<span class="online-check">✓</span>':''}
    </button>`;
}
function button(action, label, disabled = false, extra = '') {
  return `<button type="button" class="online-btn ${extra}" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
}
function miniTeam(list, label, side) {
  return `<div class="online-mini-team online-mini-${side}"><strong>${escapeHtml(label)}</strong><div class="online-mini-portraits">${
    list.length?list.map(item=>`<span class="online-mini-fighter ${item.state>=4?'is-out':''} ${item.prime?'is-prime':''}"
      title="${escapeHtml(fighterName(item.id))} · ${item.prime?'Прайм · ':''}${statusName(item.state)}"
      aria-label="${escapeHtml(fighterName(item.id))}, ${item.prime?'Прайм, ':''}${statusName(item.state)}">${portrait(item.id)}</span>`).join(''):
    '<span class="online-mini-empty">Пока пусто</span>'}</div><small>${list.filter(item=>item.state<4).length} в строю</small></div>`;
}
function duelFighter(id, prime, before, after, won) {
  return `<div class="online-duel-fighter ${won?'is-winner':'is-loser'}">
    <span class="online-duel-portrait">${portrait(id)}</span>
    <div><strong>${escapeHtml(fighterName(id))}</strong><small>${prime==null?'Форма неизвестна':prime?'Прайм':'База'} · ${before==null?'Состояние до боя неизвестно':statusName(before)} → ${statusName(after)}</small></div>
    <b>${won?'ПОБЕДИЛ':'ВЫБЫЛ'}</b></div>`;
}
function renderDuel(duel) {
  if (!duel) return '';
  const winnerIsA=duel.winnerId===duel.fighterA;
  const beforeA=duel.fighterAStateBefore ?? (winnerIsA?duel.winnerStateBefore:null);
  const beforeB=duel.fighterBStateBefore ?? (!winnerIsA?duel.winnerStateBefore:null);
  return `<section class="online-duel ${duelExpanded?'is-expanded':''}" aria-label="Результат последней дуэли">
    <button type="button" class="online-duel-toggle" data-action="toggle_duel" aria-expanded="${duelExpanded}">
      <span>⚔️ Дуэль ${Number(duel.round)||''} · ${escapeHtml(fighterName(duel.winnerId))} победил</span><span>${duelExpanded?'Свернуть':'Разбор ▾'}</span></button>
    ${duelExpanded?`<div class="online-duel-content">
      <div class="online-duel-pair">
        ${duelFighter(duel.fighterA,duel.fighterAPrime,beforeA,winnerIsA?duel.winnerStateAfter:duel.loserStateAfter,winnerIsA)}
        <span class="online-duel-vs">VS</span>
        ${duelFighter(duel.fighterB,duel.fighterBPrime,beforeB,winnerIsA?duel.loserStateAfter:duel.winnerStateAfter,!winnerIsA)}
      </div>
      <div class="online-duel-facts"><b>РАЗБОР БОЯ</b>
        <span>Арена: ${escapeHtml(arenaName(duel.arenaId))}.</span>
        ${duel.difficulty?`<span>Характер боя: ${escapeHtml(duel.difficulty)}.</span>`:''}
        <span>${duel.fatiguePrimary?'Учитывались повреждения от предыдущих дуэлей.':'Оба бойца начинали свежими; использован проверенный исход этой пары.'}</span>
        <span>Победитель продолжит матч в состоянии «${statusName(duel.winnerStateAfter)}».</span>
      </div>
    </div>`:''}</section>`;
}
function eventLine(event, seat) {
  const who=event.seat===seat?'Вы':view?.match?.mode==='friend'?'Друг':'Соперник';
  if(event.duel) return `Дуэль ${event.duel.round||event.round}: ${fighterName(event.duel.winnerId)} победил`;
  if(event.type==='draft') return `${who} ${event.choice==='keep'?'оставили':'передали'} карту ${fighterName(event.cardId)}`;
  if(event.type==='roll_prime') return `${who} получили ${event.count} форм Прайм`;
  if(event.type==='choose_prime') return `${who} подтвердили Прайм`;
  if(event.type==='spin_arena') return `Выпала арена «${arenaName(event.arenaId)}»`;
  if(event.type==='roll_battle') return 'Жребий определил порядок выхода бойцов';
  if(event.type==='place') return `${who} выставили ${fighterName(event.fighterId)}`;
  if(event.type==='surrender') return `${who} сдались`;
  if(event.type==='timeout') return event.seat===seat?'Время вашего хода истекло':'У соперника истекло время хода';
  return '';
}
function renderLobby() {
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem">⚔️</div><h2>Найти соперника</h2>
    <p>Поиск подбирает игрока с разницей рейтинга не больше 200 очков. Рейтинг меняется после серии до пяти побед: против равного соперника это +16 за победу или −16 за поражение.</p>
    <div class="online-my-rating">Ваш PvP-рейтинг <b>${profile?.rating ?? '—'}</b>
      ${profile?`<span class="online-rank-title">${rankTitle(profile.rating)}</span>`:''}
      <small>${profile?`${profile.wins} побед · ${profile.losses} поражений`: 'Появится после входа через VK/ОК'}</small></div>
    ${profile?.history?.length?`<div class="online-history"><strong>Последние серии</strong>${profile.history.slice(0,3).map(x=>`<span>${x.won?'Победа':'Поражение'} · ${escapeHtml(formatPlayer(x.opponent))} <b>${x.delta>0?'+':''}${x.delta}</b></span>`).join('')}</div>`:''}
    ${endpoint?button('search','ИСКАТЬ МАТЧ'): '<p class="online-note">Адрес сервера пока не указан. После публикации Worker впишите его в <code>js/online_config.js</code>.</p>'}
    ${endpoint?button('ranking','Таблица лидеров',false,'online-btn-secondary online-btn-small'):''}
    ${renderRanking()}
    <div class="online-divider">Игра с другом по сети · без рейтинга</div>
    <p class="online-note">Создайте комнату и отправьте код другу. Он должен войти через другой аккаунт VK/ОК. Другой Wi-Fi не помешает: оба подключаются к серверу игры.</p>
    ${endpoint?button('create','Создать комнату',false,'online-btn-secondary'):''}
    <form id="online-join-form" class="online-join">
      <input id="online-room-code" type="text" inputmode="text" autocomplete="off" maxlength="10" placeholder="КОД КОМНАТЫ" aria-label="Код комнаты" ${endpoint?'':'disabled'} required>
      <button class="online-btn online-btn-secondary" type="submit" ${endpoint?'':'disabled'}>Войти</button>
    </form>
    ${local?'<p class="online-note">Для локальной проверки откройте игру с параметрами <code>?debugPlayer=101</code> и <code>?debugPlayer=202</code> в разных окнах.</p>':''}
  </section>`;
}
function renderRanking() {
  if (!leaderboard) return '';
  return `<div class="online-ranking"><h3>Топ-20 игроков</h3>${leaderboard.length?
    leaderboard.map((p,i)=>`<div><span>${i+1}. ${escapeHtml(formatPlayer(p.playerId))}<small>${rankTitle(p.rating)} · ${p.series ?? 0} серий</small></span><b>${p.rating}</b></div>`).join(''):
    '<p>Пока нет игроков в рейтинге.</p>'}</div>`;
}
function formatPlayer(id) {
  const [platform,value]=String(id||'').split(':');
  return `${platform==='ok'?'ОК':'VK'} #${value||'—'}`;
}
function renderQueue() {
  if (!isOpen() || !queueing) return;
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem online-search-icon">⚔️</div><h2>Ищем соперника</h2>
    <p>Система ищет тех, кто тоже нажал «Искать матч» и отличается по рейтингу не больше чем на 200 очков. Если никого нет, поиск завершится через 90 секунд.</p>
    <p class="online-search-clock">В поиске: <b data-queue-clock>00:00</b></p>
    ${button('cancel_search','Отменить поиск',false,'online-btn-secondary')}
    ${button('ranking','Таблица лидеров',false,'online-btn-secondary online-btn-small')}
    ${renderRanking()}
  </section>`;
  updateClocks();
}
function updateClocks() {
  const queueClock=root.querySelector('[data-queue-clock]');
  if(queueClock && queueSince) {
    const elapsed=Math.max(0,Math.floor((Date.now()+clockOffset-queueSince)/1000));
    queueClock.textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
  }
  const turnClock=root.querySelector('[data-turn-clock]');
  if(turnClock && view?.match.turnDeadlineAt) {
    const left=Math.max(0,Math.ceil((view.match.turnDeadlineAt-Date.now()-clockOffset)/1000));
    turnClock.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
  }
}
function renderMatch() {
  if (!view || !isOpen()) return;
  const {match:m,seat} = view;
  const mine = isMyTurn(m,seat);
  const otherLabel = m.mode==='friend'?'Друг':'Соперник';
  const oldStage = ui.content.querySelector('[data-online-stage]')?.dataset.onlineStage;
  const oldScroll = root.scrollTop;
  const focused = document.activeElement?.dataset;
  const focusAction = focused?.action, focusId = focused?.id;
  const newDuel = lastRenderedRoom===room && m.version>lastRenderedVersion &&
    ((m.events||[]).some(event=>event.version>lastRenderedVersion && event.duel) ||
      (m.lastDuel && Number(m.lastDuel.version)>lastRenderedVersion));
  if(lastRenderedRoom!==room) {lastRenderedRoom=room;lastRenderedVersion=-1;duelExpanded=false;}
  if(newDuel) duelExpanded=true;
  lastRenderedVersion=Math.max(lastRenderedVersion,Number(m.version)||0);
  const matchCount = m.matchNumber || 1;
  const phase = {
    waiting:'Ожидание друга', draft:'Драфт', prime:'Форма Прайм', arena:'Выбор арены',
    battle_roll:'Жребий боя', battle:'Битва', match_end:'Матч завершён', series_end:'Серия завершена'
  }[m.stage] || 'Матч';
  const team = (list,selectable,primeMode) => list.map(item=>
    card(item,selectable,selectable && (primeMode?primeSelection.has(item.id):battleSelection===item.id))
  ).join('') || '<p class="online-empty">Команда ещё не собрана</p>';
  const primeChoose = m.stage==='prime' && mine && m.primeRolled;
  const placeChoose = m.stage==='battle' && mine;
  const rolledArena=arena(m.arenaId);
  const arenaImage=rolledArena?.background?`<img src="${escapeHtml(rolledArena.background)}" alt="">`:'';
  let body = '';
  if (m.stage === 'waiting') body = `<div class="online-focus"><span class="online-step">ИГРА С ДРУГОМ</span><h2>Пригласите второго игрока</h2>
    <p>Отправьте код комнаты другу. Он входит через другой аккаунт VK или ОК и вводит код в разделе «Играть онлайн».</p>
    <div class="online-code">${escapeHtml(room)}</div>${button('copy','Скопировать код')}</div>`;
  if (m.stage === 'draft') {
    const entry=fighter(m.currentCard);
    body = `<div class="online-focus"><span class="online-step">КАРТА ${m.draftIndex+1} ИЗ 10</span>
      <h2>${mine?'Вы решаете, кому достанется боец':`${otherLabel} выбирает бойца`}</h2>
      <p>Команды обоих игроков обновляются после каждого выбора.</p>
      <div class="online-draft-card">${entry?card({id:entry.id,state:0,prime:false}):''}</div>
      ${mine?`<div class="online-actions">${button('keep','Оставить себе')}${button('pass',`Отдать ${m.mode==='friend'?'другу':'сопернику'}`,false,'online-btn-secondary')}</div>`:
      '<p>Ждём ход другого игрока. Ваши бойцы всегда видны выше и ниже.</p>'}</div>`;
  }
  if (m.stage === 'prime') {
    const count=m.primeCounts[seat];
    body=!mine?`<div class="online-focus"><span class="online-step">ФОРМА ПРАЙМ</span><h2>${otherLabel} назначает Прайм</h2>
        <p>${m.primesDone[seat]?'Ваши формы сохранены. Ждём выбора соперника.':'Ваш ход начнётся после выбора другого игрока.'}</p></div>`:
      !m.primeRolled?`<div class="online-focus"><span class="online-step">ФОРМА ПРАЙМ</span><h2>Узнайте количество усиленных бойцов</h2>
        <p>Сервер определит, сколько бойцов можно назначить в форму Прайм.</p>${button('roll_prime','Бросить кубик')}</div>`:
      `<div class="online-focus"><span class="online-step">ВЫПАЛО: ${count}</span><h2>Назначьте Прайм</h2>
        <p>Выберите ${count} бойцов ниже: ${primeSelection.size} из ${count} отмечено.</p></div>`;
  }
  if (m.stage === 'arena') body = `<div class="online-focus"><span class="online-step">АРЕНА</span>
    <h2>${mine?'Определите арену':`${otherLabel} определяет арену`}</h2>
    <p>Жребий проходит на сервере. Победитель матча будет рассчитан с учётом выпавшей арены.</p>
    ${mine?button('spin_arena','Крутить колесо'):'<p>Ожидаем результат жеребьёвки.</p>'}</div>`;
  if (m.stage === 'battle_roll') body = `<div class="online-focus"><span class="online-step">АРЕНА ВЫПАЛА</span>
    ${arenaImage?`<div class="online-arena-picture">${arenaImage}</div>`:''}<h2>${escapeHtml(arenaName(m.arenaId))}</h2>
    <p>${escapeHtml(rolledArena?.shortDescription||'Жребий определит, кто выставит бойца первым.')}</p>
    ${m.startingPlayer===seat?button('roll_battle','Бросить кубики'):`<p>${otherLabel} проводит жребий порядка выхода.</p>`}</div>`;
  if (m.stage === 'battle') {
    const theirPlacement=m.placements[1-seat];
    const myPlacement=m.placements[seat];
    const actionHint=mine?(theirPlacement!==null?`${otherLabel} выставил бойца ${fighterName(theirPlacement)}. Выберите контрпик ниже.`:
      'Выберите бойца из своей команды ниже и подтвердите выход.'):
      (myPlacement!==null?`Вы выставили ${fighterName(myPlacement)}. ${otherLabel} выбирает ответ.`:
      `${otherLabel} выбирает первого бойца. Следите за командами.`);
    body = `<div class="online-focus online-battle-focus">${arenaImage?`<div class="online-battle-backdrop" aria-hidden="true">${arenaImage}</div>`:''}
      <span class="online-step">ДУЭЛЬ ${m.round}</span>
      <h2>${mine?'Ваш ход: выставьте бойца':`${otherLabel} выставляет бойца`}</h2>
      <p>${escapeHtml(actionHint)}</p>
      ${m.battleRoll?`<div class="online-roll-result">Жребий: вы ${m.battleRoll[seat]} · соперник ${m.battleRoll[1-seat]}</div>`:''}
      ${theirPlacement!==null?`<div class="online-counterpick"><span>УЖЕ ВЫСТАВЛЕН</span>${card(opponent(m,seat).find(item=>item.id===theirPlacement)||{id:theirPlacement,state:0,prime:false})}</div>`:''}
    </div>`;
  }
  if (m.stage === 'match_end' || m.stage === 'series_end') {
    const series=m.stage==='series_end';
    const won=(series?m.seriesWinner:m.matchWinner)===seat;
    const result=m.ratingResult;
    const delta=result?.delta?.[seat]||0;
    const reason=series&&m.lastAction?.type==='timeout'?
      (won?'У соперника истекло время хода.':'Время вашего хода истекло.'):
      series&&m.lastAction?.type==='surrender'?(won?'Соперник сдался.':'Вы сдались.') : '';
    const ratingText=!m.ranked||!series?'':!m.ratingFinalized?
      '<p>Сервер сохраняет результат серии и рейтинг…</p>':result?.rated?
      `<div class="online-result-rating">Ваш PvP-рейтинг: <b>${result.after[seat]}</b> <strong>${delta>0?'+':''}${delta}</strong><span class="online-rank-title">${rankTitle(result.after[seat])}</span></div>`:
      '<p>Повторная встреча: рейтинг не изменился.</p>';
    body=`<div class="online-focus online-finish"><span class="online-step">${series?'СЕРИЯ ДО ПЯТИ ПОБЕД':'МАТЧ'}</span>
      <h2>${won?'Победа!':'Поражение'}</h2><p>${reason||(series?'Серия завершена.':'Матч завершён. Следующий начнётся, когда оба игрока будут готовы.')}</p>
      ${ratingText}${m.ready[seat]?'<p>Вы готовы. Ждём соперника.</p>':button('ready',series&&m.ranked?'Реванш без рейтинга':series?'Новая серия':'Следующий матч',series&&m.ranked&&!m.ratingFinalized)}
      ${series&&m.mode!=='friend'?button('search_again','Найти нового соперника',false,'online-btn-secondary'):''}
    </div>`;
  }
  const modeLabel=m.mode==='matchmaking'?(m.ratingEligible?'РЕЙТИНГОВАЯ СЕРИЯ':'ВСТРЕЧА БЕЗ РЕЙТИНГА'):
    m.mode==='rematch'?'РЕВАНШ БЕЗ РЕЙТИНГА':'ИГРА С ДРУГОМ · БЕЗ РЕЙТИНГА';
  const history=(Array.isArray(m.events)?m.events:[]).filter(event=>event.matchNumber===m.matchNumber)
    .map(event=>eventLine(event,seat)).filter(Boolean).slice(-8).reverse();
  const ownList=own(m,seat),theirList=opponent(m,seat);
  ui.content.innerHTML = `<section class="online-board" data-online-stage="${escapeHtml(m.stage)}">
    <div class="online-score"><div class="online-score-side"><small>ВЫ</small><b>${m.wins[seat]}</b></div>
      <div class="online-score-center"><b>Победы в серии</b><span>Матч ${matchCount} · ${phase}</span><small>${modeLabel}</small></div>
      <div class="online-score-side"><small>${otherLabel.toUpperCase()}</small><b>${m.wins[1-seat]}</b></div></div>
    <div class="online-roomline">${m.mode==='friend'?`<span>Комната <b>${escapeHtml(room)}</b></span>${button('copy','Копировать код',false,'online-btn-small')}`:
      `<span>Матч с соперником</span>`}<span class="online-presence" data-online-presence>${presence===false?'Соперник переподключается':presence===true?'Соперник в сети':''}</span></div>
    ${m.turnDeadlineAt?`<div class="online-turn-clock">${mine?'ВАШ ХОД':'ХОД СОПЕРНИКА'} · осталось <b data-turn-clock>03:00</b></div>`:''}
    <div class="online-mini-score">${miniTeam(ownList,'Ваши бойцы','own')}${miniTeam(theirList,`Бойцы ${m.mode==='friend'?'друга':'соперника'}`,'other')}</div>
    ${m.arenaId?`<div class="online-arena">${escapeHtml(arenaName(m.arenaId))}</div>`:''}
    <div class="online-main-grid">
      <section class="online-own-team online-team-panel"><h3>Ваши бойцы <small>${ownList.filter(c=>c.state<4).length} в строю</small></h3>
      <div class="online-roster">${team(ownList,primeChoose||placeChoose,primeChoose)}</div>
      ${primeChoose?`<div class="online-team-action">${button('choose_prime','Подтвердить Прайм',primeSelection.size!==m.primeCounts[seat])}</div>`:''}
      ${placeChoose?`<div class="online-team-action">${button('confirm_place','Подтвердить выход бойца',battleSelection===null)}</div>`:''}</section>
      <div class="online-center">${renderDuel(m.lastDuel)}${body}</div>
      <section class="online-other-team online-team-panel"><h3>Бойцы ${m.mode==='friend'?'друга':'соперника'} <small>${theirList.filter(c=>c.state<4).length} в строю</small></h3>
      <div class="online-roster">${team(theirList,false,false)}</div></section>
    </div>
    ${history.length?`<details class="online-event-log"><summary>Ход текущего матча</summary><ol>${history.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ol></details>`:''}
    <footer class="online-footer">${!['waiting','series_end'].includes(m.stage)?button('surrender','Сдаться',false,'online-btn-danger'):
      button('new_room','Выйти из комнаты',false,'online-btn-secondary')}</footer>
  </section>`;
  if(pending) ui.content.querySelectorAll('[data-action]').forEach(element=>{
    if(element.dataset.action!=='toggle_duel') element.disabled=true;
  });
  if(oldStage===m.stage && !newDuel) {
    root.scrollTop=oldScroll;
    if(focusAction) {
      const selected=[...ui.content.querySelectorAll('[data-action]')].find(element=>
        element.dataset.action===focusAction && (focusId==null || element.dataset.id===focusId));
      if(selected && !selected.disabled) selected.focus({preventScroll:true});
    }
  } else root.scrollTop=0;
  updateClocks();
}

async function api(path, payload, authorized = true) {
  const headers = {'Content-Type':'application/json'};
  if (authorized) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(endpoint + path,{method:'POST',headers,body:JSON.stringify(payload || {})});
  let result;
  try { result = await response.json(); } catch { throw new Error('Сервер вернул непонятный ответ'); }
  if (!response.ok) throw new Error(result.error || 'Сервер недоступен');
  return result;
}
async function apiGet(path) {
  const response=await fetch(endpoint+path,{headers:{Authorization:`Bearer ${token}`}});
  const result=await response.json();
  if(!response.ok) throw new Error(result.error||'Сервер недоступен');
  return result;
}
async function authenticate(force = false) {
  if (token && !force) return;
  const params = new URLSearchParams(location.search);
  const debugPlayer = local && /^\d+$/.test(params.get('debugPlayer') || '') ? params.get('debugPlayer') : undefined;
  const result = await api('/session',{launch:location.search, ...(debugPlayer?{debugPlayer}:{})},false);
  token = result.token;
}
async function refreshProfile() {
  if(!endpoint) return;
  await authenticate();
  profile=await apiGet('/rating/me');
  if(isOpen() && !view && !queueing) renderLobby();
}
function stopQueue() {
  queueing=false;queueSince=null;
  clearTimeout(queueTimer);queueTimer=null;
  sessionStorage.removeItem(searchKey);
}
async function handleQueue(response) {
  if(Number.isFinite(response.serverNow)) clockOffset=response.serverNow-Date.now();
  if(response.status==='matched') {
    stopQueue();
    pending=false;
    await enterRoom(response.room,false);
  } else if(response.status==='waiting') {
    queueing=true;queueSince=response.since||Date.now();
    sessionStorage.setItem(searchKey,'1');
    pending=false;renderQueue();
    clearTimeout(queueTimer);
    queueTimer=setTimeout(pollQueue,3000);
  } else {
    stopQueue();pending=false;renderLobby();
    setStatus(response.status==='expired'?'Пока соперников нет. Попробуйте ещё раз.':'Поиск был прерван. Нажмите «Искать матч» снова.');
  }
}
async function pollQueue() {
  if(!queueing) return;
  try {
    await handleQueue(await apiGet('/queue/status'));
  } catch(error) {
    setError(`Поиск временно недоступен: ${error.message}`);
    if(queueing) queueTimer=setTimeout(async()=>{
      try { await authenticate(true); pollQueue(); }
      catch { queueTimer=setTimeout(pollQueue,5000); }
    },5000);
  }
}
async function startSearch() {
  if(pending||queueing) return;
  pending=true;setError('');setStatus('Подключаем поиск игроков…');
  try {
    if(!endpoint) throw new Error('Адрес сервера пока не задан');
    await authenticate();
    await handleQueue(await api('/queue/join'));
    if(queueing) setStatus('Поиск соперника запущен');
  } catch(error) {pending=false;setStatus('Нет подключения');setError(error.message);}
}
async function cancelSearch() {
  if(!queueing) return;
  stopQueue();renderLobby();setStatus('Поиск остановлен');
  try { await api('/queue/cancel'); }
  catch(error) {
    setError(error.message);
    // If a match was created just before cancellation, restore the assignment.
    const status=await apiGet('/queue/status').catch(()=>null);
    if(status?.status==='matched') await handleQueue(status);
  }
}
function resetRoom() {
  clearTimeout(reconnectTimer);socket?.close(1000,'Left room');socket=null;
  room=null;view=null;pending=false;connecting=false;presence=null;
  battleSelection=null;primeSelection.clear();duelExpanded=false;lastRenderedRoom=null;lastRenderedVersion=-1;
  sessionStorage.removeItem(storageKey);
  renderLobby();setStatus('Выберите следующую игру');
  refreshProfile().catch(error=>setError(error.message));
}
function connectSocket() {
  if (!room || !isOpen() || closed || socket?.readyState === WebSocket.OPEN || connecting) return;
  connecting = true;
  setStatus('Подключаемся к матчу…');
  const url = new URL(endpoint + `/room/${room}/ws`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(url,['soul-online-v1',`token.${token}`]);
  socket = ws;
  const connectedRoom=room;
  ws.onopen = () => {
    if(socket!==ws || room!==connectedRoom) return;
    connecting=false; setStatus('Соединение установлено'); setError('');
  };
  ws.onmessage = event => {
    if(socket!==ws || room!==connectedRoom) return;
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'error') { pending=false; setError(message.error);renderMatch(); }
      if (message.type === 'presence') {
        presence=message.opponentConnected;
        const label=root.querySelector('[data-online-presence]');
        if(label) label.textContent=presence?'Соперник в сети':'Соперник переподключается';
      }
      if (message.type === 'snapshot') {
        if(!message.match || !Number.isInteger(message.match.version) ||
          (view?.match && message.match.version<view.match.version)) return;
        if(Number.isFinite(message.serverNow)) clockOffset=message.serverNow-Date.now();
        const prior=view?.match;
        if (prior?.stage !== message.match.stage || prior?.turn !== message.match.turn) primeSelection.clear();
        if (prior?.stage !== message.match.stage || prior?.turn !== message.match.turn ||
          prior?.round !== message.match.round) battleSelection=null;
        view={match:message.match,seat:message.seat};
        pending=false; setError('');
        setStatus(message.match.stage==='waiting'?'Ожидаем друга':
          message.match.stage==='series_end'?'Серия завершена':
          message.match.stage==='match_end'?'Матч завершён':
          message.match.turn===message.seat?'Ваш ход':'Ждём соперника');
        renderMatch();
        if(message.match.stage==='series_end' && message.match.ratingFinalized &&
          (!prior || !prior.ratingFinalized || prior.stage!=='series_end'))
          refreshProfile().catch(()=>{});
      }
    } catch {pending=false;renderMatch();setError('Сервер отправил некорректное сообщение'); }
  };
  ws.onclose = () => {
    if (socket !== ws) return;
    socket=null; connecting=false; pending=false;
    if (closed || !isOpen()) return;
    setStatus('Соединение прервалось; восстанавливаем…');
    clearTimeout(reconnectTimer);
    reconnectTimer=setTimeout(async () => {
      try { await authenticate(true); connectSocket(); }
      catch(error) { setError(error.message); reconnectTimer=setTimeout(connectSocket,5000); }
    },2500);
  };
  ws.onerror = () => setStatus('Проверяем подключение…');
}
async function enterRoom(code, create=false) {
  if (pending) return;
  pending=true; setError(''); setStatus('Проверяем соединение с сервером…');
  try {
    if (!endpoint) throw new Error('Адрес сервера пока не задан');
    await authenticate();
    const path=create?'/room/create':`/room/${code}/join`;
    let result;
    try { result=await api(path); }
    catch(error) {
      if(!/Сеанс истёк/.test(error.message)) throw error;
      await authenticate(true);
      result=await api(path);
    }
    if(Number.isFinite(result.serverNow)) clockOffset=result.serverNow-Date.now();
    room = create?result.room:code;
    sessionStorage.setItem(storageKey,room);
    view=result; closed=false; pending=false; presence=null; renderMatch(); connectSocket();
  } catch(error) { pending=false; setStatus('Нет подключения'); setError(error.message); }
}
function sendAction(action) {
  if (pending || socket?.readyState !== WebSocket.OPEN || !view) { setError('Подождите соединения с сервером'); return; }
  pending=true; setError('');setStatus('Отправляем ход на сервер…');renderMatch();
  try { socket.send(JSON.stringify({type:'action',action:{...action,version:view.match.version}})); }
  catch {pending=false;renderMatch();setError('Не удалось отправить ход. Проверяем соединение.');}
}
function leave() {
  if(queueing) {stopQueue();api('/queue/cancel').catch(()=>{});}
  root.classList.add('hidden'); closed=true;pending=false;clearTimeout(reconnectTimer);
  socket?.close(1000,'Closed by player'); socket=null; connecting=false;
  window.closeGameModeSelect?.();
}
window.openOnlineArena = function() {
  window.closeGameModeSelect?.();
  root.classList.remove('hidden'); closed=false; setError('');
  if (view && room) { renderMatch(); connectSocket(); return; }
  renderLobby();
  if(!secondTimer) secondTimer=setInterval(updateClocks,1000);
  const saved = sessionStorage.getItem(storageKey);
  if (saved && roomPattern.test(saved) && endpoint) enterRoom(saved);
  else if(sessionStorage.getItem(searchKey) && endpoint) {
    queueing=true;renderQueue();
    authenticate().then(pollQueue).catch(error=>{stopQueue();renderLobby();setError(error.message);});
  } else {
    setStatus(endpoint?'Проверяем ваш PvP-профиль…':'Ожидается адрес опубликованного сервера');
    refreshProfile().then(()=>setStatus('Готово к поиску соперника')).catch(error=>setError(error.message));
  }
};
root.addEventListener('submit',event => {
  if (event.target.id !== 'online-join-form') return;
  event.preventDefault();
  const code = root.querySelector('#online-room-code').value.toUpperCase().trim();
  if (!roomPattern.test(code)) return setError('Код комнаты должен состоять из десяти символов');
  enterRoom(code);
});
root.addEventListener('click',event => {
  const target = event.target.closest('[data-action]');
  if (!target || !root.contains(target)) return;
  const action = target.dataset.action;
  if (action==='close') return leave();
  if (action==='search') return startSearch();
  if (action==='cancel_search') return cancelSearch();
  if (action==='ranking') {
    (async()=>{
      try {
        await authenticate();
        leaderboard=(await apiGet('/rating/top')).top;
        if(!view) queueing?renderQueue():renderLobby();
      }
      catch(error) {setError(error.message);}
    })();
    return;
  }
  if (action==='create') return enterRoom(null,true);
  if (action==='copy') {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(room).then(()=>setStatus('Код скопирован')).catch(()=>setStatus(`Копирование недоступно. Удерживайте код ${room} и скопируйте его вручную.`));
    else setStatus(`Удерживайте код ${room} и скопируйте его вручную.`);
    return;
  }
  if (!view) return;
  const m = view.match;
  if (action==='search_again') {
    if(m.ranked && !m.ratingFinalized) return setError('Подождите сохранения рейтинга');
    resetRoom();startSearch();return;
  }
  if (action==='new_room') {
    resetRoom();return;
  }
  if (action==='toggle_duel') {
    duelExpanded=!duelExpanded;renderMatch();return;
  }
  if (action==='select') {
    const id = Number(target.dataset.id);
    if (m.stage==='battle' && m.turn===view.seat) {
      battleSelection=battleSelection===id?null:id;renderMatch();return;
    }
    if (m.stage==='prime') {
      if (primeSelection.has(id)) primeSelection.delete(id);
      else if (primeSelection.size < m.primeCounts[view.seat]) primeSelection.add(id);
      renderMatch();
    }
    return;
  }
  if (action==='confirm_place' && m.stage==='battle' && m.turn===view.seat &&
    m.teams[view.seat].some(item=>item.id===battleSelection && item.state<4))
    return sendAction({type:'place',id:battleSelection});
  if (action==='choose_prime') return sendAction({type:action,ids:[...primeSelection]});
  if (action==='keep' || action==='pass') return sendAction({type:'draft',choice:action});
  if (action==='surrender' && !window.confirm('Сдаться и отдать победу в серии сопернику?')) return;
  if (['roll_prime','spin_arena','roll_battle','ready','surrender'].includes(action)) sendAction({type:action});
});
