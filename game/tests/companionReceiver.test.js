const TEST_URL = "http://127.0.0.1:5179";
const SAFE_PROMPT_EVENT = {
    protocol: "octoglyphs.events.v1",
    event: {
        type: "prompt.sent",
        timestamp: Date.now(),
        prompt_chars: 1200,
        prompt: "private text must not matter to receiver"
    }
};

async function main() {
    const { createServer } = await import("vite");
    const server = await createServer({
        server: {
            host: "127.0.0.1",
            port: 5179,
            strictPort: true,
            hmr: false
        },
        logLevel: "silent"
    });

    await server.listen();

    try {
        const streamResponse = await fetch(`${TEST_URL}/octoglyphs/stream`);
        assert(streamResponse.ok, "stream endpoint should open");

        const reader = streamResponse.body.getReader();
        const firstChunk = await readChunk(reader);
        assert(firstChunk.includes("event: ready"), "stream should announce readiness");

        const postResponse = await fetch(`${TEST_URL}/octoglyphs/events`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(SAFE_PROMPT_EVENT)
        });
        assert(postResponse.ok, "event endpoint should accept valid envelope");

        const eventChunk = await readChunk(reader);
        assert(eventChunk.includes("event: octoglyphs"), "stream should broadcast octoglyphs event");
        assert(eventChunk.includes("prompt.sent"), "broadcast should include event type");
        assert(eventChunk.includes("prompt_chars"), "broadcast should include safe metadata");

        await reader.cancel();
        console.log("Companion receiver assertions passed.");
    } finally {
        await server.close();
    }
}

async function readChunk(reader) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timed out waiting for companion stream chunk")), 1500);
    });
    const result = await Promise.race([reader.read(), timeout]);
    return new TextDecoder().decode(result.value ?? new Uint8Array());
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
