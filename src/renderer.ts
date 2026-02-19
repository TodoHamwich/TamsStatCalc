import { PhaseOfLife } from './constants';
import { computeResources, getStartingStatsForPhase, getPhaseCount } from './resources';
import { applyMajorSkillPoints, getSkillChangeCost, getStatChangeCost } from './logic';
import { CharacterData, Stats, Skill } from './types';
import { checkCustomSkillName, emptyGmNotes } from './validation';
import { STANDARD_SKILLS } from './skills';
import * as fs from 'fs-extra';
import * as path from 'path';

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
    if (!fs.existsSync(dir)) fs.mkdirpSync(dir);
});

// UI State
let currentCharacter: CharacterData = {
    name: '',
    isNpc: false,
    setup: { phaseOfLife: PhaseOfLife.EarlyAdulthood, importantNpcCount: 0 },
    stats: getStartingStatsForPhase(PhaseOfLife.EarlyAdulthood),
    skills: [],
    majorSkillPointsSpent: 0
};

// DOM Elements
const charNameInput = document.getElementById('charName') as HTMLInputElement;
const isNpcCheck = document.getElementById('isNpc') as HTMLInputElement;
const polSelect = document.getElementById('pol') as HTMLSelectElement;
const npcsInput = document.getElementById('npcs') as HTMLInputElement;
const npcHelp = document.getElementById('npcHelp') as HTMLSpanElement;
const gmNotesDiv = document.getElementById('gmNotes') as HTMLDivElement;
const gmReasonsSpan = document.getElementById('gmReasons') as HTMLSpanElement;

const statRes = document.getElementById('statRes') as HTMLSpanElement;
const skillRes = document.getElementById('skillRes') as HTMLSpanElement;
const mspRes = document.getElementById('mspRes') as HTMLSpanElement;

const statControls = document.getElementById('statControls') as HTMLDivElement;
const skillList = document.getElementById('skillList') as HTMLDivElement;
const debugOutput = document.getElementById('debugOutput') as HTMLPreElement;

const loadModal = document.getElementById('loadModal') as HTMLDivElement;
const fileList = document.getElementById('fileList') as HTMLDivElement;
const closeModalBtn = document.getElementById('closeModalBtn') as HTMLButtonElement;

const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement;
const addSkillBtn = document.getElementById('addSkillBtn') as HTMLButtonElement;
const charDisplayName = document.getElementById('charDisplayName') as HTMLDivElement;
const saveStatus = document.getElementById('saveStatus') as HTMLDivElement;

const statValElements: Record<string, HTMLInputElement> = {};

function init() {
    console.log('Initializing renderer...');
    console.log('polSelect element:', polSelect);
    console.log('statControls element:', statControls);

    if (!polSelect || !statControls) {
        console.error('CRITICAL: Required DOM elements not found during init!');
        return;
    }

    Object.values(PhaseOfLife).forEach(label => {
        const opt = document.createElement('option');
        opt.value = label;
        opt.textContent = label;
        polSelect.appendChild(opt);
    });
    console.log('POL options added. Count:', polSelect.options.length);
    
    // Create static stat rows
    statControls.innerHTML = '';
    const statNames: (keyof Stats)[] = ['Strength', 'Dexterity', 'Endurance', 'Wisdom', 'Intelligence'];
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
            currentCharacter.stats[name] = parseInt((e.target as HTMLInputElement).value) || 0;
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
    (Object.keys(currentCharacter.stats) as (keyof Stats)[]).forEach(name => {
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
        
        const updateSuggestions = (val: string) => {
            suggestionsDiv.innerHTML = '';
            // Show all if empty, otherwise filter
            const filtered = val.length === 0 
                ? [...STANDARD_SKILLS] 
                : STANDARD_SKILLS.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            
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
            } else {
                suggestionsDiv.style.display = 'none';
            }
        };

        nameInp.oninput = (e) => { 
            const val = (e.target as HTMLInputElement).value;
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
            currentCharacter.skills[index].value = parseInt((e.target as HTMLInputElement).value) || 0;
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
            currentCharacter.skills[index].mspSpent = parseInt((e.target as HTMLInputElement).value) || 0;
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
    currentCharacter.setup.phaseOfLife = polSelect.value as PhaseOfLife;
    currentCharacter.setup.importantNpcCount = parseInt(npcsInput.value) || 0;

    // Update stat displays (avoiding focus loss if possible, though numbers are mostly updated via btn or init)
    (Object.keys(currentCharacter.stats) as (keyof Stats)[]).forEach(name => {
        if (document.activeElement !== statValElements[name]) {
            statValElements[name].value = String(currentCharacter.stats[name]);
        }
    });

    const phase = currentCharacter.setup.phaseOfLife;
    const maxNpcs = getPhaseCount(phase);
    npcsInput.max = String(maxNpcs);
    npcHelp.textContent = `(Max: ${maxNpcs})`;

    const resources = computeResources(currentCharacter.setup);
    const startStats = getStartingStatsForPhase(phase);

    // Calculate Stat Costs
    let totalStatCost = 0;
    let statRefunds = false;
    (Object.keys(currentCharacter.stats) as (keyof Stats)[]).forEach(s => {
        const change = getStatChangeCost(startStats[s], currentCharacter.stats[s]);
        totalStatCost += change.cost;
        if (change.refund) statRefunds = true;
    });

    // Calculate Skill Costs
    let totalSkillCost = 0;
    let skillRefunds = false;
    const mspValue = applyMajorSkillPoints(currentCharacter.majorSkillPointsSpent);
    
    // Check for custom skill names using validation tool logic
    const gmNotes = emptyGmNotes();
    currentCharacter.skills.forEach(sk => {
        const mspValue = applyMajorSkillPoints(sk.mspSpent || 0);
        const change = getSkillChangeCost(mspValue, sk.value);
        totalSkillCost += change.cost;
        if (change.refund) skillRefunds = true;
        checkCustomSkillName(sk.name, gmNotes);
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
    const reasons: string[] = [...gmNotes.reasons];
    if (mspLeft < 0) reasons.push('Overspent Major Skill Points');
    if (phase === PhaseOfLife.Elder) reasons.push('Elder Phase');
    if (statRefunds) reasons.push('Stat decrease');
    if (skillRefunds) reasons.push('Skill decrease');
    if (currentCharacter.setup.importantNpcCount > maxNpcs) reasons.push('NPC count over limit');

    if (reasons.length) {
        gmReasonsSpan.textContent = reasons.join(', ');
        gmNotesDiv.style.display = '';
    } else {
        gmNotesDiv.style.display = 'none';
    }

    charDisplayName.textContent = currentCharacter.name || 'New Character';
    // Hide debug in production distribution
    debugOutput.style.display = 'none';
    debugOutput.textContent = JSON.stringify(currentCharacter, null, 2);
}

function listSaves() {
    fileList.innerHTML = '';
    const mkItem = (name: string, fullPath: string, isNpc: boolean) => {
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
            } catch (e) {
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

const __g: any = window as any;
if (__g.__tamsRendererInitialized) {
    console.warn('renderer.ts: init() skipped (already initialized)');
} else {
    __g.__tamsRendererInitialized = true;
    init();
    console.log('renderer.ts: init() called at end of file');
}
