export const BACKGROUND_TRACKS = [
    { key: "bg-shallow-1", file: "shallow1.png", depth: "shallow" },
    { key: "bg-deep-1", file: "deep1.png", depth: "deep" }
];

export const MUSIC_TRACKS = [
    { key: "music-octosong-1", file: "octosong1.mp3" },
    { key: "music-octosong-2", file: "octosong2.mp3" },
    { key: "music-octosong-3", file: "octosong3.mp3" },
    { key: "music-octosong-4", file: "octosong4.mp3" },
    { key: "music-octosong-5", file: "octosong5.mp3" },
    { key: "music-octosong-6", file: "octosong6.mp3" },
    { key: "music-octosong-7", file: "octosong7.mp3" },
    { key: "music-octosong-8", file: "octosong8.mp3" }
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
