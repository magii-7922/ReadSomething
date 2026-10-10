import Link from "next/link";
import { RatingFilter } from "@/components/RatingFilter";
import { decodeRating, type EventRating } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { EventReview } from "@/lib/types";

type Props = {
  params: Promise<{ rating: string }>;
};

export default async function EventRatingPage({ params }: Props) {
  const { rating: encoded } = await params;
  const rating = decodeRating(encoded) as EventRating;
  let reviews: EventReview[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_reviews")
      .select("*")
      .eq("rating", rating)
      .order("created_at", { ascending: false });
    reviews = (data ?? []) as EventReview[];
  }

  return (
    <>
      <div className="section-head">
        <h1>活動評・{rating}</h1>
        <Link href="/events" className="ghost-btn">
          全部活動評
        </Link>
      </div>
      <RatingFilter category="event" active={rating} />
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">這個評分下還沒有活動。</p>
        )}
        {reviews.map((r) => (
          <Link key={r.id} href={`/events/${r.id}`} className="review-item">
            <h2>{r.title}</h2>
            <div className="meta">
              <span>{r.organizer}</span>
              <span>{r.location}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
