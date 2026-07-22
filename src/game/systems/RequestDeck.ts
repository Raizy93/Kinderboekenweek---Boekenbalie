import type { GenreRequest } from "../data/requests";

export type Difficulty = 1 | 2 | 3 | "mixed";

export class RequestDeck {
  private readonly source: readonly GenreRequest[];
  private remaining: GenreRequest[] = [];

  constructor(
    requests: readonly GenreRequest[],
    private readonly difficulty: Difficulty,
    private readonly random: () => number = Math.random,
  ) {
    this.source = difficulty === "mixed"
      ? requests
      : requests.filter((request) => request.level === difficulty);

    if (this.source.length === 0) throw new Error("Er zijn geen opdrachten voor dit niveau.");
    this.refill();
  }

  next(): GenreRequest {
    if (this.remaining.length === 0) this.refill();
    const request = this.remaining.pop();
    if (!request) throw new Error("De opdrachtenbank is onverwacht leeg.");
    return request;
  }

  get size(): number { return this.source.length; }

  private refill(): void {
    this.remaining = [...this.source];
    for (let index = this.remaining.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.random() * (index + 1));
      [this.remaining[index], this.remaining[swapIndex]] = [this.remaining[swapIndex]!, this.remaining[index]!];
    }
  }
}
