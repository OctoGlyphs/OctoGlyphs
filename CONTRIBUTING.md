# Contributing to OctoGlyphs

Thanks for helping make OctoGlyphs better.

OctoGlyphs is one shared game core with multiple AI-workspace host plugins. The goal is simple: improve the octo once, then ship that improvement everywhere.

## Source of truth

Gameplay, art wiring, audio wiring, balance, progression, UI, Tank Hunt behavior, and aquarium behavior belong in:

```text
game/
```

Host-specific integration code belongs in:

```text
plugin/hosts/openclaw/
plugin/hosts/claude-code/
plugin/hosts/hermes/
```

Generated browser bundles in host `public/` folders should not be hand-edited. Change the shared game source, rebuild, then commit the generated bundle sync only as part of an intentional release or packaging update.

## Common contribution paths

### Improve the game

Work in `game/` for:

- Octo movement, traits, gems, enemies, bosses, mutations, and rewards.
- Tank Hunt combat and balancing.
- Backgrounds, readability, particles, UI, and sound.
- Shop, loadout, progression, and save-state behavior.

### Improve a host plugin

Work in the matching host folder for:

- OpenClaw slash command and gateway behavior.
- Claude Code launcher, hook, and sidecar behavior.
- Hermes Python plugin, slash command, and sidecar behavior.
- Privacy-safe metadata mapping for a host.

Host adapters must stay metadata-only. Do not capture or emit raw prompts, assistant responses, source code, file contents, diffs, terminal output, tool arguments, or secrets.

### Improve docs

Work in:

```text
README.md
docs/
plugin/hosts/*/README.md
```

## Local checks

From the repository root, run the relevant checks before opening a pull request.

Shared game:

```bash
cd game
npm install
npm test
npm run build
```

OpenClaw plugin:

```bash
cd plugin/hosts/openclaw
npm install
npm run typecheck
npm test
npm run pack:local
```

Claude Code plugin:

```bash
cd plugin/hosts/claude-code
npm install
npm test
npm run pack:local
```

Hermes plugin:

```bash
cd plugin/hosts/hermes
python3 -m py_compile __init__.py octoglyphs_sidecar.py
python3 -m unittest discover -s tests
```

## Pull request checklist

Please include:

- What changed.
- Why it changed.
- Which host or hosts you tested.
- Which checks you ran.
- Screenshots or video for visual/gameplay changes when possible.

## Asset and audio contributions

By contributing code, assets, audio, docs, or other project material, you confirm that you have the right to submit it under this project's MIT license.

Do not submit copyrighted game art, music, sprites, sound effects, or generated assets unless you have rights to license them to this project.

## Release mirrors

Submit issues and pull requests to this main repository, not generated release mirrors.

`OctoGlyphs/hermes-octoglyphs` is a generated Hermes install mirror. It exists so Hermes users can install with normal Hermes commands. Source changes should land here first, then maintainers publish the mirror.
