import { redirect } from "next/navigation";
import { BookReviewForm } from "@/components/BookReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { BookReview, Draft } from "@/lib/types";

type Props = {
  searchParams: Promise<{ title?: string; draft?: string }>;
};

export default async function NewBookPage({ searchParams }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { title, draft: draftId } = await searchParams;

  let initial: Partial<BookReview> = { title: title ?? "" };
  if (draftId && hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("category", "book")
      .maybeSingle();
    if (data) {
      const d = data as Draft;
      initial = { ...(d.payload as Partial<BookReview>), title: d.title || (d.payload.title as string) || "" };
    }
  }

  return (
    <BookReviewForm mode="create" initial={initial} draftId={draftId} />
  );
}
