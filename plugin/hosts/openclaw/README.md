# OctoGlyphs OpenClaw Plugin

This is the native OpenClaw adapter for OctoGlyphs.

OctoGlyphs is a private AI-work Tamagotchi sidecar. The plugin observes safe OpenClaw activity metadata and sends sanitized events to the OctoGlyphs companion tank.

## User install target

Public users should eventually install with the normal OpenClaw plugin flow:

```bash
openclaw plugins install @octoglyphs/openclaw-plugin
openclaw gateway restart
```

Then they run this inside OpenClaw:

```text
/octoglyphs
```

The plugin serves the companion tank through the OpenClaw gateway at:

```text
/octoglyphs
```

Users should not need to run the Phaser/Vite development server.

## Fresh machine test before publishing

Until npm or ClawHub publishing is ready, install from a local checkout:

```bash
cd /path/to/PrimordialAI/octoglyphs/plugin/hosts/openclaw
npm install
npm run typecheck && npm test
openclaw plugins install /path/to/PrimordialAI/octoglyphs/plugin/hosts/openclaw
openclaw gateway restart
```

Then use `/octoglyphs` in OpenClaw and open the companion URL reported by the command.

Use `FRESH_MACHINE_TEST.md` for the full checklist.

## Privacy boundary

This plugin must not subscribe to content-bearing hooks.

Allowed hooks:

- `model_call_started`
- `model_call_ended`
- `agent_end`, used only as a generic fallback when sanitized model-call hooks do not fire for a normal turn
- `after_tool_call`
- Later: `session_start`, `session_end`, `gateway_start`, and `gateway_stop`

Forbidden hooks unless a future opt-in debug build creates a stronger sanitizer first:

- `llm_input`
- `llm_output`
- `message_received`
- `message_sending`
- `before_prompt_build`
- `before_tool_call`

The adapter intentionally emits prompt activity from `model_call_started` when possible, not `before_prompt_build`, so it does not subscribe to the prompt-construction hook. Some OpenClaw runtimes do not fire sanitized model-call telemetry for plain chat turns, so `agent_end` is also registered as a content-blind fallback. The fallback emits generic activity only and does not read final messages.

The adapter only emits OctoGlyphs protocol events with safe fields such as event type, timestamp, duration, host-provided token counts or character counts when available, success, and normalized tool category.

It must never emit prompt text, response text, code, file contents, diffs, stdout, stderr, secrets, full tool params, or full tool results.

## Routes

The plugin registers one gateway-authenticated prefix route:

```text
/octoglyphs
```

That route serves:

```text
/octoglyphs
/octoglyphs/stream
/octoglyphs/health
/octoglyphs/assets/...
```

`/octoglyphs/stream` is a server-sent-events stream used by the browser companion.

`/octoglyphs/health` reports route readiness and protocol version.

## Build

```bash
npm install
npm run typecheck
npm run build
```

The build script builds the Phaser game from `../../../../game`, copies `game/dist` into this package's `public/` directory, and compiles the TypeScript plugin to `dist/`.

## Local package tarball

For a closer pre-publish install test:

```bash
npm run pack:local
openclaw plugins install ./octoglyphs-openclaw-plugin-0.1.0.tgz
openclaw gateway restart
```

The tarball is the closest local simulation of the future npm or ClawHub install because it includes only package files: compiled plugin code, `openclaw.plugin.json`, docs, and bundled companion assets.

## Remaining decisions

- Confirm whether the registered Control UI descriptor renders usefully in a live OpenClaw gateway.
- Confirm whether OpenClaw exposes any capability to automatically open a small browser window from `/octoglyphs`.
- Publish to npm or ClawHub once the local fresh-machine path is validated.
