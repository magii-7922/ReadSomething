import { notFound, redirect } from "next/navigation";
import { EventReviewForm } from "@/components/EventReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { EventReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <EventReviewForm
      mode="edit"
      reviewId={id}
      initial={data as EventReview}
    />
  );
}
