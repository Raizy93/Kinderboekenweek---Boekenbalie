import { describe, expect, it } from "vitest";
import { GameSystems } from "../src/game/systems/GameSystems";
import { RequestDeck } from "../src/game/systems/RequestDeck";
import { genres, getGenre } from "../src/game/data/genres";
import { requests } from "../src/game/data/requests";
import { isCharacterId, playableCharacters } from "../src/game/data/characters";
import { LocalHighScoreRepository, sanitizePlayerName } from "../src/game/services/HighScoreService";

describe("personagekeuze", () => {
  it("biedt vijf unieke speelbare personages", () => {
    expect(playableCharacters).toHaveLength(5);
    expect(new Set(playableCharacters.map((character) => character.id)).size).toBe(5);
    expect(playableCharacters.every((character) => isCharacterId(character.id))).toBe(true);
    expect(isCharacterId("onbekend")).toBe(false);
  });
});

describe("opdrachtenbank", () => {
  it("bevat precies 80 unieke opdrachten en tien per genre", () => {
    expect(requests).toHaveLength(80);
    expect(new Set(requests.map((request) => request.id)).size).toBe(80);
    for (const genre of genres) {
      expect(requests.filter((request) => request.genreId === genre.id)).toHaveLength(10);
    }
  });

  it("koppelt iedere opdracht aan een bestaand genre en houdt wensen compact", () => {
    for (const request of requests) {
      expect(getGenre(request.genreId).id).toBe(request.genreId);
      expect(request.request.trim().split(/\s+/).length).toBeLessThanOrEqual(25);
    }
  });

  it("levert binnen een volledig deck geen dubbele opdrachten", () => {
    const deck = new RequestDeck(requests, "mixed", () => 0.42);
    const ids = Array.from({ length: deck.size }, () => deck.next().id);
    expect(new Set(ids).size).toBe(deck.size);
  });

  it("filtert opdrachten op het gekozen niveau", () => {
    for (const level of [1, 2, 3] as const) {
      const deck = new RequestDeck(requests, level, () => 0.25);
      const selected = Array.from({ length: deck.size }, () => deck.next());
      expect(selected.every((request) => request.level === level)).toBe(true);
    }
  });
});

describe("spellogica", () => {
  it("bouwt een reeks op en geeft oplopende bonuspunten", () => {
    const systems = new GameSystems();
    const points = Array.from({ length: 8 }, () => systems.correctAnswer());
    expect(points).toEqual([100, 100, 125, 125, 150, 150, 150, 200]);
    expect(systems.snapshot).toMatchObject({ score: 1100, helped: 8, mistakes: 0, streak: 8, bestStreak: 8 });
  });

  it("verbreekt de reeks na een fout maar onthoudt de beste reeks", () => {
    const systems = new GameSystems();
    systems.correctAnswer();
    systems.correctAnswer();
    systems.correctAnswer();
    systems.wrongAnswer();
    expect(systems.snapshot).toMatchObject({ mistakes: 1, streak: 0, bestStreak: 3 });
    expect(systems.correctAnswer()).toBe(100);
  });
});

describe("highscores", () => {
  it("houdt voor ieder niveau een aparte gesorteerde lijst bij", async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const scores = new LocalHighScoreRepository(storage);
    await scores.submitScore({ playerName: "Noor", level: 1, score: 500, accuracy: 90, helped: 4, bestStreak: 3 });
    await scores.submitScore({ playerName: "Sam", level: 1, score: 700, accuracy: 80, helped: 5, bestStreak: 4 });
    await scores.submitScore({ playerName: "Lina", level: 2, score: 900, accuracy: 100, helped: 7, bestStreak: 7 });

    expect((await scores.getTopScores(1)).map((entry) => entry.playerName)).toEqual(["Sam", "Noor"]);
    expect((await scores.getTopScores(2)).map((entry) => entry.playerName)).toEqual(["Lina"]);
    expect(await scores.getTopScores(3)).toEqual([]);
  });

  it("maakt kindvriendelijke korte spelersnamen", () => {
    expect(sanitizePlayerName("  Noor!@ van de bibliotheek  ")).toBe("Noor van de");
    expect(sanitizePlayerName("***")).toBe("SPELER");
  });
});
