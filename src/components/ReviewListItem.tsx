import Link from "next/link";
import { DeleteReviewButton } from "@/components/DeleteReviewButton";
import type { Category } from "@/lib/ratings";
import { formatSerial } from "@/lib/serial";

type Props = {
  href: string;
  editHref: string;
  category: Category;
  id: string;
  title: string;
  meta: string[];
  canEdit: boolean;
  serialNo?: number | null;
  experienceLabel?: string;
  experienceDate?: string | null;
};

export function ReviewListItem({
  href,
  editHref,
  category,
  id,
  title,
  meta,
  canEdit,
  serialNo,
  experienceLabel,
  experienceDate,
}: Props) {
  const serial = formatSerial(category, serialNo);

  return (
    <article className="review-item review-item-row">
      <Link href={href} className="review-item-main">
        <div className="review-item-title-row">
          <h2>{title}</h2>
          {serial && <span className="serial-badge">{serial}</span>}
        </div>
        <div className="meta">
          {experienceDate && (
            <span>
              {experienceLabel ?? "日期"}：{experienceDate}
            </span>
          )}
          {meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </Link>
      {canEdit && (
        <div className="review-item-actions">
          <Link href={editHref} className="ghost-btn">
            編輯
          </Link>
          <DeleteReviewButton category={category} id={id} />
        </div>
      )}
    </article>
  );
}
