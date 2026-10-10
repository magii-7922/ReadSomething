export const BOOK_RATINGS = [
  "超級推薦！",
  "有棒的地方",
  "中規中矩",
  "能理解但為什麼",
  "WTF",
  "我是土狗",
] as const;

export const MOVIE_RATINGS = [
  "超級推薦！",
  "有棒的地方",
  "中規中矩",
  "能理解但為什麼",
  "WTF",
  "商業片",
] as const;

export const GAME_RATINGS = [
  "人生遊戲！",
  "挺好玩的",
  "偶爾開開",
  "不好玩",
  "可惜我是手殘",
] as const;

export const EVENT_RATINGS = [
  "人生必去！",
  "陶冶性情",
  "挺好玩的",
  "中規中矩",
  "主辦在幹嘛",
  "FFXIV",
] as const;

export type BookRating = (typeof BOOK_RATINGS)[number];
export type MovieRating = (typeof MOVIE_RATINGS)[number];
export type GameRating = (typeof GAME_RATINGS)[number];
export type EventRating = (typeof EVENT_RATINGS)[number];

export type Category = "book" | "movie" | "game" | "event";

export const CATEGORY_LABELS: Record<Category, string> = {
  book: "書評",
  movie: "影評",
  game: "遊戲評",
  event: "活動評",
};

export const CATEGORY_PATHS: Record<Category, string> = {
  book: "/books",
  movie: "/movies",
  game: "/games",
  event: "/events",
};

export function ratingsFor(category: Category) {
  if (category === "book") return BOOK_RATINGS;
  if (category === "movie") return MOVIE_RATINGS;
  if (category === "game") return GAME_RATINGS;
  return EVENT_RATINGS;
}

export function encodeRating(rating: string) {
  return encodeURIComponent(rating);
}

export function decodeRating(encoded: string) {
  return decodeURIComponent(encoded);
}
