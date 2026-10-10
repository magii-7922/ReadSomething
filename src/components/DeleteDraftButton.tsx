"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function DeleteDraftButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm("確定刪除這份草稿？")) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("drafts").delete().eq("id", id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="ghost-btn danger"
      onClick={onDelete}
      disabled={pending}
    >
      刪除
    </button>
  );
}
