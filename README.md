# OctoGlyphs

<p align="center">
  <img src="game/public/octo-logo.jpg" alt="OctoGlyphs logo" width="160" />
</p>

**Prompt Fed Octo Companion for OpenClaw, Claude Code, and Hermes.**

OctoGlyphs is a privacy-first companion game that turns safe AI-work activity metadata into gems, traits, music, and tank-life progression. Your octo grows while you work, but the plugin never reads your prompts, responses, code, files, diffs, terminal output, or secrets.

OpenClaw, Claude Code, and Hermes are the first supported hosts. iMember and other host integrations can follow the same privacy-safe bridge pattern.

## What it feels like

Keep the OctoGlyphs tank open beside OpenClaw. As you prompt, receive responses, use tools, and make commits, safe activity events feed the tank:

- Prompts create green Data Gems.
- Response activity creates extra gems as work completes.
- Tool calls create tool-colored gems based on safe category and success metadata.
- Commits create pink gems, and every fifth commit can spawn a trait pickup.
- Rare traits let you change your octo with bodies, eyes, hats, clothes, boosts, and legendaries.
- Tank Hunt turns the idle tank into a short roguelike combat run with waves, bosses, mutations, bullets, and rewards.

The result is a sidecar pet that makes AI work feel alive without turning private work content into gameplay input.

## Privacy promise

OctoGlyphs is built around one rule: **metadata only, never content.**

The plugin may use sanitized fields such as:

- Event type.
- Timestamp.
- Prompt token count or prompt character count when OpenClaw exposes safe metadata.
- Completion token count, duration, chunk count, and tool-call count.
- Normalized tool category such as file read, file write, shell, web, build, test, git, search, memory, or other.
- Tool success or failure.
- Commit summary counts such as changed files, insertions, and deletions when available.

The plugin must not emit:

- Prompt text.
- Assistant response text.
- Code.
- File contents.
- Diffs.
- Search query text.
- Shell commands or terminal output.
- Secrets, tokens, environment variables, or credentials.
- Full tool parameters or full tool results.

The tank receives activity metadata through the OpenClaw plugin event stream. Production builds do not expose the old browser-console reward emitter, so casual console spoofing cannot simply call a public `window.octoglyphs.emit` reward API.

## Supported host install flows

### OpenClaw

OpenClaw users install through the normal OpenClaw plugin flow:

```bash
openclaw plugins install @octoglyphs/openclaw-plugin@0.1.4
openclaw gateway restart
```

Then, inside OpenClaw, run:

```text
/octoglyphs
```

OpenClaw will reply with the OctoGlyphs tank link and stream status. Open the tank link, keep it beside OpenClaw, and use OpenClaw normally.

You do not need to run the Vite development server for the OpenClaw plugin install. The Phaser game is bundled into the OpenClaw plugin package.

### Claude Code

Claude Code users install OctoGlyphs from npm:

```bash
npm install -g @octoglyphs/claude-code
claude-octoglyphs
```

The launcher starts Claude Code with the OctoGlyphs plugin attached. Open the tank URL printed by Claude Code, or check the runtime file if the default port is busy:

```bash
cat ~/.octoglyphs-claude-code.json
```

Default tank URL:

```text
http://localhost:18791/octoglyphs
```

If `claude-octoglyphs` already exists from an old source install, remove the stale launcher and reinstall:

```bash
rm -f ~/.local/bin/claude-octoglyphs
npm install -g @octoglyphs/claude-code
```

### Hermes

Hermes support is a Python plugin, not an npm package. Hermes users install from the generated Hermes release mirror:

```bash
hermes plugins install OctoGlyphs/hermes-octoglyphs
hermes plugins enable octoglyphs
hermes
```

Then, inside Hermes, run:

```text
/octoglyphs
```

Default Hermes tank URL:

```text
http://localhost:18792/octoglyphs
```

The `OctoGlyphs/hermes-octoglyphs` repository should be treated as a generated release mirror of `plugin/hosts/hermes`, not as a second hand-maintained codebase. Source changes stay in this monorepo; the mirror only exists so Hermes users can install OctoGlyphs with the same `hermes plugins install owner/repo` flow they use for any other Hermes plugin.

For local testing from this repository before publishing the mirror:

