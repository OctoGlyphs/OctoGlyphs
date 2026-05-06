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

const VIRTUAL_APP_WIDTH = 1280;
const VIRTUAL_APP_HEIGHT = 720;

function updateAppScale() {
    const scaleRoot = document.getElementById("panel-root");
    const viewport = document.getElementById("app-viewport");
    if (!scaleRoot || !viewport) return;

    const bounds = viewport.getBoundingClientRect();
    const scale = Math.min(bounds.width / VIRTUAL_APP_WIDTH, bounds.height / VIRTUAL_APP_HEIGHT);
    scaleRoot.style.setProperty("--octoglyphs-app-scale", String(scale));
}

updateAppScale();
window.addEventListener("resize", updateAppScale);

await loadPixelFont();

const game = window.__OCTOGLYPHS_GAME = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: VIRTUAL_APP_WIDTH,
    height: VIRTUAL_APP_HEIGHT - 126,
    backgroundColor: "#061827",
    pixelArt: true,
    roundPixels: true,
    autoFocus: false,
    pauseOnBlur: false,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.NONE,
        width: VIRTUAL_APP_WIDTH,
        height: VIRTUAL_APP_HEIGHT - 126
    },
    scene: [BootScene, IncubationScene, UIScene]
});

const privacy = createPrivacyGuards();
const bridge = createOctoGlyphsBridge({
    privacy,
    onStatus(status) {
        const readout = document.getElementById("plugin-status-readout");
        if (!readout || !status?.state) return;

        if (status.state === "connecting") {
            readout.textContent = "Connecting to OctoGlyphs stream...";
            return;
        }

        if (status.state === "connected") {
            readout.textContent = "OctoGlyphs stream connected";
            return;
        }

        if (status.state === "event") {
            readout.textContent = `Last OctoGlyphs event: ${status.eventType}`;
            return;
        }

        if (status.state === "error") {
            readout.textContent = "OctoGlyphs stream disconnected or unavailable";
            return;
        }

        if (status.state === "unsupported") {
            readout.textContent = "OctoGlyphs stream unsupported in this browser";
        }
    },
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
const shuffledMusicTracks = [...MUSIC_TRACKS].sort(() => Math.random() - 0.5);
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
    if (musicMuted || shuffledMusicTracks.length === 0) return;

    for (let attempt = 0; attempt < shuffledMusicTracks.length; attempt += 1) {
        const track = shuffledMusicTracks[currentTrackIndex % shuffledMusicTracks.length];
        currentTrackIndex += 1;
        if (!game.cache.audio.exists(track.key)) continue;

        currentMusic = game.sound.add(track.key, { volume: 0.42 });
        currentMusic.once("complete", () => {
            currentMusic = null;
            playNextMusicTrack();
        });
        currentMusic.play();
        return;
    }
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
