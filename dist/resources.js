"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhaseCount = getPhaseCount;
exports.getStartingStatsForPhase = getStartingStatsForPhase;
exports.computeResources = computeResources;
const constants_1 = require("./constants");
function getPhaseCount(phase) {
    return constants_1.POL_CONFIG[phase].phaseIndex;
}
function getStartingStatsForPhase(phase) {
    const v = constants_1.POL_CONFIG[phase].startingStatValue;
    return { Strength: v, Dexterity: v, Endurance: v, Wisdom: v, Intelligence: v };
}
function computeResources(setup) {
    const phases = getPhaseCount(setup.phaseOfLife);
    const npcCount = Math.min(setup.importantNpcCount, phases);
    return {
        statUps: phases * constants_1.RESOURCES_PER_PHASE.statUps + npcCount * constants_1.RESOURCES_PER_PHASE.npcStatUps,
        skillUps: phases * constants_1.RESOURCES_PER_PHASE.skillUps,
        traitUps: phases * constants_1.RESOURCES_PER_PHASE.traitUps,
        abilityOrWeaponUps: phases * constants_1.RESOURCES_PER_PHASE.abilityOrWeaponUps,
        majorSkillPoints: phases * constants_1.RESOURCES_PER_PHASE.majorSkillPoints,
    };
}
