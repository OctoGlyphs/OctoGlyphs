import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const pluginRoot = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(pluginRoot, ".claude-plugin/plugin.json"), "utf8"));
const hooks = JSON.parse(await readFile(resolve(pluginRoot, "hooks/hooks.json"), "utf8"));
const hookScript = await readFile(resolve(pluginRoot, "scripts/octoglyphs-hook.mjs"), "utf8");

assert.equal(manifest.name, "octoglyphs");
assert.equal(manifest.hooks, "./hooks/hooks.json");
assert.ok(hooks.hooks.UserPromptSubmit);
assert.ok(hooks.hooks.PostToolUse);
assert.ok(hooks.hooks.PostToolUseFailure);
assert.ok(hooks.hooks.Stop);
assert.ok(hooks.hooks.SessionStart);

assert.equal(hookScript.includes("source.prompt"), true);
assert.equal(hookScript.includes("source.last_assistant_message.length"), true);
assert.equal(hookScript.includes("source.last_assistant_message,"), false);
assert.equal(hookScript.includes("tool_response"), false);
assert.equal(hookScript.includes("transcript_path"), false);

const port = 19891;
await runHook({
    hook_event_name: "UserPromptSubmit",
    prompt: "hello octo",
    session_id: "test",
    cwd: pluginRoot,
    transcript_path: "/tmp/ignored.jsonl"
}, port);

const health = await fetch(`http://127.0.0.1:${port}/octoglyphs/health`);
assert.equal(health.ok, true);
const body = await health.json();
assert.equal(body.host, "claude-code");
assert.equal(body.protocol, "octoglyphs.events.v1");

console.log("Claude Code plugin tests passed");

async function runHook(payload, port) {
    const child = spawn(process.execPath, [resolve(pluginRoot, "scripts/octoglyphs-hook.mjs")], {
        cwd: pluginRoot,
        env: {
            ...process.env,
            OCTOGLYPHS_CLAUDE_PORT: String(port)
        },
        stdio: ["pipe", "pipe", "pipe"]
    });

    child.stdin.end(JSON.stringify(payload));

    const exitCode = await new Promise(resolveExit => {
        child.on("exit", resolveExit);
    });

    assert.equal(exitCode, 0);
}
