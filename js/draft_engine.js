(() => {
    'use strict';

    const root = typeof window !== 'undefined' ? window : globalThis;
    const RULES = root.SOUL_ARENA_DRAFT_RULES || {};
    const UINT32_RANGE = 0x100000000;

    function freezeCopy(value) {
        if (Array.isArray(value)) return Object.freeze(value.map(freezeCopy));
        if (value && typeof value === 'object') {
            const out = {};
            Object.keys(value).forEach(key => { out[key] = freezeCopy(value[key]); });
            return Object.freeze(out);
        }
        return value;
    }

    function cryptoUint32() {
        const cryptoObj = root.crypto;
        if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') return null;
        const buffer = new Uint32Array(1);
        cryptoObj.getRandomValues(buffer);
        return buffer[0];
    }

    function randomUnit(rng) {
        if (typeof rng === 'function') {
            const value = Number(rng());
            if (!Number.isFinite(value) || value < 0 || value >= 1) {
                throw new Error(`Injected RNG must return a finite value in [0,1), got ${value}`);
            }
            return value;
        }
        const value = cryptoUint32();
        if (value !== null) return value / UINT32_RANGE;
        return Math.random();
    }

    function randomIntInclusive(min, max, rng) {
        min = Math.ceil(Number(min));
        max = Math.floor(Number(max));
        if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
            throw new Error(`Invalid integer range: ${min}..${max}`);
        }
        const span = max - min + 1;
        if (typeof rng === 'function') return min + Math.floor(randomUnit(rng) * span);

        const cryptoObj = root.crypto;
        if (cryptoObj && typeof cryptoObj.getRandomValues === 'function' && span <= UINT32_RANGE) {
            const limit = UINT32_RANGE - (UINT32_RANGE % span);
            let value;
            do { value = cryptoUint32(); } while (value >= limit);
            return min + (value % span);
        }
        return min + Math.floor(Math.random() * span);
    }

    function getCharacterWeight(characterOrTier) {
        if (characterOrTier && typeof characterOrTier === 'object') {
            const runtimeWeight = Number(characterOrTier.draftWeight);
            if (Number.isFinite(runtimeWeight) && runtimeWeight > 0) return runtimeWeight;
            const schemaWeight = Number(characterOrTier?.draft?.weight);
            if (Number.isFinite(schemaWeight) && schemaWeight > 0) return schemaWeight;
        }
        const tier = Number(characterOrTier);
        const configured = Number(RULES?.sampling?.tierWeights?.[String(tier)]);
        if (Number.isFinite(configured) && configured > 0) return configured;
        throw new Error(`No valid draft weight for tier/character: ${tier}`);
    }

    function generateDraftSequence(roster, count = Number(RULES.drawCount || 10), rng) {
        if (!Array.isArray(roster)) throw new Error('Roster must be an array');
        count = Math.floor(Number(count));
        if (!Number.isFinite(count) || count < 0 || count > roster.length) {
            throw new Error(`Invalid draft count ${count} for roster size ${roster.length}`);
        }

        const available = roster.slice();
        const sequence = [];
        for (let draw = 0; draw < count; draw++) {
            const weights = available.map(getCharacterWeight);
            const halfStepTickets = weights.map(weight => weight * 2);
            const canUseExactTickets = halfStepTickets.every(value => Number.isInteger(value) && value > 0);
            let chosenIndex = available.length - 1;

            if (canUseExactTickets) {
                const totalTickets = halfStepTickets.reduce((sum, value) => sum + value, 0);
                let ticket = randomIntInclusive(1, totalTickets, rng);
                for (let i = 0; i < halfStepTickets.length; i++) {
                    ticket -= halfStepTickets[i];
                    if (ticket <= 0) { chosenIndex = i; break; }
                }
            } else {
                const totalWeight = weights.reduce((sum, value) => sum + value, 0);
                if (!(totalWeight > 0)) throw new Error('Draft pool has no positive total weight');
                let needle = randomUnit(rng) * totalWeight;
                for (let i = 0; i < weights.length; i++) {
                    needle -= weights[i];
                    if (needle <= 0) { chosenIndex = i; break; }
                }
            }

            sequence.push(available[chosenIndex]);
            available.splice(chosenIndex, 1);
        }
        return sequence;
    }

    function rollPrimeCount(rng) {
        return randomIntInclusive(Number(RULES?.prime?.min || 1), Number(RULES?.prime?.max || 5), rng);
    }

    function rollD6(rng) {
        return randomIntInclusive(1, Number(RULES?.initiative?.dieSides || 6), rng);
    }

    function pickArenaIndex(arenaCount, rng) {
        arenaCount = Math.floor(Number(arenaCount));
        if (arenaCount < 1) throw new Error('arenaCount must be >= 1');
        return randomIntInclusive(0, arenaCount - 1, rng);
    }

    function validateRoster(roster) {
        const errors = [];
        const warnings = [];
        const ids = new Set();
        const keys = new Set();
        const expectedRosterSize = Number(RULES.rosterSize || 75);
        const expectedDrawCount = Number(RULES.drawCount || 10);
        const expectedTeamSize = Number(RULES.teamSize || 5);

        if (!Array.isArray(roster)) errors.push('Roster is not an array');
        else {
            if (roster.length !== expectedRosterSize) errors.push(`Expected roster size ${expectedRosterSize}, got ${roster.length}`);
            roster.forEach((char, index) => {
                const id = Number(char?.id);
                const key = String(char?.key || '');
                if (!Number.isFinite(id)) errors.push(`Invalid id at roster index ${index}`);
                else if (ids.has(id)) errors.push(`Duplicate id ${id}`);
                else ids.add(id);
                if (!key) errors.push(`Missing key at roster index ${index}`);
                else if (keys.has(key)) errors.push(`Duplicate key ${key}`);
                else keys.add(key);

                const tier = Number(char?.tier ?? char?.classification?.tier);
                let weight;
                try { weight = getCharacterWeight(char); }
                catch (error) { errors.push(`${key || index}: ${error.message}`); return; }
                const expected = Number(RULES?.sampling?.tierWeights?.[String(tier)]);
                if (!Number.isFinite(expected)) errors.push(`${key}: tier ${tier} has no configured weight`);
                else if (Math.abs(weight - expected) > 1e-12) errors.push(`${key}: draft weight ${weight} differs from Pure Canon tier weight ${expected}`);
            });
        }

        if (expectedDrawCount !== expectedTeamSize * 2) errors.push(`drawCount ${expectedDrawCount} must equal two teams x ${expectedTeamSize}`);
        if (RULES?.sampling?.method !== 'weighted_without_replacement') errors.push(`Unexpected sampling method: ${RULES?.sampling?.method}`);
        if (RULES?.prime?.distribution !== 'uniform_independent') errors.push(`Unexpected Prime distribution: ${RULES?.prime?.distribution}`);
        if (RULES?.prime?.equalizeBetweenPlayers !== false) errors.push('Prime-token equalization must be disabled');

        const balance = RULES?.balance || {};
        const forbiddenEnabled = Object.entries(balance).filter(([key, value]) => key !== 'enabled' && value === true).map(([key]) => key);
        if (balance.enabled !== false) errors.push('Team balancing must be globally disabled');
        if (forbiddenEnabled.length) errors.push(`Forbidden balancing flags enabled: ${forbiddenEnabled.join(', ')}`);

        const tierCounts = {};
        const tierWeightTotals = {};
        if (Array.isArray(roster)) {
            roster.forEach(char => {
                const tier = String(Number(char?.tier ?? char?.classification?.tier));
                tierCounts[tier] = (tierCounts[tier] || 0) + 1;
                tierWeightTotals[tier] = (tierWeightTotals[tier] || 0) + getCharacterWeight(char);
            });
        }
        const totalWeight = Object.values(tierWeightTotals).reduce((sum, value) => sum + Number(value || 0), 0);
        const firstDrawTierProbability = {};
        Object.keys(tierWeightTotals).forEach(tier => {
            firstDrawTierProbability[tier] = totalWeight > 0 ? tierWeightTotals[tier] / totalWeight : 0;
        });

        return freezeCopy({
            ok: errors.length === 0,
            engineVersion: String(RULES.engineVersion || ''),
            mode: String(RULES.mode || ''),
            rosterSize: Array.isArray(roster) ? roster.length : 0,
            drawCount: expectedDrawCount,
            teamSize: expectedTeamSize,
            totalWeight,
            tierCounts,
            tierWeightTotals,
            firstDrawTierProbability,
            errors,
            warnings
        });
    }

    root.PureCanonDraft = Object.freeze({
        version: String(RULES.engineVersion || 'R11.0.0'),
        mode: String(RULES.mode || 'PURE_CANON'),
        rules: freezeCopy(RULES),
        randomUnit,
        randomIntInclusive,
        getCharacterWeight,
        generateDraftSequence,
        rollPrimeCount,
        rollD6,
        pickArenaIndex,
        validateRoster
    });
})();
