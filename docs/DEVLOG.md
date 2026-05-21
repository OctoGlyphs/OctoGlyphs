# OctoGlyphs Devlog

## 2026-05-21 — Clarify install, contribution, and release flow

### Changed
- Updated the root README so all three host install flows lead with current public user paths: OpenClaw via `@octoglyphs/openclaw-plugin@0.1.4`, Claude Code via npm, and Hermes via the generated `OctoGlyphs/hermes-octoglyphs` mirror.
- Added `CONTRIBUTING.md` with the one-codebase contribution model, privacy boundary, test commands, pull request checklist, and asset rights note.
- Added `SECURITY.md` to document metadata-only collection rules, forbidden content, reporting expectations, and token hygiene.
- Added `docs/RELEASE.md` to document how one shared `game/` build ships through OpenClaw, Claude Code, and Hermes.
- Updated OpenClaw and Hermes host READMEs to reflect current user install and contribution routing.
- Synced the checked-in Hermes public bundle with the already-published Hermes release mirror so the main monorepo matches what Hermes users install.

### Why
- New contributors should have one obvious place to improve OctoGlyphs: the main `OctoGlyphs/OctoGlyphs` repo.
- Users should not need to understand monorepo internals or generated mirrors to install the plugin for their host.
- The local Hermes bundle had been regenerated and already published to the Hermes mirror, but the main repo still had older checked-in generated files. Committing the sync removes that confusing mismatch.

### Next
- Add a top-level release script that builds the shared game once, syncs all host bundles, runs all host checks, and prints the exact publish commands.
- Consider GitHub issue templates for bug reports, gameplay ideas, plugin host issues, asset contributions, and new host requests.

---

## 2026-05-21 — Document public Claude Code npm install and Hermes release mirror

### Changed
- Updated the root README so Claude Code now leads with the verified public install path: `npm install -g @octoglyphs/claude-code` and `claude-octoglyphs`.
- Added Claude Code troubleshooting notes for stale source-installed launchers and runtime port discovery through `~/.octoglyphs-claude-code.json`.
- Expanded the Hermes README to make clear that Hermes support is a Python plugin, not an npm package.
- Chose a Hermes-native distribution plan: publish `plugin/hosts/hermes` to a generated `OctoGlyphs/hermes-octoglyphs` release mirror so users can run `hermes plugins install OctoGlyphs/hermes-octoglyphs`.
- Added `scripts/publish-hermes-plugin.sh` to build the shared game, sync it into the Hermes plugin, run Python checks, copy the plugin root into the mirror checkout, and optionally push it.
- Updated the Hermes mirror script to exclude Python cache artifacts from the generated release repo.

### Why
- The clean new-user Claude Code test passed from npm, so docs should stop treating source install as the primary Claude Code path.
- The Hermes test confusion came from treating the Hermes host as a Node package. The docs now explicitly prevent that path.
- Hermes expects `plugin.yaml` and `__init__.py` at the installed repository root. A generated mirror gives Hermes users the standard install flow without creating a second hand-maintained codebase.
- Python verification creates `__pycache__` locally; generated release mirrors should not publish runtime cache files.

### Verified
- Clean global npm install of `@octoglyphs/claude-code@0.1.0` works and spawns gems during Claude Code prompt activity.
- `cd plugin/hosts/claude-code && npm test` passes.
- `cd plugin/hosts/hermes && python3 -m py_compile __init__.py octoglyphs_sidecar.py && python3 -m unittest discover -s tests` passes.
- `python` is not available on this Linux machine, so Hermes docs should prefer `python3` where exact commands matter.
- `bash -n scripts/publish-hermes-plugin.sh` passes after adding release-mirror cache exclusions.

### Next
- Push the generated `OctoGlyphs/hermes-octoglyphs` repository with a PAT that has contents read/write access.
- Test Hermes with the real new-user command: `hermes plugins install OctoGlyphs/hermes-octoglyphs`.

## 2026-05-20 — Prepare Claude Code npm package

### Changed
- Renamed the Claude Code host package from `@octoglyphs/claude-code-plugin` to `@octoglyphs/claude-code` for a cleaner public install command.
- Added npm package metadata for repository, homepage, bugs, keywords, public publish config, and `prepack` build.
- Kept the global binary as `claude-octoglyphs` so users can launch Claude Code with the OctoGlyphs plugin attached from any directory.
- Updated the Claude Code README to lead with `npm install -g @octoglyphs/claude-code`, while keeping source install and local plugin-dir flows.
- Regenerated the Claude Code package lock after the package rename.

### Why
- Claude Code does not have a single ClawHub-style store, so npm plus GitHub is the lowest-friction public install flow for OctoGlyphs.
- The shorter package name makes the install command read cleanly: `npm install -g @octoglyphs/claude-code` followed by `claude-octoglyphs`.

### Verification
- `npm test` passes in `plugin/hosts/claude-code`.
- `npm pack --dry-run` succeeds and reports `@octoglyphs/claude-code@0.1.0` at about 7.0 MB packed and 9.5 MB unpacked.
- Local tarball install with a temporary global prefix creates the `claude-octoglyphs` binary successfully.
- Running the temporary binary with `--version` passes through to Claude Code and prints `2.1.128 (Claude Code)`.
- `npm publish --dry-run --access public` succeeds; real publish is blocked only by npm login.

### Next
- Log into npm with an account that has access to the `@octoglyphs` scope.
- Run `npm publish --access public` from `plugin/hosts/claude-code`.
- Verify with `npm view @octoglyphs/claude-code version bin --json`, then test `npm install -g @octoglyphs/claude-code` on a clean machine.

---
## 2026-05-20 — OpenClaw v0.1.4 restores two bundled songs

### Changed
- Restored two smaller bundled OpenClaw music tracks: `octosong1.ogg` and `octosong5.ogg`.
- Re-enabled the runtime music catalog for those two tracks only.
- Bumped OpenClaw plugin metadata from `0.1.3` to `0.1.4`.
- Regenerated the OpenClaw package lock after the version bump.

### Why
- The fully music-free `0.1.3` package was safest for ClawHub size limits, but the music is part of the OctoGlyphs feel.
- Two tracks should keep the package well below the earlier server-side multipart limit while preserving the companion atmosphere.

### Next
- Rebuild and verify the OpenClaw package size.
- If ClawHub accepts `0.1.4`, keep music bundled at this smaller set and consider remote/CDN loading for the full soundtrack later.
- If ClawHub still fails, fall back to publishing `0.1.3` without bundled music.

## 2026-05-20 — Remove Bundled Music for ClawHub Publish

**What**: Prepared OpenClaw plugin v0.1.3 after ClawHub still returned a server error with the trimmed v0.1.2 package.

**Changes**:
- Removed bundled music tracks from the runtime music catalog for the ClawHub/OpenClaw package path.
- Removed local bundled `octosong*.ogg` files from the game/public asset source and rebuilt OpenClaw public assets without them.
- Bumped the OpenClaw plugin package and manifest from `0.1.2` to `0.1.3`.
- Kept the mute/unmute UI assets and music controls so music can be restored later via smaller assets or remote hosting.

**Why**: ClawHub continued failing server-side even after v0.1.2 dropped from about 17.9 MB to about 15.8 MB. Removing bundled music drops the package to about 2.7 MB, safely below the multipart stream limit while preserving gameplay and companion behavior.

**Verification**:
- `npm --prefix game test` passes.
- `npm --prefix game run build` passes with only the existing Vite chunk-size warning.
- `npm --prefix plugin/hosts/openclaw run build` passes.
- `npm --prefix plugin/hosts/openclaw test` passes.
- `npm pack --dry-run` in `plugin/hosts/openclaw` reports `octoglyphs-openclaw-plugin-0.1.3.tgz` at about 2.7 MB.

**What's next**: Commit and push v0.1.3, then retry ClawHub publish from the Mac. After publish succeeds, restore music through smaller compressed tracks or remote hosting from octoglyphs.com/CDN.

---
## 2026-05-20 — Trim OpenClaw Package Below ClawHub Limit

**What**: Prepared OpenClaw plugin v0.1.2 after ClawHub v0.1.1 publish failed server-side near the multipart upload size limit.

**Changes**:
- Removed `octosong7.ogg` from the bundled game music set and from the runtime music catalog.
- Bumped the OpenClaw plugin package and manifest from `0.1.1` to `0.1.2`.
- Rebuilt the OpenClaw public bundle so ClawHub receives the smaller asset set.

**Why**: ClawHub appears to choke near its 20 MB stream limit even when dry-run validation passes. Dropping one bundled track reduces the npm package from about 17.9 MB to about 15.8 MB while preserving gameplay, UI, and five music tracks.

**Verification**:
- `npm --prefix game test` passes.
- `npm --prefix game run build` passes with only the existing Vite chunk-size warning.
- `npm --prefix plugin/hosts/openclaw run build` passes.
- `npm --prefix plugin/hosts/openclaw test` passes.
- Hermes host passes `python3 -m py_compile __init__.py octoglyphs_sidecar.py` and `python3 -m unittest discover -s tests`.
- `npm pack --dry-run` in `plugin/hosts/openclaw` reports `octoglyphs-openclaw-plugin-0.1.2.tgz` at about 15.8 MB.

**What's next**: Commit and push v0.1.2, then retry `clawhub package publish OctoGlyphs/OctoGlyphs --family code-plugin --version 0.1.2 --source-path plugin/hosts/openclaw` from the Mac. If ClawHub still errors, remove or remote-host additional music tracks.

---

## 2026-05-07 — Force Quick Build Bullet Identities

**What**: Made the six quick-build buttons carry visible bullet identity, not just weighted trait selection.

**Changes**:
- Added preset-family markers to key traits that represent Speed Demon, Heavy Hitter, Fortress, Lucky Prism, Gem Greed, and Magnet Chaos.
- Added runtime preset-family rules so selected quick builds can force route family, bullet tint, and baseline shot modifiers during Tank Hunt.
- Speed Demon now forces Current tint and adds speed, shot speed, wake, bounce, and homing support.
- Heavy Hitter now forces Inkstorm tint and adds damage, broadside, coal growth, and faster firing support.
- Fortress now forces Shell tint and adds health, guardian/orbit, and freeze support.
- Lucky Prism now forces Prism tint and adds crit, prism fork, chain, and gem pulse support.
- Gem Greed now forces gold Treasure tint and adds gem pulse, Hungry Gems, magnet, and luck support.
- Magnet Chaos now forces pink Chaos tint and adds split, wiggle, bounce, boomerang, and magnet support.
- Quick preset application now emits the equipped marker trait so live Tank Hunt updates can apply immediately.

**Why**: Ed tested the hybrid quick builds and saw that bullets still did not visibly change color across all six buttons. The previous pass depended too much on organic owned-trait scoring, so if overlapping traits won, visual bullet identity could still collapse. This pass gives each quick build an explicit Isaac-style shooting identity when matching traits are available.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.
- Hermes host passes `python3 -m py_compile __init__.py octoglyphs_sidecar.py` and `python3 -m unittest discover -s tests`.
- Latest local and Hermes bundle is `index-Ui1KMYV_.js`.

**What's next**: Test buttons one through six inside an active Tank Hunt. Confirm bullet tint changes immediately, then confirm shape/behavior differences are obvious enough. If any button still feels subtle, add a small active bullet-rules readout to show bounce, homing, split, chain, prism, broadside, and poison values.

---

## 2026-05-07 — Convert Quick Builds Into Hybrid Archetypes

**What**: Kept the convenience of the number-key quick builds while making each preset prefer a distinct bullet/playstyle identity.

**Changes**:
- Replaced the old pure-stat quick preset labels with six hybrid utility/archetype presets: Speed Demon, Heavy Hitter, Fortress, Lucky Prism, Gem Greed, and Magnet Chaos.
- Preserved each preset's practical goal: speed, damage, toughness, luck, gem economy, and magnet range.
- Added style-weighted scoring so presets prefer traits with matching Tank Hunt mechanics when available.
- Speed Demon now prefers bounce, wake trail, shot speed, backblast, and homing.
- Heavy Hitter now prefers broadside, lump-of-coal growth, extra projectiles, fire rate, and damage pressure.
- Fortress now prefers max HP, guardian charges, orbit, freeze, spin, and mines.
- Lucky Prism now prefers crit chance, prism fork, chain, spectral shots, homing, and luck.
- Gem Greed now prefers gem pulse, magnet, luck/economy effects, prism economy, and Hungry Gems-style pickup play.
- Magnet Chaos now prefers split, wiggle, bounce, boomerang, extra projectiles, homing, and magnet range.
- Updated `GDD-COMPLETE.md` with the hybrid quick-build design rule.

**Why**: Ed liked having an easy way to swap from fast to strong to tanky, but the old presets often selected overlapping stat winners, so bullets could still feel samey. Hybrid scoring keeps the useful one-key swaps while pushing each build toward a visible Isaac-style shooting identity.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.
- Hermes host passes `python3 -m py_compile __init__.py octoglyphs_sidecar.py` and `python3 -m unittest discover -s tests`.
- Latest local and Hermes bundle is `index-DweSQGrO.js`.

**What's next**: Ed tested the hybrid presets and reported that bullet colors still did not visibly change across all six buttons. Next pass should make the quick-build identity explicit instead of relying only on whatever owned trait happens to win scoring.

---

## 2026-05-07 — Add Quick Build Hotkeys and Live Trait Pickups

**What**: Made quick build testing faster and made manual trait pickups behave more like Binding of Isaac items.

**Changes**:
- Added number-key hotkeys 1 through 6 for the six Quick Build presets in the Loadout panel.
- Labeled quick build buttons with their matching number so the hotkeys are discoverable.
- Trait pickups now unlock and equip immediately instead of making common traits shop-only discoveries.
- Replaced traits remain owned; pickup replacement only changes the current slot.
- Picking up or equipping a trait during an active Tank Hunt now applies its hunt modifiers live so bullets, orbiters, fire rate, speed, gem effects, poison, chain, bounce, and related run stats can change immediately.
- Expanded live hunt modifier support for weird/run-mod fields such as Anchor Shot, Black-Hole Pearl, Hungry Gems, Echo Shot, and pressure/reward modifiers.
- Updated `GDD-COMPLETE.md` with the live trait pickup rule and quick build hotkey rule.

**Why**: Ed wanted trait pickups to feel more like Binding of Isaac items. If the player finds a bullet-affecting trait, they should see the octo and current/next run respond immediately instead of only discovering a shop entry. The number hotkeys also make archetype and balance testing much faster.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.
- Hermes host passes `python3 -m py_compile __init__.py octoglyphs_sidecar.py` and `python3 -m unittest discover -s tests`.
- Latest local and Hermes bundle is `index-Azri6r-s.js`.

**What's next**: Test pickups during Tank Hunt with obvious bullet-mod traits such as Bubble Gum, Martini, Nunchucks, Trident, Coffee, Evil Eyes, and Wizard Hat. Confirm visual loadout swaps happen immediately and live bullet behavior changes without breaking boss/upgrade overlays.

---

## 2026-05-07 — Add Tank Hunt Replayability Routes and Weird Mutations

**What**: Added a first no-new-art replayability pass so different loadouts create different Tank Hunt routes, upgrade choices, and run stories.

**Changes**:
- Added archetype route rules for Inkstorm, Abyss, Current, Shell, Prism, and Tide.
- Routes now bias wave recipes, spawn count, wave cadence, elite pressure, boss toughness, gem drops, and mutation role offers.
- Added weird Isaac-style mutations: Anchor Shot, Glass Cannon, Vampire Siphon, Black-Hole Pearl, Tiny Octo, Cursed Fork, Hungry Gems, and Boss Magnet.
- Added boss reward run modifiers: Blood Moon, Treasure Trench, Kraken Pact, Deep Current, and Octo Echo.
- Added runtime behavior for black-hole pull pulses, Hungry Gem pickup attacks, Vampire Siphon healing, Echo Shot delayed rear shots, and route-aware debug state.
- Updated `GDD-COMPLETE.md` with the replayability route model and new mutation/reward design rules.

**Why**: The game has strong bullet spectacle, but replayability needs runs to ask different questions. This pass uses existing art and systems to make loadout identity affect route, enemies, rewards, and playstyle instead of only stat scaling.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.
- Latest local bundle is `index-Cptdy7uQ.js`.

**What's next**: Playtest each archetype using strongest/debug loadouts and normal loadouts. Watch whether routes feel distinct without feeling unfair, then tune route multipliers and weird mutation rarity.

---

## 2026-05-07 — Add Fair Enemy Speed Contract

**What**: Clamped enemy and boss movement scaling around the player's actual swim speed so high-pressure hunts stay threatening without becoming impossible to escape.

**Changes**:
- Added player-relative speed helpers in `IncubationScene.js` for current octo swim speed, fair enemy cruise speed, and fair dash speed.
- Normal enemy cruise movement is now capped by role relative to the player's current loadout speed.
- Difficulty event speed boosts are bounded instead of multiplying harder against fast player builds.
- Pressure-breaker enemies keep their entry armor and close spawns, but their raw speed boost is softened.
- Dart and pouncer bursts now use short dash caps instead of unbounded multipliers.
- Shark, red shark, octo, and mummy boss burst speeds now use capped readable-attack rules instead of unrestricted player-speed multipliers.
- Updated `GDD-COMPLETE.md` with the fair enemy speed contract.

**Why**: Projectile-pressure scaling made the game harder, but fast pressure enemies could feel unfair if they exceeded the octo's swim speed as continuous pursuit. Speed traits should remain meaningful escape tools. Enemies may outrun the player only during telegraphed, committed attacks with recovery.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.

**What's next**: Playtest fastest and strongest loadouts. Confirm normal enemies can pressure but not permanently outrun the octo, and bosses feel dodgeable because their fast moves are locked attacks rather than homing chase.

---

## 2026-05-07 — Add Projectile-Pressure Difficulty Scaling

**What**: Added live projectile-pressure scaling so extreme bullet-storm builds create smarter enemy pressure instead of trivial screen denial.

**Changes**:
- Added `getLiveProjectilePressure()` to measure active bullets, mines, orbiters, fire rate, split, pierce, bounce, homing, chain, broadside, prism forks, damage, synergies, and interactions.
- Difficulty pressure now uses the higher of starting loadout power and live projectile pressure.
- Added pressure tiers that shorten high-power breathing lulls and increase wave spawn budget without nerfing player bullets.
- Added pressure-breaker enemies that spawn inside the visible arena, briefly gain entry armor, move faster, and force the player to reposition.
- Increased enemy HP/speed scaling at high pressure, especially for bosses.
- Added boss minimum-presence armor so high-DPS builds cannot delete bosses before at least one pattern matters.
- Added pressure debug values to the Tank Hunt state payload.
- Updated `GDD-COMPLETE.md` with the projectile-pressure model.

**Why**: Strongest trait combos were fun visually but created full-screen denial. Enemies and bosses died at the edge of the arena before the player needed to move, so the correct fix is pressure-aware enemy behavior rather than simply nerfing bullet spectacle.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.

**What's next**: Playtest the strongest trait combo button and watch whether pressure-breakers create movement without feeling unfair. Tune entry armor duration, spawn distance, and pressure thresholds based on feel.

---

## 2026-05-07 — Add Trait Interaction Rule Collisions

**What**: Added the deeper Binding of Isaac-style trait interaction layer on top of exact synergies and theme synergies.

**Changes**:
- Added a pairwise/triple trait interaction table for flag collisions such as Poison + Bounce, Poison + Homing, Freeze + Pierce, Homing + Chain, Homing + Prism Fork, Broadside + Mines, Gem Pulse + Prism Fork, and Bounce + Split + Wiggle.
- Wired active interaction IDs and flags into hunt run state, bullet metadata, run summaries, and the hunt-state debug payload.
- Made dominant starting trait flags select non-default baseline weapon patterns even before a full three-trait theme synergy activates.
- Added new bullet/runtime behaviors: toxic ricochet puddles, venom lock-on targeting, spore splits, plague-chain boost, frost-lance wake pulses, ice-ring orbit chills, smarter chains, seeker prism shards, coal cannon scaling, mine broadside drops, golden prism shards, collector-beam gem pulls, and chaos shrapnel pulsing.
- Updated `GDD-COMPLETE.md` with the current three-layer interaction model and interaction table.
- Expanded synergy tests to cover active flag-count interactions.

**Why**: Runs were still collapsing into a small number of broad themes. This makes individual trait combinations mutate bullet rules so different loadouts inside the same theme can feel mechanically different.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.

**What's next**: Playtest named combinations from the GDD table, then tune noisy effects and add player-facing partial synergy/codex UI so players can intentionally chase these rule collisions.

---

## 2026-05-06 — Add First Isaac-Style Synergy Behavior Pass

**What**: Added a checkpoint for the first active synergy behavior pass after the publishing-ready state.

**Changes**:
- Added emergent theme synergies on top of existing exact outfit synergies.
- Added synergy tests and wired them into the game test script.
- Made active synergies alter bullet behavior and firing patterns instead of only changing stats.
- Rebuilt the game bundle, including the Hermes public bundle copy used for local host testing.

**Why**: Runs were still feeling too similar. This checkpoint captures the first pass toward Binding of Isaac-style run identity before the deeper pairwise trait interaction rewrite.

**Verification**:
- `npm test` passes in `game`.
- `npm run build` passes in `game` with only the existing Vite chunk-size warning.

