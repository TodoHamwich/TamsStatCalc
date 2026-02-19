export function calculateStatUpgradeCost(from: number, to: number): number {
    let totalCost = 0;
    for (let current = from; current < to; current++) {
        const cost = Math.max(1, Math.floor(current / 10));
        totalCost += cost;
    }
    return totalCost;
}

export function calculateSkillUpgradeCost(from: number, to: number): number {
    let totalCost = 0;
    for (let current = from + 1; current <= to; current++) {
        totalCost += current;
    }
    return totalCost;
}

export function getStatChangeCost(from: number, to: number): { cost: number; refund: boolean } {
    if (to === from) return { cost: 0, refund: false };
    if (to > from) {
        return { cost: calculateStatUpgradeCost(from, to), refund: false };
    } else {
        // Refund path (requires GM approval)
        return { cost: -calculateStatUpgradeCost(to, from), refund: true };
    }
}

export function getSkillChangeCost(from: number, to: number): { cost: number; refund: boolean } {
    if (to === from) return { cost: 0, refund: false };
    if (to > from) {
        return { cost: calculateSkillUpgradeCost(from, to), refund: false };
    } else {
        // Refund path (requires GM approval)
        return { cost: -calculateSkillUpgradeCost(to, from), refund: true };
    }
}

export function calculateTraitUpgradeCost(from: number, to: number): number {
    let totalCost = 0;
    // from is current level, to is target level.
    // going from 1 to 2 costs 2.
    // going from 1 to 3 costs 2 + 3 = 5.
    for (let current = from + 1; current <= to; current++) {
        totalCost += current;
    }
    return totalCost;
}

export function getTraitChangeCost(from: number, to: number): { cost: number; refund: boolean } {
    if (to === from) return { cost: 0, refund: false };
    if (to > from) {
        return { cost: calculateTraitUpgradeCost(from, to), refund: false };
    } else {
        return { cost: -calculateTraitUpgradeCost(to, from), refund: true };
    }
}

export function applyMajorSkillPoints(points: number): number {
    if (points === 1) return 5;
    if (points === 2) return 10;
    if (points === 3) return 15;
    if (points === 4) return 20;
    if (points >= 5) return 25;
    return 0;
}
