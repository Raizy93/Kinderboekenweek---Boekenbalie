import Phaser from "phaser";
import { COLORS } from "../config";
import { isCharacterId, playableCharacters, type CharacterId } from "../data/characters";
import {
  getHighScoreRepository,
  sanitizePlayerName,
  type LeaderboardLevel,
} from "../services/HighScoreService";
import type { Difficulty } from "../systems/RequestDeck";

interface DifficultyButton {
  value: Difficulty;
  background: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

interface CharacterButton {
  value: CharacterId;
  background: Phaser.GameObjects.Rectangle;
  name: Phaser.GameObjects.Text;
  sprite: Phaser.GameObjects.Image;
}

export class MenuScene extends Phaser.Scene {
  private selectedDifficulty: Difficulty = "mixed";
  private selectedCharacter: CharacterId = "sam";
  private difficultyButtons: DifficultyButton[] = [];
  private characterButtons: CharacterButton[] = [];
  private helpOverlay?: Phaser.GameObjects.Container;
  private nameOverlay?: Phaser.GameObjects.Container;
  private highScoreOverlay?: Phaser.GameObjects.Container;
  private playerNameText!: Phaser.GameObjects.Text;
  private nameDraftText?: Phaser.GameObjects.Text;
  private nameKeyHandler?: (event: KeyboardEvent) => void;
  private playerName = "SPELER";
  private nameDraft = "";
  private leaderboardRows?: Phaser.GameObjects.Text;
  private leaderboardStatus?: Phaser.GameObjects.Text;
  private leaderboardTabs: Array<{ level: LeaderboardLevel; sign: Phaser.GameObjects.Image }> = [];
  private leaderboardRequest = 0;

  constructor() { super("menu"); }

