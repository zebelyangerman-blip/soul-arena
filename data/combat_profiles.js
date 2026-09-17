/* Soul Arena R30 final combat rating runtime data. */
window.SOUL_ARENA_COMBAT_PROFILES = {
  "schemaVersion": 5,
  "engineVersion": "R8.0.0",
  "rosterVersion": "R14-RELEASE",
  "canonVersion": "2026-09-02",
  "characterCount": 75,
  "policy": {
    "purpose": "Multi-parameter deterministic combat foundation.",
    "fallback": "Runtime engine is active for dynamic state resolution.",
    "hardHax": "Explicit special-matchup layer.",
    "fatigue": "State-aware fatigue layer.",
    "arenas": "Deterministic arena layer.",
    "numericMeaning": "Final Base/Prime rating is the fresh neutral baseline; 13-stat vectors supply matchup, arena and fatigue texture rather than replacing that baseline."
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
  "weights": {
    "spiritPower": 0.11,
    "attack": 0.12,
    "defense": 0.08,
    "speed": 0.1,
    "reaction": 0.1,
    "durability": 0.08,
    "stamina": 0.07,
    "range": 0.05,
    "battleIQ": 0.1,
    "technique": 0.08,
    "mobility": 0.04,
    "specialPotency": 0.04,
    "specialResistance": 0.03
  },
  "fatigueMultipliers": [
    1,
    0.85,
    0.65,
    0.45,
    0
  ],
  "profiles": [
    {
      "id": 1,
      "key": "fighter_001",
      "canonProfileKey": "fighter_001",
      "publicName": "Алый Жнец",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 92,
          "stats": {
            "spiritPower": 90,
            "attack": 96,
            "defense": 78,
            "speed": 92,
            "reaction": 85,
            "durability": 85,
            "stamina": 81,
            "range": 62,
            "battleIQ": 77,
            "technique": 84,
            "mobility": 81,
            "specialPotency": 54,
            "specialResistance": 71
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "burst",
            "melee",
            "speed",
            "hybrid",
            "spirit",
            "anti-barrier"
          ],
          "risks": [
            "future-manipulation",
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 99,
          "stats": {
            "spiritPower": 100,
            "attack": 100,
            "defense": 95,
            "speed": 100,
            "reaction": 100,
            "durability": 100,
            "stamina": 97,
            "range": 74,
            "battleIQ": 94,
            "technique": 100,
            "mobility": 100,
            "specialPotency": 71,
            "specialResistance": 90
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "burst",
            "melee",
            "speed",
            "hybrid",
            "spirit",
            "anti-barrier"
          ],
          "risks": [
            "future-manipulation",
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 2,
      "key": "fighter_002",
      "canonProfileKey": "fighter_002",
      "publicName": "Дева Ледяной Бездны",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 68,
          "stats": {
            "spiritPower": 54,
            "attack": 52,
            "defense": 46,
            "speed": 47,
            "reaction": 50,
            "durability": 46,
            "stamina": 43,
            "range": 55,
            "battleIQ": 45,
            "technique": 64,
            "mobility": 44,
            "specialPotency": 40,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ice",
            "aoe",
            "hax",
            "precision"
          ],
          "risks": [
            "heat",
            "self-damage"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 81,
          "stats": {
            "spiritPower": 74,
            "attack": 73,
            "defense": 63,
            "speed": 64,
            "reaction": 69,
            "durability": 62,
            "stamina": 57,
            "range": 77,
            "battleIQ": 62,
            "technique": 89,
            "mobility": 61,
            "specialPotency": 64,
            "specialResistance": 55
          },
          "activation": {
            "startup": 0,
            "selfCost": 2
          },
          "tags": [
            "ice",
            "aoe",
            "hax",
            "precision"
          ],
          "risks": [
            "heat",
            "self-damage"
          ]
        }
      }
    },
    {
      "id": 3,
      "key": "fighter_003",
      "canonProfileKey": "fighter_003",
      "publicName": "Стрелок Звездного Ордена",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 79,
          "stats": {
            "spiritPower": 66,
            "attack": 62,
            "defense": 63,
            "speed": 66,
            "reaction": 72,
            "durability": 62,
            "stamina": 64,
            "range": 72,
            "battleIQ": 67,
            "technique": 78,
            "mobility": 62,
            "specialPotency": 69,
            "specialResistance": 61
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "counter",
            "event-reversal",
            "precision",
            "astral"
          ],
          "risks": [
            "instant-kill-before-reversal",
            "ability-sealing"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 91,
          "stats": {
            "spiritPower": 83,
            "attack": 80,
            "defense": 80,
            "speed": 81,
            "reaction": 91,
            "durability": 79,
            "stamina": 81,
            "range": 96,
            "battleIQ": 86,
            "technique": 98,
            "mobility": 79,
            "specialPotency": 92,
            "specialResistance": 82
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "counter",
            "event-reversal",
            "precision",
            "astral"
          ],
          "risks": [
            "instant-kill-before-reversal",
            "ability-sealing"
          ]
        }
      }
    },
    {
      "id": 4,
      "key": "fighter_004",
      "canonProfileKey": "fighter_004",
      "publicName": "Хранительница Отрицания",
      "combatType": "SPECIAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 48,
          "stats": {
            "spiritPower": 39,
            "attack": 29,
            "defense": 50,
            "speed": 37,
            "reaction": 34,
            "durability": 35,
            "stamina": 27,
            "range": 33,
            "battleIQ": 38,
            "technique": 44,
            "mobility": 35,
            "specialPotency": 48,
            "specialResistance": 34
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "defense",
            "healing",
            "rejection",
            "sacrifice",
            "hax"
          ],
          "risks": [
            "speed-blitz",
            "soul-cost",
            "offense-limited"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 67,
          "stats": {
            "spiritPower": 56,
            "attack": 43,
            "defense": 74,
            "speed": 51,
            "reaction": 46,
            "durability": 50,
            "stamina": 35,
            "range": 47,
            "battleIQ": 52,
            "technique": 62,
            "mobility": 49,
            "specialPotency": 74,
            "specialResistance": 51
          },
          "activation": {
            "startup": 2,
            "selfCost": 3
          },
          "tags": [
            "defense",
            "healing",
            "rejection",
            "sacrifice",
            "hax"
          ],
          "risks": [
            "speed-blitz",
            "soul-cost",
            "offense-limited"
          ]
        }
      }
    },
    {
      "id": 5,
      "key": "fighter_005",
      "canonProfileKey": "fighter_005",
      "publicName": "Страж Алмазной Руки",
      "combatType": "MARTIAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 43,
          "stats": {
            "spiritPower": 37,
            "attack": 46,
            "defense": 42,
            "speed": 37,
            "reaction": 35,
            "durability": 48,
            "stamina": 42,
            "range": 18,
            "battleIQ": 32,
            "technique": 34,
            "mobility": 32,
            "specialPotency": 10,
            "specialResistance": 27
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "tank",
            "fullbring"
          ],
          "risks": [
            "hard-hax",
            "range-control"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 56,
          "stats": {
            "spiritPower": 47,
            "attack": 58,
            "defense": 55,
            "speed": 45,
            "reaction": 45,
            "durability": 63,
            "stamina": 54,
            "range": 23,
            "battleIQ": 42,
            "technique": 46,
            "mobility": 42,
            "specialPotency": 20,
            "specialResistance": 35
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "tank",
            "fullbring"
          ],
          "risks": [
            "hard-hax",
            "range-control"
          ]
        }
      }
    },
    {
      "id": 6,
      "key": "fighter_006",
      "canonProfileKey": "fighter_006",
      "publicName": "Архитектор Реальности",
      "combatType": "TACTICAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 79,
          "stats": {
            "spiritPower": 70,
            "attack": 61,
            "defense": 68,
            "speed": 66,
            "reaction": 68,
            "durability": 63,
            "stamina": 66,
            "range": 61,
            "battleIQ": 91,
            "technique": 85,
            "mobility": 64,
            "specialPotency": 63,
            "specialResistance": 65
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "intelligence",
            "prep",
            "restructure",
            "arcane",
            "counter"
          ],
          "risks": [
            "unknown-hax",
            "no-prep"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 89,
            "attack": 80,
            "defense": 81,
            "speed": 82,
            "reaction": 86,
            "durability": 79,
            "stamina": 82,
            "range": 80,
            "battleIQ": 100,
            "technique": 100,
            "mobility": 80,
            "specialPotency": 86,
            "specialResistance": 81
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "intelligence",
            "prep",
            "restructure",
            "arcane",
            "counter"
          ],
          "risks": [
            "unknown-hax",
            "no-prep"
          ]
        }
      }
    },
    {
      "id": 7,
      "key": "fighter_007",
      "canonProfileKey": "fighter_007",
      "publicName": "Громовая Повелительница",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 77,
          "stats": {
            "spiritPower": 66,
            "attack": 75,
            "defense": 61,
            "speed": 75,
            "reaction": 72,
            "durability": 68,
            "stamina": 63,
            "range": 46,
            "battleIQ": 61,
            "technique": 63,
            "mobility": 65,
            "specialPotency": 37,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "melee",
            "lightning",
            "instinct"
          ],
          "risks": [
            "adaptation",
            "duration"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 87,
          "stats": {
            "spiritPower": 80,
            "attack": 93,
            "defense": 72,
            "speed": 93,
            "reaction": 90,
            "durability": 79,
            "stamina": 72,
            "range": 53,
            "battleIQ": 73,
            "technique": 77,
            "mobility": 79,
            "specialPotency": 48,
            "specialResistance": 64
          },
          "activation": {
            "startup": 0,
            "selfCost": 1
          },
          "tags": [
            "speed",
            "melee",
            "lightning",
            "instinct"
          ],
          "risks": [
            "adaptation",
            "duration"
          ]
        }
      }
    },
    {
      "id": 8,
      "key": "fighter_008",
      "canonProfileKey": "fighter_008",
      "publicName": "Владыка Огненного Клинка",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 73,
          "stats": {
            "spiritPower": 70,
            "attack": 74,
            "defense": 60,
            "speed": 66,
            "reaction": 63,
            "durability": 67,
            "stamina": 65,
            "range": 45,
            "battleIQ": 59,
            "technique": 62,
            "mobility": 59,
            "specialPotency": 36,
            "specialResistance": 52
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fire",
            "spirit"
          ],
          "risks": [
            "unknown-ultimate",
            "hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 80,
          "stats": {
            "spiritPower": 89,
            "attack": 93,
            "defense": 71,
            "speed": 75,
            "reaction": 72,
            "durability": 78,
            "stamina": 76,
            "range": 54,
            "battleIQ": 70,
            "technique": 76,
            "mobility": 70,
            "specialPotency": 47,
            "specialResistance": 64
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fire",
            "spirit"
          ],
          "risks": [
            "unknown-ultimate",
            "hax"
          ]
        }
      }
    },
    {
      "id": 9,
      "key": "fighter_009",
      "canonProfileKey": "fighter_009",
      "publicName": "Архимаг Солнечного Пламени",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 90,
          "stats": {
            "spiritPower": 95,
            "attack": 92,
            "defense": 81,
            "speed": 82,
            "reaction": 82,
            "durability": 83,
            "stamina": 80,
            "range": 87,
            "battleIQ": 80,
            "technique": 93,
            "mobility": 79,
            "specialPotency": 70,
            "specialResistance": 75
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fire",
            "aoe",
            "melee",
            "spirit",
            "army-summon"
          ],
          "risks": [
            "ultimate-theft",
            "world-damage"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 95,
          "stats": {
            "spiritPower": 100,
            "attack": 100,
            "defense": 91,
            "speed": 92,
            "reaction": 92,
            "durability": 93,
            "stamina": 89,
            "range": 100,
            "battleIQ": 90,
            "technique": 100,
            "mobility": 89,
            "specialPotency": 82,
            "specialResistance": 87
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fire",
            "aoe",
            "melee",
            "spirit",
            "army-summon"
          ],
          "risks": [
            "ultimate-theft",
            "world-damage"
          ]
        }
      }
    },
    {
      "id": 10,
      "key": "fighter_010",
      "canonProfileKey": "fighter_010",
      "publicName": "Теневой Актер",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 80,
          "stats": {
            "spiritPower": 71,
            "attack": 66,
            "defense": 66,
            "speed": 67,
            "reaction": 70,
            "durability": 65,
            "stamina": 67,
            "range": 67,
            "battleIQ": 77,
            "technique": 84,
            "mobility": 65,
            "specialPotency": 76,
            "specialResistance": 58
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "hax",
            "rules",
            "aoe",
            "duelist",
            "experience"
          ],
          "risks": [
            "divine-intangibility",
            "ally-risk"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 88,
          "stats": {
            "spiritPower": 89,
            "attack": 85,
            "defense": 81,
            "speed": 82,
            "reaction": 88,
            "durability": 80,
            "stamina": 82,
            "range": 86,
            "battleIQ": 99,
            "technique": 100,
            "mobility": 80,
            "specialPotency": 100,
            "specialResistance": 73
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "hax",
            "rules",
            "aoe",
            "duelist",
            "experience"
          ],
          "risks": [
            "divine-intangibility",
            "ally-risk"
          ]
        }
      }
    },
    {
      "id": 11,
      "key": "fighter_011",
      "canonProfileKey": "fighter_011",
      "publicName": "Демон Ярости",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 85,
            "attack": 100,
            "defense": 80,
            "speed": 85,
            "reaction": 81,
            "durability": 89,
            "stamina": 79,
            "range": 63,
            "battleIQ": 79,
            "technique": 79,
            "mobility": 79,
            "specialPotency": 56,
            "specialResistance": 69
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "brute-force",
            "burst",
            "durability"
          ],
          "risks": [
            "self-damage",
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 95,
          "stats": {
            "spiritPower": 98,
            "attack": 100,
            "defense": 90,
            "speed": 97,
            "reaction": 91,
            "durability": 100,
            "stamina": 85,
            "range": 69,
            "battleIQ": 89,
            "technique": 91,
            "mobility": 89,
            "specialPotency": 66,
            "specialResistance": 78
          },
          "activation": {
            "startup": 0,
            "selfCost": 2
          },
          "tags": [
            "melee",
            "brute-force",
            "burst",
            "durability"
          ],
          "risks": [
            "self-damage",
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 12,
      "key": "fighter_012",
      "canonProfileKey": "fighter_012",
      "publicName": "Кровавый Лекарь",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 80,
            "attack": 79,
            "defense": 75,
            "speed": 73,
            "reaction": 76,
            "durability": 77,
            "stamina": 80,
            "range": 68,
            "battleIQ": 77,
            "technique": 88,
            "mobility": 70,
            "specialPotency": 58,
            "specialResistance": 64
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "healing",
            "experience",
            "duelist"
          ],
          "risks": [
            "unknown-ultimate-mechanic"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 87,
          "stats": {
            "spiritPower": 91,
            "attack": 92,
            "defense": 85,
            "speed": 81,
            "reaction": 87,
            "durability": 85,
            "stamina": 88,
            "range": 72,
            "battleIQ": 90,
            "technique": 100,
            "mobility": 78,
            "specialPotency": 66,
            "specialResistance": 72
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "healing",
            "experience",
            "duelist"
          ],
          "risks": [
            "unknown-ultimate-mechanic"
          ]
        }
      }
    },
    {
      "id": 13,
      "key": "fighter_013",
      "canonProfileKey": "fighter_013",
      "publicName": "Повелитель Сакуры",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 80,
          "stats": {
            "spiritPower": 71,
            "attack": 73,
            "defense": 63,
            "speed": 66,
            "reaction": 69,
            "durability": 65,
            "stamina": 64,
            "range": 71,
            "battleIQ": 62,
            "technique": 79,
            "mobility": 61,
            "specialPotency": 49,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "melee",
            "precision",
            "aoe"
          ],
          "risks": [
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 87,
          "stats": {
            "spiritPower": 90,
            "attack": 96,
            "defense": 79,
            "speed": 80,
            "reaction": 85,
            "durability": 81,
            "stamina": 80,
            "range": 91,
            "battleIQ": 78,
            "technique": 100,
            "mobility": 77,
            "specialPotency": 65,
            "specialResistance": 67
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "melee",
            "precision",
            "aoe"
          ],
          "risks": [
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 14,
      "key": "fighter_014",
      "canonProfileKey": "fighter_014",
      "publicName": "Владыка Морозного Дракона",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 74,
          "stats": {
            "spiritPower": 67,
            "attack": 63,
            "defense": 63,
            "speed": 63,
            "reaction": 60,
            "durability": 61,
            "stamina": 59,
            "range": 65,
            "battleIQ": 65,
            "technique": 79,
            "mobility": 61,
            "specialPotency": 72,
            "specialResistance": 54
          },
          "activation": {
            "startup": 2,
            "selfCost": 0
          },
          "tags": [
            "ice",
            "aoe",
            "hax",
            "mature-form"
          ],
          "risks": [
            "setup-time",
            "self-cost"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 90,
            "attack": 89,
            "defense": 85,
            "speed": 83,
            "reaction": 79,
            "durability": 81,
            "stamina": 76,
            "range": 91,
            "battleIQ": 85,
            "technique": 100,
            "mobility": 81,
            "specialPotency": 100,
            "specialResistance": 74
          },
          "activation": {
            "startup": 2,
            "selfCost": 0
          },
          "tags": [
            "ice",
            "aoe",
            "hax",
            "mature-form"
          ],
          "risks": [
            "setup-time",
            "self-cost"
          ]
        }
      }
    },
    {
      "id": 15,
      "key": "fighter_015",
      "canonProfileKey": "fighter_015",
      "publicName": "Алхимик Тьмы",
      "combatType": "TACTICAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 65,
            "attack": 56,
            "defense": 58,
            "speed": 61,
            "reaction": 58,
            "durability": 58,
            "stamina": 62,
            "range": 55,
            "battleIQ": 88,
            "technique": 75,
            "mobility": 59,
            "specialPotency": 59,
            "specialResistance": 66
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "science",
            "prep",
            "poison",
            "adaptation",
            "counter"
          ],
          "risks": [
            "surprise",
            "speed-blitz"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 78,
            "attack": 69,
            "defense": 70,
            "speed": 74,
            "reaction": 70,
            "durability": 71,
            "stamina": 77,
            "range": 70,
            "battleIQ": 100,
            "technique": 91,
            "mobility": 72,
            "specialPotency": 80,
            "specialResistance": 86
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "science",
            "prep",
            "poison",
            "adaptation",
            "counter"
          ],
          "risks": [
            "surprise",
            "speed-blitz"
          ]
        }
      }
    },
    {
      "id": 16,
      "key": "fighter_016",
      "canonProfileKey": "fighter_016",
      "publicName": "Страж Бессмертия",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 65,
          "stats": {
            "spiritPower": 55,
            "attack": 66,
            "defense": 59,
            "speed": 51,
            "reaction": 51,
            "durability": 75,
            "stamina": 47,
            "range": 34,
            "battleIQ": 49,
            "technique": 53,
            "mobility": 47,
            "specialPotency": 26,
            "specialResistance": 45
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "tank",
            "melee",
            "giant",
            "temporary-immortality"
          ],
          "risks": [
            "time-limit",
            "post-form-collapse"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 78,
            "attack": 94,
            "defense": 86,
            "speed": 67,
            "reaction": 71,
            "durability": 100,
            "stamina": 64,
            "range": 49,
            "battleIQ": 69,
            "technique": 75,
            "mobility": 65,
            "specialPotency": 46,
            "specialResistance": 66
          },
          "activation": {
            "startup": 1,
            "selfCost": 3
          },
          "tags": [
            "tank",
            "melee",
            "giant",
            "temporary-immortality"
          ],
          "risks": [
            "time-limit",
            "post-form-collapse"
          ]
        }
      }
    },
    {
      "id": 17,
      "key": "fighter_017",
      "canonProfileKey": "fighter_017",
      "publicName": "Ассасин Молниеносной Тени",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 66,
          "stats": {
            "spiritPower": 55,
            "attack": 65,
            "defense": 50,
            "speed": 67,
            "reaction": 61,
            "durability": 55,
            "stamina": 53,
            "range": 44,
            "battleIQ": 49,
            "technique": 51,
            "mobility": 54,
            "specialPotency": 26,
            "specialResistance": 42
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "assassin",
            "two-hit",
            "missile"
          ],
          "risks": [
            "durability",
            "cooldown"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 75,
          "stats": {
            "spiritPower": 78,
            "attack": 92,
            "defense": 70,
            "speed": 93,
            "reaction": 84,
            "durability": 73,
            "stamina": 71,
            "range": 67,
            "battleIQ": 69,
            "technique": 73,
            "mobility": 77,
            "specialPotency": 46,
            "specialResistance": 62
          },
          "activation": {
            "startup": 0,
            "selfCost": 1
          },
          "tags": [
            "speed",
            "assassin",
            "two-hit",
            "missile"
          ],
          "risks": [
            "durability",
            "cooldown"
          ]
        }
      }
    },
    {
      "id": 18,
      "key": "fighter_018",
      "canonProfileKey": "fighter_018",
      "publicName": "Хранитель Застая",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 75,
          "stats": {
            "spiritPower": 72,
            "attack": 59,
            "defense": 59,
            "speed": 62,
            "reaction": 60,
            "durability": 57,
            "stamina": 51,
            "range": 63,
            "battleIQ": 64,
            "technique": 78,
            "mobility": 60,
            "specialPotency": 61,
            "specialResistance": 60
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "energy-counter",
            "spirit",
            "arcane",
            "illness"
          ],
          "risks": [
            "stamina",
            "physical-rush"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 80,
          "stats": {
            "spiritPower": 87,
            "attack": 70,
            "defense": 68,
            "speed": 73,
            "reaction": 70,
            "durability": 66,
            "stamina": 53,
            "range": 78,
            "battleIQ": 75,
            "technique": 95,
            "mobility": 71,
            "specialPotency": 73,
            "specialResistance": 76
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "energy-counter",
            "spirit",
            "arcane",
            "illness"
          ],
          "risks": [
            "stamina",
            "physical-rush"
          ]
        }
      }
    },
    {
      "id": 19,
      "key": "fighter_019",
      "canonProfileKey": "fighter_019",
      "publicName": "Змеиный Клинок",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 66,
            "attack": 73,
            "defense": 61,
            "speed": 78,
            "reaction": 73,
            "durability": 68,
            "stamina": 66,
            "range": 52,
            "battleIQ": 63,
            "technique": 62,
            "mobility": 65,
            "specialPotency": 42,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "assassin",
            "poison",
            "deception"
          ],
          "risks": [
            "regeneration-after-poison",
            "knowledge"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 81,
            "attack": 90,
            "defense": 73,
            "speed": 96,
            "reaction": 90,
            "durability": 80,
            "stamina": 77,
            "range": 65,
            "battleIQ": 78,
            "technique": 76,
            "mobility": 80,
            "specialPotency": 57,
            "specialResistance": 65
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "assassin",
            "poison",
            "deception"
          ],
          "risks": [
            "regeneration-after-poison",
            "knowledge"
          ]
        }
      }
    },
    {
      "id": 20,
      "key": "fighter_020",
      "canonProfileKey": "fighter_020",
      "publicName": "Владыка Теневой Сферы",
      "combatType": "SPECIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 58,
            "attack": 60,
            "defense": 53,
            "speed": 55,
            "reaction": 54,
            "durability": 56,
            "stamina": 54,
            "range": 47,
            "battleIQ": 52,
            "technique": 63,
            "mobility": 52,
            "specialPotency": 57,
            "specialResistance": 45
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sensory-hax",
            "void",
            "melee",
            "cero"
          ],
          "risks": [
            "overconfidence",
            "no-stacking-unshown"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 79,
            "attack": 86,
            "defense": 70,
            "speed": 74,
            "reaction": 73,
            "durability": 74,
            "stamina": 71,
            "range": 62,
            "battleIQ": 68,
            "technique": 86,
            "mobility": 69,
            "specialPotency": 79,
            "specialResistance": 62
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sensory-hax",
            "void",
            "melee",
            "cero"
          ],
          "risks": [
            "overconfidence",
            "no-stacking-unshown"
          ]
        }
      }
    },
    {
      "id": 21,
      "key": "fighter_021",
      "canonProfileKey": "fighter_021",
      "publicName": "Воин Змеиного Доспеха",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 60,
            "attack": 70,
            "defense": 53,
            "speed": 60,
            "reaction": 56,
            "durability": 60,
            "stamina": 56,
            "range": 43,
            "battleIQ": 52,
            "technique": 57,
            "mobility": 52,
            "specialPotency": 29,
            "specialResistance": 42
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "ranged",
            "burst",
            "royal-guard-trained"
          ],
          "risks": [
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 83,
          "stats": {
            "spiritPower": 80,
            "attack": 95,
            "defense": 71,
            "speed": 78,
            "reaction": 72,
            "durability": 78,
            "stamina": 73,
            "range": 62,
            "battleIQ": 70,
            "technique": 79,
            "mobility": 70,
            "specialPotency": 47,
            "specialResistance": 59
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "ranged",
            "burst",
            "royal-guard-trained"
          ],
          "risks": [
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 22,
      "key": "fighter_022",
      "canonProfileKey": "fighter_022",
      "publicName": "Жнец Цепей",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 56,
          "stats": {
            "spiritPower": 41,
            "attack": 36,
            "defense": 36,
            "speed": 39,
            "reaction": 39,
            "durability": 35,
            "stamina": 37,
            "range": 29,
            "battleIQ": 39,
            "technique": 48,
            "mobility": 35,
            "specialPotency": 34,
            "specialResistance": 28
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "midrange",
            "chains"
          ],
          "risks": [
            "ultimate-excluded-core"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 75,
          "stats": {
            "spiritPower": 58,
            "attack": 56,
            "defense": 50,
            "speed": 51,
            "reaction": 51,
            "durability": 49,
            "stamina": 51,
            "range": 40,
            "battleIQ": 53,
            "technique": 67,
            "mobility": 49,
            "specialPotency": 48,
            "specialResistance": 42
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "midrange",
            "chains",
            "reiatsu-equalization",
            "stalemate"
          ],
          "risks": [
            "activation-before-blitz",
            "mutual-attrition"
          ]
        }
      }
    },
    {
      "id": 23,
      "key": "fighter_023",
      "canonProfileKey": "fighter_023",
      "publicName": "Берсерк Дракона",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 53,
          "stats": {
            "spiritPower": 39,
            "attack": 52,
            "defense": 34,
            "speed": 38,
            "reaction": 33,
            "durability": 41,
            "stamina": 43,
            "range": 18,
            "battleIQ": 32,
            "technique": 36,
            "mobility": 33,
            "specialPotency": 10,
            "specialResistance": 26
          },
          "activation": {
            "startup": 3,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "berserker",
            "ramp-up"
          ],
          "risks": [
            "ultimate-damage",
            "setup-time"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 66,
          "stats": {
            "spiritPower": 51,
            "attack": 71,
            "defense": 46,
            "speed": 50,
            "reaction": 43,
            "durability": 53,
            "stamina": 58,
            "range": 25,
            "battleIQ": 42,
            "technique": 49,
            "mobility": 45,
            "specialPotency": 22,
            "specialResistance": 38
          },
          "activation": {
            "startup": 3,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "berserker",
            "ramp-up"
          ],
          "risks": [
            "ultimate-damage",
            "setup-time"
          ]
        }
      }
    },
    {
      "id": 24,
      "key": "fighter_024",
      "canonProfileKey": "fighter_024",
      "publicName": "Забытый Имяреки",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 92,
          "stats": {
            "spiritPower": 95,
            "attack": 82,
            "defense": 84,
            "speed": 85,
            "reaction": 85,
            "durability": 83,
            "stamina": 85,
            "range": 84,
            "battleIQ": 87,
            "technique": 100,
            "mobility": 83,
            "specialPotency": 100,
            "specialResistance": 82
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "name-hax",
            "concept",
            "arcane",
            "spirit"
          ],
          "risks": [
            "future-manipulation",
            "power-negation"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 97,
          "stats": {
            "spiritPower": 100,
            "attack": 90,
            "defense": 92,
            "speed": 93,
            "reaction": 93,
            "durability": 91,
            "stamina": 93,
            "range": 94,
            "battleIQ": 95,
            "technique": 100,
            "mobility": 91,
            "specialPotency": 100,
            "specialResistance": 94
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "name-hax",
            "concept",
            "arcane",
            "spirit"
          ],
          "risks": [
            "future-manipulation",
            "power-negation"
          ]
        }
      }
    },
    {
      "id": 25,
      "key": "fighter_025",
      "canonProfileKey": "fighter_025",
      "publicName": "Создатель Клинков",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 86,
          "stats": {
            "spiritPower": 79,
            "attack": 91,
            "defense": 74,
            "speed": 88,
            "reaction": 83,
            "durability": 81,
            "stamina": 79,
            "range": 58,
            "battleIQ": 73,
            "technique": 76,
            "mobility": 77,
            "specialPotency": 50,
            "specialResistance": 66
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "one-shot"
          ],
          "risks": [
            "unshown-ultimate",
            "post-auswahlen-elite"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 94,
          "stats": {
            "spiritPower": 90,
            "attack": 100,
            "defense": 82,
            "speed": 100,
            "reaction": 94,
            "durability": 89,
            "stamina": 87,
            "range": 61,
            "battleIQ": 81,
            "technique": 87,
            "mobility": 89,
            "specialPotency": 58,
            "specialResistance": 74
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "one-shot"
          ],
          "risks": [
            "unshown-ultimate",
            "post-auswahlen-elite"
          ]
        }
      }
    },
    {
      "id": 26,
      "key": "fighter_026",
      "canonProfileKey": "fighter_026",
      "publicName": "Ткачиха Миров",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 86,
          "stats": {
            "spiritPower": 87,
            "attack": 78,
            "defense": 78,
            "speed": 79,
            "reaction": 79,
            "durability": 77,
            "stamina": 79,
            "range": 84,
            "battleIQ": 81,
            "technique": 98,
            "mobility": 77,
            "specialPotency": 87,
            "specialResistance": 70
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "aoe",
            "hax",
            "multi-target",
            "cloth",
            "royal-guard"
          ],
          "risks": [
            "blood-oath-condition"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 95,
          "stats": {
            "spiritPower": 100,
            "attack": 92,
            "defense": 88,
            "speed": 89,
            "reaction": 89,
            "durability": 87,
            "stamina": 89,
            "range": 100,
            "battleIQ": 91,
            "technique": 100,
            "mobility": 87,
            "specialPotency": 100,
            "specialResistance": 80
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "aoe",
            "hax",
            "multi-target",
            "cloth",
            "royal-guard"
          ],
          "risks": [
            "blood-oath-condition"
          ]
        }
      }
    },
    {
      "id": 27,
      "key": "fighter_027",
      "canonProfileKey": "fighter_027",
      "publicName": "Владыка Кровавых Источников",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 69,
            "attack": 64,
            "defense": 60,
            "speed": 67,
            "reaction": 65,
            "durability": 63,
            "stamina": 65,
            "range": 54,
            "battleIQ": 56,
            "technique": 72,
            "mobility": 60,
            "specialPotency": 43,
            "specialResistance": 49
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "healing",
            "melee",
            "royal-guard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 93,
          "stats": {
            "spiritPower": 87,
            "attack": 81,
            "defense": 74,
            "speed": 84,
            "reaction": 80,
            "durability": 76,
            "stamina": 80,
            "range": 61,
            "battleIQ": 68,
            "technique": 89,
            "mobility": 75,
            "specialPotency": 55,
            "specialResistance": 61
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "healing",
            "melee",
            "royal-guard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 28,
      "key": "fighter_028",
      "canonProfileKey": "fighter_028",
      "publicName": "Страж Клетки Жизни",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 69,
            "attack": 61,
            "defense": 68,
            "speed": 58,
            "reaction": 58,
            "durability": 59,
            "stamina": 62,
            "range": 62,
            "battleIQ": 56,
            "technique": 74,
            "mobility": 55,
            "specialPotency": 46,
            "specialResistance": 59
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "support",
            "barrier",
            "absorption",
            "royal-guard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 93,
          "stats": {
            "spiritPower": 87,
            "attack": 76,
            "defense": 83,
            "speed": 70,
            "reaction": 70,
            "durability": 71,
            "stamina": 77,
            "range": 75,
            "battleIQ": 68,
            "technique": 93,
            "mobility": 67,
            "specialPotency": 60,
            "specialResistance": 74
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "support",
            "barrier",
            "absorption",
            "royal-guard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 29,
      "key": "fighter_029",
      "canonProfileKey": "fighter_029",
      "publicName": "Владыка Иллюзий",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 96,
            "attack": 83,
            "defense": 85,
            "speed": 88,
            "reaction": 88,
            "durability": 94,
            "stamina": 91,
            "range": 85,
            "battleIQ": 99,
            "technique": 100,
            "mobility": 84,
            "specialPotency": 93,
            "specialResistance": 84
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "illusion",
            "immortality",
            "arcane",
            "spirit",
            "intelligence"
          ],
          "risks": [
            "blind/no-release-exposure",
            "conceptual-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 99,
          "stats": {
            "spiritPower": 100,
            "attack": 94,
            "defense": 96,
            "speed": 97,
            "reaction": 97,
            "durability": 100,
            "stamina": 100,
            "range": 98,
            "battleIQ": 100,
            "technique": 100,
            "mobility": 95,
            "specialPotency": 100,
            "specialResistance": 100
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "illusion",
            "immortality",
            "arcane",
            "spirit",
            "intelligence"
          ],
          "risks": [
            "blind/no-release-exposure",
            "conceptual-hax"
          ]
        }
      }
    },
    {
      "id": 30,
      "key": "fighter_030",
      "canonProfileKey": "fighter_030",
      "publicName": "Рыцарь Отчаяния",
      "combatType": "ARCANE",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 72,
            "attack": 79,
            "defense": 65,
            "speed": 77,
            "reaction": 72,
            "durability": 78,
            "stamina": 71,
            "range": 69,
            "battleIQ": 62,
            "technique": 72,
            "mobility": 67,
            "specialPotency": 51,
            "specialResistance": 57
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "regen",
            "cero",
            "burst",
            "voidborn"
          ],
          "risks": [
            "vital-organ-destruction"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 89,
            "attack": 100,
            "defense": 79,
            "speed": 96,
            "reaction": 88,
            "durability": 97,
            "stamina": 88,
            "range": 86,
            "battleIQ": 76,
            "technique": 88,
            "mobility": 85,
            "specialPotency": 65,
            "specialResistance": 71
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "regen",
            "cero",
            "burst",
            "voidborn"
          ],
          "risks": [
            "vital-organ-destruction"
          ]
        }
      }
    },
    {
      "id": 31,
      "key": "fighter_031",
      "canonProfileKey": "fighter_031",
      "publicName": "Алый Хищник",
      "combatType": "MARTIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 55,
            "attack": 68,
            "defense": 51,
            "speed": 62,
            "reaction": 58,
            "durability": 62,
            "stamina": 56,
            "range": 34,
            "battleIQ": 48,
            "technique": 50,
            "mobility": 52,
            "specialPotency": 27,
            "specialResistance": 40
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "voidborn",
            "predator"
          ],
          "risks": [
            "hard-hax",
            "range-control"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 76,
          "stats": {
            "spiritPower": 67,
            "attack": 85,
            "defense": 63,
            "speed": 80,
            "reaction": 75,
            "durability": 75,
            "stamina": 68,
            "range": 42,
            "battleIQ": 60,
            "technique": 63,
            "mobility": 67,
            "specialPotency": 39,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "voidborn",
            "predator"
          ],
          "risks": [
            "hard-hax",
            "range-control"
          ]
        }
      }
    },
    {
      "id": 32,
      "key": "fighter_032",
      "canonProfileKey": "fighter_032",
      "publicName": "Стрелок Одинокой Стаи",
      "combatType": "ARCANE",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 74,
          "stats": {
            "spiritPower": 75,
            "attack": 73,
            "defense": 63,
            "speed": 65,
            "reaction": 64,
            "durability": 69,
            "stamina": 61,
            "range": 76,
            "battleIQ": 58,
            "technique": 71,
            "mobility": 61,
            "specialPotency": 49,
            "specialResistance": 57
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "aoe",
            "spirit",
            "voidborn"
          ],
          "risks": [
            "resolve",
            "resource"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 90,
            "attack": 87,
            "defense": 73,
            "speed": 75,
            "reaction": 74,
            "durability": 80,
            "stamina": 70,
            "range": 95,
            "battleIQ": 68,
            "technique": 82,
            "mobility": 71,
            "specialPotency": 59,
            "specialResistance": 69
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "aoe",
            "spirit",
            "voidborn"
          ],
          "risks": [
            "resolve",
            "resource"
          ]
        }
      }
    },
    {
      "id": 33,
      "key": "fighter_033",
      "canonProfileKey": "fighter_033",
      "publicName": "Владыка Увядания",
      "combatType": "SPECIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 73,
          "stats": {
            "spiritPower": 67,
            "attack": 66,
            "defense": 63,
            "speed": 65,
            "reaction": 65,
            "durability": 66,
            "stamina": 64,
            "range": 66,
            "battleIQ": 64,
            "technique": 72,
            "mobility": 62,
            "specialPotency": 82,
            "specialResistance": 55
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "time",
            "decay",
            "aoe",
            "hax",
            "voidborn"
          ],
          "risks": [
            "spatial-counter",
            "self-decay-field"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 77,
            "attack": 79,
            "defense": 73,
            "speed": 75,
            "reaction": 77,
            "durability": 77,
            "stamina": 74,
            "range": 82,
            "battleIQ": 74,
            "technique": 85,
            "mobility": 72,
            "specialPotency": 100,
            "specialResistance": 65
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "time",
            "decay",
            "aoe",
            "hax",
            "voidborn"
          ],
          "risks": [
            "spatial-counter",
            "self-decay-field"
          ]
        }
      }
    },
    {
      "id": 34,
      "key": "fighter_034",
      "canonProfileKey": "fighter_034",
      "publicName": "Повелительница Водных Стихий",
      "combatType": "ARCANE",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 71,
          "stats": {
            "spiritPower": 67,
            "attack": 69,
            "defense": 60,
            "speed": 64,
            "reaction": 63,
            "durability": 66,
            "stamina": 61,
            "range": 72,
            "battleIQ": 57,
            "technique": 68,
            "mobility": 58,
            "specialPotency": 46,
            "specialResistance": 49
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "water",
            "ranged",
            "voidborn"
          ],
          "risks": [
            "ice-matchup",
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 79,
          "stats": {
            "spiritPower": 78,
            "attack": 82,
            "defense": 71,
            "speed": 73,
            "reaction": 72,
            "durability": 78,
            "stamina": 72,
            "range": 91,
            "battleIQ": 68,
            "technique": 81,
            "mobility": 69,
            "specialPotency": 57,
            "specialResistance": 59
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "water",
            "ranged",
            "voidborn"
          ],
          "risks": [
            "ice-matchup",
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 35,
      "key": "fighter_035",
      "canonProfileKey": "fighter_035",
      "publicName": "Страж Спирального Копья",
      "combatType": "MARTIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 69,
          "stats": {
            "spiritPower": 62,
            "attack": 75,
            "defense": 58,
            "speed": 65,
            "reaction": 63,
            "durability": 69,
            "stamina": 63,
            "range": 43,
            "battleIQ": 57,
            "technique": 57,
            "mobility": 57,
            "specialPotency": 34,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "counter",
            "voidborn",
            "spear"
          ],
          "risks": [
            "hard-hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 75,
            "attack": 93,
            "defense": 71,
            "speed": 78,
            "reaction": 78,
            "durability": 83,
            "stamina": 76,
            "range": 53,
            "battleIQ": 73,
            "technique": 71,
            "mobility": 70,
            "specialPotency": 47,
            "specialResistance": 65
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "counter",
            "voidborn",
            "spear"
          ],
          "risks": [
            "hard-hax"
          ]
        }
      }
    },
    {
      "id": 36,
      "key": "fighter_036",
      "canonProfileKey": "fighter_036",
      "publicName": "Шестирукий Разрушитель",
      "combatType": "MARTIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 55,
            "attack": 66,
            "defense": 54,
            "speed": 54,
            "reaction": 52,
            "durability": 68,
            "stamina": 58,
            "range": 34,
            "battleIQ": 48,
            "technique": 50,
            "mobility": 50,
            "specialPotency": 27,
            "specialResistance": 41
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "tank",
            "voidborn"
          ],
          "risks": [
            "precision",
            "hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 73,
          "stats": {
            "spiritPower": 66,
            "attack": 81,
            "defense": 68,
            "speed": 64,
            "reaction": 63,
            "durability": 86,
            "stamina": 72,
            "range": 41,
            "battleIQ": 59,
            "technique": 62,
            "mobility": 61,
            "specialPotency": 38,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "tank",
            "voidborn"
          ],
          "risks": [
            "precision",
            "hax"
          ]
        }
      }
    },
    {
      "id": 37,
      "key": "fighter_037",
      "canonProfileKey": "fighter_037",
      "publicName": "Владыка Бесконечного Гнева",
      "combatType": "MARTIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 60,
          "stats": {
            "spiritPower": 44,
            "attack": 61,
            "defense": 43,
            "speed": 41,
            "reaction": 41,
            "durability": 62,
            "stamina": 50,
            "range": 29,
            "battleIQ": 35,
            "technique": 38,
            "mobility": 36,
            "specialPotency": 16,
            "specialResistance": 30
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "giant",
            "tank",
            "rage",
            "voidborn"
          ],
          "risks": [
            "speed",
            "precision",
            "hax"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 81,
          "stats": {
            "spiritPower": 80,
            "attack": 100,
            "defense": 82,
            "speed": 74,
            "reaction": 77,
            "durability": 100,
            "stamina": 91,
            "range": 65,
            "battleIQ": 70,
            "technique": 74,
            "mobility": 71,
            "specialPotency": 52,
            "specialResistance": 65
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "giant",
            "tank",
            "rage",
            "voidborn"
          ],
          "risks": [
            "speed",
            "precision",
            "hax"
          ]
        }
      }
    },
    {
      "id": 38,
      "key": "fighter_038",
      "canonProfileKey": "fighter_038",
      "publicName": "Всевидящий Император",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 91,
          "stats": {
            "spiritPower": 100,
            "attack": 85,
            "defense": 87,
            "speed": 88,
            "reaction": 95,
            "durability": 86,
            "stamina": 90,
            "range": 90,
            "battleIQ": 91,
            "technique": 98,
            "mobility": 86,
            "specialPotency": 99,
            "specialResistance": 89
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "future",
            "absorption",
            "spirit",
            "astral",
            "god-tier"
          ],
          "risks": [
            "still-silver",
            "timed-window"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 100,
          "stats": {
            "spiritPower": 100,
            "attack": 94,
            "defense": 96,
            "speed": 97,
            "reaction": 100,
            "durability": 95,
            "stamina": 100,
            "range": 100,
            "battleIQ": 100,
            "technique": 100,
            "mobility": 95,
            "specialPotency": 100,
            "specialResistance": 100
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "future",
            "absorption",
            "spirit",
            "astral",
            "god-tier"
          ],
          "risks": [
            "still-silver",
            "timed-window"
          ]
        }
      }
    },
    {
      "id": 39,
      "key": "fighter_039",
      "canonProfileKey": "fighter_039",
      "publicName": "Страж Баланса",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 75,
            "attack": 70,
            "defense": 75,
            "speed": 73,
            "reaction": 82,
            "durability": 71,
            "stamina": 73,
            "range": 74,
            "battleIQ": 78,
            "technique": 83,
            "mobility": 71,
            "specialPotency": 78,
            "specialResistance": 74
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "balance",
            "counter",
            "future-sight",
            "astral"
          ],
          "risks": [
            "time-window",
            "event-reversal"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 85,
            "attack": 80,
            "defense": 82,
            "speed": 83,
            "reaction": 98,
            "durability": 81,
            "stamina": 83,
            "range": 86,
            "battleIQ": 93,
            "technique": 94,
            "mobility": 81,
            "specialPotency": 94,
            "specialResistance": 88
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "balance",
            "counter",
            "future-sight",
            "astral"
          ],
          "risks": [
            "time-window",
            "event-reversal"
          ]
        }
      }
    },
    {
      "id": 40,
      "key": "fighter_040",
      "canonProfileKey": "fighter_040",
      "publicName": "Рыцарь Чудес",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 77,
            "attack": 79,
            "defense": 74,
            "speed": 73,
            "reaction": 76,
            "durability": 95,
            "stamina": 85,
            "range": 77,
            "battleIQ": 75,
            "technique": 85,
            "mobility": 71,
            "specialPotency": 81,
            "specialResistance": 66
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "regen",
            "growth",
            "giant",
            "growth-effect",
            "astral"
          ],
          "risks": [
            "auswahlen",
            "conceptual-seal"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 94,
          "stats": {
            "spiritPower": 89,
            "attack": 96,
            "defense": 83,
            "speed": 80,
            "reaction": 85,
            "durability": 100,
            "stamina": 100,
            "range": 87,
            "battleIQ": 84,
            "technique": 97,
            "mobility": 78,
            "specialPotency": 97,
            "specialResistance": 75
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "regen",
            "growth",
            "giant",
            "growth-effect",
            "astral"
          ],
          "risks": [
            "auswahlen",
            "conceptual-seal"
          ]
        }
      }
    },
    {
      "id": 41,
      "key": "fighter_041",
      "canonProfileKey": "fighter_041",
      "publicName": "Ткач Смертельных Доз",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 81,
          "stats": {
            "spiritPower": 73,
            "attack": 68,
            "defense": 69,
            "speed": 71,
            "reaction": 69,
            "durability": 69,
            "stamina": 73,
            "range": 80,
            "battleIQ": 74,
            "technique": 82,
            "mobility": 69,
            "specialPotency": 75,
            "specialResistance": 68
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "poison",
            "adaptation",
            "area-control",
            "astral"
          ],
          "risks": [
            "speed-blitz",
            "one-shot"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 89,
          "stats": {
            "spiritPower": 83,
            "attack": 78,
            "defense": 77,
            "speed": 81,
            "reaction": 77,
            "durability": 79,
            "stamina": 84,
            "range": 96,
            "battleIQ": 85,
            "technique": 92,
            "mobility": 79,
            "specialPotency": 90,
            "specialResistance": 82
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "poison",
            "adaptation",
            "area-control",
            "astral"
          ],
          "risks": [
            "speed-blitz",
            "one-shot"
          ]
        }
      }
    },
    {
      "id": 42,
      "key": "fighter_042",
      "canonProfileKey": "fighter_042",
      "publicName": "Священный Стрелок",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 84,
          "stats": {
            "spiritPower": 82,
            "attack": 78,
            "defense": 84,
            "speed": 77,
            "reaction": 81,
            "durability": 75,
            "stamina": 77,
            "range": 87,
            "battleIQ": 77,
            "technique": 89,
            "mobility": 75,
            "specialPotency": 78,
            "specialResistance": 76
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sniper",
            "intangibility",
            "divine",
            "pierce",
            "astral"
          ],
          "risks": [
            "divine-reflection",
            "Shinken-Hakkyoken"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 94,
          "stats": {
            "spiritPower": 96,
            "attack": 94,
            "defense": 100,
            "speed": 89,
            "reaction": 96,
            "durability": 87,
            "stamina": 89,
            "range": 100,
            "battleIQ": 89,
            "technique": 100,
            "mobility": 87,
            "specialPotency": 94,
            "specialResistance": 94
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sniper",
            "intangibility",
            "divine",
            "pierce",
            "astral"
          ],
          "risks": [
            "divine-reflection",
            "Shinken-Hakkyoken"
          ]
        }
      }
    },
    {
      "id": 43,
      "key": "fighter_043",
      "canonProfileKey": "fighter_043",
      "publicName": "Древняя Рука",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 83,
          "stats": {
            "spiritPower": 75,
            "attack": 70,
            "defense": 72,
            "speed": 73,
            "reaction": 74,
            "durability": 76,
            "stamina": 79,
            "range": 74,
            "battleIQ": 75,
            "technique": 85,
            "mobility": 71,
            "specialPotency": 78,
            "specialResistance": 69
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "nerve-hax",
            "adaptation",
            "regen",
            "astral"
          ],
          "risks": [
            "runaway-regeneration",
            "biological-counter"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 91,
          "stats": {
            "spiritPower": 84,
            "attack": 79,
            "defense": 81,
            "speed": 82,
            "reaction": 83,
            "durability": 89,
            "stamina": 93,
            "range": 85,
            "battleIQ": 86,
            "technique": 97,
            "mobility": 80,
            "specialPotency": 93,
            "specialResistance": 83
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "nerve-hax",
            "adaptation",
            "regen",
            "astral"
          ],
          "risks": [
            "runaway-regeneration",
            "biological-counter"
          ]
        }
      }
    },
    {
      "id": 44,
      "key": "fighter_044",
      "canonProfileKey": "fighter_044",
      "publicName": "Маг Фантазий",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 82,
          "stats": {
            "spiritPower": 75,
            "attack": 71,
            "defense": 72,
            "speed": 73,
            "reaction": 74,
            "durability": 68,
            "stamina": 69,
            "range": 79,
            "battleIQ": 71,
            "technique": 86,
            "mobility": 71,
            "specialPotency": 85,
            "specialResistance": 64
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "reality-creation",
            "hax",
            "aoe",
            "astral"
          ],
          "risks": [
            "mental-instability",
            "self-overload"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 88,
          "stats": {
            "spiritPower": 84,
            "attack": 82,
            "defense": 81,
            "speed": 82,
            "reaction": 83,
            "durability": 76,
            "stamina": 76,
            "range": 93,
            "battleIQ": 79,
            "technique": 98,
            "mobility": 80,
            "specialPotency": 100,
            "specialResistance": 73
          },
          "activation": {
            "startup": 0,
            "selfCost": 2
          },
          "tags": [
            "reality-creation",
            "hax",
            "aoe",
            "astral"
          ],
          "risks": [
            "mental-instability",
            "self-overload"
          ]
        }
      }
    },
    {
      "id": 45,
      "key": "fighter_045",
      "canonProfileKey": "fighter_045",
      "publicName": "Маг Испепеляющего Пламени",
      "combatType": "ARCANE",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 68,
          "stats": {
            "spiritPower": 57,
            "attack": 63,
            "defense": 49,
            "speed": 53,
            "reaction": 53,
            "durability": 53,
            "stamina": 50,
            "range": 67,
            "battleIQ": 48,
            "technique": 62,
            "mobility": 49,
            "specialPotency": 37,
            "specialResistance": 43
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fire",
            "ranged",
            "burst",
            "astral"
          ],
          "risks": [
            "auswahlen",
            "higher-fire"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 77,
          "stats": {
            "spiritPower": 73,
            "attack": 86,
            "defense": 62,
            "speed": 68,
            "reaction": 66,
            "durability": 66,
            "stamina": 62,
            "range": 89,
            "battleIQ": 61,
            "technique": 78,
            "mobility": 62,
            "specialPotency": 50,
            "specialResistance": 56
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fire",
            "ranged",
            "burst",
            "astral"
          ],
          "risks": [
            "auswahlen",
            "higher-fire"
          ]
        }
      }
    },
    {
      "id": 46,
      "key": "fighter_046",
      "canonProfileKey": "fighter_046",
      "publicName": "Повелительница Взрывов",
      "combatType": "ARCANE",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 67,
          "stats": {
            "spiritPower": 57,
            "attack": 61,
            "defense": 51,
            "speed": 52,
            "reaction": 53,
            "durability": 53,
            "stamina": 52,
            "range": 73,
            "battleIQ": 48,
            "technique": 63,
            "mobility": 49,
            "specialPotency": 37,
            "specialResistance": 43
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "explosion",
            "ranged",
            "aoe",
            "astral"
          ],
          "risks": [
            "speed",
            "zombie-nerf"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 77,
          "stats": {
            "spiritPower": 72,
            "attack": 81,
            "defense": 63,
            "speed": 64,
            "reaction": 65,
            "durability": 65,
            "stamina": 64,
            "range": 99,
            "battleIQ": 60,
            "technique": 79,
            "mobility": 61,
            "specialPotency": 49,
            "specialResistance": 55
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "explosion",
            "ranged",
            "aoe",
            "astral"
          ],
          "risks": [
            "speed",
            "zombie-nerf"
          ]
        }
      }
    },
    {
      "id": 47,
      "key": "fighter_047",
      "canonProfileKey": "fighter_047",
      "publicName": "Падший Подчинитель",
      "combatType": "MARTIAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 62,
          "stats": {
            "spiritPower": 54,
            "attack": 67,
            "defense": 51,
            "speed": 56,
            "reaction": 52,
            "durability": 58,
            "stamina": 56,
            "range": 34,
            "battleIQ": 49,
            "technique": 51,
            "mobility": 51,
            "specialPotency": 29,
            "specialResistance": 45
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fullbring",
            "absorption",
            "burst"
          ],
          "risks": [
            "higher-spirit"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 68,
            "attack": 87,
            "defense": 62,
            "speed": 69,
            "reaction": 63,
            "durability": 69,
            "stamina": 67,
            "range": 41,
            "battleIQ": 60,
            "technique": 66,
            "mobility": 63,
            "specialPotency": 43,
            "specialResistance": 57
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fullbring",
            "absorption",
            "burst"
          ],
          "risks": [
            "higher-spirit"
          ]
        }
      }
    },
    {
      "id": 48,
      "key": "fighter_048",
      "canonProfileKey": "fighter_048",
      "publicName": "Хранитель Времени",
      "combatType": "SPECIAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 60,
          "stats": {
            "spiritPower": 51,
            "attack": 46,
            "defense": 48,
            "speed": 49,
            "reaction": 49,
            "durability": 47,
            "stamina": 49,
            "range": 45,
            "battleIQ": 56,
            "technique": 57,
            "mobility": 49,
            "specialPotency": 55,
            "specialResistance": 41
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "past-hax",
            "psychology",
            "sword",
            "fullbring"
          ],
          "risks": [
            "no-contact",
            "principled-resistance"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 70,
          "stats": {
            "spiritPower": 64,
            "attack": 59,
            "defense": 61,
            "speed": 62,
            "reaction": 62,
            "durability": 60,
            "stamina": 62,
            "range": 58,
            "battleIQ": 73,
            "technique": 70,
            "mobility": 62,
            "specialPotency": 75,
            "specialResistance": 54
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "past-hax",
            "psychology",
            "sword",
            "fullbring"
          ],
          "risks": [
            "no-contact",
            "principled-resistance"
          ]
        }
      }
    },
    {
      "id": 49,
      "key": "fighter_049",
      "canonProfileKey": "fighter_049",
      "publicName": "Веселый Мод",
      "combatType": "MARTIAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 5,
          "stats": {
            "spiritPower": 13,
            "attack": 21,
            "defense": 12,
            "speed": 19,
            "reaction": 16,
            "durability": 22,
            "stamina": 20,
            "range": 5,
            "battleIQ": 13,
            "technique": 13,
            "mobility": 15,
            "specialPotency": 5,
            "specialResistance": 8
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "comic",
            "mobility",
            "low-tier"
          ],
          "risks": [
            "spiritual-pressure"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 9,
          "stats": {
            "spiritPower": 13,
            "attack": 22,
            "defense": 13,
            "speed": 22,
            "reaction": 19,
            "durability": 25,
            "stamina": 23,
            "range": 7,
            "battleIQ": 16,
            "technique": 16,
            "mobility": 19,
            "specialPotency": 5,
            "specialResistance": 11
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "comic",
            "mobility",
            "low-tier"
          ],
          "risks": [
            "spiritual-pressure"
          ]
        }
      }
    },
    {
      "id": 50,
      "key": "fighter_050",
      "canonProfileKey": "fighter_050",
      "publicName": "Экзорцист Харизмы",
      "combatType": "TACTICAL",
      "faction": "MORTAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 5,
          "stats": {
            "spiritPower": 13,
            "attack": 9,
            "defense": 9,
            "speed": 16,
            "reaction": 16,
            "durability": 13,
            "stamina": 16,
            "range": 15,
            "battleIQ": 27,
            "technique": 23,
            "mobility": 15,
            "specialPotency": 5,
            "specialResistance": 9
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "comic",
            "ranged",
            "low-tier"
          ],
          "risks": [
            "any-high-tier"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 10,
          "stats": {
            "spiritPower": 13,
            "attack": 11,
            "defense": 8,
            "speed": 19,
            "reaction": 19,
            "durability": 16,
            "stamina": 19,
            "range": 24,
            "battleIQ": 30,
            "technique": 26,
            "mobility": 19,
            "specialPotency": 8,
            "specialResistance": 10
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "comic",
            "ranged",
            "low-tier"
          ],
          "risks": [
            "any-high-tier"
          ]
        }
      }
    },
    {
      "id": 51,
      "key": "fighter_051",
      "canonProfileKey": "fighter_051",
      "publicName": "Лекарь-Ученик",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 12,
          "stats": {
            "spiritPower": 28,
            "attack": 21,
            "defense": 25,
            "speed": 21,
            "reaction": 21,
            "durability": 25,
            "stamina": 30,
            "range": 24,
            "battleIQ": 19,
            "technique": 30,
            "mobility": 18,
            "specialPotency": 6,
            "specialResistance": 12
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "healing",
            "stored-energy",
            "support"
          ],
          "risks": [
            "no-charge",
            "speed"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 28,
          "stats": {
            "spiritPower": 37,
            "attack": 29,
            "defense": 38,
            "speed": 30,
            "reaction": 30,
            "durability": 36,
            "stamina": 44,
            "range": 35,
            "battleIQ": 28,
            "technique": 39,
            "mobility": 27,
            "specialPotency": 15,
            "specialResistance": 21
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "healing",
            "stored-energy",
            "support"
          ],
          "risks": [
            "no-charge",
            "speed"
          ]
        }
      }
    },
    {
      "id": 52,
      "key": "fighter_052",
      "canonProfileKey": "fighter_052",
      "publicName": "Маг Зеркальной Инверсии",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 69,
          "stats": {
            "spiritPower": 66,
            "attack": 59,
            "defense": 60,
            "speed": 64,
            "reaction": 65,
            "durability": 59,
            "stamina": 61,
            "range": 61,
            "battleIQ": 66,
            "technique": 73,
            "mobility": 59,
            "specialPotency": 67,
            "specialResistance": 55
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sensory-hax",
            "group-control",
            "vizard",
            "counter"
          ],
          "risks": [
            "one-on-one-ultimate",
            "aoe-ally-risk"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 82,
            "attack": 75,
            "defense": 71,
            "speed": 74,
            "reaction": 76,
            "durability": 70,
            "stamina": 72,
            "range": 76,
            "battleIQ": 79,
            "technique": 88,
            "mobility": 70,
            "specialPotency": 86,
            "specialResistance": 69
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sensory-hax",
            "vizard",
            "counter",
            "duel-inversion"
          ],
          "risks": [
            "bankai-excluded-1v1"
          ]
        }
      }
    },
    {
      "id": 53,
      "key": "fighter_053",
      "canonProfileKey": "fighter_053",
      "publicName": "Повелитель Первобытного Страха",
      "combatType": "SPECIAL",
      "faction": "ASTRAL",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 68,
          "stats": {
            "spiritPower": 61,
            "attack": 57,
            "defense": 58,
            "speed": 59,
            "reaction": 60,
            "durability": 57,
            "stamina": 59,
            "range": 65,
            "battleIQ": 59,
            "technique": 70,
            "mobility": 57,
            "specialPotency": 66,
            "specialResistance": 50
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fear",
            "mental",
            "astral",
            "aoe"
          ],
          "risks": [
            "emotionless-state",
            "extreme-cold"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 73,
            "attack": 71,
            "defense": 70,
            "speed": 71,
            "reaction": 72,
            "durability": 69,
            "stamina": 71,
            "range": 82,
            "battleIQ": 71,
            "technique": 84,
            "mobility": 69,
            "specialPotency": 87,
            "specialResistance": 62
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "fear",
            "mental",
            "astral",
            "aoe"
          ],
          "risks": [
            "emotionless-state",
            "extreme-cold"
          ]
        }
      }
    },
    {
      "id": 54,
      "key": "fighter_054",
      "canonProfileKey": "fighter_054",
      "publicName": "Создатель Кукол",
      "combatType": "SPECIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 59,
          "stats": {
            "spiritPower": 52,
            "attack": 51,
            "defense": 51,
            "speed": 50,
            "reaction": 49,
            "durability": 52,
            "stamina": 49,
            "range": 48,
            "battleIQ": 55,
            "technique": 62,
            "mobility": 47,
            "specialPotency": 55,
            "specialResistance": 40
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "science",
            "organ-hax",
            "clones",
            "voidborn"
          ],
          "risks": [
            "counter-prep",
            "drug"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 65,
            "attack": 64,
            "defense": 65,
            "speed": 63,
            "reaction": 62,
            "durability": 65,
            "stamina": 62,
            "range": 62,
            "battleIQ": 72,
            "technique": 80,
            "mobility": 60,
            "specialPotency": 75,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "science",
            "organ-hax",
            "clones",
            "voidborn"
          ],
          "risks": [
            "counter-prep",
            "drug"
          ]
        }
      }
    },
    {
      "id": 55,
      "key": "fighter_055",
      "canonProfileKey": "fighter_055",
      "publicName": "Маэстро Звуковых Иллюзий",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 65,
          "stats": {
            "spiritPower": 55,
            "attack": 50,
            "defense": 48,
            "speed": 51,
            "reaction": 49,
            "durability": 47,
            "stamina": 49,
            "range": 53,
            "battleIQ": 54,
            "technique": 60,
            "mobility": 47,
            "specialPotency": 60,
            "specialResistance": 40
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sound-hax",
            "illusion",
            "vizard",
            "aoe"
          ],
          "risks": [
            "deafness",
            "self-disclosure"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 76,
          "stats": {
            "spiritPower": 69,
            "attack": 65,
            "defense": 61,
            "speed": 64,
            "reaction": 62,
            "durability": 60,
            "stamina": 62,
            "range": 72,
            "battleIQ": 69,
            "technique": 73,
            "mobility": 60,
            "specialPotency": 83,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "sound-hax",
            "illusion",
            "vizard",
            "aoe"
          ],
          "risks": [
            "deafness",
            "self-disclosure"
          ]
        }
      }
    },
    {
      "id": 56,
      "key": "fighter_056",
      "canonProfileKey": "fighter_056",
      "publicName": "Мастер Внутренних Взрывов",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 55,
            "attack": 65,
            "defense": 48,
            "speed": 54,
            "reaction": 49,
            "durability": 55,
            "stamina": 53,
            "range": 36,
            "battleIQ": 47,
            "technique": 51,
            "mobility": 47,
            "specialPotency": 24,
            "specialResistance": 40
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "explosion",
            "vizard"
          ],
          "risks": [
            "range",
            "no-stacking-unshown"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 74,
          "stats": {
            "spiritPower": 69,
            "attack": 84,
            "defense": 61,
            "speed": 67,
            "reaction": 62,
            "durability": 68,
            "stamina": 66,
            "range": 47,
            "battleIQ": 60,
            "technique": 64,
            "mobility": 60,
            "specialPotency": 37,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "explosion",
            "vizard"
          ],
          "risks": [
            "range",
            "no-stacking-unshown"
          ]
        }
      }
    },
    {
      "id": 57,
      "key": "fighter_057",
      "canonProfileKey": "fighter_057",
      "publicName": "Штормовой Вайзард",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 51,
          "stats": {
            "spiritPower": 41,
            "attack": 50,
            "defense": 34,
            "speed": 41,
            "reaction": 37,
            "durability": 41,
            "stamina": 39,
            "range": 20,
            "battleIQ": 33,
            "technique": 36,
            "mobility": 33,
            "specialPotency": 10,
            "specialResistance": 26
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "vizard",
            "cero"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 62,
          "stats": {
            "spiritPower": 55,
            "attack": 68,
            "defense": 44,
            "speed": 50,
            "reaction": 45,
            "durability": 51,
            "stamina": 49,
            "range": 28,
            "battleIQ": 43,
            "technique": 49,
            "mobility": 43,
            "specialPotency": 20,
            "specialResistance": 36
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "vizard",
            "cero"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 58,
      "key": "fighter_058",
      "canonProfileKey": "fighter_058",
      "publicName": "Повелительница Режущего Пепла",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 48,
          "stats": {
            "spiritPower": 42,
            "attack": 39,
            "defense": 34,
            "speed": 37,
            "reaction": 40,
            "durability": 36,
            "stamina": 35,
            "range": 46,
            "battleIQ": 33,
            "technique": 50,
            "mobility": 32,
            "specialPotency": 20,
            "specialResistance": 26
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "ash",
            "precision"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 57,
          "stats": {
            "spiritPower": 55,
            "attack": 53,
            "defense": 44,
            "speed": 45,
            "reaction": 50,
            "durability": 46,
            "stamina": 45,
            "range": 64,
            "battleIQ": 43,
            "technique": 66,
            "mobility": 42,
            "specialPotency": 30,
            "specialResistance": 36
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "ranged",
            "ash",
            "precision"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 59,
      "key": "fighter_059",
      "canonProfileKey": "fighter_059",
      "publicName": "Био-Оружие Бездны",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 52,
          "stats": {
            "spiritPower": 48,
            "attack": 54,
            "defense": 43,
            "speed": 56,
            "reaction": 51,
            "durability": 54,
            "stamina": 44,
            "range": 32,
            "battleIQ": 42,
            "technique": 45,
            "mobility": 47,
            "specialPotency": 23,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "biological",
            "sacrifice",
            "artificial"
          ],
          "risks": [
            "self-destruction"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 71,
            "attack": 78,
            "defense": 66,
            "speed": 84,
            "reaction": 77,
            "durability": 80,
            "stamina": 63,
            "range": 55,
            "battleIQ": 65,
            "technique": 69,
            "mobility": 73,
            "specialPotency": 49,
            "specialResistance": 62
          },
          "activation": {
            "startup": 1,
            "selfCost": 2
          },
          "tags": [
            "speed",
            "biological",
            "sacrifice",
            "artificial"
          ],
          "risks": [
            "self-destruction"
          ]
        }
      }
    },
    {
      "id": 60,
      "key": "fighter_060",
      "canonProfileKey": "fighter_060",
      "publicName": "Молниеносный Вайзард",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 50,
          "stats": {
            "spiritPower": 48,
            "attack": 55,
            "defense": 41,
            "speed": 55,
            "reaction": 49,
            "durability": 48,
            "stamina": 46,
            "range": 25,
            "battleIQ": 40,
            "technique": 43,
            "mobility": 45,
            "specialPotency": 17,
            "specialResistance": 33
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "vizard"
          ],
          "risks": [
            "unshown-weapon"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 63,
          "stats": {
            "spiritPower": 69,
            "attack": 78,
            "defense": 58,
            "speed": 78,
            "reaction": 69,
            "durability": 65,
            "stamina": 63,
            "range": 37,
            "battleIQ": 57,
            "technique": 63,
            "mobility": 65,
            "specialPotency": 34,
            "specialResistance": 50
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "speed",
            "vizard"
          ],
          "risks": [
            "unshown-weapon"
          ]
        }
      }
    },
    {
      "id": 61,
      "key": "fighter_061",
      "canonProfileKey": "fighter_061",
      "publicName": "Страж Тяжелой Алебарды",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 50,
            "attack": 57,
            "defense": 43,
            "speed": 50,
            "reaction": 46,
            "durability": 50,
            "stamina": 48,
            "range": 29,
            "battleIQ": 42,
            "technique": 47,
            "mobility": 42,
            "specialPotency": 19,
            "specialResistance": 35
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "polearm",
            "vizard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 73,
          "stats": {
            "spiritPower": 70,
            "attack": 79,
            "defense": 59,
            "speed": 65,
            "reaction": 60,
            "durability": 66,
            "stamina": 64,
            "range": 41,
            "battleIQ": 58,
            "technique": 67,
            "mobility": 58,
            "specialPotency": 35,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "polearm",
            "vizard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 62,
      "key": "fighter_062",
      "canonProfileKey": "fighter_062",
      "publicName": "Капитанский Страж",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 55,
          "stats": {
            "spiritPower": 43,
            "attack": 49,
            "defense": 37,
            "speed": 43,
            "reaction": 40,
            "durability": 44,
            "stamina": 42,
            "range": 21,
            "battleIQ": 38,
            "technique": 41,
            "mobility": 36,
            "specialPotency": 13,
            "specialResistance": 29
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "captain-status"
          ],
          "risks": [
            "unknown-weapon"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 58,
            "attack": 65,
            "defense": 51,
            "speed": 55,
            "reaction": 52,
            "durability": 58,
            "stamina": 56,
            "range": 30,
            "battleIQ": 53,
            "technique": 57,
            "mobility": 50,
            "specialPotency": 27,
            "specialResistance": 43
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "captain-status"
          ],
          "risks": [
            "unknown-weapon"
          ]
        }
      }
    },
    {
      "id": 63,
      "key": "fighter_063",
      "canonProfileKey": "fighter_063",
      "publicName": "Магическая Ловушечница",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 46,
          "stats": {
            "spiritPower": 42,
            "attack": 41,
            "defense": 39,
            "speed": 35,
            "reaction": 35,
            "durability": 36,
            "stamina": 37,
            "range": 43,
            "battleIQ": 33,
            "technique": 51,
            "mobility": 32,
            "specialPotency": 22,
            "specialResistance": 28
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "arcane",
            "fire",
            "support",
            "trap"
          ],
          "risks": [
            "unshown-ultimate",
            "psychological"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 55,
          "stats": {
            "spiritPower": 60,
            "attack": 61,
            "defense": 53,
            "speed": 50,
            "reaction": 50,
            "durability": 51,
            "stamina": 54,
            "range": 64,
            "battleIQ": 48,
            "technique": 73,
            "mobility": 47,
            "specialPotency": 38,
            "specialResistance": 41
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "arcane",
            "fire",
            "support",
            "trap"
          ],
          "risks": [
            "unshown-ultimate",
            "psychological"
          ]
        }
      }
    },
    {
      "id": 64,
      "key": "fighter_064",
      "canonProfileKey": "fighter_064",
      "publicName": "Небесный Лекарь",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 50,
          "stats": {
            "spiritPower": 42,
            "attack": 37,
            "defense": 35,
            "speed": 34,
            "reaction": 34,
            "durability": 36,
            "stamina": 38,
            "range": 37,
            "battleIQ": 33,
            "technique": 48,
            "mobility": 31,
            "specialPotency": 20,
            "specialResistance": 25
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "healing",
            "arcane",
            "captain-status"
          ],
          "risks": [
            "unknown-weapon-effect"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 60,
          "stats": {
            "spiritPower": 56,
            "attack": 50,
            "defense": 51,
            "speed": 47,
            "reaction": 47,
            "durability": 53,
            "stamina": 57,
            "range": 53,
            "battleIQ": 48,
            "technique": 66,
            "mobility": 44,
            "specialPotency": 35,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "healing",
            "arcane",
            "captain-status"
          ],
          "risks": [
            "unknown-weapon-effect"
          ]
        }
      }
    },
    {
      "id": 65,
      "key": "fighter_065",
      "canonProfileKey": "fighter_065",
      "publicName": "Тяжелый Судья",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 52,
          "stats": {
            "spiritPower": 48,
            "attack": 55,
            "defense": 43,
            "speed": 47,
            "reaction": 44,
            "durability": 53,
            "stamina": 50,
            "range": 27,
            "battleIQ": 42,
            "technique": 48,
            "mobility": 42,
            "specialPotency": 24,
            "specialResistance": 35
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "weight-hax",
            "melee",
            "reconstructed"
          ],
          "risks": [
            "range",
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 64,
          "stats": {
            "spiritPower": 66,
            "attack": 75,
            "defense": 61,
            "speed": 65,
            "reaction": 62,
            "durability": 73,
            "stamina": 69,
            "range": 40,
            "battleIQ": 60,
            "technique": 68,
            "mobility": 60,
            "specialPotency": 46,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "weight-hax",
            "melee",
            "reconstructed"
          ],
          "risks": [
            "range",
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 66,
      "key": "fighter_066",
      "canonProfileKey": "fighter_066",
      "publicName": "Рыцарь-Тяжеловес",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 43,
          "stats": {
            "spiritPower": 39,
            "attack": 46,
            "defense": 34,
            "speed": 40,
            "reaction": 37,
            "durability": 41,
            "stamina": 39,
            "range": 19,
            "battleIQ": 34,
            "technique": 38,
            "mobility": 33,
            "specialPotency": 10,
            "specialResistance": 26
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "chain",
            "lieutenant"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 51,
          "stats": {
            "spiritPower": 55,
            "attack": 64,
            "defense": 47,
            "speed": 51,
            "reaction": 48,
            "durability": 54,
            "stamina": 52,
            "range": 29,
            "battleIQ": 48,
            "technique": 56,
            "mobility": 46,
            "specialPotency": 23,
            "specialResistance": 39
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "chain",
            "lieutenant"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 67,
      "key": "fighter_067",
      "canonProfileKey": "fighter_067",
      "publicName": "Хранительница Зеркального Клинка",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 40,
          "stats": {
            "spiritPower": 43,
            "attack": 36,
            "defense": 38,
            "speed": 39,
            "reaction": 37,
            "durability": 37,
            "stamina": 39,
            "range": 37,
            "battleIQ": 41,
            "technique": 51,
            "mobility": 37,
            "specialPotency": 45,
            "specialResistance": 44
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "divine-counter",
            "reflection",
            "arcane"
          ],
          "risks": [
            "non-divine-target",
            "physical-rush"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 54,
          "stats": {
            "spiritPower": 77,
            "attack": 70,
            "defense": 68,
            "speed": 73,
            "reaction": 70,
            "durability": 71,
            "stamina": 73,
            "range": 74,
            "battleIQ": 75,
            "technique": 89,
            "mobility": 71,
            "specialPotency": 88,
            "specialResistance": 86
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "divine-counter",
            "reflection",
            "arcane"
          ],
          "risks": [
            "non-divine-target",
            "physical-rush"
          ]
        }
      }
    },
    {
      "id": 68,
      "key": "fighter_068",
      "canonProfileKey": "fighter_068",
      "publicName": "Повелитель Небесных Молний",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 65,
          "stats": {
            "spiritPower": 54,
            "attack": 54,
            "defense": 46,
            "speed": 49,
            "reaction": 47,
            "durability": 48,
            "stamina": 47,
            "range": 54,
            "battleIQ": 49,
            "technique": 58,
            "mobility": 44,
            "specialPotency": 32,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "lightning",
            "aoe",
            "veteran"
          ],
          "risks": [
            "limited-feats"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 78,
          "stats": {
            "spiritPower": 73,
            "attack": 76,
            "defense": 65,
            "speed": 69,
            "reaction": 66,
            "durability": 67,
            "stamina": 66,
            "range": 77,
            "battleIQ": 71,
            "technique": 79,
            "mobility": 63,
            "specialPotency": 51,
            "specialResistance": 57
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "lightning",
            "aoe",
            "veteran"
          ],
          "risks": [
            "limited-feats"
          ]
        }
      }
    },
    {
      "id": 69,
      "key": "fighter_069",
      "canonProfileKey": "fighter_069",
      "publicName": "Призывательница Духов Атаки",
      "combatType": "MARTIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 50,
          "stats": {
            "spiritPower": 46,
            "attack": 55,
            "defense": 41,
            "speed": 45,
            "reaction": 42,
            "durability": 48,
            "stamina": 46,
            "range": 25,
            "battleIQ": 40,
            "technique": 44,
            "mobility": 40,
            "specialPotency": 19,
            "specialResistance": 33
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "mystery",
            "multi-hit"
          ],
          "risks": [
            "identity-ambiguity"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 62,
          "stats": {
            "spiritPower": 67,
            "attack": 80,
            "defense": 59,
            "speed": 63,
            "reaction": 60,
            "durability": 66,
            "stamina": 64,
            "range": 38,
            "battleIQ": 58,
            "technique": 66,
            "mobility": 58,
            "specialPotency": 39,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "mystery",
            "multi-hit"
          ],
          "risks": [
            "identity-ambiguity"
          ]
        }
      }
    },
    {
      "id": 70,
      "key": "fighter_070",
      "canonProfileKey": "fighter_070",
      "publicName": "Повелительница Взрывного Арканума",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 46,
          "stats": {
            "spiritPower": 50,
            "attack": 49,
            "defense": 47,
            "speed": 43,
            "reaction": 43,
            "durability": 44,
            "stamina": 45,
            "range": 53,
            "battleIQ": 41,
            "technique": 56,
            "mobility": 40,
            "specialPotency": 30,
            "specialResistance": 36
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "arcane",
            "explosion",
            "support"
          ],
          "risks": [
            "melee-top-tier"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 57,
          "stats": {
            "spiritPower": 69,
            "attack": 71,
            "defense": 62,
            "speed": 59,
            "reaction": 59,
            "durability": 60,
            "stamina": 63,
            "range": 76,
            "battleIQ": 57,
            "technique": 77,
            "mobility": 56,
            "specialPotency": 47,
            "specialResistance": 50
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "arcane",
            "explosion",
            "support"
          ],
          "risks": [
            "melee-top-tier"
          ]
        }
      }
    },
    {
      "id": 71,
      "key": "fighter_071",
      "canonProfileKey": "fighter_071",
      "publicName": "Страж Вяжущего Песка",
      "combatType": "TACTICAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 28,
          "stats": {
            "spiritPower": 33,
            "attack": 29,
            "defense": 30,
            "speed": 31,
            "reaction": 28,
            "durability": 28,
            "stamina": 31,
            "range": 29,
            "battleIQ": 45,
            "technique": 41,
            "mobility": 29,
            "specialPotency": 20,
            "specialResistance": 27
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "terrain",
            "explosion",
            "low-mid-tier"
          ],
          "risks": [
            "high-speed"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 38,
          "stats": {
            "spiritPower": 43,
            "attack": 43,
            "defense": 41,
            "speed": 42,
            "reaction": 38,
            "durability": 39,
            "stamina": 42,
            "range": 45,
            "battleIQ": 58,
            "technique": 52,
            "mobility": 40,
            "specialPotency": 31,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "terrain",
            "explosion",
            "low-mid-tier"
          ],
          "risks": [
            "high-speed"
          ]
        }
      }
    },
    {
      "id": 72,
      "key": "fighter_072",
      "canonProfileKey": "fighter_072",
      "publicName": "Многоликое Чудовище",
      "combatType": "SPECIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 55,
          "stats": {
            "spiritPower": 49,
            "attack": 47,
            "defense": 42,
            "speed": 47,
            "reaction": 46,
            "durability": 48,
            "stamina": 47,
            "range": 42,
            "battleIQ": 46,
            "technique": 55,
            "mobility": 44,
            "specialPotency": 48,
            "specialResistance": 40
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "absorption",
            "mimic",
            "voidborn"
          ],
          "risks": [
            "sunlight",
            "precision"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 67,
          "stats": {
            "spiritPower": 63,
            "attack": 62,
            "defense": 55,
            "speed": 61,
            "reaction": 60,
            "durability": 63,
            "stamina": 63,
            "range": 56,
            "battleIQ": 60,
            "technique": 71,
            "mobility": 58,
            "specialPotency": 67,
            "specialResistance": 56
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "absorption",
            "mimic",
            "voidborn"
          ],
          "risks": [
            "sunlight",
            "precision"
          ]
        }
      }
    },
    {
      "id": 73,
      "key": "fighter_073",
      "canonProfileKey": "fighter_073",
      "publicName": "Владыка Печатей Контроля",
      "combatType": "SPECIAL",
      "faction": "VOIDBORN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 61,
          "stats": {
            "spiritPower": 50,
            "attack": 48,
            "defense": 46,
            "speed": 55,
            "reaction": 52,
            "durability": 49,
            "stamina": 47,
            "range": 43,
            "battleIQ": 47,
            "technique": 58,
            "mobility": 50,
            "specialPotency": 55,
            "specialResistance": 38
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "control",
            "voidborn",
            "hax"
          ],
          "risks": [
            "barrier",
            "self-amputation"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 65,
            "attack": 64,
            "defense": 61,
            "speed": 75,
            "reaction": 70,
            "durability": 65,
            "stamina": 62,
            "range": 58,
            "battleIQ": 62,
            "technique": 76,
            "mobility": 68,
            "specialPotency": 79,
            "specialResistance": 53
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "speed",
            "control",
            "voidborn",
            "hax"
          ],
          "risks": [
            "barrier",
            "self-amputation"
          ]
        }
      }
    },
    {
      "id": 74,
      "key": "fighter_074",
      "canonProfileKey": "fighter_074",
      "publicName": "Мастер Пространственных Барьеров",
      "combatType": "SPECIAL",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 62,
          "stats": {
            "spiritPower": 55,
            "attack": 48,
            "defense": 55,
            "speed": 51,
            "reaction": 49,
            "durability": 47,
            "stamina": 49,
            "range": 48,
            "battleIQ": 54,
            "technique": 69,
            "mobility": 47,
            "specialPotency": 54,
            "specialResistance": 50
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "barrier",
            "space",
            "arcane",
            "vizard",
            "counter"
          ],
          "risks": [
            "speed-blitz",
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 75,
          "stats": {
            "spiritPower": 73,
            "attack": 66,
            "defense": 75,
            "speed": 68,
            "reaction": 65,
            "durability": 64,
            "stamina": 66,
            "range": 67,
            "battleIQ": 73,
            "technique": 94,
            "mobility": 64,
            "specialPotency": 77,
            "specialResistance": 73
          },
          "activation": {
            "startup": 1,
            "selfCost": 0
          },
          "tags": [
            "barrier",
            "space",
            "arcane",
            "vizard",
            "counter"
          ],
          "risks": [
            "speed-blitz",
            "unshown-ultimate"
          ]
        }
      }
    },
    {
      "id": 75,
      "key": "fighter_075",
      "canonProfileKey": "fighter_075",
      "publicName": "Маэстро Огненной Дубины",
      "combatType": "ARCANE",
      "faction": "WARDEN",
      "calibration": {
        "method": "VERIFIED_PROFILE_NORMALIZATION",
        "note": "Internal release calibration."
      },
      "forms": {
        "base": {
          "sourcePowerCalibration": 63,
          "stats": {
            "spiritPower": 54,
            "attack": 56,
            "defense": 45,
            "speed": 47,
            "reaction": 46,
            "durability": 47,
            "stamina": 46,
            "range": 44,
            "battleIQ": 44,
            "technique": 56,
            "mobility": 43,
            "specialPotency": 31,
            "specialResistance": 37
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fire",
            "vizard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        },
        "prime": {
          "sourcePowerCalibration": 72,
          "stats": {
            "spiritPower": 73,
            "attack": 79,
            "defense": 59,
            "speed": 62,
            "reaction": 60,
            "durability": 61,
            "stamina": 60,
            "range": 55,
            "battleIQ": 58,
            "technique": 73,
            "mobility": 57,
            "specialPotency": 45,
            "specialResistance": 51
          },
          "activation": {
            "startup": 0,
            "selfCost": 0
          },
          "tags": [
            "melee",
            "fire",
            "vizard"
          ],
          "risks": [
            "unshown-ultimate"
          ]
        }
      }
    }
  ],
  "ratingRevision": "FINAL-2026-09-04"
};
