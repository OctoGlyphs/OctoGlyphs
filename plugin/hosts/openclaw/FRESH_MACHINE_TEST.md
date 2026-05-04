# OctoGlyphs Fresh Machine Test Guide

This guide validates the real public-user target flow: install one OpenClaw plugin, restart the gateway, run `/octoglyphs`, and open the gateway-served companion tank. The tester should not run the Phaser/Vite dev server.

## What this test proves

- The OpenClaw plugin installs from a local package path before npm or ClawHub publishing.
- The plugin builds the Phaser companion and bundles the static files into the plugin package.
- OpenClaw serves the companion at `/octoglyphs` through `api.registerHttpRoute`.
- Safe OpenClaw activity events reach the tank through `/octoglyphs/stream`.
- Prompt text, response text, code, diffs, terminal output, file contents, and secrets are not emitted to gameplay.

## Requirements

- Node 22 or newer.
- npm.
- OpenClaw installed on the fresh machine.
- A local checkout or copied archive of this repository.

On the fresh machine, replace `/path/to/OctoGlyphs` with wherever the project was copied or cloned.

## 1. Build and verify the plugin package

From the plugin package directory:

```bash
cd /path/to/OctoGlyphs/plugin/hosts/openclaw
npm install
npm run typecheck && npm test
```

Expected result:

```text
OpenClaw adapter contract assertions passed.
```

This command also builds the Phaser game and copies the built files into:

```text
/path/to/OctoGlyphs/plugin/hosts/openclaw/public
```

The publish package is intentionally trimmed to generated/runtime assets only. It keeps required generated sprites, selected backgrounds, music, UI audio icons, compiled JS/CSS, and OpenClaw runtime files, but drops unused raw source GIF folders from the packaged companion.

## 2. Install the plugin into OpenClaw

Install from the local package path:

```bash
openclaw plugins install /path/to/OctoGlyphs/plugin/hosts/openclaw
```

For a closer simulation of the eventual npm package, install the generated tarball instead:

```bash
cd /path/to/OctoGlyphs/plugin/hosts/openclaw
npm run pack:local
openclaw plugins install ./octoglyphs-openclaw-plugin-0.1.0.tgz
```

Then restart the gateway using the normal command for the fresh machine. Common forms may be one of these, depending on that OpenClaw install:

```bash
openclaw gateway restart
```

or:

```bash
openclaw gateway stop
openclaw gateway start
```

If the install command reports a package already exists, remove the old test install first using the OpenClaw plugin management command shown by that machine, then install again.

## 3. Run the slash command

In OpenClaw, run:

```text
/octoglyphs
```

Expected reply:

```text
OctoGlyphs companion is ready.

Open the tank at: /octoglyphs
Live event stream: /octoglyphs/stream
Connected tank windows: 0

Privacy boundary: prompts, responses, code, file contents, diffs, terminal output, and secrets are never emitted. Only safe activity metadata reaches the tank.
```

Open the companion link. Depending on how the gateway renders relative links, the browser URL should resolve to something like:

```text
http://localhost:<openclaw-gateway-port>/octoglyphs
```

The game should load without running `npm run dev` from the game folder.

## 4. Confirm live event flow

Keep the OctoGlyphs companion open, then use OpenClaw normally. Trigger at least one AI response and, if possible, one file/tool action.

Expected result:

- The tank loads and stays connected.
- `/octoglyphs` should show `Connected tank windows: 1` after the tank is open.
- Model start/completion activity spawns response gems.
- Tool activity spawns tool-colored reward gems.
- No raw prompt text, response text, code, file contents, diffs, stdout, stderr, or secrets appear in the game or plugin output.

## 5. Optional route health check

If you can identify the OpenClaw gateway base URL, check:

```text
http://localhost:<openclaw-gateway-port>/octoglyphs/health
```

Expected JSON:

```json
{
  "ok": true,
  "companion": "/octoglyphs",
  "stream": "/octoglyphs/stream",
  "protocol": "octoglyphs.events.v1"
}
```

## Current expected limitation

The plugin may not automatically pop open a browser window when `/octoglyphs` is run. If OpenClaw exposes only command text responses, the expected behavior is a clickable or copyable companion link. Automatic small-window launch remains a follow-up only if OpenClaw exposes that capability.

## Failure notes to capture

If anything fails, capture:

- Exact OpenClaw version.
- Exact Node version from `node --version`.
- Exact install command output.
- Gateway restart output.
- `/octoglyphs` command output.
- Browser URL used for the companion.
- Browser console error, if the tank page opens but does not load.