  create(): void {
    this.difficultyButtons = [];
    this.characterButtons = [];
    this.helpOverlay = undefined;
    this.nameOverlay = undefined;
    this.highScoreOverlay = undefined;
    this.leaderboardTabs = [];
    this.playerName = this.loadPlayerName();
    this.registry.set("playerName", this.playerName);
    const savedCharacter = this.registry.get("character");
    if (isCharacterId(savedCharacter)) this.selectedCharacter = savedCharacter;

    this.drawLibraryBackground();
    this.drawTitleSign();

    this.add.text(576, 174, "KIES JE PERSONAGE", {
      fontFamily: "monospace", fontSize: "17px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211416", strokeThickness: 3,
    }).setOrigin(0.5);
    const characterXs = [300, 438, 576, 714, 852];
    playableCharacters.forEach((character, index) => {
      this.createCharacterButton(characterXs[index]!, 245, character.id, character.name);
    });
    this.refreshCharacterButtons();

    this.add.text(576, 322, "KIES JE NIVEAU", {
      fontFamily: "monospace", fontSize: "17px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211416", strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(576, 347, "Je kunt beide keuzes later opnieuw instellen vanuit het hoofdmenu.", {
      fontFamily: "Arial", fontSize: "14px", color: "#d8c5ae",
    }).setOrigin(0.5);

    const options: Array<{ value: Difficulty; title: string; subtitle: string }> = [
      { value: 1, title: "NIVEAU 1", subtitle: "Duidelijke kenmerken" },
      { value: 2, title: "NIVEAU 2", subtitle: "Kenmerken herkennen" },
      { value: 3, title: "NIVEAU 3", subtitle: "Aanwijzingen afwegen" },
      { value: "mixed", title: "GEMENGD", subtitle: "Alle niveaus door elkaar" },
    ];
    const xs = [231, 461, 691, 921];
    options.forEach((option, index) => this.createDifficultyButton(xs[index]!, 410, option));
    this.refreshDifficultyButtons();

    this.add.rectangle(582, 548, 374, 74, 0x120c0d, 0.72);
    this.add.rectangle(576, 541, 374, 74, 0x714125).setStrokeStyle(5, 0x241517);
    const startButton = this.add.rectangle(576, 537, 350, 54, COLORS.gold)
      .setStrokeStyle(3, 0xffdc78)
      .setInteractive({ useHandCursor: true });
    this.add.text(576, 537, "START HET SPEL", {
      fontFamily: "monospace", fontSize: "24px", fontStyle: "bold", color: "#251615",
      stroke: "#fff0b0", strokeThickness: 1,
    }).setOrigin(0.5);
    const start = (): void => {
      if (this.anyOverlayOpen()) return;
      this.registry.set("difficulty", this.selectedDifficulty);
      this.registry.set("character", this.selectedCharacter);
      this.scene.start("library");
    };
    startButton.on("pointerover", () => startButton.setFillStyle(0xffd873));
    startButton.on("pointerout", () => startButton.setFillStyle(COLORS.gold));
    startButton.on("pointerdown", start);

    const nameButton = this.add.image(230, 537, "genre-sign")
      .setDisplaySize(210, 54).setInteractive({ useHandCursor: true });
    this.add.rectangle(230, 555, 184, 3, COLORS.gold);
    this.playerNameText = this.add.text(230, 535, `NAAM\n${this.playerName}`, {
      fontFamily: "monospace", fontSize: "13px", fontStyle: "bold", color: "#fff2cc",
      align: "center", lineSpacing: 2, stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5);
    nameButton.on("pointerover", () => nameButton.setTint(0xffe0a0));
    nameButton.on("pointerout", () => nameButton.clearTint());
    nameButton.on("pointerdown", () => this.showNameEntry());

    const scoresButton = this.add.image(922, 537, "genre-sign")
      .setDisplaySize(210, 54).setInteractive({ useHandCursor: true });
    this.add.rectangle(922, 555, 184, 3, COLORS.gold);
    this.add.text(922, 536, "HIGHSCORES", {
      fontFamily: "monospace", fontSize: "16px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5);
    scoresButton.on("pointerover", () => scoresButton.setTint(0xffe0a0));
    scoresButton.on("pointerout", () => scoresButton.clearTint());
    scoresButton.on("pointerdown", () => this.showHighScores());

    this.drawInstructions();

    this.input.keyboard?.on("keydown-ONE", () => this.selectDifficulty(1));
    this.input.keyboard?.on("keydown-TWO", () => this.selectDifficulty(2));
    this.input.keyboard?.on("keydown-THREE", () => this.selectDifficulty(3));
    this.input.keyboard?.on("keydown-FOUR", () => this.selectDifficulty("mixed"));
    this.input.keyboard?.on("keydown-LEFT", () => this.cycleCharacter(-1));
    this.input.keyboard?.on("keydown-RIGHT", () => this.cycleCharacter(1));
    this.input.keyboard?.on("keydown-ESC", () => this.closeTopOverlay());
    this.input.keyboard?.on("keydown-ENTER", start);
  }

  private drawLibraryBackground(): void {
    this.cameras.main.setBackgroundColor("#2a1815");
    if (this.textures.exists("floor-upgrade")) {
      this.add.image(576, 430, "floor-upgrade").setDisplaySize(1152, 860);
    } else {
      this.add.rectangle(576, 430, 1152, 860, 0x9b704d);
    }
    this.add.rectangle(576, 430, 1152, 860, 0x160f14, 0.46);
    this.add.rectangle(576, 430, 1092, 808, 0x5b3522, 0.96).setStrokeStyle(7, 0x241617);
    this.add.rectangle(576, 430, 1064, 780, 0x21191f, 0.9).setStrokeStyle(3, 0xa16a37);
    this.add.rectangle(32, 430, 18, 808, 0x3c241a).setStrokeStyle(3, 0x1e1414);
    this.add.rectangle(1120, 430, 18, 808, 0x3c241a).setStrokeStyle(3, 0x1e1414);
  }

  private drawTitleSign(): void {
    this.add.rectangle(583, 108, 930, 112, 0x140e10, 0.6);
    this.add.rectangle(576, 101, 930, 112, 0x704126).setStrokeStyle(6, 0x241617);
    this.add.rectangle(576, 101, 900, 82, 0x271b1d).setStrokeStyle(3, 0xb1783d);
    this.add.circle(143, 101, 5, 0xd49a4a).setStrokeStyle(2, 0x40251b);
    this.add.circle(1009, 101, 5, 0xd49a4a).setStrokeStyle(2, 0x40251b);
    this.add.text(576, 87, "DE BOEKENBALIE", {
      fontFamily: "monospace", fontSize: "43px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#1a1012", strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(576, 128, "Help iedere bezoeker aan het juiste genre", {
      fontFamily: "Arial", fontSize: "18px", color: "#e7c89e",
    }).setOrigin(0.5);
  }

  private drawInstructions(): void {
    if (this.textures.exists("bookshelf-upgrade")) {
      this.add.image(128, 696, "bookshelf-upgrade").setDisplaySize(170, 116);
      this.add.image(1024, 696, "bookshelf-upgrade").setDisplaySize(170, 116).setFlipX(true);
    }
    this.add.rectangle(582, 688, 760, 118, 0x130d0f, 0.62);
    this.add.rectangle(576, 682, 760, 118, 0x603821).setStrokeStyle(5, 0x241517);
    this.add.rectangle(576, 682, 736, 94, 0x21191f, 0.97).setStrokeStyle(2, 0xb1783d);
    this.add.text(576, 652, "HOE WERKT HET?", {
      fontFamily: "monospace", fontSize: "17px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211416", strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(576, 692,
      "Lees de boekwens en breng het juiste genre naar de balie.",
      { fontFamily: "Arial", fontSize: "16px", color: "#f2dfc5", align: "center" },
    ).setOrigin(0.5);
    const explanationButton = this.add.image(576, 724, "genre-sign")
      .setDisplaySize(250, 42).setInteractive({ useHandCursor: true });
    this.add.rectangle(576, 738, 220, 2, COLORS.gold);
    this.add.text(576, 723, "ALLE SPELUITLEG", {
      fontFamily: "monospace", fontSize: "15px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5);
    explanationButton.on("pointerover", () => explanationButton.setTint(0xffe0a0));
    explanationButton.on("pointerout", () => explanationButton.clearTint());
    explanationButton.on("pointerdown", () => this.showInstructions());
  }

  private showInstructions(): void {
    if (this.anyOverlayOpen()) return;
    const shade = this.add.rectangle(576, 430, 1152, 860, 0x100c14, 0.9);
    const shadow = this.add.rectangle(586, 438, 900, 730, 0x110b0d, 0.7);
    const frame = this.add.rectangle(576, 430, 900, 730, 0x633920).setStrokeStyle(7, 0x211315);
    const inner = this.add.rectangle(576, 430, 866, 696, 0x21191f).setStrokeStyle(3, 0xa46b36);
    const divider = this.add.rectangle(576, 425, 3, 500, 0x704126);
    const title = this.add.text(576, 90, "ALLE SPELUITLEG", {
      fontFamily: "monospace", fontSize: "32px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211315", strokeThickness: 5,
    }).setOrigin(0.5);
    const subtitle = this.add.text(576, 132, "Zo haal je alles uit je werkdag in de bibliotheek", {
      fontFamily: "Arial", fontSize: "17px", color: "#e7c89e",
    }).setOrigin(0.5);

    const headingStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "monospace", fontSize: "18px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211416", strokeThickness: 3,
    };
    const bodyStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Arial", fontSize: "16px", color: "#f2dfc5", lineSpacing: 7,
      align: "center", wordWrap: { width: 340 },
    };
    const items: Phaser.GameObjects.GameObject[] = [shade, shadow, frame, inner, divider, title, subtitle];
    const addSection = (x: number, y: number, heading: string, body: string): void => {
      items.push(
        this.add.text(x, y, heading, headingStyle).setOrigin(0.5, 0),
        this.add.text(x, y + 34, body, bodyStyle).setOrigin(0.5, 0),
      );
    };

    addSection(350, 170, "DOEL",
      "Lees de boekwens, kies het passende genre en breng dat boek naar de bezoeker bij de balie.");
    addSection(350, 310, "BEDIENING",
      "Loop met WASD of de pijltjestoetsen. Gebruik E of spatie voor boeken. Met M zet je muziek en geluiden aan of uit.");
    addSection(350, 465, "DE WERKDAG",
      "Een ronde loopt van 09:00 tot 17:00 en duurt vijf actieve minuten. Tijdens uitleg, feedback en pauzes staat de klok stil.");

    const wormHeading = this.add.text(802, 170, "DE BOEKENWORM", headingStyle).setOrigin(0.5, 0);
    const worm = this.add.image(802, 230, "bookworm-meter").setDisplaySize(280, 62);
    const wormBody = this.add.text(802, 275,
      "Ieder goed antwoord vult één deel. Een fout maakt de reeks leeg, maar je beste reeks blijft bewaard.",
      bodyStyle,
    ).setOrigin(0.5, 0);
    items.push(wormHeading, worm, wormBody);
    addSection(802, 385, "PUNTEN",
      "Een goed boek is 100 punten. Vanaf 3 goede antwoorden krijg je 125, vanaf 5 krijg je 150 en vanaf 8 krijg je 200 punten per antwoord.");
    addSection(802, 555, "NA DE WERKDAG",
      "Je ziet je score, geholpen bezoekers, nauwkeurigheid en beste boekenwormreeks. Nauwkeurigheid is het aandeel juiste antwoorden.");

    const closeButton = this.add.image(576, 750, "genre-sign")
      .setDisplaySize(190, 44).setInteractive({ useHandCursor: true });
    const closeText = this.add.text(576, 749, "SLUITEN", {
      fontFamily: "monospace", fontSize: "16px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5);
    closeButton.on("pointerover", () => closeButton.setTint(0xffe0a0));
    closeButton.on("pointerout", () => closeButton.clearTint());
    closeButton.on("pointerdown", () => this.closeInstructions());
    items.push(closeButton, closeText);
    this.helpOverlay = this.add.container(0, 0, items).setDepth(500);
  }

  private closeInstructions(): void {
    this.helpOverlay?.destroy(true);
    this.helpOverlay = undefined;
  }

  private showNameEntry(): void {
    if (this.anyOverlayOpen()) return;
    this.nameDraft = this.playerName === "SPELER" ? "" : this.playerName;
    const shade = this.add.rectangle(576, 430, 1152, 860, 0x100c14, 0.9);
    const shadow = this.add.rectangle(584, 438, 620, 330, 0x110b0d, 0.7);
    const frame = this.add.rectangle(576, 430, 620, 330, 0x633920).setStrokeStyle(7, 0x211315);
    const inner = this.add.rectangle(576, 430, 590, 300, 0x21191f).setStrokeStyle(3, 0xa46b36);
    const title = this.add.text(576, 315, "SPELERSNAAM", {
      fontFamily: "monospace", fontSize: "28px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211315", strokeThickness: 4,
    }).setOrigin(0.5);
    const hint = this.add.text(576, 357, "Typ een voornaam of initialen · maximaal 12 tekens", {
      fontFamily: "Arial", fontSize: "16px", color: "#e7c89e",
    }).setOrigin(0.5);
    const inputFrame = this.add.rectangle(576, 420, 430, 62, 0x130d0f).setStrokeStyle(3, COLORS.gold);
    this.nameDraftText = this.add.text(576, 420, this.nameDraft || "_", {
      fontFamily: "monospace", fontSize: "27px", fontStyle: "bold", color: "#fff2cc",
    }).setOrigin(0.5);
    const save = this.createOverlayButton(470, 510, 180, "OPSLAAN", () => this.closeNameEntry(true));
    const cancel = this.createOverlayButton(682, 510, 180, "ANNULEREN", () => this.closeNameEntry(false));
    this.nameOverlay = this.add.container(0, 0, [
      shade, shadow, frame, inner, title, hint, inputFrame, this.nameDraftText, ...save, ...cancel,
    ]).setDepth(500);

    this.nameKeyHandler = (event: KeyboardEvent): void => {
      if (!this.nameOverlay) return;
      if (event.key === "Backspace") this.nameDraft = this.nameDraft.slice(0, -1);
      else if (event.key === "Enter") { this.closeNameEntry(true); return; }
      else if (event.key === "Escape") { this.closeNameEntry(false); return; }
      else if (event.key.length === 1 && this.nameDraft.length < 12 && /[\p{L}\p{N} _-]/u.test(event.key)) {
        this.nameDraft += event.key;
      }
      this.nameDraftText?.setText(this.nameDraft || "_");
    };
    this.input.keyboard?.on("keydown", this.nameKeyHandler);
  }

  private closeNameEntry(save: boolean): void {
    if (!this.nameOverlay) return;
    if (save) {
      this.playerName = sanitizePlayerName(this.nameDraft);
      this.registry.set("playerName", this.playerName);
      this.playerNameText.setText(`NAAM\n${this.playerName}`);
      try { localStorage.setItem("boekenbalie-player-name", this.playerName); } catch { /* lokale opslag kan uitstaan */ }
    }
    if (this.nameKeyHandler) this.input.keyboard?.off("keydown", this.nameKeyHandler);
    this.nameKeyHandler = undefined;
    this.nameDraftText = undefined;
    this.nameOverlay.destroy(true);
    this.nameOverlay = undefined;
  }

  private showHighScores(): void {
    if (this.anyOverlayOpen()) return;
    const shade = this.add.rectangle(576, 430, 1152, 860, 0x100c14, 0.9);
    const shadow = this.add.rectangle(586, 438, 900, 730, 0x110b0d, 0.7);
    const frame = this.add.rectangle(576, 430, 900, 730, 0x633920).setStrokeStyle(7, 0x211315);
    const inner = this.add.rectangle(576, 430, 866, 696, 0x21191f).setStrokeStyle(3, 0xa46b36);
    const title = this.add.text(576, 92, "HIGHSCORES", {
      fontFamily: "monospace", fontSize: "34px", fontStyle: "bold", color: "#f4bd4f",
      stroke: "#211315", strokeThickness: 5,
    }).setOrigin(0.5);
    const subtitle = this.add.text(576, 132,
      getHighScoreRepository().mode === "firebase" ? "ONLINE TOP 10" : "LOKALE TOP 10 · FIREBASE NOG NIET GEKOPPELD",
      { fontFamily: "monospace", fontSize: "13px", color: "#d8c5ae" },
    ).setOrigin(0.5);
    const items: Phaser.GameObjects.GameObject[] = [shade, shadow, frame, inner, title, subtitle];

    ([1, 2, 3] as const).forEach((level, index) => {
      const x = [350, 576, 802][index]!;
      const sign = this.add.image(x, 181, "genre-sign")
        .setDisplaySize(190, 48).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 180, `NIVEAU ${level}`, {
        fontFamily: "monospace", fontSize: "16px", fontStyle: "bold", color: "#fff2cc",
        stroke: "#211721", strokeThickness: 3,
      }).setOrigin(0.5);
      sign.on("pointerdown", () => void this.loadHighScores(level));
      this.leaderboardTabs.push({ level, sign });
      items.push(sign, label);
    });

    const columns = this.add.text(576, 235, "#   NAAM           SCORE    GOED    WORM", {
      fontFamily: "monospace", fontSize: "16px", fontStyle: "bold", color: "#f4bd4f",
    }).setOrigin(0.5);
    this.leaderboardRows = this.add.text(576, 275, "", {
      fontFamily: "monospace", fontSize: "17px", color: "#fff2d3", lineSpacing: 10,
    }).setOrigin(0.5, 0);
    this.leaderboardStatus = this.add.text(576, 675, "SCORES LADEN...", {
      fontFamily: "Arial", fontSize: "15px", color: "#d8c5ae",
    }).setOrigin(0.5);
    const close = this.createOverlayButton(576, 744, 190, "SLUITEN", () => this.closeHighScores());
    items.push(columns, this.leaderboardRows, this.leaderboardStatus, ...close);
    this.highScoreOverlay = this.add.container(0, 0, items).setDepth(500);
    void this.loadHighScores(1);
  }

  private async loadHighScores(level: LeaderboardLevel): Promise<void> {
    const request = ++this.leaderboardRequest;
    this.leaderboardTabs.forEach((tab) => tab.sign.setTint(tab.level === level ? 0xffd27a : 0xffffff));
    this.leaderboardRows?.setText("");
    this.leaderboardStatus?.setText("SCORES LADEN...");
    const scores = await getHighScoreRepository().getTopScores(level, 10);
    if (request !== this.leaderboardRequest || !this.highScoreOverlay) return;
    const rows = scores.map((score, index) => {
      const rank = String(index + 1).padStart(2, " ");
      const name = score.playerName.slice(0, 12).padEnd(12, " ");
      const points = String(score.score).padStart(6, " ");
      const accuracy = `${score.accuracy}%`.padStart(5, " ");
      const streak = String(score.bestStreak).padStart(5, " ");
      return `${rank}  ${name}  ${points}  ${accuracy}  ${streak}`;
    });
    this.leaderboardRows?.setText(rows.length > 0 ? rows.join("\n") : "Nog geen scores voor dit niveau.");
    this.leaderboardStatus?.setText(`NIVEAU ${level} · ${scores.length} SCORE${scores.length === 1 ? "" : "S"}`);
  }

  private closeHighScores(): void {
    this.leaderboardRequest += 1;
    this.highScoreOverlay?.destroy(true);
    this.highScoreOverlay = undefined;
    this.leaderboardRows = undefined;
    this.leaderboardStatus = undefined;
    this.leaderboardTabs = [];
  }

  private createOverlayButton(
    x: number,
    y: number,
    width: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.GameObject[] {
    const sign = this.add.image(x, y, "genre-sign")
      .setDisplaySize(width, 46).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y - 1, label, {
      fontFamily: "monospace", fontSize: "15px", fontStyle: "bold", color: "#fff2cc",
      stroke: "#211721", strokeThickness: 3,
    }).setOrigin(0.5);
    sign.on("pointerover", () => sign.setTint(0xffe0a0));
    sign.on("pointerout", () => sign.clearTint());
    sign.on("pointerdown", onClick);
    return [sign, text];
  }

  private closeTopOverlay(): void {
    if (this.nameOverlay) this.closeNameEntry(false);
    else if (this.highScoreOverlay) this.closeHighScores();
    else this.closeInstructions();
  }

  private anyOverlayOpen(): boolean {
    return Boolean(this.helpOverlay || this.nameOverlay || this.highScoreOverlay);
  }

  private loadPlayerName(): string {
    const registryName = this.registry.get("playerName");
    if (typeof registryName === "string") return sanitizePlayerName(registryName);
    try { return sanitizePlayerName(localStorage.getItem("boekenbalie-player-name") ?? "SPELER"); }
    catch { return "SPELER"; }
  }

  private createCharacterButton(x: number, y: number, value: CharacterId, name: string): void {
    this.add.rectangle(x + 5, y + 6, 116, 116, 0x120c0d, 0.62);
    this.add.rectangle(x, y, 116, 116, 0x694027).setStrokeStyle(4, 0x241517);
    const background = this.add.rectangle(x, y - 2, 102, 100, 0x291d21)
      .setStrokeStyle(2, 0x9b6738)
      .setInteractive({ useHandCursor: true });
    const sprite = this.add.image(x, y - 9, `character-${value}-walk-down-1`).setDisplaySize(56, 72);
    const label = this.add.text(x, y + 40, name.toUpperCase(), {
      fontFamily: "monospace", fontSize: "14px", fontStyle: "bold", color: "#e8dce7",
    }).setOrigin(0.5);
    background.on("pointerdown", () => this.selectCharacter(value));
    this.characterButtons.push({ value, background, name: label, sprite });
  }

  private selectCharacter(value: CharacterId): void {
    this.selectedCharacter = value;
    this.refreshCharacterButtons();
  }

  private cycleCharacter(offset: number): void {
    const index = playableCharacters.findIndex((character) => character.id === this.selectedCharacter);
    const next = (index + offset + playableCharacters.length) % playableCharacters.length;
    const character = playableCharacters[next];
    if (character) this.selectCharacter(character.id);
  }

  private refreshCharacterButtons(): void {
    this.characterButtons.forEach((button) => {
      const selected = button.value === this.selectedCharacter;
      button.background.setFillStyle(selected ? 0x543326 : 0x291d21);
      button.background.setStrokeStyle(selected ? 5 : 2, selected ? COLORS.gold : 0x9b6738);
      button.name.setColor(selected ? "#fff2cc" : "#e8dce7");
      button.sprite.setScale(selected ? 1.08 : 1);
    });
  }

  private createDifficultyButton(
    x: number,
    y: number,
    option: { value: Difficulty; title: string; subtitle: string },
  ): void {
    this.add.rectangle(x + 5, y + 6, 210, 90, 0x120c0d, 0.62);
    this.add.rectangle(x, y, 210, 90, 0x694027).setStrokeStyle(4, 0x241517);
    const background = this.add.rectangle(x, y - 2, 194, 72, 0x291d21)
      .setStrokeStyle(2, 0x9b6738)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 8, `${option.title}\n${option.subtitle}`, {
      fontFamily: "Arial", fontSize: "15px", fontStyle: "bold", color: "#e8dce7", align: "center", lineSpacing: 7,
    }).setOrigin(0.5);
    background.on("pointerdown", () => this.selectDifficulty(option.value));
    this.difficultyButtons.push({ value: option.value, background, label });
  }

  private selectDifficulty(value: Difficulty): void {
    this.selectedDifficulty = value;
    this.refreshDifficultyButtons();
  }

  private refreshDifficultyButtons(): void {
    this.difficultyButtons.forEach((button) => {
      const selected = button.value === this.selectedDifficulty;
      button.background.setFillStyle(selected ? 0x543326 : 0x291d21);
      button.background.setStrokeStyle(selected ? 5 : 2, selected ? COLORS.gold : 0x9b6738);
      button.label.setColor(selected ? "#fff2cc" : "#e8dce7");
    });
  }
}
