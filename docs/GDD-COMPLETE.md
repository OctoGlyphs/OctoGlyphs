# Game Design Document: OctoGlyphs
### Complete GDD — Merged from Part 1 + Part 2
### Last Updated: 2026-05-07

---

## 1. Elevator Pitch
**OctoGlyphs** is a privacy-first, productivity-fueled Tamagotchi × Vampire Survivors × Agar.io hybrid designed as a side-panel plugin for OpenClaw. It is **two games in one**:

1. **The Ink Tank** — An idle Tamagotchi where your octopus grows by feeding on your daily LLM API usage. Collect gems, discover traits, build a loadout.
2. **Tank Hunt** — A Vampire Survivors / Binding of Isaac-style roguelike combat mode triggered inside the tank. Enemies swarm, bullets evolve with mutations, and your loadout determines your starting identity.

Eventually, a third mode — **The Open Ocean** — adds Agar.io-style async PvP where your creature deploys into a persistent multiplayer world.

The game gamifies "compute exhaust" (token counts and network events) into the growth and evolution of a digital pet, without ever reading prompt content.

---

## 2. Privacy Architecture: The "Blind Plugin" Rule
This game relies strictly on **metadata and compute exhaust**, never content.
* The plugin is cryptographically blind to user prompts, code, and LLM text responses.
* Growth is calculated explicitly by reading standard JSON API `usage` payloads (e.g., `prompt_tokens`, `completion_tokens`).
* Real-time events are driven by streaming network chunk arrivals, not by text parsing.
* Any AI behavioral traits (e.g., Aggressive vs. Cautious) are set by the player manually in the UI, ensuring zero cross-contamination of their work context.

---

## 3. The Core Loop (Start to Finish)

