import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteDraftButton } from "@/components/DeleteDraftButton";
import { isLoggedIn } from "@/lib/auth";
import { CATEGORY_LABELS, CATEGORY_PATHS, type Category } from "@/lib/ratings";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Draft } from "@/lib/types";

export default async function DraftsPage() {
  if (!(await isLoggedIn())) redirect("/login");

  let drafts: Draft[] = [];
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("drafts")
      .select("*")
      .order("updated_at", { ascending: false });
    drafts = (data ?? []) as Draft[];
  }

  return (
    <>
      <div className="section-head">
        <h1>草稿箱</h1>
        <p className="muted" style={{ margin: 0 }}>
          未寫完的評論可隨時存這裡，之後再繼續。
        </p>
      </div>

      <div className="review-list">
        {drafts.length === 0 && (
          <p className="muted">目前沒有草稿。撰寫時點「存草稿」即可暫存。</p>
        )}
        {drafts.map((d) => {
          const cat = d.category as Category;
          const continueHref = `${CATEGORY_PATHS[cat]}/new?draft=${d.id}`;
          return (
            <article key={d.id} className="review-item review-item-row">
              <div className="review-item-main">
                <h2>{d.title || "未命名草稿"}</h2>
                <div className="meta">
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <span>
                    更新於 {new Date(d.updated_at).toLocaleString("zh-TW")}
                  </span>
                </div>
              </div>
              <div className="review-item-actions">
                <Link href={continueHref} className="primary-btn">
                  繼續寫
                </Link>
                <DeleteDraftButton id={d.id} />
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
