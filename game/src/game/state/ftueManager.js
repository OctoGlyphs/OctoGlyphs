/**
 * FTUE (First-Time User Experience) Manager
 * Shows contextual tutorial tooltips at key milestones.
 * Each milestone fires once, tracked in save.ftue.
 */

import { loadSave, saveGame } from "./saveStore.js";

const FTUE_STEPS = {
    welcome: {
        title: "Welcome to OctoGlyphs",
        body: "Your octopus feeds on your work. Every prompt you send generates Data Gems in the tank. Collect them to grow stronger.",
        anchor: "game-root",
        position: "center",
        delay: 800
    },
    firstGem: {
        title: "Data Gem!",
        body: "You collected your first gem! Gems are currency — spend them in the Shop to unlock new traits, or save up for rare evolutions.",
        anchor: "wallet-readout",
        position: "above",
        delay: 300
    },
    firstTrait: {
        title: "Rare Trait Found!",
        body: "Traits spawn during heavy work bursts. Your autopilot ignores them — you must manually guide your octo to collect rare drops before they despawn!",
        anchor: "game-root",
        position: "center",
        delay: 200
    },
    firstShopOpen: {
        title: "The Evolution Shop",
        body: "Browse discovered traits here. Buy them with Data Gems to add them to your collection. Each trait has stats that affect your octo's abilities.",
        anchor: "shop-panel",
        position: "left",
        delay: 100
    },
    firstBuy: {
        title: "Trait Unlocked!",
        body: "Nice! Purchased traits go straight to your loadout. Open Loadout to swap gear between slots and build your perfect octo.",
        anchor: "loadout-toggle",
        position: "below",
        delay: 300
    },
    firstLoadout: {
        title: "Build Your Octo",
        body: "Equip traits to change your stats. Body sets your identity, eyes affect perception, hats grant abilities, clothes boost survivability.",
        anchor: "loadout-panel",
        position: "left",
        delay: 100
    },
    firstHuntStart: {
        title: "Tank Hunt!",
        body: "Enemies incoming! Survive wave after wave. Your octo auto-fires at the nearest enemy. Collect XP to level up and choose mutations. Press SPACE for emergency ink burst.",
        anchor: "game-root",
        position: "center",
        delay: 500
    },
    firstHuntDeath: {
        title: "Welcome to the Loop",
        body: "Death fuels growth. Your hunt gems are banked. Spend them in the Shop, upgrade your loadout, then hunt again — stronger each time.",
        anchor: "wallet-readout",
        position: "above",
        delay: 800
    },
    firstEvolve: {
        title: "Trait Evolution",
        body: "Sacrifice 3 traits of the same rarity to create 1 trait of the next tier. Common → Uncommon → Rare → Legendary. Chase the rarest builds!",
        anchor: "evolve-panel",
        position: "left",
        delay: 100
    }
};

let activeTooltip = null;
let dismissTimer = null;

function createTooltipElement() {
    let el = document.getElementById("ftue-tooltip");
    if (el) return el;

    el = document.createElement("div");
    el.id = "ftue-tooltip";
    el.className = "ftue-tooltip";
    el.innerHTML = `
        <div class="ftue-tooltip-inner">
            <h3 class="ftue-title"></h3>
            <p class="ftue-body"></p>
            <button class="ftue-dismiss">Got it</button>
        </div>
    `;
    document.getElementById("panel-root").appendChild(el);

    el.querySelector(".ftue-dismiss").addEventListener("click", () => dismissTooltip());
    el.addEventListener("click", (e) => {
        if (e.target === el) dismissTooltip();
    });

    return el;
}

function positionTooltip(el, step) {
    const anchor = document.getElementById(step.anchor);
    el.className = "ftue-tooltip ftue-pos-" + step.position;

    if (step.position === "center" || !anchor) {
        el.style.top = "";
        el.style.left = "";
        el.style.right = "";
        el.style.bottom = "";
        return;
    }

    const rect = anchor.getBoundingClientRect();

    if (step.position === "above") {
        el.style.left = rect.left + "px";
        el.style.top = (rect.top - 10) + "px";
    } else if (step.position === "below") {
        el.style.left = rect.left + "px";
        el.style.top = (rect.bottom + 10) + "px";
    } else if (step.position === "left") {
        el.style.left = Math.max(10, rect.left - 320) + "px";
        el.style.top = rect.top + "px";
    }
}

function showTooltip(stepKey) {
    const step = FTUE_STEPS[stepKey];
    if (!step) return;

    const el = createTooltipElement();
    el.querySelector(".ftue-title").textContent = step.title;
    el.querySelector(".ftue-body").textContent = step.body;

    positionTooltip(el, step);
    el.classList.add("ftue-visible");
    activeTooltip = stepKey;

    // No auto-dismiss — user must tap "Got it"
}

function dismissTooltip() {
    const el = document.getElementById("ftue-tooltip");
    if (el) el.classList.remove("ftue-visible");
    clearTimeout(dismissTimer);
    activeTooltip = null;
}

/**
 * Trigger a FTUE milestone. Shows tooltip if not already completed.
 * @param {string} milestone - Key from FTUE_STEPS
 * @param {object} [liveSave] - Optional live save object to update in-place (prevents overwrite race)
 */
export function triggerFTUE(milestone, liveSave) {
    const save = liveSave || loadSave();
    if (!save.ftue) save.ftue = {};
    if (save.ftue[milestone]) return;
    if (save.ftue.allDone) return;

    // Mark as done
    save.ftue[milestone] = true;

    // Check if all milestones complete
    const keys = Object.keys(FTUE_STEPS);
    if (keys.every(k => save.ftue[k])) {
        save.ftue.allDone = true;
    }

    saveGame(save);

    const step = FTUE_STEPS[milestone];
    if (!step) return;

    // Dismiss any active tooltip first
    if (activeTooltip) dismissTooltip();

    // Show after delay
    setTimeout(() => showTooltip(milestone), step.delay);
}

/**
 * Check if a milestone has been completed
 */
export function isFTUEDone(milestone) {
    const save = loadSave();
    return save.ftue?.[milestone] === true;
}

/**
 * Reset all FTUE progress (for testing)
 */
export function resetFTUE() {
    const save = loadSave();
    save.ftue = {
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
    };
    saveGame(save);
}