**What's next**: Add a true interaction table for flag pairs/triples, make dominant starting traits define baseline shot geometry, update the GDD with the current interaction model, and add a debug readout for active flags/combo rules.

---

## 2026-05-06 — Working Publishing-Ready State Checkpoint

**What**: Checkpointed the current OpenClaw plugin bundle after fresh-machine testing confirmed the game is in a working state ready for publishing once the ClawHub account age gate expires.

**Changes**:
- Added the currently generated OpenClaw public raw asset bundle that was present but not yet tracked by Git.
- Preserved the compressed release asset state, including WebP backgrounds and OGG music, so the publishable package stays under the ClawHub size limit.
- Marked this as the post-working-state publishing checkpoint before gameplay brainstorming or further improvement work.

**Why**: The game has been verified to load correctly from a clean OpenClaw install after the `0.1.1` package rebuild. ClawHub publishing is blocked only by the GitHub account age gate, so the repo needs a clean checkpoint representing the known-good publishing-ready state.

**Verification**:
- `npm test` passes in `game`.
- `npm run typecheck && npm run build:plugin && node tests/openclawAdapter.test.mjs` passes in `plugin/hosts/openclaw`.

**What's next**: Wait for the ClawHub age gate to expire or publish via an older eligible GitHub account. While waiting, review non-breaking gameplay improvements, especially Isaac-style synergy depth and hunt variety.

---

This file is the chronological handoff record for OctoGlyphs. Read this first when resuming work, then read `PHASE1-BUILD-SPEC.md`, then check `git log --oneline -- PrimordialAI`.

## Current Resume Point

OctoGlyphs Phase 1 is implemented through all core systems plus the Isaac-style composable bullet flag system, named synergy set bonuses, starting-power rebalance, loadout/shop sorting quality-of-life, media support, readable shallow/deep hunt backgrounds, hardened endless-wave transitions, expanded enemy variety, boss patterns, difficulty events, explicit XP breakpoints, smarter upgrade draft logic, Step 9 boss reward choices, Step 10 real-data hunt recap, Step 11 enemy behavior variety, the sprite-shaped pickup glow pass, Step 12 mutation feel pass one, octo boss projectile patterns, the first Claude Code plugin flow, native Hermes support, shared OctoGlyphs branding, fixed-frame single-scaler layout for resizable plugin hosts, and a source-install `claude-octoglyphs` launcher for Claude Code. Every single trait in the catalog (30 bodies, 30 eyes, 92 hats, 14 clothes, 24 boosts, 10 legendaries, 4 halloween) now has unique `huntMods` that flip composable bullet flags. No item is "just +Luck 0.03x" anymore — every item changes how the hunt plays.

### Latest: Remove Debug Buttons for Release
- **Commit**: `d307251` — "Remove debug buttons and dead code for release"
- Removed "Discover All" and "Reset" dev buttons from the Evolution Shop header. Only "Close" remains.
- Removed both click handlers from `UIScene.js` and the dead `discoverAllShopAssets` export from `saveStore.js`.
- Synced rebuilt game bundle to Claude Code and Hermes plugin public folders.
- **Next**: Publish to ClawHub via web upload (CLI publish hits server-side git clone timeout).

### All Three Hosts Verified Working
- **Status**: OpenClaw (Mac), Claude Code (Linux), Hermes (Linux) — all confirmed functional.
- **Gem visibility fix** (`6d7e434`): Side-panel webviews reported `document.visibilityState = "hidden"` even when visible. `isBackgroundCollectMode()` now bypasses background ledger when events arrived within 30s.
- **Asset optimization** (`f2f7eb2`): MP3→OGG, PNG→WebP, deleted octosong 6+8. Package: 17.5MB (under 20MB ClawHub limit).
- **Install flows verified**:
  - OpenClaw: `npm run pack:local` → `openclaw plugins install .tgz --force` → `/octoglyphs`
  - Claude Code: `npm install` → `npm link` → `claude-octoglyphs` (or `claude --plugin-dir .`)
  - Hermes: `cp -R plugin/hosts/hermes ~/.hermes/plugins/octoglyphs` → `hermes plugins enable octoglyphs`
- **Next**: Publish to ClawHub. Polish README install instructions for public users.

### Optimize Assets for ClawHub 20MB Limit
- **Commit**: `f2f7eb2` — "Optimize assets for ClawHub 20MB limit: MP3→OGG, PNG→WebP, remove octosong 6+8"
- ClawHub rejected 52MB package (20MB stream limit). Converted all music MP3→OGG (libvorbis 96kbps), backgrounds PNG→WebP (q80).
- Deleted octosong6.mp3 and octosong8.mp3 (unwanted tracks).
- Music: 30MB → 15MB (6 OGG files). Backgrounds: 4.6MB → 367KB (2 WebP files).
- Updated `mediaCatalog.js` and `assetCatalog.js` to reference new extensions.
- Rebuilt game bundle and synced to all 3 plugin hosts (OpenClaw, Claude Code, Hermes).
- Packaged size: ~17.5MB compressed — fits under 20MB ClawHub limit.
- **Next**: Test on Linux (Hermes + Claude Code new-user flow) and Mac (OpenClaw new-user flow), then publish to ClawHub.

### Add Built Artifacts for ClawHub Distribution
- **Commit**: `3d811d8` — "Add built artifacts for ClawHub distribution"
- Removed `dist/` from root and plugin-level `.gitignore` so compiled TypeScript is tracked.
- Removed `plugin/hosts/openclaw/public/` from root `.gitignore` so game build + assets are tracked.
- ClawHub GitHub-source publish (`OctoGlyphs/OctoGlyphs --source-path plugin/hosts/openclaw`) now picks up all runtime files.
- 3536 files added (~52MB: 15 compiled JS/dts/map + 3519 game assets including sprites, music, backgrounds, fonts).
- **Next**: Re-run `clawhub package publish` dry-run on Mac to verify full file list, then publish for real.

### Harden Claude Code and Hermes Privacy Boundaries
- **Commit**: `bc66f8a` in the public `OctoGlyphs/OctoGlyphs` release repo (`Harden Claude Code and Hermes privacy boundaries`).
- **Changed**: Applied the same strict privacy standard from OpenClaw to both Claude Code and Hermes plugins:
  - Claude Code: removed `source.prompt.length` read, `source.last_assistant_message.length` read, and `readSafeCommand(source.tool_input)` for git commit detection. Now uses only host-provided metadata fields (`prompt_chars`, `prompt_tokens`, `usage.completion_tokens`). Git commit detection uses tool_name category only.
  - Hermes: removed `len(user_message)` for prompt size estimation and `str(result).lower()[:1000]` for failure detection. Now uses only host-provided metadata (`prompt_chars`, `prompt_tokens` from kwargs/metadata). Tool success uses explicit `success`/`error` fields only.
- **Why**: OpenClaw was hardened but Claude Code and Hermes still read raw content locally for size estimates and failure heuristics. Before public release, all three hosts must meet the same "never read content" standard.
- **Tests**: Both suites inject fake secrets into prompt, response, tool args, tool result, and command fields, then assert zero content reaches emitted events. Source code assertions verify forbidden patterns (e.g. `len(user_message)`, `str(result)`, `source.prompt.length`) are absent from plugin code.
- **Verification**: All three plugin test suites pass: OpenClaw (`npm test`), Claude Code (`node tests/claudeCodePlugin.test.mjs`), Hermes (`python3 -m unittest discover -s tests`). Added `__pycache__/` to `.gitignore`.
- **What's next**: All three OctoGlyphs host plugins now meet the same privacy boundary. Ready for npm publish prep and final cross-platform validation.

### Previous: Add OpenClaw Inbound Prompt Fallback
- **Commit**: `065af3b` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add OpenClaw inbound prompt fallback`).
- **Changed**: Added a content-blind `message_received` fallback hook for OpenClaw terminal chat paths that do not fire `model_call_started`, `model_call_ended`, `agent_turn_prepare`, `message_sent`, or accessible `agent_end` events for normal prompts. The fallback emits generic `prompt.sent` immediately and a delayed generic `response.completed` if no better completion hook arrives. It never reads inbound content, sender names, prompt text, responses, tool params, tool results, files, diffs, or terminal output. The adapter contract test now injects fake inbound prompt and sender secrets and verifies they do not reach the event stream.
- **Why**: Mac testing after `1929686` still showed only `tool.used` events in `curl -N http://localhost:18789/octoglyphs/stream`; normal prompts and AI responses produced no stream lines and no gems. OpenClaw's live terminal path appears to expose tool hooks to external plugins but not the model/turn/agent hooks we tried for plain chat.
- **Verification**: `npm run typecheck`, `npm test`, `npm audit --omit=dev --omit=peer`, `git diff --check`, and `npm run pack:local` passed from `plugin/hosts/openclaw`. Only the expected Vite large chunk warning appeared during game builds.
- **What's next**: Pull and reinstall the packed OpenClaw plugin on Mac, restart the gateway, keep `curl -N http://localhost:18789/octoglyphs/stream` open, then send a normal no-tool prompt. Expected stream output is `prompt.sent` quickly and `response.completed` about 2.5 seconds later if no stronger completion hook fires.

### Previous: Add OpenClaw Turn Fallback Hooks
- **Commit**: `1929686` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add OpenClaw turn fallback hooks`).
- **Changed**: Added content-blind `agent_turn_prepare` and `message_sent` OpenClaw fallback hooks on top of the existing sanitized model-call hooks and `agent_end` fallback. Normal prompt turns can now emit generic `prompt.sent`, `response.started`, and `response.completed` without reading prompts, message history, outbound response content, tool params, tool results, files, diffs, or terminal output. Added run-id and short-window dedupe so model-call, turn, message, and agent-end signals do not double-reward the same turn where OpenClaw provides overlapping telemetry. Updated OpenClaw README, adapter notes, fresh-machine docs, and the adapter contract test with leak probes for turn-start and outbound-message content.
- **Why**: Mac testing showed `/octoglyphs/stream` stayed connected and `after_tool_call` produced live `tool.used` events, but normal no-tool prompts and responses emitted nothing. `agent_end` was not enough because non-bundled OpenClaw plugins may not receive it without conversation access. The plugin needs reliable plain-chat activity while preserving the public no-read privacy boundary.
- **Verification**: `npm run typecheck`, `npm test`, `npm audit --omit=dev --omit=peer`, `npm run pack:local`, and `git diff --check` passed from `plugin/hosts/openclaw`. Only the expected Vite large chunk warning appeared during game builds.
- **What's next**: Superseded by the inbound prompt fallback above; verify `message_received` now feeds normal OpenClaw terminal prompts on Mac.

### Previous: Harden OpenClaw Privacy Boundary
- **Commit**: `3d91e81` in the public `OctoGlyphs/OctoGlyphs` release repo (`Harden OpenClaw privacy boundary`).
- **Changed**: Removed the OpenClaw `before_prompt_build` subscription, moved prompt activity emission onto the documented sanitized `model_call_started` hook, and changed prompt reward mapping so it only uses host-provided `prompt_chars` or token metadata when present. Removed unused prompt-text/token-estimation helpers, strengthened the adapter contract test with explicit prompt/message/input leak probes, updated OpenClaw README and adapter notes, and added npm/ClawHub-ready package metadata.
- **Why**: The public privacy promise says OctoGlyphs never reads prompts. The previous adapter avoided emitting text but still inspected prompt/message/input strings to estimate character count, which violated that boundary. Public npm and ClawHub release should be privacy-correct before discovery.
- **Security audit**: Runtime package dependencies are now empty; `openclaw` is an optional peer for SDK typing/host compatibility. `npm audit --omit=dev --omit=peer` reports zero runtime vulnerabilities. A full peer-inclusive audit still reports a moderate advisory through OpenClaw's current peer dependency chain, but that is host SDK scope rather than code shipped in the OctoGlyphs runtime package.
- **Verification**: `npm run typecheck`, `npm test`, `npm pack --dry-run --silent`, and `npm audit --omit=dev --omit=peer` passed from `plugin/hosts/openclaw`. Only the expected Vite large chunk warning appeared during game build.
- **What's next**: Run one final Mac packed-tarball OpenClaw install, then prepare npm publish for `@octoglyphs/openclaw-plugin` and use ClawHub as the discovery layer.

### Previous: Add Claude Code Launcher Lockfile
- **Commit**: `2282ac1` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add Claude Code launcher lockfile`).
- **Changed**: Added the generated Claude Code host `package-lock.json` so source installs and future npm packaging have reproducible package metadata for the `claude-octoglyphs` launcher package.
- **Why**: Ed confirmed `claude-octoglyphs` works well on Linux and OpenClaw works well on Mac. The remaining dirty repo state was a valid lockfile generated by the Claude Code launcher install flow; committing it keeps the release tree clean and makes fresh-machine installs less ambiguous. The Hermes `npm` error was also confirmed to be command misuse because the Hermes host is Python-based and intentionally has no `package.json`.
- **Verification**: `node tests/claudeCodePlugin.test.mjs` passed from `plugin/hosts/claude-code`; `python3 -m py_compile __init__.py octoglyphs_sidecar.py tests/test_hermes_plugin.py` and `python3 -m unittest discover -s tests` passed from `plugin/hosts/hermes`.
- **What's next**: Superseded by the OpenClaw privacy hardening above; next release work should focus on final packed-tarball validation, npm publishing, and ClawHub discovery.

### Previous: Add Claude Code Launcher
- **Commit**: `42deb2a` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add Claude Code launcher`).
- **Changed**: Added a `claude-octoglyphs` executable for the Claude Code host, exposed it through the package `bin` map, added `npm run install:launcher` to install it into `~/.local/bin` or `OCTOGLYPHS_BIN_DIR`, and documented the source-install flow. The launcher resolves its own plugin root and runs Claude Code with `--plugin-dir`, while passing through any extra CLI arguments.
- **Why**: Claude Code plugins cannot define new top-level flags like `claude --octoglyphs`, and asking users to remember `claude --plugin-dir /long/path` is not product-quality UX. OpenClaw and Hermes can use `/octoglyphs`; Claude Code needs a memorable wrapper command.
- **Verification**: `npm run build -- --logLevel warn` passed from `game/`; `npm run build:plugin` and `node tests/openclawAdapter.test.mjs` passed from `plugin/hosts/openclaw`; `node tests/claudeCodePlugin.test.mjs`, `claude plugins validate .`, `OCTOGLYPHS_BIN_DIR=/tmp/octoglyphs-bin-test npm run install:launcher`, and `/tmp/octoglyphs-bin-test/claude-octoglyphs --version` passed from `plugin/hosts/claude-code`. Only the expected Vite large chunk warning appeared.
- **What's next**: Superseded by the Claude Code launcher lockfile pass above; next planning should focus on public install flow and ClawHub readiness.

### Previous: Fix Plugin Host Single-Scaler Layout
- **Commit**: `e226d9b` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix plugin host single-scaler layout`).
- **Changed**: Disabled Phaser's internal `Scale.FIT` mode so the tank canvas renders once at the fixed virtual size, then the outer app shell performs all resize scaling. Locked `#game-root` and the canvas to `1280x594`, clipped `#panel-root` overflow, and changed the trait panel width calculation away from browser `100vw` so closed panels cannot leak a sliver outside the fixed frame. Rebuilt the shared game bundle and synced Claude Code and Hermes public bundles.
- **Why**: Ed's Linux and Mac testing showed two resize bugs after the first fixed-frame pass: the tank canvas could shrink into a small letterboxed window because Phaser and CSS were both scaling it, and the closed traits menu could remain slightly visible to the right of the game frame because the root frame did not clip overflow.
- **Verification**: `npm run build -- --logLevel warn` passed from `game/`; `npm run build:plugin` and `node tests/openclawAdapter.test.mjs` passed from `plugin/hosts/openclaw`; `claude plugins validate .` passed from `plugin/hosts/claude-code`. Only the expected Vite large chunk warning appeared.
- **What's next**: Superseded by the Claude Code launcher pass above; next live checks should confirm the Mac OpenClaw layout fix and the Claude Code launcher flow.

### Previous: Add Fixed-Frame Fit Scaling
- **Commit**: `7a244a1` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add fixed-frame fit scaling`).
- **Changed**: Wrapped the full OctoGlyphs app shell in a fixed `1280x720` viewport and added resize-driven fit scaling so the top bar, tank canvas, bottom HUD, menus, overlays, octo, enemies, gems, and map shrink or grow together. Rebuilt the shared game bundle and synced the new output into the tracked Claude Code and Hermes public bundles.
- **Why**: Plugin users resize OpenClaw, Claude Code, and Hermes panels constantly. Resizing should not change how much of the tank/map is visible or make gameplay logic jump; it should preserve a consistent virtual game view and scale the presentation with letterboxing instead of cropping.
- **Verification**: `npm run build -- --logLevel warn` passed from `game/`; `npm run build:plugin` and `node tests/openclawAdapter.test.mjs` passed from `plugin/hosts/openclaw`; `node tests/claudeCodePlugin.test.mjs` passed from `plugin/hosts/claude-code`. Only the expected Vite large chunk warning appeared.
- **What's next**: Superseded by the single-scaler layout fix above; next live checks should confirm OpenClaw, Claude Code, and Hermes share the same clean resize behavior.

### Previous: Fix Routed Logo Favicon Packaging
- **Commit**: `facc67c` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix routed favicon packaging`).
- **Changed**: Switched the web favicon and Apple touch icon paths from root-relative `/octo-logo.jpg` to route-relative `./octo-logo.jpg`, and added `public/octo-logo.jpg` to the OpenClaw plugin package `files` list so npm/OpenClaw installs include the logo asset.
- **Why**: Ed's Mac OpenClaw test showed the browser requested `http://localhost:18790/octo-logo.jpg` and got a 404 because OctoGlyphs is served under `/octoglyphs`. The favicon must resolve beside the mounted plugin page, and the package manifest must include the logo for public npm/ClawHub installs.
- **Verification**: `npm run build` passed from `game/`; the rebuilt `game/dist/index.html` and all three host public bundles reference `./octo-logo.jpg`; `game/dist/octo-logo.jpg`, OpenClaw, Claude Code, and Hermes public logo assets all exist; `npm run typecheck`, `npm test`, and `npm run pack:local` passed from `plugin/hosts/openclaw`; the generated tarball includes `package/public/octo-logo.jpg`. Only the expected Vite large chunk warning appeared.
- **What's next**: Superseded by the fixed-frame scaling pass above; next live checks should confirm resize behavior across OpenClaw, Claude Code, and Hermes.

### Previous: Add OctoGlyphs Logo Branding
- **Commit**: `a7b48d3` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add OctoGlyphs logo branding`).
- **Changed**: Added Ed's `octo-logo.jpg` as repo-owned web branding, switched the game favicon and Apple touch icon from the inline octopus emoji SVG to the JPEG logo, placed the logo at the top of the GitHub README, and updated the README tagline to name OpenClaw, Claude Code, and Hermes. Rebuilt the game bundle and synced the branded public output into the tracked Claude Code and Hermes plugin public folders.
- **Why**: OctoGlyphs now has three working host plugins and needs recognizable launch branding in browser tabs, installed plugin tanks, and the public GitHub landing page.
- **Verification**: `npm run build` passed from `game/`; `game/dist/octo-logo.jpg`, `plugin/hosts/claude-code/public/octo-logo.jpg`, and `plugin/hosts/hermes/public/octo-logo.jpg` all exist; both tracked plugin `index.html` files reference `octo-logo.jpg`. Only the expected Vite large chunk warning appeared.
- **What's next**: Superseded by the routed favicon/package fix above; next live checks should confirm branding appears in OpenClaw packaging, Claude Code, and Hermes.

### Previous: Fix Hermes Visible-Unfocused Tank Rendering
- **Commit**: `1905adc` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix Hermes visible tank rendering`).
- **Changed**: Updated shared tank background collection logic so the background ledger only activates when the page is actually hidden, not merely when the browser window is visible but unfocused. Rebuilt and synced the Hermes plugin public tank bundle so `plugin/hosts/hermes/public/` carries the same shared game behavior.
- **Why**: Ed's live Hermes test showed a visible-but-unfocused tank could increment the gem counter while gems failed to render, with the octo rapidly jumping between invisible collection positions. The tank should keep live swim/rendering when it is still visible behind Hermes, and reserve ledger reconciliation for genuinely hidden/background-tab cases.
- **Verification**: `npm run build` passed from `game/`; Ed rebuilt, synced, reinstalled the Hermes plugin into `~/.hermes/plugins/octoglyphs`, opened `http://localhost:18792/octoglyphs`, and confirmed the visible-unfocused Hermes flow now works.
- **What's next**: Superseded by the OctoGlyphs logo branding pass above; next live checks should confirm branding appears in each host tank.

