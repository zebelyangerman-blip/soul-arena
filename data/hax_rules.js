/* Soul Arena R30 final combat rating runtime data. */
window.SOUL_ARENA_HAX_RULES = {
  "schemaVersion": 6,
  "engineVersion": "R6.0.0",
  "canonVersion": "2026-09-02",
  "characterCount": 75,
  "policy": {
    "purpose": "Explicit special ability and matchup interaction layer.",
    "assumptions": [
      "1v1 unless a summon is intrinsic to the fighter",
      "No arbitrary pre-fight setup",
      "Only release-model abilities are active"
    ],
    "numericMeaning": "Internal comparative calibration."
  },
  "categoryResistanceStat": {
    "future-control": "specialResistance",
    "future-sight": "specialResistance",
    "perfect-hypnosis": "specialResistance",
    "name-nullification": "specialResistance",
    "concept-rewrite": "specialResistance",
    "decay-field": "specialResistance",
    "time-decay": "specialResistance",
    "lethal-dose": "specialResistance",
    "nerve-control": "specialResistance",
    "reality-creation": "specialResistance",
    "past-insertion": "specialResistance",
    "control": "specialResistance",
    "mental-fear": "specialResistance",
    "visual-fear": "specialResistance",
    "sound-illusion": "specialResistance",
    "sensory-inversion": "specialResistance",
    "event-reversal": "specialResistance",
    "rejection": "specialResistance"
  },
  "profiles": [
    {
      "id": 2,
      "key": "fighter_002",
      "forms": {
        "prime": [
          {
            "key": "mechanic_001",
            "label": "Special technique",
            "category": "environmental",
            "impact": 8,
            "reliability": 0.82,
            "targetRiskBonuses": [
              "extreme-cold",
              "heat"
            ],
            "counterTags": [
              "higher-fire"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 3,
      "key": "fighter_003",
      "forms": {
        "prime": [
          {
            "key": "mechanic_002",
            "label": "Special technique",
            "category": "event-reversal",
            "impact": 10,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "instant-kill-before-reversal"
            ],
            "counterTags": [
              "ability-sealing"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    },
    {
      "id": 4,
      "key": "fighter_004",
      "forms": {
        "base": [
          {
            "key": "mechanic_003",
            "label": "Special technique",
            "category": "rejection",
            "impact": 5,
            "reliability": 0.82,
            "defensive": true,
            "counterTags": [
              "speed-blitz"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ],
        "prime": [
          {
            "key": "mechanic_004",
            "label": "Special technique",
            "category": "rejection",
            "impact": 9,
            "reliability": 0.88,
            "defensive": true,
            "counterTags": [
              "speed-blitz",
              "soul-cost"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    },
    {
      "id": 6,
      "key": "fighter_006",
      "forms": {
        "prime": [
          {
            "key": "mechanic_005",
            "label": "Special technique",
            "category": "restructure",
            "impact": 9,
            "reliability": 0.8,
            "targetRiskBonuses": [
              "no-contact",
              "spatial-counter"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 9,
      "key": "fighter_009",
      "forms": {
        "prime": [
          {
            "key": "mechanic_006",
            "label": "Special technique",
            "category": "extreme-environment",
            "impact": 9,
            "reliability": 0.92,
            "targetRiskBonuses": [
              "higher-fire",
              "heat"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_007",
            "label": "Special technique",
            "category": "one-shot-pressure",
            "impact": 7,
            "reliability": 0.88,
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 10,
      "key": "fighter_010",
      "forms": {
        "base": [
          {
            "key": "mechanic_008",
            "label": "Special technique",
            "category": "rules",
            "impact": 5,
            "reliability": 0.78,
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_009",
            "label": "Special technique",
            "category": "shared-fate",
            "impact": 11,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "one-on-one-ultimate"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 14,
      "key": "fighter_014",
      "forms": {
        "prime": [
          {
            "key": "mechanic_010",
            "label": "Special technique",
            "category": "function-freeze",
            "impact": 9,
            "reliability": 0.8,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "duration"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 15,
      "key": "fighter_015",
      "forms": {
        "base": [
          {
            "key": "mechanic_011",
            "label": "Special technique",
            "category": "biological",
            "impact": 6,
            "reliability": 0.72,
            "targetRiskBonuses": [
              "biological-counter",
              "drug"
            ],
            "counterTags": [
              "speed-blitz",
              "surprise"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_012",
            "label": "Special technique",
            "category": "adaptive",
            "impact": 9,
            "reliability": 0.8,
            "targetRiskBonuses": [
              "biological-counter"
            ],
            "counterTags": [
              "speed-blitz",
              "surprise"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 16,
      "key": "fighter_016",
      "forms": {
        "prime": [
          {
            "key": "mechanic_013",
            "label": "Special technique",
            "category": "temporary-immortality",
            "impact": 10,
            "reliability": 0.95,
            "defensive": true,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "duration",
              "time-limit"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 17,
      "key": "fighter_017",
      "forms": {
        "base": [
          {
            "key": "mechanic_014",
            "label": "Special technique",
            "category": "two-hit-kill",
            "impact": 7,
            "reliability": 0.68,
            "targetRiskBonuses": [
              "no-contact"
            ],
            "counterTags": [
              "higher-spirit",
              "speed"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_015",
            "label": "Special technique",
            "category": "burst",
            "impact": 5,
            "reliability": 0.72,
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 18,
      "key": "fighter_018",
      "forms": {
        "base": [
          {
            "key": "mechanic_016",
            "label": "Special technique",
            "category": "energy-counter",
            "impact": 6,
            "reliability": 0.75,
            "targetRiskBonuses": [
              "energy-counter"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_017",
            "label": "Special technique",
            "category": "energy-counter",
            "impact": 7,
            "reliability": 0.78,
            "targetRiskBonuses": [
              "energy-counter"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 19,
      "key": "fighter_019",
      "forms": {
        "prime": [
          {
            "key": "mechanic_018",
            "label": "Special technique",
            "category": "lethal-poison",
            "impact": 9,
            "reliability": 0.74,
            "targetRiskBonuses": [
              "regeneration-after-poison"
            ],
            "counterTags": [
              "knowledge",
              "speed"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 20,
      "key": "fighter_020",
      "forms": {
        "prime": [
          {
            "key": "mechanic_019",
            "label": "Special technique",
            "category": "sensory-deprivation",
            "impact": 8,
            "reliability": 0.8,
            "targetRiskBonuses": [
              "sensory-hax"
            ],
            "counterTags": [
              "instinct"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 24,
      "key": "fighter_024",
      "forms": {
        "base": [
          {
            "key": "mechanic_020",
            "label": "Special technique",
            "category": "name-nullification",
            "impact": 12,
            "reliability": 0.9,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "conceptual-hax",
              "power-negation"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_021",
            "label": "Special technique",
            "category": "concept-rewrite",
            "impact": 15,
            "reliability": 0.92,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "conceptual-hax",
              "power-negation"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 26,
      "key": "fighter_026",
      "forms": {
        "prime": [
          {
            "key": "mechanic_022",
            "label": "Special technique",
            "category": "reality-trap",
            "impact": 11,
            "reliability": 0.86,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "blood-oath-condition"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 29,
      "key": "fighter_029",
      "forms": {
        "base": [
          {
            "key": "mechanic_023",
            "label": "Special technique",
            "category": "perfect-hypnosis",
            "impact": 10,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "blind/no-release-exposure"
            ],
            "counterTags": [
              "sensory-hax"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_024",
            "label": "Special technique",
            "category": "perfect-hypnosis",
            "impact": 12,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "blind/no-release-exposure"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_025",
            "label": "Special technique",
            "category": "immortality",
            "impact": 9,
            "reliability": 0.94,
            "defensive": true,
            "bypassResistance": true,
            "counterTags": [
              "conceptual-seal"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 33,
      "key": "fighter_033",
      "forms": {
        "base": [
          {
            "key": "mechanic_026",
            "label": "Special technique",
            "category": "time-decay",
            "impact": 7,
            "reliability": 0.82,
            "targetRiskBonuses": [
              "no-contact"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_027",
            "label": "Special technique",
            "category": "decay-field",
            "impact": 12,
            "reliability": 0.9,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "self-decay-field",
              "spatial-counter"
            ],
            "counterTags": [
              "space",
              "barrier"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 35,
      "key": "fighter_035",
      "forms": {
        "prime": [
          {
            "key": "mechanic_028",
            "label": "Special technique",
            "category": "energy-reflection",
            "impact": 5,
            "reliability": 0.76,
            "targetRiskBonuses": [
              "energy-counter"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 38,
      "key": "fighter_038",
      "forms": {
        "base": [
          {
            "key": "mechanic_029",
            "label": "Special technique",
            "category": "future-control",
            "impact": 15,
            "reliability": 0.94,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "future-manipulation",
              "timed-window",
              "still-silver"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_030",
            "label": "Special technique",
            "category": "future-control",
            "impact": 18,
            "reliability": 0.97,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "future-manipulation",
              "timed-window",
              "still-silver"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_031",
            "label": "Special technique",
            "category": "absorption",
            "impact": 7,
            "reliability": 0.82,
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 39,
      "key": "fighter_039",
      "forms": {
        "base": [
          {
            "key": "mechanic_032",
            "label": "Special technique",
            "category": "misfortune-redistribution",
            "impact": 10,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "event-reversal"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_033",
            "label": "Special technique",
            "category": "future-sight",
            "impact": 8,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "time-window"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_034",
            "label": "Special technique",
            "category": "misfortune-redistribution",
            "impact": 10,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "event-reversal"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 40,
      "key": "fighter_040",
      "forms": {
        "base": [
          {
            "key": "mechanic_035",
            "label": "Special technique",
            "category": "growth-effect-growth",
            "impact": 11,
            "reliability": 0.88,
            "defensive": true,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "conceptual-seal"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_036",
            "label": "Special technique",
            "category": "growth-effect-growth",
            "impact": 14,
            "reliability": 0.94,
            "defensive": true,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "conceptual-seal",
              "auswahlen"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_037",
            "label": "Special technique",
            "category": "damage-reflection",
            "impact": 7,
            "reliability": 0.8,
            "targetRiskBonuses": [
              "divine-reflection"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 41,
      "key": "fighter_041",
      "forms": {
        "base": [
          {
            "key": "mechanic_038",
            "label": "Special technique",
            "category": "lethal-dose",
            "impact": 10,
            "reliability": 0.84,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "one-shot"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_039",
            "label": "Special technique",
            "category": "lethal-dose",
            "impact": 13,
            "reliability": 0.9,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "one-shot",
              "no-charge"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 42,
      "key": "fighter_042",
      "forms": {
        "base": [
          {
            "key": "mechanic_040",
            "label": "Special technique",
            "category": "space-pierce",
            "impact": 11,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "barrier"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_041",
            "label": "Special technique",
            "category": "space-pierce",
            "impact": 14,
            "reliability": 0.93,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "barrier",
              "divine-reflection"
            ],
            "notes": ""
          },
          {
            "key": "mechanic_042",
            "label": "Special technique",
            "category": "intangibility",
            "impact": 11,
            "reliability": 0.92,
            "defensive": true,
            "bypassResistance": true,
            "counterTags": [
              "divine-counter",
              "reflection"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 43,
      "key": "fighter_043",
      "forms": {
        "base": [
          {
            "key": "mechanic_043",
            "label": "Special technique",
            "category": "nerve-control",
            "impact": 10,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "biological-counter"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_044",
            "label": "Special technique",
            "category": "nerve-control",
            "impact": 13,
            "reliability": 0.9,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "runaway-regeneration",
              "biological-counter"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 44,
      "key": "fighter_044",
      "forms": {
        "base": [
          {
            "key": "mechanic_045",
            "label": "Special technique",
            "category": "reality-creation",
            "impact": 13,
            "reliability": 0.76,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "mental-instability"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ],
        "prime": [
          {
            "key": "mechanic_046",
            "label": "Special technique",
            "category": "reality-creation",
            "impact": 16,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "mental-instability",
              "self-overload"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    },
    {
      "id": 46,
      "key": "fighter_046",
      "forms": {
        "prime": [
          {
            "key": "mechanic_047",
            "label": "Special technique",
            "category": "matter-bomb",
            "impact": 9,
            "reliability": 0.86,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "physical-rush"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 48,
      "key": "fighter_048",
      "forms": {
        "base": [
          {
            "key": "mechanic_048",
            "label": "Special technique",
            "category": "past-insertion",
            "impact": 8,
            "reliability": 0.72,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "principled-resistance"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ],
        "prime": [
          {
            "key": "mechanic_049",
            "label": "Special technique",
            "category": "past-insertion",
            "impact": 9,
            "reliability": 0.78,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "principled-resistance"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    },
    {
      "id": 52,
      "key": "fighter_052",
      "forms": {
        "base": [
          {
            "key": "mechanic_050",
            "label": "Special technique",
            "category": "sensory-inversion",
            "impact": 8,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "sensory-hax"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ],
        "prime": [
          {
            "key": "mechanic_051",
            "label": "Special technique",
            "category": "sensory-inversion",
            "impact": 9,
            "reliability": 0.86,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "sensory-hax"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    },
    {
      "id": 53,
      "key": "fighter_053",
      "forms": {
        "base": [
          {
            "key": "mechanic_052",
            "label": "Special technique",
            "category": "mental-fear",
            "impact": 8,
            "reliability": 0.82,
            "targetRiskBonuses": [
              "resolve",
              "emotionless-state"
            ],
            "counterTags": [
              "emotionless-state"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_053",
            "label": "Special technique",
            "category": "visual-fear",
            "impact": 11,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "emotionless-state"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 54,
      "key": "fighter_054",
      "forms": {
        "prime": [
          {
            "key": "mechanic_054",
            "label": "Special technique",
            "category": "organ-hax",
            "impact": 9,
            "reliability": 0.76,
            "targetRiskBonuses": [
              "organ-hax"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 55,
      "key": "fighter_055",
      "forms": {
        "prime": [
          {
            "key": "mechanic_055",
            "label": "Special technique",
            "category": "sound-illusion",
            "impact": 10,
            "reliability": 0.78,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "deafness",
              "self-disclosure"
            ],
            "counterTags": [
              "deafness"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 59,
      "key": "fighter_059",
      "forms": {
        "prime": [
          {
            "key": "mechanic_056",
            "label": "Special technique",
            "category": "biological-overdrive",
            "impact": 8,
            "reliability": 0.82,
            "targetRiskBonuses": [
              "runaway-regeneration"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 65,
      "key": "fighter_065",
      "forms": {
        "base": [
          {
            "key": "mechanic_057",
            "label": "Special technique",
            "category": "weight-doubling",
            "impact": 6,
            "reliability": 0.78,
            "targetRiskBonuses": [
              "range"
            ],
            "counterTags": [
              "range",
              "speed"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_058",
            "label": "Special technique",
            "category": "weight-doubling",
            "impact": 7,
            "reliability": 0.82,
            "targetRiskBonuses": [
              "range"
            ],
            "counterTags": [
              "range",
              "speed"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 67,
      "key": "fighter_067",
      "forms": {
        "prime": [
          {
            "key": "mechanic_059",
            "label": "Special technique",
            "category": "divine-reflection",
            "impact": 15,
            "reliability": 0.94,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "divine-reflection",
              "non-divine-target"
            ],
            "notes": "",
            "requiredTargetForms": [
              "prime"
            ],
            "requiredTargetTags": [
              "divine",
              "god-tier"
            ]
          }
        ]
      }
    },
    {
      "id": 69,
      "key": "fighter_069",
      "forms": {
        "prime": [
          {
            "key": "mechanic_060",
            "label": "Special technique",
            "category": "predictive-companion-strikes",
            "impact": 6,
            "reliability": 0.82,
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 72,
      "key": "fighter_072",
      "forms": {
        "prime": [
          {
            "key": "mechanic_061",
            "label": "Special technique",
            "category": "mimic",
            "impact": 6,
            "reliability": 0.72,
            "targetRiskBonuses": [
              "sunlight"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 73,
      "key": "fighter_073",
      "forms": {
        "base": [
          {
            "key": "mechanic_062",
            "label": "Special technique",
            "category": "control",
            "impact": 9,
            "reliability": 0.75,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "no-contact"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": ""
          }
        ],
        "prime": [
          {
            "key": "mechanic_063",
            "label": "Special technique",
            "category": "control",
            "impact": 11,
            "reliability": 0.8,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "no-contact"
            ],
            "counterTags": [
              "speed-blitz"
            ],
            "notes": ""
          }
        ]
      }
    },
    {
      "id": 74,
      "key": "fighter_074",
      "forms": {
        "base": [
          {
            "key": "mechanic_064",
            "label": "Special technique",
            "category": "spatial-counter",
            "impact": 8,
            "reliability": 0.82,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "spatial-counter"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ],
        "prime": [
          {
            "key": "mechanic_065",
            "label": "Special technique",
            "category": "spatial-counter",
            "impact": 10,
            "reliability": 0.88,
            "bypassResistance": true,
            "targetRiskBonuses": [
              "spatial-counter"
            ],
            "notes": "",
            "requiresConsciousActivation": true
          }
        ]
      }
    }
  ],
  "pairInteractions": [
    {
      "key": "pair_001",
      "a": 38,
      "b": 24,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 18,
      "modifierB": 0,
      "winnerOverride": 38,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_002",
      "a": 67,
      "b": 42,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 18,
      "modifierB": -4,
      "confidence": "MODEL",
      "label": "Anti-divine reflection hard counter",
      "notes": "Exceptional pair rule: a low overall rating can still win this specific divine matchup.",
      "winnerOverride": 67,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "pair_003",
      "a": 74,
      "b": 33,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 15,
      "modifierB": -3,
      "confidence": "MODEL",
      "label": "Spatial barrier hard counter",
      "notes": "Exceptional pair rule: spatial containment can turn the decay field back on its user.",
      "winnerOverride": 74,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "pair_004",
      "a": 29,
      "b": 38,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 8,
      "modifierB": 8,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_005",
      "a": 38,
      "b": 1,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 12,
      "modifierB": 0,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_006",
      "a": 38,
      "b": 9,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 12,
      "modifierB": -2,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_007",
      "a": 10,
      "b": 42,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 10,
      "modifierB": 4,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_008",
      "a": 2,
      "b": 53,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 12,
      "modifierB": -2,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_009",
      "a": 16,
      "b": 46,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 13,
      "modifierB": -3,
      "winnerOverride": 16,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_010",
      "a": 46,
      "b": 52,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 10,
      "modifierB": -2,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_011",
      "a": 14,
      "b": 40,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 9,
      "modifierB": 7,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_012",
      "a": 11,
      "b": 40,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 9,
      "confidence": "MODEL",
      "label": "Miracle recovery after catastrophic damage",
      "notes": "Being cut apart is not by itself a guaranteed kill condition; recovery/growth remains active.",
      "hardCounter": false,
      "abilityBypass": false,
      "marginCap": 9.5
    },
    {
      "key": "pair_013",
      "a": 13,
      "b": 40,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 0,
      "modifierB": 6,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_014",
      "a": 41,
      "b": 25,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 10,
      "modifierB": -2,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_015",
      "a": 42,
      "b": 25,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 10,
      "modifierB": -2,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_016",
      "a": 3,
      "b": 39,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 5,
      "modifierB": 6,
      "confidence": "MODEL",
      "label": "Balance counters event reversal",
      "notes": "Specific counter interaction: reflected misfortune can be returned after event reversal.",
      "winnerOverride": 39,
      "hardCounter": true,
      "abilityBypass": true
    },
    {
      "key": "pair_017",
      "a": 59,
      "b": 43,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "prime"
        ]
      },
      "modifierA": 12,
      "modifierB": 3,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_018",
      "a": 48,
      "b": 13,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": -3,
      "modifierB": 8,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_019",
      "a": 29,
      "b": 1,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": -6,
      "modifierB": 3,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_020",
      "a": 17,
      "b": 29,
      "forms": {
        "a": [
          "base",
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": -4,
      "modifierB": 5,
      "confidence": "MODEL",
      "label": "Special interaction",
      "notes": ""
    },
    {
      "key": "pair_021",
      "a": 7,
      "b": 41,
      "forms": {
        "a": [
          "prime"
        ],
        "b": [
          "base",
          "prime"
        ]
      },
      "modifierA": 6,
      "modifierB": 5,
      "confidence": "FINAL_POLICY",
      "label": "Volatile pressure vs adaptive dosage",
      "notes": "Initial rapid pressure variation disrupts adaptation, but adaptation can recover if the target survives; no automatic winner.",
      "dynamicAdaptation": true,
      "hardCounter": false,
      "abilityBypass": false
    }
  ],
  "ratingRevision": "FINAL-2026-09-04"
};
