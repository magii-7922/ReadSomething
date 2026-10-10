import { redirect } from "next/navigation";
import { EventReviewForm } from "@/components/EventReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Draft, EventReview } from "@/lib/types";

type Props = {
  searchParams: Promise<{ title?: string; draft?: string }>;
};

export default async function NewEventPage({ searchParams }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { title, draft: draftId } = await searchParams;

  let initial: Partial<EventReview> = { title: title ?? "" };
  if (draftId && hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("drafts")
      .select("*")
      .eq("id", draftId)
      .eq("category", "event")
      .maybeSingle();
    if (data) {
      const d = data as Draft;
      initial = {
        ...(d.payload as Partial<EventReview>),
        title: d.title || (d.payload.title as string) || "",
      };
    }
  }

  return (
    <EventReviewForm mode="create" initial={initial} draftId={draftId} />
  );
}
