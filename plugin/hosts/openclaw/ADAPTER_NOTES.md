# OpenClaw Adapter Notes

Authoritative docs used:

- https://docs.openclaw.ai/plugins/building-plugins
- https://docs.openclaw.ai/plugins/hooks
- https://docs.openclaw.ai/plugins/manifest
- https://docs.openclaw.ai/plugins/sdk-entrypoints

## Confirmed implementation details

OpenClaw native plugins are external packages. Users install with `openclaw plugins install <package-name>`. OpenClaw checks ClawHub first and falls back to npm.

Native plugin packages use Node 22 and TypeScript ESM. Runtime entry points use `definePluginEntry` from `openclaw/plugin-sdk/plugin-entry`.

Every native plugin needs `openclaw.plugin.json` at plugin root. The manifest is read before plugin code loads and is used for identity and config validation, not runtime behavior.

For installed packages, `package.json` should declare source and runtime entry paths:

```json
"openclaw": {
    "extensions": ["./src/index.ts"],
    "runtimeExtensions": ["./dist/index.js"]
}
```

## Privacy-safe hook choices

OpenClaw docs explicitly describe `model_call_started` and `model_call_ended` as sanitized provider/model call metadata without prompt or response content. They include stable metadata such as run id, call id, provider, model, duration, outcome, and bounded request id hashes.

`after_tool_call` observes tool results, errors, and duration. OctoGlyphs must not forward params or results. It should map only `toolName`, duration, success/failure, and broad category.

## Hooks to avoid

The docs list `llm_input`, `llm_output`, and message hooks that expose conversation or channel content. OctoGlyphs should not subscribe to those hooks.

`before_tool_call` exposes tool params and can mutate/block execution. OctoGlyphs does not need it and should avoid it.

## Current scaffold behavior

The scaffold emits host-neutral OctoGlyphs protocol events:

- `model_call_started` becomes `response.started`.
- `model_call_ended` becomes `response.completed`.
- `after_tool_call` becomes `tool.used`.

All mapping happens through `src/privacy.ts`. The adapter intentionally reduces model/provider names and tool names to coarse categories.

## Validation result

The scaffold now type-checks against the installed `openclaw` npm package (`2026.4.27`). One docs/API mismatch was found: docs mention hook `timeoutMs`, but the published `OpenClawPluginApi.on(...)` type currently only accepts `{ priority?: number }`. The adapter now uses `{ priority: 0 }` and keeps its own fetch abort timeout inside `emitToCompanion(...)`.

A local adapter contract test imports the built plugin entry, captures registered hooks, invokes `model_call_started`, `model_call_ended`, and `after_tool_call`, and asserts the emitted envelopes are protocol-wrapped and content-free.

## Side-panel direction

OpenClaw exposes `api.registerControlUiDescriptor(...)` for Control UI contributions on `session`, `tool`, `run`, or `settings` surfaces. Current docs describe this as a descriptor surface, not a confirmed arbitrary webview mount. Best next step is hybrid:

1. Keep companion browser window mode as the proven path.
2. Add an OctoGlyphs Control UI descriptor for discoverability/settings if runtime testing confirms where descriptors render.
3. Later, if Control UI supports plugin-owned embedded content, mount the OctoGlyphs tank there.

## Pending validation

The package has been type-checked and contract-tested against the installed SDK, but not yet installed and run inside a live OpenClaw gateway.
