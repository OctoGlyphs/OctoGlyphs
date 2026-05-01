const EVENT_FIELDS = {
    "session.started": ["type", "timestamp"],
    "session.ended": ["type", "timestamp", "duration_ms"],
    "prompt.sent": ["type", "timestamp", "prompt_chars", "prompt_tokens"],
    "response.started": ["type", "timestamp"],
    "response.chunk": ["type", "timestamp", "chunk_index"],
    "response.completed": ["type", "timestamp", "duration_ms", "completion_tokens", "chunk_count", "tool_call_count"],
    "tool.used": ["type", "timestamp", "tool_kind", "duration_ms", "success"],
    "build.finished": ["type", "timestamp", "kind", "duration_ms", "success"],
    "commit.created": ["type", "timestamp", "files_changed_count", "insertions_count", "deletions_count"]
};

const NUMERIC_FIELDS = new Set([
    "timestamp",
    "duration_ms",
    "prompt_chars",
    "prompt_tokens",
    "chunk_index",
    "completion_tokens",
    "chunk_count",
    "tool_call_count",
    "files_changed_count",
    "insertions_count",
    "deletions_count"
]);

const BOOLEAN_FIELDS = new Set(["success"]);
const TOOL_KINDS = new Set(["file_read", "file_write", "shell", "web", "build", "test", "git", "search", "memory", "other"]);
const BUILD_KINDS = new Set(["build", "test", "lint", "typecheck", "unknown"]);

function cleanNumber(value, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, Math.floor(number));
}

function cleanBoolean(value) {
    return Boolean(value);
}

function cleanToolKind(value) {
    const kind = String(value || "other").toLowerCase();
    if (TOOL_KINDS.has(kind)) return kind;
    if (kind.includes("write")) return "file_write";
    if (kind.includes("read")) return "file_read";
    if (kind.includes("shell") || kind.includes("bash") || kind.includes("terminal")) return "shell";
    if (kind.includes("web") || kind.includes("browser")) return "web";
    if (kind.includes("build")) return "build";
    if (kind.includes("test")) return "test";
    if (kind.includes("git") || kind.includes("commit")) return "git";
    if (kind.includes("search") || kind.includes("grep")) return "search";
    if (kind.includes("memory") || kind.includes("recall")) return "memory";
    return "other";
}

function cleanBuildKind(value) {
    const kind = String(value || "unknown").toLowerCase();
    return BUILD_KINDS.has(kind) ? kind : "unknown";
}

function copyAllowedField(output, rawEvent, field) {
    if (field === "type") {
        output.type = rawEvent.type;
        return;
    }

    if (field === "timestamp") {
        output.timestamp = cleanNumber(rawEvent.timestamp, Date.now());
        return;
    }

    if (field === "tool_kind") {
        output.tool_kind = cleanToolKind(rawEvent.tool_kind || rawEvent.toolName || rawEvent.category || rawEvent.name);
        return;
    }

    if (field === "kind") {
        output.kind = cleanBuildKind(rawEvent.kind);
        return;
    }

    if (NUMERIC_FIELDS.has(field) && rawEvent[field] !== undefined) {
        output[field] = cleanNumber(rawEvent[field]);
        return;
    }

    if (BOOLEAN_FIELDS.has(field) && rawEvent[field] !== undefined) {
        output[field] = cleanBoolean(rawEvent[field]);
    }
}

export function sanitizeOctoGlyphsEvent(rawEvent) {
    if (!rawEvent || typeof rawEvent !== "object") return null;

    const type = String(rawEvent.type || "");
    const allowedFields = EVENT_FIELDS[type];
    if (!allowedFields) return null;

    const event = {};
    for (const field of allowedFields) copyAllowedField(event, rawEvent, field);

    if (!event.timestamp) event.timestamp = Date.now();
    if (type === "tool.used" && !event.tool_kind) event.tool_kind = "other";
    if (type === "build.finished" && !event.kind) event.kind = "unknown";

    return event;
}

export function createPrivacyGuards() {
    return {
        sanitizeEvent(rawEvent) {
            return sanitizeOctoGlyphsEvent(rawEvent);
        },

        extractUsageOnly(payload) {
            const usage = payload?.usage;
            if (!usage) return null;

            return {
                promptTokens: cleanNumber(usage.prompt_tokens),
                completionTokens: cleanNumber(usage.completion_tokens),
                totalTokens: cleanNumber(usage.total_tokens)
            };
        },

        extractToolCategoryOnly(event) {
            return { category: cleanToolKind(event?.toolName || event?.category || event?.tool_kind || event?.name) };
        }
    };
}
