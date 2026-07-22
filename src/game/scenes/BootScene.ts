import Phaser from "phaser";
import { playableCharacters } from "../data/characters";

export class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }

  preload(): void {
    this.load.setPath("assets/pixel");
    this.load.image("floor-upgrade", "floor-v1.png");
    this.load.image("bookshelf-upgrade", "bookshelf-v1.png");
    this.load.image("counter-upgrade", "counter-v2.png");
    this.load.image("plant-upgrade", "plant-v1.png");
    this.load.image("book-cart-upgrade", "book-cart-v1.png");
    this.load.image("genre-sign", "genre-sign-v1.png");
    this.load.image("bookworm-meter", "bookworm-meter-v1.png");
    this.load.audio("music-background", "../sounds/background-music.mp3");
    this.load.audio("sfx-book-shelf", "../sounds/book-shelf.mp3");
    this.load.audio("sfx-page-turn", "../sounds/book-page-turn.mp3");
    this.load.audio("sfx-barcode-scanner", "../sounds/barcode-scanner.mp3");
    this.load.audio("sfx-wrong-answer", "../sounds/wrong-answer.wav");
    this.load.audio("sfx-footsteps", "../sounds/wood-footsteps.mp3");
    for (const genreId of [
      "avontuur", "fantasy", "humor", "spanning",
      "detective", "sciencefiction", "historisch", "informatie",
    ]) {
      this.load.image(`genre-icon-${genreId}`, `genre-icon-${genreId}-v1.png`);
      this.load.image(`book-${genreId}`, `book-${genreId}-v1.png`);
    }
    this.load.image("player", "player-v1.png");
    for (const character of playableCharacters) {
      for (const direction of ["down", "side", "up"] as const) {
        for (let frame = 0; frame < 3; frame += 1) {
          const key = `character-${character.id}-walk-${direction}-${frame}`;
          this.load.image(key, `${key}-v1.png`);
        }
      }
    }
    for (let index = 0; index < 11; index += 1) {
      this.load.image(`visitor-${index}`, `visitor-${index}-v1.png`);
      for (let frame = 0; frame < 2; frame += 1) {
        this.load.image(
          `visitor-${index}-walk-side-${frame}`,
          `visitor-${index}-walk-side-${frame}-v1.png`,
        );
      }
    }
  }

  create(): void {
    this.createPlayerTexture();
    this.createVisitorTextures();
    this.createBookTexture();
    this.createPlayerAnimations();
    this.createVisitorAnimations();
    this.scene.start("menu");
  }

  private createPlayerTexture(): void {
    if (this.textures.exists("player")) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x2b2030).fillRect(8, 3, 16, 5);
    g.fillStyle(0xc78967).fillRect(9, 8, 14, 10);
    g.fillStyle(0x392537).fillRect(7, 18, 18, 15);
    g.fillStyle(0xe4a84a).fillRect(7, 18, 18, 4);
    g.fillStyle(0x26354e).fillRect(8, 33, 7, 9).fillRect(18, 33, 7, 9);
    g.generateTexture("player", 32, 44).destroy();
  }

  private createVisitorTextures(): void {
    const skins = [0x8c563b, 0xe0ae86, 0x6e4331, 0xc8845f, 0xf0c6a4];
    const clothes = [0x4f7aa2, 0xb45468, 0x4d8b62, 0x8c67a8, 0xc27a3d];
    Array.from({ length: 11 }, (_, index) => index).forEach((index) => {
      if (this.textures.exists(`visitor-${index}`)) return;
      const skin = skins[index % skins.length] ?? 0xc78967;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(index % 2 ? 0x3a251e : 0x251c22).fillRect(7, 2, 18, 8);
      g.fillStyle(skin).fillRect(8, 9, 16, 13);
      if (index === 2) g.lineStyle(2, 0x261d2c).strokeRect(9, 13, 6, 4).strokeRect(17, 13, 6, 4);
      g.fillStyle(clothes[index % clothes.length] ?? 0x4f7aa2).fillRect(5, 22, 22, 18);
      g.fillStyle(0x2a2632).fillRect(7, 40, 7, 7).fillRect(18, 40, 7, 7);
      g.generateTexture(`visitor-${index}`, 32, 48).destroy();
    });
  }

  private createBookTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffe089).fillRect(1, 1, 14, 18);
    g.fillStyle(0x7b3846).fillRect(2, 2, 3, 16);
    g.lineStyle(1, 0x3a2530).strokeRect(1, 1, 14, 18);
    g.generateTexture("book", 16, 20).destroy();
  }

  private createPlayerAnimations(): void {
    for (const character of playableCharacters) {
      for (const direction of ["down", "side", "up"] as const) {
        const key = `character-${character.id}-walk-${direction}`;
        if (this.anims.exists(key) || !this.textures.exists(`${key}-0`)) continue;
        this.anims.create({
          key,
          frames: [0, 1, 2, 1].map((frame) => ({ key: `${key}-${frame}` })),
          frameRate: 9,
          repeat: -1,
        });
      }
    }
  }

  private createVisitorAnimations(): void {
    for (let index = 0; index < 11; index += 1) {
      const key = `visitor-${index}-walk-side`;
      if (this.anims.exists(key) || !this.textures.exists(`${key}-0`)) continue;
      this.anims.create({
        key,
        frames: [0, 1].map((frame) => ({ key: `${key}-${frame}` })),
        frameRate: 7,
        repeat: -1,
      });
    }
  }
}
