import type { Category } from "@/lib/ratings";

export const CHECKIN_CATEGORIES: Category[] = [
  "book",
  "movie",
  "game",
  "event",
];

export const CHECKIN_LABELS: Record<Category, string> = {
  book: "看書",
  movie: "看電影",
  game: "玩遊戲",
  event: "參加活動",
};

export const CHECKIN_COLORS: Record<Category, string> = {
  book: "#1f6f6a",
  movie: "#c45c6a",
  game: "#5a8f4a",
  event: "#c4a035",
};

export type CheckInMap = Record<string, Category[]>;

export function buildCheckInMap(
  rows: Array<{ check_date: string; category: string }>,
): CheckInMap {
  const map: CheckInMap = {};
  for (const row of rows) {
    const cat = row.category as Category;
    if (!CHECKIN_CATEGORIES.includes(cat)) continue;
    if (!map[row.check_date]) map[row.check_date] = [];
    if (!map[row.check_date].includes(cat)) map[row.check_date].push(cat);
  }
  for (const date of Object.keys(map)) {
    map[date] = CHECKIN_CATEGORIES.filter((c) => map[date].includes(c));
  }
  return map;
}

export function pieBackground(categories: Category[] | undefined) {
  const cats = CHECKIN_CATEGORIES.filter((c) => categories?.includes(c));
  if (cats.length === 0) return undefined;
  if (cats.length === 1) return CHECKIN_COLORS[cats[0]];
  const slice = 360 / cats.length;
  return `conic-gradient(${cats
    .map(
      (c, i) =>
        `${CHECKIN_COLORS[c]} ${i * slice}deg ${(i + 1) * slice}deg`,
    )
    .join(", ")})`;
}
