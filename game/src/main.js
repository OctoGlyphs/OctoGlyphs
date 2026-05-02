import * as Phaser from "phaser";
import "./styles/panel.css";
import { BootScene } from "./game/scenes/BootScene.js";
import { IncubationScene } from "./game/scenes/IncubationScene.js";
import { UIScene } from "./game/scenes/UIScene.js";
import { createOctoGlyphsBridge } from "./plugin/octoglyphsBridge.js";
import { createPrivacyGuards } from "./plugin/privacyGuards.js";
import { MUSIC_TRACKS } from "./game/data/mediaCatalog.js";

async function loadPixelFont() {
    if (!document.fonts) return;

    await document.fonts.load("16px \"Press Start 2P\"");
    await document.fonts.ready;
}

await loadPixelFont();

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: 360,
    height: 640,
    backgroundColor: "#061827",
    pixelArt: true,
    roundPixels: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, IncubationScene, UIScene]
});

const privacy = createPrivacyGuards();
const bridge = createOctoGlyphsBridge({
    privacy,
    onEvent(event) {
        game.events.emit("octoglyphs:event", event);
    }
});

bridge.start();

const params = new URLSearchParams(window.location.search);
const isPluginMode = params.get("plugin") === "1" || params.get("mode") === "plugin";

if (isPluginMode) {
    document.body.classList.add("plugin-mode");
    document.getElementById("plugin-status-readout").textContent = "OpenClaw companion mode";
    document.title = "OctoGlyphs Companion";
}


document.getElementById("tank-hunt-button")?.addEventListener("click", () => {
    game.events.emit("octoglyphs:start-tank-hunt");
});

let currentMusic = null;
let currentTrackIndex = 0;
let musicMuted = localStorage.getItem("octoglyphs.musicMuted") === "true";
const musicButton = document.getElementById("music-toggle");
const musicIcon = musicButton?.querySelector("img");
const musicLabel = musicButton?.querySelector("span");

function updateMusicButton() {
    if (musicIcon) musicIcon.src = musicMuted ? "./assets/raw/music/mute.png" : "./assets/raw/music/unmute.png";
    if (musicLabel) musicLabel.textContent = musicMuted ? "Muted" : "Music";
    musicButton?.classList.toggle("is-muted", musicMuted);
}

function playNextMusicTrack() {
    if (musicMuted || MUSIC_TRACKS.length === 0) return;
    const track = MUSIC_TRACKS[currentTrackIndex % MUSIC_TRACKS.length];
    currentTrackIndex += 1;
    currentMusic = game.sound.add(track.key, { volume: 0.42 });
    currentMusic.once("complete", () => {
        currentMusic = null;
        playNextMusicTrack();
    });
    currentMusic.play();
}

function stopMusic() {
    if (!currentMusic) return;
    currentMusic.stop();
    currentMusic.destroy();
    currentMusic = null;
}

function ensureMusicPlaying() {
    if (musicMuted || currentMusic) return;
    playNextMusicTrack();
}

musicButton?.addEventListener("click", () => {
    musicMuted = !musicMuted;
    localStorage.setItem("octoglyphs.musicMuted", String(musicMuted));
    if (musicMuted) stopMusic();
    updateMusicButton();
    ensureMusicPlaying();
});

window.addEventListener("pointerdown", ensureMusicPlaying, { once: true });
window.addEventListener("keydown", ensureMusicPlaying, { once: true });
updateMusicButton();
