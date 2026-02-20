"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStatUpgradeCost = calculateStatUpgradeCost;
exports.calculateSkillUpgradeCost = calculateSkillUpgradeCost;
exports.getStatChangeCost = getStatChangeCost;
exports.getSkillChangeCost = getSkillChangeCost;
exports.calculateTraitUpgradeCost = calculateTraitUpgradeCost;
exports.getTraitChangeCost = getTraitChangeCost;
exports.applyMajorSkillPoints = applyMajorSkillPoints;
function calculateStatUpgradeCost(from, to) {
    let totalCost = 0;
    for (let current = from; current < to; current++) {
        const cost = Math.max(1, Math.floor(current / 10));
        totalCost += cost;
    }
    return totalCost;
}
function calculateSkillUpgradeCost(from, to) {
    let totalCost = 0;
    for (let current = from + 1; current <= to; current++) {
        totalCost += current;
    }
    return totalCost;
}
function getStatChangeCost(from, to) {
    if (to === from)
        return { cost: 0, refund: false };
    if (to > from) {
        return { cost: calculateStatUpgradeCost(from, to), refund: false };
    }
    else {
        // Refund path (requires GM approval)
        return { cost: -calculateStatUpgradeCost(to, from), refund: true };
    }
}
function getSkillChangeCost(from, to) {
    if (to === from)
        return { cost: 0, refund: false };
    if (to > from) {
        return { cost: calculateSkillUpgradeCost(from, to), refund: false };
    }
    else {
        // Refund path (requires GM approval)
        return { cost: -calculateSkillUpgradeCost(to, from), refund: true };
    }
}
function calculateTraitUpgradeCost(from, to) {
    let totalCost = 0;
    // from is current level, to is target level.
    // going from 1 to 2 costs 2.
    // going from 1 to 3 costs 2 + 3 = 5.
    // We use absolute values for negative traits to calculate cost
    const start = Math.abs(from);
    const end = Math.abs(to);
    if (end > start) {
        for (let current = start + 1; current <= end; current++) {
            totalCost += current;
        }
    }
    else if (end < start) {
        for (let current = end + 1; current <= start; current++) {
            totalCost -= current;
        }
    }
    return totalCost;
}
function getTraitChangeCost(from, to) {
    if (to === from)
        return { cost: 0, refund: false };
    const cost = calculateTraitUpgradeCost(from, to);
    return { cost, refund: cost < 0 };
}
function applyMajorSkillPoints(points) {
    if (points === 1)
        return 5;
    if (points === 2)
        return 10;
    if (points === 3)
        return 15;
    if (points === 4)
        return 20;
    if (points >= 5)
        return 25;
    return 0;
}
