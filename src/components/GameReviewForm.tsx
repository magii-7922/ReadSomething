"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TagInput } from "@/components/TagInput";
import { WritingShell } from "@/components/WritingShell";
import { GAME_RATINGS, type GameRating } from "@/lib/ratings";
import { nextSerialNo } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { GameReview } from "@/lib/types";

type Props = {
  initial?: Partial<GameReview>;
  mode: "create" | "edit";
  reviewId?: string;
  draftId?: string;
};

export function GameReviewForm({ initial, mode, reviewId, draftId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(
    draftId,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [rating, setRating] = useState<GameRating>(
    (initial?.rating as GameRating) ?? GAME_RATINGS[0],
  );
  const [review, setReview] = useState(initial?.review ?? "");
  const [experienceDate, setExperienceDate] = useState(
    initial?.experience_date ?? "",
  );
  const [paths, setPaths] = useState<string[]>(
    initial?.screenshot_paths ?? [],
  );
  const [previews, setPreviews] = useState<string[]>(
    (initial?.screenshot_paths ?? [])
      .map((p) => publicStorageUrl("game-screenshots", p))
      .filter(Boolean) as string[],
  );

  function buildPayload() {
    return {
      title: title.trim(),
      company: company.trim(),
      publisher: publisher.trim(),
      price: price.trim(),
      tags,
      rating,
      review,
      screenshot_paths: paths,
      experience_date: experienceDate || null,
    };
  }

  async function uploadShot(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from("game-screenshots")
      .upload(path, file, { upsert: false });
    if (err) throw err;
    return path;
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    startTransition(async () => {
      try {
        if (!hasSupabaseConfig()) throw new Error("請先設定 Supabase。");
        const uploaded: string[] = [];
        for (const file of files) {
          uploaded.push(await uploadShot(file));
        }
        setPaths((prev) => [...prev, ...uploaded]);
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
        category: "game" as const,
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
          .from("game_reviews")
          .update(payload)
          .eq("id", reviewId);
        if (err) {
          setError(err.message);
          return;
        }
        router.push(`/games/${reviewId}`);
      } else {
        const serial_no = await nextSerialNo(supabase, "game");
        const { data, error: err } = await supabase
          .from("game_reviews")
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
        router.push(`/games/${data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <WritingShell title={mode === "edit" ? "編輯遊戲評" : "撰寫遊戲評"}>
      <form className="review-form" onSubmit={onSubmit}>
        <label>
          作品名
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          遊戲公司
          <input value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label>
          出版商／網站
          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
        </label>
        <label>
          價格
          <input value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label>
          遊玩日期
          <input
            type="date"
            value={experienceDate}
            onChange={(e) => setExperienceDate(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>評分</legend>
          <div className="rating-buttons">
            {GAME_RATINGS.map((r) => (
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
          評價
          <textarea
            rows={10}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
        </label>
        <label>
          截圖上傳
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFilesChange}
          />
        </label>
        {previews.length > 0 && (
          <div className="upload-grid">
            {previews.map((src) => (
              <Image
                key={src}
                src={src}
                alt="遊戲截圖"
                width={200}
                height={120}
                unoptimized
              />
            ))}
          </div>
        )}
        {error && <p className="form-message error">{error}</p>}
        {info && <p className="form-message">{info}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={pending}>
            {pending ? "儲存中…" : "儲存遊戲評"}
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
