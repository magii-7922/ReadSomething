import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import { isLoggedIn } from "@/lib/auth";
import { encodeRating } from "@/lib/ratings";
import { formatSerial } from "@/lib/serial";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { BookReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("book_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const review = data as BookReview;
  const canEdit = await isLoggedIn();
  const serial = formatSerial("book", review.serial_no);

  return (
    <article className="detail">
      <div className="section-head">
        <div className="detail-title-block">
          <h1>{review.title}</h1>
          {serial && <span className="serial-badge">{serial}</span>}
        </div>
        <div className="actions">
          <Link
            href={`/books/rating/${encodeRating(review.rating)}`}
            className="rating-chip active"
          >
            {review.rating}
          </Link>
          {canEdit && (
            <>
              <Link href={`/books/${id}/edit`} className="ghost-btn">
                編輯
              </Link>
              <DeleteReviewButton category="book" id={id} />
            </>
          )}
        </div>
      </div>
      <div className="meta">
        <span>作者：{review.author || "—"}</span>
        <span>出版社／連載：{review.publisher || "—"}</span>
        <span>閱讀日期：{review.experience_date || "—"}</span>
        {review.link && (
          <a href={review.link} target="_blank" rel="noopener noreferrer">
            外部連結
          </a>
        )}
      </div>
      {review.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: "0.75rem" }}>
          {review.tags.map((t) => (
            <Link
              key={t}
              href={`/books?tag=${encodeURIComponent(t)}`}
              className="tag"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
      <div className="detail-body">{review.review}</div>
      {review.excerpt && <blockquote className="excerpt">{review.excerpt}</blockquote>}
    </article>
  );
}
