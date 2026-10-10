'use strict';

(function initSoulArenaEconomyEngine() {
    const ENGINE_VERSION = 'R20.0.0';
    const SCHEMA_VERSION = 1;
    const INITIAL_COINS = 0;
    const REWARDED_AMOUNT = 100;
    const REWARDED_DAILY_LIMIT = 3;
    const SERIES_BASE_REWARDS = Object.freeze({
        0: 150,
        1: 135,
        2: 120,
        3: 105,
        4: 90
    });
    const DIFFICULTY_MULTIPLIERS = Object.freeze({
        easy: 1,
        medium: 1.25,
        hard: 1.5,
        master: 2
    });

    function int(value, fallback = 0) {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function clampInt(value, min, max) {
        return Math.min(max, Math.max(min, int(value, min)));
    }

    function localDayKey(now = Date.now()) {
        const date = now instanceof Date ? now : new Date(Number(now));
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        const y = safeDate.getFullYear();
        const m = String(safeDate.getMonth() + 1).padStart(2, '0');
        const d = String(safeDate.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function createDefaultState(now = Date.now()) {
        return {
            schemaVersion: SCHEMA_VERSION,
            coins: INITIAL_COINS,
            totalSeriesCoins: 0,
            totalRewardedCoins: 0,
            seriesRewardsClaimed: 0,
            rewarded: {
                dayKey: localDayKey(now),
                count: 0,
                lastClaimAt: 0
            },
            lastSeriesReward: null,
            lastRewardedReward: null,
            history: []
        };
    }

    function normalizeState(value, now = Date.now()) {
        const source = value && typeof value === 'object' ? value : {};
        const base = createDefaultState(now);
        const rewardedSource = source.rewarded && typeof source.rewarded === 'object' ? source.rewarded : {};
        let dayKey = /^\d{4}-\d{2}-\d{2}$/.test(String(rewardedSource.dayKey || '')) ? String(rewardedSource.dayKey) : base.rewarded.dayKey;
        let count = clampInt(rewardedSource.count, 0, REWARDED_DAILY_LIMIT);
        const today = localDayKey(now);
        if (today > dayKey) {
            dayKey = today;
            count = 0;
        }
        const history = Array.isArray(source.history) ? source.history.filter(row => row && typeof row === 'object').slice(-30) : [];
        return {
            schemaVersion: SCHEMA_VERSION,
            coins: Math.max(0, int(source.coins, INITIAL_COINS)),
            totalSeriesCoins: Math.max(0, int(source.totalSeriesCoins)),
            totalRewardedCoins: Math.max(0, int(source.totalRewardedCoins)),
            seriesRewardsClaimed: Math.max(0, int(source.seriesRewardsClaimed)),
            rewarded: {
                dayKey,
                count,
                lastClaimAt: Math.max(0, Number(rewardedSource.lastClaimAt) || 0)
            },
            lastSeriesReward: source.lastSeriesReward && typeof source.lastSeriesReward === 'object' ? source.lastSeriesReward : null,
            lastRewardedReward: source.lastRewardedReward && typeof source.lastRewardedReward === 'object' ? source.lastRewardedReward : null,
            history
        };
    }

    function roundToFive(value) {
        return Math.max(0, Math.round((Number(value) || 0) / 5) * 5);
    }

    function calculateSeriesReward(difficulty, won, scoreFor, scoreAgainst) {
        const safeDifficulty = Object.prototype.hasOwnProperty.call(DIFFICULTY_MULTIPLIERS, difficulty) ? difficulty : 'medium';
        const playerWon = Boolean(won) && int(scoreFor) === 5 && int(scoreAgainst) >= 0 && int(scoreAgainst) <= 4;
        const safeAgainst = clampInt(scoreAgainst, 0, 4);
        const base = SERIES_BASE_REWARDS[safeAgainst];
        const multiplier = DIFFICULTY_MULTIPLIERS[safeDifficulty];
        const coins = playerWon ? roundToFive(base * multiplier) : 0;
        return Object.freeze({
            difficulty: safeDifficulty,
            won: playerWon,
            scoreFor: clampInt(scoreFor, 0, 5),
            scoreAgainst: clampInt(scoreAgainst, 0, 5),
            base: playerWon ? base : 0,
            multiplier,
            coins
        });
    }

    function applySeriesVictory(value, result = {}, now = Date.now()) {
        const state = normalizeState(value, now);
        const reward = calculateSeriesReward(result.difficulty, result.won, result.scoreFor, result.scoreAgainst);
        if (!reward.coins) return Object.freeze({ state: Object.freeze(state), reward });
        const next = normalizeState(state, now);
        const entry = Object.freeze({
            type: 'series',
            at: Number.isFinite(Number(result.at)) ? Number(result.at) : Number(now),
            difficulty: reward.difficulty,
            scoreFor: reward.scoreFor,
            scoreAgainst: reward.scoreAgainst,
            base: reward.base,
            multiplier: reward.multiplier,
            coins: reward.coins
        });
        next.coins += reward.coins;
        next.totalSeriesCoins += reward.coins;
        next.seriesRewardsClaimed += 1;
        next.lastSeriesReward = entry;
        next.history = [...next.history, entry].slice(-30);
        return Object.freeze({ state: Object.freeze(next), reward: entry });
    }

    function getRewardedStatus(value, now = Date.now()) {
        const state = normalizeState(value, now);
        const today = localDayKey(now);
        const clockRollbackDetected = today < state.rewarded.dayKey;
        const remaining = Math.max(0, REWARDED_DAILY_LIMIT - state.rewarded.count);
        return Object.freeze({
            dayKey: state.rewarded.dayKey,
            count: state.rewarded.count,
            remaining,
            limit: REWARDED_DAILY_LIMIT,
            amount: REWARDED_AMOUNT,
            canClaim: remaining > 0 && !clockRollbackDetected,
            clockRollbackDetected
        });
    }

    function applyRewardedSuccess(value, options = {}, now = Date.now()) {
        const state = normalizeState(value, now);
        const status = getRewardedStatus(state, now);
        if (!status.canClaim) return Object.freeze({ state: Object.freeze(state), reward: null, status });
        const next = normalizeState(state, now);
        const entry = Object.freeze({
            type: 'rewarded',
            at: Number.isFinite(Number(options.at)) ? Number(options.at) : Number(now),
            dayKey: status.dayKey,
            ordinal: status.count + 1,
            coins: REWARDED_AMOUNT
        });
        next.coins += REWARDED_AMOUNT;
        next.totalRewardedCoins += REWARDED_AMOUNT;
        next.rewarded.count = status.count + 1;
        next.rewarded.lastClaimAt = entry.at;
        next.lastRewardedReward = entry;
        next.history = [...next.history, entry].slice(-30);
        return Object.freeze({ state: Object.freeze(next), reward: entry, status: getRewardedStatus(next, now) });
    }

    function validate() {
        const errors = [];
        const expected = {
            easy: [150, 135, 120, 105, 90],
            medium: [190, 170, 150, 130, 115],
            hard: [225, 205, 180, 160, 135],
            master: [300, 270, 240, 210, 180]
        };
        for (const [difficulty, rows] of Object.entries(expected)) {
            for (let against = 0; against <= 4; against++) {
                const actual = calculateSeriesReward(difficulty, true, 5, against).coins;
                if (actual !== rows[against]) errors.push(`${difficulty} 5:${against} expected ${rows[against]}, got ${actual}`);
            }
        }
        if (calculateSeriesReward('master', false, 4, 5).coins !== 0) errors.push('Loss awarded coins');
        let state = createDefaultState(new Date(2026, 8, 4, 12, 0, 0).getTime());
        for (let i = 0; i < 3; i++) state = applyRewardedSuccess(state, {}, new Date(2026, 8, 4, 12, i, 0).getTime()).state;
        if (getRewardedStatus(state, new Date(2026, 8, 4, 13, 0, 0).getTime()).remaining !== 0) errors.push('Rewarded daily cap failed');
        if (applyRewardedSuccess(state, {}, new Date(2026, 8, 4, 14, 0, 0).getTime()).reward) errors.push('Fourth rewarded claim succeeded');
        if (getRewardedStatus(state, new Date(2026, 8, 5, 0, 1, 0).getTime()).remaining !== 3) errors.push('Rewarded daily reset failed');
        return Object.freeze({
            ok: errors.length === 0,
            engineVersion: ENGINE_VERSION,
            schemaVersion: SCHEMA_VERSION,
            initialCoins: INITIAL_COINS,
            rewardedAmount: REWARDED_AMOUNT,
            rewardedDailyLimit: REWARDED_DAILY_LIMIT,
            seriesBaseRewards: SERIES_BASE_REWARDS,
            difficultyMultipliers: DIFFICULTY_MULTIPLIERS,
            errors: Object.freeze(errors)
        });
    }

    window.SOUL_ARENA_ECONOMY_ENGINE = Object.freeze({
        engineVersion: ENGINE_VERSION,
        schemaVersion: SCHEMA_VERSION,
        initialCoins: INITIAL_COINS,
        rewardedAmount: REWARDED_AMOUNT,
        rewardedDailyLimit: REWARDED_DAILY_LIMIT,
        seriesBaseRewards: SERIES_BASE_REWARDS,
        difficultyMultipliers: DIFFICULTY_MULTIPLIERS,
        localDayKey,
        createDefaultState,
        normalizeState,
        calculateSeriesReward,
        applySeriesVictory,
        getRewardedStatus,
        applyRewardedSuccess,
        validate
    });
})();
