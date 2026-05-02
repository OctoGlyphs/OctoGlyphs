import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 18791;
const STATIC_ROOT = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const clients = new Set();

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg"
};

const port = readPort();
const server = createServer(async (req, res) => {
    try {
        await handleRequest(req, res);
    } catch {
        if (!res.writableEnded) {
            res.statusCode = 500;
            res.end("OctoGlyphs sidecar error");
        }
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`OctoGlyphs Claude Code companion running at http://localhost:${port}/octoglyphs`);
});

async function handleRequest(req, res) {
    const requestPath = getRequestPath(req);

    if (requestPath === "/octoglyphs/health") {
        writeJson(res, 200, {
            ok: true,
            host: "claude-code",
            companion: "/octoglyphs",
            stream: "/octoglyphs/stream",
            protocol: "octoglyphs.events.v1"
        });
        return;
    }

    if (requestPath === "/octoglyphs/stream") {
        openEventStream(req, res);
        return;
    }

    if (requestPath === "/octoglyphs/events") {
        await handleEventPost(req, res);
        return;
    }

    serveStaticFile(requestPath, res);
}

async function handleEventPost(req, res) {
    if (req.method !== "POST") {
        writeJson(res, 405, { ok: false, error: "method_not_allowed" });
        return;
    }

    const body = await readRequestBody(req);
    const parsed = parseJson(body);
    const event = sanitizeIncomingEvent(parsed?.event);

    if (!event) {
        writeJson(res, 400, { ok: false, error: "invalid_event" });
        return;
    }

    broadcastEvent(event);
    writeJson(res, 200, { ok: true });
}

function openEventStream(req, res) {
    res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no"
    });

    const client = {
        write(chunk) {
            res.write(chunk);
        },
        close() {
            res.end();
        }
    };

    clients.add(client);
    client.write(": octoglyphs stream connected\n\n");
    req.on("close", () => clients.delete(client));
}

function broadcastEvent(event) {
    const envelope = {
        protocol: "octoglyphs.events.v1",
        event
    };
    const payload = `event: octoglyphs\ndata: ${JSON.stringify(envelope)}\n\n`;

    for (const client of clients) {
        try {
            client.write(payload);
        } catch {
            client.close();
            clients.delete(client);
        }
    }
}

function serveStaticFile(requestPath, res) {
    const relativePath = getStaticRelativePath(requestPath);
    const filePath = resolve(join(STATIC_ROOT, normalize(relativePath)));

    if (!isInsideStaticRoot(filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
        res.statusCode = 404;
        res.end("Not found");
        return;
    }

    res.statusCode = 200;
    res.setHeader("content-type", MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream");
    res.setHeader("cache-control", filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable");
    createReadStream(filePath).pipe(res);
}

function sanitizeIncomingEvent(event) {
    if (!event || typeof event !== "object" || typeof event.type !== "string") {
        return undefined;
    }

    const clean = {};
    for (const [key, value] of Object.entries(event)) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            clean[key] = value;
        }
    }

    clean.timestamp = typeof clean.timestamp === "number" && Number.isFinite(clean.timestamp) ? Math.max(0, Math.round(clean.timestamp)) : Date.now();
    clean.type = event.type;
    return clean;
}

function readRequestBody(req) {
    return new Promise((resolveBody, rejectBody) => {
        let body = "";
        req.setEncoding("utf8");
        req.on("data", chunk => {
            body += chunk;
            if (body.length > 65536) {
                req.destroy();
                rejectBody(new Error("request_too_large"));
            }
        });
        req.on("end", () => resolveBody(body));
        req.on("error", rejectBody);
    });
}

function parseJson(text) {
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

function isInsideStaticRoot(filePath) {
    const relation = relative(STATIC_ROOT, filePath);
    return relation === "" || (!relation.startsWith("..") && !relation.startsWith("/"));
}

function getStaticRelativePath(requestPath) {
    if (requestPath === "/octoglyphs" || requestPath === "/octoglyphs/") {
        return "index.html";
    }

    if (requestPath.startsWith("/octoglyphs/")) {
        return decodeURIComponent(requestPath.slice("/octoglyphs/".length));
    }

    if (requestPath.startsWith("/assets/")) {
        return decodeURIComponent(requestPath.slice(1));
    }

    return decodeURIComponent(requestPath.replace(/^\//, ""));
}

function getRequestPath(req) {
    try {
        return new URL(req.url ?? "/", "http://localhost").pathname;
    } catch {
        return "/";
    }
}

function readPort() {
    const parsed = Number.parseInt(process.env.OCTOGLYPHS_CLAUDE_PORT ?? "", 10);
    if (Number.isInteger(parsed) && parsed > 0 && parsed < 65536) {
        return parsed;
    }
    return DEFAULT_PORT;
}

function writeJson(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
}
