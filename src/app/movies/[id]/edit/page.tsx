import { notFound, redirect } from "next/navigation";
import { MovieReviewForm } from "@/components/MovieReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { MovieReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMoviePage({ params }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("movie_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <MovieReviewForm
      mode="edit"
      reviewId={id}
      initial={data as MovieReview}
    />
  );
}
