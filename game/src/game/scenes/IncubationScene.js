import { BlendModes, Input, Math as PhaserMath, Scene, TintModes, Utils } from "phaser";
import { BODY_SPIN_ASSETS, ENEMY_DEATH_ASSET, GEM_TYPES, TANK_MINE_ASSETS, TRAIT_DISCOVERY_POOL, getAssetById } from "../data/assetCatalog.js";
import { BACKGROUND_TRACKS, pickBackgroundForDepthIndex } from "../data/mediaCatalog.js";
import { checkSynergies, aggregateSynergyHuntMods, aggregateSynergyStatMods } from "../data/synergies.js";
import { addGemValue, discoverAsset, equipAsset, equippedAssets, equippedStats, isUnlocked, loadSave, saveGame, unlockAsset } from "../state/saveStore.js";
import { triggerFTUE } from "../state/ftueManager.js";

const GEM_WEIGHTS = [
    ["green", 58],
    ["blue", 24],
    ["yellow", 12],
    ["pink", 5],
    ["silver", 1]
];

const TANK_ENEMY_TYPES = [
    { key: "tank-enemy-jelly", hp: 2, speed: 82, scale: 1.18, minWave: 1, behavior: "wanderer", facingOffset: -90, flipX: false, frames: 4, framePath: "./tank-enemy-jelly/frame_00.png" },
    { key: "tank-enemy-fish", hp: 3, speed: 124, scale: 1.28, minWave: 2, behavior: "pouncer", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-fish/frame_00.png" },
    { key: "tank-enemy-eel", hp: 4, speed: 116, scale: 1.2, minWave: 3, behavior: "zigzag", facingOffset: -90, flipX: false, frames: 12, framePath: "./tank-enemy-eel/frame_00.png" },
    { key: "tank-enemy-enemi1", hp: 3, speed: 96, scale: 0.85, minWave: 1, behavior: "drifter", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi1/frame_00.png" },
    { key: "tank-enemy-enemi2", hp: 4, speed: 88, scale: 0.72, minWave: 2, behavior: "herder", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi2/frame_00.png" },
    { key: "tank-enemy-enemi3", hp: 2, speed: 134, scale: 1.0, minWave: 3, behavior: "pouncer", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi3/frame_00.png" },
    { key: "tank-enemy-enemi4", hp: 5, speed: 72, scale: 0.92, minWave: 4, behavior: "blocker", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi4/frame_00.png" },
    { key: "tank-enemy-enemi5", hp: 3, speed: 110, scale: 0.82, minWave: 2, behavior: "charger", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi5/frame_00.png" },
    { key: "tank-enemy-enemi1112", hp: 2, speed: 140, scale: 1.1, minWave: 1, behavior: "dart", facingOffset: -90, flipX: false, frames: 3, framePath: "./tank-enemy-enemi1112/frame_00.png" },
    { key: "tank-enemy-enemi112", hp: 3, speed: 98, scale: 1.1, minWave: 2, behavior: "drifter", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi112/frame_00.png" },
    { key: "tank-enemy-enemi1132", hp: 3, speed: 105, scale: 1.1, minWave: 3, behavior: "spiraler", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi1132/frame_00.png" },
    { key: "tank-enemy-enemi1142", hp: 4, speed: 78, scale: 1.1, minWave: 4, behavior: "drifter", facingOffset: -90, flipX: false, frames: 8, framePath: "./tank-enemy-enemi1142/frame_00.png" },
    { key: "tank-enemy-narval", hp: 6, speed: 68, scale: 0.72, minWave: 5, behavior: "sniper", fixedRotation: true, flipWithDirection: false, flipX: false, frames: 5, framePath: "./tank-boss-enemynarval/frame_00.png" },
    { key: "tank-enemy-shark", hp: 5, speed: 130, scale: 0.65, minWave: 4, behavior: "charger", fixedRotation: true, flipWithDirection: false, flipX: false, frames: 4, framePath: "./tank-boss-enemyshark/frame_00.png" },
    { key: "tank-enemy-whale", hp: 8, speed: 56, scale: 0.78, minWave: 6, behavior: "blocker", fixedRotation: true, flipWithDirection: false, flipX: false, frames: 5, framePath: "./tank-boss-enemywhale/frame_00.png" }
];

const TANK_BOSS_TYPES = [
    { key: "tank-boss-blue-shark", hp: 38, speed: 78, scale: 2.25, gems: 9, behavior: "boss", facingOffset: -90, flipX: false, frames: 4, framePath: "./assets/generated/tank-enemies/tank-boss-blue-shark/frame_00.png" },
    { key: "tank-boss-red-shark", hp: 42, speed: 86, scale: 2.35, gems: 10, behavior: "boss", facingOffset: -90, flipX: false, frames: 12, framePath: "./assets/generated/tank-enemies/tank-boss-red-shark/frame_00.png" },
    { key: "tank-boss-mummy-shark", hp: 48, speed: 70, scale: 2.45, gems: 11, behavior: "boss", facingOffset: -90, flipX: false, frames: 13, framePath: "./assets/generated/tank-enemies/tank-boss-mummy-shark/frame_00.png" },
    { key: "tank-boss-halloween-small-1", hp: 44, speed: 92, scale: 2.15, gems: 10, behavior: "boss", facingOffset: -90, flipX: false, frames: 20, framePath: "./assets/generated/tank-enemies/tank-boss-halloween-small-1/frame_00.png" },
    { key: "tank-boss-halloween-small-2", hp: 50, speed: 98, scale: 2.22, gems: 11, behavior: "boss", facingOffset: -90, flipX: false, frames: 16, framePath: "./assets/generated/tank-enemies/tank-boss-halloween-small-2/frame_00.png" },
    { key: "halloween-holloween1", hp: 52, speed: 82, scale: 1.58, gems: 12, behavior: "boss", facingOffset: 0, flipX: false, frames: 8, fixedRotation: true },
    { key: "halloween-holloween2", hp: 56, speed: 88, scale: 1.62, gems: 12, behavior: "boss", facingOffset: 0, flipX: false, frames: 8, fixedRotation: true },
    { key: "halloween-holloween3", hp: 60, speed: 78, scale: 1.66, gems: 13, behavior: "boss", facingOffset: 0, flipX: false, frames: 8, fixedRotation: true },
    { key: "halloween-holloween4", hp: 64, speed: 74, scale: 1.7, gems: 13, behavior: "boss", facingOffset: 0, flipX: false, frames: 8, fixedRotation: true }
];

const TANK_BOSS_INTERVAL = 5;
const TANK_HUNT_PROMPT_COST = 5;
const TANK_NORMAL_GEM_DROP_CHANCE = 15;
const TANK_ELITE_GEM_DROP_CHANCE = 62;
const TANK_SMALL_GEM_LIFETIME = 26000;
const TANK_BETTER_GEM_LIFETIME = 42000;

// --- Wave Recipe System ---
// Each recipe defines enemy composition, spawn count modifier, speed modifier, and spawn interval modifier.
const TANK_WAVE_RECIPES = [
    {
        id: "swarm",
        label: "Swarm",
        enemies: ["tank-enemy-jelly", "tank-enemy-jelly", "tank-enemy-enemi1", "tank-enemy-enemi112", "tank-enemy-enemi1112"],
        countMult: 1.5,
        speedMult: 0.85,
        intervalMult: 0.7,
        minWave: 1
    },
    {
        id: "charger_rush",
        label: "Charger Rush",
        enemies: ["tank-enemy-fish", "tank-enemy-enemi3", "tank-enemy-enemi5", "tank-enemy-enemi1112"],
        countMult: 0.8,
        speedMult: 1.3,
        intervalMult: 1.1,
        minWave: 2
    },
    {
        id: "flanker_ambush",
        label: "Flanker Ambush",
        enemies: ["tank-enemy-eel", "tank-enemy-enemi4", "tank-enemy-enemi1132", "tank-enemy-narval"],
        countMult: 0.9,
        speedMult: 1.15,
        intervalMult: 1.0,
        minWave: 3
    },
    {
        id: "tank_wall",
        label: "Tank Wall",
        enemies: ["tank-enemy-whale", "tank-enemy-enemi2", "tank-enemy-enemi1142", "tank-enemy-narval"],
        countMult: 0.7,
        speedMult: 0.7,
        intervalMult: 1.3,
        hpMult: 2.2,
        minWave: 4
    },
    {
        id: "mixed_assault",
        label: "Mixed Assault",
        enemies: ["tank-enemy-jelly", "tank-enemy-fish", "tank-enemy-eel", "tank-enemy-enemi1", "tank-enemy-enemi3", "tank-enemy-enemi5"],
        countMult: 1.0,
        speedMult: 1.0,
        intervalMult: 1.0,
        minWave: 1
    },
    {
        id: "blitz",
        label: "Blitz",
        enemies: ["tank-enemy-fish", "tank-enemy-enemi3", "tank-enemy-shark", "tank-enemy-enemi1112", "tank-enemy-enemi5"],
        countMult: 1.2,
        speedMult: 1.5,
        intervalMult: 0.6,
        minWave: 5
    },
    {
        id: "siege",
        label: "Siege",
        enemies: ["tank-enemy-whale", "tank-enemy-narval", "tank-enemy-enemi4", "tank-enemy-enemi1142"],
        countMult: 0.65,
        speedMult: 0.6,
        intervalMult: 1.5,
        hpMult: 3.0,
        minWave: 6
    },
    {
        id: "deep_swarm",
        label: "Deep Swarm",
        enemies: ["tank-enemy-enemi112", "tank-enemy-enemi1132", "tank-enemy-enemi1142", "tank-enemy-enemi2"],
        countMult: 1.4,
        speedMult: 0.9,
        intervalMult: 0.75,
        minWave: 3
    },
    {
        id: "predator_pack",
        label: "Predator Pack",
        enemies: ["tank-enemy-shark", "tank-enemy-narval", "tank-enemy-enemi3", "tank-enemy-fish"],
        countMult: 0.75,
        speedMult: 1.35,
        intervalMult: 1.0,
        hpMult: 1.5,
        minWave: 5
    },
    {
        id: "boss_prep",
        label: "Boss Prep",
        enemies: ["tank-enemy-jelly", "tank-enemy-enemi1", "tank-enemy-enemi112"],
        countMult: 0.6,
        speedMult: 0.9,
        intervalMult: 1.2,
        minWave: 1
    }
];

function pickWaveRecipe(wave) {
    // Boss prep wave always before boss waves
    if (wave % TANK_BOSS_INTERVAL === TANK_BOSS_INTERVAL - 1) {
        return TANK_WAVE_RECIPES.find(r => r.id === "boss_prep");
    }
    const available = TANK_WAVE_RECIPES.filter(r => r.minWave <= wave && r.id !== "boss_prep");
    return Utils.Array.GetRandom(available);
}

// Difficulty events — triggered at specific wave numbers
const TANK_DIFFICULTY_EVENTS = [
    {
        id: "deep_pressure",
        label: "DEEP PRESSURE",
        triggerWaves: [3, 13, 23],
        duration: 12000,
        color: "#9933ff",
        tint: 0x220044,
        // Doubles elite spawn chance, slightly faster enemies
        eliteChanceMult: 2.0,
        speedMult: 1.15,
        spawnMult: 1.0,
        gemDropMult: 1.0
    },
    {
        id: "the_current",
        label: "THE CURRENT",
        triggerWaves: [7, 17, 27],
        duration: 12000,
        color: "#33ccff",
        tint: 0x001133,
        // All enemies faster — scales relative to player speed
        eliteChanceMult: 1.0,
        speedMult: 1.4,
        spawnMult: 1.0,
        gemDropMult: 1.0
    },
    {
        id: "feeding_frenzy",
        label: "FEEDING FRENZY",
        triggerWaves: [10, 20, 30],
        duration: 15000,
        color: "#ffcc00",
        tint: 0x332200,
        // Double spawns but double gem drop chance — risk/reward
        eliteChanceMult: 1.0,
        speedMult: 1.1,
        spawnMult: 2.0,
        gemDropMult: 2.0
    }
];

function getEventForWave(wave) {
    return TANK_DIFFICULTY_EVENTS.find(ev => ev.triggerWaves.includes(wave)) || null;
}

const TANK_GEM_XP_VALUES = { green: 1, blue: 3, yellow: 5, pink: 8, silver: 12 };
const TANK_XP_BREAKPOINTS = [10, 16, 24, 35, 50, 70, 95, 125, 160, 200, 245, 295, 350, 410, 475];
const TANK_LEVEL_UP_COOLDOWN = 900;
const TANK_MUTATION_ROLES = {
    swim_speed: "mobility",
    cooldown: "offense",
    damage: "offense",
    shot_speed: "offense",
    magnet: "utility",
    projectile: "offense",
    area: "offense",
    heart: "defense",
    pierce: "offense",
    split: "offense",
    orbit: "defense",
    poison: "offense",
    bounce: "offense",
    spin: "defense",
    wake_trail: "mobility",
    smart_ink: "utility",
    contagion: "offense",
    gem_pulse: "utility",
    critical_eye: "offense",
    guardian_orbit: "defense",
    broadside: "offense",
    backblast: "defense",
    ink_mine: "defense",
    spiral: "offense",
    prism_fork: "offense",
    wiggle: "utility",
    boomerang: "utility",
    lump_of_coal: "offense",
    chain: "offense",
    fear: "control",
    freeze: "control",
    spectral: "utility"
};
const TANK_ARCHETYPES = {
    inkstorm: { label: "Inkstorm", bulletKey: "tank-bullet-fire", tint: 0xff8f46 },
    abyss: { label: "Abyss", bulletKey: "tank-bullet-toxic", tint: 0x78ff69 },
    current: { label: "Current", bulletKey: "tank-bullet-electric", tint: 0x72f6ff },
    shell: { label: "Shell", bulletKey: "tank-bullet-ice", tint: 0xb7ecff },
    prism: { label: "Prism", bulletKey: "tank-bullet-ink", tint: 0xffa7ff },
    tide: { label: "Tide", bulletKey: "tank-bullet", tint: 0xaef7ff }
};
const TANK_BASE_ZOOM = 0.92;
const TANK_HUNT_ZOOM = 0.68;
const TANK_BULLET_ANGLE_OFFSET = PhaserMath.DegToRad(90);
const TANK_BASE_FIRE_DELAY = 260;
const TANK_BASE_SHOT_SPEED = 620;
const TANK_BASE_SHOT_LIFETIME = 1900;
const TANK_BASE_PLAYER_HP = 5;
const TANK_HOMING_STRENGTH = 0.055;
const TANK_STARTING_CAPS = {
    maxHp: 6,
    fireDelay: 150,
    extraProjectiles: 1,
    broadside: 1,
    backblast: 1,
    spiral: 1,
    pierce: 2,
    split: 1,
    bounce: 1,
    chain: 1,
    homing: 1,
    orbit: 2,
    poison: 1,
    fear: 1,
    freeze: 1,
    contagion: 1,
    prismFork: 1,
    guardianCharges: 2,
    inkMines: 1,
    wakeTrail: 1,
    gemPulse: 1,
    wiggle: 1,
    boomerang: 1,
    lumpOfCoal: 1,
    spinPower: 1,
    spectral: 1,
    critChance: 0.22,
    damageBonus: 3,
    bulletScale: 1.45,
    swimSpeed: 1.45,
    magnetRange: 1.65,
    shotSpeed: 820,
    shotLifetime: 2600,
    nextXpMult: 0.85
};

const TANK_MUTATION_POOL = [
    { id: "swim_speed", title: "Streamlined", family: "current", rarity: "common", maxRank: 5, desc: rank => `Swim speed +${18 * rank}%${rank >= 2 ? " and stronger wake trail" : ""}`, apply: scene => { scene.tankRunStats.swimSpeed *= 1.18; if (scene.tankRunStats.mutationRanks.swim_speed >= 2) scene.tankRunStats.wakeTrail += 1; } },
    { id: "cooldown", title: "Rapid Ink", family: "inkstorm", rarity: "common", maxRank: 5, desc: rank => `Fire cooldown -${15 * rank}%${rank >= 3 ? " and rear burst" : ""}`, apply: scene => { scene.tankRunStats.fireDelay *= 0.85; if (scene.tankRunStats.mutationRanks.cooldown >= 3) scene.tankRunStats.backblast += 1; scene.configureAutoFireTimer(); } },
    { id: "damage", title: "Heavy Ink", family: "inkstorm", rarity: "common", maxRank: 6, desc: rank => `Projectile damage +${rank}${rank >= 3 ? " and growing shots" : ""}`, apply: scene => { scene.tankRunStats.damageBonus += 1; if (scene.tankRunStats.mutationRanks.damage >= 3) scene.tankRunStats.lumpOfCoal += 1; } },
    { id: "shot_speed", title: "Pressure Jet", family: "current", rarity: "common", maxRank: 4, desc: rank => `Bullet speed and range +${18 * rank}%${rank >= 2 ? " with light homing" : ""}`, apply: scene => { scene.tankRunStats.shotSpeed *= 1.18; scene.tankRunStats.shotLifetime *= 1.12; if (scene.tankRunStats.mutationRanks.shot_speed >= 2) scene.tankRunStats.homing += 1; } },
    { id: "magnet", title: "Data Magnet", family: "prism", rarity: "common", maxRank: 5, desc: rank => `Gem pickup range +${30 * rank}%${rank >= 2 ? " and gem shock pulse" : ""}`, apply: scene => { scene.tankRunStats.magnetRange *= 1.3; if (scene.tankRunStats.mutationRanks.magnet >= 2) scene.tankRunStats.gemPulse += 1; } },
    { id: "projectile", title: "Twin Jet", family: "inkstorm", rarity: "uncommon", maxRank: 3, desc: rank => `${rank + 1} shots per burst`, apply: scene => { scene.tankRunStats.extraProjectiles += 1; } },
    { id: "area", title: "Thick Drop", family: "tide", rarity: "common", maxRank: 5, desc: rank => `Bullet size +${20 * rank}%${rank >= 2 ? " and extra pierce" : ""}`, apply: scene => { scene.tankRunStats.bulletScale *= 1.2; if (scene.tankRunStats.mutationRanks.area >= 2) scene.tankRunStats.pierce += 1; } },
    { id: "heart", title: "Soft Shell", family: "shell", rarity: "common", maxRank: 4, desc: rank => `Max hearts +${rank} and heal${rank >= 2 ? ", plus guardian charge" : ""}`, apply: scene => { scene.tankRunStats.maxHp += 1; scene.tankRunStats.hp = scene.tankRunStats.maxHp; if (scene.tankRunStats.mutationRanks.heart >= 2) { scene.tankRunStats.guardianCharges += 1; scene.tankRunStats.orbit += 1; scene.refreshTankOrbiters(); } } },
    { id: "pierce", title: "Piercing Drop", family: "tide", rarity: "uncommon", maxRank: 4, desc: rank => `Bullets pass through ${rank} target${rank === 1 ? "" : "s"}${rank >= 2 ? " and fork wider" : ""}`, apply: scene => { scene.tankRunStats.pierce += 1; if (scene.tankRunStats.mutationRanks.pierce >= 2) scene.tankRunStats.broadside += 1; } },
    { id: "split", title: "Bubble Split", family: "inkstorm", rarity: "uncommon", maxRank: 3, desc: rank => `Hits split into ${rank + 1} smaller drops`, apply: scene => { scene.tankRunStats.split += 1; } },
    { id: "orbit", title: "Tide Orbit", family: "tide", rarity: "uncommon", maxRank: 4, desc: rank => `${rank} orbiting ink drop${rank === 1 ? "" : "s"}`, apply: scene => { scene.tankRunStats.orbit += 1; scene.refreshTankOrbiters(); } },
    { id: "poison", title: "Venom Ink", family: "abyss", rarity: "uncommon", maxRank: 4, desc: rank => `Shots deal ${rank} poison tick${rank === 1 ? "" : "s"}${rank >= 2 ? " and spread on kills" : ""}`, apply: scene => { scene.tankRunStats.poison += 1; if (scene.tankRunStats.mutationRanks.poison >= 2) scene.tankRunStats.contagion += 1; } },
    { id: "bounce", title: "Ricochet Ink", family: "current", rarity: "rare", maxRank: 3, desc: rank => `Bullets bounce ${rank} time${rank === 1 ? "" : "s"} off glass`, apply: scene => { scene.tankRunStats.bounce += 1; } },
    { id: "spin", title: "Retaliation Bloom", family: "shell", rarity: "rare", maxRank: 3, desc: rank => `Damage spin radius and power rank ${rank}`, apply: scene => { scene.tankRunStats.spinPower += 1; } },
    { id: "wake_trail", title: "Wake Trail", family: "current", rarity: "uncommon", maxRank: 4, desc: rank => `Swimming leaves ${rank} damaging current pulse${rank === 1 ? "" : "s"}`, apply: scene => { scene.tankRunStats.wakeTrail += 1; } },
    { id: "smart_ink", title: "Smart Ink", family: "prism", rarity: "rare", maxRank: 3, desc: rank => `Shots home toward prey at rank ${rank}`, apply: scene => { scene.tankRunStats.homing += 1; } },
    { id: "contagion", title: "Contagion", family: "abyss", rarity: "rare", maxRank: 3, desc: rank => `Poisoned kills burst for ${rank + 1} toxic hit${rank === 1 ? "" : "s"}`, apply: scene => { scene.tankRunStats.contagion += 1; } },
    { id: "gem_pulse", title: "Gem Pulse", family: "prism", rarity: "uncommon", maxRank: 4, desc: rank => `Collecting gems shocks nearby enemies at rank ${rank}`, apply: scene => { scene.tankRunStats.gemPulse += 1; } },
    { id: "critical_eye", title: "Critical Eye", family: "prism", rarity: "uncommon", maxRank: 4, desc: rank => `${10 + rank * 7}% chance for double damage${rank >= 2 ? " and prism forks" : ""}`, apply: scene => { scene.tankRunStats.critChance += 0.07; if (scene.tankRunStats.mutationRanks.critical_eye >= 2) scene.tankRunStats.prismFork += 1; } },
    { id: "guardian_orbit", title: "Guardian Orbit", family: "shell", rarity: "rare", maxRank: 3, desc: rank => `${rank} orbiting guard charge${rank === 1 ? "" : "s"} can block hits`, apply: scene => { scene.tankRunStats.guardianCharges += 1; scene.tankRunStats.orbit += 1; scene.refreshTankOrbiters(); } },
    { id: "broadside", title: "Broadside Bloom", family: "tide", rarity: "uncommon", maxRank: 3, desc: rank => `Adds ${rank * 2} side shots to each burst`, apply: scene => { scene.tankRunStats.broadside += 1; } },
    { id: "backblast", title: "Backblast", family: "current", rarity: "uncommon", maxRank: 3, desc: rank => `Fires ${rank} rear guard shot${rank === 1 ? "" : "s"}`, apply: scene => { scene.tankRunStats.backblast += 1; } },
    { id: "ink_mine", title: "Ink Mines", family: "shell", rarity: "uncommon", maxRank: 4, desc: rank => `Drops slow explosive mine pulses at rank ${rank}`, apply: scene => { scene.tankRunStats.inkMines += 1; } },
    { id: "spiral", title: "Spiral Siphon", family: "abyss", rarity: "rare", maxRank: 3, desc: rank => `Adds rotating venom spiral shots at rank ${rank}`, apply: scene => { scene.tankRunStats.spiral += 1; } },
    { id: "prism_fork", title: "Prism Fork", family: "prism", rarity: "rare", maxRank: 3, desc: rank => `Critical hits fork into ${rank + 1} rainbow shards`, apply: scene => { scene.tankRunStats.prismFork += 1; } },
    { id: "wiggle", title: "Wiggle Worm", family: "tide", rarity: "uncommon", maxRank: 3, desc: rank => `Bullets sine-wave at amplitude ${rank}`, apply: scene => { scene.tankRunStats.wiggle += 1; } },
    { id: "boomerang", title: "Boomerang Ink", family: "current", rarity: "rare", maxRank: 2, desc: rank => `Bullets curve back after traveling outward (rank ${rank})`, apply: scene => { scene.tankRunStats.boomerang += 1; } },
    { id: "lump_of_coal", title: "Lump of Coal", family: "inkstorm", rarity: "uncommon", maxRank: 3, desc: rank => `Bullets accelerate and grow over distance (+${rank * 30}%)`, apply: scene => { scene.tankRunStats.lumpOfCoal += 1; } },
    { id: "chain", title: "Chain Lightning", family: "prism", rarity: "rare", maxRank: 3, desc: rank => `Kills jump up to ${Math.min(3, rank + 1)} times with weaker arcs`, apply: scene => { scene.tankRunStats.chain += 1; } },
    { id: "fear", title: "Fear Shot", family: "abyss", rarity: "uncommon", maxRank: 3, desc: rank => `Hit enemies flee for ${0.4 + rank * 0.3}s`, apply: scene => { scene.tankRunStats.fear += 1; } },
    { id: "freeze", title: "Frost Ink", family: "shell", rarity: "uncommon", maxRank: 3, desc: rank => `Hit enemies slow to ${Math.round(100 - rank * 20)}% speed for ${1 + rank * 0.5}s`, apply: scene => { scene.tankRunStats.freeze += 1; } },
    { id: "spectral", title: "Spectral Ink", family: "abyss", rarity: "rare", maxRank: 1, desc: () => `Bullets ignore walls and travel forever`, apply: scene => { scene.tankRunStats.spectral = 1; } }
];

const TANK_MUTATION_RARITY_WEIGHT = { common: 64, uncommon: 28, rare: 8 };

const TANK_BOSS_REWARD_POOL = [
    {
        id: "abyssal_cache",
        title: "Abyssal Cache",
        family: "prism",
        rarity: "boss",
        desc: () => "Bank 18 blue gems now. Magnet range +20% for this hunt.",
        apply: scene => {
            addGemValue(scene.save, "blue", 18);
            scene.addTankHuntGemSource("bossRewards", 18);
            scene.tankRunStats.magnetRange *= 1.2;
            saveGame(scene.save);
            scene.emitState();
        }
    },
    {
        id: "predator_heart",
        title: "Predator Heart",
        family: "shell",
        rarity: "boss",
        desc: () => "Max hearts +1, fully heal, and gain one Guardian Orbit charge.",
        apply: scene => {
            scene.tankRunStats.maxHp += 1;
            scene.tankRunStats.hp = scene.tankRunStats.maxHp;
            scene.tankRunStats.guardianCharges += 1;
            scene.refreshTankOrbiters();
        }
    },
    {
        id: "ink_overclock",
        title: "Ink Overclock",
        family: "inkstorm",
        rarity: "boss",
        desc: () => "Fire 12% faster and gain +1 projectile damage.",
        apply: scene => {
            scene.tankRunStats.fireDelay *= 0.88;
            scene.tankRunStats.damageBonus += 1;
            scene.configureAutoFireTimer();
        }
    },
    {
        id: "current_surge",
        title: "Current Surge",
        family: "current",
        rarity: "boss",
        desc: () => "Swim speed +14%. Bullets gain speed and range.",
        apply: scene => {
            scene.tankRunStats.swimSpeed *= 1.14;
            scene.tankRunStats.shotSpeed *= 1.12;
            scene.tankRunStats.shotLifetime *= 1.1;
        }
    },
    {
        id: "boss_bane",
        title: "Boss Bane",
        family: "tide",
        rarity: "boss",
        desc: () => "Gain +1 pierce and +1 orbiting ink drop.",
        apply: scene => {
            scene.tankRunStats.pierce += 1;
            scene.tankRunStats.orbit += 1;
            scene.refreshTankOrbiters();
        }
    },
    {
        id: "frozen_eye",
        title: "Frozen Eye",
        family: "shell",
        rarity: "boss",
        desc: () => "Shots can slow enemies harder. Gain freeze rank and crit chance.",
        apply: scene => {
            scene.tankRunStats.freeze += 1;
            scene.tankRunStats.critChance += 0.06;
        }
    },
    {
        id: "venom_crown",
        title: "Venom Crown",
        family: "abyss",
        rarity: "boss",
        desc: () => "Poison rank +1 and kills can chain toxic bursts.",
        apply: scene => {
            scene.tankRunStats.poison += 1;
            scene.tankRunStats.contagion += 1;
        }
    },
    {
        id: "prism_tithe",
        title: "Prism Tithe",
        family: "prism",
        rarity: "boss",
        desc: () => "Next levels need 10% less XP. Gain +1 luck signal.",
        apply: scene => {
            scene.tankRunStats.xpBreakpoints = (scene.tankRunStats.xpBreakpoints || TANK_XP_BREAKPOINTS).map(value => Math.max(6, Math.floor(value * 0.9)));
            scene.tankRunStats.nextXp = Math.max(scene.tankRunStats.xp + 1, scene.getTankXpForNextLevel());
            scene.tankRunStats.luckBonus += 0.18;
        }
    }
];


export class IncubationScene extends Scene {
    constructor() {
        super("IncubationScene");
        this.gems = null;
        this.traits = null;
        this.octo = null;
        this.target = null;
        this.save = null;
        this.bodyLayer = null;
        this.clothesLayer = null;
        this.eyesLayer = null;
        this.hatLayer = null;
        this.boostLayer = null;
        this.lastPointerTime = 0;
        this.mass = 1;
        this.worldWidth = 3200;
        this.worldHeight = 2200;
        this.wanderTarget = null;
        this.frameTimer = 0;
        this.swimFrame = 0;
        this.swimTime = 0;
        this.viewZoom = TANK_BASE_ZOOM;
        this.visualScaleCompensation = 1.15 / this.viewZoom;
        this.stats = null;
        this.keys = null;
        this.keyboardManualUntil = 0;
        this.activeTraitMarker = null;
        this.activeTraitArrow = null;
        this.centerTraitText = null;
        this.enemies = null;
        this.bullets = null;
        this.enemySpawnTimer = null;
        this.tankWaveTimer = null;
        this.autoFireTimer = null;
        this.tankHuntActive = false;
        this.tankHuntKills = 0;
        this.tankHuntGoal = 0;
        this.tankHuntWave = 0;
        this.tankHuntTotalKills = 0;
        this.tankHuntBossKills = 0;
        this.tankHuntGemsCollected = 0;
        this.tankHuntGemSources = {};
        this.tankHuntDamageTaken = 0;
        this.tankHuntStartedAt = 0;
        this.tankBoss = null;
        this.tankHuntEnding = false;
        this.tankHuntEndTimer = null;
        this.tankRunStats = this.createTankRunStats();
        this.tankUpgradeChoiceActive = false;
        this.tankUpgradeContainer = null;
        this.tankContinueChoiceActive = false;
        this.tankContinueContainer = null;
        this.tankInvincibleUntil = 0;
        this.tankSpinUntil = 0;
        this.tankSpinStartedAt = 0;
        this.tankSpinFrame = 0;
        this.tankWasSpinning = false;
        this.tankSpinHitEnemies = new Set();
        this.tankHud = null;
        this.tankHudHearts = null;
        this.tankHudXpFill = null;
        this.tankHudText = null;
        this.tankOrbiters = [];
        this.toroidalGhosts = [];
        this.tankBackgroundTiles = [];
        this.tankBackgroundTileWidth = 1;
        this.tankBackgroundTileHeight = 1;
        this.activeBackgroundKey = null;
        this.pendingBackgroundKey = null;
        this.tankBackgroundDepthIndex = 0;
        this.tankWakeTimer = 0;
        this.tankMineTimer = 0;
        this.tankSpiralAngle = 0;
        this.tankDamageNumbers = [];
        this.tankInkBurstCooldown = 0;
        this.tankManualMineCooldown = 0;
        this.gemArrow = null;
        this.tankWaveResolving = false;
        this.tankWaveToken = 0;
        this.tankActiveEvent = null; // { def, endsAt }
        this.tankEventOverlay = null;
        this.tankContinueWave = null;
        this.tankContinueChoicePending = false;
        this.tankSpecificWaveTimer = null;
        this.tankSpecificWavePending = null;
        this.autopilotCollectTarget = null;
        this.autopilotLastPosition = null;
        this.autopilotLastProgressAt = 0;
        this.autopilotStuckCount = 0;
        this.wanderTargetCreatedAt = 0;
        this.tankNextLevelAllowedAt = 0;
        this.lastTankMutationRoles = [];
        this.tankBossRewardChoiceActive = false;
        this.tankBossRewardContainer = null;
        this.backgroundCollectedGems = 0;
        this.backgroundCollectedValue = 0;
        this.backgroundCollectedByType = {};
        this.backgroundGemLedger = [];
        this.backgroundLedgerOcto = null;
        this.backgroundLedgerAvailableAt = 0;
        this.isPageHidden = typeof document !== "undefined" && document.visibilityState === "hidden";
        this.visibilityPauseStartedAt = 0;
    }

    create() {
        this.save = loadSave();
        this.mass = 1 + Math.min(0.65, this.save.lifetime.tokens / 160000);
        this.physics.world.setBounds(-1000000, -1000000, 2000000, 2000000);
        this.cameras.main.setZoom(this.viewZoom);
        this.cameras.main.setBackgroundColor("#04131d");

        this.buildTiledBackground();
        this.tankGlassHint = this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x79ddff, 0.018).setDepth(1);
        this.tankGlassHint.setVisible(false);

        this.gems = this.physics.add.group();
        this.traits = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.playerMines = this.physics.add.group();
        this.octo = this.add.container(this.worldWidth / 2, this.worldHeight / 2);
        this.octo.setDepth(20);

        this.createOctoLayers();
        this.applyLoadoutSprites();
        this.createToroidalGhosts();

        this.physics.add.existing(this.octo);
        this.octo.body.setCircle(24, -24, -24);
        this.octo.body.setCollideWorldBounds(false);
        this.octo.body.setDamping(true);
        this.octo.body.setDrag(0.92);
        this.refreshStats();
        this.octo.body.setMaxVelocity(155 * this.stats.swimSpeed);
        this.cameras.main.startFollow(this.octo, true, 0.055, 0.055);

        this.input.on("pointermove", pointer => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            this.target = worldPoint;
            this.lastPointerTime = this.time.now;
            this.game.events.emit("octoglyphs:mode", "Manual");
        });

        this.input.on("pointerout", () => this.releaseManualControl());
        this.keys = this.input.keyboard?.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE");

        this.physics.add.overlap(this.octo, this.gems, (_, gem) => this.collectGem(gem), (_, gem) => this.canOverlapToroidal(this.octo, gem, 38));
        this.physics.add.overlap(this.octo, this.traits, (_, trait) => this.collectTrait(trait), (_, trait) => this.canOverlapToroidal(this.octo, trait, 52));
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => this.hitEnemy(bullet, enemy), (bullet, enemy) => this.canOverlapToroidal(bullet, enemy, (enemy.getData("boss") ? 62 : 42)));
        this.physics.add.overlap(this.playerMines, this.enemies, (mine, enemy) => this.triggerPlayerMine(mine, enemy), (mine, enemy) => !mine.getData("armed") && this.canOverlapToroidal(mine, enemy, (enemy.getData("boss") ? 76 : 54)));
        this.physics.add.overlap(this.octo, this.enemies, (_, enemy) => this.hitPlayer(enemy), (_, enemy) => this.canOverlapToroidal(this.octo, enemy, (enemy.getData("boss") ? 70 : 48)));

        this.game.events.on("octoglyphs:event", event => this.onOctoGlyphsEvent(event));
        this.game.events.on("octoglyphs:spawn-trait", () => this.spawnTraitDiscovery(true));
        this.game.events.on("octoglyphs:start-tank-hunt", () => this.startTankHunt());
        this.game.events.on("octoglyphs:query-hunt-charge", () => this.emitTankHuntCharge());
        this.game.events.on("octoglyphs:equip", assetId => this.equipPersistent(assetId));
        this.game.events.on("octoglyphs:save-changed", () => this.refreshSave());
        if (typeof document !== "undefined") {
            this.handleVisibilityChange = () => this.onVisibilityChanged();
            document.addEventListener("visibilitychange", this.handleVisibilityChange);
            window.addEventListener("blur", this.handleVisibilityChange);
            window.addEventListener("focus", this.handleVisibilityChange);
        }

        this.time.addEvent({ delay: 320, loop: true, callback: () => this.autopilot() });
        this.time.addEvent({ delay: 45, loop: true, callback: () => this.animateGems() });
        this.time.addEvent({ delay: 80, loop: true, callback: () => this.animateTraits() });
        this.createGemArrow();
        this.configureAutoFireTimer();

        this.emitState();
        this.emitTankHuntCharge();
        triggerFTUE("welcome", this.save);
    }

    update(time, delta) {
        if (!this.octo) return;

        if (this.tankUpgradeChoiceActive || this.tankBossRewardChoiceActive || this.tankContinueChoiceActive) {
            this.target = null;
            this.keyboardManualUntil = 0;
            this.octo.body.setVelocity(0, 0);
            this.updateTraitMarker();
            this.updateGemArrow();
            this.updateTankEnemies();
            this.animateOcto(delta / 1000);
            return;
        }

        if (this.applyKeyboardMovement()) {
            this.target = null;
        } else if (this.target) {
            this.moveBodyTowardToroidal(this.octo, this.target, this.getTankPlayerSpeed(160));
            if (this.toroidalDistance(this.octo.x, this.octo.y, this.target.x, this.target.y) < 18) this.octo.body.setVelocity(0, 0);
            if (this.time.now - this.lastPointerTime > 2500) this.releaseManualControl();
        } else if (this.keyboardManualUntil > 0 && this.time.now > this.keyboardManualUntil) {
            this.releaseManualControl();
            this.keyboardManualUntil = 0;
        }

        this.updateTiledBackground();
        this.wrapTankActors();
        this.applyWakeTrail(delta);
        this.applyInkMines(delta);
        this.applyMagnetPull();
        this.updateTraitMarker();
        this.updateTankEnemies();
        this.updateTankBullets();
        this.updateTankOrbiters();
        this.updateEnemyBullets();
        this.updateGemArrow();
        this.checkInkBurstInput();
        this.checkManualMineInput();
        this.animatePlayerMines();
        this.animateOcto(delta / 1000);
    }

    applyKeyboardMovement() {
        if (!this.keys || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive) return false;

        const left = this.keys.A.isDown || this.keys.LEFT.isDown;
        const right = this.keys.D.isDown || this.keys.RIGHT.isDown;
        const up = this.keys.W.isDown || this.keys.UP.isDown;
        const down = this.keys.S.isDown || this.keys.DOWN.isDown;
        const x = Number(right) - Number(left);
        const y = Number(down) - Number(up);

        if (x === 0 && y === 0) return false;

        const velocity = new PhaserMath.Vector2(x, y).normalize().scale(this.getTankPlayerSpeed(165));
        this.octo.body.setVelocity(velocity.x, velocity.y);
        this.lastPointerTime = this.time.now;
        this.keyboardManualUntil = this.time.now + 900;
        this.game.events.emit("octoglyphs:mode", "Manual");
        return true;
    }

    buildTiledBackground() {
        this.add.rectangle(-1000000, -1000000, 2000000, 2000000, 0x04131d, 1).setOrigin(0, 0).setDepth(-2);
        this.setTankBackground(pickBackgroundForDepthIndex(0));
    }

    setTankBackground(background) {
        const nextBackground = background || BACKGROUND_TRACKS[0];
        if (!nextBackground || this.activeBackgroundKey === nextBackground.key) return;

        this.activeBackgroundKey = nextBackground.key;
        const texture = this.textures.get(nextBackground.key);
        const source = texture.getSourceImage();
        const tileWidth = source?.width || 1672;
        const tileHeight = source?.height || 941;
        const scale = 0.72;
        this.tankBackgroundTileWidth = tileWidth * scale;
        this.tankBackgroundTileHeight = tileHeight * scale;

        if (!this.tankBackgroundTiles.length) {
            for (let x = 0; x < 7; x += 1) {
                for (let y = 0; y < 7; y += 1) {
                    const tile = this.add.image(0, 0, nextBackground.key);
                    tile.setOrigin(0.5, 0.5);
                    tile.setDepth(-1);
                    tile.setAlpha(0.92);
                    this.tankBackgroundTiles.push(tile);
                }
            }
        }

        for (const tile of this.tankBackgroundTiles) {
            tile.setTexture(nextBackground.key);
            tile.setDisplaySize(this.tankBackgroundTileWidth + 4, this.tankBackgroundTileHeight + 4);
        }

        this.updateTiledBackground();
        this.game.events.emit("octoglyphs:background", { name: nextBackground.file.replace(".png", ""), depth: nextBackground.depth });
    }

    updateTiledBackground() {
        if (!this.tankBackgroundTiles?.length) return;

        const camera = this.cameras.main;
        const tileWidth = this.tankBackgroundTileWidth;
        const tileHeight = this.tankBackgroundTileHeight;
        const cols = 7;
        const rows = 7;
        const centerX = camera.worldView.centerX;
        const centerY = camera.worldView.centerY;
        const baseGridX = Math.floor(centerX / tileWidth);
        const baseGridY = Math.floor(centerY / tileHeight);

        for (let i = 0; i < this.tankBackgroundTiles.length; i += 1) {
            const x = i % cols;
            const y = Math.floor(i / cols);
            const gridX = baseGridX + x - Math.floor(cols / 2);
            const gridY = baseGridY + y - Math.floor(rows / 2);
            const worldX = gridX * tileWidth + tileWidth / 2;
            const worldY = gridY * tileHeight + tileHeight / 2;
            const tile = this.tankBackgroundTiles[i];
            tile.setPosition(worldX, worldY);
            tile.setFlipX(Math.abs(gridX) % 2 === 1);
            tile.setFlipY(Math.abs(gridY) % 2 === 1);
        }
    }

    createOctoLayers() {
        this.bodyLayer = this.addOutlinedImage(0, 0, "body-blue", 0.16);
        this.clothesLayer = this.addOutlinedImage(0, -1, "clothes-astro", 0.18).setVisible(false);
        this.eyesLayer = this.addOutlinedImage(0, 0, "eyes-regular", 0.14);
        this.hatLayer = this.addOutlinedImage(0, -2, "hat-alien-antenna", 0.18).setVisible(false);
        this.boostLayer = this.addOutlinedImage(38, 14, "boost-shell-earring", 0.18).setVisible(false).setScale(0.65);
        this.legendaryLayer = this.addOutlinedImage(0, 0, "legendary-1", 0.16).setVisible(false);
        this.octo.add([this.bodyLayer, this.clothesLayer, this.eyesLayer, this.hatLayer, this.boostLayer, this.legendaryLayer]);
    }

    addOutlinedImage(x, y, texture, alpha = 0.18) {
        const image = this.add.image(x, y, texture);
        this.applyGameplayOutline(image, alpha);
        return image;
    }

    applyGameplayOutline(gameObject, alpha = 0.2) {
        if (!gameObject?.postFX?.addShadow) return gameObject;

        gameObject.postFX.addShadow(0, 0, 0.22, 4.2, 0x000000, 10, 1);
        gameObject.postFX.addShadow(3, 3, alpha, 2.6, 0x000000, 8, 1);
        gameObject.postFX.addShadow(-3, -3, alpha * 0.75, 2.2, 0x000000, 7, 1);
        return gameObject;
    }

    addGameplayHalo(gameObject, color = 0xffffff, alpha = 0.36, blur = 7) {
        if (!gameObject?.postFX?.addGlow) return gameObject;

        gameObject.postFX.addGlow(color, alpha, 0, false, blur, 12);
        return gameObject;
    }

    improveGameplayReadability(gameObject, options = {}) {
        this.applyGameplayOutline(gameObject, options.outlineAlpha ?? 0.28);
        if (options.haloColor) this.addGameplayHalo(gameObject, options.haloColor, options.haloAlpha ?? 0.32, options.haloBlur ?? 6);
        return gameObject;
    }

    applyLoadoutSprites() {
        const loadout = this.save.loadout;
        const body = getAssetById(loadout.body) || getAssetById("body-blue");
        const eyes = getAssetById(loadout.eyes) || getAssetById("eyes-regular");
        const hat = getAssetById(loadout.hat);
        const clothes = getAssetById(loadout.clothes);
        const boost = getAssetById(loadout.boost);
        const legendary = getAssetById(loadout.legendary);
        const baseScale = 0.68 * this.mass * this.visualScaleCompensation;

        this.currentLegendary = legendary;
        this.currentBody = body;
        this.currentEyes = eyes;
        this.currentHat = hat;
        this.currentClothes = clothes;

        if (legendary) {
            this.legendaryLayer.setTexture(this.pickFrameKey(legendary, this.swimFrame)).setScale(baseScale).setVisible(true);
            this.bodyLayer.setVisible(false);
            this.eyesLayer.setVisible(false);
            this.clothesLayer.setVisible(false);
            this.hatLayer.setVisible(false);
            this.boostLayer.setVisible(false);
            return;
        }

        this.legendaryLayer.setVisible(false);
        this.bodyLayer.setTexture(this.pickFrameKey(body, this.swimFrame)).setScale(baseScale).setVisible(true);
        this.eyesLayer.setTexture(this.pickFrameKey(eyes, this.swimFrame)).setScale(baseScale).setVisible(true);
        this.clothesLayer.setVisible(Boolean(clothes));
        this.hatLayer.setVisible(Boolean(hat));
        this.boostLayer.setVisible(Boolean(boost));

        if (clothes) this.clothesLayer.setTexture(this.pickFrameKey(clothes, this.swimFrame)).setScale(baseScale);
        if (hat) this.hatLayer.setTexture(this.pickFrameKey(hat, this.swimFrame)).setScale(baseScale);
        if (boost) this.boostLayer.setTexture(boost.key).setScale(0.28 * this.mass * this.visualScaleCompensation);
    }

    pickFrameKey(asset, frameIndex = 0) {
        if (!asset || !asset.frames) return asset?.key || "body-blue";
        return `${asset.key}-${frameIndex % asset.frames}`;
    }

    pickSpinFrameKey(asset, frameIndex = 0) {
        const spin = BODY_SPIN_ASSETS[asset?.id] || BODY_SPIN_ASSETS.generic;
        return `${spin.key}-${frameIndex % spin.frames}`;
    }

    animateOcto(dt) {
        const velocity = this.octo.body.velocity;
        const moving = Math.abs(velocity.x) > 4 || Math.abs(velocity.y) > 4;
        const intensity = moving ? 1 : 0.35;
        this.swimTime += dt * (moving ? 6.5 : 3.2);

        this.frameTimer += dt;
        while (this.frameTimer >= 0.055) {
            this.frameTimer -= 0.055;
            this.swimFrame = (this.swimFrame + 1) % 16;
            this.tankSpinFrame = (this.tankSpinFrame + 1) % 16;
            const spinning = this.time.now < this.tankSpinUntil;
            if (this.currentLegendary) {
                this.legendaryLayer.setTexture(this.pickFrameKey(this.currentLegendary, this.swimFrame));
            } else {
                this.bodyLayer.setTexture(spinning ? this.pickSpinFrameKey(this.currentBody, this.tankSpinFrame) : this.pickFrameKey(this.currentBody, this.swimFrame));
                this.eyesLayer.setVisible(!spinning).setTexture(this.pickFrameKey(this.currentEyes, this.swimFrame));
                this.clothesLayer.setVisible(Boolean(this.currentClothes) && !spinning);
                this.hatLayer.setVisible(Boolean(this.currentHat) && !spinning);
                if (this.clothesLayer.visible) this.clothesLayer.setTexture(this.pickFrameKey(this.currentClothes, this.swimFrame));
                if (this.hatLayer.visible) this.hatLayer.setTexture(this.pickFrameKey(this.currentHat, this.swimFrame));
            }
        }

        if (velocity.x > 18) this.octo.setScale(1, 1);
        if (velocity.x < -18) this.octo.setScale(-1, 1);

        const pulse = Math.sin(this.swimTime);
        const squashX = 1 + pulse * 0.018 * intensity;
        const squashY = 1 - pulse * 0.014 * intensity;
        const layerScale = 0.68 * this.mass * this.visualScaleCompensation;
        const spinning = this.time.now < this.tankSpinUntil;
        if (spinning) this.damageEnemiesTouchedBySpin();
        if (!spinning && this.tankWasSpinning) {
            this.tankWasSpinning = false;
            this.tankSpinHitEnemies.clear();
            this.bodyLayer.setTexture(this.pickFrameKey(this.currentBody, this.swimFrame));
        }
        if (spinning) this.tankWasSpinning = true;
        if (this.currentLegendary) {
            this.legendaryLayer.setVisible(true).setScale(layerScale * squashX, layerScale * squashY);
            this.bodyLayer.setVisible(false);
            this.eyesLayer.setVisible(false);
            this.clothesLayer.setVisible(false);
            this.hatLayer.setVisible(false);
            this.boostLayer.setVisible(false);
            this.octo.rotation = Math.sin(this.swimTime * 0.72) * PhaserMath.DegToRad(1.35) * intensity;
            return;
        }

        this.legendaryLayer.setVisible(false);
        const spinScale = spinning ? layerScale * 0.56 : layerScale;
        this.bodyLayer.setScale(spinScale * squashX, spinScale * squashY);
        this.eyesLayer.setScale(layerScale * squashX, layerScale * squashY);
        if (this.clothesLayer.visible) this.clothesLayer.setScale(layerScale * squashX, layerScale * squashY);
        if (this.hatLayer.visible) this.hatLayer.setScale(layerScale * squashX, layerScale * squashY);
        if (this.boostLayer.visible) this.boostLayer.setScale(0.28 * this.mass * this.visualScaleCompensation);

        if (this.time.now < this.tankSpinUntil) {
            this.octo.rotation = Math.sin(this.swimTime * 3.5) * PhaserMath.DegToRad(4);
            return;
        }

        this.eyesLayer.setVisible(true);
        this.clothesLayer.setVisible(Boolean(this.currentClothes));
        this.hatLayer.setVisible(Boolean(this.currentHat));
        this.octo.rotation = Math.sin(this.swimTime * 0.72) * PhaserMath.DegToRad(1.35) * intensity;
    }

    onOctoGlyphsEvent(event) {
        if (!event?.type) return;

        if (event.type === "prompt.sent") {
            this.onPromptSent(event);
            return;
        }

        if (event.type === "response.chunk") {
            this.onChunk(event);
            return;
        }

        if (event.type === "response.completed") {
            this.onResponseCompleted(event);
            return;
        }

        if (event.type === "tool.used") {
            this.onToolUsed(event);
            return;
        }

        if (event.type === "build.finished") {
            this.onBuildFinished(event);
            return;
        }

        if (event.type === "commit.created") {
            this.onCommitCreated(event);
        }
    }

    onPromptSent(event) {
        const promptChars = Number(event.prompt_chars || 0);
        const promptTokens = Number(event.prompt_tokens || Math.ceil(promptChars / 4) || 0);
        const promptScale = Math.max(promptTokens, Math.ceil(promptChars / 4));
        const count = PhaserMath.Clamp(Math.ceil(promptScale / 70), 3, 16);
        const gemType = promptScale > 900 ? "silver" : "green";

        this.save.lifetime.prompts += 1;
        this.save.lifetime.tankHuntCharges = Number(this.save.lifetime.tankHuntCharges || 0) + 1;
        this.save.lifetime.tokens += promptTokens;

        this.awardOrSpawnGems(count, gemType);

        this.mass = 1 + Math.min(0.65, this.save.lifetime.tokens / 160000);
        this.applyLoadoutSprites();
        this.emitState();
        this.emitTankHuntCharge();
        saveGame(this.save);
    }

    onChunk() {
        this.save.lifetime.chunks += 1;
        this.awardOrSpawnGems(1, "green");
        this.emitState();
        saveGame(this.save);
    }

    onResponseCompleted(event) {
        const completionTokens = Number(event.completion_tokens || 0);
        const chunkCount = Number(event.chunk_count || 0);
        const durationMs = Number(event.duration_ms || 0);
        const count = PhaserMath.Clamp(Math.floor((completionTokens + durationMs / 25) / 220), 3, 18);
        const gemType = completionTokens > 1400 ? "pink" : this.pickGemType(0, completionTokens);

        this.save.lifetime.tokens += completionTokens;

        this.awardOrSpawnGems(count, gemType);

        if (!this.isBackgroundCollectMode() && (completionTokens >= 900 || chunkCount >= 32 || durationMs >= 18000 || PhaserMath.Between(1, 100) <= 12 * this.stats.luck)) this.spawnTraitDiscovery();

        this.mass = 1 + Math.min(0.65, this.save.lifetime.tokens / 160000);
        this.applyLoadoutSprites();
        this.emitState();
        saveGame(this.save);
    }

    onToolUsed(event) {
        const gemByTool = {
            file_read: "blue",
            file_write: "silver",
            shell: "yellow",
            web: "blue",
            build: "yellow",
            test: "yellow",
            git: "pink",
            search: "blue",
            memory: "silver",
            other: "green"
        };
        const type = gemByTool[event.tool_kind] || "green";
        const count = event.success === false ? 1 : 2;
        this.awardOrSpawnGems(count, type);
        this.emitState();
    }

    onBuildFinished(event) {
        this.awardOrSpawnGems(event.success ? 5 : 2, event.success ? "yellow" : "green");
        if (!this.isBackgroundCollectMode() && event.success && Number(event.duration_ms || 0) > 10000) this.spawnTraitDiscovery();
        this.emitState();
    }

    onCommitCreated(event) {
        const changed = Number(event.files_changed_count || 0);
        const count = PhaserMath.Clamp(3 + changed, 4, 14);
        this.awardOrSpawnGems(count, "pink");
        this.emitState();
    }

    pickGemType(promptTokens, completionTokens) {
        if (completionTokens > 1400) return "pink";
        if (promptTokens > 1000) return "silver";

        const roll = PhaserMath.Between(1, 100);
        let cursor = 0;
        for (const [type, weight] of GEM_WEIGHTS) {
            cursor += weight;
            if (roll <= cursor) return type;
        }
        return "green";
    }

    awardOrSpawnGems(count, type = "green") {
        if (this.isBackgroundCollectMode()) {
            this.enqueueBackgroundGems(count, type);
            return;
        }
        this.spawnGem(count, type);
    }

    enqueueBackgroundGems(count, type = "green") {
        const safeCount = Math.max(0, Math.floor(count || 0));
        if (safeCount <= 0) return;

        this.reconcileBackgroundGemLedger();

        const now = this.getBackgroundLedgerNow();
        const gemDef = GEM_TYPES[type] || GEM_TYPES.green;
        const gemType = GEM_TYPES[type] ? type : "green";
        const value = Math.max(1, Math.round((gemDef.value || 1) * this.stats.gemValue));
        const speed = this.getBackgroundCollectSpeed();
        let virtualOcto = this.backgroundLedgerOcto || { x: this.octo?.x || this.worldWidth / 2, y: this.octo?.y || this.worldHeight / 2 };
        let availableAt = Math.max(now, this.backgroundLedgerAvailableAt || now);

        for (let i = 0; i < safeCount; i += 1) {
            const position = this.pickGemSpawnPosition();
            const distance = this.toroidalDistance(virtualOcto.x, virtualOcto.y, position.x, position.y);
            const travelMs = PhaserMath.Clamp(Math.round(distance / Math.max(1, speed) * 1000) + 360, 900, 11000);
            const collectAt = availableAt + travelMs;
            const ledgerGem = {
                id: `${now}-${this.backgroundGemLedger.length}-${i}`,
                type: gemType,
                value,
                x: this.wrapValue(position.x, this.worldWidth),
                y: this.wrapValue(position.y, this.worldHeight),
                spawnedAt: now,
                collectAt
            };

            this.backgroundGemLedger.push(ledgerGem);
            virtualOcto = { x: ledgerGem.x, y: ledgerGem.y };
            availableAt = collectAt;
        }

        this.backgroundLedgerOcto = virtualOcto;
        this.backgroundLedgerAvailableAt = availableAt;
    }

    reconcileBackgroundGemLedger() {
        if (!this.backgroundGemLedger?.length) return;

        const now = this.getBackgroundLedgerNow();
        const pending = [];
        let collected = 0;
        let collectedValue = 0;
        let lastCollected = null;

        for (const ledgerGem of this.backgroundGemLedger) {
            if (ledgerGem.collectAt <= now) {
                addGemValue(this.save, ledgerGem.type, ledgerGem.value);
                collected += 1;
                collectedValue += ledgerGem.value;
                this.backgroundCollectedByType[ledgerGem.type] = (this.backgroundCollectedByType[ledgerGem.type] || 0) + ledgerGem.value;
                lastCollected = ledgerGem;
                continue;
            }
            pending.push(ledgerGem);
        }

        this.backgroundGemLedger = pending;
        if (lastCollected) {
            this.backgroundLedgerOcto = { x: lastCollected.x, y: lastCollected.y };
            if (this.octo?.active) {
                this.octo.setPosition(lastCollected.x, lastCollected.y);
                this.octo.body?.setVelocity(0, 0);
            }
        }

        if (collected > 0) {
            this.backgroundCollectedGems += collected;
            this.backgroundCollectedValue += collectedValue;
            saveGame(this.save);
            triggerFTUE("firstGem", this.save);
        }
    }

    materializeBackgroundGemLedger() {
        this.reconcileBackgroundGemLedger();
        if (!this.backgroundGemLedger?.length) return 0;

        const remaining = this.backgroundGemLedger;
        this.backgroundGemLedger = [];
        this.backgroundLedgerOcto = null;
        this.backgroundLedgerAvailableAt = 0;

        for (const ledgerGem of remaining) {
            this.spawnGemAt(ledgerGem.x, ledgerGem.y, ledgerGem.type, { value: ledgerGem.value });
        }
        this.autopilotCollectTarget = null;
        return remaining.length;
    }

    flushBackgroundCollectedGems() {
        this.reconcileBackgroundGemLedger();
        const materialized = this.materializeBackgroundGemLedger();
        if (!this.backgroundCollectedGems && !materialized) return;

        const gemCount = this.backgroundCollectedGems;
        const gemValue = this.backgroundCollectedValue;
        this.backgroundCollectedGems = 0;
        this.backgroundCollectedValue = 0;
        this.backgroundCollectedByType = {};

        if (gemCount > 0) {
            this.showCenterTraitText(`Collected ${gemValue} gem value while away`);
            this.game.events.emit("octoglyphs:notice", `Octo collected ${gemCount} activity gem${gemCount === 1 ? "" : "s"} while you worked.${materialized ? ` ${materialized} still in tank.` : ""}`);
        } else if (materialized > 0) {
            this.game.events.emit("octoglyphs:notice", `${materialized} activity gem${materialized === 1 ? "" : "s"} are still waiting in the tank.`);
        }
        this.emitState();
    }

    getBackgroundLedgerNow() {
        return Date.now();
    }

    getBackgroundCollectSpeed() {
        return Math.max(72, 112 * (this.stats?.swimSpeed || 1) * (this.stats?.idleEfficiency || 1));
    }

    spawnGem(count, type = "green") {
        for (let i = 0; i < count; i += 1) {
            const position = this.pickGemSpawnPosition();
            this.spawnGemAt(position.x, position.y, type);
        }
    }

    pickGemSpawnPosition() {
        if (!this.octo?.active) {
            return {
                x: PhaserMath.Between(90, this.worldWidth - 90),
                y: PhaserMath.Between(110, this.worldHeight - 90)
            };
        }

        const camera = this.cameras.main;
        const view = camera.worldView;
        const visiblePadding = 70;

        if (!this.tankHuntActive) {
            const distance = PhaserMath.FloatBetween(Math.min(view.width, view.height) * 0.55, Math.min(view.width, view.height) * 0.85);
            const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
            return {
                x: this.octo.x + Math.cos(angle) * distance,
                y: this.octo.y + Math.sin(angle) * distance
            };
        }

        return {
            x: this.wrapValue(PhaserMath.Between(view.x - visiblePadding, view.right + visiblePadding), this.worldWidth),
            y: this.wrapValue(PhaserMath.Between(view.y - visiblePadding, view.bottom + visiblePadding), this.worldHeight)
        };
    }
    onVisibilityChanged() {
        const hidden = Boolean(document?.hidden) || document?.visibilityState === "hidden" || (typeof document?.hasFocus === "function" && !document.hasFocus());
        if (hidden === this.isPageHidden) return;

        this.isPageHidden = hidden;
        if (hidden) {
            this.visibilityPauseStartedAt = this.time?.now || 0;
            if (this.tankHuntActive) {
                this.pauseTankHuntForVisibility();
                this.game.events.emit("octoglyphs:notice", "Tank Hunt paused while the tank is out of view.");
            }
            return;
        }

        if (this.tankHuntActive) {
            this.resumeTankHuntFromVisibility();
            this.game.events.emit("octoglyphs:notice", "Tank Hunt resumed.");
        }
        this.flushBackgroundCollectedGems();
    }

    pauseTankHuntForVisibility() {
        this.physics.world.pause();
        const timers = [this.tankWaveTimer, this.autoFireTimer, this.tankHuntEndTimer, this.tankSpecificWaveTimer];
        for (const timer of timers) {
            if (timer) timer.paused = true;
        }
    }

    resumeTankHuntFromVisibility() {
        this.physics.world.resume();
        const timers = [this.tankWaveTimer, this.autoFireTimer, this.tankHuntEndTimer, this.tankSpecificWaveTimer];
        for (const timer of timers) {
            if (timer) timer.paused = false;
        }
    }

    isBackgroundCollectMode() {
        return this.isPageHidden && !this.tankHuntActive;
    }

    startTankHunt() {
        if (this.tankHuntActive) {
            this.requestTankHuntEnd();
            return;
        }

        if (!this.consumeTankHuntCharge()) return;

        this.clearTankHuntActors();
        this.clearTankHuntGems();
        this.tankHuntActive = true;
        this.tankHuntEnding = false;
        this.tankHuntKills = 0;
        this.tankHuntGoal = 0;
        this.tankHuntWave = 0;
        this.tankHuntTotalKills = 0;
        this.tankHuntBossKills = 0;
        this.tankHuntGemsCollected = 0;
        this.tankHuntGemSources = {};
        this.tankHuntDamageTaken = 0;
        this.tankHuntStartedAt = this.time.now;
        this.tankBoss = null;
        this.tankWaveResolving = false;
        this.tankWaveToken = 0;
        this.tankActiveEvent = null;
        if (this.tankEventOverlay) { this.tankEventOverlay.destroy(); this.tankEventOverlay = null; }
        this.tankContinueWave = null;
        this.tankContinueChoicePending = false;
        this.tankSpecificWaveTimer?.remove(false);
        this.tankSpecificWaveTimer = null;
        this.tankSpecificWavePending = null;
        this.tankRunStats = this.createTankRunStats();
        this.tankNextLevelAllowedAt = 0;
        this.lastTankMutationRoles = [];
        this.tankBossRewardChoiceActive = false;
        this.tankBossRewardContainer = null;
        this.applyPersistentHuntLoadout();
        this.refreshStats();
        this.tankInvincibleUntil = 0;
        this.tankSpinUntil = 0;
        this.tankSpinStartedAt = 0;
        this.tankSpinFrame = 0;
        this.createTankHud();
        this.configureAutoFireTimer();
        this.zoomForTankHunt(true);
        this.tankBackgroundDepthIndex = 0;
        this.setTankBackground(pickBackgroundForDepthIndex(this.tankBackgroundDepthIndex));
        this.game.events.emit("octoglyphs:notice", `${this.getTankArchetypeLabel()} Hunt started. Clear waves, stack mutations, then decide whether to continue.`);
        this.startNextTankWave();
        if (this.isPageHidden) this.pauseTankHuntForVisibility();
        triggerFTUE("firstHuntStart", this.save);
    }

    getTankHuntChargeState() {
        const charges = Math.max(0, Number(this.save?.lifetime?.tankHuntCharges || 0));
        return {
            prompts: charges,
            cost: TANK_HUNT_PROMPT_COST,
            ready: charges >= TANK_HUNT_PROMPT_COST,
            huntsReady: Math.floor(charges / TANK_HUNT_PROMPT_COST),
            remaining: Math.max(0, TANK_HUNT_PROMPT_COST - charges)
        };
    }

    emitTankHuntCharge() {
        this.game.events.emit("octoglyphs:hunt-charge", this.getTankHuntChargeState());
    }

    consumeTankHuntCharge() {
        const charge = this.getTankHuntChargeState();
        if (!charge.ready) {
            this.game.events.emit("octoglyphs:notice", `Tank Hunt charges in ${charge.remaining} prompt${charge.remaining === 1 ? "" : "s"}.`);
            this.emitTankHuntCharge();
            return false;
        }

        this.save.lifetime.tankHuntCharges = Number(this.save.lifetime.tankHuntCharges || 0) - TANK_HUNT_PROMPT_COST;
        saveGame(this.save);
        this.emitTankHuntCharge();
        return true;
    }

    applyPersistentHuntLoadout() {
        const equipped = equippedAssets(this.save).filter(Boolean);
        for (const asset of equipped) {
            const mods = asset.statMods || {};
            if (mods.swimSpeed) this.tankRunStats.swimSpeed *= Math.max(0.75, 1 + mods.swimSpeed);
            if (mods.magnetRange) this.tankRunStats.magnetRange *= Math.max(0.75, 1 + mods.magnetRange);
            if (mods.damage) this.tankRunStats.damageBonus += Math.max(0, Math.round(mods.damage * 5));
            if (mods.armor) this.tankRunStats.maxHp += Math.floor(mods.armor);
            if (mods.gemValue) this.addTankFamilyRank("prism", 1);
            if (mods.luck) this.tankRunStats.luckBonus = (this.tankRunStats.luckBonus || 0) + mods.luck;

            this.applyAssetHuntMods(asset);
            this.seedAssetHuntFamily(asset);
        }

        // --- Synergy system: check equipped set bonuses ---
        const equippedIds = equipped.map(a => a.id);
        const { active: activeSynergies, partial: partialSynergies } = checkSynergies(equippedIds);
        this.activeSynergies = activeSynergies;
        this.partialSynergies = partialSynergies;

        if (activeSynergies.length > 0) {
            const synergyHuntMods = aggregateSynergyHuntMods(activeSynergies);
            this.applyAssetHuntMods({ huntMods: synergyHuntMods });
            const synergyStatMods = aggregateSynergyStatMods(activeSynergies);
            if (synergyStatMods.swimSpeed) this.tankRunStats.swimSpeed *= Math.max(0.75, 1 + synergyStatMods.swimSpeed);
            if (synergyStatMods.magnetRange) this.tankRunStats.magnetRange *= Math.max(0.75, 1 + synergyStatMods.magnetRange);
            if (synergyStatMods.damage) this.tankRunStats.damageBonus += Math.max(0, Math.round(synergyStatMods.damage * 5));
            if (synergyStatMods.armor) this.tankRunStats.maxHp += Math.floor(synergyStatMods.armor);
            if (synergyStatMods.luck) this.tankRunStats.luckBonus = (this.tankRunStats.luckBonus || 0) + synergyStatMods.luck;
            if (synergyStatMods.gemValue) this.addTankFamilyRank("prism", 2);
        }

        this.seedStartingArchetypeIdentity();
        this.clampStartingTankPower();
        this.tankRunStats.maxHp = Math.max(1, this.tankRunStats.maxHp);
        this.tankRunStats.hp = this.tankRunStats.maxHp;
        this.tankRunStats.xpBreakpoints = TANK_XP_BREAKPOINTS.map(value => Math.max(6, Math.ceil(value * this.tankRunStats.nextXpMult)));
        this.tankRunStats.nextXp = this.getTankXpForNextLevel();
        this.refreshTankOrbiters();
        this.configureAutoFireTimer();

        // --- Show synergy banners after a brief delay ---
        if (activeSynergies.length > 0) {
            this.time.delayedCall(600, () => {
                for (const synergy of activeSynergies) {
                    this.showCenterTraitText(`${synergy.name} ACTIVATED!`);
                    this.game.events.emit("octoglyphs:notice", `${synergy.name}: ${synergy.desc}`);
                }
            });
        }
    }

    applyAssetHuntMods(asset) {
        const huntMods = asset.huntMods || {};
        if (!huntMods || Object.keys(huntMods).length === 0) return;

        if (huntMods.family) this.addTankFamilyRank(huntMods.family, 4);
        if (huntMods.swimSpeed) this.tankRunStats.swimSpeed *= huntMods.swimSpeed;
        if (huntMods.magnetRange) this.tankRunStats.magnetRange *= huntMods.magnetRange;
        if (huntMods.fireDelay) this.tankRunStats.fireDelay *= huntMods.fireDelay;
        if (huntMods.shotSpeed) this.tankRunStats.shotSpeed *= huntMods.shotSpeed;
        if (huntMods.shotLifetime) this.tankRunStats.shotLifetime *= huntMods.shotLifetime;
        if (huntMods.nextXpMult) this.tankRunStats.nextXpMult *= huntMods.nextXpMult;

        const additiveKeys = ["damageBonus", "maxHp", "extraProjectiles", "bulletScale", "pierce", "split", "orbit", "poison", "bounce", "spinPower", "homing", "contagion", "gemPulse", "wakeTrail", "guardianCharges", "broadside", "backblast", "inkMines", "spiral", "prismFork", "critChance", "luckBonus", "wiggle", "boomerang", "lumpOfCoal", "chain", "fear", "freeze", "spectral"];
        for (const key of additiveKeys) {
            if (!huntMods[key]) continue;
            this.tankRunStats[key] = (this.tankRunStats[key] || 0) + huntMods[key];
        }
    }

    seedAssetHuntFamily(asset) {
        const id = asset.id || "";
        const name = `${asset.name || ""} ${id}`.toLowerCase();
        const mods = asset.statMods || {};
        const explicitFamily = asset.huntMods?.family;

        if (explicitFamily) this.addTankFamilyRank(explicitFamily, 4);
        if (mods.swimSpeed > 0) this.addTankFamilyRank("current", 1);
        if (mods.damage > 0) this.addTankFamilyRank("inkstorm", 1);
        if (mods.armor > 0) this.addTankFamilyRank("shell", 1);
        if (mods.luck > 0 || mods.gemValue > 0) this.addTankFamilyRank("prism", 1);
        if (asset.slot === "eyes") this.addTankFamilyRank("prism", 1);
        if (asset.slot === "hat") this.addTankFamilyRank("shell", 1);
        if (name.includes("acid") || name.includes("toxic") || name.includes("zombie") || name.includes("evil") || name.includes("devil") || name.includes("midnight")) this.addTankFamilyRank("abyss", 1);
        if (name.includes("magma") || name.includes("fire") || name.includes("laser") || name.includes("red") || name.includes("angry")) this.addTankFamilyRank("inkstorm", 1);
        if (name.includes("aqua") || name.includes("teal") || name.includes("lime") || name.includes("propeller") || name.includes("wing") || name.includes("rocket")) this.addTankFamilyRank("current", 1);
        if (name.includes("metal") || name.includes("charcoal") || name.includes("helmet") || name.includes("armor") || name.includes("shell")) this.addTankFamilyRank("shell", 1);
        if (name.includes("gold") || name.includes("crown") || name.includes("crypto") || name.includes("rainbow") || name.includes("diamond") || name.includes("gem")) this.addTankFamilyRank("prism", 1);
    }

    addTankFamilyRank(family, amount = 1) {
        this.tankRunStats.familyRanks[family] = (this.tankRunStats.familyRanks[family] || 0) + amount;
    }

    seedStartingArchetypeIdentity() {
        this.tankRunStats.primaryFamily = this.getDominantTankFamily();
    }

    clampStartingTankPower() {
        const stats = this.tankRunStats;
        for (const [key, cap] of Object.entries(TANK_STARTING_CAPS)) {
            if (typeof stats[key] !== "number") continue;
            if (key === "fireDelay" || key === "nextXpMult") stats[key] = Math.max(cap, stats[key]);
            else stats[key] = Math.min(cap, stats[key]);
        }
        stats.bulletScale = Math.max(0.75, stats.bulletScale);
        stats.swimSpeed = Math.max(0.75, stats.swimSpeed);
        stats.magnetRange = Math.max(0.75, stats.magnetRange);
        stats.shotSpeed = Math.max(360, stats.shotSpeed);
        stats.shotLifetime = Math.max(1100, stats.shotLifetime);
        stats.startingPowerScore = this.calculateStartingPowerScore();
    }

    calculateStartingPowerScore() {
        const stats = this.tankRunStats;
        const heavyFlags = ["extraProjectiles", "broadside", "backblast", "spiral", "split", "chain", "homing", "orbit", "freeze", "fear", "poison", "prismFork", "guardianCharges", "inkMines"];
        const flagScore = heavyFlags.reduce((sum, key) => sum + Math.max(0, stats[key] || 0), 0);
        const rateScore = Math.max(0, (TANK_BASE_FIRE_DELAY - stats.fireDelay) / 35);
        const damageScore = Math.max(0, stats.damageBonus || 0) * 0.75;
        const hpScore = Math.max(0, (stats.maxHp || TANK_BASE_PLAYER_HP) - TANK_BASE_PLAYER_HP) * 0.8;
        return Math.round(flagScore + rateScore + damageScore + hpScore);
    }

    getDominantTankFamily() {
        const entries = Object.entries(this.tankRunStats.familyRanks || {});
        if (entries.length === 0) return "tide";
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    getTankArchetypeLabel() {
        return TANK_ARCHETYPES[this.tankRunStats.primaryFamily || this.getDominantTankFamily()]?.label || "Tank";
    }

    requestTankHuntEnd() {
        if (!this.tankHuntActive || this.tankHuntEnding) return;

        this.tankHuntEnding = true;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.tankHuntGoal = this.tankHuntKills + this.enemies.countActive(true);
        this.game.events.emit("octoglyphs:notice", "Ending Tank Hunt. Survive final cleanup.");
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        this.tankHuntEndTimer = this.time.delayedCall(8000, () => this.endTankHunt(false));
    }

    startNextTankWave() {
        if (!this.tankHuntActive || this.tankBoss || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive || this.tankWaveResolving) return;

        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.tankWaveResolving = false;
        this.tankHuntWave += 1;
        this.tankWaveToken += 1;
        const wave = this.tankHuntWave;
        const waveToken = this.tankWaveToken;
        if (!this.activeBackgroundKey || wave === 1) this.setTankBackground(pickBackgroundForDepthIndex(this.tankBackgroundDepthIndex || 0));
        this.tankHuntGoal = 9 + wave * 7;
        this.tankHuntKills = 0;
        this.tankBurstCount = 0;

        // Pick wave recipe
        this.currentWaveRecipe = pickWaveRecipe(wave);
        const recipe = this.currentWaveRecipe;
        const baseInterval = Math.max(260, 680 - wave * 45);
        const eventSpawnMult = (this.tankActiveEvent && this.time.now < this.tankActiveEvent.endsAt) ? (this.tankActiveEvent.def.spawnMult || 1) : 1;
        const interval = Math.round(baseInterval * (recipe.intervalMult || 1) / eventSpawnMult);

        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());

        // Trigger difficulty event if this wave has one
        this.checkTriggerDifficultyEvent(wave);

        this.spawnTankWaveBurst(wave, waveToken);
        this.tankWaveTimer = this.time.addEvent({
            delay: interval,
            loop: true,
            callback: () => this.spawnTankWaveBurst(wave, waveToken)
        });
    }

    checkTriggerDifficultyEvent(wave) {
        const eventDef = getEventForWave(wave);
        if (!eventDef) return;

        // Scale event duration relative to player power — stronger players get slightly longer events
        const playerPower = (this.tankRunStats?.startingPowerScore || 0);
        const durationMult = 1 + Math.min(0.25, playerPower * 0.015);
        const duration = Math.round(eventDef.duration * durationMult);

        this.tankActiveEvent = {
            def: eventDef,
            endsAt: this.time.now + duration
        };

        // Show event name on screen
        this.showDifficultyEventBanner(eventDef, duration);

        // Schedule event end cleanup
        this.time.delayedCall(duration, () => {
            this.endDifficultyEvent();
        });
    }

    showDifficultyEventBanner(eventDef, duration) {
        // Full-screen color overlay (subtle)
        if (this.tankEventOverlay) { this.tankEventOverlay.destroy(); this.tankEventOverlay = null; }
        this.tankEventOverlay = this.add.rectangle(
            this.cameras.main.width / 2, this.cameras.main.height / 2,
            this.cameras.main.width, this.cameras.main.height,
            eventDef.tint, 0.18
        ).setDepth(998).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: this.tankEventOverlay,
            alpha: 0.18,
            duration: 400,
            yoyo: false
        });

        // Big event name text
        const eventText = this.add.text(
            this.cameras.main.width / 2, this.cameras.main.height * 0.28,
            eventDef.label,
            {
                fontFamily: "\"Press Start 2P\", monospace",
                fontSize: "22px",
                color: eventDef.color,
                align: "center",
                stroke: "#000000",
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setAlpha(0);

        this.tweens.add({
            targets: eventText,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 2200,
            onComplete: () => { if (eventText?.active) eventText.destroy(); }
        });

        // Fade out overlay when event ends
        this.time.delayedCall(duration - 500, () => {
            if (this.tankEventOverlay?.active) {
                this.tweens.add({
                    targets: this.tankEventOverlay,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (this.tankEventOverlay) { this.tankEventOverlay.destroy(); this.tankEventOverlay = null; }
                    }
                });
            }
        });
    }

    endDifficultyEvent() {
        this.tankActiveEvent = null;
        if (this.tankEventOverlay?.active) {
            this.tankEventOverlay.destroy();
            this.tankEventOverlay = null;
        }
        // Brief "back to normal" indicator
        if (this.tankHuntActive) {
            this.showCenterTraitText("PRESSURE EASED");
        }
    }

    spawnTankWaveBurst(wave, waveToken = this.tankWaveToken) {
        if (!this.tankHuntActive || this.tankBoss || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive || this.tankWaveResolving || wave !== this.tankHuntWave || waveToken !== this.tankWaveToken || this.tankHuntKills >= this.tankHuntGoal) return;

        // Spawn breathing: pause every 3-4 bursts for a lull
        this.tankBurstCount = (this.tankBurstCount || 0) + 1;
        const breatheAfter = 3 + Math.floor(wave / 4);
        if (this.tankBurstCount >= breatheAfter) {
            this.tankBurstCount = 0;
            // Skip this burst (breathing lull) - timer will fire again next interval
            return;
        }

        const recipe = this.currentWaveRecipe || TANK_WAVE_RECIPES.find(r => r.id === "mixed_assault");
        const startingPressure = Math.min(4, Math.floor((this.tankRunStats.startingPowerScore || 0) / 5));
        const baseCount = 2 + Math.floor(wave / 2) + Math.min(1, Math.floor(startingPressure / 3));
        const spawnPerPulse = Math.max(1, Math.round(baseCount * (recipe.countMult || 1)));

        // Pick a formation for this burst
        const positions = this.pickFormationPositions(spawnPerPulse, recipe);
        for (let i = 0; i < spawnPerPulse; i += 1) {
            this.spawnTankEnemy(false, wave, recipe, positions[i] || null);
        }
    }

    spawnTankEnemy(isBoss = false, wave = this.tankHuntWave || 1, recipe = null, overridePos = null) {
        if (!this.tankHuntActive && !isBoss) return;
        const maxEnemies = 16 + Math.min(26, wave * 5);
        if (!isBoss && this.enemies.countActive(true) >= maxEnemies) return;

        const position = overridePos || this.pickTankSpawnPosition();

        // Use recipe enemy pool if available, otherwise fallback to random from wave-eligible
        let def;
        if (isBoss) {
            const bossDef = Utils.Array.GetRandom(TANK_BOSS_TYPES);
            def = { ...bossDef, hp: Math.round((bossDef.hp || 42) * 1.9 + wave * 22) };
        } else if (recipe && recipe.enemies && recipe.enemies.length > 0) {
            const chosenKey = Utils.Array.GetRandom(recipe.enemies);
            const found = TANK_ENEMY_TYPES.find(e => e.key === chosenKey);
            def = found || Utils.Array.GetRandom(TANK_ENEMY_TYPES);
        } else {
            const available = TANK_ENEMY_TYPES.filter(enemy => enemy.minWave <= wave);
            def = Utils.Array.GetRandom(available.length > 0 ? available : TANK_ENEMY_TYPES);
        }
        const textureKey = this.getTankEnemyTextureKey(def);
        const enemy = this.enemies.create(position.x, position.y, textureKey);

        const startingPressure = Math.min(4, Math.floor((this.tankRunStats.startingPowerScore || 0) / 5));
        const eventEliteMult = (this.tankActiveEvent && this.time.now < this.tankActiveEvent.endsAt) ? (this.tankActiveEvent.def.eliteChanceMult || 1) : 1;
        const eliteChance = Math.min(52, Math.round((12 + startingPressure * 3) * eventEliteMult));
        const eliteMinWave = startingPressure >= 3 ? 3 : 4;
        const isElite = !isBoss && wave >= eliteMinWave && PhaserMath.Between(1, 100) <= eliteChance;
        const eliteMod = isElite ? this.pickEliteModifier() : null;
        const hpMult = eliteMod?.hpMult || 1;
        const speedMult = eliteMod?.speedMult || 1;

        const recipeHpMult = (!isBoss && recipe?.hpMult) ? recipe.hpMult : 1;
        const recipeSpeedMult = (!isBoss && recipe?.speedMult) ? recipe.speedMult : 1;
        const startingHpMult = isBoss ? 1 : 1 + Math.min(0.2, startingPressure * 0.05);
        const enemyMaxHp = Math.round((def.hp + Math.max(0, wave - 1) * 0.55) * hpMult * startingHpMult * recipeHpMult);
        enemy.setData("hp", enemyMaxHp);
        enemy.setData("maxHp", enemyMaxHp);
        enemy.setData("speed", (def.speed + Math.max(0, wave - 1) * 6.5) * speedMult * recipeSpeedMult);
        // Assign boss-specific behavior based on key
        let bossBehavior = "boss";
        if (isBoss) {
            const k = def.key || "";
            if (k.includes("red-shark")) bossBehavior = "boss_red_charger";
            else if (k.includes("shark") && !k.includes("mummy")) bossBehavior = "boss_charger";
            else if (k.includes("mummy")) bossBehavior = "boss_phaser";
            else bossBehavior = "boss_summoner"; // halloween octos
        }
        enemy.setData("behavior", isBoss ? bossBehavior : def.behavior || "chaser");
        enemy.setData("phase", PhaserMath.FloatBetween(0, Math.PI * 2));
        enemy.setData("strafe", PhaserMath.RND.sign());
        enemy.setData("chargeUntil", 0);
        enemy.setData("behaviorTimer", this.time.now + PhaserMath.Between(700, 1500));
        enemy.setData("dashDirX", 0);
        enemy.setData("dashDirY", 0);
        enemy.setData("dashUntil", 0);
        enemy.setData("burstUntil", 0);
        enemy.setData("wanderAngle", PhaserMath.FloatBetween(0, Math.PI * 2));
        enemy.setData("shotPattern", PhaserMath.Between(0, 2));
        // Boss-specific state
        if (isBoss) {
            enemy.setData("bossChargeState", "stalk"); // stalk | winding | charging | recovering
            enemy.setData("bossChargeTimer", this.time.now + PhaserMath.Between(900, 1600));
            enemy.setData("bossSummonCooldown", this.time.now + PhaserMath.Between(2600, 3800));
            enemy.setData("bossLungeCooldown", this.time.now + PhaserMath.Between(1200, 2200));
            enemy.setData("bossLungeUntil", 0);
            enemy.setData("bossPhaseState", "vulnerable"); // vulnerable | invulnerable
            enemy.setData("bossPhaseTimer", this.time.now + PhaserMath.Between(2800, 4200));
        }
        const eventGemMult = (this.tankActiveEvent && this.time.now < this.tankActiveEvent.endsAt) ? (this.tankActiveEvent.def.gemDropMult || 1) : 1;
        const normalDropChance = Math.min(52, Math.round((TANK_NORMAL_GEM_DROP_CHANCE + Math.floor(wave * 0.6) + Math.round((this.tankRunStats.luckBonus || 0) * 5)) * eventGemMult));
        const eliteDropChance = Math.min(92, Math.round((TANK_ELITE_GEM_DROP_CHANCE + Math.round((this.tankRunStats.luckBonus || 0) * 6)) * eventGemMult));
        const dropsNormalGem = PhaserMath.Between(1, 100) <= normalDropChance;
        const dropsEliteGem = PhaserMath.Between(1, 100) <= eliteDropChance;
        enemy.setData("gemType", isBoss ? "blue" : (isElite ? "blue" : this.pickTankEnemyGemType(wave)));
        enemy.setData("gems", isBoss ? def.gems : (isElite ? (dropsEliteGem ? 1 : 0) : (dropsNormalGem ? 1 : 0)));
        enemy.setData("boss", isBoss);
        enemy.setData("elite", isElite);
        enemy.setData("eliteType", eliteMod?.type || null);
        enemy.setData("eliteTint", eliteMod?.tint || null);
        enemy.setData("facingOffset", def.facingOffset ?? -90);
        enemy.setData("flipX", Boolean(def.flipX));
        enemy.setData("spawnedAt", this.time.now);
        enemy.setData("shootCooldown", 0);
        enemy.setData("animFrames", def.frames || 0);
        enemy.setData("animKey", def.key);
        enemy.setData("fixedRotation", Boolean(def.fixedRotation));
        enemy.setData("flipWithDirection", Boolean(def.flipWithDirection));
        enemy.setScale(def.scale * (isElite ? 1.18 : 1));
        enemy.setDepth(isBoss ? 17 : 15);
        this.improveGameplayReadability(enemy, {
            outlineAlpha: isBoss ? 0.46 : 0.4,
            haloColor: isBoss ? 0xff4f8f : (isElite ? 0xffe36e : 0xffffff),
            haloAlpha: isBoss ? 0.36 : 0.22,
            haloBlur: isBoss ? 10 : 7
        });
        const hitRadius = isBoss ? 42 : 26;
        const frameWidth = enemy.frame?.realWidth || enemy.width || hitRadius * 2;
        const frameHeight = enemy.frame?.realHeight || enemy.height || hitRadius * 2;
        enemy.body.setCircle(
            hitRadius,
            frameWidth * 0.5 - hitRadius,
            frameHeight * 0.5 - hitRadius
        );
        enemy.body.setDamping(true);
        enemy.body.setDrag(isBoss ? 0.94 : 0.86);
        enemy.body.setMaxVelocity((def.speed + Math.max(0, wave - 1) * 7) * speedMult * recipeSpeedMult * (isBoss ? 1.25 : 1.45));
        const faceDelta = this.toroidalDelta(enemy.x, enemy.y, this.octo.x, this.octo.y);
        this.faceTankEnemy(enemy, faceDelta.dx, faceDelta.dy);
        if (isBoss) {
            this.tankBoss = enemy;
            this.tankWaveResolving = true;
        }
    }

    pickEliteModifier() {
        const mods = [
            { type: "armored", hpMult: 2, speedMult: 0.82, tint: 0x888899 },
            { type: "swift", hpMult: 1, speedMult: 1.35, tint: 0x55ffff },
            { type: "splitter", hpMult: 1.15, speedMult: 0.95, tint: 0xff8844 },
            { type: "shooter", hpMult: 1.25, speedMult: 0.82, tint: 0xff4466 }
        ];
        return Utils.Array.GetRandom(mods);
    }

    pickTankEnemyGemType(wave) {
        const roll = PhaserMath.Between(1, 100);
        if (wave >= 5 && roll <= 5) return "yellow";
        if (wave >= 3 && roll <= 26) return "blue";
        return "green";
    }

    pickTankSpawnPosition() {
        if (this.tankHuntActive && this.octo?.active) {
            const camera = this.cameras.main;
            const view = camera.worldView;
            // Spawn outside the visible viewport with 60px buffer
            const halfW = view.width * 0.5 + 60;
            const halfH = view.height * 0.5 + 60;
            const edge = PhaserMath.Between(0, 3);
            if (edge === 0) return { x: this.octo.x - halfW, y: this.octo.y + PhaserMath.Between(-halfH, halfH) };
            if (edge === 1) return { x: this.octo.x + halfW, y: this.octo.y + PhaserMath.Between(-halfH, halfH) };
            if (edge === 2) return { x: this.octo.x + PhaserMath.Between(-halfW, halfW), y: this.octo.y - halfH };
            return { x: this.octo.x + PhaserMath.Between(-halfW, halfW), y: this.octo.y + halfH };
        }

        const margin = 70;
        const edge = PhaserMath.Between(0, 3);
        if (edge === 0) return { x: margin, y: PhaserMath.Between(100, this.worldHeight - 100) };
        if (edge === 1) return { x: this.worldWidth - margin, y: PhaserMath.Between(100, this.worldHeight - 100) };
        if (edge === 2) return { x: PhaserMath.Between(90, this.worldWidth - 90), y: margin };
        return { x: PhaserMath.Between(90, this.worldWidth - 90), y: this.worldHeight - margin };
    }

    pickFormationPositions(count, recipe) {
        if (!this.octo?.active) {
            const positions = [];
            for (let i = 0; i < count; i++) positions.push(this.pickTankSpawnPosition());
            return positions;
        }

        // Choose formation type based on recipe
        const formations = ["scatter", "line", "ring", "cluster"];
        let formation = "scatter";
        if (recipe) {
            if (recipe.id === "swarm") formation = Utils.Array.GetRandom(["ring", "cluster"]);
            else if (recipe.id === "charger_rush" || recipe.id === "blitz") formation = "line";
            else if (recipe.id === "flanker_ambush") formation = "line";
            else if (recipe.id === "tank_wall" || recipe.id === "siege") formation = "line";
            else if (recipe.id === "mixed_assault") formation = Utils.Array.GetRandom(formations);
            else formation = "scatter";
        }

        // Spawn distance: always outside visible viewport
        const camera = this.cameras.main;
        const view = camera.worldView;
        const distance = Math.max(view.width, view.height) * 0.5 + 80;
        const px = this.octo.x;
        const py = this.octo.y;
        const positions = [];

        if (formation === "line") {
            // Line from one direction, outside viewport
            const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
            const spacing = 48;
            const startX = px + Math.cos(angle) * distance;
            const startY = py + Math.sin(angle) * distance;
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);
            const offset = -(count - 1) * spacing * 0.5;
            for (let i = 0; i < count; i++) {
                positions.push({
                    x: startX + perpX * (offset + i * spacing),
                    y: startY + perpY * (offset + i * spacing)
                });
            }
        } else if (formation === "ring") {
            // Ring closing in — but with a gap so player can escape
            const ringRadius = distance;
            const startAngle = PhaserMath.FloatBetween(0, Math.PI * 2);
            // Leave a gap of ~60 degrees (1 slot skipped per 6 slots)
            const gapIndex = PhaserMath.Between(0, count - 1);
            const totalSlots = count + 1; // extra slot is the gap
            for (let i = 0; i < totalSlots; i++) {
                if (i === gapIndex) continue; // skip one slot = escape gap
                const a = startAngle + (Math.PI * 2 / totalSlots) * i;
                positions.push({
                    x: px + Math.cos(a) * ringRadius,
                    y: py + Math.sin(a) * ringRadius
                });
                if (positions.length >= count) break;
            }
        } else if (formation === "cluster") {
            // Tight group from one direction, outside viewport
            const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
            const cx = px + Math.cos(angle) * distance;
            const cy = py + Math.sin(angle) * distance;
            for (let i = 0; i < count; i++) {
                positions.push({
                    x: cx + PhaserMath.Between(-40, 40),
                    y: cy + PhaserMath.Between(-40, 40)
                });
            }
        } else {
            // Scatter (random offscreen positions)
            for (let i = 0; i < count; i++) {
                positions.push(this.pickTankSpawnPosition());
            }
        }

        return positions;
    }

    updateTankEnemies() {
        if (!this.enemies) return;

        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active || !enemy.body || !this.octo?.active) continue;
            const { dx, dy } = this.toroidalDelta(enemy.x, enemy.y, this.octo.x, this.octo.y);
            const length = Math.max(0.001, Math.hypot(dx, dy));
            if (this.tankUpgradeChoiceActive || this.tankBossRewardChoiceActive || this.tankContinueChoiceActive) {
                enemy.body.setVelocity(0, 0);
                continue;
            }

            const baseSpeed = enemy.getData("speed") || 50;
            // Apply difficulty event speed multiplier — scale relative to player speed so fast builds still feel pressure
            let eventSpeedMult = 1;
            if (this.tankActiveEvent && this.time.now < this.tankActiveEvent.endsAt) {
                const rawMult = this.tankActiveEvent.def.speedMult || 1;
                // Player speed factor: if player is faster than default, boost event speed proportionally
                const playerSpeedFactor = (this.stats?.swimSpeed || 1) * (this.tankRunStats?.swimSpeed || 1);
                eventSpeedMult = 1 + (rawMult - 1) * Math.max(1, playerSpeedFactor);
            }
            const speed = baseSpeed * eventSpeedMult;
            const behavior = enemy.getData("behavior") || "chaser";
            const phase = enemy.getData("phase") || 0;
            const age = Math.max(0, this.time.now - (enemy.getData("spawnedAt") || this.time.now));

            // Enemy projectiles: shooter elites and non-octo bosses fire back. Octo bosses use their own readable pattern below.
            const canShoot = ((enemy.getData("eliteType") === "shooter") || (enemy.getData("boss") && behavior !== "boss_summoner")) && behavior !== "sniper";
            if (canShoot && length < 480) {
                const cooldown = enemy.getData("shootCooldown") || 0;
                if (this.time.now > cooldown) {
                    const shootInterval = enemy.getData("boss") ? 1800 : 2400;
                    enemy.setData("shootCooldown", this.time.now + shootInterval);
                    this.spawnEnemyProjectile(enemy, dx / length, dy / length);
                }
            }
            let targetVelocityX = dx / length * speed;
            let targetVelocityY = dy / length * speed;

            if (behavior === "drifter") {
                const wave = Math.sin(this.time.now * 0.003 + phase) * speed * 0.55;
                targetVelocityX += (-dy / length) * wave;
                targetVelocityY += (dx / length) * wave;
            } else if (behavior === "wanderer") {
                const timer = enemy.getData("behaviorTimer") || 0;
                if (this.time.now > timer) {
                    const lead = Math.atan2(dy, dx) + PhaserMath.FloatBetween(-1.25, 1.25);
                    enemy.setData("wanderAngle", lead);
                    enemy.setData("behaviorTimer", this.time.now + PhaserMath.Between(900, 1800));
                }
                const wanderAngle = enemy.getData("wanderAngle") || Math.atan2(dy, dx);
                const pull = PhaserMath.Clamp((length - 180) / 360, 0.15, 0.75);
                targetVelocityX = Math.cos(wanderAngle) * speed * 0.72 + dx / length * speed * pull;
                targetVelocityY = Math.sin(wanderAngle) * speed * 0.72 + dy / length * speed * pull;
            } else if (behavior === "flanker") {
                const strafe = enemy.getData("strafe") || 1;
                const orbitBias = PhaserMath.Clamp((260 - length) / 260, 0, 1);
                targetVelocityX = dx / length * speed * (0.55 + orbitBias * 0.25) + (-dy / length) * speed * 0.78 * strafe;
                targetVelocityY = dy / length * speed * (0.55 + orbitBias * 0.25) + (dx / length) * speed * 0.78 * strafe;
                if (age > 900 && PhaserMath.Between(0, 1000) < 3) enemy.setData("strafe", -strafe);
            } else if (behavior === "herder") {
                const strafe = enemy.getData("strafe") || 1;
                const desired = 250;
                const rangePush = PhaserMath.Clamp((length - desired) / desired, -0.55, 0.75);
                targetVelocityX = dx / length * speed * rangePush + (-dy / length) * speed * 0.92 * strafe;
                targetVelocityY = dy / length * speed * rangePush + (dx / length) * speed * 0.92 * strafe;
                if (age > 900 && PhaserMath.Between(0, 1000) < 5) enemy.setData("strafe", -strafe);
            } else if (behavior === "zigzag") {
                const wave = Math.sin(this.time.now * 0.01 + phase) * speed * 1.1;
                targetVelocityX = dx / length * speed * 0.86 + (-dy / length) * wave;
                targetVelocityY = dy / length * speed * 0.86 + (dx / length) * wave;
            } else if (behavior === "spiraler") {
                const strafe = enemy.getData("strafe") || 1;
                const orbitStrength = PhaserMath.Clamp(length / 420, 0.45, 1.05);
                targetVelocityX = dx / length * speed * 0.42 + (-dy / length) * speed * orbitStrength * strafe;
                targetVelocityY = dy / length * speed * 0.42 + (dx / length) * speed * orbitStrength * strafe;
                if (length < 130 || length > 540) enemy.setData("strafe", -strafe);
            } else if (behavior === "blocker") {
                const desired = 155;
                const rangePush = PhaserMath.Clamp((length - desired) / desired, -0.35, 0.8);
                const wave = Math.sin(this.time.now * 0.0025 + phase) * speed * 0.42;
                targetVelocityX = dx / length * speed * rangePush + (-dy / length) * wave;
                targetVelocityY = dy / length * speed * rangePush + (dx / length) * wave;
            } else if (behavior === "dart") {
                const dashUntil = enemy.getData("dashUntil") || 0;
                if (this.time.now > dashUntil && this.time.now > (enemy.getData("behaviorTimer") || 0) && length < 640) {
                    enemy.setData("dashDirX", dx / length);
                    enemy.setData("dashDirY", dy / length);
                    enemy.setData("dashUntil", this.time.now + PhaserMath.Between(260, 420));
                    enemy.setData("behaviorTimer", this.time.now + PhaserMath.Between(1200, 2100));
                }
                if (this.time.now < (enemy.getData("dashUntil") || 0)) {
                    targetVelocityX = (enemy.getData("dashDirX") || dx / length) * speed * 2.45;
                    targetVelocityY = (enemy.getData("dashDirY") || dy / length) * speed * 2.45;
                    enemy.setData("instantVelocity", true);
                } else {
                    const stalk = Math.sin(this.time.now * 0.004 + phase) * speed * 0.5;
                    targetVelocityX = dx / length * speed * 0.52 + (-dy / length) * stalk;
                    targetVelocityY = dy / length * speed * 0.52 + (dx / length) * stalk;
                }
            } else if (behavior === "pouncer") {
                const chargeUntil = enemy.getData("chargeUntil") || 0;
                if (this.time.now > chargeUntil && length < 560 && PhaserMath.Between(0, 1000) < 12) {
                    enemy.setData("chargeUntil", this.time.now + 520);
                }
                if (this.time.now < (enemy.getData("chargeUntil") || 0)) {
                    targetVelocityX = dx / length * speed * 1.9;
                    targetVelocityY = dy / length * speed * 1.9;
                } else {
                    const offset = Math.sin(this.time.now * 0.004 + phase) * speed * 0.45;
                    targetVelocityX = dx / length * speed * 0.68 + (-dy / length) * offset;
                    targetVelocityY = dy / length * speed * 0.68 + (dx / length) * offset;
                }
            } else if (behavior === "sniper") {
                const canShoot = this.time.now > (enemy.getData("shootCooldown") || 0);
                const desired = 360;
                const rangePush = PhaserMath.Clamp((length - desired) / desired, -0.65, 0.65);
                const strafe = enemy.getData("strafe") || 1;
                targetVelocityX = dx / length * speed * rangePush + (-dy / length) * speed * 0.62 * strafe;
                targetVelocityY = dy / length * speed * rangePush + (dx / length) * speed * 0.62 * strafe;
                if (canShoot && length < 620) {
                    enemy.setData("shootCooldown", this.time.now + PhaserMath.Between(1500, 2300));
                    this.spawnEnemyProjectile(enemy, dx / length, dy / length, { speed: 210, scale: 0.46, tint: 0x66ddff, lifetime: 3600 });
                }
                if (age > 900 && PhaserMath.Between(0, 1000) < 4) enemy.setData("strafe", -strafe);
            } else if (behavior === "boss_red_charger") {
                // Red shark boss: slow predator cruise → obvious wind-up → violent locked dash → recovery.
                const playerMaxSpeed = 190 * (this.stats?.swimSpeed || 1) * (this.tankRunStats?.swimSpeed || 1);
                const hp = enemy.getData("hp") || 1;
                const maxHp = enemy.getData("maxHp") || hp;
                const hpRatio = PhaserMath.Clamp(hp / Math.max(1, maxHp), 0, 1);
                const phaseBoost = hpRatio < 0.35 ? 1.35 : hpRatio < 0.65 ? 1.18 : 1;
                const state = enemy.getData("bossChargeState") || "stalk";
                const timer = enemy.getData("bossChargeTimer") || 0;
                const now = this.time.now;

                if (state === "stalk") {
                    enemy.clearTint();
                    const stalkSpeed = speed * 0.58 * phaseBoost;
                    const sideBias = Math.sign(dx || 1);
                    const verticalPull = PhaserMath.Clamp(dy / Math.max(1, Math.abs(dy)), -1, 1) * stalkSpeed * 0.38;
                    targetVelocityX = sideBias * stalkSpeed * 0.72;
                    targetVelocityY = verticalPull + Math.sin(now * 0.0022 + phase) * stalkSpeed * 0.28;
                    if (now > timer && length < 620) {
                        enemy.setData("bossChargeState", "winding");
                        enemy.setData("bossChargeTimer", now + Math.round(520 / phaseBoost));
                        enemy.setData("chargeDirX", dx / length);
                        enemy.setData("chargeDirY", dy / length);
                    }
                } else if (state === "winding") {
                    const pulse = Math.floor(now / 80) % 2 === 0;
                    enemy.setTint(pulse ? 0xff2222 : 0xff8844);
                    targetVelocityX = -(dx / length) * speed * 0.18;
                    targetVelocityY = -(dy / length) * speed * 0.18;
                    if (now > timer) {
                        enemy.clearTint();
                        enemy.setData("bossChargeState", "charging");
                        enemy.setData("bossChargeTimer", now + Math.round(760 * phaseBoost));
                    }
                } else if (state === "charging") {
                    enemy.setTint(0xff3311);
                    const dashSpeed = Math.max(speed * 4.4 * phaseBoost, playerMaxSpeed * 2.25 * phaseBoost, 560);
                    const cdx = enemy.getData("chargeDirX") || dx / length;
                    const cdy = enemy.getData("chargeDirY") || dy / length;
                    targetVelocityX = cdx * dashSpeed;
                    targetVelocityY = cdy * dashSpeed;
                    enemy.setData("instantVelocity", true);
                    if (now > timer) {
                        enemy.clearTint();
                        enemy.setData("bossChargeState", "recovering");
                        enemy.setData("bossChargeTimer", now + PhaserMath.Between(520, 820));
                    }
                } else if (state === "recovering") {
                    targetVelocityX = dx / length * speed * 0.18;
                    targetVelocityY = dy / length * speed * 0.18;
                    if (now > timer) {
                        enemy.setData("bossChargeState", "stalk");
                        enemy.setData("bossChargeTimer", now + PhaserMath.Between(Math.round(620 / phaseBoost), Math.round(1100 / phaseBoost)));
                    }
                }
            } else if (behavior === "boss_charger") {
                // Shark boss: stalk → wind up → charge → recover → repeat
                // Scale charge speed relative to player speed so it's dodgeable but threatening
                const playerMaxSpeed = 190 * (this.stats?.swimSpeed || 1) * (this.tankRunStats?.swimSpeed || 1);
                const state = enemy.getData("bossChargeState") || "stalk";
                const timer = enemy.getData("bossChargeTimer") || 0;
                const now = this.time.now;

                if (state === "stalk") {
                    // Faster approach with a slight orbit so the boss keeps pressure without instantly colliding.
                    const stalkSpeed = speed * 0.72;
                    const orbit = Math.sin(now * 0.0018 + phase) * stalkSpeed * 0.55;
                    targetVelocityX = dx / length * stalkSpeed + (-dy / length) * orbit;
                    targetVelocityY = dy / length * stalkSpeed + (dx / length) * orbit;
                    if (now > timer) {
                        enemy.setData("bossChargeState", "winding");
                        enemy.setData("bossChargeTimer", now + 480);
                        enemy.setData("chargeDirX", dx / length);
                        enemy.setData("chargeDirY", dy / length);
                    }
                } else if (state === "winding") {
                    // Brief pull-back telegraphs the dash.
                    targetVelocityX = -(dx / length) * speed * 0.28;
                    targetVelocityY = -(dy / length) * speed * 0.28;
                    if (Math.floor(now / 100) % 2 === 0) enemy.setTint(0xff6644);
                    else enemy.clearTint();
                    if (now > timer) {
                        enemy.clearTint();
                        enemy.setData("bossChargeState", "charging");
                        enemy.setData("bossChargeTimer", now + 820);
                    }
                } else if (state === "charging") {
                    // Fast straight-line charge in locked direction.
                    const chargeSpeed = Math.max(speed * 2.8, playerMaxSpeed * 1.7);
                    const cdx = enemy.getData("chargeDirX") || dx / length;
                    const cdy = enemy.getData("chargeDirY") || dy / length;
                    targetVelocityX = cdx * chargeSpeed;
                    targetVelocityY = cdy * chargeSpeed;
                    if (now > timer) {
                        enemy.setData("bossChargeState", "recovering");
                        enemy.setData("bossChargeTimer", now + PhaserMath.Between(900, 1400));
                    }
                } else if (state === "recovering") {
                    // Short vulnerability window after charge.
                    targetVelocityX = dx / length * speed * 0.32;
                    targetVelocityY = dy / length * speed * 0.32;
                    if (now > timer) {
                        enemy.setData("bossChargeState", "stalk");
                        enemy.setData("bossChargeTimer", now + PhaserMath.Between(1000, 1800));
                    }
                }
            } else if (behavior === "boss_summoner") {
                // Halloween octo boss: pressure drift, periodic lunges, and mini-add summons.
                const playerMaxSpeed = 190 * (this.stats?.swimSpeed || 1) * (this.tankRunStats?.swimSpeed || 1);
                const now = this.time.now;
                const lungeUntil = enemy.getData("bossLungeUntil") || 0;
                const lungeCd = enemy.getData("bossLungeCooldown") || 0;

                if (now < lungeUntil) {
                    const lungeSpeed = Math.max(speed * 1.85, playerMaxSpeed * 1.28);
                    const ldx = enemy.getData("bossLungeDirX") || dx / length;
                    const ldy = enemy.getData("bossLungeDirY") || dy / length;
                    targetVelocityX = ldx * lungeSpeed;
                    targetVelocityY = ldy * lungeSpeed;
                } else {
                    const driftSpeed = speed * 0.82;
                    const wave = Math.sin(now * 0.002 + phase) * driftSpeed * 0.48;
                    targetVelocityX = dx / length * driftSpeed + (-dy / length) * wave;
                    targetVelocityY = dy / length * driftSpeed + (dx / length) * wave;
                    if (now > lungeCd && length < 560) {
                        enemy.setData("bossLungeDirX", dx / length);
                        enemy.setData("bossLungeDirY", dy / length);
                        enemy.setData("bossLungeUntil", now + 520);
                        enemy.setData("bossLungeCooldown", now + PhaserMath.Between(2400, 3600));
                        enemy.setTint(0xff8ad8);
                        this.time.delayedCall(260, () => { if (enemy.active) enemy.clearTint(); });
                    }
                }

                const summonCd = enemy.getData("bossSummonCooldown") || 0;
                if (now > summonCd) {
                    const addCount = PhaserMath.Between(2, 4);
                    for (let i = 0; i < addCount; i++) {
                        const angle = (Math.PI * 2 / addCount) * i + PhaserMath.FloatBetween(-0.3, 0.3);
                        const dist = PhaserMath.Between(40, 70);
                        const addX = enemy.x + Math.cos(angle) * dist;
                        const addY = enemy.y + Math.sin(angle) * dist;
                        this.spawnTankEnemy(false, this.tankHuntWave || 1, null, { x: addX, y: addY });
                    }
                    enemy.setTint(0xaa44ff);
                    this.time.delayedCall(300, () => { if (enemy.active) enemy.clearTint(); });
                    const baseCd = Math.max(2600, 4600 - (this.tankHuntWave || 1) * 120);
                    enemy.setData("bossSummonCooldown", now + PhaserMath.Between(baseCd, baseCd + 1200));
                }

                const shootCd = enemy.getData("shootCooldown") || 0;
                if (now > shootCd && length < 680) {
                    enemy.setData("shootCooldown", now + PhaserMath.Between(2600, 3600));
                    this.fireOctoBossShotPattern(enemy, Math.atan2(dy, dx));
                }
            } else if (behavior === "boss_phaser") {
                // Mummy shark: alternates vulnerable (slow chase) and invulnerable (fast rush)
                const playerMaxSpeed = 190 * (this.stats?.swimSpeed || 1) * (this.tankRunStats?.swimSpeed || 1);
                const phaseState = enemy.getData("bossPhaseState") || "vulnerable";
                const phaseTimer = enemy.getData("bossPhaseTimer") || 0;
                const now = this.time.now;

                if (phaseState === "vulnerable") {
                    // Slow chase — player can deal damage.
                    const slowSpeed = speed * 0.7;
                    targetVelocityX = dx / length * slowSpeed;
                    targetVelocityY = dy / length * slowSpeed;
                    enemy.setAlpha(1);
                    if (now > phaseTimer) {
                        enemy.setData("bossPhaseState", "invulnerable");
                        enemy.setData("bossPhaseTimer", now + PhaserMath.Between(1700, 2500));
                    }
                } else {
                    // Invulnerable rush — player must dodge.
                    const rushSpeed = Math.max(speed * 2.25, playerMaxSpeed * 1.45);
                    targetVelocityX = dx / length * rushSpeed;
                    targetVelocityY = dy / length * rushSpeed;
                    enemy.setAlpha(0.52);
                    enemy.setTint(0x88ffcc);
                    if (now > phaseTimer) {
                        enemy.setData("bossPhaseState", "vulnerable");
                        enemy.setData("bossPhaseTimer", now + PhaserMath.Between(2600, 4200));
                        enemy.setAlpha(1);
                        enemy.clearTint();
                    }
                }
            } else if (behavior === "boss") {
                // Fallback generic boss (shouldn't happen, but safety)
                const wave = Math.sin(this.time.now * 0.002 + phase) * speed * 0.35;
                targetVelocityX += (-dy / length) * wave;
                targetVelocityY += (dx / length) * wave;
            } else if (behavior === "fleeing") {
                // Fear: run away from player
                targetVelocityX = -dx / length * speed;
                targetVelocityY = -dy / length * speed;
            }

            if (enemy.getData("instantVelocity")) {
                enemy.setData("instantVelocity", false);
                enemy.body.velocity.x = targetVelocityX;
                enemy.body.velocity.y = targetVelocityY;
            } else {
                enemy.body.velocity.x = PhaserMath.Linear(enemy.body.velocity.x, targetVelocityX, 0.16);
                enemy.body.velocity.y = PhaserMath.Linear(enemy.body.velocity.y, targetVelocityY, 0.16);
            }
            this.animateTankEnemy(enemy);
            this.faceTankEnemy(enemy, enemy.body.velocity.x, enemy.body.velocity.y);
        }
    }

    getTankEnemyTextureKey(def, frame = 0) {
        const frames = def?.frames || 0;
        const key = def?.key;
        if (!key) return "tank-enemy-jelly-0";
        if (frames > 0 && this.textures.exists(`${key}-${frame % frames}`)) return `${key}-${frame % frames}`;
        if (this.textures.exists(key)) return key;
        return this.textures.exists("tank-enemy-jelly-0") ? "tank-enemy-jelly-0" : "__MISSING";
    }

    animateTankEnemy(enemy) {
        const frames = enemy.getData("animFrames") || 0;
        const key = enemy.getData("animKey");
        if (!frames || !key) return;

        const frame = Math.floor(this.time.now / 82) % frames;
        const nextTexture = `${key}-${frame}`;
        if (enemy.texture?.key !== nextTexture && this.textures.exists(nextTexture)) enemy.setTexture(nextTexture);
    }

    faceTankEnemy(enemy, vx, vy) {
        if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return;

        if (enemy.getData("fixedRotation")) {
            enemy.rotation = 0;
            if (enemy.getData("flipWithDirection")) {
                // Flip sprite based on horizontal movement direction (art faces right)
                enemy.setFlipX(vx < 0);
            } else {
                enemy.setFlipX(Boolean(enemy.getData("flipX")));
            }
            enemy.setFlipY(false);
            return;
        }

        const offset = PhaserMath.DegToRad(enemy.getData("facingOffset") ?? -90);
        const targetRotation = PhaserMath.Angle.Between(0, 0, vx, vy) + offset;
        enemy.rotation = PhaserMath.Angle.RotateTo(enemy.rotation || 0, targetRotation, 0.18);
        enemy.setFlipX(Boolean(enemy.getData("flipX")));
        enemy.setFlipY(false);
    }

    autoFireTankShot() {
        if (!this.tankHuntActive || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive || !this.octo || this.enemies.countActive(true) === 0) return;

        const enemy = this.findNearest(this.enemies.getChildren());
        if (!enemy) return;

        const targetDelta = this.toroidalDelta(this.octo.x, this.octo.y, enemy.x, enemy.y);
        const angle = Math.atan2(targetDelta.dy, targetDelta.dx);
        this.fireTankShotPattern(angle);
    }

    fireTankShotPattern(angle) {
        const shotCount = this.getTankShotCount();
        const spread = PhaserMath.DegToRad(10 + Math.min(18, this.tankRunStats.broadside * 4));
        for (let i = 0; i < shotCount; i += 1) {
            const shotAngle = angle + (shotCount === 1 ? 0 : -spread / 2 + (spread / (shotCount - 1)) * i);
            this.createTankBullet(shotAngle, 1, 1);
        }

        for (let i = 1; i <= this.tankRunStats.broadside; i += 1) {
            const offset = PhaserMath.DegToRad(60 + i * 12);
            this.createTankBullet(angle + offset, 0.72, 0.82);
            this.createTankBullet(angle - offset, 0.72, 0.82);
        }

        for (let i = 0; i < this.tankRunStats.backblast; i += 1) {
            const offset = this.tankRunStats.backblast === 1 ? 0 : PhaserMath.DegToRad(-12 + (24 / Math.max(1, this.tankRunStats.backblast - 1)) * i);
            this.createTankBullet(angle + Math.PI + offset, 0.64, 0.74);
        }

        if (this.tankRunStats.spiral > 0) {
            this.tankSpiralAngle += PhaserMath.DegToRad(28 + this.tankRunStats.spiral * 10);
            for (let i = 0; i < this.tankRunStats.spiral; i += 1) {
                const spiralAngle = this.tankSpiralAngle + (Math.PI * 2 * i) / Math.max(1, this.tankRunStats.spiral);
                this.createTankBullet(spiralAngle, 0.58, 0.68);
            }
        }
    }

    createTankBullet(shotAngle, damageScale = 1, scaleMultiplier = 1) {
        const bullet = this.bullets.create(this.octo.x + Math.cos(shotAngle) * 30, this.octo.y + Math.sin(shotAngle) * 30, this.getTankBulletTextureKey());
        this.configureTankBullet(bullet, shotAngle, damageScale, scaleMultiplier);
        return bullet;
    }

    configureTankBullet(bullet, shotAngle, damageScale = 1, scaleMultiplier = 1) {
        let damage = Math.max(1, Math.round((this.stats.damage + this.tankRunStats.damageBonus) * damageScale));
        const critChance = this.tankRunStats.critChance || 0;
        if (critChance > 0 && Math.random() < critChance) {
            damage *= 2;
            bullet.setData("critical", true);
        }
        bullet.setData("damage", damage);
        bullet.setData("pierceLeft", this.tankRunStats.pierce);
        bullet.setData("splitLeft", this.tankRunStats.split);
        bullet.setData("poison", this.tankRunStats.poison);
        bullet.setData("bounceLeft", this.tankRunStats.bounce);
        bullet.setData("homing", this.tankRunStats.homing);
        bullet.setData("fear", this.tankRunStats.fear);
        bullet.setData("freeze", this.tankRunStats.freeze);
        bullet.setData("chain", this.tankRunStats.chain);
        bullet.setData("wiggle", this.tankRunStats.wiggle);
        bullet.setData("boomerang", this.tankRunStats.boomerang);
        bullet.setData("lumpOfCoal", this.tankRunStats.lumpOfCoal);
        bullet.setData("spectral", this.tankRunStats.spectral);
        bullet.setData("spawnedAt", this.time.now);
        bullet.setData("baseAngle", shotAngle);
        bullet.setData("baseSpeed", this.tankRunStats.shotSpeed);
        bullet.setData("hitEnemies", new Set());
        bullet.setScale((bullet.getData("critical") ? 1.72 : 1.45) * this.tankRunStats.bulletScale * scaleMultiplier);
        bullet.setDepth(18);
        bullet.setTint(this.getTankBulletTint());
        this.improveGameplayReadability(bullet, { outlineAlpha: 0.36, haloColor: this.getTankBulletTint(), haloAlpha: 0.28, haloBlur: 7 });
        bullet.body.setCircle(11 * this.tankRunStats.bulletScale * scaleMultiplier, 0, 0);
        bullet.body.setVelocity(Math.cos(shotAngle) * this.tankRunStats.shotSpeed, Math.sin(shotAngle) * this.tankRunStats.shotSpeed);
        bullet.rotation = shotAngle + TANK_BULLET_ANGLE_OFFSET;
        const lifetime = this.tankRunStats.spectral > 0 ? this.tankRunStats.shotLifetime * 3 : this.tankRunStats.shotLifetime;
        this.time.delayedCall(lifetime, () => {
            if (bullet.active) bullet.destroy();
        });
    }

    getTankBulletTextureKey() {
        const family = this.tankRunStats.primaryFamily || this.getDominantTankFamily();
        return TANK_ARCHETYPES[family]?.bulletKey || TANK_ARCHETYPES.tide.bulletKey;
    }

    getTankBulletTint() {
        if (this.tankRunStats.critChance > 0 && this.tankRunStats.primaryFamily === "prism") return PhaserMath.RND.pick([0xffa7ff, 0x9effff, 0xfff28a, 0xffffff]);
        if (this.tankRunStats.freeze > 0) return 0x66ccff;
        if (this.tankRunStats.fear > 0) return 0xaa44ff;
        if (this.tankRunStats.poison > 0) return 0x78ff69;
        if (this.tankRunStats.spectral > 0) return 0xdd88ff;
        if (this.tankRunStats.chain > 0) return 0xffee55;
        if (this.tankRunStats.wiggle > 0) return 0xff88cc;
        if (this.tankRunStats.lumpOfCoal > 0) return 0xff6622;
        if (this.tankRunStats.homing > 0) return 0xffa7ff;
        if (this.tankRunStats.pierce > 0) return 0xaef7ff;
        if (this.tankRunStats.bounce > 0) return 0xffe783;
        if (this.tankRunStats.boomerang > 0) return 0x88ffaa;
        const family = this.tankRunStats.primaryFamily || this.getDominantTankFamily();
        return TANK_ARCHETYPES[family]?.tint || 0xffffff;
    }

    applyTankBulletHoming(bullet) {
        const homing = bullet.getData("homing") || 0;
        if (homing <= 0 || !this.enemies || this.enemies.countActive(true) === 0) return;

        const nearest = this.findNearestFrom(bullet, this.enemies.getChildren());
        if (!nearest) return;

        const delta = this.toroidalDelta(bullet.x, bullet.y, nearest.x, nearest.y);
        const targetAngle = Math.atan2(delta.dy, delta.dx);
        const speed = Math.max(80, Math.hypot(bullet.body.velocity.x, bullet.body.velocity.y));
        const currentAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
        const nextAngle = PhaserMath.Angle.RotateTo(currentAngle, targetAngle, TANK_HOMING_STRENGTH * homing);
        bullet.body.setVelocity(Math.cos(nextAngle) * speed, Math.sin(nextAngle) * speed);
        bullet.rotation = nextAngle + TANK_BULLET_ANGLE_OFFSET;
    }

    updateTankBullets() {
        if (!this.bullets) return;
        for (const bullet of this.bullets.getChildren()) {
            if (!bullet.active || !bullet.body) continue;

            const age = Math.max(0, this.time.now - (bullet.getData("spawnedAt") || this.time.now));
            const baseAngle = bullet.getData("baseAngle") || 0;
            const baseSpeed = bullet.getData("baseSpeed") || TANK_BASE_SHOT_SPEED;

            // --- Wiggle: sine-wave perpendicular to travel direction ---
            const wiggle = bullet.getData("wiggle") || 0;
            if (wiggle > 0) {
                const freq = 0.012 + wiggle * 0.003;
                const amp = 140 + wiggle * 80;
                const perpAngle = baseAngle + Math.PI / 2;
                const wave = Math.sin(age * freq) * amp;
                const prevWave = Math.sin((age - 16) * freq) * amp;
                const waveDelta = wave - prevWave;
                bullet.body.velocity.x += Math.cos(perpAngle) * waveDelta;
                bullet.body.velocity.y += Math.sin(perpAngle) * waveDelta;
            }

            // --- Boomerang: bullet curves back toward player after halfway through lifetime ---
            const boomerang = bullet.getData("boomerang") || 0;
            if (boomerang > 0 && this.octo?.active) {
                const lifetime = this.tankRunStats.shotLifetime || TANK_BASE_SHOT_LIFETIME;
                const progress = PhaserMath.Clamp(age / lifetime, 0, 1);
                if (progress > 0.35) {
                    const returnStrength = 0.04 + boomerang * 0.025;
                    const delta = this.toroidalDelta(bullet.x, bullet.y, this.octo.x, this.octo.y);
                    const targetAngle = Math.atan2(delta.dy, delta.dx);
                    const currentAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
                    const nextAngle = PhaserMath.Angle.RotateTo(currentAngle, targetAngle, returnStrength);
                    const speed = Math.hypot(bullet.body.velocity.x, bullet.body.velocity.y);
                    bullet.body.setVelocity(Math.cos(nextAngle) * speed, Math.sin(nextAngle) * speed);
                }
            }

            // --- Lump of Coal: bullets accelerate and grow over distance ---
            const lumpOfCoal = bullet.getData("lumpOfCoal") || 0;
            if (lumpOfCoal > 0) {
                const accelFactor = 1 + (age * 0.0004 * lumpOfCoal);
                const cappedAccel = Math.min(accelFactor, 1 + lumpOfCoal * 0.9);
                const currentSpeed = Math.hypot(bullet.body.velocity.x, bullet.body.velocity.y);
                const targetSpeed = baseSpeed * cappedAccel;
                if (currentSpeed > 0 && targetSpeed > currentSpeed) {
                    const ratio = targetSpeed / currentSpeed;
                    bullet.body.velocity.x *= ratio;
                    bullet.body.velocity.y *= ratio;
                }
                const growScale = 1 + (age * 0.00015 * lumpOfCoal);
                const cappedGrow = Math.min(growScale, 1 + lumpOfCoal * 0.6);
                const baseScale = bullet.getData("baseScale") || bullet.scaleX;
                if (!bullet.getData("baseScale")) bullet.setData("baseScale", bullet.scaleX);
                bullet.setScale(baseScale * cappedGrow);
                // Increase damage over distance
                const baseDamage = bullet.getData("baseDamage") || bullet.getData("damage") || 1;
                if (!bullet.getData("baseDamage")) bullet.setData("baseDamage", baseDamage);
                bullet.setData("damage", Math.round(baseDamage * cappedAccel));
            }

            // --- Homing (existing, but runs after wiggle/boomerang so it can fight them) ---
            this.applyTankBulletHoming(bullet);

            // --- Spectral bullets ignore walls, never wrap, live forever ---
            const spectral = bullet.getData("spectral") || 0;

            // --- Bounce off walls ---
            const bounceLeft = bullet.getData("bounceLeft") || 0;
            if (bounceLeft > 0) {
                let bounced = false;
                if ((bullet.x < 64 && bullet.body.velocity.x < 0) || (bullet.x > this.worldWidth - 64 && bullet.body.velocity.x > 0)) {
                    bullet.body.velocity.x *= -1;
                    bounced = true;
                }
                if ((bullet.y < 74 && bullet.body.velocity.y < 0) || (bullet.y > this.worldHeight - 74 && bullet.body.velocity.y > 0)) {
                    bullet.body.velocity.y *= -1;
                    bounced = true;
                }
                if (bounced) bullet.setData("bounceLeft", bounceLeft - 1);
            } else if (!spectral) {
                this.wrapTankActor(bullet);
            }

            // --- Update rotation to match velocity ---
            bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x) + TANK_BULLET_ANGLE_OFFSET;
        }
    }

    refreshTankOrbiters() {
        if (!this.octo) return;
        for (const orbiter of this.tankOrbiters || []) {
            if (orbiter.active) orbiter.destroy();
        }
        this.tankOrbiters = [];
        const count = Math.min(6, this.tankRunStats?.orbit || 0);
        for (let i = 0; i < count; i += 1) {
            const orbiter = this.physics.add.sprite(this.octo.x, this.octo.y, "tank-bullet");
            orbiter.setData("orbiter", true);
            orbiter.setData("index", i);
            orbiter.setData("hitEnemies", new Set());
            orbiter.setTint(this.tankRunStats.poison > 0 ? 0x78ff69 : 0x82f7ff);
            orbiter.setScale(1.05);
            orbiter.setDepth(19);
            this.improveGameplayReadability(orbiter, { outlineAlpha: 0.34, haloColor: 0x82f7ff, haloAlpha: 0.28, haloBlur: 7 });
            orbiter.body.setCircle(10, 0, 0);
            this.tankOrbiters.push(orbiter);
        }
    }

    updateTankOrbiters() {
        if (!this.tankHuntActive || !this.octo || !this.tankOrbiters) return;
        const count = this.tankOrbiters.length;
        if (count !== Math.min(6, this.tankRunStats.orbit || 0)) this.refreshTankOrbiters();
        const radius = 58 + Math.min(28, count * 5);
        for (const orbiter of this.tankOrbiters) {
            if (!orbiter.active) continue;
            const index = orbiter.getData("index") || 0;
            const angle = this.time.now * 0.004 + (Math.PI * 2 * index) / Math.max(1, count);
            orbiter.setPosition(this.octo.x + Math.cos(angle) * radius, this.octo.y + Math.sin(angle) * radius);
            orbiter.rotation = angle + TANK_BULLET_ANGLE_OFFSET;
            const hitEnemies = orbiter.getData("hitEnemies");
            for (const enemy of this.enemies.getChildren()) {
                if (!enemy.active || hitEnemies?.has(enemy)) continue;
                const enemyRadius = enemy.getData("boss") ? 46 : 30;
                if (this.toroidalDistance(orbiter.x, orbiter.y, enemy.x, enemy.y) > enemyRadius + 16) continue;
                hitEnemies?.add(enemy);
                this.damageTankEnemy(enemy, Math.max(1, Math.round(1 + this.tankRunStats.damageBonus * 0.45)));
                if (this.tankRunStats.poison > 0 && enemy.active) this.applyPoisonToEnemy(enemy, this.tankRunStats.poison);
                this.time.delayedCall(420, () => hitEnemies?.delete(enemy));
            }
        }
    }

    getTankShotCount() {
        return 1 + this.tankRunStats.extraProjectiles;
    }

    spawnEnemyDeath(x, y, sourceScale = 1) {
        const death = this.add.sprite(x, y, `${ENEMY_DEATH_ASSET.key}-0`);
        death.setDepth(16);
        death.setScale(Math.max(0.48, Math.abs(sourceScale) * 0.45));
        death.setRotation(PhaserMath.DegToRad(PhaserMath.RND.pick([0, 90, 180, 270])));
        death.setAlpha(0.95);

        let frame = 0;
        const timer = this.time.addEvent({
            delay: 58,
            repeat: ENEMY_DEATH_ASSET.frames - 2,
            callback: () => {
                frame += 1;
                if (death.active) death.setTexture(`${ENEMY_DEATH_ASSET.key}-${frame}`);
            }
        });
        this.time.delayedCall(ENEMY_DEATH_ASSET.frames * 58 + 40, () => {
            timer.remove(false);
            if (death.active) death.destroy();
        });
    }

    hitEnemy(bullet, enemy) {
        if (!enemy.active || !bullet.active) return;
        const hitEnemies = bullet.getData("hitEnemies");
        if (hitEnemies?.has(enemy)) return;
        hitEnemies?.add(enemy);

        const damage = bullet.getData("damage") || 1;
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        const wasAlive = enemy.active;
        this.damageTankEnemy(enemy, damage);
        const died = wasAlive && !enemy.active;

        if ((bullet.getData("poison") || 0) > 0 && enemy.active) this.applyPoisonToEnemy(enemy, bullet.getData("poison"));
        if ((bullet.getData("splitLeft") || 0) > 0) this.splitTankBullet(bullet, enemy);
        if (bullet.getData("critical") && this.tankRunStats.prismFork > 0) this.forkPrismBullet(bullet, enemy);

        // --- Fear: hit enemy flees from player briefly ---
        const fear = bullet.getData("fear") || 0;
        if (fear > 0 && enemy.active) this.applyFearToEnemy(enemy, fear);

        // --- Freeze: hit enemy slows down ---
        const freeze = bullet.getData("freeze") || 0;
        if (freeze > 0 && enemy.active) this.applyFreezeToEnemy(enemy, freeze);

        // --- Chain: on kill, jump to a tightly capped number of nearby enemies.
        const chain = bullet.getData("chain") || 0;
        if (chain > 0 && died) {
            const jumpsLeft = bullet.getData("chainJumpsLeft") ?? Math.min(3, Math.max(2, chain));
            if (jumpsLeft > 0) this.chainBulletToNext({ x: enemyX, y: enemyY, active: true }, jumpsLeft, bullet.getData("chainDamageScale") || 0.62);
        }

        const pierceLeft = bullet.getData("pierceLeft") || 0;
        if (pierceLeft > 0 && enemy.active) {
            bullet.setData("pierceLeft", pierceLeft - 1);
            return;
        }

        bullet.destroy();
    }


    forkPrismBullet(bullet, enemy) {
        if (!bullet?.active || !enemy?.active) return;
        const forks = PhaserMath.Clamp(this.tankRunStats.prismFork + 1, 2, 5);
        const baseAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
        for (let i = 0; i < forks; i += 1) {
            const angle = baseAngle + PhaserMath.DegToRad(-38 + (76 / Math.max(1, forks - 1)) * i);
            const child = this.bullets.create(enemy.x, enemy.y, this.getTankBulletTextureKey());
            this.configureTankBullet(child, angle, 0.48, 0.54);
            child.setData("critical", false);
            child.setData("prismForked", true);
        }
    }

    applyContagionBurst(x, y) {
        const radius = 92 + this.tankRunStats.contagion * 28;
        const damage = Math.max(1, this.tankRunStats.contagion);
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active) continue;
            if (this.toroidalDistance(x, y, enemy.x, enemy.y) > radius) continue;
            this.applyPoisonToEnemy(enemy, this.tankRunStats.contagion);
            this.damageTankEnemy(enemy, damage);
        }
        this.spawnPulseVisual(x, y, radius, 0x78ff69);
    }

    applyPoisonToEnemy(enemy, stacks) {
        enemy.setData("poisoned", Math.max(enemy.getData("poisoned") || 0, stacks));
        const ticks = Math.min(5, stacks);
        for (let i = 1; i <= ticks; i += 1) {
            this.time.delayedCall(i * 320, () => {
                if (enemy.active) this.damageTankEnemy(enemy, 1);
            });
        }
    }

    applyFearToEnemy(enemy, rank) {
        if (!enemy?.active || enemy.getData("feared")) return;
        enemy.setData("feared", true);
        const origSpeed = enemy.getData("speed") || 80;
        const origBehavior = enemy.getData("behavior") || "chaser";
        enemy.setData("behavior", "fleeing");
        enemy.setData("speed", origSpeed * 1.6);
        enemy.setTint(0xaa44ff);
        const duration = Math.round((0.4 + rank * 0.3) * 1000);
        this.time.delayedCall(duration, () => {
            if (!enemy.active) return;
            enemy.setData("feared", false);
            enemy.setData("behavior", origBehavior);
            enemy.setData("speed", origSpeed);
            enemy.clearTint();
        });
    }

    applyFreezeToEnemy(enemy, rank) {
        if (!enemy?.active) return;
        const alreadyFrozen = enemy.getData("frozen");
        const origSpeed = alreadyFrozen ? (enemy.getData("origSpeed") || enemy.getData("speed") || 80) : (enemy.getData("speed") || 80);
        if (!alreadyFrozen) enemy.setData("origSpeed", origSpeed);
        enemy.setData("frozen", true);
        const slowFactor = Math.max(0.15, 1 - rank * 0.2);
        enemy.setData("speed", origSpeed * slowFactor);
        enemy.setTint(0x66ccff);
        const duration = Math.round((1 + rank * 0.5) * 1000);
        // Clear any existing unfreeze timer
        const prevTimer = enemy.getData("unfreezeTimer");
        if (prevTimer) prevTimer.remove(false);
        const timer = this.time.delayedCall(duration, () => {
            if (!enemy.active) return;
            enemy.setData("frozen", false);
            enemy.setData("speed", origSpeed);
            enemy.clearTint();
        });
        enemy.setData("unfreezeTimer", timer);
    }

    chainBulletToNext(source, jumpsLeft, damageScale = 0.62) {
        if (jumpsLeft <= 0) return;
        const nearest = this.findNearestFrom(source, this.enemies.getChildren());
        if (!nearest) return;
        const delta = this.toroidalDelta(source.x, source.y, nearest.x, nearest.y);
        const angle = Math.atan2(delta.dy, delta.dx);
        const child = this.bullets.create(source.x, source.y, this.getTankBulletTextureKey());
        this.configureTankBullet(child, angle, damageScale, 0.74);
        child.setData("chain", 1);
        child.setData("chainJumpsLeft", jumpsLeft - 1);
        child.setData("chainDamageScale", Math.max(0.38, damageScale * 0.72));
        child.setData("pierceLeft", 0);
        child.setData("splitLeft", 0);
        child.setTint(0xffee55);
    }

    splitTankBullet(bullet, enemy) {
        bullet.setData("splitLeft", 0);
        const splits = PhaserMath.Clamp(1 + this.tankRunStats.split, 2, 5);
        const splitDelta = this.toroidalDelta(this.octo.x, this.octo.y, enemy.x, enemy.y);
        const baseAngle = Math.atan2(splitDelta.dy, splitDelta.dx);
        for (let i = 0; i < splits; i += 1) {
            const angle = baseAngle + PhaserMath.DegToRad(-42 + (84 / Math.max(1, splits - 1)) * i);
            const child = this.bullets.create(enemy.x, enemy.y, this.getTankBulletTextureKey());
            this.configureTankBullet(child, angle, 0.55, 0.62);
            child.setData("splitLeft", 0);
            child.setData("pierceLeft", Math.max(0, this.tankRunStats.pierce - 1));
        }
    }

    damageTankEnemy(enemy, damage) {
        if (!enemy?.active) return;

        // Mummy boss invulnerability phase — deflect damage
        if (enemy.getData("bossPhaseState") === "invulnerable") {
            // Show "blocked" feedback
            this.spawnDamageNumber(enemy.x, enemy.y - 18, 0, false, "IMMUNE");
            return;
        }

        enemy.setData("hp", (enemy.getData("hp") || 1) - damage);
        enemy.setTint(0xffffff).setTintMode(TintModes.FILL);
        this.time.delayedCall(60, () => {
            if (enemy.active) {
                enemy.setTintMode(TintModes.MULTIPLY);
                if (enemy.getData("frozen")) enemy.setTint(0x66ccff);
                else if (enemy.getData("feared")) enemy.setTint(0xaa44ff);
                else if (enemy.getData("elite")) enemy.setTint(enemy.getData("eliteTint") || 0xff4444);
                else enemy.clearTint();
            }
        });

        this.spawnDamageNumber(enemy.x, enemy.y - 18, damage, damage >= 4);

        if ((enemy.getData("hp") || 0) > 0) return;

        const wasBoss = Boolean(enemy.getData("boss"));
        const isElite = Boolean(enemy.getData("elite"));
        const eliteType = enemy.getData("eliteType");
        const gemCount = enemy.getData("gems") ?? 0;
        const gemType = enemy.getData("gemType") || "green";
        const deathX = enemy.x;
        const deathY = enemy.y;
        const deathScale = enemy.scaleX || 1;
        const poisoned = (enemy.getData("poisoned") || 0) > 0;
        this.spawnEnemyDeath(deathX, deathY, deathScale);
        enemy.destroy();

        // Elite splitter: spawn 2 mini enemies
        if (isElite && eliteType === "splitter") {
            for (let s = 0; s < 2; s += 1) {
                const mini = this.enemies.create(deathX + PhaserMath.Between(-28, 28), deathY + PhaserMath.Between(-28, 28), "tank-enemy-jelly");
                mini.setData("hp", 1);
                mini.setData("speed", 130);
                mini.setData("behavior", "chaser");
                mini.setData("phase", PhaserMath.FloatBetween(0, Math.PI * 2));
                mini.setData("strafe", PhaserMath.RND.sign());
                mini.setData("chargeUntil", 0);
                mini.setData("gemType", "green");
                mini.setData("gems", PhaserMath.Between(1, 100) <= 25 ? 1 : 0);
                mini.setData("boss", false);
                mini.setData("elite", false);
                mini.setData("facingOffset", -90);
                mini.setData("flipX", false);
                mini.setData("spawnedAt", this.time.now);
                mini.setData("shootCooldown", 0);
                mini.setScale(0.72);
                mini.setDepth(15);
                this.improveGameplayReadability(mini, { outlineAlpha: 0.36, haloColor: 0xffffff, haloAlpha: 0.2, haloBlur: 6 });
                mini.body.setCircle(18, 0, 0);
                mini.body.setDamping(true);
                mini.body.setDrag(0.86);
                mini.body.setMaxVelocity(190);
            }
        }

        // Screen shake on elite/boss kills
        if (isElite || wasBoss) this.cameras.main.shake(120, wasBoss ? 0.008 : 0.005);
        if (poisoned && this.tankRunStats.contagion > 0) this.applyContagionBurst(deathX, deathY);
        if (wasBoss) {
            this.tankBoss = null;
            this.tankWaveResolving = true;
            this.tankContinueChoicePending = true;
            this.tankWaveToken += 1;
            this.tankWaveTimer?.remove(false);
            this.tankWaveTimer = null;
        }
        for (let i = 0; i < gemCount; i += 1) {
            const type = wasBoss ? (i % 4 === 0 ? "yellow" : "blue") : gemType;
            const lifetime = wasBoss ? 0 : (type === "green" ? TANK_SMALL_GEM_LIFETIME : TANK_BETTER_GEM_LIFETIME);
            // Boss gems spread in a ring, normal gems have small random offset
            let gx, gy;
            if (wasBoss) {
                const ringAngle = (Math.PI * 2 / gemCount) * i;
                const ringRadius = 36 + gemCount * 4;
                gx = deathX + Math.cos(ringAngle) * ringRadius;
                gy = deathY + Math.sin(ringAngle) * ringRadius;
            } else {
                gx = deathX + PhaserMath.Between(-18, 18);
                gy = deathY + PhaserMath.Between(-18, 18);
            }
            this.spawnGemAt(gx, gy, type, { lifetime });
        }

        if (wasBoss) {
            this.tankHuntBossKills += 1;
            this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
            this.spawnTraitDiscovery(true);
            this.showCenterTraitText("BOSS DEFEATED. SIGNAL RELEASED");
            this.showTankBossRewardChoices();
            return;
        }

        this.tankHuntKills += 1;
        this.tankHuntTotalKills += 1;
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());

        if (this.tankHuntKills < this.tankHuntGoal || this.tankBoss || this.tankWaveResolving) return;

        this.resolveTankWaveClear();
    }

    resolveTankWaveClear() {
        if (!this.tankHuntActive || this.tankBoss || this.tankWaveResolving) return;

        this.tankWaveResolving = true;
        this.tankWaveToken += 1;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;

        if (this.tankHuntWave % TANK_BOSS_INTERVAL !== 0) {
            const waveToken = this.tankWaveToken;
            this.time.delayedCall(650, () => {
                if (!this.tankHuntActive || this.tankBoss || this.tankContinueChoiceActive || this.tankUpgradeChoiceActive || waveToken !== this.tankWaveToken) return;
                this.tankWaveResolving = false;
                this.startNextTankWave();
            });
            return;
        }

        this.showCenterTraitText("BOSS ENTERED THE TANK");
        this.spawnTankEnemy(true, this.tankHuntWave);
    }

    // =================== DAMAGE NUMBERS ===================

    spawnDamageNumber(x, y, amount, isCrit = false, customText = null) {
        if (!this.tankHuntActive) return;
        const displayText = customText || `${amount}`;
        const isImmune = customText === "IMMUNE";
        const text = this.add.text(x + PhaserMath.Between(-12, 12), y, displayText, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: isImmune ? "11px" : (isCrit ? "18px" : "13px"),
            color: isImmune ? "#88ffcc" : (isCrit ? "#ffe040" : "#ffffff"),
            stroke: "#000000",
            strokeThickness: isCrit ? 5 : 3
        }).setOrigin(0.5).setDepth(200);

        if (isCrit) text.setScale(1.3);
        this.tweens.add({
            targets: text,
            y: y - 42 - PhaserMath.Between(0, 18),
            alpha: 0,
            scale: isCrit ? 0.7 : 0.5,
            duration: 620,
            ease: "Cubic.easeOut",
            onComplete: () => text.destroy()
        });
    }

    endTankHunt(won) {
        if (!this.tankHuntActive) return;

        // Capture run stats for summary before reset
        const runSummary = {
            wave: this.tankHuntWave,
            totalKills: this.tankHuntTotalKills,
            bossKills: this.tankHuntBossKills,
            level: this.tankRunStats.level,
            mutations: [...(this.tankRunStats.mutationChoices || [])],
            bossRewards: [...(this.tankRunStats.bossRewardChoices || [])],
            gemsEarned: this.tankHuntGemsCollected,
            gemSources: { ...(this.tankHuntGemSources || {}) },
            damageTaken: this.tankHuntDamageTaken,
            family: this.getTankArchetypeLabel(),
            survived: Math.round((this.time.now - this.tankHuntStartedAt) / 1000),
            won
        };

        this.tankHuntActive = false;
        this.tankHuntEnding = false;
        this.tankActiveEvent = null;
        if (this.tankEventOverlay) { this.tankEventOverlay.destroy(); this.tankEventOverlay = null; }
        this.enemySpawnTimer?.remove(false);
        this.enemySpawnTimer = null;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.tankHuntEndTimer?.remove(false);
        this.tankHuntEndTimer = null;
        this.tankBoss = null;
        this.tankWaveResolving = false;
        this.tankWaveToken += 1;
        this.tankContinueWave = null;
        this.tankContinueChoicePending = false;
        this.tankSpecificWaveTimer?.remove(false);
        this.tankSpecificWaveTimer = null;
        this.tankSpecificWavePending = null;
        this.clearTankUpgradeChoices();
        this.clearTankBossRewardChoices();
        this.tankRunStats = this.createTankRunStats();
        this.tankUpgradeChoiceActive = false;
        this.clearTankContinueChoices();
        this.tankHuntGemsCollected = 0;
        this.tankHuntBossKills = 0;
        this.tankHuntGemSources = {};
        this.tankHuntDamageTaken = 0;
        this.pendingBackgroundKey = null;
        this.tankBackgroundDepthIndex = 0;
        this.tankInvincibleUntil = 0;
        this.tankSpinUntil = 0;
        this.tankSpinStartedAt = 0;
        this.tankSpinFrame = 0;
        this.tankWasSpinning = false;
        this.tankSpinHitEnemies.clear();
        this.tankInkBurstCooldown = 0;
        this.tankManualMineCooldown = 0;
        this.tankManualMineCooldown = 0;
        this.destroyTankHud();
        this.clearTankHuntActors();
        this.zoomForTankHunt(false);
        this.game.events.emit("octoglyphs:hunt-state", null);
        this.emitTankHuntCharge();

        this.showRunSummary(runSummary);
        if (!won) triggerFTUE("firstHuntDeath", this.save);
    }

    clearTankHuntActors() {
        if (this.enemies) this.enemies.clear(true, true);
        if (this.bullets) this.bullets.clear(true, true);
        if (this.enemyBullets) this.enemyBullets.clear(true, true);
        if (this.playerMines) this.playerMines.clear(true, true);
        for (const orbiter of this.tankOrbiters || []) {
            if (orbiter.active) orbiter.destroy();
        }
        this.tankOrbiters = [];
        this.autopilotCollectTarget = null;
        this.updateToroidalGhosts();
    }

    clearTankHuntGems() {
        if (!this.gems) return;
        for (const gem of [...this.gems.getChildren()]) {
            this.destroyGem(gem);
        }
    }

    zoomForTankHunt(active) {
        const zoom = active ? TANK_HUNT_ZOOM : TANK_BASE_ZOOM;
        this.viewZoom = zoom;
        this.tweens.add({
            targets: this.cameras.main,
            zoom,
            duration: 420,
            ease: "Sine.easeInOut"
        });
    }

    createTankHud() {
        this.destroyTankHud();
        this.tankHud = document.createElement("div");
        this.tankHud.className = "tank-hunt-hud";
        this.tankHud.innerHTML = `
            <div class="tank-hunt-hearts"></div>
            <div class="tank-hunt-xp-wrap">
                <div class="tank-hunt-xp-label">Lv 1 · 0/8 gems</div>
                <div class="tank-hunt-xp-bar"><div class="tank-hunt-xp-fill"></div></div>
            </div>
        `;
        document.getElementById("tank-hunt-hud-root")?.appendChild(this.tankHud);
        this.tankHudHearts = this.tankHud.querySelector(".tank-hunt-hearts");
        this.tankHudXpFill = this.tankHud.querySelector(".tank-hunt-xp-fill");
        this.tankHudText = this.tankHud.querySelector(".tank-hunt-xp-label");
        this.updateTankHud();
    }

    destroyTankHud() {
        this.tankHud?.remove();
        this.tankHud = null;
        this.tankHudHearts = null;
        this.tankHudXpFill = null;
        this.tankHudText = null;
    }

    updateTankHud() {
        if (!this.tankHud || !this.tankRunStats) return;
        const hp = Math.max(0, Math.ceil(this.tankRunStats.hp));
        const maxHp = Math.max(1, Math.ceil(this.tankRunStats.maxHp));
        if (this.tankHudHearts) {
            this.tankHudHearts.innerHTML = "";
            for (let i = 0; i < maxHp; i += 1) {
                const heart = document.createElement("span");
                heart.className = `tank-hunt-heart ${i < hp ? "is-full" : "is-empty"}`;
                heart.textContent = "♥";
                this.tankHudHearts.appendChild(heart);
            }
        }
        const xpProgress = PhaserMath.Clamp(this.tankRunStats.xp / Math.max(1, this.tankRunStats.nextXp), 0, 1);
        if (this.tankHudXpFill) this.tankHudXpFill.style.width = `${Math.round(xpProgress * 100)}%`;
        if (this.tankHudText) this.tankHudText.textContent = `Lv ${this.tankRunStats.level} · ${this.tankRunStats.xp}/${this.tankRunStats.nextXp} gems · Speed ${this.getTankSpeedMultiplier().toFixed(2)}x`;
    }

    getTankHuntState() {
        if (!this.tankHuntActive) return null;

        return {
            wave: this.tankHuntWave,
            kills: this.tankHuntKills,
            goal: this.tankHuntGoal,
            totalKills: this.tankHuntTotalKills,
            bossKills: this.tankHuntBossKills,
            bossActive: Boolean(this.tankBoss?.active),
            ending: this.tankHuntEnding,
            choosingUpgrade: this.tankUpgradeChoiceActive,
            awaitingContinue: this.tankContinueChoiceActive || this.tankContinueChoicePending,
            level: this.tankRunStats.level,
            xp: this.tankRunStats.xp,
            nextXp: this.tankRunStats.nextXp,
            hp: this.tankRunStats.hp,
            maxHp: this.tankRunStats.maxHp
        };
    }

    createTankRunStats() {
        return {
            level: 1,
            xp: 0,
            nextXp: 10,
            hp: TANK_BASE_PLAYER_HP,
            maxHp: TANK_BASE_PLAYER_HP,
            swimSpeed: 1,
            fireDelay: TANK_BASE_FIRE_DELAY,
            shotSpeed: TANK_BASE_SHOT_SPEED,
            shotLifetime: TANK_BASE_SHOT_LIFETIME,
            damageBonus: 0,
            magnetRange: 1,
            extraProjectiles: 0,
            bulletScale: 1,
            pierce: 0,
            split: 0,
            orbit: 0,
            poison: 0,
            bounce: 0,
            spinPower: 0,
            homing: 0,
            contagion: 0,
            gemPulse: 0,
            wakeTrail: 0,
            guardianCharges: 0,
            broadside: 0,
            backblast: 0,
            inkMines: 0,
            spiral: 0,
            prismFork: 0,
            critChance: 0,
            luckBonus: 0,
            wiggle: 0,
            boomerang: 0,
            lumpOfCoal: 0,
            chain: 0,
            fear: 0,
            freeze: 0,
            spectral: 0,
            nextXpMult: 1,
            xpBreakpoints: [...TANK_XP_BREAKPOINTS],
            primaryFamily: "tide",
            mutationRanks: {},
            familyRanks: {},
            bossRewards: [],
            mutationChoices: [],
            bossRewardChoices: []
        };
    }

    configureAutoFireTimer() {
        this.autoFireTimer?.remove(false);
        this.autoFireTimer = this.time.addEvent({
            delay: Math.max(90, Math.round(this.tankRunStats.fireDelay)),
            loop: true,
            callback: () => this.autoFireTankShot()
        });
    }

    getTankXpForNextLevel(level = this.tankRunStats?.level || 1) {
        const breakpoints = this.tankRunStats?.xpBreakpoints || TANK_XP_BREAKPOINTS;
        const index = Math.max(0, level - 1);
        if (index < breakpoints.length) return breakpoints[index];
        const extraLevels = index - breakpoints.length + 1;
        return Math.ceil(breakpoints[breakpoints.length - 1] + extraLevels * 75 + extraLevels * extraLevels * 10);
    }

    addTankHuntXp(amount) {
        if (!this.tankHuntActive || this.tankUpgradeChoiceActive || this.tankBossRewardChoiceActive || this.tankContinueChoiceActive || this.tankContinueChoicePending) return;

        this.tankRunStats.xp += amount;
        this.updateTankHud();
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        if (this.tankRunStats.xp < this.tankRunStats.nextXp) return;
        if (this.time.now < this.tankNextLevelAllowedAt) return;

        this.tankRunStats.xp = 0; // no overflow — prevents instant chaining
        this.tankRunStats.level += 1;
        this.tankRunStats.nextXp = this.getTankXpForNextLevel(this.tankRunStats.level);
        this.tankNextLevelAllowedAt = this.time.now + TANK_LEVEL_UP_COOLDOWN;
        this.updateTankHud();

        // XP vacuum: suck all gems toward player on level-up
        this.vacuumGemsOnLevelUp();
        this.showCenterTraitText(`LEVEL ${this.tankRunStats.level}`);
        this.cameras.main.flash(180, 255, 255, 180, true);
        this.showTankUpgradeChoices();
    }

    showTankUpgradeChoices() {
        if (this.tankUpgradeChoiceActive) return;
        this.tankUpgradeChoiceActive = true;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.target = null;
        this.keyboardManualUntil = 0;
        this.octo.body.setVelocity(0, 0);

        const overlay = document.createElement("div");
        overlay.className = "hunt-upgrade-overlay is-open";
        overlay.innerHTML = `
            <div class="hunt-upgrade-card">
                <h2>LEVEL ${this.tankRunStats.level}</h2>
                <p>Choose one temporary hunt mutation</p>
                <div class="hunt-upgrade-options"></div>
            </div>
        `;

        const options = overlay.querySelector(".hunt-upgrade-options");
        const choices = this.pickTankMutationChoices();
        for (const upgrade of choices) {
            const rank = (this.tankRunStats.mutationRanks[upgrade.id] || 0) + 1;
            const button = document.createElement("button");
            button.className = `hunt-upgrade-option hunt-family-${upgrade.family}`;
            button.type = "button";
            button.innerHTML = `<strong>${upgrade.title} <em>R${rank}</em></strong><span>${upgrade.desc(rank)}</span><small>${upgrade.family.toUpperCase()} · ${upgrade.rarity.toUpperCase()}</small>`;
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.applyTankUpgrade(upgrade);
            });
            options.appendChild(button);
        }

        document.getElementById("panel-root")?.appendChild(overlay);
        this.tankUpgradeContainer = overlay;
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
    }

    pickTankMutationChoices() {
        const ranks = this.tankRunStats.mutationRanks || {};
        const available = TANK_MUTATION_POOL.filter(upgrade => (ranks[upgrade.id] || 0) < upgrade.maxRank);
        const choices = [];
        const requiredRoles = this.getRequiredTankMutationRoles();
        const usedRoles = new Set();

        for (const role of requiredRoles) {
            const rolePool = available.filter(upgrade => this.getTankMutationRole(upgrade) === role && !choices.includes(upgrade));
            if (rolePool.length === 0) continue;
            const picked = this.weightedTankMutationPick(rolePool, usedRoles);
            choices.push(picked);
            usedRoles.add(role);
        }

        const pool = available.filter(upgrade => !choices.includes(upgrade));
        while (choices.length < 3 && pool.length > 0) {
            const picked = this.weightedTankMutationPick(pool, usedRoles);
            choices.push(picked);
            usedRoles.add(this.getTankMutationRole(picked));
            pool.splice(pool.indexOf(picked), 1);
        }
        return choices;
    }

    getTankMutationRole(upgrade) {
        return TANK_MUTATION_ROLES[upgrade.id] || "utility";
    }

    getRequiredTankMutationRoles() {
        const roles = [];
        const stats = this.tankRunStats || {};
        const currentPower = Math.max(0, (TANK_BASE_FIRE_DELAY - stats.fireDelay) / 45) + Math.max(0, stats.damageBonus || 0) * 0.6 + Math.max(0, stats.extraProjectiles || 0) * 1.4 + Math.max(0, stats.pierce || 0) * 0.6 + Math.max(0, stats.split || 0) * 0.9 + Math.max(0, stats.chain || 0) * 1.1 + Math.max(0, stats.orbit || 0) * 0.7;
        const survivalPower = Math.max(0, (stats.maxHp || TANK_BASE_PLAYER_HP) - TANK_BASE_PLAYER_HP) + Math.max(0, stats.guardianCharges || 0) * 1.4 + Math.max(0, stats.freeze || 0) * 0.9 + Math.max(0, stats.fear || 0) * 0.8 + Math.max(0, stats.inkMines || 0) * 0.8 + Math.max(0, stats.spinPower || 0) * 0.6;

        if ((stats.level || 1) <= 3 && currentPower < 2.8) roles.push("offense");
        if ((stats.level || 1) >= 3 && survivalPower < 1.8) roles.push("defense");
        if ((stats.swimSpeed || 1) < 1.08 && !roles.includes("mobility")) roles.push("mobility");
        if (roles.length === 0 && (stats.magnetRange || 1) < 1.25) roles.push("utility");
        return roles.slice(0, 2);
    }

    weightedTankMutationPick(pool, usedRoles = new Set()) {
        const familyRanks = this.tankRunStats.familyRanks || {};
        const luckBonus = this.tankRunStats.luckBonus || 0;
        const dominantFamily = this.tankRunStats.primaryFamily || this.getDominantTankFamily();
        const weighted = pool.map(upgrade => {
            const role = this.getTankMutationRole(upgrade);
            let weight = TANK_MUTATION_RARITY_WEIGHT[upgrade.rarity] || 10;
            weight += (familyRanks[upgrade.family] || 0) * 14;
            if (upgrade.family === dominantFamily) weight += 10;
            if (usedRoles.has(role)) weight = Math.round(weight * 0.42);
            if (this.lastTankMutationRoles.includes(role)) weight = Math.round(weight * 0.7);
            if (upgrade.rarity !== "common") weight += luckBonus * 25;
            return { upgrade, weight: Math.max(1, Math.round(weight)) };
        });
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = PhaserMath.Between(1, Math.max(1, total));
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return entry.upgrade;
        }
        return Utils.Array.GetRandom(pool);
    }

    applyTankUpgrade(upgrade) {
        if (!this.tankUpgradeChoiceActive) return;
        this.tankRunStats.mutationRanks[upgrade.id] = (this.tankRunStats.mutationRanks[upgrade.id] || 0) + 1;
        const chosenRank = this.tankRunStats.mutationRanks[upgrade.id];
        this.tankRunStats.mutationChoices.push({ title: upgrade.title, rank: chosenRank, family: upgrade.family, role: this.getTankMutationRole(upgrade), desc: upgrade.desc(chosenRank) });
        this.tankRunStats.familyRanks[upgrade.family] = (this.tankRunStats.familyRanks[upgrade.family] || 0) + 1;
        this.lastTankMutationRoles = [this.getTankMutationRole(upgrade), ...(this.lastTankMutationRoles || [])].slice(0, 3);
        upgrade.apply(this);
        this.applyTankFamilyEvolutions(upgrade.family);
        this.clearTankUpgradeChoices();
        this.tankUpgradeChoiceActive = false;
        this.refreshStats();
        this.updateTankHud();
        const rank = this.tankRunStats.mutationRanks[upgrade.id] || 1;
        this.game.events.emit("octoglyphs:notice", `${upgrade.title} R${rank}: ${upgrade.desc(rank)}`);
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        if (this.tankHuntActive && this.tankContinueChoicePending) {
            this.showTankContinueChoices();
            return;
        }
        if (this.tankHuntActive && !this.tankBoss && !this.tankContinueChoiceActive && !this.tankContinueChoicePending && this.tankWaveResolving && this.tankHuntKills >= this.tankHuntGoal) {
            this.tankWaveToken += 1;
            this.tankWaveTimer?.remove(false);
            this.tankWaveTimer = null;
            if (this.tankHuntWave % TANK_BOSS_INTERVAL === 0) {
                this.showCenterTraitText("BOSS ENTERED THE TANK");
                this.spawnTankEnemy(true, this.tankHuntWave);
            } else {
                this.tankWaveResolving = false;
                this.startNextTankWave();
            }
            return;
        }
        if (this.tankHuntActive && !this.tankBoss && !this.tankContinueChoiceActive && !this.tankContinueChoicePending && !this.tankWaveResolving && !this.tankWaveTimer && this.tankHuntKills < this.tankHuntGoal) {
            const wave = this.tankHuntWave;
            const waveToken = this.tankWaveToken;
            const recipe = this.currentWaveRecipe || TANK_WAVE_RECIPES.find(r => r.id === "mixed_assault");
            const baseInterval = Math.max(260, 680 - wave * 45);
            const eventSpawnMult = (this.tankActiveEvent && this.time.now < this.tankActiveEvent.endsAt) ? (this.tankActiveEvent.def.spawnMult || 1) : 1;
            const interval = Math.round(baseInterval * (recipe.intervalMult || 1) / eventSpawnMult);
            this.tankWaveTimer = this.time.addEvent({
                delay: interval,
                loop: true,
                callback: () => this.spawnTankWaveBurst(wave, waveToken)
            });
        }
    }

    applyTankFamilyEvolutions(family) {
        const rank = this.tankRunStats.familyRanks[family] || 0;
        if (rank !== 3) return;

        if (family === "inkstorm") {
            this.tankRunStats.extraProjectiles += 1;
            this.tankRunStats.fireDelay *= 0.9;
            this.configureAutoFireTimer();
            this.showCenterTraitText("INKSTORM FORM AWAKENED");
        } else if (family === "tide") {
            this.tankRunStats.orbit += 1;
            this.tankRunStats.pierce += 1;
            this.refreshTankOrbiters();
            this.showCenterTraitText("TIDE FORM AWAKENED");
        } else if (family === "abyss") {
            this.tankRunStats.poison += 1;
            this.tankRunStats.split += 1;
            this.showCenterTraitText("ABYSS FORM AWAKENED");
        } else if (family === "shell") {
            this.tankRunStats.maxHp += 1;
            this.tankRunStats.hp = Math.min(this.tankRunStats.maxHp, this.tankRunStats.hp + 2);
            this.tankRunStats.spinPower += 1;
            this.showCenterTraitText("SHELL FORM AWAKENED");
        } else if (family === "prism") {
            this.tankRunStats.magnetRange *= 1.25;
            this.tankRunStats.xpBreakpoints = (this.tankRunStats.xpBreakpoints || TANK_XP_BREAKPOINTS).map(value => Math.max(6, Math.floor(value * 0.92)));
            this.tankRunStats.nextXp = Math.max(this.tankRunStats.xp + 1, this.getTankXpForNextLevel());
            this.showCenterTraitText("PRISM FORM AWAKENED");
        } else if (family === "current") {
            this.tankRunStats.swimSpeed *= 1.12;
            this.tankRunStats.bounce += 1;
            this.showCenterTraitText("CURRENT FORM AWAKENED");
        }
    }

    clearTankUpgradeChoices() {
        if (!this.tankUpgradeContainer) return;
        this.tankUpgradeContainer.remove();
        this.tankUpgradeContainer = null;
        this.tankUpgradeChoiceActive = false;
    }

    pickTankBossRewardChoices() {
        const taken = new Set(this.tankRunStats.bossRewards || []);
        const available = TANK_BOSS_REWARD_POOL.filter(reward => !taken.has(reward.id));
        const pool = available.length >= 3 ? available : TANK_BOSS_REWARD_POOL;
        const choices = [];
        const usedFamilies = new Set();
        while (choices.length < 3 && choices.length < pool.length) {
            let candidates = pool.filter(reward => !choices.includes(reward) && !usedFamilies.has(reward.family));
            if (candidates.length === 0) candidates = pool.filter(reward => !choices.includes(reward));
            const picked = Utils.Array.GetRandom(candidates);
            choices.push(picked);
            usedFamilies.add(picked.family);
        }
        return choices;
    }

    showTankBossRewardChoices() {
        if (!this.tankHuntActive || this.tankBossRewardChoiceActive || this.tankBossRewardContainer?.isConnected) return;
        this.clearTankUpgradeChoices();
        this.clearTankBossRewardChoices();
        this.tankBossRewardChoiceActive = true;
        this.tankContinueChoicePending = true;
        this.tankWaveResolving = true;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.target = null;
        this.keyboardManualUntil = 0;
        this.octo.body.setVelocity(0, 0);

        const overlay = document.createElement("div");
        overlay.className = "hunt-upgrade-overlay is-open";
        overlay.dataset.huntBossRewardOverlay = "true";
        overlay.innerHTML = `
            <div class="hunt-upgrade-card hunt-boss-reward-card">
                <h2>BOSS REWARD</h2>
                <p>Choose one boss signal before deciding whether to continue.</p>
                <div class="hunt-upgrade-options"></div>
            </div>
        `;

        const options = overlay.querySelector(".hunt-upgrade-options");
        const choices = this.pickTankBossRewardChoices();
        for (const reward of choices) {
            const button = document.createElement("button");
            button.className = `hunt-upgrade-option hunt-boss-reward-option hunt-family-${reward.family}`;
            button.type = "button";
            button.innerHTML = `<strong>${reward.title}</strong><span>${reward.desc()}</span><small>BOSS SIGNAL · ${reward.family.toUpperCase()}</small>`;
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                this.applyTankBossReward(reward);
            });
            options.appendChild(button);
        }

        document.getElementById("panel-root")?.appendChild(overlay);
        this.tankBossRewardContainer = overlay;
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
    }

    applyTankBossReward(reward) {
        if (!this.tankBossRewardChoiceActive) return;
        this.tankRunStats.bossRewards = this.tankRunStats.bossRewards || [];
        this.tankRunStats.bossRewards.push(reward.id);
        this.tankRunStats.bossRewardChoices.push({ title: reward.title, family: reward.family, desc: reward.desc() });
        this.tankRunStats.familyRanks[reward.family] = (this.tankRunStats.familyRanks[reward.family] || 0) + 1;
        reward.apply(this);
        this.clearTankBossRewardChoices();
        this.tankBossRewardChoiceActive = false;
        this.refreshStats();
        this.updateTankHud();
        this.game.events.emit("octoglyphs:notice", `${reward.title}: ${reward.desc()}`);
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        this.showTankContinueChoices();
    }

    clearTankBossRewardChoices() {
        document.querySelectorAll("[data-hunt-boss-reward-overlay='true']").forEach(overlay => overlay.remove());
        if (this.tankBossRewardContainer?.isConnected) this.tankBossRewardContainer.remove();
        this.tankBossRewardContainer = null;
        this.tankBossRewardChoiceActive = false;
    }

    showTankContinueChoices() {
        if (!this.tankHuntActive || this.tankContinueChoiceActive || this.tankContinueContainer?.isConnected) return;
        if (this.tankUpgradeChoiceActive) return;

        this.clearTankUpgradeChoices();
        this.clearTankBossRewardChoices();
        this.clearTankContinueChoices();
        this.tankContinueChoicePending = false;
        this.tankContinueChoiceActive = true;
        this.tankWaveResolving = true;
        this.tankContinueWave = this.tankHuntWave + 1;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.target = null;
        this.keyboardManualUntil = 0;
        this.octo.body.setVelocity(0, 0);
        this.updateTankHud();

        const nextWave = this.tankContinueWave || this.tankHuntWave + 1;
        const overlay = document.createElement("div");
        overlay.className = "hunt-upgrade-overlay is-open";
        overlay.dataset.huntContinueOverlay = "true";
        overlay.innerHTML = `
            <div class="hunt-upgrade-card hunt-continue-card">
                <h2>BOSS CLEARED</h2>
                <p>Bank current rewards now, or continue with same mutations into tougher waves.</p>
                <div class="hunt-continue-recap">
                    <div><strong>${this.tankHuntWave}</strong><span>Wave</span></div>
                    <div><strong>${this.tankHuntTotalKills}</strong><span>Kills</span></div>
                    <div><strong>${this.tankHuntBossKills}</strong><span>Bosses</span></div>
                    <div><strong>${this.tankHuntGemsCollected}</strong><span>Gem Value</span></div>
                </div>
                <div class="hunt-upgrade-options">
                    <button class="hunt-upgrade-option hunt-continue-option" type="button">
                        <strong>CONTINUE TO WAVE ${nextWave}</strong>
                        <span>Enemies get faster and tougher. Current mutations and boss rewards stay active.</span>
                        <small>RISK MORE</small>
                    </button>
                    <button class="hunt-upgrade-option hunt-end-option" type="button">
                        <strong>END HUNT</strong>
                        <span>Show recap, bank rewards, and return to the tank.</span>
                        <small>SAFE EXIT</small>
                    </button>
                </div>
            </div>
        `;

        const [continueButton, endButton] = overlay.querySelectorAll("button");
        continueButton?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            this.continueTankHuntAfterBoss();
        });
        endButton?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            this.endTankHunt(true);
        });

        document.getElementById("panel-root")?.appendChild(overlay);
        this.tankContinueContainer = overlay;
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
    }

    continueTankHuntAfterBoss() {
        if (!this.tankHuntActive || !this.tankContinueChoiceActive) return;

        const nextWave = this.tankContinueWave || this.tankHuntWave + 1;
        const waveToken = this.tankWaveToken + 1;
        this.tankHuntEndTimer?.remove(false);
        this.tankHuntEndTimer = null;
        this.tankSpecificWaveTimer?.remove(false);
        this.tankSpecificWaveTimer = null;
        this.tankSpecificWavePending = null;
        this.clearTankContinueChoices();
        this.tankContinueChoiceActive = false;
        this.tankWaveResolving = false;
        this.tankWaveToken = waveToken;
        this.tankRunStats.hp = Math.min(this.tankRunStats.maxHp, this.tankRunStats.hp + 1);
        this.tankInvincibleUntil = this.time.now + 900;
        this.updateTankHud();
        this.tankBackgroundDepthIndex = Math.min((this.tankBackgroundDepthIndex || 0) + 1, BACKGROUND_TRACKS.length - 1);
        this.pendingBackgroundKey = pickBackgroundForDepthIndex(this.tankBackgroundDepthIndex)?.key || null;
        this.applyPendingTankBackground();
        this.game.events.emit("octoglyphs:notice", `Wave ${nextWave} begins. The tank gets meaner.`);
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        this.time.delayedCall(450, () => {
            if (!this.tankHuntActive || this.tankContinueChoiceActive || waveToken !== this.tankWaveToken) return;
            this.startSpecificTankWave(nextWave);
        });
    }

    startSpecificTankWave(wave) {
        if (!this.tankHuntActive || this.tankBoss || this.tankContinueChoiceActive) return;
        if (this.tankHuntWave === wave && this.tankWaveTimer && !this.tankWaveResolving) return;
        if (this.tankUpgradeChoiceActive) {
            if (this.tankSpecificWavePending === wave && this.tankSpecificWaveTimer) return;
            this.tankSpecificWavePending = wave;
            this.tankSpecificWaveTimer?.remove(false);
            this.tankSpecificWaveTimer = this.time.delayedCall(180, () => {
                this.tankSpecificWaveTimer = null;
                const pendingWave = this.tankSpecificWavePending;
                this.tankSpecificWavePending = null;
                this.startSpecificTankWave(pendingWave || wave);
            });
            return;
        }

        this.tankSpecificWaveTimer?.remove(false);
        this.tankSpecificWaveTimer = null;
        this.tankSpecificWavePending = null;
        this.tankWaveResolving = false;
        this.tankWaveTimer?.remove(false);
        this.tankWaveTimer = null;
        this.tankHuntWave = Math.max(0, wave - 1);
        this.startNextTankWave();
    }

    applyPendingTankBackground() {
        if (!this.pendingBackgroundKey) return;

        const background = BACKGROUND_TRACKS.find(track => track.key === this.pendingBackgroundKey);
        this.pendingBackgroundKey = null;
        if (!background || this.activeBackgroundKey === background.key) return;

        this.cameras.main.fadeOut(170, 2, 12, 18);
        this.time.delayedCall(170, () => {
            this.setTankBackground(background);
            this.cameras.main.fadeIn(220, 2, 12, 18);
        });
    }

    clearTankContinueChoices() {
        document.querySelectorAll("[data-hunt-continue-overlay='true']").forEach(overlay => overlay.remove());
        if (this.tankContinueContainer?.isConnected) this.tankContinueContainer.remove();
        this.tankContinueContainer = null;
        this.tankContinueChoiceActive = false;
        this.tankContinueChoicePending = false;
        this.tankContinueWave = null;
    }

    hitPlayer(enemy) {
        if (!this.tankHuntActive || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive || !enemy?.active) return;
        if (this.time.now < this.tankInvincibleUntil) return;

        if (!enemy.getData("boss") && this.tankRunStats.guardianCharges > 0) {
            this.tankRunStats.guardianCharges -= 1;
            this.tankInvincibleUntil = this.time.now + 520;
            this.spawnPulseVisual(this.octo.x, this.octo.y, 92, 0xb7ecff);
            this.spawnEnemyDeath(enemy.x, enemy.y, enemy.scaleX || 1);
            enemy.destroy();
            this.updateTankHud();
            this.game.events.emit("octoglyphs:notice", `Guardian Orbit blocked a hit. ${this.tankRunStats.guardianCharges} charge${this.tankRunStats.guardianCharges === 1 ? "" : "s"} left.`);
            return;
        }

        const damageTaken = enemy.getData("boss") ? 2 : 1;
        this.tankRunStats.hp = Math.max(0, this.tankRunStats.hp - damageTaken);
        this.tankHuntDamageTaken += damageTaken;
        this.tankInvincibleUntil = this.time.now + 1200;
        this.tankSpinStartedAt = this.time.now;
        this.tankSpinFrame = 0;
        this.tankWasSpinning = true;
        this.tankSpinHitEnemies.clear();
        this.tankSpinUntil = this.time.now + 640;
        this.cameras.main.shake(130, 0.006);
        this.tweens.add({ targets: this.octo, alpha: 0.32, duration: 80, yoyo: true, repeat: 5 });

        const hitDelta = this.toroidalDelta(enemy.x, enemy.y, this.octo.x, this.octo.y);
        const away = new PhaserMath.Vector2(hitDelta.dx, hitDelta.dy).normalize().scale(260);
        this.octo.body.setVelocity(away.x, away.y);
        if (!enemy.getData("boss")) {
            this.spawnEnemyDeath(enemy.x, enemy.y, enemy.scaleX || 1);
            enemy.destroy();
        }

        this.updateTankHud();
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        if (this.tankRunStats.hp <= 0) {
            this.game.events.emit("octoglyphs:notice", "Octo got overwhelmed. Tank Hunt ended.");
            this.endTankHunt(false);
        }
    }

    damageEnemiesTouchedBySpin() {
        if (!this.tankHuntActive || !this.enemies || !this.octo) return;

        const spinRadius = (58 + this.tankRunStats.spinPower * 12) * this.mass * this.visualScaleCompensation;
        const spinDamage = Math.max(2, Math.round(2 + this.tankRunStats.damageBonus + this.tankRunStats.spinPower));
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active || this.tankSpinHitEnemies.has(enemy)) continue;

            const enemyRadius = enemy.getData("boss") ? 46 : 30;
            const distance = this.toroidalDistance(this.octo.x, this.octo.y, enemy.x, enemy.y);
            if (distance > spinRadius + enemyRadius) continue;

            this.tankSpinHitEnemies.add(enemy);
            this.damageTankEnemy(enemy, spinDamage);
        }
    }

    applyWakeTrail(delta) {
        if (!this.tankHuntActive || !this.octo || this.tankRunStats.wakeTrail <= 0) return;
        this.tankWakeTimer -= delta;
        const speed = Math.hypot(this.octo.body.velocity.x, this.octo.body.velocity.y);
        if (speed < 95 || this.tankWakeTimer > 0) return;

        this.tankWakeTimer = Math.max(90, 240 - this.tankRunStats.wakeTrail * 28);
        const radius = 42 + this.tankRunStats.wakeTrail * 12;
        const damage = Math.max(1, Math.round(this.tankRunStats.wakeTrail + speed / 260));
        const backAngle = Math.atan2(-this.octo.body.velocity.y, -this.octo.body.velocity.x);
        const x = this.octo.x + Math.cos(backAngle) * 34;
        const y = this.octo.y + Math.sin(backAngle) * 34;
        this.damageEnemiesInRadius(x, y, radius, damage);
        this.spawnPulseVisual(x, y, radius, 0x72f6ff);
    }

    checkManualMineInput() {
        if (!this.tankHuntActive || !this.octo || !this.keys?.SPACE) return;
        if (!Input.Keyboard.JustDown(this.keys.SPACE)) return;

        this.dropPlayerMine(true);
    }

    dropPlayerMine(manual = false) {
        if (!this.tankHuntActive || !this.octo) return null;
        const cooldown = manual ? 700 : 520;
        if (this.time.now < this.tankManualMineCooldown) return null;

        this.tankManualMineCooldown = this.time.now + cooldown;
        const mineDef = manual ? TANK_MINE_ASSETS[0] : (TANK_MINE_ASSETS[1] || TANK_MINE_ASSETS[0]);
        const mine = this.playerMines.create(this.octo.x, this.octo.y, `${mineDef.key}-0`);
        mine.setData("manual", manual);
        mine.setData("armed", true);
        mine.setData("spawnedAt", this.time.now);
        mine.setData("animKey", mineDef.key);
        mine.setData("animFrames", mineDef.frames);
        mine.setData("damage", manual ? Math.max(3, 2 + this.tankRunStats.damageBonus) : Math.max(2, 1 + this.tankRunStats.inkMines));
        mine.setData("radius", manual ? 112 : 72 + this.tankRunStats.inkMines * 16);
        mine.setScale(manual ? 0.72 : 0.58);
        mine.setDepth(13);
        mine.body.setCircle(28, 0, 0);
        this.improveGameplayReadability(mine, { outlineAlpha: 0.38, haloColor: manual ? 0x7fffff : 0x8fff7f, haloAlpha: 0.34, haloBlur: 8 });
        this.time.delayedCall(manual ? 180 : 420, () => {
            if (mine.active) mine.setData("armed", false);
        });
        this.time.delayedCall(manual ? 3200 : 1900, () => {
            if (mine.active) this.detonatePlayerMine(mine);
        });
        if (manual) this.game.events.emit("octoglyphs:notice", "Panic mine dropped.");
        return mine;
    }

    animatePlayerMines() {
        if (!this.playerMines) return;
        for (const mine of this.playerMines.getChildren()) {
            if (!mine.active) continue;
            const frames = mine.getData("animFrames") || 0;
            const key = mine.getData("animKey");
            if (!frames || !key) continue;
            const frame = Math.floor(this.time.now / 76) % frames;
            mine.setTexture(`${key}-${frame}`);
        }
    }

    triggerPlayerMine(mine) {
        this.detonatePlayerMine(mine);
    }

    detonatePlayerMine(mine) {
        if (!mine?.active) return;
        const radius = mine.getData("radius") || 96;
        const damage = mine.getData("damage") || 3;
        const color = mine.getData("manual") ? 0x7fffff : 0x8fff7f;
        this.damageEnemiesInRadius(mine.x, mine.y, radius, damage);
        this.spawnPulseVisual(mine.x, mine.y, radius, color);
        mine.destroy();
    }


    applyInkMines(delta) {
        if (!this.tankHuntActive || !this.octo || this.tankRunStats.inkMines <= 0) return;
        this.tankMineTimer -= delta;
        if (this.tankMineTimer > 0) return;

        this.tankMineTimer = Math.max(520, 1450 - this.tankRunStats.inkMines * 190);
        this.dropPlayerMine(false);
    }

    applyGemPulse(x, y) {
        const radius = 88 + this.tankRunStats.gemPulse * 22;
        const damage = Math.max(1, this.tankRunStats.gemPulse);
        this.damageEnemiesInRadius(x, y, radius, damage);
        this.spawnPulseVisual(x, y, radius, 0xffa7ff);
    }

    damageEnemiesInRadius(x, y, radius, damage) {
        for (const enemy of this.enemies.getChildren()) {
            if (!enemy.active) continue;
            const enemyRadius = enemy.getData("boss") ? 46 : 30;
            if (this.toroidalDistance(x, y, enemy.x, enemy.y) > radius + enemyRadius) continue;
            this.damageTankEnemy(enemy, damage);
        }
    }

    spawnPulseVisual(x, y, radius, color) {
        const pulse = this.add.circle(x, y, radius, color, 0.13).setDepth(14);
        pulse.setStrokeStyle(3, color, 0.58);
        this.tweens.add({
            targets: pulse,
            alpha: 0,
            scale: 1.35,
            duration: 260,
            onComplete: () => pulse.destroy()
        });
    }

    spawnGemAt(x, y, type = "green", options = {}) {
        const gemDef = GEM_TYPES[type] || GEM_TYPES.green;
        const position = this.tankHuntActive ? { x, y } : { x: this.wrapValue(x, this.worldWidth), y: this.wrapValue(y, this.worldHeight) };
        const gem = this.gems.create(position.x, position.y, `${gemDef.key}-0`);
        gem.setData("gemType", type);
        gem.setData("value", options.value || gemDef.value);
        gem.setData("frame", PhaserMath.Between(0, gemDef.frames - 1));
        gem.setScale(type === "silver" ? 0.86 : 0.96);
        gem.setDepth(19);
        this.improveGameplayReadability(gem, { outlineAlpha: 0.42, haloColor: gemDef.tint || 0xffffff, haloAlpha: 0.58, haloBlur: 12 });
        this.addGemGlowVisuals(gem, gemDef, type);
        gem.body.setCircle(14, 7, 7);
        if (options.lifetime > 0) {
            gem.setData("expiresAt", this.time.now + options.lifetime);
            this.time.delayedCall(Math.max(1, options.lifetime - 4500), () => {
                if (!gem.active) return;
                const visuals = gem.getData("glowVisuals") || [];
                this.tweens.add({ targets: [gem, ...visuals], alpha: 0.24, duration: 520, yoyo: true, repeat: 4 });
            });
            this.time.delayedCall(options.lifetime, () => {
                if (gem.active) this.destroyGem(gem);
            });
        }
    }

    addGemGlowVisuals(gem, gemDef, type) {
        const color = gemDef.tint || 0xffffff;
        const rareScale = type === "silver" ? 1.45 : (type === "pink" ? 1.28 : (type === "yellow" ? 1.16 : (type === "blue" ? 1.08 : 1)));
        const seed = PhaserMath.Between(0, 9999);
        const glowFrame = `${gemDef.key}-${gem.getData("frame") || 0}`;
        const backGlow = this.add.image(gem.x, gem.y, glowFrame).setDepth(18);
        const softAura = this.add.ellipse(gem.x, gem.y, 54 * rareScale, 42 * rareScale, color, 0.16).setDepth(17.9);
        const spriteBloom = this.add.image(gem.x, gem.y, glowFrame).setDepth(18.2);
        backGlow.setData("syncGemFrame", true);
        spriteBloom.setData("syncGemFrame", true);
        const visuals = [softAura, backGlow, spriteBloom];

        softAura.setBlendMode(BlendModes.ADD);
        backGlow.setBlendMode(BlendModes.ADD);
        spriteBloom.setBlendMode(BlendModes.ADD);
        backGlow.setTint(color);
        spriteBloom.setTint(0xffffff);
        backGlow.setAlpha(0.24).setScale(gem.scaleX * 2.35 * rareScale, gem.scaleY * 2.35 * rareScale);
        spriteBloom.setAlpha(0.28).setScale(gem.scaleX * 1.48 * rareScale, gem.scaleY * 1.48 * rareScale);
        if (softAura.postFX?.addGlow) softAura.postFX.addGlow(color, 0.75, 0, false, 16, 18);
        if (backGlow.postFX?.addGlow) backGlow.postFX.addGlow(color, 0.95, 0, false, 18, 18);
        if (spriteBloom.postFX?.addGlow) spriteBloom.postFX.addGlow(0xffffff, 0.55, 0, false, 8, 10);

        this.tweens.add({
            targets: softAura,
            alpha: { from: 0.08, to: 0.22 },
            scaleX: { from: 0.88, to: 1.18 },
            scaleY: { from: 0.82, to: 1.08 },
            duration: 820 + (seed % 260),
            delay: seed % 300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        this.tweens.add({
            targets: backGlow,
            alpha: { from: 0.14, to: 0.34 },
            scale: { from: gem.scaleX * 2.0 * rareScale, to: gem.scaleX * 2.65 * rareScale },
            duration: 700 + (seed % 240),
            delay: (seed * 3) % 320,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        this.tweens.add({
            targets: spriteBloom,
            alpha: { from: 0.16, to: 0.42 },
            scale: { from: gem.scaleX * 1.22 * rareScale, to: gem.scaleX * 1.7 * rareScale },
            duration: 440 + (seed % 180),
            delay: (seed * 5) % 260,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        const sparkleCount = type === "silver" ? 4 : (type === "pink" || type === "yellow" ? 3 : (type === "blue" ? 2 : 1));
        for (let i = 0; i < sparkleCount; i += 1) {
            const angle = (Math.PI * 2 / sparkleCount) * i + PhaserMath.FloatBetween(-0.9, 0.9);
            const radiusX = PhaserMath.FloatBetween(17, 30) * rareScale;
            const radiusY = PhaserMath.FloatBetween(12, 23) * rareScale;
            const sparkle = this.add.star(gem.x + Math.cos(angle) * radiusX, gem.y + Math.sin(angle) * radiusY, 4, 1.1, type === "green" ? 2.8 : 3.8, 0xffffff, 0.0).setDepth(20.5);
            sparkle.setBlendMode(BlendModes.ADD);
            sparkle.setData("offsetX", Math.cos(angle) * radiusX);
            sparkle.setData("offsetY", Math.sin(angle) * radiusY);
            visuals.push(sparkle);
            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0.0, to: PhaserMath.FloatBetween(0.42, 0.78) },
                scale: { from: 0.35, to: PhaserMath.FloatBetween(0.9, 1.35) },
                angle: 180,
                duration: PhaserMath.Between(420, 980),
                delay: PhaserMath.Between(0, 1500),
                hold: PhaserMath.Between(60, 260),
                repeatDelay: PhaserMath.Between(300, 1400),
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        gem.setData("glowVisuals", visuals);
    }

    updateGemGlowVisuals(gem) {
        const visuals = gem.getData("glowVisuals") || [];
        const gemType = gem.getData("gemType") || "green";
        const gemDef = GEM_TYPES[gemType] || GEM_TYPES.green;
        const frame = gem.getData("frame") || 0;
        const frameKey = `${gemDef.key}-${frame}`;
        for (const visual of visuals) {
            if (!visual?.active) continue;
            if (visual.getData("syncGemFrame")) visual.setTexture(frameKey);
            visual.setPosition(gem.x + (visual.getData("offsetX") || 0), gem.y + (visual.getData("offsetY") || 0));
        }
    }

    addTraitGlowVisuals(trait, asset) {
        const color = this.getTraitGlowColor(asset);
        const rareScale = asset.rarity === "legendary" ? 1.34 : (asset.rarity === "rare" ? 1.18 : 1.06);
        const seed = PhaserMath.Between(0, 9999);
        const frameKey = this.getTraitFrameKey(trait, asset);
        const backGlow = this.add.image(trait.x, trait.y, frameKey).setDepth(14.8);
        const softAura = this.add.ellipse(trait.x, trait.y, 70 * rareScale, 52 * rareScale, color, 0.14).setDepth(14.6);
        const spriteBloom = this.add.image(trait.x, trait.y, frameKey).setDepth(15.1);
        backGlow.setData("syncTraitFrame", true);
        spriteBloom.setData("syncTraitFrame", true);
        const visuals = [softAura, backGlow, spriteBloom];

        softAura.setBlendMode(BlendModes.ADD);
        backGlow.setBlendMode(BlendModes.ADD);
        spriteBloom.setBlendMode(BlendModes.ADD);
        backGlow.setTint(color).setAlpha(0.22).setScale(trait.scaleX * 2.25 * rareScale, trait.scaleY * 2.25 * rareScale);
        spriteBloom.setTint(0xffffff).setAlpha(0.30).setScale(trait.scaleX * 1.42 * rareScale, trait.scaleY * 1.42 * rareScale);
        if (softAura.postFX?.addGlow) softAura.postFX.addGlow(color, 0.75, 0, false, 16, 18);
        if (backGlow.postFX?.addGlow) backGlow.postFX.addGlow(color, 0.95, 0, false, 18, 18);
        if (spriteBloom.postFX?.addGlow) spriteBloom.postFX.addGlow(0xffffff, 0.55, 0, false, 8, 10);

        this.tweens.add({
            targets: softAura,
            alpha: { from: 0.08, to: 0.22 },
            scaleX: { from: 0.9, to: 1.2 },
            scaleY: { from: 0.84, to: 1.1 },
            duration: 880 + (seed % 260),
            delay: seed % 300,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        this.tweens.add({
            targets: backGlow,
            alpha: { from: 0.14, to: 0.34 },
            scale: { from: trait.scaleX * 1.92 * rareScale, to: trait.scaleX * 2.55 * rareScale },
            duration: 760 + (seed % 240),
            delay: (seed * 3) % 320,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });
        this.tweens.add({
            targets: spriteBloom,
            alpha: { from: 0.16, to: 0.42 },
            scale: { from: trait.scaleX * 1.18 * rareScale, to: trait.scaleX * 1.62 * rareScale },
            duration: 500 + (seed % 180),
            delay: (seed * 5) % 260,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        const sparkleCount = asset.rarity === "legendary" ? 4 : (asset.rarity === "rare" ? 3 : 2);
        for (let i = 0; i < sparkleCount; i += 1) {
            const angle = (Math.PI * 2 / sparkleCount) * i + PhaserMath.FloatBetween(-0.8, 0.8);
            const radiusX = PhaserMath.FloatBetween(22, 36) * rareScale;
            const radiusY = PhaserMath.FloatBetween(16, 28) * rareScale;
            const sparkle = this.add.star(trait.x + Math.cos(angle) * radiusX, trait.y + Math.sin(angle) * radiusY, 4, 1.1, 4.0, 0xffffff, 0.0).setDepth(17.5);
            sparkle.setBlendMode(BlendModes.ADD);
            sparkle.setData("offsetX", Math.cos(angle) * radiusX);
            sparkle.setData("offsetY", Math.sin(angle) * radiusY);
            visuals.push(sparkle);
            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0.0, to: PhaserMath.FloatBetween(0.45, 0.82) },
                scale: { from: 0.35, to: PhaserMath.FloatBetween(0.9, 1.35) },
                angle: 180,
                duration: PhaserMath.Between(440, 1040),
                delay: PhaserMath.Between(0, 1600),
                hold: PhaserMath.Between(60, 260),
                repeatDelay: PhaserMath.Between(320, 1500),
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        trait.setData("glowVisuals", visuals);
    }

    updateTraitGlowVisuals(trait) {
        const visuals = trait.getData("glowVisuals") || [];
        const asset = getAssetById(trait.getData("assetId"));
        const frameKey = this.getTraitFrameKey(trait, asset);
        for (const visual of visuals) {
            if (!visual?.active) continue;
            if (visual.getData("syncTraitFrame")) visual.setTexture(frameKey);
            visual.setPosition(trait.x + (visual.getData("offsetX") || 0), trait.y + (visual.getData("offsetY") || 0));
        }
    }

    getTraitFrameKey(trait, asset) {
        if (!asset) return trait.texture?.key || "body-blue";
        const frame = trait.getData("frame") || 0;
        return asset.frames && asset.frames > 1 ? `${asset.key}-${frame}` : asset.key;
    }

    getTraitGlowColor(asset) {
        if (asset?.rarity === "legendary") return 0xffd36d;
        if (asset?.rarity === "rare") return 0x9ee8ff;
        if (asset?.rarity === "event") return 0xd68cff;
        if (asset?.slot === "eyes") return 0x8affff;
        if (asset?.slot === "hat") return 0xffe58a;
        if (asset?.slot === "clothes") return 0xff9bd5;
        if (asset?.slot === "boost") return 0xa7ff8a;
        return 0xffffff;
    }

    destroyTraitPickup(trait) {
        if (!trait) return;
        const visuals = trait.getData("glowVisuals") || [];
        for (const visual of visuals) {
            if (!visual?.active) continue;
            this.tweens.killTweensOf(visual);
            visual.destroy();
        }
        this.tweens.killTweensOf(trait);
        trait.destroy();
    }

    destroyGem(gem) {
        if (!gem) return;
        const visuals = gem.getData("glowVisuals") || [];
        for (const visual of visuals) {
            if (!visual?.active) continue;
            this.tweens.killTweensOf(visual);
            visual.destroy();
        }
        gem.destroy();
    }

    spawnTraitDiscovery(force = false) {
        if (this.traits.countActive(true) >= 2 && !force) return;

        const undiscovered = TRAIT_DISCOVERY_POOL.filter(asset => !this.save.discovered?.includes(asset.id) && !isUnlocked(this.save, asset.id));
        const pool = undiscovered.length > 0 ? undiscovered : TRAIT_DISCOVERY_POOL.filter(asset => !isUnlocked(this.save, asset.id));
        if (pool.length === 0) {
            this.game.events.emit("octoglyphs:notice", "No undiscovered trait signals remain in current pool.");
            return;
        }

        const asset = this.pickDiscoveryTrait(pool);
        const position = this.pickTraitSpawnPosition();
        const trait = this.traits.create(position.x, position.y, asset.key);
        trait.setData("assetId", asset.id);
        trait.setData("isTrait", true);
        trait.setData("collecting", false);
        trait.setData("frame", PhaserMath.Between(0, Math.max(1, asset.frames || 1) - 1));
        if (asset.frames && asset.frames > 1) trait.setTexture(`${asset.key}-${trait.getData("frame")}`);
        trait.setScale(asset.slot === "boost" ? 0.65 : 0.8);
        trait.setDepth(16);
        trait.body.setCircle(24, 0, 0);

        this.addTraitGlowVisuals(trait, asset);
        this.tweens.add({ targets: trait, alpha: 0.48, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.addTraitMarker(trait);
        this.showCenterTraitText(`${asset.name} HAS JUST SPAWNED IN THE TANK`);
        this.time.delayedCall(22000, () => {
            if (trait.active) this.destroyTraitPickup(trait);
            this.clearTraitMarker(trait);
        });
    }

    addTraitMarker(trait) {
        this.clearTraitMarker();

        const marker = this.add.container(this.octo.x, this.octo.y).setDepth(31);
        const arrow = this.add.text(0, 0, ">", {
            fontFamily: "\"Press Start 2P\", monospace",
            fontSize: "55px",
            color: "#fff08a",
            stroke: "#2b1700",
            strokeThickness: 12
        }).setOrigin(0.5);

        marker.add(arrow);
        marker.setData("trait", trait);
        this.activeTraitMarker = marker;
        this.activeTraitArrow = arrow;
        this.tweens.add({ targets: arrow, scale: 1.08, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    clearTraitMarker(trait = null) {
        if (!this.activeTraitMarker) return;
        if (trait && this.activeTraitMarker.getData("trait") !== trait) return;

        this.tweens.killTweensOf(this.activeTraitMarker.list);
        this.activeTraitMarker.destroy();
        this.activeTraitMarker = null;
        this.activeTraitArrow = null;
    }

    createGemArrow() {
        if (this.gemArrow) return;

        this.gemArrow = this.add.text(0, 0, "➤", {
            fontFamily: "\"Press Start 2P\", monospace",
            fontSize: "22px",
            color: "#7fffff",
            stroke: "#061827",
            strokeThickness: 7
        }).setOrigin(0.5).setDepth(1001).setScrollFactor(0).setVisible(false);
    }

    updateGemArrow() {
        if (!this.gemArrow || !this.octo) return;

        const nearest = this.findNearestOffscreenGem();
        if (!nearest) {
            this.gemArrow.setVisible(false);
            return;
        }

        const camera = this.cameras.main;
        const view = camera.worldView;
        const delta = this.toroidalDelta(this.octo.x, this.octo.y, nearest.x, nearest.y);
        const angle = Math.atan2(delta.dy, delta.dx);
        const screenX = PhaserMath.Clamp(nearest.x - view.x, 34, camera.width - 34);
        const screenY = PhaserMath.Clamp(nearest.y - view.y, 74, camera.height - 34);

        this.gemArrow.setPosition(screenX, screenY);
        this.gemArrow.setRotation(angle);
        this.gemArrow.setVisible(true);
    }

    findNearestOffscreenGem() {
        if (!this.gems || this.gems.countActive(true) === 0) return null;

        const view = this.cameras.main.worldView;
        const padding = 24;
        let best = null;
        let bestDistance = Infinity;

        for (const gem of this.gems.getChildren()) {
            if (!gem.active) continue;
            if (view.contains(gem.x, gem.y)) continue;

            const distance = this.toroidalDistance(this.octo.x, this.octo.y, gem.x, gem.y);
            if (distance < padding || distance >= bestDistance) continue;
            best = gem;
            bestDistance = distance;
        }

        return best;
    }

    updateTraitMarker() {
        if (!this.activeTraitMarker) return;
        const trait = this.activeTraitMarker.getData("trait");
        if (!trait?.active) {
            this.clearTraitMarker(trait);
            return;
        }

        const markerDelta = this.toroidalDelta(this.octo.x, this.octo.y, trait.x, trait.y);
        const angle = Math.atan2(markerDelta.dy, markerDelta.dx);
        const radius = 76;
        this.activeTraitMarker.setPosition(
            this.octo.x + Math.cos(angle) * radius,
            this.octo.y + Math.sin(angle) * radius
        );
        this.activeTraitMarker.setRotation(angle);
    }

    showCenterTraitText(message) {
        if (this.centerTraitText) {
            this.tweens.killTweensOf(this.centerTraitText);
            this.centerTraitText.destroy();
        }

        this.centerTraitText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.32, message.toUpperCase(), {
            fontFamily: "\"Press Start 2P\", monospace",
            fontSize: "24px",
            color: "#fff8c9",
            align: "center",
            stroke: "#061827",
            strokeThickness: 7,
            wordWrap: { width: Math.min(820, this.cameras.main.width - 44) }
        }).setOrigin(0.5).setDepth(1000).setScrollFactor(0);

        this.tweens.add({
            targets: this.centerTraitText,
            alpha: 0,
            y: this.centerTraitText.y - 18,
            delay: 2600,
            duration: 480,
            onComplete: () => {
                if (this.centerTraitText) {
                    this.centerTraitText.destroy();
                    this.centerTraitText = null;
                }
            }
        });
    }

    pickDiscoveryTrait(pool) {
        const weights = { common: 68, uncommon: 23, rare: 8, legendary: 1, event: 1 };
        const weighted = pool.map(asset => ({ asset, weight: weights[asset.rarity] || 20 }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = PhaserMath.Between(1, Math.max(1, total));

        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return entry.asset;
        }

        return Utils.Array.GetRandom(pool);
    }

    pickTraitSpawnPosition() {
        if (this.octo?.active) {
            const camera = this.cameras.main;
            const view = camera.worldView;
            const distance = this.tankHuntActive ? Math.min(view.width, view.height) * 0.32 : Math.min(view.width, view.height) * 0.38;
            const angle = PhaserMath.FloatBetween(0, Math.PI * 2);
            return {
                x: this.octo.x + Math.cos(angle) * distance,
                y: this.octo.y + Math.sin(angle) * distance
            };
        }

        return {
            x: PhaserMath.Between(120, this.worldWidth - 120),
            y: PhaserMath.Between(130, this.worldHeight - 130)
        };
    }

    animateGems() {
        for (const gem of this.gems.getChildren()) {
            const gemDef = GEM_TYPES[gem.getData("gemType") || "green"] || GEM_TYPES.green;
            const frame = ((gem.getData("frame") || 0) + 1) % gemDef.frames;
            gem.setData("frame", frame);
            gem.setTexture(`${gemDef.key}-${frame}`);
            this.updateGemGlowVisuals(gem);
        }
    }

    animateTraits() {
        for (const trait of this.traits.getChildren()) {
            if (!trait?.active) continue;
            const asset = getAssetById(trait.getData("assetId"));
            if (asset?.frames && asset.frames > 1) {
                const frame = ((trait.getData("frame") || 0) + 1) % asset.frames;
                trait.setData("frame", frame);
                trait.setTexture(`${asset.key}-${frame}`);
            }
            this.updateTraitGlowVisuals(trait);
        }
    }

    getTankSpeedMultiplier() {
        return this.stats.swimSpeed * (this.tankHuntActive ? this.tankRunStats.swimSpeed : 1);
    }

    getTankPlayerSpeed(baseSpeed) {
        return baseSpeed * this.getTankSpeedMultiplier();
    }

    wrapValue(value, size) {
        return ((value % size) + size) % size;
    }

    toroidalDelta(fromX, fromY, toX, toY) {
        let dx = toX - fromX;
        let dy = toY - fromY;
        if (Math.abs(dx) > this.worldWidth / 2) dx -= Math.sign(dx) * this.worldWidth;
        if (Math.abs(dy) > this.worldHeight / 2) dy -= Math.sign(dy) * this.worldHeight;
        return { dx, dy };
    }

    toroidalDistance(fromX, fromY, toX, toY) {
        const { dx, dy } = this.toroidalDelta(fromX, fromY, toX, toY);
        return Math.hypot(dx, dy);
    }

    canOverlapToroidal(a, b, maxDistance) {
        if (!this.tankHuntActive) return true;
        if (!a?.active || !b?.active) return false;
        return this.toroidalDistance(a.x, a.y, b.x, b.y) <= maxDistance;
    }

    moveBodyTowardToroidal(actor, target, speed) {
        if (!actor?.body || !target) return;
        const { dx, dy } = this.toroidalDelta(actor.x, actor.y, target.x, target.y);
        const length = Math.max(0.001, Math.hypot(dx, dy));
        actor.body.setVelocity(dx / length * speed, dy / length * speed);
    }

    unwrapPointNearPlayer(x, y) {
        if (!this.octo?.active) return { x, y };
        let px = x;
        let py = y;
        while (px - this.octo.x > this.worldWidth / 2) px -= this.worldWidth;
        while (px - this.octo.x < -this.worldWidth / 2) px += this.worldWidth;
        while (py - this.octo.y > this.worldHeight / 2) py -= this.worldHeight;
        while (py - this.octo.y < -this.worldHeight / 2) py += this.worldHeight;
        return { x: px, y: py };
    }

    wrapTankActorNearPlayer(actor) {
        if (!actor?.active || !this.octo?.active) return;

        let x = actor.x;
        let y = actor.y;
        while (x - this.octo.x > this.worldWidth / 2) x -= this.worldWidth;
        while (x - this.octo.x < -this.worldWidth / 2) x += this.worldWidth;
        while (y - this.octo.y > this.worldHeight / 2) y -= this.worldHeight;
        while (y - this.octo.y < -this.worldHeight / 2) y += this.worldHeight;
        if (x !== actor.x || y !== actor.y) actor.setPosition(x, y);
    }

    wrapTankActor(actor) {
        this.wrapTankActorNearPlayer(actor);
    }

    wrapTankActors() {
        if (!this.tankHuntActive || !this.octo) return;

        for (const enemy of this.enemies.getChildren()) this.wrapTankActorNearPlayer(enemy);
        for (const bullet of this.bullets.getChildren()) this.wrapTankActorNearPlayer(bullet);
        for (const gem of this.gems.getChildren()) this.wrapTankActorNearPlayer(gem);
        for (const trait of this.traits.getChildren()) this.wrapTankActorNearPlayer(trait);
        this.updateToroidalGhosts();
    }

    createToroidalGhosts() {
        if (!this.octo || this.toroidalGhosts.length > 0) return;

        const offsets = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
        ];
        this.toroidalGhosts = offsets.map(([ox, oy]) => {
            const ghost = this.add.container(this.octo.x, this.octo.y).setDepth(19).setAlpha(0.78).setVisible(false);
            const body = this.add.image(0, 0, "body-blue");
            const clothes = this.add.image(0, -1, "clothes-astro").setVisible(false);
            const eyes = this.add.image(0, 0, "eyes-regular");
            const hat = this.add.image(0, -2, "hat-alien-antenna").setVisible(false);
            const boost = this.add.image(38, 14, "boost-shell-earring").setVisible(false);
            ghost.add([body, clothes, eyes, hat, boost]);
            return { ghost, body, clothes, eyes, hat, boost, ox, oy };
        });
    }

    updateToroidalGhosts() {
        if (!this.octo || !this.toroidalGhosts?.length) return;

        const camera = this.cameras.main;
        const margin = 180;
        const nearLeft = this.octo.x < camera.worldView.x + margin;
        const nearRight = this.octo.x > camera.worldView.right - margin;
        const nearTop = this.octo.y < camera.worldView.y + margin;
        const nearBottom = this.octo.y > camera.worldView.bottom - margin;

        for (const entry of this.toroidalGhosts) {
            const visibleX = (entry.ox < 0 && nearRight) || (entry.ox > 0 && nearLeft) || entry.ox === 0;
            const visibleY = (entry.oy < 0 && nearBottom) || (entry.oy > 0 && nearTop) || entry.oy === 0;
            const visible = this.tankHuntActive && visibleX && visibleY && (entry.ox !== 0 || entry.oy !== 0);
            entry.ghost.setVisible(visible);
            if (!visible) continue;
            entry.ghost.setPosition(this.octo.x + entry.ox * this.worldWidth, this.octo.y + entry.oy * this.worldHeight);
            entry.ghost.setScale(this.octo.scaleX, this.octo.scaleY);
            entry.ghost.setRotation(this.octo.rotation);
            entry.body.setTexture(this.bodyLayer.texture.key).setScale(this.bodyLayer.scaleX, this.bodyLayer.scaleY).setVisible(this.bodyLayer.visible);
            entry.eyes.setTexture(this.eyesLayer.texture.key).setScale(this.eyesLayer.scaleX, this.eyesLayer.scaleY).setVisible(this.eyesLayer.visible);
            entry.clothes.setTexture(this.clothesLayer.texture.key).setScale(this.clothesLayer.scaleX, this.clothesLayer.scaleY).setVisible(this.clothesLayer.visible);
            entry.hat.setTexture(this.hatLayer.texture.key).setScale(this.hatLayer.scaleX, this.hatLayer.scaleY).setVisible(this.hatLayer.visible);
            entry.boost.setTexture(this.boostLayer.texture.key).setScale(this.boostLayer.scaleX, this.boostLayer.scaleY).setVisible(this.boostLayer.visible);
        }
    }

    applyMagnetPull() {
        const huntMagnet = this.tankHuntActive ? this.tankRunStats.magnetRange : 1;
        this.pullCollectibles(this.gems.getChildren(), 135 * this.stats.magnetRange * huntMagnet, 235 * this.stats.magnetRange * huntMagnet);
        if (this.target) this.pullCollectibles(this.traits.getChildren(), 105 * this.stats.magnetRange, 190 * this.stats.magnetRange);
    }

    pullCollectibles(items, radius, speed) {
        for (const item of items) {
            if (!item.active || !item.body) continue;

            const distance = this.toroidalDistance(this.octo.x, this.octo.y, item.x, item.y);
            if (distance > radius) {
                item.body.setVelocity(0, 0);
                item.setData("collecting", false);
                continue;
            }

            const collectDistance = item.getData("isTrait") ? 60 : 46;
            if (distance <= collectDistance) {
                if (item.getData("isTrait")) {
                    item.setData("collecting", true);
                    item.body.setVelocity(0, 0);
                    item.setPosition(this.octo.x, this.octo.y);
                    continue;
                }

                this.collectGem(item);
                continue;
            }

            item.setData("collecting", false);
            const pull = PhaserMath.Clamp(1 - distance / radius, 0.25, 1);
            this.moveBodyTowardToroidal(item, this.octo, speed * pull);
        }
    }

    collectGem(gem) {
        const type = gem.getData("gemType") || "green";
        const value = Math.max(1, Math.round((gem.getData("value") || 1) * this.stats.gemValue));
        addGemValue(this.save, type, value);
        const gemX = gem.x;
        const gemY = gem.y;
        this.destroyGem(gem);
        if (this.tankHuntActive) this.addTankHuntGemSource(type, value);
        if (this.tankHuntActive && this.tankRunStats.gemPulse > 0) this.applyGemPulse(gemX, gemY);
        if (this.tankHuntActive) this.addTankHuntXp(TANK_GEM_XP_VALUES[type] || 1);
        this.emitState();
        saveGame(this.save);
        triggerFTUE("firstGem", this.save);
    }

    addTankHuntGemSource(source, value) {
        if (!this.tankHuntActive) return;

        const safeValue = Math.max(0, Math.round(value || 0));
        if (safeValue <= 0) return;

        this.tankHuntGemsCollected += safeValue;
        this.tankHuntGemSources[source] = (this.tankHuntGemSources[source] || 0) + safeValue;
    }

    collectTrait(trait) {
        if (!this.target && !trait.getData("collecting")) return;

        const assetId = trait.getData("assetId");
        const asset = getAssetById(assetId);
        this.clearTraitMarker(trait);
        this.destroyTraitPickup(trait);

        if (!asset) return;
        const alreadyUnlocked = isUnlocked(this.save, assetId);
        const freeUnlock = ["rare", "legendary", "event"].includes(asset.rarity);
        let message = `${asset.name} discovered. Purchase it from the Shop.`;

        if (alreadyUnlocked) {
            unlockAsset(this.save, assetId);
            message = `${asset.name} signal reinforced.`;
        } else if (freeUnlock) {
            unlockAsset(this.save, assetId);
            equipAsset(this.save, assetId);
            message = `${asset.name} discovered, unlocked, and equipped.`;
        } else {
            discoverAsset(this.save, assetId);
        }

        this.save.lifetime.manualTraitsCollected += 1;
        this.refreshStats();
        this.applyLoadoutSprites();
        this.emitState();
        saveGame(this.save);
        this.showCenterTraitText(message);
        this.game.events.emit("octoglyphs:inventory-changed");
        triggerFTUE("firstTrait", this.save);
    }

    equipPersistent(assetId) {
        this.save = loadSave();
        if (equipAsset(this.save, assetId)) {
            saveGame(this.save);
            this.refreshStats();
            this.applyLoadoutSprites();
            this.emitState();
        }
    }

    refreshSave() {
        this.save = loadSave();
        this.refreshStats();
        this.applyLoadoutSprites();
        this.emitState();
    }

    releaseManualControl() {
        this.target = null;
        this.autopilotCollectTarget = null;
        this.game.events.emit("octoglyphs:mode", "Autopilot");
    }

    autopilot() {
        if (this.target || !this.octo || this.tankUpgradeChoiceActive || this.tankContinueChoiceActive) return;

        this.updateAutopilotStuckState();

        const nearest = this.pickAutopilotGemTarget();
        if (nearest) {
            const distance = this.toroidalDistance(this.octo.x, this.octo.y, nearest.x, nearest.y);
            const baseSpeed = this.tankHuntActive ? 126 * this.tankRunStats.swimSpeed : 112;
            const speed = this.getAutopilotSpeed(baseSpeed * this.stats.swimSpeed * this.stats.idleEfficiency, distance, this.tankHuntActive ? 52 : 28);
            this.moveBodyTowardToroidal(this.octo, nearest, speed);
            return;
        }

        if (this.needsNewWanderTarget()) this.pickNewWanderTarget();

        const distance = this.toroidalDistance(this.octo.x, this.octo.y, this.wanderTarget.x, this.wanderTarget.y);
        const wanderSpeed = this.tankHuntActive ? 126 : 76;
        const huntSpeed = this.tankHuntActive ? this.tankRunStats.swimSpeed : 1;
        const speed = this.getAutopilotSpeed(wanderSpeed * this.stats.swimSpeed * this.stats.idleEfficiency * huntSpeed, distance, this.tankHuntActive ? 140 : 82);
        this.moveBodyTowardToroidal(this.octo, this.wanderTarget, speed);
    }

    pickAutopilotGemTarget() {
        if (this.autopilotCollectTarget?.active && this.toroidalDistance(this.octo.x, this.octo.y, this.autopilotCollectTarget.x, this.autopilotCollectTarget.y) > 34) return this.autopilotCollectTarget;

        this.autopilotCollectTarget = this.findNearest(this.gems.getChildren());
        return this.autopilotCollectTarget;
    }

    needsNewWanderTarget() {
        if (!this.wanderTarget) return true;
        if (this.autopilotStuckCount >= 2) return true;
        if (this.time.now - this.wanderTargetCreatedAt > 5200) return true;
        return this.toroidalDistance(this.octo.x, this.octo.y, this.wanderTarget.x, this.wanderTarget.y) < (this.tankHuntActive ? 140 : 82);
    }

    pickNewWanderTarget() {
        const minDistance = this.tankHuntActive ? 420 : 260;
        const maxDistance = this.tankHuntActive ? 760 : 520;
        const baseAngle = Math.atan2(this.octo.body.velocity.y || 1, this.octo.body.velocity.x || 1);
        const turnMagnitude = this.tankHuntActive ? PhaserMath.FloatBetween(0.34, 0.68) : PhaserMath.FloatBetween(0.2, 0.55);
        const turn = Math.PI * turnMagnitude * PhaserMath.RND.sign();
        const angle = this.autopilotStuckCount >= 2 ? baseAngle + Math.PI + turn : baseAngle + turn;
        const distance = PhaserMath.FloatBetween(minDistance, maxDistance);

        this.wanderTarget = {
            x: this.wrapValue(this.octo.x + Math.cos(angle) * distance, this.worldWidth),
            y: this.wrapValue(this.octo.y + Math.sin(angle) * distance, this.worldHeight)
        };
        this.wanderTargetCreatedAt = this.time.now;
        this.autopilotStuckCount = 0;
    }

    getAutopilotSpeed(baseSpeed, distance, slowRadius) {
        const slowFactor = PhaserMath.Clamp(distance / slowRadius, 0.35, 1);
        return baseSpeed * slowFactor;
    }

    updateAutopilotStuckState() {
        if (!this.autopilotLastPosition || this.time.now - this.autopilotLastProgressAt > 640) {
            if (this.autopilotLastPosition) {
                const moved = this.toroidalDistance(this.autopilotLastPosition.x, this.autopilotLastPosition.y, this.octo.x, this.octo.y);
                this.autopilotStuckCount = moved < 30 ? this.autopilotStuckCount + 1 : 0;
            }
            this.autopilotLastPosition = { x: this.octo.x, y: this.octo.y };
            this.autopilotLastProgressAt = this.time.now;
        }
    }

    findNearest(items) {
        return this.findNearestFrom(this.octo, items);
    }

    findNearestFrom(source, items) {
        let best = null;
        let bestDistance = Number.MAX_SAFE_INTEGER;
        for (const item of items) {
            if (!item?.active || !item.body || item === source) continue;
            const distance = this.toroidalDistance(source.x, source.y, item.x, item.y);
            if (distance < bestDistance) {
                best = item;
                bestDistance = distance;
            }
        }
        return best;
    }

    refreshStats() {
        this.stats = equippedStats(this.save);
        if (this.octo?.body) this.octo.body.setMaxVelocity(190 * this.stats.swimSpeed * (this.tankHuntActive ? this.tankRunStats.swimSpeed : 1));
    }

    // =================== ENEMY PROJECTILES ===================

    spawnEnemyProjectile(enemy, dirX, dirY, options = {}) {
        if (!this.tankHuntActive || !this.octo) return;
        const speed = options.speed || 140;
        const x = options.x ?? (enemy.x + dirX * 32);
        const y = options.y ?? (enemy.y + dirY * 32);
        const textureKey = options.textureKey || "tank-enemy-jelly";
        const proj = this.enemyBullets.create(x, y, textureKey);
        proj.setScale(options.scale || 0.35);
        proj.setTint(options.tint || 0xff2244);
        proj.setDepth(options.depth || 16);
        this.improveGameplayReadability(proj, { outlineAlpha: 0.38, haloColor: options.tint || 0xff2244, haloAlpha: 0.26, haloBlur: 7 });
        proj.setAlpha(options.alpha || 0.9);
        proj.body.setCircle(options.radius || 8, 0, 0);
        proj.body.setVelocity(dirX * speed, dirY * speed);
        proj.rotation = Math.atan2(dirY, dirX) + TANK_BULLET_ANGLE_OFFSET;
        proj.setData("spawnedAt", this.time.now);
        proj.setData("lifetime", options.lifetime || 3200);
        proj.setData("damage", options.damage || (enemy.getData("boss") ? 2 : 1));
    }

    fireOctoBossShotPattern(enemy, aimAngle) {
        if (!enemy?.active || !this.tankHuntActive) return;

        const wave = this.tankHuntWave || 1;
        const pattern = enemy.getData("shotPattern") || 0;
        const speed = Math.min(250, 150 + wave * 5);
        const tint = pattern === 0 ? 0xff7adf : pattern === 1 ? 0xffb347 : 0x9dfffb;
        const spread = pattern === 0 ? [-18, 0, 18] : pattern === 1 ? [-36, -12, 12, 36] : [-52, -26, 0, 26, 52];

        enemy.setTint(tint);
        this.time.delayedCall(180, () => { if (enemy.active) enemy.clearTint(); });

        for (const degrees of spread) {
            const angle = aimAngle + PhaserMath.DegToRad(degrees);
            this.spawnEnemyProjectile(enemy, Math.cos(angle), Math.sin(angle), {
                speed,
                scale: 0.42,
                radius: 9,
                tint,
                lifetime: 3400,
                damage: 1,
                textureKey: "tank-bullet-toxic",
                x: enemy.x + Math.cos(angle) * 42,
                y: enemy.y + Math.sin(angle) * 42
            });
        }

        enemy.setData("shotPattern", (pattern + 1) % 3);
    }

    updateEnemyBullets() {
        if (!this.tankHuntActive || !this.enemyBullets || !this.octo) return;
        const now = this.time.now;
        for (const proj of this.enemyBullets.getChildren()) {
            if (!proj?.active) continue;
            const age = now - (proj.getData("spawnedAt") || now);
            if (age > (proj.getData("lifetime") || 3200)) {
                proj.destroy();
                continue;
            }
            // Wrap in toroidal space
            if (proj.x < 0) proj.x += this.worldWidth;
            else if (proj.x > this.worldWidth) proj.x -= this.worldWidth;
            if (proj.y < 0) proj.y += this.worldHeight;
            else if (proj.y > this.worldHeight) proj.y -= this.worldHeight;
            // Check overlap with player
            const dist = this.toroidalDistance(proj.x, proj.y, this.octo.x, this.octo.y);
            if (dist < 36) {
                this.hitPlayerByProjectile(proj);
                proj.destroy();
            }
        }
    }

    hitPlayerByProjectile(proj) {
        if (!this.tankHuntActive || this.tankUpgradeChoiceActive || this.tankBossRewardChoiceActive || this.tankContinueChoiceActive || this.tankContinueChoicePending) return;
        if (this.time.now < this.tankInvincibleUntil) return;
        const damage = proj.getData("damage") || 1;
        this.tankRunStats.hp = Math.max(0, this.tankRunStats.hp - damage);
        this.tankInvincibleUntil = this.time.now + 1000;
        this.cameras.main.shake(100, 0.005);
        this.tweens.add({ targets: this.octo, alpha: 0.32, duration: 80, yoyo: true, repeat: 4 });
        this.spawnDamageNumber(this.octo.x, this.octo.y - 24, damage, false);
        this.updateTankHud();
        this.game.events.emit("octoglyphs:hunt-state", this.getTankHuntState());
        if (this.tankRunStats.hp <= 0) {
            this.game.events.emit("octoglyphs:notice", "Octo got overwhelmed. Tank Hunt ended.");
            this.endTankHunt(false);
        }
    }

    // =================== XP VACUUM ===================

    vacuumGemsOnLevelUp() {
        if (!this.gems || !this.octo) return;
        for (const gem of this.gems.getChildren()) {
            if (!gem?.active) continue;
            const delta = this.toroidalDelta(gem.x, gem.y, this.octo.x, this.octo.y);
            this.tweens.add({
                targets: gem,
                x: gem.x + delta.dx,
                y: gem.y + delta.dy,
                duration: 340,
                ease: "Sine.easeIn"
            });
        }
    }

    // =================== INK BURST (panic button) ===================

    checkInkBurstInput() {
        if (!this.tankHuntActive || !this.keys) return;
        if (this.keys.SPACE.isDown && this.time.now > this.tankInkBurstCooldown) {
            this.fireInkBurst();
        }
    }

    fireInkBurst() {
        if (!this.tankHuntActive || !this.octo) return;
        this.tankInkBurstCooldown = this.time.now + 8000;
        this.cameras.main.flash(100, 120, 60, 200, true);
        this.spawnPulseVisual(this.octo.x, this.octo.y, 160, 0x7744cc);
        // Damage and push all nearby enemies
        const range = 180;
        for (const enemy of (this.enemies?.getChildren() || [])) {
            if (!enemy?.active) continue;
            const dist = this.toroidalDistance(this.octo.x, this.octo.y, enemy.x, enemy.y);
            if (dist > range) continue;
            this.damageTankEnemy(enemy, 2);
            if (enemy.active) {
                const pushDelta = this.toroidalDelta(this.octo.x, this.octo.y, enemy.x, enemy.y);
                const pushDir = new PhaserMath.Vector2(pushDelta.dx, pushDelta.dy).normalize().scale(340);
                enemy.body.setVelocity(pushDir.x, pushDir.y);
            }
        }
        // Destroy nearby enemy projectiles
        for (const proj of (this.enemyBullets?.getChildren() || [])) {
            if (!proj?.active) continue;
            const dist = this.toroidalDistance(this.octo.x, this.octo.y, proj.x, proj.y);
            if (dist < range) proj.destroy();
        }
        this.game.events.emit("octoglyphs:notice", "INK BURST!");
    }

    // =================== RUN SUMMARY ===================

    showRunSummary(summary) {
        const minutes = Math.floor(summary.survived / 60);
        const seconds = summary.survived % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        const outcomeText = summary.won ? "HUNT BANKED" : "HUNT ENDED";
        const outcomeClass = summary.won ? "hunt-summary-won" : "hunt-summary-lost";
        const mutationList = summary.mutations.length > 0
            ? summary.mutations.map(choice => `<li><strong>${choice.title} R${choice.rank}</strong><span>${choice.family.toUpperCase()} · ${choice.role.toUpperCase()}</span></li>`).join("")
            : "<li><strong>No mutations chosen</strong><span>Level up to add temporary hunt powers.</span></li>";
        const bossRewardList = summary.bossRewards.length > 0
            ? summary.bossRewards.map(choice => `<li><strong>${choice.title}</strong><span>${choice.family.toUpperCase()}</span></li>`).join("")
            : "<li><strong>No boss rewards chosen</strong><span>Defeat bosses on wave 5, 10, 15...</span></li>";
        const gemSourceRows = Object.entries(summary.gemSources || {}).length > 0
            ? Object.entries(summary.gemSources).map(([source, value]) => `<div class="hunt-summary-row hunt-summary-subrow"><span>${this.formatTankGemSource(source)}</span><span>${value}</span></div>`).join("")
            : `<div class="hunt-summary-row hunt-summary-subrow"><span>Collected</span><span>0</span></div>`;

        const container = document.createElement("div");
        container.className = `hunt-summary-overlay ${outcomeClass}`;
        container.innerHTML = `
            <div class="hunt-summary-card hunt-summary-card-wide">
                <h2>${outcomeText}</h2>
                <p class="hunt-summary-subtitle">Real hunt recap only. No placeholder progression shown.</p>
                <div class="hunt-summary-stats hunt-summary-grid">
                    <div class="hunt-summary-row"><span>Wave Reached</span><span>${summary.wave}</span></div>
                    <div class="hunt-summary-row"><span>Enemies Defeated</span><span>${summary.totalKills}</span></div>
                    <div class="hunt-summary-row"><span>Bosses Defeated</span><span>${summary.bossKills}</span></div>
                    <div class="hunt-summary-row"><span>Level Reached</span><span>${summary.level}</span></div>
                    <div class="hunt-summary-row"><span>Damage Taken</span><span>${summary.damageTaken}</span></div>
                    <div class="hunt-summary-row"><span>Survived</span><span>${timeStr}</span></div>
                    <div class="hunt-summary-row"><span>Archetype</span><span>${summary.family}</span></div>
                    <div class="hunt-summary-row"><span>Blue-Gem Value Earned</span><span>${summary.gemsEarned}</span></div>
                </div>
                <div class="hunt-summary-section">
                    <h3>Reward Sources</h3>
                    ${gemSourceRows}
                </div>
                <div class="hunt-summary-section hunt-summary-columns">
                    <div>
                        <h3>Mutations Chosen</h3>
                        <ul>${mutationList}</ul>
                    </div>
                    <div>
                        <h3>Boss Rewards</h3>
                        <ul>${bossRewardList}</ul>
                    </div>
                </div>
                <button class="hunt-summary-dismiss">RETURN TO TANK</button>
            </div>
        `;
        document.body.appendChild(container);
        requestAnimationFrame(() => container.classList.add("is-open"));

        const dismiss = container.querySelector(".hunt-summary-dismiss");
        dismiss.addEventListener("click", () => {
            container.classList.remove("is-open");
            setTimeout(() => container.remove(), 300);
        });
    }

    formatTankGemSource(source) {
        const labels = {
            green: "Green gems",
            blue: "Blue gems",
            yellow: "Yellow gems",
            pink: "Pink gems",
            silver: "Silver gems",
            bossRewards: "Boss rewards"
        };
        return labels[source] || source;
    }

    emitState() {
        this.game.events.emit("octoglyphs:state", {
            wallet: this.save.wallet,
            totalGems: Object.values(this.save.wallet).reduce((sum, value) => sum + Number(value || 0), 0),
            loadout: equippedAssets(this.save),
            lifetime: this.save.lifetime,
            stats: this.stats || equippedStats(this.save),
            tankRun: this.tankHuntActive ? this.tankRunStats : null
        });
    }
}
