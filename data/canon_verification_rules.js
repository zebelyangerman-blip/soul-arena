/* Soul Arena R30 final combat rating runtime data. */
window.SOUL_ARENA_CANON_VERIFICATION = {
  "schemaVersion": 10,
  "engineVersion": "R10.0.0",
  "canonVersion": "2026-09-02",
  "characterCount": 75,
  "policy": {
    "mode": "NO_ARTIFICIAL_BALANCE",
    "purpose": "Narrow verified pair/form corrections over the deterministic model.",
    "freshPolicy": "Corrections apply to fresh-vs-fresh calibration only.",
    "correctionPolicy": "Pair/form rules only.",
    "uncertaintyPolicy": "Ambiguous scenarios are not forced.",
    "numericMeaning": "Final rating supplies the fresh neutral baseline. Verification rules express only specific pair/form evidence and state constraints."
  },
  "sourceRegistry": {
    "MODEL_CORE": {
      "type": "INTERNAL_MODEL",
      "title": "Verified runtime model"
    }
  },
  "rules": [
    {
      "key": "verify_01",
      "a": 1,
      "b": 10,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateMin": 3,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 22.5,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_02",
      "a": 38,
      "b": 24,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateExact": 0,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 30,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_03",
      "a": 25,
      "b": 42,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerOverride": 25,
      "winnerStateExact": 0,
      "winnerMarginFloor": 24,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 0,
      "legacyCalibrationModifierB": 0,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "verify_04",
      "a": 25,
      "b": 40,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerOverride": 25,
      "winnerStateExact": 0,
      "winnerMarginFloor": 24,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 0,
      "legacyCalibrationModifierB": 0,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "verify_05",
      "a": 25,
      "b": 43,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerOverride": 25,
      "winnerStateExact": 0,
      "winnerMarginFloor": 24,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 0,
      "legacyCalibrationModifierB": 0,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "verify_06",
      "a": 3,
      "b": 26,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Event reversal exception",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "Specific ability-bypass: the lower general rating can reverse an already resolved event in this matchup.",
      "legacyCalibrationModifierA": 18,
      "legacyCalibrationModifierB": 0,
      "winnerOverride": 3,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "verify_07",
      "a": 46,
      "b": 52,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 4,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_08",
      "a": 11,
      "b": 44,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "base"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 12,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_09",
      "a": 11,
      "b": 44,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateMin": 2,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 27,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_10",
      "a": 11,
      "b": 44,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateMin": 2,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 13,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_11",
      "a": 11,
      "b": 12,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateMin": 2,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 14,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_12",
      "a": 13,
      "b": 73,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 25,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_13",
      "a": 2,
      "b": 72,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "winnerStateMin": 2,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 28,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_14",
      "a": 15,
      "b": 54,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 12,
      "legacyCalibrationModifierB": 0
    },
    {
      "key": "verify_15",
      "a": 1,
      "b": 30,
      "forms": {
        "a": [
          "base"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 0,
      "freshOnly": true,
      "label": "Verified pair/form interaction",
      "confidence": "HIGH",
      "evidenceIds": [
        "MODEL_CORE"
      ],
      "notes": "",
      "legacyCalibrationModifierA": 18,
      "legacyCalibrationModifierB": 0
    }
  ],
  "knownLimitations": [
    {
      "key": "limit_01",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_02",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_03",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_04",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_05",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_06",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_07",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    },
    {
      "key": "limit_08",
      "note": "Ambiguous scenario intentionally left without a forced rule."
    }
  ],
  "ratingRevision": "FINAL-2026-09-04"
};
