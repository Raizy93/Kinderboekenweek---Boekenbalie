import type { Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "../../firebaseConfig";

export type LeaderboardLevel = 1 | 2 | 3;

export interface HighScoreEntry {
  id: string;
  playerName: string;
  level: LeaderboardLevel;
  score: number;
  accuracy: number;
  helped: number;
  bestStreak: number;
  createdAt: number;
}

export type NewHighScoreEntry = Omit<HighScoreEntry, "id" | "createdAt">;

export interface HighScoreRepository {
  readonly mode: "firebase" | "local";
  getTopScores(level: LeaderboardLevel, maximum?: number): Promise<HighScoreEntry[]>;
  submitScore(entry: NewHighScoreEntry): Promise<void>;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const STORAGE_KEY = "boekenbalie-highscores-v1";

export function sanitizePlayerName(value: string): string {
  const cleaned = value.trim().replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").slice(0, 12).trim();
  return cleaned || "SPELER";
}

export function compareHighScores(left: HighScoreEntry, right: HighScoreEntry): number {
  return right.score - left.score
    || right.accuracy - left.accuracy
    || right.bestStreak - left.bestStreak
    || left.createdAt - right.createdAt;
}

function normalizeEntry(entry: NewHighScoreEntry): NewHighScoreEntry {
  return {
    playerName: sanitizePlayerName(entry.playerName),
    level: entry.level,
    score: Math.max(0, Math.round(entry.score)),
    accuracy: Math.max(0, Math.min(100, Math.round(entry.accuracy))),
    helped: Math.max(0, Math.round(entry.helped)),
    bestStreak: Math.max(0, Math.round(entry.bestStreak)),
  };
}

export class LocalHighScoreRepository implements HighScoreRepository {
  readonly mode = "local" as const;

  constructor(private readonly storage: StorageLike | null = typeof localStorage === "undefined" ? null : localStorage) {}

  async getTopScores(level: LeaderboardLevel, maximum = 10): Promise<HighScoreEntry[]> {
    return this.read().filter((entry) => entry.level === level).sort(compareHighScores).slice(0, maximum);
  }

  async submitScore(entry: NewHighScoreEntry): Promise<void> {
    const normalized = normalizeEntry(entry);
    const scores = this.read();
    scores.push({ ...normalized, id: crypto.randomUUID(), createdAt: Date.now() });
    const compact = ([1, 2, 3] as const).flatMap((level) =>
      scores.filter((score) => score.level === level).sort(compareHighScores).slice(0, 50),
    );
    try { this.storage?.setItem(STORAGE_KEY, JSON.stringify(compact)); }
    catch { /* De game blijft speelbaar als lokale opslag is geblokkeerd. */ }
  }

  private read(): HighScoreEntry[] {
    if (!this.storage) return [];
    try {
      const parsed = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? "[]") as HighScoreEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

class FirebaseHighScoreRepository implements HighScoreRepository {
  readonly mode = "firebase" as const;
  private context?: Promise<{ database: Firestore; firestore: typeof import("firebase/firestore") }>;

  async getTopScores(level: LeaderboardLevel, maximum = 10): Promise<HighScoreEntry[]> {
    const { database, firestore } = await this.getContext();
    const scoresQuery = firestore.query(
      firestore.collection(database, collectionName(level)),
      firestore.orderBy("score", "desc"),
      firestore.limit(maximum),
    );
    const snapshot = await firestore.getDocs(scoresQuery);
    return snapshot.docs.map((document) => {
      const data = document.data();
      const timestamp = data.createdAt as { toMillis?: () => number } | undefined;
      return {
        id: document.id,
        playerName: sanitizePlayerName(String(data.playerName ?? "SPELER")),
        level,
        score: Number(data.score ?? 0),
        accuracy: Number(data.accuracy ?? 0),
        helped: Number(data.helped ?? 0),
        bestStreak: Number(data.bestStreak ?? 0),
        createdAt: timestamp?.toMillis?.() ?? Date.now(),
      };
    }).sort(compareHighScores);
  }

  async submitScore(entry: NewHighScoreEntry): Promise<void> {
    const normalized = normalizeEntry(entry);
    const { database, firestore } = await this.getContext();
    await firestore.addDoc(firestore.collection(database, collectionName(normalized.level)), {
      ...normalized,
      createdAt: firestore.serverTimestamp(),
    });
  }

  private getContext(): Promise<{ database: Firestore; firestore: typeof import("firebase/firestore") }> {
    this.context ??= Promise.all([import("firebase/app"), import("firebase/firestore")]).then(([appModule, firestore]) => {
      const app = appModule.getApps().length > 0 ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
      return { database: firestore.getFirestore(app), firestore };
    });
    return this.context;
  }
}

class ResilientHighScoreRepository implements HighScoreRepository {
  readonly mode: "firebase" | "local";
  private readonly local = new LocalHighScoreRepository();
  private readonly remote?: FirebaseHighScoreRepository;

  constructor() {
    this.mode = isFirebaseConfigured ? "firebase" : "local";
    if (isFirebaseConfigured) this.remote = new FirebaseHighScoreRepository();
  }

  async getTopScores(level: LeaderboardLevel, maximum = 10): Promise<HighScoreEntry[]> {
    if (this.remote) {
      try {
        return await this.remote.getTopScores(level, maximum);
      } catch (error) {
        console.warn("Firebase-highscores niet bereikbaar; lokale scores worden getoond.", error);
      }
    }
    return this.local.getTopScores(level, maximum);
  }

  async submitScore(entry: NewHighScoreEntry): Promise<void> {
    await this.local.submitScore(entry);
    if (this.remote) {
      try {
        await this.remote.submitScore(entry);
      } catch (error) {
        console.warn("Firebase-score kon niet worden opgeslagen; de lokale score is wel bewaard.", error);
      }
    }
  }
}

function collectionName(level: LeaderboardLevel): string {
  return `highscores_level_${level}`;
}

let repository: HighScoreRepository | undefined;

export function getHighScoreRepository(): HighScoreRepository {
  repository ??= new ResilientHighScoreRepository();
  return repository;
}
