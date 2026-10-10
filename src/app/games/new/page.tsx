import { redirect } from "next/navigation";
import { GameReviewForm } from "@/components/GameReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Draft, GameReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ title?: string; draft?: string }>;
};

export default async function NewGamePage({ searchParams }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { title, draft: draftId } = await searchParams;

  let initial: Partial<GameReview> = { title: title ?? "" };
  if (draftId && hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("category", "game")
      .maybeSingle();
    if (data) {
      const d = data as Draft;
      initial = {
        ...(d.payload as Partial<GameReview>),
        title: d.title || (d.payload.title as string) || "",
      };
    }
  }

  return <GameReviewForm mode="create" initial={initial} draftId={draftId} />;
}
