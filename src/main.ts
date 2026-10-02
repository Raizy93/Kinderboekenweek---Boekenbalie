import Phaser from "phaser";
import "./style.css";
import { GAME_HEIGHT, GAME_WIDTH } from "./game/config";
import { BootScene } from "./game/scenes/BootScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { LibraryScene } from "./game/scenes/LibraryScene";

const gameContainer = document.querySelector<HTMLElement>("#app");
const fullscreenButton = document.querySelector<HTMLButtonElement>("#fullscreen-button");
const fullscreenLabel = fullscreenButton?.querySelector<HTMLElement>(".fullscreen-label");

function updateFullscreenButton(): void {
  const isFullscreen = document.fullscreenElement === gameContainer;
  if (fullscreenLabel) fullscreenLabel.textContent = isFullscreen ? "SCHERM VERKLEINEN" : "VOLLEDIG SCHERM";
  fullscreenButton?.setAttribute(
    "aria-label",
    isFullscreen ? "Verlaat het volledige scherm" : "Open de game op volledig scherm",
  );
}

fullscreenButton?.addEventListener("click", () => {
  if (!gameContainer) return;
  const action = document.fullscreenElement
    ? document.exitFullscreen()
    : gameContainer.requestFullscreen({ navigationUI: "hide" });

  void action.catch(() => {
    if (!fullscreenLabel) return;
    fullscreenLabel.textContent = "FULLSCREEN GEBLOKKEERD";
    window.setTimeout(updateFullscreenButton, 1800);
  });
});

document.addEventListener("fullscreenchange", updateFullscreenButton);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#2f2435",
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, LibraryScene],
});
