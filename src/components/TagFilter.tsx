"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  tags: string[];
  basePath: string;
};

export function TagFilter({ tags, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("tag");

  if (tags.length === 0) return null;

  return (
    <div className="tag-filter">
      <button
        type="button"
        className={!active ? "tag active" : "tag"}
        onClick={() => router.push(basePath)}
      >
        全部標籤
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={active === tag ? "tag active" : "tag"}
          onClick={() =>
            router.push(`${basePath}?tag=${encodeURIComponent(tag)}`)
          }
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