```bash
git clone https://github.com/OctoGlyphs/OctoGlyphs.git
cd OctoGlyphs
mkdir -p ~/.hermes/plugins
rm -rf ~/.hermes/plugins/octoglyphs
cp -R plugin/hosts/hermes ~/.hermes/plugins/octoglyphs
hermes plugins enable octoglyphs
hermes
```

## Normal use

After installation:

1. Start OctoGlyphs from your host:
   - Claude Code: run `claude-octoglyphs`.
   - OpenClaw: run `/octoglyphs` inside OpenClaw.
   - Hermes: run `/octoglyphs` inside Hermes after enabling the plugin.
2. Open the tank link printed by the host, or use the documented localhost URL for that host.
3. Keep the tank visible or in the background while you work.
4. Send prompts and use tools normally.
5. Watch the octo collect gems and grow.
6. Open the shop/loadout panels to spend gems and equip traits.
7. Use Tank Hunt when charged to play short active combat runs.

The octo can collect normal gems through autopilot. Rare trait pickups require manual control so the player still has light, intentional interaction.

## Game modes

### Ink Tank

The main companion mode. Your octo swims around an endless tank, collects Data Gems, grows, and discovers traits. This is designed to be glanceable and low-pressure while you work.

### Tank Hunt

A short active roguelike mode inspired by Vampire Survivors and Binding of Isaac. Hunts are charged by prompt activity, then spend that charge on combat waves, boss fights, mutation drafts, trait rewards, and gem bursts.

### Future host and ocean modes

The current release focuses on the OpenClaw companion plugin. The broader design also includes future host plugins and an eventual Open Ocean mode, but those are not required for the OpenClaw launch.

## Repository layout

```text
game/                         Shared Phaser/Vite OctoGlyphs game.
plugin/hosts/openclaw/         OpenClaw plugin adapter and package.
plugin/hosts/claude-code/      Claude Code npm package and launcher.
plugin/hosts/hermes/           Hermes Python plugin adapter.
docs/                         GDD, build notes, asset notes, and devlog.
```

Game improvements belong in `game/` so host plugins can reuse them. Host-specific code belongs in the matching `plugin/hosts/*/` folder.

## Development

Run game checks:

```bash
cd game
npm install
npm test
npm run build
```

Run Claude Code plugin checks:

```bash
cd plugin/hosts/claude-code
npm install
npm test
```

Run Hermes plugin checks:

```bash
cd plugin/hosts/hermes
python3 -m py_compile __init__.py octoglyphs_sidecar.py
python3 -m unittest discover -s tests
```

Run OpenClaw plugin checks:

```bash
cd plugin/hosts/openclaw
npm install
npm run typecheck
npm test
```

Build a local OpenClaw package:

```bash
cd plugin/hosts/openclaw
npm run pack:local
```

## Local game-only testing

For development without OpenClaw:

```bash
cd game
npm install
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173
```

The development server keeps debug event helpers available for local testing. Production plugin builds do not expose those reward helpers.

## Contributing

OctoGlyphs is open for contributions in the main `OctoGlyphs/OctoGlyphs` repository.

The rule is: change the shared game once, then release it through every host wrapper.

- Gameplay, visual, audio, progression, and Tank Hunt work belongs in `game/`.
- OpenClaw-specific work belongs in `plugin/hosts/openclaw/`.
- Claude Code-specific work belongs in `plugin/hosts/claude-code/`.
- Hermes-specific work belongs in `plugin/hosts/hermes/`.
- Generated release mirrors, including `OctoGlyphs/hermes-octoglyphs`, should redirect issues and pull requests back to the main repo.

Read `CONTRIBUTING.md` for contribution rules and `docs/RELEASE.md` for the one-codebase, three-host release flow.

## Security and cheating note

OctoGlyphs is a local companion game, not a server-authoritative competitive economy. Browser state can never be made fully cheat-proof when it runs on the user's machine. The current protection focuses on the highest-value low-risk step: production builds do not expose public browser reward APIs, and normal rewards flow through the host plugin stream instead.

If future features add leaderboards, trading, public achievements, or shared economies, those systems should use server-authoritative validation rather than trusting local browser storage.

Privacy and security issues should follow `SECURITY.md`.

## License

MIT. Contributions are welcome.
