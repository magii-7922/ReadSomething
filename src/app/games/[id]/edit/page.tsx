import { notFound, redirect } from "next/navigation";
import { GameReviewForm } from "@/components/GameReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { GameReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditGamePage({ params }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("game_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <GameReviewForm
      mode="edit"
      reviewId={id}
      initial={data as GameReview}
    />
  );
}
