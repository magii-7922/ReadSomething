import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isLoggedIn } from "@/lib/auth";

export async function SiteHeader() {
  const loggedIn = await isLoggedIn();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          ˙Ⱉ˙
        </Link>
        <nav className="site-nav" aria-label="主選單">
          <Link href="/books">書</Link>
          <Link href="/movies">電影/動畫</Link>
          <Link href="/games">遊戲</Link>
          <Link href="/events">演出</Link>
          {loggedIn && <Link href="/drafts">草稿箱</Link>}
          {loggedIn ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="linkish">
                Magi
              </button>
            </form>
          ) : (
            <Link href="/login">登入</Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
