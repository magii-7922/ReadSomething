import Link from "next/link";
import { RatingFilter } from "@/components/RatingFilter";
import { decodeRating, type MovieRating } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { MovieReview } from "@/lib/types";

type Props = {
  params: Promise<{ rating: string }>;
};

export default async function MovieRatingPage({ params }: Props) {
  const { rating: encoded } = await params;
  const rating = decodeRating(encoded) as MovieRating;
  let reviews: MovieReview[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("movie_reviews")
      .select("*")
      .eq("rating", rating)
      .order("created_at", { ascending: false });
    reviews = (data ?? []) as MovieReview[];
  }

  return (
    <>
      <div className="section-head">
        <h1>影評・{rating}</h1>
        <Link href="/movies" className="ghost-btn">
          全部影評
        </Link>
      </div>
      <RatingFilter category="movie" active={rating} />
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">這個評分下還沒有作品。</p>
        )}
        {reviews.map((r) => (
          <Link key={r.id} href={`/movies/${r.id}`} className="review-item">
            <h2>{r.title}</h2>
            <div className="meta">
              <span>{r.director}</span>
              <span>{r.studio}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
