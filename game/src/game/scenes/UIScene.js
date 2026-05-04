import { Scene } from "phaser";
import { SHOP_ASSETS, SPECIAL_FORM_ASSETS, getAssetById } from "../data/assetCatalog.js";
import { checkSynergies } from "../data/synergies.js";
import { formatFinalStats, statDeltaParts } from "../data/statSystem.js";
import { buyAsset, discoverAllShopAssets, equipAsset, equippedAssets, equippedStats, fusableTraits, fuseTraits, isUnlocked, loadSave, ownedAssetsForSlot, saveGame, statsWithAssetEquipped, unequipSlot, walletTotal } from "../state/saveStore.js";
import { triggerFTUE } from "../state/ftueManager.js";

const SHOP_CATEGORIES = [
    { id: "body", label: "Bodies" },
    { id: "eyes", label: "Eyes" },
    { id: "hat", label: "Hats" },
    { id: "clothes", label: "Clothes" },
    { id: "boost", label: "Boosts" },
    { id: "special", label: "Special" }
];

const LOADOUT_SLOTS = [
    { id: "body", label: "Body" },
    { id: "legendary", label: "Legendary" },
    { id: "eyes", label: "Eyes" },
    { id: "hat", label: "Hat" },
    { id: "clothes", label: "Clothes" },
    { id: "boost", label: "Boost" }
];

const SHOP_FILTERS = [
    { id: "all", label: "All" },
    { id: "owned", label: "Owned" },
    { id: "affordable", label: "Affordable" },
    { id: "locked", label: "Locked" }
];

const SORT_OPTIONS = [
    { id: "default", label: "Smart", stat: null },
    { id: "swimSpeed", label: "Speed", stat: "swimSpeed" },
    { id: "luck", label: "Luck", stat: "luck" },
    { id: "damage", label: "Damage", stat: "damage" },
    { id: "armor", label: "Armor", stat: "armor" },
    { id: "gemValue", label: "Gems", stat: "gemValue" },
    { id: "magnetRange", label: "Magnet", stat: "magnetRange" },
    { id: "idleEfficiency", label: "Idle", stat: "idleEfficiency" },
    { id: "rarity", label: "Rarity", stat: null },
    { id: "price", label: "Price", stat: null }
];

const QUICK_PRESETS = [
    { id: "fastest", label: "Fastest", stat: "swimSpeed", hint: "highest swim speed" },
    { id: "luckiest", label: "Luckiest", stat: "luck", hint: "highest luck" },
    { id: "strongest", label: "Strongest", stat: "damage", hint: "highest damage" },
    { id: "toughest", label: "Toughest", stat: "armor", hint: "highest armor" },
    { id: "richest", label: "Gem Farm", stat: "gemValue", hint: "highest gem value" },
    { id: "magnet", label: "Magnet", stat: "magnetRange", hint: "highest pickup range" }
];

const PRESET_SLOTS = ["body", "eyes", "hat", "clothes", "boost"];

const RARITY_ORDER = {
    starter: 0,
    common: 1,
    uncommon: 2,
    rare: 3,
    legendary: 4,
    event: 5
};

export class UIScene extends Scene {
    constructor() {
        super("UIScene");
        this.save = null;
        this.activeCategory = "body";
        this.activeFilter = "all";
        this.activeLoadoutSlot = "body";
        this.activeShopSort = "default";
        this.activeLoadoutSort = "default";
        this.activeEvolveRarity = "common";
        this.evolveSelected = [];
        this.huntCharge = null;
    }

    create() {
        this.save = loadSave();
        this.bindButtons();
        this.renderShopControls();
        this.renderShop();
        this.renderInventory();
        this.renderLoadout();
        this.renderEvolution();
        this.renderState({
            wallet: this.save.wallet,
            totalGems: walletTotal(this.save),
            loadout: equippedAssets(this.save),
            lifetime: this.save.lifetime,
            stats: equippedStats(this.save),
            tankRun: null
        });

        this.game.events.on("octoglyphs:state", state => this.renderState(state));
        this.game.events.on("octoglyphs:notice", message => this.setNotice(message));
        this.game.events.on("octoglyphs:hunt-state", state => this.renderHuntState(state));
        this.game.events.on("octoglyphs:hunt-charge", charge => this.renderHuntCharge(charge));
        this.game.events.on("octoglyphs:visibility", state => this.renderVisibilityState(state));
        this.game.events.on("octoglyphs:inventory-changed", () => {
            this.save = loadSave();
            this.renderShop();
            this.renderInventory();
            this.renderLoadout();
            this.renderEvolution();
        });
    }

