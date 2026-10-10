import Link from "next/link";
import { Suspense } from "react";
import { RatingFilter } from "@/components/RatingFilter";
import { ReviewListItem } from "@/components/ReviewListItem";
import { TagFilter } from "@/components/TagFilter";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { GameReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function GamesPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const canEdit = await isLoggedIn();
  let reviews: GameReview[] = [];
  let tags: string[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    let query = supabase
      .from("game_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (tag) query = query.contains("tags", [tag]);
    const { data } = await query;
    reviews = (data ?? []) as GameReview[];
    tags = Array.from(new Set(reviews.flatMap((r) => r.tags))).sort();
  }

  return (
    <>
      <div className="section-head">
        <h1>遊戲</h1>
        <div className="actions">
          <Link href="/games/wish" className="ghost-btn">
            願望清單
          </Link>
          {canEdit && (
            <Link href="/games/new" className="primary-btn">
              撰寫遊戲評
            </Link>
          )}
        </div>
      </div>
      <RatingFilter category="game" />
      <Suspense fallback={null}>
        <TagFilter tags={tags} basePath="/games" />
      </Suspense>
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">還沒有遊戲評。登入後可以開始寫第一篇。</p>
        )}
        {reviews.map((r) => (
          <ReviewListItem
            key={r.id}
            href={`/games/${r.id}`}
            editHref={`/games/${r.id}/edit`}
            category="game"
            id={r.id}
            title={r.title}
            canEdit={canEdit}
            serialNo={r.serial_no}
            experienceLabel="遊玩日期"
            experienceDate={r.experience_date}
            meta={[r.company, r.rating, ...r.tags.map((t) => `#${t}`)].filter(
              Boolean,
            )}
          />
        ))}
      </div>
    </>
  );
}
