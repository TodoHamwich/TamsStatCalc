import { STANDARD_SKILLS, isStandardSkill } from "./skills";

export interface GmNotes {
  talkToGm: boolean;
  reasons: string[]; // list reasons triggering GM attention
}

export function emptyGmNotes(): GmNotes { return { talkToGm: false, reasons: [] }; }

export function capSkillValue(value: number): number {
  return Math.max(0, Math.min(40, value));
}

export function validateNpcCount(npcs: number, maxPerPhases: number, notes: GmNotes): number {
  const capped = Math.max(0, Math.min(maxPerPhases, npcs));
  if (npcs !== capped) {
    notes.talkToGm = true;
    notes.reasons.push("Adjusted Important NPC count to phase limit");
  }
  return capped;
}

export function checkCustomSkillName(name: string, notes: GmNotes, suppressed?: boolean): void {
  if (!name.trim()) return; // ignore empty names
  if (!isStandardSkill(name)) {
    if (!suppressed) {
      notes.talkToGm = true;
      notes.reasons.push(`Custom skill "${name}" used (requires GM approval)`);
    }
  }
}
