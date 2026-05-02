import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, constants, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 18791;
const FALLBACK_PORTS = [18791, 18792, 18793, 18794, 18795];
const PLUGIN_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SIDECAR_PATH = resolve(PLUGIN_ROOT, "scripts/octoglyphs-sidecar.mjs");
const STATE_PATH = resolve(process.env.HOME ?? ".", ".octoglyphs-claude-code.json");
const TOOL_STARTS = new Map();

const input = await readStdinJson();
const event = createOctoglyphsEvent(input);

const port = await ensureSidecar();
if (event) {
    await postEvent(event, port);
}

if (input?.hook_event_name === "SessionStart") {
    writeSessionStartMessage(port);
}

function createOctoglyphsEvent(source) {
    const eventName = String(source?.hook_event_name ?? "");

    if (eventName === "SessionStart") {
        return compactEvent({
            type: "response.started",
            timestamp: Date.now(),
            provider_kind: "anthropic",
            model_kind: normalizeModel(source?.model),
            host_kind: "claude_code"
        });
    }

    if (eventName === "UserPromptSubmit") {
        const promptChars = typeof source.prompt === "string" ? source.prompt.length : 0;
        return compactEvent({
            type: "prompt.sent",
            timestamp: Date.now(),
            prompt_chars: promptChars,
            prompt_tokens: estimateTokenCount(promptChars),
            host_kind: "claude_code"
        });
    }

    if (eventName === "PostToolUse" || eventName === "PostToolUseFailure") {
        const toolUseId = String(source?.tool_use_id ?? "");
        const durationMs = readToolDuration(toolUseId);
        const toolKind = categorizeToolName(String(source?.tool_name ?? "unknown"));
        const eventType = maybeCommitEvent(source, toolKind) ?? "tool.used";
        return compactEvent({
            type: eventType,
            timestamp: Date.now(),
            tool_kind: toolKind,
            duration_ms: durationMs,
            success: eventName === "PostToolUse" && source?.error == null,
            host_kind: "claude_code"
        });
    }

    if (eventName === "PreToolUse") {
        const toolUseId = String(source?.tool_use_id ?? "");
        if (toolUseId) {
            TOOL_STARTS.set(toolUseId, Date.now());
        }
        return undefined;
    }

    if (eventName === "Stop") {
        const completionChars = typeof source?.last_assistant_message === "string" ? source.last_assistant_message.length : undefined;
        return compactEvent({
            type: "response.completed",
            timestamp: Date.now(),
            completion_tokens: completionChars == null ? undefined : estimateTokenCount(completionChars),
            success: true,
            host_kind: "claude_code"
        });
    }

    return undefined;
}

async function ensureSidecar() {
    const candidates = readPortCandidates();

    for (const candidate of candidates) {
        if (await isSidecarHealthy(candidate)) {
            await writeState({ port: candidate, url: `http://localhost:${candidate}/octoglyphs`, updated_at: Date.now() });
            return candidate;
        }
    }

    for (const candidate of candidates) {
        if (await isPortAvailable(candidate)) {
            await startSidecar(candidate);
            return candidate;
        }
    }

    return candidates[0] ?? DEFAULT_PORT;
}

async function startSidecar(port) {
    const child = spawn(process.execPath, [SIDECAR_PATH], {
        cwd: PLUGIN_ROOT,
        detached: true,
        stdio: "ignore",
        env: {
            ...process.env,
            OCTOGLYPHS_CLAUDE_PORT: String(port)
        }
    });
    child.unref();

    const deadline = Date.now() + 1500;
    while (Date.now() < deadline) {
        if (await isSidecarHealthy(port)) {
            await writeState({ port, url: `http://localhost:${port}/octoglyphs`, updated_at: Date.now() });
            return;
        }
        await sleep(100);
    }
}

