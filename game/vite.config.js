import { defineConfig } from "vite";

const OCTOGLYPHS_PROTOCOL = "octoglyphs.events.v1";

export default defineConfig({
    base: "./",
    plugins: [octoglyphsCompanionReceiver()]
});

function octoglyphsCompanionReceiver() {
    const clients = new Set();

    return {
        name: "octoglyphs-companion-receiver",
        configureServer(server) {
            server.middlewares.use("/octoglyphs/events", async (req, res) => {
                if (req.method !== "POST") {
                    res.statusCode = 405;
                    res.end("Method not allowed");
                    return;
                }

                try {
                    const payload = await readJsonBody(req);

                    if (payload?.protocol !== OCTOGLYPHS_PROTOCOL || typeof payload.event !== "object") {
                        res.statusCode = 400;
                        res.end("Invalid OctoGlyphs event envelope");
                        return;
                    }

                    broadcast(clients, payload);
                    res.setHeader("content-type", "application/json");
                    res.end(JSON.stringify({ ok: true }));
                } catch {
                    res.statusCode = 400;
                    res.end("Invalid JSON");
                }
            });

            server.middlewares.use("/octoglyphs/stream", (req, res) => {
                if (req.method !== "GET") {
                    res.statusCode = 405;
                    res.end("Method not allowed");
                    return;
                }

                res.writeHead(200, {
                    "content-type": "text/event-stream",
                    "cache-control": "no-cache, no-transform",
                    connection: "keep-alive",
                    "access-control-allow-origin": "*"
                });
                res.write(`event: ready\ndata: {"protocol":"${OCTOGLYPHS_PROTOCOL}"}\n\n`);

                clients.add(res);
                req.on("close", () => clients.delete(res));
            });
        }
    };
}

function broadcast(clients, payload) {
    const data = JSON.stringify(payload);

    for (const client of clients) {
        client.write(`event: octoglyphs\ndata: ${data}\n\n`);
    }
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 32768) {
                reject(new Error("Body too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}
