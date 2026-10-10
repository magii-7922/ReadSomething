import Link from "next/link";
import { RatingFilter } from "@/components/RatingFilter";
import { decodeRating, type GameRating } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { GameReview } from "@/lib/types";

type Props = {
  params: Promise<{ rating: string }>;
};

export default async function GameRatingPage({ params }: Props) {
  const { rating: encoded } = await params;
  const rating = decodeRating(encoded) as GameRating;
  let reviews: GameReview[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("game_reviews")
      .select("*")
      .eq("rating", rating)
      .order("created_at", { ascending: false });
    reviews = (data ?? []) as GameReview[];
  }

  return (
    <>
      <div className="section-head">
        <h1>遊戲評・{rating}</h1>
        <Link href="/games" className="ghost-btn">
          全部遊戲評
        </Link>
      </div>
      <RatingFilter category="game" active={rating} />
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">這個評分下還沒有作品。</p>
        )}
        {reviews.map((r) => (
          <Link key={r.id} href={`/games/${r.id}`} className="review-item">
            <h2>{r.title}</h2>
            <div className="meta">
              <span>{r.company}</span>
              <span>{r.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
