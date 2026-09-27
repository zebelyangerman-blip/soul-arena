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
let connecting = false, closed = false, pending = false, primeSelection = new Set(), status = '';
let queueing = false, queueSince = null, queueTimer = null, profile = null, leaderboard = null;
let presence = null, secondTimer = null, clockOffset = 0;

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
function arenaName(id) { return arenaCatalog.find(a => a.id === id)?.publicName || 'Арена'; }
function statusName(state) { return ['Свежий','Лёгкие раны','Ранен','На грани','Выбыл'][state] || '—'; }
function card(item, selectable = false, selected = false) {
  const entry = fighter(item.id);
  const name = escapeHtml(entry?.public?.name || `Боец #${item.id}`);
  const portrait = entry?.public?.portrait ? `images/${encodeURIComponent(entry.public.portrait)}` : '';
  const inactive = item.state >= 4;
  return `<button type="button" class="online-fighter ${inactive?'is-out':''} ${selected?'is-selected':''}"
      ${selectable&&!inactive?'data-action="select" data-id="'+item.id+'"':'disabled'}>
      <span class="online-avatar">${portrait?`<img loading="lazy" src="${portrait}" alt="">`:escapeHtml(entry?.public?.emoji||'⚔️')}</span>
      <span class="online-fighter-info"><b>${name}</b><small>${item.prime?'ПРАЙМ · ':''}${statusName(item.state)}</small></span>
      ${selected?'<span class="online-check">✓</span>':''}
    </button>`;
}
function button(action, label, disabled = false, extra = '') {
  return `<button type="button" class="online-btn ${extra}" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
}
function renderLobby() {
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem">⚔️</div><h2>Найти соперника</h2>
    <p>Система подберёт игрока с близким рейтингом. Победа в серии до пяти побед меняет ваш отдельный онлайн-рейтинг.</p>
    <div class="online-my-rating">Ваш PvP-рейтинг <b>${profile?.rating ?? '—'}</b><small>${profile?`${profile.wins} побед · ${profile.losses} поражений`: 'Появится после входа через VK/ОК'}</small></div>
    ${profile?.history?.length?`<div class="online-history"><strong>Последние серии</strong>${profile.history.slice(0,3).map(x=>`<span>${x.won?'Победа':'Поражение'} · ${escapeHtml(formatPlayer(x.opponent))} <b>${x.delta>0?'+':''}${x.delta}</b></span>`).join('')}</div>`:''}
    ${endpoint?button('search','ИСКАТЬ МАТЧ'): '<p class="online-note">Адрес сервера пока не указан. После публикации Worker впишите его в <code>js/online_config.js</code>.</p>'}
    ${endpoint?button('ranking','Таблица лидеров',false,'online-btn-secondary online-btn-small'):''}
    ${leaderboard?`<div class="online-ranking"><h3>Топ-20 игроков</h3>${leaderboard.length?leaderboard.map((p,i)=>`<div><span>${i+1}. ${escapeHtml(formatPlayer(p.playerId))}</span><b>${p.rating}</b></div>`).join(''):'<p>Пока нет завершённых рейтинговых серий.</p>'}</div>`:''}
    <div class="online-divider">Или сыграть с другом без рейтинга</div>
    <p class="online-note">Для игры с другом создайте комнату и отправьте код. Эта серия не влияет на PvP-рейтинг.</p>
    ${endpoint?button('create','Создать комнату',false,'online-btn-secondary'):''}
    <form id="online-join-form" class="online-join">
      <input id="online-room-code" type="text" inputmode="text" autocomplete="off" maxlength="10" placeholder="КОД КОМНАТЫ" aria-label="Код комнаты" ${endpoint?'':'disabled'} required>
      <button class="online-btn online-btn-secondary" type="submit" ${endpoint?'':'disabled'}>Войти</button>
    </form>
    ${local?'<p class="online-note">Для локальной проверки откройте игру с параметрами <code>?debugPlayer=101</code> и <code>?debugPlayer=202</code> в разных окнах.</p>':''}
  </section>`;
}
function formatPlayer(id) {
  const [platform,value]=String(id||'').split(':');
  return `${platform==='ok'?'ОК':'VK'} #${value||'—'}`;
}
function renderQueue() {
  if (!isOpen() || !queueing) return;
  ui.content.innerHTML = `<section class="online-panel online-lobby">
    <div class="online-emblem online-search-icon">⚔️</div><h2>Ищем соперника</h2>
    <p>Сначала подбираем игрока с близким рейтингом. Если поиск затянется, допустимая разница постепенно увеличится.</p>
    <p class="online-search-clock">В поиске: <b data-queue-clock>00:00</b></p>
    ${button('cancel_search','Отменить поиск',false,'online-btn-secondary')}
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
  const matchCount = m.matchNumber || 1;
  const phase = {
    waiting:'Ожидание друга', draft:'Драфт', prime:'Форма Прайм', arena:'Выбор арены',
    battle_roll:'Жребий боя',battle:'Битва',match_end:'Матч завершён',series_end:'Серия завершена'
  }[m.stage] || 'Матч';
  const duel = m.lastDuel;
  let body = '';
  if (m.stage === 'waiting') body = `<div class="online-focus"><h2>Пригласите друга</h2><p>Отправьте ему этот код. Пока друг подключается, комнату можно закрыть и открыть снова на том же устройстве.</p><div class="online-code">${room}</div>${button('copy','Скопировать код')}</div>`;
  if (m.stage === 'draft') {
    const entry = fighter(m.currentCard);
    const cardHtml = entry ? card({id:entry.id,state:0,prime:false}) : '';
    body = `<div class="online-focus"><span class="online-step">Карта ${m.draftIndex+1} / 10</span><h2>${mine?'Ваша очередь выбирать':'Друг выбирает карту'}</h2>
      <div class="online-draft-card">${cardHtml}</div>
      ${mine?`<div class="online-actions">${button('keep','Оставить себе')}${button('pass','Отдать другу',false,'online-btn-secondary')}</div>`:'<p>Ждём выбор друга. Обновление придёт автоматически.</p>'}</div>`;
  }
  if (m.stage === 'prime') {
    const roll = m.primeCounts[seat];
    if (!mine) body = `<div class="online-focus"><h2>Друг назначает Прайм</h2><p>${m.primesDone[seat]?'Ваши формы сохранены.':'Скоро настанет ваша очередь.'}</p></div>`;
    else if (!m.primeRolled) body = `<div class="online-focus"><h2>Бросок на Прайм</h2><p>Сервер определит, сколько бойцов получит усиленную форму.</p>${button('roll_prime','Бросить кубик')}</div>`;
    else body = `<div class="online-focus"><h2>Выберите ${roll} бойцов</h2><p>Выбрано: ${primeSelection.size} из ${roll}. Нажмите на карты своей команды.</p>${button('choose_prime','Подтвердить Прайм',primeSelection.size !== roll)}</div>`;
  }
  if (m.stage === 'arena') body = `<div class="online-focus"><h2>${mine?'Выберите арену жеребьёвкой':'Друг выбирает арену'}</h2>
    <p>Арену определяет сервер. Её условия влияют на бой.</p>${mine?button('spin_arena','Крутить колесо'):''}</div>`;
  if (m.stage === 'battle_roll') body = `<div class="online-focus"><h2>${escapeHtml(arenaName(m.arenaId))}</h2>
    <p>Жребий определит, кто выставляет бойца первым.</p>${m.startingPlayer===seat?button('roll_battle','Бросить кубики'):'<p>Друг проводит жеребьёвку.</p>'}</div>`;
  if (m.stage === 'battle') {
    const theirPlacement = m.placements[1-seat];
    body = `<div class="online-focus"><span class="online-step">Дуэль ${m.round}</span><h2>${mine?'Выставьте бойца':'Друг выставляет бойца'}</h2>
      <p>${theirPlacement!==null?`Друг выставил: <b>${escapeHtml(fighterName(theirPlacement))}</b>.`:'Выбирайте живого бойца своей команды.'}</p>
      ${m.battleRoll?`<small>Жребий: ${m.battleRoll[seat]} : ${m.battleRoll[1-seat]}</small>`:''}</div>`;
  }
  if (m.stage === 'match_end' || m.stage === 'series_end') {
    const series = m.stage === 'series_end';
    const won = (series?m.seriesWinner:m.matchWinner) === seat;
    const result = m.ratingResult;
    const delta = result?.delta?.[seat] || 0;
    const reason = series && m.lastAction?.type==='timeout' ?
      (won?'Соперник не успел сделать ход.':'Время вашего хода истекло.') :
      series && m.lastAction?.type==='surrender' ?
      (won?'Соперник сдался.':'Вы сдались.') : '';
    const ratingText = !m.ranked || !series ? '' : !m.ratingFinalized ?
      '<p>Сохраняем результат серии и рейтинг…</p>' : result?.rated ?
      `<div class="online-result-rating">PvP-рейтинг: <b>${result.after[seat]}</b> <strong>${delta>0?'+':''}${delta}</strong></div>` :
      '<p>Повторная встреча: рейтинг не изменился.</p>';
    body = `<div class="online-focus"><h2>${won?'Победа!':'Поражение'}</h2>
      <p>${reason|| (series?'Серия до пяти побед завершена.':'Матч завершён. Начните следующий, когда оба будут готовы.')}</p>${ratingText}
      ${m.ready[seat]?'<p>Вы готовы. Ждём соперника.</p>':button('ready',series&&m.ranked?'Реванш без рейтинга':series?'Сыграть новую серию':'Следующий матч',series&&m.ranked&&!m.ratingFinalized)}
      ${series&&m.mode!=='friend'?button('search_again','Найти нового соперника',false,'online-btn-secondary'):''}
    </div>`;
  }
  const primeChoose = m.stage==='prime' && mine && m.primeRolled;
  const placeChoose = m.stage==='battle' && mine;
  const team = (list,selectable) => list.map(item=>card(item,selectable,selectable && (primeChoose?primeSelection.has(item.id):false))).join('') || '<p class="online-empty">Команда ещё не собрана</p>';
  const duelHtml = duel ? `<aside class="online-last"><b>Последняя дуэль</b><span>${escapeHtml(fighterName(duel.fighterA))} ⚔️ ${escapeHtml(fighterName(duel.fighterB))}</span><small>Победил ${escapeHtml(fighterName(duel.winnerId))} · ${statusName(duel.winnerStateAfter)}</small></aside>` : '';
  ui.content.innerHTML = `<section class="online-board">
    <div class="online-score"><span>ВЫ <b>${m.wins[seat]}</b></span><div>МАТЧ ${matchCount} · ${phase}<small>${m.mode==='matchmaking'?(m.ratingEligible?'РЕЙТИНГОВАЯ СЕРИЯ':'ПОВТОРНАЯ ВСТРЕЧА БЕЗ РЕЙТИНГА'):m.mode==='rematch'?'РЕВАНШ БЕЗ РЕЙТИНГА':'ИГРА С ДРУГОМ · БЕЗ РЕЙТИНГА'}</small></div><span><b>${m.wins[1-seat]}</b> ${m.mode==='friend'?'ДРУГ':'СОПЕРНИК'}</span></div>
    <div class="online-roomline">${m.mode==='friend'?`<span>Комната <b>${room}</b></span>${button('copy','Копировать код',false,'online-btn-small')}`:`<span>Сетевой матч · <b>${room}</b></span>`}<span class="online-presence" data-online-presence>${presence===false?'Соперник переподключается':presence===true?'Соперник в сети':''}</span></div>
    ${m.turnDeadlineAt?`<div class="online-turn-clock">${mine?'Ваш ход':'Ход соперника'} · осталось <b data-turn-clock>03:00</b></div>`:''}
    ${m.arenaId?`<div class="online-arena">${escapeHtml(arenaName(m.arenaId))}</div>`:''}
    ${body}${duelHtml}
    <div class="online-teams"><section><h3>Ваши бойцы <small>${own(m,seat).filter(c=>c.state<4).length} в строю</small></h3><div class="online-roster">${team(own(m,seat),primeChoose||placeChoose)}</div></section>
    <section><h3>Бойцы друга <small>${opponent(m,seat).filter(c=>c.state<4).length} в строю</small></h3><div class="online-roster">${team(opponent(m,seat),false)}</div></section></div>
    <footer class="online-footer">${!['waiting','series_end'].includes(m.stage)?button('surrender','Сдаться',false,'online-btn-danger'):button('new_room','Выйти из комнаты',false,'online-btn-secondary')}</footer>
  </section>`;
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
  ws.onopen = () => { connecting=false; setStatus('Соединение установлено'); setError(''); };
  ws.onmessage = event => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'error') { pending=false; setError(message.error); }
      if (message.type === 'presence') {
        presence=message.opponentConnected;
        const label=root.querySelector('[data-online-presence]');
        if(label) label.textContent=presence?'Соперник в сети':'Соперник переподключается';
      }
      if (message.type === 'snapshot') {
        if(Number.isFinite(message.serverNow)) clockOffset=message.serverNow-Date.now();
        const prior=view?.match;
        if (view?.match?.stage !== message.match.stage || view?.match?.turn !== message.match.turn) primeSelection.clear();
        view={match:message.match,seat:message.seat};
        pending=false; setError(''); renderMatch();
        if(message.match.stage==='series_end' && message.match.ratingFinalized &&
          (!prior || !prior.ratingFinalized || prior.stage!=='series_end'))
          refreshProfile().catch(()=>{});
      }
    } catch { setError('Сервер отправил некорректное сообщение'); }
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
    const result = await api(create?'/room/create':`/room/${code}/join`);
    if(Number.isFinite(result.serverNow)) clockOffset=result.serverNow-Date.now();
    room = create?result.room:code;
    sessionStorage.setItem(storageKey,room);
    view=result; closed=false; pending=false; presence=null; renderMatch(); connectSocket();
  } catch(error) { pending=false; setStatus('Нет подключения'); setError(error.message); }
}
function sendAction(action) {
  if (pending || socket?.readyState !== WebSocket.OPEN || !view) { setError('Подождите соединения с сервером'); return; }
  pending=true; setError('');
  socket.send(JSON.stringify({type:'action',action:{...action,version:view.match.version}}));
}
function leave() {
  if(queueing) {stopQueue();api('/queue/cancel').catch(()=>{});}
  root.classList.add('hidden'); closed=true; clearTimeout(reconnectTimer);
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
      try { await authenticate();leaderboard=(await apiGet('/rating/top')).top;renderLobby(); }
      catch(error) {setError(error.message);}
    })();
    return;
  }
  if (action==='create') return enterRoom(null,true);
  if (action==='copy') {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(room).then(()=>setStatus('Код скопирован')).catch(()=>setStatus(`Код комнаты: ${room}`));
    else setStatus(`Код комнаты: ${room}`);
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
  if (action==='select') {
    const id = Number(target.dataset.id);
    if (m.stage==='battle') return sendAction({type:'place',id});
    if (m.stage==='prime') {
      if (primeSelection.has(id)) primeSelection.delete(id);
      else if (primeSelection.size < m.primeCounts[view.seat]) primeSelection.add(id);
      renderMatch();
    }
    return;
  }
  if (action==='choose_prime') return sendAction({type:action,ids:[...primeSelection]});
  if (action==='keep' || action==='pass') return sendAction({type:'draft',choice:action});
  if (action==='surrender' && !window.confirm('Сдаться и отдать победу в серии другу?')) return;
  if (['roll_prime','spin_arena','roll_battle','ready','surrender'].includes(action)) sendAction({type:action});
});
