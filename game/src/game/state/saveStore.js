import { SHOP_ASSETS, SPECIAL_FORM_ASSETS, STARTER_LOADOUT, STARTER_UNLOCKS, getAssetById, ALL_ASSETS } from "../data/assetCatalog.js";
import { calculateStats } from "../data/statSystem.js";
import { checkSynergies, aggregateSynergyStatMods } from "../data/synergies.js";

const STORAGE_KEY = "octoglyphs.save.v1";
const LEGACY_STORAGE_KEYS = ["primordial.save.v1"];

function defaultSave() {
    return {
        wallet: {
            green: 0,
            blue: 0,
            yellow: 0,
            pink: 0,
            silver: 0
        },
        unlocked: [...STARTER_UNLOCKS],
        discovered: [...STARTER_UNLOCKS],
        loadout: { ...STARTER_LOADOUT, legendary: null },
        lifetime: {
            prompts: 0,
            chunks: 0,
            tokens: 0,
            manualTraitsCollected: 0,
            tankHuntCharges: 5
        },
        ftue: {
            welcome: false,
            firstGem: false,
            firstTrait: false,
            firstShopOpen: false,
            firstBuy: false,
            firstLoadout: false,
            firstHuntStart: false,
            firstHuntDeath: false,
            firstEvolve: false,
            allDone: false
        }
    };
}

export function loadSave() {
    try {
        const rawSave = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
        const parsed = JSON.parse(rawSave || "null");
        const base = defaultSave();
        if (!parsed || typeof parsed !== "object") return base;

        return {
            wallet: { ...base.wallet, ...(parsed.wallet || {}) },
            unlocked: Array.from(new Set([...(parsed.unlocked || []), ...STARTER_UNLOCKS])),
            discovered: Array.from(new Set([...(parsed.discovered || parsed.unlocked || []), ...STARTER_UNLOCKS])),
            loadout: { ...base.loadout, ...(parsed.loadout || {}) },
            lifetime: { ...base.lifetime, ...(parsed.lifetime || {}) },
            ftue: { ...base.ftue, ...(parsed.ftue || {}) }
        };
    } catch {
        return defaultSave();
    }
}

