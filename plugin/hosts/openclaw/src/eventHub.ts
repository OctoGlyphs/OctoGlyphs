type OctoGlyphsEnvelope = {
    protocol: "octoglyphs.events.v1";
    event: Record<string, unknown>;
};

type StreamClient = {
    write: (chunk: string) => void;
    close: () => void;
};

const clients = new Set<StreamClient>();

export function broadcastOctoGlyphsEvent(event: Record<string, unknown>): void {
    const envelope: OctoGlyphsEnvelope = {
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

export function addOctoGlyphsStreamClient(client: StreamClient): () => void {
    clients.add(client);
    client.write(": octoglyphs stream connected\n\n");

    return () => {
        clients.delete(client);
    };
}

export function getOctoGlyphsStreamClientCount(): number {
    return clients.size;
}
