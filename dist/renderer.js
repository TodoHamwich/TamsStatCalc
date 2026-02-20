"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const resources_1 = require("./resources");
const logic_1 = require("./logic");
const validation_1 = require("./validation");
const skills_1 = require("./skills");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
// Folders: use current executable path, avoiding Electron's temporary extraction folder
const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath.includes('AppData');
// When packaged as a 'portable' exe, PORTABLE_EXECUTABLE_DIR is the folder containing the .exe
const baseDir = isDev
    ? process.cwd()
    : (process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath));
const CHAR_DIR = path.join(baseDir, 'characters');
const NPC_DIR = path.join(baseDir, 'npcs');
console.log('App Base Directory (Target):', baseDir);
console.log('Exec Path:', process.execPath);
console.log('Portable Dir Env:', process.env.PORTABLE_EXECUTABLE_DIR);
[CHAR_DIR, NPC_DIR].forEach(dir => {
    if (!fs.existsSync(dir))
        fs.mkdirpSync(dir);
});
// UI State
let currentCharacter = {
    name: '',
    isNpc: false,
    setup: { phaseOfLife: constants_1.PhaseOfLife.EarlyAdulthood, importantNpcCount: 0 },
    stats: (0, resources_1.getStartingStatsForPhase)(constants_1.PhaseOfLife.EarlyAdulthood),
    skills: [],
    traits: [],
    downtime: { statUps: 0, skillUps: 0, traitUps: 0, abilityOrWeaponUps: 0 },
    majorSkillPointsSpent: 0,
    abilityPointsSpent: 0
};
// DOM Elements
const charNameInput = document.getElementById('charName');
const isNpcCheck = document.getElementById('isNpc');
const polSelect = document.getElementById('pol');
const npcsInput = document.getElementById('npcs');
const npcHelp = document.getElementById('npcHelp');
const gmNotesDiv = document.getElementById('gmNotes');
const gmReasonsSpan = document.getElementById('gmReasons');
const statRes = document.getElementById('statRes');
const skillRes = document.getElementById('skillRes');
const traitRes = document.getElementById('traitRes');
const apRes = document.getElementById('apRes');
const mspRes = document.getElementById('mspRes');
const mspPanel = document.getElementById('mspPanel');
const mspContent = document.getElementById('mspContent');
const toggleMspBtn = document.getElementById('toggleMspBtn');
let mspMinimized = false;
const statControls = document.getElementById('statControls');
const skillList = document.getElementById('skillList');
const mspAssignments = document.getElementById('mspAssignments');
const traitList = document.getElementById('traitList');
const debugOutput = document.getElementById('debugOutput');
const dtStatUps = document.getElementById('dtStatUps');
const dtSkillUps = document.getElementById('dtSkillUps');
const dtTraitUps = document.getElementById('dtTraitUps');
const dtAbilityUps = document.getElementById('dtAbilityUps');
const apSpentInp = document.getElementById('apSpent');
const startingStatDisplay = document.getElementById('startingStatDisplay');
const loadModal = document.getElementById('loadModal');
const fileList = document.getElementById('fileList');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const addSkillBtn = document.getElementById('addSkillBtn');
const addTraitBtn = document.getElementById('addTraitBtn');
const charDisplayName = document.getElementById('charDisplayName');
const saveStatus = document.getElementById('saveStatus');
const statValElements = {};
function init() {
    console.log('Initializing renderer...');
    console.log('polSelect element:', polSelect);
    console.log('statControls element:', statControls);
    if (!polSelect || !statControls) {
        console.error('CRITICAL: Required DOM elements not found during init!');
        return;
    }
    Object.values(constants_1.PhaseOfLife).forEach(label => {
        const opt = document.createElement('option');
        opt.value = label;
        opt.textContent = label;
        polSelect.appendChild(opt);
    });
    console.log('POL options added. Count:', polSelect.options.length);
    // Create static stat rows
    statControls.innerHTML = '';
    const statNames = ['Strength', 'Dexterity', 'Endurance', 'Wisdom', 'Intelligence'];
    statNames.forEach(name => {
        const row = document.createElement('div');
        row.className = 'stat-row';
        const label = document.createElement('div');
        label.className = 'label';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        label.appendChild(nameSpan);
        const bonusSpan = document.createElement('span');
        bonusSpan.style.fontSize = '0.75em';
        bonusSpan.style.color = '#10b981';
        bonusSpan.style.marginLeft = '4px';
        bonusSpan.id = `bonus-${name}`;
        label.appendChild(bonusSpan);
        const valInp = document.createElement('input');
        valInp.type = 'number';
        valInp.style.fontWeight = 'bold';
        valInp.style.width = '50px';
        valInp.oninput = (e) => {
            let v = parseInt(e.target.value) || 0;
            const phase = currentCharacter.setup.phaseOfLife;
            const startStats = (0, resources_1.getStartingStatsForPhase)(phase);
            const traitStatBonuses = { Strength: 0, Dexterity: 0, Endurance: 0, Wisdom: 0, Intelligence: 0 };
            currentCharacter.traits.forEach(tr => {
                if (tr.bonusStat && tr.bonusStat !== "Profession") {
                    traitStatBonuses[tr.bonusStat] += tr.level * 5;
                }
            });
            const effectiveStart = startStats[name] + (traitStatBonuses[name] || 0);
            if (v < effectiveStart)
                v = effectiveStart;
            currentCharacter.stats[name] = v;
            e.target.value = String(v);
            updateResources();
        };
        statValElements[name] = valInp;
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '4px';
        const btnMinus = document.createElement('button');
        btnMinus.textContent = '-';
        btnMinus.onclick = () => {
            const phase = currentCharacter.setup.phaseOfLife;
            const startStats = (0, resources_1.getStartingStatsForPhase)(phase);
            const traitStatBonuses = { Strength: 0, Dexterity: 0, Endurance: 0, Wisdom: 0, Intelligence: 0 };
            currentCharacter.traits.forEach(tr => {
                if (tr.bonusStat && tr.bonusStat !== "Profession") {
                    traitStatBonuses[tr.bonusStat] += tr.level * 5;
                }
            });
            const effectiveStart = startStats[name] + (traitStatBonuses[name] || 0);
            if (currentCharacter.stats[name] > effectiveStart) {
                currentCharacter.stats[name]--;
                valInp.value = String(currentCharacter.stats[name]);
                updateResources();
            }
        };
        const btnPlus = document.createElement('button');
        btnPlus.textContent = '+';
        btnPlus.onclick = () => {
            currentCharacter.stats[name]++;
            valInp.value = String(currentCharacter.stats[name]);
            updateResources();
        };
        controls.appendChild(btnMinus);
        controls.appendChild(btnPlus);
        row.appendChild(label);
        row.appendChild(valInp);
        row.appendChild(controls);
        statControls.appendChild(row);
    });
    console.log('Stat rows created.');
    syncUI();
    console.log('Initial syncUI complete.');
    // Tabs logic
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            var _a;
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const contentId = tab.dataset.tab;
            if (contentId) {
                (_a = document.getElementById(contentId)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
            }
        });
    });
    addTraitBtn.onclick = () => {
        currentCharacter.traits.push({ name: '', level: 1 });
        renderTraits();
        updateResources();
    };
    toggleMspBtn.onclick = () => {
        mspMinimized = !mspMinimized;
        updateMspPanelVisibility();
    };
    [dtStatUps, dtSkillUps, dtTraitUps, dtAbilityUps, apSpentInp].forEach(inp => {
        inp.oninput = () => {
            currentCharacter.downtime.statUps = parseInt(dtStatUps.value) || 0;
            currentCharacter.downtime.skillUps = parseInt(dtSkillUps.value) || 0;
            currentCharacter.downtime.traitUps = parseInt(dtTraitUps.value) || 0;
            currentCharacter.downtime.abilityOrWeaponUps = parseInt(dtAbilityUps.value) || 0;
            currentCharacter.abilityPointsSpent = parseInt(apSpentInp.value) || 0;
            updateResources();
        };
    });
}
/** Sync all UI values from currentCharacter */
function syncUI() {
    var _a, _b, _c, _d;
    charNameInput.value = currentCharacter.name;
    isNpcCheck.checked = currentCharacter.isNpc;
    polSelect.value = currentCharacter.setup.phaseOfLife;
    npcsInput.value = String(currentCharacter.setup.importantNpcCount);
    // Update stat input values manually to match loaded character
    Object.keys(currentCharacter.stats).forEach(name => {
        if (statValElements[name]) {
            statValElements[name].value = String(currentCharacter.stats[name]);
        }
    });
    renderSkills();
    renderMSPManager();
    renderTraits();
    // Downtime
    dtStatUps.value = String(((_a = currentCharacter.downtime) === null || _a === void 0 ? void 0 : _a.statUps) || 0);
    dtSkillUps.value = String(((_b = currentCharacter.downtime) === null || _b === void 0 ? void 0 : _b.skillUps) || 0);
    dtTraitUps.value = String(((_c = currentCharacter.downtime) === null || _c === void 0 ? void 0 : _c.traitUps) || 0);
    dtAbilityUps.value = String(((_d = currentCharacter.downtime) === null || _d === void 0 ? void 0 : _d.abilityOrWeaponUps) || 0);
    apSpentInp.value = String(currentCharacter.abilityPointsSpent || 0);
    updateResources();
}
function renderSkills() {
    skillList.innerHTML = '';
    currentCharacter.skills.forEach((skill, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.marginBottom = '8px';
        row.style.alignItems = 'center';
        // Custom Autocomplete Container
        const container = document.createElement('div');
        container.className = 'skill-autocomplete';
        const nameInp = document.createElement('input');
        nameInp.type = 'text';
        nameInp.value = skill.name;
        nameInp.placeholder = 'Skill(Specifier)';
        nameInp.style.width = '100%';
        nameInp.style.boxSizing = 'border-box';
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'skill-suggestions';
        const updateSuggestions = (val) => {
            suggestionsDiv.innerHTML = '';
            // Show all if empty, otherwise filter
            const filtered = val.length === 0
                ? [...skills_1.STANDARD_SKILLS]
                : skills_1.STANDARD_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            if (filtered.length) {
                filtered.forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = s;
                    item.onmousedown = (e) => {
                        e.preventDefault();
                        nameInp.value = s;
                        currentCharacter.skills[index].name = s;
                        suggestionsDiv.style.display = 'none';
                        renderMSPManager();
                        updateResources();
                    };
                    suggestionsDiv.appendChild(item);
                });
                suggestionsDiv.style.display = 'block';
            }
            else {
                suggestionsDiv.style.display = 'none';
            }
        };
        nameInp.oninput = (e) => {
            const val = e.target.value;
            currentCharacter.skills[index].name = val;
            updateSuggestions(val);
            renderMSPManager();
            updateResources();
        };
        nameInp.onfocus = () => updateSuggestions(nameInp.value);
        nameInp.onblur = () => { suggestionsDiv.style.display = 'none'; };
        container.appendChild(nameInp);
        container.appendChild(suggestionsDiv);
        const valInp = document.createElement('input');
        valInp.type = 'number';
        valInp.min = '0';
        valInp.max = '40';
        valInp.value = String(skill.value);
        valInp.style.width = '50px';
        valInp.oninput = (e) => {
            let v = parseInt(e.target.value) || 0;
            if (v < 0)
                v = 0;
            if (v > 40)
                v = 40;
            currentCharacter.skills[index].value = v;
            e.target.value = String(v);
            updateResources();
        };
        const suppressContainer = document.createElement('div');
        suppressContainer.style.display = 'flex';
        suppressContainer.style.alignItems = 'center';
        suppressContainer.style.gap = '4px';
        suppressContainer.style.fontSize = '0.7em';
        suppressContainer.title = "Suppress 'Custom Skill' warning for GM notes";
        const isStandard = (0, skills_1.isStandardSkill)(skill.name);
        if (!isStandard && skill.name.trim() !== '') {
            const suppressCheck = document.createElement('input');
            suppressCheck.type = 'checkbox';
            suppressCheck.checked = !!skill.isCustomNameSuppressed;
            suppressCheck.onchange = () => {
                currentCharacter.skills[index].isCustomNameSuppressed = suppressCheck.checked;
                updateResources();
            };
            const suppressLabel = document.createElement('label');
            suppressLabel.textContent = 'Ignore';
            suppressContainer.appendChild(suppressCheck);
            suppressContainer.appendChild(suppressLabel);
        }
        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.onclick = () => {
            currentCharacter.skills.splice(index, 1);
            renderSkills();
            renderMSPManager();
            updateResources();
        };
        row.appendChild(container);
        row.appendChild(valInp);
        row.appendChild(suppressContainer);
        row.appendChild(delBtn);
        skillList.appendChild(row);
    });
}
function renderMSPManager() {
    mspAssignments.innerHTML = '';
    // Only show skills that have been named
    const namedSkills = currentCharacter.skills.filter(s => s.name.trim() !== '');
    if (namedSkills.length === 0) {
        mspAssignments.innerHTML = '<p style="font-size:0.9em; color:#6b7280 italic">Add and name skills above to apply MSP</p>';
        return;
    }
    namedSkills.forEach((skill) => {
        // Find the actual index in the main skills array to update it
        const originalIndex = currentCharacter.skills.findIndex(s => s === skill);
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.style.gridTemplateColumns = '1fr 50px auto';
        const label = document.createElement('div');
        label.className = 'label';
        label.style.width = 'auto';
        label.textContent = skill.name;
        const valSpan = document.createElement('span');
        valSpan.style.fontWeight = 'bold';
        valSpan.style.textAlign = 'center';
        valSpan.textContent = String(skill.mspSpent || 0);
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '4px';
        const btnMinus = document.createElement('button');
        btnMinus.textContent = '-';
        btnMinus.disabled = (skill.mspSpent || 0) <= 0;
        btnMinus.onclick = () => {
            if ((skill.mspSpent || 0) > 0) {
                const oldMsp = skill.mspSpent || 0;
                const newMsp = oldMsp - 1;
                currentCharacter.skills[originalIndex].mspSpent = newMsp;
                // Subtract 5 from current value when removing MSP, but floor at 0
                const oldVal = currentCharacter.skills[originalIndex].value || 0;
                currentCharacter.skills[originalIndex].value = Math.max(0, oldVal - 5);
                renderSkills();
                renderMSPManager();
                updateResources();
            }
        };
        const btnPlus = document.createElement('button');
        btnPlus.textContent = '+';
        btnPlus.disabled = (skill.mspSpent || 0) >= 3;
        btnPlus.onclick = () => {
            if ((skill.mspSpent || 0) < 3) {
                const oldMsp = skill.mspSpent || 0;
                const newMsp = oldMsp + 1;
                currentCharacter.skills[originalIndex].mspSpent = newMsp;
                // Add 5 to current value when adding MSP, but cap at 40
                const oldVal = currentCharacter.skills[originalIndex].value || 0;
                currentCharacter.skills[originalIndex].value = Math.min(40, oldVal + 5);
                renderSkills();
                renderMSPManager();
                updateResources();
            }
        };
        controls.appendChild(btnMinus);
        controls.appendChild(btnPlus);
        row.appendChild(label);
        row.appendChild(valSpan);
        row.appendChild(controls);
        mspAssignments.appendChild(row);
    });
}
function renderTraits() {
    traitList.innerHTML = '';
    if (!currentCharacter.traits)
        currentCharacter.traits = [];
    currentCharacter.traits.forEach((trait, index) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.marginBottom = '8px';
        row.style.alignItems = 'center';
        const nameInp = document.createElement('input');
        nameInp.type = 'text';
        nameInp.value = trait.name;
        nameInp.placeholder = 'Trait Name';
        nameInp.style.flex = '1';
        nameInp.oninput = (e) => {
            currentCharacter.traits[index].name = e.target.value;
            updateResources();
        };
        const bonusSel = document.createElement('select');
        bonusSel.style.width = '90px';
        const options = ["", "Strength", "Dexterity", "Endurance", "Wisdom", "Intelligence", "Profession"];
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt || "None";
            bonusSel.appendChild(o);
        });
        bonusSel.value = trait.bonusStat || "";
        bonusSel.onchange = () => {
            currentCharacter.traits[index].bonusStat = bonusSel.value || undefined;
            updateResources();
        };
        const levelInp = document.createElement('input');
        levelInp.type = 'number';
        levelInp.min = '-10';
        levelInp.max = '10';
        levelInp.value = String(trait.level);
        levelInp.style.width = '60px';
        levelInp.oninput = (e) => {
            let v = parseInt(e.target.value) || 0;
            if (v < -10)
                v = -10;
            if (v > 10)
                v = 10;
            currentCharacter.traits[index].level = v;
            e.target.value = String(v);
            updateResources();
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.onclick = () => {
            currentCharacter.traits.splice(index, 1);
            renderTraits();
            updateResources();
        };
        row.appendChild(nameInp);
        row.appendChild(bonusSel);
        row.appendChild(levelInp);
        row.appendChild(delBtn);
        traitList.appendChild(row);
    });
}
function updateResources() {
    // Update simple fields in state
    currentCharacter.name = charNameInput.value;
    currentCharacter.isNpc = isNpcCheck.checked;
    currentCharacter.setup.phaseOfLife = polSelect.value;
    currentCharacter.setup.importantNpcCount = parseInt(npcsInput.value) || 0;
    let totalTraitCost = 0;
    let traitRefunds = false;
    const traitStatBonuses = { Strength: 0, Dexterity: 0, Endurance: 0, Wisdom: 0, Intelligence: 0 };
    if (!currentCharacter.traits)
        currentCharacter.traits = [];
    currentCharacter.traits.forEach(tr => {
        const cost = (0, logic_1.calculateTraitUpgradeCost)(0, tr.level);
        totalTraitCost += cost;
        if (cost < 0)
            traitRefunds = true;
        if (tr.bonusStat && tr.bonusStat !== "Profession") {
            traitStatBonuses[tr.bonusStat] += tr.level * 5;
        }
    });
    const phase = currentCharacter.setup.phaseOfLife;
    const startStats = (0, resources_1.getStartingStatsForPhase)(phase);
    // Ensure stats are not below effective minimum (startStat + traitBonus)
    Object.keys(currentCharacter.stats).forEach(name => {
        const effectiveMin = startStats[name] + (traitStatBonuses[name] || 0);
        if (currentCharacter.stats[name] < effectiveMin) {
            currentCharacter.stats[name] = effectiveMin;
        }
    });
    // Update stat displays
    Object.keys(currentCharacter.stats).forEach(name => {
        if (document.activeElement !== statValElements[name]) {
            statValElements[name].value = String(currentCharacter.stats[name]);
        }
        const bonusEl = document.getElementById(`bonus-${name}`);
        if (bonusEl) {
            const bonus = traitStatBonuses[name] || 0;
            bonusEl.textContent = bonus > 0 ? `(+${bonus})` : '';
            bonusEl.title = `Total: ${currentCharacter.stats[name]}`;
        }
    });
    const maxNpcs = (0, resources_1.getPhaseCount)(phase);
    npcsInput.max = String(maxNpcs);
    npcHelp.textContent = `(Max: ${maxNpcs})`;
    const resources = (0, resources_1.computeResources)(currentCharacter.setup);
    if (startingStatDisplay)
        startingStatDisplay.textContent = String(startStats.Strength);
    // Calculate Stat Costs
    let totalStatCost = 0;
    let statRefunds = false;
    Object.keys(currentCharacter.stats).forEach(s => {
        const effectiveStartStat = startStats[s] + (traitStatBonuses[s] || 0);
        const change = (0, logic_1.getStatChangeCost)(effectiveStartStat, currentCharacter.stats[s]);
        totalStatCost += change.cost;
        if (change.refund)
            statRefunds = true;
    });
    // Calculate Skill Costs
    let totalSkillCost = 0;
    let skillRefunds = false;
    // Check for custom skill names using validation tool logic
    const gmNotes = (0, validation_1.emptyGmNotes)();
    currentCharacter.skills.forEach(sk => {
        const mspValue = (0, logic_1.applyMajorSkillPoints)(sk.mspSpent || 0);
        const change = (0, logic_1.getSkillChangeCost)(mspValue, sk.value);
        totalSkillCost += change.cost;
        if (change.refund)
            skillRefunds = true;
        (0, validation_1.checkCustomSkillName)(sk.name, gmNotes, sk.isCustomNameSuppressed);
    });
    const mspSpentTotal = currentCharacter.skills.reduce((sum, sk) => sum + (sk.mspSpent || 0), 0);
    const mspLeft = resources.majorSkillPoints - mspSpentTotal;
    // Resources Left
    const dt = currentCharacter.downtime || { statUps: 0, skillUps: 0, traitUps: 0, abilityOrWeaponUps: 0 };
    const sLeft = (resources.statUps + dt.statUps) - totalStatCost;
    const skLeft = (resources.skillUps + dt.skillUps) - totalSkillCost;
    const trLeft = (resources.traitUps + dt.traitUps) - totalTraitCost;
    // Resource Display
    statRes.textContent = String(sLeft);
    statRes.className = sLeft < 0 ? 'resource-val negative' : 'resource-val';
    skillRes.textContent = String(skLeft);
    skillRes.className = skLeft < 0 ? 'resource-val negative' : 'resource-val';
    traitRes.textContent = String(trLeft);
    traitRes.className = trLeft < 0 ? 'resource-val negative' : 'resource-val';
    mspRes.textContent = String(mspLeft);
    mspRes.className = mspLeft < 0 ? 'resource-val negative' : 'resource-val';
    // Auto-minimize MSP if all spent and not already minimized
    if (mspLeft === 0 && !mspMinimized && mspSpentTotal > 0) {
        mspMinimized = true;
        updateMspPanelVisibility();
    }
    else if (mspLeft > 0 && mspMinimized) {
        // Auto-expand if points become available again (e.g. changing POL)
        mspMinimized = false;
        updateMspPanelVisibility();
    }
    const apLeft = resources.abilityPoints - (currentCharacter.abilityPointsSpent || 0);
    apRes.textContent = String(apLeft);
    apRes.className = apLeft < 0 ? 'resource-val negative' : 'resource-val';
    // GM Notes
    const reasons = [...gmNotes.reasons];
    if (mspLeft < 0)
        reasons.push(`Overspent Major Skill Points (${-mspLeft})`);
    if (apLeft < 0)
        reasons.push(`Overspent Ability Points (${-apLeft})`);
    if (phase === constants_1.PhaseOfLife.Elder)
        reasons.push('Elder Phase (requires GM discussion on longevity/decline)');
    if (statRefunds)
        reasons.push('Stat value decreased (requires GM approval for point refund)');
    if (skillRefunds)
        reasons.push('Skill value decreased (requires GM approval for point refund)');
    if (trLeft < 0)
        reasons.push(`Overspent Trait UPs (${-trLeft})`);
    if (traitRefunds)
        reasons.push('Trait level decreased (requires GM approval for point refund)');
    if (currentCharacter.setup.importantNpcCount > maxNpcs)
        reasons.push(`NPC count (${currentCharacter.setup.importantNpcCount}) exceeds phase limit (${maxNpcs})`);
    if (reasons.length) {
        gmReasonsSpan.textContent = reasons.join(', ');
        gmNotesDiv.style.display = '';
    }
    else {
        gmNotesDiv.style.display = 'none';
    }
    charDisplayName.textContent = currentCharacter.name || 'New Character';
    // Hide debug in production distribution
    debugOutput.style.display = 'none';
    debugOutput.textContent = JSON.stringify(currentCharacter, null, 2);
}
function updateMspPanelVisibility() {
    if (mspMinimized) {
        mspContent.style.display = 'none';
        toggleMspBtn.textContent = 'Expand';
    }
    else {
        mspContent.style.display = 'block';
        toggleMspBtn.textContent = 'Minimize';
    }
}
function listSaves() {
    fileList.innerHTML = '';
    const mkItem = (name, fullPath, isNpc) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.textContent = `${isNpc ? '[NPC]' : '[CHAR]'} ${name}`;
        div.onclick = () => {
            try {
                const data = fs.readJsonSync(fullPath);
                currentCharacter = data;
                syncUI();
                saveStatus.textContent = `Loaded ${data.name}`;
                loadModal.style.display = 'none';
            }
            catch (e) {
                alert('Error loading file');
            }
        };
        return div;
    };
    const chars = fs.existsSync(CHAR_DIR) ? fs.readdirSync(CHAR_DIR) : [];
    chars.filter(f => f.endsWith('.json')).forEach(f => {
        fileList.appendChild(mkItem(f.replace('.json', ''), path.join(CHAR_DIR, f), false));
    });
    const npcs = fs.existsSync(NPC_DIR) ? fs.readdirSync(NPC_DIR) : [];
    npcs.filter(f => f.endsWith('.json')).forEach(f => {
        fileList.appendChild(mkItem(f.replace('.json', ''), path.join(NPC_DIR, f), true));
    });
    if (fileList.innerHTML === '') {
        fileList.innerHTML = '<div style="padding:10px; color:#666">No saved files found</div>';
    }
}
saveBtn.onclick = () => {
    if (!currentCharacter.name) {
        alert("Please enter a name");
        return;
    }
    const folder = currentCharacter.isNpc ? NPC_DIR : CHAR_DIR;
    const filename = `${currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    const filePath = path.join(folder, filename);
    fs.writeJsonSync(filePath, currentCharacter, { spaces: 2 });
    saveStatus.textContent = `Saved to ${currentCharacter.isNpc ? 'npcs/' : 'characters/'}${filename}`;
};
loadBtn.onclick = () => {
    listSaves();
    loadModal.style.display = 'flex';
};
closeModalBtn.onclick = () => {
    loadModal.style.display = 'none';
};
addSkillBtn.onclick = () => {
    currentCharacter.skills.push({ name: '', value: 0, mspSpent: 0 });
    renderSkills();
    renderMSPManager();
    updateResources();
};
charNameInput.oninput = updateResources;
isNpcCheck.onchange = updateResources;
polSelect.onchange = () => {
    console.log('POL changed to:', polSelect.value);
    // DO NOT reset stats here anymore
    updateResources();
};
npcsInput.oninput = updateResources;
const __g = window;
if (__g.__tamsRendererInitialized) {
    console.warn('renderer.ts: init() skipped (already initialized)');
}
else {
    __g.__tamsRendererInitialized = true;
    init();
    console.log('renderer.ts: init() called at end of file');
}
