export const playableCharacters = [
  { id: "sam", name: "Sam" },
  { id: "lina", name: "Lina" },
  { id: "milan", name: "Milan" },
  { id: "aya", name: "Aya" },
  { id: "noah", name: "Noah" },
] as const;

export type CharacterId = (typeof playableCharacters)[number]["id"];

export function isCharacterId(value: unknown): value is CharacterId {
  return playableCharacters.some((character) => character.id === value);
}
