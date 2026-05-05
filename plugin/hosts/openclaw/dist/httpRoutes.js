import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { addOctoGlyphsStreamClient } from "./eventHub.js";
const STATIC_ROOT = resolve(fileURLToPath(new URL("../public", import.meta.url)));
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
export async function handleOctoGlyphsRoute(req, res) {
    const requestPath = getRequestPath(req);
    if (requestPath === "/octoglyphs/health") {
        writeJson(res, 200, {
            ok: true,
            companion: "/octoglyphs",
            stream: "/octoglyphs/stream",
            protocol: "octoglyphs.events.v1"
        });
        return true;
    }
    if (requestPath === "/octoglyphs/stream") {
        openEventStream(req, res);
        return true;
    }
    if (requestPath === "/octoglyphs/events") {
        writeJson(res, 405, { ok: false, error: "events_post_disabled" });
        return true;
    }
    return serveStaticFile(requestPath, res);
}
function openEventStream(req, res) {
    res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no"
    });
    const cleanup = addOctoGlyphsStreamClient({
        write(chunk) {
            res.write(chunk);
        },
        close() {
            res.end();
        }
    });
    req.on("close", cleanup);
}
function serveStaticFile(requestPath, res) {
    const relativePath = getStaticRelativePath(requestPath);
    const filePath = resolve(join(STATIC_ROOT, normalize(relativePath)));
    if (!isInsideStaticRoot(filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
        res.statusCode = 404;
        res.end("Not found");
        return true;
    }
    res.statusCode = 200;
    res.setHeader("content-type", MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream");
    res.setHeader("cache-control", filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable");
    createReadStream(filePath).pipe(res);
    return true;
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
    }
    catch {
        return "/";
    }
}
function writeJson(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
}
//# sourceMappingURL=httpRoutes.js.map