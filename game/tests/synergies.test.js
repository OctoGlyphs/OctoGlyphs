import assert from "node:assert/strict";
import { checkSynergies, aggregateSynergyHuntMods, aggregateSynergyStatMods, getActiveTraitInteractions, getEquippedHuntFlagCounts } from "../src/game/data/synergies.js";

{
    const { active, partial } = checkSynergies(["hat-pirate-hat", "clothes-pirate-outfit", "eyes-eye-patch"]);
    assert.equal(active.some(synergy => synergy.id === "pirate-king"), true);
    assert.equal(partial.some(entry => entry.synergy.id === "pirate-king"), false);
}

{
    const { active, partial } = checkSynergies(["body-acid", "eyes-evil", "clothes-mad-scientist"]);
    assert.equal(active.some(synergy => synergy.id === "scientist"), true);
    assert.equal(active.some(synergy => synergy.id === "theme-toxic"), true);

    const huntMods = aggregateSynergyHuntMods(active);
    const statMods = aggregateSynergyStatMods(active);
    assert.equal(huntMods.poison >= 2, true);
    assert.equal(huntMods.contagion >= 2, true);
    assert.equal(statMods.damage >= 0.10, true);

    assert.equal(partial.some(entry => entry.synergy.id === "theme-toxic"), false);
}

{
    const { active, partial } = checkSynergies(["body-grape", "eyes-sad"]);
    assert.equal(active.some(synergy => synergy.id === "theme-smart-shot"), false);
    const smartPartial = partial.find(entry => entry.synergy.id === "theme-smart-shot");
    assert.equal(Boolean(smartPartial), true);
    assert.equal(smartPartial.have, 2);
    assert.equal(smartPartial.need, 3);
}

{
    const { active } = checkSynergies(["body-bubblegum", "eyes-crazy-eyes", "hat-banana"]);
    assert.equal(active.some(synergy => synergy.id === "theme-chaos"), true);
    const huntMods = aggregateSynergyHuntMods(active);
    assert.equal(huntMods.bounce >= 1, true);
    assert.equal(huntMods.split >= 1, true);
    assert.equal(huntMods.wiggle >= 1, true);
}

{
    const counts = getEquippedHuntFlagCounts(["body-acid", "eyes-sad", "boost-bubble-gum"]);
    assert.equal(counts.poison >= 1, true);
    assert.equal(counts.homing >= 1, true);
    assert.equal(counts.bounce >= 1, true);
    const interactions = getActiveTraitInteractions(counts).map(interaction => interaction.id);
    assert.equal(interactions.includes("venom-lock"), true);
    assert.equal(interactions.includes("toxic-ricochet"), true);
}

console.log("synergies tests passed");