### Previous: Add Native Hermes Plugin Scaffold
- **Commit**: `1956e7c` in the public `OctoGlyphs/OctoGlyphs` release repo (`Add Hermes plugin scaffold`).
- **Changed**: Added `plugin/hosts/hermes/` with a native Python Hermes plugin manifest, hook registration, `/octoglyphs` slash command, metadata-only event mapper, small Python sidecar server, copied shared tank bundle, README, and unit tests.
- **Why**: Hermes is the next target host after OpenClaw and Claude Code. The plugin should feel native to Hermes users while preserving the same passive, privacy-first OctoGlyphs boundary: observe safe metadata only, never inject context, never send raw prompts/responses/files/tool args/terminal output.
- **Verification**: `python3 -m py_compile plugin/hosts/hermes/__init__.py plugin/hosts/hermes/octoglyphs_sidecar.py plugin/hosts/hermes/tests/test_hermes_plugin.py` passed. `python3 -m unittest discover -s plugin/hosts/hermes/tests` passed. A temporary `HERMES_HOME` install/list check showed Hermes discovers OctoGlyphs as an enabled local plugin.
- **What's next**: Superseded by the Hermes visible-unfocused rendering fix above; next live checks should focus on prompt gems, tool rewards, and distribution flow.

### Previous: Fix Claude Code Background Gem Reconciliation
- **Commit**: `1640ef7` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix unfocused tank gem reconciliation`).
- **Changed**: Added explicit focus tracking to the shared tank scene, updated the background gem ledger to activate when the tank window is blurred or hidden outside Tank Hunt, and added a visibility/focus/simulation diagnostic to the UI readout. The Claude Code plugin public tank bundle was rebuilt and synced with the updated game bundle.
- **Why**: Ed's Claude Code test showed the octo could appear to swim through invisible activity gems when the browser window was visible but unfocused. Browser focus loss can throttle Phaser enough that live rendering becomes unreliable, so unfocused normal tank activity now uses the causal background ledger instead of half-live simulation.
- **Verification**: `npm run build` passed from `plugin/hosts/claude-code`; only the existing Vite large chunk warning appeared. Ed manually tested the Claude Code flow and confirmed the visible/unfocused background-ledger behavior now works correctly.
- **What's next**: Pull the pushed release on the Mac or OpenClaw test machine, rebuild/repack the OpenClaw host package, and verify `/octoglyphs` shows the same focused, unfocused, and hidden reconciliation behavior because the fix lives in shared game code.

### Previous: Fix Shop Header Flow and Keep Music
- **Commit**: `ce46217` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix shop header flow and keep music`).
- **Changed**: Restored bundled music in the OpenClaw plugin packaging step while still excluding unused background variants. Hardened the shop/loadout panel layout by forcing shell children to normal flex sizing, changing panel headers from flex to a defensive grid layout, stacking the shop title/actions vertically, and forcing shop tabs/sort/list to remain in normal document flow.
- **Why**: Ed's screenshot showed the shop title, action buttons, category buttons, sort controls, and first item overlapping at the top even after the general unified-scroll fix. The header needed explicit flow constraints instead of relying on flex behavior. Also, removing music was too aggressive because previous installs had worked with music included; the package should only strip clear unused backgrounds until proven otherwise.
- **Verification**: `npm run build`, `npm run typecheck`, `npm test`, `npm pack --dry-run`, and `npm pack` passed from `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`. Packed tarball with music restored is about 35.7 MB.
- **What's next**: Push `ce46217`, then Ed pulls on Mac, rebuilds/re-packs/reinstalls with `--force`, restarts gateway, hard-refreshes the tank, and retests the shop at 100% zoom first.

### Previous: Slim OpenClaw Plugin Package
- **Commit**: `164fd4d` in the public `OctoGlyphs/OctoGlyphs` release repo (`Slim OpenClaw plugin package`).
- **Changed**: Reduced OpenClaw plugin package from about 50 MB to about 6.7 MB by removing bundled MP3 music and unused background variants from the packaged game. The game now preloads only one shallow and one deep hunt background, and plugin packaging strips the other background PNGs plus `octosong*.mp3` while keeping mute/unmute icons.
- **Why**: Fresh Mac install timed out while extracting/installing the 49.8 MB tarball (`extract tar timed out after 120000ms`). The plugin needs to stay small for OpenClaw's extension installer.
- **Verification**: `npm run build`, `npm run typecheck`, `npm test`, and `npm pack` passed from `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`. Packed tarball is now 6.7 MB.
- **What's next**: Superseded by `ce46217`, which restores music and fixes shop header flow while still excluding unused backgrounds.

### Previous: Fix Panel Overlap (gap missing from flex layout)
- **Commit**: `26f8ca4` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix loadout/shop panel overlap: add gap to flex layout`).
- **Changed**: Added `gap: 10px` to the flex override for `#loadout-panel .trait-panel-shell` and `#shop-panel .trait-panel-shell`. The previous unified-scroll commits (793e747, 432a970) switched from grid to flex but dropped the `gap` property, causing all child sections (header, tabs, sort, items) to stack without spacing and overlap visually.
- **Why**: After the flex conversion, titles and buttons were jumbled/overlapping at the top of both loadout and shop panels because flex doesn't inherit gap from the grid it replaced.
- **Verification**: `npm --prefix game run build -- --logLevel warn` passed; only expected Vite chunk-size warning.
- **What's next**: Ed pulls on Mac, rebuilds plugin, tests both shop and loadout panels — sections should now be clearly spaced apart.

### Previous: Shop + Loadout Unified Scroll
- **Commit**: `432a970` in the public `OctoGlyphs/OctoGlyphs` release repo (`Shop panel: unified scroll (same fix as loadout)`).
- **Changed**: Extended the loadout unified-scroll fix to also cover `#shop-panel .trait-panel-shell`. Both panels now use flex-column + overflow-y:auto on the shell, with `.trait-list` set to overflow-y:visible + flex-shrink:0. Previously only loadout was fixed (793e747); shop still used the old grid layout causing the same cramped scroll issue. Also fixes the loadout reverting to cramped after buying a trait (purchase re-renders loadout which now correctly inherits the flex rule).
- **Why**: After buying a trait in the shop the loadout showed the same cramped layout, and the shop itself had the identical tiny-scroll-area problem.
- **Verification**: `npm --prefix game run build -- --logLevel warn` passed; only expected Vite chunk-size warning.
- **What's next**: Fixed in 26f8ca4 — gap was missing.

### Previous: Simulate Hidden Activity Gem Collection
- **Commit**: `5039a23` in the public `OctoGlyphs/OctoGlyphs` release repo (`Simulate hidden activity gem collection`).
- **Changed**: Replaced instant hidden-tab activity rewards with a timestamped background gem ledger. When the tank is hidden/unfocused outside Tank Hunt, prompt/response/tool activity now creates gems with real spawn positions, values, and estimated collection deadlines based on octo swim speed. If enough real time passes while the user remains in OpenClaw, the ledger awards those gems and moves the virtual octo forward. If the user returns early, uncollected ledger gems materialize in their stored positions for visible collection.
- **Why**: Instant background rewards worked mechanically but felt fake and empty. The desired behavior is causal: send a prompt then immediately check the tank and the gems should still be there; stay in OpenClaw long enough and octo should have collected them by elapsed time.
- **Verification**: `npm --prefix game run build -- --logLevel warn` passed from the release checkout, and `npm run typecheck && npm test && npm pack --dry-run` passed from `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning and stale local companion port warning remain.
- **What's next**: Have Ed pull `5039a23` on the Mac, rebuild/repack/reinstall with `--force`, restart the gateway, then test two flows: send a prompt and immediately return to the tank to confirm gems are visible; send a prompt and wait in OpenClaw long enough to confirm gems are auto-collected by elapsed time.

### Previous: Collect Background Activity Gems
- **Commit**: `e6e2ea6` in the public `OctoGlyphs/OctoGlyphs` release repo (`Collect background activity gems`).
- **Changed**: Added hidden/unfocused tank handling. Outside Tank Hunt, activity events now award the same gem value directly into the wallet instead of relying on Phaser movement/overlap collection while the browser is throttled. On refocus, the tank shows a catch-up notice with how many activity gems were collected. During Tank Hunt, visibility loss pauses physics and hunt timers, then resumes them when the tank is visible again.
- **Why**: Fresh OpenClaw testing showed gems spawn from prompts/responses, but the octo does not reliably swim to collect them when the browser is not focused. Browser throttling pauses or slows Phaser update loops, so progression must not depend on background animation. Hunt mode remains paused because it is active gameplay and should not silently progress while the user is elsewhere.
- **Verification**: `npm --prefix game run build -- --logLevel warn` passed from the release checkout, and `npm run typecheck && npm test && npm pack --dry-run` passed from `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning and stale local companion port warning remain.
- **What's next**: Have Ed pull `e6e2ea6` on the Mac, rebuild/repack/reinstall with `--force`, restart the gateway, open the tank, click away to OpenClaw, send prompts, then refocus the tank and verify the wallet/notice reflects background collection. Also confirm Tank Hunt pauses when hidden and resumes when visible.

### Previous: Include Runtime Bullet and Boost Assets
- **Commit**: `ce315cd` in the public `OctoGlyphs/OctoGlyphs` release repo (`Include runtime bullet and boost assets`).
- **Changed**: Adjusted the OpenClaw plugin packaging step so it no longer strips `public/assets/raw/Bullets` or `public/assets/raw/octos player assets` from the bundled tank. The package still removes nonessential raw Halloween/enemy/gem/old-cycle/UI/background extras, but keeps the runtime-required bullet GIFs and boost/throwable PNGs that Phaser preloads from `assetCatalog.js`.
- **Why**: Fresh Mac testing showed the tank now loads and gems spawn, but browser console had 404s for `assets/raw/Bullets/*.gif` and `assets/raw/octos player assets/Throwables/*.png`. Those files existed in the game build but were deleted by the plugin `copy:game` slimming command, so equipped bullets/boost icons could not render in the installed plugin.
- **Verification**: `npm run typecheck && npm test && npm pack --dry-run` passed from `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning and stale local companion port warning remain.
- **What's next**: Have Ed pull `ce315cd` on the Mac, rebuild/repack/reinstall with `--force`, restart the gateway, open the tank, confirm prompts/responses still spawn gems, and verify the console no longer reports 404s for bullets or throwables.

### Previous: Emit Prompt Events for OctoGlyphs Gems
- **Commit**: `bba385d` in the public `OctoGlyphs/OctoGlyphs` release repo (`Emit prompt events for OctoGlyphs gems`).
- **Changed**: Added a sanitized `before_prompt_build` hook that emits `prompt.sent` metadata to the tank, switched lifecycle hook registration to prefer the documented `api.on(...)` plugin hook path before legacy `registerHook(...)`, and expanded the adapter test to verify `prompt.sent` reaches the SSE stream without leaking prompt text.
- **Why**: The fresh Mac now loads the actual game, but prompts did not spawn gems. The game awards gems from `prompt.sent`, `response.chunk`, `response.completed`, and `tool.used`; the plugin was only emitting response/tool events, and `response.started` does not create gems. If model/token metadata is sparse, a normal prompt can therefore produce no visible gem spawn.
- **Verification**: `npm run typecheck && npm test && npm pack --dry-run` passed from the clean release checkout at `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Have Ed pull `bba385d` on the Mac, rebuild/repack/reinstall with `--force`, restart the gateway, open the tank, run `/octoglyphs` to confirm one connected tank window, then send a normal prompt and verify gems spawn.

### Previous: Fix OctoGlyphs Local Asset Serving
- **Commit**: `83e1d96` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix OctoGlyphs local asset serving`).
- **Changed**: The plugin-owned localhost tank server now serves both `/assets/...` and `/octoglyphs/assets/...` static bundle paths, and the local server calls `unref()` so the adapter test cannot keep Node alive and block the Mac command chain before `npm run pack:local`.
- **Why**: Ed's screenshot was not another Unauthorized failure; it showed the HTML shell/text/buttons loading without the real Phaser game. That meant the browser reached the local page, but Vite-built JS/CSS asset URLs were not being served correctly. The Mac reinstall command also stopped after `OpenClaw adapter contract assertions passed` because the test-created companion server held the Node process open.
- **Verification**: `npm run typecheck && npm test && npm pack --dry-run` passed from the clean release checkout at `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Have Ed pull `83e1d96` on the fresh Mac, rebuild/repack/reinstall with `--force`, restart the gateway, run `/octoglyphs`, click `http://localhost:18790/octoglyphs`, and confirm the actual game canvas appears instead of only text/buttons.

### Previous: Make OpenClaw Tank Route Browser Accessible
- **Commit**: `12ce54b` in the public `OctoGlyphs/OctoGlyphs` release repo (`Make OctoGlyphs tank route browser accessible`).
- **Changed**: Switched the `/octoglyphs` HTTP route registration from `auth: "gateway"` to `auth: "plugin"` and updated the OpenClaw adapter contract test accordingly.
- **Why**: Ed's fresh Mac clicked the new full localhost link and got `{"error":{"message":"Unauthorized","type":"unauthorized"}}`. That proved a normal browser tab cannot open a gateway-auth plugin route, even though the `/octoglyphs` command works inside OpenClaw. The tank route must be browser-openable while the plugin itself still only emits sanitized metadata.
- **Verification**: `npm run typecheck && npm test` passed from the clean release checkout at `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Push `12ce54b`, have Ed pull on the fresh Mac, rebuild/reinstall with `--force`, restart the gateway, click the full URL again, and confirm the tank loads plus connected windows increments.

### Previous: Make OpenClaw Tank Link Clickable
- **Commit**: `c4bcc79` in the public `OctoGlyphs/OctoGlyphs` release repo (`Make OpenClaw tank link clickable`) and `e3f1a75` in the main PrimordialAI repo.
- **Changed**: Updated the OpenClaw `/octoglyphs` command so it prints a full URL like `http://localhost:<gateway.port>/octoglyphs` instead of only the relative `/octoglyphs` route. Added `publicBaseUrl` plugin config for remote/proxied gateways, kept the raw gateway route visible for diagnostics, and expanded the adapter test to verify full clickable tank and stream URLs.
- **Why**: Ed's fresh Mac install proved the command now works, but the response showed `Open the tank at: /octoglyphs`, which is not useful for normal users because it may not render as a clickable link and does not tell them which Gateway host/port to open.
- **Verification**: `npm run typecheck && npm test` passed from both the clean release checkout at `~/Desktop/octoglyphs-release/plugin/hosts/openclaw` and the main PrimordialAI checkout at `PrimordialAI/octoglyphs/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Commit and push this link polish to `OctoGlyphs/OctoGlyphs`, then have Ed pull on the fresh Mac, rebuild/reinstall with `--force`, restart the gateway, and confirm `/octoglyphs` now returns a clickable full URL.

### Previous: Remove Unstable OpenClaw Control UI Registration
- **Commit**: `e04feca` in the public `OctoGlyphs/OctoGlyphs` release repo (`Remove unstable OpenClaw control UI registration`).
- **Changed**: Removed `api.registerControlUiDescriptor(...)` from the OpenClaw runtime entry entirely and updated the adapter contract test to expect no Control UI descriptor registration.
- **Why**: Ed's fresh Mac retest on OpenClaw `2026.4.23` still failed during plugin registration with `TypeError: api.registerControlUiDescriptor is not a function`, which means that OpenClaw runtime/version path cannot safely tolerate this registration yet. The plugin already exposes user settings through `openclaw.plugin.json` `configSchema`, so Control UI is nonessential for the first install path.
- **Verification**: `npm run typecheck && npm test` passed from the clean release checkout at `~/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Have Ed pull `e04feca` on the fresh Mac, rebuild, reinstall with `--force`, restart gateway, and retest `/octoglyphs`. If another runtime API fails, strip back to the minimal stable docs path: HTTP route plus command plus hook registrations only.

### Previous: OpenClaw Fresh-Machine Runtime Fix
- **Commit**: `6f73c84` in the public `OctoGlyphs/OctoGlyphs` release repo (`Fix OpenClaw runtime plugin entry`).
- **Changed**: Fixed the external release package so OpenClaw installs the compiled runtime entry from `./dist/index.js` instead of trying to load `./src/index.ts`, switched hook registration to the documented `api.registerHook(...)` path with fallback for older `api.on(...)`, and made the optional Control UI descriptor feature-detected so older OpenClaw builds do not fail registration.
- **Why**: Ed's fresh Mac install proved packaging/build worked, but OpenClaw `2026.4.23` reported `extension entry not found: ./src/index.ts` and then failed registration because `api.registerControlUiDescriptor` was unavailable in that installed runtime.
- **Verification**: `npm run typecheck && npm test` passed from both `PrimordialAI/octoglyphs/plugin/hosts/openclaw` and the clean release checkout at `/home/crai/Desktop/octoglyphs-release/plugin/hosts/openclaw`; only the expected Vite chunk-size warning remains.
- **What's next**: Have Ed pull latest on the fresh machine, reinstall with `--force` if OpenClaw says the plugin already exists, restart gateway, then test `/octoglyphs`, `/octoglyphs/health`, and real tank event spawning.

### Previous: Standard OpenClaw Install Package Prep Committed
- **Commit**: `90bc917` (`Prepare OpenClaw standard install package`).
- **Changed**: Made the OpenClaw host package publish/install-ready for the fresh-machine path. The package is now public, declares explicit npm `files` so compiled `dist/`, bundled `public/`, manifest, and docs are included, adds `prepack`, keeps generated `.tgz` files out of git, trims unused raw source asset folders during package build, and updates README/fresh-machine instructions for tarball install testing.
- **Why**: A normal OpenClaw user should install one plugin package and not run the Phaser/Vite server separately. The tarball path is the closest pre-publish simulation of the future npm or ClawHub install.
- **Verification**: Before commit, `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`; `npm run test` passed from `PrimordialAI/game`; and `npm pack --ignore-scripts --json` confirmed the install package includes `dist/index.js`, `dist/httpRoutes.js`, `dist/eventHub.js`, `dist/privacy.js`, `public/index.html`, `openclaw.plugin.json`, and `package.json`.
- **What's next**: Commit this devlog-after-commit record, then give Ed the tarball/local-path commands for the fresh OpenClaw machine. Validate `openclaw plugins install ./octoglyphs-openclaw-plugin-0.1.0.tgz`, gateway restart, `/octoglyphs`, `/octoglyphs/health`, and real SSE gem spawning.

### Previous: Gateway-Hosted OpenClaw Companion Committed
- **Commit**: `dca6178` (`Serve OctoGlyphs through OpenClaw gateway`).
- **Changed**: Committed the gateway-hosted OpenClaw companion work. The OpenClaw package now builds and bundles the Phaser companion, serves it from `/octoglyphs`, exposes `/octoglyphs/stream` for live events, exposes `/octoglyphs/health`, and sends sanitized hook events to connected tank windows through server-sent events.
- **Why**: This moves OctoGlyphs toward normal OpenClaw plugin behavior: users install the plugin and use `/octoglyphs`, without separately cloning and running the Vite game server.
- **Verification**: Before commit, `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`, and `npm run test && npm run build` passed from `PrimordialAI/game`; only the expected Phaser/Vite chunk-size warning remains.
- **What's next**: Commit this devlog-after-commit record, then smoke test inside a live OpenClaw gateway. Confirm `/octoglyphs` returns the tank link, the gateway serves the tank page, and real OpenClaw activity spawns gems through the SSE stream.

### Previous: Gateway-Hosted OpenClaw Companion
- **Changed**: Bundled the Phaser companion into the OpenClaw plugin build, added gateway HTTP routes for `/octoglyphs`, `/octoglyphs/stream`, and `/octoglyphs/health`, switched hook delivery from external POSTs to server-sent events, updated asset paths for nested gateway hosting, and expanded the OpenClaw adapter contract test.
- **Why**: Public users should install one normal OpenClaw plugin and not run the Vite dev server separately. `/octoglyphs` should point to a gateway-hosted tank window.
- **Verification**: `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`. `npm run test && npm run build` passed from `PrimordialAI/game`; only the expected Phaser/Vite chunk-size warning remains.
- **What's next**: Smoke test inside a live OpenClaw gateway using local package install. Confirm `/octoglyphs` opens or links to the gateway-served tank and real OpenClaw activity spawns gems through `/octoglyphs/stream`.

### Previous: Fresh-Machine Test Prep Committed
- **Commit**: `bf51ab7` (`Prepare OpenClaw fresh machine testing`).
- **Changed**: Committed the OpenClaw fresh-machine testing prep: settings Control UI descriptor, `/octoglyphs` status command, `?plugin=1` companion-window mode, hidden dev-only buttons in plugin mode, fresh-machine test guide, README updates, plan updates, and verified devlog record.
- **Why**: Ed can now test the package on a fresh machine with an explicit checklist instead of reconstructing paths, commands, and expected behavior from chat history.
- **Verification**: Before commit, `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`, and `npm run test && npm run build` passed from `PrimordialAI/game` with only the expected Phaser/Vite chunk-size warning.
- **What's next**: Commit this devlog-after-commit record, then run the fresh-machine guide. First live OpenClaw test target is `openclaw plugins install /path/to/PrimordialAI/octoglyphs/plugin/hosts/openclaw`, start companion with `npm run dev`, open `http://localhost:5173/?plugin=1`, then use `/octoglyphs` and a normal OpenClaw turn.

### Previous: OpenClaw Fresh-Machine Test Prep
- **Changed**: Added OpenClaw polish for fresh-machine testing. The plugin now registers a settings Control UI descriptor plus `/octoglyphs` command, the game has `?plugin=1` companion-window mode that hides dev-only buttons and labels itself as OpenClaw companion mode, and `hosts/openclaw/FRESH_MACHINE_TEST.md` documents clean-machine install, build, receiver smoke test, and live OpenClaw package-install steps.
- **Why**: The SDK scaffold and local receiver were already proven. The remaining blocker before Ed can test on a fresh machine was a clear install path and a discoverable OpenClaw-facing launch/status surface.
- **Verification**: `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`. `npm run test && npm run build` passed from `PrimordialAI/game`; only the expected Phaser/Vite chunk-size warning remains.
- **What's next**: Commit this polish pass, update this devlog again after that commit, then let Ed run the fresh-machine test guide.

