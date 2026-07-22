import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH, INTERACTION_COOLDOWN_MS, INTERACTION_DISTANCE, PLAYER_SPEED, WORKDAY_DURATION_MS } from "../config";
import { isCharacterId, type CharacterId } from "../data/characters";
import { genres, getGenre, type Genre, type GenreId } from "../data/genres";
import { requests, type GenreRequest } from "../data/requests";
import { getHighScoreRepository, sanitizePlayerName } from "../services/HighScoreService";
import { GameSystems, type CarriedBook } from "../systems/GameSystems";
import { RequestDeck, type Difficulty } from "../systems/RequestDeck";

interface ShelfView {
  id: string;
  genre: Genre;
  x: number;
  y: number;
  body: Phaser.GameObjects.Rectangle;
}

type PlayerDirection = "down" | "side" | "up";

const VISITOR_Y = 228;
const WORKDAY_START_MINUTES = 9 * 60;
const WORKDAY_MINUTES = 8 * 60;
const WORM_SEGMENT_COUNT = 8;

export class LibraryScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<"up" | "down" | "left" | "right" | "interact", Phaser.Input.Keyboard.Key>;
  private shelves: ShelfView[] = [];
  private carriedBook: CarriedBook | null = null;
  private carriedSprite?: Phaser.GameObjects.Image;
  private systems = new GameSystems();
  private requestIndex = 0;
  private requestDeck!: RequestDeck;
  private difficulty: Difficulty = "mixed";
  private activeRequest!: GenreRequest;
  private requestText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private feedbackPanel!: Phaser.GameObjects.Container;
  private feedbackTitle!: Phaser.GameObjects.Text;
  private feedbackBody!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private streakText!: Phaser.GameObjects.Text;
  private wormBase!: Phaser.GameObjects.Image;
  private wormFill!: Phaser.GameObjects.Image;
  private workdayText!: Phaser.GameObjects.Text;
  private workdayFill!: Phaser.GameObjects.Rectangle;
  private bookText!: Phaser.GameObjects.Text;
  private helpedText!: Phaser.GameObjects.Text;
  private visitorSprites: Phaser.GameObjects.Sprite[] = [];
  private activeVisitorX = 164;
  private lastInteraction = -1000;
  private locked = false;
  private paused = false;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private footstepsSound?: Phaser.Sound.BaseSound;
  private audioButtonText!: Phaser.GameObjects.Text;
  private audioMuted = false;
  private workdayElapsedMs = 0;
  private workdayEnded = false;
  private endOverlay?: Phaser.GameObjects.Container;
  private lastDirection: PlayerDirection = "down";
  private playerCharacter: CharacterId = "sam";

  constructor() { super("library"); }

  create(): void {
    this.systems = new GameSystems();
    this.shelves = [];
    this.visitorSprites = [];
    this.workdayElapsedMs = 0;
    this.workdayEnded = false;
    this.locked = false;
    this.paused = false;
    this.audioMuted = Boolean(this.registry.get("audioMuted"));
    this.sound.mute = this.audioMuted;
    this.difficulty = (this.registry.get("difficulty") as Difficulty | undefined) ?? "mixed";
    const selectedCharacter = this.registry.get("character");
    this.playerCharacter = isCharacterId(selectedCharacter) ? selectedCharacter : "sam";
    this.requestDeck = new RequestDeck(requests, this.difficulty);
    this.activeRequest = this.requestDeck.next();
    this.drawRoom();
    this.createShelves();
    this.createVisitors();
    this.createPlayer();
    this.createHud();
    this.createFeedback();
    this.setupInput();
    this.setupAudio();
    this.physics.world.setBounds(22, 400, GAME_WIDTH - 44, GAME_HEIGHT - 422);
    this.updateHud();
    this.updateWorkdayHud();
    this.showHelpMessage();
  }

  update(time: number, delta: number): void {
    if (!this.paused && !this.locked && !this.feedbackPanel.visible && !this.workdayEnded) {
      this.advanceWorkday(delta);
    }
    if (this.paused || this.locked || this.workdayEnded) {
      this.player.setVelocity(0);
      this.stopPlayerAnimation();
      this.setFootsteps(false);
      return;
    }
    this.movePlayer();
    this.updatePrompt();
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || Phaser.Input.Keyboard.JustDown(this.cursors.space!)) {
      if (time - this.lastInteraction >= INTERACTION_COOLDOWN_MS) {
        this.lastInteraction = time;
        this.interact();
      }
    }
  }

  private drawRoom(): void {
    this.add.rectangle(576, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x9b704d);
    if (this.textures.exists("floor-upgrade")) {
      this.add.image(576, 590, "floor-upgrade").setDisplaySize(1152, 540).setDepth(0);
    } else {
      const floor = this.add.graphics();
      for (let y = 320; y < GAME_HEIGHT; y += 24) {
        floor.fillStyle((y / 24) % 2 ? 0xa77a55 : 0x98704e).fillRect(0, y, 1152, 23);
        for (let x = (y % 48 ? -70 : 20); x < 1152; x += 180) floor.fillStyle(0x765139, 0.5).fillRect(x, y + 19, 130, 2);
      }
    }
    this.add.rectangle(576, 200, 1152, 280, 0x302538);
    this.add.rectangle(576, 320, 1152, 10, 0x201922);
    if (this.textures.exists("counter-upgrade")) {
      this.add.image(576, 312, "counter-upgrade").setDisplaySize(1080, 148).setDepth(3);
    } else {
      this.add.rectangle(576, 312, 1040, 48, 0x68462f).setStrokeStyle(4, 0x2b1c19);
      this.add.rectangle(576, 317, 1010, 14, 0xb17f50);
    }
    this.add.image(92, 312, "genre-sign").setDisplaySize(106, 36).setDepth(5);
    this.add.rectangle(92, 324, 88, 2, COLORS.gold).setDepth(5.5);
    this.add.text(92, 311, "BALIE", {
      fontFamily: "monospace", fontSize: "14px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);
    this.add.rectangle(30, 590, 16, 520, 0x503828);
    this.add.rectangle(1122, 590, 16, 520, 0x503828);
    this.add.rectangle(576, 852, 1108, 16, 0x503828);
    if (this.textures.exists("plant-upgrade")) {
      this.add.image(290, 812, "book-cart-upgrade").setDisplaySize(52, 64).setDepth(2);
    } else {
      this.add.circle(1100, 620, 26, 0x406b4b).setStrokeStyle(5, 0x493326);
      this.add.circle(1114, 628, 19, 0x56865c);
    }
  }

  private createShelves(): void {
    const obstacles = this.physics.add.staticGroup();
    const positions = [
      { x: 150, y: 510 }, { x: 430, y: 510 }, { x: 710, y: 510 }, { x: 990, y: 510 },
      { x: 150, y: 720 }, { x: 430, y: 720 }, { x: 710, y: 720 }, { x: 990, y: 720 },
    ];
    genres.forEach((genre, index) => {
      const pos = positions[index];
      if (!pos) return;
      const shadow = this.add.rectangle(pos.x + 7, pos.y + 9, 212, 126, 0x2d1d19, 0.35);
      shadow.setDepth(1);
      const upgradedShelf = this.textures.exists("bookshelf-upgrade");
      const body = this.add.rectangle(pos.x, pos.y, 210, 124, upgradedShelf ? 0x000000 : 0x4d3023, upgradedShelf ? 0.001 : 1)
        .setStrokeStyle(upgradedShelf ? 0 : 5, 0x201715).setDepth(2);
      obstacles.add(body);
      if (upgradedShelf) {
        this.add.image(pos.x, pos.y + 3, "bookshelf-upgrade").setDisplaySize(210, 143).setDepth(3).setFlipX(index % 2 === 1);
      }
      const signY = pos.y - 62;
      const genreIconKey = `genre-icon-${genre.id}`;
      if (this.textures.exists("genre-sign") && this.textures.exists(genreIconKey)) {
        const signDepth = upgradedShelf ? 2 : 3;
        const signDetailDepth = upgradedShelf ? 2.5 : 4;
        this.add.image(pos.x, signY, "genre-sign").setDisplaySize(210, 44).setDepth(signDepth);
        this.add.rectangle(pos.x, signY + 15, 184, 3, genre.shelfColor).setDepth(signDetailDepth);
        this.add.image(pos.x - 78, signY - 1, genreIconKey).setDisplaySize(28, 28).setDepth(signDetailDepth);
        this.add.text(pos.x + 12, signY - 1, genre.name.toUpperCase(), {
          fontFamily: "monospace",
          fontSize: genre.id === "sciencefiction" ? "13px" : genre.id === "historisch" ? "14px" : "16px",
          fontStyle: "bold",
          color: "#fff2cc",
          stroke: "#211721",
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(signDetailDepth);
      } else {
        const top = this.add.rectangle(pos.x, signY, 194, 28, genre.shelfColor).setDepth(3);
        top.setStrokeStyle(3, 0x211721);
        this.add.text(pos.x, signY, `${genre.symbol}  ${genre.name.toUpperCase()}`, {
          fontFamily: "monospace", fontSize: genre.id === "sciencefiction" ? "15px" : "17px", fontStyle: "bold", color: "#fff8df",
          stroke: "#211721", strokeThickness: 4,
        }).setOrigin(0.5).setDepth(4);
      }
      if (!upgradedShelf) {
        for (let row = 0; row < 2; row += 1) {
          this.add.rectangle(pos.x, pos.y - 22 + row * 46, 168, 5, 0x261816).setDepth(3);
          for (let book = 0; book < 8; book += 1) {
            const color = Phaser.Display.Color.IntegerToColor(genre.shelfColor).darken(book % 3 === 0 ? 8 : -4).color;
            this.add.rectangle(pos.x - 71 + book * 20, pos.y - 4 + row * 45, 12, 30, color).setStrokeStyle(1, 0x2a1c20).setDepth(3);
          }
        }
      }
      this.shelves.push({ id: `shelf-${genre.id}`, genre, x: pos.x, y: pos.y, body });
    });
    this.registry.set("shelfObstacles", obstacles);
  }

  private createVisitors(): void {
    const xs = [164, 360, 555, 750, 946];
    xs.forEach((x, index) => {
      if (index === 0) {
        this.add.rectangle(x, 211, 78, 98, 0xf4bd4f, 0.13).setStrokeStyle(4, 0xf4bd4f).setDepth(1);
        this.add.text(x, 175, "NU HELPEN", { fontFamily: "monospace", fontSize: "12px", fontStyle: "bold", color: "#251b27", backgroundColor: "#f4bd4f", padding: { x: 7, y: 3 } }).setOrigin(0.5).setDepth(4);
      } else {
        this.add.text(x, 175, `WACHT ${index}`, { fontFamily: "monospace", fontSize: "12px", color: "#9e91a2" }).setOrigin(0.5).setDepth(4);
      }
      const sprite = this.add.sprite(x, VISITOR_Y, `visitor-${index}`).setScale(1).setDepth(2);
      sprite.setData("visitorIndex", index);
      this.visitorSprites.push(sprite);
    });
  }

  private createPlayer(): void {
    const selectedTexture = `character-${this.playerCharacter}-walk-down-1`;
    const initialTexture = this.textures.exists(selectedTexture) ? selectedTexture : "player";
    this.player = this.physics.add.sprite(576, 810, initialTexture).setScale(1).setDepth(20);
    if (this.textures.get("player").getSourceImage().width > 40) {
      this.player.setCollideWorldBounds(true).setSize(24, 22).setOffset(16, 46);
    } else {
      this.player.setCollideWorldBounds(true).setSize(22, 24).setOffset(5, 19);
    }
    const obstacles = this.registry.get("shelfObstacles") as Phaser.Physics.Arcade.StaticGroup | undefined;
    if (obstacles) this.physics.add.collider(this.player, obstacles);
  }

  private createHud(): void {
    this.add.rectangle(576, 36, 1152, 64, 0x110b0d, 0.72).setDepth(49);
    this.add.rectangle(576, 31, 1152, 62, 0x633920, 1).setStrokeStyle(5, 0x211315).setDepth(50);
    this.add.rectangle(576, 31, 1134, 44, 0x21191f, 0.98).setStrokeStyle(2, 0xa46b36).setDepth(50);
    [160, 330, 570, 790, 1010].forEach((x) => {
      this.add.rectangle(x, 31, 3, 36, 0x704126).setDepth(51);
    });
    this.scoreText = this.add.text(20, 18, "SCORE 0000", this.hudStyle()).setDepth(51);
    this.helpedText = this.add.text(177, 18, "GEHOLPEN 0", this.hudStyle()).setDepth(51);
    this.bookText = this.add.text(347, 18, "BOEK —", this.hudStyle()).setDepth(51);
    this.streakText = this.add.text(688, 6, "BOEKENWORM 0", {
      fontFamily: "monospace", fontSize: "14px", fontStyle: "bold", color: "#fff2d3",
    }).setOrigin(0.5, 0).setDepth(52);
    this.wormBase = this.add.image(609, 42, "bookworm-meter")
      .setOrigin(0, 0.5).setDisplaySize(158, 35).setTint(0x493b36).setAlpha(0.82).setDepth(51);
    this.wormFill = this.add.image(609, 42, "bookworm-meter")
      .setOrigin(0, 0.5).setDisplaySize(158, 35).setDepth(52);
    this.workdayText = this.add.text(808, 9, "WERKDAG 09:00", {
      fontFamily: "monospace", fontSize: "14px", fontStyle: "bold", color: "#fff2d3",
    }).setDepth(52);
    this.add.rectangle(808, 44, 182, 14, 0x5d351f).setOrigin(0, 0.5).setStrokeStyle(2, 0x1e1214).setDepth(51);
    this.add.rectangle(813, 44, 172, 8, 0x2b2228).setOrigin(0, 0.5).setDepth(51);
    this.workdayFill = this.add.rectangle(813, 44, 0, 8, COLORS.gold).setOrigin(0, 0.5).setDepth(52);
    const helpButton = this.add.image(1046, 30, "genre-sign")
      .setDisplaySize(66, 38).setDepth(52).setInteractive({ useHandCursor: true });
    this.add.rectangle(1046, 43, 54, 2, COLORS.gold).setDepth(52.5);
    this.add.text(1046, 29, "HULP ?", {
      fontFamily: "monospace", fontSize: "12px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(53);
    helpButton.on("pointerover", () => helpButton.setTint(0xffe0a0));
    helpButton.on("pointerout", () => helpButton.clearTint());
    helpButton.on("pointerdown", () => this.showHelpMessage());
    const audioButton = this.add.image(1115, 30, "genre-sign")
      .setDisplaySize(66, 38).setDepth(52).setInteractive({ useHandCursor: true });
    this.add.rectangle(1115, 43, 54, 2, COLORS.gold).setDepth(52.5);
    this.audioButtonText = this.add.text(1115, 29, this.audioMuted ? "AUDIO UIT" : "AUDIO AAN", {
      fontFamily: "monospace", fontSize: "10px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(53);
    audioButton.on("pointerover", () => audioButton.setTint(0xffe0a0));
    audioButton.on("pointerout", () => audioButton.clearTint());
    audioButton.on("pointerdown", () => this.toggleAudio());

    this.add.rectangle(582, 111, 1110, 84, 0x120c0e, 0.68).setDepth(29);
    this.add.rectangle(576, 105, 1110, 84, 0x633920, 1).setStrokeStyle(5, 0x211315).setDepth(30);
    this.add.rectangle(576, 105, 1082, 62, 0x21191f, 1).setStrokeStyle(2, 0xa46b36).setDepth(30);
    this.add.image(54, 108, "book").setDisplaySize(24, 30).setTint(0xf4bd4f).setDepth(31);
    const difficultyLabel = this.difficulty === "mixed" ? "GEMENGD" : `NIVEAU ${this.difficulty}`;
    this.add.text(82, 76, `BOEKWENS • ${difficultyLabel}`, {
      fontFamily: "monospace", fontSize: "12px", fontStyle: "bold", color: "#f4bd4f",
    }).setDepth(31);
    this.requestText = this.add.text(82, 101, this.activeRequest.request, {
      fontFamily: "Arial", fontSize: "18px", color: "#fff7e8", wordWrap: { width: 990 },
    }).setDepth(31);

    this.add.rectangle(576, 830, 720, 38, 0x19141d, 0.92).setStrokeStyle(2, 0x6d536a).setDepth(40);
    this.promptText = this.add.text(576, 830, "Loop naar een kast", { fontFamily: "Arial", fontSize: "17px", color: "#fff2ce" }).setOrigin(0.5).setDepth(41);
  }

  private createFeedback(): void {
    const frame = this.add.rectangle(576, 105, 1110, 84, 0x633920, 1).setStrokeStyle(5, COLORS.blue);
    const inner = this.add.rectangle(576, 105, 1082, 62, 0x21191f, 1).setStrokeStyle(2, 0xa46b36);
    this.feedbackTitle = this.add.text(58, 84, "", {
      fontFamily: "monospace", fontSize: "18px", fontStyle: "bold", color: "#ffffff",
      wordWrap: { width: 190 },
    });
    this.feedbackBody = this.add.text(258, 82, "", {
      fontFamily: "Arial", fontSize: "17px", color: "#f4e9da", wordWrap: { width: 840 },
    });
    this.feedbackPanel = this.add.container(0, 0, [frame, inner, this.feedbackTitle, this.feedbackBody]).setDepth(100).setVisible(false);
  }

  private setupInput(): void {
    if (!this.input.keyboard) throw new Error("Toetsenbordbediening is niet beschikbaar.");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ up: "W", down: "S", left: "A", right: "D", interact: "E" }) as typeof this.keys;
    this.input.keyboard.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard.on("keydown-H", () => this.showHelpMessage());
    this.input.keyboard.on("keydown-M", () => this.toggleAudio());
  }

  private setupAudio(): void {
    this.backgroundMusic = this.sound.add("music-background", { loop: true, volume: 0.035 });
    this.footstepsSound = this.sound.add("sfx-footsteps", { loop: true, volume: 0.12 });
    this.backgroundMusic.play();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.backgroundMusic?.stop();
      this.backgroundMusic?.destroy();
      this.footstepsSound?.stop();
      this.footstepsSound?.destroy();
      this.backgroundMusic = undefined;
      this.footstepsSound = undefined;
    });
  }

  private movePlayer(): void {
    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown;
    const down = this.cursors.down.isDown || this.keys.down.isDown;
    const velocity = new Phaser.Math.Vector2(Number(right) - Number(left), Number(down) - Number(up));
    if (velocity.lengthSq() > 0) velocity.normalize().scale(PLAYER_SPEED);
    this.player.setVelocity(velocity.x, velocity.y);
    this.setFootsteps(velocity.lengthSq() > 0);
    if (velocity.lengthSq() > 0) {
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        this.lastDirection = "side";
        this.player.setFlipX(velocity.x < 0);
      } else {
        this.lastDirection = velocity.y < 0 ? "up" : "down";
        this.player.setFlipX(false);
      }
      const animationKey = `character-${this.playerCharacter}-walk-${this.lastDirection}`;
      if (this.anims.exists(animationKey)) this.player.anims.play(animationKey, true);
    } else {
      this.stopPlayerAnimation();
    }
    if (this.carriedSprite) this.carriedSprite.setPosition(this.player.x, this.player.y - 51);
  }

  private stopPlayerAnimation(): void {
    this.player.anims.stop();
    const idleTexture = `character-${this.playerCharacter}-walk-${this.lastDirection}-1`;
    if (this.textures.exists(idleTexture) && this.player.texture.key !== idleTexture) {
      this.player.setTexture(idleTexture);
    }
  }

  private setFootsteps(moving: boolean): void {
    if (!this.footstepsSound) return;
    if (moving) {
      if (this.footstepsSound.isPaused) this.footstepsSound.resume();
      else if (!this.footstepsSound.isPlaying) this.footstepsSound.play();
    } else if (this.footstepsSound.isPlaying) {
      this.footstepsSound.pause();
    }
  }

  private toggleAudio(): void {
    this.audioMuted = !this.audioMuted;
    this.registry.set("audioMuted", this.audioMuted);
    this.sound.mute = this.audioMuted;
    this.audioButtonText.setText(this.audioMuted ? "AUDIO UIT" : "AUDIO AAN");
  }

  private updatePrompt(): void {
    const shelf = this.nearestShelf();
    const atDesk = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.activeVisitorX, 348) < 100;
    if (atDesk && this.carriedBook) {
      this.promptText.setText("E / SPATIE — Geef het boek aan de bezoeker");
    } else if (shelf) {
      if (!this.carriedBook) this.promptText.setText(`E / SPATIE — Pak een boek uit ${shelf.genre.name}`);
      else if (this.carriedBook.sourceShelfId === shelf.id) this.promptText.setText(`E / SPATIE — Zet het boek terug bij ${shelf.genre.name}`);
      else this.promptText.setText("Je draagt al een boek. Breng het eerst terug.");
    } else if (this.carriedBook) {
      this.promptText.setText(`Je draagt: ${getGenre(this.carriedBook.genreId).name} • ga naar de balie of terug naar de kast`);
    } else {
      this.promptText.setText("Loop naar een genrekast en druk op E of spatie");
    }
  }

  private interact(): void {
    const atDesk = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.activeVisitorX, 348) < 100;
    if (atDesk && this.carriedBook) {
      this.deliverBook();
      return;
    }
    const shelf = this.nearestShelf();
    if (!shelf) return;
    if (!this.carriedBook) this.takeBook(shelf);
    else if (this.carriedBook.sourceShelfId === shelf.id) this.returnBook(shelf);
    else this.showFeedback("Eerst terugbrengen", `Dit boek hoort terug in de kast ${getGenre(this.carriedBook.genreId).name}.`, COLORS.gold, 2400);
  }

  private nearestShelf(): ShelfView | undefined {
    return this.shelves
      .map((shelf) => ({ shelf, distance: Phaser.Math.Distance.Between(this.player.x, this.player.y, shelf.x, shelf.y) }))
      .filter(({ distance }) => distance < INTERACTION_DISTANCE + 52)
      .sort((a, b) => a.distance - b.distance)[0]?.shelf;
  }

  private takeBook(shelf: ShelfView): void {
    this.sound.play("sfx-book-shelf", { volume: 0.34 });
    this.carriedBook = { genreId: shelf.genre.id, sourceShelfId: shelf.id };
    const genreBookKey = `book-${shelf.genre.id}`;
    const bookTexture = this.textures.exists(genreBookKey) ? genreBookKey : "book";
    this.carriedSprite = this.add.image(this.player.x, this.player.y - 51, bookTexture).setDepth(21);
    if (bookTexture === "book") this.carriedSprite.setScale(1.25).setTint(shelf.genre.shelfColor);
    else this.carriedSprite.setDisplaySize(30, 38);
    this.showFeedback("Boek gepakt", `Je draagt nu een boek uit de kast ${shelf.genre.name}.`, shelf.genre.shelfColor, 1800);
    this.updateHud();
  }

  private returnBook(shelf: ShelfView): void {
    this.sound.play("sfx-book-shelf", { volume: 0.34 });
    this.carriedBook = null;
    this.carriedSprite?.destroy();
    this.carriedSprite = undefined;
    this.showFeedback("Boek teruggezet", `Het boek staat weer bij ${shelf.genre.name}.`, COLORS.blue, 1700);
    this.updateHud();
  }

  private deliverBook(): void {
    if (!this.carriedBook) return;
    const chosen = getGenre(this.carriedBook.genreId);
    const isCorrect = this.carriedBook.genreId === this.activeRequest.genreId;
    this.playDeliverySounds(isCorrect);
    if (isCorrect) {
      const points = this.systems.correctAnswer();
      this.clearBook();
      this.locked = true;
      this.showFeedback(`Goed gekozen!  +${points}`, this.activeRequest.explanation, COLORS.green, 2800);
      this.animateQueue();
      this.time.delayedCall(2600, () => this.nextRequest());
    } else {
      this.systems.wrongAnswer();
      const wanted = getGenre(this.activeRequest.genreId);
      this.showFeedback("Dit boek past nog niet", `${chosen.name} draait om ${chosen.shortDescription.toLowerCase()}. ${this.activeRequest.hint} Breng het boek eerst terug.`, COLORS.red, 4200);
      this.cameras.main.shake(120, 0.003);
      this.player.setVelocity(0);
    }
    this.updateHud();
  }

  private playDeliverySounds(isCorrect: boolean): void {
    const scanner = this.sound.add("sfx-barcode-scanner", { volume: 0.03 });
    scanner.once("complete", () => scanner.destroy());
    scanner.play();
    this.time.delayedCall(180, () => {
      if (!this.scene.isActive()) return;
      if (isCorrect) this.sound.play("sfx-page-turn", { volume: 0.14 });
      else this.sound.play("sfx-wrong-answer", { volume: 0.18 });
    });
  }

  private animateQueue(): void {
    const first = this.visitorSprites.shift();
    if (!first) return;
    const queueFootsteps = this.sound.add("sfx-footsteps", { volume: 0.1, rate: 1.08 });
    queueFootsteps.play();
    this.time.delayedCall(800, () => {
      queueFootsteps.stop();
      queueFootsteps.destroy();
    });
    const leavingVisitorIndex = first.getData("visitorIndex") as number;
    first.setY(VISITOR_Y).setTexture(`visitor-${leavingVisitorIndex}-walk-side-0`);
    first.anims.play(`visitor-${leavingVisitorIndex}-walk-side`, true);
    this.tweens.add({ targets: first, x: -80, alpha: 0, duration: 700, ease: "Sine.in", onComplete: () => {
      first.anims.stop();
      const newVisitorIndex = (this.requestIndex + 5) % 11;
      first.setData("visitorIndex", newVisitorIndex);
      first.setTexture(`visitor-${newVisitorIndex}`).setPosition(1190, VISITOR_Y).setAlpha(1);
      this.visitorSprites.push(first);
      this.visitorSprites.forEach((visitor, index) => {
        const visitorIndex = visitor.getData("visitorIndex") as number;
        visitor.setY(VISITOR_Y).setTexture(`visitor-${visitorIndex}-walk-side-0`);
        visitor.anims.play(`visitor-${visitorIndex}-walk-side`, true);
        this.tweens.add({
          targets: visitor,
          x: [164, 360, 555, 750, 946][index],
          duration: 700,
          ease: "Sine.inOut",
          onComplete: () => {
            visitor.anims.stop();
            visitor.setTexture(`visitor-${visitorIndex}`).setY(VISITOR_Y);
          },
        });
      });
    }});
  }

  private nextRequest(): void {
    this.requestIndex = (this.requestIndex + 1) % requests.length;
    this.activeRequest = this.requestDeck.next();
    this.requestText.setText(this.activeRequest.request);
    this.locked = false;
  }

  private showHelpMessage(): void {
    this.showFeedback(
      "Zo speel je",
      "Lees de boekwens, pak een boek uit de passende genrekast en geef het bij de balie af.",
      COLORS.blue,
      3800,
    );
  }

  private clearBook(): void {
    this.carriedBook = null;
    this.carriedSprite?.destroy();
    this.carriedSprite = undefined;
  }

  private updateHud(): void {
    const stats = this.systems.snapshot;
    this.scoreText.setText(`SCORE ${String(stats.score).padStart(4, "0")}`);
    this.helpedText.setText(`GEHOLPEN ${stats.helped}`);
    const name = this.carriedBook ? getGenre(this.carriedBook.genreId).name.toUpperCase() : "—";
    this.bookText.setText(`BOEK ${name}`);
    this.streakText.setText(`BOEKENWORM ${stats.streak}`);
    const filledSegments = Math.min(stats.streak, WORM_SEGMENT_COUNT);
    const reveal = filledSegments === 0 ? 0 : 0.16 + ((filledSegments - 1) / (WORM_SEGMENT_COUNT - 1)) * 0.84;
    const source = this.wormFill.texture.getSourceImage() as { width: number; height: number };
    this.wormFill.setVisible(filledSegments > 0);
    if (filledSegments > 0) this.wormFill.setCrop(0, 0, Math.round(source.width * reveal), source.height);
  }

  private advanceWorkday(delta: number): void {
    this.workdayElapsedMs = Math.min(WORKDAY_DURATION_MS, this.workdayElapsedMs + delta);
    this.updateWorkdayHud();
    if (this.workdayElapsedMs >= WORKDAY_DURATION_MS) this.endWorkday();
  }

  private updateWorkdayHud(): void {
    const progress = Phaser.Math.Clamp(this.workdayElapsedMs / WORKDAY_DURATION_MS, 0, 1);
    const elapsedMinutes = Math.round(WORKDAY_MINUTES * progress);
    const clockMinutes = WORKDAY_START_MINUTES + elapsedMinutes;
    const hours = Math.floor(clockMinutes / 60);
    const minutes = clockMinutes % 60;
    this.workdayText.setText(`WERKDAG ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    this.workdayFill.width = 172 * progress;
  }

  private endWorkday(): void {
    if (this.workdayEnded) return;
    this.workdayEnded = true;
    this.locked = true;
    this.player.setVelocity(0);
    this.stopPlayerAnimation();

    const stats = this.systems.snapshot;
    const attempts = stats.helped + stats.mistakes;
    const accuracy = attempts === 0 ? 0 : Math.round((stats.helped / attempts) * 100);
    const shade = this.add.rectangle(576, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x100c14, 0.86);
    const shadow = this.add.rectangle(584, 442, 590, 500, 0x110b0d, 0.65);
    const frame = this.add.rectangle(576, 432, 590, 500, 0x633920).setStrokeStyle(6, 0x211315);
    const inner = this.add.rectangle(576, 432, 558, 466, 0x21191f).setStrokeStyle(2, 0xa46b36);
    const title = this.add.text(576, 245, "DE BIBLIOTHEEK SLUIT", {
      fontFamily: "monospace", fontSize: "30px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211315", strokeThickness: 4,
    }).setOrigin(0.5);
    const subtitle = this.add.text(576, 291, "Je werkdag zit erop", {
      fontFamily: "Arial", fontSize: "19px", color: "#e4d5df",
    }).setOrigin(0.5);
    const result = this.add.text(576, 398,
      `SCORE                 ${stats.score}\nGEHOLPEN               ${stats.helped}\nNAUWKEURIGHEID         ${accuracy}%\nBESTE BOEKENWORM       ${stats.bestStreak}`,
      { fontFamily: "monospace", fontSize: "20px", lineSpacing: 15, color: "#fff2d3" },
    ).setOrigin(0.5);
    const scoreStatus = this.add.text(576, 505,
      this.difficulty === "mixed" ? "GEMENGD TELT NIET MEE VOOR DE HIGHSCORES" : "SCORE OPSLAAN...",
      { fontFamily: "monospace", fontSize: "13px", fontStyle: "bold", color: "#d8c5ae" },
    ).setOrigin(0.5);
    const replay = this.add.text(576, 558, "NOG EEN WERKDAG", {
      fontFamily: "monospace", fontSize: "17px", fontStyle: "bold", color: "#251615",
      backgroundColor: "#f4bd4f", padding: { x: 22, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const menu = this.add.text(576, 620, "TERUG NAAR HOOFDMENU", {
      fontFamily: "monospace", fontSize: "15px", fontStyle: "bold", color: "#fff2d3",
      backgroundColor: "#513651", padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    replay.on("pointerover", () => replay.setBackgroundColor("#ffd873"));
    replay.on("pointerout", () => replay.setBackgroundColor("#f4bd4f"));
    replay.on("pointerdown", () => this.scene.restart());
    menu.on("pointerdown", () => this.scene.start("menu"));
    this.endOverlay = this.add.container(0, 0, [shade, shadow, frame, inner, title, subtitle, result, scoreStatus, replay, menu]).setDepth(400);
    if (this.difficulty !== "mixed") {
      const playerName = sanitizePlayerName(String(this.registry.get("playerName") ?? "SPELER"));
      void getHighScoreRepository().submitScore({
        playerName,
        level: this.difficulty,
        score: stats.score,
        accuracy,
        helped: stats.helped,
        bestStreak: stats.bestStreak,
      }).then(() => {
        if (scoreStatus.active) scoreStatus.setText(`SCORE OPGESLAGEN BIJ NIVEAU ${this.difficulty}`);
      });
    }
  }

  private showFeedback(title: string, body: string, color: number, duration: number): void {
    this.feedbackPanel.setVisible(true).setAlpha(1);
    const frame = this.feedbackPanel.list[0] as Phaser.GameObjects.Rectangle;
    frame.setStrokeStyle(5, color);
    this.feedbackTitle.setText(title);
    this.feedbackBody.setText(body);
    this.tweens.killTweensOf(this.feedbackPanel);
    this.tweens.add({ targets: this.feedbackPanel, alpha: 0, delay: duration, duration: 250, onComplete: () => this.feedbackPanel.setVisible(false) });
  }

  private togglePause(): void {
    if (this.locked) return;
    this.paused = !this.paused;
    if (!this.paused) {
      this.pauseOverlay?.destroy(true);
      this.pauseOverlay = undefined;
      return;
    }
    const shade = this.add.rectangle(576, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x100c14, 0.8);
    const panel = this.add.rectangle(576, 400, 500, 300, 0x302438).setStrokeStyle(4, COLORS.gold);
    const title = this.add.text(576, 328, "GEPAUZEERD", { fontFamily: "monospace", fontSize: "38px", fontStyle: "bold", color: "#fff2ce" }).setOrigin(0.5);
    const hint = this.add.text(576, 405, "Druk op Esc om verder te gaan", { fontFamily: "Arial", fontSize: "21px", color: "#e4d5df" }).setOrigin(0.5);
    const menu = this.add.text(576, 475, "TERUG NAAR MENU", { fontFamily: "monospace", fontSize: "18px", fontStyle: "bold", color: "#251b27", backgroundColor: "#f4bd4f", padding: { x: 18, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on("pointerdown", () => this.scene.start("menu"));
    this.pauseOverlay = this.add.container(0, 0, [shade, panel, title, hint, menu]).setDepth(300);
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: "monospace", fontSize: "18px", fontStyle: "bold", color: "#fff2d3" };
  }
}