### 3.1 Phase 1: The Shop & Rebirth (Meta-Progression)
Death in the game is inevitable, but it fuels the core meta-progression loop.
* **Data Gems:** When a player's creature is consumed by another player or killed by enemies, its total accumulated mass is converted into a meta-currency called "Data Gems."
* **The Evolution Shop:** Before hatching a new egg, players spend Data Gems to unlock starting builds. This represents the **Nature** aspect of their creature.
* **Skin & Genetic Modifiers:** Players purchase "Octo Body" which act as Character Classes (similar to Vampire Survivors). Each skin comes with an invisible, unique starting mechanic or stat modifier (e.g., fire rate boosts, speed adjustments, armor, or mass magnets). Accessories can also be purchased with data gems, and they stack (only one of each type so no two hats for example as it will look messy) and provide additional layered buffs on top of their base genetics.
* **Loadout Lock-In:** The player selects one unlocked Octo Body/Genetic trait (and accessories if they have enough data gems) to apply to their starting octo. Once started, the base build is locked for that run. If an accessory is collected, show the user the ability to swap it out (for example if a hat is found and the octo's loadout already has a hat, show a swap hat screen showing the effects so the user can decide to swap it out or keep what they already have. A found accessory is not persistent, but can only be used on that run. Purchased octo bodies and accessories are persistent in the shop).

### 3.2 Phase 2: The Ink Tank (Incubation & Safe Zone)
Once the egg hatches, the creature starts in the **Ink Tank**, a private, safe-zone instance with no enemies and no other players (using the newbg PNG backgrounds).
* **Token Feeding:** As the user works, their API token drops data gems around the ink tank for the octo to find (with an arrow pointing to the closest gem so the user can always see where to go if manually controlling the octo. Otherwise the octo automatically swims gracefully around the ink tank and if it gets close to a gem, it is sucked in — but it has to be close), slowly increasing its scale/mass.
* **Tool-to-Mutation (Nurture):** If the LLM utilizes specific OpenClaw tools during the workday (e.g., writing files, executing code, searching the web), generate more data gems of different colors/values.
* **Zero-Guilt Idle:** The player can keep their creature in the Ink Tank for as long as they want, safely building up mass and mutations based strictly on their work habits.
* **Rare Trait Drops:** Occasionally during heavier work bursts, rare traits (hats, eyes, clothes) spawn in the tank. The autopilot deliberately ignores these. If the user wants the trait, they must manually guide the octo into it before it despawns. This creates light "glanceable" interaction without demanding constant attention.
* **Endless Toroidal Tank:** The tank wraps infinitely in all directions. The player can swim forever without hitting walls. Background tiles seamlessly and all game objects (gems, traits, enemies) wrap with the player.

### 3.3 Phase 2.5: Tank Hunt (VS/Isaac Roguelike Combat)
Tank Hunt is the **active gameplay mode** inside the Ink Tank. It turns the safe incubation space into a Vampire Survivors / Binding of Isaac-style survival arena.

* **Charge System:** Tank Hunt costs prompts to charge. The user must send ~5 prompts between hunts. This gates hunts as reward events tied to the core productivity loop rather than something the player spams.
* **Hunt Trigger:** When charged, the "Tank Hunt" button becomes active. Clicking it zooms the camera out to a wider combat view and begins spawning enemies.
* **Wave Progression:** Enemies spawn in discrete kill-gated waves. Each wave must be cleared before the next begins. Enemy count, speed, and HP scale per wave.
* **Boss Gate:** After all waves are cleared, a boss spawns. Killing the boss ends the hunt and drops a trait reward (discoverable accessory).
* **End Hunt:** Player can optionally end a hunt early via an 8-second countdown button. The hunt also ends automatically if the player is killed.
* **Gem Economy:** Normal enemies drop 1 gem each. Later waves drop higher-value gem colors occasionally. Boss drops a concentrated blue/yellow burst. This keeps gem collection meaningful without creating clutter.

#### 3.3.1 Archetype System
The player's loadout determines their **archetype**, which seeds their starting weapon behavior and weights which mutations are offered during the hunt. Five archetype families:

| Family | Identity | Seeded By | Starting Weapon Pattern |
|--------|----------|-----------|------------------------|
| **Abyss** | Poison, fear, darkness | Acid, Zombie, Midnight, dark bodies | Spiral venom shots |
| **Current** | Speed, flow, evasion | Aqua, Teal, Lime, speed bodies | Rear-guard backblast shots |
| **Shell** | Armor, defense, control | Metal, Charcoal, Dirt, Gray, Camo | Timed ink mines |
| **Prism** | Luck, economy, crits | Gold, Rainbow, Bubblegum, Pepe | Critical hit forks |
| **Inkstorm** | Damage, fire rate, pressure | Magma, Red, Orange, Fuchsia | Broadside burst shots |

Blue (starter) and unclassified bodies default to a neutral archetype with no starting weapon pattern.

#### 3.3.2 Hunt Mutations (Isaac-Style Pickups)
During a hunt, the player earns mutations on level-up. Mutations are temporary (lost after hunt ends) and stack with each other. They change **how bullets behave**, not just stats:

**Weapon Geometry Mutations:**
| Mutation | Family | Effect |
|----------|--------|--------|
| Broadside Bloom | Inkstorm | Adds side shots perpendicular to aim direction |
| Backblast | Current | Fires rear-guard shots behind the player |
| Ink Mines | Shell | Drops timed explosive mines at player position |
| Spiral Siphon | Abyss | Adds rotating venom shots orbiting outward |
| Prism Fork | Prism | Critical hits fork into rainbow shards |

**Bullet Path Modifiers (change bullet movement every frame):**
| Mutation | Family | Effect |
|----------|--------|--------|
| Wiggle Worm | Tide | Bullets sine-wave side to side as they travel |
| Boomerang Ink | Current | Bullets curve back toward player after 35% lifetime |
| Lump of Coal | Inkstorm | Bullets accelerate, grow larger, deal more damage over distance |
| Spectral Ink | Abyss | Bullets ignore walls, never wrap, triple lifetime |

**On-Hit Effect Mutations:**
| Mutation | Family | Effect |
|----------|--------|--------|
| Chain Lightning | Prism | Kill spawns a new bullet aimed at nearest surviving enemy |
| Fear Shot | Abyss | Hit enemies turn purple and flee at 1.6x speed |
| Frost Ink | Shell | Hit enemies slow to 40-80% speed, tint blue |
| Contagion | Abyss | Poison spreads to nearby enemies on kill |
| Gem Pulse | Prism | Kills emit a gem magnet pulse |

**Stat Mutations (classic VS-style):**
Pierce, split, bounce, homing, poison, orbit, fire rate, damage, projectile count, projectile size, bullet speed, magnet range, swim speed, armor, and more.

All mutations have distinct tint colors so the player can visually see their build. Modifiers stack — homing + wiggle creates seeking sine-wave bullets, pierce + freeze creates a slow-field shotgun, boomerang + split creates returning shrapnel arcs.

#### 3.3.2.1 Current Trait Interaction Model
The implementation now uses three layers of loadout interaction:

1. **Exact outfit synergies** — named three-item recipes such as Pirate King, Full Metal, Tech Lord, Mad Science, Crypto Whale, Fortune Teller, and Shadow Assassin.
2. **Emergent theme synergies** — stacked hunt flags activate broad run identities such as Venom Brewer, Smart Shot, Reef Fortress, Gem Resonance, Ghost Current, Chaos Ink, and Broadside Battery.
3. **Pairwise/triple trait interactions** — individual flags collide to mutate bullet rules, so two loadouts in the same theme can still feel different.

Current pairwise/triple interactions:

| Interaction | Required Flags | Gameplay Effect |
|-------------|----------------|-----------------|
| Toxic Ricochet | Poison + Bounce | Poison shots leave venom puddles on bounce |
| Venom Lock-On | Poison + Homing | Guided shots prefer poisoned targets |
| Spore Split | Poison + Split | Toxic hits spawn smaller poison spores |
| Plague Chain | Poison + Contagion | Poison kills spread wider and harder |
| Frost Lance | Freeze + Pierce | Piercing frost bullets leave slowing wake pulses |
| Ice Ring | Freeze + Orbit | Orbiters chill enemies they touch |
| Haunted Return | Fear + Boomerang | Returning ghost shots pressure fleeing enemies |
| Smart Chain | Homing + Chain | Chain jumps hit more targets with better damage retention |
| Seeker Prism | Homing + Prism Fork | Prism fork shards gain independent seeking |
| Coal Cannon | Broadside + Lump of Coal | Side-cannon builds scale damage with distance |
| Mine Broadside | Broadside + Ink Mines | Broadside bullets can drop delayed mines |
| Golden Prism | Gem Pulse + Prism Fork | Gem pickups can fire golden seeker shards |
| Collector Beam | Gem Pulse + Magnet Range | Bullets vacuum rewards while traveling |
| Chaos Shrapnel | Bounce + Split + Wiggle | Wild bouncing split shots pulse as shrapnel |
| Spectral Chain | Spectral + Chain | Chain shots phase through crowds |
| Black Ice | Freeze + Fear | Frozen enemies panic as control effects overlap |

Starting loadouts also set a dominant baseline weapon identity before full theme synergy activates. This prevents weak two-item builds from feeling identical to the default octo.

#### 3.3.3 Enemy Behavior Roles
Enemies are not all the same "chase the player in a straight line" behavior:

| Enemy Type | Behavior | Visual Identity |
|------------|----------|-----------------|
| Jelly | Drift and wobble toward player, unpredictable paths | Floaty, lateral sway |
| Fish | Charge bursts — pause, then lunge forward | Sudden fast movement |
| Eel | Flank and orbit — circle around player instead of beelining | Appear at sides |
| Boss | Slow approach with sway movement, high HP | Large, deliberate |

This ensures even the same wave count feels different based on which enemy types spawn.

### 3.4 Phase 3: The Open Ocean (Deployment & Async PvP)
When the player feels their creature is adequately prepared, they click "Hunt" in the Open Ocean (Agar.io-style multiplayer mode with PvP, deep PNG backgrounds).
* **The Transition:** The game connects to a lightweight multiplayer server. The player's creature is now in a persistent, asynchronous PvP environment populated by autonomous enemy NPCs and the "ghosts" of other OpenClaw users' creatures (until live true multiplayer is ready).
* **Zero-Cost Autopilot:** The creature uses a lightweight, local JS game AI to swim, hunt smaller entities, and auto-fire its weapons. Killing something (boss, enemy, or other player) emits gems so the octo can consume them to grow like in Spore cell stage / Agar.io. The bigger the enemy, the more gems or different color gems of different value are emitted. It costs zero API tokens to run in the background.
* **The 3-Tier Spore System:** The player's entry tier depends entirely on the mass they built in the Ink Tank. The game recycles assets via an infinite camera-scaling mechanic:
  * **Tier 1 (Micro-scale / Shallows):** Early deploy. Camera zoomed in. Standard enemies appear tiny (plankton) and must be hunted while dodging larger threats. Bright blue, caustic light rays background.
  * **Tier 2 (Predator Reef):** Mid/Late deploy. Normal scale. Immediate threat. Giant bosses roam. Teal, coral silhouettes in parallax background.
  * **Tier 3 (The Abyss):** Late deploy. Camera zooms out. Former Tier 2 bosses now appear standard-sized. PvP threats dominate. Near-black, bioluminescent particles.

### 3.5 Phase 4: Frenzy Mode & Manual Assistance
While the Open Ocean operates autonomously, the game becomes highly interactive during the player's wait times.
* **Interactive Loading Screen (Frenzy):** When the player sends a heavy prompt and waits for the LLM's response, the plugin reads the streaming network packets and triggers "Frenzy Mode." Gem drop rates spike, and the creature rapid-fires its weapons. All bullets gain a bright white-hot tint and +25% speed.
* **Manual Takeover:** While waiting, the player can move their mouse over the game canvas, instantly disabling autopilot. The creature follows the cursor, allowing manual dodging or hunting.
* **Seamless Handoff:** The moment the mouse leaves the canvas, the local AI seamlessly resumes autopilot control.

---

## 4. Technical Stack
* **Frontend:** HTML5 and Phaser.js. Runs entirely within the OpenClaw side-panel for instant loading (no heavy WebAssembly initialization). Handles all 2D sprite rendering, scaling, auto-fire logic, and local storage state.
* **Backend:** A lightweight Node.js server responsible only for tracking X/Y coordinates, stats, and mass of deployed players in the Open Ocean, as well as banking Data Gems upon permadeath.
* **Protocol:** WebSocket (Socket.IO) for real-time bidirectional communication.
* **Database:** Simple key-value store (Redis or SQLite) for persistent account data (Data Gem wallet, unlocked skins, lifetime stats).

### 4.1 Server Instance Sizing
* **Target:** ~50 concurrent players per ocean instance
* **Scaling:** If player count exceeds 50, spin up a new instance. Players joining see a server list or are auto-assigned to the least-populated instance.
* **NPC Fill:** If fewer than 10 players are online in an instance, the server spawns additional NPC enemies to keep the ocean alive.

### 4.2 Tick Rate & Networking
* **Server Tick:** 15 ticks per second (66ms per tick). Sufficient for a casual shooter.
* **Client Heartbeat:** 66ms (matching server tick rate — no wasted bandwidth).
* **Client Interpolation:** Phaser client interpolates between received positions for smooth rendering at 60fps.
* **Visibility Culling:** The server calculates which entities fall within a player's viewport per tick and sends only those positions.

### 4.3 Heartbeat & Disconnect
* **Timeout:** If no heartbeat received for 5000ms, client is considered disconnected.
* **On Disconnect: Autopilot Persists.** Server switches to server-side autopilot AI. The octopus continues to wander, hunt NPCs, and can still be killed. Core to the async PvP vision — your octopus lives 24/7.
* **On Reconnect:** Server hands control back immediately. Octopus is wherever autopilot left it.

---

## 5. Permadeath Scope — What Dies vs What Lives

Death is the engine of progression, not a punishment.

### 5.1 Lost on Death (Run State)
- **Current mass** — converted to Data Gems based on total accumulated size
- **Found accessories** — any mid-run trait pickups (hats, eyes, clothes found in the ocean) are destroyed
- **Nurture mutations** — tool-driven stat boosts earned during this run's Ink Tank phase reset
- **Ocean position & tier** — player returns to the Shop/Egg screen

### 5.2 Kept Forever (Account State)
- **Data Gem wallet** — all colors, all time. Never lost
- **Shop-purchased Octo Bodies** — permanently unlocked character classes
- **Shop-purchased Accessories** — permanently unlocked hats, eyes, clothes, boosts
- **Legendary & Halloween skins** — once earned/unlocked, permanent
- **Lifetime stats** — total tokens consumed, largest mass achieved, kills, deaths, time survived
- **Shop inventory** — grows over time as the user plays more

### 5.3 Design Intent
The player should never feel like death erased their progress. Death converts volatile run-mass into permanent wealth. The longer you survive, the richer you die. This creates a "one more run" loop where the player always comes back with a better starting loadout.

---

## 6. Combat Model

### 6.1 Projectile-Based Combat (Not Touch-Eating)
All combat is **projectile-based**. No entity eats another by touching. Players shoot, NPCs shoot, and everything dies by taking enough projectile damage.

- **Shoot enemy → enemy dies → drops gems → collect gems → grow**
- **Shoot player → player dies (permadeath) → drops gems → collect gems → grow**
- **Work in OpenClaw → tokens generate gems in Ink Tank → collect gems → grow**

### 6.2 Mass as HP
Mass doubles as the player's health pool. Every hit from a projectile reduces mass. When mass hits zero, the player dies.
- **Bigger players can absorb more shots** — harder to kill
- **But bigger players are also bigger targets** — easier to hit
- **A small, well-built octopus with high fire rate and damage can absolutely kill a larger, slower one** — skill and build matter, not just size

### 6.3 Gem Scramble on Death
When any entity dies (NPC or player), it explodes into gems proportional to its mass. These gems are free for anyone to collect:
- Two players fighting. Player A kills Player B. Player B explodes into gems.
- Player C, hiding nearby, rushes in and steals half the gems before Player A can collect them.
- This rewards positioning and awareness, not just raw combat power.
- **Third-partying is a valid strategy** — lurking near fights and stealing spoils.

### 6.4 Equal-Mass Stalemate
If two players have equal mass and exchange fire, the fight is determined by:
- Skin stat modifiers (fire rate, damage, armor)
- Equipped accessories
- Manual aim/dodging skill (if player has taken over from autopilot)

---

## 7. World Structure

### 7.1 The Wrapping Ocean
The Open Ocean is a wrapping toroidal map (no walls, no edges — swim off the right side, appear on the left). Map size: **5000x5000 logical units**.

### 7.2 Depth Layers (Hard Separation)
The 3-tier scaling system uses 3 isolated depth layers occupying the same X/Y coordinate space but completely separated for combat, visibility, and interaction:

| Layer | Name | Mass Range | Background | NPC Density |
|-------|------|-----------|------------|-------------|
| 1 | Shallows | 0 – 5,000 | Bright blue, caustic light rays | High (plankton-scale) |
| 2 | The Reef | 5,001 – 50,000 | Teal, coral silhouettes in parallax | Medium (standard enemies) |
| 3 | The Abyss | 50,001+ | Near-black, bioluminescent particles | Low (boss-scale + players) |

### 7.3 Atmospheric Hints (No Live Data)
Other layers are implied through static visual and audio cues only:
- **Tier 1:** Faint, blurry large shapes drift in the deep background (pre-drawn parallax, not real players).
- **Tier 2:** Tiny particle dots float in the foreground (suggesting micro-world below). Occasional dark shadow passes across the screen bottom (suggesting the Abyss).
- **Tier 3:** Empty. Bioluminescent particles only. Loneliness IS the atmosphere.

### 7.4 Cross-Layer Awareness
Players learn about other layers through:
- The live leaderboard (shows top 10 across ALL layers with their mass).
- Death notifications broadcast to the victim's layer: "⚡ CoralHunter was devoured in the Abyss."
- The Death Report screen shows the killer's layer, skin, and mass.

### 7.5 Tier Transition
When a player's mass crosses a tier threshold:
- 3-second transition window. Player's sprite shimmers/flashes.
- During these 3 seconds: **invulnerability** — cannot shoot or be shot.
- Camera performs Spore-style zoom-out. Background and audio crossfade.
- After 3 seconds: materializes in new layer at same X/Y, fully vulnerable.
- If mass drops below threshold, same 3-second reverse transition occurs.
- **Anti-Camping:** Transitioning player is invulnerable, removing incentive to camp tier boundaries.

### 7.6 Layer Rules
- Players can only see, shoot, and be shot by entities in their own layer.
- No ghost sprites, no shadow overlays, no cross-layer rendering. Each layer is visually clean.
- NPCs are layer-locked. Tier 1 plankton never appears in Tier 3.

---

## 8. Mass Economy & Balance

### 8.1 Mass-to-Radius Formula
Adopted from proven Agar.io math:
```
radius = 4 + Math.sqrt(mass) * 6
```
Non-linear curve:
- 10 → 100 mass is visually dramatic (radius: 23 → 64)
- 10,000 → 10,100 mass is nearly invisible (radius: 604 → 607)
- Naturally creates the "Spore zoom" feeling at higher tiers

### 8.2 Passive Mass Decay
Large players passively lose mass to prevent permanent dominance:
- **Threshold:** Decay only activates above 5,000 mass
- **Rate:** 0.5% of current mass per minute
- **Purpose:** AFK players slowly shrink, giving smaller hunters a chance. Creates urgency.

### 8.3 Ecosystem Mass Balancing
The server maintains a target `totalMass` for the ecosystem (e.g., 100,000):
```
currentTotal = sum(allPlayerMass) + sum(allNPCMass) + sum(allLooseGemMass)
if (currentTotal < targetMass) spawnMoreNPCs()
if (currentTotal > targetMass) reduceNPCSpawnRate()
```
Self-regulating: always something to hunt, even at 3am. Prevents mass inflation with many players.

### 8.4 Death Gem Conversion (Zero-Sum Model)
When a player dies, total value never exceeds 100% of the mass that existed:
```
floorGems  = currentMass * floorPercent    // collectible ocean gems
bankedGems = currentMass * bankPercent     // instantly banked to account as Data Gems
```

**Scaling split by run duration (rewards long survival):**

| Run Duration | Floor Gems | Banked Gems |
|-------------|------------|-------------|
| 0–5 min | 80% | 20% |
| 5–15 min | 70% | 30% |
| 15–30 min | 60% | 40% |
| 30+ min | 50% | 50% |

Short runs benefit other players (80% floor). Long runs benefit the dead player (50% banked).

### 8.5 PvP Kill Bonus
The killer gets a **10% bonus** on top of collected floor gems. This is the only inflationary source in the game — the incentive for hunting over farming NPCs.

---

## 9. Complete Asset Stat Table

### 9.1 Design Philosophy: Isaac/VS Stacking
Stats stack additively unless noted. Every equippable item modifies one or more of these **7 core stats**:

| Stat | Abbreviation | Base Value | Description |
|------|-------------|------------|-------------|
| Speed | SPD | 1.0x | Movement speed multiplier |
| Fire Rate | FIR | 1.0x | Shots per second multiplier |
| Damage | DMG | 1.0x | Projectile damage multiplier |
| Armor | ARM | 0 | Flat damage reduction before HP loss |
| Magnet | MAG | 1.0x | Gem attraction radius multiplier |
| Luck | LCK | 1.0x | Rare drop chance & crit multiplier |
| Mass Retention | RET | 1.0x | % of mass kept on hit (anti-shrink) |

A fully stacked example: Blue body (+0 everything) + Astro Suit (+0.2 SPD) + Alien Antenna (+0.15 MAG, +0.1 FIR) + Katana boost (+0.2 DMG) = SPD 1.2x, FIR 1.1x, DMG 1.2x, MAG 1.15x.

### 9.2 Bodies (30 Normal + 4 Halloween + 10 Legendary)

Each body is a **permanent unlock** purchased with Data Gems. Only one body per run.

#### Normal Bodies (Modular — can equip accessories)

| Body | Rarity | Cost | Primary Stat | Secondary Stat | Passive |
|------|--------|------|-------------|----------------|---------|
| Blue | Starter | Free | — | — | Balanced. No modifiers. The training wheels |
| Red | Common | 50 | +0.15 DMG | -0.05 SPD | — |
| Green | Common | 50 | +0.1 RET | +0.05 ARM | Slow passive regen (1% mass/30s) |
| Yellow | Common | 50 | +0.15 MAG | — | Gems worth 10% more |
| Orange | Common | 50 | +0.1 SPD | +0.05 FIR | — |
| White | Common | 75 | +0.1 ARM | +0.05 RET | — |
| Gray | Common | 75 | +0.1 ARM | +0.1 RET | -0.05 SPD |
| Lime | Common | 75 | +0.1 SPD | +0.1 LCK | — |
| Fuchsia | Common | 75 | +0.15 FIR | -0.05 ARM | — |
| Acid | Uncommon | 100 | +0.15 DMG | +0.1 FIR | Toxic bullets: projectiles poison on hit (2% mass drain/2s) |
| Charcoal | Uncommon | 100 | +0.15 ARM | +0.1 RET | Stealth: enemies detect you 20% later |
| Teal | Uncommon | 100 | +0.1 SPD | +0.1 MAG | — |
| Tan | Uncommon | 100 | +0.1 RET | +0.1 LCK | — |
| Aqua | Uncommon | 100 | +0.1 MAG | +0.1 FIR | — |
| Bubblegum | Uncommon | 125 | +0.15 LCK | +0.05 MAG | Crit hits pop gems from enemies |
| Grape | Uncommon | 125 | +0.15 FIR | +0.05 DMG | — |
| Creamsicle | Uncommon | 125 | +0.1 SPD | +0.1 DMG | — |
| Metal | Rare | 200 | +0.2 ARM | +0.1 RET | -0.1 SPD. Tank class |
| Gold | Rare | 200 | +0.2 MAG | +0.1 LCK | All gems worth 25% more |
| Pepe | Rare | 200 | +0.15 LCK | +0.15 LCK | Double rare drop chance. Meme magic |
| Sushi | Rare | 200 | +0.15 RET | +0.1 SPD | Eating enemies heals 5% mass |
| Cottoncandy | Rare | 250 | +0.15 MAG | +0.1 FIR | +0.05 LCK |
| Dirt | Rare | 250 | +0.2 RET | +0.1 ARM | Camouflage: 15% dodge chance |
| Camo | Epic | 400 | +0.2 ARM | +0.15 RET | Stealth: enemies detect you 35% later |
| Cardbon | Epic | 400 | +0.2 ARM | +0.15 DMG | Projectiles pierce 1 extra enemy |
| Midnight | Epic | 400 | +0.2 SPD | +0.15 FIR | Night vision: see enemies 30% further |
| Magma | Epic | 500 | +0.25 DMG | +0.1 FIR | Contact damage aura (burns nearby enemies) |
| Rainbow | Epic | 500 | +0.1 ALL | — | Jack of all trades. +0.1 to every stat |
| Octopi | Epic | 500 | +0.2 FIR | +0.15 DMG | Double-shot: fires 2 projectiles per burst |
| Deathbot | Legendary | 1000 | +0.25 DMG | +0.2 FIR | Homing projectiles. -0.15 SPD |
| Zombie | Legendary | 1000 | +0.3 RET | +0.2 ARM | Revive once per run at 50% mass. -0.2 SPD |

> **Implementation Note (2026-04-26):** In the current build, each normal body has been balanced to a distinct stat profile grouped by archetype family. The GDD table above represents the *design target*. The actual implemented values live in `assetCatalog.js` and were tuned during the body identity balance pass. Key groupings:
> - **Inkstorm** (damage): Magma, Red, Orange, Creamsicle, Deathbot, Fuchsia
> - **Current** (speed): Aqua, Teal, Lime
> - **Shell** (armor): Metal, Charcoal, Dirt, Gray, Camo, Sushi, Zombie
> - **Prism** (luck/economy): Gold, Rainbow, Bubblegum, Pepe, White
> - **Abyss** (poison/dark): Acid, Midnight, Zombie
> - Blue remains the neutral starter with no stat modifiers.

#### Halloween Bodies (Locked Skins — NO accessories allowed)
Prestige unlocks with powerful unique passives. Cannot be customized.

| Body | Rarity | Cost | Stats | Unique Passive |
|------|--------|------|-------|---------------|
| Holloween1 (Pumpkin) | Legendary | 800 | +0.2 DMG, +0.15 FIR | **Trick or Treat**: killed enemies drop double gems OR a bomb (50/50) |
| Holloween2 (Ghost) | Legendary | 800 | +0.25 SPD, +0.15 RET | **Phase Walk**: can pass through enemies briefly (2s cooldown) |
| Holloween3 (Vampire) | Legendary | 800 | +0.2 DMG, +0.1 ARM | **Lifesteal**: 15% of damage dealt is converted to mass |
| Holloween4 (Skeleton) | Legendary | 800 | +0.2 FIR, +0.2 LCK | **Bone Barrage**: fires in 4 directions simultaneously. -0.1 DMG per shot |

#### Legendary Bodies (Locked Skins — NO accessories allowed)
Numbered 1-10. The ultimate unlocks. Expensive, powerful, unique playstyles.

| Body | Rarity | Cost | Stats | Unique Passive |
|------|--------|------|-------|---------------|
| Legendary 1 | Mythic | 2000 | +0.3 SPD, +0.2 FIR | **Blitz**: speed increases by 1% per kill (caps at +50%) |
| Legendary 2 | Mythic | 2000 | +0.3 DMG, +0.2 ARM | **Juggernaut**: immune to knockback. Contact damage x2 |
| Legendary 3 | Mythic | 2000 | +0.3 MAG, +0.3 LCK | **Black Hole**: gems fly to you from entire screen |
| Legendary 4 | Mythic | 2000 | +0.3 FIR, +0.2 DMG | **Chain Lightning**: hits bounce to 2 nearby enemies |
| Legendary 5 | Mythic | 2000 | +0.3 RET, +0.3 ARM | **Fortress**: cannot lose mass. Slow. +0.5 ARM, -0.3 SPD |
| Legendary 6 | Mythic | 2500 | +0.25 ALL | **Evolve**: gain +0.02 to all stats per minute survived |
| Legendary 7 | Mythic | 2500 | +0.3 SPD, +0.3 DMG | **Glass Cannon**: 3x damage, 3x damage taken |
| Legendary 8 | Mythic | 2500 | +0.3 LCK, +0.2 FIR | **Jackpot**: 5% chance any kill drops a shop accessory |
| Legendary 9 | Mythic | 3000 | +0.3 FIR, +0.3 SPD | **Bullet Hell**: fires 8 projectiles in a ring. -0.2 DMG each |
| Legendary 10 | Mythic | 5000 | +0.2 ALL | **OctoGlyphs**: starts at Tier 2. Mass x2. The endgame body |

### 9.3 Eyes (28 types)
Eyes are cosmetic-primary with a **small** stat nudge. Cheap, collectible.

| Eye | Cost | Stat Modifier |
|-----|------|--------------|
| Regular | Free | — |
| Angry | 25 | +0.05 DMG |
| Sad | 25 | +0.05 ARM |
| Worried | 25 | +0.05 RET |
| Shy | 25 | +0.05 SPD |
| Cute | 30 | +0.05 MAG |
| Wide eyes | 30 | +0.05 MAG |
| Squint | 30 | +0.05 DMG |
| Evil | 30 | +0.05 DMG, +0.02 FIR |
| X | 35 | +0.08 DMG when below 30% mass (berserker) |
| Sleeping | 35 | +0.05 RET |
| Hmm | 35 | +0.05 LCK |
| Crazy eyes | 40 | +0.05 FIR, +0.03 LCK |
| Durr eyes | 40 | +0.08 LCK (dumb luck) |
| Cyclops | 50 | +0.08 DMG, -0.03 FIR |
| 4 eyes | 50 | +0.05 FIR, +0.05 MAG |
| Tri eyes | 50 | +0.03 FIR, +0.03 DMG, +0.03 LCK |
| All seeing | 60 | +0.08 MAG, +0.05 LCK (mystic sight) |
| Boingg | 40 | +0.05 SPD (spring-loaded) |
| Scar | 45 | +0.05 ARM, +0.03 DMG (battle-hardened) |
| Eye patch | 50 | +0.08 DMG, -0.03 MAG (pirate focus) |
| Cool shades | 50 | +0.05 LCK, +0.03 SPD |
| Monocle | 60 | +0.08 LCK, +0.03 MAG (refined taste) |
| Smart | 60 | +0.05 FIR, +0.05 MAG |
| 3d glasses | 60 | +0.05 SPD, +0.05 FIR |
| Nouns glasses | 75 | +0.05 ALL (web3 flex — tiny everything boost) |
| Spy glass | 75 | +0.08 MAG, +0.05 FIR |
| Vr goggles | 100 | +0.08 FIR, +0.05 SPD, +0.03 LCK |
| White shades | 75 | +0.05 ARM, +0.05 LCK |

### 9.4 Hats (85 types)
Hats are the largest accessory category. **Moderate** stat boosts, primary source of build diversity.

#### Speed Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Backwards hat | 40 | +0.08 SPD |
| Red cap | 40 | +0.08 SPD |
| Propeller hat | 60 | +0.12 SPD |
| Visor | 50 | +0.1 SPD |
| Trucker cap | 50 | +0.08 SPD, +0.03 ARM |
| Sailor cap | 60 | +0.1 SPD, +0.05 ARM |
| Straw hat | 50 | +0.1 SPD, +0.03 LCK |
| Snorkle Goggles | 75 | +0.12 SPD, +0.05 MAG |
| Space helmet | 150 | +0.15 SPD, +0.1 ARM |

#### Fire Rate Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Alien antenna | 60 | +0.1 FIR, +0.05 MAG |
| Circuit board crown | 80 | +0.12 FIR, +0.05 DMG |
| Satellite dish | 80 | +0.12 FIR, +0.08 MAG |
| Digital keys | 75 | +0.1 FIR, +0.05 LCK |
| Node crown | 80 | +0.12 FIR, +0.05 FIR (network overclocking) |
| Blue lazer eyes | 70 | +0.1 FIR, +0.05 DMG |
| Red lazer eyes | 70 | +0.1 FIR, +0.05 DMG |
| Night vision goggles | 75 | +0.1 FIR, +0.08 MAG |
| Headphones | 60 | +0.1 FIR, +0.03 SPD |

#### Damage Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Devil horns | 60 | +0.1 DMG, +0.05 FIR |
| Arrow hat | 50 | +0.1 DMG |
| Mohawk | 50 | +0.1 DMG |
| Mohawk thin | 50 | +0.08 DMG, +0.03 SPD |
| Spike hair | 50 | +0.1 DMG, +0.03 ARM |
| Bonk | 40 | +0.08 DMG (bonk!) |
| Military helmet | 80 | +0.1 DMG, +0.1 ARM |
| Plunger head | 35 | +0.05 DMG, +0.05 LCK (it's a plunger) |

#### Luck Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Crown | 80 | +0.12 LCK, +0.05 MAG |
| Binary tiara | 75 | +0.1 LCK, +0.08 MAG |
| Crypto crown | 100 | +0.15 LCK, +0.05 MAG |
| Crypto helmet | 100 | +0.12 LCK, +0.08 ARM |
| Party hat | 50 | +0.1 LCK |
| Clown hair | 50 | +0.1 LCK, +0.03 SPD |
| Halo | 75 | +0.1 LCK, +0.05 RET |
| Star wizard hat | 80 | +0.12 LCK, +0.05 FIR |
| Wizard hat | 75 | +0.1 LCK, +0.05 FIR |
| Fez | 60 | +0.1 LCK |
| Robin hood | 60 | +0.08 LCK, +0.05 SPD |
| Red D mushroom | 75 | +0.12 LCK, +0.03 SPD (power-up!) |
| White V mushroom | 75 | +0.1 LCK, +0.05 RET |
| Yellow E mushroom | 75 | +0.1 LCK, +0.05 MAG |

#### Armor/Defense Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Scuba helmet | 100 | +0.15 ARM, +0.1 RET |
| Black Miner hard hat | 60 | +0.1 ARM, +0.03 DMG |
| Orange Miner hard hat | 60 | +0.1 ARM, +0.05 MAG |
| Red Miner hard hat | 60 | +0.1 ARM, +0.03 FIR |
| Police hat | 60 | +0.1 ARM, +0.05 SPD |
| Box head | 50 | +0.12 ARM, -0.05 SPD |
| Bandit mask | 40 | +0.05 ARM, +0.05 SPD |
| Fish bowl | 80 | +0.12 ARM, +0.05 RET |

#### Magnet Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Digital top hat | 80 | +0.12 MAG, +0.05 LCK |
| Memepool top hat | 80 | +0.12 MAG, +0.05 LCK |
| Top hat | 60 | +0.1 MAG |
| Nerd glasses | 70 | +0.1 MAG, +0.05 FIR |
| Cup head | 60 | +0.1 MAG, +0.03 LCK |
| Encryption hair | 90 | +0.12 MAG, +0.08 FIR |

#### Cosmetic/Balanced Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Fedora | 50 | +0.05 LCK, +0.05 SPD |
| Cowboy hat | 60 | +0.05 DMG, +0.05 LCK |
| Pirate hat | 75 | +0.08 LCK, +0.08 DMG |
| Chef hat | 50 | +0.05 RET, +0.05 MAG |
| Admral hat | 60 | +0.05 ARM, +0.05 DMG, +0.03 SPD |
| Press hat | 50 | +0.05 SPD, +0.05 MAG |
| Ribbon | 30 | +0.03 LCK, +0.03 MAG |
| Bunny ears | 50 | +0.08 SPD, +0.03 LCK |
| Cat ears | 50 | +0.05 SPD, +0.05 LCK |
| Frog hat | 50 | +0.05 SPD, +0.05 RET |
| Sashimi hat | 50 | +0.05 RET, +0.05 LCK |
| Pizza hat | 50 | +0.05 RET, +0.05 MAG |
| Beer cap | 40 | +0.05 ARM, +0.05 LCK, -0.03 SPD |
| Powder wig | 60 | +0.08 MAG, +0.05 LCK |
| Banana | 40 | +0.05 SPD, +0.05 LCK |
| Blond anime hair | 60 | +0.05 SPD, +0.05 FIR, +0.03 DMG |
| White anime hair | 60 | +0.05 FIR, +0.05 ARM, +0.03 LCK |

#### Bandana/Beanie Hats (Utility)
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Black bandana | 35 | +0.05 ARM, +0.03 SPD |
| Blue Bandana | 35 | +0.05 MAG, +0.03 SPD |
| Purple Bandana | 35 | +0.05 LCK, +0.03 SPD |
| Red Bandana | 35 | +0.05 DMG, +0.03 SPD |
| Orange beanie | 40 | +0.05 ARM, +0.05 RET |
| Yellow beanie | 40 | +0.05 MAG, +0.05 RET |
| purple beanie | 40 | +0.05 LCK, +0.05 RET |

#### Hair Hats (Style + Stats)
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Frumpy hair | 40 | +0.05 RET, +0.03 ARM |
| Messy hair | 40 | +0.05 LCK, +0.03 FIR |
| Pink hair | 50 | +0.05 SPD, +0.05 MAG |
| Red crazy hair | 50 | +0.08 FIR, +0.03 DMG |
| Pigtails | 40 | +0.05 SPD, +0.03 MAG |
| Puffy hair | 50 | +0.05 ARM, +0.05 MAG |
| Straight hair | 40 | +0.05 MAG, +0.03 LCK |
| Stringy hair | 30 | +0.03 RET, +0.03 LCK |
| Wild hair | 50 | +0.05 FIR, +0.05 DMG |

#### Bucket Hats
| Hat | Cost | Stat Modifier |
|-----|------|--------------|
| Black bucket hat | 40 | +0.05 ARM, +0.05 RET |
| Brown bucket hat | 40 | +0.05 RET, +0.05 LCK |
| White bucket hat | 40 | +0.05 MAG, +0.05 ARM |

### 9.5 Clothes (14 types)
Clothes provide **significant** stat boosts — bigger than hats, defining the build's secondary identity. One outfit per loadout.

| Clothes | Cost | Primary Stat | Secondary Stat | Passive |
|---------|------|-------------|----------------|---------|
| Astro Suit | 150 | +0.2 SPD | +0.1 ARM | — |
| Hazmat outfit | 150 | +0.2 ARM | +0.1 RET | Immune to poison/toxic damage |
| Chef jacket | 75 | +0.1 RET | +0.08 MAG | Eating gems heals 5% more mass |
| Pirate outfit | 100 | +0.15 DMG | +0.1 LCK | +15% gem drops from kills |
| Mage robe | 125 | +0.15 FIR | +0.1 LCK | Projectiles have 10% chance to split |
| Mad scientist | 125 | +0.15 FIR | +0.1 DMG | Projectile size +20% |
| Trench coat | 100 | +0.12 ARM | +0.1 SPD | Stealth: enemies detect you 15% later |
| Jail outfit | 75 | +0.1 ARM | +0.1 SPD | +10% speed when below 50% mass |
| Dark hoody | 75 | +0.1 ARM | +0.08 SPD | — |
| Green hoody | 75 | +0.1 RET | +0.08 SPD | — |
| Rain coat | 75 | +0.1 RET | +0.08 ARM | — |
| Poncho | 75 | +0.1 SPD | +0.08 RET | — |
| Black kimono | 100 | +0.12 DMG | +0.1 FIR | Melee range damage x1.5 |
| White kimono | 100 | +0.1 ARM | +0.1 RET | +0.05 MAG |

### 9.6 Boosts (23 types)
Boosts are **held items** — weapons, accessories, and flavor items providing the final stat layer. One boost per loadout. Can affect projectile behavior.

#### Weapons (Modify projectile behavior)
| Boost | Cost | Stat Modifier | Special |
|-------|------|--------------|---------|
| Katana | 150 | +0.2 DMG, +0.05 SPD | Melee slash: short range, wide arc |
| Sword | 125 | +0.15 DMG, +0.08 ARM | — |
| Trident | 200 | +0.2 DMG, +0.1 FIR | Projectile pierces 2 enemies |
| Nunchucks | 125 | +0.15 FIR, +0.1 SPD | Double-hit: each projectile hits twice |
| Hook | 100 | +0.12 DMG, +0.08 MAG | Pulls gems toward you on kill |

#### Consumable Held Items (Passive buffs)
| Boost | Cost | Stat Modifier | Special |
|-------|------|--------------|---------|
| Coffee | 75 | +0.15 SPD, +0.05 FIR | — |
| Juice box | 60 | +0.1 SPD, +0.05 RET | — |
| Ink drink | 75 | +0.1 FIR, +0.08 DMG | Projectile size +10% |
| Martini | 80 | +0.1 LCK, +0.08 SPD | -0.03 ARM (slightly reckless) |
| Burger | 60 | +0.1 RET, +0.05 ARM | — |
| Pizza earring | 50 | +0.08 RET, +0.05 MAG | — |

#### Prestige/Cosmetic Held Items
| Boost | Cost | Stat Modifier | Special |
|-------|------|--------------|---------|
| Cigarette | 50 | +0.05 LCK, +0.03 SPD | -0.03 RET (bad habit) |
| Cigar | 75 | +0.08 LCK, +0.05 DMG | — |
| Pipe | 60 | +0.08 LCK, +0.03 MAG | — |
| Lipstick | 40 | +0.05 LCK, +0.05 MAG | — |
| Mustache | 50 | +0.08 ARM, +0.03 LCK | Disguise: enemies less likely to target you |
| Old watch | 75 | +0.1 MAG, +0.05 FIR | Gem timeout extended 25% |
| Bubble gum | 40 | +0.05 SPD, +0.05 RET | — |
| Bottle | 50 | +0.08 ARM, +0.05 RET | — |

#### Earring/Bling Held Items
| Boost | Cost | Stat Modifier | Special |
|-------|------|--------------|---------|
| Gold earring | 60 | +0.08 MAG, +0.05 LCK | — |
| Dimond earring | 100 | +0.12 MAG, +0.08 LCK | — |
| Shell earring | 40 | +0.05 ARM, +0.05 RET | — |
| BTC earring | 100 | +0.1 LCK, +0.1 MAG | Gem value +10% |
| BTC bag | 150 | +0.15 MAG, +0.1 LCK | Gem value +20% |

### 9.7 Bullets (6 types)
Bullets are NOT purchasable. They are tied to **body evolution** or **boost synergies**. Default is `normal`.

| Bullet | Source | Behavior |
|--------|--------|----------|
| normal | Default (all bodies) | Standard ink pellet. Balanced speed and damage |
| inkbullet | Body upgrade at mass > 2,000 | Slightly larger, slightly more damage (+15%) |
| fire | Magma body (immediate) | Burns: damage over time for 2s |
| electric | Cardbon body OR Circuit board crown + digital hat synergy | Chains to 1 nearby enemy on hit |
| iceink | Aqua/Teal body (immediate) | Slows target 20% for 1.5s |
| toxic | Zombie/Acid body (immediate) | Poisons: 3% mass drain over 3s |

#### Hue-Shifted Bullet Variants (Zero New Art)
Additional visual variety via runtime `sprite.setTint(0xRRGGBB)` in Phaser:

| Body Color | Bullet Tint |
|------------|------------|
| Red, Magma | Warm red-orange |
| Blue, Aqua, Teal | Cyan-blue |
| Green, Lime, Acid | Toxic green |
| Gold, Yellow | Amber-gold |
| Purple, Grape, Midnight | Deep violet |
| Charcoal, Metal, Gray | Desaturated/silver |
| Rainbow | Cycles through all hues per shot |
| Legendary bodies | Unique particle trail (glow + body color) |

### 9.8 Gem Economy

| Gem Color | Drop Source | Value | Use |
|-----------|------------|-------|-----|
| Green | Common token usage, small enemies | 1 | Basic currency |
| Light Blue | Completion tokens, mid enemies | 3 | Mid-value |
| Yellow | Streak bonuses, consecutive prompts | 5 | Bonus currency |
| Pink | Rare drops, boss kills, trait events | 10 | Premium currency |
| Silver | Boss kills, PvP kills, milestones | 25 | Endgame currency |

All gem colors convert to a single **Data Gem** wallet value:
`wallet += (green × 1) + (blue × 3) + (yellow × 5) + (pink × 10) + (silver × 25)`

### 9.9 Enemies & Boss Stat Scaling

#### Normal Enemies
| Enemy | Tier 1 (Micro) | Tier 2 (Predator) | Tier 3 (Abyss) |
|-------|---------------|-------------------|----------------|
| Small enemies (6 variants) | Plankton. 1 HP, slow | — | — |
| Jellyfish | 2 HP, slow, contact damage | 5 HP, poison trail | 10 HP, area denial |
| enemi1-4 (swim) | 3 HP, patrol | 8 HP, chase | 15 HP, aggressive |
| enemi5 | 4 HP, fast | 10 HP, fast + shoot | 20 HP, swarm |
| Eel | 5 HP, ambush | 12 HP, lunge attack | 25 HP, chain lightning |
| enemyshark | — | 15 HP, fast chase | 30 HP, ram + stun |
| shark (large) | — | 20 HP, boss-tier | 40 HP, boss |
| enemynarval | — | 18 HP, ranged horn | 35 HP, ranged + charge |
| enemywhale | — | — | 50 HP, massive, slow, area damage |
| BIG_GOV | — | — | 100 HP, final boss tier, tracks player |
| Mine/MineG | All tiers | Contact explosive. 1 HP but instant damage on touch |

#### Halloween Enemies (Boss-only, Tier 2+)
| Enemy | HP | Behavior | Drop |
|-------|-----|---------|------|
| enemies1 | 25 | Aggressive chase | 3 pink + 1 silver |
| enemiesd2 | 30 | Ranged + dodge | 4 pink + 1 silver |
| enemiess3 | 35 | Swarm spawn (splits into 2 mini) | 5 pink + 2 silver |
| enemiess4 | 40 | Shield phase (invulnerable 2s, attack 3s) | 5 pink + 3 silver |

### 9.10 Synergy System (Isaac/VS Stacking)
Specific item combinations create **synergies** — bonus effects exceeding the sum of parts.

| Combo | Items Required | Synergy Bonus |
|-------|---------------|--------------|
| **Pirate King** | Pirate hat + Pirate outfit + Hook | +0.3 LCK, all kills drop 2x gems |
| **Full Metal** | Metal body + Military helmet + Hazmat outfit | +0.5 ARM, immune to knockback |
| **Speed Demon** | Lime body + Propeller hat + Astro Suit + Coffee | +0.5 SPD, afterimage trail damages enemies |
| **Tech Lord** | Cardbon body + Circuit board crown + Digital keys | Electric bullets default, +0.3 FIR |
| **Mage Build** | Mage robe + Wizard hat + Trident | Projectiles split on kill, +0.2 FIR |
| **Crypto Whale** | Gold body + Crypto crown + BTC bag | All gems worth 3x. Gem magnet covers entire screen |
| **Ninja** | Charcoal body + Black bandana + Black kimono + Katana | +0.3 SPD, +0.3 DMG, invisible for 1s after kill |
| **Mad Science** | Deathbot body + Mad scientist + Nerd glasses | Homing projectiles + 30% size, fire rate x1.5 |
| **Berserker** | Red body + Devil horns + X eyes + Sword | Below 30% mass: DMG x2, SPD x1.5, ARM = 0 |
| **Clown Fiesta** | Pepe body + Clown hair + Durr eyes + Bubble gum | LCK x3, every 10th gem is silver, random bullet type per shot |

---

## 10. Equipment Slot Rules

Each loadout has exactly **5 equip slots**:

| Slot | Type | Stacking | Layer Order |
|------|------|----------|-------------|
| Body | 1 per run | Base class. Locked after hatch | 0 (base) |
| Clothes | 1 at a time | Swappable mid-run if found | 1 |
| Eyes | 1 at a time | Swappable mid-run if found | 2 |
| Hat | 1 at a time | Swappable mid-run if found | 3 |
| Boost | 1 at a time | Swappable mid-run if found | 4 (top/tentacle) |

**Found vs Purchased rule**: Shop purchases are persistent (kept forever). Mid-run finds are temporary (lost on death). If you find a hat mid-run and already have one equipped, you get a swap screen showing both stats side-by-side.

### 10.1 Visual Placement
- Body: animated GIF → spritesheet (111x123, 16-frame)
- Clothes: animated GIF → spritesheet (111x123, 16-frame)
- Eyes: animated GIF → spritesheet (111x123, 16-frame)
- Hat: animated GIF → spritesheet (111x123, 16-frame)
- Boost: static PNG (varies), renders at tentacle layer. Weapons extend outward. Consumables held close. Earrings/bling near head.

### 10.2 Legendary & Halloween Exception
Legendary (1-10) and Halloween (1-4) bodies render as **one complete animated GIF**. No layering. Slots 1-4 (clothes, eyes, hat, boost) are all disabled.

---

## 11. Projectile Stat Scaling — Concrete Formulas

### 11.1 Base Values (Blue Body, No Accessories)

| Parameter | Base Value | Unit |
|-----------|-----------|------|
| Fire Rate | 400ms | ms between shots |
| Projectile Speed | 600 | px/s |
| Projectile Damage | 50 | mass removed on hit |
| Projectile Size | 1.0x | visual scale of bullet sprite |
| Magnet Radius | 80 | px (gem attraction radius) |
| Detection Range | 300 | px (autopilot target acquisition) |
| Move Speed | 200 | px/s |

### 11.2 How Multipliers Apply
All stat modifiers from body, eyes, hat, clothes, and boost are **summed first**, then applied once.

Example: Blue body (0) + Alien Antenna hat (+0.1 FIR) + Mage robe (+0.15 FIR) + Nunchucks boost (+0.15 FIR) = total FIR = +0.4

```
effectiveFireRate = baseFireRate / (1 + totalFIR)
                  = 400ms / 1.4
                  = 286ms between shots
```

Full formulas:
```
effectiveSpeed       = baseSpeed * (1 + totalSPD)
effectiveFireRate    = baseFireRate / (1 + totalFIR)     // lower = faster
effectiveDamage      = baseDamage * (1 + totalDMG)
effectiveArmor       = floor(totalARM * 100)             // flat reduction from each hit
effectiveMagnet      = baseMagnet * (1 + totalMAG)
effectiveLuck        = baseLuck * (1 + totalLCK)         // affects crit chance, drop rolls
effectiveRetention   = min(1.0, 0.7 + (totalRET * 0.3)) // % of mass kept after hit
```

### 11.3 Armor Formula (Damage Reduction)
```
actualDamage = max(1, incomingDamage - effectiveArmor)
```
Armor is flat subtraction. 0.5 ARM = 50 flat armor, reducing a 50-damage hit to 1 (minimum). Extremely powerful against fast, low-damage projectiles (machine gun builds) but weak against slow, high-damage hits (sniper builds). This is the core build tension.

### 11.4 Luck Formula (Crit + Drops)
```
critChance = 5% * effectiveLuck
critDamage = 2x base damage
rareDropChance = baseDropRate * effectiveLuck
```
At LCK 1.0x: 5% crit, normal drops.
At LCK 3.0x (Clown Fiesta): 15% crit, 3x drop chance.

### 11.5 Mass Retention Formula
When hit:
```
massLost = actualDamage * (1 - effectiveRetention)
```
At RET 1.0x (base): effectiveRetention = 1.0 → 0% additional mass scatter.
At RET 0: effectiveRetention = 0.7 → 30% of damage splashes as loose gems nearby.
High-RET builds keep mass tight. Low-RET builds bleed gems when hit — creating third-party scavenger opportunities.

---

## 12. NPC Enemy Design

### 12.1 NPC Types (Asset Recycling)
All NPC enemies use existing OctoBlast enemy sprites, scaled and tinted per tier:

| NPC Role | Tier 1 | Tier 2 | Tier 3 |
|----------|--------|--------|--------|
| Plankton | Tiny (0.25x), passive, drifts | Not visible | Not visible |
| Grazer | Small (0.5x), slow, flees when shot | Tiny (0.25x), background noise | Not visible |
| Hunter | Normal (1.0x), chases if in range | Small (0.5x), minor threat | Tiny, plankton-tier |
| Predator | Large (1.5x), aggressive, fires | Normal (1.0x), standard enemy | Small (0.5x), grazer-tier |
| Boss | Massive (2.5x), deadly, huge gem drops | Large (1.5x), dangerous predator | Normal (1.0x), standard enemy |

### 12.2 NPC AI Behaviors
All lightweight JS (zero token cost):
- **Passive/Drift:** Random direction changes every 2–5s. Ignores players.
- **Flee:** Moves away from nearest threat when hit. Speed 0.8x player base.
- **Chase:** Moves toward nearest player in detection range. Speed matches player base.
- **Aggressive:** Chases AND fires. Detection range 1.5x normal. Used for Predators and Bosses.
- **Patrol:** Follows a fixed circuit path. Used for Boss NPCs as predictable danger zones.

### 12.3 NPC Spawn Rules
- Spawn at random positions, **minimum 500px from any player** (no surprise spawns)
- Boss NPCs require **minimum 1500px buffer**
- Boss timer: 1 boss per 60 seconds per instance, capped at 5 active bosses
- When entering Tier 2 or 3, server adjusts NPC spawn table accordingly

---

## 13. Accessory Drop Table for Ocean

### 13.1 Drop Sources

| Source | Drop Chance | Drop Pool |
|--------|------------|-----------|
| Plankton (Tier 1 fodder) | 0% | — |
| Grazer | 1% | Eyes only (cost ≤ 35) |
| Hunter | 3% | Eyes or Hats (cost ≤ 50) |
| Predator | 5% | Hats or Clothes (cost ≤ 100) |
| Boss NPC | 15% | Any slot (cost ≤ 150) |
| Halloween Enemy | 25% | Any slot (cost ≤ 200, includes rare hats) |
| Player Kill | 100% | Victim's EQUIPPED accessories (run-only, not persistent) |

### 13.2 Drop Quality Scaling
```
effectiveDropChance = baseDropChance * (1 + totalLCK) * tierMultiplier * timeMultiplier

tierMultiplier:  Tier 1 = 1.0x, Tier 2 = 1.5x, Tier 3 = 2.0x
timeMultiplier:  0-5min = 1.0x, 5-15min = 1.25x, 15-30min = 1.5x, 30+ = 2.0x
```

### 13.3 Drop Cost Cap Per Tier

| Tier | Max Drop Cost | Excludes |
|------|--------------|----------|
| Tier 1 (Shallows) | 75 gems | Rare+ hats, all clothes, weapon boosts |
| Tier 2 (Reef) | 200 gems | Legendary bodies, Mythic items |
| Tier 3 (Abyss) | Uncapped | Nothing excluded. Anything can drop |

### 13.4 Player Kill Drops
When killing another player, victim's equipped accessories physically drop at their death location alongside the gem explosion. These are **run-only copies** — picking them up doesn't permanently unlock them. Creates high-stakes PvP: killing a well-equipped player lets you steal their build mid-run.

---

## 14. Swap Screen UX (Mid-Run Accessory Management)

### 14.1 When It Appears
If the octopus collects an accessory drop and already has an item in that slot, the **Swap Screen** appears.

### 14.2 Layout
- Side-by-side comparison: Current (left) vs Found (right)
- Both items show stat modifiers clearly
- Net stat change displayed (e.g., "SPD: 1.2x → 1.1x (↓), DMG: 1.0x → 1.15x (↑)")

### 14.3 Timing
- **Game does NOT pause.** Autopilot continues while overlay is shown.
- **Auto-dismiss:** 10 seconds. If no choice, found item is discarded.
- **Two buttons:** "Keep Current" (left) and "Equip New" (right)

### 14.4 Persistence Reminder
- Found accessories are **run-only** — lost on death
- Shop-purchased accessories are **permanent** — persist forever

---

## 15. Ink Mine Hazard (Virus Equivalent)

### 15.1 Purpose
Prevents any single player from becoming an untouchable Leviathan. Adapted from Agar.io's "Virus" mechanic for a shooter.

### 15.2 Mechanic
- **Appearance:** Stationary, pulsing hazard sprite (repurposed boss/enemy asset with glowing tint)
- **Trigger:** Player with mass > 5,000 collides → detonation
- **Effect:** Instant 30% mass loss, scattered as loose gems in wide radius
- **Small Player Immunity:** Below 5,000 mass → pass through harmlessly

### 15.3 Semi-Random Grid Positioning
The 5000x5000 map is divided into a 5×5 grid of 1000x1000 cells. Each cell contains exactly 1 Ink Mine at a random position:
```
for each cell (row, col):
  mine.x = (col * 1000) + random(100, 900)  // 100px padding from edges
  mine.y = (row * 1000) + random(100, 900)
```
On detonation: 30-second respawn timer, then respawns at a **new random position within the same cell**. Players know "there's a mine somewhere in this area" but never exactly where.

---

## 16. Difficulty Scaling — Tier-Relative Heat System

### 16.1 Tier-Relative Escalation

| Phase | Tier 1 (Shallows) | Tier 2 (Reef) | Tier 3 (Abyss) |
|-------|------------------|---------------|----------------|
| Normal | 0–8 min | 0–5 min | 0–3 min |
| Elevated (+25% spawn) | 8–20 min | 5–12 min | 3–8 min |
| Intense (+50% spawn) | 20–40 min | 12–25 min | 8–15 min |
| Overwhelming (+100% spawn) | 40+ min | 25+ min | 15+ min |

Tier 1 is generous — learning zone. Tier 3 gives only 3 minutes before escalation. The Abyss is borrowed time.

### 16.2 Reward Scaling

| Phase | Gem Value Multiplier |
|-------|---------------------|
| Normal | 1.0x |
| Elevated | 1.25x |
| Intense | 1.5x |
| Overwhelming | 2.0x |

Same multipliers across all tiers — base gem value per enemy is already higher in Tier 3.

---

## 17. Spawn Rules

### 17.1 New Player Spawn
On clicking "Hunt," spawn position = point **farthest from all alive players** in the wrapping map. Prevents spawn-kills.

### 17.2 NPC Spawn
Random positions with **500px minimum buffer from any player**. Bosses require **1500px minimum buffer**.

---

## 18. Audio Design

### 18.1 Ambient
- **Ink Tank:** Calm, bubbly aquarium ambiance. Soft water sounds. Gentle lo-fi background.
- **Tier 1:** Light underwater hum. Distant, muffled sounds. Peaceful but lonely.
- **Tier 2:** More intense. Current sounds, occasional distant roars/rumbles.
- **Tier 3 (Abyss):** Deep, ominous drone. Pressure sounds. Minimal melody — pure tension.

### 18.2 SFX
- **Gem Collect:** Satisfying chime/pop (pitch increases with combo streaks)
- **Auto-Fire:** Soft "pew" per projectile, pitch varies by weapon type
- **Enemy Hit:** Thud/squelch
- **Enemy Death:** Pop + gem scatter sound
- **Player Death:** Dramatic ink-burst + brief silence before death summary
- **Frenzy Activation:** Rising synth swell or "power up" chime
- **Tier Transition:** Triumphant stinger + camera zoom sound

### 18.3 Sound Budget (2MB Total)

| Category | Files | Format | Size Each | Total |
|----------|-------|--------|-----------|-------|
| Ambient: Ink Tank | 1 loop | OGG 64kbps 30s | ~240KB | 240KB |
| Ambient: Tier 1 | 1 loop | OGG 64kbps 30s | ~240KB | 240KB |
| Ambient: Tier 2 | 1 loop | OGG 64kbps 30s | ~240KB | 240KB |
| Ambient: Tier 3 | 1 loop | OGG 64kbps 30s | ~240KB | 240KB |
| SFX (12 clips) | 12 | OGG 32kbps 0.2-1.5s | ~1-12KB | ~54KB |
| **Total** | **16 files** | | | **~1,014KB** |

~1MB headroom for additional SFX, seasonal audio, or higher quality ambient.

---

## 19. Notifications & Re-engagement

### 19.1 In-App Toasts
- **Death:** "Consumed by [PlayerName]. +[X] Data Gems banked. Your legacy lives on."
- **Kill:** "You consumed [PlayerName]! +[X] mass absorbed."
- **Tier Transition:** "Entering Tier 2: Predator Reef. The rules have changed."
- **Frenzy Mode:** "LLM processing — FRENZY MODE ACTIVE"

### 19.2 Idle Nudges (User Can Disable)
- **3+ hours no prompts:** "Your octopus is hungry. Send a prompt to feed it."
- **Octopus under threat:** "WARNING: A massive predator is approaching your octopus."
- **Daily summary:** "Today: 12,400 tokens consumed. 3 kills. Mass peak: 8,200. Status: Alive in Tier 2."

---

## 20. Leaderboards & Social

### 20.1 Live Leaderboard (In-Ocean)
Corner of the Open Ocean canvas. Top 10 by mass. Updates every server tick.

### 20.2 Persistent Leaderboards (Global)
- **Largest Mass Ever Achieved** (single run)
- **Most Player Kills** (lifetime)
- **Longest Survival Time** (single run)
- **Most Data Gems Earned** (lifetime productivity)
- **Most Deaths** (badge of honor — "The Immortal Jellyfish")

### 20.3 Kill Feed
Scrolling feed: "[PlayerA] consumed [PlayerB] — 2,400 mass released"

### 20.4 Death Report
On permadeath:
- Who killed them (player name or NPC type)
- Killer's current mass and skin
- Run stats (time survived, tokens consumed, kills, mass peak)
- Data Gems earned
- "Hatch New Egg" button → Shop

---

## 21. Reconnect & Disconnect

### 21.1 On Reconnect (Alive)
1. Server sends full state snapshot: position, mass, tier, HP, accessories, autopilot target.
2. Brief "Reconnecting..." overlay (500ms).
3. Control transfers from server-side autopilot to client.
4. **Queued Events:** If autopilot found accessories, swap screen queues (max 3; lowest discarded).
5. **Tier Changes:** Notification shown if tier changed while away.

### 21.2 On Reconnect (Dead)
1. Death report shown immediately with full stats.
2. **Autopilot Survival Log:**
   ```
   [12:04] Autopilot engaged — Tier 1, 3,200 mass
   [12:07] Killed: Grazer (+45 mass)
   [12:11] Found: Red Bandana (auto-discarded, full queue)
   [12:15] Tier transition: Shallows → Reef
   [12:22] Killed by: CoralHunter (Player, 28,400 mass)
   [12:22] Death — 8,200 mass → 3,280 Data Gems banked
   ```

### 21.3 Stale Session Cleanup
If autopilot runs **24 hours continuously** with no reconnect → graceful death. Mass → Data Gems. Session closed. Prevents zombie octopuses.

---

## 22. Edge Cases

### 22.1 Browser Closed While Deployed
Server switches to autopilot. Octopus stays alive indefinitely (or until killed). On return: resume control or see death summary.

### 22.2 Player Never Clicks "Hunt"
The Ink Tank is a fully valid, self-contained experience. Supported playstyle — not everyone wants PvP.

**What works without hunting:**
- Token telemetry generates Data Gems indefinitely
- Mass growth in Ink Tank, visually scales
- Shop fully accessible. Skins can be swapped anytime
- Loop: Work → Earn → Grow → Shop → Customize → Repeat

**What requires hunting:**
- Leaderboard placement
- PvP kill stats and Death Report history
- Ocean-exclusive cosmetic rewards

### 22.3 Ink Tank Mass Cap (Soft Cap)
- Cap = minimum Tier 3 threshold (50,001 mass)
- At cap: passive decay matches gem generation rate → plateau
- Data Gems still accumulate, shop still works — only physical mass stops
- If player hunts: enters Ocean at bottom of Tier 3, never larger than smallest existing Tier 3 player

### 22.4 Gentle Hunt Nudges (Never Forced)
- "Hunt" button subtly pulses brighter as mass increases
- At cap: "Your octopus has reached maximum Ink Tank growth. The Open Ocean awaits."
- Live Ocean leaderboard always visible on side panel (passive FOMO)
- No locked content. No popups. No guilt. Just a glowing button.

---

## 23. Anti-Cheat Fundamentals

### 23.1 Threat Model

| Threat | Description | Severity |
|--------|------------|----------|
| Fake usage payloads | Spoofed `{usage: {prompt_tokens: 999999}}` | High |
| Speed hacking | Modified client sends faster movement | Medium |
| Autopilot exploit | Custom perfect-dodge bot | Low (already an autopilot game) |
| Gem duplication | Client claims non-existent gems | High |

### 23.2 Server-Authoritative Design
- **Gems:** Server spawns, tracks IDs, validates collection. Client cannot create gems.
- **Mass:** Server calculates changes. Client sends inputs, server resolves.
- **Damage:** Server hit detection and damage calculation. Client renders.
- **Shop:** Server validates purchases. Client is display-only.

### 23.3 Ink Tank Token Validation
1. **Rate Limiting:** Max 100 gems/min regardless of token count.
2. **Diminishing Returns:** After 10,000 tokens/min, gem generation scales logarithmically.
3. **Session Binding:** Ink Tank gems require valid OpenClaw session token.
4. **Server-Side Banking:** Gems sync every 60s. Server validates against reasonable maximum.

### 23.4 Movement Validation
```
maxAllowedDistance = effectiveSpeed * timeSinceLastTick * 1.2  // 20% jitter tolerance
if (reportedDistance > maxAllowedDistance) rejectAndSnap()
```

### 23.5 Philosophy
Make cheating boring, not impossible. Low false positives. Server authority. Rate limits. Full competitive anti-cheat is out of scope.

---

## 24. First-Time User Experience (FTUE)

### 24.1 First Launch
- Free **Blue** body. No gems, no accessories, no shop.
- Brief overlay: "This is your octopus. It feeds on your work. Every prompt generates gems. Collect them to grow."

### 24.2 First Hunt
- "Hunt" button activates at 500+ mass (greyed before).
- Tooltip: "The ocean is dangerous. Other players are out there. If you die, your mass becomes Data Gems."

### 24.3 First Death
- Extra panel on death summary: "Welcome to the loop. Spend your Data Gems in the Shop to come back stronger."
- Shop unlocks for the first time.

### 24.4 Design Intent
Organically discover the full loop without tutorial walls. Each phase introduced only when relevant.

---

## 25. Complete Animation Asset Map

### 25.1 Player Animations (Per Body)
Each of the 30 normal bodies:

| State | Source | Frames | Trigger |
|-------|--------|--------|---------|
| Swim (idle/move) | `Bodies/{Name}.gif` | 16 | Default, always playing |
| Spin Attack | `Spin attack/{Name}.gif` | varies | Melee hit or special ability |
| Death | `Old cycles/playerdeath.gif` | varies | On death, tinted to body color |
| Hurt | `Old cycles/playerhurt.gif` | varies | On damage, flash |

### 25.2 Halloween Body Animations

| State | Source | Notes |
|-------|--------|-------|
| Swim | `halloween bodies/Holloween{1-4}.gif` | Full body, no layering |
| Spin | `halloween bodies spin/Holloween2_*.gif` | Only Holloween2 has spin variants |
| Death | `halloween death/halloweendeath.gif` | Shared death animation |

### 25.3 Enemy Animations

| Enemy | Swim/Idle | Attack | Notes |
|-------|----------|--------|-------|
| enemi1 | `enemi1swim.gif` | `enemi1atk.gif` | Tier 1 patrol |
| enemi2 | `enemi2swim.gif` | `enemi2atk.gif` | Tier 1 patrol |
| enemi3 | `enemi3swim.gif` | `enemi3atk.gif` | Tier 1 patrol |
| enemi4 | `enemi4swim.gif` | `enemi4atk.gif` | Tier 1 patrol |
| enemi5 | `enemi5swim.gif` | — | Tier 1 fast |
| small enemies (6) | `enemi1112.gif` etc. | — | Plankton, passive |
| Jellyfish | `Jellyfish.gif` | — | Contact damage |
| Eel | `Eel.gif` | — | Ambush |
| enemyshark | `enemyshark.gif` | — | Fast chase |
| shark (large) | `shark.gif` | — | Boss-tier |
| enemynarval | `enemynarval.gif` | — | Ranged horn |
| enemywhale | `enemywhale.gif` | — | Massive, slow |
| BIG_GOV | `BIG_GOV.gif` | — | Final boss |
| Mine/MineG | `Mine1.gif` / `MineG.gif` | — | Static pulsing |
| Halloween (4) | `enemies1.gif` etc. | — | Boss-only, Tier 2+ |

---

## 26. GDD Status & Open Items

### 26.1 Complete (Ready to Build)
- [x] Privacy architecture (blind plugin)
- [x] Core loop (Shop → Tank → Tank Hunt → Ocean → Death → Shop)
- [x] All body stats (30 normal + 4 Halloween + 10 Legendary)
- [x] All eye stats (28)
- [x] All hat stats (85)
- [x] All clothes stats (14)
- [x] All boost stats (23)
- [x] Bullet type mapping and hue-shift system
- [x] Gem economy (5 colors, zero-sum death split)
- [x] Synergy system (10 named combos)
- [x] Slot rules, swap screen UX, and layer order
- [x] Projectile formulas and stat scaling (7 concrete formulas)
- [x] NPC enemy design and tier scaling
- [x] Server architecture (WebSocket, tick rate, visibility culling)
- [x] Mass economy (sqrt radius, decay, ecosystem balance)
- [x] Death gem conversion (zero-sum model with duration scaling)
- [x] Ink Mine hazard (semi-random grid positioning)
- [x] Difficulty scaling (tier-relative heat system)
- [x] Accessory drop table with tier caps and luck scaling
- [x] Leaderboards and social features
- [x] Notifications and re-engagement
- [x] FTUE (drip-feed tutorial)
- [x] Edge cases (disconnect, never-hunt, soft mass cap, reconnect)
- [x] Reconnect state sync (queue, survival log, stale cleanup)
- [x] Anti-cheat fundamentals (server-authoritative)
- [x] Sound budget allocation (~1MB of 2MB)
- [x] Animation asset map (player, halloween, enemies)
- [x] Permadeath scope (run vs account state)
- [x] Combat model (projectile-based, mass-as-HP)
- [x] World structure (toroidal map, 3 depth layers)

### 26.2 Implemented (In Current Build)
- [x] Ink Tank idle gameplay (token feeding, gem collection, autopilot)
- [x] Endless toroidal tank (infinite wrapping in all directions)
- [x] Trait discovery system (rare drops spawn in tank, autopilot ignores them)
- [x] Shop UI (scrollable panels, buy/equip flow, stat deltas)
- [x] Loadout UI (5-slot equip, stat comparison, archetype preview)
- [x] Tank Hunt VS/Isaac combat mode (wave progression, boss gate, charge system)
- [x] Archetype system (5 families seeding weapon identity from loadout)
- [x] Hunt mutations — weapon geometry (broadside, backblast, mines, spiral, prism fork)
- [x] Hunt mutations — bullet path modifiers (wiggle, boomerang, lump-of-coal, spectral)
- [x] Hunt mutations — on-hit effects (chain lightning, fear, freeze, contagion, gem pulse)
- [x] Hunt mutations — stat upgrades (pierce, split, bounce, homing, poison, orbit, etc.)
- [x] Enemy behavior roles (jelly drift, fish charge, eel flank, boss sway)
- [x] Body identity balance pass (distinct stat profiles per body, archetype groupings)
- [x] Keyboard/pointer manual control with seamless autopilot handoff
- [x] XP bar, level-up flow, hunt HUD
- [x] End Hunt button with countdown
- [x] Hunt charge system (gated by prompt count)

### 26.3 Open (Needs Ed's Input)
- [ ] Audio assets — provide or source ambient loops and SFX per Section 18.3
- [ ] Legendary body naming — currently numbered 1-10, need lore/flavor names
- [ ] OpenClaw plugin API spec — exact events/hooks for bridge integration
- [ ] Monetization decision — purely free, or premium cosmetics / battle pass?
- [ ] Seasonal events — Halloween bodies exist; Christmas, Easter, etc.?
- [ ] Marketing page / trailer plan
- [ ] Open Ocean multiplayer prototype — server, WebSocket, async PvP
- [ ] Mutation visual polish — particle trails, screen effects for stacked builds
- [ ] Hunt balance tuning — mutation offer weights, enemy HP curves, gem economy rates
