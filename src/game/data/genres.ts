export type GenreId =
  | "avontuur"
  | "fantasy"
  | "humor"
  | "spanning"
  | "detective"
  | "sciencefiction"
  | "historisch"
  | "informatie";

export interface Genre {
  id: GenreId;
  name: string;
  shortDescription: string;
  shelfColor: number;
  symbol: string;
  enabled: boolean;
}

export const genres: readonly Genre[] = [
  { id: "avontuur", name: "Avontuur", shortDescription: "Reizen, gevaar en moed", shelfColor: 0xd56a3c, symbol: "↗", enabled: true },
  { id: "fantasy", name: "Fantasy", shortDescription: "Magie en andere werelden", shelfColor: 0x8c67c7, symbol: "✦", enabled: true },
  { id: "humor", name: "Humor", shortDescription: "Grappige gebeurtenissen", shelfColor: 0xe2ad3e, symbol: ":D", enabled: true },
  { id: "spanning", name: "Spanning", shortDescription: "Dreiging en ontsnappen", shelfColor: 0xb84c54, symbol: "!", enabled: true },
  { id: "detective", name: "Detective", shortDescription: "Raadsels en aanwijzingen", shelfColor: 0x457a9b, symbol: "?", enabled: true },
  { id: "sciencefiction", name: "Sciencefiction", shortDescription: "Toekomst en techniek", shelfColor: 0x3f9b91, symbol: "∞", enabled: true },
  { id: "historisch", name: "Historisch", shortDescription: "Verhalen uit het verleden", shelfColor: 0x9b6b42, symbol: "⌛", enabled: true },
  { id: "informatie", name: "Informatie", shortDescription: "Feiten en uitleg", shelfColor: 0x5e9655, symbol: "i", enabled: true },
] as const;

export function getGenre(id: GenreId): Genre {
  const genre = genres.find((item) => item.id === id);
  if (!genre) throw new Error(`Onbekend genre: ${id}`);
  return genre;
}
