"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TagInput } from "@/components/TagInput";
import { WritingShell } from "@/components/WritingShell";
import { MOVIE_RATINGS, type MovieRating } from "@/lib/ratings";
import { nextSerialNo } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { MovieReview } from "@/lib/types";

type Props = {
  initial?: Partial<MovieReview>;
  mode: "create" | "edit";
  reviewId?: string;
  draftId?: string;
};

export function MovieReviewForm({ initial, mode, reviewId, draftId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(
    draftId,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [director, setDirector] = useState(initial?.director ?? "");
  const [studio, setStudio] = useState(initial?.studio ?? "");
  const [originalWork, setOriginalWork] = useState(
    initial?.original_work ?? "",
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [rating, setRating] = useState<MovieRating>(
    (initial?.rating as MovieRating) ?? MOVIE_RATINGS[0],
  );
  const [review, setReview] = useState(initial?.review ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [experienceDate, setExperienceDate] = useState(
    initial?.experience_date ?? "",
  );
  const [ticketPath, setTicketPath] = useState(
    initial?.ticket_stub_path ?? null,
  );
  const [preview, setPreview] = useState<string | null>(
    publicStorageUrl("ticket-stubs", initial?.ticket_stub_path),
  );

  function buildPayload() {
    return {
      title: title.trim(),
      director: director.trim(),
      studio: studio.trim(),
      original_work: originalWork.trim(),
      tags,
      rating,
      review,
      excerpt,
      ticket_stub_path: ticketPath,
      experience_date: experienceDate || null,
    };
  }

  async function uploadTicket(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from("ticket-stubs")
      .upload(path, file, { upsert: false });
    if (err) throw err;
    return path;
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    startTransition(async () => {
      try {
        if (!hasSupabaseConfig()) throw new Error("請先設定 Supabase。");
        const path = await uploadTicket(file);
        setTicketPath(path);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "上傳失敗");
      }
    });
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
        category: "movie" as const,
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
          .from("movie_reviews")
          .update(payload)
          .eq("id", reviewId);
        if (err) {
          setError(err.message);
          return;
        }
        router.push(`/movies/${reviewId}`);
      } else {
        const serial_no = await nextSerialNo(supabase, "movie");
        const { data, error: err } = await supabase
          .from("movie_reviews")
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
        router.push(`/movies/${data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <WritingShell title={mode === "edit" ? "編輯影評" : "撰寫影評"}>
      <form className="review-form" onSubmit={onSubmit}>
        <label>
          作品名
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          導演
          <input value={director} onChange={(e) => setDirector(e.target.value)} />
        </label>
        <label>
          片商
          <input value={studio} onChange={(e) => setStudio(e.target.value)} />
        </label>
        <label>
          原著
          <input
            value={originalWork}
            onChange={(e) => setOriginalWork(e.target.value)}
          />
        </label>
        <label>
          觀看日期
          <input
            type="date"
            value={experienceDate}
            onChange={(e) => setExperienceDate(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>評分</legend>
          <div className="rating-buttons">
            {MOVIE_RATINGS.map((r) => (
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
          影評
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
        <label>
          票根上傳
          <input type="file" accept="image/*" onChange={onFileChange} />
        </label>
        {preview && (
          <div className="upload-preview">
            <Image src={preview} alt="票根預覽" width={280} height={180} unoptimized />
          </div>
        )}
        {error && <p className="form-message error">{error}</p>}
        {info && <p className="form-message">{info}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={pending}>
            {pending ? "儲存中…" : "儲存影評"}
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
