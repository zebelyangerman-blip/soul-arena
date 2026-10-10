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
      <button type="button" class="online-close" data-action="close" aria-label="Закрыть онлайн-арену">${window.SOUL_ARENA_ICONS?.svg('close',{size:20})||'×'}</button>
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
let queueing = false, queueSince = null, queueTimer = null, profile = null, leaderboard = null, queuePolicy = null;
let leaderboardIndexing=false;
let presence = null, secondTimer = null, clockOffset = 0;
let duelExpanded = false, lastRenderedRoom = null, lastRenderedVersion = -1;
const timing={http:10000,profile:3500,profileAuth:4500,profileRetry:1000,profileRetryMax:15000,queuePoll:4000,queueRetryBase:700,queueStartRetry:500,connect:9000,ack:7000,heartbeat:15000,searchMax:90000,queueRecovery:18000,roomRecovery:30000,watchdogTick:500,roomRetry:700,autoStage:850,...(local?window.SOUL_ARENA_NETWORK_TIMING||{}:{})};
const actionKey='soulArenaPendingActionR81';
const authStorageKey='soulArenaSessionR81';
const profileStorageKey='soulArenaVerifiedProfileR83';
const launchParams=new URLSearchParams(location.search);
const launchIdentity=launchParams.get('logged_user_id')?'ok:'+launchParams.get('logged_user_id'):
  launchParams.get('vk_user_id')?(launchParams.get('vk_client')==='ok'?'ok:':'vk:')+launchParams.get('vk_user_id'):
  local&&launchParams.get('debugPlayer')?'vk:'+launchParams.get('debugPlayer'):null;
