import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import { isLoggedIn } from "@/lib/auth";
import { encodeRating } from "@/lib/ratings";
import { formatSerial } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { EventReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const review = data as EventReview;
  const canEdit = await isLoggedIn();
  const photos = (review.photo_paths ?? [])
    .map((p) => publicStorageUrl("event-photos", p))
    .filter(Boolean) as string[];
  const serial = formatSerial("event", review.serial_no);

  return (
    <article className="detail">
      <div className="section-head">
        <div className="detail-title-block">
          <h1>{review.title}</h1>
          {serial && <span className="serial-badge">{serial}</span>}
        </div>
        <div className="actions">
          <Link
            href={`/events/rating/${encodeRating(review.rating)}`}
            className="rating-chip active"
          >
            {review.rating}
          </Link>
          {canEdit && (
            <>
              <Link href={`/events/${id}/edit`} className="ghost-btn">
                編輯
              </Link>
              <DeleteReviewButton category="event" id={id} />
            </>
          )}
        </div>
      </div>
      <div className="meta">
        <span>主辦：{review.organizer || "—"}</span>
        <span>地點：{review.location || "—"}</span>
        <span>票價：{review.ticket_price || "—"}</span>
        <span>參加日期：{review.experience_date || "—"}</span>
      </div>
      {review.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: "0.75rem" }}>
          {review.tags.map((t) => (
            <Link
              key={t}
              href={`/events?tag=${encodeURIComponent(t)}`}
              className="tag"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
      <div className="detail-body">{review.review}</div>
      {photos.length > 0 && (
        <div className="media-block upload-grid">
          {photos.map((src) => (
            <Image
              key={src}
              src={src}
              alt={`${review.title} 照片`}
              width={280}
              height={160}
              unoptimized
            />
          ))}
        </div>
      )}
    </article>
  );
}
