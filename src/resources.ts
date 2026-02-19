import { PhaseOfLife, POL_CONFIG, RESOURCES_PER_PHASE } from "./constants";
import { CharacterSetup, ResourcePool } from "./types";

export function getPhaseCount(phase: PhaseOfLife): number {
    return POL_CONFIG[phase].phaseIndex;
}

export function getStartingStatsForPhase(phase: PhaseOfLife) {
    const v = POL_CONFIG[phase].startingStatValue;
    return { Strength: v, Dexterity: v, Endurance: v, Wisdom: v, Intelligence: v } as const;
}

export function computeResources(setup: CharacterSetup): ResourcePool {
    const phases = getPhaseCount(setup.phaseOfLife);
    const npcCount = Math.min(setup.importantNpcCount, phases);

    return {
        statUps: phases * RESOURCES_PER_PHASE.statUps + npcCount * RESOURCES_PER_PHASE.npcStatUps,
        skillUps: phases * RESOURCES_PER_PHASE.skillUps,
        traitUps: phases * RESOURCES_PER_PHASE.traitUps,
        abilityOrWeaponUps: phases * RESOURCES_PER_PHASE.abilityOrWeaponUps,
        majorSkillPoints: phases * RESOURCES_PER_PHASE.majorSkillPoints,
    };
}
