import Link from "next/link";
import { WishList } from "@/components/WishList";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { WishItem } from "@/lib/types";

export default async function GameWishPage() {
  const canEdit = await isLoggedIn();
  let items: WishItem[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("wish_items")
      .select("*")
      .eq("category", "game")
      .order("created_at", { ascending: true });
    items = (data ?? []) as WishItem[];
  }

  return (
    <>
      <div className="section-head">
        <h1>快點打開steam</h1>
        <Link href="/games" className="ghost-btn">
          回到遊戲評
        </Link>
      </div>
      <WishList category="game" items={items} canEdit={canEdit} />
    </>
  );
}