### Previous: OpenClaw SDK Validation Pass Committed
- **Commit**: `8e34996` (`Validate OpenClaw plugin scaffold`).
- **Changed**: Committed the OpenClaw SDK validation pass, including real SDK dependency install/lockfile, typed hook option fix, adapter contract test, README/adapter notes, plan updates, and devlog record.
- **Why**: The OpenClaw host scaffold is now verified against the installed `openclaw@2026.4.27` package instead of only matching documentation assumptions. This locks in the first native plugin checkpoint.
- **Verification**: Before commit, `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`, and `npm run test && npm run build` passed from `PrimordialAI/game` with only the expected Phaser/Vite chunk-size warning.
- **What's next**: Add OpenClaw-facing polish: Control UI descriptor if useful, companion-window launch/install docs, and then live install-test inside an OpenClaw gateway.

### Previous: OpenClaw SDK Validation Pass
- **Changed**: Installed OpenClaw SDK dependencies for the OctoGlyphs OpenClaw host package, generated package lock, type-checked against `openclaw@2026.4.27`, fixed hook registration options to match published types, added a local adapter contract test, and updated OpenClaw adapter docs/plan.
- **Why**: The companion bridge was proven in browser, so the next risk was whether the native plugin scaffold actually matches real OpenClaw SDK types instead of only matching docs.
- **Finding**: OpenClaw docs mention hook `timeoutMs`, but the installed `OpenClawPluginApi.on(...)` type currently accepts only `{ priority?: number }`. OctoGlyphs now uses `{ priority: 0 }` and keeps the fetch abort timeout inside its own companion emitter.
- **Verification**: `npm run typecheck && npm test` passed from `PrimordialAI/octoglyphs/plugin/hosts/openclaw`. `npm run test && npm run build` passed from `PrimordialAI/game`; only the expected Phaser/Vite bundle-size warning remains.
- **What's next**: Add OpenClaw-facing polish: try a Control UI descriptor for discoverability/settings, write clear companion-window launch/install docs, then install-test inside a live OpenClaw gateway.

### Previous: Companion Browser Smoke Test Recorded
- **Commit**: `68c1f1c` (`Record companion browser smoke test`).
- **Changed**: Updated `docs/DEVLOG.md` and `octoglyphs/plugin/PLAN.md` to record that valid `octoglyphs.events.v1` envelopes posted to `/octoglyphs/events` spawned gems in the running browser game.
- **Why**: The companion bridge is now proven beyond tests/builds. It works through the real dev-server POST endpoint, `EventSource` stream, browser sanitizer, and Phaser reward mapping.
- **Verification**: User confirmed both corrected terminal command blocks spawned gems. Prior `npm run test && npm run build` passed from `PrimordialAI/game` with only the expected Vite bundle-size warning.
- **What's next**: Validate the OpenClaw TypeScript scaffold against the real OpenClaw SDK/types and decide how OpenClaw should open or connect to the visual side panel.

### Previous: Companion Receiver Browser Smoke Test Passed
- **Browser test**: The user ran the Vite dev server, opened OctoGlyphs, and posted valid `octoglyphs.events.v1` envelopes to `POST /octoglyphs/events` from a terminal.
- **Result**: Both tested command blocks spawned gems in the running browser game, proving the local receiver and `EventSource` stream path work end to end without using the browser console bridge.
- **Privacy boundary**: The endpoint still requires the protocol envelope and rejects raw events. Streamed events still pass through the strict allowlist sanitizer before Phaser gameplay receives them.
- **Why**: This validates the real plugin transport path: host adapter posts safe envelope, Vite receiver streams it, browser bridge sanitizes it again, and OctoGlyphs converts it into rewards.
- **Verification**: Prior `npm run test && npm run build` passed from `PrimordialAI/game`; browser smoke testing now confirms runtime behavior.
- **What's next**: Validate the OpenClaw TypeScript scaffold against the real OpenClaw SDK/types and decide how OpenClaw should open or connect to the visual side panel.

### Previous: Companion Receiver Bridge Committed
- **Commit**: `c6c1d9a` (`Add OctoGlyphs companion receiver`).
- **Companion bridge**: Added `game/vite.config.js` with a local development receiver at `POST /octoglyphs/events` and an event stream at `GET /octoglyphs/stream`.
- **Runtime connection**: Updated `game/src/plugin/octoglyphsBridge.js` so the browser tank listens to `/octoglyphs/stream` through `EventSource`, then runs every received event through the existing privacy guard before gameplay.
- **OpenClaw path**: The native OpenClaw scaffold already posts to `/octoglyphs/events`, so this creates the first working route from native host adapter to running Phaser tank during local dev.
- **Tests**: Added `game/tests/companionReceiver.test.js` plus `npm run test:companion` and aggregate `npm run test`.
- **Why**: The scaffold had privacy-safe events but no transport into the browser game. This closes that loop for dev mode while preserving the sanitizer boundary.
- **Verification**: `npm run test && npm run build` passed from `PrimordialAI/game` before commit. Only the expected Phaser/Vite bundle-size warning remains.
- **What's next**: Browser-test by running the Vite dev server, opening OctoGlyphs, and POSTing a protocol envelope to `/octoglyphs/events`; then validate the OpenClaw TypeScript scaffold against real SDK/types.

### Previous: OpenClaw Native Plugin Scaffold Started
- **Commit**: `d75796b` (`Scaffold OpenClaw plugin host`).
- **Scaffold added**: Created `octoglyphs/plugin/hosts/openclaw/` with `package.json`, `openclaw.plugin.json`, `tsconfig.json`, `src/index.ts`, `src/privacy.ts`, `README.md`, and `ADAPTER_NOTES.md`.
- **Docs checked**: Used the authoritative OpenClaw docs at `https://docs.openclaw.ai/plugins/building-plugins` plus the linked hooks, manifest, and entrypoint docs.
- **Runtime shape**: The scaffold uses Node 22/TypeScript ESM, `definePluginEntry`, package `openclaw.extensions` / `runtimeExtensions`, and a native `openclaw.plugin.json` manifest.
- **Privacy-safe hooks only**: Registered `model_call_started`, `model_call_ended`, and `after_tool_call`. The adapter avoids content-bearing hooks like `llm_input`, `llm_output`, `message_received`, `before_prompt_build`, and `before_tool_call`.
- **Event mapping**: `model_call_started` maps to `response.started`; `model_call_ended` maps to `response.completed`; `after_tool_call` maps to `tool.used` with only broad tool category, duration, and success metadata.
- **Why**: OpenClaw integration needs a native adapter, but OctoGlyphs must preserve the blind-plugin privacy promise before side-panel polish or packaging work.
- **Verification**: `npm run test:privacy && npm run build` passed from `PrimordialAI/game` before commit. Files are scaffolded and plan checklist is updated. This has not yet been type-checked against a real OpenClaw SDK install.
- **What's next**: Validate the scaffold against OpenClaw SDK/types, then add the companion receiver/window bridge so native plugin events reach the running Phaser tank.

### Previous: Host-Neutral Plugin Event Bridge Committed
- **Commit**: `28257ff` (`Add OctoGlyphs host event bridge`).
- **Bridge generalized**: Added `game/src/plugin/octoglyphsBridge.js` with `window.octoglyphs.emit(event)` and `postMessage` support using protocol marker `octoglyphs.events.v1`.
- **Privacy filter hardened**: Reworked `game/src/plugin/privacyGuards.js` into a strict allowlist sanitizer for the documented event types. Unknown event fields are dropped before Phaser sees them.
- **Runtime routing updated**: `main.js` now emits a single sanitized `octoglyphs:event` into the game instead of legacy `octoglyphs:usage`, `octoglyphs:chunk`, and `octoglyphs:tool` callbacks.
- **Gameplay mapping added**: `IncubationScene` now handles `prompt.sent`, `response.chunk`, `response.completed`, `tool.used`, `build.finished`, and `commit.created` events for prompt bursts, response trickle gems, final response bursts, tool-colored gems, build rewards, commit rewards, and Tank Hunt charge.
- **Prompt burst tuned**: Browser console smoke test confirmed `window.octoglyphs.emit(...)` reaches gameplay, but a 1,000-character prompt only made one visible gem with the first scaling formula. Prompt bursts now use `ceil(promptScale / 70)` clamped to 3-16 gems so metadata-only prompts feel rewarding.
- **Privacy test added**: Added `game/tests/privacyGuards.test.js` and `npm run test:privacy`. The test proves prompt/response/code/stdout/stderr/diff content is stripped, tool names are reduced to safe categories, and unknown event types are rejected.
- **Why**: This locks in the host-neutral privacy boundary before OpenClaw-specific adapter work. OpenClaw and Claude Code should now only need adapters that emit safe protocol events.
- **Verification**: `npm run test:privacy && npm run build` passed from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Start the OpenClaw native plugin scaffold under `octoglyphs/plugin/hosts/openclaw/`, including package metadata, manifest, entry point, and privacy-safe hook mapping notes.

### Previous: Plugin Documentation Scaffold
- **Plugin docs committed**: Added the first privacy/protocol/OpenClaw documentation pass as `3ced5d0` (`Add OctoGlyphs plugin docs`).
- **Plugin plan committed**: Rebrand, octo boss projectile patterns, and initial OpenClaw/Claude Code plugin plan were committed as `d031c43` (`Rebrand to OctoGlyphs and add plugin plan`).
- **Privacy docs started**: Added `PRIVACY.md` with plain-English privacy promise, allowed metadata, forbidden data, stripping rules, and OpenClaw hook policy.
- **Event protocol started**: Added `EVENT_PROTOCOL.md` defining host-neutral sanitized events for prompts, responses, tools, builds, commits, and sessions.
- **OpenClaw notes started**: Added `OPENCLAW_NOTES.md` capturing docs findings, hook choices, scaffold target, and unresolved integration questions.
- **Plan updated**: Marked Phase 0 docs complete in `octoglyphs/plugin/PLAN.md` and moved next action to auditing existing game-side bridge files.
- **Why**: Before wiring OpenClaw, OctoGlyphs needs a stable privacy boundary and host-neutral protocol so the game never depends on raw host payloads.
- **Build result**: Production build passed from `PrimordialAI/game` before the rebrand/plugin-plan commit. Only expected Vite chunk-size warning remains.
- **What's next**: Audit `game/src/plugin/openclawBridge.js` and `game/src/plugin/privacyGuards.js`, then generalize them toward the event protocol.

### Previous: OctoGlyphs Rebrand
- **Name change**: User-facing game name changed from Primordial.ai/Primoral.ai to OctoGlyphs across title, header, FTUE copy, package metadata, README, GDD, build spec, and devlog.
- **Runtime namespace**: Phaser event channels and music/save localStorage keys now use `octoglyphs` naming.
- **Save migration**: Existing `primordial.save.v1` saves are still read as legacy saves so testers should not lose progress after the rebrand.
- **Why**: OctoGlyphs better matches the octo-trait identity, collectible glyph/pickup loop, and evolving build language.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Browser-test title/header, save migration, reset-save behavior, music mute persistence, prompt charge events, and octo boss projectile waves; then commit if good.

### Previous: Octo Boss Projectile Patterns
- **Octo boss shots**: Halloween/octo bosses now fire slow, non-homing spread patterns while they pressure the player with lunges and summons.
- **Readable dodging**: Shot patterns rotate between narrow, medium, and wide spreads, use bright tints, move slowly enough to dodge, and deal one damage so they create positioning pressure without becoming unfair.
- **Projectile helper upgrade**: Enemy projectiles can now choose texture, spawn offset, depth, alpha, and rotation, which supports more boss-specific patterns later.
- **Why**: Octo bosses could still feel passive when they were slow relative to the player. Non-homing projectiles add variety without making the player feel cheated.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Browser-test octo boss waves and verify shots are visible, dodgeable, and not too spammy alongside add summons. If good, commit this pass; if not, tune cooldown/spread/speed before locking it.
### Latest: Mutation Feel Pass One
- **Step 12 started**: Several common and uncommon Tank Hunt mutations now evolve into secondary behaviors at higher ranks instead of only increasing numbers.
- **Build-defining links**: Streamlined can add wake trails, Rapid Ink can add rear shots, Heavy Ink can create growing/accelerating shots, Pressure Jet can add homing, Data Magnet can trigger gem shock pulses, Thick Drop can add pierce, Soft Shell can add guardian orbit, Piercing Drop can add broadside shots, Venom Ink can add contagion, and Critical Eye can add prism forks.
- **Why**: Hunts still risked feeling too similar because many upgrade cards were pure stat scaling. This gives repeated picks Isaac-style identity shifts without replacing the existing bullet-flag system.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Browser-test whether upgraded common cards now change playstyle noticeably. Watch for overstacking around homing, gem pulse, contagion, and prism fork; tune thresholds if dense waves become too easy.


### Latest: Sprite-Shaped Pickup Glow Pass
- **Gem glow refinement**: Replaced the simple circular glow stack with sprite-shaped glow copies plus a softer additive aura, so gems read closer to the old Unity splash-style shimmer instead of UI circles.
- **Animated glow sync**: Gem glow copies now follow the spinning gem frame, preventing frozen/static halos around animated pickups.
- **Trait pickup glow**: Trait discovery pickups now get the same sprite-shaped aura, rarity/slot-colored bloom, desynced sparkles, and animated-frame sync when their assets have multiple frames.
- **Cleanup fix**: Tank Hunt gem clearing now destroys gems through the shared helper, so starting a hunt removes both old gems and their glow helpers instead of leaving orphan glow sprites behind.
- **Why**: Browser testing showed the first glow pass was too circular, the static glow looked wrong on spinning gems, and trait pickups needed the same collectible readability treatment.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Hard refresh and verify gem/trait glow density in dense waves. If this visual pass holds, move to Step 12: weapon and mutation feel pass focused on build-defining upgrades rather than stat-card upgrades.


### Latest: Stronger Gem Glow Desync
- **Gem glow visibility**: Increased gem glow radius, alpha, additive blend, and core brightness so the effect reads clearly during gameplay instead of disappearing behind the sprite/background.
- **Sparkle timing**: Sparkles now use random delays, durations, holds, and repeat delays per gem so they no longer pulse in sync across the screen.
- **Sparkle shape**: Replaced tiny sparkle circles with small additive star shapes for a more obvious splash-style shimmer.
- **Why**: Browser testing showed the previous glow was too subtle and synchronized sparkles looked artificial.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Hard refresh and test dense waves. If the glow is now too strong or too noisy, tune alpha and sparkle count down.

### Latest: Chain Lightning Cap and Sideways Enemy Orientation Fix
- **Chain Lightning nerf**: Chain arcs are now capped at 2-3 jumps and each jump uses weaker damage, with pierce/split stripped from spawned chain bullets so it cannot cascade across the whole window.
- **Card text updated**: Chain Lightning now describes capped weaker arcs instead of implying uncapped screen-clearing behavior.
- **Sideways enemy fix**: `enemyshark.gif`, `enemywhale.gif`, and `enemynarval.gif` variants keep fixed art orientation now. They still move using their assigned behaviors, but no longer rotate or flip to face the player.
- **Why**: Chain Lightning was overperforming, and sideways GIF art looked wrong when rotated toward the player.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Browser-test chain builds on dense waves and verify shark/whale/narval sprites stay visually stable while moving.

### Latest: Enemy Behavior Variety (Step 11)
- **Step 11 started**: Normal hunt enemies no longer mostly share the same direct chase pattern.
- **New movement roles**: Added wanderer, herder, zigzag, spiraler, blocker, dart, pouncer, and sniper behaviors on top of existing drifter/flanker/charger logic.
- **Asset-specific identities**: Jellies wander, eels zigzag, small fast fish pounce/dart, heavier enemies block/herd, narvals keep range and shoot, and whales act as slow blockers.
- **Sniper projectiles**: Narval-style enemies now maintain range and fire faster blue shots instead of only joining the chase clump.
- **Why**: Hunts were still feeling samey because enemies tended to fall into a single line behind the player. This pass should make waves create different dodge shapes and route decisions.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.
- **What's next**: Browser-test wave 1-8 feel, especially whether new enemies are interesting without becoming unfair. If movement feels better, Step 12 should tune weapon/mutation feel and add stronger visual feedback for build-defining upgrades.

### Latest: Background Sync and Tile Coverage Fix
- **Background assets synced**: Copied latest shallow/deep PNGs from `sorted-octo-assets/Backgrounds` into `game/public/assets/raw/Backgrounds` so runtime uses newest art.
- **Black gap fix**: Expanded hunt background tile grid from 5x5 to 7x7 and recentered tiles around camera center instead of anchoring from worldView corner.
- **Seam guard**: Background tiles now use centered origins and a tiny display-size overlap to prevent subpixel gaps during fast swimming/camera follow.
- **Build result**: Production build passes from `PrimordialAI/game`. Only expected Vite chunk-size warning remains.

### Latest: Leveling Breakpoints and Upgrade Pool Polish
- **Step 7 complete**: Replaced smooth XP multiplier curve with deliberate breakpoints: 10 → 16 → 24 → 35 → 50 → 70 → 95 → 125 → 160 → 200 → 245 → 295 → 350 → 410 → 475.
- **Level-up cooldown**: Added a 900ms buffer after each level-up so gem bursts and vacuumed gems cannot immediately trigger another upgrade screen.
- **Loadout-aware XP**: Persistent `nextXpMult` bonuses now scale the whole breakpoint table instead of only the first threshold.
- **Prism evolution update**: Prism family evolution now reduces the breakpoint table by 8% and safely recalculates next XP.
- **Step 8 first pass complete**: Upgrade choices now have roles (`offense`, `defense`, `mobility`, `utility`, `control`) instead of being pure random weighted picks.
- **Smarter drafts**: Early weak builds are nudged toward offense, later fragile builds toward defense, slow builds toward mobility, and low-magnet builds toward utility.
- **Less samey choices**: Recent mutation roles are downweighted, duplicate roles in the same draft are downweighted, and the current primary family gets a small bias so builds still form coherent identities.
- **Build result**: Production build passes. Only expected Vite chunk-size warning remains.

### Latest: Boss Movement Tuning
- **Boss moves already existed**: Shark bosses use stalk → wind-up → charge → recover, mummy shark phases between vulnerable chase and invulnerable rush, and Halloween octo bosses summon adds.
- **Pressure pass**: Shortened boss cooldowns, increased chase/charge/rush speeds, and scaled dash/rush speed harder against fast player loadouts.
- **Halloween octo lunge**: Added a direct lunge attack between add summons so octo bosses are not just slow summoners.
- **Build result**: Production build passes. Only expected Vite chunk-size warning remains.

### Latest: Boss Reward Choices (Step 9)
- **Step 9 complete**: Boss kills now open a dedicated Boss Reward choice screen before the Continue/End Hunt screen.
- **Reward pool**: Added eight boss signals: Abyssal Cache, Predator Heart, Ink Overclock, Current Surge, Boss Bane, Frozen Eye, Venom Crown, and Prism Tithe.
- **Choices matter**: Boss rewards include banked gems, healing, guardian charges, fire-rate/damage boosts, pierce/orbit boosts, freeze/crit, poison/contagion, and lower XP requirements.
- **Draft logic**: Boss reward choices avoid repeated reward IDs and try to present different families in the same draft.
- **Flow fix**: Boss defeat now routes through Boss Reward → Continue/End Hunt, preserving the existing endless-hunt choice while making boss clears feel more rewarding.
- **Safety guards**: Player/enemy movement and XP processing pause while the boss reward overlay is open.
- **Build result**: Production build passes. Only expected Vite chunk-size warning remains.

The synergy system adds 15 named set bonuses (Pirate King, Full Metal, Speed Demon, Tech Lord, Ninja, Berserker, Clown Fiesta, Archmage, Mad Science, Crypto Whale, Zombie Apocalypse, Fortune Teller, Bullet Storm, Ice Fortress, Shadow Assassin). Each requires 3 items from different slots. Active synergies apply bonus huntMods + statMods. Partial synergies show progress in loadout (e.g. "2/3 Pirate King"). Synergy banner text appears at hunt start.

The loadout screen now shows hunt mod tags (blue pills showing Pierce, Homing, Bounce, etc.), synergy progress, sorting by stat/rarity/price, and quick build presets like Fastest, Luckiest, Strongest, Toughest, Gem Farm, and Magnet. Presets choose the best owned trait in each normal slot and clear legendary so body/accessory combos are visible again. Quick Builds and Sort controls are now laid out as tidy multi-row grids instead of crowded horizontal strips. Recent panel CSS fixes also allocate a real Shop Sort row and collapse the old Loadout blank gap by letting the trait list own remaining space.

Backgrounds now use the new shallow/deep environment set from `sorted-octo-assets/Backgrounds`, synced into `game/public/assets/raw/Backgrounds`. Tank tiling uses stable mirrored grid coordinates so seams are reduced without the old mid-scroll flip pop. Hunt progression now advances backgrounds only after boss clear and Continue Wave, in strict order from `shallow1` through `shallow4`, then `deep1` through `deep4`, and resets on new hunt. Music support exists with a top-bar mute button, persistent mute state, and `octosong1.mp3` through `octosong8.mp3` playlist support from `game/public/assets/raw/music`.

