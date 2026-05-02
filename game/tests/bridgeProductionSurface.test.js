const ORIGINAL_WINDOW = globalThis.window;
const ORIGINAL_EVENT_SOURCE = globalThis.EventSource;

async function main() {
    const { createOctoGlyphsBridge } = await import("../src/plugin/octoglyphsBridge.js");

    try {
        await assertProductionDoesNotExposeEmitter(createOctoGlyphsBridge);
        console.log("Bridge production surface assertions passed.");
    } finally {
        globalThis.window = ORIGINAL_WINDOW;
        globalThis.EventSource = ORIGINAL_EVENT_SOURCE;
    }
}

async function assertProductionDoesNotExposeEmitter(createOctoGlyphsBridge) {
    const listeners = [];
    globalThis.EventSource = undefined;
    globalThis.window = {
        octoglyphs: {},
        addEventListener(type, handler) {
            listeners.push({ type, handler });
        },
        removeEventListener() {}
    };

    const received = [];
    const bridge = createOctoGlyphsBridge({
        privacy: {
            sanitizeEvent(event) {
                return event;
            }
        },
        onEvent(event) {
            received.push(event);
        }
    });

    bridge.start();

    assert(!globalThis.window.octoglyphs.emit, "production bridge must not expose console reward emitter");
    assert(listeners.length === 0, "production bridge must not install browser message reward listener");
    assert(received.length === 0, "production bridge should not emit events during start");

    bridge.stop();
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
