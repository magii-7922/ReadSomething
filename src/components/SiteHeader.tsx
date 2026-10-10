import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isLoggedIn } from "@/lib/auth";

export async function SiteHeader() {
  const loggedIn = await isLoggedIn();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          手賬評記
        </Link>
        <nav className="site-nav" aria-label="主選單">
          <Link href="/books">書評</Link>
          <Link href="/movies">影評</Link>
          <Link href="/games">遊戲評</Link>
          <Link href="/events">活動評</Link>
          {loggedIn && <Link href="/drafts">草稿箱</Link>}
          {loggedIn ? (
            <form action="/auth/signout" method="post">
              <button type="submit" className="linkish">
                登出
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
