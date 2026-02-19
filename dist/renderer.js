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
    majorSkillPointsSpent: 0
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
const mspRes = document.getElementById('mspRes');
const statControls = document.getElementById('statControls');
const skillList = document.getElementById('skillList');
const debugOutput = document.getElementById('debugOutput');
const loadModal = document.getElementById('loadModal');
const fileList = document.getElementById('fileList');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const addSkillBtn = document.getElementById('addSkillBtn');
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
        label.textContent = name;
        const valInp = document.createElement('input');
        valInp.type = 'number';
        valInp.style.fontWeight = 'bold';
        valInp.style.width = '50px';
        valInp.oninput = (e) => {
            currentCharacter.stats[name] = parseInt(e.target.value) || 0;
            updateResources();
        };
        statValElements[name] = valInp;
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '4px';
        const btnMinus = document.createElement('button');
        btnMinus.textContent = '-';
        btnMinus.onclick = () => {
            currentCharacter.stats[name]--;
            valInp.value = String(currentCharacter.stats[name]);
            updateResources();
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
}
/** Sync all UI values from currentCharacter */
function syncUI() {
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
            currentCharacter.skills[index].value = parseInt(e.target.value) || 0;
            updateResources();
        };
        const mspInp = document.createElement('input');
        mspInp.type = 'number';
        mspInp.min = '0';
        mspInp.max = '3';
        mspInp.value = String(skill.mspSpent || 0);
        mspInp.style.width = '40px';
        mspInp.title = 'MSP spent on this skill (1:5, 2:10, 3:15)';
        mspInp.oninput = (e) => {
            currentCharacter.skills[index].mspSpent = parseInt(e.target.value) || 0;
            updateResources();
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = '×';
        delBtn.onclick = () => {
            currentCharacter.skills.splice(index, 1);
            renderSkills();
            updateResources();
        };
        row.appendChild(container);
        row.appendChild(mspInp);
        row.appendChild(valInp);
        row.appendChild(delBtn);
        skillList.appendChild(row);
    });
}
function updateResources() {
    // Update simple fields in state
    currentCharacter.name = charNameInput.value;
    currentCharacter.isNpc = isNpcCheck.checked;
    currentCharacter.setup.phaseOfLife = polSelect.value;
    currentCharacter.setup.importantNpcCount = parseInt(npcsInput.value) || 0;
    // Update stat displays (avoiding focus loss if possible, though numbers are mostly updated via btn or init)
    Object.keys(currentCharacter.stats).forEach(name => {
        if (document.activeElement !== statValElements[name]) {
            statValElements[name].value = String(currentCharacter.stats[name]);
        }
    });
    const phase = currentCharacter.setup.phaseOfLife;
    const maxNpcs = (0, resources_1.getPhaseCount)(phase);
    npcsInput.max = String(maxNpcs);
    npcHelp.textContent = `(Max: ${maxNpcs})`;
    const resources = (0, resources_1.computeResources)(currentCharacter.setup);
    const startStats = (0, resources_1.getStartingStatsForPhase)(phase);
    // Calculate Stat Costs
    let totalStatCost = 0;
    let statRefunds = false;
    Object.keys(currentCharacter.stats).forEach(s => {
        const change = (0, logic_1.getStatChangeCost)(startStats[s], currentCharacter.stats[s]);
        totalStatCost += change.cost;
        if (change.refund)
            statRefunds = true;
    });
    // Calculate Skill Costs
    let totalSkillCost = 0;
    let skillRefunds = false;
    const mspValue = (0, logic_1.applyMajorSkillPoints)(currentCharacter.majorSkillPointsSpent);
    // Check for custom skill names using validation tool logic
    const gmNotes = (0, validation_1.emptyGmNotes)();
    currentCharacter.skills.forEach(sk => {
        const mspValue = (0, logic_1.applyMajorSkillPoints)(sk.mspSpent || 0);
        const change = (0, logic_1.getSkillChangeCost)(mspValue, sk.value);
        totalSkillCost += change.cost;
        if (change.refund)
            skillRefunds = true;
        (0, validation_1.checkCustomSkillName)(sk.name, gmNotes);
    });
    const mspSpentTotal = currentCharacter.skills.reduce((sum, sk) => sum + (sk.mspSpent || 0), 0);
    const mspLeft = resources.majorSkillPoints - mspSpentTotal;
    // Resources Left
    const sLeft = resources.statUps - totalStatCost;
    const skLeft = resources.skillUps - totalSkillCost;
    // Resource Display
    statRes.textContent = String(sLeft);
    statRes.className = sLeft < 0 ? 'resource-val negative' : 'resource-val';
    skillRes.textContent = String(skLeft);
    skillRes.className = skLeft < 0 ? 'resource-val negative' : 'resource-val';
    mspRes.textContent = String(mspLeft);
    mspRes.className = mspLeft < 0 ? 'resource-val negative' : 'resource-val';
    // GM Notes
    const reasons = [...gmNotes.reasons];
    if (mspLeft < 0)
        reasons.push('Overspent Major Skill Points');
    if (phase === constants_1.PhaseOfLife.Elder)
        reasons.push('Elder Phase');
    if (statRefunds)
        reasons.push('Stat decrease');
    if (skillRefunds)
        reasons.push('Skill decrease');
    if (currentCharacter.setup.importantNpcCount > maxNpcs)
        reasons.push('NPC count over limit');
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
