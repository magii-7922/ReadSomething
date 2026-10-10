import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import { isLoggedIn } from "@/lib/auth";
import { encodeRating } from "@/lib/ratings";
import { formatSerial } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { GameReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("game_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const review = data as GameReview;
  const canEdit = await isLoggedIn();
  const shots = (review.screenshot_paths ?? [])
    .map((p) => publicStorageUrl("game-screenshots", p))
    .filter(Boolean) as string[];
  const serial = formatSerial("game", review.serial_no);

  return (
    <article className="detail">
      <div className="section-head">
        <div className="detail-title-block">
          <h1>{review.title}</h1>
          {serial && <span className="serial-badge">{serial}</span>}
        </div>
        <div className="actions">
          <Link
            href={`/games/rating/${encodeRating(review.rating)}`}
            className="rating-chip active"
          >
            {review.rating}
          </Link>
          {canEdit && (
            <>
              <Link href={`/games/${id}/edit`} className="ghost-btn">
                編輯
              </Link>
              <DeleteReviewButton category="game" id={id} />
            </>
          )}
        </div>
      </div>
      <div className="meta">
        <span>遊戲公司：{review.company || "—"}</span>
        <span>出版商／網站：{review.publisher || "—"}</span>
        <span>價格：{review.price || "—"}</span>
        <span>遊玩日期：{review.experience_date || "—"}</span>
      </div>
      {review.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: "0.75rem" }}>
          {review.tags.map((t) => (
            <Link
              key={t}
              href={`/games?tag=${encodeURIComponent(t)}`}
              className="tag"
            >
              {t}
            </Link>
          ))}
        </div>
      )}
      <div className="detail-body">{review.review}</div>
      {shots.length > 0 && (
        <div className="media-block upload-grid">
          {shots.map((src) => (
            <Image
              key={src}
              src={src}
              alt={`${review.title} 截圖`}
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
