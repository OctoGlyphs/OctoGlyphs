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
    ["before_prompt_build", "model_call_started", "model_call_ended", "after_tool_call"]
);

for (const registration of registrations) {
    assert.equal(registration.opts == null || registration.opts.priority === 0, true);
}

await registrations[0].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, prompt: "must not leak prompt text" });
await registrations[1].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, provider: "anthropic", model: "claude-sonnet-4", prompt: "must not leak" });
await registrations[2].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, durationMs: 1234, outcome: "completed", usage: { completionTokens: 77 }, response: "must not leak" });
await registrations[3].handler({ context: { pluginConfig: { emitModelEvents: true, emitToolEvents: true } }, toolName: "write_file", params: { path: "secret" }, result: "must not leak", durationMs: 50 });

streamResponse.end();

const streamText = streamResponse.body;
assert.equal((streamText.match(/event: octoglyphs/g) ?? []).length, 4);
assert.equal(streamText.includes("octoglyphs.events.v1"), true);
assert.equal(streamText.includes("prompt.sent"), true);
assert.equal(streamText.includes("response.started"), true);
assert.equal(streamText.includes("response.completed"), true);
assert.equal(streamText.includes("tool.used"), true);
assert.equal(streamText.includes("file_write"), true);
assert.equal(streamText.includes("must not leak"), false);
assert.equal(streamText.includes("secret"), false);
assert.equal(streamText.includes("params"), false);
assert.equal(streamText.includes("result"), false);
assert.equal(streamText.includes("must not leak prompt text"), false);

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
