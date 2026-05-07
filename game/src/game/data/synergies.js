import { ALL_ASSETS } from "./assetCatalog.js";

// ============================================================================
// SYNERGY SYSTEM — named set bonuses + emergent Isaac-style theme bonuses
// Check equipped item IDs → exact recipes and stacked huntMod themes → apply bonus
// ============================================================================

/**
 * Each synergy:
 *   id        — unique key
 *   name      — display name (shown in banner + loadout tease)
 *   items     — array of asset IDs required to activate, for exact recipes
 *   themeKeys — huntMod keys that count toward an emergent theme synergy
 *   threshold — distinct equipped traits needed for an emergent theme synergy
 *   bonus     — huntMods object applied on top of existing loadout
 *   statBonus — statMods object applied to idle/persistent stats
 *   desc      — player-facing description
 *   color     — hex color for the banner glow
 */
export const SYNERGIES = [
    {
        id: "pirate-king",
        name: "⚓ Pirate King",
        items: ["hat-pirate-hat", "clothes-pirate-outfit", "eyes-eye-patch"],
        bonus: { gemPulse: 1, broadside: 1, critChance: 0.06 },
        statBonus: { gemValue: 0.12, luck: 0.06 },
        desc: "Full pirate set: every gem haul feeds broadside plunder volleys",
        color: "#ffcc00"
    },
    {
        id: "full-metal",
        name: "🛡️ Full Metal",
        items: ["body-metal", "hat-military-helmet", "clothes-trench-coat"],
        bonus: { maxHp: 2, guardianCharges: 1, spinPower: 1 },
        statBonus: { armor: 0.55 },
        desc: "Iron wall: starts tougher and retaliates when enemies get close",
        color: "#8899aa"
    },
    {
        id: "speed-demon",
        name: "⚡ Speed Demon",
        items: ["body-aqua", "hat-propeller-hat", "boost-coffee"],
        bonus: { swimSpeed: 1.18, wakeTrail: 1, fireDelay: 0.92 },
        statBonus: { swimSpeed: 0.10 },
        desc: "Blazing speed: wake damage scales from constant motion",
        color: "#44ddff"
    },
    {
        id: "tech-lord",
        name: "🔧 Tech Lord",
        items: ["hat-circuit-board-crown", "eyes-vr-goggles", "body-deathbot"],
        bonus: { chain: 1, homing: 1, inkMines: 1 },
        statBonus: { damage: 0.08, magnetRange: 0.06 },
        desc: "Machine mind: periodic smart chain shots and mine support",
        color: "#00ff88"
    },
    {
        id: "ninja",
        name: "🥷 Ninja",
        items: ["clothes-black-kimono", "hat-black-bandana", "boost-katana"],
        bonus: { pierce: 1, fear: 1, critChance: 0.10, swimSpeed: 1.08 },
        statBonus: { damage: 0.08, swimSpeed: 0.06 },
        desc: "Silent killer: fast piercing crits that make enemies panic",
        color: "#333333"
    },
    {
        id: "berserker",
        name: "🔥 Berserker",
        items: ["body-magma", "hat-red-lazer-eyes", "boost-nunchucks"],
        bonus: { damageBonus: 2, lumpOfCoal: 1, orbit: 1 },
        statBonus: { damage: 0.10 },
        desc: "Volcanic rage: growing bullets and close-range whirling damage",
        color: "#ff4422"
    },
    {
        id: "clown-fiesta",
        name: "🤡 Clown Fiesta",
        items: ["hat-clown-hair", "eyes-crazy-eyes", "boost-martini"],
        bonus: { wiggle: 1, bounce: 1, split: 1, extraProjectiles: 1 },
        statBonus: { luck: 0.08 },
        desc: "Pure chaos: unreliable shots wiggle, bounce, and split",
        color: "#ff88dd"
    },
    {
        id: "wizard",
        name: "🧙 Archmage",
        items: ["hat-wizard-hat", "clothes-mage-robe", "eyes-all-seeing"],
        bonus: { spectral: 1, prismFork: 1, chain: 1 },
        statBonus: { luck: 0.08, magnetRange: 0.06 },
        desc: "Arcane mastery: critical shots fork into spectral chain shards",
        color: "#9944ff"
    },
    {
        id: "scientist",
        name: "🧪 Mad Science",
        items: ["clothes-mad-scientist", "body-acid", "eyes-evil"],
        bonus: { contagion: 1, poison: 1, spiral: 1 },
        statBonus: { damage: 0.06 },
        desc: "Toxic lab: poison spreads through controlled contagion spirals",
        color: "#78ff69"
    },
    {
        id: "crypto-whale",
        name: "🐳 Crypto Whale",
        items: ["hat-crypto-crown", "boost-btc-bag", "body-gold"],
        bonus: { gemPulse: 1, chain: 1, critChance: 0.08, magnetRange: 1.12 },
        statBonus: { gemValue: 0.15, luck: 0.10 },
        desc: "Diamond hands: economy build with gem pulses and crit chains",
        color: "#ffd700"
    },
    {
        id: "zombie-apocalypse",
        name: "🧟 Zombie Apocalypse",
        items: ["body-zombie", "hat-devil-horns", "eyes-evil"],
        bonus: { poison: 1, fear: 1, contagion: 1, spectral: 1 },
        statBonus: { damage: 0.08 },
        desc: "Undead army: poison spreads while frightened enemies scatter",
        color: "#44aa33"
    },
    {
        id: "fortune-teller",
        name: "🔮 Fortune Teller",
        items: ["eyes-all-seeing", "hat-halo", "boost-old-watch"],
        bonus: { homing: 1, boomerang: 1, freeze: 1, nextXpMult: 0.90 },
        statBonus: { luck: 0.08 },
        desc: "See the future: returning shots bend toward targets and chill them",
        color: "#cc88ff"
    },
    {
        id: "bullet-storm",
        name: "🌀 Bullet Storm",
        items: ["body-orange", "hat-wild-hair", "boost-ink-drink"],
        bonus: { extraProjectiles: 1, spiral: 1, fireDelay: 0.92 },
        statBonus: { damage: 0.06 },
        desc: "Wall of ink: denser fire pattern without full endgame spam",
        color: "#ff8844"
    },
    {
        id: "ice-fortress",
        name: "❄️ Ice Fortress",
        items: ["body-gray", "hat-blue-bandana", "clothes-rain-coat"],
        bonus: { freeze: 1, guardianCharges: 2, maxHp: 1 },
        statBonus: { armor: 0.55 },
        desc: "Frozen defense: frost shield and guardian charges buy survival time",
        color: "#88ccff"
    },
    {
        id: "shadow-assassin",
        name: "🌙 Shadow Assassin",
        items: ["body-midnight", "hat-encryption-hair", "eyes-sleeping"],
        bonus: { spectral: 1, fear: 1, critChance: 0.10, homing: 1 },
        statBonus: { damage: 0.08, swimSpeed: 0.05 },
        desc: "Phantom strikes: spectral crit shots bend from the shadows",
        color: "#6633aa"
    }
];

