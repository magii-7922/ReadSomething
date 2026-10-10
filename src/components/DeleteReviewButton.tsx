"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/ratings";
import { CATEGORY_PATHS } from "@/lib/ratings";

const TABLES = {
  book: "book_reviews",
  movie: "movie_reviews",
  game: "game_reviews",
  event: "event_reviews",
} as const;

export function DeleteReviewButton({
  category,
  id,
}: {
  category: Category;
  id: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm("確定要刪除這篇評論嗎？")) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from(TABLES[category]).delete().eq("id", id);
      router.push(CATEGORY_PATHS[category]);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="ghost-btn danger"
      onClick={onDelete}
      disabled={pending}
    >
      刪除
    </button>
  );
}
