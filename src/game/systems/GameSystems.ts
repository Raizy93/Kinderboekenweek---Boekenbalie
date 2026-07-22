import type { GenreId } from "../data/genres";

export interface GameStats {
  score: number;
  helped: number;
  mistakes: number;
  streak: number;
  bestStreak: number;
}

export class GameSystems {
  private stats: GameStats = { score: 0, helped: 0, mistakes: 0, streak: 0, bestStreak: 0 };

  get snapshot(): Readonly<GameStats> { return { ...this.stats }; }

  correctAnswer(): number {
    this.stats.streak += 1;
    const points = this.stats.streak >= 8 ? 200 : this.stats.streak >= 5 ? 150 : this.stats.streak >= 3 ? 125 : 100;
    this.stats.score += points;
    this.stats.helped += 1;
    this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streak);
    return points;
  }

  wrongAnswer(): void {
    this.stats.mistakes += 1;
    this.stats.streak = 0;
  }
}

export interface CarriedBook { genreId: GenreId; sourceShelfId: string; }
