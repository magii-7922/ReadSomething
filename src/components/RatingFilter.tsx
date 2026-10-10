import Link from "next/link";
import { encodeRating, ratingsFor, type Category } from "@/lib/ratings";
import { CATEGORY_PATHS } from "@/lib/ratings";

type Props = {
  category: Category;
  active?: string;
};

export function RatingFilter({ category, active }: Props) {
  const ratings = ratingsFor(category);
  const base = CATEGORY_PATHS[category];

  return (
    <div className="rating-filter" role="navigation" aria-label="評分篩選">
      <Link
        href={base}
        className={!active ? "rating-chip active" : "rating-chip"}
      >
        全部
      </Link>
      {ratings.map((rating) => (
        <Link
          key={rating}
          href={`${base}/rating/${encodeRating(rating)}`}
          className={
            active === rating ? "rating-chip active" : "rating-chip"
          }
        >
          {rating}
        </Link>
      ))}
    </div>
  );
}
