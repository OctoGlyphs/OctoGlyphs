export const BASE_STATS = {
    swimSpeed: 1,
    magnetRange: 1,
    gemValue: 1,
    luck: 1,
    damage: 1,
    armor: 0,
    idleEfficiency: 1
};

const STAT_LABELS = {
    swimSpeed: "Swim Speed",
    magnetRange: "Magnet",
    gemValue: "Gem Value",
    luck: "Luck",
    damage: "Damage",
    armor: "Armor",
    idleEfficiency: "Idle Efficiency"
};

const STAT_ORDER = ["swimSpeed", "magnetRange", "gemValue", "luck", "damage", "armor", "idleEfficiency"];

export function calculateStats(equippedAssets) {
    const stats = { ...BASE_STATS };

    for (const asset of equippedAssets) {
        if (!asset?.statMods) continue;
        for (const [key, value] of Object.entries(asset.statMods)) {
            stats[key] = Number((stats[key] || 0) + Number(value || 0));
        }
    }

    stats.swimSpeed = Math.max(0.55, stats.swimSpeed);
    stats.magnetRange = Math.max(0.5, stats.magnetRange);
    stats.gemValue = Math.max(0.5, stats.gemValue);
    stats.luck = Math.max(0.5, stats.luck);
    stats.damage = Math.max(0.5, stats.damage);
    stats.armor = Math.max(0, stats.armor);
    stats.idleEfficiency = Math.max(0.5, stats.idleEfficiency);

    return stats;
}

export function formatStatMods(statMods = {}) {
    const parts = [];
    for (const [key, value] of Object.entries(statMods)) {
        if (!value) continue;
        const label = STAT_LABELS[key] || key;
        const sign = value > 0 ? "+" : "";
        const suffix = key === "armor" ? "" : "x";
        parts.push(`${label} ${sign}${value}${suffix}`);
    }
    return parts.join(", ") || "No stat change";
}

export function statDeltaParts(currentStats, nextStats) {
    const parts = [];

    for (const key of STAT_ORDER) {
        const before = Number(currentStats?.[key] || 0);
        const after = Number(nextStats?.[key] || 0);
        const delta = Number((after - before).toFixed(2));
        if (!delta) continue;

        const label = STAT_LABELS[key] || key;
        const sign = delta > 0 ? "+" : "";
        const suffix = key === "armor" ? "" : "x";
        parts.push({
            key,
            label,
            delta,
            direction: delta > 0 ? "up" : "down",
            text: `${label} ${sign}${delta.toFixed(key === "armor" ? 1 : 2)}${suffix}`
        });
    }

    return parts;
}

export function formatStatDelta(currentStats, nextStats) {
    const parts = statDeltaParts(currentStats, nextStats).map(part => part.text);
    return parts.join(" · ") || "No stat change";
}

export function formatFinalStats(stats) {
    return [
        `Speed ${stats.swimSpeed.toFixed(2)}x`,
        `Magnet ${stats.magnetRange.toFixed(2)}x`,
        `Gem ${stats.gemValue.toFixed(2)}x`,
        `Luck ${stats.luck.toFixed(2)}x`,
        `Idle ${stats.idleEfficiency.toFixed(2)}x`,
        `Armor ${stats.armor.toFixed(1)}`
    ].join(" · ");
}