Latest browser test result: readability on colorful backgrounds needed stronger contrast, so gameplay entities now have dark outline/shadow passes plus selective halos/glows. Wave transition race bugs were fixed with a wave-resolution lock and token system, preventing duplicate bosses, skipped Continue Wave screens, and stacked continue overlays. Difficulty was softened in this checkpoint after the first background pass, then nudged back upward with autopilot anti-oscillation. Latest Halloween pass removes oversized Halloween small-enemy gifs from normal waves, promotes them to boss variants, adds red/mummy shark bosses plus special Halloween octo bosses, and wires Halloween spin/death assets for hunt readability. Latest evolution pass adds fallback reward pools for thin slots, keeps rare fusions pointed at legendary forms, and adds Space-bar panic mines using animated mine assets. Latest hunt polish fixes Phaser 4 Space input, makes enemy spawning use guaranteed animation frames, locks Halloween octo boss orientation, scales Halloween octo bosses larger, and removes sideways shark/narwhal/whale bosses from rotation.

Tank Hunt now uses a **Wave Recipe system** (Steps 1-3 of the VS-style difficulty plan): 8 named wave templates (Swarm, Charger Rush, Flanker Ambush, Tank Wall, Mixed Assault, Blitz, Siege, Boss Prep) control enemy composition, count multiplier, speed modifier, HP modifier, and spawn interval per wave. Enemies spawn in **formations** (line, ring, cluster, scatter) matched to recipe type instead of always random edge positions. **Spawn breathing** inserts brief lull pauses every few bursts so pressure pulses instead of streaming constantly. Gem XP now scales by type (green=1, blue=3, yellow=5, pink=8, silver=12) so better gems feel more exciting during hunts.

Unrelated repo items are still intentionally uncommitted: deleted old Unity backgrounds under `Assets/_GameData/Art/Background/_NewBgs`, `.vsconfig`, `Assets/OctoBlast.zip`, `SS.rar`, `SS/`, and `Assets/sorted-octo-assets/`.

Latest browser test result: Body stats now show meaningful deltas. Enemy behavior roles make Hunt feel less samey. New bullet path modifiers (wiggle, boomerang, lump-of-coal, chain, fear, freeze, spectral) add Isaac-style projectile variety so bullets change shape, speed, and trajectory based on mutations instead of always flying in straight lines. Chain Lightning is now capped to 2-3 weaker jumps so it cannot clear the whole visible window by itself, the sideways shark/whale/narval GIF enemies keep fixed art orientation instead of rotating toward the player, and pickup glow now follows animated gem/trait sprites instead of using static circular halos.

## 2026-04-27 — Chain Lightning Cap and Sideways Enemy Orientation Fix

**What**: Tuned an overperforming mutation and corrected fixed-orientation enemy art.

**Changes**:
- Chain Lightning now starts with a capped jump budget instead of using mutation rank as an open-ended cascade.
- Chain arcs are limited to 2-3 jumps and each spawned arc carries reduced damage.
- Spawned chain bullets no longer inherit pierce or split, preventing chain kills from multiplying into full bullet trees.
- Chain Lightning card text now communicates capped weaker arcs.
- `enemyshark.gif`, `enemywhale.gif`, and `enemynarval.gif` variants keep fixed visual orientation with no directional flip.

**Why**: Chain Lightning could clear dense waves too quickly, and the sideways GIF enemy art looked wrong when rotated or flipped toward the player.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Test dense waves with Chain Lightning ranks 1-3 and verify shark/whale/narval enemies no longer rotate or flip while moving.

## 2026-04-27 — Enemy Behavior Variety (Step 11)

**What**: Added a first pass of distinct normal enemy AI behaviors for Tank Hunt.

**Changes**:
- Reassigned normal enemy definitions to behavior roles instead of mostly drifter/flanker/charger.
- Added wanderer behavior for loose, organic jelly-style movement.
- Added herder behavior for enemies that hold medium range and orbit to push player movement.
- Added zigzag behavior for eel-style side-to-side pressure.
- Added spiraler behavior for enemies that spiral around the player instead of forming a straight chase line.
- Added blocker behavior for heavy enemies that try to occupy close space instead of racing behind the player.
- Added dart behavior for small fast enemies that stalk briefly, then commit to short direct bursts.
- Added pouncer behavior as a more readable charger with side sway while stalking.
- Added sniper behavior for narval-style enemies that maintain range and fire faster blue shots.
- Extended enemy projectile spawning with optional speed, scale, tint, radius, lifetime, and damage overrides.

**Why**: Hunts felt too samey because enemies mostly fell into a line and swam after the player. This pass gives enemy sprites different gameplay identities so wave recipes can feel different even before more weapon polish.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Test waves 1-8 in browser. Watch for unfair sniper density, dart enemies feeling too cheap, or blockers becoming bullet sponges. If this feels better, move to Step 12 weapon/mutation feel pass.

## 2026-04-27 — Boss Movement Tuning

**What**: Tightened existing boss movement patterns so bosses feel less passive relative to upgraded player speed.

**Changes**:
- Shark bosses enter their charge cycle sooner.
- Shark wind-up is shorter, charge duration is longer, charge speed is higher, and recovery is shorter.
- Mummy shark vulnerable chase is faster, invulnerable rush is faster, and phase windows are shorter.
- Halloween octo bosses now perform periodic lunges between add summons.
- Halloween octo add summons happen slightly more often but can spawn 2-4 adds instead of always 3-4.
- Boss dash/rush speed now scales more aggressively against high swim-speed loadouts.

**Why**: Bosses had special behaviors, but cooldowns and speed multipliers made them feel slow once the player had strong mobility. This pass should make bosses create dodge moments instead of just being large HP targets.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Test boss fights around waves 5, 10, and 15 with both slow/tanky and fast/mobile loadouts. If they still feel flat, next pass should add visible telegraph trails or boss-specific projectiles.

## 2026-04-27 — Boss Reward Choices (Step 9)

**What**: Added a post-boss reward layer so boss kills are meaningful build milestones instead of only gem drops plus the continue prompt.

**Boss rewards added**:
- Abyssal Cache banks 18 blue gems immediately and increases hunt magnet range.
- Predator Heart increases max hearts, fully heals, and adds a Guardian Orbit charge.
- Ink Overclock improves fire rate and projectile damage.
- Current Surge improves swim speed, bullet speed, and range.
- Boss Bane adds pierce and an orbiting ink drop.
- Frozen Eye adds freeze power and crit chance.
- Venom Crown adds poison and contagion.
- Prism Tithe lowers future XP requirements and adds luck.

**Why**: Step 9 gives boss clears the same kind of decision weight as Vampire Survivors chest moments or Isaac item rooms, while still fitting OctoGlyphs's signal/mutation language.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: In-game test the boss reward flow, then Step 10 — hunt end screen recap polish.

## 2026-04-27 — Leveling Breakpoints and Upgrade Pool Polish (Steps 7-8)

**What**: Reworked hunt leveling and upgrade drafts so pacing feels intentional and upgrade choices are less random/samey.

**Leveling breakpoints**:
- Replaced formula growth with explicit XP thresholds: 10, 16, 24, 35, 50, 70, 95, 125, 160, 200, 245, 295, 350, 410, 475.
- Past listed breakpoints, XP grows with a quadratic tail so endless waves keep scaling.
- XP still resets to 0 on level-up, preserving the previous no-overflow fix.
- Added `TANK_LEVEL_UP_COOLDOWN = 900` so vacuumed gems and gem bursts cannot immediately chain into another level.
- Persistent `nextXpMult` now creates a scaled breakpoint table at hunt start.
- Prism family evolution now reduces all remaining breakpoints by 8% and recalculates next XP safely.

**Upgrade pool polish**:
- Added mutation role map: offense, defense, mobility, utility, control.
- Drafts now force up to two needed roles before filling remaining slots.
- Early low-damage builds are nudged toward offense.
- Mid/late fragile builds are nudged toward defense.
- Slow builds are nudged toward mobility.
- Low-magnet builds are nudged toward utility.
- Weighted picker now downweights duplicate roles in a single choice set and roles picked in recent level-ups.
- Primary family receives a small draft weight bonus so builds still develop a recognizable identity.

**Why**: Level screens should feel like meaningful reward moments, not spam. Upgrade choices should include useful build correction without removing Isaac-style randomness.

**Build**: `npm run build` passes with only expected Vite chunk warning.

**What's next**: In-game test level pacing and draft quality. Then Step 9 — boss reward choices/post-boss special upgrades.

## 2026-04-27 — Difficulty Events (Step 6)

**What**: Temporary difficulty spikes at specific waves that change the rules for 12-15 seconds, creating memorable moments and testing builds differently.

**Events**:
- **"DEEP PRESSURE"** (waves 3, 13, 23) — Elite spawn chance doubles. Enemies slightly faster (+15%). Purple tint overlay. Tests whether the build can handle tougher enemies early.
- **"THE CURRENT"** (waves 7, 17, 27) — All enemies +40% speed, scaled relative to player speed so fast builds still feel pressure. Blue tint overlay. Punishes greedy gem collection, forces defensive play.
- **"FEEDING FRENZY"** (waves 10, 20, 30) — Double spawn rate AND double gem drop chance for 15s. Yellow tint overlay. High risk/high reward before the wave 10/20/30 boss.

**Player-scaling**: Event speed boost uses `(rawMult - 1) * max(1, playerSpeedFactor)` formula so fast players don't trivialize "The Current" — if you're 1.5x default swim speed, enemies get a proportionally larger boost. Event duration also scales slightly with player power score (+2.5% per power point, capped +25%).

**Visual feedback**: Full-screen color overlay fades in during event, event name flashes large on screen, "PRESSURE EASED" text when event ends, overlay fades out in last 500ms.

**Gem drop multiplier during Feeding Frenzy**: Both normal and elite drop chances doubled (capped at 52%/92%). Combined with double spawn rate, creates a gold-rush moment where aggressive play is rewarded.

**What's next**: Step 7 — Leveling Breakpoints (replace smooth 1.35x XP curve with deliberate plateaus for faster early levels and harder late levels).

## 2026-04-27 — Enemy Variety Expansion (3 → 15 types)

**What**: Converted all remaining enemy GIF assets to PNG frame sequences and integrated them into Tank Hunt. Enemy pool expanded from 3 to 15 distinct types.

**New enemies added**:
- `enemi1` (63×90, 8fr) — drifter, medium speed, appears wave 1
- `enemi2` (78×106, 8fr) — drifter, slow/tanky, appears wave 2
- `enemi3` (43×61, 8fr) — charger, fast/fragile, appears wave 3
- `enemi4` (52×56, 8fr) — flanker, slow/beefy, appears wave 4
- `enemi5` (58×74, 8fr) — charger, medium, appears wave 2
- `enemi1112` (30×47, 3fr) — charger, very fast/fragile, appears wave 1
- `enemi112` (30×47, 8fr) — drifter, medium, appears wave 2
- `enemi1132` (30×47, 8fr) — flanker, medium, appears wave 3
- `enemi1142` (30×47, 8fr) — drifter, slow/tanky, appears wave 4
- `narval` (100×100, 5fr) — flanker, slow/beefy, appears wave 5
- `shark` (100×100, 4fr) — charger, fast/strong, appears wave 4
- `whale` (100×100, 5fr) — drifter, very slow/tanky, appears wave 6

**Narval/shark/whale** use `fixedRotation: true` + `flipWithDirection: true` — they don't rotate to face the player, instead they flip horizontally based on movement direction (art faces right).

**Wave recipes updated**: Expanded from 8 → 10 templates. Added "Deep Swarm" (small enemies) and "Predator Pack" (sharks, narvals, fast fish). Each recipe now draws from 4-6 enemy types instead of 2-3.

**What's next**: Test enemy variety in-game. Then Step 7 — Leveling Breakpoints.

## 2026-04-27 — Boss Patterns (Step 5)

Three distinct boss behaviors replace the old generic "chase with sine wave":

- **Shark bosses (boss_charger)**: Stalk → wind-up telegraph (red flash) → straight-line charge → recovery pause → repeat. Charge speed scales relative to player max speed (1.4× player speed) so it's always threatening but dodgeable if you move perpendicular. Recovery phase is the damage window.
- **Halloween octo bosses (boss_summoner)**: Steady drift toward player. Every 4-6 seconds spawns 3-4 mini jellyfish adds near itself (purple flash telegraph). Creates pressure to clear adds while dealing boss damage. Summon interval decreases slightly in later waves.
- **Mummy shark (boss_phaser)**: Alternates between slow vulnerable chase (damage window, full opacity) and fast invulnerable rush (semi-transparent + green tint, IMMUNE text on hit). Rush speed scales to 1.2× player speed. Player must time damage for vulnerable phases and dodge during invuln.

All boss pattern speeds scale relative to player's actual max speed (190 × persistent swimSpeed × hunt swimSpeed mutation), ensuring they remain fair regardless of starting loadout or mutation choices.

## 2026-04-27 — Offscreen Spawning, Ring Escape Gaps, Gem Economy Fix

**Problem**: Enemies appeared out of thin air inside the visible area, which looked unnatural. Ring formations could completely surround the player with no escape direction. Gem drop rate was still too generous (base 24%, scaling to 45%) and enemies with `gems: 0` still dropped 1 gem due to `|| 1` fallback bug.

**What changed**:

1. Spawn positions now use actual camera viewport dimensions + buffer to guarantee enemies always start offscreen and drift into view naturally.
2. Formation distances also use camera-based offscreen calculation instead of fixed 430px.
3. Ring formations now skip one slot, creating a ~60° escape gap so the player always has a direction to flee.
4. Base gem drop chance lowered from 24% to 15%. Scaling reduced from `+0.9/wave cap 45%` to `+0.6/wave cap 32%`. Luck multiplier reduced from 8x to 5x.
5. Fixed `gems` data read: changed `|| 1` to `?? 0` so enemies intentionally set to drop 0 gems actually drop nothing.
6. Boss gem bursts now spawn in a ring pattern (evenly spaced around death point) instead of a tight clump with ±24px random offset.

**Why this matters**: Enemies now feel like they're approaching from outside the tank rather than materializing. Ring waves are survivable with good positioning. Gem economy should feel noticeably tighter — kills don't always pay out, making gem pickups feel more meaningful when they do appear.

Build: passes (Vite large bundle warning only). Commit: `ba359fd`.

**Next**: Continue Steps 5-7: Boss patterns, difficulty events, leveling breakpoints.

## 2026-04-27 — Wave Recipes, Spawn Formations, Spawn Breathing, Gem XP Scaling (Steps 1-3-4)

**Problem**: Tank Hunt felt the same every run. All waves spawned random enemies from random screen edges at constant intervals. Every gem gave flat 1 XP regardless of rarity. No wave had identity — swarm vs charger vs tank wall felt identical. No breathing room between spawn bursts.

**What changed**:

1. Added 8 named wave recipes: Swarm (many slow jellyfish), Charger Rush (fast fish/eel), Flanker Ambush (eels from sides), Tank Wall (slow high-HP), Mixed Assault (balanced), Blitz (fast + dense, wave 5+), Siege (very tanky, wave 6+), Boss Prep (light wave before boss).
2. Each wave now picks a recipe based on wave number. Recipe controls enemy type pool, count multiplier (0.6x–1.5x), speed multiplier (0.6x–1.5x), HP multiplier (up to 3x for siege), and spawn interval modifier.
3. Added formation spawning: enemies arrive in lines (charger/blitz/tank wall), rings (swarm), clusters (swarm), or scattered (fallback). Formations use a fixed direction angle so enemies look intentional, not random.
4. Added spawn breathing: every 3-4 bursts (scales with wave), one burst is skipped as a lull. This creates pressure-release cycles instead of constant streams.
5. Gem XP now scales by type: green=1, blue=3, yellow=5, pink=8, silver=12. Better gem drops from elites/bosses now feel more exciting during the hunt.
6. Resume-after-upgrade timer now uses the current wave recipe interval instead of hardcoded formula.

**Why this matters**: Each wave should now feel different — "that was a swarm" vs "that was a charger rush" vs "that was a tank wall." Formations make enemy entrances readable. Breathing gives moments to collect gems and reposition. Gem XP scaling makes rare drops exciting instead of just wallet value.

Build passes with the expected Phaser/Vite large bundle warning.

**Next**: Steps 5-7: Boss patterns (unique behavior per boss type), difficulty events (named mid-wave modifiers), and leveling breakpoints (non-linear XP curve).



**Problem**: Tank Hunt could freeze when Space panic mines used `Phaser.Input.Keyboard.JustDown` as a global in a Phaser 4 module file. After animated enemy conversion, enemy spawns could also fail or appear invisible if code spawned from a base GIF texture key instead of a generated frame key. Halloween octo body bosses were rotating like normal sharks, which looked wrong because those assets already swim best in a fixed orientation. Side-facing shark, narwhal, and whale GIFs also looked bad when rotated toward the player.

**What changed**:

1. Imported Phaser `Input` module and changed Space mine input to `Input.Keyboard.JustDown(this.keys.SPACE)`.
2. Added a tank enemy texture resolver that spawns enemies from guaranteed loaded frame textures such as `tank-enemy-jelly-0`.
3. Hardened enemy animation so it only swaps to texture frames that exist.
4. Added fixed-rotation support for Halloween octo body bosses so they move toward the player without turning.
5. Increased Halloween octo boss scale so they read as bosses instead of normal bodies.
6. Removed side-facing shark, narwhal, and whale bosses from code rotation and preload references because their source art faces right and looks wrong when rotated.

**Why this matters**: Tank Hunt should start reliably, Space mines should not crash Phaser 4, animated enemy frame conversion is safer, and octo bosses now match their art direction.

Build passes with the expected Phaser/Vite large bundle warning.

**Next**: Retune Tank Hunt economy and difficulty. Bosses die too easily, enemy gem rewards are too generous, and pickup lifespan/XP banking needs design review against Vampire Survivors-style pacing.

## 2026-04-27 — Evolution Rewards and Panic Mines

**Problem**: Evolution was mechanically working but could still feel broken because some slots, especially eyes, had tiny next-tier pools. Example: only two uncommon eyes exist, so common-eye evolution could quickly hit “No unowned uncommon eyes traits available.” Separately, Tank Hunt needed a panic action, and player-dropped mines were a good fit for the existing mine assets.

**What changed**:

1. Added evolution fallback reward pools for thin slots. Eyes, clothes, and boosts still try to reward their own slot first, but if that next-tier pool is exhausted they can now reward compatible slots instead of dead-ending immediately.
2. Kept rare fusion pointed at legendary forms, so three rare bodies still evolve into a legendary form.
3. Fusion success modal remains active and now makes fallback rewards explicit in the result message when fallback was used.
4. Converted `Mine1.gif` and `MineG.gif` into generated PNG frame sequences under `game/public/assets/generated/tank-mines`.
5. Added mine asset preloading through `TANK_MINE_ASSETS`.
6. Added player mine group and collision handling in Tank Hunt.
7. Pressing Space during Tank Hunt now drops a short-arm panic mine that explodes on enemy contact or after a timeout.
8. Existing ink-mine mutation now uses the animated mine sprites instead of a plain debug circle.

**Why this matters**: Evolution should now feel safer, clearer, and less like it silently fails when a slot’s authored rewards run out. Panic mines give the player an emergency button that matches the idea of dropping mines while swimming.

Build passes with the expected Phaser/Vite large bundle warning.

**Next**: Browser-test three fusions: common body to uncommon body, uncommon body to rare body, and common eyes after uncommon eyes are exhausted. Also test Space panic mine during Tank Hunt and confirm it detonates against bosses and normal enemies.

## 2026-04-27 — Hunt Background Progression, Readability, and Wave Locks

**Problem**: The new colorful backgrounds made enemies, gems, projectiles, and the octo hard to read during active hunts. Background changes were also too abrupt when they happened during play. After difficulty was softened, wave clear logic exposed a race where extra deaths at the end of a wave could schedule multiple transitions, spawn multiple bosses, skip the expected Continue Wave screen, or stack duplicate Continue overlays.

**What changed**:

1. Background progression now advances only after a boss is cleared and the player clicks Continue Wave.
2. Background order is fixed to `shallow1 → shallow2 → shallow3 → shallow4 → deep1 → deep2 → deep3 → deep4` within a hunt, then resets to `shallow1` on the next hunt.
3. Background changes now fade out, swap, and fade back in instead of popping mid-wave.
4. Player octo layers, enemies, bosses, gems, bullets, orbit bullets, enemy projectiles, and splitter mini-enemies now receive dark outline/shadow treatment, with selective halos/glows on high-priority objects.
5. Base hunt HP was raised from 4 to 5 during this checkpoint.
6. Early difficulty was softened by reducing wave kill goals, spawn pulse rate, active enemy caps, enemy HP/speed scaling, boss HP/speed scaling, and elite frequency/brutality.
7. Added `tankWaveResolving`, `tankWaveToken`, and `tankContinueWave` guards so each wave can only resolve once, stale timers cannot start old waves, boss clears lock the wave until Continue/End, and duplicate Continue overlays are removed defensively.

