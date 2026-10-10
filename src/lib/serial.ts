import type { Category } from "@/lib/ratings";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export const SERIAL_PREFIX: Record<Category, string> = {
  book: "bk",
  movie: "mv",
  game: "gm",
  event: "ev",
};

const TABLES = {
  book: "book_reviews",
  movie: "movie_reviews",
  game: "game_reviews",
  event: "event_reviews",
} as const;

export function formatSerial(category: Category, serialNo: number | null | undefined) {
  if (serialNo == null || serialNo < 1) return null;
  return `#${SERIAL_PREFIX[category]}${String(serialNo).padStart(4, "0")}`;
}

export async function nextSerialNo(
  supabase: SupabaseClient<Database>,
  category: Category,
) {
  const table = TABLES[category];
  const { data } = await supabase
    .from(table)
    .select("serial_no")
    .order("serial_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  const max = (data as { serial_no: number | null } | null)?.serial_no ?? 0;
  return max + 1;
}
