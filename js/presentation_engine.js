'use strict';

/* Soul Arena R12 - Battle Presentation Engine. Presentation only: no combat math or winner selection. */
(function () {
    const PRESENTATION_VERSION = 'R34.0.0';
    const ICONS = window.SOUL_ARENA_ICONS || null;
    const icon = (name,size=18) => ICONS?.svg?.(name,{size}) || '';
    const STATE_META = Object.freeze([
        Object.freeze({ key: 'fresh', label: 'Свежий', icon: 'heart', className: 'state-fresh' }),
        Object.freeze({ key: 'wounded', label: 'Ранен', icon: 'heart', className: 'state-wounded' }),
        Object.freeze({ key: 'exhausted', label: 'Истощён', icon: 'heart', className: 'state-exhausted' }),
        Object.freeze({ key: 'near-death', label: 'На грани', icon: 'heart', className: 'state-near-death' }),
        Object.freeze({ key: 'dead', label: 'Мёртв', icon: 'skull', className: 'state-dead' })
    ]);
    const DIFFICULTY_META = Object.freeze({
        'Разгром': Object.freeze({ icon: 'lightning', className: 'difficulty-rout' }),
        'Уверенно': Object.freeze({ icon: 'spark', className: 'difficulty-clear' }),
        'Тяжёлый бой': Object.freeze({ icon: 'swords', className: 'difficulty-hard' }),
        'Очень тяжёлый бой': Object.freeze({ icon: 'flame', className: 'difficulty-very-hard' }),
        'На пределе': Object.freeze({ icon: 'skull', className: 'difficulty-limit' })
    });

    let lastModel = null;

    function clampState(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(4, Math.trunc(n)));
    }

    function stateMeta(value) { return STATE_META[clampState(value)] || STATE_META[0]; }
    function difficultyMeta(label) { return DIFFICULTY_META[label] || Object.freeze({ icon: 'swords', className: 'difficulty-hard' }); }

    function esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function normalizeFactor(rawLabel) {
        const raw = String(rawLabel || '').trim();
        const label = raw.toLowerCase();
        let meta;
        if (label.includes('арен') || label.includes('условия арены')) meta = ['arena', 'Условия арены'];
        else if (label.includes('темп') || label.includes('инициатив') || label.includes('скорост')) meta = ['lightning', 'Скорость и инициатива'];
        else if (label.includes('дистанц') || label.includes('дальн')) meta = ['target', 'Контроль дистанции'];
        else if (label.includes('тактик') || label.includes('техник')) meta = ['brain', 'Тактика и техника'];
        else if (label.includes('состояни') || label.includes('устал') || label.includes('цена техники') || label.includes('физичес')) meta = ['heart', 'Физическое состояние'];
        else if (label.includes('духов')) meta = ['spark', 'Духовное давление'];
        else if (label.includes('особ') || label.includes('hax')) meta = ['prime', 'Особые способности'];
        else if (label.startsWith('r10:') || label.startsWith('verification:') || label.includes('special') || label.includes('matchup')) meta = ['swords', 'Преимущество в противостоянии'];
        else meta = ['swords', 'Преимущество в противостоянии'];
        return Object.freeze({ icon: meta[0], label: meta[1] });
    }

    function impactLabel(amount) {
        const v = Math.abs(Number(amount) || 0);
        if (v >= 7) return 'ключевое';
        if (v >= 3) return 'заметное';
        return 'умеренное';
    }

    function collectFactors(engine, fatigueChangedFreshOutcome) {
        const seen = new Set();
        const factors = [];
        if (fatigueChangedFreshOutcome) {
            seen.add('Физическое состояние');
            factors.push(Object.freeze({ icon: 'heart', label: 'Физическое состояние', impact: 'ключевое' }));
        }
        const reasons = Array.isArray(engine?.reasons) ? engine.reasons : [];
        for (const item of reasons) {
            const normalized = normalizeFactor(item?.label);
            if (seen.has(normalized.label)) continue;
            seen.add(normalized.label);
            factors.push(Object.freeze({ ...normalized, impact: impactLabel(item?.amount) }));
            if (factors.length >= 3) break;
        }
        if (!factors.length) factors.push(Object.freeze({ icon: 'swords', label: 'Общее боевое преимущество', impact: 'ключевое' }));
        return Object.freeze(factors);
    }

    function fighterView(fighter) {
        const form = String(fighter?.form || 'База');
        const isPrime = Boolean(fighter?.isPrime) || form.toLowerCase().includes('прайм');
        return Object.freeze({
            id: Number(fighter?.id || 0),
            name: String(fighter?.name || 'Боец'),
            emoji: '',
            portrait: String(fighter?.portrait || ''),
            form,
            isPrime,
            rating: Number.isFinite(Number(fighter?.rating)) ? Number(fighter.rating) : null,
            entryState: clampState(fighter?.entryState),
            abilityName: isPrime ? String(fighter?.primeAbilityName || 'Прайм-техника') : 'Базовый арсенал',
            abilityDescription: isPrime
                ? String(fighter?.primeAbilityDescription || 'Ключевая техника Прайм-формы.')
                : 'Боец использовал базовую форму без активации Прайм-козыря.'
        });
    }

    function buildBattlePresentation(payload) {
        const a = fighterView(payload?.fighters?.a || {});
        const b = fighterView(payload?.fighters?.b || {});
        const winnerId = Number(payload?.winnerId || 0);
        const winner = winnerId === a.id ? a : b;
        const loser = winnerId === a.id ? b : a;
        const engine = payload?.engine || null;
        const matrix = payload?.matrix || null;
        const fatiguePrimary = Boolean(payload?.fatiguePrimary);
        const difficulty = String((fatiguePrimary ? engine?.difficulty : matrix?.difficulty) || engine?.difficulty || matrix?.difficulty || 'Тяжёлый бой');
        const marginCandidate = fatiguePrimary ? engine?.margin : matrix?.margin;
        const margin = Number.isFinite(Number(marginCandidate)) ? Number(marginCandidate) : (Number.isFinite(Number(engine?.margin)) ? Number(engine.margin) : null);
        const winnerExitState = clampState(payload?.winnerExitState);
        const loserExitState = clampState(payload?.loserExitState ?? 4);
        const factors = collectFactors(engine, Boolean(payload?.fatigueChangedFreshOutcome));
        const arena = Object.freeze({
            name: String(payload?.arena?.publicName || engine?.arena?.publicName || 'Арена'),
            icon: String(payload?.arena?.icon || 'arena'),
            description: String(payload?.arena?.shortDescription || ''),
            mechanic: String(payload?.arena?.mechanicSummary || '')
        });
        const difficultyInfo = difficultyMeta(difficulty);
        const winnerStateInfo = stateMeta(winnerExitState);
        const entryWinner = stateMeta(winner.entryState);
        const entryLoser = stateMeta(loser.entryState);
        const sourceLabel = fatiguePrimary
            ? 'Последовательный бой: учтены накопленные повреждения предыдущих дуэлей.'
            : 'Бой двух свежих бойцов: использован проверенный результат.';
        const fatigueChanged = Boolean(payload?.fatigueChangedFreshOutcome);
        const factorText = factors.map(item => item.label.toLowerCase()).join(', ');
        const fallbackNarrative = `Решающее преимущество ${winner.name} сформировали: ${factorText}. ` +
            `${difficulty === 'Разгром' || difficulty === 'Уверенно' ? 'Победа была относительно чистой.' : `Цена победы оказалась высокой: итоговое состояние — ${winnerStateInfo.label}.`}` +
            (fatigueChanged ? ' Накопленные повреждения изменили исход относительно боя двух свежих соперников.' : '');
        const explanation = window.SOUL_ARENA_BATTLE_EXPLAINER?.buildExplanation?.({
            winner, loser, engine, matrix, fatiguePrimary, fatigueChanged, hardOverrideApplied:Boolean(engine?.hardOverrideApplied || matrix?.hardOverride),
            winnerExitState, loserExitState, difficulty, margin, arena
        }) || null;
        const narrative = explanation?.summary || window.SOUL_ARENA_BATTLE_EXPLAINER?.improveNarrative?.({ winner, loser, engine, fatiguePrimary, fatigueChanged, winnerExitState, difficulty, arena }, fallbackNarrative) || fallbackNarrative;

        return Object.freeze({
            version: PRESENTATION_VERSION,
            round: Number(payload?.round || 0),
            winner, loser, winnerExitState, loserExitState,
            winnerStateInfo, entryWinner, entryLoser,
            difficulty, difficultyInfo, margin,
            factors, arena, narrative, sourceLabel, explanation,
            fatiguePrimary, fatigueChanged,
            hardOverrideApplied: Boolean(engine?.hardOverrideApplied || matrix?.hardOverride),
            engineVersion: String(engine?.engineVersion || ''),
            diagnosticMode: String(payload?.diagnosticMode || '')
        });
    }

    function factorChipsHtml(model) {
        return model.factors.map(item => `<span class="battle-factor-chip"><b>${icon(item.icon,16)}</b><span>${esc(item.label)}</span><small>${esc(item.impact)}</small></span>`).join('');
    }

    function fighterPanelHtml(fighter, isWinner, exitState) {
        const entry = stateMeta(fighter.entryState);
        const exit = stateMeta(exitState);
        const portrait = fighter.portrait ? `<img src="images/${esc(fighter.portrait)}" alt="" loading="lazy" decoding="async">` : `<span class="battle-detail-emoji">${icon('fighter',34)}</span>`;
        return `<article class="battle-detail-fighter ${isWinner ? 'is-winner' : 'is-loser'}">
            <div class="battle-detail-portrait">${portrait}</div>
            <div class="battle-detail-fighter-copy">
                <div class="battle-detail-fighter-top"><strong>${esc(fighter.name)}</strong><span>${esc(fighter.form)}${Number.isFinite(Number(fighter.rating)) ? ` · ${esc(fighter.rating)}` : ''}</span></div>
                <p><b>${esc(fighter.abilityName)}</b> — ${esc(fighter.abilityDescription)}</p>
                <div class="battle-state-path"><span class="${esc(entry.className)}">${icon(entry.icon,14)} ${esc(entry.label)}</span><i>→</i><span class="${esc(exit.className)}">${icon(exit.icon,14)} ${esc(exit.label)}</span></div>
            </div>
        </article>`;
    }

    function explanationHtml(model) {
        const x = model.explanation;
        if (!x) return '';
        const bullets = (x.bullets || []).map(item => `<li><span>${icon('check',15)}</span><p>${esc(item)}</p></li>`).join('');
        return `<section class="battle-detail-section r34-why-section r34-why-${esc(x.type)}">
            <div class="r34-why-head">
                <div class="battle-detail-section-title"><span>${icon(x.icon || 'info',22)}</span><div><b>Почему победил именно сейчас</b><small>${esc(x.typeLabel || 'ПРИЧИНА ИСХОДА')}</small></div></div>
                <button class="r34-example-link" type="button" onclick="closeBattleDetails(); openRulesAt(8)">Примеры</button>
            </div>
            <h4>${esc(x.headline)}</h4>
            <p class="r34-why-summary">${esc(x.summary)}</p>
            <ul class="r34-why-list">${bullets}</ul>
            <div class="r34-why-caution"><b>Не путать с общим рейтингом:</b><span>${esc(x.caution)}</span></div>
        </section>`;
    }

    function renderBattlePresentation(model) {
        lastModel = model;
        const panel = document.getElementById('combat-chronicle-panel');
        const strip = document.getElementById('battle-presentation-strip');
        const btn = document.getElementById('battle-details-btn');
        if (panel) panel.classList.add('has-presentation');
        if (btn) btn.classList.remove('hidden');
        if (strip) {
            strip.classList.remove('hidden');
            strip.innerHTML = `<button class="battle-presentation-main" type="button" onclick="openBattleDetails()" aria-label="Открыть подробный разбор последнего боя">
                <span class="battle-presentation-crown">${icon('trophy',28)}</span>
                <span class="battle-presentation-copy"><strong>${esc(model.winner.name)}</strong><small>Раунд ${esc(model.round)} · ${esc(model.difficulty)}</small></span>
                <span class="battle-presentation-state ${esc(model.winnerStateInfo.className)}">${icon(model.winnerStateInfo.icon,14)} ${esc(model.winnerStateInfo.label)}</span>
                <span class="battle-presentation-arrow">›</span>
            </button>
            <div class="battle-presentation-factors">${factorChipsHtml(model)}</div>`;
        }

        const title = document.getElementById('battle-details-title');
        const body = document.getElementById('battle-details-body');
        if (title) title.textContent = `${model.winner.name} — победа`;
        if (body) {
            body.innerHTML = `<div class="battle-detail-verdict">
                    <div class="battle-detail-verdict-icon">${icon(model.difficultyInfo.icon,30)}</div>
                    <div><span>РАУНД ${esc(model.round)}</span><h3>${esc(model.winner.name)} побеждает</h3><p>${esc(model.narrative)}</p></div>
                    <div class="battle-detail-difficulty ${esc(model.difficultyInfo.className)}"><b>${esc(model.difficulty)}</b></div>
                </div>
                <div class="battle-detail-fighters-grid">
                    ${fighterPanelHtml(model.winner, true, model.winnerExitState)}
                    ${fighterPanelHtml(model.loser, false, model.loserExitState)}
                </div>
                ${explanationHtml(model)}
                <section class="battle-detail-section"><div class="battle-detail-section-title"><span>${icon('target',22)}</span><div><b>Ключевые факторы</b><small>Что вошло в расчёт</small></div></div><div class="battle-detail-factor-grid">${factorChipsHtml(model)}</div></section>
                <section class="battle-detail-section battle-detail-arena"><div class="battle-detail-section-title"><span>${icon(model.arena.icon || 'arena',22)}</span><div><b>${esc(model.arena.name)}</b><small>Влияние арены</small></div></div><p>${esc(model.arena.mechanic || model.arena.description || 'Арена учитывается в расчёте дистанции, техники и темпа боя.')}</p></section>
                <section class="battle-detail-section battle-detail-source"><div class="battle-detail-section-title"><span>${icon('info',22)}</span><div><b>Метод расчёта</b><small>${model.fatigueChanged ? 'Состояние изменило свежий исход' : 'Конкретная форма + состояние + matchup'}</small></div></div><p>${esc(model.sourceLabel)} Рейтинг задаёт стартовую основу; затем применяются состояние, 13 параметров, способности/контры, условия активации и арена.</p></section>`;
        }
        return model;
    }

    function showBattleResult(payload) {
        return renderBattlePresentation(buildBattlePresentation(payload));
    }

    function openBattleDetails() {
        if (!lastModel) return;
        if (window.SOUL_ARENA_UI_SHELL) window.SOUL_ARENA_UI_SHELL.open('battle-details-modal');
        else document.getElementById('battle-details-modal')?.classList.remove('hidden');
    }

    function closeBattleDetails() {
        if (window.SOUL_ARENA_UI_SHELL) window.SOUL_ARENA_UI_SHELL.close('battle-details-modal');
        else document.getElementById('battle-details-modal')?.classList.add('hidden');
    }

    function reset() {
        lastModel = null;
        const panel = document.getElementById('combat-chronicle-panel');
        const strip = document.getElementById('battle-presentation-strip');
        const btn = document.getElementById('battle-details-btn');
        if (panel) panel.classList.remove('has-presentation');
        if (strip) { strip.classList.add('hidden'); strip.innerHTML = ''; }
        if (btn) btn.classList.add('hidden');
        closeBattleDetails();
    }

    window.openBattleDetails = openBattleDetails;
    window.closeBattleDetails = closeBattleDetails;
    window.SOUL_ARENA_PRESENTATION = Object.freeze({
        version: PRESENTATION_VERSION,
        stateMeta,
        build: buildBattlePresentation,
        render: renderBattlePresentation,
        showBattleResult,
        open: openBattleDetails,
        close: closeBattleDetails,
        reset,
        getLast: () => lastModel
    });

})();
