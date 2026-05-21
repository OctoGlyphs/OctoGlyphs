# OctoGlyphs Release Flow

OctoGlyphs is maintained as one source codebase with three host packages.

## Source of truth

The shared game lives in:

```text
game/
```

Host wrappers live in:

```text
plugin/hosts/openclaw/
plugin/hosts/claude-code/
plugin/hosts/hermes/
```

Change gameplay once in `game/`, then rebuild/sync the host bundles so OpenClaw, Claude Code, and Hermes ship the same game.

## OpenClaw

OpenClaw package source:

```text
plugin/hosts/openclaw/
```

Build and package:

```bash
cd plugin/hosts/openclaw
npm install
npm run typecheck
npm test
npm run pack:local
```

User install target:

```bash
openclaw plugins install @octoglyphs/openclaw-plugin@0.1.4
openclaw gateway restart
```

Then run `/octoglyphs` inside OpenClaw.

## Claude Code

Claude Code package source:

```text
plugin/hosts/claude-code/
```

Build and package:

```bash
cd plugin/hosts/claude-code
npm install
npm test
npm run pack:local
```

User install target:

```bash
npm install -g @octoglyphs/claude-code
claude-octoglyphs
```

## Hermes

Hermes plugin source:

```text
plugin/hosts/hermes/
```

Hermes users install from the generated release mirror:

```text
OctoGlyphs/hermes-octoglyphs
```

Publish the mirror from the main repository:

```bash
./scripts/publish-hermes-plugin.sh --push
```

That script builds the shared game, syncs it into `plugin/hosts/hermes/public/`, verifies the Python plugin, copies the Hermes plugin root into the mirror checkout, and pushes the mirror when requested.

User install target:

```bash
hermes plugins install OctoGlyphs/hermes-octoglyphs
hermes plugins enable octoglyphs
hermes
```

Then run `/octoglyphs` inside Hermes.

## Commit rule

When a release intentionally refreshes generated host bundles, commit the source changes and generated bundle sync together so the main repository matches what users install.

Do not hand-edit generated `public/` bundle files. Rebuild from `game/` instead.
