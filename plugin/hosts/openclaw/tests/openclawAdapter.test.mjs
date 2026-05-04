import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { Writable } from "node:stream";
import entry from "../dist/index.js";

const registrations = [];
const controlUiDescriptors = [];
const commands = [];
const httpRoutes = [];

entry.register({
    registerControlUiDescriptor(descriptor) {
        controlUiDescriptors.push(descriptor);
    },
    registerCommand(command) {
        commands.push(command);
    },
    registerHttpRoute(route) {
        httpRoutes.push(route);
    },
    registerHook(hookName, handler, opts) {
        registrations.push({ hookName, handler, opts });
    }
});

assert.equal(controlUiDescriptors.length, 0);

assert.equal(httpRoutes.length, 1);
assert.equal(httpRoutes[0].path, "/octoglyphs");
assert.equal(httpRoutes[0].auth, "plugin");
assert.equal(httpRoutes[0].match, "prefix");

assert.equal(commands.length, 1);
assert.equal(commands[0].name, "octoglyphs");

const commandResult = await commands[0].handler({
    config: {
        gateway: {
            port: 18888
        },
        plugins: {
            octoglyphs: {
                gameUrl: "/octoglyphs",
                companionPort: 18999
            }
        }
    },
    commandBody: "/octoglyphs",
    isAuthorizedSender: true
});

assert.equal(commandResult.text.includes("Open the tank: http://localhost:18999/octoglyphs"), true);
assert.equal(commandResult.text.includes("Live event stream: http://localhost:18999/octoglyphs/stream"), true);
assert.equal(commandResult.text.includes("Gateway route: /octoglyphs"), true);
assert.equal(commandResult.text.includes("prompts, responses, code"), true);

const assetFileName = readdirSync(new URL("../public/assets", import.meta.url)).find((fileName) => fileName.endsWith(".js"));
assert.notEqual(assetFileName, undefined);

const assetResponse = createTestResponse();
const assetHandled = await httpRoutes[0].handler({ url: `/assets/${assetFileName}`, method: "GET", on() {} }, assetResponse);
assert.equal(assetHandled, true);
assert.equal(assetResponse.statusCode, 200);
assert.equal(assetResponse.headers["content-type"], "text/javascript; charset=utf-8");

const prefixedAssetResponse = createTestResponse();
const prefixedAssetHandled = await httpRoutes[0].handler({ url: `/octoglyphs/assets/${assetFileName}`, method: "GET", on() {} }, prefixedAssetResponse);
assert.equal(prefixedAssetHandled, true);
assert.equal(prefixedAssetResponse.statusCode, 200);
assert.equal(prefixedAssetResponse.headers["content-type"], "text/javascript; charset=utf-8");

const healthResponse = createTestResponse();
const healthHandled = await httpRoutes[0].handler({ url: "/octoglyphs/health", method: "GET", on() {} }, healthResponse);
assert.equal(healthHandled, true);
assert.equal(healthResponse.statusCode, 200);
assert.equal(JSON.parse(healthResponse.body).protocol, "octoglyphs.events.v1");

const streamResponse = createTestResponse();
await httpRoutes[0].handler({ url: "/octoglyphs/stream", method: "GET", on() {} }, streamResponse);
assert.equal(streamResponse.statusCode, 200);
assert.equal(streamResponse.headers["content-type"], "text/event-stream; charset=utf-8");

assert.deepEqual(
    registrations.map((registration) => registration.hookName),
    ["model_call_started", "model_call_ended", "agent_turn_prepare", "message_sent", "agent_end", "after_tool_call"]
);

for (const registration of registrations) {
    assert.equal(registration.opts == null || registration.opts.priority === 0, true);
}

await registrations[0].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "model-run", provider: "anthropic", model: "claude-sonnet-4", prompt: "must not leak", message: "must not leak message", input: "must not leak input", prompt_chars: 42, usage: { promptTokens: 11 } });
await registrations[1].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "model-run", durationMs: 1234, outcome: "completed", usage: { completionTokens: 77 }, response: "must not leak" });
await registrations[2].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "turn-run", prompt: "must not leak turn prompt", messages: [{ content: "must not leak turn history" }] });
await registrations[3].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "turn-run", content: "must not leak outbound message", durationMs: 33, outcome: "sent" });
await registrations[4].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "model-run", durationMs: 55, outcome: "success", messages: [{ content: "must not leak final message" }] });
await registrations[4].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "turn-run", durationMs: 55, outcome: "success", messages: [{ content: "must not leak final message" }], finalMessage: "must not leak final text" });
await registrations[4].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, runId: "plain-chat-run", durationMs: 55, outcome: "success", messages: [{ content: "must not leak final message" }], finalMessage: "must not leak final text" });
await registrations[5].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, toolName: "write_file", params: { path: "secret" }, result: "must not leak", durationMs: 50 });

streamResponse.end();

const streamText = streamResponse.body;
assert.equal((streamText.match(/event: octoglyphs/g) ?? []).length, 9);
assert.equal(streamText.includes("octoglyphs.events.v1"), true);
assert.equal(streamText.includes("prompt.sent"), true);
assert.equal(streamText.includes("response.started"), true);
assert.equal(streamText.includes("response.completed"), true);
assert.equal(streamText.includes("tool.used"), true);
assert.equal(streamText.includes("file_write"), true);
assert.equal(streamText.includes("prompt_chars"), true);
assert.equal(streamText.includes("prompt_tokens"), true);
assert.equal(streamText.includes("must not leak"), false);
assert.equal(streamText.includes("must not leak message"), false);
assert.equal(streamText.includes("must not leak input"), false);
assert.equal(streamText.includes("must not leak turn prompt"), false);
assert.equal(streamText.includes("must not leak turn history"), false);
assert.equal(streamText.includes("must not leak final message"), false);
assert.equal(streamText.includes("must not leak final text"), false);
assert.equal(streamText.includes("must not leak outbound message"), false);
assert.equal(streamText.includes("secret"), false);
assert.equal(streamText.includes("params"), false);
assert.equal(streamText.includes("result"), false);

console.log("OpenClaw adapter contract assertions passed.");

function createTestResponse() {
    const chunks = [];
    const headers = {};
    const response = new Writable({
        write(chunk, _encoding, callback) {
            chunks.push(Buffer.from(chunk));
            callback();
        }
    });

    response.statusCode = 0;
    response.setHeader = (name, value) => {
        headers[String(name).toLowerCase()] = String(value);
        return response;
    };
    response.writeHead = (statusCode, nextHeaders = {}) => {
        response.statusCode = statusCode;
        for (const [name, value] of Object.entries(nextHeaders)) {
            headers[String(name).toLowerCase()] = String(value);
        }
        return response;
    };

    Object.defineProperties(response, {
        body: {
            get() {
                return Buffer.concat(chunks).toString("utf8");
            }
        },
        headers: {
            get() {
                return headers;
            }
        }
    });

    return response;
}
