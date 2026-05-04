# OctoGlyphs for Claude Code

Prompt Fed Octo Companion for Claude Code.

OctoGlyphs turns Claude Code activity into a tiny aquarium companion. Prompts feed the octo, tool use drops gems, completed responses add session energy, and git commits can trigger special progression. It is designed to be privacy-first: the plugin only emits sanitized metadata and never sends prompt text, assistant text, code, file contents, diffs, stdout, stderr, or secrets to the game.

This host is experimental while the OpenClaw plugin remains the launch path.

## What it captures

The Claude Code plugin uses official hook events:

- `SessionStart` starts the local OctoGlyphs sidecar.
- `UserPromptSubmit` emits prompt length metadata.
- `PostToolUse` emits sanitized tool category and success metadata.
- `PostToolUseFailure` emits sanitized failed tool metadata.
- `Stop` emits response completion metadata.

## What it does not capture

OctoGlyphs does not read or store:

- raw prompts
- assistant responses
- source code
- file contents
- diffs
- terminal output
- secrets
- transcript files

## Local test flow

From the repository root:

```bash
cd plugin/hosts/claude-code
npm test
```

To try it in Claude Code without installing the launcher, load this folder as a local plugin directory:

```bash
claude --plugin-dir .
```

For source installs, install the `claude-octoglyphs` launcher once:

```bash
npm run install:launcher
```

Then start Claude Code with OctoGlyphs attached from any directory:

```bash
claude-octoglyphs
```

Any extra arguments are passed through to Claude Code, for example:

```bash
claude-octoglyphs --model sonnet
```

If `claude-octoglyphs` is not found after installation, add `~/.local/bin` to your shell `PATH`.

Default URL:

```text
http://localhost:18791/octoglyphs
```

If that port is already occupied, the plugin automatically falls back to the next available local port. The actual URL is written to:

```text
~/.octoglyphs-claude-code.json
```

The local health endpoint uses the same port, for example:

```text
http://localhost:18791/octoglyphs/health
```

## Development notes

The hook script starts a local sidecar server on port `18791` when available, then falls back through nearby local ports if needed. Hook failures are swallowed so OctoGlyphs never blocks Claude Code work.

The game assets are copied into `public/` from the shared OctoGlyphs browser build.
