"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const resources_1 = require("./resources");
const logic_1 = require("./logic");
// Example usage demo. Replace with UI/CLI later.
const setup = { phaseOfLife: constants_1.PhaseOfLife.EarlyAdulthood, importantNpcCount: 3 };
const resources = (0, resources_1.computeResources)(setup);
const startingStats = (0, resources_1.getStartingStatsForPhase)(setup.phaseOfLife);
console.log("Setup:", setup);
console.log("Starting stats:", startingStats);
console.log("Resource pool:", resources);
// Sample stat plan: raise Strength from 25 to 32
const statFrom = startingStats.Strength;
const statTo = 32;
const statChange = (0, logic_1.getStatChangeCost)(statFrom, statTo);
console.log(`Change Strength from ${statFrom} to ${statTo}: cost`, statChange.cost, statChange.refund ? "(Refund – Talk to GM)" : "", "Stat UPs");
// Sample skill plan: Use 2 Major Skill Points, then raise to 12 with Skill UPs
const mspApplied = (0, logic_1.applyMajorSkillPoints)(2); // becomes 10
const skillTarget = 12; // final desired familiarity
const skillChange = (0, logic_1.getSkillChangeCost)(mspApplied, skillTarget);
console.log(`Using 2 Major Skill Points -> ${mspApplied}, change to ${skillTarget}: cost`, skillChange.cost, skillChange.refund ? "(Refund – Talk to GM)" : "", "Skill UPs");
