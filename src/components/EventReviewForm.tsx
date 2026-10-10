"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { TagInput } from "@/components/TagInput";
import { WritingShell } from "@/components/WritingShell";
import { EVENT_RATINGS, type EventRating } from "@/lib/ratings";
import { nextSerialNo } from "@/lib/serial";
import { publicStorageUrl } from "@/lib/storage";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { EventReview } from "@/lib/types";

type Props = {
  initial?: Partial<EventReview>;
  mode: "create" | "edit";
  reviewId?: string;
  draftId?: string;
};

export function EventReviewForm({ initial, mode, reviewId, draftId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(
    draftId,
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [organizer, setOrganizer] = useState(initial?.organizer ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [ticketPrice, setTicketPrice] = useState(initial?.ticket_price ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [rating, setRating] = useState<EventRating>(
    (initial?.rating as EventRating) ?? EVENT_RATINGS[0],
  );
  const [review, setReview] = useState(initial?.review ?? "");
  const [experienceDate, setExperienceDate] = useState(
    initial?.experience_date ?? "",
  );
  const [paths, setPaths] = useState<string[]>(initial?.photo_paths ?? []);
  const [previews, setPreviews] = useState<string[]>(
    (initial?.photo_paths ?? [])
      .map((p) => publicStorageUrl("event-photos", p))
      .filter(Boolean) as string[],
  );

  function buildPayload() {
    return {
      title: title.trim(),
      organizer: organizer.trim(),
      location: location.trim(),
      ticket_price: ticketPrice.trim(),
      tags,
      rating,
      review,
      photo_paths: paths,
      experience_date: experienceDate || null,
    };
  }

  async function uploadPhoto(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from("event-photos")
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
          uploaded.push(await uploadPhoto(file));
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
        category: "event" as const,
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
          .from("event_reviews")
          .update(payload)
          .eq("id", reviewId);
        if (err) {
          setError(err.message);
          return;
        }
        router.push(`/events/${reviewId}`);
      } else {
        const serial_no = await nextSerialNo(supabase, "event");
        const { data, error: err } = await supabase
          .from("event_reviews")
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
        router.push(`/events/${data.id}`);
      }
      router.refresh();
    });
  }

  return (
    <WritingShell title={mode === "edit" ? "編輯活動評" : "撰寫活動評"}>
      <form className="review-form" onSubmit={onSubmit}>
        <label>
          活動名
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          主辦
          <input
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </label>
        <label>
          地點
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label>
          票價
          <input
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
          />
        </label>
        <label>
          參加日期
          <input
            type="date"
            value={experienceDate}
            onChange={(e) => setExperienceDate(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>評分</legend>
          <div className="rating-buttons">
            {EVENT_RATINGS.map((r) => (
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
          照片上傳
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
                alt="活動照片"
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
            {pending ? "儲存中…" : "儲存活動評"}
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
