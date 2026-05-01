import { Scene } from "phaser";
import { preloadCatalog } from "../data/assetCatalog.js";
import { BACKGROUND_TRACKS, MUSIC_TRACKS, backgroundUrl, musicUrl } from "../data/mediaCatalog.js";

export class BootScene extends Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        preloadCatalog(this);
        for (const background of BACKGROUND_TRACKS) this.load.image(background.key, backgroundUrl(background.file));
        for (const track of MUSIC_TRACKS) this.load.audio(track.key, musicUrl(track.file));
        this.load.image("audio-icon-mute", "./assets/raw/music/mute.png");
        this.load.image("audio-icon-unmute", "./assets/raw/music/unmute.png");
    }

    create() {
        this.scene.start("IncubationScene");
        this.scene.launch("UIScene");
    }
}
