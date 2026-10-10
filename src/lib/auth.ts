import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function getSessionUser() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isLoggedIn() {
  const user = await getSessionUser();
  return Boolean(user);
}
