/* Soul Arena R30 final combat policy. */
window.SOUL_ARENA_FINAL_COMBAT_POLICY = {
  "schemaVersion": 1,
  "version": "R39.0.0",
  "ratingRevision": "FINAL-2026-09-04",
  "purpose": "Final deterministic combat policy. Ratings are general combat strength, not guaranteed win probabilities.",
  "gapBands": {
    "closeMax": 5,
    "hardCounterMax": 11,
    "dominantMin": 12
  },
  "speedBlitz": {
    "reactiveHaxInitiativeGap": 32
  },
  "freshFightPolicy": {
    "close": "0-5: matchup, state-independent profile details and arena may decide.",
    "advantage": "6-11: lower rating may overturn only through an explicit hard counter / ability bypass.",
    "dominant": "12+: ordinary matchup and arena cannot overturn the rating gap; only a curated canonical hard counter / ability bypass may do so."
  },
  "rules": {
    "primeIsNotAutoWin": true,
    "unknownFormBonus": 0,
    "speedBlitzBeforeReactiveHax": true,
    "smallRatingGapDoesNotNegateAbilities": true,
    "regenerationIsNotImmortality": true,
    "infinitePrepDisabled": true,
    "fatigueCanOverrideFreshRatingOrder": true,
    "woundedCannotEraseDominantGapWithoutExplicitCounter": true
  },
  "fatigueGapGuard": {
    "dominantGapMin": 12,
    "protectHigherRatedThroughState": 1,
    "protectedStates": ["FRESH", "WOUNDED"],
    "rule": "For a 12+ rating gap, ordinary fatigue/stat/arena modifiers cannot make the lower-rated fighter win while the higher-rated fighter enters no worse than WOUNDED. An explicit pair-specific hard counter, ability bypass or winner override is required."
  },
  "equalizers": [
    {
      "fighterId": 22,
      "form": "prime",
      "minRatingDisadvantage": 6,
      "maxMargin": 0.85,
      "minWinnerExitState": 3,
      "requiresConsciousActivation": true,
      "label": "Forced mutual attrition",
      "notes": "Exceptional equalization/stalemate mechanic: it can drag a stronger opponent into an exhausting near-stalemate without making fighter_022 generally stronger."
    }
  ],
  "duelRestrictions": [
    {
      "fighterId": 52,
      "form": "prime",
      "rule": "Group-target ultimate is excluded from standard 1v1; duel inversion kit remains active."
    }
  ]
};
