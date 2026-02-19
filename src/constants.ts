export enum PhaseOfLife {
    EarlyChildhood = "Early Childhood (3-6)",
    MiddleChildhood = "Middle Childhood (7-10)",
    Adolescence = "Adolescence (11-19)",
    EarlyAdulthood = "Early Adulthood (20-30)",
    MiddleAged = "Middle-aged (30-50)",
    Elder = "Elder (51+)"
}

export interface PolInfo {
    startingStatValue: number;
    phaseIndex: number; // To calculate total resources
}

export const POL_CONFIG: Record<PhaseOfLife, PolInfo> = {
    [PhaseOfLife.EarlyChildhood]: { startingStatValue: 10, phaseIndex: 1 },
    [PhaseOfLife.MiddleChildhood]: { startingStatValue: 15, phaseIndex: 2 },
    [PhaseOfLife.Adolescence]: { startingStatValue: 20, phaseIndex: 3 },
    [PhaseOfLife.EarlyAdulthood]: { startingStatValue: 25, phaseIndex: 4 },
    [PhaseOfLife.MiddleAged]: { startingStatValue: 30, phaseIndex: 5 },
    [PhaseOfLife.Elder]: { startingStatValue: 35, phaseIndex: 6 } // Placeholder value
};

export const RESOURCES_PER_PHASE = {
    statUps: 19,
    skillUps: 9,
    traitUps: 1,
    abilityOrWeaponUps: 5,
    npcStatUps: 9,
    majorSkillPoints: 1
};
