type UnknownRecord = Record<string, unknown>;

type OctoglyphsEvent = {
    type: string;
    timestamp: number;
    [key: string]: string | number | boolean;
};

type OctoglyphsConfig = {
    enabled?: boolean;
    gameUrl?: string;
    publicBaseUrl?: string;
    emitModelEvents?: boolean;
    emitToolEvents?: boolean;
    debugSanitizedEvents?: boolean;
};

const DEFAULT_GAME_URL = "/octoglyphs";

export function isEnabled(config: OctoglyphsConfig | undefined): boolean {
    return config?.enabled !== false;
}

export function shouldEmitModelEvents(config: OctoglyphsConfig | undefined): boolean {
    return isEnabled(config) && config?.emitModelEvents !== false;
}

export function shouldEmitToolEvents(config: OctoglyphsConfig | undefined): boolean {
    return isEnabled(config) && config?.emitToolEvents !== false;
}

export function createPromptSentEvent(event: UnknownRecord): OctoglyphsEvent {
    const promptText = readPromptText(event);
    const promptChars = promptText.length;

    return compactEvent({
        type: "prompt.sent",
        timestamp: Date.now(),
        prompt_chars: promptChars > 0 ? promptChars : safeNonNegativeNumber(event.prompt_chars ?? event.promptChars),
        prompt_tokens: safeNonNegativeNumber(event.prompt_tokens ?? event.promptTokens ?? readNestedNumber(event, ["usage", "prompt_tokens"]) ?? readNestedNumber(event, ["usage", "promptTokens"])) ?? estimateTokenCount(promptChars)
    });
}

export function createModelStartedEvent(event: UnknownRecord): OctoglyphsEvent {
    return {
        type: "response.started",
        timestamp: Date.now(),
        provider_kind: normalizeProvider(event.provider),
        model_kind: normalizeModel(event.model)
    };
}

export function createModelEndedEvent(event: UnknownRecord): OctoglyphsEvent {
    return compactEvent({
        type: "response.completed",
        timestamp: Date.now(),
        duration_ms: safeNonNegativeNumber(event.durationMs ?? event.duration_ms),
        completion_tokens: safeNonNegativeNumber(readNestedNumber(event, ["usage", "completion_tokens"]) ?? readNestedNumber(event, ["usage", "outputTokens"]) ?? readNestedNumber(event, ["usage", "completionTokens"])),
        total_tokens: safeNonNegativeNumber(readNestedNumber(event, ["usage", "total_tokens"]) ?? readNestedNumber(event, ["usage", "totalTokens"])),
        success: normalizeOutcome(event.outcome) !== "failure"
    });
}

export function createToolUsedEvent(event: UnknownRecord): OctoglyphsEvent {
    return compactEvent({
        type: "tool.used",
        timestamp: Date.now(),
        tool_kind: categorizeToolName(String(event.toolName ?? event.name ?? "unknown")),
        duration_ms: safeNonNegativeNumber(event.durationMs ?? event.duration_ms),
        success: event.error == null && event.success !== false
    });
}

export function getCompanionGameUrl(config: OctoglyphsConfig | undefined): string {
    return config?.gameUrl ?? DEFAULT_GAME_URL;
}

export function getPublicCompanionGameUrl(config: OctoglyphsConfig | undefined): string | undefined {
    const configuredPublicBaseUrl = normalizeUrl(config?.publicBaseUrl);

    if (!configuredPublicBaseUrl) {
        return undefined;
    }

    const gameUrl = getCompanionGameUrl(config);

    if (/^https?:\/\//i.test(gameUrl)) {
        return gameUrl;
    }

    const normalizedPath = gameUrl.startsWith("/") ? gameUrl : `/${gameUrl}`;
    return `${configuredPublicBaseUrl}${normalizedPath}`;
}

function compactEvent(event: UnknownRecord): OctoglyphsEvent {
    const output: UnknownRecord = {};

    for (const [key, value] of Object.entries(event)) {
        if (value !== undefined && value !== null && Number.isNaN(value) === false) {
            output[key] = value;
        }
    }

    return output as OctoglyphsEvent;
}

function readNestedNumber(source: UnknownRecord, path: string[]): number | undefined {
    let current: unknown = source;

    for (const key of path) {
        if (current == null || typeof current !== "object") {
            return undefined;
        }

        current = (current as UnknownRecord)[key];
    }

    return safeNonNegativeNumber(current);
}

function safeNonNegativeNumber(value: unknown): number | undefined {
    if (typeof value !== "number" || Number.isFinite(value) === false) {
        return undefined;
    }

    return Math.max(0, Math.round(value));
}

function normalizeProvider(value: unknown): string {
    const text = String(value ?? "unknown").toLowerCase();

    if (text.includes("anthropic") || text.includes("claude")) {
        return "anthropic";
    }

    if (text.includes("openai") || text.includes("gpt")) {
        return "openai";
    }

    if (text.includes("local") || text.includes("ollama")) {
        return "local";
    }

    return "other";
}

function normalizeModel(value: unknown): string {
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

    if (text.includes("gpt")) {
        return "gpt";
    }

    return "other";
}

function normalizeOutcome(value: unknown): string {
    const text = String(value ?? "success").toLowerCase();

    if (text.includes("fail") || text.includes("error") || text.includes("cancel")) {
        return "failure";
    }

    return "success";
}

function categorizeToolName(name: string): string {
    const text = name.toLowerCase();

    if (text.includes("write") || text.includes("edit") || text.includes("patch")) {
        return "file_write";
    }

    if (text.includes("read") || text.includes("open")) {
        return "file_read";
    }

    if (text.includes("shell") || text.includes("exec") || text.includes("command") || text.includes("terminal")) {
        return "shell";
    }

    if (text.includes("web") || text.includes("search") || text.includes("fetch") || text.includes("browser")) {
        return "web";
    }

    if (text.includes("git") || text.includes("commit")) {
        return "git";
    }

    return "other";
}

function readPromptText(event: UnknownRecord): string {
    const directPrompt = event.prompt;

    if (typeof directPrompt === "string") {
        return directPrompt;
    }

    const message = event.message;

    if (typeof message === "string") {
        return message;
    }

    const input = event.input;

    if (typeof input === "string") {
        return input;
    }

    return "";
}

function estimateTokenCount(charCount: number): number | undefined {
    if (!Number.isFinite(charCount) || charCount <= 0) {
        return undefined;
    }

    return Math.max(1, Math.ceil(charCount / 4));
}

function readRecord(value: unknown): UnknownRecord | undefined {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    return value as UnknownRecord;
}

function normalizeUrl(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim().replace(/\/$/, "");

    if (!/^https?:\/\//i.test(trimmed)) {
        return undefined;
    }

    return trimmed;
}

