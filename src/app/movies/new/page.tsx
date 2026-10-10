import { redirect } from "next/navigation";
import { MovieReviewForm } from "@/components/MovieReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Draft, MovieReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ title?: string; draft?: string }>;
};

export default async function NewMoviePage({ searchParams }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { title, draft: draftId } = await searchParams;

  let initial: Partial<MovieReview> = { title: title ?? "" };
  if (draftId && hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("category", "movie")
      .maybeSingle();
    if (data) {
      const d = data as Draft;
      initial = {
        ...(d.payload as Partial<MovieReview>),
        title: d.title || (d.payload.title as string) || "",
      };
    }
  }

  return (
    <MovieReviewForm mode="create" initial={initial} draftId={draftId} />
  );
}
