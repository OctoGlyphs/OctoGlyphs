export const BACKGROUND_TRACKS = [
    { key: "bg-shallow-1", file: "shallow1.png", depth: "shallow" },
    { key: "bg-deep-1", file: "deep1.png", depth: "deep" }
];

export const MUSIC_TRACKS = [];

export function backgroundUrl(file) {
    return `./assets/raw/Backgrounds/${file}`;
}

export function musicUrl(file) {
    return `./assets/raw/music/${file}`;
}

export function pickBackgroundForWave(wave = 0) {
    const safeWave = Math.max(0, wave || 0);
    return BACKGROUND_TRACKS[Math.min(safeWave, BACKGROUND_TRACKS.length - 1)] || BACKGROUND_TRACKS[0];
}

export function pickBackgroundForDepthIndex(index = 0) {
    const safeIndex = Math.max(0, index || 0);
    return BACKGROUND_TRACKS[Math.min(safeIndex, BACKGROUND_TRACKS.length - 1)] || BACKGROUND_TRACKS[0];
}
