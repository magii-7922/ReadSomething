"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TagInput } from "@/components/TagInput";
import { WritingShell } from "@/components/WritingShell";
import { BOOK_RATINGS, type BookRating } from "@/lib/ratings";
import { nextSerialNo } from "@/lib/serial";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { BookReview } from "@/lib/types";

type Props = {
  initial?: Partial<BookReview>;
  mode: "create" | "edit";
  reviewId?: string;
  draftId?: string;
};

export function BookReviewForm({ initial, mode, reviewId, draftId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(
    draftId,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [rating, setRating] = useState<BookRating>(
    (initial?.rating as BookRating) ?? BOOK_RATINGS[0],
  );
  const [review, setReview] = useState(initial?.review ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [experienceDate, setExperienceDate] = useState(
    initial?.experience_date ?? "",
  );

  function buildPayload() {
    return {
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      link: link.trim() || null,
      tags,
      rating,
      review,
      excerpt,
      experience_date: experienceDate || null,
    };
  }

  function saveDraft() {
    if (!hasSupabaseConfig()) {
      setError("請先設定 Supabase 環境變數。");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const payload = buildPayload();
      const row = {
        category: "book" as const,
        title: payload.title || "未命名草稿",
        payload,
        updated_at: new Date().toISOString(),
      };
      if (currentDraftId) {
        const { error: err } = await supabase
          .from("drafts")
          .update(row)
          .eq("id", currentDraftId);
        if (err) {
          setError(err.message);
          return;
        }
      } else {
        const { data, error: err } = await supabase
          .from("drafts")
          .insert(row)
          .select("id")
          .single();
        if (err) {
          setError(err.message);
          return;
        }
        setCurrentDraftId(data.id);
      }
      setError(null);
      setInfo("草稿已儲存。可稍後到「草稿箱」繼續。");
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("請先設定 Supabase 環境變數。");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const payload = {
        ...buildPayload(),
        updated_at: new Date().toISOString(),
      };
      if (mode === "edit" && reviewId) {
        const { error: err } = await supabase
          .from("book_reviews")
          .update(payload)
          .eq("id", reviewId);
        if (err) {
          setError(err.message);
          return;
        }
        router.push(`/books/${reviewId}`);
      } else {
        const serial_no = await nextSerialNo(supabase, "book");
        const { data, error: err } = await supabase
          .from("book_reviews")
          .insert({ ...payload, serial_no })
          .select("id")
          .single();
        if (err) {
          setError(err.message);
          return;
        }
        if (currentDraftId) {
          await supabase.from("drafts").delete().eq("id", currentDraftId);
        }
        router.push(`/books/${data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <WritingShell title={mode === "edit" ? "編輯書評" : "撰寫書評"}>
      <form className="review-form" onSubmit={onSubmit}>
        <label>
          書名
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          作者
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
        <label>
          出版社／連載網站
          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
        </label>
        <label>
          連結（選填）
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
          />
        </label>
        <label>
          閱讀日期
          <input
            type="date"
            value={experienceDate}
            onChange={(e) => setExperienceDate(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>評分</legend>
          <div className="rating-buttons">
            {BOOK_RATINGS.map((r) => (
              <button
                key={r}
                type="button"
                className={rating === r ? "rating-chip active" : "rating-chip"}
                onClick={() => setRating(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
        <label>
          自訂標籤
          <TagInput value={tags} onChange={setTags} />
        </label>
        <label>
          書評
          <textarea
            rows={10}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
        </label>
        <label>
          摘錄句子
          <textarea
            rows={4}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
        {error && <p className="form-message error">{error}</p>}
        {info && <p className="form-message">{info}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={pending}>
            {pending ? "儲存中…" : "儲存書評"}
          </button>
          {mode === "create" && (
            <button
              type="button"
              className="ghost-btn"
              onClick={saveDraft}
              disabled={pending}
            >
              存草稿
            </button>
          )}
        </div>
      </form>
    </WritingShell>
  );
}
