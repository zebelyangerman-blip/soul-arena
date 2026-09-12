'use strict';

(function initSoulArenaProgressEngine() {
    const ENGINE_VERSION = 'R22.0.0';
    const SCHEMA_VERSION = 1;
    const ROSTER_SIZE = 75;
    const DRAW_COUNT = 10;

    const ACHIEVEMENTS = Object.freeze([
        a('first_match','Первый бой','Завершить первый матч.','swords','matchesPlayed',1,'combat',50),
        a('match_wins_5','Пять побед','Выиграть 5 матчей.','swords','matchWins',5,'combat',75),
        a('match_wins_25','Опытный дуэлянт','Выиграть 25 матчей.','swords','matchWins',25,'combat',125),
        a('duel_wins_10','Десять превосходств','Победить в 10 отдельных дуэлях своей стороной.','swords','playerDuelWins',10,'combat',75),
        a('duel_wins_50','Полсотни дуэлей','Победить в 50 отдельных дуэлях своей стороной.','swords','playerDuelWins',50,'combat',150),
        a('duel_wins_200','Ветеран Арены','Победить в 200 отдельных дуэлях своей стороной.','swords','playerDuelWins',200,'combat',300),
        a('flawless_match','Без потерь','Выиграть матч, не потеряв ни одного бойца.','shield','flawlessMatchWins',1,'combat',150),
        a('flawless_10','Железная пятёрка','10 раз выиграть матч без потерь.','shield','flawlessMatchWins',10,'combat',300),
        a('series_first','Первая серия','Впервые выиграть серию до 5.','trophy','seriesWins',1,'series',150),
        a('series_5','Пять серий','Выиграть 5 серий до 5.','trophy','seriesWins',5,'series',250),
        a('series_25','Хозяин Арены','Выиграть 25 серий до 5.','trophy','seriesWins',25,'series',500),
        a('sweep_first','Без шансов','Впервые выиграть серию 5:0.','trophy','perfectSeriesWins',1,'series',200),
        a('sweep_5','Чистая работа','Пять раз выиграть серию 5:0.','trophy','perfectSeriesWins',5,'series',400),
        a('comeback_04','Невозможный камбэк','Выиграть серию после счёта 0:4.','trophy','comeback04Wins',1,'series',250,'back_phoenix'),

        a('beat_easy','Разминка окончена','Впервые победить Лёгкого в серии.','cpu','easyWins',1,'cpu',75),
        a('easy_25','Контроль основ','Победить Лёгкого 25 раз.','cpu','easyWins',25,'cpu',150),
        a('beat_medium','Проверка тактики','Впервые победить Среднего.','cpu','mediumWins',1,'cpu',125),
        a('medium_10','Тактик','Победить Среднего 10 раз.','cpu','mediumWins',10,'cpu',250),
        a('beat_hard','Испытание','Впервые победить Сложного.','cpu','hardWins',1,'cpu',200),
        a('hard_5','Выше нормы','Победить Сложного 5 раз.','cpu','hardWins',5,'cpu',300),
        a('beat_master','Мастер пал','Впервые победить Мастера.','crown','masterWins',1,'cpu',350,'frame_masterfall'),
        a('master_10','Охотник на Мастера','Победить Мастера 10 раз.','crown','masterWins',10,'cpu',600,'title_master_slayer'),
        a('master_25','Укротитель Мастера','Победить Мастера 25 раз.','crown','masterWins',25,'cpu',900),

        a('streak_5','Непобеждённый','Выиграть 5 серий подряд.','rating','bestWinStreak',5,'rating',200),
        a('streak_10','Легендарная серия','Выиграть 10 серий подряд.','rating','bestWinStreak',10,'rating',400),
        a('elo_1000','Тысяча','Достичь 1000 Elo.','rating','peakRating',1000,'rating',100),
        a('elo_1200','Серебряный рубеж','Достичь 1200 Elo.','rating','peakRating',1200,'rating',150),
        a('elo_1400','Сложная лига','Достичь 1400 Elo.','rating','peakRating',1400,'rating',250),
        a('elo_1700','Равный Мастеру','Достичь 1700 Elo.','rating','peakRating',1700,'rating',450,'bg_legend'),
        a('elo_2000','За пределом','Достичь 2000 Elo.','rating','peakRating',2000,'rating',800),

        a('seen_1','Первая встреча','Встретить первого персонажа в драфте.','bestiary','uniqueSeen',1,'bestiary',25),
        a('seen_10','Наблюдатель','Встретить 10 разных персонажей.','bestiary','uniqueSeen',10,'bestiary',75),
        a('seen_25','Коллекционер','Встретить 25 разных персонажей.','bestiary','uniqueSeen',25,'bestiary',150),
        a('seen_50','Хронист','Встретить 50 разных персонажей.','bestiary','uniqueSeen',50,'bestiary',300),
        a('seen_75','Архивариус','Встретить всех 75 персонажей.','bestiary','uniqueSeen',75,'bestiary',750,'profile_archivist'),
        a('rare_seen','Редкая встреча','Встретить персонажа с весом драфта ≤ 1.','shard','uniqueRareSeen',1,'bestiary',125),
        a('rare_seen_5','Охотник за редкими','Встретить 5 разных персонажей с весом драфта ≤ 1.','shard','uniqueRareSeen',5,'bestiary',300),
        a('selected_25','Моя двадцать пятёрка','Включить в свою команду 25 разных персонажей.','bestiary','uniqueSelected',25,'bestiary',150),
        a('prime_10','Пробуждение','10 раз назначить Prime персонажам своей стороны.','prime','playerPrimeAssignments',10,'bestiary',100),
        a('prime_50','Повелитель Prime','50 раз назначить Prime персонажам своей стороны.','prime','playerPrimeAssignments',50,'bestiary',300),
        a('prime_unique_25','Разные грани силы','Активировать Prime у 25 разных персонажей своей стороны.','prime','uniquePrime',25,'bestiary',250),
        a('duelists_25','Боевой архив','Увидеть в дуэлях 25 разных персонажей.','bestiary','uniqueDuelists',25,'bestiary',200),

        a('coins_500','Первая казна','Заработать суммарно 500 монет из игровых источников.','coin','coinsEarned',500,'economy',75),
        a('coins_2000','Полная казна','Заработать суммарно 2000 монет из игровых источников.','coin','coinsEarned',2000,'economy',150),
        a('coins_5000','Сокровищница','Заработать суммарно 5000 монет из игровых источников.','coin','coinsEarned',5000,'economy',300),
        a('rewarded_10','Поддержка Арены','Получить 10 rewarded-наград.','reward','rewardedClaims',10,'economy',100),
        a('shop_15','Начало коллекции','Владеть 15 предметами косметики.','shop','shopOwned',15,'collection',100),
        a('shop_30','Большая коллекция','Владеть 30 предметами косметики.','shop','shopOwned',30,'collection',250),
        a('shop_45','Галерея Арены','Владеть 45 предметами косметики.','shop','shopOwned',45,'collection',500),
        a('spender_5000','Меценат','Потратить 5000 монет в магазине.','shop','coinsSpent',5000,'collection',350)
    ]);

    function a(id,name,description,icon,metric,target,group,coins=0,cosmeticId=null) {
        return Object.freeze({id,name,description,icon,metric,target,group,reward:Object.freeze({coins,cosmeticId})});
    }

    function blankCharacterStats() {
        return { seen:0, selected:0, prime:0, duelWins:0, duelLosses:0 };
    }
    function int(value, fallback=0) {
        const n = Number.parseInt(value, 10);
        return Number.isFinite(n) ? n : fallback;
    }
    function createDefaultState(now=Date.now()) {
        return {
            schemaVersion:SCHEMA_VERSION,
            trackingSince:Number(now)||Date.now(),
            stats:{ matchesPlayed:0, matchWins:0, matchLosses:0, flawlessMatchWins:0, seriesCompleted:0, seriesWins:0, seriesLosses:0, perfectSeriesWins:0, comeback04Wins:0, duelsResolved:0, playerDuelWins:0, playerDuelLosses:0, draftCardsSeen:0, playerSelections:0, playerPrimeAssignments:0, arenaVisits:{} },
            characters:{},
            achievements:{ unlocked:{}, achievementCoinsEarned:0 },
            history:[]
        };
    }
    function normalizeState(value, now=Date.now()) {
        const src=value&&typeof value==='object'?value:{};
        const base=createDefaultState(now);
        const s=src.stats&&typeof src.stats==='object'?src.stats:{};
        const chars={};
        if(src.characters&&typeof src.characters==='object') {
            for(const [id,row] of Object.entries(src.characters)) {
                const n=int(id); if(n<1||n>ROSTER_SIZE||!row||typeof row!=='object') continue;
                chars[String(n)]={ seen:Math.max(0,int(row.seen)), selected:Math.max(0,int(row.selected)), prime:Math.max(0,int(row.prime)), duelWins:Math.max(0,int(row.duelWins)), duelLosses:Math.max(0,int(row.duelLosses)) };
            }
        }
        const unlocked={};
        const rawUnlocked=src.achievements&&typeof src.achievements==='object'&&src.achievements.unlocked&&typeof src.achievements.unlocked==='object'?src.achievements.unlocked:{};
        for(const ach of ACHIEVEMENTS) if(rawUnlocked[ach.id]) unlocked[ach.id]=Math.max(1,Number(rawUnlocked[ach.id])||1);
        const arenaVisits={};
        if(s.arenaVisits&&typeof s.arenaVisits==='object') for(const [key,val] of Object.entries(s.arenaVisits)) arenaVisits[String(key)]=Math.max(0,int(val));
        return {
            schemaVersion:SCHEMA_VERSION,
            trackingSince:Math.max(1,Number(src.trackingSince)||Number(now)||Date.now()),
            stats:{
                matchesPlayed:Math.max(0,int(s.matchesPlayed)), matchWins:Math.max(0,int(s.matchWins)), matchLosses:Math.max(0,int(s.matchLosses)), flawlessMatchWins:Math.max(0,int(s.flawlessMatchWins)),
                seriesCompleted:Math.max(0,int(s.seriesCompleted)), seriesWins:Math.max(0,int(s.seriesWins)), seriesLosses:Math.max(0,int(s.seriesLosses)), perfectSeriesWins:Math.max(0,int(s.perfectSeriesWins)), comeback04Wins:Math.max(0,int(s.comeback04Wins)),
                duelsResolved:Math.max(0,int(s.duelsResolved)), playerDuelWins:Math.max(0,int(s.playerDuelWins)), playerDuelLosses:Math.max(0,int(s.playerDuelLosses)), draftCardsSeen:Math.max(0,int(s.draftCardsSeen)), playerSelections:Math.max(0,int(s.playerSelections)), playerPrimeAssignments:Math.max(0,int(s.playerPrimeAssignments)), arenaVisits
            },
            characters:chars,
            achievements:{ unlocked, achievementCoinsEarned:Math.max(0,int(src.achievements?.achievementCoinsEarned)) },
            history:Array.isArray(src.history)?src.history.filter(x=>x&&typeof x==='object').slice(-80):base.history
        };
    }
    function mutate(value, updater, now=Date.now()) {
        const next=normalizeState(value,now); updater(next); return normalizeState(next,now);
    }
    function charRow(state,id) {
        const key=String(int(id));
        if(!state.characters[key]) state.characters[key]=blankCharacterStats();
        return state.characters[key];
    }
    function recordDraftSeen(value, fighterId, now=Date.now()) {
        return mutate(value,s=>{s.stats.draftCardsSeen++;charRow(s,fighterId).seen++;s.history.push({type:'seen',fighterId:int(fighterId),at:Number(now)});},now);
    }
    function recordSelection(value, fighterId, now=Date.now()) {
        return mutate(value,s=>{s.stats.playerSelections++;charRow(s,fighterId).selected++;},now);
    }
    function recordPrime(value, fighterIds, playerOwned=true, now=Date.now()) {
        return mutate(value,s=>{for(const raw of fighterIds||[]){const id=int(raw);if(id<1||id>ROSTER_SIZE)continue;charRow(s,id).prime++;if(playerOwned)s.stats.playerPrimeAssignments++;}},now);
    }
    function recordArena(value, arenaId, now=Date.now()) {
        return mutate(value,s=>{const key=String(arenaId||'unknown');s.stats.arenaVisits[key]=(s.stats.arenaVisits[key]||0)+1;},now);
    }
    function recordDuel(value, winnerId, loserId, playerWon, now=Date.now()) {
        return mutate(value,s=>{s.stats.duelsResolved++;charRow(s,winnerId).duelWins++;charRow(s,loserId).duelLosses++;if(playerWon===true)s.stats.playerDuelWins++;else if(playerWon===false)s.stats.playerDuelLosses++;},now);
    }
    function recordMatch(value, result={}, now=Date.now()) {
        return mutate(value,s=>{s.stats.matchesPlayed++;if(result.playerWon)s.stats.matchWins++;else s.stats.matchLosses++;if(result.playerWon&&result.flawless)s.stats.flawlessMatchWins++;if(result.seriesCompleted){s.stats.seriesCompleted++;if(result.playerWon){s.stats.seriesWins++;if(int(result.scoreAgainst)===0)s.stats.perfectSeriesWins++;if(result.comeback04)s.stats.comeback04Wins++;}else s.stats.seriesLosses++;}},now);
    }

    function characterSets(state, roster=[]) {
        const seen=[],selected=[],prime=[],duelists=[],rareSeen=[];
        for(const c of roster||[]) {
            const row=state.characters[String(c.id)]||blankCharacterStats();
            if(row.seen>0){seen.push(c.id);if(Number(c.draftWeight)<=1)rareSeen.push(c.id);}
            if(row.selected>0)selected.push(c.id);
            if(row.prime>0)prime.push(c.id);
            if(row.duelWins+row.duelLosses>0)duelists.push(c.id);
        }
        return {seen,selected,prime,duelists,rareSeen};
    }
    function metricSnapshot(value, context={}) {
        const state=normalizeState(value); const sets=characterSets(state,context.roster||[]); const rating=context.rating||{}; const economy=context.economy||{}; const shop=context.shop||{};
        const by=rating.byDifficulty||{};
        const rewardedClaims=Math.floor(Math.max(0,Number(economy.totalRewardedCoins)||0)/100);
        return Object.freeze({
            ...state.stats,
            seriesCompleted:Math.max(state.stats.seriesCompleted||0,Math.max(0,int(rating.seriesPlayed))), seriesWins:Math.max(state.stats.seriesWins||0,Math.max(0,int(rating.seriesWins))), seriesLosses:Math.max(state.stats.seriesLosses||0,Math.max(0,int(rating.seriesLosses))),
            uniqueSeen:sets.seen.length, uniqueSelected:sets.selected.length, uniquePrime:sets.prime.length, uniqueDuelists:sets.duelists.length, uniqueRareSeen:sets.rareSeen.length,
            easyWins:Math.max(0,int(by.easy?.wins)), mediumWins:Math.max(0,int(by.medium?.wins)), hardWins:Math.max(0,int(by.hard?.wins)), masterWins:Math.max(0,int(by.master?.wins)),
            bestWinStreak:Math.max(0,int(rating.bestWinStreak)), peakRating:Math.max(0,int(rating.peakRating,800)),
            coinsEarned:Math.max(0,int(economy.totalSeriesCoins))+Math.max(0,int(economy.totalRewardedCoins)), allCoinsEarned:Math.max(0,int(economy.totalSeriesCoins))+Math.max(0,int(economy.totalRewardedCoins))+Math.max(0,int(state.achievements.achievementCoinsEarned)), rewardedClaims,
            shopOwned:Array.isArray(shop.owned)?shop.owned.length:0, coinsSpent:Math.max(0,int(shop.totalCoinsSpent))
        });
    }
    function evaluateAchievements(value, context={}, now=Date.now()) {
        const state=normalizeState(value,now); const metrics=metricSnapshot(state,context); const newly=[];
        for(const ach of ACHIEVEMENTS) {
            if(state.achievements.unlocked[ach.id]) continue;
            if((Number(metrics[ach.metric])||0) >= ach.target) {
                state.achievements.unlocked[ach.id]=Number(now)||Date.now();
                newly.push(ach);
            }
        }
        return Object.freeze({state:Object.freeze(normalizeState(state,now)),newlyUnlocked:Object.freeze(newly.slice()),metrics});
    }
    function markAchievementCoins(value, amount, now=Date.now()) {
        return mutate(value,s=>{s.achievements.achievementCoinsEarned+=Math.max(0,int(amount));},now);
    }

    function inclusionProbabilities(roster, drawCount=DRAW_COUNT) {
        const safeRoster=Array.isArray(roster)?roster:[];
        const groups=new Map();
        for(const c of safeRoster){const w=Number(c.draftWeight??c?.draft?.weight);if(!(w>0))continue;groups.set(w,(groups.get(w)||0)+1);}
        const result={};
        for(const c of safeRoster){const targetWeight=Number(c.draftWeight??c?.draft?.weight);if(!(targetWeight>0)){result[c.id]=0;continue;}result[c.id]=1-probabilityTargetNotDrawn(groups,targetWeight,Math.min(drawCount,safeRoster.length));}
        return Object.freeze(result);
    }
    function probabilityTargetNotDrawn(groupCounts,targetWeight,drawCount) {
        const weights=[...groupCounts.keys()].sort((a,b)=>a-b);
        const counts=weights.map(w=>(groupCounts.get(w)||0)-(w===targetWeight?1:0));
        let states=new Map([[counts.join(','),1]]);
        for(let draw=0;draw<drawCount;draw++){
            const next=new Map();
            for(const [key,p] of states){const cs=key.split(',').map(Number);let otherWeight=0;for(let i=0;i<weights.length;i++)otherWeight+=cs[i]*weights[i];const denom=otherWeight+targetWeight;if(!(denom>0))continue;for(let i=0;i<weights.length;i++){if(cs[i]<=0)continue;const q=cs[i]*weights[i]/denom;const ns=cs.slice();ns[i]--;const nk=ns.join(',');next.set(nk,(next.get(nk)||0)+p*q);}}
            states=next;
        }
        let total=0;for(const p of states.values())total+=p;return Math.max(0,Math.min(1,total));
    }
    function formatProbability(p) { const pct=Math.max(0,Math.min(1,Number(p)||0))*100; return pct<1?pct.toFixed(2)+'%':pct<10?pct.toFixed(1)+'%':pct.toFixed(1)+'%'; }
    function validate(roster=[]) {
        const errors=[]; if(ACHIEVEMENTS.length!==50)errors.push(`Expected 50 achievements, got ${ACHIEVEMENTS.length}`);const ids=new Set();for(const x of ACHIEVEMENTS){if(ids.has(x.id))errors.push('Duplicate achievement '+x.id);ids.add(x.id);if(!(x.target>0))errors.push('Bad target '+x.id);}
        if(Array.isArray(roster)&&roster.length){const probs=inclusionProbabilities(roster);if(Object.keys(probs).length!==roster.length)errors.push('Probability roster size mismatch');for(const p of Object.values(probs))if(!(p>=0&&p<=1))errors.push('Probability out of range');}
        return Object.freeze({ok:errors.length===0,engineVersion:ENGINE_VERSION,schemaVersion:SCHEMA_VERSION,achievementCount:ACHIEVEMENTS.length,errors:Object.freeze(errors)});
    }

    window.SOUL_ARENA_PROGRESS_ENGINE=Object.freeze({engineVersion:ENGINE_VERSION,schemaVersion:SCHEMA_VERSION,rosterSize:ROSTER_SIZE,drawCount:DRAW_COUNT,achievements:ACHIEVEMENTS,createDefaultState,normalizeState,recordDraftSeen,recordSelection,recordPrime,recordArena,recordDuel,recordMatch,metricSnapshot,evaluateAchievements,markAchievementCoins,inclusionProbabilities,formatProbability,validate});
})();
