import { createServer } from "node:http";
import { handleOctoGlyphsRoute } from "./httpRoutes.js";
const DEFAULT_COMPANION_PORT = 18790;
let server;
let activePort;
export function ensureOctoGlyphsLocalServer(config) {
    const port = readCompanionPort(config) ?? DEFAULT_COMPANION_PORT;
    if (server && activePort === port) {
        return `http://localhost:${port}/octoglyphs`;
    }
    if (server) {
        server.close();
        server = undefined;
        activePort = undefined;
    }
    const nextServer = createServer(async (req, res) => {
        try {
            const handled = await handleOctoGlyphsRoute(req, res);
            if (!handled && !res.writableEnded) {
                res.statusCode = 404;
                res.end("Not found");
            }
        }
        catch {
            if (!res.writableEnded) {
                res.statusCode = 500;
                res.end("OctoGlyphs local server error");
            }
        }
    });
    nextServer.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.warn(`[octoglyphs] local companion port ${port} is already in use; reusing existing localhost URL.`);
            return;
        }
        console.warn("[octoglyphs] local companion server error", error);
    });
    nextServer.listen(port, "127.0.0.1");
    nextServer.unref();
    server = nextServer;
    activePort = port;
    return `http://localhost:${port}/octoglyphs`;
}
function readCompanionPort(config) {
    const rawPort = config?.companionPort;
    if (typeof rawPort === "number" && Number.isInteger(rawPort) && rawPort > 0 && rawPort < 65536) {
        return rawPort;
    }
    if (typeof rawPort === "string") {
        const parsed = Number.parseInt(rawPort, 10);
        if (Number.isInteger(parsed) && parsed > 0 && parsed < 65536) {
            return parsed;
        }
    }
    return undefined;
}
//# sourceMappingURL=localServer.js.map