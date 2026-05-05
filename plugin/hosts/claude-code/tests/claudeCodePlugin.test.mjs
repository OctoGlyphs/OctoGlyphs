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

// Privacy assertions: hook script must NOT read raw content fields
assert.equal(hookScript.includes("source.prompt.length"), false, "Must not read source.prompt.length");
assert.equal(hookScript.includes("source.prompt ==="), false, "Must not compare source.prompt");
assert.equal(hookScript.includes("source.last_assistant_message.length"), false, "Must not read last_assistant_message.length");
assert.equal(hookScript.includes("source.last_assistant_message,"), false, "Must not pass last_assistant_message");
assert.equal(hookScript.includes("tool_response"), false, "Must not read tool_response");
assert.equal(hookScript.includes("transcript_path"), false, "Must not read transcript_path");
assert.equal(hookScript.includes("source.tool_input"), false, "Must not read tool_input content");
assert.equal(hookScript.includes("readSafeCommand"), false, "Must not have readSafeCommand helper");

// Verify privacy-safe patterns exist
assert.ok(hookScript.includes("safeInt"), "Must have safeInt helper for metadata-only reading");
assert.ok(hookScript.includes("// Privacy:"), "Must have privacy comments documenting boundary");

const packageJson = JSON.parse(await readFile(resolve(pluginRoot, "package.json"), "utf8"));
const launcherScript = await readFile(resolve(pluginRoot, "bin/claude-octoglyphs.mjs"), "utf8");
assert.equal(packageJson.bin["claude-octoglyphs"], "./bin/claude-octoglyphs.mjs");
assert.equal(packageJson.scripts["install:launcher"], "node scripts/install-launcher.mjs");
assert.equal(packageJson.files.includes("bin/"), true);
assert.equal(launcherScript.includes("--plugin-dir"), true);
assert.equal(launcherScript.includes("CLAUDE_CODE_BIN"), true);

// Integration test: sidecar starts and accepts events
const port = 19891;
await runHook({
    hook_event_name: "UserPromptSubmit",
    prompt: "SECRET_PROMPT_CONTENT_MUST_NOT_LEAK",
    session_id: "test",
    cwd: pluginRoot,
    transcript_path: "/tmp/ignored.jsonl"
}, port);

const health = await fetch(`http://127.0.0.1:${port}/octoglyphs/health`);
assert.equal(health.ok, true);
const body = await health.json();
assert.equal(body.host, "claude-code");
assert.equal(body.protocol, "octoglyphs.events.v1");

// Verify prompt event does not contain raw content
const promptStreamEvent = readOneStreamEvent(port);
await runHook({
    hook_event_name: "UserPromptSubmit",
    prompt: "ANOTHER_SECRET_PROMPT_NEVER_LEAK",
    session_id: "test2",
    cwd: pluginRoot,
    metadata: { prompt_chars: 42, prompt_tokens: 11 }
}, port);
const promptEvent = await promptStreamEvent;
assert.equal(promptEvent.protocol, "octoglyphs.events.v1");
assert.equal(promptEvent.event.type, "prompt.sent");
const promptEventStr = JSON.stringify(promptEvent);
assert.equal(promptEventStr.includes("SECRET_PROMPT"), false, "Prompt content must not appear in event");
assert.equal(promptEventStr.includes("NEVER_LEAK"), false, "Prompt content must not appear in event");

// Verify tool event does not contain args or result
const toolStreamEvent = readOneStreamEvent(port);
await runHook({
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_use_id: "tool-test",
    tool_input: { command: "cat /etc/passwd && rm -rf /SECRET_COMMAND" },
    tool_result: "SECRET_TOOL_OUTPUT_DO_NOT_LEAK",
    error: null
}, port);
const toolEvent = await toolStreamEvent;
assert.equal(toolEvent.protocol, "octoglyphs.events.v1");
assert.equal(toolEvent.event.type, "tool.used");
assert.equal(toolEvent.event.tool_kind, "shell");
const toolEventStr = JSON.stringify(toolEvent);
assert.equal(toolEventStr.includes("SECRET_COMMAND"), false, "Tool input must not appear in event");
assert.equal(toolEventStr.includes("SECRET_TOOL_OUTPUT"), false, "Tool result must not appear in event");
assert.equal(toolEventStr.includes("/etc/passwd"), false, "Tool args must not appear in event");

// Verify Stop event does not contain response content
const stopStreamEvent = readOneStreamEvent(port);
await runHook({
    hook_event_name: "Stop",
    last_assistant_message: "SECRET_RESPONSE_NEVER_LEAK_THIS_CONTENT",
    session_id: "test3",
    usage: { completion_tokens: 50 }
}, port);
const stopEvent = await stopStreamEvent;
assert.equal(stopEvent.event.type, "response.completed");
const stopEventStr = JSON.stringify(stopEvent);
assert.equal(stopEventStr.includes("SECRET_RESPONSE"), false, "Response content must not appear in event");
assert.equal(stopEventStr.includes("NEVER_LEAK"), false, "Response content must not appear in event");

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

async function readOneStreamEvent(port) {
    const response = await fetch(`http://127.0.0.1:${port}/octoglyphs/stream`);
    assert.equal(response.ok, true);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const deadline = Date.now() + 2000;

    while (Date.now() < deadline) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const match = buffer.match(/data: (.+)\n\n/);
        if (match) {
            await reader.cancel();
            return JSON.parse(match[1]);
        }
    }

    await reader.cancel();
    throw new Error("No OctoGlyphs stream event received");
}