let authFlight=null,expiresAt=0,profileFlight=null,profileRetryTimer=null;
let profileFresh=false,profileRevision=0;
try{const saved=JSON.parse(sessionStorage.getItem(authStorageKey)||'null');if(saved?.endpoint===endpoint && launchIdentity && saved.userId===launchIdentity && saved.expiresAt>Date.now()+30_000){token=saved.token;expiresAt=saved.expiresAt;}}catch{}
try{
  const saved=JSON.parse(localStorage.getItem(profileStorageKey)||'null');
  if(launchIdentity && saved?.endpoint===endpoint && saved.userId===launchIdentity &&
    Number.isFinite(saved.verifiedAt) && saved.verifiedAt<=Date.now() && Date.now()-saved.verifiedAt<7*86400_000 && validProfile(saved.profile))profile=saved.profile;
}catch{}
let socketTimer=null,heartbeatTimer=null,lastSocketMessage=0,reconnectAttempt=0;
let pendingAction=null,actionTimer=null,queueSocket=null,queueSocketTimer=null,queueHeartbeat=null;
let enteringRoom=false,profileRetries=0,queueGeneration=0;
const assignmentStorageKey='soulArenaAssignmentR85';
let queueFlight=null,queueAbort=null,queueDeadlineTimer=null,queueHardDeadline=0;
let queueFailureSince=0,queueRetryCount=0,queueSearchId=null,searchRequestedAt=0;
let roomAbort=null,roomGeneration=0,assignedCode=null,networkPhase='idle';
let socketRecoverySince=0,socketRecoveryTimer=null,socketRecoveryStopped=false,socketRecoveryEpoch=0;
let autoStageTimer=null,autoStageKey=null;
let autoStages=true;try{autoStages=localStorage.getItem('soulArenaAutoStagesR85')!=='0';}catch{}
const diagnostics={build:'R87.0',serverBuild:null,phase:'idle',queueFailures:0,lastFailure:null};
window.SOUL_ARENA_ONLINE_DIAGNOSTICS=Object.freeze({snapshot:()=>({...diagnostics,
  phase:networkPhase,searchAgeMs:searchRequestedAt?Math.max(0,Date.now()-searchRequestedAt):0})});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const requestId=()=>window.crypto?.randomUUID?.()||`r81-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function clearAction(){pendingAction=null;pending=false;clearTimeout(actionTimer);actionTimer=null;sessionStorage.removeItem(actionKey);}
function clearSocketTimers(){clearTimeout(socketTimer);clearInterval(heartbeatTimer);socketTimer=null;heartbeatTimer=null;}

function setStatus(value) { status = value; ui.connection.textContent = value; }
function networkState(phase,message) {
  networkPhase=phase;diagnostics.phase=phase;root.dataset.networkPhase=phase;
  if(message)setStatus(message);
}
function rememberRoom(code) {
  if(!roomPattern.test(code||''))return;
  assignedCode=code;
  try{sessionStorage.setItem(storageKey,code);sessionStorage.setItem(assignmentStorageKey,
    JSON.stringify({endpoint,userId:launchIdentity,room:code,at:Date.now()}));}catch{}
}
function savedRoom() {
  try {
    const saved=JSON.parse(sessionStorage.getItem(assignmentStorageKey)||'null');
    if(saved) {
      if(saved.endpoint===endpoint&&saved.userId===launchIdentity&&roomPattern.test(saved.room||''))return saved.room;
      sessionStorage.removeItem(assignmentStorageKey);sessionStorage.removeItem(storageKey);return null;
    }
    const legacy=sessionStorage.getItem(storageKey);return roomPattern.test(legacy||'')?legacy:null;
  }catch{return null;}
}
function persistSearch() {
  try{sessionStorage.setItem(searchKey,JSON.stringify({endpoint,userId:launchIdentity,
    searchId:queueSearchId,startedAt:searchRequestedAt,hardDeadline:queueHardDeadline}));}catch{}
}
function searchStatusPath() {
  // Older Workers ignore the query string; R85 uses it to reject late searches.
  return '/queue/status'+(queueSearchId?'?searchId='+encodeURIComponent(queueSearchId):'');
}
function armQueueWatchdog() {
  clearTimeout(queueDeadlineTimer);
  if(!queueing)return;
  const now=Date.now();
  if(now>=queueHardDeadline || queueFailureSince&&now-queueFailureSince>=timing.queueRecovery) {
    const unavailable=Boolean(queueFailureSince);
    const ticket=queueSearchId;
    stopQueue();pending=false;networkState('failed',unavailable?'Поиск остановлен: соединение не восстановилось':'Поиск завершён без назначения матча');renderLobby();
    setError(unavailable?'Сервер не подтвердил поиск вовремя. Попробуйте снова или начните тренировку.':'Сервер не назначил соперника за время поиска. Можно повторить поиск или начать тренировку.');
    if(token)api('/queue/cancel',{searchId:ticket},true,{attempts:1}).catch(()=>{});
    return;
  }
  queueDeadlineTimer=setTimeout(armQueueWatchdog,timing.watchdogTick);
}
function scheduleQueuePoll(delay=timing.queuePoll) {
  clearTimeout(queueTimer);
  if(queueing&&!closed)queueTimer=setTimeout(pollQueue,Math.max(10,delay));
}
function scheduleAutoStages() {
  clearTimeout(autoStageTimer);autoStageTimer=null;
  const m=view?.match;if(!autoStages||pending||!m||!isOpen()||closed||document.hidden)return;
  let type;
  if(m.turn===view.seat&&m.stage==='prime'&&!m.primeRolled)type='roll_prime';
  else if(m.turn===view.seat&&m.stage==='arena')type='spin_arena';
  else if(m.startingPlayer===view.seat&&m.stage==='battle_roll')type='roll_battle';
  if(!type)return;
  const key=`${room}:${m.version}:${type}`;if(autoStageKey===key)return;
  autoStageTimer=setTimeout(()=>{
    if(!isOpen()||closed||document.hidden||pending||view?.match.version!==m.version)return;
    if(window.SOUL_ARENA_VISUALS?.busy){scheduleAutoStages();return;}
    autoStageKey=key;sendAction({type});
  },timing.autoStage);
}
function armSocketRecovery() {
  clearTimeout(socketRecoveryTimer);
  if(closed||!room||!isOpen())return;
  socketRecoverySince ||= Date.now();
  socketRecoveryTimer=setTimeout(()=>{
    if(closed||!isOpen()||!socketRecoverySince)return;
    socketRecoveryStopped=true;socketRecoveryEpoch++;
    clearTimeout(reconnectTimer);clearSocketTimers();connecting=false;
    const old=socket;socket=null;old?.close(4000,'Recovery deadline');
    networkState('failed','Матч сохранён · требуется восстановить подключение');
    setError('Связь с матчем не восстановилась вовремя. Нажмите «Восстановить соединение».');
    renderMatch();
  },Math.max(10,timing.roomRecovery-(Date.now()-socketRecoverySince)));
}
function setError(value) {
  ui.error.textContent = value || '';
  ui.error.classList.toggle('hidden', !value);
}
function isOpen() { return !root.classList.contains('hidden'); }
function validProfile(value) {
  return value && Number.isSafeInteger(value.rating) && value.rating>=0 &&
    Number.isSafeInteger(value.wins) && value.wins>=0 && Number.isSafeInteger(value.losses) && value.losses>=0 &&
    (value.history===undefined || Array.isArray(value.history)) &&
    (!value.playerId || !launchIdentity || value.playerId===launchIdentity);
}
function acceptProfile(value) {
  if(!validProfile(value))throw Object.assign(new Error('Сервер вернул некорректный профиль'),{retryable:true});
  profile={...value};profileFresh=true;profileRevision++;profileRetries=0;
  clearTimeout(profileRetryTimer);profileRetryTimer=null;
  if(launchIdentity)try{localStorage.setItem(profileStorageKey,JSON.stringify({endpoint,userId:launchIdentity,verifiedAt:Date.now(),profile}));}catch{}
  return profile;
}
function isMyTurn(match, seat) { return match.turn === seat; }
function own(match, seat) { return match.teams[seat] || []; }
function opponent(match, seat) { return match.teams[1-seat] || []; }
function fighterName(id) { return fighter(id)?.public?.name || `Боец #${id}`; }
function arena(id) { return arenaCatalog.find(a => a.id === id); }
function arenaName(id) { return arena(id)?.publicName || 'Арена'; }
function statusName(state) { return ['Свежий','Ранен','Истощён','На грани','Мёртв'][state] || '—'; }
const PVP_RANKS=Object.freeze([
  [800,'Новичок'],[1000,'Любитель'],[1200,'Боец'],[1400,'Ветеран'],[1600,'Мастер'],
  [1800,'Грандмастер'],[2000,'Чемпион'],[2200,'Легенда'],[2400,'Хранитель арены'],[2500,'Властелин арены']
].map(([floor,title])=>Object.freeze({floor,title})));
function rankTitle(rating) {
  return [...PVP_RANKS].reverse().find(r=>Number(rating)>=r.floor)?.title || 'Новичок';
}
function renderRankProgress(value) {
  if(!value)return '';
  const score=Number(value.rating ?? 800);
  let index=0;for(let i=1;i<PVP_RANKS.length;i++)if(score>=PVP_RANKS[i].floor)index=i;
  const current=PVP_RANKS[index],next=PVP_RANKS[index+1];
  const percent=next?Math.max(0,Math.min(100,(score-current.floor)/(next.floor-current.floor)*100)):100;
  return `<div class="r82-rank-progress"><div><b>${escapeHtml(current.title)}</b><small>${next?`До «${escapeHtml(next.title)}»: ${Math.max(0,next.floor-score)} Elo`:'Высшее звание арены'}</small></div><div class="r82-rank-track" role="progressbar" aria-label="Прогресс звания" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(percent)}"><i style="width:${percent}%"></i></div></div>
    <details class="r82-rank-list"><summary>Все звания</summary><div>${PVP_RANKS.map(r=>`<span class="${r===current?'is-current':''}"><b>${r.floor}</b>${escapeHtml(r.title)}</span>`).join('')}</div><p>Рейтинг меняется за рейтинговую серию до пяти побед. При равном Elo: 5:4 — +16, 5:3 — +18, 5:2 — +20, 5:1 — +22, 5:0 — +24. Соперник теряет столько же. Сдача и тайм-аут — без бонуса за счёт. Комнаты с другом и реванши не изменяют рейтинг.</p></details>`;
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
  return `<button type="button" data-fighter-id="${item.id}" data-id="${item.id}" data-state="${item.state}" class="online-fighter ${item.prime?'is-prime':''} r81-damage-card online-state-${item.state} ${inactive?'is-out':''} ${selected?'is-selected':''}"
      ${selectable&&!inactive?'data-action="select"':'disabled'}>
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
    list.length?list.map(item=>`<span data-fighter-id="${item.id}" data-state="${item.state}" class="online-mini-fighter r81-damage-card ${item.state>=4?'is-out':''} ${item.prime?'is-prime':''}"
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
  root.classList.remove('online-in-match');
  const recovery=assignedCode||savedRoom();
  const savedCode=root.querySelector('#online-room-code')?.value;
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem r82-online-gate" aria-hidden="true"><svg width="35" height="35" viewBox="0 0 40 40" fill="none"><path d="M20 4L32 12V28L20 36L8 28V12Z" stroke="currentColor" stroke-width="1.5"/><path d="M20 10V30M12 16L28 24M28 16L12 24" stroke="currentColor" stroke-width="2"/></svg></div><h2>Найти соперника</h2>
    <p>Подбираем соперника близкого уровня. Полная серия — до пяти побед.</p>
    <div class="online-my-rating">Ваш рейтинг <b>${profile?.rating ?? '—'}</b>
      ${profile?`<span class="online-rank-title">${rankTitle(profile.rating)}</span>`:''}
      <small>${profile?`${profile.wins} побед · ${profile.losses} поражений`: 'Появится после входа через VK/ОК'}</small>
      ${profile?`<small data-profile-freshness>${profileFresh?'Подтверждено сервером':'Сохранённые данные · сверяем с сервером'}</small>`:''}</div>
    ${renderRankProgress(profile)}
    ${profile?.history?.length?`<div class="online-history"><strong>Последние серии</strong>${profile.history.slice(0,3).map(x=>`<span>${x.won?'Победа':'Поражение'} · ${escapeHtml(formatPlayer(x.opponent,x.opponentName))} <b>${x.delta>0?'+':''}${x.delta}</b></span>`).join('')}</div>`:''}
    ${recovery?`<div class="online-recovery-note"><p>Назначенный матч сохранён. Можно восстановить подключение.</p>${button('resume_room','ВЕРНУТЬСЯ В МАТЧ')}</div>`:''}
    ${endpoint?button('search',recovery?'Проверить следующий матч':'В БОЙ'): '<p class="online-note">Сервер ещё не подключён.</p>'}
    <details class="online-mode-rules"><summary>Рейтинг и результаты</summary><p>Рейтинг меняется по результату рейтинговой серии: победа повышает его, поражение снижает. Изменение зависит от рейтинга соперника и итогового счёта. Сдача и истечение времени хода считаются поражением. Реванш и комната с другом проходят без изменения рейтинга. Матчи без рейтинга отмечены на экране перед началом серии.</p></details>
    <label class="online-auto-option"><input type="checkbox" data-auto-stages ${autoStages?'checked':''}> Автоматический жребий</label>
    ${button('practice','Тренировка',false,'online-btn-secondary online-btn-small')}
    ${endpoint?button('ranking','Таблица лидеров',false,'online-btn-secondary online-btn-small'):''}
    ${renderRanking()}
    ${endpoint?button('retry_profile','Обновить профиль',false,'online-btn-secondary online-btn-small'):''}
    <div class="online-divider">Игра с другом по сети · без рейтинга</div>
    <p class="online-note">Создайте комнату и отправьте код другу. Он должен войти через другой аккаунт VK/ОК. Другой Wi-Fi не помешает: оба подключаются к серверу игры.</p>
    ${endpoint?button('create','Создать комнату',false,'online-btn-secondary'):''}
    <form id="online-join-form" class="online-join">
      <input id="online-room-code" type="text" inputmode="text" autocomplete="off" maxlength="10" placeholder="КОД КОМНАТЫ" aria-label="Код комнаты" ${endpoint?'':'disabled'} required>
      <button class="online-btn online-btn-secondary" type="submit" ${endpoint?'':'disabled'}>Войти</button>
    </form>
    <label class="online-visual-controls">Эффекты <select data-visual-quality aria-label="Качество эффектов"><option value="auto">AUTO</option><option value="high">Высокое</option><option value="low">Экономное</option></select></label>
    ${local?'<p class="online-note">Для локальной проверки откройте игру с параметрами <code>?debugPlayer=101</code> и <code>?debugPlayer=202</code> в разных окнах.</p>':''}
  </section>`;
  if(savedCode)root.querySelector('#online-room-code').value=savedCode;
  const qualitySelect=root.querySelector('[data-visual-quality]');if(qualitySelect)qualitySelect.value=window.SOUL_ARENA_VISUALS?.quality||'auto';
}
function renderRanking() {
  if (!leaderboard) return '';
  return `<div class="online-ranking"><h3>Топ-20 игроков</h3>${leaderboardIndexing?'<p>Переносим сохранённые рейтинги в быстрый индекс. Таблица пока предварительная — обновите её через несколько секунд.</p>':''}${leaderboard.length?
    leaderboard.map((p,i)=>`<div><span>${i+1}. ${escapeHtml(formatPlayer(p.playerId,p.displayName))}<small>${rankTitle(p.rating)} · ${p.series ?? 0} серий</small></span><b>${p.rating}</b></div>`).join(''):
    '<p>Пока нет игроков в рейтинге.</p>'}</div>`;
}
function formatPlayer(id,name) {
  if(name&&!/тихий\s+уголь|виртуальн/i.test(String(name)))return String(name);
  return 'Соперник';
}
function renderQueue() {
  if (!isOpen() || !queueing) return;
  root.classList.remove('online-in-match');
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem online-search-icon">⚔️</div><h2>Ищем соперника</h2>
    <p>${networkPhase==='authenticating'?'Проверяем подключение и ваш сеанс.':networkPhase==='recovering'?'Продолжаем подбор соперника.':'Ищем ближайшего по уровню соперника.'} Диапазон: <b data-queue-gap>±${Number(queuePolicy?.ratingGap)||200}</b> Elo.</p>
    <p class="online-note" data-bot-countdown>${botCountdownText()}</p>
    <p class="online-note" data-queue-expansion>${queueExpansionText()}</p>
    <p class="online-search-clock">В поиске: <b data-queue-clock>00:00</b></p>
    ${button('cancel_search','Отменить поиск',false,'online-btn-secondary')}
    ${button('ranking','Таблица лидеров',false,'online-btn-secondary online-btn-small')}
    ${button('practice','Перейти к тренировке',false,'online-btn-secondary online-btn-small')}
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
  const expansion=root.querySelector('[data-queue-expansion]');
  if(expansion)expansion.textContent=queueExpansionText();
  const botCountdown=root.querySelector('[data-bot-countdown]');if(botCountdown)botCountdown.textContent=botCountdownText();
  const turnClock=root.querySelector('[data-turn-clock]');
  if(turnClock && view?.match.turnDeadlineAt) {
    const left=Math.max(0,Math.ceil((view.match.turnDeadlineAt-Date.now()-clockOffset)/1000));
    turnClock.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
  }
}
function botCountdownText() {
  return 'Поиск можно отменить в любой момент.';
}
function queueExpansionText() {
  if(!queuePolicy?.nextExpansionAt)return queuePolicy?.ratingGap>=600?'Максимальный диапазон поиска: ±600 Elo.':'Проверяем очередь игроков…';
  const left=Math.max(0,Math.ceil((queuePolicy.nextExpansionAt-Date.now()-clockOffset)/1000));
  return left?`Расширение диапазона через ${left} сек.`:'Сверяем расширенный диапазон с сервером…';
}
function renderMatch() {
  if (!view || !isOpen()) return;
  root.classList.add('online-in-match');
  const {match:m,seat} = view;
  const mine = isMyTurn(m,seat);
  const participant=m.participants?.[1-seat];
  const opponentProfile=participant?{...participant,name:participant.displayName||participant.name}:null;
  const opponentName=opponentProfile?.name||(m.mode==='friend'?'Друг':'Соперник');
  const otherLabel=escapeHtml(opponentName);
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
    const actionHint=mine?(theirPlacement!==null?`${opponentName} выставил бойца ${fighterName(theirPlacement)}. Выберите контрпик ниже.`:
      'Выберите бойца из своей команды ниже и подтвердите выход.'):
      (myPlacement!==null?`Вы выставили ${fighterName(myPlacement)}. ${opponentName} выбирает ответ.`:
      `${opponentName} выбирает первого бойца. Следите за командами.`);
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
    const interrupted=series&&m.seriesEndReason==='server_error';
    const result=m.ratingResult;
    const delta=result?.delta?.[seat]||0;
    const endReason=m.seriesEndReason||m.lastAction?.type;
    const reason=series&&endReason==='timeout'?
      (won?'У соперника истекло время хода.':'Время вашего хода истекло.'):
      series&&endReason==='surrender'?(won?'Соперник сдался.':'Вы сдались.') : '';
    const ratingText=!m.ranked||!series?'':!m.ratingFinalized?
      '<p>Сервер сохраняет результат серии и рейтинг…</p>':result?.rated?
      `<div class="online-result-rating">Ваш рейтинг: <b>${result.after[seat]}</b> <strong data-change="${delta<0?'loss':delta>0?'gain':'none'}">${delta>0?'+':''}${delta}</strong><span class="online-rank-title">${rankTitle(result.after[seat])}</span></div>${won&&result.bonus>0?`<p>Бонус за уверенную победу: +${result.bonus} Elo уже включён в итог.</p>`:''}`:
      '<p>Рейтинг этой серии не изменился.</p>';
    body=`<div class="online-focus online-finish"><span class="online-step">${series?'СЕРИЯ ДО ПЯТИ ПОБЕД':'МАТЧ'}</span>
      <h2>${interrupted?'Матч остановлен':won?'Победа!':'Поражение'}</h2><p>${interrupted?'Сервер не смог продолжить серию. Поражение не засчитано; рейтинг сохранён.':reason||(series?'Серия завершена.':'Матч завершён. Следующий начнётся, когда оба игрока будут готовы.')}</p>
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
    ${opponentProfile?.name?`<details class="online-opponent-profile"><summary><span class="online-profile-avatar">${portrait(opponentProfile.avatarId)}</span><b>${escapeHtml(opponentProfile.name)}</b><span>Профиль соперника ▾</span></summary><p>Рейтинг: <b>${Number.isSafeInteger(opponentProfile.rating)?opponentProfile.rating:'—'}</b></p></details>`:''}
    ${m.turnDeadlineAt?`<div class="online-turn-clock">${mine?'ВАШ ХОД':'ХОД СОПЕРНИКА'} · осталось <b data-turn-clock>03:00</b></div>`:''}
    <div class="online-force-strip"><span>Вы <b>${ownList.filter(c=>c.state<4).length}/5</b></span><i>${m.stage==='draft'?'ОТРЯДЫ':'В СТРОЮ'}</i><span><b>${theirList.filter(c=>c.state<4).length}/5</b> ${otherLabel}</span></div>
    <div class="online-mini-score">${miniTeam(ownList,'Ваши бойцы','own')}${miniTeam(theirList,`Бойцы ${m.mode==='friend'?'друга':'соперника'}`,'other')}</div>
    ${m.arenaId?`<div class="online-arena">${escapeHtml(arenaName(m.arenaId))}</div>`:''}
    <div class="online-main-grid">
      <section class="online-own-team online-team-panel"><h3>Ваши бойцы <small>${ownList.filter(c=>c.state<4).length} в строю</small></h3>
      <div class="online-roster">${team(ownList,primeChoose||placeChoose,primeChoose)}</div>
      ${primeChoose?`<div class="online-team-action">${button('choose_prime','Подтвердить Прайм',primeSelection.size!==m.primeCounts[seat])}</div>`:''}
      ${placeChoose?`<div class="online-team-action">${button('confirm_place','Подтвердить выход бойца',battleSelection===null)}</div>`:''}</section>
      <div class="online-center">${body}${renderDuel(m.lastDuel)}</div>
      <section class="online-other-team online-team-panel"><h3>Бойцы ${m.mode==='friend'?'друга':'соперника'} <small>${theirList.filter(c=>c.state<4).length} в строю</small></h3>
      <div class="online-roster">${team(theirList,false,false)}</div></section>
    </div>
    ${history.length?`<details class="online-event-log"><summary>Ход текущего матча</summary><ol>${history.map(line=>`<li>${escapeHtml(line)}</li>`).join('')}</ol></details>`:''}
    <footer class="online-footer">${!['waiting','series_end'].includes(m.stage)?button('surrender','Сдаться',false,'online-btn-danger'):
      button('new_room','Выйти из комнаты',false,'online-btn-secondary')}${button('reconnect','Восстановить соединение',false,'online-btn-secondary online-btn-small')}</footer>
  </section>`;
  if(pending) ui.content.querySelectorAll('[data-action]').forEach(element=>{
    if(!['toggle_duel','reconnect'].includes(element.dataset.action)) element.disabled=true;
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
  scheduleAutoStages();
}

async function requestApi(path,payload,authorized,method,options={}) {
  const stablePayload={...(payload||{})};
  if(path==='/room/create')stablePayload.requestId ||= requestId();
  let renewed=false;const attempts=options.attempts??2;
  for(let attempt=0;attempt<attempts;attempt++) {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),options.timeout??timing.http);
    const relay=()=>controller.abort();options.signal?.addEventListener('abort',relay,{once:true});
    if(options.signal?.aborted)controller.abort();
    try {
      const headers={'Content-Type':'application/json',...(authorized?{Authorization:`Bearer ${token}`}:{})};
      const response=await fetch(endpoint+path,{method,headers,signal:controller.signal,...(method==='POST'?{body:JSON.stringify(stablePayload)}:{})});
      const serverBuild=response.headers?.get?.('X-Arena-Build');if(serverBuild)diagnostics.serverBuild=serverBuild;
      let result;try{result=await response.json();}catch{throw Object.assign(new Error('Сервер вернул непонятный ответ'),{retryable:true});}
      if(!response.ok) {
        if(response.status===401 && authorized && !renewed) {
          renewed=true;clearTimeout(timer);await authenticate(true,options);attempt--;continue;
        }
        throw Object.assign(new Error(result.error||'Сервис временно недоступен'),{status:response.status,code:result.code,retryAfterMs:result.retryAfterMs,retryable:response.status===429||response.status>=500});
      }
      return result;
    }catch(error){
      const aborted=error.name==='AbortError';
      if(options.signal?.aborted)throw error;
      if(aborted)error=Object.assign(new Error('Сервер не ответил вовремя. Проверяем подключение.'),{retryable:true});
      if(error instanceof TypeError)error=Object.assign(new Error('Нет связи с сервером. Проверьте интернет.'),{retryable:true});
      if(attempt===attempts-1 || !error.retryable || error.code==='SERVER_BUSY')throw error;
      clearTimeout(timer);await pause(450+Math.random()*350);
    }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',relay);}
  }
}
async function api(path,payload,authorized=true,options={}){return requestApi(path,payload,authorized,'POST',options);}
async function apiGet(path,options={}){return requestApi(path,null,true,'GET',options);}
async function authenticate(force = false,options={}) {
  if (token && !force && (!expiresAt || expiresAt>Date.now()+30_000))return;
  if(authFlight)return authFlight;
  authFlight=(async()=>{
    const params=new URLSearchParams(location.search);
    const debugPlayer=local&&/^\d+$/.test(params.get('debugPlayer')||'')?params.get('debugPlayer'):undefined;
    const result=await api('/session',{launch:location.search,includeProfile:true,...(debugPlayer?{debugPlayer}:{})},false,options);
    if(result.build)diagnostics.serverBuild=result.build;
    token=result.token;expiresAt=result.expiresAt||Date.now()+11*3600_000;
    if(launchIdentity)try{sessionStorage.setItem(authStorageKey,JSON.stringify({token,expiresAt,endpoint,userId:result.userId||launchIdentity}));}catch{}
    if(result.profile && validProfile(result.profile))acceptProfile(result.profile);
  })();
  try{return await authFlight;}finally{authFlight=null;}
}
async function refreshProfile() {
  if(!endpoint) return;
  if(profileFlight)return profileFlight;
  profileFlight=(async()=>{
    const revision=profileRevision;profileFresh=false;
    await authenticate(false,{timeout:timing.profileAuth,attempts:1});
    const result=profileFresh && profileRevision!==revision?profile:
      acceptProfile(await apiGet('/rating/me',{timeout:timing.profile,attempts:1}));
    if(isOpen() && !view && !queueing && !pending&&networkPhase==='idle'){renderLobby();setStatus('Готово к поиску соперника');setError('');}
    return result;
  })();
  try{return await profileFlight;}finally{profileFlight=null;}
}
function loadProfile() {
  clearTimeout(profileRetryTimer);profileRetryTimer=null;
  if(!endpoint || closed || !isOpen() || view || queueing || pending)return;
  networkState('idle');
  profileFresh=false;renderLobby();setStatus(profile?'Сверяем ваш профиль с сервером…':'Проверяем ваш профиль…');
  refreshProfile().catch(error=>{
    if(closed || !isOpen() || view || queueing)return;
    renderLobby();setError(error.message);
    setStatus(error.retryable?'Профиль временно недоступен · восстановим автоматически':'Перезапустите игру через VK или ОК для проверки профиля');
    if(error.retryable && !profileRetryTimer) {
      const backoff=Math.min(timing.profileRetryMax,timing.profileRetry*2**Math.min(profileRetries++,4));
      const delay=Math.max(backoff,Number(error.retryAfterMs)||0)+(local?0:Math.random()*300);
      profileRetryTimer=setTimeout(()=>{profileRetryTimer=null;if(!document.hidden)loadProfile();},delay);
    }
  });
}
function stopQueue() {
  queueGeneration++;
  queueing=false;queueSince=null;queuePolicy=null;
  clearTimeout(queueTimer);queueTimer=null;
  clearTimeout(queueDeadlineTimer);queueDeadlineTimer=null;queueAbort?.abort();queueAbort=null;queueFlight=null;
  queueFailureSince=0;queueRetryCount=0;queueSearchId=null;searchRequestedAt=0;queueHardDeadline=0;
  sessionStorage.removeItem(searchKey);
  clearTimeout(queueSocketTimer);clearInterval(queueHeartbeat);queueSocket?.close(1000,'Search complete');queueSocket=null;
}
async function handleQueue(response) {
  if(Number.isFinite(response.serverNow)) clockOffset=response.serverNow-Date.now();
  if(response.status==='matched') {
    if(enteringRoom)return;
    if(!roomPattern.test(response.room||''))throw Object.assign(new Error('Сервер не подтвердил комнату матча'),{retryable:true});
    rememberRoom(response.room);stopQueue();
    pending=false;
    await enterRoom(response.room,false);
  } else if(response.status==='waiting') {
    queueing=true;queueSince=response.since||Date.now();
    queuePolicy=response;
    queueFailureSince=0;queueRetryCount=0;setError('');networkState('queued','Поиск соперника подтверждён сервером');
    if(Number.isFinite(response.expiresAt))queueHardDeadline=Math.min(queueHardDeadline||Infinity,response.expiresAt-clockOffset);
    if(response.profile && validProfile(response.profile))acceptProfile(response.profile);
    clearTimeout(profileRetryTimer);profileRetryTimer=null;
    persistSearch();armQueueWatchdog();
    pending=false;renderQueue();
    clearTimeout(queueTimer);
    connectQueueSocket();
    // Polling also re-evaluates waiting pairs when their rating windows widen.
    scheduleQueuePoll(Math.min(timing.queuePoll,Math.max(10,Number(response.pollAfterMs)||timing.queuePoll)));
  } else {
    stopQueue();pending=false;networkState('idle');renderLobby();setError('');
    setStatus(response.status==='expired'?'Пока соперников нет. Попробуйте ещё раз.':'Поиск был прерван. Нажмите «Искать матч» снова.');
  }
}
function connectQueueSocket() {
  if(!queueing || !isOpen() || closed || queueSocket)return;
  const url=new URL(endpoint+'/queue/ws');url.protocol=url.protocol==='https:'?'wss:':'ws:';
  const ws=new WebSocket(url,['soul-online-v1',`token.${token}`]);queueSocket=ws;
  let lastMessage=Date.now();
  queueSocketTimer=setTimeout(()=>ws.close(),timing.connect);
  ws.onopen=()=>{
    if(queueSocket!==ws)return;clearTimeout(queueSocketTimer);
    queueHeartbeat=setInterval(()=>{
      if(queueSocket!==ws || !queueing || document.hidden)return;
      if(Date.now()-lastMessage>50000){ws.close();return;}
      if(ws.readyState===WebSocket.OPEN)ws.send('arena:ping');
    },timing.heartbeat);
  };
  ws.onmessage=event=>{
    if(queueSocket!==ws)return;lastMessage=Date.now();
    if(event.data==='arena:pong')return;
    try{const m=JSON.parse(event.data);if(m.type==='queue_matched' && queueing)handleQueue(m).catch(error=>setError(error.message));}catch{}
  };
  ws.onclose=()=>{
    if(queueSocket!==ws)return;queueSocket=null;clearTimeout(queueSocketTimer);clearInterval(queueHeartbeat);
    if(queueing && !closed){clearTimeout(queueTimer);queueTimer=setTimeout(pollQueue,5000);}
  };
  ws.onerror=()=>{};
}
async function pollQueue() {
  if(!queueing || queueFlight) return;
  const generation=queueGeneration;
  const flight=(async()=>{
  try {
    await authenticate(false,{attempts:1,timeout:timing.profileAuth});
    if(generation!==queueGeneration||closed||!queueing)return;
    const response=queuePolicy?
      await apiGet(searchStatusPath(),{attempts:1,signal:queueAbort?.signal}):
      await api('/queue/join',{searchId:queueSearchId,allowBots:true},true,{attempts:1,signal:queueAbort?.signal});
    if(generation!==queueGeneration || !queueing)return;
    await handleQueue(response);
  } catch(error) {
    if(generation!==queueGeneration || closed || !queueing)return;
    diagnostics.queueFailures++;diagnostics.lastFailure={at:Date.now(),code:error.code||'NETWORK_TIMEOUT'};
    queueFailureSince ||= Date.now();queueRetryCount++;
    if(error.retryable===false || error.status===401 || error.status===400) {
      stopQueue();pending=false;networkState('failed','Требуется новый вход через VK или ОК');renderLobby();setError(error.message);return;
    }
    networkState('recovering','Поиск продолжается…');renderQueue();setError('');
    scheduleQueuePoll(Math.max(Number(error.retryAfterMs)||0,Math.min(6000,timing.queueRetryBase*2**Math.min(queueRetryCount,3))));
  }
  })();
  queueFlight=flight;try{await flight;}finally{if(queueFlight===flight)queueFlight=null;}
}
async function startSearch() {
  if(pending||queueing) return;
  const generation=++queueGeneration;
  clearTimeout(profileRetryTimer);profileRetryTimer=null;
  pending=false;queueing=true;queueSince=Date.now();searchRequestedAt=Date.now();queueHardDeadline=Date.now()+timing.searchMax;
  queueSearchId=requestId();queueAbort=new AbortController();queueFailureSince=Date.now();
  persistSearch();setError('');networkState('authenticating','Подключаем поиск игроков…');renderQueue();armQueueWatchdog();
  try {
    if(!endpoint) throw new Error('Адрес сервера пока не задан');
    await authenticate(false,{attempts:1,timeout:timing.profileAuth});
    if(generation!==queueGeneration || closed)return;
    const response=await api('/queue/join',{searchId:queueSearchId,allowBots:true},true,{attempts:1,signal:queueAbort?.signal});
    if(generation!==queueGeneration || closed)return;
    await handleQueue(response);
    if(queueing)networkState('queued','Поиск соперника запущен');
  } catch(error) {
    if(generation!==queueGeneration || closed)return;
    if(error.retryable) {
      diagnostics.queueFailures++;diagnostics.lastFailure={at:Date.now(),code:error.code||'NETWORK_TIMEOUT'};
      networkState('recovering','Поиск продолжается…');renderQueue();setError('');
      scheduleQueuePoll(Math.max(timing.queueStartRetry,Number(error.retryAfterMs)||0));return;
    }
    const ticket=queueSearchId;stopQueue();pending=false;networkState('failed','Нет подключения');renderLobby();setError(error.message);
    if(token)api('/queue/cancel',{searchId:ticket},true,{attempts:1}).catch(()=>{});
  }
}
async function cancelSearch() {
  if(!queueing) return;
  const ticket=queueSearchId;stopQueue();pending=false;renderLobby();networkState('idle','Поиск остановлен');setError('');
  if(!profileFresh)loadProfile();
  try { await authenticate();await api('/queue/cancel',{searchId:ticket},true,{attempts:1}); }
  catch(error) {
    setError(error.message);
    // If a match was created just before cancellation, restore the assignment.
    const status=await apiGet('/queue/status').catch(()=>null);
    if(status?.status==='matched') await handleQueue(status);
  }
}
function resetRoom() {
  clearSocketTimers();clearAction();window.SOUL_ARENA_VISUALS?.cancel?.();
  clearTimeout(reconnectTimer);const oldSocket=socket;socket=null;oldSocket?.close(1000,'Left room');
  roomGeneration++;roomAbort?.abort();roomAbort=null;
  clearTimeout(socketRecoveryTimer);socketRecoverySince=0;socketRecoveryStopped=false;socketRecoveryEpoch++;
  clearTimeout(autoStageTimer);autoStageKey=null;assignedCode=null;
  room=null;view=null;pending=false;connecting=false;presence=null;
  battleSelection=null;primeSelection.clear();duelExpanded=false;lastRenderedRoom=null;lastRenderedVersion=-1;
  sessionStorage.removeItem(storageKey);
  sessionStorage.removeItem(assignmentStorageKey);
  renderLobby();setStatus('Выберите следующую игру');
  loadProfile();
}
function connectSocket() {
  if (!room || !isOpen() || closed || socketRecoveryStopped || socket?.readyState === WebSocket.OPEN || connecting) return;
  connecting = true;
  armSocketRecovery();
  networkState('connecting','Подключаемся к матчу…');
  const url = new URL(endpoint + `/room/${room}/ws`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(url,['soul-online-v1',`token.${token}`]);
  socket = ws;
  clearSocketTimers();socketTimer=setTimeout(()=>{if(socket===ws && connecting)ws.close(4000,'Connection timeout');},timing.connect);
  const connectedRoom=room;
  ws.onopen = () => {
    if(socket!==ws || room!==connectedRoom) return;
    connecting=false;clearTimeout(socketTimer);lastSocketMessage=Date.now();
    if(pendingAction)pendingAction.replayed=false;
    setStatus('Соединение установлено');setError('');
    heartbeatTimer=setInterval(()=>{
      if(socket!==ws || closed || document.hidden)return;
      if(Date.now()-lastSocketMessage>45000){ws.close(4000,'Heartbeat timeout');return;}
      if(ws.readyState===WebSocket.OPEN)ws.send('arena:ping');
    },timing.heartbeat);
  };
  ws.onmessage = event => {
    if(socket!==ws || room!==connectedRoom) return;
    lastSocketMessage=Date.now();
    if(event.data==='arena:pong')return;
    try {
      const message = JSON.parse(event.data);
      if(message.type==='ack' && message.requestId===pendingAction?.requestId && view?.match.version>=message.version)clearAction();
      if (message.type === 'error') {clearAction();setError(message.error);renderMatch();if(message.code==='TEMPORARY_UNAVAILABLE')ws.send(JSON.stringify({type:'sync'}));}
      if (message.type === 'presence') {
        presence=message.opponentConnected;
        const label=root.querySelector('[data-online-presence]');
        if(label) label.textContent=presence?'Соперник в сети':'Соперник переподключается';
      }
      if (message.type === 'snapshot') {
        if(!message.match || !Number.isInteger(message.match.version) ||
          (view?.match && message.match.version<view.match.version)) return;
        reconnectAttempt=0;
        socketRecoverySince=0;socketRecoveryStopped=false;clearTimeout(socketRecoveryTimer);networkState('playing');
        if(Number.isFinite(message.serverNow)) clockOffset=message.serverNow-Date.now();
        const prior=view?.match;
        if (prior?.stage !== message.match.stage || prior?.turn !== message.match.turn) primeSelection.clear();
        if (prior?.stage !== message.match.stage || prior?.turn !== message.match.turn ||
          prior?.round !== message.match.round) battleSelection=null;
        view={match:message.match,seat:message.seat};
        if(pendingAction && ((message.actionReceipts||[]).some(r=>r.requestId===pendingAction.requestId)||
          message.match.lastAction?.requestId===pendingAction.requestId))clearAction();
        else if(pendingAction && ws.readyState===WebSocket.OPEN) {
          if(Date.now()-(pendingAction.createdAt||0)>45000) {
            clearAction();setError('Подтверждение хода не получено. Состояние восстановлено — проверьте поле перед следующим ходом.');
          } else if(!pendingAction.replayed && (pendingAction.retries||0)<3) {
            pendingAction.replayed=true;pendingAction.retries=(pendingAction.retries||0)+1;
            ws.send(JSON.stringify({type:'action',requestId:pendingAction.requestId,action:pendingAction.action}));
          }
          armActionTimer();
        }else pending=false;
        setError('');
        setStatus(message.match.stage==='waiting'?'Ожидаем друга':
          message.match.stage==='series_end'?'Серия завершена':
          message.match.stage==='match_end'?'Матч завершён':
          message.match.turn===message.seat?'Ваш ход':'Ждём соперника');
        renderMatch();
        if(prior?.stage!==message.match.stage&&['match_end','series_end'].includes(message.match.stage))
          window.SOUL_ARENA_VISUALS?.cancel?.();
        window.SOUL_ARENA_VISUALS?.onlineTransition?.(prior,message.match,message.seat,room);
        if(message.match.stage==='series_end' && message.match.ratingFinalized &&
          (!prior || !prior.ratingFinalized || prior.stage!=='series_end'))
          refreshProfile().catch(()=>{});
      }
    } catch {clearAction();renderMatch();setError('Сервер отправил некорректное сообщение'); }
  };
  ws.onclose = event => {
    if (socket !== ws) return;
    clearSocketTimers();clearTimeout(actionTimer);socket=null;connecting=false;pending=Boolean(pendingAction);
    if (closed || !isOpen()) return;
    if(event?.code===4001){socketRecoveryStopped=true;socketRecoveryEpoch++;setStatus('Матч открыт на другом устройстве');setError('Закройте второе окно игры и нажмите «Восстановить соединение».');renderMatch();return;}
    networkState('recovering','Соединение прервалось; восстанавливаем…');armSocketRecovery();
    clearTimeout(reconnectTimer);
    const recoveryEpoch=socketRecoveryEpoch;
    reconnectTimer=setTimeout(async () => {
      try { await authenticate();if(recoveryEpoch===socketRecoveryEpoch&&!socketRecoveryStopped)connectSocket(); }
      catch(error) {
        if(recoveryEpoch!==socketRecoveryEpoch||socketRecoveryStopped)return;
        setError(error.message);
        if(error.status===401){clearTimeout(socketRecoveryTimer);networkState('failed','Перезапустите игру через VK или ОК для нового сеанса');renderMatch();}
        else reconnectTimer=setTimeout(connectSocket,5000);
      }
    },Math.min(10000,700*2**Math.min(reconnectAttempt++,4))+Math.random()*500);
  };
  ws.onerror = () => setStatus('Проверяем подключение…');
}
async function enterRoom(code, create=false) {
  if (pending || enteringRoom) return;
  enteringRoom=true;
  const generation=++roomGeneration;
  roomAbort?.abort();roomAbort=new AbortController();
  const deadline=Date.now()+timing.roomRecovery;
  const payload=create?{requestId:requestId()}:{};
  if(!create)rememberRoom(code);
  pending=true; setError('');networkState('joining','Проверяем соединение с сервером…');
  if(!view)ui.content.innerHTML=`<section class="online-panel online-lobby"><div class="online-emblem online-search-icon">⚔️</div><h2>${create?'Создаём комнату':'Подключаемся к матчу'}</h2><p>Назначение сохраняется. При кратком обрыве попробуем подключиться повторно.</p>${button('stop_connect','Вернуться в меню',false,'online-btn-secondary')}</section>`;
  try {
    if (!endpoint) throw new Error('Адрес сервера пока не задан');
    const path=create?'/room/create':`/room/${code}/join`;
    let result;
    for(let attempt=0;;attempt++) {
      if(generation!==roomGeneration||closed)return;
      try {
        await authenticate(false,{timeout:Math.min(timing.profileAuth,Math.max(10,deadline-Date.now())),attempts:1});
        if(generation!==roomGeneration||closed)return;
        result=await api(path,payload,true,{attempts:1,signal:roomAbort.signal,timeout:Math.min(timing.http,Math.max(10,deadline-Date.now()))});
        break;
      }catch(error) {
        if(generation!==roomGeneration||closed)return;
        if(!error.retryable||Date.now()>=deadline||attempt>=3)throw error;
        networkState('joining','Матч сохранён · повторяем подключение…');
        await pause(Math.min(Math.max(10,deadline-Date.now()),Math.max(Number(error.retryAfterMs)||0,Math.min(4000,timing.roomRetry*2**attempt))));
      }
    }
    if(generation!==roomGeneration||closed)return;
    if(Number.isFinite(result.serverNow)) clockOffset=result.serverNow-Date.now();
    room = create?result.room:code;
    if(!roomPattern.test(room||'')||!result.match||![0,1].includes(result.seat))throw new Error('Сервер не подтвердил состояние комнаты');
    try{const stored=JSON.parse(sessionStorage.getItem(actionKey)||'null');if(stored?.room===room)pendingAction={...stored,replayed:false};}catch{}
    rememberRoom(room);
    view=result; closed=false;socketRecoveryStopped=false;socketRecoveryEpoch++;socketRecoverySince=0;
    pending=Boolean(pendingAction); presence=null; renderMatch(); connectSocket();
  } catch(error) {
    if(generation!==roomGeneration||closed)return;
    pending=false;networkState('failed','Нет подключения');
    if(!error.retryable&&(/Комната не найдена|Доступ к комнате|Комната занята/.test(error.message)||error.status===404)) {
      assignedCode=null;sessionStorage.removeItem(storageKey);sessionStorage.removeItem(assignmentStorageKey);
    }
    if(!view)renderLobby();setError(error.message);
  }
  finally{if(generation===roomGeneration){enteringRoom=false;roomAbort=null;}}
}
function armActionTimer() {
  clearTimeout(actionTimer);
  actionTimer=setTimeout(()=>{
    if(!pendingAction || !isOpen() || closed)return;
    if(Date.now()-(pendingAction.createdAt||0)>45000) {
      clearAction();setStatus('Требуется восстановление соединения');setError('Сервер не подтвердил ход. Нажмите «Восстановить соединение».');
      socket?.close(4000,'Action deadline exceeded');renderMatch();return;
    }
    setStatus('Проверяем, принят ли ход…');
    if(socket?.readyState===WebSocket.OPEN) {
      socket.send(JSON.stringify({type:'sync'}));
      actionTimer=setTimeout(()=>socket?.close(4000,'Action confirmation timeout'),timing.ack);
    }else connectSocket();
  },timing.ack);
}
function sendAction(action) {
  if (pending || socket?.readyState !== WebSocket.OPEN || !view) { setError('Подождите соединения с сервером'); return; }
  pending=true; setError('');setStatus('Отправляем ход на сервер…');renderMatch();
  const scope=action.type==='ready'?{stage:view.match.stage,matchNumber:view.match.matchNumber,
    seriesNumber:view.match.seriesNumber}:{};
  pendingAction={room,requestId:requestId(),action:{...action,...scope,version:view.match.version},replayed:false,createdAt:Date.now(),retries:0};
  sessionStorage.setItem(actionKey,JSON.stringify(pendingAction));
  try { socket.send(JSON.stringify({type:'action',requestId:pendingAction.requestId,action:pendingAction.action}));armActionTimer(); }
  catch {socket?.close(4000,'Send failed');setError('Не удалось отправить ход. Проверяем соединение.');}
}
function leave() {
  clearSocketTimers();clearTimeout(actionTimer);clearTimeout(profileRetryTimer);clearInterval(secondTimer);secondTimer=null;
  window.SOUL_ARENA_VISUALS?.cancel?.();
  if(queueing) {const ticket=queueSearchId;stopQueue();api('/queue/cancel',{searchId:ticket},true,{attempts:1}).catch(()=>{});}
  roomGeneration++;roomAbort?.abort();roomAbort=null;enteringRoom=false;
  clearTimeout(socketRecoveryTimer);socketRecoverySince=0;clearTimeout(autoStageTimer);
  root.classList.add('hidden'); closed=true;pending=false;clearTimeout(reconnectTimer);
  socket?.close(1000,'Closed by player'); socket=null; connecting=false;
  window.closeGameModeSelect?.();
}
window.openOnlineArena = function() {
  window.closeGameModeSelect?.();
  root.classList.remove('hidden'); closed=false; setError('');
  if(!secondTimer) secondTimer=setInterval(updateClocks,1000);
  if (view && room) {pending=Boolean(pendingAction);renderMatch();connectSocket();return;}
  renderLobby();
  if(!secondTimer) secondTimer=setInterval(updateClocks,1000);
  const saved = savedRoom();
  if (saved && roomPattern.test(saved) && endpoint) enterRoom(saved);
  else if(sessionStorage.getItem(searchKey) && endpoint) {
    let record;try{record=JSON.parse(sessionStorage.getItem(searchKey));}catch{}
    if(record&&typeof record==='object'&&(record.endpoint!==endpoint||record.userId!==launchIdentity)) {
      sessionStorage.removeItem(searchKey);loadProfile();return;
    }
    queueGeneration++;queueing=true;queueSearchId=record?.searchId||null;
    searchRequestedAt=record?.startedAt||Date.now();queueSince=searchRequestedAt;
    queueHardDeadline=record?.hardDeadline||Date.now()+timing.searchMax;
    queueFailureSince=Date.now();queueAbort=new AbortController();networkState('recovering','Восстанавливаем сохранённый поиск…');renderQueue();armQueueWatchdog();
    if(!queueing)return;
    // A restored search checks its existing ticket before creating anything.
    queuePolicy={restored:true};pollQueue();
  } else {
    setStatus(endpoint?'Проверяем ваш профиль…':'Ожидается адрес опубликованного сервера');
    loadProfile();
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
  if(action==='practice'){leave();window.openCpuPreview?.();return;}
  if(action==='resume_room')return enterRoom(assignedCode||savedRoom());
  if(action==='stop_connect') {
    roomGeneration++;roomAbort?.abort();roomAbort=null;enteringRoom=false;pending=false;
    networkState('idle','Подключение остановлено · назначение сохранено');renderLobby();return;
  }
  if(action==='retry_profile')return loadProfile();
  if(action==='reconnect'){
    socketRecoveryStopped=false;socketRecoveryEpoch++;socketRecoverySince=0;closed=false;
    clearTimeout(socketRecoveryTimer);armSocketRecovery();
    clearSocketTimers();const oldSocket=socket;socket=null;oldSocket?.close();connecting=false;clearTimeout(reconnectTimer);
    authenticate().then(connectSocket).catch(error=>setError(error.message));return;
  }
  if (action==='search') return startSearch();
  if (action==='cancel_search') return cancelSearch();
  if (action==='ranking') {
    (async()=>{
      try {
        await authenticate();
        const ranking=await apiGet('/rating/top');leaderboard=ranking.top;leaderboardIndexing=Boolean(ranking.indexing);
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
function resumeConnection(){
  if(!isOpen() || closed || document.hidden)return;
  if(room){
    if(socket?.readyState===WebSocket.OPEN){lastSocketMessage=Date.now();socket.send(JSON.stringify({type:'sync'}));scheduleAutoStages();}
    else {clearTimeout(reconnectTimer);connecting=false;socket?.close();socket=null;authenticate().then(connectSocket).catch(error=>setError(error.message));}
  }else if(queueing){clearTimeout(queueTimer);authenticate().then(pollQueue).catch(error=>setError(error.message));}
  else loadProfile();
}
window.addEventListener('online',resumeConnection);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeConnection();});
window.addEventListener('pageshow',event=>{if(event.persisted)resumeConnection();});

root.addEventListener('change',event=>{if(event.target.matches('[data-visual-quality]'))window.SOUL_ARENA_VISUALS?.setQuality?.(event.target.value);});
root.addEventListener('change',event=>{
  if(event.target.matches('[data-auto-stages]')) {
    autoStages=event.target.checked;localStorage.setItem('soulArenaAutoStagesR85',autoStages?'1':'0');scheduleAutoStages();
  }
});