**Why this matters**: The new art can stay vibrant without hiding gameplay objects, environment changes now feel like intentional depth progression, and endless hunt progression should no longer skip from wave 5 to wave 11 or spawn multiple bosses from one wave clear.

Build passes with the expected Phaser bundle-size warning.

**Next**: User says this may now be too easy, so retune difficulty back upward carefully without reintroducing the level 7 wall. Also fix autopilot oscillation where the octo can get stuck swimming back and forth forever.

## 2026-04-27 — Difficulty Curve Nudge and Autopilot Anti-Oscillation

**Problem**: After the safety pass, Tank Hunt became too forgiving. Outside hunt, autopilot could also get into a visible back-and-forth loop because it picked broad random wander points and did not detect poor progress.

**What changed**:

1. Increased wave kill goals from `8 + wave * 6` to `9 + wave * 7`.
2. Increased spawn pressure by shortening spawn pulse delay and raising spawn-per-pulse growth from every 3 waves to every 2 waves.
3. Raised active enemy cap from `14 + wave * 4` to `16 + wave * 5`.
4. Restored some pressure to bosses and enemies by increasing boss HP/speed, normal enemy per-wave HP growth, and normal enemy per-wave speed growth.
5. Slightly raised elite chance cap from 22% to 26%.
6. Changed autopilot tick rate from 850 ms to 320 ms for smoother steering.
7. Added persistent autopilot gem targets, distance-based slowdown near targets, timed wander target replacement, and stuck detection that picks a stronger turn when the octo is not making progress.

**Why this matters**: This should land between the original level 7 wall and the too-easy softened version, while making idle swimming feel more alive and less like the octo is trapped in a tiny ping-pong path.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Halloween Boss Pool and Special Octo Bosses

**Problem**: The two Halloween `small enemy` gifs were visually too large and distracting as normal wave fodder. Halloween special octo forms also existed as player/event forms but were not represented as boss encounters in Tank Hunt.

**What changed**:

1. Removed `tank-enemy-halloween-small-1` and `tank-enemy-halloween-small-2` from the normal wave enemy table.
2. Promoted those two oversized Halloween enemy gifs into boss-only variants.
3. Added red shark and mummy shark to the rotating boss pool.
4. Added all four Halloween special octo bodies as boss variants using their generated frame sequences.
5. Added lightweight frame animation support for boss definitions that specify frame counts.
6. Wired Halloween body spin frames into `BODY_SPIN_ASSETS` so event octo forms use their own spin art instead of falling back to generic blue spin art.

**Why this matters**: Normal waves stay readable and scale-consistent, while Halloween assets become meaningful boss encounters where their larger silhouettes feel intentional instead of broken.

Build passes with the expected Phaser bundle-size warning.

**Next**: Browser test whether Wave 5 through Wave 10 feel tense but fair, and watch idle autopilot for at least a minute to confirm it no longer oscillates forever.

## 2026-04-27 — Shallow/Deep Backgrounds, Music, and Panel Layout Fixes

**Problem**: The game needed to use the new shallow/deep background set and start supporting music with a mute button. The Shop Sort controls were overlapping the first trait card because the panel grid did not allocate a dedicated row for Sort. The Loadout panel still had a blank vertical gap because upper sections were allowed to reserve flexible space. Mirrored background tiling also needed to return to hide seams, but without reintroducing the old mid-scroll flip pop.

**What changed**:

1. Added `mediaCatalog.js` for background and music metadata.
2. Synced new shallow/deep backgrounds and music assets into `game/public/assets/raw` so Phaser can load them from browser-safe paths.
3. Switched tank backgrounds to shallow/deep environment selection, with later waves using deeper backgrounds.
4. Added playlist support for `octosong1.mp3` through `octosong8.mp3` and a top-bar Music mute/unmute button using the provided icons.
5. Saved mute state in local storage and starts music after first user interaction to satisfy browser autoplay rules.
6. Restored mirrored background tiling using stable world-grid coordinates so tile seams are softened without tiles flipping unexpectedly while scrolling.
7. Fixed Shop panel grid allocation so Sort has its own row above the scroll list.
8. Collapsed the Loadout blank gap by changing upper rows to natural height and letting the trait list take remaining panel space.

**Why this matters**: The tank can now rotate through stronger environment art and audio without manual code rewrites for every asset, while the UI remains usable after adding sorting and presets. Stable mirrored tiling gives the seamless look back without sacrificing camera stability.

Build passes with the expected Phaser bundle-size warning.

**Next**: Improve gameplay readability on bright backgrounds without just darkening the art. Best candidates are subtle entity outlines, soft player/enemy glow, background depth haze, vignette around tank edges, and a semi-transparent gameplay contrast layer. Also move background transitions to the Continue Wave click so the player never sees an environment snap mid-action.

## 2026-04-27 — Background Tile Stability and Loadout Control Polish

**Problem**: The tank background could appear to suddenly mirror or change orientation as the camera crossed tile boundaries. The loadout quick-build and sort controls also looked crowded, with labels and buttons fighting for horizontal space.

**What changed**:

1. Removed dynamic `flipX` / `flipY` toggling from recycled background tiles in `IncubationScene.js`. Tiles now keep stable orientation instead of changing mirror state as they move around the camera.
2. Reworked Sort controls into a clean multi-row grid with the label above the buttons.
3. Reworked Quick Builds so the title sits above the preset buttons and the buttons align as tidy rows.
4. Added mobile CSS adjustments so sort and preset controls stay usable on smaller screens.

**Why this matters**: The background should feel like a stable tank space, not a texture popping between mirrored states. The loadout panel is now easier to scan, especially after adding sorting and quick build presets.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Loadout and Shop Sorting Presets

**Problem**: After adding hundreds of meaningful traits, Shop and Loadout needed better ways to find items by desired build direction. The Loadout panel also had a natural blank area that could become useful quick-build space instead of dead UI.

**What changed**:

1. Added stat sorting to Shop and Loadout: Smart, Speed, Luck, Damage, Armor, Gems, Magnet, Idle, Rarity, and Price.
2. Added quick Loadout presets: Fastest, Luckiest, Strongest, Toughest, Gem Farm, and Magnet.
3. Presets select the best owned trait from each normal slot: body, eyes, hat, clothes, and boost.
4. Presets clear legendary form automatically, so users can return to visible layered body/accessory combos without manually unequipping legendary first.
5. Added sort scoring that considers direct `statMods` plus relevant `huntMods`, so combat traits like crit, chain, pierce, HP, guardians, and gem pulse influence sort ranking.
6. Added panel CSS for compact sort tabs and preset buttons.

**Why this matters**: With many traits, players need fast ways to build around intent instead of scrolling. This makes the system feel more like a buildcrafting game: "show me luck," "make me fast," or "give me a tough hunt build."

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Starting Power Rebalance

**Problem**: After the Isaac-style trait pass, geared players could spawn into wave one with too many endgame behaviors already active. The main issue was not any single item; it was stacking. Persistent stats, explicit `huntMods`, hidden name-based archetype seeding, dominant-family starter packages, and named synergies all layered before the first enemy spawned.

**What changed**:

1. Removed hidden mechanical bonuses from the old name-based `seedAssetHuntTrait()` path. It now only seeds family identity for bullet tint/archetype labeling. Gear still gets its explicit hunt behavior from `huntMods`, but no longer double-dips into extra poison, wake trail, guardians, fire rate, broadside, and similar hidden starter power.
2. Replaced `seedStartingArchetypePower()` with `seedStartingArchetypeIdentity()`. Dominant family still determines the hunt label and bullet family, but it no longer grants a free starter mutation package.
3. Added starting-power caps for major flags before wave one: projectile count, broadside, chain, homing, split, orbit, guardian charges, freeze/fear/poison, damage, HP, fire delay, bullet scale, speed, magnet, and XP acceleration are all bounded at hunt start.
4. Added `startingPowerScore` and light adaptive early pressure. Stronger starting builds get slightly more enemies per pulse, earlier elites, higher elite chance, and modest normal-enemy HP scaling. Weak starter builds still get gentle early waves.
5. Toned down all 15 synergies from large flag bundles into smaller identity bonuses. Synergies should now feel like a signature rule/flavor layer instead of giving four major combat flags at once.

**Why this matters**: Loadout should define run identity, not start the player in endgame bullet-hell mode. Mutations should be where the build becomes absurd. This preserves the fun of Isaac-style combinations while restoring hunt arc: start distinct, earn power, then snowball.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Isaac-style Composable Bullet System + Synergies

**Problem**: Most items were stat-identical clones. ~60 hats were "Luck +0.03x". Eyes were "Magnet +0.04x". No item changed how the hunt actually played. Binding of Isaac works because each pickup flips composable tear flags. We had the flag system (pierce, homing, bounce, split, chain, etc.) but items didn't write to it.

**What changed**:

1. **Full catalog identity pass**: Every single trait (204 items total) now has unique `huntMods` that compose bullet flags. No two items in the same slot do the same thing. Eyes affect targeting (homing, crit, pierce, split). Hats affect defense/utility (guardian, fear, freeze, mines, plus one offensive flag). Clothes affect survival style (armor + 2-3 composable flags). Boosts affect offense (damage, fire rate, projectile behavior). Bodies set the fundamental run character.

2. **Synergy system**: 15 named set bonuses (3 items each, all from different equippable slots). Active synergies apply bonus huntMods + statMods on hunt start and show a celebration banner. Partial synergies display progress in loadout screen ("2/3 Pirate King"). Synergies: Pirate King, Full Metal, Speed Demon, Tech Lord, Ninja, Berserker, Clown Fiesta, Archmage, Mad Science, Crypto Whale, Zombie Apocalypse, Fortune Teller, Bullet Storm, Ice Fortress, Shadow Assassin.

3. **Loadout UX upgrade**: Each item now shows blue hunt-mod tag pills (Pierce, Homing, Bounce, Chain, etc.) so players can see exactly what flags an item flips. Synergy readout section appears between summary and slot tabs.

4. **Idle stat synergy integration**: `equippedStats()` now includes synergy stat bonuses in the persistent/idle calculation.

**Why this matters**: A player equipping Eye Patch + Pirate Hat + Pirate Outfit now sees "Pierce, Crit" + "Gem Pulse, Split, Pierce" + "Gem Pulse, Pierce, Broadside" = ⚓ Pirate King ACTIVATED with piercing crit broadside gem-rain. Every loadout combination creates a different run. This is the Isaac model.

**Files changed**: assetCatalog.js (full rewrite with huntMods on all 204 items), synergies.js (new file — 15 synergies + check/aggregate functions), IncubationScene.js (synergy detection + application + banner), UIScene.js (synergy readout + hunt mod tags), saveStore.js (synergy stat integration), panel.css (synergy + tag styles), index.html (synergy div), DEVLOG.md.

Build passes with the expected Phaser bundle-size warning.

Fixed Phaser 4 warning from enemy damage flash. `setTintFill()` is removed in Phaser 4, so enemy hit flashes now use `setTint(...).setTintMode(TintModes.FILL)` and restore multiply tint mode afterward.

Hardened the boss-clear continue overlay against duplicates. Showing continue choices now clears any existing continue/upgrade overlay first, tags the DOM node, and cleanup removes any stale continue overlays from the panel. The delayed next-wave callback also now checks the hunt is still active and no continue choice is open before spawning another wave.

Build passes with the expected Phaser bundle-size warning.

Fixed legendary unequip and cleaned up the crowded loadout menu. Legendary loadout now has an explicit "Unequip Legendary" card that clears the special form and returns the octo to normal layered body/eyes/hat/clothes visuals. The loadout panel now gives summary tiles, synergy readout, slot tabs, and item list more usable grid space. Equipped cards are more clearly selected, empty summary tiles are dimmed, synergy readout scrolls when needed, and the unequip card has danger styling.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — First Item Identity Pass

Implemented the first brainstormed item identity pass. Several signature eyes, hats, boosts, and all legendary forms now carry `huntMods` in addition to normal stat modifiers. These are Isaac-style rule changes for Tank Hunt: extra homing, crits, prism forks, wake trails, backblast, bounce, chain lightning, mines, guardian charges, faster fire delay, extra projectiles, and faster leveling.

Made all 10 legendary forms unique instead of identical. They now have named archetypes: Blitz, Juggernaut, Black Hole, Chain Storm, Fortress, Evolver, Glass Cannon, Jackpot, Bullet Hell, and OctoGlyphs. Equipping different legendary forms should now seed different Tank Hunt behavior instead of only changing visuals.

Updated Tank Hunt loadout application so equipped assets can apply explicit `huntMods`, then reconfigure autofire and orbiters before the hunt begins.

Build passes with the expected Phaser bundle-size warning.


## 2026-04-26 — Legendary Loadout Slot + Rarity Badges

Fixed the follow-up rare-fusion issue: evolved legendary forms were being unlocked, but Loadout only had Body, Eyes, Hat, Clothes, and Boost tabs. Added a dedicated Legendary loadout tab and save slot so legendary forms can be selected after fusion.

Legendary forms now render as full-body special forms in the tank. When a legendary is equipped, the normal layered body/eyes/hat/clothes/boost stack is hidden so the special-form sprite is visible cleanly.

Added colored rarity badges anywhere trait rarity appears in Shop, Loadout, and Evolution. Common is pale, uncommon is green, rare is purple, and legendary/event is gold so the words stand out more.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Rare Fusion Now Produces Legendary Forms

Fixed rare → legendary evolution. The fusion code was only looking inside normal shop assets, but legendary octos live in the special-form catalog. Rare fusion now pulls from `SPECIAL_FORM_ASSETS`, so sacrificing 3 rare unequipped traits can produce an unowned legendary form. Common → uncommon and uncommon → rare still use the normal shop catalog.

Also changed the first-evolution FTUE trigger to write into the live UI save object, matching the earlier FTUE race-condition fix.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Closest Gem Arrow + Prompt Gem Visibility

Added small cyan closest-gem arrow that only appears when the nearest gem is outside the visible camera area. The arrow is screen-fixed, clamps to the viewport edge, and points toward the offscreen gem so it should help without becoming constant clutter.

Fixed Simulate Prompt feeling empty by spawning one visible/nearby green gem on every prompt chunk instead of only every third chunk. Prompt-generated gems now spawn around the octo just outside or near the visible area instead of random far-away tank coordinates, so pressing Simulate Prompt should visibly create collectibles.

Build passes with the expected Phaser bundle-size warning.

## 2026-04-27 — Remove Redundant Modal Popup

**Removed modal "Got It" popup for trait notifications.** The in-game center text (`showCenterTraitText`) already handles trait spawn and collection messages ("X has spawned in the Tank" / "X Discovered, purchase from Shop"). The modal was duplicating this and blocking gameplay unnecessarily. Removed the overlay, event listener, method, and CSS.

Commit: `9ed8c52`

## 2026-04-27 — FTUE Bug Fixes + Modal Trait Notifications

**Fixed: Gem FTUE notification firing on every gem collected.** Root cause was a save race condition — `IncubationScene` cached `this.save` but `triggerFTUE` loaded a fresh copy from localStorage, marked the flag, saved it. Next gem collect: `saveGame(this.save)` overwrote with the stale cached copy (ftue flag still false), so the trigger fired again. Fix: `triggerFTUE` now accepts an optional `liveSave` parameter and updates the scene's save object in-place.

**Changed: Trait pickup notifications now use a blocking modal overlay.** Gold-bordered centered modal with "Got It" button. User must tap to dismiss — no more auto-timeout. Prevents important trait discovery messages from being overwritten by subsequent gem/wave notices. FTUE tooltips also no longer auto-dismiss (removed 15s timeout).

**Files changed:** `ftueManager.js` (race fix + no auto-dismiss), `IncubationScene.js` (pass `this.save` to all FTUE triggers, trait pickup uses `modal-notice` event), `UIScene.js` (added `showModalNotice` method + event binding), `panel.css` (modal notice styles).


## 2026-04-26 — FTUE Tutorial System

Added first-time user experience (FTUE) tutorial overlay system. 9 milestone tooltips guide new players through the entire game loop:

1. **Welcome** — triggers on first launch, explains "your octo feeds on work"
2. **First Gem** — triggers on first gem collection, explains gem economy
3. **First Trait** — triggers on first manual trait pickup, explains rare drops + autopilot ignoring them
4. **First Shop Open** — triggers when Shop is first opened, explains browsing and buying
5. **First Buy** — triggers on first purchase, directs to Loadout
6. **First Loadout** — triggers when Loadout is first opened, explains slot system
7. **First Hunt Start** — triggers when Tank Hunt first begins, explains waves/mutations/SPACE burst
8. **First Hunt Death** — triggers on first hunt death, explains the death→growth loop
9. **First Evolve** — triggers on first successful fusion, explains rarity ladder

Implementation: `ftueManager.js` module with milestone tracking in `save.ftue` object. Tooltip overlay with cyan-border dark glass styling, "Got it" dismiss button, auto-dismiss after 15 seconds. Each milestone fires once per save file. Reset-save resets all FTUE progress so welcome replays.

Triggers wired into: IncubationScene.js (welcome, gem, trait, hunt start, hunt death) and UIScene.js (shop open, loadout open, buy, evolve).


## 2026-04-26 — Trait Evolution Panel + Shop/Loadout/Evolve Economy Loop

Added Trait Evolution panel: sacrifice 3 unequipped same-rarity traits to create 1 random trait of the next rarity tier. Costs gems (50 common, 150 uncommon, 400 rare). Cannot fuse equipped traits or traits you only have one of. Result is always a trait you don't already own. If you own all traits of the target rarity, fusion is blocked.

New `fuseTraits()` and `fusableTraits()` functions in saveStore.js handle the economy logic. UIScene.js gains `renderEvolution()` with rarity tabs, selection UI (tap to toggle, golden highlight), fuse button with cost preview, and full re-render on success. Added evolve-panel HTML in index.html alongside shop and loadout. All three panels now close each other when opened (no stacking). Reset-save and discover-all also refresh the evolution panel.

The Ink Tank now has the complete idle economy loop: earn gems (prompts + hunts) → shop (buy traits) → loadout (equip traits for stat builds) → evolve (fuse duplicates into rarer traits) → hunt (stats matter in combat).


## 2026-04-26 — Tank Hunt Juice Pass

Added 7 missing gameplay features to make Tank Hunt feel more like Vampire Survivors / Binding of Isaac:

1. **Floating Damage Numbers** — Every hit shows damage text that floats up and fades out. Crits (damage >= 4) show larger yellow text with scale pop.
2. **XP Vacuum on Level-Up** — All gems on screen tween toward the player on level-up, plus screen flash.
3. **Run Summary Screen** — Modal at end of hunt showing wave reached, enemies killed, level, mutations picked, archetype, survival time. Won runs show gold border.
4. **Elite Enemies** — 18% chance from wave 3+. Four types: Armored (2.5x HP, gray tint), Swift (1.6x speed, cyan), Splitter (splits into 2 mini jellies on death, orange), Shooter (fires projectiles at player, red). Elites are 18% larger, drop blue gems, and trigger screen shake on death.
5. **Enemy Projectiles** — Shooter elites and bosses fire red ink projectiles at the player. Projectiles wrap toroidally and deal 1-2 damage. Player invincibility frames apply.
6. **Ink Burst Panic Button** — Press SPACE during hunt to emit a burst that damages and pushes all nearby enemies, destroys nearby enemy projectiles. 8-second cooldown. Visual pulse + flash.
7. **CSS for run summary** — Styled matching the existing hunt UI pixel aesthetic.

Changes: IncubationScene.js (spawnEnemyProjectile, updateEnemyBullets, hitPlayerByProjectile, vacuumGemsOnLevelUp, checkInkBurstInput, fireInkBurst, showRunSummary), panel.css (run summary styles).


## 2026-04-26 — GDD Refresh (2 Games in 1 Architecture)

GDD-COMPLETE.md was outdated since 2026-04-25 and did not reflect the Tank Hunt system, archetype families, bullet path modifiers, enemy behavior roles, or the "2 games in 1" design.

Changes:

- Updated elevator pitch to describe the 3-mode structure: Ink Tank (idle Tamagotchi), Tank Hunt (VS/Isaac roguelike), Open Ocean (Agar.io PvP).
- Added Section 3.3 "Phase 2.5: Tank Hunt" covering charge system, wave progression, boss gate, end-hunt button, and gem economy.
- Added Section 3.3.1 "Archetype System" documenting all 5 families (Abyss, Current, Shell, Prism, Inkstorm) with seeded weapon patterns.
- Added Section 3.3.2 "Hunt Mutations" with full tables for weapon geometry mutations, bullet path modifiers, on-hit effects, and stat mutations.
- Added Section 3.3.3 "Enemy Behavior Roles" documenting jelly drift, fish charge, eel flank, and boss sway.
- Added implementation note to body stat table connecting GDD design targets to actual assetCatalog.js values and archetype groupings.
- Added "Endless Toroidal Tank" to Ink Tank phase description.
- Updated Section 26 status checklist with new "Implemented" section listing all features in current build.
- Added open items for Open Ocean prototype, mutation visual polish, and hunt balance tuning.
- Updated date to 2026-04-26.

## 2026-04-26 — Bullet Path Modifiers (Isaac-style)

Previous variety pass added enemy behaviors and archetype-seeded weapon patterns, but bullets still always flew in straight lines. The core issue was that mutations only changed stats (damage, count, pierce) without changing how bullets actually move through space. In Isaac, the most memorable items change bullet paths and behaviors visually.

