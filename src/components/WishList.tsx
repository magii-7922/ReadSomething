"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_PATHS,
  type Category,
} from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { WishItem } from "@/lib/types";

type Props = {
  category: Category;
  items: WishItem[];
  canEdit: boolean;
  compact?: boolean;
};

const THRESHOLD = 72;

function sortWishItems(items: WishItem[]) {
  const byCreated = (a: WishItem, b: WishItem) =>
    a.created_at.localeCompare(b.created_at);
  const open = items.filter((i) => !i.is_done);
  const watching = open.filter((i) => i.is_watching).sort(byCreated);
  const rest = open.filter((i) => !i.is_watching).sort(byCreated);
  const done = items.filter((i) => i.is_done).sort(byCreated);
  return [...watching, ...rest, ...done];
}

function SwipeRow({
  item,
  canEdit,
  pending,
  onWrite,
  onDelete,
  onToggleWatching,
}: {
  item: WishItem;
  canEdit: boolean;
  pending: boolean;
  onWrite: () => void;
  onDelete: () => void;
  onToggleWatching: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const axisLocked = useRef<"x" | "y" | null>(null);

  function reset() {
    offsetRef.current = 0;
    setOffset(0);
    dragging.current = false;
    axisLocked.current = null;
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!canEdit || item.is_done || pending) return;
    dragging.current = true;
    axisLocked.current = null;
    startX.current = e.clientX;
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!axisLocked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axisLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisLocked.current === "y") return;
    e.preventDefault();
    const next = Math.max(-120, Math.min(120, dx));
    offsetRef.current = next;
    setOffset(next);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    const dx = offsetRef.current;
    dragging.current = false;
    axisLocked.current = null;
    if (dx <= -THRESHOLD) {
      reset();
      onDelete();
      return;
    }
    if (dx >= THRESHOLD) {
      reset();
      onWrite();
      return;
    }
    reset();
  }

  const titleBlock = (
    <>
      <span className={item.is_done ? "struck" : ""}>{item.title}</span>
      {item.is_watching && !item.is_done && (
        <span className="watching-badge">正在看</span>
      )}
      {item.note && <span className="wish-note">{item.note}</span>}
    </>
  );

  if (!canEdit || item.is_done) {
    return (
      <li className={item.is_done ? "done wish-row" : "wish-row"}>
        <div className="wish-row-content">{titleBlock}</div>
      </li>
    );
  }

  return (
    <li className={`wish-row swipeable${item.is_watching ? " watching" : ""}`}>
      <div
        className="wish-row-content"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={reset}
      >
        <div className="wish-row-main">{titleBlock}</div>
        <button
          type="button"
          className={
            item.is_watching ? "watching-btn active" : "watching-btn"
          }
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatching();
          }}
          disabled={pending}
        >
          {item.is_watching ? "取消正在看" : "正在看"}
        </button>
      </div>
    </li>
  );
}

export function WishList({ category, items, canEdit, compact }: Props) {
  const router = useRouter();
  const [list, setList] = useState(() =>
    sortWishItems(
      items.map((i) => ({ ...i, is_watching: Boolean(i.is_watching) })),
    ),
  );
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const base = CATEGORY_PATHS[category];
  const sorted = useMemo(() => sortWishItems(list), [list]);
  const openItems = sorted.filter((i) => !i.is_done);
  const shown = compact ? openItems.slice(0, 5) : sorted;

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !canEdit || !hasSupabaseConfig()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("wish_items")
        .insert({
          category,
          title: title.trim(),
          note: note.trim(),
        })
        .select()
        .single();
      if (err) {
        setError(err.message);
        return;
      }
      const row = data as WishItem;
      setList((prev) =>
        sortWishItems([
          ...prev,
          { ...row, is_watching: Boolean(row.is_watching) },
        ]),
      );
      setTitle("");
      setNote("");
      setAdding(false);
      setError(null);
    });
  }

  function toggleWatching(item: WishItem) {
    if (!canEdit || !hasSupabaseConfig() || item.is_done) return;
    const next = !item.is_watching;
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("wish_items")
        .update({ is_watching: next })
        .eq("id", item.id);
      if (err) {
        setError(err.message);
        return;
      }
      setList((prev) =>
        sortWishItems(
          prev.map((i) =>
            i.id === item.id ? { ...i, is_watching: next } : i,
          ),
        ),
      );
    });
  }

  function completeItem(item: WishItem) {
    if (!canEdit || !hasSupabaseConfig()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("wish_items")
        .update({
          is_done: true,
          is_watching: false,
          done_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      if (err) {
        setError(err.message);
        return;
      }
      setList((prev) =>
        sortWishItems(
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  is_done: true,
                  is_watching: false,
                  done_at: new Date().toISOString(),
                }
              : i,
          ),
        ),
      );
      router.push(
        `${base}/new?title=${encodeURIComponent(item.title)}&wish=${item.id}`,
      );
    });
  }

  function removeItem(id: string) {
    if (!canEdit || !hasSupabaseConfig()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("wish_items")
        .delete()
        .eq("id", id);
      if (err) {
        setError(err.message);
        return;
      }
      setList((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <section className="panel wish-panel">
      <div className="panel-head">
        <h2>
          {CATEGORY_LABELS[category]}願望清單
          {compact && (
            <Link href={`${base}/wish`} className="panel-link">
              查看全部
            </Link>
          )}
        </h2>
      </div>

      {canEdit && openItems.length > 0 && (
        <p className="muted wish-hint">右滑撰寫・左滑刪除・點「正在看」置頂</p>
      )}

      <ul className="wish-list">
        {shown.length === 0 && !adding && (
          <li className="empty">
            {canEdit ? (
              <button
                type="button"
                className="wish-empty-btn"
                onClick={() => setAdding(true)}
              >
                還沒有想看／想玩的作品
              </button>
            ) : (
              <span className="muted">還沒有想看／想玩的作品</span>
            )}
          </li>
        )}
        {shown.map((item) => (
          <SwipeRow
            key={item.id}
            item={item}
            canEdit={canEdit}
            pending={pending}
            onWrite={() => completeItem(item)}
            onDelete={() => removeItem(item.id)}
            onToggleWatching={() => toggleWatching(item)}
          />
        ))}
      </ul>

      {canEdit && shown.length > 0 && !adding && (
        <button
          type="button"
          className="wish-add-toggle"
          onClick={() => setAdding(true)}
        >
          ＋新增願望
        </button>
      )}

      {canEdit && adding && (
        <form className="wish-form" onSubmit={addItem}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="作品名稱"
            required
            autoFocus
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註（選填）"
          />
          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={pending}>
              加入清單
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setAdding(false);
                setTitle("");
                setNote("");
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}
      {error && <p className="form-message error">{error}</p>}
    </section>
  );
}
