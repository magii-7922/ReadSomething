import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import { isLoggedIn } from "@/lib/auth";
import { encodeRating } from "@/lib/ratings";
import { formatSerial } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { MovieReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("movie_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const review = data as MovieReview;
  const canEdit = await isLoggedIn();
  const ticketUrl = publicStorageUrl("ticket-stubs", review.ticket_stub_path);
  const serial = formatSerial("movie", review.serial_no);

  return (
    <article className="detail">
      <div className="section-head">
        <div className="detail-title-block">
          <h1>{review.title}</h1>
          {serial && <span className="serial-badge">{serial}</span>}
        </div>
        <div className="actions">
          <Link
            href={`/movies/rating/${encodeRating(review.rating)}`}
            className="rating-chip active"
          >
            {review.rating}
          </Link>
          {canEdit && (
            <>
              <Link href={`/movies/${id}/edit`} className="ghost-btn">
                編輯
              </Link>
              <DeleteReviewButton category="movie" id={id} />
            </>
          )}
        </div>
      </div>
      <div className="meta">
        <span>導演：{review.director || "—"}</span>
        <span>片商：{review.studio || "—"}</span>
        <span>原著：{review.original_work || "—"}</span>
        <span>觀看日期：{review.experience_date || "—"}</span>
      </div>
      {review.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: "0.75rem" }}>
          {review.tags.map((t) => (
            <Link
              key={t}
              href={`/movies?tag=${encodeURIComponent(t)}`}
              className="tag"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
      <div className="detail-body">{review.review}</div>
      {review.excerpt && (
        <blockquote className="excerpt">{review.excerpt}</blockquote>
      )}
      {ticketUrl && (
        <div className="media-block">
          <p className="muted">票根</p>
          <Image
            src={ticketUrl}
            alt={`${review.title} 票根`}
            width={480}
            height={300}
            unoptimized
          />
        </div>
      )}
    </article>
  );
}
