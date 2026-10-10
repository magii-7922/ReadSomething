import Link from "next/link";
import { RatingFilter } from "@/components/RatingFilter";
import { decodeRating, type BookRating } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { BookReview } from "@/lib/types";

type Props = {
  params: Promise<{ rating: string }>;
};

export default async function BookRatingPage({ params }: Props) {
  const { rating: encoded } = await params;
  const rating = decodeRating(encoded) as BookRating;
  let reviews: BookReview[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("book_reviews")
      .select("*")
      .eq("rating", rating)
      .order("created_at", { ascending: false });
    reviews = (data ?? []) as BookReview[];
  }

  return (
    <>
      <div className="section-head">
        <h1>書評・{rating}</h1>
        <Link href="/books" className="ghost-btn">
          全部書評
        </Link>
      </div>
      <RatingFilter category="book" active={rating} />
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">這個評分下還沒有作品。</p>
        )}
        {reviews.map((r) => (
          <Link key={r.id} href={`/books/${r.id}`} className="review-item">
            <h2>{r.title}</h2>
            <div className="meta">
              <span>{r.author}</span>
              <span>{r.publisher}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
