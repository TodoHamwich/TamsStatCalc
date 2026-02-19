"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STANDARD_SKILLS = void 0;
exports.isStandardSkill = isStandardSkill;
exports.STANDARD_SKILLS = [
    // Athletics
    "Athletics(Climbing)",
    "Athletics(Running)",
    "Athletics(Jumping)",
    "Athletics(Swimming)",
    "Athletics(Grappling)",
    "Athletics(Throwing)",
    // Stealth
    "Stealth(Sneaking)",
    "Stealth(Camouflage)",
    "Stealth(Pickpocketing)",
    "Stealth(Lockpicking)",
    // Perception
    "Perception(Sight)",
    "Perception(Hearing)",
    "Perception(Smell)",
    "Perception(Taste)",
    "Perception(Touch)",
    "Perception(Intuition)",
    // Survival
    "Survival(Tracking)",
    "Survival(Foraging)",
    "Survival(Shelter)",
    "Survival(Fire)",
    "Survival(Cooking)",
    "Survival(Natural Medicines)",
    // Crafting
    "Crafting(Smithing)",
    "Crafting(Carpentry)",
    "Crafting(Leatherworking)",
    "Crafting(Tailoring)",
    "Crafting(Alchemy)",
    // Lore
    "Lore(History)",
    "Lore(Geography)",
    "Lore(Nature)",
    "Lore(Arcana)",
    "Lore(Religion)",
    "Lore(Cultures)",
    // Social
    "Social(Persuasion)",
    "Social(Deception)",
    "Social(Intimidation)",
    "Social(Etiquette)",
    "Social(Negotiation)",
    // Medicine
    "Medicine(First Aid)",
    "Medicine(Surgery)",
    "Medicine(Herbalism)",
    "Medicine(Diagnosis)",
    // Engineering
    "Engineering(Mechanics)",
    "Engineering(Tinkering)",
    "Engineering(Architecture)",
    "Engineering(Siegecraft)",
    // Riding & Navigation
    "Riding(Horses)",
    "Riding(Exotic Mounts)",
    "Navigation(Map Reading)",
    "Navigation(Star Navigation)",
    "Navigation(Wayfinding)",
    // Performance
    "Performance(Music)",
    "Performance(Dance)",
    "Performance(Acting)",
    "Performance(Storytelling)",
    // Magic/Gifts (generic, non-copyrighted)
    "Magic(Evocation)",
    "Magic(Illusion)",
    "Magic(Divination)",
    "Magic(Restoration)"
];
function isStandardSkill(name) {
    return exports.STANDARD_SKILLS.includes(name);
}
