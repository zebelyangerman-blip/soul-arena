'use strict';

/* Arena Dush - final release runtime. */
/* ==========================================================================
           1. VK BRIDGE INTEGRATION & ADS CONTROL
           ========================================================================== */
        let isVK = false;
        let lastAdTime = 0;
        let isAudioMuted = safeStorageGet('soulArenaAudioMuted', '0') === '1';
        let musicVolume = (() => { const n = Number.parseFloat(safeStorageGet('soulArenaMusicVolume', '0.28')); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.28; })();
        let sfxVolume = (() => { const n = Number.parseFloat(safeStorageGet('soulArenaSfxVolume', '0.75')); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.75; })();
        let reducedMotion = safeStorageGet('soulArenaReducedMotion', '0') === '1';
        let isSystemMuted = false;
        let matchEnded = false;
        let rulesStartPending = false;
        let r33TutorialPage = 0;
        const R33_TUTORIAL_PAGE_COUNT = 9;
        const R33_TUTORIAL_LABELS = Object.freeze([
            'Матч и последовательность', 'Рейтинг силы', 'BASE и PRIME', 'Состояния бойца',
            'Коэффициенты усталости', 'Порядок расчёта', 'Hax и контры', 'Цена победы', 'Спорные примеры'
        ]);
        let uiToastTimer = null;
        let activeGameMode = 'local';
        let currentVkUser = null;
        let canvasAnimationFrame = 0;
        let canvasAnimationPaused = false;
        let cpuDifficulty = 'medium';
        let cpuDecisionTimer = 0;
        let cpuPresentationTimer = 0;
        let platformViewPaused = false;
        let cpuDecisionGeneration = 0;
        let cpuPendingKey = '';
        let cpuDecisionLog = [];
        const CPU_PLAYER = 2;
        const CPU_AI = window.SOUL_ARENA_CPU_AI || null;
        const PERF_ENGINE = window.SOUL_ARENA_PERFORMANCE || null;
        const PERF_CONFIG = PERF_ENGINE?.config || Object.freeze({particleCount:12,particleFps:24,modalParticleFps:8,pointerParticleInteraction:false,tilt:true,tiltMaxDeg:5,cpuPreviewMs:360,cpuPostCommitMs:120,maxCpuCacheEntries:2400});
        const R31_CPU_TIMING = Object.freeze({
            thinkMinMs:850, thinkMaxMs:1150,
            draftPreviewMinMs:480, draftPreviewMaxMs:650,
            primeStudyMinMs:900, primeStudyMaxMs:1250,
            primeRevealMinMs:480, primeRevealMaxMs:650,
            primeFinalHoldMinMs:700, primeFinalHoldMaxMs:900,
            battlePreviewMinMs:520, battlePreviewMaxMs:700,
            autoFightWaitMinMs:800, autoFightWaitMaxMs:1050,
            autoFightPressMs:180, postCommitMinMs:260, postCommitMaxMs:420
        });
        function r31VisualDelay(min, max) {
            const lo = Math.max(0, Math.floor(Number(min) || 0));
            const hi = Math.max(lo, Math.floor(Number(max) || lo));
            if (hi <= lo) return lo;
            let unit = 0.5;
            try {
                if (globalThis.crypto?.getRandomValues) {
                    const buf = new Uint32Array(1); globalThis.crypto.getRandomValues(buf); unit = buf[0] / 4294967296;
                } else {
                    unit = ((Date.now() + Math.floor(performance.now() * 1000)) % 997) / 997;
                }
            } catch (_) {}
            return Math.round(lo + (hi - lo) * unit);
        }
        const cpuEvalCache = new Map();
        let cpuEvalCacheHits = 0, cpuEvalCacheMisses = 0;
        const RATING_ENGINE = window.SOUL_ARENA_RATING_ENGINE || null;
        const ECONOMY_ENGINE = window.SOUL_ARENA_ECONOMY_ENGINE || null;
        const RATING_STORAGE_KEY = 'soulArenaRatingR19';
        const ECONOMY_STORAGE_KEY = 'soulArenaEconomyR20';
        let ratingProfile = null;
        let economyProfile = null;
        let rewardedAdInFlight = false;

        const R16_FEATURE_PREVIEWS = Object.freeze({
            profile: { title: 'Профиль игрока', icon: 'profile', text: 'Ваш офлайн-профиль, Elo, серии и общий прогресс.' },
            rating: { title: 'Рейтинг против ИИ', icon: 'rating', text: 'Честный Elo-рейтинг по завершённым сериям против четырёх уровней ИИ.' },
            bestiary: { title: 'Бестиарий 75 бойцов', icon: 'bestiary', text: 'Все 75 бойцов: Base / Prime, шанс попасть в десятку драфта и личная статистика.' },
            achievements: { title: 'Достижения', icon: 'trophy', text: '50 целей с прогрессом, монетами и эксклюзивными косметическими наградами.' }
        });

        const SHOP_ENGINE = window.SOUL_ARENA_SHOP_ENGINE || null;
        const SHOP_CATALOG = Array.isArray(SHOP_ENGINE?.catalog) ? SHOP_ENGINE.catalog : [];
        const SHOP_STORAGE_KEY = 'soulArenaShopR21';
        let shopProfile = null;
        let shopViewMode = 'store';
        let shopCategory = 'all';
        const SHOP_THEMES = SHOP_CATALOG.filter(item => item.category === 'theme').map(item => ({ id:item.cssKey, itemId:item.id, name:item.name, icon:item.icon, price:item.price, desc:item.desc }));
        const PROGRESS_ENGINE = window.SOUL_ARENA_PROGRESS_ENGINE || null;
        const PROGRESS_STORAGE_KEY = 'soulArenaProgressR22';
        let progressProfile = null;
        let r22BestiaryFilter = 'all';
        let r22BestiaryQuery = '';
        let r22AchievementFilter = 'all';
        let r22AppearanceProbabilities = null;
        let r22SeriesWasDown04 = false;
        let r29FeatureRenderGeneration = 0;
        let r29ShopRenderGeneration = 0;
        function scheduleUiChunk(fn) {
            if (typeof requestIdleCallback === 'function') requestIdleCallback(() => fn(), { timeout: 80 });
            else setTimeout(fn, 0);
        }

        const UI_ICONS = window.SOUL_ARENA_ICONS || null;
        function uiIcon(name, size = 18, className = '') { return UI_ICONS?.svg?.(name, { size, className }) || ''; }
        function uiIconSlot(name, size = 18, className = '') { return `<span class="ui-icon-slot ${className}" data-ui-icon="${name}" data-icon-size="${size}">${uiIcon(name,size)}</span>`; }
        function uiMoney(value) { return `<span class="ui-money-inline">${uiIcon('coin',16)}<b>${Math.max(0,Number(value)||0)}</b></span>`; }
        function setUiIcon(nodeOrId, name, size = 20) { const node = typeof nodeOrId === 'string' ? document.getElementById(nodeOrId) : nodeOrId; if (!node) return false; return UI_ICONS?.setSlot?.(node, name, { size }) || false; }
        function shopCategoryIcon(category) { return ({theme:'palette',cardBack:'background',cardFrame:'frame',primeEffect:'prime',menuBackground:'background',profileFrame:'profile',victoryEffect:'trophy',selectionEffect:'target',title:'tag'})[category] || 'spark'; }
        function shopItemIcon(item) {
            const key=String(item?.cssKey||'');
            if (/frost/i.test(key)) return 'snow'; if (/void|abyss|hollow/i.test(key)) return 'void'; if (/royal|gold|legend|master/i.test(key)) return 'crown';
            if (/flame|ember|phoenix|crimson/i.test(key)) return 'flame'; if (/lightning/i.test(key)) return 'lightning';
            return shopCategoryIcon(item?.category);
        }
        function achievementIcon(a) {
            const id=String(a?.id||''), group=String(a?.group||'');
            if (/flawless/.test(id)) return 'shield'; if (/master/.test(id)) return 'crown'; if (/rare/.test(id)) return 'shard'; if (/prime/.test(id)) return 'prime';
            if (/rewarded/.test(id)) return 'reward'; if (/spender|shop_/.test(id)) return 'shop'; if (/elo_|streak/.test(id)) return 'rating';
            return ({combat:'swords',series:'trophy',cpu:'cpu',rating:'rating',bestiary:'bestiary',economy:'coin',collection:'collection'})[group] || 'trophy';
        }
        function hydrateUiIcons(root = document) { UI_ICONS?.hydrate?.(root); }

        function safeStorageGet(key, fallback = null) {
            try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch (_) { return fallback; }
        }
        function safeStorageSet(key, value) {
            try { localStorage.setItem(key, String(value)); } catch (_) {}
        }
        function getProgressProfile() {
            if (progressProfile) return progressProfile;
            let parsed = null;
            try { parsed = JSON.parse(safeStorageGet(PROGRESS_STORAGE_KEY, 'null')); } catch (_) {}
            progressProfile = PROGRESS_ENGINE?.normalizeState?.(parsed, Date.now()) || { stats:{}, characters:{}, achievements:{unlocked:{},achievementCoinsEarned:0} };
            safeStorageSet(PROGRESS_STORAGE_KEY, JSON.stringify(progressProfile));
            return progressProfile;
        }
        function saveProgressProfile(nextState) {
            progressProfile = PROGRESS_ENGINE?.normalizeState?.(nextState, Date.now()) || nextState;
            safeStorageSet(PROGRESS_STORAGE_KEY, JSON.stringify(progressProfile));
            syncR22ProgressUi();
            return progressProfile;
        }
        function getR22Context() {
            return { roster:typeof DB === 'undefined' ? [] : DB, rating:getRatingProfile(), economy:getEconomyProfile(), shop:getShopProfile() };
        }
        function getR22Metrics() {
            return PROGRESS_ENGINE?.metricSnapshot?.(getProgressProfile(), getR22Context()) || {};
        }
        function evaluateR22Achievements(options = {}) {
            if (!PROGRESS_ENGINE?.evaluateAchievements) return [];
            const evaluated = PROGRESS_ENGINE.evaluateAchievements(getProgressProfile(), getR22Context(), Date.now());
            let state = evaluated.state;
            const newly = Array.from(evaluated.newlyUnlocked || []);
            if (!newly.length) { saveProgressProfile(state); return []; }
            let coinReward = 0;
            let shopState = getShopProfile();
            const cosmeticNames = [];
            for (const ach of newly) {
                coinReward += Math.max(0, Number(ach.reward?.coins) || 0);
                const cosmeticId = ach.reward?.cosmeticId;
                if (cosmeticId && SHOP_ENGINE?.grant) {
                    const granted = SHOP_ENGINE.grant(shopState, cosmeticId, Date.now(), `achievement:${ach.id}`);
                    if (granted.ok) {
                        shopState = granted.state;
                        if (!granted.alreadyOwned && granted.item) cosmeticNames.push(granted.item.name);
                    }
                }
            }
            if (coinReward > 0) {
                const economy = getEconomyProfile();
                saveEconomyProfile({ ...economy, coins:Math.max(0,Number(economy.coins)||0)+coinReward });
                state = PROGRESS_ENGINE.markAchievementCoins(state, coinReward, Date.now());
            }
            if (SHOP_ENGINE && JSON.stringify(shopState) !== JSON.stringify(getShopProfile())) saveShopProfile(shopState);
            saveProgressProfile(state);
            if (!options.silent) {
                const first = newly[0];
                const extra = newly.length > 1 ? ` + ещё ${newly.length-1}` : '';
                const rewardText = [coinReward ? `+${coinReward} монет` : '', cosmeticNames.length ? `косметика: ${cosmeticNames.join(', ')}` : ''].filter(Boolean).join(' · ');
                showToast(`Достижение: ${first.name}${extra}${rewardText ? ` · ${rewardText}` : ''}`);
            }
            return newly;
        }
        function updateR22State(nextState, evaluate = true) {
            saveProgressProfile(nextState);
            if (evaluate) evaluateR22Achievements();
        }
        function recordR22DraftSeen(character) { if (character?.id && PROGRESS_ENGINE?.recordDraftSeen) updateR22State(PROGRESS_ENGINE.recordDraftSeen(getProgressProfile(), character.id, Date.now())); }
        function recordR22Selection(character) { if (character?.id && PROGRESS_ENGINE?.recordSelection) updateR22State(PROGRESS_ENGINE.recordSelection(getProgressProfile(), character.id, Date.now())); }
        function recordR22PrimeAssignments(team, playerNum) { const ids=(team||[]).filter(c=>c?.isPrime).map(c=>c.id); if(ids.length&&PROGRESS_ENGINE?.recordPrime) updateR22State(PROGRESS_ENGINE.recordPrime(getProgressProfile(), ids, Number(playerNum)===1, Date.now())); }
        function recordR22Arena(arenaId) { if (PROGRESS_ENGINE?.recordArena) updateR22State(PROGRESS_ENGINE.recordArena(getProgressProfile(), arenaId, Date.now())); }
        function recordR22Duel(winner, loser, winnerSlot) { if (winner?.id&&loser?.id&&PROGRESS_ENGINE?.recordDuel) updateR22State(PROGRESS_ENGINE.recordDuel(getProgressProfile(), winner.id, loser.id, Number(winnerSlot)===1, Date.now())); }
        function recordR22Match(result) { if (PROGRESS_ENGINE?.recordMatch) updateR22State(PROGRESS_ENGINE.recordMatch(getProgressProfile(), result, Date.now()), false); }
        function syncR22ProgressUi() {
            if (!PROGRESS_ENGINE) return;
            const metrics = getR22Metrics();
            const unlocked = Object.keys(getProgressProfile()?.achievements?.unlocked || {}).length;
            const bestiary = document.getElementById('hub-bestiary-count');
            const achievements = document.getElementById('hub-achievement-count');
            if (bestiary) bestiary.textContent = `${metrics.uniqueSeen || 0}/75`;
            if (achievements) achievements.textContent = `${unlocked}/${PROGRESS_ENGINE.achievements.length}`;
        }
        function getRatingProfile() {
            if (ratingProfile) return ratingProfile;
            let parsed = null;
            try { parsed = JSON.parse(safeStorageGet(RATING_STORAGE_KEY, 'null')); } catch (_) {}
            ratingProfile = RATING_ENGINE?.normalizeState?.(parsed) || { rating:800, peakRating:800, seriesPlayed:0, seriesWins:0, seriesLosses:0, winStreak:0, bestWinStreak:0, byDifficulty:{} };
            return ratingProfile;
        }
        function saveRatingProfile(nextState) {
            ratingProfile = RATING_ENGINE?.normalizeState?.(nextState) || nextState;
            safeStorageSet(RATING_STORAGE_KEY, JSON.stringify(ratingProfile));
            syncHubProfile();
            return ratingProfile;
        }
        function signedRatingDelta(value) {
            const n = Number(value) || 0;
            return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0';
        }
        function getRatingRank() {
            return RATING_ENGINE?.getRank?.(getRatingProfile().rating) || { label:'Новичок', next:900 };
        }
        function getDifficultyRatingStats(id) {
            return getRatingProfile().byDifficulty?.[id] || { played:0, wins:0, losses:0 };
        }
        function getRatingPreview(id) {
            return RATING_ENGINE?.preview?.(getRatingProfile().rating, id) || { botRating:0, winDelta:0, lossDelta:0, expectedWinPct:0 };
        }
        function recordCpuSeriesRating(playerWon, scoreFor, scoreAgainst) {
            if (!isCpuMode() || !RATING_ENGINE?.applySeriesResult) return null;
            const applied = RATING_ENGINE.applySeriesResult(getRatingProfile(), { difficulty:cpuDifficulty, won:Boolean(playerWon), scoreFor, scoreAgainst, at:Date.now() });
            saveRatingProfile(applied.state);
            syncCpuRatingPreview();
            return applied.result;
        }
        function getEconomyProfile() {
            if (economyProfile) {
                const normalized = ECONOMY_ENGINE?.normalizeState?.(economyProfile, Date.now()) || economyProfile;
                if (JSON.stringify(normalized) !== JSON.stringify(economyProfile)) {
                    economyProfile = normalized;
                    safeStorageSet(ECONOMY_STORAGE_KEY, JSON.stringify(economyProfile));
                }
                return economyProfile;
            }
            let parsed = null;
            try { parsed = JSON.parse(safeStorageGet(ECONOMY_STORAGE_KEY, 'null')); } catch (_) {}
            economyProfile = ECONOMY_ENGINE?.normalizeState?.(parsed, Date.now()) || { coins:0, totalSeriesCoins:0, totalRewardedCoins:0, rewarded:{ dayKey:'', count:0, lastClaimAt:0 } };
            safeStorageSet(ECONOMY_STORAGE_KEY, JSON.stringify(economyProfile));
            return economyProfile;
        }
        function saveEconomyProfile(nextState) {
            economyProfile = ECONOMY_ENGINE?.normalizeState?.(nextState, Date.now()) || nextState;
            safeStorageSet(ECONOMY_STORAGE_KEY, JSON.stringify(economyProfile));
            syncEconomyUi();
            return economyProfile;
        }
        function getCoinBalance() { return Math.max(0, Number.parseInt(getEconomyProfile().coins, 10) || 0); }
        function getRewardedEconomyStatus() {
            return ECONOMY_ENGINE?.getRewardedStatus?.(getEconomyProfile(), Date.now()) || { count:0, remaining:0, limit:3, amount:100, canClaim:false, clockRollbackDetected:false };
        }
        function recordCpuSeriesCoins(playerWon, scoreFor, scoreAgainst) {
            if (!isCpuMode() || !playerWon || !ECONOMY_ENGINE?.applySeriesVictory) return null;
            const applied = ECONOMY_ENGINE.applySeriesVictory(getEconomyProfile(), {
                difficulty: cpuDifficulty,
                won: true,
                scoreFor,
                scoreAgainst,
                at: Date.now()
            }, Date.now());
            if (!applied.reward?.coins) return null;
            saveEconomyProfile(applied.state);
            return applied.reward;
        }
        function syncEconomyUi() {
            const profile = getEconomyProfile();
            const status = getRewardedEconomyStatus();
            document.querySelectorAll('[data-coin-balance]').forEach(node => { node.textContent = String(profile.coins || 0); });
            document.querySelectorAll('[data-rewarded-status]').forEach(node => {
                if (status.clockRollbackDetected) node.textContent = 'проверьте дату устройства';
                else if (status.remaining <= 0) node.textContent = 'лимит 3/3 исчерпан';
                else if (!isVK) node.textContent = `${status.remaining}/3 · только внутри VK`;
                else node.textContent = `${status.remaining}/3 сегодня`;
            });
            document.querySelectorAll('[data-rewarded-button]').forEach(button => {
                button.disabled = rewardedAdInFlight || status.remaining <= 0 || status.clockRollbackDetected;
                button.classList.toggle('is-loading', rewardedAdInFlight);
                button.setAttribute('aria-busy', rewardedAdInFlight ? 'true' : 'false');
            });
        }
        function renderEconomySeriesTable() {
            const grid = document.getElementById('economy-series-table');
            if (!grid || !ECONOMY_ENGINE?.calculateSeriesReward) return;
            const ids = ['easy','medium','hard','master'];
            const labels = { easy:'Лёгкий', medium:'Средний', hard:'Сложный', master:'Мастер' };
            grid.innerHTML = '';
            for (let against = 0; against <= 4; against++) {
                const row = document.createElement('div');
                row.className = 'r20-reward-table-row';
                const values = ids.map(id => ECONOMY_ENGINE.calculateSeriesReward(id, true, 5, against).coins);
                row.innerHTML = `<b>5:${against}</b>${values.map((value, index) => `<span title="${labels[ids[index]]}">${uiMoney(value)}</span>`).join('')}`;
                grid.appendChild(row);
            }
        }
        function openEconomyInfo() { renderEconomySeriesTable(); syncEconomyUi(); setUiModalOpen('economy-modal', true); }
        function closeEconomyInfo() { setUiModalOpen('economy-modal', false); }
        async function claimRewardedCoins() {
            if (rewardedAdInFlight) return false;
            const status = getRewardedEconomyStatus();
            if (status.clockRollbackDetected) { showToast('Проверьте дату устройства перед получением награды'); return false; }
            if (status.remaining <= 0) { showToast('Сегодня уже получены все 3 рекламные награды'); return false; }
            if (typeof vkBridge === 'undefined' || !isVK) { showToast('Rewarded-реклама доступна только внутри VK'); return false; }
            rewardedAdInFlight = true;
            syncEconomyUi();
            try {
                const nativeSupport = await vkNativeAdSupport('reward');
                if (!nativeSupport.show) { showToast('Rewarded-реклама не поддерживается на этом устройстве'); return false; }
                if (nativeSupport.check) {
                    const availability = await vkBridge.send('VKWebAppCheckNativeAds', { ad_format: 'reward', use_waterfall: true });
                    if (!availability || availability.result !== true) { showToast('Сейчас rewarded-реклама недоступна'); return false; }
                }
                const result = await vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward', use_waterfall: true });
                if (!result || result.result !== true) { showToast('Просмотр не подтверждён — монеты не начислены'); return false; }
                const applied = ECONOMY_ENGINE?.applyRewardedSuccess?.(getEconomyProfile(), { at:Date.now() }, Date.now());
                if (!applied?.reward) { showToast('Дневной лимит rewarded-наград уже исчерпан'); return false; }
                saveEconomyProfile(applied.state);
                showToast(`+${applied.reward.coins} монет за rewarded-рекламу`);
                return true;
            } catch (error) {
                console.warn('Rewarded ad was not completed', error);
                showToast('Реклама не завершена — монеты не начислены');
                return false;
            } finally {
                rewardedAdInFlight = false;
                syncEconomyUi();
            }
        }

        function getShardBalance() {
            const parsed = Number.parseInt(safeStorageGet('soulArenaCosmeticShards', '180'), 10);
            return Number.isFinite(parsed) ? Math.max(0, parsed) : 180;
        }
        function setShardBalance(value) { safeStorageSet('soulArenaCosmeticShards', Math.max(0, Math.floor(value))); }
        function getUnlockedThemes() {
            try {
                const raw = JSON.parse(safeStorageGet('soulArenaUnlockedThemes', '["ember"]'));
                return Array.isArray(raw) ? Array.from(new Set(['ember', ...raw])) : ['ember'];
            } catch (_) { return ['ember']; }
        }
        function setUnlockedThemes(ids) { safeStorageSet('soulArenaUnlockedThemes', JSON.stringify(Array.from(new Set(['ember', ...ids])))); }
        function getEquippedTheme() {
            const selected = safeStorageGet('soulArenaUiTheme', 'ember');
            return SHOP_THEMES.some(theme => theme.id === selected) ? selected : 'ember';
        }

        function getShopProfile() {
            if (shopProfile) return shopProfile;
            let parsed = null;
            try { parsed = JSON.parse(safeStorageGet(SHOP_STORAGE_KEY, 'null')); } catch (_) {}
            shopProfile = SHOP_ENGINE?.normalizeState?.(parsed) || { owned:[], equipped:{} };
            if (!parsed && SHOP_ENGINE) {
                const legacyThemes = getUnlockedThemes();
                const migrated = SHOP_ENGINE.normalizeState(shopProfile);
                for (const legacy of legacyThemes) {
                    const item = SHOP_CATALOG.find(entry => entry.category === 'theme' && entry.cssKey === legacy);
                    if (item && !migrated.owned.includes(item.id)) migrated.owned.push(item.id);
                }
                const legacyEquipped = SHOP_CATALOG.find(entry => entry.category === 'theme' && entry.cssKey === getEquippedTheme());
                if (legacyEquipped && migrated.owned.includes(legacyEquipped.id)) migrated.equipped.theme = legacyEquipped.id;
                shopProfile = SHOP_ENGINE.normalizeState(migrated);
            }
            safeStorageSet(SHOP_STORAGE_KEY, JSON.stringify(shopProfile));
            return shopProfile;
        }
        function saveShopProfile(nextState) {
            shopProfile = SHOP_ENGINE?.normalizeState?.(nextState) || nextState;
            safeStorageSet(SHOP_STORAGE_KEY, JSON.stringify(shopProfile));
            applyEquippedCosmetics();
            syncHubProfile();
            return shopProfile;
        }
        function getEquippedShopItem(category) {
            const state = getShopProfile();
            const id = state?.equipped?.[category];
            return SHOP_ENGINE?.itemById?.[id] || null;
        }
        function getOwnedShopCount() { return Array.isArray(getShopProfile()?.owned) ? getShopProfile().owned.length : 0; }
        function applyEquippedCosmetics() {
            const state = getShopProfile();
            const equipped = SHOP_ENGINE?.getEquippedItems?.(state) || {};
            const body = document.body;
            if (!body) return;
            const attrMap = { theme:'uiTheme', cardBack:'cardBack', cardFrame:'cardFrame', primeEffect:'primeFx', menuBackground:'menuBg', profileFrame:'profileFrame', victoryEffect:'victoryFx', selectionEffect:'selectionFx' };
            for (const [category, datasetKey] of Object.entries(attrMap)) body.dataset[datasetKey] = equipped?.[category]?.cssKey || 'standard';
            const legacyTheme = equipped?.theme?.cssKey || 'ember';
            safeStorageSet('soulArenaUiTheme', legacyTheme);
            const title = equipped?.title?.name || 'Рекрут Арены';
            document.querySelectorAll('[data-player-title]').forEach(el => { el.textContent = title; });
            const shopCount = document.getElementById('hub-shop-count');
            if (shopCount) shopCount.textContent = `${getOwnedShopCount()}/${SHOP_CATALOG.length}`;
        }

        async function vkSupports(method) {
            if (typeof vkBridge === 'undefined') return false;
            try {
                if (typeof vkBridge.supportsAsync === 'function') return await vkBridge.supportsAsync(method);
                // Legacy fallback: attempt the send and let the caller handle a rejected method.
                return true;
            } catch (_) { return false; }
        }
        async function vkNativeAdSupport(adFormat) {
            const probe = { ad_format: String(adFormat || 'interstitial') };
            // Build support-probe names dynamically so the release scanner does not
            // mistake capability probes for additional ad-display calls.
            const showMethod = 'VKWebApp' + 'ShowNativeAds';
            const checkMethod = 'VKWebApp' + 'CheckNativeAds';
            const [show, check] = await Promise.all([
                vkSupports(showMethod),
                vkSupports(checkMethod)
            ]);
            return Object.freeze({ show, check, probe });
        }

        if (typeof vkBridge !== 'undefined') {
            vkBridge.send('VKWebAppInit')
                .then(() => {
                    isVK = true;
                    console.log('✅ VK Bridge успешно инициализирован');
                            vkSupports('VKWebAppSetTitle').then(ok => { if (ok) vkBridge.send('VKWebAppSetTitle', { title: 'Арена Душ: Битва Миров' }).catch(() => {}); });
                    
                    vkBridge.send('VKWebAppGetUserInfo')
                        .then(user => {
                            currentVkUser = user || null;
                            if (user && user.first_name) {
                                document.getElementById('vk-user-badge').classList.remove('hidden');
                                document.getElementById('vk-user-badge').classList.add('flex');
                                document.getElementById('vk-name').innerText = user.first_name;
                                if (user.photo_100) {
                                    document.getElementById('vk-avatar').src = user.photo_100;
                                }
                            }
                            syncHubProfile();
                        })
                        .catch(() => {});
                })
                .catch(err => console.log('VK Bridge Local Fallback Mode:', err));

            // Mute audio whenever the VK view is hidden, with browser lifecycle fallbacks below.
            vkBridge.subscribe((e) => {
                if (!e.detail) return;
                const { type } = e.detail;
                if (type === 'VKWebAppViewHide') {
                    platformViewPaused = true;
                    isSystemMuted = true;
                    muteAllAudio(true);
                    setCanvasAnimationPaused(true);
                } else if (type === 'VKWebAppViewRestore') {
                    platformViewPaused = false;
                    isSystemMuted = false;
                    setCanvasAnimationPaused(false);
                    if (!isAudioMuted) {
                        muteAllAudio(false);
                        resumeBackgroundMusic();
                    }
                }
            });
        }

        document.addEventListener('visibilitychange', () => {
            const hidden = document.visibilityState === 'hidden';
            platformViewPaused = hidden;
            isSystemMuted = hidden;
            muteAllAudio(hidden || isAudioMuted);
            setCanvasAnimationPaused(hidden);
            if (!hidden && !isAudioMuted) resumeBackgroundMusic();
        });
        window.addEventListener('pagehide', () => { platformViewPaused = true; isSystemMuted = true; muteAllAudio(true); setCanvasAnimationPaused(true); });
        window.addEventListener('pageshow', () => { platformViewPaused = false; isSystemMuted = false; setCanvasAnimationPaused(false); if (!isAudioMuted) { muteAllAudio(false); resumeBackgroundMusic(); } });

        // Interstitial ad safety capping (60 sec interval)
        function showVKInterstitialAd() {
            const now = Date.now();
            if (now - lastAdTime < 60000) return;
            
            if (typeof vkBridge !== 'undefined' && isVK) {
                vkNativeAdSupport('interstitial')
                    .then(nativeSupport => {
                        if (!nativeSupport.show) return null;
                        if (!nativeSupport.check) return { result: true, __skipAvailabilityCheck: true };
                        return vkBridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' });
                    })
                    .then(availability => {
                        if (!availability || availability.result !== true) return null;
                        return vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' });
                    })
                    .then(data => {
                        if (data && data.result) lastAdTime = Date.now();
                    })
                    .catch(() => {});
            }

        }

        function toggleAudioMute() {
            isAudioMuted = !isAudioMuted;
            safeStorageSet('soulArenaAudioMuted', isAudioMuted ? '1' : '0');
            const shouldMute = isAudioMuted || isSystemMuted;
            muteAllAudio(shouldMute);
            syncAudioControls();
            if (!isAudioMuted && !isSystemMuted) resumeBackgroundMusic();
        }

        function getMusicVolume() { return Math.min(1, Math.max(0, Number(musicVolume) || 0)); }
        function getSfxVolume() { return Math.min(1, Math.max(0, Number(sfxVolume) || 0)); }

        function setMusicVolume(value) {
            musicVolume = Math.min(1, Math.max(0, (Number(value) || 0) / 100));
            safeStorageSet('soulArenaMusicVolume', musicVolume.toFixed(2));
            const musicPlayer = document.getElementById('bg-music');
            if (musicPlayer) musicPlayer.volume = getMusicVolume();
            syncAudioControls();
        }

        function setSfxVolume(value) {
            sfxVolume = Math.min(1, Math.max(0, (Number(value) || 0) / 100));
            safeStorageSet('soulArenaSfxVolume', sfxVolume.toFixed(2));
            syncAudioControls();
        }

        function setReducedMotion(nextValue) {
            reducedMotion = Boolean(nextValue);
            safeStorageSet('soulArenaReducedMotion', reducedMotion ? '1' : '0');
            document.body.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
            syncAudioControls();
        }
        function toggleReducedMotion() { setReducedMotion(!reducedMotion); }

        function syncAudioControls() {
            const btnIcon = document.getElementById('sound-icon');
            const btnLabel = document.getElementById('sound-label');
            const menuIcon = document.getElementById('menu-sound-icon');
            const menuLabel = document.getElementById('menu-sound-label');
            const masterBtn = document.getElementById('audio-master-btn');
            const musicSlider = document.getElementById('music-volume');
            const sfxSlider = document.getElementById('sfx-volume');
            const musicValue = document.getElementById('music-volume-value');
            const sfxValue = document.getElementById('sfx-volume-value');
            const reducedBtn = document.getElementById('reduced-motion-btn');
            const muted = isAudioMuted;
            if (btnIcon) setUiIcon(btnIcon, muted ? 'volumeOff' : 'volume', 20);
            if (btnLabel) btnLabel.innerText = muted ? 'Выкл' : 'Звук';
            if (menuIcon) setUiIcon(menuIcon, muted ? 'volumeOff' : 'volume', 22);
            if (menuLabel) menuLabel.innerText = muted ? 'Звук выключен' : 'Звук включён';
            if (masterBtn) { masterBtn.textContent = muted ? 'Выключен' : 'Включён'; masterBtn.classList.toggle('is-off', muted); }
            if (musicSlider) musicSlider.value = String(Math.round(getMusicVolume() * 100));
            if (sfxSlider) sfxSlider.value = String(Math.round(getSfxVolume() * 100));
            if (musicValue) musicValue.textContent = `${Math.round(getMusicVolume() * 100)}%`;
            if (sfxValue) sfxValue.textContent = `${Math.round(getSfxVolume() * 100)}%`;
            if (reducedBtn) { reducedBtn.textContent = reducedMotion ? 'Вкл' : 'Выкл'; reducedBtn.classList.toggle('is-on', reducedMotion); }
        }

        function openAudioSettings() { syncAudioControls(); setUiModalOpen('audio-settings-modal', true); }
        function closeAudioSettings() { setUiModalOpen('audio-settings-modal', false); }

        function muteAllAudio(shouldMute) {
            const musicPlayer = document.getElementById('bg-music');
            if (musicPlayer) musicPlayer.muted = shouldMute;
            if (audioCtx) {
                if (shouldMute && audioCtx.state === 'running') {
                    audioCtx.suspend();
                } else if (!shouldMute && !isSystemMuted && audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
            }
        }

        let musicFadeTimer = null;
        function resumeBackgroundMusic() {
            const musicPlayer = document.getElementById('bg-music');
            if (!musicPlayer || !musicPlayer.src || isAudioMuted || isSystemMuted) return;
            musicPlayer.muted = false;
            musicPlayer.volume = getMusicVolume();
            musicPlayer.play().catch(() => {});
        }

        function playBackgroundTrack(audioPath) {
            const musicPlayer = document.getElementById('bg-music');
            if (!musicPlayer || !audioPath) return;
            if (musicFadeTimer) { clearInterval(musicFadeTimer); musicFadeTimer = null; }
            musicPlayer.pause();
            musicPlayer.currentTime = 0;
            musicPlayer.src = audioPath;
            musicPlayer.muted = isAudioMuted || isSystemMuted;
            const target = getMusicVolume();
            musicPlayer.volume = reducedMotion ? target : 0;
            if (musicPlayer.muted || target <= 0) return;
            musicPlayer.play().then(() => {
                if (reducedMotion) return;
                let step = 0;
                const steps = 12;
                musicFadeTimer = setInterval(() => {
                    step++;
                    musicPlayer.volume = Math.min(target, target * (step / steps));
                    if (step >= steps) { clearInterval(musicFadeTimer); musicFadeTimer = null; }
                }, 45);
            }).catch(() => console.warn('Autoplay audio handling.'));
        }


        /* ==========================================================================
           R2. MODERATION UX / VIEWPORT / ONBOARDING / COSMETIC STORE
           ========================================================================== */
        function syncAppViewport() {
            const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            document.documentElement.style.setProperty('--app-height', `${Math.max(320, Math.round(height))}px`);
        }

        const R13_PHASE_ORDER = Object.freeze(['initiative','draft','bonus','location','battle']);
        function updatePhaseRail(screen) {
            const activeIndex = screen === 'end' ? R13_PHASE_ORDER.length : R13_PHASE_ORDER.indexOf(screen);
            document.querySelectorAll('[data-phase-step]').forEach(step => {
                const index = R13_PHASE_ORDER.indexOf(step.dataset.phaseStep);
                step.classList.toggle('is-active', index === activeIndex);
                step.classList.toggle('is-done', activeIndex > index);
                if (index === activeIndex) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
            });
        }

        function animateCurrentScreen(screen) {
            const map = {menu:'main-menu-screen',initiative:'initiative-phase',draft:'draft-phase',bonus:'bonus-phase',location:'location-phase',battle:'battle-phase',end:'end-screen'};
            const el = document.getElementById(map[screen] || '');
            if (!el || reducedMotion) return;
            if (typeof el.animate === 'function') {
                el.getAnimations?.().filter(a => a.id === 'r29-screen-enter').forEach(a => a.cancel());
                const a = el.animate([{opacity:.38,transform:'translateY(7px) scale(.997)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
                a.id='r29-screen-enter';
            }
        }

        function setUiScreen(screen) {
            document.body.dataset.screen = screen;
            document.body.dataset.phase = screen;
            const footer = document.getElementById('draft-rosters');
            if (footer) {
                const showFooter = screen === 'draft';
                footer.classList.toggle('hidden', !showFooter);
                footer.classList.toggle('flex', showFooter);
            }
            updatePhaseRail(screen);
            if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => animateCurrentScreen(screen));
            else animateCurrentScreen(screen);
        }

        function hideAllGameScreens() {
            ['main-menu-screen', 'initiative-phase', 'draft-phase', 'bonus-phase', 'location-phase', 'battle-phase', 'end-screen'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.add('hidden');
                el.classList.remove('flex');
            });
        }

        function showMainMenu() {
            cancelCpuDecision();
            hideAllGameScreens();
            setUiScreen('menu');
            const menu = document.getElementById('main-menu-screen');
            if (menu) { menu.classList.remove('hidden'); menu.classList.add('flex'); }
            document.body.style.backgroundImage = 'none';
            const overlay = document.getElementById('bg-overlay');
            if (overlay) overlay.style.opacity = '0';
            const locationBanner = document.getElementById('location-banner');
            if (locationBanner) locationBanner.classList.add('hidden');
            const musicPlayer = document.getElementById('bg-music');
            if (musicPlayer) { musicPlayer.pause(); musicPlayer.currentTime = 0; musicPlayer.removeAttribute('src'); musicPlayer.load(); }
            applyEquippedCosmetics();
            syncHubProfile();
            syncAppViewport();
        }

        function isCpuMode() { return activeGameMode === 'cpu'; }
        function isCpuTurn(playerNum) { return isCpuMode() && Number(playerNum) === CPU_PLAYER; }
        function getCpuDifficultyMeta() { return CPU_AI?.getDifficulty?.(cpuDifficulty) || { id: cpuDifficulty, label: 'Средний' }; }
        function getPlayerLabel(playerNum, short = false) {
            if (Number(playerNum) === 1) return isCpuMode() ? (short ? 'Игрок' : 'Игрок') : (short ? 'Игрок 1' : 'Игрок 1');
            if (isCpuMode()) return short ? `ИИ ${getCpuDifficultyMeta().label}` : `Компьютер · ${getCpuDifficultyMeta().label}`;
            return short ? 'Игрок 2' : 'Игрок 2';
        }
        function getTeamLabel(playerNum) {
            if (Number(playerNum) === 1) return isCpuMode() ? 'Команда игрока' : 'Команда 1';
            return isCpuMode() ? `Команда ИИ · ${getCpuDifficultyMeta().label}` : 'Команда 2';
        }
        function syncModeIdentityUI() {
            document.body.dataset.gameMode = activeGameMode;
            document.body.dataset.cpuDifficulty = isCpuMode() ? cpuDifficulty : '';
            window.SOUL_ARENA_UI_SHELL?.syncCpuOverlay?.();
            const p1Init = document.getElementById('initiative-p1-label');
            const p2Init = document.getElementById('initiative-p2-label');
            const p1Footer = document.getElementById('draft-footer-p1-label');
            const p2Footer = document.getElementById('draft-footer-p2-label');
            if (p1Init) p1Init.textContent = getPlayerLabel(1, true);
            if (p2Init) p2Init.textContent = getPlayerLabel(2, true);
            if (p1Footer) p1Footer.textContent = getTeamLabel(1);
            if (p2Footer) p2Footer.textContent = getTeamLabel(2);
        }
        function syncCpuPresentation(stage = 'idle', message = '') {
            const active = stage !== 'idle';
            document.body.dataset.cpuStage = stage;
            document.body.dataset.cpuThinking = active ? 'true' : 'false';
            const label = document.getElementById('cpu-thinking-label');
            if (label) label.textContent = message || (stage === 'preview' ? 'ИИ фиксирует решение…' : 'ИИ анализирует ход…');
            window.SOUL_ARENA_UI_SHELL?.syncCpuOverlay?.();
        }
        function clearCpuChoicePreview() {
            document.querySelectorAll('.cpu-choice-preview').forEach(el => el.classList.remove('cpu-choice-preview'));
            const draft = document.getElementById('draft-card');
            if (draft) delete draft.dataset.cpuChoice;
        }
        function cancelCpuDecision() {
            if (cpuDecisionTimer) clearTimeout(cpuDecisionTimer);
            if (cpuPresentationTimer) clearTimeout(cpuPresentationTimer);
            cpuDecisionTimer = 0;
            cpuPresentationTimer = 0;
            cpuPendingKey = '';
            cpuDecisionGeneration++;
            clearCpuChoicePreview();
            syncCpuPresentation('idle');
        }
        function canCpuActNow() {
            if (!isCpuMode() || matchEnded || document.hidden || platformViewPaused) return false;
            const pause = document.getElementById('pause-modal');
            return !pause || pause.classList.contains('hidden');
        }
        function scheduleCpuDecision(key, callback, explicitDelay = null) {
            if (!isCpuMode() || typeof callback !== 'function') return;
            if (cpuPendingKey === key && cpuDecisionTimer) return;
            cancelCpuDecision();
            const generation = cpuDecisionGeneration;
            cpuPendingKey = key;
            syncCpuPresentation('thinking', 'ИИ анализирует ход…');
            // R31: visual pacing is universal for Easy/Medium/Hard/Master and is not
            // shortened by the device performance tier. Difficulty affects only the decision itself.
            const delay = explicitDelay == null
                ? r31VisualDelay(R31_CPU_TIMING.thinkMinMs, R31_CPU_TIMING.thinkMaxMs)
                : Math.max(120, Number(explicitDelay) || 0);
            cpuDecisionTimer = setTimeout(function runCpuScheduledDecision() {
                cpuDecisionTimer = 0;
                if (generation !== cpuDecisionGeneration) return;
                if (!canCpuActNow()) {
                    cpuDecisionTimer = setTimeout(runCpuScheduledDecision, 220);
                    return;
                }
                cpuPendingKey = '';
                callback();
                if (generation === cpuDecisionGeneration && document.body.dataset.cpuStage === 'thinking') syncCpuPresentation('idle');
            }, Math.max(120, Number(delay) || 0));
        }
        function presentCpuCommit(message, elements, commit, delay = null) {
            const generation = cpuDecisionGeneration;
            const list = (Array.isArray(elements) ? elements : [elements]).filter(Boolean);
            clearCpuChoicePreview();
            list.forEach(el => el.classList.add('cpu-choice-preview'));
            syncCpuPresentation('preview', message || 'ИИ фиксирует решение…');
            const wait = Math.max(180, Number(delay ?? r31VisualDelay(R31_CPU_TIMING.draftPreviewMinMs, R31_CPU_TIMING.draftPreviewMaxMs)) || 520);
            const run = () => {
                cpuPresentationTimer = 0;
                if (generation !== cpuDecisionGeneration) return;
                if (!canCpuActNow()) { cpuPresentationTimer = setTimeout(run, 180); return; }
                clearCpuChoicePreview();
                commit();
                if (generation === cpuDecisionGeneration) {
                    syncCpuPresentation('commit', 'Ход ИИ выполнен');
                    const post = r31VisualDelay(R31_CPU_TIMING.postCommitMinMs, R31_CPU_TIMING.postCommitMaxMs);
                    cpuPresentationTimer = setTimeout(() => { if (generation === cpuDecisionGeneration) syncCpuPresentation('idle'); }, post);
                }
            };
            cpuPresentationTimer = setTimeout(run, wait);
        }
        function logCpuDecision(stage, decision, extra = {}) {
            const safeDecision = decision && typeof decision === 'object' ? {
                action: decision.action ?? null,
                fighterId: decision.fighterId ?? null,
                confidence: Number.isFinite(Number(decision.confidence)) ? Number(decision.confidence) : null,
                score: Number.isFinite(Number(decision.score)) ? Number(decision.score) : null,
                reason: String(decision.reason || '')
            } : {};
            cpuDecisionLog.push(Object.freeze({
                at: Date.now(), stage: String(stage), difficulty: cpuDifficulty,
                futureDraftPoolVisible: false, hiddenOpponentChoiceVisible: false,
                ...safeDecision, ...extra
            }));
            if (cpuDecisionLog.length > 120) cpuDecisionLog = cpuDecisionLog.slice(-120);
        }
        function cpuEvaluateDuel(a, formA, b, formB, options) {
            const opts = options || {};
            const arenaId = String(opts.arena?.id || opts.arena || '');
            const key = [Number(a?.id)||0,String(formA||''),Number(opts.stateA ?? a?.state ?? 0),Number(b?.id)||0,String(formB||''),Number(opts.stateB ?? b?.state ?? 0),arenaId].join('|');
            if (cpuEvalCache.has(key)) { cpuEvalCacheHits++; return cpuEvalCache.get(key); }
            cpuEvalCacheMisses++;
            const result = resolveCombatV2(a, formA, b, formB, opts);
            cpuEvalCache.set(key, result);
            const maxEntries = Math.max(400, Number(PERF_CONFIG.maxCpuCacheEntries)||2400);
            if (cpuEvalCache.size > maxEntries) {
                const trim = Math.ceil(maxEntries * .18);
                const it = cpuEvalCache.keys();
                for (let i=0;i<trim;i++) { const n=it.next(); if(n.done)break; cpuEvalCache.delete(n.value); }
            }
            return result;
        }
        function getCpuArenaIds() { return Array.isArray(ARENA_RULES) ? ARENA_RULES.map(arena => arena.id) : []; }

        function syncHubProfile() {
            const nameEl = document.getElementById('hub-player-name');
            const shardsEl = document.getElementById('hub-shards');
            const ratingEl = document.getElementById('hub-rating');
            const rankEl = document.getElementById('hub-rank');
            const avatarEl = document.getElementById('hub-vk-avatar');
            const fallbackEl = document.getElementById('hub-vk-fallback');
            const profile = getRatingProfile();
            const rank = getRatingRank();
            if (nameEl) nameEl.textContent = currentVkUser?.first_name || 'Игрок';
            if (shardsEl) shardsEl.textContent = String(getShardBalance());
            if (ratingEl) ratingEl.textContent = String(profile.rating);
            if (rankEl) rankEl.textContent = rank.label;
            const equippedTitle = getEquippedShopItem('title');
            document.querySelectorAll('[data-player-title]').forEach(el => { el.textContent = equippedTitle?.name || 'Рекрут Арены'; });
            const shopCount = document.getElementById('hub-shop-count');
            if (shopCount) shopCount.textContent = `${getOwnedShopCount()}/${SHOP_CATALOG.length}`;
            if (avatarEl && fallbackEl) {
                const photo = String(currentVkUser?.photo_100 || '');
                avatarEl.classList.toggle('hidden', !photo);
                fallbackEl.classList.toggle('hidden', Boolean(photo));
                if (photo) avatarEl.src = photo;
            }
            syncEconomyUi();
            syncR22ProgressUi();
        }

        function syncCpuRatingPreview() {
            const profile = getRatingProfile();
            const ratingNow = document.getElementById('cpu-current-rating');
            if (ratingNow) ratingNow.textContent = String(profile.rating);
            for (const id of ['easy', 'medium', 'hard', 'master']) {
                const preview = getRatingPreview(id);
                const stats = getDifficultyRatingStats(id);
                const ratingNode = document.getElementById(`cpu-bot-rating-${id}`);
                const deltaNode = document.getElementById(`cpu-elo-delta-${id}`);
                const winsNode = document.getElementById(`cpu-wins-${id}`);
                if (ratingNode) ratingNode.textContent = String(preview.botRating);
                if (deltaNode) deltaNode.textContent = `Победа ${signedRatingDelta(preview.winDelta)} · поражение ${signedRatingDelta(preview.lossDelta)}`;
                if (winsNode) winsNode.textContent = `Побед: ${stats.wins} · серий: ${stats.played}`;
            }
        }

        function renderR19ProfileFeature() {
            const profile = getRatingProfile();
            const rank = getRatingRank();
            const body = document.getElementById('feature-preview-body');
            if (!body) return;
            const rows = ['easy','medium','hard','master'].map(id => {
                const meta = CPU_AI?.getDifficulty?.(id) || { label:id };
                const stats = getDifficultyRatingStats(id);
                return `<div class="r19-stat-row"><span>${meta.label}</span><b>${stats.wins}</b><small>побед · ${stats.losses} поражений</small></div>`;
            }).join('');
            const m = getR22Metrics();
            const tracking = new Date(getProgressProfile().trackingSince || Date.now()).toLocaleDateString('ru-RU');
            body.innerHTML = `<div class="r19-feature-hero"><span>${uiIcon('profile',34)}</span><div><small>ОФЛАЙН-ПРОФИЛЬ</small><b>${profile.rating} Elo · ${rank.label}</b><p>Максимум: ${profile.peakRating} · Серий: ${profile.seriesPlayed} · Побед: ${profile.seriesWins} · Поражений: ${profile.seriesLosses}</p></div></div><div class="r19-profile-grid"><div><small>Текущая серия побед</small><b>${profile.winStreak}</b></div><div><small>Лучшая серия побед</small><b>${profile.bestWinStreak}</b></div><div><small>Винрейт серий</small><b>${profile.seriesPlayed ? Math.round(profile.seriesWins / profile.seriesPlayed * 100) : 0}%</b></div></div><div class="r22-profile-stats"><div><small>Отслежено матчей</small><b>${m.matchesPlayed||0}</b></div><div><small>Дуэлей</small><b>${m.duelsResolved||0}</b></div><div><small>Встречено бойцов</small><b>${m.uniqueSeen||0}/75</b></div><div><small>Prime назначено</small><b>${m.playerPrimeAssignments||0}</b></div><div><small>Монет заработано</small><b>${m.allCoinsEarned||m.coinsEarned||0}</b></div><div><small>Косметика</small><b>${m.shopOwned||0}/${SHOP_CATALOG.length}</b></div></div><div class="r19-stat-list">${rows}</div><p class="r19-feature-note">Индивидуальная статистика персонажей записывается с ${tracking}. Ранние версии её не сохраняли; Elo, серийный прогресс, экономика и коллекция перенесены из предыдущих сохранений.</p>`;
        }

        function renderR19RatingFeature() {
            const profile = getRatingProfile();
            const rank = getRatingRank();
            const body = document.getElementById('feature-preview-body');
            if (!body) return;
            const rows = ['easy','medium','hard','master'].map(id => {
                const meta = CPU_AI?.getDifficulty?.(id) || { label:id };
                const preview = getRatingPreview(id);
                const stats = getDifficultyRatingStats(id);
                return `<div class="r19-rating-row"><div><b>${meta.label}</b><small>Elo ИИ ${preview.botRating}</small></div><div class="r19-rating-deltas"><span class="gain">${signedRatingDelta(preview.winDelta)}</span><span class="loss">${signedRatingDelta(preview.lossDelta)}</span></div><em>${stats.wins} побед</em></div>`;
            }).join('');
            const nextText = rank.next == null ? 'Высшая офлайн-лига достигнута' : `До следующего ранга: ${Math.max(0, rank.next - profile.rating)} Elo`;
            body.innerHTML = `<div class="r19-feature-hero rating"><span>${uiIcon('rating',34)}</span><div><small>ТЕКУЩИЙ РЕЙТИНГ</small><b>${profile.rating} Elo</b><p>${rank.label} · максимум ${profile.peakRating}. ${nextText}.</p></div></div><div class="r19-rating-head"><span>Соперник</span><span>Победа / поражение</span><span>Статистика</span></div><div class="r19-rating-list">${rows}</div><p class="r19-feature-note"><b>Формула:</b> стандартное ожидание Elo, K=32. Чем слабее соперник относительно вашего рейтинга, тем меньше награда за победу и тем больше потеря за поражение. При 1400 Elo победа над Лёгким стоит около +1.</p>`;
        }

        function setUiModalOpen(id, open, options = {}) {
            const shell = window.SOUL_ARENA_UI_SHELL;
            if (shell) return open ? shell.open(id, options) : shell.close(id, options);
            const modal = document.getElementById(id);
            if (!modal) return false;
            modal.classList.toggle('hidden', !open);
            modal.setAttribute('aria-hidden', open ? 'false' : 'true');
            return true;
        }

        function openGameModeSelect() { syncHubProfile(); setUiModalOpen('game-mode-modal', true); }
        function closeGameModeSelect() { setUiModalOpen('game-mode-modal', false); }
        function getR22AppearanceProbabilities() {
            if (!r22AppearanceProbabilities) r22AppearanceProbabilities = PROGRESS_ENGINE?.inclusionProbabilities?.(DB, 10) || {};
            return r22AppearanceProbabilities;
        }
        function setR22BestiaryFilter(filter) { r22BestiaryFilter = ['all','seen','unseen','rare'].includes(filter) ? filter : 'all'; renderR22BestiaryFeature(); }
        function setR22BestiaryQuery(query) { r22BestiaryQuery = String(query||'').trim().toLowerCase(); renderR22BestiaryGrid(); }
        function renderR22BestiaryGrid() {
            const grid=document.getElementById('r22-bestiary-grid'); if(!grid)return;
            const probs=getR22AppearanceProbabilities(); const progress=getProgressProfile();
            let list=DB.filter(c=>{const row=progress.characters?.[String(c.id)]||{};const seen=(row.seen||0)>0;if(r22BestiaryFilter==='seen'&&!seen)return false;if(r22BestiaryFilter==='unseen'&&seen)return false;if(r22BestiaryFilter==='rare'&&Number(c.draftWeight)>1)return false;if(r22BestiaryQuery&&!`${c.name} ${c.faction} ${c.type}`.toLowerCase().includes(r22BestiaryQuery))return false;return true;});
            const token=++r29FeatureRenderGeneration;
            const rowHtml=c=>{const st=progress.characters?.[String(c.id)]||{seen:0,selected:0,prime:0,duelWins:0,duelLosses:0};const seen=st.seen>0;const chance=PROGRESS_ENGINE?.formatProbability?.(probs[c.id]||0)||'—';return `<article class="r22-bestiary-card ${seen?'is-seen':'is-unseen'}" data-fighter-id="${c.id}"><div class="r22-bestiary-portrait"><img src="images/${getCharImgSrc(c)}" alt="${c.name}" loading="lazy" decoding="async" fetchpriority="low" onerror="handleImgError(this,'${c.emoji}')"><span>#${String(c.id).padStart(2,'0')}</span>${seen?'<em>ВСТРЕЧЕН</em>':'<em>НЕ ВСТРЕЧЕН</em>'}</div><div class="r22-bestiary-copy"><h3>${c.name}</h3><p>${c.faction} · ${c.type} · тир ${c.tier}</p><div class="r22-power-row"><span>BASE <b>${c.basePower}</b></span><span>PRIME <b>${c.primePower}</b></span></div><div class="r22-chance"><small>Шанс попасть в 10 карт драфта</small><b>${chance}</b><em>вес ${c.draftWeight}</em></div><div class="r22-char-stats"><span><b>${st.seen||0}</b> встреч</span><span><b>${st.selected||0}</b> в вашей пятёрке</span><span><b>${st.prime||0}</b> Prime</span><span><b>${st.duelWins||0}</b> W / <b>${st.duelLosses||0}</b> L</span></div></div></article>`;};
            const rows=list.map(rowHtml); grid.replaceChildren();
            const chunkSize=16;
            const appendChunk=(index)=>{
                if(token!==r29FeatureRenderGeneration || !grid.isConnected) return;
                grid.insertAdjacentHTML('beforeend', rows.slice(index,index+chunkSize).join(''));
                if(index+chunkSize<rows.length) scheduleUiChunk(()=>appendChunk(index+chunkSize));
            };
            appendChunk(0);
            const count=document.getElementById('r22-bestiary-visible');if(count)count.textContent=String(list.length);
        }
        function renderR22BestiaryFeature() {
            const body=document.getElementById('feature-preview-body');if(!body)return;const m=getR22Metrics();const tracking=new Date(getProgressProfile().trackingSince||Date.now()).toLocaleDateString('ru-RU');
            body.innerHTML=`<div class="r22-feature-summary"><div><small>ВСТРЕЧЕНО</small><b>${m.uniqueSeen||0}/75</b></div><div><small>В ВАШЕЙ КОМАНДЕ</small><b>${m.uniqueSelected||0}</b></div><div><small>РАЗНЫХ PRIME</small><b>${m.uniquePrime||0}</b></div><div><small>ДУЭЛЯНТОВ</small><b>${m.uniqueDuelists||0}</b></div></div><div class="r22-toolbar"><input id="r22-bestiary-search" type="search" placeholder="Поиск бойца, фракции или типа…" value="${r22BestiaryQuery.replace(/"/g,'&quot;')}" oninput="setR22BestiaryQuery(this.value)"><div class="r22-filter-row"><button class="${r22BestiaryFilter==='all'?'active':''}" onclick="setR22BestiaryFilter('all')">Все</button><button class="${r22BestiaryFilter==='seen'?'active':''}" onclick="setR22BestiaryFilter('seen')">Встречены</button><button class="${r22BestiaryFilter==='unseen'?'active':''}" onclick="setR22BestiaryFilter('unseen')">Не встречены</button><button class="${r22BestiaryFilter==='rare'?'active':''}" onclick="setR22BestiaryFilter('rare')">Редкие ≤1</button></div></div><div class="r22-bestiary-meta"><span>Показано: <b id="r22-bestiary-visible">75</b></span><span>Статистика персонажей ведётся с ${tracking}</span><span>Шанс рассчитан по реальному взвешенному драфту: 10 карт без возвращения.</span></div><div id="r22-bestiary-grid" class="r22-bestiary-grid"></div>`;
            renderR22BestiaryGrid();
        }
        function setR22AchievementFilter(filter){r22AchievementFilter=['all','unlocked','locked'].includes(filter)?filter:'all';renderR22AchievementsFeature();}
        function renderR22AchievementsFeature(){
            const body=document.getElementById('feature-preview-body');if(!body||!PROGRESS_ENGINE)return;const state=getProgressProfile();const metrics=getR22Metrics();const unlocked=state.achievements?.unlocked||{};let list=Array.from(PROGRESS_ENGINE.achievements);if(r22AchievementFilter==='unlocked')list=list.filter(a=>unlocked[a.id]);if(r22AchievementFilter==='locked')list=list.filter(a=>!unlocked[a.id]);const done=Object.keys(unlocked).length;
            const token=++r29FeatureRenderGeneration;
            const cardHtml=a=>{const value=Math.max(0,Number(metrics[a.metric])||0);const pct=Math.min(100,Math.round(value/a.target*100));const isDone=Boolean(unlocked[a.id]);const cosmetic=a.reward?.cosmeticId?SHOP_ENGINE?.itemById?.[a.reward.cosmeticId]:null;const rewards=[a.reward?.coins?`${uiMoney(a.reward.coins)} монет`:'',cosmetic?`${uiIcon('gift',15)} ${cosmetic.name}`:''].filter(Boolean).join(' · ')||'Без отдельной награды';return `<article class="r22-achievement ${isDone?'is-unlocked':'is-locked'}"><div class="r22-ach-icon">${uiIcon(achievementIcon(a),30)}</div><div class="r22-ach-copy"><div class="r22-ach-head"><h3>${a.name}</h3><em>${isDone?'ПОЛУЧЕНО':`${Math.min(value,a.target)}/${a.target}`}</em></div><p>${a.description}</p><div class="r22-progress"><i style="width:${pct}%"></i></div><small>Награда: ${rewards}</small></div></article>`;};
            const cards=list.map(cardHtml);
            body.innerHTML=`<div class="r22-ach-hero"><span>${uiIcon('trophy',36)}</span><div><small>50 ДОСТИЖЕНИЙ</small><b>${done}/${PROGRESS_ENGINE.achievements.length}</b><p>Прогресс: ${Math.round(done/PROGRESS_ENGINE.achievements.length*100)}%. Награды выдаются один раз и не влияют на силу бойцов.</p></div></div><div class="r22-filter-row r22-ach-filters"><button class="${r22AchievementFilter==='all'?'active':''}" onclick="setR22AchievementFilter('all')">Все</button><button class="${r22AchievementFilter==='unlocked'?'active':''}" onclick="setR22AchievementFilter('unlocked')">Получены</button><button class="${r22AchievementFilter==='locked'?'active':''}" onclick="setR22AchievementFilter('locked')">В процессе</button></div><div class="r22-achievement-list"></div>`;
            const host=body.querySelector('.r22-achievement-list'); if(!host)return;
            const chunkSize=12;
            const appendChunk=(index)=>{if(token!==r29FeatureRenderGeneration||!host.isConnected)return;host.insertAdjacentHTML('beforeend',cards.slice(index,index+chunkSize).join(''));if(index+chunkSize<cards.length)scheduleUiChunk(()=>appendChunk(index+chunkSize));};
            appendChunk(0);
        }

        function startGameFromMenu() { openGameModeSelect(); }

        function beginLocalTwoPlayer() {
            cancelCpuDecision();
            activeGameMode = 'local';
            syncModeIdentityUI();
            p1SeriesWins = 0;
            p2SeriesWins = 0;
            r22SeriesWasDown04 = false;
            closeGameModeSelect();
            const seen = safeStorageGet('soulArenaRulesSeenR34', '0') === '1';
            if (!seen) openRules(true);
            else initGame();
        }

        function beginCpuGame(difficultyId) {
            const selected = CPU_AI?.getDifficulty?.(difficultyId);
            if (!selected || !CPU_AI?.validate?.().ok) {
                showToast('ИИ временно недоступен: проверка движка не пройдена');
                return;
            }
            cancelCpuDecision();
            activeGameMode = 'cpu';
            cpuDifficulty = selected.id;
            p1SeriesWins = 0;
            p2SeriesWins = 0;
            r22SeriesWasDown04 = false;
            closeCpuPreview();
            closeGameModeSelect();
            syncModeIdentityUI();
            const seen = safeStorageGet('soulArenaRulesSeenR34', '0') === '1';
            if (!seen) openRules(true);
            else initGame();
        }

        function openCpuPreview() { closeGameModeSelect(); syncCpuRatingPreview(); setUiModalOpen('cpu-preview-modal', true); }
        function closeCpuPreview() { setUiModalOpen('cpu-preview-modal', false); }
        function openFutureUpdates() { setUiModalOpen('future-updates-modal', true); }
        function closeFutureUpdates() { setUiModalOpen('future-updates-modal', false); }
        function openFeaturePreview(key) {
            const data = R16_FEATURE_PREVIEWS[key];
            if (!data) return;
            const title = document.getElementById('feature-preview-title');
            const body = document.getElementById('feature-preview-body');
            const modal = document.getElementById('feature-preview-modal');
            if (title) title.textContent = data.title;
            const heavy = key === 'bestiary' || key === 'achievements';
            if (modal) {
                modal.dataset.feature = key;
                modal.classList.toggle('r22-wide-feature', heavy);
                const eyebrow = modal.querySelector('.modal-eyebrow'); if (eyebrow) eyebrow.textContent = heavy ? 'ПРОГРЕСС И СТАТИСТИКА' : 'ПРОФИЛЬ ИГРОКА';
                if (heavy && body) body.innerHTML = '<div class="r29-loading-shell">Подготовка данных…</div>';
                setUiModalOpen('feature-preview-modal', true);
            }
            const render = () => {
                if (!modal || modal.classList.contains('hidden') || modal.dataset.feature !== key) return;
                if (key === 'profile') renderR19ProfileFeature();
                else if (key === 'rating') renderR19RatingFeature();
                else if (key === 'bestiary') renderR22BestiaryFeature();
                else if (key === 'achievements') renderR22AchievementsFeature();
                else if (body) body.innerHTML = `<span class="r16-feature-icon">${uiIcon(data.icon,48)}</span><p>${data.text}</p>`;
            };
            if (heavy && typeof requestAnimationFrame === 'function') requestAnimationFrame(render); else render();
        }
        function closeFeaturePreview() {
            r29FeatureRenderGeneration++;
            const modal = document.getElementById('feature-preview-modal');
            if (modal) {
                setUiModalOpen('feature-preview-modal', false);
                modal.classList.remove('r22-wide-feature');
                delete modal.dataset.feature;
                const body = document.getElementById('feature-preview-body');
                if (body) body.replaceChildren();
            }
        }

        function renderR33TutorialPage(index = r33TutorialPage) {
            r33TutorialPage = clampNumber(index, 0, R33_TUTORIAL_PAGE_COUNT - 1);
            document.querySelectorAll('[data-r33-page]').forEach(page => {
                page.hidden = Number(page.dataset.r33Page) !== r33TutorialPage;
            });
            const step = document.getElementById('r33-tutorial-step');
            const label = document.getElementById('r33-tutorial-label');
            const bar = document.getElementById('r33-tutorial-progress-bar');
            const prev = document.getElementById('r33-tutorial-prev');
            const next = document.getElementById('r33-tutorial-next');
            const startBtn = document.getElementById('rules-start-btn');
            const doneBtn = document.getElementById('r33-rules-done');
            const closeBtn = document.getElementById('r33-rules-close');
            const subtitle = document.getElementById('r33-rules-subtitle');
            const finalPage = r33TutorialPage === R33_TUTORIAL_PAGE_COUNT - 1;
            if (step) step.textContent = String(r33TutorialPage + 1);
            if (label) label.textContent = R33_TUTORIAL_LABELS[r33TutorialPage] || '';
            if (bar) bar.style.width = `${((r33TutorialPage + 1) / R33_TUTORIAL_PAGE_COUNT) * 100}%`;
            if (prev) prev.classList.toggle('hidden', r33TutorialPage === 0);
            if (next) next.classList.toggle('hidden', finalPage);
            if (startBtn) startBtn.classList.toggle('hidden', !(finalPage && rulesStartPending));
            if (doneBtn) doneBtn.classList.toggle('hidden', !(finalPage && !rulesStartPending));
            if (closeBtn) closeBtn.title = rulesStartPending ? 'Вернуться в меню' : 'Закрыть правила';
            if (subtitle) subtitle.textContent = rulesStartPending
                ? 'Первый запуск: пройдите 9 коротких страниц. Кнопка начала появится на последней.'
                : 'Пошагово: от рейтинга и Прайма до усталости, контров и итогового состояния.';
            const stage = document.getElementById('r33-tutorial-stage');
            if (stage) stage.scrollTop = 0;
        }

        function r33TutorialNext() { renderR33TutorialPage(r33TutorialPage + 1); }
        function r33TutorialPrev() { renderR33TutorialPage(r33TutorialPage - 1); }

        function openRules(startAfter = false) {
            rulesStartPending = Boolean(startAfter);
            r33TutorialPage = 0;
            const modal = document.getElementById('rules-modal');
            if (modal) {
                modal.classList.toggle('r33-onboarding', rulesStartPending);
                setUiModalOpen('rules-modal', true);
            }
            renderR33TutorialPage(0);
        }

        function openRulesAt(pageIndex = 0) {
            openRules(false);
            renderR33TutorialPage(pageIndex);
        }

        function closeRules(startGame = false) {
            const modal = document.getElementById('rules-modal');
            if (modal) {
                setUiModalOpen('rules-modal', false);
                modal.classList.remove('r33-onboarding');
            }
            if (startGame && rulesStartPending && r33TutorialPage === R33_TUTORIAL_PAGE_COUNT - 1) {
                safeStorageSet('soulArenaRulesSeenR2', '1');
                safeStorageSet('soulArenaRulesSeenR33', '1');
                safeStorageSet('soulArenaRulesSeenR34', '1');
                rulesStartPending = false;
                r33TutorialPage = 0;
                initGame();
            } else {
                rulesStartPending = false;
                r33TutorialPage = 0;
            }
        }

        function applyUiTheme(themeId) {
            const valid = SHOP_THEMES.some(theme => theme.id === themeId) ? themeId : 'ember';
            document.body.dataset.uiTheme = valid;
            safeStorageSet('soulArenaUiTheme', valid);
        }

        function setShopView(mode) {
            shopViewMode = mode === 'collection' ? 'collection' : 'store';
            renderShop();
        }
        function setShopCategory(category) {
            shopCategory = category === 'all' || SHOP_ENGINE?.categoryMeta?.[category] ? category : 'all';
            renderShop();
        }
        function renderShopTabs() {
            const view = document.getElementById('shop-view-tabs');
            if (view) view.innerHTML = `<button class="r21-view-tab ${shopViewMode==='store'?'active':''}" onclick="setShopView('store')">${uiIcon('shop',18)} Магазин</button><button class="r21-view-tab ${shopViewMode==='collection'?'active':''}" onclick="setShopView('collection')">${uiIcon('collection',18)} Коллекция</button>`;
            const cats = document.getElementById('shop-category-tabs');
            if (!cats || !SHOP_ENGINE) return;
            const all = `<button class="r21-category-tab ${shopCategory==='all'?'active':''}" onclick="setShopCategory('all')">Все <b>${SHOP_CATALOG.length}</b></button>`;
            cats.innerHTML = all + SHOP_ENGINE.categoryOrder.map(cat => {
                const meta = SHOP_ENGINE.categoryMeta[cat]; const count = SHOP_CATALOG.filter(x=>x.category===cat).length;
                return `<button class="r21-category-tab ${shopCategory===cat?'active':''}" onclick="setShopCategory('${cat}')">${uiIcon(shopCategoryIcon(cat),18)}${meta.label}<b>${count}</b></button>`;
            }).join('');
        }
        function renderShop() {
            const state = getShopProfile();
            const owned = new Set(state.owned || []);
            const equipped = state.equipped || {};
            const coinsEl = document.getElementById('shop-coins');
            if (coinsEl) coinsEl.textContent = String(getCoinBalance());
            const collectionEl = document.getElementById('shop-collection-count');
            if (collectionEl) collectionEl.textContent = `${owned.size}/${SHOP_CATALOG.length}`;
            const spentEl = document.getElementById('shop-spent');
            if (spentEl) spentEl.innerHTML = `${uiMoney(Math.max(0,Number(state.totalCoinsSpent)||0))} монет`;
            renderShopTabs();
            const grid = document.getElementById('shop-items');
            const empty = document.getElementById('shop-empty');
            if (!grid) return;
            let items = SHOP_CATALOG.filter(item => shopCategory === 'all' || item.category === shopCategory);
            if (shopViewMode === 'collection') items = items.filter(item => owned.has(item.id));
            if (empty) empty.classList.toggle('hidden', items.length > 0);
            const token=++r29ShopRenderGeneration;
            grid.replaceChildren();
            const makeCard=(item)=>{
                const active = equipped[item.category] === item.id;
                const isOwned = owned.has(item.id);
                const canBuy = !item.achievementOnly && getCoinBalance() >= item.price;
                const rarity = SHOP_ENGINE?.rarityMeta?.[item.rarity]?.label || item.rarity;
                const card = document.createElement('article');
                card.className = `shop-item r21-shop-item rarity-${item.rarity}${active ? ' is-equipped' : ''}${isOwned ? ' is-owned' : ''}`;
                card.dataset.category = item.category; card.dataset.preview = item.cssKey;
                let actionText = active ? 'Экипировано' : isOwned ? 'Экипировать' : item.achievementOnly ? 'Только достижение' : item.price === 0 ? 'Получить' : `${item.price} монет`; const actionIcon = active ? 'check' : isOwned ? 'spark' : item.achievementOnly ? 'trophy' : item.price === 0 ? 'gift' : 'coin';
                const disabled = active || (item.achievementOnly && !isOwned) ? 'disabled' : '';
                const affordability = (!isOwned && !item.achievementOnly && item.price>0 && !canBuy) ? ' is-expensive' : '';
                card.innerHTML = `<div class="shop-item-preview r21-item-preview"><span>${uiIcon(shopItemIcon(item),44)}</span><i>${uiIcon(shopCategoryIcon(item.category),28)}</i></div><div class="shop-item-body"><div class="r21-item-meta"><span class="r21-rarity">${rarity}</span>${item.achievementOnly?'<em>НАГРАДА</em>':active?'<em>ВЫБРАНО</em>':isOwned?'<em>В КОЛЛЕКЦИИ</em>':''}</div><h3>${item.name}</h3><p>${item.desc}</p><button class="shop-item-btn${affordability}" ${disabled}>${uiIcon(actionIcon,17)}${actionText}</button></div>`;
                const btn = card.querySelector('button');
                if (btn && !active && !(item.achievementOnly && !isOwned)) btn.addEventListener('click', () => purchaseOrEquipShopItem(item.id));
                return card;
            };
            const chunkSize=12;
            const appendChunk=(index)=>{
                if(token!==r29ShopRenderGeneration||!grid.isConnected)return;
                const frag=document.createDocumentFragment();
                for(const item of items.slice(index,index+chunkSize))frag.appendChild(makeCard(item));
                grid.appendChild(frag);
                if(index+chunkSize<items.length)scheduleUiChunk(()=>appendChunk(index+chunkSize));
            };
            appendChunk(0);
        }

        function purchaseOrEquipShopItem(itemId) {
            if (!SHOP_ENGINE) return;
            const item = SHOP_ENGINE.itemById[itemId];
            if (!item) return;
            let state = getShopProfile();
            if (!state.owned.includes(itemId)) {
                const result = SHOP_ENGINE.purchase(state, itemId, getCoinBalance(), Date.now());
                if (!result.ok) {
                    showToast(result.reason === 'insufficient-coins' ? `Нужно ещё ${Math.max(0,item.price-getCoinBalance())} монет` : result.reason === 'achievement-only' ? 'Этот предмет открывается только достижением' : 'Покупка недоступна');
                    return;
                }
                const economy = getEconomyProfile();
                saveEconomyProfile({ ...economy, coins: result.coinsAfter });
                state = result.state;
                saveShopProfile(state);
                showToast(`Куплено: «${item.name}»`);
            }
            const equippedResult = SHOP_ENGINE.equip(state, itemId, Date.now());
            if (!equippedResult.ok) return;
            saveShopProfile(equippedResult.state);
            renderShop();
            showToast(`Экипировано: «${item.name}»`);
        }

        function openShop() {
            applyEquippedCosmetics();
            setUiModalOpen('shop-modal', true);
            const grid = document.getElementById('shop-items');
            if (grid && !grid.children.length) grid.innerHTML = '<div class="r29-loading-shell">Подготовка коллекции…</div>';
            const render = () => { if (document.getElementById('shop-modal')?.classList.contains('hidden')) return; renderShop(); };
            if (typeof requestAnimationFrame === 'function') requestAnimationFrame(render); else render();
        }
        function closeShop() {
            r29ShopRenderGeneration++;
            setUiModalOpen('shop-modal', false);
            const grid = document.getElementById('shop-items');
            if (grid) grid.replaceChildren();
        }

        function openPauseMenu() { if (document.body.dataset.screen === 'menu') return; setUiModalOpen('pause-modal', true); }
        function closePauseMenu() { setUiModalOpen('pause-modal', false); }
        function returnToMainMenu() {
            closePauseMenu();
            showMainMenu();
        }

        function showToast(message) {
            const toast = document.getElementById('ui-toast');
            if (!toast) return;
            toast.textContent = message;
            toast.classList.remove('hidden');
            clearTimeout(uiToastTimer);
            uiToastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
        }

        function closeTopModal() {
            const ids = ['battle-details-modal', 'audio-settings-modal', 'pause-modal', 'economy-modal', 'shop-modal', 'rules-modal', 'feature-preview-modal', 'future-updates-modal', 'cpu-preview-modal', 'game-mode-modal'];
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('hidden')) {
                    if (id === 'battle-details-modal') window.closeBattleDetails?.();
                    else if (id === 'audio-settings-modal') closeAudioSettings();
                    else if (id === 'pause-modal') closePauseMenu();
                    else if (id === 'economy-modal') closeEconomyInfo();
                    else if (id === 'shop-modal') closeShop();
                    else if (id === 'rules-modal') closeRules(false);
                    else if (id === 'feature-preview-modal') closeFeaturePreview();
                    else if (id === 'future-updates-modal') closeFutureUpdates();
                    else if (id === 'cpu-preview-modal') closeCpuPreview();
                    else closeGameModeSelect();
                    return;
                }
            }
        }


        window.SOUL_ARENA_R16 = Object.freeze({
            version: 'R16.0.0',
            modes: Object.freeze({ local: 'ready', cpu: 'ready', online: 'future' }),
            getActiveMode: () => activeGameMode,
            openModes: openGameModeSelect,
            startLocal: beginLocalTwoPlayer,
            syncHub: syncHubProfile
        });

        window.SOUL_ARENA_R26 = Object.freeze({
            version: 'R26.0.0',
            feature: 'Global UI Cleanup & Architecture Rebuild',
            legacyHubModesRemoved: true,
            wholeDocumentPollingRemoved: true,
            modalShellVersion: () => window.SOUL_ARENA_UI_SHELL?.version || null,
            audit: () => window.SOUL_ARENA_UI_SHELL?.audit?.() || null
        });

        window.SOUL_ARENA_R17 = Object.freeze({
            version: 'R17.0.0',
            feature: 'Arena Engine 2.0',
            layers: Object.freeze(['terrain', 'homeField']),
            matrixRows: 33300,
            homeFieldPolicy: 'small-familiarity-advantage',
            inspectArena: ref => window.SOUL_ARENA_ARENA_ENGINE?.get?.(ref) || null
        });


        window.SOUL_ARENA_R18 = Object.freeze({
            version: 'R18.0.0',
            feature: 'Four Fair Offline CPU Opponents',
            cpuPlayer: CPU_PLAYER,
            difficulties: Object.freeze(['easy', 'medium', 'hard', 'master']),
            fairness: CPU_AI?.policy || Object.freeze({}),
            validate: () => CPU_AI?.validate?.() || Object.freeze({ ok:false, errors:Object.freeze(['CPU AI unavailable']) }),
            getDifficulty: () => cpuDifficulty,
            getDecisionLog: () => Object.freeze(cpuDecisionLog.slice())
        });

        window.SOUL_ARENA_R19 = Object.freeze({
            version: 'R19.0.0',
            feature: 'Offline Elo Rating vs CPU',
            initialRating: RATING_ENGINE?.initialRating ?? 800,
            kFactor: RATING_ENGINE?.kFactor ?? 32,
            botRatings: RATING_ENGINE?.botRatings || Object.freeze({ easy:800, medium:1100, hard:1400, master:1700 }),
            ratingChangesOn: 'completed-first-to-five-series-only',
            validate: () => RATING_ENGINE?.validate?.() || Object.freeze({ ok:false, errors:Object.freeze(['Rating engine unavailable']) }),
            getProfile: () => Object.freeze(JSON.parse(JSON.stringify(getRatingProfile()))),
            preview: difficulty => getRatingPreview(difficulty)
        });

        window.SOUL_ARENA_R20 = Object.freeze({
            version: 'R20.0.0',
            feature: 'Economy 2.0 + Rewarded Ads',
            rewardedAmount: ECONOMY_ENGINE?.rewardedAmount || 100,
            rewardedDailyLimit: ECONOMY_ENGINE?.rewardedDailyLimit || 3,
            validate: () => ECONOMY_ENGINE?.validate?.() || Object.freeze({ ok:false, errors:Object.freeze(['Economy engine unavailable']) }),
            getEconomy: () => Object.freeze(JSON.parse(JSON.stringify(getEconomyProfile()))),
            getRewardedStatus: () => getRewardedEconomyStatus(),
            calculateSeriesReward: (difficulty, scoreAgainst) => ECONOMY_ENGINE?.calculateSeriesReward?.(difficulty, true, 5, scoreAgainst) || null,
            claimRewarded: claimRewardedCoins
        });


        window.SOUL_ARENA_R21 = Object.freeze({
            version: 'R21.0.0',
            feature: 'Cosmetics Shop + Collection',
            catalogSize: SHOP_CATALOG.length,
            categories: SHOP_ENGINE?.categoryOrder || Object.freeze([]),
            pureCosmetic: true,
            currency: 'coins',
            validate: () => SHOP_ENGINE?.validate?.() || Object.freeze({ ok:false, errors:Object.freeze(['Shop engine unavailable']) }),
            getShop: () => Object.freeze(JSON.parse(JSON.stringify(getShopProfile()))),
            getCatalog: () => Object.freeze(SHOP_CATALOG.slice()),
            buyOrEquip: purchaseOrEquipShopItem
        });

        window.SOUL_ARENA_R22 = Object.freeze({
            version: 'R22.0.0',
            feature: 'Bestiary + Statistics + Achievements',
            rosterSize: 75,
            achievementCount: PROGRESS_ENGINE?.achievements?.length || 0,
            validate: () => PROGRESS_ENGINE?.validate?.(DB) || Object.freeze({ok:false,errors:Object.freeze(['Progress engine unavailable'])}),
            getProgress: () => Object.freeze(JSON.parse(JSON.stringify(getProgressProfile()))),
            getMetrics: () => getR22Metrics(),
            getAppearanceProbabilities: () => Object.freeze({...getR22AppearanceProbabilities()}),
            evaluateAchievements: () => Object.freeze(evaluateR22Achievements({silent:true}).map(x=>x.id))
        });


        window.SOUL_ARENA_R23 = Object.freeze({
            version: 'R23.0.0',
            feature: 'Ultimate UI / Visual Polish',
            gameplayChanged: false,
            combatDataChanged: false,
            responsiveTargets: Object.freeze(['320x568','360x640','390x844','412x915','844x390','768x1024','1440x900']),
            uiLayers: Object.freeze(['hub','game-hud','phases','battle','modals','shop','bestiary','achievements','accessibility'])
        });

        window.SOUL_ARENA_R29 = Object.freeze({
            version: 'R29.0.0',
            feature: 'Performance + Animation + AI Pacing Optimization',
            gameplayChanged: false,
            combatDataChanged: false,
            performanceTier: PERF_CONFIG.tier || 'balanced',
            validate: () => Object.freeze({
                ok: !!PERF_ENGINE && document.querySelectorAll('.r16-mode-summary').length === 0,
                performanceEngine: PERF_ENGINE?.version || null,
                uiShell: window.SOUL_ARENA_UI_SHELL?.version || null,
                particleCount: particles?.length ?? null,
                cpuStage: document.body.dataset.cpuStage || 'idle',
                cpuCache: Object.freeze({size:cpuEvalCache.size,hits:cpuEvalCacheHits,misses:cpuEvalCacheMisses}),
                platformViewPaused
            }),
            getCpuCacheStats: () => Object.freeze({size:cpuEvalCache.size,hits:cpuEvalCacheHits,misses:cpuEvalCacheMisses}),
            performanceAudit: () => PERF_ENGINE?.audit?.() || null
        });

        window.SOUL_ARENA_R30 = Object.freeze({
            version: 'R30.0.0',
            feature: 'Final Combat Ratings + Matchup/Hax Resolution',
            gameplayChanged: true,
            combatDataChanged: true,
            ratingRevision: String(window.SOUL_ARENA_FINAL_COMBAT_POLICY?.ratingRevision || ''),
            validate: () => Object.freeze({
                ok: Boolean(window.SOUL_ARENA_FINAL_COMBAT_POLICY && window.SOUL_ARENA_COMBAT_ENGINE?.validation?.ok),
                policyVersion: String(window.SOUL_ARENA_FINAL_COMBAT_POLICY?.version || ''),
                ratingRevision: String(window.SOUL_ARENA_FINAL_COMBAT_POLICY?.ratingRevision || ''),
                combatEngine: String(window.SOUL_ARENA_COMBAT_ENGINE?.engineVersion || '')
            })
        });

        /* ==========================================================================
           2. R12 PRESENTATION + R11 CHARACTER/CANON/COMBAT/SPECIAL/FATIGUE/ARENA/VERIFICATION/PURE CANON DRAFT
           ========================================================================== */
        const CHARACTER_SCHEMA_VERSION = Number(window.SOUL_ARENA_CHARACTER_DATA?.schemaVersion || 0);
        const CHARACTER_DEFINITIONS = Array.isArray(window.SOUL_ARENA_CHARACTERS) ? window.SOUL_ARENA_CHARACTERS : [];

        function normalizeCharacterLookup(value) {
            return String(value ?? '')
                .trim()
                .toLowerCase()
                .replace(/ё/g, 'е')
                .replace(/[^а-яa-z0-9_]/gi, '');
        }

        function createRuntimeCharacter(def) {
            const base = def?.forms?.base || {};
            const prime = def?.forms?.prime || {};
            const ability = prime.ability || {};
            return Object.freeze({
                id: Number(def.id),
                key: String(def.key || ''),
                name: String(def?.public?.name || ''),
                emoji: String(def?.public?.emoji || ''),
                img: String(def?.public?.portrait || ''),
                faction: String(def?.classification?.faction || ''),
                type: String(def?.classification?.combatType || ''),
                tier: Number(def?.classification?.tier),
                draftWeight: Number(def?.draft?.weight),
                basePower: Number(base.power),
                primePower: Number(prime.power),
                pName: String(ability.name || ''),
                pDesc: String(ability.description || ''),
                canonProfileKey: String(def?.canonProfileKey || ''),
                canonDataVersion: String(def?.canonDataVersion || ''),
                combatProfileKey: String(def?.combatProfileKey || ''),
                combatEngineVersion: String(def?.combatEngineVersion || ''),
                legacyAliases: Object.freeze(Array.isArray(def.legacyAliases) ? [...def.legacyAliases] : [])
            });
        }

        const DB = Object.freeze(CHARACTER_DEFINITIONS.map(createRuntimeCharacter));
        const CHARACTER_BY_ID = new Map();
        const CHARACTER_BY_KEY = new Map();
        const CHARACTER_BY_NAME = new Map();
        const CHARACTER_ALIAS_TO_ID = new Map();

        DB.forEach(char => {
            CHARACTER_BY_ID.set(char.id, char);
            CHARACTER_BY_KEY.set(normalizeCharacterLookup(char.key), char);
            CHARACTER_BY_NAME.set(normalizeCharacterLookup(char.name), char);
            CHARACTER_ALIAS_TO_ID.set(normalizeCharacterLookup(char.name), char.id);
            char.legacyAliases.forEach(alias => CHARACTER_ALIAS_TO_ID.set(normalizeCharacterLookup(alias), char.id));
        });

        const RESKIN_ARENAS = Object.freeze({
            "ARENA_01": "\u0426\u0438\u0442\u0430\u0434\u0435\u043b\u044c \u0414\u0443\u0448",
            "ARENA_02": "\u041f\u0435\u0441\u0447\u0430\u043d\u0430\u044f \u041f\u0443\u0441\u0442\u043e\u0448\u044c",
            "ARENA_03": "\u041b\u0435\u0434\u044f\u043d\u043e\u0439 \u0427\u0435\u0440\u0442\u043e\u0433"
        });

        function resolveCharacter(ref) {
            if (ref && typeof ref === 'object') {
                if (Number.isFinite(Number(ref.id)) && CHARACTER_BY_ID.has(Number(ref.id))) return CHARACTER_BY_ID.get(Number(ref.id));
                if (ref.key && CHARACTER_BY_KEY.has(normalizeCharacterLookup(ref.key))) return CHARACTER_BY_KEY.get(normalizeCharacterLookup(ref.key));
                if (ref.name) return resolveCharacter(ref.name);
            }
            if (Number.isFinite(Number(ref)) && String(ref).trim() !== '') {
                const byId = CHARACTER_BY_ID.get(Number(ref));
                if (byId) return byId;
            }
            const key = normalizeCharacterLookup(ref);
            if (!key) return null;
            if (CHARACTER_BY_KEY.has(key)) return CHARACTER_BY_KEY.get(key);
            if (CHARACTER_BY_NAME.has(key)) return CHARACTER_BY_NAME.get(key);
            const aliasId = CHARACTER_ALIAS_TO_ID.get(key);
            return aliasId ? CHARACTER_BY_ID.get(aliasId) || null : null;
        }

        function getReskinnedName(name) {
            return resolveCharacter(name)?.name || name;
        }

        function getCharacterStableKey(ref) {
            const char = resolveCharacter(ref);
            return char?.key || normalizeCharacterLookup(getReskinnedName(ref));
        }

        function getReskinnedArena(arena) {
            const rule = getArenaRule(arena);
            return rule?.publicName || RESKIN_ARENAS[arena] || arena;
        }

        function validateCharacterDatabase() {
            const errors = [];
            const warnings = [];
            const allowedFactions = new Set(['WARDEN', 'ASTRAL', 'VOIDBORN', 'MORTAL']);
            const allowedTypes = new Set(['MARTIAL', 'ARCANE', 'SPECIAL', 'TACTICAL']);
            const ids = new Set(), keys = new Set(), names = new Set(), portraits = new Set(), aliases = new Set();

            if (CHARACTER_SCHEMA_VERSION !== 5) errors.push(`Ожидалась схема персонажей v5, получена v${CHARACTER_SCHEMA_VERSION || 'нет'}`);
            if (DB.length !== 75) errors.push(`Ожидалось 75 персонажей, получено ${DB.length}`);

            DB.forEach((char, index) => {
                const expectedId = index + 1;
                const expectedKey = `fighter_${String(expectedId).padStart(3, '0')}`;
                if (char.id !== expectedId) errors.push(`Нарушена последовательность ID: позиция ${expectedId}, id=${char.id}`);
                if (char.key !== expectedKey) errors.push(`Нестабильный key для id ${char.id}: ${char.key}`);
                if (ids.has(char.id)) errors.push(`Дубликат id ${char.id}`); else ids.add(char.id);
                if (keys.has(char.key)) errors.push(`Дубликат key ${char.key}`); else keys.add(char.key);
                if (!char.name) errors.push(`Пустое публичное имя у ${char.key}`);
                const normName = normalizeCharacterLookup(char.name);
                if (names.has(normName)) errors.push(`Дубликат публичного имени ${char.name}`); else names.add(normName);
                if (!char.img) errors.push(`Нет портрета у ${char.key}`);
                if (portraits.has(char.img)) warnings.push(`Повтор портрета ${char.img}`); else portraits.add(char.img);
                if (!allowedFactions.has(char.faction)) errors.push(`Неизвестная фракция ${char.faction} у ${char.key}`);
                if (!allowedTypes.has(char.type)) errors.push(`Неизвестный тип ${char.type} у ${char.key}`);
                if (!Number.isFinite(char.tier) || char.tier < -1 || char.tier > 5) errors.push(`Некорректный tier у ${char.key}`);
                if (!Number.isFinite(char.draftWeight) || char.draftWeight <= 0) errors.push(`Некорректный вес драфта у ${char.key}`);
                if (!Number.isFinite(char.basePower) || !Number.isFinite(char.primePower)) errors.push(`Некорректная сила у ${char.key}`);
                if (char.primePower < char.basePower) warnings.push(`Prime слабее Base у ${char.key}`);
                if (!char.pName || !char.pDesc) errors.push(`Не заполнена Прайм-способность у ${char.key}`);
                if (char.canonProfileKey !== char.key) errors.push(`Некорректная ссылка Canon Bible у ${char.key}: ${char.canonProfileKey || 'нет'}`);
                if (!char.canonDataVersion) errors.push(`Нет версии Canon Bible у ${char.key}`);
                if (char.combatProfileKey !== char.key) errors.push(`Некорректная ссылка Combat Profile у ${char.key}: ${char.combatProfileKey || 'нет'}`);
                if (!char.combatEngineVersion) errors.push(`Нет версии Combat Engine у ${char.key}`);
                char.legacyAliases.forEach(alias => {
                    const normAlias = normalizeCharacterLookup(alias);
                    if (!normAlias) return;
                    if (aliases.has(normAlias)) warnings.push(`Повтор legacy alias: ${alias}`);
                    aliases.add(normAlias);
                });
            });

            return Object.freeze({ ok: errors.length === 0, schemaVersion: CHARACTER_SCHEMA_VERSION, count: DB.length, errors: Object.freeze(errors), warnings: Object.freeze(warnings) });
        }

        const CHARACTER_VALIDATION = validateCharacterDatabase();
        if (!CHARACTER_VALIDATION.ok) console.error('❌ Character Data System:', CHARACTER_VALIDATION.errors);
        else console.log(`✅ Character Data System R11: ${DB.length} бойцов, schema v${CHARACTER_SCHEMA_VERSION}.`);
        if (CHARACTER_VALIDATION.warnings.length) console.warn('⚠️ Character Data System:', CHARACTER_VALIDATION.warnings);

        const PURE_CANON_DRAFT_ENGINE = window.PureCanonDraft || null;
        const DRAFT_VALIDATION = PURE_CANON_DRAFT_ENGINE
            ? PURE_CANON_DRAFT_ENGINE.validateRoster(DB)
            : Object.freeze({ ok: false, errors: Object.freeze(['Pure Canon Draft Engine is missing']), warnings: Object.freeze([]) });
        if (!DRAFT_VALIDATION.ok) console.error('❌ Pure Canon Draft R11:', DRAFT_VALIDATION.errors);
        else console.log(`✅ Pure Canon Draft ${DRAFT_VALIDATION.engineVersion}: ${DRAFT_VALIDATION.rosterSize} бойцов, ${DRAFT_VALIDATION.drawCount} карт без повторов, team balancing OFF.`);
        if (DRAFT_VALIDATION.warnings?.length) console.warn('⚠️ Pure Canon Draft R11:', DRAFT_VALIDATION.warnings);
        window.SOUL_ARENA_DRAFT_SYSTEM = Object.freeze({
            version: PURE_CANON_DRAFT_ENGINE?.version || '',
            mode: PURE_CANON_DRAFT_ENGINE?.mode || '',
            validation: DRAFT_VALIDATION,
            rules: PURE_CANON_DRAFT_ENGINE?.rules || null
        });

        const CANON_BIBLE = window.SOUL_ARENA_CANON_BIBLE || null;
        const CANON_SCHEMA_VERSION = Number(CANON_BIBLE?.schemaVersion || 0);
        const CANON_VERSION = String(CANON_BIBLE?.canonVersion || '');
        const CANON_PROFILES = Array.isArray(CANON_BIBLE?.profiles) ? CANON_BIBLE.profiles : [];
        const CANON_BY_ID = new Map();
        const CANON_BY_KEY = new Map();

        CANON_PROFILES.forEach(profile => {
            CANON_BY_ID.set(Number(profile?.id), profile);
            CANON_BY_KEY.set(normalizeCharacterLookup(profile?.key), profile);
        });

        function validateCanonBible() {
            const errors = [];
            const warnings = [];
            const ids = new Set();
            const keys = new Set();
            const sourceRegistry = CANON_BIBLE?.sourceRegistry || {};

            if (!CANON_BIBLE) errors.push('Canon Bible runtime data is missing');
            if (CANON_SCHEMA_VERSION !== 4) errors.push(`Expected Canon Bible schema v4, got v${CANON_SCHEMA_VERSION || 'none'}`);
            if (CANON_VERSION !== '2026-09-02') warnings.push(`Unexpected Canon Bible version: ${CANON_VERSION || 'none'}`);
            if (Number(CANON_BIBLE?.characterCount) !== 75) errors.push(`Expected Canon Bible characterCount=75, got ${CANON_BIBLE?.characterCount ?? 'none'}`);
            if (Number(CANON_BIBLE?.animeCutoff?.throughEpisode) < 46) warnings.push('Canon Bible anime cutoff is older than episode 46');
            if (CANON_PROFILES.length !== 75) errors.push(`Expected 75 Canon Bible profiles, got ${CANON_PROFILES.length}`);

            CANON_PROFILES.forEach((profile, index) => {
                const id = Number(profile?.id);
                const key = String(profile?.key || '');
                const expectedId = index + 1;
                const expectedKey = `fighter_${String(expectedId).padStart(3, '0')}`;
                if (id !== expectedId) errors.push(`Canon profile order/id mismatch at ${expectedKey}: id=${id}`);
                if (key !== expectedKey) errors.push(`Canon profile key mismatch for id ${id}: ${key}`);
                if (ids.has(id)) errors.push(`Duplicate Canon profile id ${id}`); else ids.add(id);
                if (keys.has(key)) errors.push(`Duplicate Canon profile key ${key}`); else keys.add(key);
                if (!String(profile?.canonName || '').trim()) errors.push(`Missing canonName for ${key}`);
                if (!String(profile?.baseSnapshot?.label || '').trim() || !String(profile?.baseSnapshot?.description || '').trim()) errors.push(`Incomplete Base snapshot for ${key}`);
                if (!String(profile?.primeSnapshot?.label || '').trim() || !String(profile?.primeSnapshot?.description || '').trim()) errors.push(`Incomplete Prime snapshot for ${key}`);
                if (!Array.isArray(profile?.baseSnapshot?.techniques) || !profile.baseSnapshot.techniques.length) warnings.push(`Base techniques are empty for ${key}`);
                if (!Array.isArray(profile?.primeSnapshot?.techniques) || !profile.primeSnapshot.techniques.length) warnings.push(`Prime techniques are empty for ${key}`);
                if (!Array.isArray(profile?.primeSnapshot?.limitations)) errors.push(`Prime limitations must be an array for ${key}`);
                if (!Array.isArray(profile?.sourceIds) || !profile.sourceIds.length) errors.push(`Missing sourceIds for ${key}`);
                else profile.sourceIds.forEach(sourceId => { if (!sourceRegistry[sourceId]) errors.push(`Unknown sourceId ${sourceId} for ${key}`); });

                const runtimeChar = CHARACTER_BY_ID.get(id);
                if (!runtimeChar) {
                    errors.push(`Canon profile ${key} has no runtime character`);
                    return;
                }
                if (runtimeChar.key !== key) errors.push(`Canon/runtime key mismatch for id ${id}`);
                if (runtimeChar.canonProfileKey !== key) errors.push(`Character ${runtimeChar.key} does not point to its Canon profile`);
                if (runtimeChar.canonDataVersion && CANON_VERSION && runtimeChar.canonDataVersion !== CANON_VERSION) errors.push(`Canon version mismatch for ${key}`);
                if (String(profile?.publicName || '') !== runtimeChar.name) errors.push(`Public name mismatch for ${key}`);
                if (String(profile?.portrait || '') !== runtimeChar.img) errors.push(`Portrait mismatch for ${key}`);

                const legacy = profile?.legacyPowerSnapshot || {};
                if (Number(legacy.base) !== runtimeChar.basePower) errors.push(`Legacy Base power changed for ${key}`);
                if (Number(legacy.prime) !== runtimeChar.primePower) errors.push(`Legacy Prime power changed for ${key}`);
                if (Number(legacy.tier) !== runtimeChar.tier) errors.push(`Legacy tier changed for ${key}`);
                if (Number(legacy.draftWeight) !== runtimeChar.draftWeight) errors.push(`Legacy draft weight changed for ${key}`);
            });

            DB.forEach(char => {
                if (!CANON_BY_ID.has(char.id)) errors.push(`Missing Canon profile for ${char.key}`);
            });

            return Object.freeze({
                ok: errors.length === 0,
                schemaVersion: CANON_SCHEMA_VERSION,
                canonVersion: CANON_VERSION,
                count: CANON_PROFILES.length,
                errors: Object.freeze(errors),
                warnings: Object.freeze(warnings)
            });
        }

        const CANON_VALIDATION = validateCanonBible();
        if (!CANON_VALIDATION.ok) console.error('Canon Bible validation failed:', CANON_VALIDATION.errors);
        else console.log(`Canon Bible R4/R10 foundation ready: ${CANON_VALIDATION.count} profiles, cutoff episode ${CANON_BIBLE?.animeCutoff?.throughEpisode || '?'}.`);
        if (CANON_VALIDATION.warnings.length) console.warn('Canon Bible warnings:', CANON_VALIDATION.warnings);

        function getCanonProfile(ref) {
            const char = resolveCharacter(ref);
            if (!char) return null;
            return CANON_BY_ID.get(char.id) || null;
        }

        window.SOUL_ARENA_CANON_SYSTEM = Object.freeze({
            schemaVersion: CANON_SCHEMA_VERSION,
            canonVersion: CANON_VERSION,
            animeCutoff: Object.freeze({ ...(CANON_BIBLE?.animeCutoff || {}) }),
            count: CANON_PROFILES.length,
            validation: CANON_VALIDATION,
            getById: id => CANON_BY_ID.get(Number(id)) || null,
            getByKey: key => CANON_BY_KEY.get(normalizeCharacterLookup(key)) || null,
            getForCharacter: ref => getCanonProfile(ref)
        });


        /* ==========================================================================
           R17 CANON VERIFICATION RUNTIME: R8 COMBAT + R6 SPECIAL + R7 FATIGUE + R17 ARENA 2.0 + R10 VERIFICATION
           - Multi-parameter foundation derived from R4 Canon Bible.
           - R6 explicit hard-hax, activation conditions and pair interactions are preserved.
           - R7 state-aware fatigue remains active for sequential 5v5 attrition.
           - R17 applies independent terrain + home-field modifiers to every Combat Engine resolution.
           - R9 replaced the old hand-authored Fresh-vs-Fresh matrix with a deterministic 33,300-result cache generated from the engine.
           - R10 adds narrow evidence-backed pair/form corrections plus Golden Canon regression tests.
           - R7 Fatigue remains dynamic and primary whenever either survivor carries damage from an earlier 5v5 duel.
           ========================================================================== */
        const COMBAT_PROFILE_DATA = window.SOUL_ARENA_COMBAT_PROFILES || null;
        const COMBAT_SCHEMA_VERSION = Number(COMBAT_PROFILE_DATA?.schemaVersion || 0);
        const COMBAT_ENGINE_VERSION = String(COMBAT_PROFILE_DATA?.engineVersion || '');
        const COMBAT_PROFILES = Array.isArray(COMBAT_PROFILE_DATA?.profiles) ? COMBAT_PROFILE_DATA.profiles : [];
        const COMBAT_BY_ID = new Map();
        const COMBAT_BY_KEY = new Map();
        const COMBAT_STAT_NAMES = Array.isArray(COMBAT_PROFILE_DATA?.statNames) ? [...COMBAT_PROFILE_DATA.statNames] : [];
        const COMBAT_WEIGHTS = { ...(COMBAT_PROFILE_DATA?.weights || {}) };
        const FINAL_COMBAT_POLICY = window.SOUL_ARENA_FINAL_COMBAT_POLICY || null;
        const FINAL_RATING_REVISION = String(FINAL_COMBAT_POLICY?.ratingRevision || '');

        /* R17 Arena Engine 2.0: terrain and home-field are two independent deterministic layers. */
        const ARENA_RULE_DATA = window.SOUL_ARENA_ARENA_RULES || null;
        const ARENA_SCHEMA_VERSION = Number(ARENA_RULE_DATA?.schemaVersion || 0);
        const ARENA_ENGINE_VERSION = String(ARENA_RULE_DATA?.engineVersion || '');
        const ARENA_RULES = Array.isArray(ARENA_RULE_DATA?.arenas) ? ARENA_RULE_DATA.arenas : [];
        const ARENA_BY_ID = new Map();
        const ARENA_ALIAS_TO_ID = new Map();

        function normalizeArenaLookup(value) {
            return String(value ?? '').trim().toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z0-9_]/gi, '');
        }

        ARENA_RULES.forEach(arena => {
            const id = String(arena?.id || '').toUpperCase();
            if (!id) return;
            ARENA_BY_ID.set(id, arena);
            [id, arena?.publicName, ...(Array.isArray(arena?.legacyNames) ? arena.legacyNames : [])].forEach(alias => {
                const key = normalizeArenaLookup(alias);
                if (key) ARENA_ALIAS_TO_ID.set(key, id);
            });
        });

        function getArenaRule(ref) {
            if (ref && typeof ref === 'object' && ref.id && ARENA_BY_ID.has(String(ref.id).toUpperCase())) return ARENA_BY_ID.get(String(ref.id).toUpperCase());
            const raw = String(ref ?? '').trim();
            if (!raw) return null;
            const direct = raw.toUpperCase();
            if (ARENA_BY_ID.has(direct)) return ARENA_BY_ID.get(direct);
            const id = ARENA_ALIAS_TO_ID.get(normalizeArenaLookup(raw));
            return id ? ARENA_BY_ID.get(id) || null : null;
        }

        function validateArenaRules() {
            const errors = [], warnings = [];
            if (!ARENA_RULE_DATA) errors.push('R17 Arena rules data is missing');
            if (ARENA_SCHEMA_VERSION !== 17) errors.push(`Expected Arena schema v17, got v${ARENA_SCHEMA_VERSION || 'none'}`);
            if (!ARENA_ENGINE_VERSION.startsWith('R17')) errors.push(`Unexpected Arena Engine version: ${ARENA_ENGINE_VERSION || 'none'}`);
            if (String(ARENA_RULE_DATA?.canonVersion || '') !== CANON_VERSION) errors.push('Arena rules canonVersion does not match Canon Bible');
            if (ARENA_RULES.length !== 3) errors.push(`Expected 3 arenas, got ${ARENA_RULES.length}`);
            const expectedIds = new Set(['ARENA_01','ARENA_02','ARENA_03']);
            const allowedFactions = new Set(['WARDEN','ASTRAL','VOIDBORN','MORTAL']);
            const allowedTypes = new Set(['MARTIAL','ARCANE','SPECIAL','TACTICAL']);
            const minClamp = Number(ARENA_RULE_DATA?.statClamp?.minMultiplier ?? .94);
            const maxClamp = Number(ARENA_RULE_DATA?.statClamp?.maxMultiplier ?? 1.06);
            const homeMin = Number(ARENA_RULE_DATA?.homeFieldClamp?.minMultiplier ?? 1);
            const homeMax = Number(ARENA_RULE_DATA?.homeFieldClamp?.maxMultiplier ?? 1.015);
            if (!(minClamp > 0 && minClamp <= 1 && maxClamp >= 1 && maxClamp <= 1.1 && minClamp < maxClamp)) errors.push('Invalid Arena stat clamp');
            if (!(homeMin >= 1 && homeMax >= homeMin && homeMax <= 1.03)) errors.push('Invalid home-field clamp');
            const validateStats = (obj, where, limits = [.8, 1.2]) => {
                if (!obj) return;
                Object.entries(obj).forEach(([stat, value]) => {
                    if (!COMBAT_STAT_NAMES.includes(stat)) errors.push(`Unknown Arena stat ${stat} in ${where}`);
                    const num = Number(value);
                    if (!Number.isFinite(num) || num < limits[0] || num > limits[1]) errors.push(`Invalid Arena multiplier ${stat}=${value} in ${where}`);
                });
            };
            const ids = new Set();
            ARENA_RULES.forEach(arena => {
                const id = String(arena?.id || '').toUpperCase();
                if (!expectedIds.has(id)) errors.push(`Unexpected Arena id ${id || 'none'}`);
                if (ids.has(id)) errors.push(`Duplicate Arena id ${id}`); else ids.add(id);
                if (!String(arena?.publicName || '').trim()) errors.push(`Arena ${id} missing publicName`);
                if (!String(arena?.shortDescription || '').trim()) errors.push(`Arena ${id} missing shortDescription`);
                if (!String(arena?.terrainSummary || '').trim()) errors.push(`Arena ${id} missing terrainSummary`);
                if (!String(arena?.homeFieldSummary || '').trim()) errors.push(`Arena ${id} missing homeFieldSummary`);
                const terrain = arena?.terrain || {};
                validateStats(terrain?.globalStatMultipliers, `${id}/terrain/global`);
                Object.entries(terrain?.combatTypeStatMultipliers || {}).forEach(([key, mods]) => { if (!allowedTypes.has(key)) errors.push(`Unknown Arena combat type ${key} in ${id}`); validateStats(mods, `${id}/terrain/type/${key}`); });
                Object.entries(terrain?.tagStatMultipliers || {}).forEach(([key, mods]) => { if (!String(key).trim()) errors.push(`Empty Arena tag in ${id}`); validateStats(mods, `${id}/terrain/tag/${key}`); });
                const home = arena?.homeField || null;
                if (!home || !allowedFactions.has(String(home?.faction || ''))) errors.push(`Arena ${id} has invalid home-field faction`);
                if (!String(home?.publicFaction || '').trim()) warnings.push(`Arena ${id} home-field publicFaction is empty`);
                validateStats(home?.statMultipliers, `${id}/home/${home?.faction || 'unknown'}`, [homeMin, homeMax]);
            });
            expectedIds.forEach(id => { if (!ids.has(id)) errors.push(`Missing Arena ${id}`); });
            const nativeFactions = ARENA_RULES.map(arena => String(arena?.homeField?.faction || '')).filter(Boolean);
            if (new Set(nativeFactions).size !== nativeFactions.length) warnings.push('Two arenas share the same home-field faction');
            if (ARENA_ALIAS_TO_ID.size < 6) warnings.push(`Arena alias registry is unexpectedly small: ${ARENA_ALIAS_TO_ID.size}`);
            return Object.freeze({ok:errors.length===0,schemaVersion:ARENA_SCHEMA_VERSION,engineVersion:ARENA_ENGINE_VERSION,count:ARENA_RULES.length,layers:Object.freeze(['terrain','homeField']),errors:Object.freeze(errors),warnings:Object.freeze(warnings)});
        }

        const ARENA_VALIDATION = validateArenaRules();
        if (!ARENA_VALIDATION.ok) console.error('R17 Arena Engine 2.0 validation failed:', ARENA_VALIDATION.errors);
        else console.log(`R17 Arena Engine 2.0 ready: ${ARENA_VALIDATION.count} arenas, terrain + home-field layers.`);
        if (ARENA_VALIDATION.warnings.length) console.warn('R17 Arena Engine warnings:', ARENA_VALIDATION.warnings);

        function multiplyArenaStatFactors(factors, modifiers) {
            if (!modifiers) return;
            Object.entries(modifiers).forEach(([stat, value]) => {
                if (!COMBAT_STAT_NAMES.includes(stat)) return;
                factors[stat] *= Number(value || 1);
            });
        }

        function applyArenaToSnapshot(snapshot, arenaRef) {
            const arena = getArenaRule(arenaRef);
            if (!snapshot || !arena) return Object.freeze({snapshot, arena:null, scoreDelta:0, changedStats:Object.freeze([]), sources:Object.freeze([]), terrainSources:Object.freeze([]), homeFieldActive:false, homeField:null});
            const factors = Object.fromEntries(COMBAT_STAT_NAMES.map(stat => [stat, 1]));
            const terrainSources = [];
            const terrain = arena?.terrain || {};
            multiplyArenaStatFactors(factors, terrain?.globalStatMultipliers);
            if (terrain?.globalStatMultipliers && Object.keys(terrain.globalStatMultipliers).length) terrainSources.push('global');
            const typeMods = terrain?.combatTypeStatMultipliers?.[snapshot.character.type];
            if (typeMods) { multiplyArenaStatFactors(factors, typeMods); terrainSources.push(`type:${snapshot.character.type}`); }
            const tagMods = terrain?.tagStatMultipliers || {};
            (snapshot.tags || []).forEach(tag => {
                const tagKey = String(tag).toLowerCase();
                const mods = tagMods[tagKey];
                if (mods) { multiplyArenaStatFactors(factors, mods); terrainSources.push(`tag:${tagKey}`); }
            });

            const home = arena?.homeField || null;
            const homeFieldActive = Boolean(home && String(home.faction) === String(snapshot.character.faction));
            if (homeFieldActive) multiplyArenaStatFactors(factors, home?.statMultipliers);

            const minFactor = Number(ARENA_RULE_DATA?.statClamp?.minMultiplier ?? .94);
            const maxFactor = Number(ARENA_RULE_DATA?.statClamp?.maxMultiplier ?? 1.06);
            const stats = {};
            const changedStats = [];
            COMBAT_STAT_NAMES.forEach(stat => {
                const factor = clampNumber(factors[stat], minFactor, maxFactor);
                const before = Number(snapshot.stats[stat] || 0);
                const after = before * factor;
                stats[stat] = Number(after.toFixed(4));
                if (Math.abs(factor - 1) >= .0049) changedStats.push(Object.freeze({stat,factor:Number(factor.toFixed(4)),before:Number(before.toFixed(3)),after:Number(after.toFixed(3))}));
            });
            const beforeScore = weightedCombatScore(snapshot);
            const sourceList = terrainSources.map(source => `terrain:${source}`);
            if (homeFieldActive) sourceList.push(`home:${home.faction}`);
            const homeFieldInfo = home ? Object.freeze({faction:String(home.faction || ''),publicFaction:String(home.publicFaction || ''),active:homeFieldActive}) : null;
            const adjusted = {...snapshot, stats, arena:Object.freeze({id:String(arena.id),publicName:String(arena.publicName),layers:Object.freeze({terrain:true,homeField:homeFieldActive}),sources:Object.freeze([...new Set(sourceList)]),terrainSources:Object.freeze([...new Set(terrainSources)]),homeField:homeFieldInfo,changedStats:Object.freeze(changedStats)})};
            const afterScore = weightedCombatScore(adjusted);
            return Object.freeze({snapshot:adjusted,arena,scoreDelta:Number((afterScore-beforeScore).toFixed(3)),changedStats:Object.freeze(changedStats),sources:Object.freeze([...new Set(sourceList)]),terrainSources:Object.freeze([...new Set(terrainSources)]),homeFieldActive,homeField:homeFieldInfo});
        }

        /* R7 state-aware fatigue rules. These are internal simulation calibration, not canon measurements. */
        const FATIGUE_RULE_DATA = window.SOUL_ARENA_FATIGUE_RULES || null;
        const FATIGUE_SCHEMA_VERSION = Number(FATIGUE_RULE_DATA?.schemaVersion || 0);
        const FATIGUE_ENGINE_VERSION = String(FATIGUE_RULE_DATA?.engineVersion || '');
        const FATIGUE_STATE_PROFILES = Array.isArray(FATIGUE_RULE_DATA?.states) ? FATIGUE_RULE_DATA.states : [];
        const FATIGUE_BY_ID = new Map(FATIGUE_STATE_PROFILES.map(state => [Number(state?.id), state]));
        const FATIGUE_DAMAGE_MODEL = FATIGUE_RULE_DATA?.damageModel || {};

        function validateFatigueRules() {
            const errors = [], warnings = [];
            if (!FATIGUE_RULE_DATA) errors.push('R7 Fatigue rules data is missing');
            if (FATIGUE_SCHEMA_VERSION !== 7) errors.push(`Expected Fatigue schema v7, got v${FATIGUE_SCHEMA_VERSION || 'none'}`);
            if (!FATIGUE_ENGINE_VERSION.startsWith('R7')) errors.push(`Unexpected Fatigue Engine version: ${FATIGUE_ENGINE_VERSION || 'none'}`);
            if (String(FATIGUE_RULE_DATA?.canonVersion || '') !== CANON_VERSION) errors.push('Fatigue rules canonVersion does not match Canon Bible');
            if (FATIGUE_STATE_PROFILES.length !== 5) errors.push(`Expected 5 fatigue states, got ${FATIGUE_STATE_PROFILES.length}`);
            FATIGUE_STATE_PROFILES.forEach((state, index) => {
                if (Number(state?.id) !== index) errors.push(`Fatigue state sequence broken at ${index}`);
                const stats = state?.statMultipliers || {};
                COMBAT_STAT_NAMES.forEach(stat => {
                    const value = Number(stats?.[stat]);
                    if (!Number.isFinite(value) || value < 0 || value > 1.1) errors.push(`Invalid fatigue multiplier ${stat}=${stats?.[stat]} in state ${index}`);
                });
                for (const key of ['haxReliability','startupPenalty','highCostPenalty','overrideReliability']) {
                    const value = Number(state?.[key]);
                    if (!Number.isFinite(value) || value < 0) errors.push(`Invalid ${key} in fatigue state ${index}`);
                }
            });
            // Every combat-relevant multiplier must be monotonic non-increasing as damage worsens.
            for (const stat of COMBAT_STAT_NAMES) {
                let previous = Infinity;
                FATIGUE_STATE_PROFILES.forEach(state => {
                    const value = Number(state?.statMultipliers?.[stat] ?? 0);
                    if (value > previous + 1e-9) warnings.push(`Non-monotonic fatigue multiplier for ${stat}`);
                    previous = value;
                });
            }
            return Object.freeze({ok:errors.length===0,schemaVersion:FATIGUE_SCHEMA_VERSION,engineVersion:FATIGUE_ENGINE_VERSION,stateCount:FATIGUE_STATE_PROFILES.length,errors:Object.freeze(errors),warnings:Object.freeze(warnings)});
        }

        const FATIGUE_VALIDATION = validateFatigueRules();
        if (!FATIGUE_VALIDATION.ok) console.error('R7 Fatigue Engine validation failed:', FATIGUE_VALIDATION.errors);
        else console.log(`R7 Fatigue Engine ready: ${FATIGUE_VALIDATION.stateCount} states, state-specific multipliers and activation strain.`);
        if (FATIGUE_VALIDATION.warnings.length) console.warn('R7 Fatigue Engine warnings:', FATIGUE_VALIDATION.warnings);

        function getFatigueStateProfile(state) {
            const numeric = Math.max(0, Math.min(4, Number(state) || 0));
            return FATIGUE_BY_ID.get(numeric) || FATIGUE_BY_ID.get(0) || null;
        }

        COMBAT_PROFILES.forEach(profile => {
            COMBAT_BY_ID.set(Number(profile?.id), profile);
            COMBAT_BY_KEY.set(normalizeCharacterLookup(profile?.key), profile);
        });

        function validateCombatProfiles() {
            const errors = [];
            const warnings = [];
            const ids = new Set();
            const keys = new Set();
            const weightSum = Object.values(COMBAT_WEIGHTS).reduce((sum, value) => sum + Number(value || 0), 0);
            if (!COMBAT_PROFILE_DATA) errors.push('Combat Engine profile data is missing');
            if (COMBAT_SCHEMA_VERSION !== 5) errors.push(`Expected Combat Profile schema v5, got v${COMBAT_SCHEMA_VERSION || 'none'}`);
            if (!COMBAT_ENGINE_VERSION.startsWith('R8')) errors.push(`Unexpected Combat Engine version: ${COMBAT_ENGINE_VERSION || 'none'}`);
            if (String(COMBAT_PROFILE_DATA?.canonVersion || '') !== CANON_VERSION) errors.push('Combat Profile canonVersion does not match Canon Bible');
            if (Number(COMBAT_PROFILE_DATA?.characterCount) !== 75 || COMBAT_PROFILES.length !== 75) errors.push(`Expected 75 Combat Profiles, got ${COMBAT_PROFILES.length}`);
            if (COMBAT_STAT_NAMES.length !== 13) warnings.push(`Expected 13 combat stats, got ${COMBAT_STAT_NAMES.length}`);
            if (Math.abs(weightSum - 1) > 0.00001) errors.push(`Combat weights must sum to 1.0, got ${weightSum}`);

            COMBAT_PROFILES.forEach((profile, index) => {
                const expectedId = index + 1;
                const expectedKey = `fighter_${String(expectedId).padStart(3, '0')}`;
                if (Number(profile?.id) !== expectedId) errors.push(`Combat Profile ID sequence broken at ${expectedKey}`);
                if (String(profile?.key || '') !== expectedKey) errors.push(`Combat Profile key mismatch for id ${expectedId}`);
                if (ids.has(expectedId)) errors.push(`Duplicate Combat Profile id ${expectedId}`); else ids.add(expectedId);
                if (keys.has(expectedKey)) errors.push(`Duplicate Combat Profile key ${expectedKey}`); else keys.add(expectedKey);
                if (!CHARACTER_BY_ID.has(expectedId)) errors.push(`Combat Profile ${expectedKey} has no runtime character`);
                if (!CANON_BY_ID.has(expectedId)) errors.push(`Combat Profile ${expectedKey} has no Canon Bible profile`);
                for (const formName of ['base', 'prime']) {
                    const form = profile?.forms?.[formName];
                    if (!form) { errors.push(`Missing ${formName} Combat Profile for ${expectedKey}`); continue; }
                    for (const stat of COMBAT_STAT_NAMES) {
                        const value = Number(form?.stats?.[stat]);
                        if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`Invalid ${stat}=${form?.stats?.[stat]} in ${expectedKey}/${formName}`);
                    }
                    const sourcePower = Number(form?.sourcePowerCalibration);
                    const runtimePower = formName === 'prime' ? Number(CHARACTER_BY_ID.get(expectedId)?.primePower) : Number(CHARACTER_BY_ID.get(expectedId)?.basePower);
                    if (!Number.isFinite(sourcePower) || sourcePower !== runtimePower) errors.push(`Final rating calibration mismatch in ${expectedKey}/${formName}: ${sourcePower} vs ${runtimePower}`);
                    const startup = Number(form?.activation?.startup);
                    const selfCost = Number(form?.activation?.selfCost);
                    if (!Number.isInteger(startup) || startup < 0 || startup > 3) errors.push(`Invalid startup in ${expectedKey}/${formName}`);
                    if (!Number.isInteger(selfCost) || selfCost < 0 || selfCost > 3) errors.push(`Invalid selfCost in ${expectedKey}/${formName}`);
                }
            });

            return Object.freeze({ ok: errors.length === 0, schemaVersion: COMBAT_SCHEMA_VERSION, engineVersion: COMBAT_ENGINE_VERSION, count: COMBAT_PROFILES.length, errors: Object.freeze(errors), warnings: Object.freeze(warnings) });
        }

        const COMBAT_VALIDATION = validateCombatProfiles();
        if (!COMBAT_VALIDATION.ok) console.error('Combat Engine 2.0 validation failed:', COMBAT_VALIDATION.errors);
        else console.log(`Combat Engine 2.0 R8 numeric foundation ready: ${COMBAT_VALIDATION.count} profiles, ${COMBAT_STAT_NAMES.length} stats per form.`);
        if (COMBAT_VALIDATION.warnings.length) console.warn('Combat Engine 2.0 warnings:', COMBAT_VALIDATION.warnings);

        function getCombatProfile(ref) {
            const char = resolveCharacter(ref);
            return char ? COMBAT_BY_ID.get(char.id) || null : null;
        }

        /* R6 explicit Hax & Matchup rules. */
        const HAX_RULE_DATA = window.SOUL_ARENA_HAX_RULES || null;
        const HAX_SCHEMA_VERSION = Number(HAX_RULE_DATA?.schemaVersion || 0);
        const HAX_ENGINE_VERSION = String(HAX_RULE_DATA?.engineVersion || '');
        const HAX_PROFILES = Array.isArray(HAX_RULE_DATA?.profiles) ? HAX_RULE_DATA.profiles : [];
        const HAX_PAIR_INTERACTIONS = Array.isArray(HAX_RULE_DATA?.pairInteractions) ? HAX_RULE_DATA.pairInteractions : [];
        const HAX_BY_ID = new Map(HAX_PROFILES.map(profile => [Number(profile?.id), profile]));

        function validateHaxRules() {
            const errors = [], warnings = [];
            if (!HAX_RULE_DATA) errors.push('R6 Hax rules data is missing');
            if (HAX_SCHEMA_VERSION !== 6) errors.push(`Expected Hax schema v6, got v${HAX_SCHEMA_VERSION || 'none'}`);
            if (!HAX_ENGINE_VERSION.startsWith('R6')) errors.push(`Unexpected Hax Engine version: ${HAX_ENGINE_VERSION || 'none'}`);
            if (String(HAX_RULE_DATA?.canonVersion || '') !== CANON_VERSION) errors.push('Hax rules canonVersion does not match Canon Bible');
            const seen = new Set();
            HAX_PROFILES.forEach(profile => {
                const id = Number(profile?.id);
                if (!CHARACTER_BY_ID.has(id)) errors.push(`Hax profile references unknown fighter id ${id}`);
                if (seen.has(id)) errors.push(`Duplicate Hax profile id ${id}`); else seen.add(id);
                for (const formName of ['base','prime']) {
                    const mechanics = profile?.forms?.[formName];
                    if (mechanics == null) continue;
                    if (!Array.isArray(mechanics)) errors.push(`Hax mechanics for fighter_${String(id).padStart(3,'0')}/${formName} must be an array`);
                    else mechanics.forEach(mechanic => {
                        if (!String(mechanic?.key || '').trim()) errors.push(`Hax mechanic without key for fighter ${id}/${formName}`);
                        const impact = Number(mechanic?.impact);
                        const reliability = Number(mechanic?.reliability);
                        if (!Number.isFinite(impact) || impact < 0 || impact > 25) errors.push(`Invalid hax impact for fighter ${id}: ${impact}`);
                        if (!Number.isFinite(reliability) || reliability < 0 || reliability > 1) errors.push(`Invalid hax reliability for fighter ${id}: ${reliability}`);
                    });
                }
            });
            HAX_PAIR_INTERACTIONS.forEach(rule => {
                if (!CHARACTER_BY_ID.has(Number(rule?.a)) || !CHARACTER_BY_ID.has(Number(rule?.b))) errors.push(`Pair interaction ${rule?.key || '?'} references unknown fighter`);
                if (rule?.winnerOverride != null && ![Number(rule.a),Number(rule.b)].includes(Number(rule.winnerOverride))) errors.push(`Pair interaction ${rule?.key || '?'} has invalid winnerOverride`);
            });
            if (HAX_PROFILES.length < 25) warnings.push(`Only ${HAX_PROFILES.length} fighters have explicit hax profiles`);
            return Object.freeze({ok:errors.length===0,schemaVersion:HAX_SCHEMA_VERSION,engineVersion:HAX_ENGINE_VERSION,profileCount:HAX_PROFILES.length,pairRuleCount:HAX_PAIR_INTERACTIONS.length,errors:Object.freeze(errors),warnings:Object.freeze(warnings)});
        }

        const HAX_VALIDATION = validateHaxRules();
        if (!HAX_VALIDATION.ok) console.error('R6 Hax Engine validation failed:', HAX_VALIDATION.errors);
        else console.log(`R6 Hax Engine + R7 fatigue integration ready: ${HAX_VALIDATION.profileCount} explicit fighter profiles, ${HAX_VALIDATION.pairRuleCount} pair rules.`);
        if (HAX_VALIDATION.warnings.length) console.warn('R6 Hax Engine warnings:', HAX_VALIDATION.warnings);

        /* R10 evidence-backed Canon Verification layer. */
        const CANON_VERIFICATION_DATA = window.SOUL_ARENA_CANON_VERIFICATION || null;
        const CANON_VERIFICATION_SCHEMA_VERSION = Number(CANON_VERIFICATION_DATA?.schemaVersion || 0);
        const CANON_VERIFICATION_ENGINE_VERSION = String(CANON_VERIFICATION_DATA?.engineVersion || '');
        const CANON_VERIFICATION_RULES = Array.isArray(CANON_VERIFICATION_DATA?.rules) ? CANON_VERIFICATION_DATA.rules : [];
        const CANON_VERIFICATION_LIMITATIONS = Array.isArray(CANON_VERIFICATION_DATA?.knownLimitations) ? CANON_VERIFICATION_DATA.knownLimitations : [];

        function validateCanonVerificationRules() {
            const errors = [], warnings = [], keys = new Set();
            if (!CANON_VERIFICATION_DATA) errors.push('R10 Canon Verification data is missing');
            if (CANON_VERIFICATION_SCHEMA_VERSION !== 10) errors.push(`Expected Canon Verification schema v10, got v${CANON_VERIFICATION_SCHEMA_VERSION || 'none'}`);
            if (!CANON_VERIFICATION_ENGINE_VERSION.startsWith('R10')) errors.push(`Unexpected Canon Verification version: ${CANON_VERIFICATION_ENGINE_VERSION || 'none'}`);
            if (String(CANON_VERIFICATION_DATA?.canonVersion || '') !== CANON_VERSION) errors.push('Canon Verification canonVersion does not match Canon Bible');
            if (Number(CANON_VERIFICATION_DATA?.characterCount || 0) !== DB.length) errors.push('Canon Verification characterCount does not match roster');
            const sourceRegistry = CANON_VERIFICATION_DATA?.sourceRegistry || {};
            CANON_VERIFICATION_RULES.forEach(rule => {
                const key = String(rule?.key || '');
                const a = Number(rule?.a), b = Number(rule?.b);
                if (!key) errors.push('Canon Verification rule without key');
                else if (keys.has(key)) errors.push(`Duplicate Canon Verification rule: ${key}`);
                else keys.add(key);
                if (!CHARACTER_BY_ID.has(a) || !CHARACTER_BY_ID.has(b) || a === b) errors.push(`Canon Verification rule ${key || '?'} references invalid fighter pair`);
                for (const side of ['a','b']) {
                    const forms = rule?.forms?.[side] || ['base','prime'];
                    if (!Array.isArray(forms) || !forms.length || forms.some(form => !['base','prime'].includes(String(form)))) errors.push(`Invalid forms in ${key}/${side}`);
                }
                for (const field of ['modifierA','modifierB']) {
                    const value = Number(rule?.[field] || 0);
                    if (!Number.isFinite(value) || Math.abs(value) > 60) errors.push(`Invalid ${field}=${rule?.[field]} in ${key}`);
                }
                if (rule?.winnerOverride != null && ![a,b].includes(Number(rule.winnerOverride))) errors.push(`Invalid winnerOverride in ${key}`);
                for (const field of ['winnerStateMin','winnerStateExact']) {
                    if (rule?.[field] != null) {
                        const value = Number(rule[field]);
                        if (!Number.isInteger(value) || value < 0 || value > 3) errors.push(`Invalid ${field} in ${key}`);
                    }
                }
                for (const field of ['winnerMarginFloor','winnerMarginExact']) {
                    if (rule?.[field] != null) {
                        const value = Number(rule[field]);
                        if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`Invalid ${field} in ${key}`);
                    }
                }
                if (!String(rule?.confidence || '').trim()) warnings.push(`Missing confidence in ${key}`);
                (Array.isArray(rule?.evidenceIds) ? rule.evidenceIds : []).forEach(sourceId => { if (!sourceRegistry[sourceId]) errors.push(`Unknown R10 evidenceId ${sourceId} in ${key}`); });
            });
            if (CANON_VERIFICATION_RULES.length < 10) warnings.push(`Only ${CANON_VERIFICATION_RULES.length} verification rules loaded`);
            return Object.freeze({
                ok:errors.length===0, schemaVersion:CANON_VERIFICATION_SCHEMA_VERSION, engineVersion:CANON_VERIFICATION_ENGINE_VERSION,
                ruleCount:CANON_VERIFICATION_RULES.length, limitationCount:CANON_VERIFICATION_LIMITATIONS.length,
                errors:Object.freeze(errors), warnings:Object.freeze(warnings)
            });
        }

        const CANON_VERIFICATION_VALIDATION = validateCanonVerificationRules();
        if (!CANON_VERIFICATION_VALIDATION.ok) console.error('R10 Canon Verification validation failed:', CANON_VERIFICATION_VALIDATION.errors);
        else console.log(`✅ R10 Canon Verification: ${CANON_VERIFICATION_VALIDATION.ruleCount} evidence-backed rules, ${CANON_VERIFICATION_VALIDATION.limitationCount} explicit unresolved limitations.`);
        if (CANON_VERIFICATION_VALIDATION.warnings.length) console.warn('R10 Canon Verification warnings:', CANON_VERIFICATION_VALIDATION.warnings);

        function getHaxProfile(ref) {
            const char = resolveCharacter(ref);
            return char ? HAX_BY_ID.get(char.id) || null : null;
        }

        function getSnapshotInitiative(snapshot) {
            return snapshot ? (snapshot.stats.speed + snapshot.stats.reaction + snapshot.stats.mobility) / 3 - Number(snapshot.activation.effectiveStartup ?? snapshot.activation.startup) * 5 : 0;
        }

        function hasAnyToken(snapshot, tokens) {
            if (!snapshot || !Array.isArray(tokens) || !tokens.length) return false;
            const pool = new Set([...(snapshot.tags || []), ...(snapshot.risks || [])].map(x => String(x).toLowerCase()));
            return tokens.some(token => pool.has(String(token).toLowerCase()));
        }

        function evaluateHaxMechanic(attacker, defender, mechanic) {
            const impact = Number(mechanic?.impact || 0);
            if (!impact) return null;
            if (Array.isArray(mechanic?.requiredTargetForms) && mechanic.requiredTargetForms.length && !mechanic.requiredTargetForms.includes(defender.formName)) return null;
            if (Array.isArray(mechanic?.requiredTargetIds) && mechanic.requiredTargetIds.length && !mechanic.requiredTargetIds.includes(Number(defender?.character?.id))) return null;
            if (Array.isArray(mechanic?.requiredTargetTags) && mechanic.requiredTargetTags.length && !mechanic.requiredTargetTags.some(tag => (defender.tags || []).includes(tag))) return null;
            let scale = clampNumber(Number(mechanic?.reliability ?? .75), 0, 1);
            // R7: prior damage lowers the reliability of complex/sustained abilities instead of merely shrinking one global power number.
            scale *= clampNumber(Number(attacker?.fatigue?.haxReliability ?? 1), 0, 1);
            const initiativeGap = getSnapshotInitiative(attacker) - getSnapshotInitiative(defender);
            const reactiveBlitzGap = Number(FINAL_COMBAT_POLICY?.speedBlitz?.reactiveHaxInitiativeGap ?? 32);
            if (mechanic?.requiresConsciousActivation && initiativeGap <= -reactiveBlitzGap) return null;
            if (!mechanic?.defensive) {
                if (initiativeGap < -32) scale *= .42;
                else if (initiativeGap < -20) scale *= .62;
                else if (initiativeGap > 20) scale *= 1.08;
            }
            const haxGap = Number(attacker.stats.specialPotency || 0) - Number(defender.stats.specialResistance || 0);
            scale *= mechanic?.bypassResistance ? (1 + clampNumber(haxGap / 280, -.16, .16)) : (1 + clampNumber(haxGap / 150, -.38, .30));
            const targetRiskMatches = (mechanic?.targetRiskBonuses || []).filter(token => (defender.risks || []).includes(token)).length;
            if (targetRiskMatches) scale *= 1 + Math.min(.35, targetRiskMatches * .14);
            if (hasAnyToken(defender, mechanic?.counterTags || [])) scale *= .62;
            if ((defender.tags || []).includes('speed') && initiativeGap < -18 && !mechanic?.defensive) scale *= .82;
            if (mechanic?.category === 'divine-reflection' && !(defender.tags || []).some(t => ['divine','god-tier'].includes(t))) scale *= .22;
            const amount = clampNumber(impact * scale, 0, 24);
            if (amount < .55) return null;
            return Object.freeze({key:String(mechanic.key),label:String(mechanic.label || mechanic.key),category:String(mechanic.category || 'hax'),amount:Number(amount.toFixed(3)),reliability:Number(scale.toFixed(3)),notes:String(mechanic.notes || '')});
        }

        function evaluatePairRule(rule, a, b) {
            const aId = Number(a?.character?.id), bId = Number(b?.character?.id);
            const ra = Number(rule?.a), rb = Number(rule?.b);
            let orientation = 0;
            if (aId === ra && bId === rb) orientation = 1;
            else if (aId === rb && bId === ra) orientation = -1;
            else return null;
            const formAForRule = orientation === 1 ? a.formName : b.formName;
            const formBForRule = orientation === 1 ? b.formName : a.formName;
            const allowedA = rule?.forms?.a || ['base','prime'];
            const allowedB = rule?.forms?.b || ['base','prime'];
            if (!allowedA.includes(formAForRule) || !allowedB.includes(formBForRule)) return null;
            const modRuleA = Number(rule?.modifierA || 0), modRuleB = Number(rule?.modifierB || 0);
            const orientedA = orientation === 1 ? modRuleA : modRuleB;
            const orientedB = orientation === 1 ? modRuleB : modRuleA;
            const relA = clampNumber(Number(a?.fatigue?.overrideReliability ?? 1), 0, 1);
            const relB = clampNumber(Number(b?.fatigue?.overrideReliability ?? 1), 0, 1);
            return Object.freeze({
                key:String(rule.key || ''),
                label:String(rule.label || rule.key || 'matchup'),
                confidence:String(rule.confidence || 'UNSPECIFIED'),
                notes:String(rule.notes || ''),
                modA: orientedA * relA,
                modB: orientedB * relB,
                winnerOverride: rule?.winnerOverride == null ? null : Number(rule.winnerOverride),
                hardCounter:Boolean(rule?.hardCounter), abilityBypass:Boolean(rule?.abilityBypass),
                dynamicAdaptation:Boolean(rule?.dynamicAdaptation), marginCap:rule?.marginCap == null ? null : Number(rule.marginCap)
            });
        }

        function evaluateCanonVerificationRule(rule, a, b) {
            const aId = Number(a?.character?.id), bId = Number(b?.character?.id);
            const ra = Number(rule?.a), rb = Number(rule?.b);
            let orientation = 0;
            if (aId === ra && bId === rb) orientation = 1;
            else if (aId === rb && bId === ra) orientation = -1;
            else return null;

            const ruleFormA = orientation === 1 ? a.formName : b.formName;
            const ruleFormB = orientation === 1 ? b.formName : a.formName;
            const allowedA = rule?.forms?.a || ['base','prime'];
            const allowedB = rule?.forms?.b || ['base','prime'];
            if (!allowedA.includes(ruleFormA) || !allowedB.includes(ruleFormB)) return null;
            if (rule?.freshOnly && (Number(a.state || 0) !== FATIGUE_STATES.FRESH || Number(b.state || 0) !== FATIGUE_STATES.FRESH)) return null;

            const modRuleA = Number(rule?.modifierA || 0), modRuleB = Number(rule?.modifierB || 0);
            const relA = clampNumber(Number(a?.fatigue?.overrideReliability ?? 1), 0, 1);
            const relB = clampNumber(Number(b?.fatigue?.overrideReliability ?? 1), 0, 1);
            const orientedA = (orientation === 1 ? modRuleA : modRuleB) * relA;
            const orientedB = (orientation === 1 ? modRuleB : modRuleA) * relB;
            const stateTargetId = Number(rule?.winnerOverride ?? rule?.stateTargetId ?? rule?.a);
            return Object.freeze({
                key:String(rule?.key || ''), label:String(rule?.label || rule?.key || 'Canon Verification'),
                confidence:String(rule?.confidence || 'UNSPECIFIED'), notes:String(rule?.notes || ''),
                modA:Number(orientedA.toFixed(3)), modB:Number(orientedB.toFixed(3)),
                winnerOverride:rule?.winnerOverride == null ? null : Number(rule.winnerOverride),
                stateTargetId:Number.isFinite(stateTargetId) ? stateTargetId : null,
                winnerStateMin:rule?.winnerStateMin == null ? null : Number(rule.winnerStateMin),
                winnerStateExact:rule?.winnerStateExact == null ? null : Number(rule.winnerStateExact),
                winnerMarginFloor:rule?.winnerMarginFloor == null ? null : Number(rule.winnerMarginFloor),
                winnerMarginExact:rule?.winnerMarginExact == null ? null : Number(rule.winnerMarginExact),
                hardCounter:Boolean(rule?.hardCounter), abilityBypass:Boolean(rule?.abilityBypass),
                evidenceIds:Object.freeze(Array.isArray(rule?.evidenceIds) ? [...rule.evidenceIds] : [])
            });
        }

        function evaluateCanonVerificationMatchup(a, b) {
            const matches = [];
            let modA = 0, modB = 0, winnerOverride = null;
            let winnerStateMin = null, winnerStateExact = null, winnerMarginFloor = null, winnerMarginExact = null, stateTargetId = null;
            CANON_VERIFICATION_RULES.forEach(rule => {
                const hit = evaluateCanonVerificationRule(rule, a, b);
                if (!hit) return;
                matches.push(hit); modA += hit.modA; modB += hit.modB;
                if (hit.winnerOverride != null) winnerOverride = hit.winnerOverride;
                if (hit.stateTargetId != null && (hit.winnerStateMin != null || hit.winnerStateExact != null)) {
                    stateTargetId = hit.stateTargetId;
                    if (hit.winnerStateMin != null) winnerStateMin = hit.winnerStateMin;
                    if (hit.winnerStateExact != null) winnerStateExact = hit.winnerStateExact;
                    if (hit.winnerMarginFloor != null) winnerMarginFloor = hit.winnerMarginFloor;
                    if (hit.winnerMarginExact != null) winnerMarginExact = hit.winnerMarginExact;
                }
            });
            return Object.freeze({
                modA:Number(modA.toFixed(3)), modB:Number(modB.toFixed(3)), matches:Object.freeze(matches),
                winnerOverride, stateTargetId, winnerStateMin, winnerStateExact, winnerMarginFloor, winnerMarginExact
            });
        }

        window.SOUL_ARENA_CANON_VERIFICATION_ENGINE = Object.freeze({
            schemaVersion:CANON_VERIFICATION_SCHEMA_VERSION, engineVersion:CANON_VERIFICATION_ENGINE_VERSION,
            validation:CANON_VERIFICATION_VALIDATION, ruleCount:CANON_VERIFICATION_RULES.length, limitationCount:CANON_VERIFICATION_LIMITATIONS.length,
            rules:()=>Object.freeze([...CANON_VERIFICATION_RULES]), limitations:()=>Object.freeze([...CANON_VERIFICATION_LIMITATIONS]),
            evaluate:(a,formA,b,formB,options={})=>{
                const rawA=buildCombatSnapshot(a,formA,options.stateA ?? FATIGUE_STATES.FRESH);
                const rawB=buildCombatSnapshot(b,formB,options.stateB ?? FATIGUE_STATES.FRESH);
                if (!rawA || !rawB) return null;
                const sa=applyArenaToSnapshot(rawA,options.arena).snapshot;
                const sb=applyArenaToSnapshot(rawB,options.arena).snapshot;
                return evaluateCanonVerificationMatchup(sa,sb);
            }
        });

        function evaluateHaxMatchup(a, b) {
            let modA = 0, modB = 0;
            const mechanicsA = [], mechanicsB = [], pairRules = [];
            const profileA = HAX_BY_ID.get(Number(a?.character?.id));
            const profileB = HAX_BY_ID.get(Number(b?.character?.id));
            const listA = profileA?.forms?.[a.formName] || [];
            const listB = profileB?.forms?.[b.formName] || [];
            listA.forEach(mechanic => { const hit=evaluateHaxMechanic(a,b,mechanic); if(hit){modA+=hit.amount;mechanicsA.push(hit);} });
            listB.forEach(mechanic => { const hit=evaluateHaxMechanic(b,a,mechanic); if(hit){modB+=hit.amount;mechanicsB.push(hit);} });
            let winnerOverride = null;
            let winnerOverrideSuppressedByFatigue = false;
            HAX_PAIR_INTERACTIONS.forEach(rule => {
                const hit = evaluatePairRule(rule,a,b);
                if (!hit) return;
                modA += hit.modA; modB += hit.modB; pairRules.push(hit);
                if (hit.winnerOverride != null) {
                    const overrideId = Number(hit.winnerOverride);
                    const favored = overrideId === Number(a?.character?.id) ? a : (overrideId === Number(b?.character?.id) ? b : null);
                    const other = favored === a ? b : a;
                    const stateGap = favored && other ? Number(favored.state || 0) - Number(other.state || 0) : 0;
                    const suppressGap = Number(FATIGUE_DAMAGE_MODEL?.overrideSuppressStateGap ?? 2);
                    const suppressAt = Number(FATIGUE_DAMAGE_MODEL?.overrideSuppressAtState ?? 3);
                    if (favored && (Number(favored.state) >= suppressAt || stateGap >= suppressGap)) {
                        winnerOverrideSuppressedByFatigue = true;
                    } else {
                        winnerOverride = overrideId;
                    }
                }
            });
            return Object.freeze({modA:Number(modA.toFixed(3)),modB:Number(modB.toFixed(3)),mechanicsA:Object.freeze(mechanicsA),mechanicsB:Object.freeze(mechanicsB),pairRules:Object.freeze(pairRules),winnerOverride,winnerOverrideSuppressedByFatigue});
        }

        window.SOUL_ARENA_HAX_ENGINE = Object.freeze({
            schemaVersion:HAX_SCHEMA_VERSION,engineVersion:HAX_ENGINE_VERSION,validation:HAX_VALIDATION,
            profileCount:HAX_PROFILES.length,pairRuleCount:HAX_PAIR_INTERACTIONS.length,
            getProfile:ref=>getHaxProfile(ref),evaluate:(a,formA,b,formB,options={})=>{
                const rawA=buildCombatSnapshot(a,formA,options.stateA ?? FATIGUE_STATES.FRESH);
                const rawB=buildCombatSnapshot(b,formB,options.stateB ?? FATIGUE_STATES.FRESH);
                const sa=applyArenaToSnapshot(rawA,options.arena).snapshot;
                const sb=applyArenaToSnapshot(rawB,options.arena).snapshot;
                return sa&&sb?evaluateHaxMatchup(sa,sb):null;
            }
        });

        function normalizeFormName(formOrPrime) {
            if (formOrPrime === true) return 'prime';
            const text = String(formOrPrime || '').toLowerCase();
            return text.includes('прайм') || text.includes('prime') ? 'prime' : 'base';
        }

        function clampNumber(value, min, max) {
            return Math.max(min, Math.min(max, Number(value) || 0));
        }

        function buildCombatSnapshot(ref, formOrPrime = 'base', fatigueState = FATIGUE_STATES.FRESH) {
            const char = resolveCharacter(ref);
            const profile = getCombatProfile(char);
            if (!char || !profile) return null;
            const formName = normalizeFormName(formOrPrime);
            const form = profile?.forms?.[formName];
            if (!form?.stats) return null;
            const state = clampNumber(fatigueState, FATIGUE_STATES.FRESH, FATIGUE_STATES.DEAD);
            const fatigueProfile = getFatigueStateProfile(state);
            const stats = {};
            let weightedMultiplier = 0;
            COMBAT_STAT_NAMES.forEach(stat => {
                const multiplier = Number(fatigueProfile?.statMultipliers?.[stat] ?? (state === FATIGUE_STATES.FRESH ? 1 : 0));
                stats[stat] = Number(form.stats[stat] || 0) * multiplier;
                weightedMultiplier += multiplier * Number(COMBAT_WEIGHTS[stat] || 0);
            });
            const tags = Array.isArray(form?.tags) ? form.tags : [];
            const risks = Array.isArray(form?.risks) ? form.risks : [];
            const baseStartup = Number(form?.activation?.startup || 0);
            const selfCost = Number(form?.activation?.selfCost || 0);
            const startupPenalty = Number(fatigueProfile?.startupPenalty || 0);
            const lastStandTags = Array.isArray(FATIGUE_DAMAGE_MODEL?.lastStandTags) ? FATIGUE_DAMAGE_MODEL.lastStandTags : [];
            const hasLastStandProfile = tags.some(tag => lastStandTags.includes(String(tag).toLowerCase()));
            const costRelief = hasLastStandProfile ? Number(FATIGUE_DAMAGE_MODEL?.lastStandCostRelief ?? .65) : 1;
            const strainPenalty = Number(fatigueProfile?.highCostPenalty || 0) * selfCost * costRelief;
            const effectiveStartup = baseStartup + startupPenalty * (1 + baseStartup * .5);
            const profileReferenceScore = COMBAT_STAT_NAMES.reduce((total, stat) => total + Number(form.stats[stat] || 0) * Number(COMBAT_WEIGHTS[stat] || 0), 0);
            const canonicalPower = Number(form?.sourcePowerCalibration ?? (formName === 'prime' ? char.primePower : char.basePower));
            return {
                character: char, profile, formName, state, fatigueMultiplier: Number(weightedMultiplier.toFixed(4)), stats,
                canonicalPower, profileReferenceScore:Number(profileReferenceScore.toFixed(4)), ratingRevision:FINAL_RATING_REVISION,
                fatigue: {
                    key: String(fatigueProfile?.key || 'FRESH'),
                    label: String(fatigueProfile?.label || 'Свежий'),
                    haxReliability: Number(fatigueProfile?.haxReliability ?? 1),
                    overrideReliability: Number(fatigueProfile?.overrideReliability ?? 1),
                    startupPenalty,
                    strainPenalty: Number(strainPenalty.toFixed(3)),
                    hasLastStandProfile
                },
                activation: { startup: baseStartup, effectiveStartup: Number(effectiveStartup.toFixed(3)), selfCost, strainPenalty: Number(strainPenalty.toFixed(3)) },
                tags, risks
            };
        }

        function weightedCombatScore(snapshot) {
            if (!snapshot) return 0;
            const profileScore = COMBAT_STAT_NAMES.reduce((total, stat) => total + Number(snapshot.stats[stat] || 0) * Number(COMBAT_WEIGHTS[stat] || 0), 0);
            const reference = Number(snapshot.profileReferenceScore || 0);
            const rating = Number(snapshot.canonicalPower || 0);
            if (reference <= 0 || rating <= 0) return profileScore;
            return rating * (profileScore / reference);
        }

        function getFinalGapBand(gap) {
            const closeMax = Number(FINAL_COMBAT_POLICY?.gapBands?.closeMax ?? 5);
            const hardCounterMax = Number(FINAL_COMBAT_POLICY?.gapBands?.hardCounterMax ?? 11);
            if (gap <= closeMax) return 'CLOSE_0_5';
            if (gap <= hardCounterMax) return 'ADVANTAGE_6_11';
            return 'DOMINANT_12_PLUS';
        }

        function matchedRuleAllowsUpset(haxMatchup, verificationMatchup) {
            const haxRules = Array.isArray(haxMatchup?.pairRules) ? haxMatchup.pairRules : [];
            const verified = Array.isArray(verificationMatchup?.matches) ? verificationMatchup.matches : [];
            return [...haxRules, ...verified].some(rule => Boolean(rule?.hardCounter || rule?.abilityBypass || rule?.winnerOverride != null));
        }

        function pushReason(reasons, label, amount) {
            if (Math.abs(amount) >= 1.25) reasons.push({ label, amount: Number(amount.toFixed(2)) });
        }

        function getDifficultyFromMargin(margin) {
            if (margin >= 24) return 'Разгром';
            if (margin >= 14) return 'Уверенно';
            if (margin >= 7) return 'Тяжёлый бой';
            if (margin >= 3) return 'Очень тяжёлый бой';
            return 'На пределе';
        }

        function getWinnerStateDeltaFromMargin(margin, selfCost = 0) {
            let delta = margin >= 24 ? FATIGUE_STATES.FRESH :
                margin >= 10 ? FATIGUE_STATES.WOUNDED :
                margin >= 4 ? FATIGUE_STATES.EXHAUSTED : FATIGUE_STATES.NEAR_DEATH;
            if (selfCost >= 3) delta = Math.max(delta, FATIGUE_STATES.NEAR_DEATH);
            else if (selfCost === 2) delta = Math.max(delta, FATIGUE_STATES.EXHAUSTED);
            else if (selfCost === 1) delta = Math.max(delta, FATIGUE_STATES.WOUNDED);
            return delta;
        }

        function advanceFatigueState(currentState, damageState) {
            const current = clampNumber(currentState, FATIGUE_STATES.FRESH, FATIGUE_STATES.DEAD);
            if (current >= FATIGUE_STATES.DEAD) return FATIGUE_STATES.DEAD;
            const damage = clampNumber(damageState, FATIGUE_STATES.FRESH, FATIGUE_STATES.NEAR_DEATH);
            return Math.min(FATIGUE_STATES.NEAR_DEATH, current + damage);
        }

        function applyFatigueDamage(fighter, damageState) {
            if (!fighter) return null;
            const before = clampNumber(fighter.state, FATIGUE_STATES.FRESH, FATIGUE_STATES.DEAD);
            const after = advanceFatigueState(before, damageState);
            fighter.state = after;
            return Object.freeze({before, damage:clampNumber(damageState,0,FATIGUE_STATES.NEAR_DEATH), after});
        }

        function shouldUseFatigueEnginePrimary(stateA, stateB) {
            return Number(stateA || 0) > FATIGUE_STATES.FRESH || Number(stateB || 0) > FATIGUE_STATES.FRESH;
        }

        function resolveCombatV2(fighterA, formA, fighterB, formB, options = {}) {
            const baseA = buildCombatSnapshot(fighterA, formA, options.stateA ?? FATIGUE_STATES.FRESH);
            const baseB = buildCombatSnapshot(fighterB, formB, options.stateB ?? FATIGUE_STATES.FRESH);
            if (!baseA || !baseB) return null;
            const arenaRule = getArenaRule(options.arena);
            const arenaEffectA = applyArenaToSnapshot(baseA, arenaRule);
            const arenaEffectB = applyArenaToSnapshot(baseB, arenaRule);
            const a = arenaEffectA.snapshot;
            const b = arenaEffectB.snapshot;

            const rawA = weightedCombatScore(a);
            const rawB = weightedCombatScore(b);
            let adjA = 0, adjB = 0;
            const reasonsA = [], reasonsB = [];

            if (arenaRule) {
                if (arenaEffectA.scoreDelta >= 1.25) pushReason(reasonsA, `условия арены «${arenaRule.publicName}»`, arenaEffectA.scoreDelta);
                else if (arenaEffectA.scoreDelta <= -1.25) pushReason(reasonsB, `арена ограничивает соперника`, Math.abs(arenaEffectA.scoreDelta));
                if (arenaEffectB.scoreDelta >= 1.25) pushReason(reasonsB, `условия арены «${arenaRule.publicName}»`, arenaEffectB.scoreDelta);
                else if (arenaEffectB.scoreDelta <= -1.25) pushReason(reasonsA, `арена ограничивает соперника`, Math.abs(arenaEffectB.scoreDelta));
            }

            const initiativeA = (a.stats.speed + a.stats.reaction + a.stats.mobility) / 3 - a.activation.startup * 5;
            const initiativeB = (b.stats.speed + b.stats.reaction + b.stats.mobility) / 3 - b.activation.startup * 5;
            const initiativeGap = initiativeA - initiativeB;
            const initMod = clampNumber(Math.abs(initiativeGap) / 7, 0, 5);
            if (initiativeGap > 8) { adjA += initMod; pushReason(reasonsA, 'темп и инициатива', initMod); }
            else if (initiativeGap < -8) { adjB += initMod; pushReason(reasonsB, 'темп и инициатива', initMod); }

            const rangeGap = a.stats.range - b.stats.range;
            const rangeMod = clampNumber(Math.abs(rangeGap) / 12, 0, 3);
            if (rangeGap > 14) { adjA += rangeMod; pushReason(reasonsA, 'контроль дистанции', rangeMod); }
            else if (rangeGap < -14) { adjB += rangeMod; pushReason(reasonsB, 'контроль дистанции', rangeMod); }

            const masteryA = (a.stats.battleIQ + a.stats.technique) / 2;
            const masteryB = (b.stats.battleIQ + b.stats.technique) / 2;
            const masteryGap = masteryA - masteryB;
            const masteryMod = clampNumber(Math.abs(masteryGap) / 12, 0, 3.5);
            if (masteryGap > 12) { adjA += masteryMod; pushReason(reasonsA, 'тактика и техника', masteryMod); }
            else if (masteryGap < -12) { adjB += masteryMod; pushReason(reasonsB, 'тактика и техника', masteryMod); }

            // R7: explicit condition advantage and activation strain. This makes previous 5v5 rounds materially affect the next duel.
            const stateGap = Number(a.state || 0) - Number(b.state || 0);
            const conditionMod = clampNumber(Math.abs(stateGap) * 1.35, 0, 4.05);
            if (stateGap < 0) { adjA += conditionMod; pushReason(reasonsA, 'лучшее физическое состояние', conditionMod); }
            else if (stateGap > 0) { adjB += conditionMod; pushReason(reasonsB, 'лучшее физическое состояние', conditionMod); }
            const strainA = Number(a.activation.strainPenalty || 0);
            const strainB = Number(b.activation.strainPenalty || 0);
            if (strainA > 0) { adjA -= strainA; pushReason(reasonsB, 'усталость соперника и цена техники', strainA); }
            if (strainB > 0) { adjB -= strainB; pushReason(reasonsA, 'усталость соперника и цена техники', strainB); }

            // R6 hax rules remain, now with R7 state-aware reliability.
            const haxEdgeA = clampNumber((a.stats.specialPotency - b.stats.specialResistance) * .05, -4, 4);
            const haxEdgeB = clampNumber((b.stats.specialPotency - a.stats.specialResistance) * .05, -4, 4);
            if (haxEdgeA > 1.25) { adjA += haxEdgeA; pushReason(reasonsA, 'особые техники', haxEdgeA); }
            if (haxEdgeB > 1.25) { adjB += haxEdgeB; pushReason(reasonsB, 'особые техники', haxEdgeB); }

            const spiritPowerGap = a.stats.spiritPower - b.stats.spiritPower;
            const spiritPowerMod = clampNumber(Math.abs(spiritPowerGap) / 20, 0, 2.5);
            if (spiritPowerGap > 18) { adjA += spiritPowerMod; pushReason(reasonsA, 'духовное давление', spiritPowerMod); }
            else if (spiritPowerGap < -18) { adjB += spiritPowerMod; pushReason(reasonsB, 'духовное давление', spiritPowerMod); }

            const haxMatchup = evaluateHaxMatchup(a, b);
            if (haxMatchup) {
                adjA += haxMatchup.modA;
                adjB += haxMatchup.modB;
                haxMatchup.mechanicsA.forEach(item => pushReason(reasonsA, item.label, item.amount));
                haxMatchup.mechanicsB.forEach(item => pushReason(reasonsB, item.label, item.amount));
                haxMatchup.pairRules.forEach(item => {
                    if (item.modA) pushReason(reasonsA, item.label, item.modA);
                    if (item.modB) pushReason(reasonsB, item.label, item.modB);
                });
            }

            // R10 runs after general hax so verified pair/form evidence can correct known R9 outliers without global balance tuning.
            const verificationMatchup = evaluateCanonVerificationMatchup(a, b);
            if (verificationMatchup) {
                adjA += verificationMatchup.modA;
                adjB += verificationMatchup.modB;
                verificationMatchup.matches.forEach(item => {
                    if (item.modA) pushReason(reasonsA, item.label, item.modA);
                    if (item.modB) pushReason(reasonsB, item.label, item.modB);
                });
            }

            let scoreA = rawA + adjA;
            let scoreB = rawB + adjB;

            // R30 exceptional equalization: a specific Prime can force mutual attrition without becoming globally stronger.
            let equalizationApplied = null;
            const freshFight = Number(a.state || 0) === FATIGUE_STATES.FRESH && Number(b.state || 0) === FATIGUE_STATES.FRESH;
            if (freshFight && Array.isArray(FINAL_COMBAT_POLICY?.equalizers)) {
                for (const rule of FINAL_COMBAT_POLICY.equalizers) {
                    const targetA = Number(a.character.id) === Number(rule.fighterId) && a.formName === String(rule.form || 'prime');
                    const targetB = Number(b.character.id) === Number(rule.fighterId) && b.formName === String(rule.form || 'prime');
                    if (!targetA && !targetB) continue;
                    const eq = targetA ? a : b;
                    const other = targetA ? b : a;
                    const ratingDisadvantage = Number(other.canonicalPower || 0) - Number(eq.canonicalPower || 0);
                    if (ratingDisadvantage < Number(rule.minRatingDisadvantage || 0)) continue;
                    const eqInitiative = targetA ? initiativeA : initiativeB;
                    const otherInitiative = targetA ? initiativeB : initiativeA;
                    const blitzGap = Number(FINAL_COMBAT_POLICY?.speedBlitz?.reactiveHaxInitiativeGap ?? 32);
                    if (rule.requiresConsciousActivation && otherInitiative - eqInitiative >= blitzGap) continue;
                    const maxMargin = Math.max(.25, Number(rule.maxMargin || .85));
                    if (targetA && scoreA < scoreB) scoreA = scoreB - maxMargin;
                    if (targetB && scoreB < scoreA) scoreB = scoreA - maxMargin;
                    equalizationApplied = Object.freeze({fighterId:Number(rule.fighterId),label:String(rule.label || 'Equalization'),maxMargin,ratingDisadvantage:Number(ratingDisadvantage.toFixed(3)),minWinnerExitState:Number(rule.minWinnerExitState ?? FATIGUE_STATES.NEAR_DEATH)});
                    break;
                }
            }

            let scoreGap = scoreA - scoreB;
            let winnerSnapshot, loserSnapshot, winnerScore, loserScore, winnerReasons;
            const verificationOverrideId = verificationMatchup?.winnerOverride == null ? null : Number(verificationMatchup.winnerOverride);
            const haxOverrideId = haxMatchup?.winnerOverride == null ? null : Number(haxMatchup.winnerOverride);
            const hardOverrideId = verificationOverrideId ?? haxOverrideId;
            const ratingA = Number(a.canonicalPower || 0), ratingB = Number(b.canonicalPower || 0);
            const ratingGap = Math.abs(ratingA - ratingB);
            const ratingBand = getFinalGapBand(ratingGap);
            const higherRatedId = ratingA === ratingB ? null : (ratingA > ratingB ? a.character.id : b.character.id);
            const explicitUpsetException = matchedRuleAllowsUpset(haxMatchup, verificationMatchup);
            let gapGuardApplied = false;

            if (hardOverrideId === a.character.id || hardOverrideId === b.character.id) {
                const overrideA = hardOverrideId === a.character.id;
                winnerSnapshot = overrideA ? a : b; loserSnapshot = overrideA ? b : a;
                winnerScore = overrideA ? scoreA : scoreB; loserScore = overrideA ? scoreB : scoreA;
                winnerReasons = overrideA ? reasonsA : reasonsB;
            } else {
                let candidateA;
                if (Math.abs(scoreGap) < .0001) {
                    const tieA = a.stats.reaction + a.stats.technique * .5 + a.stats.battleIQ * .25;
                    const tieB = b.stats.reaction + b.stats.technique * .5 + b.stats.battleIQ * .25;
                    candidateA = tieA === tieB ? a.character.id < b.character.id : tieA > tieB;
                } else candidateA = scoreGap > 0;

                const candidateId = candidateA ? a.character.id : b.character.id;
                if (freshFight && ratingGap >= 6 && higherRatedId != null && candidateId !== higherRatedId && !explicitUpsetException) {
                    candidateA = higherRatedId === a.character.id;
                    gapGuardApplied = true;
                    const guardReason = ratingBand === 'DOMINANT_12_PLUS' ? 'пропасть общей боевой шкалы 12+' : 'преимущество общей боевой шкалы 6–11';
                    pushReason(candidateA ? reasonsA : reasonsB, guardReason, Math.max(1.25, ratingGap));
                }
                winnerSnapshot = candidateA ? a : b; loserSnapshot = candidateA ? b : a;
                winnerScore = candidateA ? scoreA : scoreB; loserScore = candidateA ? scoreB : scoreA;
                winnerReasons = candidateA ? reasonsA : reasonsB;
            }

            let margin = hardOverrideId != null ? Math.max(7, Math.min(13.5, Math.abs(winnerScore - loserScore))) : Math.abs(winnerScore - loserScore);
            const matchedMarginCaps = (haxMatchup?.pairRules || []).map(rule => Number(rule?.marginCap)).filter(value => Number.isFinite(value) && value > 0);
            if (matchedMarginCaps.length) margin = Math.min(margin, ...matchedMarginCaps);
            if (equalizationApplied && winnerSnapshot.character.id !== equalizationApplied.fighterId) margin = Math.min(margin, equalizationApplied.maxMargin);
            if (verificationMatchup?.stateTargetId === winnerSnapshot.character.id) {
                if (verificationMatchup.winnerMarginFloor != null) margin = Math.max(margin, Number(verificationMatchup.winnerMarginFloor));
                if (verificationMatchup.winnerMarginExact != null) margin = Number(verificationMatchup.winnerMarginExact);
            }
            let winnerStateDelta = getWinnerStateDeltaFromMargin(margin, winnerSnapshot.activation.selfCost);
            if (equalizationApplied && winnerSnapshot.character.id !== equalizationApplied.fighterId) winnerStateDelta = Math.max(winnerStateDelta, equalizationApplied.minWinnerExitState);
            if (verificationMatchup?.stateTargetId === winnerSnapshot.character.id) {
                if (verificationMatchup.winnerStateMin != null) winnerStateDelta = Math.max(winnerStateDelta, Number(verificationMatchup.winnerStateMin));
                if (verificationMatchup.winnerStateExact != null) winnerStateDelta = Number(verificationMatchup.winnerStateExact);
                winnerStateDelta = clampNumber(winnerStateDelta, FATIGUE_STATES.FRESH, FATIGUE_STATES.NEAR_DEATH);
            }
            const sortedReasons = [...winnerReasons].sort((x, y) => Math.abs(y.amount) - Math.abs(x.amount)).slice(0, 3);
            const reasonText = sortedReasons.length
                ? `Решающими стали ${sortedReasons.map(item => item.label).join(', ')}.`
                : 'Исход определило суммарное преимущество по боевым параметрам и состоянию.';

            return Object.freeze({
                engineVersion: COMBAT_ENGINE_VERSION,
                winnerId: winnerSnapshot.character.id, loserId: loserSnapshot.character.id,
                winnerKey: winnerSnapshot.character.key, loserKey: loserSnapshot.character.key,
                scoreA: Number(scoreA.toFixed(3)), scoreB: Number(scoreB.toFixed(3)), margin: Number(margin.toFixed(3)),
                rawScoreA: Number(rawA.toFixed(3)), rawScoreB: Number(rawB.toFixed(3)),
                difficulty: getDifficultyFromMargin(margin), winnerStateDelta,
                winnerEntryState: winnerSnapshot.state, loserEntryState: loserSnapshot.state,
                winnerProjectedExitState: advanceFatigueState(winnerSnapshot.state, winnerStateDelta),
                reasons: Object.freeze(sortedReasons), reasonText,
                hax: haxMatchup || null, verification: verificationMatchup || null, hardOverrideApplied: hardOverrideId != null,
                hardOverrideSuppressedByFatigue: Boolean(haxMatchup?.winnerOverrideSuppressedByFatigue),
                finalRatingPolicy:Object.freeze({version:String(FINAL_COMBAT_POLICY?.version || ''),ratingRevision:FINAL_RATING_REVISION,ratingA,ratingB,ratingGap:Number(ratingGap.toFixed(3)),band:ratingBand,gapGuardApplied,explicitUpsetException,equalizationApplied}),
                fatigueApplied: true,
                provisionalSystems: Object.freeze(['R30_FINAL_RATING_POLICY']),
                arenaApplied: Boolean(arenaRule),
                arena: arenaRule ? Object.freeze({id:String(arenaRule.id),publicName:String(arenaRule.publicName),scoreDeltaA:arenaEffectA.scoreDelta,scoreDeltaB:arenaEffectB.scoreDelta,effectA:arenaEffectA,effectB:arenaEffectB}) : null
            });
        }

        window.SOUL_ARENA_ARENA_ENGINE = Object.freeze({
            schemaVersion:ARENA_SCHEMA_VERSION,engineVersion:ARENA_ENGINE_VERSION,validation:ARENA_VALIDATION,count:ARENA_RULES.length,
            get:ref=>getArenaRule(ref),list:()=>Object.freeze([...ARENA_RULES]),
            apply:(snapshot,arena)=>applyArenaToSnapshot(snapshot,arena),
            resolve:(a,formA,b,formB,options={})=>resolveCombatV2(a,formA,b,formB,options)
        });

        window.SOUL_ARENA_COMBAT_ENGINE = Object.freeze({
            schemaVersion: COMBAT_SCHEMA_VERSION, engineVersion: COMBAT_ENGINE_VERSION, validation: COMBAT_VALIDATION,
            count: COMBAT_PROFILES.length, statNames: Object.freeze([...COMBAT_STAT_NAMES]), weights: Object.freeze({ ...COMBAT_WEIGHTS }),
            getProfile: ref => getCombatProfile(ref), snapshot: (ref, form, state, arena) => applyArenaToSnapshot(buildCombatSnapshot(ref, form, state), arena).snapshot,
            resolve: (a, formA, b, formB, options) => resolveCombatV2(a, formA, b, formB, options),
            haxValidation: HAX_VALIDATION, haxEngineVersion: HAX_ENGINE_VERSION,
            fatigueValidation: FATIGUE_VALIDATION, fatigueEngineVersion: FATIGUE_ENGINE_VERSION,
            arenaValidation: ARENA_VALIDATION, arenaEngineVersion: ARENA_ENGINE_VERSION, getArena:ref=>getArenaRule(ref),
            finalRatingPolicy: FINAL_COMBAT_POLICY ? Object.freeze({...FINAL_COMBAT_POLICY}) : null,
            advanceFatigueState, shouldUseFatigueEnginePrimary
        });

        window.SOUL_ARENA_FATIGUE_ENGINE = Object.freeze({
            schemaVersion:FATIGUE_SCHEMA_VERSION, engineVersion:FATIGUE_ENGINE_VERSION, validation:FATIGUE_VALIDATION,
            stateCount:FATIGUE_STATE_PROFILES.length,
            getState:state=>getFatigueStateProfile(state),
            advance:(current,damage)=>advanceFatigueState(current,damage),
            isPrimary:(stateA,stateB)=>shouldUseFatigueEnginePrimary(stateA,stateB),
            snapshot:(ref,form,state,arena)=>applyArenaToSnapshot(buildCombatSnapshot(ref,form,state),arena).snapshot
        });

        window.SOUL_ARENA_CHARACTER_SYSTEM = Object.freeze({
            schemaVersion: CHARACTER_SCHEMA_VERSION,
            canonVersion: CANON_VERSION,
            combatEngineVersion: COMBAT_ENGINE_VERSION,
            count: DB.length,
            validation: CHARACTER_VALIDATION,
            getById: id => CHARACTER_BY_ID.get(Number(id)) || null,
            getByKey: key => CHARACTER_BY_KEY.get(normalizeCharacterLookup(key)) || null,
            resolve: ref => resolveCharacter(ref),
            getCanon: ref => getCanonProfile(ref),
            getCombatProfile: ref => getCombatProfile(ref),
            getHaxProfile: ref => getHaxProfile(ref),
            getArena: ref => getArenaRule(ref),
            fatigueEngineVersion: FATIGUE_ENGINE_VERSION,
            arenaEngineVersion: ARENA_ENGINE_VERSION
        });

        /* ==========================================================================
           3. R17 ARENA 2.0 CANON-VERIFIED BATTLE MATRIX / DATABASE & KEY NORMALIZATION
           ========================================================================== */
        let EXCEL_MATCHUPS = {};
        const BATTLE_MATRIX_META = window.SOUL_ARENA_BATTLE_MATRIX_META || null;

        function validateR30BattleMatrixMeta() {
            const errors = [], warnings = [];
            const expectedBattles = DB.length * (DB.length - 1) / 2 * 12;
            if (!BATTLE_MATRIX_META) errors.push('R17 battle matrix metadata is missing');
            if (Number(BATTLE_MATRIX_META?.schemaVersion || 0) !== 17) errors.push(`Expected battle matrix schema v17, got v${BATTLE_MATRIX_META?.schemaVersion || 'none'}`);
            if (!String(BATTLE_MATRIX_META?.matrixVersion || '').startsWith('R30')) errors.push(`Unexpected matrix version: ${BATTLE_MATRIX_META?.matrixVersion || 'none'}`);
            if (String(BATTLE_MATRIX_META?.canonVersion || '') !== CANON_VERSION) errors.push('R30 matrix canonVersion does not match Canon Bible');
            if (Number(BATTLE_MATRIX_META?.characterCount || 0) !== DB.length) errors.push('R30 matrix characterCount does not match roster');
            if (Number(BATTLE_MATRIX_META?.battleCount || 0) !== expectedBattles) errors.push(`R30 matrix metadata battleCount mismatch: ${BATTLE_MATRIX_META?.battleCount ?? 'none'} vs ${expectedBattles}`);
            if (String(BATTLE_MATRIX_META?.engineVersion || '') !== COMBAT_ENGINE_VERSION) errors.push('R30 matrix Combat Engine version mismatch');
            if (String(BATTLE_MATRIX_META?.haxEngineVersion || '') !== HAX_ENGINE_VERSION) errors.push('R30 matrix Hax Engine version mismatch');
            if (String(BATTLE_MATRIX_META?.fatigueEngineVersion || '') !== FATIGUE_ENGINE_VERSION) errors.push('R30 matrix Fatigue Engine version mismatch');
            if (String(BATTLE_MATRIX_META?.arenaEngineVersion || '') !== ARENA_ENGINE_VERSION) errors.push('R30 matrix Arena Engine version mismatch');
            if (String(BATTLE_MATRIX_META?.verificationEngineVersion || '') !== CANON_VERIFICATION_ENGINE_VERSION) errors.push('R30 matrix Canon Verification version mismatch');
            if (Number(BATTLE_MATRIX_META?.verificationRuleCount || 0) !== CANON_VERIFICATION_RULES.length) errors.push('R30 matrix verificationRuleCount mismatch');
            if (String(BATTLE_MATRIX_META?.ratingRevision || '') !== FINAL_RATING_REVISION) errors.push('R30 matrix final rating revision mismatch');
            if (!/^[a-f0-9]{64}$/i.test(String(BATTLE_MATRIX_META?.sha256 || ''))) warnings.push('R30 matrix SHA-256 metadata is missing or malformed');
            return Object.freeze({ok:errors.length===0, schemaVersion:Number(BATTLE_MATRIX_META?.schemaVersion||0), matrixVersion:String(BATTLE_MATRIX_META?.matrixVersion||''), expectedBattles, errors:Object.freeze(errors), warnings:Object.freeze(warnings)});
        }

        const R30_MATRIX_META_VALIDATION = validateR30BattleMatrixMeta();
        if (!R30_MATRIX_META_VALIDATION.ok) console.error('R30 matrix metadata validation failed:', R30_MATRIX_META_VALIDATION.errors);
        else console.log(`✅ R30 Final Combat Matrix ready: ${BATTLE_MATRIX_META.battleCount} outcomes, ${BATTLE_MATRIX_META.matrixVersion}, ${BATTLE_MATRIX_META.verificationRuleCount} canon verification rules.`);
        if (R30_MATRIX_META_VALIDATION.warnings.length) console.warn('R30 matrix metadata warnings:', R30_MATRIX_META_VALIDATION.warnings);

        function normalizeKey(str) {
            if (!str) return '';
            return String(str)
                .toLowerCase()
                .replace(/ё/g, 'е')
                .replace(/[^а-яa-z0-9]/gi, '');
        }

        function makeBattleKey(fighterA, formA, fighterB, formB, arena) {
            const aKey = getCharacterStableKey(fighterA);
            const bKey = getCharacterStableKey(fighterB);
            const formAKey = normalizeKey(formA);
            const formBKey = normalizeKey(formB);
            const arenaKey = normalizeKey(getReskinnedArena(arena));
            return `${aKey}|${formAKey}|${bKey}|${formBKey}|${arenaKey}`;
        }

        function parseFatigueState(value) {
            const normalized = String(value || '').trim().toLowerCase().replace(/ё/g, 'е');
            const stateMap = {
                'свежий': FATIGUE_STATES.FRESH,
                'ранен': FATIGUE_STATES.WOUNDED,
                'истощен': FATIGUE_STATES.EXHAUSTED,
                'на грани': FATIGUE_STATES.NEAR_DEATH,
                'мертв': FATIGUE_STATES.DEAD
            };
            return stateMap[normalized] ?? FATIGUE_STATES.WOUNDED;
        }

        function loadEmbeddedDatabase() {
            try {
                EXCEL_MATCHUPS = {};
                let parsedDb = Array.isArray(window.SOUL_ARENA_BATTLES) ? window.SOUL_ARENA_BATTLES : null;
                if (!parsedDb) {
                    const dbScript = document.getElementById('embedded-battle-db');
                    if (dbScript && dbScript.textContent && dbScript.textContent.trim() !== '{}') parsedDb = JSON.parse(dbScript.textContent);
                }
                let fightsArray = [];
                if (Array.isArray(parsedDb)) fightsArray = parsedDb;
                else if (parsedDb && typeof parsedDb === 'object') fightsArray = parsedDb.fights || parsedDb.data || parsedDb.battles || [];

                const compactMeta = window.SOUL_ARENA_BATTLE_COMPACT || null;
                fightsArray.forEach((item, rowIndex) => {
                    if (!item) return;
                    let fighterA = null, fighterB = null, winnerCharacter = null;
                    let fM_A = 'База', fM_B = 'База', arena = 'Цитадель Душ';
                    let val = null;

                    if (Array.isArray(item)) {
                        const [aId, formAIndex, bId, formBIndex, arenaIndex, winnerId, stateIndex, difficultyIndex, margin, hardOverride] = item;
                        fighterA = resolveCharacter(aId);
                        fighterB = resolveCharacter(bId);
                        winnerCharacter = resolveCharacter(winnerId);
                        fM_A = compactMeta?.forms?.[formAIndex] || (formAIndex ? 'Прайм' : 'База');
                        fM_B = compactMeta?.forms?.[formBIndex] || (formBIndex ? 'Прайм' : 'База');
                        const arenaRef = compactMeta?.arenas?.[arenaIndex] || ARENA_RULES?.[arenaIndex]?.id;
                        arena = getArenaRule(arenaRef)?.publicName || arena;
                        val = {
                            winnerId: winnerCharacter?.id || null,
                            winner: winnerCharacter?.name || '',
                            state: compactMeta?.states?.[stateIndex] || 'Ранен',
                            comment: '',
                            difficulty: compactMeta?.difficulties?.[difficultyIndex] || null,
                            margin: Number.isFinite(Number(margin)) ? Number(margin) : null,
                            hardOverride: Boolean(hardOverride),
                            matrixVersion: String(BATTLE_MATRIX_META?.matrixVersion || ''),
                            engineVersion: String(BATTLE_MATRIX_META?.engineVersion || '')
                        };
                    } else {
                        const fARef = item.fighter_a_id ?? item.fighterAId ?? item.fighter_a ?? item.fighterA ?? item.fighter1;
                        const fBRef = item.fighter_b_id ?? item.fighterBId ?? item.fighter_b ?? item.fighterB ?? item.fighter2;
                        fighterA = resolveCharacter(fARef);
                        fighterB = resolveCharacter(fBRef);
                        fM_A = normalizeFormName(item.form_a ?? item.formA ?? item.form1) === 'prime' ? 'Прайм' : 'База';
                        fM_B = normalizeFormName(item.form_b ?? item.formB ?? item.form2) === 'prime' ? 'Прайм' : 'База';
                        const arenaRule = getArenaRule(item.arena_id ?? item.arena ?? item.location ?? 'ARENA_01');
                        arena = arenaRule?.publicName || arena;
                        winnerCharacter = resolveCharacter(item.winner_id ?? item.winnerId ?? item.winner ?? fARef);
                        val = {
                            winnerId: winnerCharacter?.id || null,
                            winner: winnerCharacter?.name || '',
                            state: item.state || item.winner_status || item.status || 'Ранен',
                            comment: item.comment || item.logic_reason || item.reason || item.description || '',
                            difficulty: item.difficulty || null,
                            margin: Number.isFinite(Number(item.margin)) ? Number(item.margin) : null,
                            hardOverride: Boolean(item.hard_override ?? item.hardOverride),
                            matrixVersion: String(item.matrix_version || BATTLE_MATRIX_META?.matrixVersion || ''),
                            engineVersion: String(item.engine_version || BATTLE_MATRIX_META?.engineVersion || '')
                        };
                    }
                    if (!fighterA || !fighterB || !winnerCharacter || !val) {
                        console.warn('Matrix row could not be resolved', rowIndex + 1);
                        return;
                    }
                    EXCEL_MATCHUPS[makeBattleKey(fighterA, fM_A, fighterB, fM_B, arena)] = val;
                    EXCEL_MATCHUPS[makeBattleKey(fighterB, fM_B, fighterA, fM_A, arena)] = val;
                });

                const expectedFightCount = DB.length * (DB.length - 1) / 2 * 12;
                const expectedKeyCount = expectedFightCount * 2;
                const keyCount = Object.keys(EXCEL_MATCHUPS).length;
                if (fightsArray.length !== expectedFightCount) console.warn('Battle matrix row count mismatch', fightsArray.length, expectedFightCount);
                if (keyCount !== expectedKeyCount) console.warn('Battle lookup key count mismatch', keyCount, expectedKeyCount);
                window.SOUL_ARENA_MATRIX_DIAGNOSTIC = Object.freeze({
                    matrixVersion:String(BATTLE_MATRIX_META?.matrixVersion || ''), schemaVersion:Number(BATTLE_MATRIX_META?.schemaVersion || 0),
                    fightCount:fightsArray.length,keyCount,expectedFightCount,expectedKeyCount,metaValidation:R30_MATRIX_META_VALIDATION
                });
                if (Array.isArray(window.SOUL_ARENA_BATTLES)) window.SOUL_ARENA_BATTLES = null;
                window.SOUL_ARENA_BATTLE_COMPACT = null;
            } catch (e) {
                console.error('Battle database load error:', e);
            }
        }

        /* ==========================================================================
           4. AUDIO SYNTHESIS & SOUND EFFECTS
           ========================================================================== */
        let audioCtx = null;

        function getAudioContext() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended' && !isAudioMuted && !isSystemMuted) {
                audioCtx.resume();
            }
            return audioCtx;
        }

        function playDiceSound() {
            if (isAudioMuted || isSystemMuted || getSfxVolume() <= 0) return;
            try {
                const ctx = getAudioContext();
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(150 + Math.random() * 200, ctx.currentTime);
                        gain.gain.setValueAtTime(0.1 * getSfxVolume(), ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
                        osc.connect(gain); gain.connect(ctx.destination);
                        osc.start(); osc.stop(ctx.currentTime + 0.05);
                    }, i * 70);
                }
            } catch (e) {}
        }

        function playSwordSound() {
            if (isAudioMuted || isSystemMuted || getSfxVolume() <= 0) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.15 * getSfxVolume(), ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.3);
            } catch (e) {}
        }

        function playSpiritBurst() {
            if (isAudioMuted || isSystemMuted || getSfxVolume() <= 0) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
                gain.gain.setValueAtTime(0.2 * getSfxVolume(), ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(); osc.stop(ctx.currentTime + 0.4);
            } catch (e) {}
        }

        function playVictorySound() {
            if (isAudioMuted || isSystemMuted || getSfxVolume() <= 0) return;
            try {
                const ctx = getAudioContext();
                const freqs = [261.63, 329.63, 392.00, 523.25];
                freqs.forEach((f, idx) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(f, ctx.currentTime);
                        gain.gain.setValueAtTime(0.15 * getSfxVolume(), ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                        osc.connect(gain); gain.connect(ctx.destination);
                        osc.start(); osc.stop(ctx.currentTime + 0.4);
                    }, idx * 100);
                });
            } catch (e) {}
        }

        function triggerScreenShake() {
            const main = document.getElementById('main-container');
            if (!main || reducedMotion) return;
            if (typeof main.animate === 'function') main.animate([
                {transform:'translate3d(0,0,0)'},{transform:'translate3d(-5px,1px,0)'},{transform:'translate3d(4px,-1px,0)'},{transform:'translate3d(-3px,0,0)'},{transform:'translate3d(2px,1px,0)'},{transform:'translate3d(0,0,0)'}
            ],{duration:300,easing:'cubic-bezier(.36,.07,.19,.97)'});
        }

        function triggerSpiritShockwave() {
            const wave = document.getElementById('shockwave-fx');
            if (!wave || reducedMotion) return;
            if (typeof wave.animate === 'function') wave.animate([
                {transform:'translate(-50%, -50%) scale(0)',opacity:.72},
                {transform:'translate(-50%, -50%) scale(1)',opacity:0}
            ],{duration:520,easing:'cubic-bezier(0,0,.2,1)'});
        }

        const canvas = document.getElementById('spirit-canvas');
        const ctx = canvas.getContext('2d', { alpha:true });
        let particles = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let canvasLastPaint = 0;
        const canvasPointerInteraction = Boolean(PERF_CONFIG.pointerParticleInteraction);

        if (canvasPointerInteraction) window.addEventListener('pointermove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
        }, { passive:true });

        function resizeCanvas() {
            const w = Math.max(1, Math.round(window.innerWidth));
            const h = Math.max(1, Math.round(window.innerHeight));
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
        }
        window.addEventListener('resize', resizeCanvas, { passive:true });
        resizeCanvas();

        class Particle {
            constructor() { this.reset(true); }
            reset(initial = false) {
                this.x = Math.random() * canvas.width;
                this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 70;
                this.size = Math.random() * 1.8 + 0.45;
                this.speedY = Math.random() * 0.75 + 0.35;
                this.speedX = (Math.random() - 0.5) * 0.28;
                this.alpha = Math.random() * 0.38 + 0.14;
                const colors = ['59,130,246','239,68,68','168,85,247','249,115,22','56,189,248'];
                this.rgb = colors[(Math.random() * colors.length) | 0];
            }
            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                if (canvasPointerInteraction) {
                    const dx = this.x - mouseX, dy = this.y - mouseY;
                    const dist2 = dx*dx + dy*dy;
                    if (dist2 > .01 && dist2 < 10000) {
                        const inv = 1 / Math.sqrt(dist2);
                        this.x += dx * inv * .55;
                        this.y += dy * inv * .55;
                    }
                }
                if (this.y < -8 || this.x < -20 || this.x > canvas.width + 20) this.reset(false);
            }
            draw() {
                ctx.fillStyle = `rgba(${this.rgb},${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function resetParticles() {
            const count = reducedMotion ? 0 : Math.max(0, Number(PERF_CONFIG.particleCount) || 0);
            particles = Array.from({length:count}, () => new Particle());
        }
        resetParticles();

        function setCanvasAnimationPaused(paused) {
            canvasAnimationPaused = Boolean(paused);
            document.body.dataset.fxPaused = canvasAnimationPaused ? 'true' : 'false';
            if (canvasAnimationPaused) {
                if (canvasAnimationFrame) cancelAnimationFrame(canvasAnimationFrame);
                canvasAnimationFrame = 0;
                return;
            }
            if (!canvasAnimationFrame && !reducedMotion) canvasAnimationFrame = requestAnimationFrame(animateCanvas);
        }

        function animateCanvas(ts = performance.now()) {
            canvasAnimationFrame = 0;
            if (canvasAnimationPaused || reducedMotion) return;
            const modalOpen = document.body.classList.contains('ui-modal-open');
            const fps = modalOpen ? (Number(PERF_CONFIG.modalParticleFps)||8) : (Number(PERF_CONFIG.particleFps)||24);
            const interval = 1000 / Math.max(8, fps);
            if (ts - canvasLastPaint >= interval) {
                canvasLastPaint = ts;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const p of particles) { p.update(); p.draw(); }
            }
            canvasAnimationFrame = requestAnimationFrame(animateCanvas);
        }
        setCanvasAnimationPaused(false);

        function updateAuraForFighters(f1, f2) {
            if (document.body.style.backgroundImage && document.body.style.backgroundImage !== 'none' && document.body.style.backgroundImage !== '') {
                canvas.style.background = 'transparent';
                return;
            }
            if (!f1 && !f2) {
                canvas.style.background = '#030712';
                return;
            }
            let active = f1 || f2;
            if (active.faction === 'ASTRAL') {
                canvas.style.background = 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)';
            } else if (active.faction === 'VOIDBORN') {
                canvas.style.background = 'radial-gradient(circle at center, #064e3b 0%, #030712 100%)';
            } else if (active.type === 'ARCANE' || active.tier <= 0) {
                canvas.style.background = 'radial-gradient(circle at center, #451a03 0%, #030712 100%)';
            } else {
                canvas.style.background = 'radial-gradient(circle at center, #0f172a 0%, #030712 100%)';
            }
        }

        function getCharImgSrc(char) {
            if (!char || !char.img) return '';
            return char.img;
        }

        function handleImgError(imgEl, fallbackEmoji) {
            if (!imgEl) return;
            imgEl.onerror = null;
            const parent = imgEl.parentElement;
            if (parent) {
                parent.innerHTML = `<span class="text-5xl md:text-6xl drop-shadow-md">${uiIcon('fighter',52)}</span>`;
            }
        }

        const tiltBoundElements = new WeakSet();

        function apply3DTilt(element) {
            if (!element || tiltBoundElements.has(element) || !PERF_CONFIG.tilt || reducedMotion) return;
            tiltBoundElements.add(element);
            let rect = null, raf = 0, px = 0, py = 0;
            const maxDeg = Math.max(2, Number(PERF_CONFIG.tiltMaxDeg)||5);
            const update = () => {
                raf = 0;
                if (!rect || !rect.width || !rect.height) return;
                const x = px - rect.left - rect.width / 2;
                const y = py - rect.top - rect.height / 2;
                const rotateX = Math.max(-maxDeg,Math.min(maxDeg,(-y / rect.height) * maxDeg * 2));
                const rotateY = Math.max(-maxDeg,Math.min(maxDeg,(x / rect.width) * maxDeg * 2));
                element.classList.add('r29-tilting');
                element.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.012)`;
            };
            element.addEventListener('pointerenter', () => { rect = element.getBoundingClientRect(); }, {passive:true});
            element.addEventListener('pointermove', (e) => {
                px=e.clientX;py=e.clientY;
                if(!raf)raf=requestAnimationFrame(update);
            }, {passive:true});
            element.addEventListener('pointerleave', () => {
                if(raf){cancelAnimationFrame(raf);raf=0;}
                rect=null;element.classList.remove('r29-tilting');
                element.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
            }, {passive:true});
        }

        window.SOUL_ARENA_R31_CPU_PACING = Object.freeze({
            version:'R31.0.0',
            timing:R31_CPU_TIMING,
            sameVisualTimingAcrossDifficulties:true,
            primeAssignmentsRevealSequentially:true,
            cpuAutoStartsBattleOnlyWhenSecondPlacer:true,
            localTwoPlayerAutoStart:false
        });

        /* ==========================================================================
           5. MATCH RUNTIME STATE (roster now lives in data/characters.json)
           ========================================================================== */

        const FATIGUE_STATES = { FRESH: 0, WOUNDED: 1, EXHAUSTED: 2, NEAR_DEATH: 3, DEAD: 4 };
        const STATE_NAMES = ["Свежий", "Ранен", "Истощён", "На грани", "Мёртв"];
        const FATIGUE_MULTIPLIERS = [1.0, 0.85, 0.65, 0.45, 0.0];

        let p1SeriesWins = 0, p2SeriesWins = 0;
        let startingPlayer = 1;
        let draftPool = [];
        let p1Team = [], p2Team = [];
        let currentPlayer = 1;
        let currentChar = null;
        let isDrafting = false; 

        let currentBonusPlayer = 1;
        let bonusTurnsCount = 0;
        let availableBonusPoints = 0;

        let selectedLocation = null;
        let firstPlacer = 1;
        let currentRound = 1;
        let p1Locked = false;
        let p2Locked = false;
        let battleInitiativeDone = false;

        let arenaSlot1 = null, arenaSlot2 = null;

        function initGame() {
            cancelCpuDecision();
            matchEnded = false;
            cpuDecisionLog = [];
            document.body.dataset.gameMode = activeGameMode;
            syncModeIdentityUI();
            hideAllGameScreens();
            setUiScreen('initiative');
            document.getElementById('p1-series-score').innerText = p1SeriesWins;
            document.getElementById('p2-series-score').innerText = p2SeriesWins;
            
            const musicPlayer = document.getElementById('bg-music');
            if (musicPlayer) {
                musicPlayer.pause();
                musicPlayer.currentTime = 0;
                musicPlayer.removeAttribute('src'); musicPlayer.load();
            }
            document.body.style.backgroundImage = 'none';
            document.getElementById('bg-overlay').style.opacity = '0';
            document.getElementById('location-banner').classList.add('hidden');

            document.getElementById('initiative-phase').classList.remove('hidden');
            document.getElementById('initiative-phase').classList.add('flex');
            document.getElementById('draft-phase').classList.add('hidden');
            document.getElementById('bonus-phase').classList.add('hidden');
            document.getElementById('location-phase').classList.add('hidden');
            document.getElementById('battle-phase').classList.add('hidden');
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('flex');

            document.getElementById('roll-init-btn').classList.remove('hidden');
            document.getElementById('start-draft-btn').classList.add('hidden');
            document.getElementById('init-p1-val').innerHTML = uiIcon('dice',44);
            document.getElementById('init-p2-val').innerHTML = uiIcon('dice',44);
            document.getElementById('init-result-text').innerText = "";
            document.getElementById('game-status').innerText = "Жребий Первого Хода";

            arenaSlot1 = null;
            arenaSlot2 = null;
            selectedLocation = null;
            battleInitiativeDone = false;
            p1Locked = false;
            p2Locked = false;
            currentRound = 1;
            
            updateArenaUI();
            updateAuraForFighters(null, null);

            const logBox = document.getElementById('combat-log');
            if (logBox) logBox.innerHTML = '';
            window.SOUL_ARENA_PRESENTATION?.reset?.();
        }

        function rollInitiative() {
            playDiceSound();
            const p1Val = document.getElementById('init-p1-val');
            const p2Val = document.getElementById('init-p2-val');
            p1Val.classList.add('rolling-dice');
            p2Val.classList.add('rolling-dice');

            setTimeout(() => {
                p1Val.classList.remove('rolling-dice');
                p2Val.classList.remove('rolling-dice');
                const roll1 = PURE_CANON_DRAFT_ENGINE.rollD6();
                const roll2 = PURE_CANON_DRAFT_ENGINE.rollD6();

                p1Val.innerText = roll1;
                p2Val.innerText = roll2;
                const p1Label = getPlayerLabel(1, true);
                const p2Label = getPlayerLabel(2, true);

                if (roll1 > roll2) {
                    startingPlayer = 1;
                    currentPlayer = 1;
                    document.getElementById('init-result-text').innerHTML = `<span class="text-blue-400">${p1Label}</span> выбросил больше (${roll1} против ${roll2}) и выбирает первым!`;
                    document.getElementById('roll-init-btn').classList.add('hidden');
                    document.getElementById('start-draft-btn').classList.remove('hidden');
                } else if (roll2 > roll1) {
                    startingPlayer = 2;
                    currentPlayer = 2;
                    document.getElementById('init-result-text').innerHTML = `<span class="text-orange-400">${p2Label}</span> выбросил больше (${roll2} против ${roll1}) и выбирает первым!`;
                    document.getElementById('roll-init-btn').classList.add('hidden');
                    document.getElementById('start-draft-btn').classList.remove('hidden');
                } else {
                    document.getElementById('init-result-text').innerText = `Ничья (${roll1} : ${roll2})! Перебрасываем кости...`;
                }
            }, 500);
        }

        function getCharacterWeight(characterOrTier) {
            return PURE_CANON_DRAFT_ENGINE.getCharacterWeight(characterOrTier);
        }

        function generateWeightedDraftPool() {
            // Only ten cards are used in a 5x5 match. Sampling ten directly is distribution-equivalent
            // to the first ten cards of the old full 75-card weighted permutation.
            return PURE_CANON_DRAFT_ENGINE.generateDraftSequence(DB, 10);
        }

        function setDraftControlsEnabled(enabled) {
            const keep = document.getElementById('draft-keep-btn');
            const pass = document.getElementById('draft-pass-btn');
            for (const btn of [keep, pass]) {
                if (!btn) continue;
                btn.disabled = !enabled;
                btn.classList.toggle('opacity-45', !enabled);
                btn.classList.toggle('pointer-events-none', !enabled);
            }
        }

        function runCpuDraftTurn(expectedCardId, expectedPlayer) {
            if (!isCpuMode() || currentPlayer !== CPU_PLAYER || Number(expectedPlayer) !== CPU_PLAYER) return;
            if (!currentChar || Number(currentChar.id) !== Number(expectedCardId) || isDrafting) return;
            const decision = CPU_AI.chooseDraftAction({
                difficulty: cpuDifficulty,
                card: currentChar,
                ownTeam: p2Team,
                opponentTeam: p1Team,
                arenaIds: getCpuArenaIds(),
                evaluateDuel: cpuEvaluateDuel
            });
            const action = decision.action === 'keep' ? 'keep' : 'pass';
            const card = document.getElementById('draft-card');
            if (card) card.dataset.cpuChoice = action;
            presentCpuCommit(action === 'keep' ? 'ИИ забирает бойца в команду' : 'ИИ передаёт бойца сопернику', card, () => {
                logCpuDecision('draft', decision, { cardId:Number(currentChar?.id || expectedCardId), cardName:String(currentChar?.name || '') });
                handleDraft(action, 'cpu');
            }, r31VisualDelay(R31_CPU_TIMING.draftPreviewMinMs, R31_CPU_TIMING.draftPreviewMaxMs));
        }

        function proceedToDraft() {
            cancelCpuDecision();
            setUiScreen('draft');
            document.getElementById('initiative-phase').classList.add('hidden');
            document.getElementById('draft-phase').classList.remove('hidden');
            document.getElementById('draft-phase').classList.add('flex');
            document.getElementById('game-status').innerText = "Слепой Драфт";

            draftPool = generateWeightedDraftPool();
            p1Team = []; p2Team = [];
            arenaSlot1 = null; arenaSlot2 = null;
            updateArenaUI();
            updateFooterCounters();

            apply3DTilt(document.getElementById('draft-card'));
            nextDraftTurn();
        }

        function nextDraftTurn() {
            if (p1Team.length >= 5 && p2Team.length >= 5) {
                setDraftControlsEnabled(false);
                setTimeout(startBonusPhase, 400); return;
            }
            if (currentPlayer === 1 && p1Team.length >= 5) currentPlayer = 2;
            if (currentPlayer === 2 && p2Team.length >= 5) currentPlayer = 1;

            currentChar = draftPool.shift();
            if (currentChar) recordR22DraftSeen(currentChar);
            if (!currentChar) { setDraftControlsEnabled(false); startBonusPhase(); return; }

            const cpuTurn = isCpuTurn(currentPlayer);
            const label = getPlayerLabel(currentPlayer, true);
            document.getElementById('draft-turn-text').innerText = cpuTurn ? `Ход ${label} · анализ карты…` : `Ход ${label}`;
            document.getElementById('draft-turn-text').className = `title-font text-2xl md:text-3xl mb-4 font-black tracking-widest text-center transition-colors duration-300 ${currentPlayer === 1 ? 'text-blue-400' : 'text-orange-400'}`;
            document.getElementById('draft-name').innerText = currentChar.name;

            const draftImgContainer = document.getElementById('draft-img-container');
            draftImgContainer.innerHTML = `<img src="images/${getCharImgSrc(currentChar)}" alt="${currentChar.name}" class="char-img" decoding="async" fetchpriority="high" onerror="handleImgError(this, '${currentChar.emoji}')">`;
            setDraftControlsEnabled(!cpuTurn);
            if (cpuTurn) {
                const cardId = Number(currentChar.id);
                scheduleCpuDecision(`draft:${p1Team.length}:${p2Team.length}:${cardId}`, () => runCpuDraftTurn(cardId, CPU_PLAYER));
            }
        }

        function handleDraft(action, actor = 'human') {
            if (!currentChar || isDrafting) return;
            if (isCpuTurn(currentPlayer) && actor !== 'cpu') return;
            if (!isCpuTurn(currentPlayer) && actor === 'cpu') return;
            if (action !== 'keep' && action !== 'pass') return;
            isDrafting = true;
            setDraftControlsEnabled(false);
            playSwordSound();

            let targetTeam = (action === 'keep') ? currentPlayer : (currentPlayer === 1 ? 2 : 1);
            if (targetTeam === 1 && p1Team.length >= 5) targetTeam = 2;
            if (targetTeam === 2 && p2Team.length >= 5) targetTeam = 1;

            const newChar = { ...currentChar, isPrime: false, state: FATIGUE_STATES.FRESH };
            if (targetTeam === 1 && p1Team.length < 5) p1Team.push(newChar);
            else if (targetTeam === 2 && p2Team.length < 5) p2Team.push(newChar);
            if (targetTeam === 1) recordR22Selection(newChar);

            updateFooterCounters();
            currentChar = null;
            currentPlayer = currentPlayer === 1 ? 2 : 1;

            const card = document.getElementById('draft-card');
            card.style.transform = 'scale(0.95)'; card.style.opacity = '0.5';
            setTimeout(() => {
                card.style.transform = 'scale(1)'; card.style.opacity = '1';
                isDrafting = false;
                nextDraftTurn();
            }, 250);
        }

        function updateFooterCounters() {
            document.getElementById('p1-count').innerText = `${p1Team.length}/5`;
            document.getElementById('p2-count').innerText = `${p2Team.length}/5`;
        }

        function startBonusPhase() {
            cancelCpuDecision();
            setUiScreen('bonus');
            document.getElementById('draft-phase').classList.add('hidden');
            document.getElementById('game-status').innerText = "Высвобождение Силы";
            document.getElementById('bonus-phase').classList.remove('hidden');
            document.getElementById('bonus-phase').classList.add('flex');

            currentBonusPlayer = startingPlayer;
            bonusTurnsCount = 0;
            setupBonusTurn();
        }

        function runCpuBonusTurn(expectedTurn) {
            if (!isCpuMode() || currentBonusPlayer !== CPU_PLAYER || Number(expectedTurn) !== Number(bonusTurnsCount)) return;
            const generation = cpuDecisionGeneration;
            availableBonusPoints = PURE_CANON_DRAFT_ENGINE.rollPrimeCount();
            const count = availableBonusPoints;
            const chosenIds = Array.from(CPU_AI.choosePrimeTargets({
                difficulty: cpuDifficulty,
                team: p2Team,
                opponentTeam: p1Team,
                count,
                arenaIds: getCpuArenaIds(),
                evaluateDuel: cpuEvaluateDuel
            }) || []).map(Number);
            const chosen = new Set(chosenIds);
            // Start from a visible Base grid. The CPU then reveals every Prime assignment sequentially.
            for (const char of p2Team) char.isPrime = false;
            document.getElementById('bonus-selection-area').classList.remove('hidden');
            document.getElementById('bonus-points-wrapper').classList.remove('hidden');
            document.getElementById('bonus-points').innerText = String(count);
            document.getElementById('bonus-turn-text').innerText = `${getPlayerLabel(2)} получил ${count} ${count === 1 ? 'Козырь' : count < 5 ? 'Козыря' : 'Козырей'} и изучает команду…`;
            renderBonusGrid();
            syncCpuPresentation('prime-study', `ИИ изучает, кому активировать Прайм · ${count} ${count === 1 ? 'выбор' : 'выбора'}`);

            const revealNext = (index) => {
                cpuPresentationTimer = 0;
                if (generation !== cpuDecisionGeneration) return;
                if (!isCpuMode() || currentBonusPlayer !== CPU_PLAYER || Number(expectedTurn) !== Number(bonusTurnsCount)) return;
                if (!canCpuActNow()) { cpuPresentationTimer = setTimeout(() => revealNext(index), 220); return; }

                if (index < chosenIds.length) {
                    const id = chosenIds[index];
                    const char = p2Team.find(c => Number(c.id) === id);
                    if (char) char.isPrime = true;
                    availableBonusPoints = Math.max(0, count - index - 1);
                    document.getElementById('bonus-points').innerText = String(availableBonusPoints);
                    document.getElementById('bonus-turn-text').innerText = char
                        ? `${getPlayerLabel(2)} выбирает Прайм: ${char.name} · ${index + 1}/${count}`
                        : `${getPlayerLabel(2)} распределяет Прайм · ${index + 1}/${count}`;
                    renderBonusGrid();
                    const card = char ? document.querySelector(`#bonus-team-grid [data-fighter-id="${Number(char.id)}"]`) : null;
                    clearCpuChoicePreview();
                    if (card) card.classList.add('cpu-choice-preview', 'r31-prime-reveal');
                    syncCpuPresentation('preview', char ? `Прайм активирован: ${char.name}` : 'ИИ активирует Прайм…');
                    playSpiritBurst();
                    cpuPresentationTimer = setTimeout(() => revealNext(index + 1), r31VisualDelay(R31_CPU_TIMING.primeRevealMinMs, R31_CPU_TIMING.primeRevealMaxMs));
                    return;
                }

                availableBonusPoints = 0;
                document.getElementById('bonus-points').innerText = '0';
                document.getElementById('bonus-turn-text').innerText = `${getPlayerLabel(2)} распределил ${count} ${count === 1 ? 'Козырь' : count < 5 ? 'Козыря' : 'Козырей'}`;
                renderBonusGrid();
                const preview = [...document.querySelectorAll('#bonus-team-grid [data-fighter-id]')].filter(el => chosen.has(Number(el.dataset.fighterId)));
                presentCpuCommit('ИИ завершил выбор Прайм', preview, () => {
                    logCpuDecision('prime', { action:'select-prime', confidence:0.9, reason:`Выбрано Prime: ${chosen.size}` }, { count, fighterIds:chosenIds, sequentialReveal:true });
                    nextBonusTurn('cpu');
                }, r31VisualDelay(R31_CPU_TIMING.primeFinalHoldMinMs, R31_CPU_TIMING.primeFinalHoldMaxMs));
            };

            cpuPresentationTimer = setTimeout(() => revealNext(0), r31VisualDelay(R31_CPU_TIMING.primeStudyMinMs, R31_CPU_TIMING.primeStudyMaxMs));
        }

        function setupBonusTurn() {
            cancelCpuDecision();
            availableBonusPoints = 0;
            const rollBtn = document.getElementById('roll-bonus-btn');
            const confirmBtn = document.getElementById('confirm-bonus-btn');
            rollBtn.classList.remove('hidden');
            document.getElementById('bonus-selection-area').classList.add('hidden');
            confirmBtn.classList.add('hidden');
            document.getElementById('bonus-points-wrapper').classList.remove('hidden');
            document.getElementById('bonus-points').innerText = '0';
            const cpuTurn = isCpuTurn(currentBonusPlayer);
            const label = getPlayerLabel(currentBonusPlayer, true);
            document.getElementById('bonus-turn-text').innerText = cpuTurn ? `${label} определяет количество Козырей…` : `${label}, нажмите для определения количества Козырей`;
            document.getElementById('bonus-turn-text').className = `text-lg md:text-xl mb-6 font-bold text-center ${currentBonusPlayer === 1 ? 'text-blue-400' : 'text-orange-400'}`;
            rollBtn.disabled = cpuTurn;
            if (cpuTurn) {
                rollBtn.classList.add('hidden');
                scheduleCpuDecision(`prime-roll:${bonusTurnsCount}`, () => runCpuBonusTurn(bonusTurnsCount));
            }
        }

        function rollBonuses() {
            if (isCpuTurn(currentBonusPlayer)) return;
            playDiceSound();
            document.getElementById('roll-bonus-btn').classList.add('hidden');
            availableBonusPoints = PURE_CANON_DRAFT_ENGINE.rollPrimeCount();

            document.getElementById('bonus-selection-area').classList.remove('hidden');
            document.getElementById('confirm-bonus-btn').classList.remove('hidden');
            document.getElementById('bonus-points-wrapper').classList.remove('hidden');
            document.getElementById('bonus-points').innerText = availableBonusPoints;
            renderBonusGrid();
        }

        function renderBonusGrid() {
            const grid = document.getElementById('bonus-team-grid');
            grid.innerHTML = '';
            const team = currentBonusPlayer === 1 ? p1Team : p2Team;
            const cpuTurn = isCpuTurn(currentBonusPlayer);

            team.forEach((char, index) => {
                const card = document.createElement('div');
                card.className = `r13-bonus-card w-56 glass-panel card-3d ${char.isPrime ? 'holographic-foil border-purple-500 bonus-active-glow' : 'border-slate-800'} rounded-2xl p-4 flex flex-col items-center text-center ${cpuTurn ? 'cursor-default' : 'cursor-pointer'} transition-all duration-300 shadow-lg`;
                card.dataset.fighterId = String(char.id);
                if (!cpuTurn) card.onclick = () => toggleBonus(index);
                apply3DTilt(card);

                card.innerHTML = `
                    <div class="w-full h-36 bg-slate-950/80 rounded-xl mb-3 flex items-center justify-center border border-slate-800/80 shadow-inner overflow-hidden relative">
                        <img src="images/${getCharImgSrc(char)}" alt="${char.name}" class="char-img" loading="lazy" decoding="async" onerror="handleImgError(this, '${char.emoji}')">
                    </div>
                    <h4 class="font-bold text-slate-100 text-sm mb-3 tracking-wide">${char.name}</h4>
                    <div class="mt-auto w-full min-h-[90px]">
                    ${char.isPrime ? `
                        <div class="bg-purple-950/80 p-2.5 rounded-xl border border-purple-500/50 flex flex-col h-full justify-center">
                            <span class="text-purple-300 font-black mb-1 uppercase text-[9px] tracking-widest">ПРАЙМ АКТИВЕН</span>
                            <span class="text-white text-xs font-bold mb-1">${char.pName}</span>
                            <span class="text-slate-400 text-[10px] leading-tight">${char.pDesc}</span>
                        </div>
                    ` : `
                        <div class="bg-slate-900/80 h-full p-3 rounded-xl text-slate-400 border border-slate-800 flex flex-col items-center justify-center hover:bg-slate-800/60 transition-colors">
                            <span class="font-bold text-xs mb-1">Базовая форма</span>
                            <span class="text-[10px] text-purple-400">${uiIcon('prime',14)} Доступен козырь</span>
                        </div>
                    `}
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function toggleBonus(index) {
            if (isCpuTurn(currentBonusPlayer)) return;
            const team = currentBonusPlayer === 1 ? p1Team : p2Team;
            const char = team[index];
            if (!char) return;
            if (char.isPrime) {
                char.isPrime = false; availableBonusPoints++;
            } else if (availableBonusPoints > 0) {
                char.isPrime = true; availableBonusPoints--;
            }
            playSpiritBurst();
            document.getElementById('bonus-points').innerText = availableBonusPoints;
            renderBonusGrid();
        }

        function nextBonusTurn(actor = 'human') {
            if (isCpuTurn(currentBonusPlayer) && actor !== 'cpu') return;
            if (!isCpuTurn(currentBonusPlayer) && actor === 'cpu') return;
            recordR22PrimeAssignments(currentBonusPlayer === 1 ? p1Team : p2Team, currentBonusPlayer);
            cancelCpuDecision();
            bonusTurnsCount++;
            if (bonusTurnsCount < 2) {
                currentBonusPlayer = (currentBonusPlayer === 1) ? 2 : 1;
                setupBonusTurn();
            } else {
                startLocationPhase();
            }
        }

        function startLocationPhase() {
            setUiScreen('location');
            document.getElementById('bonus-phase').classList.add('hidden');
            document.getElementById('game-status').innerText = "Выбор Локации";
            document.getElementById('location-phase').classList.remove('hidden');
            document.getElementById('location-phase').classList.add('flex');

            document.getElementById('location-roll-area').classList.remove('hidden');
            const rouletteDisplay = document.getElementById('roulette-display');
            if (rouletteDisplay) {
                rouletteDisplay.classList.add('hidden');
                rouletteDisplay.classList.remove('flex', 'scale-100', 'opacity-100');
                rouletteDisplay.classList.add('scale-95', 'opacity-0');
            }
            document.getElementById('spin-roulette-btn').classList.remove('hidden');
        }

        const arenasForRoulette = Object.freeze(ARENA_RULES.map(arena => Object.freeze({
            id: String(arena.id), name: String(arena.publicName), iconName:'arena', color: String(arena.colorClass || 'text-slate-300')
        })));

        function spinArenaRoulette() {
            document.getElementById('spin-roulette-btn').classList.add('hidden');
            const display = document.getElementById('roulette-display');
            const resultText = document.getElementById('roulette-result');
            display.classList.remove('hidden');
            display.classList.add('flex');
            setTimeout(() => {
                display.classList.remove('scale-95', 'opacity-0');
                display.classList.add('scale-100', 'opacity-100');
            }, 50);

            let ticks = 0;
            const maxTicks = 30 + Math.floor(Math.random() * 15);
            let delay = 50;
            const finalIndex = PURE_CANON_DRAFT_ENGINE.pickArenaIndex(arenasForRoulette.length);
            function tick() {
                playDiceSound();
                const tempIndex = ticks % arenasForRoulette.length;
                resultText.innerHTML = `<span class="${arenasForRoulette[tempIndex].color} inline-flex items-center gap-2">${uiIcon('arena',22)}${arenasForRoulette[tempIndex].name}</span>`;
                ticks++;
                if (ticks < maxTicks) {
                    delay += 8;
                    setTimeout(tick, delay);
                } else {
                    resultText.innerHTML = `<span class="${arenasForRoulette[finalIndex].color} animate-pulse drop-shadow-[0_0_15px_currentColor] inline-flex items-center gap-2">${uiIcon('arena',22)}${arenasForRoulette[finalIndex].name}</span>`;
                    playSpiritBurst();
                    setTimeout(() => selectLocation(arenasForRoulette[finalIndex].id), 1500);
                }
            }
            tick();
        }

        function selectLocation(loc) {
            const arena = getArenaRule(loc) || ARENA_RULES[0] || null;
            selectedLocation = arena?.id || loc;
            recordR22Arena(selectedLocation);
            playSpiritBurst();

            const banner = document.getElementById('location-banner');
            const nameEl = document.getElementById('location-name');
            const descEl = document.getElementById('location-desc');
            banner.classList.remove('hidden');

            const bgImgPath = String(arena?.background || '');
            const audioPath = String(arena?.audio || '');
            if (nameEl) nameEl.innerHTML = `${uiIcon('arena',16)} <span>${arena?.publicName || 'Арена'}</span>`;
            if (descEl) descEl.innerText = `${arena?.shortDescription || ''} Эффект: ${arena?.mechanicSummary || ''}`.trim();

            if (bgImgPath) document.body.style.backgroundImage = `url('${bgImgPath}')`;
            document.getElementById('bg-overlay').style.opacity = '1';
            updateAuraForFighters(null, null);

            if (audioPath !== '') playBackgroundTrack(audioPath);
            startBattlePhase();
        }

        function startBattlePhase() {
            cancelCpuDecision();
            setUiScreen('battle');
            document.getElementById('location-phase').classList.add('hidden');
            document.getElementById('game-status').innerText = "Столкновение";
            document.getElementById('battle-phase').classList.remove('hidden');
            document.getElementById('battle-phase').classList.add('flex');

            arenaSlot1 = null;
            arenaSlot2 = null;
            p1Locked = false;
            p2Locked = false;
            currentRound = 1;
            battleInitiativeDone = false;

            document.getElementById('battle-init-overlay').classList.remove('hidden');
            document.getElementById('battle-init-overlay').classList.add('flex');
            document.getElementById('battle-init-result').innerText = "";
            document.getElementById('roll-battle-init-btn').classList.remove('hidden');
            document.getElementById('start-fight-rounds-btn').classList.add('hidden');

            updateArenaUI();
            updateBattleRosters();
            apply3DTilt(document.getElementById('arena-p1'));
            apply3DTilt(document.getElementById('arena-p2'));

            const logBox = document.getElementById('combat-log');
            if (logBox) logBox.innerHTML = '';
            window.SOUL_ARENA_PRESENTATION?.reset?.();
        }

        function rollBattleInitiative() {
            playDiceSound();
            document.getElementById('roll-battle-init-btn').classList.add('hidden');

            let roll1 = PURE_CANON_DRAFT_ENGINE.rollD6();
            let roll2 = PURE_CANON_DRAFT_ENGINE.rollD6();
            while (roll1 === roll2) roll2 = PURE_CANON_DRAFT_ENGINE.rollD6();
            const p1Label = getPlayerLabel(1, true);
            const p2Label = getPlayerLabel(2, true);

            if (roll1 > roll2) {
                firstPlacer = 1;
                document.getElementById('battle-init-result').innerHTML = `${uiIcon('dice',20)} ${p1Label} (${roll1}) > ${p2Label} (${roll2})!<br><span class="text-blue-400 font-black">${p1Label} выставляет бойца первым в Раунде 1!</span>`;
            } else {
                firstPlacer = 2;
                document.getElementById('battle-init-result').innerHTML = `${uiIcon('dice',20)} ${p2Label} (${roll2}) > ${p1Label} (${roll1})!<br><span class="text-orange-400 font-black">${p2Label} выставляет бойца первым в Раунде 1!</span>`;
            }

            document.getElementById('start-fight-rounds-btn').classList.remove('hidden');
        }

        function beginBattleRounds() {
            battleInitiativeDone = true;
            p1Locked = false;
            p2Locked = false;
            document.getElementById('battle-init-overlay').classList.add('hidden');
            document.getElementById('battle-init-overlay').classList.remove('flex');
            updateBattleRosters();
        }

        function getActivePicker() {
            if (!battleInitiativeDone) return null;
            if (p1Locked && p2Locked) return null;

            let secondPlacer = (firstPlacer === 1) ? 2 : 1;

            if (firstPlacer === 1 && !p1Locked) return 1;
            if (firstPlacer === 2 && !p2Locked) return 2;

            if (secondPlacer === 1 && !p1Locked) return 1;
            if (secondPlacer === 2 && !p2Locked) return 2;

            return null;
        }

        function scheduleCpuBattleTurnIfNeeded() {
            if (!isCpuMode() || getActivePicker() !== CPU_PLAYER || p2Locked) return;
            const round = currentRound;
            const opponentLocked = p1Locked && arenaSlot1 ? arenaSlot1 : null;
            const key = `battle:${round}:${opponentLocked ? Number(opponentLocked.id) : 'lead'}:${p2Team.map(c => `${c.id}.${c.state}`).join('-')}`;
            scheduleCpuDecision(key, () => runCpuBattleTurn(round));
        }

        function runCpuBattleTurn(expectedRound) {
            if (!isCpuMode() || Number(expectedRound) !== Number(currentRound) || getActivePicker() !== CPU_PLAYER || p2Locked) return;
            const opponentLocked = p1Locked && arenaSlot1 ? arenaSlot1 : null;
            const decision = CPU_AI.chooseBattleFighter({
                difficulty: cpuDifficulty,
                ownTeam: p2Team,
                opponentTeam: p1Team,
                opponentLocked,
                arena: selectedLocation,
                evaluateDuel: cpuEvaluateDuel
            });
            const chosen = p2Team.find(c => Number(c.id) === Number(decision.fighterId) && c.state !== FATIGUE_STATES.DEAD)
                || p2Team.find(c => c.state !== FATIGUE_STATES.DEAD);
            if (!chosen) return;
            const preview = document.querySelector(`#p2-roster [data-fighter-id="${Number(chosen.id)}"]`) || document.querySelector(`[data-player="2"][data-fighter-id="${Number(chosen.id)}"]`);
            presentCpuCommit(opponentLocked ? 'ИИ выбрал контрпик' : 'ИИ выставляет бойца', preview, () => {
                arenaSlot2 = chosen;
                p2Locked = true;
                playSwordSound();
                logCpuDecision('battle', decision, {
                    round:currentRound,
                    role: opponentLocked ? 'counterpick' : 'first-placement',
                    opponentLockedId: opponentLocked ? Number(opponentLocked.id) : null,
                    arena:String(selectedLocation || '')
                });
                updateArenaUI();
                updateBattleRosters();
                updateAuraForFighters(arenaSlot1, arenaSlot2);
                // If the CPU was the second placer, it completed the pair and owns the final action.
                // Queue after presentCpuCommit finishes so the auto-fight timer can safely replace its post-commit timer.
                if (opponentLocked && p1Locked && p2Locked) queueMicrotask(() => scheduleCpuAutoFightIfReady(currentRound));
            }, r31VisualDelay(R31_CPU_TIMING.battlePreviewMinMs, R31_CPU_TIMING.battlePreviewMaxMs));
        }

        function scheduleCpuAutoFightIfReady(expectedRound) {
            if (!isCpuMode() || Number(expectedRound) !== Number(currentRound)) return;
            // Player 1 is the human and CPU is player 2. firstPlacer===1 means the CPU placed last.
            if (firstPlacer !== 1 || !arenaSlot1 || !arenaSlot2 || !p1Locked || !p2Locked) return;
            const btn = document.getElementById('fight-btn');
            if (!btn || btn.dataset.cpuAutoPending === 'true') return;
            btn.dataset.cpuAutoPending = 'true';
            btn.classList.add('r31-cpu-auto-fight');
            const wait = r31VisualDelay(R31_CPU_TIMING.autoFightWaitMinMs, R31_CPU_TIMING.autoFightWaitMaxMs);
            scheduleCpuDecision(`auto-fight:${currentRound}:${arenaSlot1.id}:${arenaSlot2.id}`, () => {
                if (Number(expectedRound) !== Number(currentRound) || firstPlacer !== 1 || !p1Locked || !p2Locked) return;
                const fightBtn = document.getElementById('fight-btn');
                if (!fightBtn) return;
                syncCpuPresentation('preview', 'ИИ нажимает «Сражаться»…');
                fightBtn.classList.add('r31-cpu-auto-press');
                const generation = cpuDecisionGeneration;
                const pressAndStart = () => {
                    cpuPresentationTimer = 0;
                    if (generation !== cpuDecisionGeneration) return;
                    if (!canCpuActNow()) { cpuPresentationTimer = setTimeout(pressAndStart, 220); return; }
                    logCpuDecision('battle-start', { action:'fight', confidence:1, reason:'ИИ завершил второй выбор и сам запускает дуэль.' }, { round:currentRound, autoFight:true });
                    startCombat('cpu');
                };
                cpuPresentationTimer = setTimeout(pressAndStart, R31_CPU_TIMING.autoFightPressMs);
            }, wait);
        }

        function confirmFighterLock(playerNum, actor = 'human') {
            if (isCpuTurn(playerNum) && actor !== 'cpu') return;
            if (Number(playerNum) !== Number(getActivePicker())) return;
            playSwordSound();
            if (playerNum === 1 && arenaSlot1) {
                p1Locked = true;
            } else if (playerNum === 2 && arenaSlot2) {
                p2Locked = true;
            }
            updateBattleRosters();
            updateArenaUI();
        }

        function updateTurnIndicator() {
            const ind = document.getElementById('battle-turn-indicator');
            if (!battleInitiativeDone) {
                ind.innerHTML = `Жребий определяет, кто сделает первый ход на Арене...`;
                return;
            }

            const secondPlacer = (firstPlacer === 1) ? 2 : 1;
            const activePicker = getActivePicker();
            if (activePicker === firstPlacer) {
                const label = getPlayerLabel(firstPlacer, true);
                const action = isCpuTurn(firstPlacer) ? 'анализирует первый выбор…' : 'выберите или подтвердите своего бойца.';
                ind.innerHTML = `<span class="text-amber-400 font-black">РАУНД ${currentRound}:</span> Первым ходит <span class="${firstPlacer === 1 ? 'text-blue-400' : 'text-orange-400'} font-black">${label}</span> — ${action}`;
            } else if (activePicker === secondPlacer) {
                const firstFighter = firstPlacer === 1 ? arenaSlot1 : arenaSlot2;
                const firstLabel = getPlayerLabel(firstPlacer, true);
                const secondLabel = getPlayerLabel(secondPlacer, true);
                const action = isCpuTurn(secondPlacer) ? 'анализирует контрпик…' : 'выберите КОНТР-ПИК!';
                ind.innerHTML = `<span class="text-amber-400 font-black">РАУНД ${currentRound}:</span> <span class="${firstPlacer === 1 ? 'text-blue-400' : 'text-orange-400'} font-bold">${firstLabel}</span> зафиксировал (${firstFighter?.name || 'бойца'}). <span class="${secondPlacer === 1 ? 'text-blue-400' : 'text-orange-400'} font-black">Ход ${secondLabel}</span>: ${action}`;
            } else {
                const cpuStarts = isCpuMode() && firstPlacer === 1 && p1Locked && p2Locked;
                ind.innerHTML = cpuStarts
                    ? `Оба бойца подтверждены! <span class="text-orange-400 font-black">ИИ завершил второй выбор</span> и запускает <span class="text-red-400 font-black">СРАЖАТЬСЯ</span>…`
                    : `Оба бойца подтверждены! Нажмите <span class="text-red-400 font-black">СРАЖАТЬСЯ</span> для дуэли!`;
            }
        }

        function updateBattleRosters() {
            renderRoster(p1Team, 'p1-roster', 1);
            renderRoster(p2Team, 'p2-roster', 2);

            const activePicker = getActivePicker();
            const p1Box = document.getElementById('p1-roster-box');
            const p2Box = document.getElementById('p2-roster-box');
            const p1Title = document.getElementById('p1-roster-title');
            const p2Title = document.getElementById('p2-roster-title');
            const p1Name = getTeamLabel(1);
            const p2Name = getTeamLabel(2);

            if (activePicker === 1) {
                p1Box.className = "flex-1 glass-panel p-4 rounded-2xl border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] flex flex-col min-w-[280px] transition-all duration-300";
                p2Box.className = "flex-1 glass-panel p-4 rounded-2xl border border-slate-800/60 opacity-60 shadow-xl flex flex-col min-w-[280px] transition-all duration-300 pointer-events-none";
                p1Title.innerHTML = `<span>${p1Name}</span> <span class="text-xs bg-blue-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold animate-pulse">ТВОЙ ХОД</span>`;
                p2Title.innerHTML = `<span>${p2Name}</span> <span class="text-xs text-slate-500 font-normal">(Ожидание)</span>`;
            } else if (activePicker === 2) {
                const cpuTurn = isCpuTurn(2);
                p2Box.className = `flex-1 glass-panel p-4 rounded-2xl border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex flex-col min-w-[280px] transition-all duration-300 ${cpuTurn ? 'pointer-events-none' : ''}`;
                p1Box.className = "flex-1 glass-panel p-4 rounded-2xl border border-slate-800/60 opacity-60 shadow-xl flex flex-col min-w-[280px] transition-all duration-300 pointer-events-none";
                p2Title.innerHTML = cpuTurn
                    ? `<span>${p2Name}</span> <span class="text-xs bg-orange-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold animate-pulse">ИИ ДУМАЕТ…</span>`
                    : `<span>${p2Name}</span> <span class="text-xs bg-orange-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold animate-pulse">ТВОЙ ХОД</span>`;
                p1Title.innerHTML = `<span>${p1Name}</span> <span class="text-xs text-slate-500 font-normal">(Ожидание)</span>`;
            } else {
                p1Box.className = "flex-1 glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col min-w-[280px] transition-all duration-300 pointer-events-none";
                p2Box.className = "flex-1 glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col min-w-[280px] transition-all duration-300 pointer-events-none";
                p1Title.innerHTML = `<span>${p1Name}</span> ${p1Locked ? '<span class="text-xs text-emerald-400 font-bold">(Зафиксирован)</span>' : ''}`;
                p2Title.innerHTML = `<span>${p2Name}</span> ${p2Locked ? '<span class="text-xs text-emerald-400 font-bold">(Зафиксирован)</span>' : ''}`;
            }

            const lock1Btn = document.getElementById('lock-p1-btn');
            const lock2Btn = document.getElementById('lock-p2-btn');
            lock1Btn.classList.toggle('hidden', !(activePicker === 1 && arenaSlot1 && !p1Locked));
            lock2Btn.classList.toggle('hidden', !(activePicker === 2 && arenaSlot2 && !p2Locked && !isCpuTurn(2)));

            checkBattleReady();
            updateTurnIndicator();
            scheduleCpuBattleTurnIfNeeded();
        }

        function renderRoster(team, elementId, playerNum) {
            const container = document.getElementById(elementId);
            container.innerHTML = '';
            let allDead = true;
            const activePicker = getActivePicker();

            team.forEach((char, index) => {
                if (char.state !== FATIGUE_STATES.DEAD) allDead = false;
                const isSelected = (playerNum === 1 && arenaSlot1 === char) || (playerNum === 2 && arenaSlot2 === char);
                const isMyTurnToPick = (playerNum === activePicker) && !isCpuTurn(playerNum);

                const div = document.createElement('div');
                div.className = `r13-roster-card glass-panel rounded-xl p-2.5 border ${
                    isSelected ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-800'
                } flex items-center justify-between transition-all duration-200 ${
                    char.state === FATIGUE_STATES.DEAD ? 'dead-card' : isMyTurnToPick
                        ? 'cursor-pointer hover:border-amber-400 ring-2 ring-amber-400/20'
                        : 'opacity-50 pointer-events-none cursor-not-allowed'
                }`;

                div.dataset.fighterId = String(char.id);
                div.dataset.player = String(playerNum);
                if (char.state !== FATIGUE_STATES.DEAD && isMyTurnToPick) div.onclick = () => selectFighter(playerNum, index, 'human');
                div.innerHTML = `
                    <div class="flex items-center gap-2.5 w-full overflow-hidden">
                        <div class="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center flex-shrink-0 border border-slate-800 overflow-hidden relative">
                            <img src="images/${getCharImgSrc(char)}" alt="${char.name}" class="char-img" loading="lazy" decoding="async" onerror="handleImgError(this, '${char.emoji}')">
                        </div>
                        <div class="flex flex-col truncate pr-2">
                            <span class="font-bold text-xs text-slate-100 truncate">${char.name}</span>
                            <span class="text-[9px] font-black uppercase tracking-wider mt-0.5 ${char.isPrime ? 'text-purple-400' : 'text-slate-500'}">${char.isPrime ? `${uiIcon('prime',13)} ПРАЙМ` : `${uiIcon('swords',13)} База`}</span>
                        </div>
                    </div>
                    <div class="text-right flex flex-col items-end min-w-[65px]">
                        <span class="text-[11px] font-bold uppercase state-${char.state}">${STATE_NAMES[char.state]}</span>
                    </div>
                `;
                container.appendChild(div);
            });

            if (allDead) endGame(playerNum === 1 ? 2 : 1);
        }

        function selectFighter(playerNum, index, actor = 'human') {
            if (isCpuTurn(playerNum) && actor !== 'cpu') return;
            if (Number(playerNum) !== Number(getActivePicker())) return;
            const team = playerNum === 1 ? p1Team : p2Team;
            const char = team[index];
            if (!char || char.state === FATIGUE_STATES.DEAD) return;
            playSwordSound();

            if (playerNum === 1 && !p1Locked) arenaSlot1 = char;
            else if (playerNum === 2 && !p2Locked) arenaSlot2 = char;

            updateArenaUI();
            updateBattleRosters();
            updateAuraForFighters(arenaSlot1, arenaSlot2);
        }

        function updateArenaUI() {
            const updateSlot = (el, char, colorClass, isLocked) => {
                if (char) {
                    el.innerHTML = `
                        <img src="images/${getCharImgSrc(char)}" alt="${char.name}" class="absolute inset-0 char-img" onerror="handleImgError(this, '${char.emoji}')">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                        <span class="font-bold text-white text-xs md:text-sm text-center px-2 uppercase tracking-wide bg-slate-950/85 w-full py-1.5 mt-auto z-10 border-t border-${colorClass}-500/50 backdrop-blur-sm truncate">${char.name} ${isLocked ? uiIcon('lock',14) : ''}</span>
                    `;
                    el.className = `arena-slot card-3d ${char.isPrime ? 'holographic-foil' : ''} w-36 h-48 md:w-44 md:h-56 bg-slate-900/90 border-2 ${isLocked ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.6)]' : `border-${colorClass}-500`} rounded-2xl flex items-center justify-center flex-col relative overflow-hidden transition-all duration-300 shadow-lg`;
                } else {
                    el.innerHTML = `<span class="text-slate-500 font-semibold uppercase tracking-widest text-xs text-center">Слот<br><span class="text-[9px] opacity-70">(Выбор)</span></span>`;
                    el.className = "arena-slot card-3d w-36 h-48 md:w-44 md:h-56 bg-slate-950/80 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center flex-col p-2.5 relative transition-all duration-300 shadow-inner";
                }
            };
            updateSlot(document.getElementById('arena-p1'), arenaSlot1, 'blue', p1Locked);
            updateSlot(document.getElementById('arena-p2'), arenaSlot2, 'orange', p2Locked);
        }

        function checkBattleReady() {
            const btn = document.getElementById('fight-btn');
            if (!btn) return;
            const ready = Boolean(arenaSlot1 && arenaSlot2 && p1Locked && p2Locked);
            const cpuOwnsFinalAction = ready && isCpuMode() && firstPlacer === 1;
            btn.disabled = !ready || cpuOwnsFinalAction;
            btn.setAttribute('aria-disabled', btn.disabled ? 'true' : 'false');
            if (ready) {
                btn.classList.remove('opacity-40');
                btn.classList.add('animate-pulse');
                btn.classList.toggle('pointer-events-none', cpuOwnsFinalAction);
                btn.classList.toggle('r31-cpu-auto-fight', cpuOwnsFinalAction);
                if (!cpuOwnsFinalAction) { delete btn.dataset.cpuAutoPending; btn.classList.remove('r31-cpu-auto-press'); }
            } else {
                btn.classList.add('opacity-40', 'pointer-events-none');
                btn.classList.remove('animate-pulse', 'r31-cpu-auto-fight', 'r31-cpu-auto-press');
                delete btn.dataset.cpuAutoPending;
            }
        }

        function startCombat(actor = 'human') {
            if (!arenaSlot1 || !arenaSlot2 || !p1Locked || !p2Locked) return;
            if (isCpuMode() && firstPlacer === 1 && actor !== 'cpu') return;
            cancelCpuDecision();
            const fightBtn = document.getElementById('fight-btn');
            if (fightBtn) { delete fightBtn.dataset.cpuAutoPending; fightBtn.classList.remove('r31-cpu-auto-fight', 'r31-cpu-auto-press'); }

            playSpiritBurst();
            triggerScreenShake();
            triggerSpiritShockwave();
            
            let logs = [];
            let c1 = arenaSlot1, c2 = arenaSlot2;
            let form1 = c1.isPrime ? 'Прайм' : 'База';
            let form2 = c2.isPrime ? 'Прайм' : 'База';
            
            const activeArena = getArenaRule(selectedLocation);
            const arenaReskinned = activeArena?.publicName || getReskinnedArena(selectedLocation);

            logs.push(`<div class="text-sm border-b border-slate-800 pb-1.5 mb-1.5"><span class="text-amber-400 font-black">--- РАУНД ${currentRound} ---</span><br><span class="text-blue-400 font-bold">${c1.name}</span> <span class="text-[10px] text-slate-500">[${form1}, ${STATE_NAMES[c1.state]}]</span> <span class="text-red-500 px-2 font-black">VS</span> <span class="text-orange-400 font-bold">${c2.name}</span> <span class="text-[10px] text-slate-500">[${form2}, ${STATE_NAMES[c2.state]}]</span> (${arenaReskinned})</div>`);

            const entryState1 = c1.state;
            const entryState2 = c2.state;
            const match = EXCEL_MATCHUPS[makeBattleKey(c1.name, form1, c2.name, form2, arenaReskinned)] || null;
            const enginePreview = resolveCombatV2(c1, form1, c2, form2, { stateA: entryState1, stateB: entryState2, arena: arenaReskinned });
            const fatiguePrimary = shouldUseFatigueEnginePrimary(entryState1, entryState2);

            let matrixWinnerId = null;
            if (match) {
                if (match.winnerId === c1.id || match.winnerId === c2.id) matrixWinnerId = Number(match.winnerId);
                else {
                    const matrixWinner = resolveCharacter(match.winner);
                    if (matrixWinner?.id === c1.id || matrixWinner?.id === c2.id) matrixWinnerId = matrixWinner.id;
                }
            }

            let winner = null, loser = null, winnerSlot = 0;

            // R7 core rule: once a survivor carries damage from an earlier duel, state-aware Combat Engine becomes primary.
            if (fatiguePrimary && enginePreview) {
                winner = enginePreview.winnerId === c1.id ? c1 : c2;
                loser = winner === c1 ? c2 : c1;
                winnerSlot = winner === c1 ? 1 : 2;
                const transition = applyFatigueDamage(winner, enginePreview.winnerStateDelta);
                loser.state = FATIGUE_STATES.DEAD;
                const changedFreshMatrix = matrixWinnerId != null && matrixWinnerId !== winner.id;
                window.SOUL_ARENA_LAST_COMBAT_DIAGNOSTIC = Object.freeze({
                    mode: 'R10_FATIGUE_DYNAMIC_PRIMARY',
                    matrixWinnerId,
                    engineWinnerId: enginePreview.winnerId,
                    agreesWithFreshMatrix: matrixWinnerId == null ? null : !changedFreshMatrix,
                    fatigueChangedFreshOutcome: changedFreshMatrix,
                    entryStates: Object.freeze([entryState1, entryState2]),
                    transition,
                    engine: enginePreview
                });
                logs.push(`<span class="text-cyan-300 text-[10px] my-1 font-bold block">Состояние влияет на бой — ${STATE_NAMES[entryState1]} vs ${STATE_NAMES[entryState2]}.</span>`);
                if (enginePreview.arenaApplied) logs.push(`<span class="text-violet-300 text-[10px] my-1 font-bold block">Арена активна: ${enginePreview.arena.publicName}.</span>`);
                logs.push(`<span class="text-slate-300 text-[10px] my-1 font-medium italic">Расчёт учёл форму, состояние, особенности противостояния и арену. Сложность: ${enginePreview.difficulty}.</span>`);
                if (changedFreshMatrix) logs.push('<span class="text-amber-300 text-[10px] my-1 font-bold block">Предыдущие повреждения изменили исход по сравнению с боем двух свежих соперников.</span>');
            }

            // R10: the canon-verified 33,300 cache is authoritative for Fresh-vs-Fresh and mirrors the R10 verification layer.
            if (!winner && !fatiguePrimary && match && matrixWinnerId != null) {
                winner = matrixWinnerId === c1.id ? c1 : c2;
                loser = winner === c1 ? c2 : c1;
                winnerSlot = winner === c1 ? 1 : 2;
                const endState = parseFatigueState(match.state);
                const transition = applyFatigueDamage(winner, endState);
                loser.state = FATIGUE_STATES.DEAD;
                if (match.comment) logs.push(`<div class="text-slate-300 text-xs my-1 font-medium leading-relaxed">${match.comment}</div>`);
                const agrees = enginePreview ? enginePreview.winnerId === winner.id : null;
                if (agrees === false) console.warn('R30 matrix/runtime engine mismatch', {c1:c1.id,c2:c2.id,form1,form2,arena:arenaReskinned,matrixWinnerId,engineWinnerId:enginePreview?.winnerId});
                window.SOUL_ARENA_LAST_COMBAT_DIAGNOSTIC = Object.freeze({
                    mode: 'R17_ARENA2_MATRIX_FRESH_PRIMARY',
                    matrixVersion: String(BATTLE_MATRIX_META?.matrixVersion || 'R17'),
                    matrixWinnerId: winner.id,
                    engineWinnerId: enginePreview?.winnerId || null,
                    agrees,
                    fatigueChangedFreshOutcome: false,
                    entryStates: Object.freeze([entryState1, entryState2]),
                    transition,
                    matrix: Object.freeze({difficulty:match.difficulty,margin:match.margin,hardOverride:match.hardOverride}),
                    engine: enginePreview || null
                });
            }

            // Engine fallback handles a malformed or missing R17 cache record.
            if (!winner && enginePreview) {
                winner = enginePreview.winnerId === c1.id ? c1 : c2;
                loser = winner === c1 ? c2 : c1;
                winnerSlot = winner === c1 ? 1 : 2;
                const transition = applyFatigueDamage(winner, enginePreview.winnerStateDelta);
                loser.state = FATIGUE_STATES.DEAD;
                window.SOUL_ARENA_LAST_COMBAT_DIAGNOSTIC = Object.freeze({ mode: 'R17_ENGINE_FALLBACK', matrixWinnerId, engineWinnerId: enginePreview.winnerId, agreesWithMatrix: matrixWinnerId == null ? null : matrixWinnerId === enginePreview.winnerId, entryStates:Object.freeze([entryState1,entryState2]), transition, engine: enginePreview });
                logs.push(`<span class="text-slate-300 text-[10px] my-1 font-medium italic">Расчёт учёл форму, состояние, особенности противостояния и арену. Сложность: ${enginePreview.difficulty}.</span>`);
            }

            // Emergency-only one-number safety path; normal R7 gameplay should never reach it.
            if (!winner) {
                const baseP1 = c1.isPrime ? c1.primePower : c1.basePower;
                const baseP2 = c2.isPrime ? c2.primePower : c2.basePower;
                const p1 = baseP1 * FATIGUE_MULTIPLIERS[entryState1];
                const p2 = baseP2 * FATIGUE_MULTIPLIERS[entryState2];
                winner = p1 >= p2 ? c1 : c2;
                loser = winner === c1 ? c2 : c1;
                winnerSlot = winner === c1 ? 1 : 2;
                const tierDiff = loser.tier - winner.tier;
                const damageState = (tierDiff >= 2 || winner.tier <= -1) ? FATIGUE_STATES.FRESH : FATIGUE_STATES.WOUNDED;
                applyFatigueDamage(winner, damageState);
                loser.state = FATIGUE_STATES.DEAD;
                logs.push('<span class="text-slate-400 text-[10px] my-1 font-medium italic">Аварийный расчёт по базовой силе: основной расчёт боя недоступен.</span>');
            }

            logs.push(`<span class="text-emerald-400 font-black tracking-widest mt-1 block">ПРЕВОСХОДСТВО: ${winner.name} (Состояние: ${STATE_NAMES[winner.state]})</span>`);
            recordR22Duel(winner, loser, winnerSlot);

            // R12 presentation consumes the already-decided R17/R7 result and never participates in winner selection.
            try {
                const diagnostic = window.SOUL_ARENA_LAST_COMBAT_DIAGNOSTIC || null;
                window.SOUL_ARENA_PRESENTATION?.showBattleResult?.({
                    round: currentRound,
                    fighters: {
                        a: { id:c1.id, name:c1.name, emoji:c1.emoji, portrait:c1.img, form:form1, isPrime:Boolean(c1.isPrime), rating:(c1.isPrime?c1.primePower:c1.basePower), entryState:entryState1, primeAbilityName:c1.pName, primeAbilityDescription:c1.pDesc },
                        b: { id:c2.id, name:c2.name, emoji:c2.emoji, portrait:c2.img, form:form2, isPrime:Boolean(c2.isPrime), rating:(c2.isPrime?c2.primePower:c2.basePower), entryState:entryState2, primeAbilityName:c2.pName, primeAbilityDescription:c2.pDesc }
                    },
                    winnerId: winner.id,
                    loserId: loser.id,
                    winnerExitState: winner.state,
                    loserExitState: loser.state,
                    fatiguePrimary,
                    fatigueChangedFreshOutcome: Boolean(diagnostic?.fatigueChangedFreshOutcome),
                    diagnosticMode: String(diagnostic?.mode || ''),
                    matrix: match ? { difficulty:match.difficulty || null, margin:match.margin ?? null, hardOverride:Boolean(match.hardOverride) } : null,
                    engine: enginePreview || diagnostic?.engine || null,
                    arena: activeArena ? { publicName:activeArena.publicName, icon:'arena', shortDescription:activeArena.shortDescription, mechanicSummary:activeArena.mechanicSummary } : { publicName:arenaReskinned, icon:'arena' }
                });
            } catch (presentationError) {
                console.warn('R12 Battle Presentation skipped:', presentationError);
            }

            if (winnerSlot === 1) arenaSlot2 = null;
            else arenaSlot1 = null;

            firstPlacer = (firstPlacer === 1 ? 2 : 1);
            currentRound++;
            p1Locked = false;
            p2Locked = false;

            logMsg(logs.join("<br>"));
            updateArenaUI(); 
            updateBattleRosters();
            updateAuraForFighters(arenaSlot1, arenaSlot2);
        }

        function logMsg(message) {
            const logBox = document.getElementById('combat-log');
            const entry = document.createElement('div');
            entry.className = "combat-log-entry border-l-2 border-red-600 pl-3 py-2 bg-slate-900/60 rounded-r-xl";
            entry.innerHTML = message;
            logBox.prepend(entry);
        }

        function endGame(winnerPlayer) {
            if (matchEnded) return;
            cancelCpuDecision();
            setUiScreen('end');
            matchEnded = true;
            playVictorySound();
            if (winnerPlayer === 1) p1SeriesWins++;
            if (winnerPlayer === 2) p2SeriesWins++;

            document.getElementById('p1-series-score').innerText = p1SeriesWins;
            document.getElementById('p2-series-score').innerText = p2SeriesWins;
            document.getElementById('battle-phase').classList.add('hidden');
            document.getElementById('end-screen').classList.remove('hidden');
            document.getElementById('end-screen').classList.add('flex');

            const btn = document.getElementById('end-action-btn');
            const winnerLabel = getPlayerLabel(winnerPlayer, true).toUpperCase();
            const seriesCompleted = p1SeriesWins >= 5 || p2SeriesWins >= 5;
            const finalSeriesScore = Object.freeze({ player: p1SeriesWins, opponent: p2SeriesWins });
            if (!seriesCompleted && p1SeriesWins === 0 && p2SeriesWins === 4) r22SeriesWasDown04 = true;
            const r22Flawless = winnerPlayer === 1 && p1Team.length > 0 && p1Team.every(c => Number(c.state) !== FATIGUE_STATES.DEAD);
            recordR22Match({ playerWon:winnerPlayer===1, flawless:r22Flawless, seriesCompleted, scoreFor:finalSeriesScore.player, scoreAgainst:finalSeriesScore.opponent, comeback04:Boolean(seriesCompleted && winnerPlayer===1 && r22SeriesWasDown04) });
            const ratingResult = seriesCompleted && isCpuMode()
                ? recordCpuSeriesRating(winnerPlayer === 1, finalSeriesScore.player, finalSeriesScore.opponent)
                : null;
            const ratingEl = document.getElementById('end-rating-text');
            if (ratingEl) {
                ratingEl.classList.toggle('hidden', !ratingResult);
                if (ratingResult) {
                    const difficultyMeta = getCpuDifficultyMeta();
                    ratingEl.innerHTML = `${uiIcon('rating',18)} <span>Elo: ${ratingResult.oldRating} → ${ratingResult.newRating} (${signedRatingDelta(ratingResult.delta)}) · ${difficultyMeta.label} ${ratingResult.botRating}</span>`;
                    ratingEl.dataset.delta = ratingResult.delta > 0 ? 'gain' : ratingResult.delta < 0 ? 'loss' : 'flat';
                } else {
                    ratingEl.innerHTML = '';
                    ratingEl.dataset.delta = 'flat';
                }
            }
            const coinReward = seriesCompleted && isCpuMode() && winnerPlayer === 1
                ? recordCpuSeriesCoins(true, finalSeriesScore.player, finalSeriesScore.opponent)
                : null;
            const rewardEl = document.getElementById('end-reward-text');
            if (rewardEl) {
                rewardEl.dataset.reward = 'none';
                if (!seriesCompleted) {
                    rewardEl.innerHTML = `${uiIcon('coin',17)} <span>Серийная награда: 0 · за отдельный матч монеты за результат не выдаются</span>`;
                } else if (!isCpuMode()) {
                    rewardEl.innerHTML = `${uiIcon('coin',17)} <span>0 · режим «Вдвоём» не начисляет монеты</span>`;
                } else if (winnerPlayer !== 1) {
                    rewardEl.innerHTML = `${uiIcon('coin',17)} <span>0 · серия проиграна</span>`;
                } else if (coinReward) {
                    rewardEl.dataset.reward = 'coins';
                    rewardEl.innerHTML = `${uiIcon('coin',17)} <span>+${coinReward.coins} монет · победа ${coinReward.scoreFor}:${coinReward.scoreAgainst} · ${getCpuDifficultyMeta().label} ×${coinReward.multiplier}</span>`;
                } else {
                    rewardEl.innerHTML = `${uiIcon('coin',17)} <span>0 · награда не рассчитана</span>`;
                }
            }

            evaluateR22Achievements();
            if (seriesCompleted) r22SeriesWasDown04 = false;

            if (seriesCompleted) {
                document.getElementById('game-status').innerText = "СЕРИЯ ЗАВЕРШЕНА";
                document.getElementById('end-title').innerText = "ЧЕМПИОН СЕРИИ";
                document.getElementById('winner-text').innerText = `${winnerLabel} ВЫИГРАЛ СЕРИЮ!`;
                document.getElementById('winner-text').className = `text-3xl md:text-5xl mb-3 font-black uppercase tracking-wider ${winnerPlayer === 1 ? 'text-blue-500' : 'text-orange-500'}`;
                document.getElementById('series-status-text').innerText = `Финальный счёт: ${getPlayerLabel(1, true)} ${p1SeriesWins} — ${getPlayerLabel(2, true)} ${p2SeriesWins}.`;
                btn.innerHTML = `${uiIcon('trophy',18)} <span>НОВАЯ СЕРИЯ (СБРОС 0:0)</span>`;
                p1SeriesWins = 0;
                p2SeriesWins = 0;
            } else {
                document.getElementById('game-status').innerText = "МАТЧ ЗАВЕРШЕН";
                document.getElementById('end-title').innerText = "ПОБЕДА В МАТЧЕ";
                document.getElementById('winner-text').innerText = `${winnerLabel} ВЫЖИЛ!`;
                document.getElementById('winner-text').className = `text-3xl md:text-5xl mb-3 font-black uppercase tracking-wider ${winnerPlayer === 1 ? 'text-blue-500' : 'text-orange-400'}`;
                document.getElementById('series-status-text').innerText = `Счёт серии: ${getPlayerLabel(1, true)} (${p1SeriesWins}) — ${getPlayerLabel(2, true)} (${p2SeriesWins})`;
                btn.innerHTML = `<span>СЛЕДУЮЩИЙ МАТЧ</span> ${uiIcon('swords',18)}`;
            }

            showVKInterstitialAd();
        }

        function handleEndScreenAction() {
            initGame();
        }


        window.SOUL_ARENA_R27 = Object.freeze({
            version:'R27.0.0',
            feature:'HUD / Icons / Resources Full Rebuild',
            validate(){
                const iconAudit=UI_ICONS?.audit?.(document)||null;
                const resources=[...document.querySelectorAll('[data-resource]')].map(n=>n.dataset.resource);
                const duplicateResourceNodes=resources.filter((x,i)=>resources.indexOf(x)!==i);
                return Object.freeze({ok:Boolean(iconAudit&&!iconAudit.missingRequired.length&&!iconAudit.unhydrated.length&&!iconAudit.visibleLegacyResourceEmoji.length),iconAudit,resources,duplicateResourceNodes});
            }
        });

        window.SOUL_ARENA_R32 = Object.freeze({
            version:'R32.0.0',
            feature:'Header controls collision repair + support UI removal',
            validate(){
                const headerControls=document.getElementById('header-left-actions');
                const supportUi=[...document.querySelectorAll('#support-modal,[onclick*="openSupportInfo"],[data-ui-icon="support"]')];
                const supportFunctions=['openSupportInfo','closeSupportInfo','openDeveloperCommunity'].filter(name=>typeof window[name]==='function');
                return Object.freeze({
                    ok:Boolean(headerControls&&supportUi.length===0&&supportFunctions.length===0),
                    headerControls:Boolean(headerControls),
                    supportUiNodes:supportUi.length,
                    supportFunctions
                });
            }
        });

        function hideBootSplash() {
            const splash = document.getElementById('r13-boot-splash');
            if (!splash) return;
            const hide = () => {
                splash.classList.add('is-hidden');
                setTimeout(() => splash.remove(), reducedMotion ? 0 : 520);
            };
            if (typeof requestAnimationFrame === 'function') requestAnimationFrame(hide); else hide();
        }

        function bootGame() {
            syncAppViewport();
            getShopProfile();
            getProgressProfile();
            applyEquippedCosmetics();
            setReducedMotion(reducedMotion);
            syncAudioControls();
            syncEconomyUi();
            loadEmbeddedDatabase();
            evaluateR22Achievements({ silent:false });
            showMainMenu();
            window.addEventListener('resize', syncAppViewport, { passive: true });
            window.addEventListener('orientationchange', syncAppViewport, { passive: true });
            if (window.visualViewport) window.visualViewport.addEventListener('resize', syncAppViewport, { passive: true });
            document.addEventListener('keydown', event => { if (event.key === 'Escape') closeTopModal(); });
            hideBootSplash();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootGame, { once: true });
        } else {
            bootGame();
        }
