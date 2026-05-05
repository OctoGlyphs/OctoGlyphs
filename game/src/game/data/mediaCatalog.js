export const BACKGROUND_TRACKS = [
    { key: "bg-shallow-1", file: "shallow1.webp", depth: "shallow" },
    { key: "bg-deep-1", file: "deep1.webp", depth: "deep" }
];

export const MUSIC_TRACKS = [
    { key: "music-octosong-1", file: "octosong1.ogg" },
    { key: "music-octosong-2", file: "octosong2.ogg" },
    { key: "music-octosong-3", file: "octosong3.ogg" },
    { key: "music-octosong-4", file: "octosong4.ogg" },
    { key: "music-octosong-5", file: "octosong5.ogg" },
    { key: "music-octosong-7", file: "octosong7.ogg" }
];

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
