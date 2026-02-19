import { PhaseOfLife } from "./constants";
import { computeResources, getStartingStatsForPhase } from "./resources";
import { calculateSkillUpgradeCost, calculateStatUpgradeCost, applyMajorSkillPoints, getSkillChangeCost, getStatChangeCost } from "./logic";

// Example usage demo. Replace with UI/CLI later.
const setup = { phaseOfLife: PhaseOfLife.EarlyAdulthood, importantNpcCount: 3 } as const;
const resources = computeResources(setup);
const startingStats = getStartingStatsForPhase(setup.phaseOfLife);

console.log("Setup:", setup);
console.log("Starting stats:", startingStats);
console.log("Resource pool:", resources);

// Sample stat plan: raise Strength from 25 to 32
const statFrom = startingStats.Strength;
const statTo = 32;
const statChange = getStatChangeCost(statFrom, statTo);
console.log(`Change Strength from ${statFrom} to ${statTo}: cost`, statChange.cost, statChange.refund ? "(Refund – Talk to GM)" : "", "Stat UPs");

// Sample skill plan: Use 2 Major Skill Points, then raise to 12 with Skill UPs
const mspApplied = applyMajorSkillPoints(2); // becomes 10
const skillTarget = 12; // final desired familiarity
const skillChange = getSkillChangeCost(mspApplied, skillTarget);
console.log(`Using 2 Major Skill Points -> ${mspApplied}, change to ${skillTarget}: cost`, skillChange.cost, skillChange.refund ? "(Refund – Talk to GM)" : "", "Skill UPs");
