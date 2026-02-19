import { PhaseOfLife } from "./constants";

export type StatName = "Strength" | "Dexterity" | "Endurance" | "Wisdom" | "Intelligence";

export type Stats = Record<StatName, number>;

export interface Skill {
    name: string; // e.g., "Athletics(Climbing)"
    value: number; // familiarity, 0..40
    mspSpent: number; // 0, 1, 2, or 3
}

export interface CharacterSetup {
    phaseOfLife: PhaseOfLife;
    importantNpcCount: number; // 0..phaseIndex (inclusive)
}

export interface ResourcePool {
    statUps: number;
    skillUps: number;
    traitUps: number;
    abilityOrWeaponUps: number;
    majorSkillPoints: number;
}

export interface Trait {
    name: string;
    level: number; // 1 to 10
    bonusStat?: StatName | "Profession";
}

export interface DowntimeResources {
    statUps: number;
    skillUps: number;
    traitUps: number;
    abilityOrWeaponUps: number;
}

export interface CharacterData {
    name: string;
    isNpc: boolean;
    setup: CharacterSetup;
    stats: Stats;
    skills: Skill[];
    traits: Trait[];
    downtime: DowntimeResources;
    majorSkillPointsSpent: number;
}