export const THEME_SYNERGIES = [
    {
        id: "theme-toxic",
        name: "☣️ Venom Brewer",
        themeKeys: ["poison", "contagion"],
        threshold: 3,
        bonus: { poison: 1, contagion: 1, damageBonus: 1 },
        statBonus: { damage: 0.04 },
        desc: "Stack toxic traits to make poison spread harder",
        color: "#78ff69"
    },
    {
        id: "theme-smart-shot",
        name: "🎯 Smart Shot",
        themeKeys: ["homing", "chain", "prismFork"],
        threshold: 3,
        bonus: { homing: 1, chain: 1, shotSpeed: 1.06 },
        statBonus: { magnetRange: 0.04 },
        desc: "Guided shots learn to chain through crowds",
        color: "#66ccff"
    },
    {
        id: "theme-fortress",
        name: "🏰 Reef Fortress",
        themeKeys: ["guardianCharges", "maxHp", "freeze", "spinPower"],
        threshold: 3,
        bonus: { guardianCharges: 1, maxHp: 1, freeze: 1 },
        statBonus: { armor: 0.35 },
        desc: "Defensive traits harden into a survival shell",
        color: "#88ccff"
    },
    {
        id: "theme-treasure",
        name: "💎 Gem Resonance",
        themeKeys: ["gemPulse", "magnetRange", "luckBonus"],
        threshold: 3,
        bonus: { gemPulse: 1, magnetRange: 1.12, critChance: 0.03 },
        statBonus: { gemValue: 0.08, luck: 0.04 },
        desc: "Collector traits make gems pull harder and pay better",
        color: "#ffd700"
    },
    {
        id: "theme-ghost",
        name: "👻 Ghost Current",
        themeKeys: ["spectral", "fear", "boomerang"],
        threshold: 3,
        bonus: { spectral: 1, fear: 1, boomerang: 1 },
        statBonus: { swimSpeed: 0.04 },
        desc: "Spooky traits make ink return from impossible angles",
        color: "#aa77ff"
    },
    {
        id: "theme-chaos",
        name: "🎪 Chaos Ink",
        themeKeys: ["bounce", "split", "wiggle", "extraProjectiles", "spiral"],
        threshold: 3,
        bonus: { bounce: 1, split: 1, wiggle: 1 },
        statBonus: { luck: 0.05 },
        desc: "Unstable traits turn shots into a messy carnival",
        color: "#ff88dd"
    },
    {
        id: "theme-artillery",
        name: "🚀 Broadside Battery",
        themeKeys: ["broadside", "damageBonus", "lumpOfCoal", "inkMines", "backblast"],
        threshold: 3,
        bonus: { broadside: 1, damageBonus: 1, inkMines: 1 },
        statBonus: { damage: 0.06 },
        desc: "Heavy traits add side volleys, mines, and harder hits",
        color: "#ff8844"
    }
];

