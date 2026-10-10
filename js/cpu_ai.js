'use strict';

/* Arena Dush R18 - fair offline CPU opponents.
   The AI is intentionally a pure decision layer: callers pass only information
   that is visible/legitimate at the current decision point. It never receives
   the hidden future draft queue, altered RNG, private opponent choices or
   artificial stat bonuses. */
(function () {
    const ENGINE_VERSION = 'R31.0.0';
    const CPU_PLAYER = 2;
    const STATE_MULTIPLIERS = Object.freeze([1, 0.85, 0.65, 0.45, 0]);
    // R31: difficulty changes decision quality only. Visual thinking time is deliberately
    // identical for every CPU level so Easy never feels instant and Master never feels artificial.
    const UNIVERSAL_THINK_RANGE = Object.freeze({ min: 850, max: 1150 });
    const DIFFICULTIES = Object.freeze({
        easy: Object.freeze({ id: 'easy', label: 'Лёгкий', roman: 'Ⅰ', thinkMin: UNIVERSAL_THINK_RANGE.min, thinkMax: UNIVERSAL_THINK_RANGE.max, description: 'Часто выбирает простое решение и намеренно допускает ошибки.' }),
        medium: Object.freeze({ id: 'medium', label: 'Средний', roman: 'Ⅱ', thinkMin: UNIVERSAL_THINK_RANGE.min, thinkMax: UNIVERSAL_THINK_RANGE.max, description: 'Оценивает силу карт, Прайм и базовые контры.' }),
        hard: Object.freeze({ id: 'hard', label: 'Сложный', roman: 'Ⅲ', thinkMin: UNIVERSAL_THINK_RANGE.min, thinkMax: UNIVERSAL_THINK_RANGE.max, description: 'Учитывает Прайм, состояние, арену и порядок команды.' }),
        master: Object.freeze({ id: 'master', label: 'Мастер', roman: 'Ⅳ', thinkMin: UNIVERSAL_THINK_RANGE.min, thinkMax: UNIVERSAL_THINK_RANGE.max, description: 'Использует почти всю открытую боевую модель и minimax-контрпики.' })
    });

    function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
    function getDifficulty(id) { return DIFFICULTIES[id] || DIFFICULTIES.medium; }
    function stateMultiplier(state) { return STATE_MULTIPLIERS[clamp(Math.floor(state || 0), 0, 4)] ?? 1; }
    function random01(random) { try { return clamp((random || Math.random)(), 0, 0.999999999); } catch (_) { return Math.random(); } }
    function randomIndex(length, random) { return length > 0 ? Math.floor(random01(random) * length) : -1; }
    function stableId(character) { return Number(character?.id || 0); }
    function formName(character) { return character?.isPrime ? 'Прайм' : 'База'; }
    function effectivePower(character, forcePrime = null) {
        if (!character) return 0;
        const prime = forcePrime == null ? Boolean(character.isPrime) : Boolean(forcePrime);
        const raw = Number(prime ? character.primePower : character.basePower) || 0;
        return raw * stateMultiplier(character.state);
    }
    function primeGain(character) { return Math.max(0, (Number(character?.primePower) || 0) - (Number(character?.basePower) || 0)); }
    function tierStrength(character) {
        const tier = Number(character?.tier);
        if (!Number.isFinite(tier)) return 0;
        return clamp((5 - tier) * 1.25, 0, 9);
    }
    function basicQuality(character) {
        if (!character) return -999;
        return effectivePower(character, false) * 0.72 + (Number(character.primePower) || 0) * 0.18 + primeGain(character) * 0.18 + tierStrength(character);
    }
    function living(team) { return (Array.isArray(team) ? team : []).filter(c => c && Number(c.state || 0) < 4); }
    function teamAverage(team) {
        const list = living(team);
        if (!list.length) return 0;
        return list.reduce((sum, c) => sum + basicQuality(c), 0) / list.length;
    }
    function diversityBonus(card, team) {
        if (!card) return 0;
        const list = Array.isArray(team) ? team : [];
        const sameType = list.filter(c => c?.type === card.type).length;
        const sameFaction = list.filter(c => c?.faction === card.faction).length;
        return clamp(3.4 - sameType * 1.15 - sameFaction * 0.35, -2.5, 3.4);
    }
    function safeEval(evaluateDuel, own, ownForm, opp, oppForm, arena) {
        if (typeof evaluateDuel !== 'function' || !own || !opp) return null;
        try {
            return evaluateDuel(own, ownForm, opp, oppForm, {
                stateA: Number(own.state || 0),
                stateB: Number(opp.state || 0),
                arena
            }) || null;
        } catch (_) { return null; }
    }
    function duelUtility(result, ownId) {
        if (!result) return 0;
        const won = Number(result.winnerId) === Number(ownId);
        const margin = clamp(Math.abs(Number(result.margin) || 0), 0, 50);
        const survivorState = clamp(Number(result.winnerProjectedExitState) || 0, 0, 3);
        if (won) return 100 + margin * 1.25 - survivorState * 8;
        // Losing can still have strategic value if the counter survives badly wounded.
        return -100 - margin * 0.8 + survivorState * 5;
    }
    function simpleMatchupUtility(own, opponent, forcePrime = null) {
        if (!own || !opponent) return 0;
        const gap = effectivePower(own, forcePrime) - effectivePower(opponent, null);
        return gap * 1.4 + (tierStrength(own) - tierStrength(opponent)) * 1.6;
    }
    function exactAverageUtility(card, opponents, arenas, evaluateDuel, forcePrime) {
        const opps = living(opponents);
        if (!opps.length || typeof evaluateDuel !== 'function') return basicQuality(card);
        const arenaList = Array.isArray(arenas) && arenas.length ? arenas : [null];
        let total = 0, count = 0;
        for (const opponent of opps) {
            for (const arena of arenaList) {
                const result = safeEval(evaluateDuel, card, forcePrime ? 'Прайм' : 'База', opponent, formName(opponent), arena);
                if (result) { total += duelUtility(result, card.id); count++; }
            }
        }
        return count ? total / count : basicQuality(card);
    }

    function thinkDelay(_difficultyId, random) {
        return Math.round(UNIVERSAL_THINK_RANGE.min + (UNIVERSAL_THINK_RANGE.max - UNIVERSAL_THINK_RANGE.min) * random01(random));
    }

    function chooseDraftAction(context = {}) {
        const difficulty = getDifficulty(context.difficulty);
        const card = context.card || null;
        const ownTeam = Array.isArray(context.ownTeam) ? context.ownTeam : [];
        const opponentTeam = Array.isArray(context.opponentTeam) ? context.opponentTeam : [];
        const random = context.random;
        if (!card) return Object.freeze({ action: 'pass', confidence: 0, reason: 'Нет открытой карты.' });
        if (ownTeam.length >= 5) return Object.freeze({ action: 'pass', confidence: 1, reason: 'Команда ИИ уже заполнена.' });
        if (opponentTeam.length >= 5) return Object.freeze({ action: 'keep', confidence: 1, reason: 'Команда соперника уже заполнена.' });

        const quality = basicQuality(card);
        const ownAvg = teamAverage(ownTeam);
        const oppAvg = teamAverage(opponentTeam);
        const fit = diversityBonus(card, ownTeam);
        let score = quality + fit - 50;
        let reason = 'Оценка текущей открытой карты.';

        if (difficulty.id === 'easy') {
            // Deliberate imperfection: weak relation to quality plus a large random component.
            const keepChance = clamp(0.48 + (quality - 52) / 150, 0.28, 0.72);
            const action = random01(random) < keepChance ? 'keep' : 'pass';
            return Object.freeze({ action, confidence: 0.3, score: Number(score.toFixed(3)), reason: 'Лёгкий ИИ использует простую оценку и часто ошибается.' });
        }

        if (difficulty.id === 'medium') {
            score += (oppAvg - ownAvg) * 0.10;
            // Moderate controlled noise keeps this level beatable without changing game RNG.
            score += (random01(random) - 0.5) * 12;
            const action = score >= 0 ? 'keep' : 'pass';
            return Object.freeze({ action, confidence: clamp(Math.abs(score) / 28, 0.4, 0.82), score: Number(score.toFixed(3)), reason: 'Средний ИИ сравнил силу карты и текущую силу команд.' });
        }

        const arenas = Array.isArray(context.arenaIds) ? context.arenaIds : [];
        const evaluator = context.evaluateDuel;
        if (difficulty.id === 'hard') {
            let matchup = 0;
            const opps = living(opponentTeam);
            if (opps.length) matchup = opps.reduce((s, o) => s + simpleMatchupUtility(card, o, false), 0) / opps.length;
            score += matchup * 0.16 + primeGain(card) * 0.16 + (oppAvg - ownAvg) * 0.12;
            const action = score >= -1 ? 'keep' : 'pass';
            return Object.freeze({ action, confidence: clamp(Math.abs(score) / 24, 0.55, 0.93), score: Number(score.toFixed(3)), reason: 'Сложный ИИ учёл состав, базовые контры и ценность будущего Прайма.' });
        }

        // Master: exact engine evaluation is averaged only across already visible enemy cards
        // and all possible arenas (the arena has not been rolled yet). No future draft cards are visible.
        const baseExact = exactAverageUtility(card, opponentTeam, arenas, evaluator, false);
        const primeExact = exactAverageUtility(card, opponentTeam, arenas, evaluator, true);
        const ownStrategic = baseExact * 0.42 + primeExact * 0.58;
        let opponentThreat = basicQuality(card);
        if (ownTeam.length && typeof evaluator === 'function') {
            // Evaluate how dangerous this card would be if gifted to the opponent, using only current public roster.
            let threatTotal = 0, threatCount = 0;
            for (const ours of living(ownTeam)) {
                for (const arena of (arenas.length ? arenas : [null])) {
                    const r = safeEval(evaluator, card, 'База', ours, formName(ours), arena);
                    if (r) { threatTotal += duelUtility(r, card.id); threatCount++; }
                }
            }
            if (threatCount) opponentThreat = threatTotal / threatCount;
        }
        score = ownStrategic * 0.58 + opponentThreat * 0.22 + quality * 0.20 + fit - 8;
        const action = score >= 0 ? 'keep' : 'pass';
        return Object.freeze({ action, confidence: clamp(Math.abs(score) / 85, 0.66, 0.99), score: Number(score.toFixed(3)), reason: 'Мастер оценил открытую карту через Combat Engine против уже известных бойцов и без просмотра будущего драфта.' });
    }

    function choosePrimeTargets(context = {}) {
        const difficulty = getDifficulty(context.difficulty);
        const team = living(context.team);
        const count = clamp(Math.floor(context.count || 0), 0, team.length);
        const random = context.random;
        if (!count) return Object.freeze([]);
        if (count >= team.length) return Object.freeze(team.map(c => stableId(c)));

        let ranked;
        if (difficulty.id === 'easy') {
            ranked = [...team];
            for (let i = ranked.length - 1; i > 0; i--) {
                const j = randomIndex(i + 1, random);
                [ranked[i], ranked[j]] = [ranked[j], ranked[i]];
            }
        } else if (difficulty.id === 'medium') {
            ranked = [...team].sort((a, b) => (primeGain(b) + basicQuality(b) * 0.10) - (primeGain(a) + basicQuality(a) * 0.10) || stableId(a) - stableId(b));
        } else if (difficulty.id === 'hard') {
            const opps = living(context.opponentTeam);
            ranked = [...team].sort((a, b) => {
                const scoreFor = c => {
                    const match = opps.length ? opps.reduce((s, o) => s + (simpleMatchupUtility(c, o, true) - simpleMatchupUtility(c, o, false)), 0) / opps.length : 0;
                    return primeGain(c) * 1.15 + match * 0.22 + basicQuality(c) * 0.08;
                };
                return scoreFor(b) - scoreFor(a) || stableId(a) - stableId(b);
            });
        } else {
            const arenas = Array.isArray(context.arenaIds) ? context.arenaIds : [];
            const evaluator = context.evaluateDuel;
            ranked = [...team].map(c => {
                const before = exactAverageUtility(c, context.opponentTeam, arenas, evaluator, false);
                const after = exactAverageUtility(c, context.opponentTeam, arenas, evaluator, true);
                return { c, score: (after - before) + primeGain(c) * 0.35 };
            }).sort((a, b) => b.score - a.score || stableId(a.c) - stableId(b.c)).map(x => x.c);
        }
        return Object.freeze(ranked.slice(0, count).map(c => stableId(c)));
    }

    function chooseBattleFighter(context = {}) {
        const difficulty = getDifficulty(context.difficulty);
        const own = living(context.ownTeam);
        const opponents = living(context.opponentTeam);
        const opponentLocked = context.opponentLocked && Number(context.opponentLocked.state || 0) < 4 ? context.opponentLocked : null;
        const random = context.random;
        if (!own.length) return Object.freeze({ fighterId: null, confidence: 0, reason: 'Нет живых бойцов.' });
        if (own.length === 1) return Object.freeze({ fighterId: stableId(own[0]), confidence: 1, reason: 'Остался один боец.' });

        if (difficulty.id === 'easy') {
            const pick = own[randomIndex(own.length, random)] || own[0];
            return Object.freeze({ fighterId: stableId(pick), confidence: 0.28, reason: 'Лёгкий ИИ выбирает с большой долей ошибки.' });
        }

        if (difficulty.id === 'medium') {
            let ranked = [...own].map(c => {
                let score = effectivePower(c, null) + tierStrength(c) * 1.2;
                if (opponentLocked) score += simpleMatchupUtility(c, opponentLocked, null) * 0.55;
                score -= Number(c.state || 0) * 5;
                return { c, score };
            });
            ranked.sort((a, b) => b.score - a.score || stableId(a.c) - stableId(b.c));
            // Small chance to pick the second-best option to keep Medium human-beatable.
            const pickIndex = ranked.length > 1 && random01(random) < 0.16 ? 1 : 0;
            return Object.freeze({ fighterId: stableId(ranked[pickIndex].c), confidence: pickIndex ? 0.58 : 0.76, score: Number(ranked[pickIndex].score.toFixed(3)), reason: 'Средний ИИ использует силу формы, состояние и базовый контрпик.' });
        }

        const evaluator = context.evaluateDuel;
        const arena = context.arena || null;
        function exactScore(candidate, opponent) {
            const r = safeEval(evaluator, candidate, formName(candidate), opponent, formName(opponent), arena);
            return r ? duelUtility(r, candidate.id) : simpleMatchupUtility(candidate, opponent, null);
        }

        if (difficulty.id === 'hard') {
            const ranked = own.map(c => {
                let score;
                if (opponentLocked) score = exactScore(c, opponentLocked);
                else if (opponents.length) {
                    const vals = opponents.map(o => exactScore(c, o));
                    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
                    const worst = Math.min(...vals);
                    score = avg * 0.7 + worst * 0.3;
                } else score = effectivePower(c, null);
                score -= Number(c.state || 0) * 4;
                return { c, score };
            }).sort((a, b) => b.score - a.score || stableId(a.c) - stableId(b.c));
            return Object.freeze({ fighterId: stableId(ranked[0].c), confidence: 0.9, score: Number(ranked[0].score.toFixed(3)), reason: 'Сложный ИИ применил Combat Engine с текущей ареной и состоянием бойцов.' });
        }

        // Master exact response or minimax first placement. All opponent candidates are public roster data.
        const ranked = own.map(c => {
            let values = [];
            if (opponentLocked) values = [exactScore(c, opponentLocked)];
            else values = opponents.length ? opponents.map(o => exactScore(c, o)) : [effectivePower(c, null)];
            const worst = Math.min(...values);
            const avg = values.reduce((s, v) => s + v, 0) / values.length;
            const best = Math.max(...values);
            // Minimax dominates when placing first; when counter-picking there is only one value.
            const score = opponentLocked ? avg : worst * 0.72 + avg * 0.23 + best * 0.05 - Number(c.state || 0) * 2.5;
            return { c, score, worst, avg };
        }).sort((a, b) => b.score - a.score || b.worst - a.worst || stableId(a.c) - stableId(b.c));
        return Object.freeze({ fighterId: stableId(ranked[0].c), confidence: 0.98, score: Number(ranked[0].score.toFixed(3)), reason: opponentLocked ? 'Мастер выбрал точный контрпик по полной открытой боевой модели.' : 'Мастер использовал minimax по всем живым открытым контрпикам соперника.' });
    }

    function validate() {
        const errors = [];
        if (Object.keys(DIFFICULTIES).length !== 4) errors.push('Expected exactly four CPU difficulties');
        for (const id of ['easy', 'medium', 'hard', 'master']) if (!DIFFICULTIES[id]) errors.push(`Missing difficulty: ${id}`);
        return Object.freeze({ ok: errors.length === 0, engineVersion: ENGINE_VERSION, cpuPlayer: CPU_PLAYER, difficulties: Object.freeze(Object.keys(DIFFICULTIES)), errors: Object.freeze(errors) });
    }

    window.SOUL_ARENA_CPU_AI = Object.freeze({
        engineVersion: ENGINE_VERSION,
        cpuPlayer: CPU_PLAYER,
        policy: Object.freeze({
            noHiddenInformation: true,
            noFutureDraftPoolAccess: true,
            noOpponentPrivateChoiceAccess: true,
            noStatBonuses: true,
            noRngManipulation: true,
            usesOnlyCurrentOpenCardDuringDraft: true,
            publicRosterAnalysisAllowed: true,
            visualThinkTimingIndependentOfDifficulty: true
        }),
        difficulties: DIFFICULTIES,
        getDifficulty,
        thinkDelay,
        chooseDraftAction,
        choosePrimeTargets,
        chooseBattleFighter,
        validate
    });
})();
