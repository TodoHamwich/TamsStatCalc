"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyGmNotes = emptyGmNotes;
exports.capSkillValue = capSkillValue;
exports.validateNpcCount = validateNpcCount;
exports.checkCustomSkillName = checkCustomSkillName;
const skills_1 = require("./skills");
function emptyGmNotes() { return { talkToGm: false, reasons: [] }; }
function capSkillValue(value) {
    return Math.max(0, Math.min(40, value));
}
function validateNpcCount(npcs, maxPerPhases, notes) {
    const capped = Math.max(0, Math.min(maxPerPhases, npcs));
    if (npcs !== capped) {
        notes.talkToGm = true;
        notes.reasons.push("Adjusted Important NPC count to phase limit");
    }
    return capped;
}
function checkCustomSkillName(name, notes) {
    if (!(0, skills_1.isStandardSkill)(name)) {
        notes.talkToGm = true;
        notes.reasons.push(`Custom skill name used: ${name}`);
    }
}
