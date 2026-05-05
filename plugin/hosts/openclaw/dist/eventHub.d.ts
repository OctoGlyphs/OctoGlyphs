type StreamClient = {
    write: (chunk: string) => void;
    close: () => void;
};
export declare function broadcastOctoGlyphsEvent(event: Record<string, unknown>): void;
export declare function addOctoGlyphsStreamClient(client: StreamClient): () => void;
export declare function getOctoGlyphsStreamClientCount(): number;
export {};
