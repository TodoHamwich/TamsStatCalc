"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESOURCES_PER_PHASE = exports.POL_CONFIG = exports.PhaseOfLife = void 0;
var PhaseOfLife;
(function (PhaseOfLife) {
    PhaseOfLife["EarlyChildhood"] = "Early Childhood (3-6)";
    PhaseOfLife["MiddleChildhood"] = "Middle Childhood (7-10)";
    PhaseOfLife["Adolescence"] = "Adolescence (11-19)";
    PhaseOfLife["EarlyAdulthood"] = "Early Adulthood (20-30)";
    PhaseOfLife["MiddleAged"] = "Middle-aged (30-50)";
    PhaseOfLife["Elder"] = "Elder (51+)";
})(PhaseOfLife || (exports.PhaseOfLife = PhaseOfLife = {}));
exports.POL_CONFIG = {
    [PhaseOfLife.EarlyChildhood]: { startingStatValue: 10, phaseIndex: 1 },
    [PhaseOfLife.MiddleChildhood]: { startingStatValue: 15, phaseIndex: 2 },
    [PhaseOfLife.Adolescence]: { startingStatValue: 20, phaseIndex: 3 },
    [PhaseOfLife.EarlyAdulthood]: { startingStatValue: 25, phaseIndex: 4 },
    [PhaseOfLife.MiddleAged]: { startingStatValue: 30, phaseIndex: 5 },
    [PhaseOfLife.Elder]: { startingStatValue: 35, phaseIndex: 6 } // Placeholder value
};
exports.RESOURCES_PER_PHASE = {
    statUps: 19,
    skillUps: 9,
    traitUps: 1,
    abilityOrWeaponUps: 5,
    npcStatUps: 9,
    majorSkillPoints: 1
};
