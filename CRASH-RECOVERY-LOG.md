# Crash Recovery Log

This file is written before each careful step so progress survives if Ember or the desktop session crashes.

## 2026-05-02

Started safe recovery mode after repeated Ember crashes.

Rules for this pass:

- No npm commands from Ember.
- No builds from Ember.
- No tests from Ember.
- No sidecar/server/browser probing from Ember.
- Static file reads and surgical edits only.
- User performs runtime validation manually in a normal terminal.

Current target:

- Prevent browser game from crashing when a music asset key is missing from Phaser audio cache.
- Then inspect Claude Code event chain statically for why prompt gems may not spawn.
- Commit only after manual validation or explicit static-only approval.
- Update PrimordialAI/docs/DEVLOG.md after every commit.

Step 1 complete: inspected game/src/main.js only. Audio guard is present at playNextMusicTrack, line checking game.cache.audio.exists(track.key) before game.sound.add(...). No runtime command executed.

Step 2 complete: statically inspected Claude plugin event chain. Browser connects EventSource to /octoglyphs/stream. Sidecar accepts POST /octoglyphs/events and broadcasts protocol octoglyphs.events.v1. Hook creates prompt.sent for UserPromptSubmit and posts it after ensuring sidecar. IncubationScene listens for octoglyphs:event and prompt.sent calls onPromptSent, which awards/spawns gems. Public index references rebuilt bundle index-BeUUIWjZ.js. No runtime command executed.

Static finding: event chain is structurally coherent. If gems do not spawn, most likely causes are stale browser bundle/URL, EventSource not connected, hook not firing, wrong sidecar port, or game JS dying before stream event handling due to old bundle. Need a visible in-page connection/event readout so user can debug manually without Ember running subprocesses.

Step 3 complete: edited game/src/plugin/octoglyphsBridge.js and game/src/main.js only. Added lightweight bridge status reporting so top status text can show stream connecting, connected, event received, unavailable, or unsupported. No runtime command executed.

Step 4 complete: statically re-read edited sections. Syntax structure looks coherent: bridge accepts onStatus, reports EventSource open/error/event, and main updates plugin-status-readout. Also confirmed existing audio guard remains present. No runtime command executed.

Step 5 complete: user manually ran build from ~/Desktop/octoglyphs-release/game and it passed with expected Vite chunk-size warning only. No crash reported from manual terminal build. Static artifact check found game/dist now references index-COdN05xD.js while Claude plugin public still references older index-BeUUIWjZ.js. Next step is copying/syncing the built dist into plugin/hosts/claude-code/public so Claude plugin serves the new diagnostic bundle.

Step 6 complete: user manually copied game/dist to plugin/hosts/claude-code/public. Static read of plugin public index.html confirms it now serves index-COdN05xD.js. No runtime command executed from Ember.

Step 7 complete: edited Claude Code SessionStart UX only. SessionStart hook is now synchronous so Claude Code can receive hook stdout. octoglyphs-hook.mjs now writes JSON with systemMessage after ensuring sidecar, using message: "Your OctoGlyph is blindly feeding on this Claude Code session." Other hooks remain async. No runtime command executed from Ember.
