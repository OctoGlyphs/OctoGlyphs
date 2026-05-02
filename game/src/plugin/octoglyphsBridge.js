export function createOctoGlyphsBridge({ onEvent, onStatus, privacy }) {
    let chunkTimer = null;
    let promptStartedAt = 0;

    function reportStatus(status) {
        onStatus?.(status);
    }

    function emit(rawEvent) {
        const event = privacy?.sanitizeEvent ? privacy.sanitizeEvent(rawEvent) : rawEvent;
        if (!event) return false;
        reportStatus({ state: "event", eventType: event.type, timestamp: Date.now() });
        onEvent?.(event);
        return true;
    }

    function handleWindowMessage(messageEvent) {
        const payload = messageEvent?.data;
        if (!payload || payload.protocol !== "octoglyphs.events.v1") return;
        emit(payload.event);
    }

    function connectCompanionStream() {
        if (typeof EventSource !== "function") {
            reportStatus({ state: "unsupported", timestamp: Date.now() });
            return null;
        }

        const stream = new EventSource("/octoglyphs/stream");
        reportStatus({ state: "connecting", timestamp: Date.now() });
        stream.addEventListener("open", () => {
            reportStatus({ state: "connected", timestamp: Date.now() });
        });
        stream.addEventListener("error", () => {
            reportStatus({ state: "error", timestamp: Date.now() });
        });
        stream.addEventListener("octoglyphs", (streamEvent) => {
            try {
                const payload = JSON.parse(streamEvent.data);
                if (!payload || payload.protocol !== "octoglyphs.events.v1") return;
                emit(payload.event);
            } catch {
                reportStatus({ state: "malformed", timestamp: Date.now() });
            }
        });
        return stream;
    }

    const allowBrowserDebug = Boolean(import.meta.env?.DEV);

    return {
        start() {
            if (allowBrowserDebug) {
                window.octoglyphs = window.octoglyphs || {};
                window.octoglyphs.emit = emit;
                window.octoglyphs.protocol = "octoglyphs.events.v1";
                window.addEventListener("message", handleWindowMessage);
            }
            this.companionStream = connectCompanionStream();
        },

        stop() {
            clearInterval(chunkTimer);
            this.companionStream?.close?.();
            if (allowBrowserDebug) {
                window.removeEventListener("message", handleWindowMessage);
                if (window.octoglyphs?.emit === emit) delete window.octoglyphs.emit;
            }
        },

        simulatePrompt() {
            let chunks = 0;
            const promptTokens = 420;
            const completionTokens = 900;
            const totalTokens = promptTokens + completionTokens;

            clearInterval(chunkTimer);
            promptStartedAt = Date.now();

            emit({
                type: "prompt.sent",
                timestamp: promptStartedAt,
                prompt_chars: 1800,
                prompt_tokens: promptTokens
            });

            emit({
                type: "response.started",
                timestamp: Date.now()
            });

            chunkTimer = setInterval(() => {
                chunks += 1;
                emit({
                    type: "response.chunk",
                    timestamp: Date.now(),
                    chunk_index: chunks
                });

                if (chunks === 5) {
                    emit({
                        type: "tool.used",
                        timestamp: Date.now(),
                        tool_kind: "file_write",
                        duration_ms: 240,
                        success: true
                    });
                }

                if (chunks >= 18) {
                    clearInterval(chunkTimer);
                    emit({
                        type: "response.completed",
                        timestamp: Date.now(),
                        duration_ms: Date.now() - promptStartedAt,
                        completion_tokens: completionTokens,
                        chunk_count: chunks,
                        tool_call_count: 1
                    });
                    emit({
                        type: "tool.used",
                        timestamp: Date.now(),
                        tool_kind: "other",
                        duration_ms: 0,
                        success: true,
                        usage: {
                            prompt_tokens: promptTokens,
                            completion_tokens: completionTokens,
                            total_tokens: totalTokens
                        }
                    });
                }
            }, 90);
        }
    };
}

export function createOpenClawBridge(options) {
    return createOctoGlyphsBridge(options);
}
