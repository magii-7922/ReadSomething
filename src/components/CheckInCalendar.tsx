"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import {
  CHECKIN_CATEGORIES,
  CHECKIN_COLORS,
  CHECKIN_LABELS,
  pieBackground,
  type CheckInMap,
} from "@/lib/checkin";
import type { Category } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Props = {
  initialCheckIns: CheckInMap;
  canEdit: boolean;
};

const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const LONG_PRESS_MS = 480;

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCheckInError(message: string) {
  if (/category/i.test(message) && /schema cache|column/i.test(message)) {
    return "資料庫尚未更新 category 欄位。請到 Supabase → SQL Editor 執行 supabase/RUN_THIS.sql 後再試。";
  }
  return message;
}

export function CheckInCalendar({ initialCheckIns, canEdit }: Props) {
  const [mode, setMode] = useState<"month" | "year">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [checkIns, setCheckIns] = useState<CheckInMap>(initialCheckIns);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [menuDate, setMenuDate] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const suppressClick = useRef(false);

  const today = toISODate(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: string | null; day: number | null }> = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: toISODate(new Date(year, month, d)), day: d });
    }
    return cells;
  }, [year, month]);

  const yearRows = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const cells = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return { day, date: toISODate(new Date(year, m, day)) };
      });
      return {
        month: m,
        daysInMonth,
        checkedCount: cells.filter((c) => (checkIns[c.date]?.length ?? 0) > 0)
          .length,
        cells,
      };
    });
  }, [year, checkIns]);

  useEffect(() => {
    if (!menuDate) return;
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuDate(null);
      setMenuPos(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuDate(null);
        setMenuPos(null);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuDate]);

  function shift(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev);
      if (mode === "month") next.setMonth(next.getMonth() + delta);
      else next.setFullYear(next.getFullYear() + delta);
      return next;
    });
  }

  function openMenu(date: string, clientX: number, clientY: number) {
    if (!canEdit) return;
    setMenuDate(date);
    const pad = 8;
    const menuW = 180;
    const menuH = 200;
    const x = Math.min(clientX, window.innerWidth - menuW - pad);
    const y = Math.min(clientY, window.innerHeight - menuH - pad);
    setMenuPos({ x: Math.max(pad, x), y: Math.max(pad, y) });
  }

  function toggleCategory(date: string, category: Category) {
    if (!canEdit || !hasSupabaseConfig()) {
      setMessage("請先設定 Supabase 並登入後再打卡。");
      return;
    }
    const current = checkIns[date] ?? [];
    const has = current.includes(category);
    startTransition(async () => {
      const supabase = createClient();
      if (has) {
        const { error } = await supabase
          .from("check_ins")
          .delete()
          .eq("check_date", date)
          .eq("category", category);
        if (error) {
          setMessage(formatCheckInError(error.message));
          return;
        }
        setCheckIns((prev) => {
          const next = { ...prev };
          next[date] = (next[date] ?? []).filter((c) => c !== category);
          if (next[date].length === 0) delete next[date];
          return next;
        });
        setMessage(`已取消 ${date}「${CHECKIN_LABELS[category]}」`);
      } else {
        const { error } = await supabase
          .from("check_ins")
          .insert({ check_date: date, category });
        if (error) {
          setMessage(formatCheckInError(error.message));
          return;
        }
        setCheckIns((prev) => {
          const merged = [...(prev[date] ?? []), category];
          return {
            ...prev,
            [date]: CHECKIN_CATEGORIES.filter((c) => merged.includes(c)),
          };
        });
        setMessage(`${date}「${CHECKIN_LABELS[category]}」打卡成功`);
      }
    });
  }

  function clearLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function dayStyle(date: string | null): CSSProperties | undefined {
    if (!date) return undefined;
    const bg = pieBackground(checkIns[date]);
    if (!bg) return undefined;
    return { background: bg, color: "#fff" };
  }

  function renderDayControl(
    key: string | number,
    date: string,
    content: React.ReactNode,
    className: string,
  ) {
    const cats = checkIns[date] ?? [];
    const style = dayStyle(date);

    return (
      <button
        key={key}
        type="button"
        className={className}
        style={style}
        disabled={!canEdit}
        aria-label={`${date}${cats.length ? `：${cats.map((c) => CHECKIN_LABELS[c]).join("、")}` : ""}`}
        aria-haspopup="menu"
        aria-expanded={menuDate === date}
        onClick={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          // Desktop / mouse: click opens menu
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            openMenu(date, e.clientX, e.clientY);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (!canEdit || e.button !== 0) return;
          longPressFired.current = false;
          clearLongPress();
          const { clientX, clientY } = e;
          longPressTimer.current = setTimeout(() => {
            longPressFired.current = true;
            suppressClick.current = true;
            openMenu(date, clientX, clientY);
            if (navigator.vibrate) navigator.vibrate(12);
          }, LONG_PRESS_MS);
        }}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}
        onPointerCancel={clearLongPress}
      >
        {content}
      </button>
    );
  }

  return (
    <section className="panel checkin-panel">
      <div className="panel-head">
        <h2>打卡表</h2>
        <div className="segmented">
          <button
            type="button"
            className={mode === "month" ? "active" : ""}
            onClick={() => setMode("month")}
          >
            一個月
          </button>
          <button
            type="button"
            className={mode === "year" ? "active" : ""}
            onClick={() => setMode("year")}
          >
            一整年
          </button>
        </div>
      </div>

      <div className="checkin-legend" aria-hidden>
        {CHECKIN_CATEGORIES.map((cat) => (
          <span key={cat} className="checkin-legend-item">
            <i style={{ background: CHECKIN_COLORS[cat] }} />
            {CHECKIN_LABELS[cat]}
          </span>
        ))}
      </div>
      {canEdit && (
        <p className="muted checkin-hint">
          電腦點擊選擇類型；手機長按選擇。可同時標記多種。
        </p>
      )}

      <div className="calendar-nav">
        <button type="button" onClick={() => shift(-1)} aria-label="上一個">
          ‹
        </button>
        <p>
          {mode === "month" ? `${year} 年 ${month + 1} 月` : `${year} 年`}
        </p>
        <button type="button" onClick={() => shift(1)} aria-label="下一個">
          ›
        </button>
      </div>

      {mode === "month" ? (
        <div className="month-grid">
          {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
            <div key={d} className="weekday">
              {d}
            </div>
          ))}
          {monthCells.map((cell, i) =>
            cell.date ? (
              renderDayControl(
                i,
                cell.date,
                cell.day,
                [
                  "day-cell",
                  (checkIns[cell.date]?.length ?? 0) > 0 ? "checked pie" : "",
                  cell.date === today ? "today" : "",
                  canEdit ? "clickable" : "",
                ]
                  .filter(Boolean)
                  .join(" "),
              )
            ) : (
              <div key={i} className="day-cell" />
            ),
          )}
        </div>
      ) : (
        <div className="year-dots-list">
          {yearRows.map((row) => (
            <div key={row.month} className="year-dots-month">
              <div className="year-dots-head">
                <h3>
                  {row.month + 1} 月
                  <span className="month-en"> {MONTH_NAMES[row.month]}</span>
                </h3>
                <p className="muted">
                  {row.checkedCount}/{row.daysInMonth}
                </p>
              </div>
              <div className="year-dots">
                {row.cells.map((cell) =>
                  renderDayControl(
                    cell.date,
                    cell.date,
                    null,
                    [
                      "dot",
                      (checkIns[cell.date]?.length ?? 0) > 0 ? "on pie" : "",
                      cell.date === today ? "today" : "",
                    ]
                      .filter(Boolean)
                      .join(" "),
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {menuDate && menuPos && (
        <div
          ref={menuRef}
          className="checkin-menu"
          role="menu"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <p className="checkin-menu-date">{menuDate}</p>
          {CHECKIN_CATEGORIES.map((cat) => {
            const on = (checkIns[menuDate] ?? []).includes(cat);
            return (
              <button
                key={cat}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                className={on ? "checkin-menu-item on" : "checkin-menu-item"}
                disabled={pending}
                onClick={() => toggleCategory(menuDate, cat)}
              >
                <i style={{ background: CHECKIN_COLORS[cat] }} />
                <span>{CHECKIN_LABELS[cat]}</span>
                <span className="checkin-menu-state">{on ? "已打" : "未打"}</span>
              </button>
            );
          })}
        </div>
      )}

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}
