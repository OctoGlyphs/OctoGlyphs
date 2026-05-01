import assert from "node:assert/strict";
import { sanitizeOctoGlyphsEvent } from "../src/plugin/privacyGuards.js";

const forbiddenPayload = {
    type: "prompt.sent",
    timestamp: 123,
    prompt_chars: 1000,
    prompt_tokens: 250,
    prompt: "private prompt text",
    response: "private response text",
    content: "private content",
    code: "private code",
    stdout: "private stdout",
    stderr: "private stderr",
    diff: "private diff"
};

const sanitized = sanitizeOctoGlyphsEvent(forbiddenPayload);
assert.deepEqual(sanitized, {
    type: "prompt.sent",
    timestamp: 123,
    prompt_chars: 1000,
    prompt_tokens: 250
});

const toolEvent = sanitizeOctoGlyphsEvent({
    type: "tool.used",
    timestamp: 456,
    toolName: "write_file",
    path: "/private/project/file.js",
    content: "private file contents",
    success: true
});

assert.deepEqual(toolEvent, {
    type: "tool.used",
    timestamp: 456,
    tool_kind: "file_write",
    success: true
});

assert.equal(sanitizeOctoGlyphsEvent({ type: "unknown.event", prompt: "private" }), null);

console.log("Privacy guard assertions passed.");