export function saveGame(save) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function walletTotal(save) {
    return Object.values(save.wallet).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function canAfford(save, price) {
    return walletTotal(save) >= price;
}

export function spendAnyGems(save, price) {
    let remaining = price;
    const order = ["silver", "pink", "yellow", "blue", "green"];

    for (const type of order) {
        const value = Number(save.wallet[type] || 0);
        const spend = Math.min(value, remaining);
        save.wallet[type] = value - spend;
        remaining -= spend;
        if (remaining <= 0) return true;
    }

    return false;
}

export function addGemValue(save, type, value) {
    save.wallet[type] = Number(save.wallet[type] || 0) + value;
}

export function discoverAsset(save, assetId) {
    if (!save.discovered) save.discovered = [];
    if (!save.discovered.includes(assetId)) save.discovered.push(assetId);
}

export function discoverAllShopAssets(save) {
    if (!save.discovered) save.discovered = [];
    for (const asset of SHOP_ASSETS) {
        discoverAsset(save, asset.id);
    }
}

export function unlockAsset(save, assetId) {
    discoverAsset(save, assetId);
    if (!save.unlocked.includes(assetId)) save.unlocked.push(assetId);
}

export function isUnlocked(save, assetId) {
    return save.unlocked.includes(assetId);
}

export function equipAsset(save, assetId) {
    const asset = getAssetById(assetId);
    if (!asset) return false;
    if (!isUnlocked(save, assetId)) return false;

    save.loadout[asset.slot] = assetId;
    return true;
}

export function unequipSlot(save, slot) {
    if (!save?.loadout || !(slot in save.loadout)) return false;
    if (slot === "body" || slot === "eyes") return false;
    if (!save.loadout[slot]) return false;

    save.loadout[slot] = null;
    return true;
}

export function buyAsset(save, assetId) {
    const asset = SHOP_ASSETS.find(item => item.id === assetId);
    if (!asset) return { success: false, message: "Unknown asset." };
    if (isUnlocked(save, assetId)) return { success: false, message: "Already unlocked." };
    if (!save.discovered?.includes(assetId)) return { success: false, message: "Discover this trait in the tank first." };
    if (!canAfford(save, asset.price)) return { success: false, message: "Need more Data Gems." };

    spendAnyGems(save, asset.price);
    unlockAsset(save, assetId);
    equipAsset(save, assetId);
    return { success: true, message: `${asset.name} unlocked and equipped.` };
}

export function ownedAssetsForSlot(save, slot) {
    return ALL_ASSETS
        .filter(asset => asset.slot === slot && isUnlocked(save, asset.id))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export function statsWithAssetEquipped(save, assetId) {
    const asset = getAssetById(assetId);
    if (!asset) return equippedStats(save);

    const nextSave = {
        ...save,
        loadout: {
            ...save.loadout,
            [asset.slot]: asset.id
        }
    };

    return equippedStats(nextSave);
}

export function equippedAssets(save) {
    return Object.values(save.loadout).filter(Boolean).map(getAssetById).filter(Boolean);
}

export function equippedStats(save) {
    const assets = equippedAssets(save);
    const baseStats = calculateStats(assets);

    // Apply synergy stat bonuses
    const equippedIds = assets.map(a => a.id);
    const { active } = checkSynergies(equippedIds);
    if (active.length > 0) {
        const synergyMods = aggregateSynergyStatMods(active);
        for (const [key, value] of Object.entries(synergyMods)) {
            baseStats[key] = (baseStats[key] || 0) + value;
        }
    }

    return baseStats;
}

const RARITY_LADDER = ["common", "uncommon", "rare", "legendary"];
const FUSE_COST = { common: 50, uncommon: 150, rare: 400 };
const FLEX_EVOLUTION_FALLBACKS = {
    eyes: ["hat", "boost"],
    clothes: ["hat", "body"],
    boost: ["hat", "body"]
};

function labelForRewardPool(rarity, slot, fallbackUsed = false) {
    if (rarity === "legendary") return "legendary forms";
    if (!fallbackUsed) return rarity + " " + slot + " traits";
    return rarity + " traits from compatible slots";
}

function evolutionResultPool(save, slot, nextRarity) {
    if (nextRarity === "legendary") {
        return { pool: SPECIAL_FORM_ASSETS.filter(a => !save.unlocked.includes(a.id)), fallbackUsed: false };
    }

    const primary = SHOP_ASSETS.filter(a => a.slot === slot && a.rarity === nextRarity && !save.unlocked.includes(a.id));
    if (primary.length > 0) return { pool: primary, fallbackUsed: false };

    const fallbackSlots = FLEX_EVOLUTION_FALLBACKS[slot] || [];
    const fallback = SHOP_ASSETS.filter(a => fallbackSlots.includes(a.slot) && a.rarity === nextRarity && !save.unlocked.includes(a.id));
    return { pool: fallback, fallbackUsed: fallback.length > 0 };
}

export function fusableTraits(save) {
    const equipped = new Set(Object.values(save.loadout).filter(Boolean));
    return save.unlocked
        .map(getAssetById)
        .filter(Boolean)
        .filter(a => !equipped.has(a.id) && RARITY_LADDER.indexOf(a.rarity) >= 0 && RARITY_LADDER.indexOf(a.rarity) < RARITY_LADDER.length - 1);
}

export function fuseTraits(save, traitIds) {
    if (traitIds.length !== 3) return { success: false, message: "Select exactly 3 traits." };

    const assets = traitIds.map(getAssetById).filter(Boolean);
    if (assets.length !== 3) return { success: false, message: "Invalid trait selection." };

    const rarity = assets[0].rarity;
    if (!assets.every(a => a.rarity === rarity)) return { success: false, message: "All 3 traits must be the same rarity." };

    const slot = assets[0].slot;
    if (!assets.every(a => a.slot === slot)) return { success: false, message: "All 3 traits must be from the same slot." };

    const rarityIndex = RARITY_LADDER.indexOf(rarity);
    if (rarityIndex < 0 || rarityIndex >= RARITY_LADDER.length - 1) return { success: false, message: "Cannot evolve this rarity." };

    const equipped = new Set(Object.values(save.loadout).filter(Boolean));
    if (traitIds.some(id => equipped.has(id))) return { success: false, message: "Cannot fuse equipped traits. Unequip first." };

    const cost = FUSE_COST[rarity] || 50;
    if (walletTotal(save) < cost) return { success: false, message: "Need " + cost + " gems to fuse " + rarity + " traits." };

    const nextRarity = RARITY_LADDER[rarityIndex + 1];
    const { pool, fallbackUsed } = evolutionResultPool(save, slot, nextRarity);
    if (pool.length === 0) {
        return { success: false, message: "No unowned " + labelForRewardPool(nextRarity, slot) + " available to evolve into." };
    }

    spendAnyGems(save, cost);
    for (const id of traitIds) {
        const idx = save.unlocked.indexOf(id);
        if (idx >= 0) save.unlocked.splice(idx, 1);
    }

    const result = pool[Math.floor(Math.random() * pool.length)];
    unlockAsset(save, result.id);

    const resultLabel = nextRarity === "legendary" ? "legendary form" : labelForRewardPool(nextRarity, slot, fallbackUsed);
    const fallbackNote = fallbackUsed ? " Your original slot pool was complete, so evolution used a compatible reward pool." : "";
    return { success: true, message: "Evolved into " + result.name + " (" + resultLabel + ")!" + fallbackNote, result };
}
