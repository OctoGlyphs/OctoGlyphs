export function createOpenClawBridge(callbacks) {
    let chunkTimer = null;

    return {
        start() {
            // Real OpenClaw listeners go here later. They must emit only sanitized events.
        },

        simulatePrompt() {
            let chunks = 0;
            clearInterval(chunkTimer);

            chunkTimer = setInterval(() => {
                chunks += 1;
                callbacks.onChunk?.();

                if (chunks >= 18) {
                    clearInterval(chunkTimer);
                    callbacks.onUsage?.({
                        usage: {
                            prompt_tokens: 420,
                            completion_tokens: 900,
                            total_tokens: 1320
                        }
                    });
                }
            }, 90);
        }
    };
}
