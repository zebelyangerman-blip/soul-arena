/* Soul Arena R17 Arena Engine 2.0 runtime data. */
window.SOUL_ARENA_ARENA_RULES = {
  "schemaVersion": 17,
  "engineVersion": "R17.0.0",
  "featureName": "Arena Engine 2.0",
  "canonVersion": "2026-09-02",
  "arenaCount": 3,
  "policy": {
    "purpose": "Deterministic two-layer environment system: terrain plus home-field affinity.",
    "numericMeaning": "Internal gameplay calibration, not canonical numeric measurements.",
    "scope": "Arena effects stay secondary to fighter identity, form, special abilities, matchup rules and fatigue.",
    "layers": [
      "terrain",
      "homeField"
    ],
    "homeFieldRule": "A small familiarity advantage only for the arena native faction; never a blanket power boost.",
    "noArtificialBalance": "No rubber-banding, team equalization, hidden RNG or forced comeback mechanics.",
    "stacking": "Terrain and home-field are independent, multiplicative and clamped after stacking."
  },
  "statClamp": {
    "minMultiplier": 0.94,
    "maxMultiplier": 1.06
  },
  "homeFieldClamp": {
    "minMultiplier": 1.0,
    "maxMultiplier": 1.015
  },
  "arenas": [
    {
      "id": "ARENA_01",
      "publicName": "Цитадель Душ",
      "icon": "🏰",
      "legacyNames": [
        "Цитадель Душ",
        "ARENA_01"
      ],
      "colorClass": "text-blue-400",
      "background": "images/arena_01.png",
      "audio": "audio/arena_01.mp3",
      "shortDescription": "Каменные кварталы, стены и узкие линии обзора повышают ценность точности, позиции и тактического контроля.",
      "terrainSummary": "Плотная застройка помогает технике и тактике, но немного мешает чистой дальности.",
      "homeFieldSummary": "Стражи Цитадели получают небольшой бонус за знание улиц, маршрутов и дистанций.",
      "mechanicSummary": "Местность: техника/тактика ↑, дальность слегка ↓. Родная территория: небольшой бонус Стражам Цитадели.",
      "terrain": {
        "globalStatMultipliers": {
          "battleIQ": 1.01,
          "technique": 1.008,
          "range": 0.985
        },
        "combatTypeStatMultipliers": {
          "ARCANE": {
            "technique": 1.008,
            "specialPotency": 1.006
          },
          "TACTICAL": {
            "battleIQ": 1.012
          }
        },
        "tagStatMultipliers": {
          "barrier": {
            "defense": 1.012,
            "specialResistance": 1.008
          },
          "assassin": {
            "mobility": 1.012,
            "reaction": 1.008
          },
          "ranged": {
            "range": 0.985
          },
          "arcane": {
            "technique": 1.006
          }
        }
      },
      "homeField": {
        "faction": "WARDEN",
        "publicFaction": "Стражи Цитадели",
        "statMultipliers": {
          "technique": 1.012,
          "battleIQ": 1.012,
          "reaction": 1.008,
          "stamina": 1.006
        }
      }
    },
    {
      "id": "ARENA_02",
      "publicName": "Песчаная Пустошь",
      "icon": "🏜️",
      "legacyNames": [
        "Песчаная Пустошь",
        "ARENA_02"
      ],
      "colorClass": "text-emerald-400",
      "background": "images/arena_02.png",
      "audio": "audio/arena_02.mp3",
      "shortDescription": "Открытая пустыня почти не даёт укрытий, поэтому выше ценятся дальность, мобильность и широкие атаки.",
      "terrainSummary": "Открытое пространство помогает дальности, мобильности и AoE, но слегка снижает ценность пассивной защиты.",
      "homeFieldSummary": "Рождённые Бездной получают небольшой бонус за привычку к песчаному миру и открытому пространству.",
      "mechanicSummary": "Местность: дальность/мобильность/AoE ↑, пассивная защита слегка ↓. Родная территория: небольшой бонус Рождённым Бездной.",
      "terrain": {
        "globalStatMultipliers": {
          "range": 1.022,
          "mobility": 1.016,
          "defense": 0.99
        },
        "combatTypeStatMultipliers": {
          "MARTIAL": {
            "mobility": 1.008
          },
          "ARCANE": {
            "range": 1.008
          }
        },
        "tagStatMultipliers": {
          "ranged": {
            "range": 1.02
          },
          "aoe": {
            "attack": 1.012,
            "range": 1.008
          },
          "speed": {
            "mobility": 1.012
          }
        }
      },
      "homeField": {
        "faction": "VOIDBORN",
        "publicFaction": "Рождённые Бездной",
        "statMultipliers": {
          "durability": 1.012,
          "stamina": 1.012,
          "mobility": 1.008,
          "spiritPower": 1.006
        }
      }
    },
    {
      "id": "ARENA_03",
      "publicName": "Ледяной Чертог",
      "icon": "🏛️",
      "legacyNames": [
        "Ледяной Чертог",
        "ARENA_03"
      ],
      "colorClass": "text-purple-400",
      "background": "images/arena_03.png",
      "audio": "audio/arena_03.mp3",
      "shortDescription": "Насыщенный энергией холодный чертог усиливает точное управление силой, дальнее давление и энергетические техники.",
      "terrainSummary": "Энергетические и специальные стили немного лучше используют насыщенную силой среду.",
      "homeFieldSummary": "Звёздный Орден получает небольшой бонус за знакомство с энергетической архитектурой Чертога.",
      "mechanicSummary": "Местность: энергетические/специальные техники слегка ↑. Родная территория: небольшой бонус Звёздному Ордену.",
      "terrain": {
        "globalStatMultipliers": {
          "spiritPower": 1.008,
          "specialPotency": 1.008,
          "specialResistance": 1.004
        },
        "combatTypeStatMultipliers": {
          "SPECIAL": {
            "specialPotency": 1.01
          },
          "ARCANE": {
            "spiritPower": 1.008
          }
        },
        "tagStatMultipliers": {
          "absorption": {
            "spiritPower": 1.018,
            "stamina": 1.012
          },
          "ranged": {
            "range": 1.01
          },
          "ice": {
            "specialPotency": 1.008
          }
        }
      },
      "homeField": {
        "faction": "ASTRAL",
        "publicFaction": "Звёздный Орден",
        "statMultipliers": {
          "spiritPower": 1.012,
          "technique": 1.01,
          "range": 1.012,
          "reaction": 1.008
        }
      }
    }
  ]
};
