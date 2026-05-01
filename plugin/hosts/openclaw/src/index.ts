import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { broadcastOctoGlyphsEvent, getOctoGlyphsStreamClientCount } from "./eventHub.js";
import { handleOctoGlyphsRoute } from "./httpRoutes.js";
import {
    createModelEndedEvent,
    createModelStartedEvent,
    createToolUsedEvent,
    getCompanionGameUrl,
    shouldEmitModelEvents,
    shouldEmitToolEvents
} from "./privacy.js";

type HookEvent = {
    context?: {
        pluginConfig?: Record<string, unknown>;
    };
    [key: string]: unknown;
};

export default definePluginEntry({
    id: "octoglyphs",
    name: "OctoGlyphs",
    description: "Feeds a private OctoGlyphs companion tank from safe OpenClaw activity metadata.",
    register(api) {
        api.registerHttpRoute({
            path: "/octoglyphs",
            auth: "gateway",
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

                return {
                    text: [
                        "OctoGlyphs companion is ready.",
                        "",
                        `Open the tank at: ${gameUrl}`,
                        `Live event stream: ${gameUrl}/stream`,
                        `Connected tank windows: ${getOctoGlyphsStreamClientCount()}`,
                        "",
                        "Privacy boundary: prompts, responses, code, file contents, diffs, terminal output, and secrets are never emitted. Only safe activity metadata reaches the tank."
                    ].join("\n")
                };
            }
        });

        registerHook(api as PluginApiWithHook, "model_call_started", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitModelEvents(config)) {
                return;
            }

            emitOctoGlyphsEvent(config, createModelStartedEvent(event));
        });

        registerHook(api as PluginApiWithHook, "model_call_ended", async (event: HookEvent) => {
            const config = event.context?.pluginConfig;

            if (!shouldEmitModelEvents(config)) {
                return;
            }

            emitOctoGlyphsEvent(config, createModelEndedEvent(event));
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

    if (typeof api.registerHook === "function") {
        api.registerHook(hookName, wrappedHandler);
        return;
    }

    if (typeof api.on === "function") {
        api.on(hookName, wrappedHandler, { priority: 0 });
    }
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
