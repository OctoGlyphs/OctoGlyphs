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
        api.registerControlUiDescriptor({
            id: "octoglyphs-companion",
            surface: "settings",
            label: "OctoGlyphs companion",
            description: "Shows the local companion tank URL and privacy-safe metadata settings.",
            placement: "plugins",
            schema: {
                type: "object",
                properties: {
                    gameUrl: {
                        type: "string",
                        title: "Companion tank URL",
                        default: "/octoglyphs"
                    },
                    enabled: {
                        type: "boolean",
                        title: "Emit safe activity metadata",
                        default: true
                    },
                    emitModelEvents: {
                        type: "boolean",
                        title: "Use model timing metadata",
                        default: true
                    },
                    emitToolEvents: {
                        type: "boolean",
                        title: "Use tool category metadata",
                        default: true
                    }
                }
            }
        });

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

        api.on(
            "model_call_started",
            async (event: HookEvent) => {
                const config = event.context?.pluginConfig;

                if (!shouldEmitModelEvents(config)) {
                    return;
                }

                emitOctoGlyphsEvent(config, createModelStartedEvent(event));
            },
            { priority: 0 }
        );

        api.on(
            "model_call_ended",
            async (event: HookEvent) => {
                const config = event.context?.pluginConfig;

                if (!shouldEmitModelEvents(config)) {
                    return;
                }

                emitOctoGlyphsEvent(config, createModelEndedEvent(event));
            },
            { priority: 0 }
        );

        api.on(
            "after_tool_call",
            async (event: HookEvent) => {
                const config = event.context?.pluginConfig;

                if (!shouldEmitToolEvents(config)) {
                    return;
                }

                emitOctoGlyphsEvent(config, createToolUsedEvent(event));
            },
            { priority: 0 }
        );
    }
});

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