Added 8 new bullet path modifier mutations:
- **Wiggle Worm** (tide): bullets sine-wave perpendicular to travel direction, amplitude scales with rank
- **Boomerang Ink** (current): bullets curve back toward player after 35% of their lifetime, creating a sweeping arc pattern
- **Lump of Coal** (inkstorm): bullets accelerate, grow larger, and deal more damage over distance
- **Chain Lightning** (prism): kills spawn a new bullet aimed at the nearest surviving enemy, chains decrease per jump
- **Fear Shot** (abyss): hit enemies flee from player at 1.6x speed, duration scales with rank, enemies tint purple
- **Frost Ink** (shell): hit enemies slow to 40-80% speed depending on rank, enemies tint blue, duration stacks
- **Spectral Ink** (abyss): bullets ignore walls, never wrap, triple lifetime
- Added "fleeing" enemy behavior for feared enemies — they run away instead of chasing

Each modifier now has a distinct bullet tint color so the player can see what their build does at a glance. Modifiers stack with existing mutations (homing + wiggle, pierce + freeze, etc.) creating emergent combinations.

Updated `createTankRunStats` with all new modifier fields. Updated `configureTankBullet` to stamp modifier data onto each bullet. Updated `updateTankBullets` to apply wiggle sine wave, boomerang return curve, and lump-of-coal acceleration/growth every frame. Updated `hitEnemy` to apply fear, freeze, and chain on hit/kill.

## 2026-04-26 — Tank Hunt Variety Pass

Browser testing showed that body balance alone did not solve the core feel problem. Tank Hunt still played like the same run because most enemies used the same direct chase pattern, and many upgrades were invisible numeric modifiers.

Changes:

- Added enemy movement roles: jelly drift/wobble, fish charge bursts, eel flank/orbit pressure, and boss sway movement.
- Added new mutation options that change weapon geometry rather than only stats: Broadside Bloom, Backblast, Ink Mines, Spiral Siphon, and Prism Fork.
- Starting archetypes now seed more visible rule changes immediately: Abyss starts spiral venom shots, Current starts rear shots, Shell starts mines, Prism starts crit forks, and Inkstorm starts broadside pressure.
- Boosts such as propeller/rocket/wing now add backblast behavior as well as speed/wake identity.
- Bullet creation is centralized through shot-pattern helpers so future Isaac-style projectile mutations can be added without rewriting autofire.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Start Tank Hunt with several extreme loadouts and confirm first seconds feel different.
- Confirm enemy movement is no longer one clean conga line.
- Confirm broadside/backblast/spiral/mines/forks are visible and useful without needing new art.

## 2026-04-26 — Body Identity Balance Pass

Loadout testing exposed that many body skins displayed no meaningful stat delta because most normal bodies shared the same small idle-efficiency modifier. This made Shop and Loadout look broken even when the UI comparison logic was correct.

Changes:

- Rebalanced every implemented normal body in `assetCatalog.js` so each has a distinct stat profile.
- Blue remains the clean balanced starter with no stat modifiers.
- Acid now actually grants damage and starts poison/Abyss identity instead of only idle efficiency.
- Yellow now actually grants magnet and gem value, matching its card text.
- Aqua, Teal, and Lime lean into Current/speed/magnet play.
- Metal, Charcoal, Dirt, Gray, Camo, Sushi, and Zombie lean into Shell/armor identity.
- Gold, Rainbow, Bubblegum, Pepe, White, and other bright bodies lean into Prism/luck/economy identity.
- Magma, Red, Orange, Creamsicle, Deathbot, and Fuchsia lean into Inkstorm/damage identity.
- Some heavier/aggressive bodies now include small tradeoffs, so loadout choices show real green/red deltas instead of every body being an invisible cosmetic swap.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Open Loadout body tab and confirm switching bodies now shows meaningful stat deltas.
- Confirm Acid and Yellow card text matches actual effects.
- Try extreme body choices before Tank Hunt and confirm starting archetype feels different immediately.

## 2026-04-25 — Tank Hunt Scale and Unlock Pacing Pass

Browser test showed Tank Hunt scale still felt off versus the Unity VS proof of concept. The player needed a wider combat view, enemies needed easier-to-hit bodies, and multi-shot should not appear randomly before it has been unlocked as progression.

Changes:

- Tank Hunt now zooms out when active and returns to normal tank zoom when hunt ends.
- Normal enemies and boss were scaled up so targets read closer to Unity VS mode.
- Enemy hit circles were enlarged to make hits feel fair instead of pixel-hunty.
- Removed automatic wave-based multi-shot. Tank Hunt currently fires one bullet until a proper upgrade/unlock system grants extra projectiles.
- Slightly enlarged bullet visual and hit circle to improve readability.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Confirm Tank Hunt zoom feels closer to Unity VS view.
- Confirm enemies feel hittable without looking oversized.
- Confirm bullets no longer randomly multiply before unlocks.
- Confirm enemy facing still holds after scale changes.

## 2026-04-25 — Tank Hunt Economy and Build Readability Pass

Browser test showed the Unity-feel pass fixed enemy facing but overdid enemy gem volume. Also discussed buildcraft: traits should stack across slots, and the UI needs to show how each candidate changes the total build instead of only red/green deltas.

Changes:

- Normal Tank Hunt enemies now drop one gem each, matching the Unity VS feel.
- Later waves can still drop higher-value gem colors occasionally, so reward scaling comes from gem type and enemy count rather than gem clutter.
- Boss gem payout was reduced from excessive shower to a smaller blue/yellow burst.
- Wave center-screen popups were removed; HUD keeps progress quiet.
- Tank Hunt button now becomes End Hunt during active hunts.
- End Hunt starts an eight-second cleanup countdown instead of instantly deleting actors.
- Added Discover All testing button in the Shop panel so all discovered assets can be viewed without manually finding every trait.
- Shop and Loadout deltas now show the final stacked total and previous total, making speed-focused or damage-focused builds easier to evaluate.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Confirm normal enemies drop exactly one gem.
- Confirm higher enemy count feels fun without gem spam.
- Confirm End Hunt button behavior feels useful instead of annoying.
- Confirm delta text makes stacking understandable.
- Decide whether pricing should stay at current inflated values or move to rarity bands after measuring gems per full hunt.

## 2026-04-25 — Tank Hunt Unity VS Feel Pass

Browser test confirmed bullet direction is fixed, but Tank Hunt felt slower and less rewarding than the Unity VS proof of concept. Tuned Phaser Tank Hunt toward the Unity mode's pressure and readability.

Changes:

- Increased enemy movement speeds and wave scaling.
- Replaced fixed one-time wave spawns with continuous wave pulses until each kill goal is cleared.
- Raised active enemy caps so waves feel more like VS pressure instead of sparse encounters.
- Reduced auto-fire delay from `430ms` to `260ms`.
- Increased bullet speed from `360` to `620` and lifetime from `1200ms` to `1900ms`, so shots travel much farther.
- Added wave-based multi-shot scaling, up to three shots per auto-fire burst.
- Restored Unity-style enemy facing using `Atan2 + facingOffset`, with smoothed rotation instead of fixed horizontal flip.
- Increased gem drops substantially. Normal enemies now drop several gems each, and boss drops mostly blue/yellow gems.
- Increased boss speed, HP, and gem payout.
- Autopilot moves faster during Tank Hunt so the octo is not drifting passively through combat.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Confirm enemy heads face movement direction. If exactly 90/180 degrees off, adjust `facingOffset` or `flipX` only.
- Confirm shots now reach enemies across meaningful distance.
- Confirm wave pressure feels closer to Unity VS.
- Confirm gem volume feels rewarding, even if shop prices need proportional inflation later.

## 2026-04-25 — Tank Hunt Kill-Gated Patch

Patched Tank Hunt after browser test showed enemies/bullets vanishing before boss death and facing/angle issues.

Changes:

- Removed timed Tank Hunt shutdown. Hunts no longer end just because 62 seconds elapsed.
- Removed background enemy spawn timer. Waves are now discrete, readable, and kill-gated.
- Each wave must be cleared before the next wave starts.
- Boss only spawns after final wave clear.
- Bullet art offset changed from `+270°` to `+90°` because browser test showed bullets backwards.
- Enemy visual facing no longer rotates freely. Enemies now keep stable sprite rotation and flip horizontally toward travel direction, which should better match the swim-sideways asset style and prevent rotation weirdness.
- GDD direction clarified: Tank Hunt is Vampire Survivors-style single-player gem/trait discovery; Open Ocean is Agar.io-style expedition/PvP.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Confirm bullets face forward.
- Confirm enemies swim side-on toward the octo instead of rotating sideways/backwards.
- Confirm no mid-hunt vanish before boss death.
- Confirm waves advance only after kills.
- Confirm boss spawns after final wave and drops a trait signal.

## 2026-04-25 — Tank Hunt VS Movement Refactor

Refactored Tank Hunt using Unity `VSSurvivalScene`/VS script behavior as blueprint.

Changes:

- Tank Hunt now starts progressive waves instead of one flat swarm.
- Wave counter and kill progress now show in HUD mode text.
- Duplicate `Tank Hunt` clicks are ignored while hunt is active.
- Enemies spawn from tank edges and scale by wave.
- Enemy movement now uses smooth velocity interpolation toward octo instead of raw `moveToObject` jitter.
- Enemy facing now uses fixed sprite angle offset, matching Unity VS enemy logic.
- Removed sinusoidal rotation wobble that caused shaking.
- Bullets now spawn slightly in front of octo and use same `+270°` art offset as Unity VS bullet code.
- `findNearest()` now skips inactive/bodyless objects, preventing dead pooled actors from stopping autofire or autopilot targeting.
- Hunt end now cleans enemies and bullets so stale state cannot poison next run.
- Boss still releases normal trait signal and uses existing discovery/purchase flow.
- CSS body font now prefers `Press Start 2P`, helping DOM HUD/buttons match game branding.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Press `Tank Hunt` once and confirm Wave 1 starts.
- Confirm second click during hunt does not stack another wave.
- Confirm enemies swim toward octo without shaking.
- Confirm enemies face their movement direction; if asset appears exactly backward, flip the sign/offset only.
- Confirm autofire continues until no enemies remain.
- Confirm bullet art exits octo at believable angle.
- Confirm boss appears after enough kills and drops trait signal.

## 2026-04-25 — Ink Tank Combat Discovery Pass

Added optional in-tank combat so the tank has an active play loop between prompts.

Changes:

- Added `Tank Hunt` topbar button.
- Tank Hunt spawns a small enemy swarm inside the Ink Tank.
- Equipped octo automatically fires normal ink bullets at the nearest enemy during hunt mode.
- Small enemies chase the octo and drop gems when killed.
- After enough kills, a shark boss enters the tank.
- Boss death spawns a normal trait signal, reusing the same arrow, center-message, manual collection, and Shop discovery flow.
- Preloaded existing enemy and bullet GIF assets from the sorted OctoGlyphs asset pack.
- Autopilot slows down during hunt mode instead of aggressively farming gems.
- Orbiting trait arrow was reduced from `220px` to `55px`, which is 75% smaller as requested.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Press `Tank Hunt`.
- Confirm enemies spawn and chase octo.
- Confirm octo autofires at nearest enemy.
- Confirm killed enemies drop gems.
- Confirm boss appears after enough enemy kills.
- Confirm boss death spawns trait signal and discovery flow still works.

## 2026-04-25 — Trait Signal Guidance Pass

Added clearer in-tank guidance when trait signals spawn.

Changes:

- Trait spawn now shows center-screen Press Start 2P text: `X TRAIT HAS JUST SPAWNED IN THE TANK`.
- Phaser boot now waits for the browser font loader before starting, so Phaser text uses the copied `PressStart2P-Regular.ttf` instead of falling back to default canvas text.
- Replaced the old label/down-arrow on the pickup with a player-orbiting direction arrow.
- The orbiting arrow rotates to point toward the spawned trait, showing the direction the player should swim.
- Removed the trait-side label; the trait name is communicated by the center-screen message.
- Enlarged the orbiting `>` glyph to make it much more readable and on-brand.
- Trait signal lifetime remains 22 seconds.
- Common/uncommon collection message now says the trait was discovered and can be purchased from Shop.
- Collection result also appears as center-screen Press Start 2P text.
- Cleans up the orbit arrow when a trait expires or is collected.
- Trait and gem magnet pull now snaps pickups into the octo once close enough, preventing caught-behind/orbiting behavior that made the arrow jitter.
- Copied `PressStart2P-Regular.ttf` into the OctoGlyphs web app public font assets.
- Design note captured: existing `deep1.png` through `deep4.png` backgrounds should be used for the Spore-like transition from small/near-surface to larger/deeper Open Ocean stages.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Press `Spawn Trait`.
- Confirm center text says `X TRAIT HAS JUST SPAWNED IN THE TANK`.
- Confirm the arrow orbits the player and points toward the trait.
- Collect common/uncommon trait and confirm center text says it was discovered and can be purchased from Shop.
- Confirm arrow disappears after collection.

## 2026-04-25 — Discovery UX and Keyboard Control Pass

Added the missing player-facing explanation for trait discovery and a direct test hook.

Changes:

- Shop now explains that new traits are discovered by collecting floating tank signals.
- Added `Spawn Trait` dev button beside `Simulate Prompt` for faster browser testing.
- Dev trait spawning emits the same manual trait signal flow used by prompt activity.
- Trait signals now last 16 seconds instead of 11 seconds.
- Trait notice now says to take manual control and swim into the signal.
- Added WASD/arrow-key movement as an alternative to pointer movement.
- Keyboard movement counts as Manual mode so trait pickups can be collected.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Press `Spawn Trait` and confirm a floating trait appears.
- Use WASD/arrow keys or pointer movement to collect it.
- Confirm common/uncommon traits become visible in Shop with price and green/red deltas.
- Confirm rare+ traits unlock and equip immediately if rolled.
- Confirm autopilot still ignores trait signals.

## 2026-04-25 — Stat Clarity and Trait Discovery Pass

Implemented stat clarity polish and first-pass trait discovery in one build pass.

Changes:

- Loadout stat deltas now render as colored chips.
- Shop stat deltas now render as colored chips too, comparing each buy/equip candidate against current loadout.
- Positive changes are green and drawbacks are red.
- Equipped item is labeled more clearly as current slot trait.
- Save data now tracks discovered traits separately from unlocked traits.
- Shop can show undiscovered traits as hidden/unknown entries.
- Undiscovered traits cannot be bought until discovered in tank.
- Prompt activity can spawn manual trait discovery signals.
- Discovery pool now includes all purchasable shop traits, including bodies.
- Common and uncommon pickups discover the trait for later shop purchase.
- Rare, legendary, and event pickups unlock/equip immediately as special finds.
- Autopilot still ignores trait pickups because collection requires manual control.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Browser test next:

- Loadout deltas should be readable as green/red chips.
- Shop deltas should also be readable as green/red chips for discovered traits.
- Shop should show unknown traits for undiscovered items.
- Buying an undiscovered trait should be blocked.
- Manual trait pickup should reveal item in Shop, or unlock/equip it if rare+.
- Autopilot should still collect gems but not grab trait pickups.

## 2026-04-24 — OctoGlyphs Direction Established

Created a clean OctoGlyphs project direction from the OctoBlast asset base.

Core decision: OctoGlyphs is not just a normal mini-game. It is an OpenClaw companion loop where an octo grows from work activity, collects Data Gems, unlocks traits, and can later deploy into a hostile Open Ocean survival layer.

Important design pillars established:

- Ink Tank is the safe idle/home space.
- Open Ocean is the risk/combat space.
- Data Gems are the core progression currency.
- Traits come from bodies, eyes, hats, clothes, boosts, special forms, and event skins.
- Player starts as a simple octo with regular eyes and no accessories.
- Work/tool activity can feed gem generation, but prompt content should not be parsed.
- Rare trait pickups should reward manual attention, not autopilot.

## 2026-04-24 — Clean OctoGlyphs Folder Created

Created dedicated OctoGlyphs folder inside the Unity repo:

`PrimordialAI`

Purpose: keep GDD, assets, and Phaser/OpenClaw plugin code separate from main Unity OctoBlast work.

OctoGlyphs folder now contains:

- Design docs.
- Sorted octo assets.
- Phaser game prototype.
- Generated asset pipeline.
- Shop/catalog UI.

## 2026-04-24 — GDD Expanded

Reviewed and worked from the user-authored GDD files:

- `PrimordialAI/docs/GDD.md`
- `PrimordialAI/docs/GDD-PART2.md`
- `PrimordialAI/docs/GDD-COMPLETE.md`

Major design systems captured across docs:

- Ink Tank loop.
- Open Ocean loop.
- Trait slots and rarity.
- Stat system.
- Gem economy.
- Death/reward loop.
- Asset-based octo visual stacking.
- Long-term legendary/event chase items.
- Multiplayer/server concepts deferred until local loop is proven.

## 2026-04-24 — Phaser Prototype Built

Built first local OpenClaw/Phaser prototype under:

`PrimordialAI/game`

Implemented early prototype systems:

- Boot/loading flow.
- Incubation/Ink Tank scene.
- UI scene/panel.
- Local save store.
- Gem spawning and collection.
- Manual octo movement.
- Idle/autonomous behavior foundation.
- Visual octo layering for body, eyes, hat, and clothes.
- Background handling.
- Reset local save button for testing.

Build passed with expected Vite warning that Phaser bundle is large.

## 2026-04-24 — Visual Alignment And Pickup Polish

Tuned visual stacking and pickup behavior across several small commits.

Notable alignment decisions:

- Clothes use `y = -1`.
- Hats use `y = -2`.
- Pickup highlight ring was removed.
- Background assets were copied into the Phaser raw background folder.

Key commits in this phase include:

- `45b6d2d` — Checkpoint OctoGlyphs Phaser prototype polish.
- `3f5f579` — Tune OctoGlyphs gem and clothing polish.
- `d5fc79b` — Align OctoGlyphs hat layer with synced frames.
- `306bd6f` — Add OctoGlyphs collectible magnet pull.
- `073ff87` — Tune OctoGlyphs camera and clothing alignment.
- `1ab931c` — Tune OctoGlyphs pickup visuals and alignment.

## 2026-04-24 — Phase 1 Build Spec Created

Created practical implementation document:

`PrimordialAI/docs/PHASE1-BUILD-SPEC.md`

Committed as:

`2958929 Add OctoGlyphs Phase 1 build spec`

Phase 1 scope:

- Complete Ink Tank loop first.
- Replace prototype shop with full generated trait catalog.
- Add real stat calculation.
- Add proper shop/loadout behavior.
- Add local Open Ocean combat prototype.
- Defer real multiplayer, account login, and server work.

Phase 1 target player journey:

1. Start with simple octo in Ink Tank.
2. Collect gems generated by activity/prototype timers.
3. Spend gems in shop.
4. Unlock, equip, and visually stack traits.
5. Apply real stat modifiers.
6. Deploy into local Open Ocean combat prototype.
7. Die, bank rewards, and return stronger.

## 2026-04-24 — Catalog Generator Implemented

Built generator script:

`PrimordialAI/game/scripts/generate_asset_catalog.py`

Generator behavior:

- Scans `PrimordialAI/sorted-octo-assets`.
- Copies raw GIF assets into Phaser public assets.
- Extracts GIF frames for runtime use.
- Generates runtime catalog data in `assetCatalog.js`.
- Assigns basic metadata including slot, rarity, price, stats text, raw path, generated frame path, and frame count.

Generated catalog counts:

- 30 bodies.
- 29 eyes.
- 90 hats.
- 14 clothes.
- 24 boosts.
- 10 legendary octos.
- 4 Halloween bodies.

Normal shop pool currently includes bodies, eyes, hats, clothes, and boosts for 187 shop traits.

Legendary and Halloween forms are generated but treated as special locked forms, not normal early shop purchases.

Starter unlocks remain Blue body and Regular eyes.

## 2026-04-24 — Shop Grouping And Filtering Added

Reworked shop UI to handle large catalog.

Implemented:

- Category tabs for Bodies, Eyes, Hats, Clothes, Boosts, and Special.
- Filters for All, Owned, Affordable, and Locked.
- Sorting by owned, affordable, locked, rarity, then price.
- Visible item count per filter.
- Rarity border hints.
- Special item rules for legendary and Halloween forms.

Design decision:

- Do not show only unlocked items. Full catalog visibility creates long-term chase.
- Loadout should later be separate and show only owned items.
- Shop should remain full catalog browsing/purchasing space.
- Slot category is primary navigation; rarity is visual/supporting information.

Committed as:

`e6d8cc9 Generate OctoGlyphs catalog and shop filters`

This commit includes generated catalog, copied/extracted Phaser assets, generator script, and shop UI changes.

## Current Implementation State

Committed OctoGlyphs work includes:

- GDD and build spec documents.
- Working Phaser/OpenClaw plugin prototype.
- Ink Tank scene foundation.
- Gem collection and magnet pull.
- Octo visual layer stacking.
- Generated asset catalog.
- Full shop catalog with category/filter UI.

Known limitations:

- Loadout screen needs browser testing and visual tuning.
- Stat deltas are basic text only and not yet color-coded.
- Economy tuning still needs player feedback across early, mid, and rare trait prices.
- Local Open Ocean combat prototype is not built yet.
- Server/multiplayer is intentionally deferred.

