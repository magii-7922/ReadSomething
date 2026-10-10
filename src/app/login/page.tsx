"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError("請先設定 NEXT_PUBLIC_SUPABASE_URL 與 ANON_KEY。");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <section className="panel login-panel">
      <h1 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>登入</h1>
      <p className="muted">只有瑪姬大人可以編輯內容。</p>
      <form className="login-form" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          密碼
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-message error">{error}</p>}
        <button type="submit" className="primary-btn" disabled={pending}>
          {pending ? "登入中…" : "登入"}
        </button>
      </form>
    </section>
  );
}
