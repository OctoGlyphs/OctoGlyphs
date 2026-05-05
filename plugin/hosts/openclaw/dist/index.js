import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { broadcastOctoGlyphsEvent, getOctoGlyphsStreamClientCount } from "./eventHub.js";
import { handleOctoGlyphsRoute } from "./httpRoutes.js";
import { ensureOctoGlyphsLocalServer } from "./localServer.js";
import { createAgentEndModelEndedEvent, createAgentEndPromptSentEvent, createInboundMessagePromptSentEvent, createInboundMessageResponseFallbackEvent, createMessageSentModelEndedEvent, createModelEndedEvent, createModelStartedEvent, createPromptSentEvent, createTurnStartedPromptSentEvent, createToolUsedEvent, getCompanionGameUrl, getPublicCompanionGameUrl, getRunId, shouldEmitModelEvents, shouldEmitToolEvents } from "./privacy.js";
const runsWithModelActivity = new Set();
const runsWithTurnActivity = new Set();
const runsWithResponseCompletion = new Set();
const recentTurnActivityKeys = new Set();
const recentResponseCompletionKeys = new Set();
const fallbackResponseTimers = new Map();
const MAX_TRACKED_RUNS = 500;
const RESPONSE_FALLBACK_DELAY_MS = 2500;
export default definePluginEntry({
    id: "octoglyphs",
    name: "OctoGlyphs",
    description: "Feeds a private OctoGlyphs companion tank from safe OpenClaw activity metadata.",
    register(api) {
        api.registerHttpRoute({
            path: "/octoglyphs",
            auth: "plugin",
            match: "prefix",
            replaceExisting: true,
            handler: handleOctoGlyphsRoute
        });
        api.registerCommand({
            name: "octoglyphs",
            description: "Show OctoGlyphs companion window launch and privacy status.",
            acceptsArgs: false,
            requireAuth: true,
            handler(ctx) {
                const pluginConfig = readPluginConfig(ctx.config);
                const gameUrl = getCompanionGameUrl(pluginConfig);
                const localGameUrl = ensureOctoGlyphsLocalServer(pluginConfig);
                const publicGameUrl = getPublicCompanionGameUrl(pluginConfig) ?? localGameUrl;
                const localStreamUrl = `${localGameUrl}/stream`;
                const publicStreamUrl = `${publicGameUrl.replace(/\/$/, "")}/stream`;
                return {
                    text: [
                        "OctoGlyphs companion is ready.",
                        "",
                        `Open the tank: ${localGameUrl}`,
                        `Live event stream: ${localStreamUrl}`,
                        `Gateway route: ${gameUrl}`,
                        publicGameUrl !== localGameUrl ? `Configured public route: ${publicGameUrl}` : undefined,
                        publicGameUrl !== localGameUrl ? `Configured public stream: ${publicStreamUrl}` : undefined,
                        `Connected tank windows: ${getOctoGlyphsStreamClientCount()}`,
                        "",
                        "Privacy boundary: prompts, responses, code, file contents, diffs, terminal output, and secrets are never emitted. Only safe activity metadata reaches the tank."
                    ].filter(Boolean).join("\n")
                };
            }
        });
        registerHook(api, "model_call_started", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config)) {
                return;
            }
            rememberRunWithModelActivity(event);
            emitOctoGlyphsEvent(config, createPromptSentEvent(event));
            emitOctoGlyphsEvent(config, createModelStartedEvent(event));
        });
        registerHook(api, "model_call_ended", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config)) {
                return;
            }
            rememberRunWithModelActivity(event);
            rememberResponseCompletion(event);
            emitOctoGlyphsEvent(config, createModelEndedEvent(event));
        });
        registerHook(api, "agent_turn_prepare", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config)) {
                return;
            }
            rememberTurnActivity(event);
            emitOctoGlyphsEvent(config, createTurnStartedPromptSentEvent(event));
            emitOctoGlyphsEvent(config, createModelStartedEvent(event));
        });
        registerHook(api, "message_sent", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config) || hasResponseCompletionForRun(event)) {
                return;
            }
            rememberResponseCompletion(event);
            cancelResponseFallback(event);
            emitOctoGlyphsEvent(config, createMessageSentModelEndedEvent(event));
        });
        registerHook(api, "agent_end", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config) || hasActivityForRun(event)) {
                return;
            }
            emitOctoGlyphsEvent(config, createAgentEndPromptSentEvent(event));
            rememberResponseCompletion(event);
            cancelResponseFallback(event);
            emitOctoGlyphsEvent(config, createAgentEndModelEndedEvent(event));
        });
        registerHook(api, "message_received", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitModelEvents(config) || hasActivityForRun(event)) {
                return;
            }
            rememberTurnActivity(event);
            emitOctoGlyphsEvent(config, createInboundMessagePromptSentEvent(event));
            scheduleResponseFallback(config, event);
        });
        registerHook(api, "after_tool_call", async (event) => {
            const config = event.context?.pluginConfig;
            if (!shouldEmitToolEvents(config)) {
                return;
            }
            emitOctoGlyphsEvent(config, createToolUsedEvent(event));
        });
    }
});
function registerHook(api, hookName, handler) {
    const wrappedHandler = (event) => handler(event);
    if (typeof api.on === "function") {
        api.on(hookName, wrappedHandler, { priority: 0 });
        return;
    }
    if (typeof api.registerHook === "function") {
        api.registerHook(hookName, wrappedHandler);
    }
}
function rememberRunWithModelActivity(event) {
    const runId = getRunId(event);
    if (!runId) {
        return;
    }
    rememberSetValue(runsWithModelActivity, runId);
}
function rememberTurnActivity(event) {
    const runId = getRunId(event);
    if (runId) {
        rememberSetValue(runsWithTurnActivity, runId);
        return;
    }
    rememberSetValue(recentTurnActivityKeys, createRecentActivityKey());
}
function hasActivityForRun(event) {
    const runId = getRunId(event);
    if (runId) {
        return runsWithModelActivity.has(runId) || runsWithTurnActivity.has(runId);
    }
    return recentTurnActivityKeys.has(createRecentActivityKey());
}
function rememberResponseCompletion(event) {
    const runId = getRunId(event);
    if (runId) {
        rememberSetValue(runsWithResponseCompletion, runId);
        return;
    }
    rememberSetValue(recentResponseCompletionKeys, createRecentActivityKey());
}
function hasResponseCompletionForRun(event) {
    const runId = getRunId(event);
    if (runId) {
        return runsWithResponseCompletion.has(runId);
    }
    return recentResponseCompletionKeys.has(createRecentActivityKey());
}
function scheduleResponseFallback(config, event) {
    const fallbackKey = getFallbackKey(event);
    const existingTimer = fallbackResponseTimers.get(fallbackKey);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
        fallbackResponseTimers.delete(fallbackKey);
        if (hasResponseCompletionForRun(event)) {
            return;
        }
        rememberResponseCompletion(event);
        emitOctoGlyphsEvent(config, createInboundMessageResponseFallbackEvent(event));
    }, RESPONSE_FALLBACK_DELAY_MS);
    if (typeof timer.unref === "function") {
        timer.unref();
    }
    fallbackResponseTimers.set(fallbackKey, timer);
}
function cancelResponseFallback(event) {
    const fallbackKey = getFallbackKey(event);
    const timer = fallbackResponseTimers.get(fallbackKey);
    if (!timer) {
        return;
    }
    clearTimeout(timer);
    fallbackResponseTimers.delete(fallbackKey);
}
function getFallbackKey(event) {
    return getRunId(event) ?? createRecentActivityKey();
}
function rememberSetValue(set, value) {
    set.add(value);
    if (set.size > MAX_TRACKED_RUNS) {
        const oldestValue = set.values().next().value;
        if (oldestValue) {
            set.delete(oldestValue);
        }
    }
}
function createRecentActivityKey() {
    return String(Math.floor(Date.now() / 5000));
}
function emitOctoGlyphsEvent(config, event) {
    if (config?.debugSanitizedEvents === true) {
        console.info("[octoglyphs] sanitized event", event);
    }
    broadcastOctoGlyphsEvent(event);
}
function readPluginConfig(config) {
    if (config == null || typeof config !== "object") {
        return undefined;
    }
    const plugins = config.plugins;
    if (plugins == null || typeof plugins !== "object") {
        return undefined;
    }
    const octoglyphs = plugins.octoglyphs;
    if (octoglyphs == null || typeof octoglyphs !== "object") {
        return undefined;
    }
    return octoglyphs;
}
//# sourceMappingURL=index.js.map