(function () {
    'use strict';

    const ENGINE_VERSION = 'R22.0.0';
    const SCHEMA_VERSION = 1;
    const CATEGORY_ORDER = Object.freeze(['theme','cardBack','cardFrame','primeEffect','menuBackground','profileFrame','victoryEffect','selectionEffect','title']);
    const CATEGORY_META = Object.freeze({
        theme: Object.freeze({ label:'Темы', icon:'palette' }),
        cardBack: Object.freeze({ label:'Обложки', icon:'background' }),
        cardFrame: Object.freeze({ label:'Рамки карт', icon:'frame' }),
        primeEffect: Object.freeze({ label:'Prime', icon:'prime' }),
        menuBackground: Object.freeze({ label:'Фоны', icon:'background' }),
        profileFrame: Object.freeze({ label:'Профиль', icon:'profile' }),
        victoryEffect: Object.freeze({ label:'Победа', icon:'trophy' }),
        selectionEffect: Object.freeze({ label:'Выбор', icon:'target' }),
        title: Object.freeze({ label:'Титулы', icon:'tag' })
    });
    const RARITY_META = Object.freeze({
        common: Object.freeze({ label:'Обычный', rank:1 }),
        rare: Object.freeze({ label:'Редкий', rank:2 }),
        epic: Object.freeze({ label:'Эпический', rank:3 }),
        legendary: Object.freeze({ label:'Легендарный', rank:4 })
    });
    const item = (id,category,cssKey,name,icon,rarity,price,desc,achievementOnly=false) => Object.freeze({id,category,cssKey,name,icon,rarity,price,desc,achievementOnly:Boolean(achievementOnly)});
    const CATALOG = Object.freeze([
        item('theme_ember','theme','ember','Пылающая Арена','flame','common',0,'Тёплые огненные акценты и янтарное свечение.'),
        item('theme_frost','theme','frost','Ледяной Предел','snow','rare',300,'Холодные небесные акценты и ледяное свечение.'),
        item('theme_void','theme','void','Печать Бездны','void','epic',550,'Фиолетовое свечение и более тёмная атмосфера.'),
        item('theme_jade','theme','jade','Нефритовый Двор','palette','rare',350,'Изумрудные акценты для спокойного оформления.'),
        item('theme_aurora','theme','aurora','Полярная Душа','palette','epic',650,'Сине-розовая аура с мягким полярным свечением.'),
        item('theme_royal','theme','royal','Золотой Сёгунат','crown','legendary',1100,'Золото, пурпур и торжественный премиальный акцент.'),

        item('back_classic','cardBack','classic','Классическая Печать','background','common',0,'Базовая тёмная обложка карт.'),
        item('back_obsidian','cardBack','obsidian','Обсидиановая Клятва','background','common',180,'Чёрный камень и тонкая серебряная сетка.'),
        item('back_frost','cardBack','frost','Ледяная Печать','snow','rare',320,'Холодный узор с кристаллическими линиями.'),
        item('back_void','cardBack','void','Око Бездны','void','epic',560,'Глубокий фиолетовый центр и кольца пустоты.'),
        item('back_gold','cardBack','gold','Золотой Герб','crown','epic',680,'Тёмная основа с золотым гербом коллекционера.'),
        item('back_spirit','cardBack','spirit','Сетка Духов','background','legendary',1050,'Живая сетка духовной энергии вокруг карты.'),

        item('frame_standard','cardFrame','standard','Стальная Рамка','frame','common',0,'Базовая рамка боевой карты.'),
        item('frame_bronze','cardFrame','bronze','Бронза Дуэлянта','frame','common',160,'Тёплая бронзовая окантовка.'),
        item('frame_frost','cardFrame','frost','Морозный Контур','snow','rare',340,'Светящийся ледяной кант.'),
        item('frame_void','cardFrame','void','Контур Бездны','void','epic',590,'Фиолетовый энергетический контур.'),
        item('frame_jade','cardFrame','jade','Нефритовый Контур','frame','epic',620,'Зелёный духовный кант с мягким свечением.'),
        item('frame_royal','cardFrame','royal','Королевская Оправа','crown','legendary',1150,'Двойной золотой контур для коллекционной колоды.'),

        item('prime_standard','primeEffect','standard','Стандартный Prime','prime','common',0,'Классическое свечение Prime.'),
        item('prime_flame','primeEffect','flame','Алое Пробуждение','flame','rare',280,'Prime раскрывается алым жаром.'),
        item('prime_frost','primeEffect','frost','Ледяное Пробуждение','snow','rare',320,'Prime окружает морозное сияние.'),
        item('prime_void','primeEffect','void','Разлом Бездны','void','epic',610,'Prime искажает пространство фиолетовой волной.'),
        item('prime_lightning','primeEffect','lightning','Громовой Разряд','lightning','legendary',980,'Яркий электрический импульс вокруг Prime-карты.'),

        item('bg_standard','menuBackground','standard','Ночная Арена','background','common',0,'Базовый фон главного меню.'),
        item('bg_soul_dusk','menuBackground','soul-dusk','Сумерки Душ','background','common',220,'Холодный туман и глубокие синие тени.'),
        item('bg_crimson','menuBackground','crimson','Багровая Буря','flame','rare',390,'Тёмно-красное небо с энергетическими всполохами.'),
        item('bg_hollow','menuBackground','hollow','Ночь Пустоты','void','epic',640,'Почти чёрный фон с фиолетовым разломом.'),
        item('bg_astral','menuBackground','astral','Астральные Врата','background','legendary',1080,'Звёздное пространство и светящиеся духовные врата.'),

        item('profile_standard','profileFrame','standard','Базовый Профиль','profile','common',0,'Стандартная рамка аватара.'),
        item('profile_steel','profileFrame','steel','Стальной Знак','profile','common',170,'Строгая металлическая рамка.'),
        item('profile_frost','profileFrame','frost','Морозный Знак','snow','rare',330,'Светлая ледяная рамка профиля.'),
        item('profile_abyss','profileFrame','abyss','Знак Бездны','void','epic',600,'Фиолетовый ореол вокруг аватара.'),
        item('profile_gold','profileFrame','gold','Золотой Знак','crown','legendary',1000,'Премиальная золотая рамка профиля.'),

        item('victory_standard','victoryEffect','standard','Классическая Победа','trophy','common',0,'Базовая эмблема победы.'),
        item('victory_sparks','victoryEffect','sparks','Искры Победителя','trophy','common',190,'Россыпь горячих искр вокруг трофея.'),
        item('victory_frost','victoryEffect','frost','Морозный Триумф','snow','rare',360,'Холодное кольцо и ледяные блики.'),
        item('victory_void','victoryEffect','void','Триумф Бездны','void','epic',650,'Трофей погружается в фиолетовый энергетический импульс.'),
        item('victory_royal','victoryEffect','royal','Королевский Триумф','crown','legendary',1120,'Золотые лучи и торжественное сияние.'),

        item('selection_standard','selectionEffect','standard','Обычный Выбор','target','common',0,'Стандартная подсветка выбранного бойца.'),
        item('selection_ember','selectionEffect','ember','Огненный След','flame','common',200,'Тёплый след вокруг выбранной карты.'),
        item('selection_frost','selectionEffect','frost','Ледяной Скан','snow','rare',350,'Холодная сканирующая подсветка.'),
        item('selection_void','selectionEffect','void','Рябь Бездны','void','epic',620,'Пульсирующее фиолетовое кольцо выбора.'),

        item('title_recruit','title','recruit','Рекрут Арены','tag','common',0,'Базовый титул профиля.'),
        item('title_strategist','title','strategist','Стратег','tag','common',240,'Для тех, кто любит выигрывать решением, а не удачей.'),
        item('title_void_tactician','title','void-tactician','Тактик Бездны','void','rare',420,'Холодный титул расчётливого дуэлянта.'),
        item('title_arena_lord','title','arena-lord','Владыка Арены','tag','epic',700,'Титул опытного хозяина офлайн-арены.'),
        item('title_master_hunter','title','master-hunter','Охотник на Мастера','crown','epic',760,'Косметический титул для опытного охотника на сильнейшего ИИ.'),
        item('title_draft_lord','title','draft-lord','Повелитель Драфта','tag','legendary',1200,'Самый престижный титул из обычной коллекции магазина.'),

        /* R22 achievement-exclusive cosmetics: visible in the catalog, impossible to buy. */
        item('back_phoenix','cardBack','phoenix','Печать Возвращения','flame','legendary',0,'Эксклюзив за камбэк со счёта 0:4.',true),
        item('frame_masterfall','cardFrame','masterfall','Оправа Павшего Мастера','crown','legendary',0,'Эксклюзив за первую победу над Мастером.',true),
        item('profile_archivist','profileFrame','archivist','Печать Архивариуса','profile','legendary',0,'Эксклюзив за встречу со всеми 75 персонажами.',true),
        item('bg_legend','menuBackground','legend','Горизонт Легенды','crown','legendary',0,'Эксклюзив за достижение 1700 Elo.',true),
        item('title_master_slayer','title','master-slayer','Покоритель Мастера','crown','legendary',0,'Эксклюзивный титул за 10 побед над Мастером.',true),
    ]);
    const ITEM_BY_ID = Object.freeze(Object.fromEntries(CATALOG.map(x => [x.id, x])));
    const DEFAULT_BY_CATEGORY = Object.freeze(Object.fromEntries(CATEGORY_ORDER.map(cat => [cat, CATALOG.find(x => x.category === cat && x.price === 0)?.id]).filter(x=>x[1])));

    function clone(value){ return JSON.parse(JSON.stringify(value)); }
    function createDefaultState(){
        return {
            schemaVersion: SCHEMA_VERSION,
            owned: Object.values(DEFAULT_BY_CATEGORY),
            equipped: {...DEFAULT_BY_CATEGORY},
            totalPurchases: 0,
            totalCoinsSpent: 0,
            history: []
        };
    }
    function normalizeState(value){
        const base=createDefaultState();
        const src=value && typeof value==='object' ? value : {};
        const owned=new Set(base.owned);
        if(Array.isArray(src.owned)) src.owned.forEach(id=>{ if(ITEM_BY_ID[id]) owned.add(id); });
        const equipped={...base.equipped};
        for(const cat of CATEGORY_ORDER){
            const id=src.equipped && src.equipped[cat];
            if(id && ITEM_BY_ID[id]?.category===cat && owned.has(id)) equipped[cat]=id;
        }
        const history=Array.isArray(src.history) ? src.history.filter(x=>x&&ITEM_BY_ID[x.itemId]).slice(-50) : [];
        return {
            schemaVersion:SCHEMA_VERSION,
            owned:[...owned],
            equipped,
            totalPurchases:Math.max(0,Number.parseInt(src.totalPurchases,10)||0),
            totalCoinsSpent:Math.max(0,Number.parseInt(src.totalCoinsSpent,10)||0),
            history
        };
    }
    function purchase(value,itemId,coinBalance,now=Date.now()){
        const state=normalizeState(value); const target=ITEM_BY_ID[itemId]; const coins=Math.max(0,Number.parseInt(coinBalance,10)||0);
        if(!target) return Object.freeze({ok:false,reason:'unknown-item',state:Object.freeze(state),coinsAfter:coins});
        if(state.owned.includes(itemId)) return Object.freeze({ok:true,alreadyOwned:true,state:Object.freeze(state),coinsAfter:coins,item:target});
        if(target.achievementOnly) return Object.freeze({ok:false,reason:'achievement-only',state:Object.freeze(state),coinsAfter:coins,item:target});
        if(coins<target.price) return Object.freeze({ok:false,reason:'insufficient-coins',state:Object.freeze(state),coinsAfter:coins,item:target});
        const next=normalizeState(state); next.owned.push(itemId); next.totalPurchases+=1; next.totalCoinsSpent+=target.price;
        next.history=[...next.history,{type:'purchase',itemId,coins:target.price,at:Number(now)}].slice(-50);
        return Object.freeze({ok:true,alreadyOwned:false,state:Object.freeze(next),coinsAfter:coins-target.price,item:target});
    }
    function equip(value,itemId,now=Date.now()){
        const state=normalizeState(value); const target=ITEM_BY_ID[itemId];
        if(!target) return Object.freeze({ok:false,reason:'unknown-item',state:Object.freeze(state)});
        if(!state.owned.includes(itemId)) return Object.freeze({ok:false,reason:'not-owned',state:Object.freeze(state),item:target});
        const next=normalizeState(state); next.equipped[target.category]=itemId;
        next.history=[...next.history,{type:'equip',itemId,at:Number(now)}].slice(-50);
        return Object.freeze({ok:true,state:Object.freeze(next),item:target});
    }
    function grant(value,itemId,now=Date.now(),source='achievement'){
        const state=normalizeState(value); const target=ITEM_BY_ID[itemId];
        if(!target) return Object.freeze({ok:false,reason:'unknown-item',state:Object.freeze(state),item:null});
        if(state.owned.includes(itemId)) return Object.freeze({ok:true,alreadyOwned:true,state:Object.freeze(state),item:target});
        const next=normalizeState(state); next.owned.push(itemId); next.history=[...next.history,{type:'grant',itemId,source:String(source||'achievement'),at:Number(now)}].slice(-50);
        return Object.freeze({ok:true,alreadyOwned:false,state:Object.freeze(next),item:target});
    }
    function getEquippedItems(value){ const state=normalizeState(value); return Object.freeze(Object.fromEntries(CATEGORY_ORDER.map(cat=>[cat,ITEM_BY_ID[state.equipped[cat]]]))); }
    function validate(){
        const errors=[]; const ids=new Set();
        if(CATALOG.length<30||CATALOG.length>60) errors.push('Catalog size must be 30..60');
        for(const x of CATALOG){
            if(ids.has(x.id)) errors.push('Duplicate id '+x.id); ids.add(x.id);
            if(!CATEGORY_META[x.category]) errors.push('Unknown category '+x.category);
            if(!RARITY_META[x.rarity]) errors.push('Unknown rarity '+x.rarity);
            if(!Number.isInteger(x.price)||x.price<0) errors.push('Invalid price '+x.id);
            if(x.achievementOnly && x.price!==0) errors.push('Achievement-only item must not have coin price '+x.id);
        }
        for(const cat of CATEGORY_ORDER){ if(!DEFAULT_BY_CATEGORY[cat]) errors.push('Missing free default '+cat); }
        const def=createDefaultState();
        if(def.owned.length!==CATEGORY_ORDER.length) errors.push('Default owned count mismatch');
        const sample=CATALOG.find(x=>x.price>0&&!x.achievementOnly); const fail=purchase(def,sample.id,sample.price-1);
        if(fail.ok) errors.push('Insufficient purchase succeeded');
        const ok=purchase(def,sample.id,sample.price); if(!ok.ok||ok.coinsAfter!==0) errors.push('Purchase math failed');
        const eq=equip(ok.state,sample.id); if(!eq.ok||eq.state.equipped[sample.category]!==sample.id) errors.push('Equip failed');
        const exclusive=CATALOG.find(x=>x.achievementOnly); if(exclusive){ if(purchase(def,exclusive.id,999999).ok) errors.push('Achievement-only purchase succeeded'); const g=grant(def,exclusive.id); if(!g.ok||!g.state.owned.includes(exclusive.id)) errors.push('Achievement grant failed'); }
        return Object.freeze({ok:errors.length===0,engineVersion:ENGINE_VERSION,schemaVersion:SCHEMA_VERSION,catalogSize:CATALOG.length,categories:CATEGORY_ORDER.length,defaults:Object.freeze({...DEFAULT_BY_CATEGORY}),errors:Object.freeze(errors)});
    }
    window.SOUL_ARENA_SHOP_ENGINE=Object.freeze({engineVersion:ENGINE_VERSION,schemaVersion:SCHEMA_VERSION,catalog:CATALOG,itemById:ITEM_BY_ID,categoryOrder:CATEGORY_ORDER,categoryMeta:CATEGORY_META,rarityMeta:RARITY_META,defaults:DEFAULT_BY_CATEGORY,createDefaultState,normalizeState,purchase,grant,equip,getEquippedItems,validate});
})();
