import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { broadcastOctoGlyphsEvent, getOctoGlyphsStreamClientCount } from "./eventHub.js";
import { handleOctoGlyphsRoute } from "./httpRoutes.js";
import { ensureOctoGlyphsLocalServer } from "./localServer.js";
import {
    createAgentEndModelEndedEvent,
    createAgentEndPromptSentEvent,
    createModelEndedEvent,
    createModelStartedEvent,
    createPromptSentEvent,
    createToolUsedEvent,
    getCompanionGameUrl,
    getPublicCompanionGameUrl,
    getRunId,
    shouldEmitModelEvents,
    shouldEmitToolEvents
} from "./privacy.js";

type HookEvent = {
    context?: {
        pluginConfig?: Record<string, unknown>;
    };
    [key: string]: unknown;
};

const runsWithModelActivity = new Set<string>();
const MAX_TRACKED_RUNS = 500;

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

        registerHook(api as PluginApiWithHook, "model_call_started", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitModelEvents(config)) {
                return;
            }

            rememberRunWithModelActivity(event);
            emitOctoGlyphsEvent(config, createPromptSentEvent(event));
            emitOctoGlyphsEvent(config, createModelStartedEvent(event));
        });

        registerHook(api as PluginApiWithHook, "model_call_ended", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitModelEvents(config)) {
                return;
            }

            rememberRunWithModelActivity(event);
            emitOctoGlyphsEvent(config, createModelEndedEvent(event));
        });

        registerHook(api as PluginApiWithHook, "agent_end", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitModelEvents(config) || hasModelActivityForRun(event)) {
                return;
            }

            emitOctoGlyphsEvent(config, createAgentEndPromptSentEvent(event));
            emitOctoGlyphsEvent(config, createAgentEndModelEndedEvent(event));
        });

        registerHook(api as PluginApiWithHook, "after_tool_call", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitToolEvents(config)) {
                return;
            }

            emitOctoGlyphsEvent(config, createToolUsedEvent(event));
        });
    }
});

type PluginApiWithHook = {
    registerHook?: (hookName: string, handler: (event: unknown) => Promise<void>) => void;
    on?: (hookName: string, handler: (event: unknown) => Promise<void>, opts?: { priority: number }) => void;
};

function registerHook(api: PluginApiWithHook, hookName: string, handler: (event: HookEvent) => Promise<void>): void {
    const wrappedHandler = (event: unknown) => handler(event as HookEvent);

    if (typeof api.on === "function") {
        api.on(hookName, wrappedHandler, { priority: 0 });
        return;
    }

    if (typeof api.registerHook === "function") {
        api.registerHook(hookName, wrappedHandler);
    }
}

function rememberRunWithModelActivity(event: HookEvent): void {
    const runId = getRunId(event);

    if (!runId) {
        return;
    }

    runsWithModelActivity.add(runId);

    if (runsWithModelActivity.size > MAX_TRACKED_RUNS) {
        const oldestRunId = runsWithModelActivity.values().next().value;

        if (oldestRunId) {
            runsWithModelActivity.delete(oldestRunId);
        }
    }
}

function hasModelActivityForRun(event: HookEvent): boolean {
    const runId = getRunId(event);

    return runId ? runsWithModelActivity.has(runId) : false;
}

function emitOctoGlyphsEvent(config: Record<string, unknown> | undefined, event: Record<string, unknown>): void {
    if (config?.debugSanitizedEvents === true) {
        console.info("[octoglyphs] sanitized event", event);
    }

    broadcastOctoGlyphsEvent(event);
}

function readPluginConfig(config: unknown): Record<string, unknown> | undefined {
    if (config == null || typeof config !== "object") {
        return undefined;
    }

    const plugins = (config as Record<string, unknown>).plugins;

    if (plugins == null || typeof plugins !== "object") {
        return undefined;
    }

    const octoglyphs = (plugins as Record<string, unknown>).octoglyphs;

    if (octoglyphs == null || typeof octoglyphs !== "object") {
        return undefined;
    }

    return octoglyphs as Record<string, unknown>;
}
