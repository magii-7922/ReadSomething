import Link from "next/link";
import { WishList } from "@/components/WishList";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { WishItem } from "@/lib/types";

export default async function EventWishPage() {
  const canEdit = await isLoggedIn();
  let items: WishItem[] = [];

  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("wish_items")
      .select("*")
      .eq("category", "event")
      .order("created_at", { ascending: true });
    items = (data ?? []) as WishItem[];
  }

  return (
    <>
      <div className="section-head">
        <h1>活動願望清單</h1>
        <Link href="/events" className="ghost-btn">
          回到活動評
        </Link>
      </div>
      <WishList category="event" items={items} canEdit={canEdit} />
    </>
  );
}