    bindButtons() {
        document.getElementById("shop-toggle")?.addEventListener("click", () => {
            document.getElementById("shop-panel")?.classList.toggle("is-open");
            document.getElementById("loadout-panel")?.classList.remove("is-open");
            document.getElementById("evolve-panel")?.classList.remove("is-open");
            triggerFTUE("firstShopOpen");
        });

        document.getElementById("loadout-toggle")?.addEventListener("click", () => {
            document.getElementById("loadout-panel")?.classList.toggle("is-open");
            document.getElementById("shop-panel")?.classList.remove("is-open");
            document.getElementById("evolve-panel")?.classList.remove("is-open");
            this.renderLoadout();
            triggerFTUE("firstLoadout");
        });

        document.getElementById("evolve-toggle")?.addEventListener("click", () => {
            document.getElementById("evolve-panel")?.classList.toggle("is-open");
            document.getElementById("shop-panel")?.classList.remove("is-open");
            document.getElementById("loadout-panel")?.classList.remove("is-open");
            this.renderEvolution();
        });

        document.querySelectorAll("[data-close-panel]").forEach(button => {
            button.addEventListener("click", () => {
                document.getElementById(button.dataset.closePanel)?.classList.remove("is-open");
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            document.getElementById("shop-panel")?.classList.remove("is-open");
            document.getElementById("loadout-panel")?.classList.remove("is-open");
            document.getElementById("evolve-panel")?.classList.remove("is-open");
        });

        document.getElementById("reset-save-button")?.addEventListener("click", () => {
            if (!confirm("Reset OctoGlyphs local save?")) return;
            localStorage.removeItem("octoglyphs.save.v1");
            localStorage.removeItem("primordial.save.v1");
            this.save = loadSave();
            this.renderShopControls();
            this.renderShop();
            this.renderInventory();
            this.renderLoadout();
            this.renderEvolution();
            this.refreshStatsReadout();
            this.game.events.emit("octoglyphs:save-changed");
            this.setNotice("Local save reset.");
        });

        document.getElementById("discover-all-button")?.addEventListener("click", () => {
            this.save = loadSave();
            discoverAllShopAssets(this.save);
            saveGame(this.save);
            this.renderShop();
            this.renderInventory();
            this.renderLoadout();
            this.renderEvolution();
            this.game.events.emit("octoglyphs:save-changed");
            this.setNotice("All shop traits discovered for testing.");
        });
    }

    renderState(state) {
        const wallet = document.getElementById("wallet-readout");
        const lifetime = document.getElementById("lifetime-readout");
        const loadout = document.getElementById("loadout-readout");
        const stats = document.getElementById("stats-readout");

        if (wallet) {
            wallet.textContent = `Gems ${state.totalGems} · G ${state.wallet.green || 0} · B ${state.wallet.blue || 0} · Y ${state.wallet.yellow || 0} · P ${state.wallet.pink || 0} · S ${state.wallet.silver || 0}`;
        }

        if (lifetime) {
            lifetime.textContent = `Prompts ${state.lifetime.prompts || 0} · Tokens ${state.lifetime.tokens || 0} · Traits ${state.lifetime.manualTraitsCollected || 0}`;
        }

        if (loadout) {
            loadout.textContent = state.loadout.map(asset => asset.name).join(" + ");
        }

        if (stats) {
            stats.textContent = `Stats ${formatFinalStats(state.stats || equippedStats(this.save))}`;
        }

        this.renderVisibilityState(this.visibilityState || "visible · focused · live swim");
        this.save = loadSave();
    }

    renderVisibilityState(state) {
        this.visibilityState = state;
        const mode = document.getElementById("mode-readout");
        if (!mode) return;
        mode.textContent = `Autopilot · ${state}`;
    }

    renderHuntCharge(charge, force = false) {
        this.huntCharge = charge;
        const huntButton = document.getElementById("tank-hunt-button");
        if (!huntButton) return;
        if (!force && (huntButton.textContent === "End Hunt" || huntButton.textContent === "Ending...")) return;

        if (!charge?.ready) {
            const remaining = Math.max(0, charge?.remaining || 0);
            huntButton.textContent = `Tank Hunt in ${remaining} prompt${remaining === 1 ? "" : "s"}`;
            huntButton.disabled = true;
            return;
        }

        huntButton.textContent = charge.huntsReady > 1 ? `Tank Hunt x${charge.huntsReady}` : "Tank Hunt Ready";
        huntButton.disabled = false;
    }

    renderHuntState(state) {
        const mode = document.getElementById("mode-readout");
        const huntButton = document.getElementById("tank-hunt-button");

        if (!state) {
            if (mode) mode.textContent = "Autopilot";
            if (huntButton) this.renderHuntCharge(this.huntCharge, true);
            return;
        }

        if (huntButton) {
            huntButton.textContent = state.ending ? "Ending..." : "End Hunt";
            huntButton.disabled = Boolean(state.ending);
        }

        if (!mode) return;
        const bossText = state.bossActive ? " · Boss" : "";
        const endingText = state.ending ? " · Ending" : "";
        const upgradeText = state.choosingUpgrade ? " · Upgrade" : "";
        const continueText = state.awaitingContinue ? " · Continue?" : "";
        mode.textContent = `Tank Hunt · HP ${state.hp}/${state.maxHp} · Lv ${state.level} ${state.xp}/${state.nextXp} XP · Wave ${state.wave} · ${state.kills}/${state.goal} kills${bossText}${upgradeText}${continueText}${endingText}`;
    }

    renderShopControls() {
        const categoryRoot = document.getElementById("shop-category-tabs");
        const filterRoot = document.getElementById("shop-filter-tabs");
        const sortRoot = document.getElementById("shop-sort-tabs");
        if (categoryRoot) {
            categoryRoot.innerHTML = "";
            for (const category of SHOP_CATEGORIES) {
                const button = document.createElement("button");
                button.className = `shop-tab ${this.activeCategory === category.id ? "is-active" : ""}`;
                button.textContent = category.label;
                button.addEventListener("click", () => {
                    this.activeCategory = category.id;
                    this.renderShopControls();
                    this.renderShop();
                    this.scrollListToTop("shop-list");
                });
                categoryRoot.appendChild(button);
            }
        }

        if (filterRoot) {
            filterRoot.innerHTML = "";
            for (const filter of SHOP_FILTERS) {
                const button = document.createElement("button");
                button.className = `shop-tab shop-tab-small ${this.activeFilter === filter.id ? "is-active" : ""}`;
                button.textContent = filter.label;
                button.addEventListener("click", () => {
                    this.activeFilter = filter.id;
                    this.renderShopControls();
                    this.renderShop();
                    this.scrollListToTop("shop-list");
                });
                filterRoot.appendChild(button);
            }
        }

        if (sortRoot) {
            this.renderSortTabs(sortRoot, this.activeShopSort, sortId => {
                this.activeShopSort = sortId;
                this.renderShopControls();
                this.renderShop();
                this.scrollListToTop("shop-list");
            });
        }
    }

    renderSortTabs(root, activeSort, onPick) {
        root.innerHTML = "";
        for (const option of SORT_OPTIONS) {
            const button = document.createElement("button");
            button.className = `shop-tab shop-tab-small sort-tab ${activeSort === option.id ? "is-active" : ""}`;
            button.textContent = option.label;
            button.addEventListener("click", () => onPick(option.id));
            root.appendChild(button);
        }
    }

    renderShop() {
        const shop = document.getElementById("shop-list");
        if (!shop) return;

        this.save = loadSave();
        shop.innerHTML = "";

        const total = walletTotal(this.save);
        const assets = this.getVisibleAssets(total);
        const count = document.getElementById("shop-count-readout");
        if (count) count.textContent = `${assets.length} shown`;

        if (assets.length === 0) {
            const empty = document.createElement("div");
            empty.className = "shop-empty";
            empty.textContent = "Nothing in this filter yet.";
            shop.appendChild(empty);
            return;
        }

        const currentStats = equippedStats(this.save);

        for (const asset of assets) {
            const item = document.createElement("button");
            const unlocked = isUnlocked(this.save, asset.id);
            const discovered = this.isDiscovered(asset);
            const equipped = this.save.loadout[asset.slot] === asset.id;
            const affordable = !unlocked && discovered && total >= asset.price;
            const special = asset.slot === "legendary" || asset.slot === "halloween";
            const statDelta = this.shopDeltaHtml(asset, discovered, special, equipped, currentStats);
            item.className = `shop-item rarity-${asset.rarity || "common"} ${equipped ? "is-equipped" : ""} ${!discovered ? "is-undiscovered" : ""}`;
            item.disabled = special || !discovered || (!unlocked && !affordable);
            item.innerHTML = `
                <span class="trait-thumb-wrap"><img src="${asset.framePath || asset.path}" alt="" /></span>
                <span class="shop-copy">
                    <strong>${discovered ? asset.name : "Undiscovered Trait"}</strong>
                    <small>${this.shopTraitMeta(asset, discovered)}</small>
                    <small>${this.statusText(asset, unlocked, equipped, affordable, discovered)}</small>
                    ${statDelta}
                    <span class="trait-action-copy">${this.shopActionText(asset, unlocked, equipped, affordable, discovered)}</span>
                </span>
            `;
            item.addEventListener("click", () => this.onShopClick(asset.id));
            shop.appendChild(item);
        }
    }

    getVisibleAssets(total) {
        const source = this.activeCategory === "special"
            ? SPECIAL_FORM_ASSETS
            : SHOP_ASSETS.filter(asset => asset.slot === this.activeCategory);

        return source
            .filter(asset => this.matchesFilter(asset, total))
            .sort((a, b) => this.sortAsset(a, b, total, this.activeShopSort));
    }

    matchesFilter(asset, total) {
        const unlocked = isUnlocked(this.save, asset.id);
        const discovered = this.isDiscovered(asset);
        const special = asset.slot === "legendary" || asset.slot === "halloween";
        const affordable = discovered && !special && !unlocked && total >= asset.price;
        const locked = discovered && !unlocked && !affordable;

        if (this.activeFilter === "owned") return unlocked;
        if (this.activeFilter === "affordable") return affordable;
        if (this.activeFilter === "locked") return locked;
        return true;
    }

    sortAsset(a, b, total, sortId = "default") {
        const rankA = this.assetStateRank(a, total);
        const rankB = this.assetStateRank(b, total);
        if (rankA !== rankB) return rankA - rankB;

        const sortResult = this.compareAssetsForSort(a, b, sortId, false);
        if (sortResult !== 0) return sortResult;

        const rarityA = RARITY_ORDER[a.rarity] ?? 9;
        const rarityB = RARITY_ORDER[b.rarity] ?? 9;
        if (rarityA !== rarityB) return rarityA - rarityB;

        if (a.price !== b.price) return a.price - b.price;
        return a.name.localeCompare(b.name);
    }

    compareAssetsForSort(a, b, sortId = "default", preferEquipped = true) {
        if (preferEquipped) {
            const equippedA = this.save?.loadout?.[a.slot] === a.id ? 1 : 0;
            const equippedB = this.save?.loadout?.[b.slot] === b.id ? 1 : 0;
            if (equippedA !== equippedB) return equippedB - equippedA;
        }

        if (sortId === "rarity") {
            const rarityA = RARITY_ORDER[a.rarity] ?? 0;
            const rarityB = RARITY_ORDER[b.rarity] ?? 0;
            if (rarityA !== rarityB) return rarityB - rarityA;
        } else if (sortId === "price") {
            if ((a.price || 0) !== (b.price || 0)) return (b.price || 0) - (a.price || 0);
        } else if (sortId !== "default") {
            const scoreA = this.assetSortScore(a, sortId);
            const scoreB = this.assetSortScore(b, sortId);
            if (scoreA !== scoreB) return scoreB - scoreA;
        }

        const rarityA = RARITY_ORDER[a.rarity] ?? 9;
        const rarityB = RARITY_ORDER[b.rarity] ?? 9;
        if (rarityA !== rarityB) return rarityB - rarityA;
        return a.name.localeCompare(b.name);
    }

    assetSortScore(asset, stat) {
        if (!asset || !stat) return 0;
        const direct = Number(asset.statMods?.[stat] || 0);
        const hunt = asset.huntMods || {};
        const huntScores = {
            swimSpeed: Number(hunt.swimSpeed || 1) - 1,
            magnetRange: Number(hunt.magnetRange || 1) - 1,
            gemValue: Number(hunt.gemPulse || 0) * 0.05 + Number(hunt.luckBonus || 0) * 0.02,
            luck: Number(hunt.luckBonus || 0) * 0.08 + Number(hunt.critChance || 0) * 0.04 + Number(hunt.prismFork || 0) * 0.03,
            damage: Number(hunt.damageBonus || 0) * 0.08 + Number(hunt.pierce || 0) * 0.04 + Number(hunt.chain || 0) * 0.05 + Number(hunt.extraProjectiles || 0) * 0.05,
            armor: Number(hunt.maxHp || 0) * 0.25 + Number(hunt.guardianCharges || 0) * 0.15 + Number(hunt.freeze || 0) * 0.05,
            idleEfficiency: Number(hunt.nextXpMult && hunt.nextXpMult < 1 ? 1 - hunt.nextXpMult : 0)
        };
        return direct + Number(huntScores[stat] || 0);
    }

    assetStateRank(asset, total) {
        if (isUnlocked(this.save, asset.id)) return 0;
        if (!this.isDiscovered(asset)) return 3;
        if (asset.slot !== "legendary" && asset.slot !== "halloween" && total >= asset.price) return 1;
        return 2;
    }

    isDiscovered(asset) {
        return isUnlocked(this.save, asset.id) || Boolean(this.save.discovered?.includes(asset.id));
    }

    shopTraitMeta(asset, discovered) {
        if (!discovered) return `${this.labelForSlot(asset.slot)} · ??? · find in tank`;
        return `${this.labelForSlot(asset.slot)} · ${this.rarityTagHtml(asset.rarity || "common")} · ${asset.stats}`;
    }

    statusText(asset, unlocked, equipped, affordable, discovered = true) {
        if (!discovered) return "Unknown · discover through manual pickup";
        if (equipped) return "Equipped";
        if (unlocked) return "Owned · equip in Loadout";
        if (asset.slot === "halloween") return "Event form · Halloween pool";
        if (affordable) return `${asset.price} gems · tap to buy`;
        return `${asset.price} gems`;
    }

    shopActionText(asset, unlocked, equipped, affordable, discovered = true) {
        if (!discovered) return "Find this trait signal in tank first";
        if (equipped) return "Currently equipped";
        if (unlocked) return "Owned — switch in Loadout";
        if (asset.slot === "halloween") return "Preview only for now";
        if (affordable) return "Tap to buy and equip";
        return "Earn more gems to unlock";
    }

    rarityTagHtml(rarity) {
        const value = rarity || "common";
        return `<span class="rarity-word rarity-word-${value}">${value}</span>`;
    }

    labelForSlot(slot) {
        if (slot === "body") return "Body";
        if (slot === "eyes") return "Eyes";
        if (slot === "hat") return "Hat";
        if (slot === "clothes") return "Clothes";
        if (slot === "boost") return "Boost";
        if (slot === "legendary") return "Legendary";
        if (slot === "halloween") return "Halloween";
        return slot;
    }

    renderHuntModTags(huntMods) {
        if (!huntMods || Object.keys(huntMods).length === 0) return "";
        const HUNT_LABELS = {
            pierce: "Pierce", homing: "Homing", bounce: "Bounce", split: "Split",
            chain: "Chain", orbit: "Orbit", poison: "Poison", fear: "Fear",
            freeze: "Freeze", spectral: "Spectral", wiggle: "Wiggle",
            boomerang: "Boomerang", lumpOfCoal: "Growing", contagion: "Contagion",
            prismFork: "Prism Fork", critChance: "Crit", broadside: "Broadside",
            backblast: "Backblast", inkMines: "Mines", spiral: "Spiral",
            wakeTrail: "Wake Trail", guardianCharges: "Guardian", spinPower: "Spin",
            extraProjectiles: "+Shots", gemPulse: "Gem Pulse", damageBonus: "+Dmg",
            bulletScale: "+Size", maxHp: "+HP", luckBonus: "+Luck"
        };
        const tags = [];
        for (const [key, value] of Object.entries(huntMods)) {
            if (!value || key === "family") continue;
            // Skip multiplicative keys that are close to 1 (they're multipliers, not flags)
            if (["swimSpeed", "magnetRange", "fireDelay", "shotSpeed", "shotLifetime", "nextXpMult"].includes(key)) {
                if (key === "fireDelay" && value < 1) tags.push("Fast Fire");
                else if (key === "shotSpeed" && value > 1) tags.push("Fast Shots");
                else if (key === "swimSpeed" && value > 1) tags.push("Speed");
                else if (key === "magnetRange" && value > 1) tags.push("Magnet");
                else if (key === "nextXpMult" && value < 1) tags.push("Fast Level");
                continue;
            }
            const label = HUNT_LABELS[key] || key;
            if (typeof value === "number" && value > 1) {
                tags.push(`${label}×${value}`);
            } else {
                tags.push(label);
            }
        }
        return tags.map(t => `<span class="hunt-tag">${t}</span>`).join("");
    }

    renderInventory() {
        const inventory = document.getElementById("inventory-readout");
        if (!inventory) return;
        this.save = loadSave();
        inventory.textContent = `Unlocked ${this.save.unlocked.length}/${SHOP_ASSETS.length}`;
    }

    renderLoadout() {
        const slotRoot = document.getElementById("loadout-slot-tabs");
        const listRoot = document.getElementById("loadout-list");
        const statsRoot = document.getElementById("loadout-stats-readout");
        const summaryRoot = document.getElementById("loadout-summary");
        const sortRoot = document.getElementById("loadout-sort-tabs");
        const presetRoot = document.getElementById("loadout-presets");
        if (!slotRoot || !listRoot) return;

        this.save = loadSave();
        slotRoot.innerHTML = "";
        listRoot.innerHTML = "";
        this.renderLoadoutSummary(summaryRoot);
        this.renderLoadoutPresets(presetRoot);
        if (sortRoot) {
            this.renderSortTabs(sortRoot, this.activeLoadoutSort, sortId => {
                this.activeLoadoutSort = sortId;
                this.renderLoadout();
                this.scrollListToTop("loadout-list");
            });
        }

        for (const slot of LOADOUT_SLOTS) {
            const equippedAsset = this.assetForSlot(slot.id);
            const button = document.createElement("button");
            button.className = `shop-tab loadout-slot-tab ${this.activeLoadoutSlot === slot.id ? "is-active" : ""}`;
            button.innerHTML = `<span>${slot.label}</span><small>${equippedAsset?.name || "Empty"}</small>`;
            button.addEventListener("click", () => {
                this.activeLoadoutSlot = slot.id;
                this.renderLoadout();
                this.scrollListToTop("loadout-list");
            });
            slotRoot.appendChild(button);
        }

        const currentStats = equippedStats(this.save);
        if (statsRoot) statsRoot.textContent = `Current ${formatFinalStats(currentStats)}`;

        // --- Synergy readout ---
        const synergyRoot = document.getElementById("loadout-synergy-readout");
        this.renderSynergyReadout(synergyRoot);

        if (this.activeLoadoutSlot === "legendary" && this.save.loadout.legendary) {
            const equippedLegendary = this.assetForSlot("legendary");
            const nextStats = this.statsWithSlotUnequipped("legendary");
            const unequip = document.createElement("button");
            unequip.className = "shop-item loadout-item loadout-unequip-item";
            unequip.innerHTML = `
                <span class="trait-thumb-wrap unequip-thumb">×</span>
                <span class="shop-copy">
                    <strong>Unequip Legendary</strong>
                    <small>Return to normal layered body loadout.</small>
                    <small>${equippedLegendary ? "Removes " + equippedLegendary.name : "Clears legendary form"}</small>
                    <span class="stat-delta-row">${this.renderDeltaHtml(currentStats, nextStats)}</span>
                    <span class="trait-action-copy">Tap to remove special form</span>
                </span>
            `;
            unequip.addEventListener("click", () => this.onUnequipSlot("legendary"));
            listRoot.appendChild(unequip);
        }

        const assets = ownedAssetsForSlot(this.save, this.activeLoadoutSlot)
            .sort((a, b) => this.compareAssetsForSort(a, b, this.activeLoadoutSort));
        if (assets.length === 0) {
            const empty = document.createElement("div");
            empty.className = "shop-empty";
            empty.textContent = "No owned traits in this slot yet. Discover traits in tank, then buy them in Shop.";
            listRoot.appendChild(empty);
            return;
        }

        for (const asset of assets) {
            const equipped = this.save.loadout[asset.slot] === asset.id;
            const nextStats = statsWithAssetEquipped(this.save, asset.id);
            const delta = this.renderDeltaHtml(currentStats, nextStats);
            const huntTags = this.renderHuntModTags(asset.huntMods);
            const item = document.createElement("button");
            item.className = `shop-item loadout-item rarity-${asset.rarity || "common"} ${equipped ? "is-equipped" : ""}`;
            item.innerHTML = `
                <span class="trait-thumb-wrap"><img src="${asset.framePath || asset.path}" alt="" /></span>
                <span class="shop-copy">
                    <strong>${asset.name}${equipped ? " · Equipped" : ""}</strong>
                    <small>${this.labelForSlot(asset.slot)} · ${this.rarityTagHtml(asset.rarity || "common")}</small>
                    <small>${asset.stats}</small>
                    ${huntTags ? `<span class="hunt-mod-tags">${huntTags}</span>` : ""}
                    <span class="stat-delta-row">${equipped ? "Current slot trait" : delta}</span>
                    <span class="trait-action-copy">${equipped ? "Active in current build" : "Tap to equip"}</span>
                </span>
            `;
            item.addEventListener("click", () => this.onLoadoutClick(asset.id));
            listRoot.appendChild(item);
        }
    }

    renderLoadoutPresets(root) {
        if (!root) return;
        root.innerHTML = "";

        const title = document.createElement("div");
        title.className = "preset-title";
        title.textContent = "Quick builds";
        root.appendChild(title);

        for (const preset of QUICK_PRESETS) {
            const button = document.createElement("button");
            button.className = "preset-button";
            button.innerHTML = `<strong>${preset.label}</strong><small>${preset.hint}</small>`;
            button.addEventListener("click", () => this.applyQuickPreset(preset));
            root.appendChild(button);
        }
    }

    applyQuickPreset(preset) {
        this.save = loadSave();
        let changed = false;

        for (const slot of PRESET_SLOTS) {
            const candidates = ownedAssetsForSlot(this.save, slot);
            if (candidates.length === 0) continue;
            candidates.sort((a, b) => this.compareAssetsForSort(a, b, preset.stat, false));
            const best = candidates[0];
            if (best && this.save.loadout[slot] !== best.id) {
                this.save.loadout[slot] = best.id;
                changed = true;
            }
        }

        if (this.save.loadout.legendary) {
            this.save.loadout.legendary = null;
            changed = true;
        }

        if (!changed) {
            this.setNotice(`${preset.label} preset already active.`);
            return;
        }

        saveGame(this.save);
        this.setNotice(`${preset.label} preset equipped.`);
        this.renderShop();
        this.renderInventory();
        this.renderLoadout();
        this.refreshStatsReadout();
        this.game.events.emit("octoglyphs:equip", null);
        this.game.events.emit("octoglyphs:save-changed");
    }

    renderLoadoutSummary(summaryRoot) {
        if (!summaryRoot) return;
        summaryRoot.innerHTML = "";

        for (const slot of LOADOUT_SLOTS) {
            const asset = this.assetForSlot(slot.id);
            const tile = document.createElement("button");
            tile.className = `loadout-summary-tile ${this.activeLoadoutSlot === slot.id ? "is-active" : ""} ${asset ? "" : "is-empty"}`;
            tile.innerHTML = `
                <span class="summary-thumb">${asset ? `<img src="${asset.framePath || asset.path}" alt="" />` : "?"}</span>
                <span><strong>${slot.label}</strong><small>${asset?.name || "Empty"}</small></span>
            `;
            tile.addEventListener("click", () => {
                this.activeLoadoutSlot = slot.id;
                this.renderLoadout();
                this.scrollListToTop("loadout-list");
            });
            summaryRoot.appendChild(tile);
        }
    }

    renderSynergyReadout(root) {
        if (!root) return;
        root.innerHTML = "";

        const equipped = equippedAssets(this.save);
        const equippedIds = equipped.map(a => a.id);
        const { active, partial } = checkSynergies(equippedIds);

        if (active.length === 0 && partial.length === 0) return;

        const container = document.createElement("div");
        container.className = "synergy-readout";

        for (const synergy of active) {
            const row = document.createElement("div");
            row.className = "synergy-row synergy-active";
            row.style.borderColor = synergy.color;
            row.innerHTML = `<strong>${synergy.name}</strong> <span class="synergy-desc">${synergy.desc}</span>`;
            container.appendChild(row);
        }

        for (const { synergy, have, need } of partial) {
            const row = document.createElement("div");
            row.className = "synergy-row synergy-partial";
            row.innerHTML = `<strong>${synergy.name}</strong> <span class="synergy-progress">${have}/${need} items</span> <span class="synergy-desc">${synergy.desc}</span>`;
            container.appendChild(row);
        }

        root.appendChild(container);
    }

    assetForSlot(slotId) {
        const assetId = this.save?.loadout?.[slotId];
        return getAssetById(assetId);
    }

    scrollListToTop(id) {
        const list = document.getElementById(id);
        if (list) list.scrollTop = 0;
    }

    shopDeltaHtml(asset, discovered, special, equipped, currentStats) {
        if (!discovered || special) return "";
        if (equipped) return `<span class="stat-delta-row"><span class="stat-delta-neutral">Current loadout</span></span>`;
        const nextStats = statsWithAssetEquipped(this.save, asset.id);
        return `<span class="stat-delta-row">${this.renderDeltaHtml(currentStats, nextStats)}</span>`;
    }

    renderDeltaHtml(currentStats, nextStats) {
        const parts = statDeltaParts(currentStats, nextStats);
        if (parts.length === 0) return `<span class="stat-delta-neutral">No stat change</span>`;
        return parts.map(part => {
            const before = currentStats?.[part.key];
            const after = nextStats?.[part.key];
            const suffix = part.key === "armor" ? "" : "x";
            const decimals = part.key === "armor" ? 1 : 2;
            const total = Number(after || 0).toFixed(decimals);
            const base = Number(before || 0).toFixed(decimals);
            return `<span class="stat-delta-${part.direction}">${part.text} · total ${total}${suffix} from ${base}${suffix}</span>`;
        }).join("");
    }

    onShopClick(assetId) {
        this.save = loadSave();

        if (isUnlocked(this.save, assetId)) {
            this.setNotice("Already owned. Use Loadout to equip traits.");
        } else {
            const result = buyAsset(this.save, assetId);
            saveGame(this.save);
            this.setNotice(result.message);
            if (result.success) triggerFTUE("firstBuy");
        }

        this.renderShop();
        this.renderInventory();
        this.renderLoadout();
        this.refreshStatsReadout();
        this.game.events.emit("octoglyphs:equip", assetId);
        this.game.events.emit("octoglyphs:save-changed");
    }

    onLoadoutClick(assetId) {
        this.save = loadSave();
        if (!equipAsset(this.save, assetId)) return;

        saveGame(this.save);
        this.setNotice("Loadout updated.");
        this.renderShop();
        this.renderInventory();
        this.renderLoadout();
        this.refreshStatsReadout();
        this.game.events.emit("octoglyphs:equip", assetId);
        this.game.events.emit("octoglyphs:save-changed");
    }

    onUnequipSlot(slot) {
        this.save = loadSave();
        if (!unequipSlot(this.save, slot)) return;

        saveGame(this.save);
        this.setNotice(`${this.labelForSlot(slot)} unequipped.`);
        this.renderShop();
        this.renderInventory();
        this.renderLoadout();
        this.refreshStatsReadout();
        this.game.events.emit("octoglyphs:equip", null);
        this.game.events.emit("octoglyphs:save-changed");
    }

    statsWithSlotUnequipped(slot) {
        return equippedStats({
            ...this.save,
            loadout: {
                ...this.save.loadout,
                [slot]: null
            }
        });
    }

    refreshStatsReadout() {
        const stats = document.getElementById("stats-readout");
        if (!stats) return;
        this.save = loadSave();
        stats.textContent = `Stats ${formatFinalStats(equippedStats(this.save))}`;
    }

    setNotice(message) {
        const notice = document.getElementById("notice-readout");
        if (notice) notice.textContent = message;
    }

    renderEvolution() {
        const RARITY_LADDER = ["common", "uncommon", "rare"];
        const FUSE_COSTS = { common: 50, uncommon: 150, rare: 400 };
        const RARITY_UP = { common: "uncommon", uncommon: "rare", rare: "legendary" };

        const tabRoot = document.getElementById("evolve-rarity-tabs");
        const listRoot = document.getElementById("evolve-list");
        const selectionRoot = document.getElementById("evolve-selection-readout");
        const actionRoot = document.getElementById("evolve-action");
        const statusRoot = document.getElementById("evolve-status-readout");
        if (!tabRoot || !listRoot) return;

        this.save = loadSave();
        const equipped = new Set(Object.values(this.save.loadout).filter(Boolean));

        tabRoot.innerHTML = "";
        for (const rarity of RARITY_LADDER) {
            const btn = document.createElement("button");
            btn.className = "shop-tab" + (this.activeEvolveRarity === rarity ? " is-active" : "");
            btn.textContent = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            btn.addEventListener("click", () => {
                this.activeEvolveRarity = rarity;
                this.evolveSelected = [];
                this.renderEvolution();
            });
            tabRoot.appendChild(btn);
        }

        const traits = fusableTraits(this.save).filter(a => a.rarity === this.activeEvolveRarity);
        const cost = FUSE_COSTS[this.activeEvolveRarity] || 50;
        const target = RARITY_UP[this.activeEvolveRarity] || "???";

        if (statusRoot) {
            const rareText = this.activeEvolveRarity === "rare" ? "legendary form" : target;
            statusRoot.textContent = traits.length + " " + this.activeEvolveRarity + " unequipped traits available · " + cost + " gems to fuse · result: " + rareText;
        }

        listRoot.innerHTML = "";
        if (traits.length === 0) {
            const empty = document.createElement("div");
            empty.className = "shop-empty";
            empty.textContent = "No unequipped " + this.activeEvolveRarity + " traits to evolve.";
            listRoot.appendChild(empty);
        } else {
            for (const trait of traits) {
                const isSelected = this.evolveSelected.includes(trait.id);
                const item = document.createElement("button");
                item.className = "shop-item rarity-" + trait.rarity + (isSelected ? " is-evolve-selected" : "");
                item.innerHTML =
                    '<span class="trait-thumb-wrap"><img src="' + (trait.framePath || trait.path) + '" alt="" /></span>' +
                    '<span class="shop-copy">' +
                    "<strong>" + trait.name + "</strong>" +
                    "<small>" + this.labelForSlot(trait.slot) + " · " + this.rarityTagHtml(trait.rarity) + " · " + trait.stats + "</small>" +
                    (isSelected ? '<small class="evolve-tag">Selected for fusion</small>' : "") +
                    "</span>";
                item.addEventListener("click", () => {
                    if (isSelected) {
                        this.evolveSelected = this.evolveSelected.filter(id => id !== trait.id);
                    } else if (this.evolveSelected.length < 3) {
                        const selectedAssets = this.evolveSelected.map(getAssetById).filter(Boolean);
                        const selectedSlot = selectedAssets[0]?.slot;
                        if (selectedSlot && selectedSlot !== trait.slot) {
                            this.setNotice("Fuse traits from one slot at a time.");
                        } else {
                            this.evolveSelected.push(trait.id);
                        }
                    }
                    this.renderEvolution();
                });
                listRoot.appendChild(item);
            }
        }

        const selectedAssets = this.evolveSelected.map(getAssetById).filter(Boolean);
        const selectedSlot = selectedAssets[0]?.slot || null;
        const mixedSlots = selectedAssets.length > 1 && selectedAssets.some(asset => asset.slot !== selectedSlot);
        const actionTarget = this.activeEvolveRarity === "rare" ? "Legendary Form" : target;
        const canShowFuse = this.evolveSelected.length === 3 && !mixedSlots;

        if (selectionRoot) {
            if (this.evolveSelected.length === 0) {
                selectionRoot.textContent = "Tap 3 unequipped traits from the same slot to fuse.";
            } else {
                const names = this.evolveSelected.map(id => {
                    const a = getAssetById(id);
                    return a ? a.name : id;
                });
                const slotLabel = selectedSlot ? " · " + this.labelForSlot(selectedSlot) : "";
                selectionRoot.textContent = "Selected (" + this.evolveSelected.length + "/3" + slotLabel + "): " + names.join(", ");
            }
        }

        if (actionRoot) {
            actionRoot.innerHTML = "";
            if (canShowFuse) {
                const fuseBtn = document.createElement("button");
                fuseBtn.className = "evolve-fuse-btn";
                fuseBtn.textContent = "Fuse for " + cost + " gems → " + actionTarget;
                fuseBtn.addEventListener("click", () => {
                    const result = fuseTraits(this.save, this.evolveSelected);
                    if (result.success) {
                        saveGame(this.save);
                        this.setNotice(result.message);
                        this.showFusionReward(result.result, result.message);
                        triggerFTUE("firstEvolve", this.save);
                        this.evolveSelected = [];
                        this.save = loadSave();
                        this.renderEvolution();
                        this.renderShop();
                        this.renderInventory();
                        this.renderLoadout();
                        this.refreshStatsReadout();
                        this.game.events.emit("octoglyphs:save-changed");
                    } else {
                        this.setNotice(result.message);
                    }
                });
                actionRoot.appendChild(fuseBtn);
            } else {
                const hint = document.createElement("div");
                hint.className = "evolve-action-hint";
                if (mixedSlots) {
                    hint.textContent = "Selected traits must all be from same slot.";
                } else if (this.evolveSelected.length > 0) {
                    const remaining = 3 - this.evolveSelected.length;
                    const slotName = selectedSlot ? this.labelForSlot(selectedSlot).toLowerCase() : "trait";
                    hint.textContent = "Select " + remaining + " more " + this.activeEvolveRarity + " " + slotName + (remaining === 1 ? "" : "s") + ".";
                } else {
                    hint.textContent = "Fuse button appears after selecting 3 matching traits.";
                }
                actionRoot.appendChild(hint);
            }
        }
    }

    showFusionReward(asset, message) {
        if (!asset) return;

        document.querySelector(".fusion-reward-modal")?.remove();

        const modal = document.createElement("div");
        modal.className = "fusion-reward-modal";
        modal.innerHTML = `
            <div class="fusion-reward-card rarity-${asset.rarity || "common"}">
                <button class="fusion-reward-close" type="button">×</button>
                <small class="fusion-reward-kicker">Evolution complete</small>
                <h2>Unlocked ${asset.name}</h2>
                <div class="fusion-reward-thumb-wrap">
                    <img src="${asset.framePath || asset.path}" alt="" />
                </div>
                <p>${this.labelForSlot(asset.slot)} · ${this.rarityTagHtml(asset.rarity || "common")}</p>
                <p>${asset.stats || "New trait unlocked."}</p>
                <small>${message}</small>
                <div class="fusion-reward-actions">
                    <button class="fusion-reward-equip" type="button">Equip Now</button>
                    <button class="fusion-reward-keep" type="button">Keep Current</button>
                </div>
            </div>
        `;

        const close = () => modal.remove();
        modal.addEventListener("click", event => {
            if (event.target === modal) close();
        });
        modal.querySelector(".fusion-reward-close")?.addEventListener("click", close);
        modal.querySelector(".fusion-reward-keep")?.addEventListener("click", close);
        modal.querySelector(".fusion-reward-equip")?.addEventListener("click", () => {
            this.save = loadSave();
            if (equipAsset(this.save, asset.id)) {
                saveGame(this.save);
                this.setNotice(asset.name + " equipped.");
                this.renderShop();
                this.renderInventory();
                this.renderLoadout();
                this.refreshStatsReadout();
                this.game.events.emit("octoglyphs:equip", asset.id);
                this.game.events.emit("octoglyphs:save-changed");
            }
            close();
        });

        document.body.appendChild(modal);
    }
}