const ALL_SYNERGIES = [...SYNERGIES, ...THEME_SYNERGIES];
const ASSET_BY_ID = new Map(ALL_ASSETS.map(asset => [asset.id, asset]));

function themeMatchesForSynergy(synergy, equippedIds) {
    const themeKeys = new Set(synergy.themeKeys || []);
    if (themeKeys.size === 0) return [];

    return equippedIds
        .filter(Boolean)
        .filter(id => {
            const asset = ASSET_BY_ID.get(id);
            if (!asset?.huntMods) return false;
            return Object.keys(asset.huntMods).some(key => themeKeys.has(key));
        });
}

/**
 * Check which synergies are active given a set of equipped asset IDs.
 * Returns { active: Synergy[], partial: { synergy, have, need }[] }
 */
export function checkSynergies(equippedIds) {
    const cleanIds = equippedIds.filter(Boolean);
    const idSet = new Set(cleanIds);
    const active = [];
    const partial = [];

    for (const synergy of ALL_SYNERGIES) {
        if (synergy.items) {
            const have = synergy.items.filter(id => idSet.has(id));
            if (have.length === synergy.items.length) {
                active.push(synergy);
            } else if (have.length > 0) {
                partial.push({
                    synergy,
                    have: have.length,
                    need: synergy.items.length
                });
            }
            continue;
        }

        const have = themeMatchesForSynergy(synergy, cleanIds);
        const need = synergy.threshold || 3;
        if (have.length >= need) {
            active.push(synergy);
        } else if (have.length > 0) {
            partial.push({
                synergy,
                have: have.length,
                need
            });
        }
    }

    return { active, partial };
}

/**
 * Aggregate all active synergy huntMods into a single object.
 */
export function aggregateSynergyHuntMods(activeSynergies) {
    const result = {};
    for (const synergy of activeSynergies) {
        for (const [key, value] of Object.entries(synergy.bonus)) {
            if (key === "family") continue;
            // Multiplicative keys
            if (["swimSpeed", "magnetRange", "fireDelay", "shotSpeed", "shotLifetime", "nextXpMult"].includes(key)) {
                result[key] = (result[key] || 1) * value;
            } else {
                result[key] = (result[key] || 0) + value;
            }
        }
    }
    return result;
}

/**
 * Aggregate all active synergy statBonuses into a single object.
 */
export function aggregateSynergyStatMods(activeSynergies) {
    const result = {};
    for (const synergy of activeSynergies) {
        if (!synergy.statBonus) continue;
        for (const [key, value] of Object.entries(synergy.statBonus)) {
            result[key] = (result[key] || 0) + value;
        }
    }
    return result;
}
