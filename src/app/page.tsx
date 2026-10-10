import Link from "next/link";
import { CheckInCalendar } from "@/components/CheckInCalendar";
import { WishList } from "@/components/WishList";
import { isLoggedIn } from "@/lib/auth";
import { buildCheckInMap, type CheckInMap } from "@/lib/checkin";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { WishItem } from "@/lib/types";

export default async function HomePage() {
  const configured = hasSupabaseConfig();
  const canEdit = await isLoggedIn();

  let checkIns: CheckInMap = {};
  let bookWish: WishItem[] = [];
  let movieWish: WishItem[] = [];
  let gameWish: WishItem[] = [];
  let eventWish: WishItem[] = [];

  if (configured) {
    const supabase = await createClient();
    const [{ data: checks }, { data: wishes }] = await Promise.all([
      supabase.from("check_ins").select("check_date, category"),
      supabase
        .from("wish_items")
        .select("*")
        .eq("is_done", false)
        .order("created_at", { ascending: true }),
    ]);
    checkIns = buildCheckInMap(checks ?? []);
    const all = (wishes ?? []) as WishItem[];
    bookWish = all.filter((w) => w.category === "book");
    movieWish = all.filter((w) => w.category === "movie");
    gameWish = all.filter((w) => w.category === "game");
    eventWish = all.filter((w) => w.category === "event");
  }

  return (
    <>
      {!configured && (
        <div className="config-banner">
          尚未設定 Supabase。請複製{" "}
          <code>.env.local.example</code> 為 <code>.env.local</code>
          ，填入專案 URL 與 anon key，並在 Supabase SQL Editor 執行{" "}
          <code>supabase/migrations/001_init.sql</code>
          （已建過表請執行 <code>supabase/RUN_THIS.sql</code>）。
        </div>
      )}

      <p className="muted" style={{ marginBottom: "0.2rem" }}>
        隨便看看，隨便寫寫
      </p>
      <h1 className="hero-brand">今天看書了嗎</h1>
      <p className="lead">
        記錄讀過的書、看過的電影、玩過的遊戲和去過的活動。
      </p>

      <div className="actions home-actions">
        <Link href="/books" className="primary-btn">
          書
        </Link>
        <Link href="/movies" className="ghost-btn">
          電影/動畫
        </Link>
        <Link href="/games" className="ghost-btn">
          遊戲
        </Link>
        <Link href="/events" className="ghost-btn">
          活動
        </Link>
      </div>

      <div className="home-grid">
        <CheckInCalendar initialCheckIns={checkIns} canEdit={canEdit} />
        <div className="wish-stack">
          <WishList category="book" items={bookWish} canEdit={canEdit} compact />
          <WishList
            category="movie"
            items={movieWish}
            canEdit={canEdit}
            compact
          />
          <WishList category="game" items={gameWish} canEdit={canEdit} compact />
          <WishList
            category="event"
            items={eventWish}
            canEdit={canEdit}
            compact
          />
        </div>
      </div>
    </>
  );
}
