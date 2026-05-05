const clients = new Set();
export function broadcastOctoGlyphsEvent(event) {
    const envelope = {
        protocol: "octoglyphs.events.v1",
        event
    };
    const payload = `event: octoglyphs\ndata: ${JSON.stringify(envelope)}\n\n`;
    for (const client of clients) {
        try {
            client.write(payload);
        }
        catch {
            client.close();
            clients.delete(client);
        }
    }
}
export function addOctoGlyphsStreamClient(client) {
    clients.add(client);
    client.write(": octoglyphs stream connected\n\n");
    return () => {
        clients.delete(client);
    };
}
export function getOctoGlyphsStreamClientCount() {
    return clients.size;
}
//# sourceMappingURL=eventHub.js.map