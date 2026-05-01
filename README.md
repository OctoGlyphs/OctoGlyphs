# OctoGlyphs

OctoGlyphs is an MIT-licensed companion creature game for AI workspaces. It turns privacy-safe coding and chat activity into gems, mutations, and tank-life progression, with OpenClaw as the first supported host plugin and more integrations planned.

## What this repo contains

- `game/` contains the shared Phaser/Vite OctoGlyphs companion game.
- `plugin/hosts/openclaw/` contains the OpenClaw host plugin.
- `docs/` contains design notes, devlog, and build specs.

The core rule is simple: improvements to the actual game belong in `game/` so every host plugin can benefit from them. Host-specific code belongs under `plugin/hosts/<host-name>/`.

## Privacy rule

OctoGlyphs must never read prompt text, assistant response text, filenames, file contents, search query text, shell output text, or semantic content. It may only consume sanitized activity events such as counts, categories, timings, and explicit user settings.

## OpenClaw local install test

From a fresh machine with OpenClaw and Node installed:

```bash
git clone https://github.com/OctoGlyphs/OctoGlyphs.git
cd OctoGlyphs/plugin/hosts/openclaw
npm install
npm run pack:local
openclaw plugins install ./octoglyphs-openclaw-plugin-0.1.0.tgz
openclaw gateway restart
```

Then in OpenClaw:

```text
/octoglyphs
```

Open the reported `/octoglyphs` tank route through the OpenClaw gateway. Do not run the Vite dev server for this install test.

## Development

Run game checks:

```bash
cd game
npm install
npm run test
npm run build
```

Run OpenClaw plugin checks:

```bash
cd plugin/hosts/openclaw
npm install
npm run typecheck
npm test
```

## License

MIT. Contributions are welcome once the repository is public.
