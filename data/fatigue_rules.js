/* Soul Arena R14 release runtime data. */
window.SOUL_ARENA_FATIGUE_RULES = {
  "schemaVersion": 7,
  "engineVersion": "R7.0.0",
  "canonVersion": "2026-09-02",
  "characterCount": 75,
  "policy": {
    "purpose": "State-aware sequential duel attrition.",
    "numericMeaning": "Internal simulation calibration.",
    "noRecovery": "No automatic recovery between consecutive duels."
  },
  "statNames": [
    "spiritPower",
    "attack",
    "defense",
    "speed",
    "reaction",
    "durability",
    "stamina",
    "range",
    "battleIQ",
    "technique",
    "mobility",
    "specialPotency",
    "specialResistance"
  ],
  "states": [
    {
      "id": 0,
      "key": "FRESH",
      "label": "Свежий",
      "statMultipliers": {
        "spiritPower": 1,
        "attack": 1,
        "defense": 1,
        "speed": 1,
        "reaction": 1,
        "durability": 1,
        "stamina": 1,
        "range": 1,
        "battleIQ": 1,
        "technique": 1,
        "mobility": 1,
        "specialPotency": 1,
        "specialResistance": 1
      },
      "haxReliability": 1,
      "startupPenalty": 0,
      "highCostPenalty": 0,
      "overrideReliability": 1
    },
    {
      "id": 1,
      "key": "WOUNDED",
      "label": "Ранен",
      "statMultipliers": {
        "spiritPower": 0.96,
        "attack": 0.95,
        "defense": 0.91,
        "speed": 0.93,
        "reaction": 0.95,
        "durability": 0.89,
        "stamina": 0.82,
        "range": 0.98,
        "battleIQ": 0.995,
        "technique": 0.97,
        "mobility": 0.92,
        "specialPotency": 0.96,
        "specialResistance": 0.93
      },
      "haxReliability": 0.95,
      "startupPenalty": 0.15,
      "highCostPenalty": 0.6,
      "overrideReliability": 0.95
    },
    {
      "id": 2,
      "key": "EXHAUSTED",
      "label": "Истощен",
      "statMultipliers": {
        "spiritPower": 0.86,
        "attack": 0.84,
        "defense": 0.76,
        "speed": 0.76,
        "reaction": 0.84,
        "durability": 0.7,
        "stamina": 0.52,
        "range": 0.93,
        "battleIQ": 0.98,
        "technique": 0.88,
        "mobility": 0.72,
        "specialPotency": 0.86,
        "specialResistance": 0.78
      },
      "haxReliability": 0.82,
      "startupPenalty": 0.55,
      "highCostPenalty": 2,
      "overrideReliability": 0.78
    },
    {
      "id": 3,
      "key": "NEAR_DEATH",
      "label": "На грани",
      "statMultipliers": {
        "spiritPower": 0.7,
        "attack": 0.72,
        "defense": 0.51,
        "speed": 0.52,
        "reaction": 0.67,
        "durability": 0.45,
        "stamina": 0.26,
        "range": 0.84,
        "battleIQ": 0.94,
        "technique": 0.74,
        "mobility": 0.45,
        "specialPotency": 0.72,
        "specialResistance": 0.58
      },
      "haxReliability": 0.64,
      "startupPenalty": 1,
      "highCostPenalty": 4.5,
      "overrideReliability": 0.45
    },
    {
      "id": 4,
      "key": "DEAD",
      "label": "Мертв",
      "statMultipliers": {
        "spiritPower": 0,
        "attack": 0,
        "defense": 0,
        "speed": 0,
        "reaction": 0,
        "durability": 0,
        "stamina": 0,
        "range": 0,
        "battleIQ": 0,
        "technique": 0,
        "mobility": 0,
        "specialPotency": 0,
        "specialResistance": 0
      },
      "haxReliability": 0,
      "startupPenalty": 99,
      "highCostPenalty": 99,
      "overrideReliability": 0
    }
  ],
  "damageModel": {
    "marginThresholds": [
      24,
      10,
      4,
      0
    ],
    "damageStates": [
      0,
      1,
      2,
      3
    ],
    "lastStandTags": [
      "sacrifice",
      "burst",
      "last-stand"
    ],
    "lastStandCostRelief": 0.65,
    "overrideSuppressStateGap": 2,
    "overrideSuppressAtState": 3
  }
};
