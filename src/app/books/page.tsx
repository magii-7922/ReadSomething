import Link from "next/link";
import { Suspense } from "react";
import { RatingFilter } from "@/components/RatingFilter";
import { ReviewListItem } from "@/components/ReviewListItem";
import { TagFilter } from "@/components/TagFilter";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { BookReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function BooksPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const canEdit = await isLoggedIn();
  let reviews: BookReview[] = [];
  let tags: string[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    let query = supabase
      .from("book_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (tag) query = query.contains("tags", [tag]);
    const { data } = await query;
    reviews = (data ?? []) as BookReview[];
    tags = Array.from(new Set(reviews.flatMap((r) => r.tags))).sort();
  }

  return (
    <>
      <div className="section-head">
        <h1>書評</h1>
        <div className="actions">
          <Link href="/books/wish" className="ghost-btn">
            願望清單
          </Link>
          {canEdit && (
            <Link href="/books/new" className="primary-btn">
              撰寫書評
            </Link>
          )}
        </div>
      </div>
      <RatingFilter category="book" />
      <Suspense fallback={null}>
        <TagFilter tags={tags} basePath="/books" />
      </Suspense>
      <div className="review-list">
        {reviews.length === 0 && (
          <p className="muted">還沒有書評。登入後可以開始寫第一篇。</p>
        )}
        {reviews.map((r) => (
          <ReviewListItem
            key={r.id}
            href={`/books/${r.id}`}
            editHref={`/books/${r.id}/edit`}
            category="book"
            id={r.id}
            title={r.title}
            canEdit={canEdit}
            serialNo={r.serial_no}
            experienceLabel="閱讀日期"
            experienceDate={r.experience_date}
            meta={[r.author, r.rating, ...r.tags.map((t) => `#${t}`)].filter(
              Boolean,
            )}
          />
        ))}
      </div>
    </>
  );
}
