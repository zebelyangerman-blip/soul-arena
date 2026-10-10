'use strict';

(function initSoulArenaRatingEngine() {
    const ENGINE_VERSION = 'R19.0.0';
    const SCHEMA_VERSION = 1;
    const K_FACTOR = 32;
    const INITIAL_RATING = 800;
    const MIN_RATING = 100;
    const MAX_RATING = 3000;
    const BOT_RATINGS = Object.freeze({
        easy: 800,
        medium: 1100,
        hard: 1400,
        master: 1700
    });
    const DIFFICULTY_LABELS = Object.freeze({
        easy: 'Лёгкий',
        medium: 'Средний',
        hard: 'Сложный',
        master: 'Мастер'
    });

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number(value) || 0));
    }

    function int(value, fallback = 0) {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function defaultDifficultyStats() {
        return { played: 0, wins: 0, losses: 0, bestScoreFor: 0, fewestScoreAgainstInWin: null };
    }

    function createDefaultState() {
        return {
            schemaVersion: SCHEMA_VERSION,
            rating: INITIAL_RATING,
            peakRating: INITIAL_RATING,
            seriesPlayed: 0,
            seriesWins: 0,
            seriesLosses: 0,
            winStreak: 0,
            bestWinStreak: 0,
            byDifficulty: {
                easy: defaultDifficultyStats(),
                medium: defaultDifficultyStats(),
                hard: defaultDifficultyStats(),
                master: defaultDifficultyStats()
            },
            lastResult: null,
            history: []
        };
    }

    function normalizeDifficultyStats(value) {
        const base = defaultDifficultyStats();
        const source = value && typeof value === 'object' ? value : {};
        const wins = Math.max(0, int(source.wins));
        const losses = Math.max(0, int(source.losses));
        return {
            played: Math.max(wins + losses, Math.max(0, int(source.played))),
            wins,
            losses,
            bestScoreFor: clamp(int(source.bestScoreFor), 0, 5),
            fewestScoreAgainstInWin: source.fewestScoreAgainstInWin == null ? null : clamp(int(source.fewestScoreAgainstInWin), 0, 4)
        };
    }

    function normalizeState(value) {
        const base = createDefaultState();
        const source = value && typeof value === 'object' ? value : {};
        const rating = Math.round(clamp(source.rating ?? INITIAL_RATING, MIN_RATING, MAX_RATING));
        const peakRating = Math.max(rating, Math.round(clamp(source.peakRating ?? rating, MIN_RATING, MAX_RATING)));
        const byDifficulty = {};
        for (const id of Object.keys(BOT_RATINGS)) byDifficulty[id] = normalizeDifficultyStats(source.byDifficulty?.[id]);
        const totalWins = Object.values(byDifficulty).reduce((sum, row) => sum + row.wins, 0);
        const totalLosses = Object.values(byDifficulty).reduce((sum, row) => sum + row.losses, 0);
        const history = Array.isArray(source.history) ? source.history.slice(-20).filter(row => row && typeof row === 'object') : [];
        return {
            schemaVersion: SCHEMA_VERSION,
            rating,
            peakRating,
            seriesPlayed: Math.max(totalWins + totalLosses, Math.max(0, int(source.seriesPlayed))),
            seriesWins: Math.max(totalWins, Math.max(0, int(source.seriesWins))),
            seriesLosses: Math.max(totalLosses, Math.max(0, int(source.seriesLosses))),
            winStreak: Math.max(0, int(source.winStreak)),
            bestWinStreak: Math.max(Math.max(0, int(source.winStreak)), Math.max(0, int(source.bestWinStreak))),
            byDifficulty,
            lastResult: source.lastResult && typeof source.lastResult === 'object' ? source.lastResult : null,
            history
        };
    }

    function getBotRating(difficulty) {
        return BOT_RATINGS[difficulty] || BOT_RATINGS.medium;
    }

    function expectedScore(playerRating, botRating) {
        const player = clamp(playerRating, MIN_RATING, MAX_RATING);
        const bot = clamp(botRating, MIN_RATING, MAX_RATING);
        return 1 / (1 + Math.pow(10, (bot - player) / 400));
    }

    function calculateDelta(playerRating, difficulty, won) {
        const botRating = getBotRating(difficulty);
        const expected = expectedScore(playerRating, botRating);
        const actual = won ? 1 : 0;
        const rawDelta = K_FACTOR * (actual - expected);
        const oldRating = Math.round(clamp(playerRating, MIN_RATING, MAX_RATING));
        const unclampedNew = oldRating + Math.round(rawDelta);
        const newRating = Math.round(clamp(unclampedNew, MIN_RATING, MAX_RATING));
        return Object.freeze({
            difficulty,
            botRating,
            expected: Number(expected.toFixed(6)),
            actual,
            rawDelta: Number(rawDelta.toFixed(6)),
            delta: newRating - oldRating,
            oldRating,
            newRating
        });
    }

    function preview(playerRating, difficulty) {
        const win = calculateDelta(playerRating, difficulty, true);
        const loss = calculateDelta(playerRating, difficulty, false);
        return Object.freeze({
            difficulty,
            label: DIFFICULTY_LABELS[difficulty] || difficulty,
            botRating: getBotRating(difficulty),
            winDelta: win.delta,
            lossDelta: loss.delta,
            expectedWinPct: Number((win.expected * 100).toFixed(1))
        });
    }

    function applySeriesResult(value, result = {}) {
        const state = normalizeState(value);
        const difficulty = Object.prototype.hasOwnProperty.call(BOT_RATINGS, result.difficulty) ? result.difficulty : 'medium';
        const won = Boolean(result.won);
        const scoreFor = clamp(int(result.scoreFor), 0, 5);
        const scoreAgainst = clamp(int(result.scoreAgainst), 0, 5);
        const elo = calculateDelta(state.rating, difficulty, won);
        const next = normalizeState(state);
        next.rating = elo.newRating;
        next.peakRating = Math.max(next.peakRating, next.rating);
        next.seriesPlayed += 1;
        if (won) {
            next.seriesWins += 1;
            next.winStreak += 1;
            next.bestWinStreak = Math.max(next.bestWinStreak, next.winStreak);
        } else {
            next.seriesLosses += 1;
            next.winStreak = 0;
        }
        const row = next.byDifficulty[difficulty];
        row.played += 1;
        if (won) row.wins += 1; else row.losses += 1;
        row.bestScoreFor = Math.max(row.bestScoreFor, scoreFor);
        if (won) row.fewestScoreAgainstInWin = row.fewestScoreAgainstInWin == null ? scoreAgainst : Math.min(row.fewestScoreAgainstInWin, scoreAgainst);

        const entry = {
            at: Number.isFinite(Number(result.at)) ? Number(result.at) : Date.now(),
            difficulty,
            botRating: elo.botRating,
            won,
            scoreFor,
            scoreAgainst,
            oldRating: elo.oldRating,
            delta: elo.delta,
            newRating: elo.newRating
        };
        next.lastResult = entry;
        next.history = [...next.history, entry].slice(-20);
        return Object.freeze({ state: Object.freeze(next), result: Object.freeze(entry) });
    }

    function getRank(ratingValue) {
        const rating = Math.round(clamp(ratingValue, MIN_RATING, MAX_RATING));
        if (rating < 900) return Object.freeze({ id: 'rookie', label: 'Новичок', floor: MIN_RATING, next: 900 });
        if (rating < 1100) return Object.freeze({ id: 'fighter', label: 'Боец', floor: 900, next: 1100 });
        if (rating < 1300) return Object.freeze({ id: 'tactician', label: 'Тактик', floor: 1100, next: 1300 });
        if (rating < 1500) return Object.freeze({ id: 'strategist', label: 'Стратег', floor: 1300, next: 1500 });
        if (rating < 1700) return Object.freeze({ id: 'elite', label: 'Элита', floor: 1500, next: 1700 });
        return Object.freeze({ id: 'legend', label: 'Легенда арены', floor: 1700, next: null });
    }

    function validate() {
        const errors = [];
        const ids = Object.keys(BOT_RATINGS);
        if (ids.join(',') !== 'easy,medium,hard,master') errors.push('Unexpected difficulty order');
        if (BOT_RATINGS.easy !== 800 || BOT_RATINGS.medium !== 1100 || BOT_RATINGS.hard !== 1400 || BOT_RATINGS.master !== 1700) errors.push('Bot Elo ratings mismatch');
        const farmCheck = calculateDelta(1400, 'easy', true);
        if (farmCheck.delta > 1) errors.push('Easy bot can be farmed too efficiently at rating 1400');
        return Object.freeze({ ok: errors.length === 0, engineVersion: ENGINE_VERSION, schemaVersion: SCHEMA_VERSION, kFactor: K_FACTOR, initialRating: INITIAL_RATING, botRatings: BOT_RATINGS, errors: Object.freeze(errors) });
    }

    window.SOUL_ARENA_RATING_ENGINE = Object.freeze({
        engineVersion: ENGINE_VERSION,
        schemaVersion: SCHEMA_VERSION,
        kFactor: K_FACTOR,
        initialRating: INITIAL_RATING,
        minRating: MIN_RATING,
        maxRating: MAX_RATING,
        botRatings: BOT_RATINGS,
        difficultyLabels: DIFFICULTY_LABELS,
        createDefaultState,
        normalizeState,
        expectedScore,
        calculateDelta,
        preview,
        applySeriesResult,
        getRank,
        validate
    });
})();