## 2026-04-25 — Numeric Stat System Implemented

Built first real mechanical stat pass.

Implemented:

- Catalog generator now emits numeric `statMods` per asset.
- Stat modifiers are generated from slot baseline, rarity multiplier, and asset-name keywords.
- Added `statSystem.js` with base stats, equipped stat calculation, and stat formatting helpers.
- Save store exposes equipped assets and equipped final stats.
- Ink Tank now uses stats for swim speed, magnet range, gem value, rare trait chance, and idle/autopilot efficiency.
- UI footer now shows final equipped stat summary.
- Shop cards still show per-item stat summary from catalog metadata.

Build passed with expected Phaser/Vite bundle-size warning.

Next tuning pass should test in browser, verify stats feel noticeable but not broken, then adjust generator weights and overrides as needed.

## 2026-04-25 — Stat-Budget Pricing Added

Adjusted the generated shop pricing so item cost now correlates directly with mechanical stat value instead of only rarity and slot.

Implemented in:

- `PrimordialAI/game/scripts/generate_asset_catalog.py`
- `PrimordialAI/game/src/game/data/assetCatalog.js`

Pricing now uses:

- Base rarity price.
- Slot multiplier.
- Small index variance.
- Added value from each positive stat modifier.
- Partial discount for negative stat tradeoffs.

This means stronger items should now naturally cost more inside the same rarity tier, while drawback items can be priced slightly more generously. Build passes with the expected Phaser bundle warning.

## 2026-04-25 — Owned-Only Loadout Screen Added

Started the dedicated Loadout UI so shopping and equipping are now separate concepts.

Implemented:

- Added topbar Loadout button.
- Added separate `loadout-panel` beside the existing shop panel.
- Shop remains full catalog browsing and purchase space.
- Owned shop items now tell player to equip in Loadout instead of re-equipping from shop.
- Loadout shows only owned traits.
- Loadout has five slot tabs: Body, Eyes, Hat, Clothes, and Boost.
- Selecting an owned trait equips it, updates octo visuals, updates footer stats, and emits the existing save/equip events.
- Loadout item cards show stat delta versus currently equipped item.
- Added helper functions for owned slot filtering and preview stat calculation.

Build passed with expected Phaser/Vite bundle-size warning.

Next browser check should verify Loadout button opens panel, shop closes when loadout opens, slot tabs show owned traits, equipping updates octo visuals instantly, and stat deltas are understandable.

Browser test result: user confirmed Loadout is working.

## Resume Checklist

When resuming OctoGlyphs work:

1. Read this `DEVLOG.md`.
2. Read `PHASE1-BUILD-SPEC.md`.
3. Run `git log --oneline -- PrimordialAI`.
4. Check `git status --short` and avoid bundling unrelated Unity cleanup/archive files into OctoGlyphs commits.
5. Continue from Loadout browser testing unless user redirects.

## 2026-04-25 - Trait arrow style correction

- Swapped generated triangle/ring trait pointer for a simple Press Start 2P `>` glyph.
- Removed orbit ring around the player pointer.
- Copied the provided Press Start 2P font from the PrimordialAI Fonts folder into the web app public font path.
- Kept the center-screen trait spawn/discovery notices using the same font family.
- Production build passes with the expected Phaser bundle size warning.

## 2026-04-25 — Tank Hunt Level-Up Feel Pass

Browser testing showed Tank Hunt still felt flatter than the Unity VS proof of concept. Main missing pieces were player danger, run-time growth, and the three-choice VS level-up rhythm.

Changes:

- Added temporary per-hunt run stats for HP, XP, level, swim speed, fire rate, damage, bullet speed/range, magnet range, extra projectiles, and bullet size.
- Tank Hunt now grants XP on enemy kills and opens a three-choice temporary upgrade card overlay when the octo levels up.
- Upgrade choices currently include swim speed, fire cooldown, damage, bullet speed/range, magnet range, extra projectile, bullet size, and max HP/heal.
- Upgrade overlay pauses Tank Hunt enemy motion/spawning and resumes after a choice, closer to the Unity VS card cadence.
- Added enemy contact damage, invincibility flicker, knockback, and screen shake so enemies matter instead of only being targets.
- HUD now shows Tank Hunt HP and level/XP progress during active hunts.
- Autopilot movement during Tank Hunt is faster and run-stat affected, making speed upgrades visible in combat.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Check whether contact damage makes Tank Hunt more tense without feeling unfair.
- Check whether three-choice upgrades provide the missing VS rhythm.
- Check whether player/enemy speed balance now feels closer to Unity VS.
- If it still feels off, next likely knob is not more systems but exact tuning: player speed, enemy speed, spawn rate, XP threshold, and fire cooldown.

# Tank Hunt upgrade UI hotfix

- Fixed Tank Hunt level-up choice overlay stealing no clicks by bringing IncubationScene above UIScene while choices are active.
- Restored UIScene to top after choice closes.
- Froze octo movement and keyboard/manual input while upgrade choices are visible.
- Enlarged upgrade card panel, buttons, title, and description text for mobile readability.
- Made card labels/descriptions clickable in addition to the card background.
- Production build passes; Phaser bundle-size warning remains expected.

## Tank Hunt UI and damage feel patch

- Replaced Phaser-rendered level-up cards with DOM overlay so click targets line up with actual mouse position after responsive resize.
- Enlarged level-up card text and buttons for easier browser testing.
- Kept player movement frozen while level-up choices are open.
- Shrunk octo visual scale and collider slightly.
- Added short spin animation when octo takes damage, matching Unity VS invulnerability feedback more closely.
- Build passes with expected Phaser bundle-size warning.

# Tank Hunt animation and HUD polish

- Damage feedback now uses body-specific Spin attack frames instead of rotating the whole octo container.
- Accessories hide during the spin attack, then restore when invulnerability feedback ends.
- Added generated spin frames for every normal body skin in sorted-octo-assets.
- Added generated halloweendeath frames and play them when enemies die, with random 90-degree rotations for variation.
- Added dedicated top Tank Hunt HUD container for hearts and green XP-to-next-mutation progress bar.
- Upgrade popup CSS now uses sharper pixel-style borders and stronger game UI framing.
- Build passes; Phaser bundle-size warning remains expected.

## 2026-04-26 - Visual scale polish

- Reduced body-specific spin attack playback scale by roughly 45% so hit animation matches normal octo size better.
- Reduced Halloween enemy death animation scale by roughly 50% so enemy deaths do not cover swarm readability.
- Forced all HTML buttons, including hunt mutation choices, onto Press Start 2P font.
- Verified production build.

## Tank Hunt spin retaliation polish

- Fixed body spin attack ending on stale oversized spin frame by forcing swim frame restore when spin finishes.
- Spin damage window now keeps player invulnerable for full invulnerability period after hit.
- Spin attack now damages enemies touched by spin arc once per spin window.
- Enemy death and XP/gem logic shared between bullet kills and spin kills.

## Tank Hunt start cleanup

- Starting a new Tank Hunt now clears any existing gem pickups from the tank first.
- Gems can still remain during a hunt after taking damage or while surviving, but stale gems from a previous run cannot be banked at the start of the next run.
- Verified production build.

## 2026-04-25 — Tank Hunt Mutation Architecture Pass

Built the first Isaac/VS-style mutation architecture for Tank Hunt so level-up choices are no longer only flat stat bumps.

Changes:

- Replaced the simple upgrade pool with ranked hunt mutations carrying family, rarity, max-rank, and rank-aware descriptions.
- Added weighted mutation choice generation with rarity weighting and family bias.
- Added persistent loadout seeding: equipped bodies, eyes, hats, and boosts now influence starting hunt stats/families instead of being only cosmetic/passive shop stats.
- Added first real behavior mutations: Pierce, Split, Orbit, Poison, Bounce, and stronger Retaliation Spin.
- Bullets now carry component-like data for pierce, split, poison, bounce, hit tracking, scale, damage, and tint.
- Poison bullets tick damage after hit.
- Split bullets spawn smaller child droplets on hit.
- Pierce bullets can pass through targets.
- Bounce bullets ricochet off tank edges.
- Orbit mutations create orbiting ink drops that damage enemies and inherit poison behavior.
- Added family evolution triggers at three family points: Inkstorm, Tide, Abyss, Shell, Prism, and Current forms each grant a build-defining bonus and center-screen announcement.
- Collecting gems during Tank Hunt now advances the mutation XP bar directly, so the green bar reflects actual gem collection as requested.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Confirm level-up cards show ranks, families, rarity, and readable descriptions.
- Confirm gem collection advances the green XP bar and triggers mutations at the expected pace.
- Confirm Pierce, Split, Orbit, Poison, and Bounce are visible and stack without breaking autofire.
- Confirm equipped persistent traits noticeably affect the start of a hunt without making it too easy.

## 2026-04-25 — Endless Tank Hunt Continue Prompt

Browser test showed Tank Hunt ended too quickly after first boss kill. Boss kills now pause the hunt and show a choice popup instead of immediately ending the run.

Changes:

- Replaced fixed five-wave hunt ending with boss checkpoints every five waves.
- Defeating a boss now opens a pixel-style popup with Continue to next wave or End Hunt.
- Continuing keeps current temporary mutations, heals one heart, grants brief invulnerability, and starts harder next wave.
- Ending exits cleanly and returns to normal tank state.
- Enemies, bullets, contact damage, and auto-fire pause while the continue choice is open.
- Bottom mode readout now includes wave number and Continue state.

Build verified with `npm run build`; expected Phaser bundle-size warning remains.

Next browser test:

- Confirm boss defeat no longer instantly ends hunt.
- Confirm Continue to Wave 6 keeps mutations and feels harder.
- Confirm End Hunt cleanly returns to normal tank without wiping unrelated persistent save data.

## 2026-04-25 — Tank Hunt Wrap and Speed Visibility

Fixed two feel issues from browser testing. Tank Hunt player movement now uses both persistent loadout swim speed and temporary hunt swim-speed mutations for pointer and keyboard control. The hunt HUD now displays the live speed multiplier so speed builds are visibly verifiable during play. Tank Hunt no longer collides with hard world bounds; when the octo exits one side of the tank it wraps to the opposite side with a brief invulnerability grace window, reducing corner traps.

## 2026-04-25 — Toroidal Tank Movement

Tank Hunt now treats tank space like a torus instead of a bounded arena. Player, enemies, bullets, and gems silently wrap left/right/up/down. Enemy chase, auto-fire targeting, magnet pull, trait marker direction, spin damage, orbit damage, split-shot direction, and nearest-object logic now use shortest toroidal distance so seams behave like continuous water rather than walls.

Map size increased from 2400x1600 to 3200x2200 to reduce crowding while keeping endless pressure. Removed previous wrap notice/invulnerability warp feedback because wrapping should feel natural, not like a teleport event. Ricochet bullets still bounce while non-ricochet bullets loop through seams.

Added first visual seam pass with octo ghost copies near screen edges, so crossing edges reads more like continuous swimming. Full entity ghosting can come later if needed, but gameplay math is now toroidal.

## 2026-04-25 — True Toroidal Player Travel

Fixed Tank Hunt wrapping still feeling like hard edges. Previous pass wrapped player position back into bounded coordinates, so camera/player still hit visible world limits. Player now travels in unbounded world space while enemies, bullets, and gems are repositioned near the player using toroidal shortest-copy logic. This means holding right/up/down/left keeps swimming continuously like travelling around a globe instead of bouncing or snapping at tank edges.

Also removed camera bounds and hid the faint tank glass rectangle during hunt-style navigation so the screen no longer advertises a hard rectangular edge.

## 2026-04-25 — Repeating Toroidal Tank Background

- Fixed toroidal hunt background not repeating after unbounded player/camera movement.
- Replaced one-time finite tank backdrop with 5x5 reusable background tile grid.
- Background tiles now reposition around camera every frame, creating endless visual repetition in all directions.
- Kept dark backing fill over huge physics space so no empty void appears between tiles.
- Build passes with expected Phaser bundle-size warning.

## 2026-04-25 — Tank Hunt Economy Balance Pass

Adjusted Tank Hunt toward a more Vampire Survivors-style reward curve. Normal enemies no longer guarantee gem drops; basic enemies now have a moderate drop chance, elite enemies are more reliable but still not guaranteed, and splitter mini-enemies only rarely drop gems. Boss reward bursts were reduced from large floods to smaller controlled payouts so permanent currency gain should no longer explode from one easy hunt.

Bosses were strengthened substantially so five-wave checkpoints should feel closer to damage checks instead of oversized normal enemies. Boss gems stay collectible, while normal enemy hunt gems now expire after a short lifetime and blink before disappearing. This keeps screen clutter lower without making boss rewards feel unfairly lost.

Build verified with `npm run build`; expected Vite large bundle warning remains.

Next test:

- Confirm normal waves still level the player enough to feel rewarding.
- Confirm bosses survive long enough to feel meaningful without becoming boring.
- Confirm timed normal gems reduce clutter but do not feel too punishing.
- Next likely pass is role-based wave recipes using swimmer, charger, flanker, tank, hazard, and boss archetypes.

## 2026-04-26 — Red Shark Predator Pass

Changed the red shark boss from generic shark movement into a dedicated predator pattern. It now cruises more deliberately, enters a visible red/orange wind-up, then commits to a fast locked dash with direct velocity so the attack feels dangerous instead of easing slowly toward the player. After each dash it has a short recovery window before hunting again.

The red shark also escalates as health drops: below roughly two-thirds health its wind-up shortens and dash pressure rises, and below roughly one-third health it becomes more aggressive again. Enemy max HP is now stored on spawn so boss phase logic can scale from remaining health.

Why: browser testing showed the big red shark mostly turned around slowly and never felt like a boss threat. This keeps its slow cruise fantasy, but makes the slow movement a setup for a readable burst attack.

Next: test wave 5 red shark against normal and high-speed loadouts. If it still lacks impact, add a subtle wake trail or bite shockwave rather than a full warning line.

## 2026-04-30 — Background Sync and Tile Coverage Fix

**What**: Synced latest hunt backgrounds and hardened the scrolling/mirrored tank background renderer against black gaps.

**Changes**:
- Copied updated shallow/deep PNGs from `PrimordialAI/sorted-octo-assets/Backgrounds` into `PrimordialAI/game/public/assets/raw/Backgrounds`.
- Increased tiled background coverage from 5x5 to 7x7 images.
- Recentered the tile grid around the camera center instead of deriving it from the top-left worldView corner.
- Changed tiles to centered origins and gave each tile a small 4px display-size overlap to hide subpixel seams during high-speed camera follow.

**Why**: The latest backgrounds need to be used at runtime, and occasional black areas during swimming likely came from tile coverage or subpixel seams failing during fast camera movement. Player should never see black outside the tank background.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Browser-test fast swimming in long diagonal paths and during high-speed hunt upgrades. If any black area still appears, next fallback is replacing individual image tiles with a larger RenderTexture buffer or adding a permanent oversized darkened background image below the tiled layer.

## 2026-04-30 — Hunt End Recap Polish

**What**: Reworked Tank Hunt end recap and boss Continue/End choice using only real tracked run data.

**Changes**:
- Added tracked boss kills, damage taken, mutation choices, boss reward choices, and gem reward sources for each hunt.
- End recap now shows wave reached, enemies defeated, bosses defeated, level reached, damage taken, survival time, archetype, and earned gem value.
- Recap now lists actual mutations chosen with rank, family, and role.
- Recap now lists actual boss rewards chosen.
- Reward sources now break out collected gem types and boss reward payouts instead of showing only one opaque total.
- Boss Continue/End overlay now shows current wave, kills, bosses defeated, and banked gem value before player chooses risk or safe exit.
- Explicitly avoided placeholder trait/evolution progress text until those systems exist for real.

**Why**: Hunt completion should feel rewarding and testable without misleading future progression placeholders. The player should know what happened, what was earned, and what choices shaped the run.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Browser-test recap after early death, safe exit after wave 5 boss, and longer runs with multiple boss rewards. Next planned step is enemy behavior variety.

## 2026-04-30 — Splash-Style Gem Glow Pass

**What**: Recreated more of the original Unity splash-scene gem feel in Phaser.

**Changes**:
- Added layered glow visuals behind each spawned gem.
- Added pulsing core and outer glow, tinted per gem rarity.
- Added small sparkle dots around gems, with more sparkles for higher-value gems.
- Kept existing fast frame cycling and gameplay values unchanged.
- Added cleanup path so gem glow helpers are destroyed when gems are collected or expire.

**Why**: Unity gems felt brighter and more magical because the animated frames had a shimmer/glow feel. Current Phaser gems were readable, but still felt flatter than the original splash-scene gems.

**Build**: `npm run build` passes from `PrimordialAI/game` with only the expected Vite chunk-size warning.

**What's next**: Browser-test normal and hunt gem pickups. If the glow is too busy during dense waves, reduce sparkle count and outer glow alpha while keeping the bright core shimmer.

## 2026-05-01 — OpenClaw Tank Browser Route Fix

**What**: Updated the public OctoGlyphs OpenClaw plugin so the tank opens from a plugin-owned localhost companion server instead of relying on OpenClaw gateway browser auth.

- Added a local companion HTTP server on `http://localhost:18790/octoglyphs` with configurable `companionPort`.
- Changed `/octoglyphs` command output to prefer the local browser-openable tank and stream links.
- Kept the gateway route as a secondary/debug route, but stopped using it as the primary clickable user link.
- Updated package config schema and adapter test coverage.
- Pushed public release commit `0d30885` to `https://github.com/OctoGlyphs/OctoGlyphs.git`.

**Why**: Fresh-machine testing showed OpenClaw 2026.4.23 returns `Unauthorized` when a normal browser clicks the gateway `/octoglyphs` route. The tank needs to be one-click openable without requiring hidden OpenClaw auth headers.

**Verification**: `npm run typecheck` and `npm run build:plugin && node tests/openclawAdapter.test.mjs` pass in the OctoGlyphs release plugin checkout.

**What's next**: User should `git pull`, rebuild/repack, reinstall with `--force`, restart the gateway, run `/octoglyphs`, and click the new `http://localhost:18790/octoglyphs` link. Confirm the page loads and connected tank windows increments.

## 2026-05-07 — Quick-build live style stacking fix

### Changed
- Fixed Tank Hunt quick-build switching so presets replace the previous live preset identity instead of stacking every style bonus together.
- Added explicit live quick-preset event handling separate from normal trait equip handling.
- Added reversible preset modifier tracking on `tankRunStats` so multipliers and additive style mods are removed before a new preset is applied.
- Clamped live trait and preset updates after application so mid-hunt switching cannot exceed starting safety caps.
- Synced rebuilt game bundle into the Hermes plugin folder.

### Why
- Scrolling through presets one through six could make the octo feel increasingly overpowered because each preset marker was being applied like another trait pickup.
- The intended behavior is that Speed Demon, Heavy Hitter, Fortress, Lucky Prism, Gem Greed, and Magnet Chaos are alternate styles, not cumulative buffs.

### Verified
- `cd /home/crai/Desktop/octoglyphs-release/game && npm test && npm run build`
- `cd /home/crai/Desktop/octoglyphs-release/plugin/hosts/hermes && python3 -m py_compile __init__.py octoglyphs_sidecar.py && python3 -m unittest discover -s tests`

### Next
- Test in Hermes by starting a Hunt and pressing one through six repeatedly. Bullet color and style should change, but power should not climb every time.
- Add an active bullet rules readout if tuning still feels unclear.

## Live Hunt Loadout Rebuild

Changed: pressing quick builds or equipping traits during active Tank Hunt now rebuilds persistent loadout effects from clean base, then reapplies existing temporary mutations and boss rewards. Gems, XP, level, HP, wave state, and chosen run history are preserved.

Why: switching one through six could leave old loadout stats behind or only partially apply new traits, making it feel like presets were stacking. This makes quick-build swaps act like clean transformations instead of cumulative buffs.

Next: test active Hunt by leveling once or twice, switching one through six repeatedly, and confirming bullet style changes without runaway power gain.

## OpenClaw 0.1.1 ClawHub Candidate

Changed: bumped OpenClaw plugin manifest to 0.1.1 and rebuilt the OpenClaw public bundle from the latest Tank Hunt quick-build/loadout rebuild work.

Why: the OctoGlyphs GitHub account is now old enough for ClawHub, so the package needs a clean versioned candidate with current assets and gameplay fixes included.

Verified: game npm test, game npm run build, Hermes py_compile and unittest suite, OpenClaw typecheck, OpenClaw adapter test, and npm pack all pass.

Next: commit these changes, push to GitHub, install ClawHub CLI if needed, run ClawHub dry-run publish for OctoGlyphs/OctoGlyphs 0.1.1, then publish for real if dry-run succeeds.

## Commit c0bdadb — Prepare OctoGlyphs OpenClaw 0.1.1

Changed: committed the live Hunt clean-rebuild quick-build work, OpenClaw 0.1.1 manifest bump, rebuilt Hermes/OpenClaw public bundles, and docs updates for the ClawHub candidate.

Why: OctoGlyphs needs the latest non-stacking one-through-six Hunt behavior and packaged assets in GitHub before ClawHub can publish a working OpenClaw plugin.

Next: push to GitHub, pull on the ClawHub-capable machine, run the ClawHub dry-run publish, then publish for real if validation passes.