async function isSidecarHealthy(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/octoglyphs/health`);
        if (!response.ok) {
            return false;
        }
        const body = await response.json();
        return body?.host === "claude-code" && body?.protocol === "octoglyphs.events.v1";
    } catch {
        return false;
    }
}

async function isPortAvailable(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/octoglyphs/health`);
        return response.status >= 400 && response.status !== 401 && response.status !== 403;
    } catch {
        return true;
    }
}

async function postEvent(event, port) {
    try {
        await fetch(`http://127.0.0.1:${port}/octoglyphs/events`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ protocol: "octoglyphs.events.v1", event })
        });
    } catch {
        // Hooks must never block or fail Claude Code because OctoGlyphs is unavailable.
    }
}

function maybeCommitEvent(source, toolKind) {
    if (toolKind !== "shell" && toolKind !== "git") {
        return undefined;
    }

    const command = readSafeCommand(source?.tool_input);
    if (!command || /^\s*git\s+commit(?:\s|$)/.test(command) === false) {
        return undefined;
    }

    return "commit.created";
}

function readSafeCommand(toolInput) {
    if (!toolInput || typeof toolInput !== "object") {
        return undefined;
    }

    const command = toolInput.command;
    if (typeof command !== "string") {
        return undefined;
    }

    return command.length <= 120 ? command : undefined;
}

function readToolDuration(toolUseId) {
    if (!toolUseId || !TOOL_STARTS.has(toolUseId)) {
        return undefined;
    }

    const startedAt = TOOL_STARTS.get(toolUseId);
    TOOL_STARTS.delete(toolUseId);
    return Math.max(0, Date.now() - startedAt);
}

function categorizeToolName(name) {
    const text = name.toLowerCase();

    if (text.includes("write") || text.includes("edit") || text.includes("patch")) {
        return "file_write";
    }

    if (text.includes("read") || text.includes("open")) {
        return "file_read";
    }

    if (text.includes("bash") || text.includes("shell") || text.includes("exec") || text.includes("command") || text.includes("terminal")) {
        return "shell";
    }

    if (text.includes("web") || text.includes("search") || text.includes("fetch") || text.includes("browser")) {
        return "web";
    }

    if (text.includes("git") || text.includes("commit")) {
        return "git";
    }

    return hashCategory(text);
}

function normalizeModel(value) {
    const text = String(value ?? "unknown").toLowerCase();

    if (text.includes("opus")) {
        return "opus";
    }

    if (text.includes("sonnet")) {
        return "sonnet";
    }

    if (text.includes("haiku")) {
        return "haiku";
    }

    return "other";
}

function compactEvent(event) {
    const output = {};
    for (const [key, value] of Object.entries(event)) {
        if (value !== undefined && value !== null && Number.isNaN(value) === false) {
            output[key] = value;
        }
    }
    return output;
}

function writeSessionStartMessage(port) {
    const url = `http://localhost:${port}/octoglyphs`;
    const message = [
        "Your OctoGlyph is blindly feeding on this Claude Code session.",
        `Open your tank: ${url}`,
        "Privacy: prompts, responses, files, diffs, and terminal output are not sent."
    ].join("\n");

    process.stdout.write(`${JSON.stringify({ systemMessage: message })}\n`);
}

function estimateTokenCount(charCount) {
    return Math.max(1, Math.ceil(charCount / 4));
}

function hashCategory(value) {
    const digest = createHash("sha256").update(value || "unknown").digest("hex").slice(0, 8);
    return `other_${digest}`;
}

async function readStdinJson() {
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }

    const text = Buffer.concat(chunks).toString("utf8").trim();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {};
    }
}

async function writeState(state) {
    try {
        await access(dirname(STATE_PATH), constants.W_OK);
        await writeFile(STATE_PATH, JSON.stringify(state, null, 4));
    } catch {
        // State file is informational only.
    }
}

function readPortCandidates() {
    const explicit = Number.parseInt(process.env.OCTOGLYPHS_CLAUDE_PORT ?? "", 10);
    if (Number.isInteger(explicit) && explicit > 0 && explicit < 65536) {
        return [explicit];
    }
    return FALLBACK_PORTS;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
