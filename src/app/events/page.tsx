import Link from "next/link";
import { Suspense } from "react";
import { RatingFilter } from "@/components/RatingFilter";
import { ReviewListItem } from "@/components/ReviewListItem";
import { TagFilter } from "@/components/TagFilter";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { EventReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const canEdit = await isLoggedIn();
  let reviews: EventReview[] = [];
  let tags: string[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    let query = supabase
      .from("event_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (tag) query = query.contains("tags", [tag]);
    const { data } = await query;
    reviews = (data ?? []) as EventReview[];
    tags = Array.from(new Set(reviews.flatMap((r) => r.tags))).sort();
  }

  return (
    <>
      <div className="section-head">
        <h1>活動評</h1>
        <div className="actions">
          <Link href="/events/wish" className="ghost-btn">
            願望清單
          </Link>
          {canEdit && (
            <Link href="/events/new" className="primary-btn">
              撰寫活動評
            </Link>
          )}
        </div>
      </div>
      <RatingFilter category="event" />
      <Suspense fallback={null}>
        <TagFilter tags={tags} basePath="/events" />
      </Suspense>
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">還沒有活動評。登入後可以開始寫第一篇。</p>
        )}
        {reviews.map((r) => (
          <ReviewListItem
            key={r.id}
            href={`/events/${r.id}`}
            editHref={`/events/${r.id}/edit`}
            category="event"
            id={r.id}
            title={r.title}
            canEdit={canEdit}
            serialNo={r.serial_no}
            experienceLabel="參加日期"
            experienceDate={r.experience_date}
            meta={[
              r.organizer,
              r.location,
              r.rating,
              ...r.tags.map((t) => `#${t}`),
            ].filter(Boolean)}
          />
        ))}
      </div>
    </>
  );
}
