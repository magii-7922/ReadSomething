import { notFound, redirect } from "next/navigation";
import { BookReviewForm } from "@/components/BookReviewForm";
import { isLoggedIn } from "@/lib/auth";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { BookReview } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: Props) {
  if (!(await isLoggedIn())) redirect("/login");
  const { id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("book_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <BookReviewForm
      mode="edit"
      reviewId={id}
      initial={data as BookReview}
    />
  );
}
